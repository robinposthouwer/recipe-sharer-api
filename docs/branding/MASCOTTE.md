# Nosh — Mascotte Specificatie

## Overzicht

**Naam:** Nosh
**Type:** Vriendelijk spookje
**Rol:** App-mascotte en gids — verschijnt door de hele app als visueel ankerpunt

---

## Uiterlijk

### Basisvorm
- **Lichaam:** Rond/druppelvormig spooksilhouet, onderkant licht golvend (klassiek spookje)
- **Grootte:** Compact — past in een 48x48px icoon maar ook als groot illustratie-element
- **Kleur lichaam:** Wit (#FFFFFF) met een zeer subtiele warme schaduw
- **Transparantie:** Licht semi-transparant aan de randen (spookachtig effect)

### Gezicht
- **Ogen:** Groot, rond, expressief — de belangrijkste emotie-drager
- **Oogkleur:** Donker (Midnight #1A1A2E) met een kleine highlight/glans
- **Mond:** Simpel, verandert per emotie (glimlach, open mond, etc.)
- **Geen neus** — houdt het simpel en iconisch

### Accessoires
- **Koksmuts:** Klein, wit, licht scheef op het hoofd — geeft karakter
- **Vork:** Klein vorkje in de rechterhand (optioneel, niet bij elke emotie)
- **Geen kleding** — het spookje IS de vorm, geen aparte kleding nodig

### Proportie
- Hoofd/lichaam ratio: ca. 60/40 (groot hoofd, klein lichaam)
- Koksmuts: ca. 25% van de totale hoogte
- Zweeft altijd — nooit op de grond, kleine schaduw eronder

---

## Kleurgebruik

| Element | Kleur | Hex |
|---------|-------|-----|
| Lichaam | Wit | `#FFFFFF` |
| Ogen | Midnight | `#1A1A2E` |
| Oog-highlight | Wit | `#FFFFFF` |
| Koksmuts | Wit met lichtgrijze vouw | `#F5F5F5` |
| Vorkje | Gold accent | `#FFD54F` |
| Wangen (blush) | Salmon (subtiel) | `#FF8F65` op 30% opacity |
| Schaduw onder | Midnight | `#1A1A2E` op 10% opacity |

---

## Emoties

Elke emotie heeft een specifiek gebruik in de app. Het gezicht verandert, de basisvorm blijft hetzelfde.

### 1. Blij (Default)
- **Gebruik:** Home scherm, standaard staat
- **Ogen:** Open, vrolijk, licht samengeknepen
- **Mond:** Brede glimlach
- **Extra:** Lichte blush op de wangen

### 2. Hongerig
- **Gebruik:** Nieuw recept wordt opgeslagen
- **Ogen:** Groot, glanzend, sterretjes erin
- **Mond:** Open, kwijlend
- **Extra:** Vorkje in de hand, lichte trilling/wiebel

### 3. Feest
- **Gebruik:** Draaiwiel resultaat, milestone bereikt
- **Ogen:** Dicht van plezier (^_^)
- **Mond:** Grote open glimlach
- **Extra:** Confetti-effect, koksmuts springt omhoog, armpjes omhoog

### 4. Zoekend
- **Gebruik:** Laden, recept extracten van URL
- **Ogen:** Samengeknepen, geconcentreerd
- **Mond:** Kleine ronde "o"
- **Extra:** Vergrootglas in de hand i.p.v. vork, lichte zweef-animatie

### 5. Slapend
- **Gebruik:** Lege staat, geen recepten
- **Ogen:** Dicht, liggende streepjes (- -)
- **Mond:** Kleine "z" bubbels
- **Extra:** Koksmuts over de ogen gezakt, lichte ademhaling-animatie

### 6. Oeps
- **Gebruik:** Foutmelding, URL niet gevonden
- **Ogen:** Groot, geschrokken
- **Mond:** Kleine "o", bezorgd
- **Extra:** Koksmuts scheef gevallen, licht blozen, zweetdruppel

### 7. Sociaal
- **Gebruik:** Recept delen met vriend
- **Ogen:** Vrolijk, knipoog
- **Mond:** Glimlach met tong uit
- **Extra:** Zweeft met envelop/recept-kaartje in de hand

### 8. Denkend
- **Gebruik:** Swipe keuze, "wat zullen we eten?"
- **Ogen:** Omhoog kijkend
- **Mond:** Schuin, nadenkend
- **Extra:** Hand/pootje tegen de kin, vraagtekens rondom

---

## Animatie-richtlijnen

### Standaard beweging
- **Zweef-animatie:** Zacht op en neer, 2-3 seconden per cyclus
- **Ease:** ease-in-out (geen lineair, moet organisch voelen)
- **Amplitude:** 4-6px verticaal

### Transities tussen emoties
- **Duur:** 300-400ms
- **Stijl:** Morph/squash-and-stretch — het gezicht transformeert vloeiend
- **Geen harde snit** — altijd een zachte overgang

### Micro-animaties
- **Ogen knipperen:** Elke 3-5 seconden, willekeurig
- **Koksmuts wiebel:** Bij interactie (tap, swipe)
- **Blush verschijning:** Fade in/out bij relevante emoties

---

## Gebruik in de App

### Waar verschijnt Nosh?

| Locatie | Emotie | Grootte |
|---------|--------|---------|
| Tab bar (profiel-icoon) | Blij | 24px |
| Home header | Blij | 32px |
| Lege receptenlijst | Slapend | 120px |
| Recept laden | Zoekend | 80px |
| Recept opgeslagen toast | Hongerig | 40px |
| Foutmelding | Oeps | 80px |
| Draaiwiel resultaat | Feest | 120px |
| Deel-scherm | Sociaal | 80px |
| Swipe-keuze | Denkend | 80px |

### Nosh spreekt (UI-teksten)

Nosh heeft een eigen stem in de app:

| Situatie | Tekst |
|----------|-------|
| Welkom (eerste keer) | "Hoi! Ik ben Nosh. Laten we samen koken!" |
| Lege lijst | "Ik heb honger! Voeg je eerste recept toe." |
| Recept opgeslagen | "Jammie! Dit recept heb ik te pakken!" |
| URL fout | "Oeps! Ik kan dit recept niet vinden..." |
| Recept gedeeld | "Verstuurd! Je vriend gaat smullen." |
| Draaiwiel draait | "Spannend... wat gaan we eten?" |
| Draaiwiel resultaat | "Tadaa! Vanavond eten we [recept]!" |

---

## Do's en Don'ts

### Do's
- Houd het spookje **simpel en iconisch** — het moet werken op 24px
- Gebruik **zachte, ronde vormen** — geen scherpe hoeken
- Laat het spookje **altijd zweven** — het raakt nooit de grond
- Zorg dat de **koksmuts altijd zichtbaar** is — het is het herkenningspunt
- Gebruik de **warme kleuren** voor accenten (blush, vorkje)

### Don'ts
- Maak het spookje **niet eng of griezelig** — het is vriendelijk
- Geen **complexe details** — het moet simpel blijven
- Geen **schaduw op het lichaam** — het is een spook, het is licht
- Niet **te veel accessoires** — koksmuts + vorkje is genoeg
- Geen **tekst in het spookje** zelf — tekst staat ernaast
