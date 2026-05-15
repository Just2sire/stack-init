# ✨ Stack-Init | Premium Project Scaffolder

**Stack-Init** est un assistant (wizard) haut de gamme conçu pour accélérer la création de projets full-stack. Il permet de définir visuellement vos modèles de données, leurs relations, et de générer instantanément une base de code propre et configurée selon vos préférences.

![Stack-Init Preview](https://img.shields.io/badge/UI-Premium_Gold_%26_Dark-gold?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=next.js&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)

---

## 🚀 Fonctionnalités Clés

- 🛠️ **Wizard Multi-étapes** : Un flux de travail fluide guidant l'utilisateur de la sélection de la stack à l'export final.
- 📊 **Modélisation Visuelle** : Définissez vos modèles (Entités, Attributs, Types) avec une interface intuitive.
- 🔗 **Gestion des Relations (ERD)** : Visualisez et gérez les relations entre vos modèles grâce à un moteur de graphe intégré (`xyflow`).
- 🏗️ **Support Multi-Framework** : Configuration spécifique pour **Laravel** (Backend) et **React/Next.js** (Frontend).
- 📦 **Génération de Code** : Exportation du projet complet au format ZIP ou YAML, prêt à l'emploi.

---

## ⚙️ Fonctionnement & Flux de Génération

Stack-Init utilise une architecture **Serverless** : toute la logique de génération s'exécute directement dans votre navigateur. Vos données de configuration ne quittent jamais votre machine.

Il existe trois flux de génération distincts selon votre sélection :

### 1. Backend (Laravel) — "Configuration Builder"
Puisque le code PHP ne peut pas être scaffoldé directement dans le navigateur, le wizard génère un **"Manifeste de Projet"** :
- **Fichier YAML** : Contient toutes les définitions de modèles, attributs complexes (`unique`, `nullable`, `precision`) et relations.
- **Utilisation** : Téléchargez le fichier `stack-init.yaml`, placez-le dans votre dossier Laravel et lancez `npx stack-init generate` via la CLI pour créer les migrations, contrôleurs et modèles.

### 2. Frontend (React / Next.js) — "Full ZIP"
Pour l'écosystème JavaScript, l'UI génère l'intégralité du projet :
- **Arborescence Complète** : Générée via `JSZip` avec un `package.json` dynamique incluant vos dépendances choisies (Shadcn UI, Zustand, Axios, etc.).
- **Typage TypeScript** : Conversion automatique des types DB en interfaces TypeScript.
- **Pages Conditionnelles** : Génération intelligente des fichiers `page.tsx` pour les listes, détails et formulaires.

### 3. Mixte (Full-stack) — "Synchronized Export"
Pour les projets complets (Laravel + React), le wizard lance les deux moteurs en parallèle :
- Garantit une cohérence parfaite entre les interfaces TypeScript du frontend et le schéma de base de données du backend.
- Fournit un guide `GETTING_STARTED.md` personnalisé pour lier les deux parties.
- 🎨 **Design System "Gold & Dark"** : Une interface sombre élégante avec des accents dorés, utilisant des effets de glassmorphisme et des micro-animations.

---

## 🛠️ Stack Technique

- **Framework** : [Next.js](https://nextjs.org/) (App Router)
- **Style** : [Tailwind CSS v4](https://tailwindcss.com/) & CSS natif pour une performance maximale.
- **État (State Management)** : [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction) pour une gestion fluide du wizard.
- **Visualisation** : [@xyflow/react](https://reactflow.dev/) pour les schémas entité-association.
- **Templating** : [Handlebars](https://handlebarsjs.com/) pour la génération dynamique de fichiers.
- **Composants UI** : [Radix UI](https://www.radix-ui.com/) & [Lucide React](https://lucide.dev/).

---

## 📥 Installation

Assurez-vous d'avoir [Node.js](https://nodejs.org/) installé, puis suivez ces étapes :

1.  **Cloner le dépôt** :
    ```bash
    git clone https://github.com/votre-repo/stack-init.git
    cd stack-init
    ```

2.  **Installer les dépendances** :
    ```bash
    pnpm install
    # ou npm install / yarn install
    ```

3.  **Lancer le serveur de développement** :
    ```bash
    pnpm dev
    ```

4.  Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

---

## 📖 Utilisation du Wizard

1.  **Choix de la Stack** : Sélectionnez vos frameworks (ex: Laravel + Next.js).
2.  **Définition des Modèles** : Créez vos entités (ex: `User`, `Post`) et ajoutez leurs champs.
3.  **Relations** : Liez vos modèles entre eux (1:1, 1:N, N:N) de manière visuelle.
4.  **Configuration Framework** : Ajustez les réglages spécifiques (ex: drivers de base de données, options d'auth).
5.  **Génération** : Prévisualisez et téléchargez votre projet structuré.

---

## 🎨 Design & Esthétique

Le projet suit une charte graphique **Premium Dark** :
- **Couleurs** : Noir profond (#000) avec des accents Or (#D4AF37) et Ambre.
- **Surfaces** : Verre dépoli (Glassmorphism) avec bordures subtiles.
- **Typographie** : Polices modernes (Inter/Outfit) pour une lisibilité optimale.

---

## 📄 Licence

Distribué sous la licence MIT. Voir `LICENSE` pour plus d'informations.

---

Développé avec ❤️ pour rendre le développement plus rapide et élégant.
