# AlgoRun

Une application web pour pratiquer les problèmes algorithmiques avec des défis de speedrun.

## Fonctionnalités

- 🔐 **Authentification** - Système de login/register sécurisé avec Lucia
- 📝 **Listes de problèmes** - Créez et partagez des listes de problèmes
- ⏱️ **Mode Speedrun** - Résolvez des problèmes contre la montre
- 📊 **Suivi de progression** - Trackez vos performances au fil du temps

## Stack Technique

- **Frontend**: SvelteKit 5 + Tailwind CSS 4
- **Backend**: SvelteKit API Routes
- **Database**: PostgreSQL avec Drizzle ORM
- **Auth**: Lucia + Argon2

## Setup

1. Installer les dépendances:
```bash
npm install
```

2. Créer un fichier `.env`:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/algorun
```

3. Démarrer PostgreSQL:
```bash
npm run db:start
```

4. Appliquer les migrations:
```bash
npm run db:push
```

5. Démarrer le serveur de dev:
```bash
npm run dev
```

## Scripts disponibles

- `npm run dev` - Démarre le serveur de développement
- `npm run build` - Build l'application pour la production
- `npm run preview` - Prévisualise le build de production
- `npm run check` - Vérifie les types TypeScript
- `npm run db:start` - Démarre PostgreSQL avec Docker
- `npm run db:push` - Applique les changements de schéma
- `npm run db:studio` - Ouvre Drizzle Studio

## Authentification

L'application est protégée par authentification. Seules les routes `/login` et `/register` sont accessibles sans connexion.

- Créez un compte sur `/register`
- Connectez-vous sur `/login`
- Une fois connecté, vous avez accès à toutes les fonctionnalités

## API Endpoints

Voir [API.md](./API.md) pour la documentation complète des endpoints API.

## Structure de la base de données

- **user** - Utilisateurs
- **session** - Sessions d'authentification
- **problem_list** - Listes de problèmes
- **problem** - Problèmes individuels
- **speedrun_attempt** - Tentatives de speedrun
