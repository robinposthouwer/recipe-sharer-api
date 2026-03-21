# Nosh — App Icon Concept

## Concept

Het app-icoon toont Nosh het spookje centraal op een warme achtergrond. Simpel, herkenbaar, en opvallend tussen andere app-iconen.

---

## Compositie

### Elementen
1. **Achtergrond:** Deep Orange (#FF7043) — opvallend, warm, herkenbaar
2. **Nosh spookje:** Wit, gecentreerd, "blij" emotie
3. **Koksmuts:** Wit met lichtgrijze details, scheef op het hoofd

### Layout
- Spookje neemt ca. 65-70% van de icoon-ruimte in
- Gecentreerd, zowel horizontaal als verticaal
- Kleine marge aan alle kanten (safe area)
- Geen tekst in het icoon — alleen het karakter

### Stijl
- Flat design, geen 3D-effecten
- Geen gradient op het spookje zelf
- Achtergrond mag een subtiel radiaal gradient hebben (lichter in het midden)

---

## Platform-varianten

### iOS (1024x1024)
- Rounded rectangle wordt automatisch toegepast door iOS
- Geen eigen afronding toevoegen
- Safe area: 16% marge aan elke kant voor de afronding
- Achtergrond: solid Deep Orange of subtiel radiaal gradient

### Android Adaptive Icon
- **Voorgrond (108x108dp):** Nosh spookje (wit) met transparante achtergrond
- **Achtergrond (108x108dp):** Deep Orange (#FF7043)
- Safe zone: 66dp diameter cirkel in het midden
- Het spookje moet volledig binnen de safe zone passen

### Favicon (32x32, 16x16)
- Vereenvoudigde versie: alleen het spookje-silhouet
- Geen koksmuts-details bij 16x16
- Deep Orange achtergrond

### Splash Screen
- **Achtergrond:** Vanilla (#FFF8E1) — de app-achtergrondkleur
- **Spookje:** Groot, gecentreerd, "blij" emotie
- **Tekst:** "nosh" in Freckle Face eronder, Midnight (#1A1A2E) kleur
- **Tagline:** "Save · Share · Spin" in Nunito, Mocha (#795548)

---

## Kleurvarianten

| Variant | Achtergrond | Spookje | Gebruik |
|---------|-------------|---------|---------|
| Standaard | Deep Orange #FF7043 | Wit | App Store, Home Screen |
| Donker | Midnight #1A1A2E | Wit + oranje blush | Alternatief / Dark mode |
| Licht | Vanilla #FFF8E1 | Wit + oranje blush | Splash screen, marketing |
| Mono | Wit | Midnight silhouet | Print, documentatie |

---

## Bestandsnamen & Formaten

| Bestand | Formaat | Gebruik |
|---------|---------|---------|
| `icon.png` | 1024x1024 PNG | iOS App Store |
| `adaptive-icon.png` | 1024x1024 PNG | Android voorgrond |
| `splash-icon.png` | 200x200 PNG | Splash screen |
| `favicon.png` | 48x48 PNG | Web |

---

## Referenties

- Mascotte details: [MASCOTTE.md](./MASCOTTE.md)
- Kleuren: [BRANDING.md](./BRANDING.md#kleurpalet--zonnig-warm)
