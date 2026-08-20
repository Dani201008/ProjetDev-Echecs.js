# Architecture - Jeu d'échecs

Objectif : un code clair, bien séparé et facile à faire évoluer, sans complexité inutile.

## 1. Règle de dépendance

```
  ui / persistence   ->   app   ->   domain
     (adaptateurs)      (partie)     (règles pures)

  Les flèches se lisent « dépend de ». Tout pointe vers le cœur.
  domain n'importe rien des autres couches (aucune référence au navigateur).
```

## 2. Les trois couches

| Couche | Rôle | Dépend de |
|---|---|---|
| domain | Règles du jeu : plateau, pièces, coups légaux, échec/mat/pat, notation. Pur et déterministe. | rien |
| app | Déroulement d'une partie : `Game` (historique, coups légaux, undo/redo). Prévient l'interface quand l'état change. | domain |
| ui / persistence | Affichage et sauvegarde. | app + domain |

## 3. Modèle du domaine

Objets immuables et simples :

```
Piece    = { type, color }
Square   = { file, rank }          // 'e4' <-> { file:4, rank:3 }
Move     = { from, to, promotion?, flag }
Position = { board, sideToMove, castling, enPassant, halfmoveClock, fullmove }  // = un FEN
```

`Position` reprend les champs d'un FEN : la sauvegarde et les tests en deviennent simples.

## 4. Génération des coups

1. Coups pseudo-légaux : une fonction par type de pièce (`domain/movement/`). Ajouter une pièce = ajouter un fichier.
2. Filtrage : on retire les coups qui laissent son roi en échec, et on ajoute roque / prise en passant / promotion (`moveGenerator.js`).
3. État de partie : échec, mat, pat, nulles (`rules.js`).

## 5. Interface et logique

La partie (`Game`) est le modèle. L'interface :

- lit `game.position` pour dessiner,
- appelle `game.play(move)` quand l'utilisateur joue,
- s'abonne via `game.subscribe(...)` pour se redessiner.

Aucune règle ne vit dans l'interface ; elle affiche et transmet des coups.

## 6. Structure des dossiers

```
src/
  main.js                  assemble la partie et les vues
  style.css                @import "tailwindcss";
  domain/
    color.js  piece.js  square.js  move.js
    position.js            état = un FEN ; applyMove pur -> nouvelle position
    movement/              une fonction de déplacement par pièce
      index.js  ray.js  pawn.js  knight.js  bishop.js  rook.js  queen.js  king.js
    moveGenerator.js       pseudo-légal -> légal (+ roque / e.p. / promotion)
    rules.js               échec, mat, pat, matériel insuffisant
    notation/  fen.js  san.js  pgn.js
  app/
    game.js                historique + coups légaux + undo/redo + abonnement
  ui/
    boardView.js           dessine le plateau, capture les clics
    statusView.js          trait, échec, résultat
    pieces.js              glyphes des pièces
  persistence/
    storage.js             sauvegarde / chargement (FEN/PGN) - optionnel
tests/                     domain, movement, moveGenerator, rules, notation, perft
```

## 7. Tests

Le cœur est pur : il se teste sans navigateur, avec Vitest. Tests unitaires par module, et validation de la génération des coups par perft (références depuis la position initiale : 20, 400, 8902, 197281 aux profondeurs 1 à 4).

## 8. Travail à 3

On fige d'abord ensemble les formes de `Position` et `Move`, puis :

- Membre 1 - domain : position, pièces, movement, moveGenerator.
- Membre 2 - domain : roque / e.p. / promotion, échec/mat/pat, notation (fen/san/pgn).
- Membre 3 - app + ui : game, affichage, intégration.

Git : `main` protégée, une branche par module, revues croisées.

## 9. Ajouter une fonctionnalité

| Ajout | Où |
|---|---|
| Nouvelle pièce / variante | un fichier dans `domain/movement/` + `movement/index.js` |
| Sauvegarde / chargement | `persistence/` via FEN/PGN |
| Autre interface | un nouvel adaptateur dans `ui/` ; le cœur est réutilisé |

## 10. Ordre de construction

1. Objets du domaine + `position` + `fen` (avec tests d'aller-retour).
2. `movement/` + `moveGenerator` (validé par perft).
3. `rules` : échec, mat, pat, nulles.
4. `app/game` puis `ui` (affichage) -> jouable.
5. `san` / `pgn`, puis sauvegarde (optionnel).
