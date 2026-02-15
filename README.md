# Recepten app

Mobiele app voor Android en iOS om recepten op te slaan via de share-extensie ("Deel naar app") vanuit Instagram, TikTok en andere apps.

## Vereisten

- Node.js 20+
- npm
- Xcode (voor iOS)
- Android Studio (voor Android)

## Installatie

```bash
npm install
```

## Ontwikkeling

De app gebruikt native modules (expo-share-intent) en werkt niet met Expo Go. Gebruik een development build:

```bash
npx expo prebuild --no-install --clean
npx expo run:ios
# of
npx expo run:android
```

## Productie build (EAS)

```bash
npx eas build --platform all --profile production
```

## Configuratie

Voor "Voeg toe via URL" moet de API URL geconfigureerd worden. Maak een `.env` bestand met:

```
EXPO_PUBLIC_API_URL=https://jouw-project.vercel.app
```

Deploy de `api/` map naar Vercel om de extract-recipe endpoint te hosten.

## Gebruik

1. Deel een recept (link, afbeelding of video) vanuit Instagram, TikTok of een andere app via "Deel naar" / "Share"
2. Kies "Recepten app" in het share-scherm
3. Voeg optioneel een titel en notities toe en tik op Opslaan
4. Of tik op "Via URL toevoegen" om een recept-URL in te voeren; de app haalt titel, ingrediënten en bereidingswijze op (van sites met schema.org Recipe)
5. Bekijk je opgeslagen recepten in de lijst en open de link om het origineel te bekijken
