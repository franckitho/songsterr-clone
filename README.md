# TabPlayer — clone de Songsterr (V1)

Application web perso pour **jouer des tablatures Guitar Pro avec le son et le curseur
synchronisés**, façon [Songsterr](https://www.songsterr.com). On ajoute des morceaux en
uploadant des fichiers Guitar Pro (ou MusicXML), et un espace admin permet de gérer le catalogue.

Le rendu de la tablature, le synthétiseur audio et le curseur synchronisé reposent sur
[alphaTab](https://alphatab.net) (licence MPL-2.0). Le son et la tablature proviennent du même
fichier, donc ils sont synchronisés par construction.

## Fonctionnalités (V1)

- **Catalogue** de morceaux avec recherche et filtre par difficulté.
- **Player** synchronisé : lecture/pause (barre d'espace), stop, curseur, seek au clic.
- Tous les contrôles débloqués : **vitesse** (0.25×–2×), **boucle**, **métronome**, **décompte**,
  **mute / solo / volume par piste**, choix de la **piste affichée**, **zoom**, vue page/horizontale,
  notation tablature / partition / les deux.
- **Admin** (protégé) : ajouter / éditer / supprimer un morceau via upload Guitar Pro / MusicXML.
- **Bibliothèque d'assets** : uploader des soundfonts (.sf2/.sf3) et en associer un à un morceau.

## Stack

- Next.js 16 (App Router, TypeScript) · Tailwind CSS 4
- alphaTab (`@coderline/alphatab`) pour le player
- Prisma + SQLite pour les métadonnées
- NextAuth (Auth.js) — un seul admin, via variables d'environnement
- Fichiers stockés localement dans `storage/`, servis par une route API protégée

## Démarrage

```bash
npm install            # installe + génère Prisma + copie les assets alphaTab
cp .env.example .env   # puis ajuste les identifiants admin
npm run db:migrate     # crée la base SQLite
npm run db:seed        # ajoute un morceau de démo ("Demo Riff")
npm run dev            # http://localhost:3000
```

Identifiants admin par défaut (dans `.env`) : `admin@example.com` / `changeme`.
Connecte-toi via **Connexion admin**, puis **Ajouter une musique**.

## Formats acceptés

- Tablatures : `.gp`, `.gp3`, `.gp4`, `.gp5`, `.gpx`, `.gp7`, `.musicxml`, `.xml`, `.mxl`,
  ainsi que l'AlphaTex (`.alphatab`, `.alphatex`, `.tex`).
- Soundfonts : `.sf2`, `.sf3`.

## Structure

- `src/app` — pages (catalogue, `/song/[id]`, `/admin/*`, `/login`) et routes API.
- `src/components/TabPlayer.tsx` — intégration alphaTab + barre de transport + contrôles de pistes.
- `src/lib` — Prisma, auth, stockage fichiers, formats.
- `scripts/copy-alphatab-assets.mjs` — copie la police Bravura et le soundfont par défaut
  dans `public/alphatab` (lancé automatiquement au `postinstall`).
- `storage/` — fichiers uploadés (ignoré par git).

## Pistes d'évolution (hors V1)

Comptes utilisateurs + favoris/playlists, tuner, manche interactif, éditeur de tablature,
passage à PostgreSQL + stockage cloud, déploiement.

---

Rendered using alphaTab.
