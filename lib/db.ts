import * as SQLite from 'expo-sqlite';

export interface Recipe {
  id: number;
  title: string | null;
  url: string | null;
  source: string | null;
  notes: string | null;
  imagePath: string | null;
  ingredients: string | null;
  instructions: string | null;
  createdAt: string;
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
  const info = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(recipes)`);
  const columns = info.map((r) => r.name);
  if (!columns.includes('ingredients')) {
    await db.execAsync(`ALTER TABLE recipes ADD COLUMN ingredients TEXT`);
  }
  if (!columns.includes('instructions')) {
    await db.execAsync(`ALTER TABLE recipes ADD COLUMN instructions TEXT`);
  }
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
}): Promise<number> {
  const database = await initDb();
  const source = inferSource(data.url ?? null);
  const result = await database.runAsync(
    `INSERT INTO recipes (title, url, source, notes, imagePath, ingredients, instructions) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      data.title ?? null,
      data.url ?? null,
      source,
      data.notes ?? null,
      data.imagePath ?? null,
      data.ingredients ?? null,
      data.instructions ?? null,
    ]
  );
  return result.lastInsertRowId;
}

export async function getRecipes(): Promise<Recipe[]> {
  const database = await initDb();
  const rows = await database.getAllAsync<Recipe>(
    `SELECT id, title, url, source, notes, imagePath, ingredients, instructions, createdAt FROM recipes ORDER BY createdAt DESC`
  );
  return rows;
}

export async function getRecipe(id: number): Promise<Recipe | null> {
  const database = await initDb();
  const rows = await database.getAllAsync<Recipe>(
    `SELECT id, title, url, source, notes, imagePath, ingredients, instructions, createdAt FROM recipes WHERE id = ?`,
    [id]
  );
  return rows[0] ?? null;
}

export async function deleteRecipe(id: number): Promise<void> {
  const database = await initDb();
  await database.runAsync(`DELETE FROM recipes WHERE id = ?`, [id]);
}
