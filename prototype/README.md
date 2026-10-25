# Prototype — Signalement Public BF

Prototype d'interface **non fonctionnel** construit sur **Materialize CSS 1.0.0**, d'après les maquettes de
référence fournies et les trois versions du PRD rangées dans `../kb/`.

## Voir le prototype

**En ligne : https://signalement-public-bf.vercel.app**

| Route | Contenu |
|---|---|
| `/` | Vitrine : planche des 8 écrans, captures de la console, couverture du PRD |
| `/citoyen` | Parcours citoyen mobile |
| `/console` | Console de traitement |

En local :

```bash
cd prototype
node server.js
# http://localhost:8099
```

Un serveur local est nécessaire pour des raisons de chemins relatifs (`file://` bloque certains navigateurs).
Aucune dépendance à installer : Materialize, jQuery et les polices sont servis depuis `vendor/`.

| Page | Contenu |
|---|---|
| `index.html` | Vitrine : présentation, planche des 8 écrans, captures de la console, couverture du PRD |
| `citoyen.html` | Parcours citoyen complet, dans un cadre téléphone |
| `console.html` | Console de traitement (desktop) |

## Ce que le prototype couvre

**Parcours citoyen** — 6 écrans : accueil, formulaire en 4 étapes (catégorie, localisation, description,
photo + contact), confirmation avec référence, suivi, et écran des limites du service.

**Console de traitement** — file de travail avec filtres, panneau dossier, risques immédiats, doublons,
dossiers à orienter, indicateurs, règles de routage, journal d'audit, rôles et accès.

## Règles métier appliquées dans l'interface

Elles viennent du PRD (§10.2, §11, critères CR02, CR03, CR06, CR07) et sont visibles à l'écran :

- Une référence **aléatoire non séquentielle** (`SPBF-XXXX-XXXX`) n'apparaît qu'après l'enregistrement simulé.
- Le **GPS est facultatif** : un refus de position ouvre la saisie manuelle (commune, quartier, repère) sans bloquer.
- La **photo est facultative** : un format non autorisé est refusé avec un message, l'envoi reste possible sans photo.
- La **description est obligatoire** (20 caractères minimum), avec message d'erreur sous le champ.
- Le **danger déclaré « élevé »** déclenche l'avertissement d'urgence.
- **« Transmis » est bloqué** sans transfert confirmé par le service destinataire ; sans accord actif, le dossier reste « À orienter ».
- La **fusion de doublons** conserve le dossier principal et les références liées ; rien n'est supprimé.
- Les **notes internes**, coordonnées exactes et contacts ne sont jamais visibles dans l'écran de suivi.
- Le **citoyen n'accède pas à la console** ; chaque agent est présenté avec un périmètre restreint.

## Limites assumées

- Aucune requête réseau : tout se joue en JavaScript sur des données simulées (`assets/js/data.js`).
- Les refus aléatoires (position non accordée, fichier non autorisé) servent à montrer les cas d'erreur du PRD.
- Le changement de statut n'est pas persisté : recharger la page réinitialise la démonstration.
- Notifications, carte publique, multilinguisme, PWA et application native ne sont pas traités (hors périmètre PRD).

## Organisation

```
prototype/
├─ index.html            vitrine
├─ citoyen.html          parcours mobile
├─ console.html          console agent
├─ server.js             serveur statique local (port 8099)
├─ assets/
│  ├─ css/app.css        design system (tokens, composants, overrides Materialize)
│  ├─ js/data.js         jeu de données de démonstration
│  ├─ js/app.js          interactions du parcours citoyen
│  ├─ js/console.js      interactions de la console
│  ├─ img/               photos d'illustration nettoyées des maquettes de référence
│  └─ shots/             captures d'écran de la vitrine
└─ vendor/               Materialize 1.0.0, jQuery 3.7.1, Material Icons, Public Sans, IBM Plex Mono
```

## Parti pris visuel

Les couleurs ont été prélevées sur les maquettes de référence : dégradé teal `#0CB8C3` → bleu `#0068C3`,
ambre de repérage `#DEA629`, fond gris `#EDEDED`. Les champs « pill » avec icône, les cartes blanches
et la barre de navigation basse reprennent le vocabulary de la seconde maquette ; l'écran de capture
reproduit le principe de viseur de la première. Typographie : Public Sans (texte) et IBM Plex Mono
(références de dossier).

## Avant toute mise en production

Ce prototype ne dispense d'aucune des conditions listées dans le PRD (§20) : identification de l'opérateur
et du responsable de traitement, au moins un circuit de réception confirmé par catégorie activée, revue
juridique (loi n° 037-2026/ALP, décret n° 2026-1034/PF), hébergement vérifié, référence non devinable
et contrôle d'accès appliqué côté serveur.
