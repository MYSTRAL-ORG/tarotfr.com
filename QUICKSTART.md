# Quick Start Guide - TarotFR

## Démarrage Rapide

### 1. Installation

```bash
npm install
```

### 2. Lancer l'application

```bash
npm run dev:all
```

Cette commande démarre automatiquement :
- ✅ Le serveur web Next.js (http://localhost:3000)
- ✅ Le serveur WebSocket (port 3001)
- ✅ La base de données est déjà configurée et prête

### 3. Tester l'application

Ouvrez votre navigateur sur `http://localhost:3000`

#### Pour tester une partie complète :

1. **Ouvrez 4 onglets** dans votre navigateur
2. Dans chaque onglet, cliquez sur **"Jouer maintenant"** sur la page d'accueil
3. Chaque joueur sera créé comme invité automatiquement
4. Une fois 4 joueurs connectés, cliquez sur **"Prêt"** pour chaque joueur
5. La partie commence automatiquement !

## Flux du Jeu

1. **Phase d'enchères** : Chaque joueur place son enchère (PASS, PETITE, GARDE, etc.)
2. **Révélation du chien** : Le preneur voit les 6 cartes du chien
3. **Phase de jeu** : Les joueurs jouent leurs cartes à tour de rôle
4. **Scoring** : Les scores sont calculés automatiquement

## Fonctionnalités Disponibles

- ✅ Authentification invité (sans inscription)
- ✅ Authentification par email/mot de passe
- ✅ Création et gestion de tables
- ✅ Jeu en temps réel avec WebSocket
- ✅ Validation automatique des coups
- ✅ Calcul automatique des scores
- ✅ Interface responsive et moderne

## 🎨 Vérification Visuelle

Après le démarrage, vous devriez voir :

### Dans le Header (Navigation)
- ✅ **Icône** (carré rouge avec logo blanc) à gauche
- ✅ **Logo TarotFR** à côté de l'icône
- Les deux sont cliquables et mènent à la page d'accueil

### Sur la Page d'Accueil
- ✅ Cartes avec icônes en **bleu** (#2B99C9) et **rouge** (#BF2F00)
- ✅ Boutons principaux en bleu
- ✅ Étapes numérotées avec cercles bleu/rouge

### L'icône n'apparaît pas ?

**Solutions :**

1. **Hard Refresh du navigateur**
   - Windows/Linux : `Ctrl + Shift + R`
   - Mac : `Cmd + Shift + R`

2. **Vider le cache**
   - F12 → Onglet Application → Clear storage → Clear site data

3. **Redémarrer le serveur**
   ```bash
   # Ctrl+C pour arrêter
   npm run dev:all
   ```

4. **Vérifier dans la console (F12)**
   - Onglet Network → Rafraîchir la page
   - Chercher "icon.png" (devrait être Status 200)

## Dépannage

### Le serveur WebSocket ne se connecte pas

Vérifiez que les deux serveurs sont bien lancés :
```bash
# Dans terminal 1
npm run dev

# Dans terminal 2
npm run dev:ws
```

Ou utilisez :
```bash
npm run dev:all
```

### Erreurs de base de données

La base de données Supabase est déjà provisionnée. Si vous rencontrez des erreurs :
1. Vérifiez que les variables d'environnement dans `.env` sont correctes
2. Vérifiez votre connexion internet

### La page ne se charge pas

1. Assurez-vous que le port 3000 est disponible
2. Redémarrez les serveurs avec `npm run dev:all`
3. Videz le cache de votre navigateur

## Commandes Utiles

```bash
# Démarrer tout (recommandé)
npm run dev:all

# Démarrer uniquement Next.js
npm run dev

# Démarrer uniquement WebSocket
npm run dev:ws

# Builder pour la production
npm run build

# Vérifier les types TypeScript
npm run typecheck
```

## Architecture Simplifiée

```
Frontend (Next.js) → API Routes → Supabase Database
       ↓
WebSocket Server ← → Game Engine
       ↓
Real-time sync entre tous les joueurs
```

## Prochaines Étapes

- Consultez le [README.md](./README.md) pour plus de détails techniques
- Explorez le code dans `/app` pour les pages
- Regardez `/lib/tarotEngine.ts` pour la logique du jeu
- Vérifiez `/server/websocket.ts` pour la synchronisation temps réel

Bon jeu ! 🎴
