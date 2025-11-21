# Configuration Stripe

## Étape 1: Créer un compte Stripe

1. Rendez-vous sur https://dashboard.stripe.com/register
2. Créez votre compte Stripe
3. Accédez à votre dashboard

## Étape 2: Récupérer les clés API

1. Dans le dashboard Stripe, allez dans **Developers > API Keys**
2. Copiez votre **Secret Key** (commence par `sk_test_` ou `sk_live_`)
3. Copiez votre **Publishable Key** (commence par `pk_test_` ou `pk_live_`)

## Étape 3: Ajouter les clés dans votre .env

Ajoutez ces lignes dans votre fichier `.env`:

```env
STRIPE_SECRET_KEY=sk_test_votre_cle_secrete_ici
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_votre_cle_publique_ici
```

## Étape 4: Installer Stripe SDK

```bash
npm install stripe @stripe/stripe-js
```

## Étape 5: Créer les produits dans Stripe

Dans votre dashboard Stripe, créez 6 produits correspondant aux packs de jetons:

1. **Pack Découverte** - 1,000 jetons - €2.49
2. **Pack Classique** - 2,200 jetons - €4.99
3. **Pack Gourmet** - 5,000 jetons - €9.99
4. **Pack Prestige** - 16,000 jetons - €29.99
5. **Pack Royal** - 45,000 jetons - €79.99
6. **Pack Élite** - 77,500 jetons - €119.99

Notez les **Price ID** de chaque produit (commencent par `price_`).

## Étape 6: Configuration du Webhook

1. Dans Stripe Dashboard, allez dans **Developers > Webhooks**
2. Cliquez sur **Add endpoint**
3. URL: `https://votre-domaine.com/api/stripe/webhook`
4. Événements à écouter:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
5. Copiez le **Signing Secret** (commence par `whsec_`)
6. Ajoutez-le dans `.env`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_votre_webhook_secret_ici
   ```

## Étape 7: Implémenter les routes API

Les fichiers suivants doivent être créés:

- `/app/api/stripe/checkout/route.ts` - Pour créer une session de paiement
- `/app/api/stripe/webhook/route.ts` - Pour recevoir les confirmations de paiement

## Structure de la base de données

Les tables nécessaires sont déjà créées:
- `purchases` - Enregistre tous les achats
- `transactions` - Historique des mouvements de jetons
- `user_wallets` - Solde de chaque utilisateur

## Flux de paiement

1. L'utilisateur clique sur "Acheter" dans la boutique
2. Une session Stripe Checkout est créée
3. L'utilisateur est redirigé vers Stripe pour payer
4. Après paiement, Stripe envoie un webhook
5. Le webhook crédite automatiquement les jetons
6. L'utilisateur est redirigé vers la page de confirmation

## Test en mode développement

Utilisez les cartes de test Stripe:
- **Succès**: 4242 4242 4242 4242
- **Échec**: 4000 0000 0000 0002
- CVV: n'importe quel 3 chiffres
- Date d'expiration: n'importe quelle date future

## Documentation complète

Pour plus de détails: https://stripe.com/docs/payments/checkout
