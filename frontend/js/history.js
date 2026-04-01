/* ═══════════════════════════════════════════════════════
   history.html — Edit Timer & Inline Editing
   ═══════════════════════════════════════════════════════ */

var HISTORY_EDIT_WINDOW_MS = 5 * 60 * 1000; // 5 Minuten
var historyTimerInterval = null;

/**
 * Initialisiert alle bearbeitbaren History-Karten.
 * Jede Karte mit data-submitted-at="LIVE_TIMER" bekommt einen
 * Live-Countdown basierend auf dem submitted_at Timestamp.
 *
 * In Produktion: data-submitted-at enthält den echten ISO-Timestamp
 * vom Backend (z.B. "2026-04-01T14:30:00Z").
 */
function initHistoryTimers() {
  var editableCards = document.querySelectorAll('.history-card[data-submitted-at="LIVE_TIMER"]');
  if (editableCards.length === 0) return;

  editableCards.forEach(function (card) {
    var cardId = card.id.replace('card-', '');

    // Demo: simuliert "vor 30 Sekunden gesendet"
    // In Produktion: aus data-submitted-at parsen
    var submittedAt = new Date(Date.now() - 30 * 1000);

    // Timestamp anzeigen
    var tsEl = document.getElementById('timestamp-' + cardId);
    if (tsEl) {
      var h = String(submittedAt.getHours()).padStart(2, '0');
      var m = String(submittedAt.getMinutes()).padStart(2, '0');
      tsEl.textContent = h + ':' + m + ' Uhr';
    }

    // Timer starten
    startHistoryTimer(cardId, submittedAt);
  });
}

function startHistoryTimer(cardId, submittedAt) {
  var timerFill = document.getElementById('timerFill-' + cardId);
  var timerTime = document.getElementById('timerTime-' + cardId);
  var timerBar = document.getElementById('timer-' + cardId);
  var editBtn = document.getElementById('editBtn-' + cardId);
  var card = document.getElementById('card-' + cardId);

  if (!timerFill || !timerTime || !timerBar || !editBtn || !card) return;

  function updateTimer() {
    var now = Date.now();
    var elapsed = now - submittedAt.getTime();
    var remaining = HISTORY_EDIT_WINDOW_MS - elapsed;

    if (remaining <= 0) {
      // Zeit abgelaufen
      timerTime.textContent = '0:00';
      timerFill.style.width = '0%';
      timerFill.classList.add('critical');
      timerTime.classList.add('critical');
      editBtn.disabled = true;
      card.classList.remove('editable');

      // Timer-Bar ersetzen
      timerBar.innerHTML =
        '<span class="edit-timer-icon">\uD83D\uDD12</span>' +
        '<span style="font-size:13px; color: var(--color-text-ghost); font-family: DM Sans, sans-serif;">Bearbeitungszeit abgelaufen \u2014 Feedback ist gesperrt</span>';
      timerBar.style.background = 'rgba(255, 255, 255, 0.02)';
      timerBar.style.borderColor = 'var(--color-border)';

      // Edit-Overlay schliessen falls offen
      var overlay = document.getElementById('editOverlay-' + cardId);
      if (overlay) overlay.classList.remove('active');

      clearInterval(historyTimerInterval);
      return;
    }

    var totalSec = Math.ceil(remaining / 1000);
    var min = Math.floor(totalSec / 60);
    var sec = totalSec % 60;
    var pct = (remaining / HISTORY_EDIT_WINDOW_MS) * 100;

    timerTime.textContent = min + ':' + String(sec).padStart(2, '0');
    timerFill.style.width = pct + '%';

    // Unter 60 Sekunden → kritisch (rot)
    if (totalSec <= 60) {
      timerFill.classList.add('critical');
      timerTime.classList.add('critical');
    }
  }

  updateTimer();
  historyTimerInterval = setInterval(updateTimer, 1000);
}

function initHistoryEditButtons() {
  // Alle Edit-Buttons finden
  var editBtns = document.querySelectorAll('[id^="editBtn-"]');
  editBtns.forEach(function (btn) {
    var cardId = btn.id.replace('editBtn-', '');

    btn.addEventListener('click', function () {
      var overlay = document.getElementById('editOverlay-' + cardId);
      if (overlay) {
        overlay.classList.toggle('active');
        if (overlay.classList.contains('active')) {
          btn.style.display = 'none';
        }
      }
    });
  });

  // Cancel-Buttons
  var cancelBtns = document.querySelectorAll('[id^="cancelEdit-"]');
  cancelBtns.forEach(function (cancelBtn) {
    var cardId = cancelBtn.id.replace('cancelEdit-', '');

    cancelBtn.addEventListener('click', function () {
      var overlay = document.getElementById('editOverlay-' + cardId);
      var editBtn = document.getElementById('editBtn-' + cardId);
      if (overlay) overlay.classList.remove('active');
      if (editBtn && !editBtn.disabled) editBtn.style.display = '';
    });
  });

  // Save-Buttons
  var saveBtns = document.querySelectorAll('[id^="saveEdit-"]');
  saveBtns.forEach(function (saveBtn) {
    var cardId = saveBtn.id.replace('saveEdit-', '');

    saveBtn.addEventListener('click', function () {
      var newStrengths = document.getElementById('editStrengths-' + cardId);
      var newImprovements = document.getElementById('editImprovements-' + cardId);
      var strengthsDisplay = document.getElementById('strengths-' + cardId);
      var improvementsDisplay = document.getElementById('improvements-' + cardId);

      // Texte aktualisieren
      if (newStrengths && strengthsDisplay) {
        strengthsDisplay.textContent = newStrengths.value;
      }
      if (newImprovements && improvementsDisplay) {
        improvementsDisplay.textContent = newImprovements.value;
      }

      // Overlay schliessen
      var overlay = document.getElementById('editOverlay-' + cardId);
      var editBtn = document.getElementById('editBtn-' + cardId);
      if (overlay) overlay.classList.remove('active');
      if (editBtn && !editBtn.disabled) editBtn.style.display = '';

      // Toast anzeigen
      showToast();
    });
  });
}
