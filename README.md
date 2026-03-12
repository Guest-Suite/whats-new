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

## Variables d'environnement

```env
NOTION_API_KEY=      # Token de l'intégration Notion "API Produit"
NOTION_DATABASE_ID=  # ID de la base de données changelog Notion
```

## Développement local

```bash
cp .env.example .env   # renseigner les variables
npm install
npm run dev            # http://localhost:3005
```

## Déploiement

Le site est déployé automatiquement sur Netlify à chaque push sur `main`.

Les variables d'environnement `NOTION_API_KEY` et `NOTION_DATABASE_ID` sont à configurer dans les paramètres du site Netlify.
