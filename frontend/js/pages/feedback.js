/**
 * pages/feedback.js
 * Feedback Hub — Feedback-Formular dynamisch rendern + Validierung
 */

(function () {

  var drivers = ['impact', 'ownership', 'collaboration', 'growth'];
  var naState = { impact: false, ownership: false, collaboration: false, growth: false };

  /* ═══════════════════════════════════════════════════════
     Render Recipients Dropdown
     ═══════════════════════════════════════════════════════ */

  function renderRecipients() {
    var el = document.getElementById('recipientSelect');
    if (!el) return;
    var recipients = FeedbackAPI.getRecipients();
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
          '<label for="' + id + '" data-tooltip="' + d.tooltips[i - 1] + '">★</label>';
      }

      return '<div class="cat-card" id="driver-' + d.key + '">' +
        '<div class="flex items-center justify-between mb-1">' +
        '<div class="flex items-center gap-3">' +
        '<div class="num-badge">' + d.number + '</div>' +
        '<span class="text-white text-sm font-medium">' + d.label + '</span>' +
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
    el.innerHTML = items.map(function (item) {
      return '<li>' + item + '</li>';
    }).join('\n');
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
     Bind Events
     ═══════════════════════════════════════════════════════ */

  function bindEvents() {
    // Form submit
    var feedbackForm = document.getElementById('feedbackForm');
    if (feedbackForm) {
      feedbackForm.addEventListener('submit', function (e) {
        e.preventDefault();
        Render.showToast('Feedback erfolgreich eingereicht');
      });
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

  function init() {
    // Navbar
    var navEl = document.getElementById('navbar-container');
    if (navEl) navEl.innerHTML = Render.navbar('feedback');

    // Dynamic content
    renderRecipients();
    renderDrivers();
    renderCoC();

    // Events
    bindEvents();

    // Profile Dropdown
    Render.initProfileDropdown();
  }

  document.addEventListener('DOMContentLoaded', init);

})();
