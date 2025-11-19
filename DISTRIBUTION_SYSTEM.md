# Système de Distribution avec Seed

## Vue d'ensemble

Ce système garantit l'équité et la traçabilité de toutes les distributions de cartes dans le jeu de Tarot. Chaque partie utilise un code unique généré à partir d'un seed déterministe, permettant aux joueurs de vérifier la distribution après la partie.

## Fonctionnalités Principales

### 1. Génération Déterministe

Chaque distribution est créée à partir de deux nombres:
- **Numéro de Distribution**: Un nombre aléatoire unique (0 à 1 trillion)
- **Numéro de Séquence**: Un nombre aléatoire de validation (0 à 100 milliards)

Ces deux nombres génèrent un **Code Hash** alphanumérique court (8 caractères) qui identifie de manière unique la distribution.

### 2. Code de Distribution Visible

Pendant une partie, le code hash est affiché en haut de l'écran de jeu:
- Visible par tous les joueurs
- Copiable en un clic
- Reste accessible tout au long de la partie

### 3. Vérification Post-Partie

Une fois la partie terminée, les joueurs peuvent:
- Consulter toutes les mains distribuées (4 joueurs + chien)
- Vérifier que le code correspond à la distribution réelle
- Partager le code pour permettre à d'autres de vérifier

### 4. Back-Office Administrateur

Un espace d'administration complet pour:
- Visualiser toutes les distributions créées
- Suivre les statistiques d'utilisation
- Analyser les patterns de jeu
- Gérer les paramètres système

## Utilisation

### Pour les Joueurs

1. **Pendant la Partie**
   - Le code s'affiche automatiquement en haut de l'écran
   - Notez-le si vous souhaitez vérifier la distribution plus tard
   - Cliquez sur l'icône de copie pour copier le code

2. **Après la Partie**
   - Allez sur `/distributions`
   - Entrez le code de distribution
   - Consultez toutes les mains et le chien

### Pour les Administrateurs

1. **Accès au Back-Office**
   - Accédez à `/admin`
   - Seuls les utilisateurs dans la table `admin_users` peuvent y accéder

2. **Ajout d'un Administrateur**
   ```sql
   INSERT INTO admin_users (user_id, role)
   VALUES ('user-uuid-here', 'admin');
   ```

3. **Dashboard**
   - Statistiques en temps réel
   - Nombre total de distributions
   - Distributions utilisées
   - Parties jouées

4. **Liste des Distributions**
   - Voir toutes les distributions
   - Rechercher par code, numéro ou séquence
   - Accéder aux détails de chaque distribution

## Architecture Technique

### Composants Principaux

1. **lib/seedRandom.ts**
   - Générateur pseudo-aléatoire déterministe
   - Garantit la reproductibilité des distributions

2. **lib/distributionSeeder.ts**
   - Génération des numéros de distribution/séquence
   - Création du code hash
   - Distribution des cartes avec seed

3. **Database: card_distributions**
   - Stockage de toutes les distributions
   - Métadonnées: numéros, hash, ordre du deck
   - Compteur d'utilisation

4. **WebSocket Server**
   - Génère une distribution au démarrage de chaque partie
   - Enregistre dans la base de données
   - Envoie le code aux clients

### Sécurité

- Les distributions sont immuables une fois créées
- RLS activé sur toutes les tables
- Les détails des mains ne sont visibles qu'après la fin de la partie
- Logs d'administration pour tracer toutes les actions

## API Routes

### Public

- `POST /api/distributions/generate` - Génère une nouvelle distribution
- `GET /api/distributions/[hashCode]` - Récupère une distribution par son code
- `POST /api/distributions/validate` - Vérifie si un code existe

### Admin

- Toutes les routes admin nécessitent une authentification admin
- Les accès sont vérifiés via la table `admin_users`

## Base de Données

### Tables Créées

1. **card_distributions**
   - Stocke toutes les distributions générées
   - Contient le deck complet ordonné en JSONB

2. **admin_users**
   - Liste des administrateurs du système
   - Rôles: 'admin' ou 'moderator'

3. **admin_logs**
   - Journal de toutes les actions administratives
   - Traçabilité complète

4. **system_settings**
   - Paramètres configurables du système
   - Durée de rétention, limites, etc.

## Garanties

1. **Équité**: Chaque distribution est générée de manière aléatoire mais reproductible
2. **Traçabilité**: Chaque partie a un code unique vérifiable
3. **Transparence**: Les joueurs peuvent vérifier après coup
4. **Sécurité**: Les détails ne sont pas accessibles pendant la partie
5. **Performance**: Les distributions sont pré-calculées et mises en cache

## Maintenance

### Vérification de l'Intégrité

Pour vérifier qu'une distribution est valide:
```typescript
import { validateHashCode, dealCardsWithSeed } from '@/lib/distributionSeeder';

const isValid = validateHashCode(
  hashCode,
  BigInt(distributionNumber),
  BigInt(sequenceNumber)
);
```

### Nettoyage

Les distributions inutilisées peuvent être nettoyées après un certain temps (configurable via `system_settings`).

## Support

Pour toute question ou problème:
1. Consultez les logs dans la table `admin_logs`
2. Vérifiez les statistiques dans le dashboard admin
3. Analysez les distributions suspectes via l'interface admin
