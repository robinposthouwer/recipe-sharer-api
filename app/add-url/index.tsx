import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
} from 'react-native';

import { Text, View } from '@/components/Themed';
import { insertRecipe } from '@/lib/db';

const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/+$/, '');

interface ExtractedRecipe {
  title: string | null;
  imageUrl: string | null;
  ingredients: string | null;
  instructions: string | null;
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
      if (!res.ok) {
        Alert.alert('Fout', data.error ?? 'Kon recept niet ophalen.');
        return;
      }
      setExtracted(data);
      setTitle(data.title ?? '');
      setIngredients(data.ingredients ?? '');
      setInstructions(data.instructions ?? '');
    } catch {
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
          <Pressable
            onPress={handleFetch}
            style={[styles.fetchButton, loading && styles.fetchButtonDisabled]}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <FontAwesome name="link" size={16} color="#fff" style={styles.icon} />
                <Text style={styles.fetchButtonText}>Haal recept op</Text>
              </>
            )}
          </Pressable>
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
            <Pressable onPress={handleSave} style={[styles.saveButton, saving && styles.fetchButtonDisabled]} disabled={saving}>
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <FontAwesome name="bookmark" size={16} color="#fff" style={styles.icon} />
                  <Text style={styles.fetchButtonText}>Opslaan</Text>
                </>
              )}
            </Pressable>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  field: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  fetchButton: {
    backgroundColor: '#2f95dc',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 8,
  },
  fetchButtonDisabled: { opacity: 0.7 },
  fetchButtonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  icon: { marginRight: 8 },
  previewImage: { width: '100%', height: 200, borderRadius: 8, backgroundColor: '#eee' },
  saveButton: {
    backgroundColor: '#2f95dc',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 8,
  },
});
