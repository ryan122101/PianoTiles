
# Piano Tiles Premium (Web / PWA)

Jeu *style Piano Tiles* conçu pour iPhone (et web), visuel premium, 60/120 fps, jouable hors-ligne via PWA.  
Inclut 10 pistes **domaine public** simplifiées et un moteur Canvas ultra fluide.

## Lancer
```bash
npm i
npm run dev
# Ouvre http://localhost:5173
```

### Build
```bash
npm run build
npm run preview
```

## Fonctionnalités
- 4 lanes, tap/hold basique (les exemples fournis sont tap).
- Score + combo + multiplicateur, HUD minimaliste.
- Visuel *glassmorphism*, animations GPU-friendly.
- PWA + service worker (cache offline), orientation portrait.
- 10 pistes (simplifiées) : Beethoven, Bach, Mozart, Debussy, Chopin, Joplin, Pachelbel, Grieg, Tchaïkovski, Rimsky-Korsakov.

## Ajouter/éditer une musique
- Format JSON : `src/songs/*.json` (voir exemples).
- Champs : `t` (ms), `lane` (1..4), `dur` (ms), `type: 'tap'|'hold'`, `midi` (optionnel).
- Ajoute ton fichier dans `src/songs` et référence-le dans `src/songs/index.ts` (array `SONGS`).

## iPhone (PWA)
- Ouvre l’URL dans Safari → bouton *Partager* → **Ajouter à l’écran d’accueil**.
- Lance depuis l’icône *Tiles* (plein écran, hors-ligne).
- Haptics automatiques si supportés.

## Réglages/Qualité
- Le moteur cible 60/120 fps ; si besoin, allège les motifs ou diminue `spawnLead`.
- Les *hit windows* : Perfect ±35ms, Great ±65ms, Good ±90ms (dans `GameplayScene`).

## Roadmap (rapide à ajouter)
- Calibration de latence (tap test) + offset sauvegardé.
- Notes *hold* & *slide* complètes + SFX.
- Synthèse WebAudio (piano doux) en fonction du champ `midi`.
- Défis quotidiens + mode Rush/Endless.

---
**Note** : les icônes PWA sont des *placeholders* (fichiers vides). Remplace-les par de vraies images PNG 192/512.


## Hébergement (Netlify / Cloudflare Pages)
1. Build statique :  
   ```bash
   npm run build
   ```
   Le dossier **dist/** est prêt.
2. **Netlify** : glisse **dist/** dans le dashboard ou via CLI (`netlify deploy --prod --dir=dist`).
3. **Cloudflare Pages** : crée un projet → Framework **None** → *Build command*: `npm run build` → *Build output*: `dist`.
4. Active le HTTPS. La PWA s’installe depuis le site en un clic.

## Système d'étoiles & thèmes
- 1★ : précision ≥ 80% et combo ≥ 40  
- 2★ : précision ≥ 90% et combo ≥ 80 → **débloque thème Aurora**  
- 3★ : précision ≥ 95% et combo ≥ 120 → **débloque thème Obsidian**  
- Menu → **Thème** pour cycler entre les thèmes débloqués.

## Endless/Daily "musical"
Le mode Endless/Daily utilise un **n-gram (ordre 2)** construit sur la piste choisie pour générer des séquences cohérentes (transitions de lanes et rythmes). Fin au bout de ~120s (démo).


## Haptics (retour haptique)
- **Android/Chrome** : utilise `navigator.vibrate` → vrais haptics.
- **iOS/Safari** : l'API Vibration n'est généralement **pas supportée**. On applique un **fallback audio** discret (mini “thump”) pour un ressenti proche. Active/désactive via le bouton **Haptics** (menu).
