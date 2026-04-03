# Quoi de neuf ? — Guest Suite Changelog

Page publique de changelog pour Guest Suite, alimentée par Notion avec cache de fichier et serveur Node.js long-running.

## Stack

- **Nuxt 3** + Vue 3 (SSR)
- **Tailwind CSS**
- **Notion** comme CMS (base de données changelog)
- **Node.js** serveur long-running avec Nitro (cron interne + API)
- **Claude AI** pour la génération automatique du contenu (release notes)

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
| Titre Quoi de neuf | Texte | Titre de la feature |
| Description Quoi de neuf | Texte | Description client (2-3 phrases) |
| Tags Quoi de neuf | Multi-select | `Nouveau` / `Amélioration` / `Intégration` / `Performance` |
| Date | Date | Date de release (ISO) |
| Média | URL | Image ou GIF illustrant la feature |
| CTA Texte | Texte | Libellé du bouton d'action |
| CTA Lien | URL | Lien du bouton (relatif `/app/...` ou absolu) |
| Corrections Quoi de neuf | Texte | Liste de bugs résolus, un par ligne |
| Autres ajouts Quoi de neuf | Texte | Autres items ou améliorations |
| Statut Quoi de neuf | Select | `À générer` / `Publié` |
| Nom | Texte | Nom (fallback si Titre Quoi de neuf vide) |

## Architecture

Le projet repose sur un cron interne exécuté toutes les 5 minutes sur le serveur :

```
Cron (5 min)
  ├─ POST /api/generate
  │  └─ Déclenche la génération Claude des items "À générer"
  ├─ Notion (SELECT "Publié")
  │  └─ Récupère les items publiés depuis Notion
  └─ Écriture atomique (rename)
     └─ Écrit server/data/changelog.json avec les items

Frontend + Terraforming (app externe)
  └─ GET /api/changelog.json
     └─ Sert le fichier cache
```

Le cache persiste entre les redémarrages. En développement sans `ENABLE_CRON`, des données mock sont servies.

## Variables d'environnement

```env
NOTION_API_KEY=      # Token de l'intégration Notion "API Produit" (requis)
ANTHROPIC_API_KEY=   # Clé API Anthropic pour la génération de contenu (requis)
ENABLE_CRON=         # Optionnel. Mettre à 1 pour activer le cron en dev (toujours actif en prod)
DATA_DIR=            # REQUIS EN PRODUCTION. Chemin absolu vers le dossier de données persistant (ex: /var/data/whats-new). En dev, fallback sur server/data/ relatif au cwd.
```

## Développement local

```bash
cp .env.example .env   # renseigner les variables
npm install
npm run dev            # http://localhost:3005
```

## Déploiement

Le projet est déployé sur **Clever Cloud** comme une application Node.js long-running.

### Configuration requise

1. **Runtime** : Node.js (app Clever Cloud de type Node)
2. **Persistance** : [File System Bucket](https://developers.clever-cloud.com/doc/addons/fs-bucket/) monté sur `DATA_DIR` pour persister `changelog.json` entre les redéploiements
3. **Variables d'environnement** : `NOTION_API_KEY`, `ANTHROPIC_API_KEY`, `DATA_DIR`, `GENERATE_SECRET`
4. **Port** : variable `PORT` (Clever Cloud l'injecte automatiquement)

### Processus

Le cron démarre automatiquement au démarrage du serveur. Les logs indiquent :
- `[cron] Skipped in dev (set ENABLE_CRON=1 to enable)` → cron désactivé en dev
- `[cron] Poll actif toutes les 300s` → cron actif
- `[cron] X item(s) ecrits dans changelog.json` → succès
