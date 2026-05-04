# 🚀 Guide de Déploiement FlowTime

Ce document détaille les étapes pour mettre en production l'application FlowTime.

## 1. Supabase (Production)
Il est fortement recommandé de créer un nouveau projet Supabase dédié à la production.

1. Créez un projet sur [Supabase](https://supabase.com).
2. Exécutez le script SQL complet de configuration (RLS, Tables, Triggers) situé dans `docs/SUPABASE_SETUP.md`.
3. Récupérez les clés :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (Gardez-la secrète !)

## 2. GitHub
1. Initialisez un repo Git local : `git init`.
2. Créez un repo sur GitHub nommé `flowtime`.
3. Poussez votre code :
   ```bash
   git add .
   git commit -m "Initial commit - Production ready"
   git branch -M main
   git remote add origin https://github.com/VOTRE_USERNAME/flowtime.git
   git push -u origin main
   ```

## 3. Vercel
1. Connectez-vous à [Vercel](https://vercel.com).
2. Importez le repo `flowtime`.
3. Configurez les **Environment Variables** :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SENTRY_DSN` (Optionnel)
4. Cliquez sur **Deploy**.

## 4. Monitoring & Analytics
- **Vercel Analytics** : Activé automatiquement via le code. Allez dans l'onglet "Analytics" sur Vercel pour voir le trafic.
- **Sentry** : Pour le suivi des erreurs, créez un compte Sentry et ajoutez le DSN aux variables d'environnement.

## 5. Initialisation des données
Une fois déployé, lancez le script de seed sur la base de production (en local via les clés de prod) :
```bash
npm run seed
```

## 6. Mode Kiosque (Hardware)
Pour le bar **The Flow**, il est conseillé d'utiliser une tablette dédiée (iPad ou Android) avec le navigateur verrouillé sur `https://flowtime.app/admin/checkin`.

---
*FlowTime - Ready to serve.* 🍹🚀
