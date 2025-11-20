# Système de nettoyage des tables

Ce projet inclut un système automatique de nettoyage des tables inactives pour éviter l'accumulation de tables obsolètes dans la base de données.

## Fonctionnement

Le système supprime automatiquement :
- Les tables avec le statut `WAITING` créées il y a plus d'**1 heure**
- Les tables avec le statut `PLAYING` créées il y a plus de **3 heures**
- Tous les enregistrements `table_players` associés

## Méthodes de nettoyage

### 1. Script manuel (développement/débogage)

Exécutez le script de nettoyage manuellement :

```bash
npm run cleanup:tables
```

Ce script se trouve dans `scripts/cleanup-tables.js` et peut être exécuté à tout moment pour nettoyer les tables inactives.

### 2. Edge Function Supabase (production)

Une Edge Function Supabase est disponible dans `supabase/functions/cleanup-tables/index.ts`.

#### Déploiement de la fonction

Pour déployer la fonction, utilisez l'outil MCP Supabase :

```typescript
// La fonction est déjà créée dans supabase/functions/cleanup-tables/
// Elle peut être déployée via l'outil mcp__supabase__deploy_edge_function
```

#### Appeler la fonction manuellement

Une fois déployée, vous pouvez appeler la fonction via HTTP :

```bash
curl -X POST \
  https://[votre-projet].supabase.co/functions/v1/cleanup-tables \
  -H "Authorization: Bearer [votre-anon-key]"
```

#### Configuration d'un cron job (recommandé)

Pour un nettoyage automatique, configurez un cron job qui appelle cette fonction périodiquement :

**Sur VPS (avec crontab) :**

```bash
# Éditer le crontab
crontab -e

# Ajouter cette ligne pour exécuter toutes les heures
0 * * * * curl -X POST https://[votre-projet].supabase.co/functions/v1/cleanup-tables -H "Authorization: Bearer [votre-anon-key]" > /dev/null 2>&1
```

**Avec GitHub Actions :**

```yaml
name: Cleanup Tables
on:
  schedule:
    - cron: '0 * * * *'  # Toutes les heures
  workflow_dispatch:

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - name: Call cleanup function
        run: |
          curl -X POST \
            ${{ secrets.SUPABASE_URL }}/functions/v1/cleanup-tables \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}"
```

**Avec un service externe (comme cron-job.org) :**

1. Créez un compte sur https://cron-job.org
2. Créez un nouveau cron job
3. URL : `https://[votre-projet].supabase.co/functions/v1/cleanup-tables`
4. Méthode : POST
5. Headers : `Authorization: Bearer [votre-anon-key]`
6. Fréquence : Toutes les heures

## Vérification

Après l'exécution du nettoyage, vous recevrez une réponse JSON :

```json
{
  "success": true,
  "message": "Cleaned up 5 inactive tables",
  "deletedTables": 5,
  "waitingTablesFound": 5,
  "playingTablesFound": 0
}
```

## Notes importantes

- Les tables actives ne sont jamais supprimées
- Les données des parties terminées sont préservées dans la table `games`
- Le nettoyage ne supprime que les tables en attente ou abandonnées
- Les joueurs (bots ou humains) ne sont pas supprimés de la table `users`
