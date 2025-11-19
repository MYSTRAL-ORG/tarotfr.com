# Guide de Déploiement - TarotFR

## ✅ Prérequis

Le projet est maintenant correctement configuré pour le déploiement avec :

- ✅ `netlify.toml` - Configuration Netlify
- ✅ `vercel.json` - Configuration Vercel
- ✅ `public/favicon.ico` - Favicon pour éviter les 404
- ✅ Build Next.js propre et optimisé
- ✅ Variables d'environnement configurées dans `.env`

## 🚀 Déploiement sur Vercel (Recommandé)

Vercel est la plateforme officielle pour Next.js et offre la meilleure compatibilité.

### Étapes :

1. **Connexion à Vercel**
   - Allez sur [vercel.com](https://vercel.com)
   - Connectez-vous avec GitHub/GitLab/Bitbucket

2. **Importer le projet**
   - Cliquez sur "New Project"
   - Sélectionnez votre repository Git
   - Vercel détectera automatiquement Next.js

3. **Variables d'environnement**
   Dans les settings du projet Vercel, ajoutez :
   ```
   NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key
   SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key
   ```

4. **Déployer**
   - Cliquez sur "Deploy"
   - Vercel va automatiquement :
     - Installer les dépendances
     - Build le projet avec `npm run build`
     - Déployer sur leur CDN global

5. **URL de production**
   - Votre site sera disponible sur `https://votre-projet.vercel.app`
   - Vous pouvez configurer un domaine personnalisé

## 🌐 Déploiement sur Netlify

### Étapes :

1. **Connexion à Netlify**
   - Allez sur [netlify.com](https://netlify.com)
   - Connectez-vous avec GitHub/GitLab/Bitbucket

2. **Importer le projet**
   - Cliquez sur "Add new site" → "Import an existing project"
   - Sélectionnez votre repository

3. **Configuration du build**
   La configuration est automatique grâce à `netlify.toml` :
   ```toml
   [build]
     command = "npm run build"
     publish = ".next"

   [[plugins]]
     package = "@netlify/plugin-nextjs"
   ```

4. **⚠️ Variables d'environnement (OBLIGATOIRE)**

   **IMPORTANT** : Sans ces variables, l'application ne fonctionnera pas !

   Allez dans : **Site settings → Environment variables → Add a variable**

   Ajoutez ces 2 variables :

   ```
   NEXT_PUBLIC_SUPABASE_URL
   Valeur: https://amwwthdjnsnociqbodtz.supabase.co

   NEXT_PUBLIC_SUPABASE_ANON_KEY
   Valeur: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtd3d0aGRqbnNub2NpcWJvZHR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0NDAxNzAsImV4cCI6MjA3OTAxNjE3MH0.y7624P1g_GfqvXAGXJbmib1coM_UGPyNbMd7La4GD-U
   ```

   **Attention** :
   - Les variables doivent être ajoutées AVANT le premier déploiement
   - Si vous avez déjà déployé, ajoutez les variables puis cliquez sur "Trigger deploy" pour redéployer

5. **Déployer**
   - Cliquez sur "Deploy site"
   - Le site sera disponible sur `https://votre-site.netlify.app`

6. **Vérifier le déploiement**
   - Allez sur votre site
   - Ouvrez la console (F12)
   - Vous ne devriez PAS voir "Supabase URL is not configured"
   - Si vous voyez cette erreur, retournez à l'étape 4

## 🔧 Configuration WebSocket en Production

⚠️ **Important** : Le serveur WebSocket (`server/websocket.ts`) ne peut pas être déployé sur Vercel/Netlify car ils ne supportent pas les WebSockets persistants.

### Solutions pour WebSocket en production :

#### Option 1 : Utiliser Supabase Realtime (Recommandé)

Remplacez le WebSocket par Supabase Realtime qui est déjà inclus :

```typescript
// Pas besoin de WebSocket séparé
// Supabase Realtime fonctionne directement dans le navigateur
const channel = supabase.channel('game-room')
  .on('broadcast', { event: 'game-update' }, (payload) => {
    // Gérer les mises à jour
  })
  .subscribe()
```

#### Option 2 : Déployer WebSocket séparément

Déployez le serveur WebSocket sur :
- **Railway.app** - Gratuit pour commencer
- **Render.com** - Supporte les WebSockets
- **Heroku** - Option payante mais fiable
- **AWS EC2** - Plus complexe mais flexible

Exemple pour Railway :
1. Créez un fichier `Procfile` :
   ```
   web: npm run dev:ws
   ```
2. Poussez sur Railway
3. Mettez à jour `NEXT_PUBLIC_WS_URL` dans les variables d'environnement

#### Option 3 : Tout migrer vers Supabase Realtime

C'est la solution la plus simple. Supabase Realtime remplace complètement le besoin d'un serveur WebSocket séparé.

## 🐛 Résolution des problèmes

### "Page not found" en production

✅ **Résolu** : Les fichiers `netlify.toml` et `vercel.json` sont configurés correctement.

### Erreur 404 sur `/favicon.ico`

✅ **Résolu** : Le fichier `public/favicon.ico` a été créé.

### CSS cassé en production

**Causes possibles :**

1. **Cache navigateur**
   - Faire un hard refresh : `Ctrl + Shift + R`
   - Vider le cache complètement

2. **Build non terminé**
   - Vérifier les logs de déploiement
   - S'assurer que `npm run build` a réussi

3. **Variables d'environnement manquantes**
   - Vérifier que toutes les variables sont définies
   - Redéployer après avoir ajouté les variables

### Images ne se chargent pas

Les images sont dans `/public/img/` et sont servies depuis `/img/` :
- ✅ Correct : `src="/img/icon.png"`
- ❌ Incorrect : `src="/public/img/icon.png"`

Next.js avec `images.unoptimized = true` sert les images sans optimisation, ce qui est compatible avec tous les hébergeurs.

## 📊 Checklist de déploiement

Avant de déployer, vérifiez :

- [ ] `npm run build` fonctionne sans erreur
- [ ] `npm run typecheck` ne retourne aucune erreur
- [ ] Les variables d'environnement sont définies
- [ ] Le fichier `.env` n'est PAS commité (dans `.gitignore`)
- [ ] `public/favicon.ico` existe
- [ ] Les images sont dans `public/img/`
- [ ] Configuration Netlify/Vercel présente

## 🎯 Après le déploiement

1. **Testez toutes les pages** :
   - `/` - Page d'accueil
   - `/play` - Liste des tables
   - `/rules` - Règles du jeu
   - `/account` - Connexion

2. **Vérifiez la console du navigateur** (F12)
   - Pas d'erreurs JavaScript
   - Pas de ressources 404
   - CSS chargé correctement

3. **Testez l'authentification**
   - Connexion invité
   - Connexion email/mot de passe

4. **Testez une partie**
   - Créer une table
   - Rejoindre avec plusieurs joueurs
   - Vérifier les mises à jour en temps réel

## 🔐 Sécurité

⚠️ **Important** :

- Ne committez JAMAIS le fichier `.env`
- Ne partagez JAMAIS votre `SUPABASE_SERVICE_ROLE_KEY`
- Utilisez des variables d'environnement pour toutes les clés sensibles
- Activez RLS (Row Level Security) sur toutes les tables Supabase

## 📚 Ressources

- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation Vercel](https://vercel.com/docs)
- [Documentation Netlify](https://docs.netlify.com)
- [Documentation Supabase](https://supabase.com/docs)

---

Bon déploiement ! 🚀
