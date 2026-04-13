/**
 * pages/inbox.js
 * Feedback Hub — Inbox-Seite dynamisch rendern
 */

(function () {

  /* ═══════════════════════════════════════════════════════
     Helper
     ═══════════════════════════════════════════════════════ */

  function driverShortLabel(name) {
    var map = {
      'Impact / Results':        'Impact',
      'Ownership / Reliability': 'Ownership',
      'Collaboration / Social':  'Collab',
      'Growth / Learning':       'Growth'
    };
    return map[name] || name;
  }

  /* ═══════════════════════════════════════════════════════
     Mini Driver Chips
     ═══════════════════════════════════════════════════════ */

  function renderDriverChips(drivers) {
    return '<div class="inbox-driver-chips">' +
      drivers.map(function (d) {
        if (d.na) {
          return '<div class="inbox-driver-chip na">' +
            '<span class="chip-label">' + driverShortLabel(d.name) + '</span>' +
            '<span class="chip-val na">N/A</span>' +
            '</div>';
        }
        return '<div class="inbox-driver-chip">' +
          '<span class="chip-label">' + driverShortLabel(d.name) + '</span>' +
          '<span class="chip-stars">' + '★'.repeat(d.rating) +
          '<span class="chip-empty">' + '★'.repeat(5 - d.rating) + '</span></span>' +
          '</div>';
      }).join('') +
      '</div>';
  }

  /* ═══════════════════════════════════════════════════════
     Expanded Detail Block
     ═══════════════════════════════════════════════════════ */

  function renderDetailBlock(fb, id) {
    var driversHtml = fb.drivers.map(function (d) {
      var val;
      if (d.na) {
        val = '<span class="na-display">N/A</span>';
      } else {
        var filled = '★'.repeat(d.rating);
        var empty = '<span style="color:var(--color-star-empty);">' + '★'.repeat(5 - d.rating) + '</span>';
        val = '<span style="color:var(--color-orange);font-size:16px;letter-spacing:2px;">' + filled + empty + '</span>' +
          '<span style="font-size:12px;color:var(--color-text-dim);margin-left:6px;">' + d.rating + ' / 5</span>';
      }
      return '<div style="display:flex;align-items:center;justify-content:space-between;' +
        'padding:9px 0;border-bottom:1px solid var(--color-border);">' +
        '<span style="font-size:13px;color:var(--color-text-muted);font-family:\'DM Sans\',sans-serif;">' + d.name + '</span>' +
        '<div style="display:flex;align-items:center;gap:6px;">' + val + '</div>' +
        '</div>';
    }).join('');

    return '<div class="inbox-detail-block" id="detail-' + id + '">' +

      // Drivers
      '<div class="inbox-detail-section">' +
      '<div class="inbox-detail-section-title">Bewertungen</div>' +
      '<div>' + driversHtml + '</div>' +
      '</div>' +

      // Strengths
      '<div class="inbox-detail-section">' +
      '<div class="flex items-center gap-2 mb-2">' +
      '<span style="width:7px;height:7px;border-radius:50%;background:var(--color-success);display:inline-block;"></span>' +
      '<span class="inbox-detail-section-title" style="margin-bottom:0;">Strengths</span>' +
      '</div>' +
      '<p class="inbox-detail-text">' + (fb.strengths || '-') + '</p>' +
      '</div>' +

      // Improvements
      '<div class="inbox-detail-section" style="margin-bottom:0;">' +
      '<div class="flex items-center gap-2 mb-2">' +
      '<span style="width:7px;height:7px;border-radius:50%;background:var(--color-orange);display:inline-block;"></span>' +
      '<span class="inbox-detail-section-title" style="margin-bottom:0;">Areas to Improve</span>' +
      '</div>' +
      '<p class="inbox-detail-text">' + (fb.improvements || '-') + '</p>' +
      '</div>' +

      '</div>';
  }

  /* ═══════════════════════════════════════════════════════
     Averages
     ═══════════════════════════════════════════════════════ */

  function renderAverages(averages) {
    var driversHtml = averages.drivers.map(function (d) {
      return '<div class="avg-card">' +
        '<span class="avg-label">' + d.name + '</span>' +
        '<div class="avg-stars">' +
        '<span class="star-display">' + Render.stars(d.stars) + '</span>' +
        '<span class="avg-num">' + d.value + '</span>' +
        '</div></div>';
    }).join('\n');

    return '<div class="flex items-center justify-between mb-3">' +
      '<p style="font-family:\'Bodoni MT\',sans-serif;font-weight:700;letter-spacing:0.1em;color:var(--color-text-muted);" class="text-sm uppercase">Durchschnittliche Bewertungen</p>' +
      '<div class="grid grid-cols1 gap-1">' +
      '<span class="text-sm" style="color:var(--color-text-muted);">' + averages.totalReviews + ' Reviews</span>' +
      '<span class="text-sm" style="color:var(--color-text-muted);">\u2514 ' + averages.anonymousCount + ' Anonym</span>' +
      '</div></div>' +
      '<div class="grid grid-cols-2 gap-3 mb-3">' + driversHtml + '</div>' +
      '<p class="averages-warning">\u26A0 Durchschnittswerte sind ein Richtwert und kein abschliessendes Urteil.</p>';
  }

  /* ═══════════════════════════════════════════════════════
     Feedback Card
     ═══════════════════════════════════════════════════════ */

  function renderFeedbackCard(fb) {
    var avatarHtml = fb.from.anonymous
      ? Render.avatar(null, { anonymous: true })
      : Render.avatar(fb.from.initials);

    var nameStyle = fb.from.anonymous
      ? 'class="text-sm font-medium" style="color:var(--color-text-muted);"'
      : 'class="text-white text-sm font-medium"';

    var driversHtml = fb.drivers ? renderDriverChips(fb.drivers) : '';
    var detailHtml  = fb.drivers ? renderDetailBlock(fb, fb.id) : '';

    return '<div class="inbox-card' + (fb.unread ? ' unread' : '') + '" id="card-' + fb.id + '">' +

      // Clickable header row
      '<div class="inbox-card-header" data-id="' + fb.id + '">' +
      '<div class="flex items-start gap-3">' +
      avatarHtml +
      '<div class="flex-1 min-w-0">' +
      '<div class="flex items-center justify-between gap-2 mb-1">' +
      '<span ' + nameStyle + '>' + fb.from.name + '</span>' +
      '<div class="flex items-center gap-2 flex-shrink-0">' +
      (fb.unread ? '<div class="unread-dot"></div>' : '') +
      '<span class="text-sm" style="color:var(--color-text-dim);">' + fb.date + '</span>' +
      '<span class="inbox-chevron" id="chevron-' + fb.id + '">&#8964;</span>' +
      '</div></div>' +
      '<div class="star-display mb-2">' + Render.stars(fb.stars) + '</div>' +
      driversHtml +
      '<p class="text-sm leading-relaxed mt-3" style="color:var(--color-text-muted);">' + fb.preview + '</p>' +
      '</div></div>' +
      '</div>' +

      // Expandable detail
      detailHtml +

      '</div>';
  }

  /* ═══════════════════════════════════════════════════════
     Toggle Expand
     ═══════════════════════════════════════════════════════ */

  function bindCardClicks() {
    document.querySelectorAll('.inbox-card-header').forEach(function (header) {
      header.addEventListener('click', function () {
        var id      = header.dataset.id;
        var detail  = document.getElementById('detail-' + id);
        var chevron = document.getElementById('chevron-' + id);
        var card    = document.getElementById('card-' + id);

        if (!detail) return;

        var isOpen = detail.classList.toggle('active');
        card.classList.toggle('expanded', isOpen);
        chevron.style.transform = isOpen ? 'rotate(180deg)' : '';
      });
    });
  }

  /* ═══════════════════════════════════════════════════════
     Init
     ═══════════════════════════════════════════════════════ */

  function init() {
    var navEl = document.getElementById('navbar-container');
    if (navEl) navEl.innerHTML = Render.navbar('inbox');

    var avgEl = document.getElementById('averages-container');
    if (avgEl) avgEl.innerHTML = renderAverages(FeedbackAPI.getInboxAverages());

    var feedbacks = FeedbackAPI.getInboxFeedbacks();
    var cardsEl   = document.getElementById('inbox-cards-container');
    if (cardsEl) cardsEl.innerHTML = feedbacks.map(renderFeedbackCard).join('\n');

    bindCardClicks();
    Render.initProfileDropdown();
  }

  document.addEventListener('DOMContentLoaded', init);

})();
