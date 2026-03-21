# Nosh — Branding Guide

## De Naam

**Nosh** — Brits/Jiddisch slang voor eten, snacken, smullen.

- Kort (4 letters), pakkend, makkelijk te onthouden
- Subtiel food-gerelateerd zonder letterlijk "recipe" te bevatten
- Internationaal bruikbaar (Engels)

**Tagline:** Save · Share · Spin

**Alternatieve taglines:**
- "Your recipes, one tap away"
- "Collect. Cook. Share."

---

## De Mascotte — Nosh het Spookje

Een klein, rond spookje met een scheef koksmutje, grote hongerige ogen en een vorkje in zijn hand. Altijd lichtjes zwevend.

### Karakter-eigenschappen

| Eigenschap | Link met de app |
|------------|----------------|
| Altijd hongerig | Wil altijd meer recepten verzamelen |
| Zweeft overal doorheen | Haalt recepten van elk platform (TikTok, Instagram, web) |
| Deelt graag | Sociale features, recepten delen met vrienden |
| Speels & guitig | Gamification (draaiwiel, swipe-features) |
| Vergeet nooit iets | Offline-first, recepten altijd beschikbaar |

### Emoties / Poses

| Emotie | Gebruik in de app |
|--------|-------------------|
| Blij | Default / Home scherm |
| Hongerig | Nieuw recept opslaan |
| Feest | Draaiwiel / sociaal moment |
| Zoekend | Laden / recept extracten |
| Slapend | Lege staat / geen recepten |
| Oeps | Foutmelding |
| Sociaal | Recept delen met vriend |
| Denkend | Swipe keuze moment |

Zie [MASCOTTE.md](./MASCOTTE.md) voor de volledige mascotte-specificatie.

---

## Kleurpalet — "Zonnig Warm"

Warm, uitnodigend en energiek. De kleuren zijn gekozen om een gezellige maar speelse sfeer te creeren.

### Primaire kleuren

| Naam | Hex | Gebruik |
|------|-----|---------|
| Deep Orange | `#FF7043` | Primary — knoppen, links, CTA's |
| Salmon | `#FF8F65` | Primary light — hover, subtiele accenten |
| Burnt Orange | `#E64A19` | Primary dark — pressed states |
| Gold | `#FFD54F` | Accent — badges, highlights, draaiwiel |
| Amber Dark | `#F9A825` | Accent dark — tekst op goud achtergrond |

### Neutrale kleuren

| Naam | Hex | Gebruik |
|------|-----|---------|
| Midnight | `#1A1A2E` | Headers, primaire tekst, dark mode basis |
| Mocha | `#795548` | Body text, subtitels |
| Latte | `#BCAAA4` | Borders, disabled states |
| Vanilla | `#FFF8E1` | App achtergrond |
| White | `#FFFFFF` | Cards, surfaces |

### Functionele kleuren

| Naam | Hex | Gebruik |
|------|-----|---------|
| Success | `#43A047` | Bevestigingen |
| Error | `#E53935` | Foutmeldingen |
| Info | `#1E88E5` | Informatieve meldingen |
| Warning | `#FB8C00` | Waarschuwingen |

### Kleurgebruik-regels

- **Deep Orange** is de hoofdkleur — gebruik voor alle primaire acties
- **Gold** voor gamification-elementen en highlights
- **Vanilla** als app-achtergrond (warm, niet klinisch wit)
- **Midnight** voor alle belangrijke tekst (donker genoeg voor goed contrast)
- Functionele kleuren alleen voor hun specifieke doel gebruiken

---

## Typografie

### Fonts

| Doel | Font | Bron |
|------|------|------|
| Titels & Logo | **Londrina Solid** | [Google Fonts](https://fonts.google.com/specimen/Londrina+Solid) |
| Body & UI | **Nunito** | [Google Fonts](https://fonts.google.com/specimen/Nunito) |

**Londrina Solid** geeft een handgemaakt, licht spookachtig karakter — straatkunst-vibe met persoonlijkheid.
**Nunito** is rond, vriendelijk en goed leesbaar voor alle UI-tekst.

### Type Scale

| Niveau | Grootte | Gewicht | Font |
|--------|---------|---------|------|
| Display | 32px | Black (900) | Londrina Solid |
| H1 | 24px | Regular (400) | Londrina Solid |
| H2 | 20px | Regular (400) | Londrina Solid |
| H3 | 18px | Regular (400) | Londrina Solid |
| Body | 16px | Regular (400) | Nunito |
| Body Bold | 16px | Bold (700) | Nunito |
| Caption | 14px | Regular (400) | Nunito |
| Small | 12px | SemiBold (600) | Nunito |

> **Let op:** Londrina Solid heeft gewichten van 100 tot 900. Gebruik Black (900) voor display en Regular (400) voor headings.

---

## Spacing & Radius

### Spacing (4px grid)

| Token | Waarde | Gebruik |
|-------|--------|---------|
| xs | 4px | Minimale ruimte |
| sm | 8px | Tussen gerelateerde elementen |
| md | 12px | Padding in kleine componenten |
| lg | 16px | Standaard padding |
| xl | 24px | Sectie-afstand |
| 2xl | 32px | Grote secties |
| 3xl | 48px | Pagina-marges |

### Border Radius

| Token | Waarde | Gebruik |
|-------|--------|---------|
| sm | 8px | Kleine elementen, inputs |
| md | 12px | Cards, containers |
| lg | 16px | Grote cards, modals |
| full | 9999px | Knoppen (pill-shape), chips |

---

## UI Componenten

### Knoppen
- **Vorm:** Pill-shaped (border-radius: full)
- **Varianten:**
  - Primary (Deep Orange achtergrond, witte tekst)
  - Accent (Gold achtergrond, Espresso tekst)
  - Ghost (transparant, Deep Orange border en tekst)
  - Dark (Midnight achtergrond, witte tekst)
- **Shadow:** Subtiele gekleurde schaduw onder primary en accent knoppen
- **Maten:** Default (16px padding) en Small (10px padding)

### Chips & Tags
- Pill-shaped
- Lichte achtergrond met gekleurde tekst
- Voorbeelden: bronlabels (TikTok, Instagram), categorielabels, status-indicators

### Recipe Cards
- Witte achtergrond op Vanilla surface
- Border-radius: lg (16px)
- Subtiele schaduw
- Afbeelding bovenaan, titel en meta eronder
- Bronlabel als overlay op de afbeelding

### Tab Bar (5 tabs)
1. Recepten (home)
2. Nieuw (toevoegen)
3. Spin (draaiwiel — centraal, opvallend)
4. Vrienden (sociaal)
5. Profiel (Nosh spookje als icoon)

---

## App Identiteit

### Persoonlijkheid
- **Grappig** — de app neemt zichzelf niet te serieus
- **Warm** — voelt als een gezellige keuken
- **Vriendelijk** — laagdrempelig, geen ingewikkelde UI
- **Speels** — gamification-elementen, het spookje als gids
- **Sociaal** — delen en samen koken staat centraal

### Tone of Voice (UI-teksten)
- Nederlands (conform projectconventies)
- Informeel, alsof Nosh tegen je praat
- Voorbeelden:
  - Leeg scherm: "Nosh heeft honger! Voeg je eerste recept toe."
  - Recept opgeslagen: "Nosh heeft je recept gevangen!"
  - Foutmelding: "Oeps! Nosh kon dit recept niet vinden."
  - Delen: "Nosh stuurt het recept naar je vriend!"

---

## Referenties

- [DESIGN-TOKENS.md](./DESIGN-TOKENS.md) — Technische tokens voor implementatie
- [MASCOTTE.md](./MASCOTTE.md) — Volledige mascotte-specificatie
- [APP-ICON.md](./APP-ICON.md) — App-icoon concept
