# Nosh — Design Tokens

Technische referentie voor implementatie in Tailwind/NativeWind en React Native.

---

## Kleuren

### Tailwind Config Mapping

```js
// tailwind.config.js → theme.extend.colors
colors: {
  nosh: {
    primary: {
      DEFAULT: '#FF7043',  // Deep Orange
      light: '#FF8F65',    // Salmon
      dark: '#E64A19',     // Burnt Orange
    },
    accent: {
      DEFAULT: '#FFD54F',  // Gold
      dark: '#F9A825',     // Amber Dark
    },
    midnight: '#1A1A2E',
    mocha: '#795548',
    latte: '#BCAAA4',
    vanilla: '#FFF8E1',
    success: '#43A047',
    error: '#E53935',
    info: '#1E88E5',
    warning: '#FB8C00',
  }
}
```

### React Native / Constants Mapping

```ts
// constants/Colors.ts
export const NoshColors = {
  primary: '#FF7043',
  primaryLight: '#FF8F65',
  primaryDark: '#E64A19',
  accent: '#FFD54F',
  accentDark: '#F9A825',
  midnight: '#1A1A2E',
  mocha: '#795548',
  latte: '#BCAAA4',
  vanilla: '#FFF8E1',
  white: '#FFFFFF',
  success: '#43A047',
  error: '#E53935',
  info: '#1E88E5',
  warning: '#FB8C00',
} as const;
```

---

## Typografie

### Font Bestanden

| Font | Bestand | Bron |
|------|---------|------|
| Londrina Solid Regular | `LondrinaSolid-Regular.ttf` | Google Fonts |
| Londrina Solid Black | `LondrinaSolid-Black.ttf` | Google Fonts |
| Nunito Regular | `Nunito-Regular.ttf` | Google Fonts |
| Nunito SemiBold | `Nunito-SemiBold.ttf` | Google Fonts |
| Nunito Bold | `Nunito-Bold.ttf` | Google Fonts |
| Nunito ExtraBold | `Nunito-ExtraBold.ttf` | Google Fonts |
| Nunito Black | `Nunito-Black.ttf` | Google Fonts |

### Tailwind Config Mapping

```js
// tailwind.config.js → theme.extend.fontFamily
fontFamily: {
  'display': ['LondrinaSolid-Black'],   // Londrina Solid — display titels
  'heading': ['LondrinaSolid-Regular'], // Londrina Solid — headings
  'body': ['Nunito-Regular'],
  'body-semibold': ['Nunito-SemiBold'],
  'body-bold': ['Nunito-Bold'],
  'body-extrabold': ['Nunito-ExtraBold'],
  'body-black': ['Nunito-Black'],
}
```

### Type Scale Tokens

```js
// tailwind.config.js → theme.extend.fontSize
fontSize: {
  'display': ['32px', { lineHeight: '40px', fontFamily: 'LondrinaSolid-Regular' }],
  'h1': ['24px', { lineHeight: '32px', fontFamily: 'LondrinaSolid-Regular' }],
  'h2': ['20px', { lineHeight: '28px', fontFamily: 'LondrinaSolid-Regular' }],
  'h3': ['18px', { lineHeight: '26px', fontFamily: 'LondrinaSolid-Regular' }],
  'body': ['16px', { lineHeight: '24px' }],
  'caption': ['14px', { lineHeight: '20px' }],
  'small': ['12px', { lineHeight: '16px' }],
}
```

---

## Spacing

### Tailwind Config Mapping

```js
// tailwind.config.js → theme.extend.spacing
spacing: {
  'xs': '4px',
  'sm': '8px',
  'md': '12px',
  'lg': '16px',
  'xl': '24px',
  '2xl': '32px',
  '3xl': '48px',
}
```

> **Let op:** Tailwind heeft al een spacing scale. Deze tokens kunnen als aanvulling of vervanging dienen, afhankelijk van voorkeur.

---

## Border Radius

### Tailwind Config Mapping

```js
// tailwind.config.js → theme.extend.borderRadius
borderRadius: {
  'sm': '8px',
  'md': '12px',
  'lg': '16px',
  'full': '9999px',  // pill shape
}
```

---

## Schaduwen

```js
// tailwind.config.js → theme.extend.boxShadow
boxShadow: {
  'card': '0 4px 16px rgba(0, 0, 0, 0.08)',
  'button-primary': '0 4px 12px rgba(255, 112, 67, 0.3)',
  'button-accent': '0 4px 12px rgba(255, 213, 79, 0.3)',
  'subtle': '0 2px 8px rgba(0, 0, 0, 0.06)',
}
```

---

## Component Tokens

### Knoppen

| Variant | Achtergrond | Tekst | Shadow |
|---------|-------------|-------|--------|
| Primary | `primary` | `white` | `button-primary` |
| Accent | `accent` | `midnight` | `button-accent` |
| Ghost | `transparent` | `primary` | none |
| Dark | `midnight` | `white` | none |

**Gedeelde properties:**
- `border-radius: full`
- `font-family: body-bold` (Nunito Bold)
- `font-size: body` (16px) of `caption` (14px) voor small
- `padding: sm xl` (8px 24px) of `xs lg` (4px 16px) voor small

### Recipe Card

| Property | Token |
|----------|-------|
| Achtergrond | `white` |
| Border-radius | `lg` |
| Shadow | `card` |
| Padding (body) | `lg` |
| Titel font | `h2` (Freckle Face) |
| Meta font | `caption` (Nunito) |
| Meta kleur | `mocha` |

### Chip / Tag

| Property | Token |
|----------|-------|
| Border-radius | `full` |
| Padding | `xs sm` (4px 8px) |
| Font | `small` + `body-semibold` |
| Achtergrond | `primary` met 10% opacity |
| Tekst | `primary` |

---

## App Configuratie

### app.json updates (voor later)

```json
{
  "name": "Nosh",
  "slug": "nosh",
  "scheme": "nosh",
  "splash": {
    "backgroundColor": "#FFF8E1"
  },
  "android": {
    "adaptiveIcon": {
      "backgroundColor": "#FF7043"
    }
  }
}
```

### Status Bar

- **Light mode:** Dark content op Vanilla achtergrond
- **Dark mode:** Light content op Midnight achtergrond
