# UI Refresh — Design Spec
**Date:** 2026-05-14  
**Status:** Approved

---

## Context

Le wizard est fonctionnel mais visuellement "fade" — fond très sombre uniforme, peu de hiérarchie colorée, pas de logos. L'utilisateur veut :
1. Logos SVG sur les stack cards (Laravel, React, mix)
2. Full refresh du wizard : couleurs brand partout, moins morose
3. README riche dans les fichiers générés

Direction choisie : **Brand Colors** (chaque stack a sa teinte) + **Full refresh** (tout le wizard suit, pas juste les stack cards).

---

## 1. Stack Cards — StackStep.tsx

### Logos SVG inline
Chaque stack card reçoit son logo SVG officiel :
- **Laravel** : logo en forme de shield, couleur `#FF2D20`
- **React** : atomes tournants, couleur `#61DBFB`
- **Laravel + React** : icône hexagone custom, couleurs combineés

### Traitement couleur par stack
```
laravel  → border: rgba(255,45,32,.35)   bg: rgba(255,45,32,.06)   icon-bg: rgba(255,45,32,.15)   title: #ff7a6e
react    → border: rgba(97,219,251,.28)  bg: rgba(97,219,251,.05)  icon-bg: rgba(97,219,251,.12)  title: #7ee6ff
mix      → border: rgba(108,99,255,.4)   bg: rgba(108,99,255,.08)  icon-bg: rgba(108,99,255,.18)  title: #b3adff
```

### État sélectionné
La carte sélectionnée reçoit en plus :
- Laravel : `box-shadow: 0 4px 20px rgba(255,45,32,.15)`
- React : `box-shadow: 0 4px 20px rgba(97,219,251,.12)`
- Mix : `box-shadow: 0 4px 20px rgba(108,99,255,.18)`
- Badge pill en haut à droite ("PHP", "TS", "Full")
- Légère augmentation de l'opacité du bg (`× 1.4`)

### Carte non-sélectionnée
Quand une carte est sélectionnée, les deux autres passent à `opacity: 0.5` pour créer un focus.

---

## 2. Sidebar — WizardSidebar.tsx

### Logo box
Remplacer `bg-[#6C63FF]/12` par un gradient :  
`background: linear-gradient(135deg, #6C63FF, #9b87ff)`  
Icône en blanc.

### Step dots
- **Pending** : inchangé (border gris, fond transparent, numéro gris)
- **Active** : `background: linear-gradient(135deg, #6C63FF, #9b87ff)`, texte blanc, `box-shadow: 0 0 8px rgba(108,99,255,.5)`
- **Done** : `background: rgba(52,211,153,.12)`, `border-color: rgba(52,211,153,.4)`, icône check verte (`#6ee7b7`)

### Item actif
Ajouter une fine barre verticale gauche : `border-left: 2px solid #6C63FF` + `padding-left: 10px`

---

## 3. Wizard Main — globals.css + WizardShell.tsx

### Glow ambiant
Injecter dans `.si-wizard-main` un pseudo-élément `::before` :
```css
.si-wizard-main::before {
  content: '';
  position: fixed;
  top: 0; right: 0;
  width: 500px; height: 400px;
  background: radial-gradient(ellipse at top right, rgba(108,99,255,.07), transparent 65%);
  pointer-events: none;
  z-index: 0;
}
```
Tout le contenu du main doit être `position: relative; z-index: 1`.

### Titres de step (`.si-title`)
```css
.si-title {
  background: linear-gradient(90deg, #ffffff 40%, #a59bff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

---

## 4. Landing Page — app/page.tsx

### Hero section
- Badge version : remplacer le fond gris par `border: 1px solid rgba(108,99,255,.35)` + `bg: rgba(108,99,255,.08)` + texte `#a59bff`
- Titre principal : même gradient que `.si-title` (blanc → accent)
- CTA primaire : ajouter `box-shadow: 0 0 24px rgba(108,99,255,.35)` au hover

### Feature cards
- Border au hover : `border-color: rgba(108,99,255,.3)` (actuellement quasi invisible)
- Icône : fond `rgba(108,99,255,.12)` au lieu du gris (`rgba(255,255,255,.04)`)
- Couleur icône : `#a59bff` au lieu de grise

### Background
Renforcer le glow ambient existant : augmenter l'opacité des deux cercles flous de `.06` → `.12`.

---

## 5. README généré — zip.ts + yaml (Laravel)

### Pour React (zip.ts)
Remplacer le README minimal par un document structuré :

```markdown
# {projectName}

> Scaffoldé avec [Stack-Init](https://stackinit.dev) le {date}

## Stack

| Couche | Choix |
|--------|-------|
| Framework | Next.js 15 (App Router) |
| État | {state_lib} |
| Formulaires | {form_lib} |
| UI | {ui_lib} |
| HTTP | {http_lib} |
| CSS | {css} |

## Modèles générés

{liste des modèles avec champs}

## Démarrage

```bash
npm install
npm run dev       # http://localhost:3000
```

## Prochaines étapes

1. **Connecter l'API** — Les composants ont des TODO pour les appels HTTP.
   Remplace les `// TODO: fetch` par tes vraies routes.

2. **Configurer les variables d'env** — Crée un `.env.local` :
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   ```

3. **Authentification** — Ajoute NextAuth.js ou une solution custom
   selon ton backend.

4. **Déploiement** — `npm run build` puis déploie sur Vercel, Netlify,
   ou ton propre serveur.

## Structure

```
src/
├── app/          # Pages App Router (une par modèle)
├── types/        # Interfaces TypeScript auto-générées
└── ...
```
```

### Pour Laravel — deux livrables

**1. Téléchargement d'un `GETTING_STARTED.md`** (nouveau, dans `yaml.ts`)  
Déclencher un second download juste après le YAML, avec un fichier Markdown :
```markdown
# {projectName} — Getting Started

> Généré avec Stack-Init le {date}

## Ce qui a été généré
- `stack-init.yaml` — la config de ton projet

## Prochaines étapes

### 1. Installer le CLI
```bash
npm install -g stack-init   # ou npx stack-init
```

### 2. Générer les fichiers Laravel
```bash
cp stack-init.yaml ./mon-projet-laravel/
cd mon-projet-laravel
npx stack-init generate
```

### 3. Lancer les migrations
```bash
php artisan migrate
php artisan db:seed          # si les seeders sont activés
```

### 4. Démarrer le serveur
```bash
php artisan serve            # http://localhost:8000
```

## Modèles générés
{liste des modèles}
```

**2. Panel quickstart OutputStep.tsx** — enrichir les commandes existantes pour inclure les étapes post-génération (`migrate`, `seed`, `serve`).

---

## Fichiers à modifier

| Fichier | Nature |
|---------|--------|
| `src/components/wizard/steps/StackStep.tsx` | Logos SVG + brand colors + badges + opacity non-sélectionnés |
| `src/components/wizard/WizardSidebar.tsx` | Logo gradient, step dots gradient/vert, barre active |
| `src/app/globals.css` | `.si-title` gradient, `.si-wizard-main::before` glow, `.si-step-dot` états |
| `src/app/page.tsx` | Badge, glow renforcé, feature cards, CTA hover |
| `src/lib/generator/zip.ts` | README riche avec next steps (React) |
| `src/lib/generator/yaml.ts` | Second download `GETTING_STARTED.md` (Laravel) |
| `src/components/wizard/steps/OutputStep.tsx` | Panel quickstart Laravel enrichi (migrate, seed, serve) |

---

## Ce qui ne change PAS

- Palette de couleurs globale (`#0a0b14`, `#6C63FF`, etc.) — inchangée
- Structure des composants, CSS classes `si-*` — inchangées
- Toutes les étapes du wizard autres que StackStep — inchangées (ModelsStep, LaravelStep, etc.)
- Aucune nouvelle dépendance

---

## Non-goals

- Animation CSS (keyframes, transitions complexes) — hors scope
- Refonte de la landing page complète — seulement les touch-ups listés
- Mobile responsive — hors scope
