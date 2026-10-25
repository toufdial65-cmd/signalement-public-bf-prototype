# Signalement Public BF — Prototype d'interface

Prototype **non fonctionnel** de la plateforme de signalement citoyen des problèmes de l'espace public
au Burkina Faso. Conçu d'après les trois versions du PRD du dossier `kb/` et les maquettes de référence.

## Sur ce dépôt

| Dossier | Contenu |
|---|---|
| `site/` | Le site statique déployable — c'est ce qui est publié |
| `prototype/` | Le code source de travail (identique à `site/` + serveur local + README détaillé) |
| `kb/` | Les cahiers des charges : `PRD_Signalement_Public_BF_*` |

## Voir le prototype

Le site est en ligne : **https://signalement-public-bf.vercel.app**

- `/` — vitrine : planche des 8 écrans, captures de la console, couverture du PRD
- `/citoyen` — parcours citoyen mobile (formulaire 4 étapes, confirmation, suivi)
- `/console` — console de traitement (file de tri, dossier, indicateurs, routage, audit)

En local :

```bash
cd prototype && node server.js   # http://localhost:8099
```

## Ce que ce prototype n'est pas

Ce n'est pas un service public officiel et il n'effectue aucun envoi : aucune donnée ne quitte le
navigateur, aucune référence n'est enregistrée, aucune photo n'est réellement prise. Les dossiers,
agents, organismes et indicateurs sont fictifs.

Avant toute mise en production, le PRD impose : identification de l'opérateur et du responsable de
traitement, au moins un circuit de réception confirmé par catégorie activée, revue juridique
(loi n° 037-2026/ALP, décret n° 2026-1034/PF), hébergement vérifié, référence non devinable et
contrôle d'accès appliqué côté serveur.

## Stack du prototype

Materialize CSS 1.0.0, jQuery 3.7.1, Public Sans, IBM Plex Mono, Material Icons — toutes les
dépendances sont versionnées dans `site/vendor/`, aucun appel réseau à l'exécution.
