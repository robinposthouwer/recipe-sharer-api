# ReceptenApp

Mobiele app waarmee gebruikers recepten opslaan — via URL (met automatische extractie), handmatig, of via de share-functie van iOS/Android.

## Tech stack

- **Framework**: Expo SDK 54, React Native 0.81 (New Architecture)
- **Taal**: TypeScript (strict mode)
- **Routing**: Expo Router v6 (file-based, typed routes)
- **Database**: expo-sqlite (lokale SQLite `recepten.db`)
- **API**: Vercel serverless function (`api/extract-recipe.ts`)
- **Share intent**: expo-share-intent (URLs/tekst/afbeeldingen ontvangen)
- **Styling**: NativeWind v4 (Tailwind CSS voor React Native) + Reanimated

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
  (tabs)/               #   Tab-navigatie (home)
  add-manual/           #   Handmatig recept toevoegen
  add-url/              #   Recept via URL toevoegen
  recipe/               #   Recept detail
  save/                 #   Opslaan vanuit share intent
  modal.tsx             #   Modal screen
  _layout.tsx           #   Root layout
api/
  extract-recipe.ts     # Vercel serverless: haalt recept op via URL (JSON-LD + OG meta)
lib/
  db.ts                 # SQLite database (schema, CRUD operaties)
  shareIntent.ts        # Share intent helper
components/             # Herbruikbare UI-componenten
constants/Colors.ts     # Kleurconstanten (light/dark)
assets/images/          # App icons, splash screen
```

## Conventies

- **Taal**: Code in het Engels, UI-teksten en foutmeldingen in het Nederlands
- **Imports**: Gebruik `@/*` path alias (bijv. `@/lib/db`)
- **Database**: Alle queries via functies in `lib/db.ts`, niet rechtstreeks SQL in screens
- **API responses**: Foutmeldingen in het Nederlands (bijv. "Ongeldige URL")
- **Patches**: `patch-package` wordt gebruikt (postinstall), patches staan in `patches/`

## Database schema (recipes)

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

## API: extract-recipe

`POST /api/extract-recipe` met body `{ "url": "..." }`

Parseert JSON-LD structured data van de pagina. Fallback naar OpenGraph meta tags als er geen JSON-LD Recipe gevonden wordt. Retourneert `{ title, imageUrl, ingredients, instructions }`.
