/**
 * pages/inbox.js
 * Feedback Hub — Inbox-Seite dynamisch rendern
 */

(function () {

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
      '<p style="font-family:\'Bodoni MT\',sans-serif; font-weight:700; letter-spacing:0.1em; color: var(--color-text-muted);" class="text-sm uppercase">Durchschnittliche Bewertungen</p>' +
      '<div class="grid grid-cols1 gap-1">' +
      '<span class="text-sm" style="color: var(--color-text-muted);">' + averages.totalReviews + ' Reviews </span>' +
      '<span class="text-sm" style="color: var(--color-text-muted);">\u2514 ' + averages.anonymousCount + ' Anonym</span>' +
      '</div></div>' +
      '<div class="grid grid-cols-2 gap-3 mb-3">' + driversHtml + '</div>' +
      '<p class="averages-warning">\u26A0 Durchschnittswerte sind ein Richtwert und kein abschliessendes Urteil.</p>';
  }

  function renderFeedbackCard(fb) {
    var avatarHtml;
    if (fb.from.anonymous) {
      avatarHtml = Render.avatar(null, { anonymous: true });
    } else {
      avatarHtml = Render.avatar(fb.from.initials);
    }

    var nameStyle = fb.from.anonymous
      ? 'class="text-sm font-medium" style="color: var(--color-text-muted);"'
      : 'class="text-white text-sm font-medium"';

    var card = '<div class="inbox-card' + (fb.unread ? ' unread' : '') + '">' +
      '<div class="flex items-start gap-3">' +
      avatarHtml +
      '<div class="flex-1 min-w-0">' +
      '<div class="flex items-center justify-between gap-2 mb-1">' +
      '<span ' + nameStyle + '>' + fb.from.name + '</span>' +
      '<div class="flex items-center gap-2 flex-shrink-0">' +
      (fb.unread ? '<div class="unread-dot"></div>' : '') +
      '<span class="text-sm" style="color: var(--color-text-dim);">' + fb.date + '</span>' +
      '</div></div>' +
      '<div class="star-display mb-2">' + Render.stars(fb.stars) + '</div>' +
      '<p class="text-sm leading-relaxed" style="color: var(--color-text-muted);">' + fb.preview + '</p>' +
      '</div></div></div>';

    if (fb.link) {
      return '<a href="' + fb.link + '">' + card + '</a>';
    }
    return card;
  }

  function init() {
    // Navbar
    var navEl = document.getElementById('navbar-container');
    if (navEl) navEl.innerHTML = Render.navbar('inbox');

    // Averages
    var avgEl = document.getElementById('averages-container');
    if (avgEl) avgEl.innerHTML = renderAverages(FeedbackAPI.getInboxAverages());

    // Feedback Cards
    var cardsEl = document.getElementById('inbox-cards-container');
    if (cardsEl) {
      var feedbacks = FeedbackAPI.getInboxFeedbacks();
      cardsEl.innerHTML = feedbacks.map(renderFeedbackCard).join('\n');
    }

    // Profile Dropdown
    Render.initProfileDropdown();
  }

  document.addEventListener('DOMContentLoaded', init);

})();
