import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { getRecipes, type Recipe } from '@/lib/db';
import Button from '@/components/Button';

function RecipeItem({ recipe, onPress }: { recipe: Recipe; onPress: () => void }) {
  return (
    <Pressable style={styles.item} onPress={onPress} android_ripple={{ color: '#eee' }}>
      {recipe.imagePath ? (
        <Image source={{ uri: recipe.imagePath }} style={styles.thumbnail} resizeMode="cover" />
      ) : (
        <View style={styles.thumbnailPlaceholder}>
          <FontAwesome name="cutlery" size={28} color="#ccc" />
        </View>
      )}
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle} numberOfLines={1}>
          {recipe.title || 'Zonder titel'}
        </Text>
        {recipe.source && (
          <Text style={styles.itemSource}>{recipe.source}</Text>
        )}
        {recipe.url && (
          <Text style={styles.itemUrl} numberOfLines={1}>{recipe.url}</Text>
        )}
      </View>
      <FontAwesome name="chevron-right" size={16} color="#999" />
    </Pressable>
  );
}

export default function ReceptenListScreen() {
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  const loadRecipes = useCallback(async () => {
    const list = await getRecipes();
    setRecipes(list);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRecipes();
    }, [loadRecipes])
  );

  return (
    <View style={styles.container}>
      <View style={styles.buttons}>
        <Button
          title="Via URL toevoegen"
          icon="link"
          onPress={() => router.push('/add-url')}
          fullWidth
        />
        <Button
          title="Handmatig toevoegen"
          icon="edit"
          variant="secondary"
          onPress={() => router.push('/add-manual')}
          fullWidth
        />
      </View>
      <FlatList
        data={recipes}
        keyExtractor={(r) => String(r.id)}
        renderItem={({ item }) => (
          <RecipeItem recipe={item} onPress={() => router.push(`/recipe/${item.id}`)} />
        )}
        contentContainerStyle={recipes.length === 0 ? styles.empty : undefined}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Nog geen recepten...  Deel een link van Instagram, TikTok of een andere app naar Recepten app om te starten.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  buttons: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    gap: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  thumbnail: { width: 56, height: 56, borderRadius: 8 },
  thumbnailPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemContent: { flex: 1, marginLeft: 12 },
  itemTitle: { fontSize: 16, fontWeight: '600', color: '#000' },
  itemSource: { fontSize: 12, color: '#666', textTransform: 'capitalize', marginTop: 2 },
  itemUrl: { fontSize: 12, color: '#999', marginTop: 2 },
  empty: { flex: 1, justifyContent: 'center', padding: 24 },
  emptyText: { textAlign: 'center', color: '#666', lineHeight: 22 },
});
