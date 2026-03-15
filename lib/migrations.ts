import * as SQLite from 'expo-sqlite';
import { supabase } from './supabase';

interface Migration {
  version: number;
  name: string;
  localSql: string[];
  remoteSql: string[];
}

const migrations: Migration[] = [
  {
    version: 1,
    name: 'add_sync_columns',
    localSql: [
      `ALTER TABLE recipes ADD COLUMN remote_id TEXT`,
      `ALTER TABLE recipes ADD COLUMN updated_at TEXT DEFAULT (datetime('now'))`,
      `ALTER TABLE recipes ADD COLUMN deleted_at TEXT`,
      `ALTER TABLE recipes ADD COLUMN sync_status TEXT DEFAULT 'pending'`,
    ],
    remoteSql: [],
  },
  {
    version: 2,
    name: 'add_recipe_metadata',
    localSql: [
      `ALTER TABLE recipes ADD COLUMN description TEXT`,
      `ALTER TABLE recipes ADD COLUMN recipeYield TEXT`,
      `ALTER TABLE recipes ADD COLUMN cookTime TEXT`,
      `ALTER TABLE recipes ADD COLUMN totalTime TEXT`,
      `ALTER TABLE recipes ADD COLUMN recipeCategory TEXT`,
      `ALTER TABLE recipes ADD COLUMN calories TEXT`,
      `ALTER TABLE recipes ADD COLUMN author TEXT`,
      `ALTER TABLE recipes ADD COLUMN rating TEXT`,
      `ALTER TABLE recipes ADD COLUMN videoUrl TEXT`,
    ],
    remoteSql: [],
  },
];

export async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  // Create migration tracking table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS schema_version (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const applied = await db.getAllAsync<{ version: number }>(`SELECT version FROM schema_version`);
  const appliedVersions = new Set(applied.map((r) => r.version));

  for (const migration of migrations) {
    if (appliedVersions.has(migration.version)) continue;

    // Run local SQLite migrations
    for (const sql of migration.localSql) {
      try {
        await db.execAsync(sql);
      } catch (e: any) {
        // Skip "duplicate column" errors (column already exists)
        if (e.message?.includes('duplicate column')) continue;
        throw e;
      }
    }

    // Run remote Supabase migrations (only if logged in)
    if (migration.remoteSql.length > 0) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        for (const sql of migration.remoteSql) {
          await supabase.rpc('exec_sql', { query: sql }).throwOnError();
        }
      }
    }

    // Record migration as applied
    await db.runAsync(
      `INSERT INTO schema_version (version, name) VALUES (?, ?)`,
      [migration.version, migration.name]
    );
  }
}
