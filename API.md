# API Endpoints

## Authentication
Tous les endpoints qui nécessitent une authentification retournent `401 Unauthorized` si l'utilisateur n'est pas connecté.

---

## Problem Lists

### `GET /api/lists`
Récupère toutes les listes publiques + les listes privées de l'utilisateur connecté.

**Response:**
```json
[
  {
    "id": 1,
    "name": "String manipulation",
    "description": "Problems about strings",
    "createdBy": "user_id",
    "isPublic": true,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

### `POST /api/lists`
Crée une nouvelle liste (authentification requise).

**Request:**
```json
{
  "name": "My List",
  "description": "Optional description",
  "isPublic": false
}
```

**Response:** `201 Created`

### `GET /api/lists/[id]`
Récupère une liste spécifique avec ses problèmes.

**Response:**
```json
{
  "id": 1,
  "name": "String manipulation",
  "description": "Problems about strings",
  "createdBy": "user_id",
  "isPublic": true,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z",
  "problems": [
    {
      "id": 1,
      "listId": 1,
      "title": "Reverse String",
      "description": "Reverse a string",
      "difficulty": "easy",
      "order": 0,
      "tags": ["string", "array"],
      "externalUrl": "https://leetcode.com/problems/reverse-string/",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

### `PATCH /api/lists/[id]`
Met à jour une liste (authentification requise, propriétaire seulement).

**Request:**
```json
{
  "name": "Updated name",
  "description": "Updated description",
  "isPublic": true
}
```

### `DELETE /api/lists/[id]`
Supprime une liste (authentification requise, propriétaire seulement).

---

## Problems

### `POST /api/problems`
Crée un nouveau problème dans une liste (authentification requise, propriétaire de la liste seulement).

**Request:**
```json
{
  "listId": 1,
  "title": "Two Sum",
  "description": "Find two numbers that add up to target",
  "difficulty": "easy",
  "tags": ["array", "hash-table"],
  "externalUrl": "https://leetcode.com/problems/two-sum/"
}
```

**Response:** `201 Created`

### `PATCH /api/problems/[id]`
Met à jour un problème (authentification requise, propriétaire de la liste seulement).

**Request:**
```json
{
  "title": "Updated title",
  "difficulty": "medium",
  "order": 5
}
```

### `DELETE /api/problems/[id]`
Supprime un problème (authentification requise, propriétaire de la liste seulement).

---

## Speedrun Attempts

### `GET /api/speedruns`
Récupère les tentatives de speedrun de l'utilisateur (authentification requise).

**Query params:**
- `listId` (optional): Filtre par liste spécifique

**Response:**
```json
[
  {
    "id": 1,
    "userId": "user_id",
    "listId": 1,
    "startedAt": "2025-01-01T00:00:00.000Z",
    "completedAt": "2025-01-01T00:15:00.000Z",
    "totalTimeSeconds": 900,
    "problemsCompleted": 5,
    "problemsTotal": 5,
    "isCompleted": true,
    "problemTimings": [
      {
        "problemId": 1,
        "timeSeconds": 180,
        "completed": true
      }
    ]
  }
]
```

### `POST /api/speedruns`
Démarre une nouvelle tentative de speedrun (authentification requise).

**Request:**
```json
{
  "listId": 1
}
```

**Response:** `201 Created`

### `GET /api/speedruns/[id]`
Récupère une tentative spécifique (authentification requise, utilisateur propriétaire seulement).

### `PATCH /api/speedruns/[id]`
Met à jour la progression d'une tentative (authentification requise, utilisateur propriétaire seulement).

**Request:**
```json
{
  "problemId": 1,
  "timeSeconds": 180,
  "completed": true
}
```

**Response:**
La tentative mise à jour. Si tous les problèmes sont complétés, `isCompleted` est automatiquement mis à `true`, `completedAt` est défini et `totalTimeSeconds` est calculé.

### `DELETE /api/speedruns/[id]`
Supprime une tentative (authentification requise, utilisateur propriétaire seulement).

---

## Error Responses

Tous les endpoints peuvent retourner les erreurs suivantes:

- `400 Bad Request` - Données invalides
- `401 Unauthorized` - Non authentifié
- `403 Forbidden` - Pas les droits nécessaires
- `404 Not Found` - Ressource introuvable

**Format:**
```json
{
  "error": "Error message"
}
```
