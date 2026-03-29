# Hero Image: Swipeable Carousel + Bron-icoon

**Datum:** 2026-03-29
**Scope:** Design-only (frame `mw2Nn` in `designs/recipe-app.pen`)
**Status:** Design gereed, code nog niet geïmplementeerd

## Wat is gebouwd

De hero image van het Recept Detail scherm (`oSiZJ`, 440×420px) heeft drie overlay-elementen gekregen:

### 1. Gradient overlay
- Rechthoek, 440×100px, onderaan de hero (y=320)
- Lineair gradient: transparant bovenaan → 60% zwart onderaan
- Doel: dots en bron-icoon altijd leesbaar houden ongeacht de foto

### 2. Paginatie-dots (linksonder)
- 5 ellipsen, 8px diameter, 6px gap, horizontale layout
- Positie: x=20, y=385
- Actieve dot (eerste): wit (#FFFFFF, vol)
- Inactieve dots (2–5): wit, 40% transparant (#FFFFFF66)
- Max 5 dots — bij meer afbeeldingen max 5 tonen

### 3. Bron-icoon (rechtsonder)
- Afgerond vierkant (36×36px, cornerRadius=10), positie: x=384, y=371
- Achtergrond: wit, 80% transparant (#FFFFFFCC)
- Icoon: 20×20px `icon_font` uit Phosphor icon set
- Voorbeeldwaarden per bron:
  - `instagram` → `instagram-logo` (#E1306C)
  - `tiktok` → `tiktok-logo` (#000000)
  - `youtube` → `youtube-logo` (#FF0000)
  - `other` / website → `globe` (#666666)

## Beslissingen

- **Optie A gekozen** (overlay op bestaande hero) boven aparte footer-balk of fullscreen hero — sluit aan op bestaand patroon van terug-knop overlay.
- **Dots linksonder**, niet rechtsonder — de golflijn in het design zit rechtsonder in de weg.
- **Max 5 dots** afgesproken.
- **Icoon ipv tekst** voor de bronknop — herkenbaarder en compacter.

## Code implementatie (nog te doen)

- `app/recipe/[id].tsx`: `<ScrollView>`-achtig carousel component (bijv. `FlatList` of `react-native-reanimated-carousel`) voor meerdere afbeeldingen
- Bron-icoon renderen o.b.v. `recipe.source` veld (al aanwezig in DB)
- `handleOpenLink` bestaat al — knop hoeft alleen zichtbaar te worden op de foto
- Meerdere afbeeldingen vereist DB-uitbreiding (momenteel één `imagePath`)
