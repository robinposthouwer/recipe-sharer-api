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
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { deleteRecipe, getRecipe, type Recipe } from '@/lib/db';
import Button from '@/components/Button';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text>Laden...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Custom header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
          style={styles.headerBackButton}
        >
          <FontAwesome name="chevron-left" size={14} color="#2f95dc" />
          <Text style={styles.headerBackText}>Terug</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Recept</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView}>
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
          {recipe.description && (
            <Text style={styles.description}>{recipe.description}</Text>
          )}

          {/* Metadata chips */}
          {(recipe.recipeYield || recipe.totalTime || recipe.cookTime || recipe.calories || recipe.recipeCategory || recipe.author || recipe.rating) && (
            <View style={styles.metaRow}>
              {recipe.recipeYield && (
                <View style={styles.metaChip}>
                  <FontAwesome name="users" size={12} color="#666" />
                  <Text style={styles.metaText}>{recipe.recipeYield}</Text>
                </View>
              )}
              {(recipe.totalTime || recipe.cookTime) && (
                <View style={styles.metaChip}>
                  <FontAwesome name="clock-o" size={12} color="#666" />
                  <Text style={styles.metaText}>{recipe.totalTime || recipe.cookTime}</Text>
                </View>
              )}
              {recipe.calories && (
                <View style={styles.metaChip}>
                  <FontAwesome name="fire" size={12} color="#666" />
                  <Text style={styles.metaText}>{recipe.calories}</Text>
                </View>
              )}
              {recipe.recipeCategory && (
                <View style={styles.metaChip}>
                  <FontAwesome name="tag" size={12} color="#666" />
                  <Text style={styles.metaText}>{recipe.recipeCategory}</Text>
                </View>
              )}
              {recipe.rating && (
                <View style={styles.metaChip}>
                  <FontAwesome name="star" size={12} color="#666" />
                  <Text style={styles.metaText}>{recipe.rating}</Text>
                </View>
              )}
              {recipe.author && (
                <View style={styles.metaChip}>
                  <FontAwesome name="pencil" size={12} color="#666" />
                  <Text style={styles.metaText}>{recipe.author}</Text>
                </View>
              )}
            </View>
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
            <View style={styles.buttonRow}>
              <Button title="Open link in browser" icon="external-link" variant="ghost" onPress={handleOpenLink} />
            </View>
          )}
          {recipe.videoUrl && recipe.videoUrl !== recipe.url && (
            <View style={styles.buttonRow}>
              <Button title="Bekijk video" icon="play-circle" variant="ghost" onPress={() => WebBrowser.openBrowserAsync(recipe.videoUrl!)} />
            </View>
          )}
          <View style={styles.buttonRow}>
            <Button title="Verwijderen" icon="trash-o" variant="destructive" onPress={handleDelete} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  headerBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingRight: 12,
  },
  headerBackText: {
    color: '#2f95dc',
    fontSize: 17,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  headerSpacer: {
    width: 70,
  },
  scrollView: { flex: 1 },
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
  description: { fontSize: 15, lineHeight: 22, color: '#555', marginBottom: 12 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  metaText: { fontSize: 13, color: '#666' },
  source: { fontSize: 14, color: '#666', textTransform: 'capitalize', marginBottom: 12 },
  notes: { fontSize: 16, lineHeight: 24, marginBottom: 16, color: '#000' },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginTop: 16, marginBottom: 6, color: '#000' },
  bodyText: { fontSize: 16, lineHeight: 24, marginBottom: 8, color: '#000' },
  buttonRow: { marginTop: 8 },
});
