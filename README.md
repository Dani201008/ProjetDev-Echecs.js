# Jeu d'échecs

Projet de 3ᵉ année CFC, module FrontEnd (CPNV). Classe : SI-C3a.

Jeu jouable à deux dans le navigateur, avec un moteur de règles indépendant de l'affichage.

## Auteurs

- **Samuel Theytaz** : moteur, génération des coups légaux (`domain/movement/`, `moveGenerator.js`), notation FEN / SAN / PGN (`domain/notation/`) et sauvegarde (`persistence/`)
- **Timmy Marendaz** : règles de fin de partie, échec, mat, pat et nulles (`rules.js`), et pendule (`app/timer.js`)
- **Dani Derdovic** : interface et déroulement de la partie (`ui/`, `app/game.js`, `main.js`)

## Fonctionnalités

- Partie à deux sur le même écran, tour par tour
- Coups légaux affichés quand on sélectionne une pièce
- Toutes les règles : roque, prise en passant, promotion, échec, mat, pat et nulles (matériel insuffisant, 50 coups, triple répétition)
- Pendule de 10 minutes par joueur, avec pause
- Pièces prises affichées, plateau retournable
- Sauvegarde et chargement de la partie (format PGN, dans le navigateur)

## Démarrer

```bash
npm install      # installe les dépendances
npm run dev      # serveur de développement
npm run test     # tests (Vitest)
npm run build    # build de production
```

## Architecture (résumé)

Trois couches, les dépendances pointant toujours vers le cœur :

- `src/domain/` : cœur pur, plateau, pièces, coups, règles, notation (aucune dépendance au navigateur).
- `src/app/` : la partie (`Game` : historique, coups légaux, annulation) et la pendule (`ChessTimer`), qui préviennent l'interface via un abonnement.
- `src/ui/`, `src/persistence/` : adaptateurs (affichage, sauvegarde).

Détail et justifications dans `ARCHITECTURE.md`.

## Conventions (à respecter par toute l'équipe)

- **Règle de dépendance** : `domain/` n'importe jamais `app/` ni `ui/`. Le cœur ne connaît pas le navigateur.
- **Sans état = fonction, avec état = classe** : `domain/` = fonctions pures ; `app/` = classes (`Game`, `ChessTimer`).
- **Une pièce = un fichier** dans `domain/movement/`.

## Ajouter une fonctionnalité (où toucher)

- **Nouvelle pièce / variante** : un fichier dans `domain/movement/` + l'inscrire dans `domain/movement/index.js`.
- **Sauvegarde / chargement** : `src/persistence/`, via la notation PGN de `domain/notation/`.
- **Autre interface** (mobile, autre techno) : un nouvel adaptateur dans `src/ui/`. Le cœur est réutilisé tel quel.
