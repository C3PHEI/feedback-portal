/**
 * pages/history.js
 * Feedback Hub — History-Seite dynamisch rendern
 */

(function () {

  var HISTORY_EDIT_WINDOW_MS = 5 * 60 * 1000;
  var historyTimerInterval = null;

  /* ═══════════════════════════════════════════════════════
     Render Driver Ratings
     ═══════════════════════════════════════════════════════ */

  function renderDrivers(drivers) {
    return '<div class="history-drivers mb-4">' +
      drivers.map(function (d) {
        var val;
        if (d.na) {
          val = '<span class="history-driver-na">N/A</span>';
        } else {
          val = '<span class="history-driver-stars">' + Render.stars(d.rating) + '</span>';
        }
        return '<div class="history-driver">' +
          '<span class="history-driver-name">' + d.name + '</span>' +
          val + '</div>';
      }).join('\n') +
      '</div>';
  }

  /* ═══════════════════════════════════════════════════════
     Render Visibility Badge
     ═══════════════════════════════════════════════════════ */

  function visBadge(visibility) {
    if (visibility === 'anon') {
      return '<span class="vis-badge anon">' +
        '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">' +
        '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>' +
        '<line x1="1" y1="1" x2="23" y2="23"/></svg> Anonym</span>';
    }
    return '<span class="vis-badge named">Namentlich</span>';
  }

  /* ═══════════════════════════════════════════════════════
     Render Single Card
     ═══════════════════════════════════════════════════════ */

  function renderCard(fb) {
    var isEditable = fb.submittedAt === 'LIVE_TIMER';
    var cardClass = 'history-card' + (isEditable ? ' editable' : '');

    // Avatar
    var avatarHtml;
    if (fb.visibility === 'anon') {
      avatarHtml = Render.avatar(null, { anonIcon: true, style: fb.avatarStyle || '' });
    } else {
      avatarHtml = Render.avatar(fb.to.initials, { style: fb.avatarStyle || '' });
    }

    // Header
    var headerRight;
    if (isEditable) {
      headerRight = '<button class="btn-edit-history" id="editBtn-' + fb.id + '" title="Feedback bearbeiten">' +
        Render.editIconSvg(14) + ' Bearbeiten</button>';
    } else {
      headerRight = '<span class="lock-badge">\uD83D\uDD12 Gesperrt</span>';
    }

    // Badges
    var badgesHtml = '<span class="history-date">' + fb.dateLabel + '</span>';
    if (isEditable) {
      badgesHtml += '<span class="history-timestamp" id="timestamp-' + fb.id + '">\u2014</span>';
    }
    badgesHtml += visBadge(fb.visibility);
    if (fb.edited) {
      badgesHtml += '<span class="edited-badge">' +
        '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">' +
        '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>' +
        '<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> bearbeitet</span>';
    }

    // Timer bar (only for editable)
    var timerHtml = '';
    if (isEditable) {
      timerHtml = '<div class="edit-timer-bar mb-4" id="timer-' + fb.id + '">' +
        '<span class="edit-timer-icon">\uD83D\uDD13</span>' +
        '<span class="edit-timer-text">Noch bearbeitbar</span>' +
        '<div class="edit-timer-progress"><div class="edit-timer-fill" id="timerFill-' + fb.id + '" style="width: 100%;"></div></div>' +
        '<span class="edit-timer-time" id="timerTime-' + fb.id + '">5:00</span>' +
        '</div>';
    }

    // Edit overlay (only for editable)
    var editOverlayHtml = '';
    if (isEditable) {
      editOverlayHtml = '<div class="edit-overlay" id="editOverlay-' + fb.id + '">' +
        '<div class="mb-4"><div class="history-text-label mb-2">Staerken bearbeiten</div>' +
        '<textarea rows="4" id="editStrengths-' + fb.id + '">' + fb.strengths + '</textarea></div>' +
        '<div class="mb-2"><div class="history-text-label mb-2">Verbesserungsvorschlaege bearbeiten</div>' +
        '<textarea rows="4" id="editImprovements-' + fb.id + '">' + fb.improvements + '</textarea></div>' +
        '<div class="edit-actions">' +
        '<button class="btn-edit-cancel" id="cancelEdit-' + fb.id + '">Abbrechen</button>' +
        '<button class="btn-edit-save" id="saveEdit-' + fb.id + '">Aenderungen speichern</button>' +
        '</div></div>';
    }

    return '<div class="' + cardClass + '" id="card-' + fb.id + '" data-submitted-at="' + fb.submittedAt + '">' +
      '<div class="flex items-start justify-between gap-3 mb-4">' +
      '<div class="flex items-center gap-3">' + avatarHtml +
      '<div><span class="history-recipient">' + fb.to.name + '</span>' +
      '<div class="flex items-center gap-2 mt-1">' + badgesHtml + '</div></div></div>' +
      headerRight + '</div>' +
      timerHtml +
      renderDrivers(fb.drivers) +
      '<div class="mb-3"><div class="history-text-label">Staerken</div>' +
      '<div class="history-text-content" id="strengths-' + fb.id + '">' + fb.strengths + '</div></div>' +
      '<div><div class="history-text-label">Verbesserungsvorschlaege</div>' +
      '<div class="history-text-content" id="improvements-' + fb.id + '">' + fb.improvements + '</div></div>' +
      editOverlayHtml +
      '</div>';
  }

  /* ═══════════════════════════════════════════════════════
     Timer Logic
     ═══════════════════════════════════════════════════════ */

  function initHistoryTimers() {
    var editableCards = document.querySelectorAll('.history-card[data-submitted-at="LIVE_TIMER"]');
    if (editableCards.length === 0) return;

    editableCards.forEach(function (card) {
      var cardId = card.id.replace('card-', '');
      var submittedAt = new Date(Date.now() - 30 * 1000);

      var tsEl = document.getElementById('timestamp-' + cardId);
      if (tsEl) {
        var h = String(submittedAt.getHours()).padStart(2, '0');
        var m = String(submittedAt.getMinutes()).padStart(2, '0');
        tsEl.textContent = h + ':' + m + ' Uhr';
      }

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
        timerTime.textContent = '0:00';
        timerFill.style.width = '0%';
        timerFill.classList.add('critical');
        timerTime.classList.add('critical');
        editBtn.disabled = true;
        card.classList.remove('editable');

        timerBar.innerHTML =
          '<span class="edit-timer-icon">\uD83D\uDD12</span>' +
          '<span style="font-size:13px; color: var(--color-text-ghost); font-family: DM Sans, sans-serif;">Bearbeitungszeit abgelaufen \u2014 Feedback ist gesperrt</span>';
        timerBar.style.background = 'rgba(255, 255, 255, 0.02)';
        timerBar.style.borderColor = 'var(--color-border)';

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

      if (totalSec <= 60) {
        timerFill.classList.add('critical');
        timerTime.classList.add('critical');
      }
    }

    updateTimer();
    historyTimerInterval = setInterval(updateTimer, 1000);
  }

  /* ═══════════════════════════════════════════════════════
     Edit Buttons
     ═══════════════════════════════════════════════════════ */

  function initHistoryEditButtons() {
    var editBtns = document.querySelectorAll('[id^="editBtn-"]');
    editBtns.forEach(function (btn) {
      var cardId = btn.id.replace('editBtn-', '');
      btn.addEventListener('click', function () {
        var overlay = document.getElementById('editOverlay-' + cardId);
        if (overlay) {
          overlay.classList.toggle('active');
          if (overlay.classList.contains('active')) btn.style.display = 'none';
        }
      });
    });

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

    var saveBtns = document.querySelectorAll('[id^="saveEdit-"]');
    saveBtns.forEach(function (saveBtn) {
      var cardId = saveBtn.id.replace('saveEdit-', '');
      saveBtn.addEventListener('click', function () {
        var newStrengths = document.getElementById('editStrengths-' + cardId);
        var newImprovements = document.getElementById('editImprovements-' + cardId);
        var strengthsDisplay = document.getElementById('strengths-' + cardId);
        var improvementsDisplay = document.getElementById('improvements-' + cardId);

        if (newStrengths && strengthsDisplay) strengthsDisplay.textContent = newStrengths.value;
        if (newImprovements && improvementsDisplay) improvementsDisplay.textContent = newImprovements.value;

        var overlay = document.getElementById('editOverlay-' + cardId);
        var editBtn = document.getElementById('editBtn-' + cardId);
        if (overlay) overlay.classList.remove('active');
        if (editBtn && !editBtn.disabled) editBtn.style.display = '';

        Render.showToast('Aenderungen gespeichert');
      });
    });
  }

  /* ═══════════════════════════════════════════════════════
     Init
     ═══════════════════════════════════════════════════════ */

  function init() {
    // Navbar
    var navEl = document.getElementById('navbar-container');
    if (navEl) navEl.innerHTML = Render.navbar('history');

    // Cards
    var cardsEl = document.getElementById('history-cards-container');
    if (cardsEl) {
      var feedbacks = FeedbackAPI.getHistoryFeedbacks();

      // Count badge
      var countEl = document.getElementById('history-count');
      if (countEl) countEl.textContent = feedbacks.length + ' gesendet';

      cardsEl.innerHTML = feedbacks.map(renderCard).join('\n');
    }

    // Init timer and edit logic
    initHistoryTimers();
    initHistoryEditButtons();

    // Profile Dropdown
    Render.initProfileDropdown();
  }

  document.addEventListener('DOMContentLoaded', init);

})();
