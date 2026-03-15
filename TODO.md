# TODO

## NativeWind toevoegen
- [x] NativeWind installeren en configureren
- [x] Tailwind config aanmaken
- [ ] Bestaande inline styles omzetten naar Tailwind classes
- [ ] Dark/light mode setup via Tailwind
- [ ] Themed.tsx en StyledText.tsx refactoren naar NativeWind

## API uitbreiden
- [x] oEmbed integratie voor TikTok en YouTube (caption + thumbnail ophalen)
- [ ] Instagram/Facebook data ophalen — opties uitzoeken:
  - Meta oEmbed Read (nieuwe versie nov 2025) retourneert GEEN caption, thumbnail of author meer
  - Alleen `html` embed-code — caption zit mogelijk in de blockquote maar moet zelf geparsed worden
  - Vereist: Meta App Review + Business Verification (eenmanszaak/KVK volstaat, ~€75)
  - Meta kan in de toekomst kosten gaan rekenen voor API-calls ("billing tokens")
  - Alternatief: headless browser (Puppeteer) voor scraping, maar complex op Vercel (50MB limiet, traag)
  - Huidige tijdelijke oplossing: OG meta tags scrapen (werkt niet voor Instagram, wel voor andere sites)
- [ ] Onderzoek doen naar het schalen van de app als we live gaan (API limieten, infra, kosten)
- [ ] AI-parsing van social media captions naar ingrediënten en bereidingswijze
- [ ] Lokaal opslaan van afbeeldingen (social media thumbnails verlopen)
- [ ] AI-endpoint voor receptextractie uit tekst (`api/extract-from-text.ts`)
- [ ] Afbeeldingen genereren voor recepten zonder foto (`api/generate-image.ts`)

## Gebruikersaccounts (toekomstig)
- [ ] Login / registratie systeem
- [ ] Cloud-sync van recepten (bijv. Supabase of Firebase)
- [ ] Recepten delen met andere gebruikers

## Sociaal delen (toekomstig)
- [ ] Recepten delen met vrienden die de app hebben
- [ ] Vrienden toevoegen aan de app
- [ ] Groepen en familielijsten aanmaken
- [ ] Juridisch uitzoeken: auteursrecht op receptteksten bij delen
- [ ] Juridisch uitzoeken: AVG/GDPR bij opslaan van contactgegevens en gebruikersdata in de cloud

## Claude-integratie verbeteren
- [ ] Alle Claude-bestanden binnen het project verplaatsen naar `.claude/` map (commands, hooks, settings)
- [ ] Custom slash commands aanmaken (bijv. `/recept-toevoegen`, `/db-reset`)
- [ ] Agents / subagents inzetten voor specifieke taken (bijv. recept-extractie verbeteren, testen)
- [ ] Skills configureren die passen bij de app-workflow
