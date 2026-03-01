# Samenvatting gesprek en uitkomsten

## Geïmplementeerde features

### 1. Voeg toe via URL
- Gebruiker voert een recept-URL in (bijv. Allerhande, 24Kitchen).
- Serverless API (Vercel) haalt de pagina op en extraheert titel, afbeelding, ingrediënten en bereidingswijze via schema.org JSON-LD.
- Preview is bewerkbaar, daarna opslaan.
- **Niet geschikt voor Instagram-URL’s**: die laden via JavaScript, hebben geen recept-schema en kunnen lang hangen of time-out geven.

### 2. Handmatig toevoegen
- Nieuwe flow “Handmatig toevoegen” op de receptenlijst.
- Formulier: titel (verplicht), link (optioneel), ingrediënten, bereidingswijze.
- Handig om recepttekst van Instagram te plakken en op te slaan zonder share intent of development build.
- Werkt in Expo Go.

### 3. Database
- Recept-model uitgebreid met velden `ingredients` en `instructions`.
- Migratie in `initDb()` voegt deze kolommen toe als ze nog ontbreken.
- Receptdetailscherm toont ingrediënten en bereidingswijze.

---

## Configuratie

### API (Vercel)
- Backend staat in `api/extract-recipe.ts`; geen aparte backend bouwen.
- Deploy naar Vercel (bijv. na push naar GitHub → Import in Vercel).
- In projectroot `.env`:
  ```bash
  EXPO_PUBLIC_API_URL=https://recipe-sharer-api-xxx.vercel.app
  ```
- Geen trailing slash in de URL.

### GitHub
- Repo moet niet leeg zijn: lokaal `git init`, commit, push naar een nieuwe GitHub-repo.
- Bij “Permission denied” met twee accounts: persoonlijke SSH-key gebruiken voor deze repo (`github.com-personal` in `~/.ssh/config`), of credentials wissen voor `github.com`.

---

## Testen en draaien

### Starten
- **Simulator:** `npx expo start` → dan `i` (iOS) of `a` (Android). Of direct: `npx expo run:ios`.
- **Fysieke iPhone:** `npx expo run:ios --device` (iPhone via USB aangesloten).

### Code signing (fysieke iPhone)
- Eenmalig in Xcode: `ios/ReceptenApp.xcworkspace` openen → target ReceptenApp → **Signing & Capabilities** → “Automatically manage signing” aan → **Team** = je Apple ID.
- Apple ID toevoegen onder **Xcode → Settings → Accounts** indien nodig.
- Persoonlijke Apple ID is voldoende (gratis account: beperkingen o.a. 7 dagen geldigheid development build).

### Alternatief: EAS Build
- Geen lokaal Xcode-signing: `eas build --profile development --platform ios`.
- Apple ID koppelen in Expo-dashboard; EAS regelt certificaten. Installatie via link op de iPhone.

### Kabel
- Kabel nodig tijdens bouwen/installeren op device.
- Daarna mag de kabel eruit; app blijft op de telefoon.
- Voor live reload: iPhone en Mac op hetzelfde wifi-netwerk.

### Fout “Device is busy” / “Waiting to reconnect”
- iPhone ontgrendelen, kabel goed aansluiten.
- Op iPhone “Vertrouw deze computer?” accepteren.
- Kabel even loskoppelen en opnieuw aansluiten, daarna opnieuw `npx expo run:ios --device`.

---

## Uitgesteld

### Share vanuit Instagram
- Delen naar Recepten app vanuit de Instagram-app vereist een **development build op de iPhone** (niet Expo Go), vanwege `expo-share-intent`.
- Voor nu uitgesteld; eerst handmatig toevoegen of “Via URL” voor receptensites gebruiken.
- Later: signing/EAS afronden en `npx expo run:ios --device` (of EAS build) om de app op de iPhone te zetten; dan verschijnt “Recepten app” in het Share-menu.

---

## Bestandsstructuur (relevant)

```
ReceptenApp/
├── .env                          # EXPO_PUBLIC_API_URL
├── api/extract-recipe.ts         # Vercel serverless recipe extraction
├── app/
│   ├── add-url/index.tsx         # Voeg toe via URL
│   ├── add-manual/index.tsx      # Handmatig toevoegen
│   ├── recipe/[id].tsx           # Detail (incl. ingrediënten, bereidingswijze)
│   └── (tabs)/index.tsx          # Receptenlijst + knoppen
├── lib/db.ts                     # Recipe + ingredients/instructions, migratie
└── vercel.json                   # Vercel config
```
