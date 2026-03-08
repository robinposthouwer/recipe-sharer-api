# TODO

## NativeWind toevoegen
- [x] NativeWind installeren en configureren
- [x] Tailwind config aanmaken
- [ ] Bestaande inline styles omzetten naar Tailwind classes
- [ ] Dark/light mode setup via Tailwind
- [ ] Themed.tsx en StyledText.tsx refactoren naar NativeWind

## API uitbreiden
- [ ] Social media beschrijvingen ophalen (Instagram, TikTok)
- [ ] AI-endpoint voor receptextractie uit tekst (`api/extract-from-text.ts`)
- [ ] Afbeeldingen genereren voor recepten zonder foto (`api/generate-image.ts`)

## Gebruikersaccounts (toekomstig)
- [ ] Login / registratie systeem
- [ ] Cloud-sync van recepten (bijv. Supabase of Firebase)
- [ ] Recepten delen met andere gebruikers

## Claude-integratie verbeteren
- [ ] Alle Claude-bestanden binnen het project verplaatsen naar `.claude/` map (commands, hooks, settings)
- [ ] Custom slash commands aanmaken (bijv. `/recept-toevoegen`, `/db-reset`)
- [ ] Agents / subagents inzetten voor specifieke taken (bijv. recept-extractie verbeteren, testen)
- [ ] Skills configureren die passen bij de app-workflow
