# ProjetDev — Jeu d'échecs

Jeu d'échecs jouable directement dans le navigateur, développé en **JavaScript** avec **Tailwind CSS**.

Le projet est réalisé dans le cadre du module FrontEnd au **CPNV**, en équipe de trois étudiants.

## Informations du projet

- **Auteurs :** Samuel Theytaz, Timmy Marendaz, Dani Derdovic
- **Classe :** SI-C3a
- **Durée :** 32 périodes
- **Date :** 17.08.2026
- **Stack :** JavaScript (modules ES) + Tailwind CSS

## Description

L'application permet à deux joueurs de jouer une partie d'échecs complète depuis la même page dans leur navigateur.

Le jeu respecte les règles officielles des échecs, notamment les déplacements légaux des pièces, les règles spéciales ainsi que la détection des différentes situations de fin de partie.

## Fonctionnalités

- Plateau d'échecs interactif
- Affichage des pièces
- Déplacements à la souris
- Gestion des tours entre les joueurs blancs et noirs
- Vérification des déplacements légaux
- Impossibilité de jouer un coup mettant son propre roi en échec
- Détection de l'échec
- Détection de l'échec et mat
- Détection du pat

### Règles spéciales

- Roque
- Prise en passant
- Promotion des pions

## Mode de jeu

Le jeu fonctionne en **local à deux joueurs**.

Les deux joueurs utilisent le même navigateur et jouent chacun leur tour :

1. Les blancs commencent.
2. Le joueur sélectionne une pièce avec la souris.
3. Il sélectionne ensuite une case de destination.
4. Le déplacement est vérifié par le jeu.
5. Si le coup est légal, le tour passe à l'autre joueur.
6. La partie continue jusqu'à un échec et mat, un pat ou une autre condition de fin de partie.

## Technologies

### JavaScript

Le fonctionnement du jeu est réalisé en **JavaScript moderne avec les modules ES**.

JavaScript est notamment utilisé pour :

- gérer le plateau ;
- gérer les pièces ;
- calculer les déplacements possibles ;
- vérifier la légalité des coups ;
- gérer les tours ;
- détecter l'échec ;
- détecter le mat et le pat ;
- gérer les règles spéciales.

### Tailwind CSS

**Tailwind CSS** est utilisé pour réaliser l'interface graphique et la mise en page du jeu.

## Prérequis

Pour lancer ou développer le projet :

- Un navigateur web moderne
- Node.js
- npm

## Installation

Cloner le dépôt :

```bash
git clone <url-du-depot>
cd <nom-du-projet>
```

Installer les dépendances :

```bash
npm install
```

Lancer le projet en développement :

```bash
npm run dev
```

Ouvrir ensuite l'adresse indiquée dans le terminal dans un navigateur.

## Règles principales

Chaque type de pièce possède ses propres déplacements :

- **Pion** — avance vers l'avant et capture en diagonale
- **Tour** — déplacement horizontal ou vertical
- **Cavalier** — déplacement en forme de L
- **Fou** — déplacement en diagonale
- **Dame** — déplacement horizontal, vertical ou diagonal
- **Roi** — déplacement d'une case dans toutes les directions

Un joueur ne peut jamais effectuer un déplacement laissant son propre roi en échec.

## États de la partie

### Échec

Un roi est en échec lorsqu'il est directement menacé par une pièce adverse.

### Échec et mat

Un joueur est en échec et mat lorsque son roi est en échec et qu'aucun coup légal ne permet de sortir de cette situation.

La partie est alors terminée.

### Pat

Un joueur est en situation de pat lorsqu'il :

- n'est pas en échec ;
- ne possède aucun déplacement légal.

La partie se termine alors sur une égalité.

## Règles spéciales

### Roque

Le roque permet de déplacer simultanément le roi et une tour lorsque toutes les conditions nécessaires sont respectées.

### Prise en passant

Un pion peut capturer un pion adverse en passant dans certaines conditions précises après son déplacement initial de deux cases.

### Promotion

Lorsqu'un pion atteint la dernière rangée du plateau, il peut être promu en une autre pièce.

## Objectifs du projet

Ce projet permet de travailler plusieurs notions de développement FrontEnd :

- JavaScript moderne
- Modules ES
- Manipulation du DOM
- Gestion des événements
- Algorithmes
- Logique métier
- Gestion d'état
- Architecture du code
- Interface utilisateur
- Tailwind CSS
- Travail collaboratif avec Git

## Contributeurs

Projet réalisé en équipe :

- **Samuel Theytaz**
- **Timmy Marendaz**
- **Dani Derdovic**

---

Projet réalisé au **CPNV** dans le cadre de la formation CFC Informaticien.
