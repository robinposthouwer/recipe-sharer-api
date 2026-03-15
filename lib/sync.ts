import { supabase } from './supabase';
import { initDb } from './db';

let isSyncing = false;
let syncTimer: ReturnType<typeof setTimeout> | null = null;

export async function syncRecipes(): Promise<void> {
  // Don't sync if not logged in
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;

  // Prevent concurrent syncs
  if (isSyncing) return;
  isSyncing = true;

  try {
    await pushLocalChanges(session.user.id);
    await pullRemoteChanges(session.user.id);
  } catch (e) {
    console.warn('Sync failed:', e);
  } finally {
    isSyncing = false;
  }
}

async function pushLocalChanges(userId: string): Promise<void> {
  const db = await initDb();
  const pending = await db.getAllAsync<any>(
    `SELECT * FROM recipes WHERE sync_status = 'pending'`
  );

  for (const recipe of pending) {
    try {
      if (recipe.deleted_at && !recipe.remote_id) {
        // Never synced + deleted locally → just hard-delete
        await db.runAsync(`DELETE FROM recipes WHERE id = ?`, [recipe.id]);
        continue;
      }

      if (recipe.deleted_at && recipe.remote_id) {
        // Synced + deleted locally → delete from Supabase, then hard-delete
        await supabase.from('recipes').delete().eq('id', recipe.remote_id);
        await db.runAsync(`DELETE FROM recipes WHERE id = ?`, [recipe.id]);
        continue;
      }

      if (!recipe.remote_id) {
        // New recipe → insert into Supabase
        const { data, error } = await supabase
          .from('recipes')
          .insert({
            user_id: userId,
            title: recipe.title,
            url: recipe.url,
            source: recipe.source,
            notes: recipe.notes,
            image_path: recipe.imagePath,
            ingredients: recipe.ingredients,
            instructions: recipe.instructions,
            created_at: recipe.createdAt,
            updated_at: recipe.updated_at || new Date().toISOString(),
          })
          .select('id')
          .single();

        if (error) throw error;

        await db.runAsync(
          `UPDATE recipes SET remote_id = ?, sync_status = 'synced' WHERE id = ?`,
          [data.id, recipe.id]
        );
      } else {
        // Existing recipe → update in Supabase
        const { error } = await supabase
          .from('recipes')
          .update({
            title: recipe.title,
            url: recipe.url,
            source: recipe.source,
            notes: recipe.notes,
            image_path: recipe.imagePath,
            ingredients: recipe.ingredients,
            instructions: recipe.instructions,
            updated_at: recipe.updated_at || new Date().toISOString(),
          })
          .eq('id', recipe.remote_id);

        if (error) throw error;

        await db.runAsync(
          `UPDATE recipes SET sync_status = 'synced' WHERE id = ?`,
          [recipe.id]
        );
      }
    } catch (e) {
      console.warn(`Failed to push recipe ${recipe.id}:`, e);
    }
  }
}

async function pullRemoteChanges(userId: string): Promise<void> {
  const db = await initDb();

  // Get last sync time
  const meta = await db.getAllAsync<{ value: string }>(
    `SELECT value FROM sync_meta WHERE key = 'last_pull_at' LIMIT 1`
  );
  const lastPullAt = meta[0]?.value || '1970-01-01T00:00:00Z';

  // Fetch remote recipes updated since last pull
  const { data: remoteRecipes, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('user_id', userId)
    .gt('updated_at', lastPullAt)
    .is('deleted_at', null);

  if (error) throw error;
  if (!remoteRecipes || remoteRecipes.length === 0) {
    await updateLastPullAt(db);
    return;
  }

  for (const remote of remoteRecipes) {
    const local = await db.getAllAsync<any>(
      `SELECT * FROM recipes WHERE remote_id = ? LIMIT 1`,
      [remote.id]
    );

    if (local.length === 0) {
      // New from cloud → insert locally
      await db.runAsync(
        `INSERT INTO recipes (title, url, source, notes, imagePath, ingredients, instructions, createdAt, remote_id, updated_at, sync_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'synced')`,
        [
          remote.title,
          remote.url,
          remote.source,
          remote.notes,
          remote.image_path,
          remote.ingredients,
          remote.instructions,
          remote.created_at,
          remote.id,
          remote.updated_at,
        ]
      );
    } else if (local[0].sync_status === 'synced') {
      // Local is synced, cloud wins
      await db.runAsync(
        `UPDATE recipes SET title = ?, url = ?, source = ?, notes = ?, imagePath = ?, ingredients = ?, instructions = ?, updated_at = ?, sync_status = 'synced' WHERE remote_id = ?`,
        [
          remote.title,
          remote.url,
          remote.source,
          remote.notes,
          remote.image_path,
          remote.ingredients,
          remote.instructions,
          remote.updated_at,
          remote.id,
        ]
      );
    } else {
      // Both changed → last-write-wins
      const localTime = new Date(local[0].updated_at || '1970-01-01').getTime();
      const remoteTime = new Date(remote.updated_at).getTime();
      if (remoteTime > localTime) {
        await db.runAsync(
          `UPDATE recipes SET title = ?, url = ?, source = ?, notes = ?, imagePath = ?, ingredients = ?, instructions = ?, updated_at = ?, sync_status = 'synced' WHERE remote_id = ?`,
          [
            remote.title,
            remote.url,
            remote.source,
            remote.notes,
            remote.image_path,
            remote.ingredients,
            remote.instructions,
            remote.updated_at,
            remote.id,
          ]
        );
      }
      // If local is newer, leave it as pending — it will be pushed next sync
    }
  }

  // Also handle remote deletes
  const { data: deletedRemote } = await supabase
    .from('recipes')
    .select('id')
    .eq('user_id', userId)
    .gt('updated_at', lastPullAt)
    .not('deleted_at', 'is', null);

  if (deletedRemote) {
    for (const del of deletedRemote) {
      await db.runAsync(`DELETE FROM recipes WHERE remote_id = ? AND sync_status = 'synced'`, [del.id]);
    }
  }

  await updateLastPullAt(db);
}

async function updateLastPullAt(db: any): Promise<void> {
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT OR REPLACE INTO sync_meta (key, value) VALUES ('last_pull_at', ?)`,
    [now]
  );
}

/** Schedule a sync after a write operation */
export function scheduleSyncAfterWrite(): void {
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => syncRecipes(), 1000);
}
