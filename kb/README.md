# Node.js + GitHub + Vercel + Supabase — sans Docker

## Ce que contient cet export

- SKILL.md : instructions opérationnelles destinées à un agent disposant d'un terminal.
- README.md : guide d'installation et d'utilisation de l'environnement.

Le texte source s'arrêtait dans la section Supabase distant. La suite a été complétée pour proposer un parcours distant cohérent, sans Docker. Aucun environnement n'a été installé ou testé lors de cet export.

## Architecture

L'application Node.js tourne nativement sur la machine. Git versionne le code, GitHub héberge le dépôt, Vercel héberge les déploiements et Supabase fournit les services distants.
Aucune base Supabase locale ni runtime de conteneurs n'est installé. Une connexion réseau est nécessaire pour utiliser les services distants.
Les projets et commandes ci-dessous sont des modèles à adapter, pas un script à copier intégralement sans contrôle.

## 1. Préparer la machine

Systèmes cibles : Linux, macOS, Windows ou WSL. Les exemples de shell sont au format POSIX ; adapter l'audit à PowerShell sous Windows.

Installer, après vérification des versions existantes :

1. Une version Node.js LTS maintenue compatible avec le projet, accompagnée de npm.
2. Git.
3. GitHub CLI (gh).

Respecter .nvmrc, .node-version, engines et packageManager. La CLI Supabase via npm demande Node.js 20 minimum ; vérifier les exigences à l'installation. Le minimum n'est pas une recommandation de version LTS.
Utiliser un gestionnaire de versions déjà présent ou les instructions officielles de chaque éditeur adaptées au système. Ce guide ne choisit pas arbitrairement un gestionnaire système et n'exécute aucun script distant.

Vérifier chaque commande séparément :

```bash
node --version
npm --version
git --version
gh --version
```

Installer Vercel CLI seulement si elle manque ou est incompatible, avec accord :

```bash
npm install --global vercel
vercel --version
```

Ne jamais utiliser sudo npm install. Corriger le préfixe npm et le PATH si nécessaire.

## 2. Ouvrir ou préparer le projet

Se placer dans le dossier du projet avant toute installation. Pour un nouveau projet, choisir explicitement le nom, le dossier et le framework, ou Node simple. Aucun framework ni générateur n'est imposé.
Pour un projet existant, examiner package.json et les locks ; conserver son gestionnaire.
Avec npm, choisir une seule méthode :

```bash
# Avec un package-lock.json valide ; recrée node_modules.
npm ci
```

Ou, si npm ci n'est pas adapté :

```bash
npm install
```

Installer Supabase CLI si absente, après accord :

```bash
npm install --save-dev --save-exact supabase
npx supabase --version
```

Installer le SDK seulement si l'application en a besoin :

```bash
npm install @supabase/supabase-js
```

Ne pas installer Supabase CLI globalement. Avec pnpm, yarn ou bun, employer les équivalents sans créer un second lock.

## 3. Se connecter aux services

Vérifier les sessions avant de se reconnecter :

```bash
gh auth status
vercel whoami
```

Si nécessaire :

```bash
gh auth login
vercel login
npx supabase login
```

Suivre les flux interactifs officiels. Ne jamais coller un token, un mot de passe ou une clé secrète dans la conversation ou dans un fichier versionné.

## 4. Protéger le dépôt

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

Adapter les exclusions de build. Vérifier les fichiers déjà suivis : ces règles ne retirent pas les secrets déjà commités.
Créer un .env.example avec des valeurs fictives et les noms attendus par le code.
Ne pas modifier l'identité Git globale ; préférer l'identité locale après accord.
Avant création GitHub ou push, confirmer le compte ou l'organisation, le nom, la visibilité, la branche et le contenu exact. Ne pas faire de git add . aveugle.

## 5. Relier Supabase distant

Utiliser un projet Supabase existant choisi explicitement. Toute création distante nécessite une confirmation séparée, y compris concernant les coûts.
Si supabase/config.toml n'existe pas, initialiser après accord :

```bash
npx supabase init
```

Lister les projets :

```bash
npx supabase projects list
```

Après confirmation du projet exact, remplacer la référence fictive ci-dessous avant exécution :

```bash
npx supabase link --project-ref <REFERENCE_PROJET>
```

La configuration locale n'est pas une stack locale : ne pas lancer supabase start.
Ne pas utiliser db pull, db diff ou db dump dans ce parcours sans Docker : les opérations de schéma peuvent nécessiter des conteneurs même quand la base cible est distante. Ne pas lancer db reset.

### Migrations distantes : étape optionnelle et sensible

Pour une base existante sans historique de migrations fiable, définir d'abord une stratégie de référence. Ne pas pousser un historique incomplet ou non vérifié.
Examiner les fichiers SQL, la cible et la stratégie de sauvegarde. Préférer un projet distant de développement ou staging pour les essais.
Prévisualiser :

```bash
npx supabase db push --dry-run
```

Ce mode indique les migrations prévues ; il ne garantit pas que le SQL réussira.
Après examen et confirmation explicite distincte :

```bash
npx supabase db push
```

## 6. Configurer les variables applicatives

Lire le code et la documentation du framework pour identifier les noms et fichiers attendus. Ne pas supposer que tous les projets utilisent les mêmes préfixes ni chargent .env.local.
Créer les fichiers locaux avec un éditeur sécurisé, sans écraser l'existant. Utiliser l'URL du projet Supabase distant et uniquement les clés adaptées à l'usage.
Ne jamais placer une clé secrète ou service_role dans le navigateur. Vérifier les politiques d'accès de la base avant exposition de données à une application cliente.
Séparer développement, prévisualisation et production afin d'éviter que les tests modifient les données de production.

## 7. Démarrer et vérifier l'application

Lister les scripts npm :

```bash
npm run
```

Si un script dev existe :

```bash
npm run dev
```

Sinon utiliser le script réel indiqué par le projet ; aucun serveur applicatif universel n'est fourni par cet export.
L'adresse et le port sont ceux annoncés par le serveur. Arrêter avec Ctrl+C.
Exécuter lint, tests et build seulement s'ils existent, après examen des scripts. Vérifier une requête applicative vers Supabase distant sans exposer de données sensibles.

## 8. Relier Vercel et déployer

Confirmer le compte, l'équipe et le projet exact avant :

```bash
vercel link
```

Attention : cette commande peut créer un projet distant. Ne pas valider une création sans accord.
Pour récupérer les variables Development, contrôler d'abord le fichier destination et son exclusion Git :

```bash
vercel env pull .env.local
```

Ne pas afficher le fichier produit. Adapter le fichier à ce que charge l'application. Pour vercel dev ou vercel build, consulter la procédure vercel pull au lieu de confondre les deux mécanismes.
Vérifier les variables du projet Vercel pour Development, Preview et Production.
Après accord, créer une prévisualisation :

```bash
vercel deploy
```

Après vérification et nouvelle confirmation pour la production :

```bash
vercel deploy --prod
```

Un push Git peut aussi déclencher un déploiement si une intégration existe : vérifier ce comportement avant de pousser.

## 9. Utiliser le skill

Placer SKILL.md et ce README dans un dossier dédié, par exemple node-vercel-supabase. Le format d'import et le répertoire de découverte dépendent de l'agent : ce guide n'invente pas de chemin universel.
Charger le skill via le mécanisme documenté de l'agent, ou lui fournir le fichier comme instruction. L'agent doit disposer d'un terminal pour effectuer une installation réelle.

Instruction de départ suggérée :

> Utilise le skill node-vercel-supabase. Audite ce dossier et la machine sans les modifier. Propose ensuite les installations nécessaires et attends mon accord. Supabase distant uniquement ; aucun Docker. Confirme séparément toute ressource distante, push, migration et déploiement.

## 10. Résultat attendu et dépannage

- Outil introuvable : vérifier le PATH et rouvrir le terminal après installation.
- Versions incompatibles : respecter le projet et choisir une version LTS maintenue compatible, sans remplacement aveugle.
- Permissions npm : diagnostiquer le préfixe utilisateur ; ne pas contourner avec sudo.
- Supabase réclame Docker : arrêter la commande, ne pas installer Docker et revenir au parcours distant compatible.
- Variables manquantes : vérifier leur nom, le chargement par le framework et la bonne cible Vercel sans afficher les valeurs.
- Migration incohérente : arrêter ; ne pas réparer automatiquement l'historique et ne pas réinitialiser la base.

Le bilan doit distinguer ce qui est installé, configuré, authentifié, testé et déployé, et mentionner les étapes non exécutées. La présence de ces fichiers ne signifie pas que l'environnement est installé.

## Documentation officielle

- Node.js : https://nodejs.org/en/download
- Git : https://git-scm.com/downloads
- GitHub CLI : https://cli.github.com/manual/
- Vercel CLI : https://vercel.com/docs/cli
- Parcours Vercel : https://vercel.com/docs/projects/deploy-from-cli
- Supabase CLI : https://supabase.com/docs/guides/local-development/cli/getting-started
- Référence Supabase : https://supabase.com/docs/reference/cli
- Migrations distantes : https://supabase.com/docs/guides/local-development/cli-workflows
