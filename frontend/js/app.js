/**
 * app.js
 * Feedback Hub — All frontend logic
 */

/* ═══════════════════════════════════════════════════════
   Shared: Toast / Submit
   ═══════════════════════════════════════════════════════ */

function handleSubmit(e) {
  e.preventDefault();

  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.style.display = 'block';
  toast.style.opacity = '1';
  toast.style.transition = 'none';

  setTimeout(() => {
    toast.style.transition = 'opacity 0.5s';
    toast.style.opacity = '0';
    setTimeout(() => {
      toast.style.display = 'none';
      toast.style.opacity = '1';
    }, 500);
  }, 3000);
}


/* ═══════════════════════════════════════════════════════
   feedback.html — Feedback Form Logic
   ═══════════════════════════════════════════════════════ */

const drivers = ['impact', 'ownership', 'collaboration', 'growth'];
const naState = { impact: false, ownership: false, collaboration: false, growth: false };

/* ─── Feature 2: Visibility ─── */
function onVisibilityChange() {
  const vis = document.querySelector('input[name="visibility"]:checked');
  const section = document.getElementById('feedbackSection');
  const anonWarning = document.getElementById('anonWarning');
  const anonRateLimit = document.getElementById('anonRateLimit');

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
  const vis = document.querySelector('input[name="visibility"]:checked');
  const section = document.getElementById('feedbackSection');
  const cb = document.getElementById('anonUnderstood');

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
  const btn = document.getElementById('na-' + driver);
  const starsEl = document.getElementById('stars-' + driver);
  const card = document.getElementById('driver-' + driver);

  if (!btn || !starsEl || !card) return;

  if (naState[driver]) {
    btn.classList.add('na-active');
    starsEl.classList.add('stars-disabled');
    const radios = starsEl.querySelectorAll('input[type="radio"]');
    radios.forEach(r => r.checked = false);
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
  const el = document.getElementById(field);
  const counter = document.getElementById(field + '-count');
  const counterWrap = document.getElementById(field + '-counter');

  if (!el || !counter || !counterWrap) return;

  const len = el.value.length;
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
  const recipientEl = document.getElementById('recipientSelect');
  const cocEl = document.getElementById('cocAccepted');
  const btn = document.getElementById('submitBtn');
  const strengthsEl = document.getElementById('strengths');
  const improvementsEl = document.getElementById('improvements');
  const driverValidationEl = document.getElementById('driverValidation');
  const textValidationEl = document.getElementById('textValidation');

  // Only run on feedback.html
  if (!btn || !recipientEl) return;

  const vis = document.querySelector('input[name="visibility"]:checked');
  const recipient = recipientEl.value;
  const coc = cocEl ? cocEl.checked : false;

  // Visibility check
  let visOk = !!vis;
  if (vis && vis.value === 'private') {
    const anonCb = document.getElementById('anonUnderstood');
    visOk = anonCb ? anonCb.checked : false;
  }

  // Drivers: count rated (star selected) and N/A
  let ratedCount = 0;
  let naCount = 0;
  drivers.forEach(d => {
    if (naState[d]) {
      naCount++;
    } else {
      const selected = document.querySelector('input[name="' + d + '"]:checked');
      if (selected) ratedCount++;
    }
  });
  const driversOk = ratedCount >= 2 && naCount <= 2;

  // Text validation
  const sLen = strengthsEl ? strengthsEl.value.length : 0;
  const iLen = improvementsEl ? improvementsEl.value.length : 0;
  const textOk = (sLen >= 200) || (iLen >= 200);

  // Show/hide validation messages
  if (driverValidationEl) {
    driverValidationEl.style.display = (ratedCount < 2 && (ratedCount + naCount) > 0) ? 'flex' : 'none';
  }
  if (textValidationEl) {
    textValidationEl.style.display = ((sLen > 0 || iLen > 0) && !textOk) ? 'flex' : 'none';
  }

  const allOk = visOk && recipient && driversOk && textOk && coc;
  btn.disabled = !allOk;
}


/* ═══════════════════════════════════════════════════════
   feedbackResponce.html — Locked Entry / Edit Timer
   ═══════════════════════════════════════════════════════ */

let countdownInterval = null;

function initEditWindow() {
  const editBtn = document.getElementById('editBtn');
  const lockIcon = document.getElementById('lockIcon');
  const lockStatus = document.getElementById('lockStatus');

  if (!editBtn || !lockIcon || !lockStatus) return;

  // Simulate: set to true if within 5 minutes of submission
  const isWithinEditWindow = false; // Change to true for demo

  if (isWithinEditWindow) {
    editBtn.style.display = 'inline-block';
    lockIcon.textContent = '🔓';
    lockStatus.textContent = 'Noch bearbeitbar (5 Minuten Fenster)';
  }
}

function startEditMode() {
  const editBtn = document.getElementById('editBtn');
  const countdown = document.getElementById('editCountdown');
  const countdownText = document.getElementById('countdownText');
  const countdownFill = document.getElementById('countdownFill');

  if (!editBtn || !countdown) return;

  editBtn.style.display = 'none';
  countdown.style.display = 'flex';

  let remaining = 300; // 5 minutes in seconds
  const total = 300;

  countdownInterval = setInterval(() => {
    remaining--;
    const min = Math.floor(remaining / 60);
    const sec = remaining % 60;
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
   DOMContentLoaded — Init all pages
   ═══════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // feedback.html — event listeners for validation
  const recipientEl = document.getElementById('recipientSelect');
  const cocEl = document.getElementById('cocAccepted');

  if (recipientEl) {
    recipientEl.addEventListener('change', validateForm);
  }
  if (cocEl) {
    cocEl.addEventListener('change', validateForm);
  }

  drivers.forEach(d => {
    const radios = document.querySelectorAll('input[name="' + d + '"]');
    radios.forEach(r => r.addEventListener('change', validateForm));
  });

  // feedbackResponce.html — init edit window
  initEditWindow();
});
