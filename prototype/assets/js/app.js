/* =============================================================================
   Signalement Public BF — interactions du prototype citoyen
   Prototype non fonctionnel : aucune requête réseau, aucun envoi réel.
   ========================================================================== */
(function () {
  'use strict';

  const D = SPBF;
  const $  = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  /* ---------- état ---------- */
  const state = {
    ecran: 'sc-accueil',
    step: 1,
    categorie: null,
    danger: null,
    photo: null,
    gps: false,
    ref: null
  };

  /* ---------- utilitaires ---------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  /* toast maison : reste à l'intérieur du cadre téléphone */
  function toast(msg, icon) {
    const host = document.getElementById('toastHost');
    if (!host) return;
    const el = document.createElement('div');
    el.className = 'spbf-toast';
    el.setAttribute('role', 'status');
    el.innerHTML = '<i class="material-icons">' + (icon || 'info') + '</i><span>' + msg + '</span>';
    host.appendChild(el);
    requestAnimationFrame(() => el.classList.add('is-in'));
    setTimeout(() => {
      el.classList.remove('is-in');
      setTimeout(() => el.remove(), 260);
    }, 3200);
  }

  /* fait défiler le message d'erreur pour qu'il reste visible au-dessus
     de la barre d'action collante */
  function showError(sel) {
    const el = $(sel);
    if (!el) return;
    el.style.display = 'flex';
    const sc = el.closest('[data-scroll]');
    if (sc) {
      const r = el.getBoundingClientRect();
      const s = sc.getBoundingClientRect();
      if (r.bottom > s.bottom - 70) sc.scrollTop += (r.bottom - s.bottom) + 80;
    }
  }

  function refAleatoire() {
    const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sans I, O, 0, 1
    let s = '';
    for (let i = 0; i < 8; i++) s += A[Math.floor(Math.random() * A.length)];
    return 'SPBF-' + s.slice(0, 4) + '-' + s.slice(4);
  }

  /* ---------- navigation ---------- */
  function show(id) {
    $$('.screen').forEach(s => s.classList.toggle('is-active', s.id === id));
    state.ecran = id;
    const sc = $('#' + id + ' [data-scroll]');
    if (sc) sc.scrollTop = 0;
    // synchronise la barre d'onglets
    $$('.tabbar button').forEach(b => b.classList.toggle('is-on', b.dataset.nav === id));
  }
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-nav]');
    if (!t) return;
    e.preventDefault();
    show(t.dataset.nav);
  });

  /* ---------- rendu catégories ---------- */
  function catCard(c) {
    return '<button class="cat" data-cat="' + c.id + '">' +
      '<span class="cat-ico"><i class="material-icons">' + c.icone + '</i></span>' +
      '<span class="cat-name">' + esc(c.nom) + '</span>' +
      '<span class="cat-ex">' + esc(c.exemples) + '</span></button>';
  }
  function renderCats() {
    const html = D.categories.map(catCard).join('');
    $('#cat-grid-accueil').innerHTML = html;
    $('#cat-grid-form').innerHTML = html;
  }
  function bindCats() {
    $$('.cat').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.dataset.cat;
        // dans l'accueil : on pré-sélectionne et on passe au formulaire
        if (el.closest('#cat-grid-accueil')) {
          state.categorie = id;
          renderCats();
          state.step = 1;
          show('sc-formulaire');
          syncStep();
          return;
        }
        state.categorie = id;
        $$('#cat-grid-form .cat').forEach(x => x.classList.toggle('is-sel', x.dataset.cat === id));
        $('#err-cat').style.display = 'none';
      });
    });
  }

  /* ---------- formulaire ---------- */
  const stepNames = { 1: 'Type de problème', 2: 'Localisation', 3: 'Description', 4: 'Photo et contact' };

  function syncStep() {
    const n = state.step;
    $$('.form-step').forEach(s => { s.style.display = s.dataset.step === String(n) ? 'block' : 'none'; });
    $$('#form-steps .st').forEach((s, i) => s.classList.toggle('is-on', i < n));
    $('#form-step-num').textContent = n;
    $('#form-step-name').textContent = stepNames[n];
    $('#btn-prev').style.display = n > 1 ? 'inline-flex' : 'none';
    $('#btn-next').innerHTML = n === 4
      ? 'Envoyer le signalement <i class="material-icons" style="margin:0 0 0 4px;">send</i>'
      : 'Continuer <i class="material-icons" style="margin:0 0 0 4px;">arrow_forward</i>';
  }

  function validateStep() {
    const n = state.step;
    let ok = true;
    if (n === 1) {
      if (!state.categorie) { showError('#err-cat'); ok = false; }
    }
    if (n === 2) {
      const commune = $('#f-commune').value;
      const repere  = $('#f-repere').value.trim();
      if (!state.gps && (!commune || !repere)) { showError('#err-lieu'); ok = false; }
      else if (state.gps && !commune) { showError('#err-lieu'); ok = false; }
      else $('#err-lieu').style.display = 'none';
    }
    if (n === 3) {
      const d = $('#f-desc').value.trim();
      if (d.length < 20) { showError('#err-desc'); $('#f-desc').classList.add('field-err'); ok = false; }
      else { $('#err-desc').style.display = 'none'; $('#f-desc').classList.remove('field-err'); }
    }
    return ok;
  }

  function next() {
    if (!validateStep()) return;
    if (state.step === 4) { submit(); return; }
    state.step++;
    syncStep();
  }
  function prev() {
    if (state.step > 1) { state.step--; syncStep(); }
  }

  /* GPS simulé : l'utilisateur peut refuser (CR01 / AC-04) */
  function askGps() {
    // le GPS est proposé seul ; en cas de refus, la saisie manuelle prend le relais
    // la moitié du temps, l'utilisateur refuse (cas testé dans le PRD)
    const refuse = Math.random() < 0.5;
    if (refuse) {
      state.gps = false;
      $('#err-gps').style.display = 'flex';
      $('#gps-ok').style.display = 'none';
      toast('Position non accordée — la saisie manuelle suffit.', 'location_off');
    } else {
      state.gps = true;
      $('#err-gps').style.display = 'none';
      $('#gps-ok').style.display = 'block';
      $('#gps-val').textContent = '12.3764, -1.5298';
      if (!$('#f-commune').value) $('#f-commune').value = SPBF.communes[2];
      if (!$('#f-repere').value.trim()) $('#f-repere').value = 'Position GPS partagée';
      toast('Position ajoutée.', 'my_location');
    }
  }

  /* Photo : simulation de refus de format non autorisé (CR02) */
  function pickPhoto() {
    // un tiers des Simulations produit un fichier refusé
    if (Math.random() < 0.33) {
      showError('#err-photo');
      toast('Fichier refusé. L\'envoi reste possible sans photo.', 'block');
      return;
    }
    state.photo = 'assets/img/signal-dechets.jpg';
    $('#photo-img').src = state.photo;
    $('#photo-zone-wrap').style.display = 'none';
    $('#photo-preview-wrap').style.display = 'block';
    $('#err-photo').style.display = 'none';
    toast('Photo jointe (facultative).', 'photo_camera');
  }
  function removePhoto() {
    state.photo = null;
    $('#photo-img').src = '';
    $('#photo-zone-wrap').style.display = 'block';
    $('#photo-preview-wrap').style.display = 'none';
  }

  /* Envoi : la référence n'apparaît qu'après "enregistrement confirmé" (CR03) */
  function submit() {
    const btn = $('#btn-next');
    btn.disabled = true;
    btn.innerHTML = 'Enregistrement…';
    setTimeout(() => {
      const ref = refAleatoire();
      state.ref = ref;
      $('#conf-ref').textContent = ref;
      btn.disabled = false;
      syncStep();
      show('sc-confirmation');
      toast('Signalement enregistré.', 'check_circle');
    }, 900);
  }

  /* ---------- suivi ---------- */
  function lookupSuivi(ref, fromAccueil) {
    const key = (ref || '').trim().toUpperCase();
    const d = D.suivi[key];
    if (!d) {
      // réponse identique quelle que soit la référence : aucune fuite d'information
      const err = fromAccueil ? $('#err-suivi-accueil') : $('#err-suivi');
      if (err) showError('#' + err.id);
      if (!fromAccueil) $('#suivi-detail').style.display = 'none';
      return;
    }
    const err = fromAccueil ? $('#err-suivi-accueil') : $('#err-suivi');
    if (err) err.style.display = 'none';
    if (fromAccueil) { show('sc-suivi'); $('#suivi-ref').value = key; }

    $('#sv-ref').textContent = key;
    const p = D.priorites[d.prio];
    $('#sv-pr').innerHTML = '<span class="pr ' + p.cls + '">' + p.label + '</span>';
    $('#sv-titre').textContent = d.titre;
    $('#sv-meta').innerHTML =
      '<span><i class="material-icons">category</i>' + esc(D.categorie(d.cat).nom) + '</span>' +
      '<span><i class="material-icons">place</i>' + esc(d.quartier) + ', ' + esc(d.zone) + '</span>' +
      '<span><i class="material-icons">schedule</i>Déposé le ' + esc(d.dateDepot) + '</span>';

    $('#sv-track').innerHTML = d.etapes.map(e =>
      '<div class="track-item ' + (e.done ? 'is-done' : '') + (e.cur ? 'is-now' : '') + '">' +
        '<div class="track-t">' + esc(e.t) + '</div>' +
        '<div class="track-d">' + esc(e.d) + (e.note ? ' — ' + esc(e.note) : '') + '</div>' +
      '</div>').join('');

    if (d.demande) {
      $('#sv-demande').style.display = 'block';
      $('#sv-demande-txt').textContent = d.demande;
    } else $('#sv-demande').style.display = 'none';

    if (d.cloture) {
      $('#sv-cloture').style.display = 'block';
      $('#sv-cloture-txt').textContent = d.cloture;
    } else $('#sv-cloture').style.display = 'none';

    $('#suivi-form').style.display = 'none';
    $('#suivi-detail').style.display = 'block';
  }

  function renderRecents() {
    const keys = Object.keys(D.suivi);
    $('#suivi-recents').innerHTML = keys.map(k => {
      const d = D.suivi[k];
      const s = D.statutInfo(d.statut);
      return '<div class="dossier-card" data-ref="' + k + '" style="cursor:pointer;">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">' +
          '<span class="dossier-ref">' + k + '</span>' +
          '<span class="st-pill ' + s.cls + '"><i class="material-icons">' + s.icone + '</i>' + s.label + '</span>' +
        '</div>' +
        '<div class="dossier-title">' + esc(d.titre) + '</div>' +
        '<div class="dossier-meta"><span><i class="material-icons">place</i>' + esc(d.zone) + '</span>' +
        '<span><i class="material-icons">schedule</i>' + esc(d.dateDepot) + '</span></div>' +
      '</div>';
    }).join('');
    $$('#suivi-recents .dossier-card').forEach(c => {
      c.addEventListener('click', () => lookupSuivi(c.dataset.ref, false));
    });
  }

  /* ---------- caméra ---------- */
  function bindCamera() {
    $$('.cam-mode').forEach(m => {
      m.addEventListener('click', () => {
        $$('.cam-mode').forEach(x => x.classList.remove('is-on'));
        m.classList.add('is-on');
        if (m.dataset.mode === 'video') toast('Le mode vidéo n\'est pas dans le périmètre du pilote.', 'videocam');
      });
    });
    $('#cam-back').addEventListener('click', () => show('sc-formulaire'));
    $('#cam-flip').addEventListener('click', () => toast('Caméra avant — non disponible dans le pilote.', 'flip_camera_ios'));
    $('#cam-shutter').addEventListener('click', () => {
      const flash = document.createElement('div');
      flash.style.cssText = 'position:absolute;inset:0;background:#fff;z-index:5;opacity:0;transition:opacity .18s';
      $('.cam-view').appendChild(flash);
      requestAnimationFrame(() => { flash.style.opacity = '1'; });
      setTimeout(() => {
        flash.style.opacity = '0';
        setTimeout(() => flash.remove(), 200);
        state.photo = 'assets/img/signal-dechets.jpg';
        $('#photo-img').src = state.photo;
        $('#photo-zone-wrap').style.display = 'none';
        $('#photo-preview-wrap').style.display = 'block';
        show('sc-formulaire');
        toast('Photo prise. Vous pouvez la retirer.', 'photo_camera');
      }, 160);
    });
  }

  /* ---------- init ---------- */
  function init() {
    renderCats();
    bindCats();
    bindCamera();

    // communes
    const sel = $('#f-commune');
    D.communes.forEach(c => {
      const o = document.createElement('option');
      o.value = c; o.textContent = c;
      sel.appendChild(o);
    });

    $('#btn-next').addEventListener('click', next);
    $('#btn-prev').addEventListener('click', prev);
    $('#btn-gps').addEventListener('click', askGps);
    $('#photo-zone').addEventListener('click', pickPhoto);
    $('#photo-rm').addEventListener('click', removePhoto);

    $$('#seg-danger .seg-opt').forEach(b => {
      b.addEventListener('click', () => {
        $$('#seg-danger .seg-opt').forEach(x => x.classList.remove('is-sel'));
        b.classList.add('is-sel');
        state.danger = b.dataset.level;
        $('#danger-alert').style.display = state.danger === 'eleve' ? 'block' : 'none';
      });
    });

    $('#btn-suivi').addEventListener('click', () => lookupSuivi($('#suivi-ref').value, false));
    $('#suivi-ref').addEventListener('keydown', e => { if (e.key === 'Enter') lookupSuivi($('#suivi-ref').value, false); });
    $('#btn-suivi-accueil').addEventListener('click', () => lookupSuivi($('#suivi-ref-accueil').value, true));
    $('#suivi-ref-accueil').addEventListener('keydown', e => { if (e.key === 'Enter') lookupSuivi($('#suivi-ref-accueil').value, true); });
    $('#btn-suivi-retour').addEventListener('click', () => {
      $('#suivi-form').style.display = 'block';
      $('#suivi-detail').style.display = 'none';
    });

    renderRecents();
    syncStep();
    show('sc-accueil');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
