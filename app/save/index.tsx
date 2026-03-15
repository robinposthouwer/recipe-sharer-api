import { useRouter } from 'expo-router';
import { useShareIntentContext } from 'expo-share-intent';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { insertRecipe } from '@/lib/db';
import { extractImagePath, extractTitle, extractUrl } from '@/lib/shareIntent';
import Button from '@/components/Button';
import { logExtraction } from '@/lib/extractionLog';

const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/+$/, '');

export default function SaveScreen() {
  const router = useRouter();
  const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntentContext();
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [instructions, setInstructions] = useState('');
  const [fetchedImageUrl, setFetchedImageUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<{
    description?: string | null;
    recipeYield?: string | null;
    cookTime?: string | null;
    totalTime?: string | null;
    recipeCategory?: string | null;
    calories?: string | null;
    author?: string | null;
    rating?: string | null;
    videoUrl?: string | null;
  }>({});

  const url = shareIntent ? extractUrl(shareIntent) : null;
  const defaultTitle = shareIntent ? extractTitle(shareIntent) : null;
  const shareImagePath = shareIntent ? extractImagePath(shareIntent) : null;

  const displayTitle = title || defaultTitle || '';
  const displayImage = shareImagePath || fetchedImageUrl;

  // Auto-fetch recipe data when a URL is detected
  useEffect(() => {
    if (!url || !API_URL) return;
    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        let res: Response;
        try {
          res = await fetch(`${API_URL}/api/extract-recipe`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url }),
            signal: controller.signal,
          });
        } finally {
          clearTimeout(timeout);
        }
        const text = await res.text();
        if (cancelled) return;
        const data = text ? JSON.parse(text) : {};

        if (!res.ok) {
          if (res.status === 403) {
            Alert.alert('Privépost', data.error ?? 'Alleen publieke posts kunnen worden opgehaald.');
          }
          return;
        }

        console.log('[SaveScreen] Extracted data:', JSON.stringify(data, null, 2));
        await logExtraction(url, data, res.ok);

        // Only fill fields that are empty (share intent data has priority)
        if (!defaultTitle && data.title) setTitle(data.title);
        if (!shareImagePath && data.imageUrl) setFetchedImageUrl(data.imageUrl);
        if (data.ingredients) setIngredients(data.ingredients);
        if (data.instructions) setInstructions(data.instructions);
        setExtractedData({
          description: data.description,
          recipeYield: data.recipeYield,
          cookTime: data.cookTime,
          totalTime: data.totalTime,
          recipeCategory: data.recipeCategory,
          calories: data.calories,
          author: data.author,
          rating: data.rating,
          videoUrl: data.videoUrl,
        });
      } catch (e) {
        // Silently continue — user can still save manually
        console.log('[SaveScreen] API fetch failed, continuing without extraction');
        await logExtraction(url, { error: String(e) }, false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [url]);

  const handleSave = async () => {
    if (!url && !shareIntent?.text) {
      Alert.alert('Fout', 'Geen URL of tekst om op te slaan.');
      return;
    }
    setSaving(true);
    try {
      await insertRecipe({
        title: displayTitle || null,
        url: url || shareIntent?.text || null,
        notes: notes || null,
        imagePath: displayImage || null,
        ingredients: ingredients || null,
        instructions: instructions || null,
        description: extractedData.description || null,
        recipeYield: extractedData.recipeYield || null,
        cookTime: extractedData.cookTime || null,
        totalTime: extractedData.totalTime || null,
        recipeCategory: extractedData.recipeCategory || null,
        calories: extractedData.calories || null,
        author: extractedData.author || null,
        rating: extractedData.rating || null,
        videoUrl: extractedData.videoUrl || null,
      });
      resetShareIntent();
      router.replace('/(tabs)');
    } catch (e) {
      Alert.alert('Fout', 'Kon recept niet opslaan.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    resetShareIntent();
    router.replace('/(tabs)');
  };

  if (!hasShareIntent && !shareIntent) {
    return (
      <View style={styles.container}>
        <Text>Geen gedeelde content.</Text>
        <View style={styles.buttonMargin}>
          <Button title="Terug" variant="outline" onPress={() => router.replace('/(tabs)')} />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.field}>
          <Text style={styles.label}>URL / link</Text>
          <Text style={styles.url} numberOfLines={2}>{url || shareIntent?.text || '-'}</Text>
          {loading && (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color="#2f95dc" />
              <Text style={styles.loadingText}>Gegevens ophalen...</Text>
            </View>
          )}
        </View>

        {displayImage && (
          <View style={styles.field}>
            <Image source={{ uri: displayImage }} style={styles.previewImage} resizeMode="cover" />
          </View>
        )}

        <View style={styles.field}>
          <Text style={styles.label}>Titel (optioneel)</Text>
          <TextInput
            style={styles.input}
            value={title || defaultTitle || ''}
            onChangeText={setTitle}
            placeholder="Naam van het recept"
            placeholderTextColor="#999"
          />
        </View>

        {ingredients ? (
          <View style={styles.field}>
            <Text style={styles.label}>Ingrediënten</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={ingredients}
              onChangeText={setIngredients}
              placeholder="Ingrediënten (één per regel)"
              placeholderTextColor="#999"
              multiline
            />
          </View>
        ) : null}

        {instructions ? (
          <View style={styles.field}>
            <Text style={styles.label}>Bereidingswijze</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={instructions}
              onChangeText={setInstructions}
              placeholder="Bereidingswijze..."
              placeholderTextColor="#999"
              multiline
            />
          </View>
        ) : null}

        <View style={styles.field}>
          <Text style={styles.label}>Notities (optioneel)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Extra notities..."
            placeholderTextColor="#999"
            multiline
          />
        </View>
        <View style={styles.actions}>
          <View style={styles.actionButton}>
            <Button title="Annuleren" variant="outline" onPress={handleCancel} fullWidth />
          </View>
          <View style={styles.actionButton}>
            <Button
              title="Opslaan"
              icon="bookmark"
              onPress={handleSave}
              loading={saving}
              disabled={saving || loading}
              fullWidth
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#fff' },
  scroll: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, paddingBottom: 40 },
  container: { flex: 1, padding: 16, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  field: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6, color: '#000' },
  url: { fontSize: 14, color: '#666' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#fff',
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 24 },
  actionButton: { flex: 1 },
  buttonMargin: { marginTop: 16 },
  previewImage: { width: '100%', height: 200, borderRadius: 8, backgroundColor: '#eee' },
  loadingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 },
  loadingText: { fontSize: 14, color: '#2f95dc' },
});
