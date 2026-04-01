/**
 * app.js
 * Feedback Hub — Logik für index.html + feedbackResponce.html
 * Feedback-Form-Logik wurde nach feedback.js ausgelagert
 */

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

  /* ─── feedbackResponce.html listeners ─── */

  var editBtn = document.getElementById('editBtn');
  if (editBtn) {
    editBtn.addEventListener('click', startEditMode);
  }

  initEditWindow();
});


/* ─── Profile Dropdown ────────────────────────────────────
   Für index.html + feedbackResponce.html
   ──────────────────────────────────────────────────────── */
const profileBtn      = document.getElementById('profileBtn');
const profileDropdown = document.getElementById('profileDropdown');
const logoutBtn       = document.getElementById('logoutBtn');

if (profileBtn && profileDropdown) {
  profileBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = profileDropdown.classList.toggle('is-open');
    profileBtn.setAttribute('aria-expanded', isOpen);
  });

  document.addEventListener('click', () => {
    profileDropdown.classList.remove('is-open');
    profileBtn.setAttribute('aria-expanded', 'false');
  });

  profileDropdown.addEventListener('click', (e) => e.stopPropagation());
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    // MSAL Logout — später mit echtem msalInstance.logoutRedirect() ersetzen
    window.location.href = 'index.html';
  });
}
