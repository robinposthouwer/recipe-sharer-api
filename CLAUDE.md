# ReceptenApp

Mobiele app waarmee gebruikers recepten opslaan — via URL (met automatische extractie), handmatig, of via de share-functie van iOS/Android.

## Tech stack

- **Framework**: Expo SDK 54, React Native 0.81 (New Architecture)
- **Taal**: TypeScript (strict mode)
- **Routing**: Expo Router v6 (file-based, typed routes)
- **Database**: expo-sqlite (lokale SQLite `recepten.db`) + Supabase (cloud backup)
- **Auth**: Supabase Auth met e-mail/wachtwoord (optioneel, voor cloud sync)
- **Apple Developer**: Gratis account (Personal Team) — geen Apple Sign In mogelijk
- **API**: Vercel serverless function (`api/extract-recipe.ts`)
- **Share intent**: expo-share-intent (URLs/tekst/afbeeldingen ontvangen)
- **Styling**: NativeWind v4 (Tailwind CSS via `className`) + Reanimated

## Draaien

```bash
npx expo start          # Start dev server (Expo Go)
npx expo run:ios        # Native iOS build
npx expo run:android    # Native Android build
```

De Vercel API draait apart — deploy via `vercel` CLI of push naar gekoppelde repo.

## Projectstructuur

```
app/                    # Expo Router screens
  (tabs)/               #   Tab-navigatie (home + profiel)
    index.tsx           #   Receptenlijst
    profile.tsx         #   Profiel/login + sync status
  add-manual/           #   Handmatig recept toevoegen
  add-url/              #   Recept via URL toevoegen
  recipe/               #   Recept detail
  save/                 #   Opslaan vanuit share intent
  modal.tsx             #   Modal screen
  _layout.tsx           #   Root layout (AuthProvider wrapper)
api/
  extract-recipe.ts     # Vercel serverless: haalt recept op via URL (JSON-LD + OG meta)
lib/
  db.ts                 # SQLite database (schema, CRUD operaties)
  supabase.ts           # Supabase client singleton
  auth.ts               # Apple Sign In helpers
  sync.ts               # Push/pull sync logica (SQLite ↔ Supabase)
  migrations.ts         # Schema-migraties voor SQLite + Supabase
  shareIntent.ts        # Share intent helper
components/
  AuthProvider.tsx       # Auth context + sync triggers
constants/Colors.ts     # Kleurconstanten (light/dark)
assets/images/          # App icons, splash screen
```

## Conventies

- **Taal**: Code in het Engels, UI-teksten en foutmeldingen in het Nederlands
- **Imports**: Gebruik `@/*` path alias (bijv. `@/lib/db`)
- **Database**: Alle queries via functies in `lib/db.ts`, niet rechtstreeks SQL in screens
- **Styling**: Gebruik NativeWind `className` met Tailwind classes, geen `StyleSheet.create()`
- **API responses**: Foutmeldingen in het Nederlands (bijv. "Ongeldige URL")
- **Patches**: `patch-package` wordt gebruikt (postinstall), patches staan in `patches/`

## Database

### Lokaal (SQLite - `recepten.db`)

| Kolom        | Type    | Beschrijving                    |
|--------------|---------|----------------------------------|
| id           | INTEGER | Primary key, autoincrement       |
| title        | TEXT    | Receptnaam                       |
| url          | TEXT    | Bron-URL                         |
| source       | TEXT    | Afgeleid: instagram/tiktok/youtube/other |
| notes        | TEXT    | Notities van gebruiker           |
| imagePath    | TEXT    | Lokaal pad naar afbeelding       |
| ingredients  | TEXT    | Ingredienten (newline-separated) |
| instructions | TEXT    | Bereidingswijze                  |
| createdAt    | TEXT    | Timestamp (datetime('now'))      |
| remote_id    | TEXT    | Supabase UUID (null = niet gesynct) |
| updated_at   | TEXT    | Laatste wijziging                |
| deleted_at   | TEXT    | Soft delete timestamp            |
| sync_status  | TEXT    | 'pending' of 'synced'           |

### Cloud (Supabase - `recipes` tabel)

Zelfde velden als lokaal, maar met UUID als primary key en `user_id` voor Row Level Security. Schema-migraties worden beheerd via `lib/migrations.ts`. Let op: nieuwe kolommen aan bestaande tabellen gaan automatisch via migraties. Nieuwe tabellen vereisen eenmalig SQL in het Supabase dashboard (admin-rechten nodig voor RLS policies).

## Sync architectuur

- **Offline-first**: SQLite is de primaire datastore, Supabase is cloud backup
- **Sync triggers**: na schrijf-acties en bij app-open
- **Conflict resolution**: last-write-wins op `updated_at`
- **Auth is optioneel**: app werkt volledig zonder account

## API: extract-recipe

`POST /api/extract-recipe` met body `{ "url": "..." }`

Parseert JSON-LD structured data van de pagina. Fallback naar OpenGraph meta tags als er geen JSON-LD Recipe gevonden wordt. Retourneert `{ title, imageUrl, ingredients, instructions }`.
