# TarotFR - Jeu de Tarot en Ligne

Une application web moderne pour jouer au Tarot à 4 joueurs en temps réel.

## Fonctionnalités

- ✅ Parties en temps réel via WebSocket
- ✅ Authentification avec comptes invités
- ✅ Interface responsive et moderne
- ✅ Règles officielles du Tarot français
- ✅ Système d'enchères complet
- ✅ Calcul automatique des scores
- ✅ Moteur de jeu avec validation des coups
- ✅ Vraies images de cartes de Tarot français
- ✅ Logo et branding personnalisés
- ✅ **Joueurs bots avec 3 niveaux de difficulté (Faible, Moyen, Fort)**

## Stack Technique

- **Frontend**: Next.js 13 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, WebSocket Server (Node.js + ws)
- **Base de données**: Supabase (PostgreSQL)
- **UI**: shadcn/ui, Lucide Icons
- **Temps réel**: WebSocket custom avec reconnexion automatique

## Installation

1. Installez les dépendances :
```bash
npm install
```

2. Les variables d'environnement sont déjà configurées dans `.env`

3. La base de données Supabase est déjà provisionnée avec le schéma complet

## Développement

### Option 1 : Démarrer les deux serveurs ensemble (Recommandé)

```bash
npm run dev:all
```

Cette commande démarre simultanément :
- Le serveur Next.js sur `http://localhost:3000`
- Le serveur WebSocket sur le port `3001`

### Option 2 : Démarrer les serveurs séparément

**Terminal 1** - Next.js :
```bash
npm run dev
```

**Terminal 2** - WebSocket :
```bash
npm run dev:ws
```

**Important** : Les deux serveurs doivent tourner simultanément pour que l'application fonctionne complètement.

## Scripts Disponibles

- `npm run dev:all` - Démarre Next.js + WebSocket simultanément (recommandé)
- `npm run dev` - Démarre uniquement le serveur de développement Next.js
- `npm run dev:ws` - Démarre uniquement le serveur WebSocket
- `npm run build` - Crée un build de production
- `npm run start` - Démarre le serveur de production
- `npm run lint` - Vérifie le code avec ESLint
- `npm run typecheck` - Vérifie les types TypeScript

## Architecture

### Structure du Projet

```
/app                    # Pages Next.js (App Router)
  /api                  # API Routes
    /auth               # Endpoints d'authentification
    /tables             # Endpoints de gestion des tables
  /account              # Page de compte utilisateur
  /play                 # Lobby et liste des tables
  /rules                # Page des règles
  /table/[id]           # Interface de jeu
/components             # Composants React réutilisables
  /game                 # Composants spécifiques au jeu
  /ui                   # Composants UI shadcn
/contexts               # Contextes React (Auth, WebSocket)
/lib                    # Utilitaires et logique métier
  /auth.ts              # Fonctions d'authentification
  /supabase.ts          # Client Supabase
  /tarotEngine.ts       # Moteur de jeu Tarot
  /types.ts             # Types TypeScript
/server                 # Serveur WebSocket
```

### Base de Données

Le schéma inclut :
- **users** : Profils utilisateurs
- **guest_sessions** : Sessions invités temporaires
- **tables** : Tables de jeu
- **table_players** : Association joueurs-tables
- **games** : États de partie
- **game_events** : Historique des événements

### Flux de Jeu

1. **Lobby** : Les joueurs rejoignent une table (4 joueurs requis)
   - Possibilité d'ajouter des bots pour compléter la table
   - 3 niveaux de difficulté : Faible, Moyen, Fort
2. **Distribution** : Les cartes sont distribuées automatiquement
3. **Enchères** : Chaque joueur enchérit à tour de rôle
   - Les bots enchérissent automatiquement selon leur niveau
4. **Révélation du chien** : Le preneur voit et intègre le chien
5. **Jeu** : Les joueurs jouent leurs cartes à tour de rôle
   - Les bots jouent automatiquement avec un délai d'1 seconde
6. **Scoring** : Les scores sont calculés automatiquement

## Moteur de Jeu

Le moteur de jeu (`lib/tarotEngine.ts`) implémente :

- ✅ Création et mélange du jeu de 78 cartes
- ✅ Distribution des cartes (18 par joueur + 6 pour le chien)
- ✅ Validation des enchères
- ✅ Règles de jeu (fournir, couper, surcouper)
- ✅ Détermination du gagnant du pli
- ✅ Calcul des points avec oudlers
- ✅ Gestion de l'Excuse

## WebSocket Protocol

### Messages Client → Serveur

- `JOIN_TABLE` : Rejoindre une table
- `LEAVE_TABLE` : Quitter une table
- `READY` : Signaler qu'on est prêt
- `BID` : Placer une enchère
- `PLAY_CARD` : Jouer une carte
- `PING` : Heartbeat

### Messages Serveur → Client

- `TABLE_STATE` : État de la table
- `GAME_STATE` : État du jeu
- `PLAYER_JOINED` : Un joueur a rejoint
- `PLAYER_LEFT` : Un joueur a quitté
- `BID_PLACED` : Une enchère a été placée
- `CARD_PLAYED` : Une carte a été jouée
- `TRICK_COMPLETE` : Un pli est terminé
- `GAME_PHASE_CHANGE` : Changement de phase
- `ERROR` : Erreur
- `PONG` : Réponse au ping

## Authentification

L'application supporte :

- **Comptes invités** : Créés automatiquement avec un pseudo aléatoire
- **Comptes permanents** : Email/mot de passe via Supabase Auth
- **Conversion** : Les invités peuvent créer un compte permanent (à implémenter)

## Joueurs Bots

Le jeu inclut maintenant un système de bots IA avec 3 niveaux de difficulté :

### Faible
- Joue de manière aléatoire
- Stratégie minimale
- Idéal pour les débutants

### Moyen
- Évalue sa main
- Joue stratégiquement
- Respecte les règles de base

### Fort
- Stratégie avancée
- Analyse complète du jeu
- Compte les atouts et oudlers
- Optimise chaque coup

**Utilisation** :
1. Sur la page d'une table, utilisez le panneau "Joueurs Bots"
2. Sélectionnez le niveau de difficulté
3. Cliquez sur "Ajouter un bot"
4. Les bots jouent automatiquement leurs tours

## Prochaines Étapes (V2)

- [ ] Implémenter l'écart du chien
- [ ] Ajouter les primes (Petit au bout, Poignée, Chelem)
- [ ] Système de chat en jeu
- [ ] Historique complet des parties
- [ ] Statistiques avancées
- [ ] Système de matchmaking
- [ ] Mode spectateur
- [ ] Tournois et classements

## Contribution

Le code est organisé de manière modulaire pour faciliter les extensions futures.

## License

MIT
