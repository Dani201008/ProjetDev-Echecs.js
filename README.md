# Jeu d'échecs

Projet de 3ᵉ année CFC

Jeu jouable à deux dans le navigateur, avec un moteur de règles indépendant de l'affichage.

## Démarrer

```bash
npm install -D vite vitest tailwindcss @tailwindcss/vite
npm run dev      # serveur de développement
npm run test     # tests (Vitest)
npm run build    # build de production
```

## Architecture (résumé)

Trois couches, les dépendances pointant toujours vers le cœur :

- `src/domain/` - cœur pur : plateau, pièces, coups, règles, notation (aucune dépendance au navigateur).
- `src/app/` - la partie : historique, coups légaux, undo/redo (prévient l'interface via un abonnement).
- `src/ui/`, `src/persistence/` - adaptateurs (affichage, sauvegarde).

Détail et justifications dans `ARCHITECTURE.md`.

## Conventions (à respecter par toute l'équipe)

- **Règle de dépendance** : `domain/` n'importe jamais `app/` ni `ui/`. Le cœur ne connaît pas le navigateur.
- **Sans état → fonction, avec état → classe** : `domain/` = fonctions pures ; `app/` = classe (`Game`).
- **Une pièce = un fichier** dans `domain/movement/`.

## Ajouter une fonctionnalité (où toucher)

- **Nouvelle pièce / variante** → un fichier dans `domain/movement/` + l'inscrire dans `domain/movement/index.js`.
- **Sauvegarde / chargement** → `src/persistence/`, via la notation FEN/PGN.
- **Autre interface** (mobile, autre techno) → un nouvel adaptateur dans `src/ui/`. Le cœur est réutilisé tel quel.
