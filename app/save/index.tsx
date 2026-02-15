import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { useShareIntentContext } from 'expo-share-intent';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
} from 'react-native';

import { Text, View } from '@/components/Themed';
import { insertRecipe } from '@/lib/db';
import { extractImagePath, extractTitle, extractUrl } from '@/lib/shareIntent';

export default function SaveScreen() {
  const router = useRouter();
  const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntentContext();
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const url = shareIntent ? extractUrl(shareIntent) : null;
  const defaultTitle = shareIntent ? extractTitle(shareIntent) : null;
  const imagePath = shareIntent ? extractImagePath(shareIntent) : null;

  const displayTitle = title || defaultTitle || '';

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
        imagePath: imagePath || null,
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
        <Pressable onPress={() => router.replace('/(tabs)')} style={styles.button}>
          <Text style={styles.buttonText}>Terug</Text>
        </Pressable>
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
        </View>
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
          <Pressable onPress={handleCancel} style={[styles.button, styles.cancelButton]}>
            <Text style={styles.buttonText}>Annuleren</Text>
          </Pressable>
          <Pressable onPress={handleSave} style={[styles.button, styles.saveButton]} disabled={saving}>
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <FontAwesome name="bookmark" size={16} color="#fff" style={styles.icon} />
                <Text style={styles.saveButtonText}>Opslaan</Text>
              </>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  container: { flex: 1, padding: 16, justifyContent: 'center', alignItems: 'center' },
  field: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  url: { fontSize: 14, color: '#666' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 24 },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  cancelButton: { backgroundColor: '#e0e0e0' },
  saveButton: { backgroundColor: '#2f95dc' },
  buttonText: { fontSize: 16, fontWeight: '600' },
  saveButtonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  icon: { marginRight: 8 },
});
