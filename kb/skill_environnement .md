---
name: node-vercel-supabase
description: Installer la stack Node GitHub Vercel Supabase.
---

# Installation et configuration de la stack

## Objectif

Préparer une machine et un projet pour travailler avec :

- Node.js LTS et npm ;
- Git ;
- GitHub CLI : gh ;
- Vercel CLI : vercel ;
- Supabase CLI : npx supabase ;
- Docker, uniquement si Supabase doit tourner localement.

Exécuter les opérations avec les outils terminal disponibles.
Ne pas se limiter à expliquer les commandes.
Si aucun terminal n'est disponible, le signaler sans prétendre
avoir installé quoi que ce soit.

## Règles de sécurité

- Auditer avant de modifier.
- Annoncer les installations et demander l'accord avant exécution.
- Ne pas remplacer une version fonctionnelle sans justification.
- Ne pas utiliser sudo npm install.
- Ne pas supprimer de fichiers ni écraser une configuration existante.
- Ne pas modifier l'identité Git globale sans accord explicite.
- Ne jamais afficher de tokens, mots de passe ou clés secrètes.
- Ne jamais committer de fichiers .env contenant des secrets.
- Demander confirmation avant création de ressource distante,
  push Git, déploiement, migration distante ou opération payante.
- Ne jamais lancer une commande destructive Supabase automatiquement.
- Ne pas installer de plugin ou de skill supplémentaire sans accord.

## 1. Auditer l'environnement

Déterminer :

- système : Linux, macOS, Windows ou WSL ;
- architecture ;
- utilisateur courant et répertoire de travail ;
- présence des gestionnaires de paquets ;
- versions de Node.js, npm, Git, gh et Vercel ;
- présence de Docker si le mode Supabase local est demandé ;
- présence d'un package.json et d'un dépôt Git ;
- gestionnaire du projet à partir du champ packageManager
  et des fichiers lock.

Adapter les commandes au système. Sur environnement POSIX :

```bash
pwd
uname -s
uname -m
command -v node npm git gh vercel docker
node --version
npm --version
git --version
gh --version
vercel --version
git status --short
```

Exécuter les vérifications séparément pour qu'un outil absent
ne bloque pas tout l'audit.

Ne pas afficher le contenu de fichiers .env.

## 2. Identifier le contexte du projet

Si un projet existe :

- lire package.json, engines, packageManager et les fichiers lock ;
- respecter .nvmrc ou .node-version s'ils existent ;
- conserver le framework et le gestionnaire de paquets ;
- ne pas lancer de générateur dans un dossier non vide ;
- ne pas installer systématiquement les dépendances à leur
  dernière version.

Si aucun projet n'existe, demander uniquement :

- nom et dossier du projet ;
- framework souhaité ou projet Node.js simple ;
- Supabase distant uniquement ou également local.

Ne pas choisir Next.js à la place de l'utilisateur.

## 3. Installer Node.js et les outils système

Node.js :

- sélectionner une version LTS encore maintenue ;
- vérifier la compatibilité avec le projet et les CLI ;
- Supabase CLI via npm nécessite Node.js 20 minimum ;
- préférer le gestionnaire de versions déjà installé ;
- s'il n'existe pas, proposer une méthode officielle adaptée au système ;
- consulter la documentation officielle avant d'ajouter
  un dépôt système ou d'exécuter un script d'installation ;
- éviter toute exécution aveugle de script distant.

Git et GitHub CLI :

- les installer via une méthode officielle adaptée au système ;
- vérifier git --version et gh --version ;
- ne pas supposer que le paquet gh existe dans tous les dépôts.

Ne pas inventer les noms de paquets ou les commandes d'installation.

## 4. Installer Vercel CLI

Avec Node.js fonctionnel et un préfixe npm accessible
à l'utilisateur :

```bash
npm install --global vercel
vercel --version
```

En cas de problème de permissions :

- diagnostiquer le préfixe npm et le PATH ;
- corriger l'installation utilisateur ;
- ne pas contourner avec sudo npm install.

## 5. Préparer les dépendances du projet

Pour un projet existant, utiliser son gestionnaire de paquets.

Avec npm :

- utiliser npm ci si un package-lock.json valide existe
  et si une installation reproductible est appropriée ;
- sinon utiliser npm install.

Installer Supabase CLI dans les dépendances de développement :

```bash
npm install --save-dev --save-exact supabase
npx supabase --version
```

Ne jamais utiliser :

```bash
npm install --global supabase
```

Installer le SDK applicatif uniquement si le code en a besoin :

```bash
npm install @supabase/supabase-js
```

Distinguer le SDK applicatif de la CLI.

Avec pnpm, yarn ou bun, utiliser les équivalents du gestionnaire
du projet sans créer un deuxième fichier lock.

## 6. Configurer les authentifications

Vérifier d'abord les sessions existantes :

```bash
gh auth status
vercel whoami
```

Si une connexion est nécessaire, accompagner l'utilisateur :

```bash
gh auth login
vercel login
npx supabase login
```

Laisser l'utilisateur effectuer les étapes navigateur ou saisir
ses secrets dans le flux prévu par la CLI.

Sur machine distante sans navigateur, suivre la procédure officielle
adaptée. Ne pas demander de coller un token dans la conversation.

Ne pas annoncer qu'une connexion est réussie sans vérification.

## 7. Préparer Git et GitHub

Vérifier si le dossier est déjà dans un dépôt :

```bash
git rev-parse --show-toplevel
git remote -v
```

Initialiser Git uniquement si nécessaire et après accord.

Vérifier l'identité Git. Si elle manque, demander le nom et l'email.
Préférer une configuration locale au dépôt.

Compléter .gitignore sans écraser son contenu :

```gitignore
node_modules/
.vercel/
.env
.env.*
!.env.example
supabase/.temp/
supabase/.branches/
```

Adapter les exclusions de build au framework.

Créer un .env.example sans vraies clés.

Avant un commit :

- inspecter git status ;
- examiner les fichiers à ajouter ;
- vérifier l'absence de secrets ;
- ne pas faire de git add . aveugle.

Avant de créer le dépôt GitHub, confirmer :

- compte personnel ou organisation ;
- nom du dépôt ;
- visibilité, privée par défaut ;
- contenu du commit et branche à pousser.

Créer et pousser uniquement après approbation.

## 8. Préparer Supabase

Initialiser seulement si supabase/config.toml n'existe pas :

```bash
npx supabase init
```

### Mode distant

- vérifier le compte et les projets accessibles ;
- faire sélectionner le projet exact ;
- demander