# Système d'Économie de Jetons - TarotFR

## Vue d'ensemble

Le jeu de tarot a été transformé en un système free-to-play avec économie virtuelle, similaire à Super Tarot. Les joueurs utilisent des jetons pour entrer dans des parties, gagnent ou perdent des jetons selon leur position finale, et progressent via un système XP/Niveaux.

## Caractéristiques Principales

### 1. Système de Jetons

- **Jetons de départ**: Chaque nouveau joueur reçoit 2,000 jetons gratuits
- **Buy-in**: Chaque salle nécessite une mise en jetons pour rejoindre
- **Récompenses**: Distribution basée sur la position finale (1er, 2ème, 3ème, 4ème)
- **Rake**: Le système prend 40% du prize pool

### 2. Salles de Jeu

12 salles réparties en 4 catégories:

#### DÉBUTANT (Niveau 1+)
- **Débutant 1**: 200 jetons - Rewards: 360/120/160
- **Débutant 2**: 500 jetons - Rewards: 900/300/400
- **Débutant 3**: 1,000 jetons - Rewards: 1,800/600/800

#### PRO (Niveaux 5, 10, 15)
- **Pro 1**: 1,200 jetons - Rewards: 2,160/720/960 (Niveau 5)
- **Pro 2**: 2,500 jetons - Rewards: 4,500/1,500/2,000 (Niveau 10)
- **Pro 3**: 5,000 jetons - Rewards: 9,000/3,000/4,000 (Niveau 15)

#### LÉGENDES (Niveaux 25, 35, 50)
- **Légendes 1**: 8,000 jetons - Rewards: 14,400/4,800/6,400 (Niveau 25)
- **Légendes 2**: 10,000 jetons - Rewards: 18,000/6,000/8,000 (Niveau 35)
- **Légendes 3**: 20,000 jetons - Rewards: 36,000/12,000/16,000 (Niveau 50)

#### CYBORG (Niveaux 70, 90, 120)
- **Cyborg 1**: 40,000 jetons - Rewards: 72,000/24,000/32,000 (Niveau 70)
- **Cyborg 2**: 80,000 jetons - Rewards: 144,000/48,000/64,000 (Niveau 90)
- **Cyborg 3**: 150,000 jetons - Rewards: 270,000/90,000/120,000 (Niveau 120)

### 3. Distribution des Récompenses

Basé sur la position finale (déterminée par le score total sur 3 manches):

- **🥇 1ère place**: +180% du buy-in (REWARD 1)
- **🥈 2ème place**: +60% du buy-in (REWARD 2)
- **🥉 3ème place**: +80% du buy-in (DRAW WIN)
- **4️⃣ 4ème place**: -100% du buy-in (perte totale)

**Exemple avec une table à 1,000 jetons:**
- 1er: +1,800 jetons (gagne 800)
- 2ème: +600 jetons (perd 400)
- 3ème: +800 jetons (perd 200)
- 4ème: -1,000 jetons (perd tout)

### 4. Système XP et Niveaux

- **XP gagnés**: Après chaque partie, peu importe le résultat
- **Progression**: Exponentielle (100 → 250 → 500 → 1,000 → ...)
- **Récompenses de niveau**: Jetons bonus à chaque passage de niveau
- **Déblocage**: Nouvelles salles débloquées à certains niveaux

### 5. Points de Ligue

- Gagnés après chaque partie
- Utilisés pour le classement (système à implémenter)
- Varient selon la salle (5 → 2,500 points)

### 6. Boutique

6 packs de jetons disponibles à l'achat:

1. **Pack Découverte**: 1,000 jetons - €2.49
2. **Pack Classique**: 2,200 jetons - €4.99
3. **Pack Gourmet**: 5,000 jetons - €9.99
4. **Pack Prestige**: 16,000 jetons - €29.99
5. **Pack Royal**: 45,000 jetons - €79.99
6. **Pack Élite**: 77,500 jetons - €119.99

## Architecture Technique

### Base de Données

**Tables créées:**

1. `user_wallets` - Portefeuilles des utilisateurs
   - tokens, xp, level, league_points
   - total_tokens_earned, total_tokens_spent, total_tokens_purchased

2. `room_types` - Configuration des 12 salles
   - buy_in, rewards, xp_reward, league_points, min_level

3. `level_config` - Progression XP et récompenses
   - xp_required, reward_tokens, unlocks_room

4. `transactions` - Historique complet
   - type (buy_in, game_win, game_loss, purchase, level_reward)
   - amount, balance_after, metadata

5. `shop_items` - Packs de la boutique
   - tokens, price_eur, price_vnd

6. `purchases` - Historique des achats
   - stripe_payment_id, status, tokens_received

### API Routes

- `/api/rooms/list` - Liste des salles disponibles
- `/api/wallet/[userId]` - Portefeuille d'un joueur
- `/api/shop/items` - Packs disponibles
- `/api/game/end` - Distribution des récompenses
- `/api/tables/create` - Création de table avec room_type_id
- `/api/tables/[id]/join` - Déduction du buy-in

### Pages

- `/jouer` - Nouveau lobby avec slider de salles
- `/shop` - Boutique de jetons
- `/table/[id]` - Page de jeu (à mettre à jour)

### Composants

- `Navigation` - Header avec jetons et niveau
- `GameEndScreen` - Écran de fin avec récompenses
- `RoundSummary` - Résumé de manche (existant)

## Flux de Jeu

1. **Connexion**: Le joueur reçoit 2,000 jetons à l'inscription
2. **Lobby**: Choix d'une salle selon niveau et jetons disponibles
3. **Entrée**: Déduction automatique du buy-in
4. **Partie**: 3 manches de tarot classique
5. **Fin de partie**: Distribution des récompenses selon position
6. **Progression**: Gain d'XP et points de ligue
7. **Achat**: Si jetons insuffisants, redirection vers boutique

## Sécurité

- **RLS activé** sur toutes les tables
- **Validation côté serveur** des transactions
- **Logs complets** dans la table transactions
- **Service role** pour les opérations de jeu
- **Pas d'exposition** des clés API côté client

## Stripe Integration

Instructions complètes dans `STRIPE_SETUP.md`:

1. Créer compte Stripe
2. Configurer webhook
3. Ajouter clés dans `.env`
4. Créer produits dans Stripe Dashboard
5. Implémenter routes `/api/stripe/checkout` et `/api/stripe/webhook`

## Prochaines Étapes

1. **Système de Ligues**: Classement hebdomadaire avec récompenses
2. **Tournois**: Événements spéciaux avec buy-in
3. **Missions**: Objectifs quotidiens/hebdomadaires
4. **Tables à 5 joueurs**: Variante du jeu
5. **Avatars et badges**: Personnalisation
6. **Système de parrainage**: Bonus pour inviter des amis

## Notes Importantes

- Les jetons ne peuvent PAS être reconvertis en argent réel
- Le système est conçu pour être équitable et anti-triche
- Toutes les transactions sont auditables
- La progression est basée uniquement sur le jeu et l'achat

## Support

Pour toute question sur l'économie du jeu:
1. Vérifier les logs dans la table `transactions`
2. Consulter le wallet dans `user_wallets`
3. Vérifier les policies RLS si problème d'accès
