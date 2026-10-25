/* =============================================================================
   Signalement Public BF — jeu de données de démonstration (prototype)
   Aucune donnée réelle. Les dossiers, agents et organismes sont fictifs.
   ========================================================================== */

const SPBF = (() => {

  /* --- Catégories & routage (PRD §9) --- */
  const categories = [
    { id: 'routes',  nom: 'Routes et voirie',       icone: 'add_road',            exemples: 'Nid-de-poule, chaussée affaissée', couleur: 'routes' },
    { id: 'elec',    nom: 'Électricité',             icone: 'electrical_services', exemples: 'Câble tombé, poteau fissuré',    couleur: 'elec' },
    { id: 'eau',     nom: 'Eau',                     icone: 'water_drop',          exemples: 'Conduite rompue, fuite',           couleur: 'eau' },
    { id: 'circ',    nom: 'Circulation',             icone: 'traffic',             exemples: 'Feu tricolore en panne',          couleur: 'circ' },
    { id: 'drain',   nom: 'Drainage et assainissement', icone: 'waves',            exemples: 'Caniveau bouché, égout débordé',  couleur: 'drain' },
    { id: 'dechets', nom: 'Déchets et propreté',    icone: 'delete_sweep',        exemples: 'Dépôt sauvage, collecte débordée', couleur: 'dechets' },
    { id: 'equip',   nom: 'Équipement public',       icone: 'parking',             exemples: 'Arrêt, banc, clôture abîmée',     couleur: 'equip' },
    { id: 'autre',   nom: 'Autre',                   icone: 'help_outline',        exemples: 'Problème public non couvert',     couleur: 'autre' }
  ];

  /* --- Statuts (PRD §11) --- */
  const statuts = {
    'recu':      { label: 'Reçu',                  icone: 'check_circle',        cls: 'st-recu' },
    'verifier':  { label: 'À vérifier',            icone: 'search',              cls: 'st-verifier' },
    'infos':     { label: 'Informations demandées', icone: 'help',               cls: 'st-infos' },
    'valide':    { label: 'Validé',                icone: 'verified',            cls: 'st-valide' },
    'orienter':  { label: 'À orienter',            icone: 'alt_route',           cls: 'st-orienter' },
    'transmis':  { label: 'Transmis',              icone: 'send',                cls: 'st-transmis' },
    'cours':     { label: 'Intervention en cours', icone: 'construction',        cls: 'st-cours' },
    'resolu':    { label: 'Résolu',                icone: 'task_alt',            cls: 'st-resolu' },
    'nonretenu': { label: 'Non retenu',            icone: 'block',               cls: 'st-nonret' },
    'doublon':   { label: 'Doublon lié',           icone: 'content_copy',        cls: 'st-doublon' }
  };

  /* --- Niveaux de priorité (PRD §10) --- */
  const priorites = {
    P1: { label: 'P1 · Risque immédiat', court: 'P1', cls: 'pr-1' },
    P2: { label: 'P2 · Danger élevé',     court: 'P2', cls: 'pr-2' },
    P3: { label: 'P3 · Problème courant', court: 'P3', cls: 'pr-3' },
    P4: { label: 'P4 · Amélioration',     court: 'P4', cls: 'pr-4' }
  };

  /* --- Dossiers de démonstration --- */
  const dossiers = [
    {
      ref: 'SPBF-7K4M-92QX', cat: 'elec', statut: 'verifier', prio: 'P1',
      titre: 'Câble électrique tombé sur le trottoir, Sparks Road',
      desc: "Un câble d'alimentation est tombé au sol et traverse le trottoir devant la pharmacie. Il touche la bordure du caniveau. Personne ne semble pouvoir le débrancher.",
      zone: 'Gounghin', quartier: 'Zone du marché', repere: 'Face pharmacie Saint Camille, côté arrêts',
      coords: '12.3764, -1.5298', danger: 'Élevé', date: '24 oct. 2026 · 09:12',
      photo: 'assets/img/signal-rue.jpg',
      doublonPossible: 2, copie: false, interne: 'À confirmer avec SONABEL avant 16 h. Zone à forte affluence le soir.',
      public: 'Votre signalement est en cours de vérification par un agent.'
    },
    {
      ref: 'SPBF-2QX8-31LM', cat: 'routes', statut: 'recu', prio: 'P3',
      titre: 'Nid-de-poule sur la chaussée, avenue de la Nation',
      desc: "Grand nid-de-poule d'environ 50 cm de diamètre au milieu de la voie, devant la station. Deux flaques profondes se forment après la pluie.",
      zone: 'Kossodo', quartier: 'Rond-point du Centre', repere: 'Face station de taxi, voie de droite',
      coords: '12.3612, -1.5155', danger: 'Moyen', date: '25 oct. 2026 · 07:48',
      photo: null, doublonPossible: 1, copie: false, interne: '',
      public: 'Votre signalement a bien été enregistré.'
    },
    {
      ref: 'SPBF-9JKP-44TN', cat: 'dechets', statut: 'transmis', prio: 'P3',
      titre: 'Dépôt sauvage de déchets ménagers, rue 30.118',
      desc: "Des sacs et des cartons sont entassés depuis plusieurs jours sur le côté de la rue, devant une clôture. La circulation des piétons est gênée.",
      zone: 'Dafra', quartier: 'Tanghin', repere: 'Angle rue 30.118 et avenue 12.201',
      coords: '12.3698, -1.5412', danger: 'Moyen', date: '23 oct. 2026 · 15:02',
      photo: 'assets/img/signal-dechets.jpg', doublonPossible: 0, copie: false,
      interne: 'Transfert confirmé par courriel le 23/10 — IService propreté, secteur 3.',
      public: 'Votre signalement a été transmis au service compétent.'
    },
    {
      ref: 'SPBF-5RTY-71BN', cat: 'circ', statut: 'infos', prio: 'P2',
      titre: 'Feu tricolore hors service au carrefour de la Justice',
      desc: "Le feu rouge reste éteint depuis ce matin. Les véhicules circulent à l'arrêt total, la file dépasse le pont.",
      zone: 'Pissy', quartier: 'Centre', repere: 'Carrefour Justice, axe nord-sud',
      coords: '12.3699, -1.5198', danger: 'Élevé', date: '25 oct. 2026 · 08:20',
      photo: null, doublonPossible: 1, copie: false,
      interne: 'Préciser demandée : le défaut concerne le feu rouge ou les trois feux ?',
      public: 'Une information complémentaire a été demandée.'
    },
    {
      ref: 'SPBF-8HVW-20ZC', cat: 'drain', statut: 'orienter', prio: 'P2',
      titre: 'Caniveau bouché, eau stagnante sur la voie',
      desc: "Le caniveau est complètement obstrué par des ordures et l'eau stagne sur environ 30 m de chaussée.",
      zone: 'Sig-Noghin', quartier: 'Nonsin', repere: "Près du pont, en face de l'école primaire",
      coords: '12.3885, -1.5041', danger: 'Moyen', date: '24 oct. 2026 · 11:35',
      photo: null, doublonPossible: 0, copie: false,
      interne: 'Gestionnaire du caniveau non identifié : confirmer commune ou opérateur.',
      public: 'Nous recherchons le service responsable.'
    },
    {
      ref: 'SPBF-3MNP-58QK', cat: 'eau', statut: 'valide', prio: 'P3',
      titre: 'Fuite d\'eau sur la conduite, rue de la Résidence',
      desc: "L'eau s'écoule en continu depuis le bord du trottoir depuis hier soir et stagne sur la chaussée.",
      zone: 'Karpala', quartier: 'Zone 2', repere: 'Devant la borne fontaine n°14',
      coords: '12.3703, -1.4930', danger: 'Moyen', date: '24 oct. 2026 · 17:41',
      photo: null, doublonPossible: 0, copie: false,
      interne: 'Infrastructure relevant de l\'opérateur — routage ONEA à confirmer.',
      public: 'Votre signalement a été validé par un agent.'
    },
    {
      ref: 'SPBF-6DLF-88VG', cat: 'equip', statut: 'cours', prio: 'P4',
      titre: 'Abribus effondré, arrêt de bus ligne 12',
      desc: "L'abri bus est penché, le toit ne tient plus. Les passagers attendent à l'arrêt.",
      zone: 'Tanghin', quartier: 'Karpala', repere: 'Arrêt ligne 12, face pharmacie',
      coords: '12.3688, -1.5006', danger: 'Faible', date: '22 oct. 2026 · 10:15',
      photo: null, doublonPossible: 0, copie: false,
      interne: 'Service comptabilité annoncé le 22/10. Relance prévue.',
      public: 'Une intervention a été annoncée par le service responsable.'
    },
    {
      ref: 'SPBF-1QZW-43JH', cat: 'routes', statut: 'nonretenu', prio: 'P4',
      titre: 'Requête concernant le stationnement devant un domicile',
      desc: "Le parking devant ma maison est toujours occupé, je demande que ça change.",
      zone: 'Ouaga 2000', quartier: 'Secteur 4', repere: 'Rue 10.07',
      coords: '12.3733, -1.5108', danger: 'Faible', date: '21 oct. 2026 · 13:22',
      photo: null, doublonPossible: 0, copie: true,
      interne: 'Conflit privé sans infrastructure concernée — motif standardisé appliqué.',
      public: 'Votre signalement n\'a pas été retenu : hors périmètre de la plateforme.'
    },
    {
      ref: 'SPBF-4YBD-67PC', cat: 'elec', statut: 'doublon', prio: 'P2',
      titre: 'Lampadaire éteint sur 200 m de l\'avenue',
      desc: "Plus aucun éclairage sur le tronçon entre le pont et le marché.",
      zone: 'Gounghin', quartier: 'Centre', repere: 'Après le pont, côté station',
      coords: '12.3781, -1.5270', danger: 'Moyen', date: '20 oct. 2026 · 19:55',
      photo: null, doublonPossible: 0, copie: true, principal: 'SPBF-2QX8-31LM',
      interne: 'Rattaché au dossier principal.',
      public: 'Ce signalement a été regroupé avec un dossier existant.'
    },
    {
      ref: 'SPBF-0XFC-95DL', cat: 'dechets', statut: 'recu', prio: 'P4',
      titre: 'Point de collecte débordant, rue 12.045',
      desc: "Les bacs débordent et les sacs sont entassés autour.",
      zone: 'Samp;Tanga', quartier: 'Boromo', repere: 'Angle rue 12.045',
      coords: '12.3602, -1.5223', danger: 'Faible', date: '25 oct. 2026 · 06:30',
      photo: null, doublonPossible: 1, copie: false, interne: '',
      public: 'Votre signalement a bien été enregistré.'
    }
  ];

  /* --- Historique de statut (append-only, PRD §10) --- */
  const historique = {
    'SPBF-7K4M-92QX': [
      { date: '24 oct. 2026 · 09:12', acteur: 'Citoyen (anonyme)', de: '—', vers: 'Reçu', motif: 'Dépôt enregistré', public: true },
      { date: '24 oct. 2026 · 09:40', acteur: 'Aminata Sawadogo · Tri', de: 'Reçu', vers: 'À vérifier', motif: 'Risque immédiat signalé — vérification humaine requise', public: true }
    ],
    'SPBF-9JKP-44TN': [
      { date: '23 oct. 2026 · 15:02', acteur: 'Citoyen (anonyme)', de: '—', vers: 'Reçu', motif: 'Dépôt enregistré', public: true },
      { date: '23 oct. 2026 · 16:10', acteur: 'Ibrahim Zongo · Tri', de: 'Reçu', vers: 'À vérifier', motif: 'Localisation et catégorie vérifiées', public: true },
      { date: '23 oct. 2026 · 16:35', acteur: 'Ibrahim Zongo · Tri', de: 'À vérifier', vers: 'Validé', motif: 'Dossier exploitable', public: true },
      { date: '23 oct. 2026 · 17:02', acteur: 'Ibrahim Zongo · Tri', de: 'Validé', vers: 'À orienter', motif: 'Gestionnaire à identifier', public: true },
      { date: '23 oct. 2026 · 17:20', acteur: 'Service propreté · Secteur 3', de: 'À orienter', vers: 'Transmis', motif: 'Transfert confirmé par courriel', public: true }
    ]
  };

  /* --- Organismes & règles de routage (PRD §9) --- */
  const organismes = [
    { nom: 'Service propreté — Secteur 3', cats: ['dechets'], zone: 'Dafra, Ouaga 2000', canal: 'Courriel opérationnel', actif: true,  verif: '12 oct. 2026' },
    { nom: 'Opérateur national — Électricité', cats: ['elec'], zone: 'National', canal: 'Guichet virtuel', actif: true, verif: '08 oct. 2026' },
    { nom: 'Opérateur national — Eau', cats: ['eau'], zone: 'National', canal: 'Déclaration de fuite', actif: true, verif: '08 oct. 2026' },
    { nom: 'Service technique communal', cats: ['routes', 'drain', 'equip'], zone: 'Communes pilotes', canal: 'Bon de commande', actif: true, verif: '18 oct. 2026' },
    { nom: 'Autorité de circulation', cats: ['circ'], zone: 'À confirmer', canal: 'Non établi', actif: false, verif: '—' }
  ];

  /* --- Rôles (PRD §4) --- */
  const roles = [
    { role: 'Citoyen', dossiers: 'Aucun accès à la console', actions: 'Déposer sans compte, suivre par référence', perms: ['depot', 'suivi'] },
    { role: 'Agent de tri', dossiers: 'Zones et catégories assignées', actions: 'Vérifier, prioriser, fusionner, demander une précision', perms: ['lecture', 'statut', 'doublon', 'orientation'] },
    { role: 'Service partenaire', dossiers: 'Dossiers affectés uniquement', actions: 'Consulter, renseigner les suites données', perms: ['lecture', 'suite'] },
    { role: 'Administrateur', dossiers: 'Périmètre complet', actions: 'Configurer, consulter indicateurs et audit', perms: ['config', 'audit', 'indicateurs'] }
  ];

  /* --- Journal d'audit (PRD §14, F05) --- */
  const audit = [
    { date: '25 oct. 2026 · 08:41', acteur: 'Aminata Sawadogo · Tri', action: 'Changement de statut', objet: 'SPBF-5RTY-71BN', detail: 'À vérifier → Informations demandées', resultat: 'Autorisé' },
    { date: '25 oct. 2026 · 08:12', acteur: 'Ibrahim Zongo · Tri', action: 'Consultation dossier', objet: 'SPBF-9JKP-44TN', detail: 'Vue complète', resultat: 'Autorisé' },
    { date: '24 oct. 2026 · 17:58', acteur: 'Fatoumata Diallo · Admin', action: 'Modification règle de routage', objet: 'Règle R-004', detail: 'Canal « Guichet virtuel » activé', resultat: 'Autorisé' },
    { date: '24 oct. 2026 · 16:20', acteur: 'Système', action: 'Accès refusé', objet: 'SPBF-1QZW-43JH', detail: 'Rôle « Service partenaire » — hors périmètre', resultat: 'Refusé' }
  ];

  /* --- Indicateurs (PRD §16) --- */
  const indicateurs = {
    kpis: [
      { lbl: 'Déôts sur 7 jours', val: '184', sub: '+12 % vs semaine précédente', spark: [3,5,4,6,5,7,8] },
      { lbl: 'Taux exploitable', val: '85 %', sub: 'Objectif de conception : 85 %', spark: [6,6,5,7,6,7,7] },
      { lbl: 'Délai moyen 1er tri', val: '6 h 40', sub: 'Moyenne sur dossiers P1–P3', spark: [7,6,7,5,5,4,4] },
      { lbl: 'Dossiers en attente', val: '27', sub: 'dont 9 de plus de 48 h', spark: [3,4,5,6,6,8,8], warn: true }
    ],
    volumes: [
      { lbl: 'Lun', v: 18 }, { lbl: 'Mar', v: 24 }, { lbl: 'Mer', v: 21 },
      { lbl: 'Jeu', v: 29 }, { lbl: 'Ven', v: 33 }, { lbl: 'Sam', v: 27 }, { lbl: 'Dim', v: 32 }
    ],
    repartition: [
      { lbl: 'Routes et voirie', v: 34, cat: 'routes' },
      { lbl: 'Déchets et propreté', v: 26, cat: 'dechets' },
      { lbl: 'Électricité', v: 18, cat: 'elec' },
      { lbl: 'Circulation', v: 12, cat: 'circ' },
      { lbl: 'Eau', v: 10, cat: 'eau' },
      { lbl: 'Assainissement', v: 8, cat: 'drain' },
      { lbl: 'Équipement public', v: 6, cat: 'equip' },
      { lbl: 'Autre', v: 6, cat: 'autre' }
    ]
  };

  /* --- Journal du citoyen (suivi) --- */
  const suivi = {
    'SPBF-9JKP-44TN': {
      cat: 'dechets', prio: 'P3', statut: 'transmis',
      titre: 'Dépôt sauvage de déchets ménagers, rue 30.118',
      zone: 'Dafra', quartier: 'Tanghin',
      dateDepot: '23 oct. 2026 · 15:02',
      etapes: [
        { t: 'Signalement reçu', d: '23 oct. 2026 · 15:02', done: true, cur: false, note: 'Référence attribuée. Le dossier est enregistré.' },
        { t: 'À vérifier', d: '23 oct. 2026 · 16:10', done: true, cur: false, note: 'Un agent a contrôlé la catégorie et la localisation.' },
        { t: 'Validé', d: '23 oct. 2026 · 16:35', done: true, cur: false, note: 'Le dossier est suffisamment précis pour être traité.' },
        { t: 'À orienter', d: '23 oct. 2026 · 17:02', done: true, cur: false, note: 'Identification du service responsable.' },
        { t: 'Transmis au service compétent', d: '23 oct. 2026 · 17:20', done: false, cur: true, note: 'Transfert confirmé. Le service compétent a reçu le dossier.' }
      ],
      demande: null,
      cloture: null
    },
    'SPBF-7K4M-92QX': {
      cat: 'elec', prio: 'P1', statut: 'verifier',
      titre: 'Câble électrique tombé sur le trottoir',
      zone: 'Gounghin', quartier: 'Zone du marché',
      dateDepot: '24 oct. 2026 · 09:12',
      etapes: [
        { t: 'Signalement reçu', d: '24 oct. 2026 · 09:12', done: true, cur: false, note: 'Référence attribuée.' },
        { t: 'À vérifier', d: '24 oct. 2026 · 09:40', done: false, cur: true, note: 'Un agent vérifie la situation sur place.' }
      ],
      demande: null,
      cloture: null
    }
  };

  /* --- Aides du formulaire --- */
  const communes = ['Arrondissement de Bogodogo', 'Arrondissement de Dafra', 'Arrondissement de Gounghin', 'Arrondissement de Kossodo', 'Arrondissement de Karpala', 'Arrondissement de Pissy', 'Arrondissement de Sampé', 'Arrondissement de Sig-Noghin', 'Arrondissement de Tanghin'];
  const quartiers = ['Zone du marché', 'Centre', 'Nonsin', 'Tanghin', 'Karpala', 'Secteur 4', 'Boromo', 'Zone 2'];

  const categorie = id => categories.find(c => c.id === id) || categories[categories.length - 1];
  const statutInfo = id => statuts[id] || statuts['recu'];

  return {
    categories, statuts, priorites, dossiers, historique, organismes, roles, audit,
    indicateurs, suivi, communes, quartiers, categorie, statutInfo
  };
})();
