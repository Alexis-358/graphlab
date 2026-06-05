# GraphLab — Visualiseur & Analyseur de Graphes

> **Excellence Project** · Application web moderne dédiée à la théorie des graphes

[![Déployé sur Vercel](https://img.shields.io/badge/Déployé-Vercel-black?logo=vercel)](https://graphlab-dy85.vercel.app)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)](https://vite.dev)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase)](https://supabase.com)
[![Licence MIT](https://img.shields.io/badge/Licence-MIT-green)](LICENSE)

---

## 🚀 Démo en ligne

**[graphlab-dy85.vercel.app](https://graphlab-dy85.vercel.app)**

---

## 📋 Description

GraphLab est une application web complète qui permet de **dessiner, analyser et visualiser des graphes** de façon interactive. Conçue pour les étudiants, enseignants et autodidactes en théorie des graphes.

### Fonctionnalités principales

| Module | Description |
|--------|-------------|
| ✏️ **Éditeur** | Canvas interactif Cytoscape.js — drag & drop, undo/redo, import/export JSON |
| 🔬 **Algorithmes** | Dijkstra, Bellman-Ford, Prim, Kruskal, Hamilton, Euler, Coloration |
| 📊 **Analyse** | Degrés, connexité, planarité, euler, lemme des poignées de main — temps réel |
| 📅 **PERT/MPM** | Ordonnancement de projets — chemin critique, Gantt, dates tôt/tard |
| 🎓 **Apprendre** | 8 cours interactifs avec théorie, formules et quiz |
| 📚 **Exemples** | 8 graphes célèbres prêts à charger (Petersen, K₅, Königsberg…) |
| ☁️ **Cloud** | Authentification Google, sauvegarde Supabase, partage par lien |
| 🌙 **Dark mode** | Thème clair/sombre sur tous les modules |

---

## 🛠️ Stack technique

```
React 18 + TypeScript    →  Interface utilisateur
Cytoscape.js             →  Canvas interactif des graphes
Zustand                  →  État global (graphe, auth, cloud, PERT)
TailwindCSS 3            →  Design system + dark mode
Supabase                 →  Auth OAuth Google + PostgreSQL + RLS
Vite 8                   →  Build + HMR
Vercel                   →  Déploiement + CDN + CI/CD automatique
```

---

## ⚡ Installation locale

### Prérequis

- Node.js 18+
- npm 9+
- Un projet Supabase (pour les fonctionnalités cloud)

### 1. Cloner le repository

```bash
git clone https://github.com/Alexis-358/graphlab.git
cd graphlab
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

Créer un fichier `.env.local` à la racine :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-clé-anon-publique
```

> Ces valeurs se trouvent dans **Supabase → Settings → API**.

### 4. Lancer le serveur de développement

```bash
npm run dev
```

L'application est accessible sur **http://localhost:5173**

---

## 📦 Scripts disponibles

```bash
npm run dev        # Serveur de développement avec HMR
npm run build      # Build de production (tsc + vite build)
npm run preview    # Prévisualiser le build de production
npm run lint       # Vérification ESLint
```

---

## 🗂️ Structure du projet

```
src/
├── components/
│   ├── auth/          # AuthButton (connexion Google)
│   ├── cloud/         # CloudPanel (sauvegarde + partage)
│   ├── editor/        # GraphCanvas, Toolbar, WeightPopover
│   ├── learn/         # LearnView (8 cours interactifs)
│   ├── panels/        # RightPanel (propriétés + algorithmes)
│   ├── pert/          # PertView (PERT/MPM + Gantt)
│   └── ui/            # ExamplesModal
├── lib/
│   ├── algorithms/    # dijkstra, bellman, prim, kruskal,
│   │                  # hamilton, euler, coloring, analysis, pert
│   ├── examples.ts    # 8 graphes prédéfinis
│   └── supabase.ts    # Client Supabase
├── store/
│   ├── graphStore.ts  # État graphe + historique undo/redo
│   ├── themeStore.ts  # Dark/light mode
│   ├── authStore.ts   # Authentification
│   ├── cloudStore.ts  # CRUD graphes cloud
│   └── pertStore.ts   # État PERT/MPM
├── types/
│   ├── graph.ts       # GraphNode, GraphEdge, Graph, AlgoResult
│   └── pert.ts        # PertTask, PertResult
└── utils/
    └── graphHelpers.ts # uid, nextLabel, isConnected, export/import
```

---

## 🧮 Algorithmes implémentés

| Algorithme | Complexité | Description |
|-----------|-----------|-------------|
| **Dijkstra** | O((V+E) log V) | Plus court chemin — poids ≥ 0 |
| **Bellman-Ford** | O(V·E) | Plus court chemin — poids négatifs + détection cycles |
| **Prim** | O(E log V) | Arbre couvrant minimal — depuis sommet source |
| **Kruskal** | O(E log E) | Arbre couvrant minimal — tri + Union-Find |
| **Hamilton** | O(n!) | Circuit hamiltonien — backtracking (≤ 15 sommets) |
| **Hierholzer** | O(E) | Chemin/circuit eulérien |
| **Coloration** | O(V²) | Coloration gloutonne (DSATUR simplifié) |
| **PERT/MPM** | O(V+E) | Tri topologique + forward/backward pass |

---

## 🗄️ Base de données

Table `graphs` dans Supabase avec Row Level Security (RLS) :

```sql
create table public.graphs (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users(id) on delete cascade,
  name        text not null,
  description text,
  data        jsonb not null,        -- { nodes, edges, directed, weighted }
  is_public   boolean default false,
  share_token text unique,           -- token de partage par lien
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
```

---

## 🚢 Déploiement

Le projet se déploie automatiquement sur Vercel à chaque push sur `main`.

### Variables d'environnement sur Vercel

Dans **Vercel → Settings → Environment Variables** :

```
VITE_SUPABASE_URL       = https://[ID].supabase.co
VITE_SUPABASE_ANON_KEY  = eyJhbGci...
```

### Configuration OAuth Google

Dans **Google Cloud Console → OAuth Client ID** :
- Authorized redirect URIs : `https://[ID].supabase.co/auth/v1/callback`

Dans **Supabase → Authentication → URL Configuration** :
- Site URL : `https://graphlab-dy85.vercel.app`

---

## 📖 Format JSON des graphes

```json
{
  "nodes": [
    { "id": "n1", "label": "A", "x": 120, "y": 80 }
  ],
  "edges": [
    { "id": "e1", "source": "n1", "target": "n2", "weight": 4 }
  ],
  "directed": false,
  "weighted": true
}
```

---

## ⌨️ Raccourcis clavier

| Touche | Action |
|--------|--------|
| `S` | Outil Sélection |
| `N` | Ajouter un sommet |
| `A` | Ajouter une arête |
| `D` | Supprimer |
| `Ctrl+Z` | Annuler |
| `Ctrl+Y` | Refaire |
| `Double-clic` sur arête | Modifier le poids |

---

## 📋 Limitations connues

- Circuit hamiltonien et chemins simples : limités à **15 sommets** (NP-complet)
- Dijkstra : **poids ≥ 0** uniquement (utiliser Bellman-Ford sinon)
- Performances optimales : jusqu'à **200 sommets / 500 arêtes**
- Connexion Google : utiliser la **navigation privée** si une extension interfère

---

## 👤 Auteur

**Alexis Steve Ngodebo**
Excellence Project — Juin 2026

---

## 📄 Licence

Ce projet est sous licence [MIT](LICENSE).
