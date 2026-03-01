import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';

import { View } from '@/components/Themed';
import { insertRecipe } from '@/lib/db';

export default function AddManualScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [instructions, setInstructions] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Fout', 'Vul een titel in.');
      return;
    }
    setSaving(true);
    try {
      await insertRecipe({
        title: title.trim() || null,
        url: url.trim() || null,
        notes: null,
        imagePath: null,
        ingredients: ingredients.trim() || null,
        instructions: instructions.trim() || null,
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
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Titel *"
            placeholderTextColor="#999"
          />
        </View>
        <View style={styles.field}>
          <TextInput
            style={styles.input}
            value={url}
            onChangeText={setUrl}
            placeholder="Link (optioneel, bijv. Instagram)"
            placeholderTextColor="#999"
            autoCapitalize="none"
            keyboardType="url"
          />
        </View>
        <View style={styles.field}>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={ingredients}
            onChangeText={setIngredients}
            placeholder="Ingrediënten (plak tekst van Instagram of typ over)"
            placeholderTextColor="#999"
            multiline
          />
        </View>
        <View style={styles.field}>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={instructions}
            onChangeText={setInstructions}
            placeholder="Bereidingswijze"
            placeholderTextColor="#999"
            multiline
          />
        </View>
        <Pressable
          onPress={handleSave}
          style={[styles.saveButton, saving && styles.disabled]}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <FontAwesome name="bookmark" size={16} color="#fff" style={styles.icon} />
              <Text style={styles.saveButtonText}>Opslaan</Text>
            </>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  field: { marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  saveButton: {
    backgroundColor: '#2f95dc',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 8,
  },
  disabled: { opacity: 0.7 },
  saveButtonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  icon: { marginRight: 8 },
});
