/* =============================================================================
   Signalement Public BF — interactions de la console de traitement
   Prototype non fonctionnel : aucune requête réseau, aucun enregistrement réel.
   ========================================================================== */
(function () {
  'use strict';

  const D = SPBF;
  const $  = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  const state = { vue: 'file', filtre: 'tous', dossier: null };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function toast(msg, icon) {
    M.toast({ html: '<i class="material-icons left">' + (icon || 'info') + '</i>' + msg, displayLength: 3600 });
  }

  /* ---------- KPI ---------- */
  function renderKpi(container) {
    $(container).innerHTML = D.indicateurs.kpis.map(k => {
      const spark = k.spark.map(v => {
        const max = Math.max.apply(null, k.spark);
        const h = Math.round((v / max) * 26);
        return '<i class="' + (v >= max - 1 ? 'on' : '') + '" style="height:' + Math.max(4, h) + 'px"></i>';
      }).join('');
      return '<div class="kpi' + (k.warn ? ' kpi--warn' : '') + '">' +
        '<div class="kpi-lbl">' + esc(k.lbl) + '</div>' +
        '<div class="kpi-val">' + esc(k.val) + '</div>' +
        '<div class="kpi-sub">' + esc(k.sub) + '</div>' +
        '<div class="kpi-spark">' + spark + '</div></div>';
    }).join('');
  }

  /* ---------- tableau ---------- */
  function rowHtml(d) {
    const s = D.statutInfo(d.statut);
    const p = D.priorites[d.prio];
    const c = D.categorie(d.cat);
    const dup = d.doublonPossible > 0
      ? ' <span class="pr pr-4" title="Doublon possible" style="vertical-align:1px;"><i class="material-icons" style="font-size:12px;vertical-align:-2px;">content_copy</i>' + d.doublonPossible + '</span>'
      : '';
    return '<tr data-ref="' + d.ref + '">' +
      '<td><span class="cell-ref">' + d.ref + '</span>' +
        (d.copie ? ' <span class="pr pr-4">copie</span>' : '') + '</td>' +
      '<td><div class="cell-title">' + esc(d.titre) + dup + '</div>' +
        '<div class="cell-sub"><i class="material-icons" style="font-size:12px;vertical-align:-2px;">' + c.icone + '</i> ' + esc(c.nom) + '</div></td>' +
      '<td><div class="cell-title" style="font-weight:500;font-size:12.5px;">' + esc(d.quartier) + '</div>' +
        '<div class="cell-sub">' + esc(d.zone) + '</div></td>' +
      '<td><span class="pr ' + p.cls + '">' + p.court + '</span></td>' +
      '<td><span class="st-pill ' + s.cls + '"><i class="material-icons">' + s.icone + '</i>' + s.label + '</span></td>' +
      '<td style="font-size:12px;color:var(--spbf-ink-3);">' + esc(d.date) + '</td>' +
      '<td><div class="rowact">' +
        '<button data-act="open" title="Ouvrir"><i class="material-icons">open_in_new</i></button>' +
        '<button data-act="merge" title="Lier à un doublon"><i class="material-icons">content_copy</i></button>' +
        '<button data-act="route" title="Orienter"><i class="material-icons">alt_route</i></button>' +
      '</div></td></tr>';
  }

  function applyFilters() {
    const cat = $('#f-cat').value;
    const st  = $('#f-statut').value;
    const zn  = $('#f-zone').value;
    const tx  = $('#f-texte').value.trim().toLowerCase();
    let list = D.dossiers.slice();
    if (cat) list = list.filter(d => d.cat === cat);
    if (st)  list = list.filter(d => d.statut === st);
    if (zn)  list = list.filter(d => d.zone === zn);
    if (tx)  list = list.filter(d => (d.ref + ' ' + d.titre + ' ' + d.desc + ' ' + d.quartier).toLowerCase().includes(tx));
    if (state.filtre === 'risque')   list = list.filter(d => d.prio === 'P1' || d.prio === 'P2');
    if (state.filtre === 'attente')  list = list.filter(d => d.statut === 'recu' || d.statut === 'infos');
    if (state.filtre === 'doublon')  list = list.filter(d => d.doublonPossible > 0);
    if (state.filtre === 'nonrecu')  list = list.filter(d => ['recu', 'verifier', 'valide', 'orienter'].includes(d.statut));
    return list;
  }

  function renderFile() {
    const list = applyFilters();
    $('#tbody-file').innerHTML = list.map(rowHtml).join('');
    $('#empty-file').style.display = list.length ? 'none' : 'block';
    bindRows('#tbody-file');
  }

  function renderAll() {
    const cat = $('#f-cat2').value, st = $('#f-statut2').value, tx = $('#f-texte2').value.trim().toLowerCase();
    let list = D.dossiers.slice();
    if (cat) list = list.filter(d => d.cat === cat);
    if (st)  list = list.filter(d => d.statut === st);
    if (tx)  list = list.filter(d => (d.ref + ' ' + d.titre).toLowerCase().includes(tx));
    $('#tbody-all').innerHTML = list.map(rowHtml).join('');
    bindRows('#tbody-all');
  }

  function bindRows(sel) {
    $$(sel + ' tr').forEach(tr => {
      tr.addEventListener('click', e => {
        const btn = e.target.closest('button[data-act]');
        if (btn) {
          e.stopPropagation();
          const ref = tr.dataset.ref;
          if (btn.dataset.act === 'open') openDetail(ref);
          if (btn.dataset.act === 'merge') actionMerge(ref);
          if (btn.dataset.act === 'route') actionRoute(ref);
          return;
        }
        openDetail(tr.dataset.ref);
      });
    });
  }

  /* ---------- vues dédiées ---------- */
  function renderListes() {
    const risque = D.dossiers.filter(d => d.prio === 'P1' || d.prio === 'P2');
    $('#risques-list').innerHTML = risque.map(d => cardHtml(d, true)).join('');
    $('#doublons-list').innerHTML = D.dossiers.filter(d => d.doublonPossible > 0 || d.copie).map(d => cardHtml(d)).join('');
    $('#orientation-list').innerHTML = D.dossiers.filter(d => d.statut === 'orienter' || d.statut === 'valide').map(d => cardHtml(d)).join('');
    $$('#risques-list .dossier-card, #doublons-list .dossier-card, #orientation-list .dossier-card').forEach(c => {
      c.addEventListener('click', () => openDetail(c.dataset.ref));
    });
  }
  function cardHtml(d, urgent) {
    const s = D.statutInfo(d.statut), p = D.priorites[d.prio];
    return '<div class="dossier-card" data-ref="' + d.ref + '" style="cursor:pointer;' + (urgent ? 'border-left:4px solid var(--spbf-red);' : '') + '">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">' +
        '<span class="dossier-ref">' + d.ref + '</span>' +
        '<span><span class="pr ' + p.cls + '">' + p.court + '</span> ' +
        '<span class="st-pill ' + s.cls + '"><i class="material-icons">' + s.icone + '</i>' + s.label + '</span></span>' +
      '</div>' +
      '<div class="dossier-title">' + esc(d.titre) + '</div>' +
      '<div class="dossier-meta"><span><i class="material-icons">place</i>' + esc(d.quartier) + ', ' + esc(d.zone) + '</span>' +
      '<span><i class="material-icons">schedule</i>' + esc(d.date) + '</span></div>' +
      (d.doublonPossible > 0 ? '<div class="hint" style="margin-top:6px;color:var(--spbf-amber-deep);"><i class="material-icons" style="font-size:13px;vertical-align:-2px;">content_copy</i> ' + d.doublonPossible + ' dossier(s) possible(s) en doublon</div>' : '') +
    '</div>';
  }

  /* ---------- panneau dossier ---------- */
  function openDetail(ref) {
    const d = D.dossiers.find(x => x.ref === ref);
    if (!d) return;
    state.dossier = d;
    const s = D.statutInfo(d.statut), p = D.priorites[d.prio], c = D.categorie(d.cat);

    $('#d-ref').textContent = d.ref;
    $('#d-statut').innerHTML = '<span class="st-pill ' + s.cls + '"><i class="material-icons">' + s.icone + '</i>' + s.label + '</span>';
    $('#d-prio').innerHTML = '<span class="pr ' + p.cls + '">' + p.label + '</span>';

    const hist = D.historique[d.ref] || [];
    const histHtml = hist.length
      ? '<div class="track">' + hist.map(h =>
          '<div class="track-item is-done"><div class="track-t">' + esc(h.de) + ' → ' + esc(h.vers) + '</div>' +
          '<div class="track-d">' + esc(h.date) + ' · ' + esc(h.acteur) + ' — ' + esc(h.motif) + '</div></div>').join('') + '</div>'
      : '<p class="hint" style="margin:0;">Aucun événement enregistré pour ce dossier.</p>';

    $('#d-body').innerHTML =
      '<h4>Problème</h4>' +
      '<div style="font-size:13.5px;font-weight:600;line-height:1.35;margin-bottom:8px;">' + esc(d.titre) + '</div>' +
      '<div style="font-size:13px;line-height:1.55;color:var(--spbf-ink-2);">' + esc(d.desc) + '</div>' +

      (d.photo
        ? '<h4>Photo jointe</h4><div class="detail-photo"><img src="' + d.photo + '" alt="Photo du signalement"></div>'
        : '<h4>Photo jointe</h4><p class="hint" style="margin:0;">Aucune photo. Le dépôt sans photo est recevable.</p>') +

      '<h4>Localisation</h4>' +
      '<dl class="kv">' +
        '<dt>Commune / secteur</dt><dd>' + esc(d.quartier) + ' — ' + esc(d.zone) + '</dd>' +
        '<dt>Repère</dt><dd>' + esc(d.repere) + '</dd>' +
        '<dt>Coordonnées</dt><dd style="font-family:var(--spbf-mono);font-size:12px;">' + esc(d.coords) + '</dd>' +
        '<dt>Danger déclaré</dt><dd>' + esc(d.danger) + '</dd>' +
        '<dt>Catégorie</dt><dd>' + esc(c.nom) + '</dd>' +
      '</dl>' +

      (d.doublonPossible > 0
        ? '<h4>Doublons</h4><div class="note-in"><i class="material-icons">content_copy</i>' +
          d.doublonPossible + ' dossier(s) proche(s) détecté(s). La fusion conserve le dossier principal et les références liées.' +
        '</div>'
        : '') +

      '<h4>Note interne</h4>' +
      (d.interne
        ? '<div class="note-in"><i class="material-icons">lock</i>' + esc(d.interne) + '</div>'
        : '<p class="hint" style="margin:0;">Aucune note interne. Les notes internes ne sont jamais visibles par le citoyen.</p>') +

      '<h4>Message public au citoyen</h4>' +
      '<div style="font-size:13px;color:var(--spbf-ink-2);background:#F6F8F9;border:1px solid var(--spbf-line);border-radius:10px;padding:11px 13px;line-height:1.5;">' + esc(d.public) + '</div>' +

      '<h4>Historique des statuts</h4>' + histHtml;

    $('#detail').classList.add('is-open');
    $('.console-main').classList.add('has-detail');
    $$('#tbody-file tbody tr, #tbody-all tbody tr').forEach(tr =>
      tr.classList.toggle('is-sel', tr.dataset.ref === ref));
  }

  /* ---------- actions avec règles métier ---------- */
  function openModal(opts) {
    $('#modal-title').textContent = opts.titre;
    $('#modal-sub').textContent = opts.sous || '';
    $('#modal-motif').value = opts.motif || '';
    $('#modal-err').style.display = 'none';
    $('#modal-extra').innerHTML = opts.extra || '';
    const inst = M.Modal.getInstance($('#modal-action'));
        inst.open();
        const okBtn = $('#modal-ok');
        okBtn.replaceWith(okBtn.cloneNode(true));
        $('#modal-ok').addEventListener('click', () => {
          const motif = $('#modal-motif').value.trim();
          if (opts.motifObligatoire && motif.length < 5) {
            $('#modal-err').style.display = 'flex';
            $('#modal-motif').classList.add('field-err');
            return;
          }
          inst.close();
          opts.onOk(motif);
        });
      }

  function actionMerge(ref) {
    const d = D.dossiers.find(x => x.ref === ref);
    if (!d) return;
    const extras = D.dossiers.filter(x => x.ref !== ref && x.cat === d.cat).slice(0, 3);
    openModal({
      titre: 'Lier à un dossier principal',
      sous: 'Le dossier principal est conservé. La référence ' + d.ref + ' reste consultable et traçable.',
      motif: 'Doublon confirmé : ' + d.titre,
      extra: '<p class="hint" style="margin-top:10px;">Dossier principal proposé :</p>' +
        extras.map((e, i) => '<label style="display:flex;gap:9px;align-items:flex-start;font-size:13px;padding:8px 0;border-bottom:1px solid var(--spbf-line);">' +
          '<input type="radio" name="principal" value="' + e.ref + '" ' + (i === 0 ? 'checked' : '') + ' style="margin-top:2px;">' +
          '<span><b style="font-family:var(--spbf-mono);font-size:12px;color:var(--spbf-blue-deep);">' + e.ref + '</b><br>' + esc(e.titre) + '</span></label>').join(''),
      onOk: () => {
        const sel = $('input[name=principal]:checked');
        toast('Dossier lié à ' + (sel ? sel.value : '—') + '. Fusion tracée dans l\'audit.', 'merge');
      }
    });
  }

  function actionRoute(ref) {
    const d = D.dossiers.find(x => x.ref === ref);
    if (!d) return;
    const cands = D.organismes.filter(o => o.actif && o.cats.includes(d.cat));
    if (!cands.length) {
      openModal({
        titre: 'Aucune destination confirmée',
        sous: 'Pour « ' + D.categorie(d.cat).nom + ' », aucun organisme n\'a un circuit actif dans cette zone.',
        motif: '',
        extra: '<div class="note-in" style="margin-top:12px;"><i class="material-icons">block</i>' +
          'La transition vers « Transmis » est bloquée tant qu\'un canal validé n\'existe pas. Le dossier reste « À orienter ».</div>',
        onOk: () => toast('Dossier conservé en « À orienter ». Aucun transfert enregistré.', 'lock')
      });
      return;
    }
    openModal({
      titre: 'Orienter le dossier',
      sous: 'Un transfert réel est nécessaire pour passer le dossier à « Transmis ».',
      motif: 'Routage confirmé vers ' + cands[0].nom,
      extra: '<div class="input-field" style="margin-top:14px;">' +
        '<select id="m-org">' + cands.map(o => '<option value="' + esc(o.nom) + '">' + esc(o.nom) + ' — ' + esc(o.canal) + '</option>').join('') + '</select></div>' +
        '<label style="display:flex;gap:9px;align-items:flex-start;font-size:13px;margin-top:4px;">' +
        '<input type="checkbox" id="m-confirme" style="margin-top:2px;">' +
        '<span>Le transfert a été effectué et la réception confirmée par le service destinataire.</span></label>',
      onOk: (motif) => {
        if (!($('#m-confirme') && $('#m-confirme').checked)) {
          toast('Transfert non confirmé : le dossier reste « À orienter ».', 'lock');
          return;
        }
        toast('Dossier transmis à ' + ($('#m-org') ? $('#m-org').value : '—') + '. Trace journalisée.', 'send');
      }
    });
  }

  function actionPrecision(ref) {
    const d = D.dossiers.find(x => x.ref === ref);
    if (!d) return;
    openModal({
      titre: 'Demander une précision',
      sous: 'La question sera visible par le déclarant. N\'exposez ni note interne ni coordonnée exacte.',
      motif: '',
      extra: '<div class="hint" style="margin-top:12px;">Le dossier passe au statut « Informations demandées » et attend une réponse.</div>',
      onOk: (motif) => {
        if (motif.length < 5) { toast('Motif obligatoire.', 'error'); return; }
        toast('Précision demandée au déclarant.', 'help');
      }
    });
  }

  /* ---------- vues ---------- */
  function showVue(v) {
    state.vue = v;
    $$('.vue').forEach(s => s.style.display = s.id === 'vue-' + v ? 'block' : 'none');
    $$('.nav-item').forEach(n => n.classList.toggle('is-on', n.dataset.vue === v));
    $('#detail').classList.remove('is-open');
    $('.console-main').classList.remove('has-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ---------- init ---------- */
  function init() {
    // Materialize 1.0.0 n'initialise pas automatiquement les modales
    M.Modal.init($('#modal-action'));

    renderKpi('#kpi-grid');
    renderKpi('#kpi-grid-2');
    renderFile();
    renderAll();
    renderListes();

    // sélecteurs
    const cat = $('#f-cat'), cat2 = $('#f-cat2');
    D.categories.forEach(c => {
      [cat, cat2].forEach(sel => {
        const o = document.createElement('option');
        o.value = c.id; o.textContent = c.nom;
        sel.appendChild(o);
      });
    });
    const st = $('#f-statut'), st2 = $('#f-statut2');
    Object.keys(D.statuts).forEach(k => {
      [st, st2].forEach(sel => {
        const o = document.createElement('option');
        o.value = k; o.textContent = D.statuts[k].label;
        sel.appendChild(o);
      });
    });
    const zn = $('#f-zone');
    Array.from(new Set(D.dossiers.map(d => d.zone))).sort().forEach(z => {
      const o = document.createElement('option');
      o.value = z; o.textContent = z;
      zn.appendChild(o);
    });

    ['#f-cat', '#f-statut', '#f-zone', '#f-texte'].forEach(s => $(s).addEventListener('input', renderFile));
    ['#f-cat2', '#f-statut2', '#f-texte2'].forEach(s => $(s).addEventListener('input', renderAll));

    $$('.fchip').forEach(c => {
      c.addEventListener('click', () => {
        $$('.fchip').forEach(x => x.classList.remove('is-on'));
        c.classList.add('is-on');
        state.filtre = c.dataset.f;
        renderFile();
      });
    });

    $$('.nav-item').forEach(n => {
      n.addEventListener('click', () => showVue(n.dataset.vue));
    });

    // organismes
    $('#tbody-org').innerHTML = D.organismes.map(o =>
      '<tr><td><b>' + esc(o.nom) + '</b></td>' +
      '<td>' + o.cats.map(c => esc(D.categorie(c).nom)).join(', ') + '</td>' +
      '<td>' + esc(o.zone) + '</td>' +
      '<td>' + esc(o.canal) + '</td>' +
      '<td style="font-size:12px;color:var(--spbf-ink-3);">' + esc(o.verif) + '</td>' +
      '<td>' + (o.actif
        ? '<span class="st-pill st-valide"><i class="material-icons">check_circle</i>Actif</span>'
        : '<span class="st-pill st-nonret"><i class="material-icons">block</i>Inactif</span>') + '</td></tr>').join('');

    // audit
    $('#tbody-audit').innerHTML = D.audit.map(a =>
      '<tr><td style="font-size:12px;color:var(--spbf-ink-3);">' + esc(a.date) + '</td>' +
      '<td>' + esc(a.acteur) + '</td><td>' + esc(a.action) + '</td>' +
      '<td><span class="cell-ref">' + esc(a.objet) + '</span></td>' +
      '<td style="font-size:12.5px;color:var(--spbf-ink-2);">' + esc(a.detail) + '</td>' +
      '<td>' + (a.resultat === 'Autorisé'
        ? '<span class="st-pill st-valide"><i class="material-icons">check</i>' + esc(a.resultat) + '</span>'
        : '<span class="st-pill st-infos"><i class="material-icons">block</i>' + esc(a.resultat) + '</span>') + '</td></tr>').join('');

    // rôles
    $('#tbody-roles').innerHTML = D.roles.map(r =>
      '<tr><td><b>' + esc(r.role) + '</b></td>' +
      '<td style="font-size:12.5px;color:var(--spbf-ink-2);">' + esc(r.dossiers) + '</td>' +
      '<td style="font-size:12.5px;color:var(--spbf-ink-2);">' + esc(r.actions) + '</td></tr>').join('');

    // graphiques
    const maxV = Math.max.apply(null, D.indicateurs.volumes.map(v => v.v));
    $('#bars-volumes').innerHTML = D.indicateurs.volumes.map(v =>
      '<div class="bar-col"><span class="bar-val">' + v.v + '</span>' +
      '<div class="bar" style="height:' + Math.round((v.v / maxV) * 118) + 'px"></div>' +
      '<span class="bar-lbl">' + v.lbl + '</span></div>').join('');

    const maxR = Math.max.apply(null, D.indicateurs.repartition.map(r => r.v));
    $('#repartition').innerHTML = D.indicateurs.repartition.map(r =>
      '<div style="margin-bottom:11px;">' +
        '<div style="display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:4px;">' +
          '<span>' + esc(r.lbl) + '</span><b>' + r.v + ' %</b></div>' +
        '<div style="height:7px;background:var(--spbf-line);border-radius:999px;overflow:hidden;">' +
          '<div style="height:100%;width:' + Math.round((r.v / maxR) * 100) + '%;background:var(--spbf-grad-flat);border-radius:999px;"></div>' +
        '</div></div>').join('');

    // actions
    $('#detail-close').addEventListener('click', () => {
      $('#detail').classList.remove('is-open');
      $('.console-main').classList.remove('has-detail');
    });
    $('#d-precis').addEventListener('click', () => state.dossier && actionPrecision(state.dossier.ref));
    $('#d-valider').addEventListener('click', () => {
      if (!state.dossier) return;
      openModal({
        titre: 'Valider le dossier',
        sous: 'Le dossier devient exploitable et peut être orienté.',
        motif: 'Catégorie, description et localisation vérifiées.',
        onOk: () => toast('Dossier validé. Il rejoignant la file d\'orientation.', 'verified')
      });
    });
    $('#btn-export').addEventListener('click', () =>
      toast('Export agrégé généré. Les données personnelles ne sont pas incluses.', 'download'));
    $('#recherche').addEventListener('input', e => {
      $('#f-texte').value = e.target.value;
      renderFile();
    });

    showVue('file');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
