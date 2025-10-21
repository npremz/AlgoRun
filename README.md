# AlgoRun

Une application web pour pratiquer les problèmes algorithmiques avec des défis de speedrun. AlgoRun vous permet de créer des listes de problèmes et de vous chronométrer pendant que vous les résolvez.

## Fonctionnalités

### Authentification
- Système de login/register sécurisé avec Lucia et Argon2
- Toutes les routes protégées par défaut
- Sessions persistantes avec cookies HTTP-only

### Listes de problèmes
- Créez et partagez des listes de problèmes publiques/privées
- Liste "Fundamentals" pré-configurée avec 18 problèmes essentiels
- Visualisez votre meilleur temps sur chaque liste
- Indicateur "Not attempted yet" pour les listes jamais essayées
- Tags, difficulté, et liens LeetCode pour chaque problème

### Mode Speedrun
- **Timer en temps réel** qui compte depuis le début
- **Reprise automatique** des speedruns en cours
- **Checkpoint par problème** - marquez chaque problème complété avec son timestamp
- **Complétion automatique** quand tous les problèmes sont terminés
- **Modal de célébration** avec votre temps final
- **Protection anti-sortie** avec confirmation avant de quitter

### Suivi de progression
- Historique complet de tous vos speedruns
- Statistiques : temps total, temps par problème, date de complétion
- Suppression de tentatives avec confirmation
- Visualisation de la progression (X/Y problèmes complétés)
- Barre de progression en temps réel

## Stack Technique

- **Frontend**: SvelteKit 5 (Svelte 5 avec Runes) + Tailwind CSS 4
- **Backend**: SvelteKit API Routes
- **Database**: PostgreSQL avec Drizzle ORM
- **Auth**: Lucia + Argon2 pour le hachage
- **Deployment**: Docker Compose pour PostgreSQL

## Setup

### 1. Installer les dépendances
```bash
npm install
```

### 2. Créer un fichier `.env`
```env
DATABASE_URL="postgres://root:mysecretpassword@localhost:5432/local"
```

### 3. Démarrer PostgreSQL
```bash
npm run db:start
```

### 4. Appliquer le schéma de base de données
```bash
npm run db:push
```

### 5. (Optionnel) Seed la base de données
Ajoute la liste "Fundamentals" avec 18 problèmes :
```bash
npm run db:seed
```

### 6. Démarrer le serveur de développement
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

## Scripts disponibles

### Développement
- `npm run dev` - Démarre le serveur de développement
- `npm run build` - Build l'application pour la production
- `npm run preview` - Prévisualise le build de production
- `npm run check` - Vérifie les types TypeScript et Svelte

### Base de données
- `npm run db:start` - Démarre PostgreSQL avec Docker Compose
- `npm run db:push` - Applique les changements de schéma (dev)
- `npm run db:generate` - Génère les migrations SQL
- `npm run db:migrate` - Exécute les migrations (production)
- `npm run db:studio` - Ouvre Drizzle Studio (interface visuelle)
- `npm run db:seed` - Seed la base avec des données de test

## Utilisation

### Première utilisation
1. Créez un compte sur `/register`
2. Connectez-vous sur `/login`
3. Explorez la liste "Fundamentals" sur `/lists`
4. Cliquez sur "Start Speedrun" pour commencer un défi

### Faire un speedrun
1. Lisez les instructions sur la page de confirmation
2. Cliquez sur "Start Speedrun" - le timer démarre immédiatement
3. Résolvez les problèmes sur LeetCode (liens fournis)
4. Cochez chaque problème terminé dans l'interface
5. Le speedrun se termine automatiquement quand tous les problèmes sont complétés
6. Un modal de célébration affiche votre temps final

### Reprendre un speedrun
- Les speedruns non terminés apparaissent dans "In Progress" sur `/speedruns`
- Cliquez sur "Continue" pour reprendre là où vous vous êtes arrêté
- Le timer reprend automatiquement avec le temps déjà écoulé

## Structure de la base de données

### Tables principales
- **user** - Utilisateurs (id, username, passwordHash)
- **session** - Sessions d'authentification Lucia
- **problem_list** - Listes de problèmes (nom, description, public/privé)
- **problem** - Problèmes individuels (titre, difficulté, tags, lien LeetCode)
- **speedrun_attempt** - Tentatives de speedrun avec tracking complet

### Relations
- Une liste appartient à un utilisateur
- Un problème appartient à une liste
- Une tentative de speedrun lie un utilisateur et une liste
- Les `problemTimings` (JSON) trackent le timestamp de chaque problème

## API Endpoints

### Authentification
- `POST /login` - Connexion
- `POST /register` - Inscription
- `POST /logout` - Déconnexion

### Listes
- `GET /api/lists` - Liste toutes les listes accessibles
- `GET /api/lists/[id]` - Détails d'une liste avec ses problèmes
- `POST /api/lists` - Créer une nouvelle liste
- `PATCH /api/lists/[id]` - Modifier une liste
- `DELETE /api/lists/[id]` - Supprimer une liste

### Problèmes
- `POST /api/problems` - Ajouter un problème à une liste
- `PATCH /api/problems/[id]` - Modifier un problème
- `DELETE /api/problems/[id]` - Supprimer un problème

### Speedruns
- `GET /api/speedruns` - Historique des speedruns de l'utilisateur
- `GET /api/speedruns/[id]` - Détails d'un speedrun
- `POST /api/speedruns` - Démarrer un nouveau speedrun
- `PATCH /api/speedruns/[id]` - Marquer un problème comme complété
- `DELETE /api/speedruns/[id]` - Supprimer un speedrun

Voir [API.md](./API.md) pour la documentation complète.

## Liste "Fundamentals"

La liste par défaut couvre 18 patterns algorithmiques essentiels :
- Prefix Sum, Two Pointers, Sliding Window
- Fast & Slow Pointer, In-place Reversal
- Stack, Top K Elements
- Overlapping Intervals
- Binary Search (classic & modified)
- Tree Traversal (Preorder, Inorder, Level Order)
- DFS, BFS, Matrix Traversal
- Backtracking
- Dynamic Programming
