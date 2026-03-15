import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { deleteRecipe, getRecipe, type Recipe } from '@/lib/db';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    if (id) {
      getRecipe(parseInt(id, 10)).then(setRecipe);
    }
  }, [id]);

  const handleOpenLink = () => {
    if (recipe?.url) {
      WebBrowser.openBrowserAsync(recipe.url);
    }
  };

  const handleDelete = () => {
    Alert.alert('Verwijderen', 'Weet je zeker dat je dit recept wilt verwijderen?', [
      { text: 'Annuleren', style: 'cancel' },
      {
        text: 'Verwijderen',
        style: 'destructive',
        onPress: async () => {
          if (recipe?.id) {
            await deleteRecipe(recipe.id);
            router.back();
          }
        },
      },
    ]);
  };

  if (!recipe) {
    return (
      <View style={styles.container}>
        <Text>Laden...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {recipe.imagePath ? (
        <Image source={{ uri: recipe.imagePath }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={styles.placeholder}>
          <FontAwesome name="cutlery" size={48} color="#ccc" />
        </View>
      )}
      <View style={styles.content}>
        {recipe.title && (
          <Text style={styles.title}>{recipe.title}</Text>
        )}
        {recipe.source && (
          <Text style={styles.source}>{recipe.source}</Text>
        )}
        {recipe.ingredients && (
          <>
            <Text style={styles.sectionTitle}>Ingrediënten</Text>
            <Text style={styles.bodyText}>{recipe.ingredients}</Text>
          </>
        )}
        {recipe.instructions && (
          <>
            <Text style={styles.sectionTitle}>Bereidingswijze</Text>
            <Text style={styles.bodyText}>{recipe.instructions}</Text>
          </>
        )}
        {recipe.notes && (
          <Text style={styles.notes}>{recipe.notes}</Text>
        )}
        {recipe.url && (
          <TouchableOpacity onPress={handleOpenLink} style={styles.linkButton}>
            <FontAwesome name="external-link" size={18} color="#2f95dc" />
            <Text style={styles.linkText}>Open link in browser</Text>
          </TouchableOpacity>
        )}
      </View>
      <Pressable onPress={handleDelete} style={styles.deleteButton}>
        <FontAwesome name="trash-o" size={18} color="#c00" />
        <Text style={styles.deleteText}>Verwijderen</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  image: { width: '100%', height: 200, backgroundColor: '#eee' },
  placeholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 4, color: '#000' },
  source: { fontSize: 14, color: '#666', textTransform: 'capitalize', marginBottom: 12 },
  notes: { fontSize: 16, lineHeight: 24, marginBottom: 16, color: '#000' },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  linkText: { color: '#2f95dc', fontSize: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginTop: 16, marginBottom: 6, color: '#000' },
  bodyText: { fontSize: 16, lineHeight: 24, marginBottom: 8, color: '#000' },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    marginTop: 'auto',
  },
  deleteText: { color: '#c00', fontSize: 16 },
});
