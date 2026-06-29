/**
 * pages/feedback.js
 * Feedback Hub — Feedback-Formular dynamisch rendern + Validierung + Einreichung
 */

(function () {

  var drivers = ['impact', 'ownership', 'collaboration', 'growth'];
  var naState = { impact: false, ownership: false, collaboration: false, growth: false };
  var DRIVER_IDS = {
    impact:        '2351a418-1438-4a29-b6b3-3948c184d663',
    ownership:     'dafa9c71-f956-40f8-83fc-6c74986f5c87',
    collaboration: '6d33489b-53b6-4d35-a879-5b7a880e55e6',
    growth:        '90d9078b-3195-4f30-9b72-f9c3b9581980'
  };

  function getDriverId(driverKey) {
    var id = DRIVER_IDS[driverKey];
    if (!id || id === '00000000-0000-0000-0000-000000000000') {
      throw new Error('Driver-GUID fehlt für "' + driverKey + '" — DRIVER_IDS in feedback.js befüllen.');
    }
    return id;
  }

  /* ═══════════════════════════════════════════════════════
     Render Recipients Dropdown
     ═══════════════════════════════════════════════════════ */

  async function renderRecipients() {
    var el = document.getElementById('recipientSelect');
    if (!el) return;
    var recipients = await FeedbackAPI.getRecipients();
    var html = '<option value="">' + I18n.t('feedback.recipient_placeholder') + '</option>';
    recipients.forEach(function (r) {
      html += '<option value="' + r.value + '">' + r.label + '</option>';
    });
    el.innerHTML = html;
  }

  /* ═══════════════════════════════════════════════════════
     Render Driver Stars
     ═══════════════════════════════════════════════════════ */

  function renderDrivers() {
    var container = document.getElementById('drivers-container');
    if (!container) return;
    var defs = FeedbackAPI.getDriverDefinitions();

    var html = defs.map(function (d) {
      var starsHtml = '';
      for (var i = 5; i >= 1; i--) {
        var id = d.prefix + i;
        starsHtml += '<input type="radio" name="' + d.key + '" id="' + id + '" value="' + i + '"/>' +
          '<label for="' + id + '" data-tooltip="' + I18n.t('driver.' + d.key + '.' + i) + '">★</label>';
      }

      return '<div class="cat-card" id="driver-' + d.key + '">' +
        '<div class="flex items-center justify-between mb-1">' +
        '<div class="flex items-center gap-3">' +
        '<div class="num-badge">' + d.number + '</div>' +
        '<span class="text-white text-sm font-medium">' + I18n.t('driver.' + d.key) + '</span>' +
        '</div>' +
        '<div class="flex items-center gap-2">' +
        '<button type="button" class="na-btn" id="na-' + d.key + '" title="N/A - Nicht beurteilbar">N/A</button>' +
        '<div class="stars" id="stars-' + d.key + '">' + starsHtml + '</div>' +
        '</div></div></div>';
    }).join('\n');

    container.innerHTML = html;
  }

  /* ═══════════════════════════════════════════════════════
     Render Code of Conduct
     ═══════════════════════════════════════════════════════ */

  function renderCoC() {
    var el = document.getElementById('coc-list');
    if (!el) return;
    var items = I18n.t('feedback.coc.items');
    var html = items.map(function (item) {
      return '<li>' + item + '</li>';
    }).join('\n');
    el.innerHTML = html;

    var modalList = document.getElementById('coc-modal-list');
    if (modalList) modalList.innerHTML = html;
  }

  function bindCoCPopup() {
    var link = document.getElementById('cocPopupLink');
    var modal = document.getElementById('cocModal');
    var closeBtn = document.getElementById('closeCocModal');
    if (!link || !modal) return;

    link.addEventListener('click', function (e) {
      e.preventDefault();
      modal.classList.add('show');
    });
    if (closeBtn) closeBtn.addEventListener('click', function () { modal.classList.remove('show'); });
    modal.addEventListener('click', function (e) { if (e.target === modal) modal.classList.remove('show'); });
  }

  /* ═══════════════════════════════════════════════════════
     Visibility Logic
     ═══════════════════════════════════════════════════════ */

  function onVisibilityChange() {
    var vis = document.querySelector('input[name="visibility"]:checked');
    var section = document.getElementById('feedbackSection');
    var anonWarning = document.getElementById('anonWarning');
    var anonRateLimit = document.getElementById('anonRateLimit');

    if (!vis || !section) return;

    if (vis.value === 'private') {
      anonWarning.style.display = 'block';
      anonRateLimit.style.display = 'flex';
      section.classList.add('feedback-section-locked');
      onAnonCheckboxChange();
    } else {
      anonWarning.style.display = 'none';
      anonRateLimit.style.display = 'none';
      section.classList.remove('feedback-section-locked');
    }
    validateForm();
  }

  function onAnonCheckboxChange() {
    var vis = document.querySelector('input[name="visibility"]:checked');
    var section = document.getElementById('feedbackSection');
    var cb = document.getElementById('anonUnderstood');

    if (!vis || !section || !cb) return;

    if (vis.value === 'private') {
      if (cb.checked) {
        section.classList.remove('feedback-section-locked');
      } else {
        section.classList.add('feedback-section-locked');
      }
    }
    validateForm();
  }

  /* ═══════════════════════════════════════════════════════
     N/A Toggle
     ═══════════════════════════════════════════════════════ */

  function toggleNA(driver) {
    naState[driver] = !naState[driver];
    var btn = document.getElementById('na-' + driver);
    var starsEl = document.getElementById('stars-' + driver);
    var card = document.getElementById('driver-' + driver);

    if (!btn || !starsEl || !card) return;

    if (naState[driver]) {
      btn.classList.add('na-active');
      starsEl.classList.add('stars-disabled');
      var radios = starsEl.querySelectorAll('input[type="radio"]');
      radios.forEach(function (r) { r.checked = false; });
      card.classList.add('na-card');
    } else {
      btn.classList.remove('na-active');
      starsEl.classList.remove('stars-disabled');
      card.classList.remove('na-card');
    }
    validateForm();
  }

  /* ═══════════════════════════════════════════════════════
     Character Counter
     ═══════════════════════════════════════════════════════ */

  function updateCharCount(field) {
    var el = document.getElementById(field);
    var counter = document.getElementById(field + '-count');
    var counterWrap = document.getElementById(field + '-counter');

    if (!el || !counter || !counterWrap) return;

    var len = el.value.length;
    counter.textContent = len;

    if (len >= 200) {
      counterWrap.classList.add('char-ok');
      counterWrap.classList.remove('char-warn');
    } else if (len > 0) {
      counterWrap.classList.add('char-warn');
      counterWrap.classList.remove('char-ok');
    } else {
      counterWrap.classList.remove('char-ok', 'char-warn');
    }
    validateForm();
  }

  /* ═══════════════════════════════════════════════════════
     Form Validation
     ═══════════════════════════════════════════════════════ */

  function validateForm() {
    var recipientEl = document.getElementById('recipientSelect');
    var cocEl = document.getElementById('cocAccepted');
    var btn = document.getElementById('submitBtn');
    var strengthsEl = document.getElementById('strengths');
    var improvementsEl = document.getElementById('improvements');
    var driverValidationEl = document.getElementById('driverValidation');
    var textValidationEl = document.getElementById('textValidation');

    if (!btn || !recipientEl) return;

    var vis = document.querySelector('input[name="visibility"]:checked');
    var recipient = recipientEl.value;
    var coc = cocEl ? cocEl.checked : false;

    var visOk = !!vis;
    if (vis && vis.value === 'private') {
      var anonCb = document.getElementById('anonUnderstood');
      visOk = anonCb ? anonCb.checked : false;
    }

    var ratedCount = 0;
    var naCount = 0;
    drivers.forEach(function (d) {
      if (naState[d]) {
        naCount++;
      } else {
        var selected = document.querySelector('input[name="' + d + '"]:checked');
        if (selected) ratedCount++;
      }
    });
    var driversOk = ratedCount >= 2 && naCount <= 2;

    if (driverValidationEl) {
      driverValidationEl.style.display = driversOk ? 'none' : 'flex';
    }

    var sLen = strengthsEl ? strengthsEl.value.length : 0;
    var iLen = improvementsEl ? improvementsEl.value.length : 0;
    var textOk = (sLen >= 200) || (iLen >= 200);

    if (textValidationEl) {
      textValidationEl.style.display = textOk ? 'none' : 'flex';
    }

    var allOk = visOk && recipient && driversOk && textOk && coc;
    btn.disabled = !allOk;
  }

  /* ═══════════════════════════════════════════════════════
     Payload bauen
     ───────────────────────────────────────────────────────
     Entspricht SubmitFeedbackRequest im Backend:
       RecipientId, IsAnonymous, CocConfirmed,
       Ratings: [{ DriverId, Score, IsNa }],
       Strengths, AreasToImprove
     ═══════════════════════════════════════════════════════ */

  function buildPayload() {
    var recipientEl = document.getElementById('recipientSelect');
    var cocEl = document.getElementById('cocAccepted');
    var strengthsEl = document.getElementById('strengths');
    var improvementsEl = document.getElementById('improvements');
    var vis = document.querySelector('input[name="visibility"]:checked');

    var isAnonymous = !!(vis && vis.value === 'private');

    var ratings = drivers.map(function (d) {
      if (naState[d]) {
        return { driverId: getDriverId(d), score: null, isNa: true };
      }
      var selected = document.querySelector('input[name="' + d + '"]:checked');
      return {
        driverId: getDriverId(d),
        score:    selected ? parseInt(selected.value, 10) : null,
        isNa:     false
      };
    });

    // Leere Strings als null normalisieren (DB-Check-Constraint)
    var strengths      = strengthsEl    && strengthsEl.value.trim()    !== '' ? strengthsEl.value    : null;
    var areasToImprove = improvementsEl && improvementsEl.value.trim() !== '' ? improvementsEl.value : null;

    return {
      recipientId:    recipientEl.value,
      isAnonymous:    isAnonymous,
      cocConfirmed:   cocEl ? cocEl.checked : false,
      ratings:        ratings,
      strengths:      strengths,
      areasToImprove: areasToImprove
    };
  }

  /* ═══════════════════════════════════════════════════════
     Submit Handler
     ═══════════════════════════════════════════════════════ */

  async function handleSubmit(e) {
    e.preventDefault();

    var btn = document.getElementById('submitBtn');
    if (btn && btn.disabled) return;      // Validierung nicht erfüllt
    if (btn) btn.disabled = true;         // Doppel-Submit verhindern

    var payload;
    try {
      payload = buildPayload();
    } catch (err) {
      console.error('Payload-Aufbau fehlgeschlagen:', err);
      Render.showToast(I18n.t('feedback.toast_error') || 'Fehler beim Erstellen des Feedbacks.');
      validateForm();                     // Button-Zustand neu setzen
      return;
    }

    try {
      await FeedbackAPI.submitFeedback(payload);
      Render.showToast(I18n.t('feedback.toast_submitted'));
      // Nach erfolgreichem Senden zur Inbox wechseln
      window.location.href = 'index.html';
    } catch (err) {
      console.error('Feedback-Einreichung fehlgeschlagen:', err);

      var msgKey = err && err.errorCode
        ? 'feedback.error.' + err.errorCode
        : null;
      var msg = (msgKey && I18n.t(msgKey)) ||
        (I18n.t('feedback.toast_error')) ||
        'Feedback konnte nicht gesendet werden.';

      Render.showToast(msg);
      validateForm();                     // Button wieder freigeben, falls korrigierbar
    }
  }

  /* ═══════════════════════════════════════════════════════
     Bind Events
     ═══════════════════════════════════════════════════════ */

  function bindEvents() {
    // Form submit
    var feedbackForm = document.getElementById('feedbackForm');
    if (feedbackForm) {
      feedbackForm.addEventListener('submit', handleSubmit);
    }

    // Visibility
    var visPublic = document.getElementById('vis-public');
    var visPrivate = document.getElementById('vis-private');
    if (visPublic) visPublic.addEventListener('change', onVisibilityChange);
    if (visPrivate) visPrivate.addEventListener('change', onVisibilityChange);

    // Anon checkbox
    var anonUnderstood = document.getElementById('anonUnderstood');
    if (anonUnderstood) anonUnderstood.addEventListener('change', onAnonCheckboxChange);

    // Recipient
    var recipientEl = document.getElementById('recipientSelect');
    if (recipientEl) recipientEl.addEventListener('change', validateForm);

    // CoC
    var cocEl = document.getElementById('cocAccepted');
    if (cocEl) cocEl.addEventListener('change', validateForm);

    // N/A buttons
    drivers.forEach(function (d) {
      var naBtn = document.getElementById('na-' + d);
      if (naBtn) naBtn.addEventListener('click', function () { toggleNA(d); });
    });

    // Star radios
    drivers.forEach(function (d) {
      var radios = document.querySelectorAll('input[name="' + d + '"]');
      radios.forEach(function (r) { r.addEventListener('change', validateForm); });
    });

    // Textareas
    var strengthsEl = document.getElementById('strengths');
    var improvementsEl = document.getElementById('improvements');
    if (strengthsEl) strengthsEl.addEventListener('input', function () { updateCharCount('strengths'); });
    if (improvementsEl) improvementsEl.addEventListener('input', function () { updateCharCount('improvements'); });
  }

  /* ═══════════════════════════════════════════════════════
     Init
     ═══════════════════════════════════════════════════════ */

  async function init() {
    try {
      await FeedbackAPI.bootstrap();
    } catch (e) {
      console.error('Bootstrap fehlgeschlagen:', e);
      document.body.innerHTML = '<div style="padding:40px;color:#fff;font-family:sans-serif;">' +
        '<h1>Fehler beim Laden</h1>' +
        '<p>Status: ' + (e.status || 'unbekannt') + ' / ' + (e.errorCode || 'unknown') + '</p>' +
        '<p>Bitte Seite neu laden oder erneut anmelden.</p>' +
        '</div>';
      return;
    }

    var navEl = document.getElementById('navbar-container');
    if (navEl) navEl.innerHTML = Render.navbar('feedback');

    Render.initProfileDropdown();

    await renderRecipients();
    renderDrivers();
    renderCoC();
    bindEvents();
    bindCoCPopup();
    validateForm();
  }

  document.addEventListener('DOMContentLoaded', init);

})();
