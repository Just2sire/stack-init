# Changelog

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

## [0.1.0] - 2026-06-01

### Added

- Wizard multi-étapes (10 étapes : Stack, Architecture, BDD, Modèles, Relations, Routes, Middlewares, Options, Intégration, Output)
- Éditeur ERD visuel avec xyflow/react (drag-and-drop, édition inline, arêtes de relation supprimables)
- Génération ZIP côté client pour React, Next.js, Vue, Angular, T3 (via JSZip, sans upload serveur)
- Génération de `stack-init.yaml` pour Laravel, Express, NestJS, FastAPI, Django
- Support de 11+ combos full-stack (`laravel+react`, `express+react`, `fastapi+nextjs`, `mern`, `pern`, `mevn`, `mean`, `t3`...)
- Assistant IA (Google Generative AI) : parsing langage naturel → schéma de modèles
- Import SQL DDL → reconstruction automatique des modèles
- Analyse de repo GitHub → déduction du stack et des modèles existants
- Partage de configuration par URL compressée (lz-string base64)
- Authentification Supabase (login, register, OAuth callback)
- Dashboard de configurations sauvegardées par compte utilisateur
- Templates prêts à l'emploi : SaaS, e-commerce, blog
- Modules optionnels : Auth, Billing, File Upload, Email, Cache, WebSockets, Queue
- Documentation guides en MDX
- Design system Dark Gold premium (Tailwind CSS v4, glassmorphism, micro-animations)
- En-têtes de sécurité HTTP (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
- Génération Docker & docker-compose pour tous les stacks
- Génération `GETTING_STARTED.md` personnalisé pour les projets full-stack
