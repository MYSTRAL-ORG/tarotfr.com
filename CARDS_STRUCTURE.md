# Structure des Images de Cartes

## Organisation des fichiers

```
public/img/cards/
├── back-cards.png          # Dos des cartes
├── excuse.png              # L'Excuse (oudler spécial)
├── base/                   # Cartes de base (4 couleurs)
│   ├── hearts/            # Cœur
│   │   ├── 1.png          # As
│   │   ├── 2.png à 10.png # Cartes numérotées
│   │   ├── 11.png         # Valet
│   │   ├── 12.png         # Cavalier
│   │   ├── 13.png         # Dame
│   │   └── 14.png         # Roi
│   ├── diamonds/          # Carreau
│   │   └── (même structure)
│   ├── clubs/             # Trèfle
│   │   └── (même structure)
│   └── spades/            # Pique
│       └── (même structure)
└── trumps/                # Atouts
    ├── 1.png              # Le Petit (oudler)
    ├── 2.png à 20.png     # Atouts intermédiaires
    └── 21.png             # Le Monde (oudler)

```

## Correspondance Cartes / Fichiers

### Cartes de base (4 couleurs × 14 cartes = 56 cartes)

| Rank Type | Fichier | Description |
|-----------|---------|-------------|
| As | 1.png | Carte As |
| 2-10 | 2.png - 10.png | Cartes numérotées |
| Valet | 11.png | Valet |
| Cavalier | 12.png | Cavalier |
| Dame | 13.png | Dame |
| Roi | 14.png | Roi |

### Atouts (21 cartes)

| Numéro | Fichier | Nom spécial |
|--------|---------|-------------|
| 1 | 1.png | Le Petit (oudler) |
| 2-20 | 2.png - 20.png | Atouts |
| 21 | 21.png | Le Monde (oudler) |

### Carte spéciale (L'Excuse)

L'**Excuse** (oudler) a maintenant son image dédiée : `public/img/cards/excuse.png` ✅

Cette carte spéciale ne peut jamais remporter un pli mais permet au joueur de garder la main

## Mapping dans le code

Le composant `TarotCard.tsx` utilise la fonction `getCardImagePath()` pour mapper les cartes du jeu vers les fichiers images :

```typescript
// Couleurs de base
const suitMap = {
  'HEARTS': 'hearts',
  'DIAMONDS': 'diamonds',
  'CLUBS': 'clubs',
  'SPADES': 'spades',
};

// Rangs des cartes de base
const rankMap = {
  '1': '1',           // As
  '2' à '10': '2-10', // Numéros
  'VALET': '11',      // Valet
  'CAVALIER': '12',   // Cavalier
  'DAME': '13',       // Dame
  'ROI': '14',        // Roi
};
```

## Format des images

Les images doivent idéalement :
- Avoir un ratio hauteur/largeur d'environ 1.5:1 (format carte standard)
- Être en PNG pour la transparence
- Avoir une résolution suffisante pour un affichage net

Les tailles de rendu dans l'interface :
- `sm`: 48px × 64px
- `md`: 64px × 96px
- `lg`: 80px × 128px

## Ajout de nouvelles cartes

Pour ajouter ou remplacer une carte :

1. Placer l'image dans le bon dossier selon la structure ci-dessus
2. Respecter le nom de fichier selon le mapping
3. Aucune modification du code n'est nécessaire si vous suivez la convention de nommage

## Dos de carte

Le fichier `back-cards.png` est utilisé pour afficher le dos des cartes quand elles sont face cachée (pendant la distribution, dans la main des adversaires, etc.).
