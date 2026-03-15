import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
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
import Button from '@/components/Button';
import { logExtraction } from '@/lib/extractionLog';

const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/+$/, '');

interface ExtractedRecipe {
  title: string | null;
  imageUrl: string | null;
  ingredients: string | null;
  instructions: string | null;
  description: string | null;
  recipeYield: string | null;
  cookTime: string | null;
  totalTime: string | null;
  recipeCategory: string | null;
  calories: string | null;
  author: string | null;
  rating: string | null;
  videoUrl: string | null;
}

export default function AddUrlScreen() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [extracted, setExtracted] = useState<ExtractedRecipe | null>(null);
  const [title, setTitle] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [instructions, setInstructions] = useState('');
  const [saving, setSaving] = useState(false);

  const handleFetch = async () => {
    const trimmed = url.trim();
    if (!trimmed || !trimmed.startsWith('http')) {
      Alert.alert('Fout', 'Voer een geldige URL in.');
      return;
    }
    if (!API_URL) {
      Alert.alert('Configuratie', 'Stel EXPO_PUBLIC_API_URL in (bijv. https://jouw-project.vercel.app)');
      return;
    }
    setLoading(true);
    setExtracted(null);
    try {
      const res = await fetch(`${API_URL}/api/extract-recipe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmed }),
      });
      const data = await res.json();
      await logExtraction(trimmed, data, res.ok);
      if (!res.ok) {
        Alert.alert('Fout', data.error ?? 'Kon recept niet ophalen.');
        return;
      }
      setExtracted(data);
      setTitle(data.title ?? '');
      setIngredients(data.ingredients ?? '');
      setInstructions(data.instructions ?? '');
    } catch (e) {
      await logExtraction(trimmed, { error: String(e) }, false);
      Alert.alert('Fout', 'Netwerkfout. Controleer de verbinding.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const trimmed = url.trim();
    if (!trimmed) {
      Alert.alert('Fout', 'Geen URL om op te slaan.');
      return;
    }
    setSaving(true);
    try {
      await insertRecipe({
        title: title || null,
        url: trimmed,
        notes: null,
        imagePath: extracted?.imageUrl ?? null,
        ingredients: ingredients || null,
        instructions: instructions || null,
        description: extracted?.description ?? null,
        recipeYield: extracted?.recipeYield ?? null,
        cookTime: extracted?.cookTime ?? null,
        totalTime: extracted?.totalTime ?? null,
        recipeCategory: extracted?.recipeCategory ?? null,
        calories: extracted?.calories ?? null,
        author: extracted?.author ?? null,
        rating: extracted?.rating ?? null,
        videoUrl: extracted?.videoUrl ?? null,
      });
      router.replace('/(tabs)');
    } catch {
      Alert.alert('Fout', 'Kon recept niet opslaan.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.field}>
          <Text style={styles.label}>Recept-URL</Text>
          <TextInput
            style={styles.input}
            value={url}
            onChangeText={setUrl}
            placeholder="https://..."
            placeholderTextColor="#999"
            autoCapitalize="none"
            keyboardType="url"
            editable={!loading}
          />
          <View style={styles.buttonMargin}>
            <Button
              title="Haal recept op"
              icon="link"
              onPress={handleFetch}
              loading={loading}
              disabled={loading}
              fullWidth
            />
          </View>
        </View>

        {extracted && (
          <>
            {extracted.imageUrl && (
              <View style={styles.field}>
                <Image source={{ uri: extracted.imageUrl }} style={styles.previewImage} resizeMode="cover" />
              </View>
            )}
            <View style={styles.field}>
              <Text style={styles.label}>Titel</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Naam van het recept"
                placeholderTextColor="#999"
              />
            </View>
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
            <Button
              title="Opslaan"
              icon="bookmark"
              onPress={handleSave}
              loading={saving}
              disabled={saving}
              fullWidth
            />
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#fff' },
  scroll: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, paddingBottom: 40 },
  field: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6, color: '#000' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#fff',
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  buttonMargin: { marginTop: 8 },
  previewImage: { width: '100%', height: 200, borderRadius: 8, backgroundColor: '#eee' },
});
