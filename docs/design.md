# stack-init — Design system specs

---

## Couleurs

### Accent principal

```
#6C63FF — Indigo
```

Utilisé pour : actions primaires, étape active, focus, liens, toggles actifs.

| Stop | Hex | Usage |
|---|---|---|
| 50 | `#EEEDFE` | Fond subtle (toggle card active, badge) |
| 100 | `#CECBF6` | Hover subtle |
| 200 | `#AFA9EC` | Bordure subtle |
| 400 | `#7F77DD` | État intermédiaire |
| main | `#6C63FF` | Bouton primaire, step active dot |
| 600 | `#534AB7` | Hover bouton primaire |
| 800 | `#3C3489` | Texte sur fond accent-50 |

Variables CSS à définir dans `globals.css` :

```css
:root {
  --accent:         #6C63FF;
  --accent-hover:   #5851E6;
  --accent-subtle:  rgba(108, 99, 255, 0.08);
  --accent-border:  rgba(108, 99, 255, 0.25);
  --accent-text:    #3C3489;
}
```

### Couleurs sémantiques

| Usage | Fond | Bordure | Texte |
|---|---|---|---|
| Success | `#E1F5EE` | `#9FE1CB` | `#085041` |
| Warning / partiel | `#FAEEDA` | `#FAC775` | `#633806` |
| Error | `#FCEBEB` | `#F7C1C1` | `#791F1F` |
| Info / accent | `#EEEDFE` | `#AFA9EC` | `#3C3489` |

### Palette types de champs

Chaque type de champ a une couleur fixe utilisée partout dans le wizard (chips, badges, icônes). La couleur ne change jamais selon le contexte.

| Type | Fond | Texte | Exemples |
|---|---|---|---|
| `string`, `char`, `tinyText` | `#E1F5EE` | `#085041` | name, slug, email |
| `text`, `mediumText`, `longText` | `#F1EFE8` | `#444441` | body, content, description |
| `integer`, `bigInteger`, `smallInteger` | `#E6F1FB` | `#0C447C` | count, views, position |
| `decimal`, `float`, `double` | `#EAF3DE` | `#27500A` | price, amount, lat |
| `boolean` | `#FAEEDA` | `#633806` | is_active, published |
| `timestamp`, `date`, `dateTime` | `#FBEAF0` | `#72243E` | created_at, published_at |
| `foreignId`, `foreignUuid` | `#EEEDFE` | `#3C3489` | user_id, post_id |
| `enum`, `set` | `#FAECE7` | `#712B13` | role, status, type |
| `json`, `jsonb` | `#F1EFE8` | `#5F5E5A` | metadata, settings |
| `uuid`, `ulid` | `#E6F1FB` | `#185FA5` | id, public_id |

---

## Typographie

Police : système (hérite de shadcn/ui — Inter ou équivalent).

| Rôle | Taille | Poids | Couleur |
|---|---|---|---|
| Titre d'étape (h1) | 22px | 500 | `--color-text-primary` |
| Sous-titre section (h2) | 18px | 500 | `--color-text-primary` |
| Label composant (h3) | 15px | 500 | `--color-text-primary` |
| Corps / description | 14px | 400 | `--color-text-secondary` |
| Caption / aide | 12px | 400 | `--color-text-tertiary` |
| Monospace (noms de champs, code) | 12px | 400 | `--color-text-primary` |
| Uppercase label section | 11px | 500 | `--color-text-tertiary` |

Règles :
- Jamais de poids 600 ou 700 — trop lourd
- Sentence case partout — jamais de Title Case ni CAPS
- Les noms de champs, types, fichiers → toujours en `font-mono`

---

## Espacement

| Token | Valeur | Usage |
|---|---|---|
| `gap-xs` | 4px | Espace icon + label, entre badges |
| `gap-sm` | 8px | Entre éléments d'un même groupe |
| `gap-md` | 12px | Entre composants distincts |
| `gap-lg` | 16px | Padding card, gap entre sections |
| `gap-xl` | 24px | Gap entre blocs majeurs |
| `gap-2xl` | 40px | Margin entre sections de page |

---

## Border radius

| Token | Valeur | Usage |
|---|---|---|
| `radius-sm` | 6px | Badge, pill, chip |
| `radius-md` | 10px | Bouton, input, select |
| `radius-lg` | 14px | Card, panel, model card |
| `radius-xl` | 18px | Modal, frame browser simulé |
| `radius-full` | 9999px | Toggle, avatar, step dot |

---

## Composants

### Boutons

**Primaire** — action principale (Suivant, Générer, Télécharger)
```css
background: var(--accent);
color: #fff;
border: none;
border-radius: 10px;
padding: 8px 16px;
font-size: 13px;
font-weight: 500;
```
Hover : `background: var(--accent-hover)`

**Secondaire** — action secondaire (Retour, Annuler)
```css
background: var(--color-background-primary);
color: var(--color-text-primary);
border: 0.5px solid var(--color-border-secondary);
border-radius: 10px;
padding: 8px 16px;
font-size: 13px;
```
Hover : `background: var(--color-background-secondary)`

**Ghost** — lien discret (Ignorer, Voir plus)
```css
background: none;
border: none;
color: var(--accent);
padding: 8px 16px;
font-size: 13px;
```

**Destructeur** — action irréversible (Supprimer modèle, Supprimer champ)
```css
background: none;
color: #E24B4A;
border: 0.5px solid rgba(226, 75, 74, 0.3);
border-radius: 10px;
padding: 8px 16px;
font-size: 13px;
```

**Icône** — action sans label (édition, suppression inline)
```css
width: 28px;
height: 28px;
border: 0.5px solid var(--color-border-secondary);
border-radius: 10px;
background: var(--color-background-primary);
display: flex; align-items: center; justify-content: center;
color: var(--color-text-secondary);
```
Icône : 13px. Hover : `background: var(--color-background-secondary)`

**Tailles**
- Standard : `padding: 8px 16px; font-size: 13px`
- Small : `padding: 5px 10px; font-size: 12px` — utilisé dans le footer du wizard

### Badges

Structure : `display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; border-radius: 20px; font-size: 11px; font-weight: 500`

| Variante | Fond | Texte | Usage |
|---|---|---|---|
| Purple | `#EEEDFE` | `#3C3489` | Laravel, stack, accent |
| Teal | `#E1F5EE` | `#085041` | React, success, activé |
| Amber | `#FAEEDA` | `#633806` | Warning, partiel |
| Gray | `#F1EFE8` | `#444441` | Neutre, désactivé, count |
| Red | `#FCEBEB` | `#791F1F` | Erreur, invalide |

### Chips de type de champ

Pour afficher les types de champs dans les cards modèle, les previews, etc.

```css
padding: 3px 8px;
border-radius: 6px;
font-size: 11px;
font-weight: 500;
font-family: var(--font-mono);
```

Couleurs selon la palette types définie plus haut.

### Inputs

**Input texte standard**
```css
padding: 8px 10px;
border: 0.5px solid var(--color-border-secondary);
border-radius: 10px;
font-size: 13px;
background: var(--color-background-primary);
color: var(--color-text-primary);
```
Focus : `border-color: var(--accent); outline: none; box-shadow: 0 0 0 3px var(--accent-subtle)`

**Input avec icône**
```html
<div style="position: relative;">
  <i class="ti ti-search" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--color-text-tertiary); font-size: 15px; pointer-events: none;"></i>
  <input style="padding-left: 32px;" placeholder="Nom du modèle..." />
</div>
```

**Select**
```css
/* Même style que l'input texte */
appearance: none;
padding-right: 28px; /* espace pour la flèche custom */
```

### Toggle

```html
<div class="toggle">
  <div class="toggle-knob"></div>
</div>
```

```css
.toggle {
  width: 36px; height: 20px;
  border-radius: 10px;
  background: var(--color-border-secondary);
  position: relative;
  cursor: pointer;
  transition: background 0.2s;
}
.toggle.on    { background: var(--accent); }
.toggle.partial { background: #EF9F27; }  /* activé sur certains modèles seulement */

.toggle-knob {
  position: absolute;
  top: 3px; left: 3px;
  width: 14px; height: 14px;
  border-radius: 50%;
  background: #fff;
  transition: left 0.2s;
}
.toggle.on .toggle-knob,
.toggle.partial .toggle-knob { left: 19px; }
```

**3 états :**
- Off (gris) : option désactivée sur ce modèle
- On (indigo) : option activée sur ce modèle
- Partial (ambre) : activée sur certains modèles seulement (vue "Tous les modèles")

### Toggle card

Composant central de l'étape Laravel — un toggle présenté comme une card cliquable.

```
┌─────────────────────────────────┐
│  [toggle]  Migration            │
│            Table en base        │
└─────────────────────────────────┘
```

```css
/* État off */
border: 0.5px solid var(--color-border-tertiary);
background: var(--color-background-primary);
border-radius: 14px;
padding: 10px 12px;

/* État on */
border-color: var(--accent-border);
background: var(--accent-subtle);

/* État partial */
border-color: rgba(186, 117, 23, 0.3);
background: rgba(250, 238, 218, 0.13);
```

Label principal : `font-size: 12px; font-weight: 500`
- Off : `color: var(--color-text-primary)`
- On : `color: var(--accent)`
- Partial : `color: #633806`

Label secondaire (description) : `font-size: 11px`
- Off : `color: var(--color-text-secondary)`
- On : `color: #534AB7`
- Partial : `color: #854F0B`

### Cards

**Card standard** — conteneur d'information
```css
background: var(--color-background-primary);
border: 0.5px solid var(--color-border-tertiary);
border-radius: 14px;
padding: 14px 16px;
```

**Card modèle** — card avec header et body séparés
```
┌─────────────────────────────────────┐  ← header (bg secondaire)
│  [icône]  Post   [4 champs]  [···]  │
├─────────────────────────────────────┤
│  title          [string]            │
│  body           [longText]          │
│  published_at   [timestamp] nullable│
│  user_id        [foreignId]  → users│
│  [+ Ajouter un champ]               │
└─────────────────────────────────────┘
```

Header :
```css
background: var(--color-background-secondary);
border-bottom: 0.5px solid var(--color-border-tertiary);
padding: 9px 12px;
display: flex; align-items: center; gap: 8px;
```

Body :
```css
padding: 10px 12px;
```

Ligne de champ :
```css
display: flex; align-items: center; gap: 8px;
padding: 4px 0;
border-bottom: 0.5px solid var(--color-border-tertiary);
font-size: 12px;
```
Dernière ligne : pas de `border-bottom`.

**Card accent** — info ou astuce
```css
border-left: 3px solid var(--accent);
border-radius: 0;  /* pas de radius sur border partiel */
border-top: 0.5px solid var(--color-border-tertiary);
border-right: 0.5px solid var(--color-border-tertiary);
border-bottom: 0.5px solid var(--color-border-tertiary);
border-radius: 10px;  /* radius sur les 4 coins car border partout */
padding: 12px 14px;
```
Titre : `font-size: 11px; font-weight: 500; color: var(--accent)`
Corps : `font-size: 12px; color: var(--color-text-secondary); line-height: 1.5`

---

## Layout du wizard

### Structure générale

```
┌─────────────────────────────────────────────────────┐
│  [sidebar 220px]  │  [main content flex:1]           │
│                   │                                  │
│  Logo             │  Titre de l'étape                │
│                   │  Sous-titre                      │
│  ○ Stack          │                                  │
│  ● Modèles        │  [contenu de l'étape]            │
│  ○ Relations      │                                  │
│  ○ Laravel        │                                  │
│  ○ React          │  [footer : retour | dots | next] │
│  ○ Résultat       │                                  │
└─────────────────────────────────────────────────────┘
```

```css
.wizard-layout {
  display: grid;
  grid-template-columns: 220px 1fr;
  min-height: 100vh;
}
```

### Sidebar

```css
.wizard-sidebar {
  background: var(--color-background-secondary);
  border-right: 0.5px solid var(--color-border-tertiary);
  padding: 20px 14px;
  position: sticky;
  top: 0;
  height: 100vh;
}
```

**Logo** :
- Logo mark : carré 28px, `border-radius: 8px`, `background: var(--accent)`, icône blanche 16px
- Texte : `font-size: 14px; font-weight: 500`
- Margin bottom : 28px

**Step item** :
```css
.step-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 10px;
  border-radius: 10px;
  margin-bottom: 2px;
  cursor: pointer;
}
.step-item.active { background: var(--accent-subtle); }
```

**Step dot** :
```css
.step-dot {
  width: 20px; height: 20px;
  border-radius: 50%;
  border: 1.5px solid var(--color-border-secondary);
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 500;
  color: var(--color-text-tertiary);
  transition: all 0.2s;
  flex-shrink: 0;
}
/* Done */
.step-item.done .step-dot {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}
/* Active */
.step-item.active .step-dot {
  border-color: var(--accent);
  color: var(--accent);
}
```

**Step label** :
- Off : `font-size: 13px; color: var(--color-text-secondary)`
- Active : `color: var(--accent); font-weight: 500`
- Done : `color: var(--color-text-primary)`

### Main content

```css
.wizard-main {
  padding: 32px 40px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
```

Titre d'étape : `font-size: 22px; font-weight: 500; margin-bottom: 4px`
Sous-titre : `font-size: 14px; color: var(--color-text-secondary); margin-bottom: 24px; line-height: 1.5`

Contenu : `flex: 1`

### Footer

Toujours en bas du main content.

```css
.wizard-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  margin-top: auto;
  border-top: 0.5px solid var(--color-border-tertiary);
}
```

**Progress dots** :
```css
.progress-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--color-border-secondary);
  transition: background 0.2s;
}
.progress-dot.active { background: var(--accent); }
```

---

## Étapes du wizard

### Étape 1 — Stack

Grille de cards cliquables. 2 colonnes, max 4 cards par rangée.

```
┌───────────────┐  ┌───────────────┐
│  [icône]      │  │  [icône]      │
│  Laravel      │  │  React        │  ← sélectionné
│  API REST...  │  │  Vite + TS    │
└───────────────┘  └───────────────┘
```

Card stack :
```css
/* Non sélectionné */
border: 1.5px solid var(--color-border-tertiary);
border-radius: 14px;
padding: 16px;
cursor: pointer;

/* Sélectionné */
border-color: var(--accent);
background: var(--accent-subtle);
```

Plusieurs stacks sélectionnables. La sélection multiple est visuelle uniquement (bordure indigo).

Note en bas de page (card info) :
> React & Next.js → ZIP téléchargeable. Laravel & NestJS → `stack-init.yaml` + commande CLI.

### Étape 2 — Modèles

Liste de model cards avec un bouton "Ajouter un modèle" en bas.

Chaque card modèle :
- Header : icône `ti-table`, nom en PascalCase, badge count de champs, boutons édition/suppression
- Body : liste des champs avec leur nom (mono) + chip de type + modificateurs (nullable, unique, →table)

Bouton ajout de champ à la fin du body : `+ Ajouter un champ` (ghost, font-size 12px).

Validation inline :
- Nom de modèle non-PascalCase → bordure rouge + message
- Modèle sans aucun champ → bouton Suivant désactivé

### Étape 3 — Relations

Card unique listant toutes les relations détectées.

```
User      [hasMany]   →  Post
User      [hasMany]   →  Comment
Post      [belongsTo] →  User
Post      [hasMany]   →  Comment
Comment   [belongsTo] →  User
Comment   [belongsTo] →  Post
```

Chaque ligne : `font-size: 12px`, modèle source en `font-weight: 500`, type en badge purple, modèle cible en `color: text-secondary`, bouton poubelle à droite.

Info card en bas : "Les `foreignId` ont été détectés → relations générées automatiquement."

Bouton "Ajouter manuellement" pour les relations non-FK (belongsToMany, morphs...).

### Étape 4 — Laravel

Tabs de modèle + grille de toggle cards.

**Tabs** :
```
[Tous les modèles]  [User ●]  [Post ●]  [Comment ○]
```

- Dot vert `#1D9E75` : tous les toggles identiques sur ce modèle
- Dot ambre `#EF9F27` : toggles mixtes sur ce modèle
- Dot gris : aucun toggle activé

**Vue "Tous les modèles"** :
- Toggle on indigo → tous les modèles l'ont
- Toggle partial ambre → certains modèles seulement
- Cliquer sur un toggle partial : passe en "on" pour tous, ou "off" pour tous (toggle)
- Info card expliquant les états

**Vue modèle spécifique** :
- Seulement on/off (pas de partial)
- Le header de l'étape indique "Configuration pour [Nom]"

**Grille de toggles** : 2 colonnes, gap 8px. 10 toggles maximum.

### Étape 5 — React

**Tabs de modèle** pour les pages à générer.
Grille 2×2 de toggle cards : Liste / Détail / Création / Édition.

**Section librairies** (global, pas par modèle) :
- Chaque lib = groupe de petites cards cliquables radio (une seule sélection)
- Catégories : État, Formulaires, UI, HTTP, Routing, CSS

### Étape 6 — Résultat

Split 2 colonnes : une box par stack sélectionné.

Chaque box :
- Header : logo stack + badge (ZIP ou CLI)
- Liste des fichiers générés (max 5 visibles + "+N autres")
- Bouton de téléchargement principal

Bloc code en dessous (pour Laravel) :
```css
background: var(--color-background-secondary);
border-radius: 10px;
padding: 10px 14px;
font-family: var(--font-mono);
font-size: 12px;
line-height: 1.8;
border: 0.5px solid var(--color-border-tertiary);
```

---

## Nommage des classes CSS (convention)

Préfixe `si-` pour tous les composants spécifiques à stack-init (évite les conflits avec shadcn).

```
si-wizard-shell
si-wizard-sidebar
si-wizard-main
si-wizard-footer
si-step-item
si-step-dot
si-model-card
si-model-card__header
si-model-card__body
si-field-row
si-toggle-card
si-toggle-card--on
si-toggle-card--partial
si-type-chip
si-type-chip--string
si-type-chip--foreignid
... etc
```

Les composants shadcn restent non-préfixés (`Button`, `Badge`, `Input`, `Select`...).

---

## Icônes (Tabler outline)

| Usage | Icône |
|---|---|
| Logo | `ti-stack-2` |
| Modèle / table | `ti-table` |
| Champ | `ti-columns` |
| Relation | `ti-arrows-exchange` |
| Ajouter | `ti-plus` |
| Supprimer | `ti-trash` |
| Éditer | `ti-edit` |
| Valider / done | `ti-check` |
| Télécharger | `ti-download` |
| Copier | `ti-copy` |
| Laravel / PHP | `ti-brand-php` |
| React | `ti-brand-react` |
| Next.js | `ti-brand-nextjs` |
| Terminal / CLI | `ti-terminal-2` |
| Fichier | `ti-file` |
| Warning / partiel | `ti-alert-triangle` |
| Info | `ti-info-circle` |
| Flèche droite | `ti-arrow-right` |
| Flèche gauche | `ti-arrow-left` |
| Chevron bas | `ti-chevron-down` |
| Sparkles / générer | `ti-sparkles` |

---

## Animations

Uniquement fonctionnelles. Pas d'animations décoratives.

| Élément | Animation | Durée |
|---|---|---|
| Step dot → done | `background` transition | 200ms |
| Toggle on/off | `background` + `left` du knob | 200ms ease |
| Toggle card on/off | `border-color` + `background` | 150ms |
| Card modèle apparition | `opacity` 0→1 | 200ms |
| Bouton hover | `background` | 150ms |

`prefers-reduced-motion` : toutes les transitions désactivées si l'utilisateur a cette préférence.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
```