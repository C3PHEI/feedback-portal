/**
 * pages/department.js
 * Feedback Hub — Abteilungsleiter: Team-Feedback-Verlauf
 *
 * Daten kommen via FeedbackAPI.getDepartmentTeam()
 * Anonyme Feedbacks: kein Absender, nur Datum (kein Timestamp).
 * Durchschnittswerte + Warnung bei <= 2 Reviews.
 */

(function () {

  var DRIVER_KEYS = [
    'Impact / Results',
    'Ownership / Reliability',
    'Collaboration / Social',
    'Growth / Learning'
  ];

  /* ═══════════════════════════════════════════════════════
     Helpers
     ═══════════════════════════════════════════════════════ */

  function computeDriverAverages(feedbacks) {
    var sums   = {};
    var counts = {};
    DRIVER_KEYS.forEach(function (k) { sums[k] = 0; counts[k] = 0; });

    feedbacks.forEach(function (fb) {
      fb.drivers.forEach(function (d) {
        if (!d.na && d.rating !== null) {
          sums[d.name]   = (sums[d.name]   || 0) + d.rating;
          counts[d.name] = (counts[d.name] || 0) + 1;
        }
      });
    });

    return DRIVER_KEYS.map(function (k) {
      if (!counts[k]) return { name: k, avg: null };
      return { name: k, avg: Math.round((sums[k] / counts[k]) * 10) / 10 };
    });
  }

  function overallAvg(driverAvgs) {
    var vals = driverAvgs
      .filter(function (d) { return d.avg !== null; })
      .map(function (d) { return d.avg; });
    if (!vals.length) return null;
    var sum = vals.reduce(function (a, b) { return a + b; }, 0);
    return Math.round((sum / vals.length) * 10) / 10;
  }

  function starsHtml(avg) {
    if (avg === null) return '<span style="color:var(--color-text-ghost);font-size:12px;">N/A</span>';
    var filled = Math.round(avg);
    var empty  = 5 - filled;
    var html   = '';
    for (var i = 0; i < filled; i++) html += '★';
    if (empty > 0) html += '<span class="empty">';
    for (var j = 0; j < empty; j++) html += '★';
    if (empty > 0) html += '</span>';
    return html;
  }

  /* ═══════════════════════════════════════════════════════
     Render: Member Cards
     ═══════════════════════════════════════════════════════ */

  function renderMemberCards(team) {
    var el = document.getElementById('dept-members-container');
    if (!el) return;

    if (!team || !team.length) {
      el.innerHTML =
        '<div class="dept-empty">' +
        '<div class="dept-empty-icon">👥</div>' +
        '<div>Keine Teammitglieder gefunden.</div>' +
        '</div>';
      return;
    }

    var html = '<div class="dept-members-grid">';

    team.forEach(function (member) {
      var feedbacks  = member.feedbacks;
      var total      = feedbacks.length;
      var anonCount  = feedbacks.filter(function (f) { return f.anonymous; }).length;
      var driverAvgs = computeDriverAverages(feedbacks);
      var overall    = overallAvg(driverAvgs);
      var isLow      = total > 0 && total <= 2;

      var miniDrivers = driverAvgs.map(function (d) {
        var shortName = d.name.split('/')[0].trim();
        var scoreHtml = d.avg !== null
          ? '<span class="dept-mini-driver-score">' + d.avg.toFixed(1) + '</span>'
          : '<span class="dept-mini-driver-score na">N/A</span>';
        return '<div class="dept-mini-driver">' +
          '<span class="dept-mini-driver-name">' + shortName + '</span>' +
          scoreHtml +
          '</div>';
      }).join('');

      var anonBadge = anonCount > 0
        ? ' <span class="anon-count">' +
        '<svg class="anon-icon" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">' +
        '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>' +
        '<circle cx="12" cy="12" r="3"/>' +
        '<line x1="1" y1="1" x2="23" y2="23"/>' +
        '</svg>' +
        anonCount + ' anonym' +
        '</span>'
        : '';

      var lowHint = isLow
        ? '<div class="dept-card-low-hint">' +
        '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">' +
        '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>' +
        '<line x1="12" y1="9" x2="12" y2="13"/>' +
        '<line x1="12" y1="17" x2="12.01" y2="17"/>' +
        '</svg>' +
        'Durchschnitt basiert auf ' + total + ' Bewertung' + (total === 1 ? '' : 'en') + '. Möglicherweise nicht repräsentativ.' +
        '</div>'
        : '';

      var overallHtml = total === 0
        ? '<span style="color:var(--color-text-ghost);font-size:12px;">Noch keine Bewertungen</span>'
        : '<span style="color:var(--color-orange);font-family:\'Bodoni MT\',sans-serif;font-size:18px;font-weight:700;">' +
        (overall !== null ? overall.toFixed(1) : '—') +
        '</span>' +
        '<span style="color:var(--color-text-ghost);font-size:11px;font-family:\'DM Sans\',sans-serif;"> / 5.0 Ø</span>';

      html +=
        '<div class="dept-member-card" data-member-id="' + member.id + '">' +
        '<div class="flex items-center justify-between mb-3">' +
        '<div class="flex items-center gap-3">' +
        '<div class="avatar" style="width:38px;height:38px;font-size:12px;border-radius:9px;">' + member.initials + '</div>' +
        '<div>' +
        '<div class="dept-member-name">' + member.name + '</div>' +
        '<div class="dept-member-meta">' + member.department + '</div>' +
        '</div>' +
        '</div>' +
        '<svg class="dept-member-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<polyline points="9 18 15 12 9 6"/>' +
        '</svg>' +
        '</div>' +
        '<div class="flex items-center justify-between">' + overallHtml + '</div>' +
        '<div class="dept-review-count">' +
        '<span>' + total + ' Feedback' + (total !== 1 ? 's' : '') + '</span>' +
        anonBadge +
        '</div>' +
        (total > 0 ? '<div class="dept-mini-drivers">' + miniDrivers + '</div>' : '') +
        lowHint +
        '</div>';
    });

    html += '</div>';
    el.innerHTML = html;

    var cards = el.querySelectorAll('.dept-member-card');
    cards.forEach(function (card) {
      card.addEventListener('click', function () {
        var id     = card.getAttribute('data-member-id');
        var member = team.find(function (m) { return m.id === id; });
        if (member) openDrawer(member);
      });
    });
  }

  /* ═══════════════════════════════════════════════════════
     Drawer
     ═══════════════════════════════════════════════════════ */

  function openDrawer(member) {
    var feedbacks  = member.feedbacks;
    var total      = feedbacks.length;
    var anonCount  = feedbacks.filter(function (f) { return f.anonymous; }).length;
    var driverAvgs = computeDriverAverages(feedbacks);
    var overall    = overallAvg(driverAvgs);
    var isLow      = total > 0 && total <= 2;

    var avatarEl = document.getElementById('drawer-avatar');
    if (avatarEl) avatarEl.textContent = member.initials;

    var nameEl = document.getElementById('drawer-name');
    if (nameEl) nameEl.textContent = member.name;

    var roleEl = document.getElementById('drawer-role');
    if (roleEl) roleEl.textContent = member.department;

    var statsEl = document.getElementById('drawer-stats');
    if (statsEl) {
      statsEl.innerHTML =
        '<div class="dept-stat-pill">' +
        '<div class="dept-stat-value orange">' + (overall !== null ? overall.toFixed(1) : '—') + '</div>' +
        '<div class="dept-stat-label">Gesamt Ø</div>' +
        '</div>' +
        '<div class="dept-stat-pill">' +
        '<div class="dept-stat-value">' + total + '</div>' +
        '<div class="dept-stat-label">Feedbacks</div>' +
        '</div>' +
        '<div class="dept-stat-pill">' +
        '<div class="dept-stat-value">' + anonCount + '</div>' +
        '<div class="dept-stat-label">Anonym</div>' +
        '</div>';
    }

    var lowEl = document.getElementById('drawer-low-warning');
    if (lowEl) {
      if (isLow) {
        lowEl.style.display = 'flex';
        lowEl.innerHTML =
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="flex-shrink:0;margin-top:1px;">' +
          '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>' +
          '<line x1="12" y1="9" x2="12" y2="13"/>' +
          '<line x1="12" y1="17" x2="12.01" y2="17"/>' +
          '</svg>' +
          '<span>Durchschnitt basiert auf <strong>' + total + '</strong> Bewertung' + (total === 1 ? '' : 'en') +
          '. Diese Werte spiegeln möglicherweise nicht das vollständige Feedback wider.</span>';
      } else {
        lowEl.style.display = 'none';
      }
    }

    var driversEl = document.getElementById('drawer-drivers');
    if (driversEl) {
      if (total === 0) {
        driversEl.innerHTML = '<div style="color:var(--color-text-ghost);font-size:13px;padding:12px 0;">Noch keine Bewertungen vorhanden.</div>';
      } else {
        driversEl.innerHTML = driverAvgs.map(function (d) {
          var right = d.avg !== null
            ? '<span class="dept-driver-row-stars">' + starsHtml(d.avg) + '</span>' +
            '<span class="dept-driver-row-score">' + d.avg.toFixed(1) + '</span>'
            : '<span class="dept-driver-row-score na">N/A</span>';
          return '<div class="dept-driver-row">' +
            '<span class="dept-driver-row-name">' + d.name + '</span>' +
            right +
            '</div>';
        }).join('');
      }
    }

    var historyEl = document.getElementById('drawer-history');
    if (historyEl) {
      if (!feedbacks.length) {
        historyEl.innerHTML = '<div style="color:var(--color-text-ghost);font-size:13px;padding:12px 0;">Noch keine Feedbacks vorhanden.</div>';
      } else {
        historyEl.innerHTML = feedbacks.map(function (fb) {

          var fromHtml = fb.anonymous
            ? '<div class="dept-history-from">' +
            '<div class="avatar anon-avatar" style="width:28px;height:28px;border-radius:7px;">' +
            '<img class="anon-avatar-icon" alt="Anonym" src="img/incognito.svg" style="width:14px;height:14px;"/>' +
            '</div>' +
            '<span class="dept-history-from-label" style="color:var(--color-text-ghost);">Anonymes Feedback</span>' +
            '<span class="anon-badge-sm">' +
            '<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">' +
            '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>' +
            '<circle cx="12" cy="12" r="3"/>' +
            '<line x1="1" y1="1" x2="23" y2="23"/>' +
            '</svg> Anonym' +
            '</span>' +
            '</div>'
            : '<div class="dept-history-from">' +
            '<div class="avatar" style="width:28px;height:28px;font-size:9px;border-radius:7px;">' + fb.fromInitials + '</div>' +
            '<span class="dept-history-from-label">' + fb.fromName + '</span>' +
            '</div>';

          var chips = fb.drivers.map(function (d) {
            var shortName = d.name.split('/')[0].trim();
            var chipClass = 'dept-history-driver-chip' + (d.na ? ' na-chip' : '');
            var score     = d.na ? '<span class="score">N/A</span>' : '<span class="score">' + d.rating + '★</span>';
            return '<span class="' + chipClass + '">' + shortName + ' ' + score + '</span>';
          }).join('');

          return '<div class="dept-history-item">' +
            '<div class="dept-history-header">' +
            fromHtml +
            '<span class="dept-history-date">' + fb.date + '</span>' +
            '</div>' +
            '<div class="dept-history-drivers-mini">' + chips + '</div>' +
            '</div>';
        }).join('');
      }
    }

    document.getElementById('deptDrawer').classList.add('open');
    document.getElementById('deptDrawerOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    document.getElementById('deptDrawer').classList.remove('open');
    document.getElementById('deptDrawerOverlay').classList.remove('active');
    document.body.style.overflow = '';
  }

  /* ═══════════════════════════════════════════════════════
     Init
     ═══════════════════════════════════════════════════════ */

  function init() {
    var navEl = document.getElementById('navbar-container');
    if (navEl) navEl.innerHTML = Render.navbar('department');

    var user       = FeedbackAPI.getCurrentUser();
    var subtitleEl = document.getElementById('dept-subtitle');
    if (subtitleEl && user && user.department) {
      subtitleEl.textContent = 'Team-Feedback-Verlauf — ' + user.department;
    }

    var team = FeedbackAPI.getDepartmentTeam();
    renderMemberCards(team);

    var closeBtn = document.getElementById('deptDrawerClose');
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

    var overlay = document.getElementById('deptDrawerOverlay');
    if (overlay) overlay.addEventListener('click', closeDrawer);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeDrawer();
    });

    Render.initProfileDropdown();
  }

  document.addEventListener('DOMContentLoaded', init);

})();
