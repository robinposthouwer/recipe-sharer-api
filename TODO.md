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
- [ ] YouTube Data API v3 integreren voor video-beschrijvingen (receptinfo uit caption)
  - Gratis: 10.000 quota-eenheden/dag — let op bij groei (20k gebruikers × 2 video's = over limiet)
  - Caching inbouwen: video-beschrijving opslaan na eerste keer ophalen, zodat dezelfde video niet dubbel wordt opgehaald
  - Quotum verhoging aanvragen bij Google als we richting 10.000 calls/dag gaan
  - Dagelijkse API-call teller bijhouden (bijv. in Supabase); bij 10.000+ een melding tonen aan de gebruiker ("Limiet bereikt, probeer het morgen opnieuw")
- [ ] Onderzoek doen naar het schalen van de app als we live gaan (API limieten, infra, kosten)
- [ ] AI-parsing van social media captions naar gestructureerde receptdata:
  - Titel extraheren uit caption/video
  - Ingrediënten herkennen en opsplitsen
  - Bereidingswijze stap-voor-stap afleiden
  - Uitzoeken: eigen LLM trainen/fine-tunen vs. bestaande API gebruiken (Claude, GPT, etc.)
  - Kosten per API-call berekenen en testen (belangrijk voor schaalbaarheid)
- [ ] Mislukte extracties bijhouden in database (Supabase): als ingrediënten/beschrijving niet opgehaald konden worden, URL + bron opslaan zodat we later alsnog kunnen verwerken (bijv. via AI of handmatig)
- [ ] Lokaal opslaan van afbeeldingen (social media thumbnails verlopen)
- [ ] AI-endpoint voor receptextractie uit tekst (`api/extract-from-text.ts`)
- [ ] Afbeeldingen genereren voor recepten zonder foto (`api/generate-image.ts`)

## Gebruikersaccounts
- [x] Login / registratie systeem (e-mail/wachtwoord via Supabase Auth)
- [x] Cloud-sync van recepten (Supabase, offline-first met SQLite)
- [ ] Apple Sign In toevoegen (vereist betaald Apple Developer account, $99/jaar)
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
