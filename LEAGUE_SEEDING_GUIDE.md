# Guide pour simuler des joueurs dans les ligues

## Problème

La page `/ligues` nécessite des joueurs réels pour afficher le classement. Actuellement, la table `league_memberships` a une contrainte de clé étrangère vers `auth.users`, ce qui empêche la création de données factices sans authentification complète.

## Solution

Pour créer des joueurs de test, vous avez besoin de la **clé Service Role** de Supabase.

### Étape 1: Obtenir la clé Service Role

1. Allez sur votre projet Supabase: https://supabase.com/dashboard/project/amwwthdjnsnociqbodtz
2. Cliquez sur **Settings** (Paramètres) dans la barre latérale
3. Cliquez sur **API**
4. Copiez la clé **service_role key** (⚠️ Cette clé est sensible, ne la partagez jamais publiquement!)

### Étape 2: Ajouter la clé à votre fichier .env

Ajoutez cette ligne à votre fichier `.env`:

```
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key_ici
```

### Étape 3: Exécuter le script de seeding

Une fois la clé ajoutée, exécutez:

```bash
node scripts/seed-league-players.js
```

Ce script va:
- Créer 30 utilisateurs fictifs avec des noms uniques (AlphaKing, BetaMaster, etc.)
- Les assigner à la Ligue 1, Division 1
- Leur attribuer des points aléatoires (0-1000)
- Créer leurs wallets avec 2000 tokens

### Étape 4: Voir le résultat

Visitez `/ligues` pour voir le classement complet avec les 30 joueurs!

## Alternative sans Service Role

Si vous ne pouvez pas obtenir la service_role key, vous pouvez:

1. Créer manuellement des comptes utilisateurs via l'interface Supabase
2. Ou jouer plusieurs parties pour accumuler des points naturellement
3. Ou attendre que des vrais joueurs rejoignent le jeu

## Script SQL de nettoyage

Si vous voulez supprimer les données de test plus tard:

```sql
-- Supprime tous les joueurs de test
DELETE FROM auth.users WHERE email LIKE 'fake%@league.test';
```

Cela supprimera automatiquement toutes les données associées (wallets, memberships) grâce aux contraintes `ON DELETE CASCADE`.
