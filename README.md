# Quoi de neuf ? — Guest Suite Changelog

Page publique de changelog pour Guest Suite, alimentée par Notion et déployée sur Netlify.

## Stack

- **Nuxt 3** + Vue 3
- **Tailwind CSS**
- **Notion** comme CMS (base de données changelog)
- **Netlify** pour le déploiement (SSR via Netlify Functions)

## Fonctionnalités

- Timeline des releases groupées par date
- Filtres par tag (`Nouveau`, `Amélioration`, `Intégration`, `Performance`) et par période (30j / 90j / 180j)
- Mode présentation style Instagram Stories (barre de progression, navigation tactile, pause)
- Sous-sections "Corrections" dépliables par entrée
- Responsive desktop / tablet / mobile

## CMS Notion

Les entrées sont gérées dans la base de données Notion :
👉 [Ouvrir la base changelog](https://www.notion.so/guest-suite/dffc11eaa41141bb8dd844ce2e184cbf)

### Propriétés disponibles

| Propriété | Type | Description |
|-----------|------|-------------|
| Titre | Texte | Titre de la feature |
| Description | Texte | Description client (2-3 phrases) |
| Tags | Select | `Nouveau` / `Amélioration` / `Intégration` / `Performance` |
| Date | Date | Date de release (ISO) |
| Média | URL | Image ou GIF illustrant la feature |
| CTA Texte | Texte | Libellé du bouton d'action |
| CTA Lien | URL | Lien du bouton (relatif `/app/...` ou absolu) |
| Corrections | Texte | Liste de bugs résolus, un par ligne, format `Module — Description` |
| Statut | Select | `Draft` (non publié) / `Published` (visible) |
| Audience | Select | `Public` / `Internal` |

## Génération automatique (n8n)

La génération des contenus "Quoi de neuf" est pilotée par un workflow n8n (voir `n8n/workflow.json`).

### Fonctionnement

1. **Trigger** : n8n poll la base Notion toutes les 5 minutes
2. **Condition** : filtre les entrées avec `Statut Quoi de neuf = À générer` dont les colonnes "Listing des fonctionnalités" ou "Résolution de Bugs" sont remplies
3. **Action** : appel `POST /api/generate` avec le `pageId` de chaque entrée éligible
4. **Résultat** : Claude génère titre, description, corrections, tags et CTA → écrit dans Notion, passe le statut en "Draft"

### Setup n8n

1. Importer `n8n/workflow.json` dans n8n
2. Configurer les credentials Notion dans n8n
3. Définir les variables d'environnement n8n :
   - `WHATS_NEW_BASE_URL` : URL de l'app déployée (ex: `https://whats-new.netlify.app`)
   - `GENERATE_SECRET` : même valeur que la variable côté Netlify

### API generate

`POST /api/generate` accepte un body JSON optionnel :
- `{ "pageId": "notion-page-id" }` — génère pour une page spécifique
- `{}` (vide) — génère pour toutes les entrées "À générer"

Authentification : header `Authorization: Bearer <GENERATE_SECRET>`.

## Variables d'environnement

```env
NOTION_API_KEY=      # Token de l'intégration Notion "API Produit"
ANTHROPIC_API_KEY=   # Clé API Anthropic pour la génération de contenu
GENERATE_SECRET=     # Secret Bearer pour POST /api/generate (partagé avec n8n)
```

## Développement local

```bash
cp .env.example .env   # renseigner les variables
npm install
npm run dev            # http://localhost:3005
```

## Déploiement

Le site est déployé automatiquement sur Netlify à chaque push sur `main`.

Les variables d'environnement `NOTION_API_KEY`, `ANTHROPIC_API_KEY` et `GENERATE_SECRET` sont à configurer dans les paramètres du site Netlify.
