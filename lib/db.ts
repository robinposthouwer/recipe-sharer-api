import * as SQLite from 'expo-sqlite';
import { runMigrations } from './migrations';
import { scheduleSyncAfterWrite } from './sync';

export interface Recipe {
  id: number;
  title: string | null;
  url: string | null;
  source: string | null;
  notes: string | null;
  imagePath: string | null;
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
  createdAt: string;
  remote_id?: string | null;
  updated_at?: string | null;
  sync_status?: string | null;
}

let db: SQLite.SQLiteDatabase | null = null;

export async function initDb(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('recepten.db');
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS recipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      url TEXT,
      source TEXT,
      notes TEXT,
      imagePath TEXT,
      ingredients TEXT,
      instructions TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Legacy migrations (pre-migration system)
  const info = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(recipes)`);
  const columns = info.map((r) => r.name);
  if (!columns.includes('ingredients')) {
    await db.execAsync(`ALTER TABLE recipes ADD COLUMN ingredients TEXT`);
  }
  if (!columns.includes('instructions')) {
    await db.execAsync(`ALTER TABLE recipes ADD COLUMN instructions TEXT`);
  }

  // Sync metadata table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS sync_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Run numbered migrations (adds sync columns etc.)
  await runMigrations(db);

  return db;
}

function inferSource(url: string | null): string | null {
  if (!url) return null;
  const u = url.toLowerCase();
  if (u.includes('instagram.com')) return 'instagram';
  if (u.includes('tiktok.com')) return 'tiktok';
  if (u.includes('youtube.com') || u.includes('youtu.be')) return 'youtube';
  return 'other';
}

export async function insertRecipe(data: {
  title?: string | null;
  url?: string | null;
  notes?: string | null;
  imagePath?: string | null;
  ingredients?: string | null;
  instructions?: string | null;
  description?: string | null;
  recipeYield?: string | null;
  cookTime?: string | null;
  totalTime?: string | null;
  recipeCategory?: string | null;
  calories?: string | null;
  author?: string | null;
  rating?: string | null;
  videoUrl?: string | null;
}): Promise<number> {
  const database = await initDb();
  const source = inferSource(data.url ?? null);
  const now = new Date().toISOString();
  const result = await database.runAsync(
    `INSERT INTO recipes (title, url, source, notes, imagePath, ingredients, instructions, description, recipeYield, cookTime, totalTime, recipeCategory, calories, author, rating, videoUrl, updated_at, sync_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    [
      data.title ?? null,
      data.url ?? null,
      source,
      data.notes ?? null,
      data.imagePath ?? null,
      data.ingredients ?? null,
      data.instructions ?? null,
      data.description ?? null,
      data.recipeYield ?? null,
      data.cookTime ?? null,
      data.totalTime ?? null,
      data.recipeCategory ?? null,
      data.calories ?? null,
      data.author ?? null,
      data.rating ?? null,
      data.videoUrl ?? null,
      now,
    ]
  );
  scheduleSyncAfterWrite();
  return result.lastInsertRowId;
}

export async function getRecipes(): Promise<Recipe[]> {
  const database = await initDb();
  const rows = await database.getAllAsync<Recipe>(
    `SELECT id, title, url, source, notes, imagePath, ingredients, instructions, description, recipeYield, cookTime, totalTime, recipeCategory, calories, author, rating, videoUrl, createdAt FROM recipes WHERE deleted_at IS NULL ORDER BY createdAt DESC`
  );
  return rows;
}

export async function getRecipe(id: number): Promise<Recipe | null> {
  const database = await initDb();
  const rows = await database.getAllAsync<Recipe>(
    `SELECT id, title, url, source, notes, imagePath, ingredients, instructions, description, recipeYield, cookTime, totalTime, recipeCategory, calories, author, rating, videoUrl, createdAt FROM recipes WHERE id = ? AND deleted_at IS NULL`,
    [id]
  );
  return rows[0] ?? null;
}

export async function updateRecipe(id: number, data: {
  title?: string | null;
  url?: string | null;
  notes?: string | null;
  imagePath?: string | null;
  ingredients?: string | null;
  instructions?: string | null;
  description?: string | null;
  recipeYield?: string | null;
  cookTime?: string | null;
  totalTime?: string | null;
  recipeCategory?: string | null;
  calories?: string | null;
  author?: string | null;
  rating?: string | null;
  videoUrl?: string | null;
}): Promise<void> {
  const database = await initDb();
  const source = inferSource(data.url ?? null);
  const now = new Date().toISOString();
  await database.runAsync(
    `UPDATE recipes SET title = ?, url = ?, source = ?, notes = ?, imagePath = ?, ingredients = ?, instructions = ?, description = ?, recipeYield = ?, cookTime = ?, totalTime = ?, recipeCategory = ?, calories = ?, author = ?, rating = ?, videoUrl = ?, updated_at = ?, sync_status = 'pending' WHERE id = ?`,
    [
      data.title ?? null,
      data.url ?? null,
      source,
      data.notes ?? null,
      data.imagePath ?? null,
      data.ingredients ?? null,
      data.instructions ?? null,
      data.description ?? null,
      data.recipeYield ?? null,
      data.cookTime ?? null,
      data.totalTime ?? null,
      data.recipeCategory ?? null,
      data.calories ?? null,
      data.author ?? null,
      data.rating ?? null,
      data.videoUrl ?? null,
      now,
      id,
    ]
  );
  scheduleSyncAfterWrite();
}

export async function deleteRecipe(id: number): Promise<void> {
  const database = await initDb();
  const now = new Date().toISOString();
  // Soft delete: mark as deleted so it can sync to cloud
  await database.runAsync(
    `UPDATE recipes SET deleted_at = ?, updated_at = ?, sync_status = 'pending' WHERE id = ?`,
    [now, now, id]
  );
  scheduleSyncAfterWrite();
}
