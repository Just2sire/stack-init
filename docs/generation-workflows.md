# StackInit — Flux de Génération Côté UI (Technical Deep Dive)

Ce document détaille la manière dont l'interface utilisateur (le wizard web) orchestre et livre la configuration finale d'un projet. Le moteur de génération fonctionne entièrement côté client, garantissant que StackInit reste un outil "Serverless" et respecte la confidentialité totale des données.

Il existe **3 manières de générer un projet** depuis l'UI, déterminées par la sélection à l'Étape 1 (Stack). La logique centrale est orchestrée dans le composant `OutputStep.tsx` et le routeur `src/lib/generator/index.ts`.

---

## L'Orchestrateur Central (`OutputStep.tsx` & `index.ts`)

Lorsque l'utilisateur clique sur **"Generate project"**, le composant `OutputStep` invoque le routeur asynchrone principal :

```typescript
export async function generate(config: ProjectConfig): Promise<void> {
  if (isZipStack(config.stack) && !isCliStack(config.stack)) {
    await generateZip(config); // React / Next.js
    return;
  }
  if (isCliStack(config.stack) && !isZipStack(config.stack)) {
    generateYaml(config); // Laravel / backend
    return;
  }
  // Stack Mixte
  await Promise.all([generateZip(config), generateYaml(config)]);
}
```

Pendant l'exécution, `OutputStep` gère l'état UI (`isGenerating` et `isDone`). Une fois terminé, la fonction `computeFileList(config)` analyse de manière déterministe la configuration (les modèles et les toggles de génération) pour dresser la liste complète des fichiers virtuellement générés et l'afficher à l'utilisateur.

---

## 1. Génération Backend (`generateYaml`)
**Fichier source :** `src/lib/generator/yaml.ts`
**Stacks concernés :** `laravel`

Puisque PHP et les frameworks backend ne peuvent pas être scaffoldés directement dans le navigateur, le wizard se comporte comme un "builder de configuration".

### Mécanique Interne
1. **Transformation des données :** Le store Zustand (`config`) est mappé dans un objet brut `output`. Le code itère sur chaque `model` et reconstruit la hiérarchie attendue par le CLI. Il conserve spécifiquement les attributs complexes des champs (`nullable`, `unique`, `default`, `references`, `precision`, `length`).
2. **Injection des options Laravel :** Si c'est un stack CLI, les options globales (Auth, PHP version, DB engine) sont fusionnées.
3. **Sérialisation :** L'objet est converti via `yaml.dump(output, { lineWidth: 120, noRefs: true })`.
4. **Téléchargement Primaire :** Le script crée un `Blob` avec un object URL temporaire et simule un clic sur un lien `<a>` pour télécharger `stack-init.yaml`.
5. **Téléchargement Secondaire (Quick Start) :** Pour améliorer l'onboarding, un `setTimeout` déclenche immédiatement après un second téléchargement. Il génère un fichier texte `GETTING_STARTED.md` interpolé avec les commandes d'installation et la liste des modèles créés.

### Utilisation
L'utilisateur place le fichier `stack-init.yaml` dans son répertoire Laravel local, puis lance la commande CLI Node.js (`npx stack-init generate`) qui prendra le relais pour générer les fichiers PHP.

---

## 2. Génération Frontend (`generateZip`)
**Fichier source :** `src/lib/generator/zip.ts`
**Stacks concernés :** `react`, `nextjs`

Pour l'écosystème JS/TS, l'UI génère l'entièreté de la base de code, prête à l'emploi.

### Mécanique Interne
1. **Initialisation de JSZip :** Une instance de la librairie JSZip est créée pour assembler le système de fichiers virtuel.
2. **Génération Dynamique des Dépendances :** La fonction `buildDeps(opts)` lit les options React (zustand, shadcn, tailwind, axios, etc.) et compose dynamiquement le fichier `package.json`. Par exemple, si `tailwind` est sélectionné, il injecte `@tailwindcss/postcss`. S'il y a `shadcn`, il ajoute `class-variance-authority`, `clsx`, et `tailwind-merge`.
3. **Fichiers de Configuration :** Des templates codés en dur sont injectés pour `tsconfig.json`, `next.config.ts`, et les configurations CSS.
4. **Typage TypeScript :** Le script itère sur les modèles et utilise un dictionnaire `toTs(fieldType)` pour convertir les types de base de données (ex: `integer` → `number`, `timestamp` → `string`, `json` → `unknown`) et générer des interfaces TypeScript pour chaque entité (`src/types/ModelName.ts`).
5. **Génération Conditionnelle des Pages :** Pour chaque modèle, le générateur regarde l'objet `pages` de la configuration (`list`, `detail`, `create`, `edit`). Pour chaque booléen à `true`, un template React client-side (`'use client';`) spécifique est injecté dans le dossier App Router correspondant (`src/app/[slug]/...`).
6. **Compression et Livraison :** JSZip compile l'arborescence en un objet Blob (`await zip.generateAsync({ type: 'blob' })`), crée une URL d'objet, et lance le téléchargement automatique de l'archive ZIP contenant le projet complet.

### Utilisation
L'utilisateur décompresse l'archive, exécute `npm install` pour télécharger les dépendances générées, et lance le serveur de dev via `npm run dev`.

---

## 3. Génération Mixte (Stack Laravel + React)
**Stacks concernés :** `laravel+react`, `laravel+nextjs`

Lorsque l'utilisateur souhaite le projet full-stack complet.

### Mécanique Interne
1. Le fichier `project.schema.ts` impose la présence conjointe des options `laravel` et `react` au niveau de la validation Zod.
2. Comme montré dans le routeur `index.ts`, `Promise.all` exécute la logique YAML et la logique ZIP en simultané.
3. Le navigateur demande à l'utilisateur l'autorisation de télécharger des fichiers multiples.
4. Trois fichiers atterrissent sur le poste de travail :
   - `[nom-du-projet]-react.zip` (Frontend)
   - `stack-init.yaml` (Instructions backend)
   - `GETTING_STARTED.md` (Manuel)

Cette approche asynchrone permet de scafolder un écosystème entier sans serveur distant, en garantissant que les définitions d'API côté React (fichiers TypeScript générés par JSZip) correspondent parfaitement au schéma de base de données SQL et à l'API Resource (qui seront générés par la CLI via le YAML).