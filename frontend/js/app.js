/**
 * app.js
 * Feedback Hub — All frontend logic
 * No inline handlers — everything is bound via addEventListener
 */

/* ═══════════════════════════════════════════════════════
   Shared: Toast / Submit
   ═══════════════════════════════════════════════════════ */

function showToast() {
  var toast = document.getElementById('toast');
  if (!toast) return;

  toast.style.display = 'block';
  toast.style.opacity = '1';
  toast.style.transition = 'none';

  setTimeout(function () {
    toast.style.transition = 'opacity 0.5s';
    toast.style.opacity = '0';
    setTimeout(function () {
      toast.style.display = 'none';
      toast.style.opacity = '1';
    }, 500);
  }, 3000);
}


/* ═══════════════════════════════════════════════════════
   feedback.html — Feedback Form Logic
   ═══════════════════════════════════════════════════════ */

var drivers = ['impact', 'ownership', 'collaboration', 'growth'];
var naState = { impact: false, ownership: false, collaboration: false, growth: false };

/* ─── Feature 2: Visibility ─── */
function onVisibilityChange() {
  var vis = document.querySelector('input[name="visibility"]:checked');
  var section = document.getElementById('feedbackSection');
  var anonWarning = document.getElementById('anonWarning');
  var anonRateLimit = document.getElementById('anonRateLimit');

  if (!vis || !section) return;

  if (vis.value === 'private') {
    anonWarning.style.display = 'block';
    anonRateLimit.style.display = 'flex';
    section.classList.remove('feedback-section-locked');
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

/* ─── Feature 6: N/A Toggle ─── */
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

/* ─── Feature 8: Character counter ─── */
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

/* ─── Form Validation ─── */
function validateForm() {
  var recipientEl = document.getElementById('recipientSelect');
  var cocEl = document.getElementById('cocAccepted');
  var btn = document.getElementById('submitBtn');
  var strengthsEl = document.getElementById('strengths');
  var improvementsEl = document.getElementById('improvements');
  var driverValidationEl = document.getElementById('driverValidation');
  var textValidationEl = document.getElementById('textValidation');

  // Only run on feedback.html
  if (!btn || !recipientEl) return;

  var vis = document.querySelector('input[name="visibility"]:checked');
  var recipient = recipientEl.value;
  var coc = cocEl ? cocEl.checked : false;

  // Visibility check
  var visOk = !!vis;
  if (vis && vis.value === 'private') {
    var anonCb = document.getElementById('anonUnderstood');
    visOk = anonCb ? anonCb.checked : false;
  }

  // Drivers: count rated (star selected) and N/A
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

  // Text validation
  var sLen = strengthsEl ? strengthsEl.value.length : 0;
  var iLen = improvementsEl ? improvementsEl.value.length : 0;
  var textOk = (sLen >= 200) || (iLen >= 200);

  // Show/hide validation messages
  if (driverValidationEl) {
    driverValidationEl.style.display = (ratedCount < 2 && (ratedCount + naCount) > 0) ? 'flex' : 'none';
  }
  if (textValidationEl) {
    textValidationEl.style.display = ((sLen > 0 || iLen > 0) && !textOk) ? 'flex' : 'none';
  }

  var allOk = visOk && recipient && driversOk && textOk && coc;
  btn.disabled = !allOk;
}


/* ═══════════════════════════════════════════════════════
   feedbackResponce.html — Locked Entry / Edit Timer
   ═══════════════════════════════════════════════════════ */

var countdownInterval = null;

function initEditWindow() {
  var editBtn = document.getElementById('editBtn');
  var lockIcon = document.getElementById('lockIcon');
  var lockStatus = document.getElementById('lockStatus');

  if (!editBtn || !lockIcon || !lockStatus) return;

  // Simulate: set to true if within 5 minutes of submission
  var isWithinEditWindow = false; // Change to true for demo

  if (isWithinEditWindow) {
    editBtn.style.display = 'inline-block';
    lockIcon.textContent = '🔓';
    lockStatus.textContent = 'Noch bearbeitbar (5 Minuten Fenster)';
  }
}

function startEditMode() {
  var editBtn = document.getElementById('editBtn');
  var countdown = document.getElementById('editCountdown');
  var countdownText = document.getElementById('countdownText');
  var countdownFill = document.getElementById('countdownFill');

  if (!editBtn || !countdown) return;

  editBtn.style.display = 'none';
  countdown.style.display = 'flex';

  var remaining = 300; // 5 minutes in seconds
  var total = 300;

  countdownInterval = setInterval(function () {
    remaining--;
    var min = Math.floor(remaining / 60);
    var sec = remaining % 60;
    countdownText.textContent = min + ':' + String(sec).padStart(2, '0') + ' verbleibend';
    countdownFill.style.width = ((remaining / total) * 100) + '%';

    if (remaining <= 60) {
      countdownFill.style.background = '#E52620';
    }

    if (remaining <= 0) {
      clearInterval(countdownInterval);
      countdownText.textContent = 'Bearbeitungszeit abgelaufen';
      countdownFill.style.width = '0%';
      document.getElementById('lockIcon').textContent = '🔒';
      document.getElementById('lockStatus').textContent = 'Feedback ist gesperrt';
    }
  }, 1000);
}


/* ═══════════════════════════════════════════════════════
   DOMContentLoaded — Bind ALL event listeners
   ═══════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function () {

  /* ─── feedback.html listeners ─── */

  // Form submit
  var feedbackForm = document.getElementById('feedbackForm');
  if (feedbackForm) {
    feedbackForm.addEventListener('submit', function (e) {
      e.preventDefault();
      showToast();
    });
  }

  // Visibility radio buttons
  var visPublic = document.getElementById('vis-public');
  var visPrivate = document.getElementById('vis-private');
  if (visPublic) visPublic.addEventListener('change', onVisibilityChange);
  if (visPrivate) visPrivate.addEventListener('change', onVisibilityChange);

  // Anonymous understood checkbox
  var anonUnderstood = document.getElementById('anonUnderstood');
  if (anonUnderstood) anonUnderstood.addEventListener('change', onAnonCheckboxChange);

  // Recipient select
  var recipientEl = document.getElementById('recipientSelect');
  if (recipientEl) recipientEl.addEventListener('change', validateForm);

  // Code of Conduct checkbox
  var cocEl = document.getElementById('cocAccepted');
  if (cocEl) cocEl.addEventListener('change', validateForm);

  // N/A buttons for each driver
  drivers.forEach(function (d) {
    var naBtn = document.getElementById('na-' + d);
    if (naBtn) {
      naBtn.addEventListener('click', function () {
        toggleNA(d);
      });
    }
  });

  // Star radio buttons for each driver
  drivers.forEach(function (d) {
    var radios = document.querySelectorAll('input[name="' + d + '"]');
    radios.forEach(function (r) {
      r.addEventListener('change', validateForm);
    });
  });

  // Textareas char count
  var strengthsEl = document.getElementById('strengths');
  var improvementsEl = document.getElementById('improvements');
  if (strengthsEl) {
    strengthsEl.addEventListener('input', function () {
      updateCharCount('strengths');
    });
  }
  if (improvementsEl) {
    improvementsEl.addEventListener('input', function () {
      updateCharCount('improvements');
    });
  }

  /* ─── feedbackResponce.html listeners ─── */

  // Edit button
  var editBtn = document.getElementById('editBtn');
  if (editBtn) {
    editBtn.addEventListener('click', startEditMode);
  }

  // Init edit window state
  initEditWindow();
});
