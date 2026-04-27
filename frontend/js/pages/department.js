/**
 * pages/department.js
 * Feedback Hub — Abteilungsleiter: Team-Feedback-Verlauf
 *
 * Lazy-Loading-Pattern: Member-Karten zeigen Aggregate aus Backend-DTO.
 * Detaillierte Feedbacks werden erst beim Drawer-Open via API nachgeladen
 * und im Member-Objekt gecached, damit ein zweites Öffnen keinen
 * weiteren Request auslöst.
 */

(function () {

  var DRIVER_KEYS = ['impact', 'ownership', 'collaboration', 'growth'];

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
        '<div class="dept-empty-icon">\uD83D\uDC65</div>' +
        '<div>' + I18n.t('dept.no_members') + '</div>' +
        '</div>';
      return;
    }

    var html = '<div class="dept-members-grid">';

    team.forEach(function (member) {
      var total   = member.feedbackCount || 0;
      var overall = member.averageRating;        // bereits berechnet im Backend
      var isLow   = total > 0 && total <= 2;

      // Mini-Driver-Chips: nicht verfügbar auf Karte (Backend liefert nur Aggregate)
      var miniDrivers = '';

      // Anon-Count: nicht verfügbar auf Karte ohne komplette Feedbacks
      var anonBadge = '';

      // Low-Hint: bei wenigen Feedbacks
      var lowHint = isLow
        ? '<div class="dept-low-hint">' + I18n.t('dept.few_reviews') + '</div>'
        : '';

      html += '<div class="dept-member-card" data-member-id="' + member.id + '">' +
        '<div class="dept-member-header">' +
        '<div class="avatar">' + member.initials + '</div>' +
        '<div class="dept-member-info">' +
        '<div class="dept-member-name">' + member.name + '</div>' +
        '<div class="dept-member-role">' + (member.department || '') + '</div>' +
        '</div>' +
        '</div>' +
        '<div class="dept-member-stats">' +
        '<span class="dept-member-avg">' + (overall !== null && overall !== undefined ? overall.toFixed(1) : '-') + '</span>' +
        '<span class="dept-review-count">' + total + ' Feedback' + (total !== 1 ? 's' : '') + '</span>' +
        anonBadge +
        '</div>' +
        miniDrivers +
        lowHint +
        '</div>';
    });

    html += '</div>';
    el.innerHTML = html;

    // Click-Handler für Karten → Drawer öffnen
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

  async function openDrawer(member) {
    // Drawer sofort öffnen mit Loading-State
    document.getElementById('deptDrawer').classList.add('open');
    document.getElementById('deptDrawerOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';

    // Header sofort befüllen (Daten haben wir schon aus der Karte)
    var avatarEl = document.getElementById('drawer-avatar');
    if (avatarEl) avatarEl.textContent = member.initials;
    var nameEl = document.getElementById('drawer-name');
    if (nameEl) nameEl.textContent = member.name;
    var roleEl = document.getElementById('drawer-role');
    if (roleEl) roleEl.textContent = member.department;

    // Loading-Hinweis im History-Bereich
    var historyEl = document.getElementById('drawer-history');
    if (historyEl) {
      historyEl.innerHTML =
        '<p style="color:var(--color-text-muted);padding:20px;text-align:center;">Lade Feedbacks ...</p>';
    }

    // Lazy-Load Feedbacks (nur einmal pro Member, dann gecached)
    if (member.feedbacks === null || member.feedbacks === undefined) {
      try {
        member.feedbacks = await FeedbackAPI.getTeamMemberFeedbacks(member.id);
      } catch (e) {
        console.error('Team-Member-Feedbacks konnten nicht geladen werden:', e);
        if (historyEl) {
          historyEl.innerHTML = '<p style="color:var(--color-danger);padding:20px;text-align:center;">' +
            'Fehler beim Laden (' + (e.errorCode || 'unknown') + '). Drawer schliessen und erneut versuchen.</p>';
        }
        return;
      }
    }

    // ── Statistiken berechnen ──────────────────────────
    var feedbacks  = member.feedbacks;
    var total      = feedbacks.length;
    var anonCount  = feedbacks.filter(function (f) { return f.anonymous; }).length;
    var driverAvgs = computeDriverAverages(feedbacks);
    var overall    = overallAvg(driverAvgs);
    var isLow      = total > 0 && total <= 2;

    // ── Stats-Pills ────────────────────────────────────
    var statsEl = document.getElementById('drawer-stats');
    if (statsEl) {
      statsEl.innerHTML =
        '<div class="dept-stat-pill">' +
        '<div class="dept-stat-value orange">' + (overall !== null ? overall.toFixed(1) : '-') + '</div>' +
        '<div class="dept-stat-label">' + I18n.t('dept.total_avg') + '</div>' +
        '</div>' +
        '<div class="dept-stat-pill">' +
        '<div class="dept-stat-value">' + total + '</div>' +
        '<div class="dept-stat-label">Feedbacks</div>' +
        '</div>' +
        '<div class="dept-stat-pill">' +
        '<div class="dept-stat-value">' + anonCount + '</div>' +
        '<div class="dept-stat-label">' + I18n.t('dept.anonymous') + '</div>' +
        '</div>';
    }

    // ── Low-Warning ────────────────────────────────────
    var lowEl = document.getElementById('drawer-low-warning');
    if (lowEl) {
      if (isLow) {
        lowEl.style.display = 'flex';
        var key = total === 1 ? 'dept.avg_hint_singular' : 'dept.avg_hint_plural';
        lowEl.innerHTML =
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="flex-shrink:0;margin-top:1px;">' +
          '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>' +
          '<line x1="12" y1="9" x2="12" y2="13"/>' +
          '<line x1="12" y1="17" x2="12.01" y2="17"/>' +
          '</svg>' +
          '<span>' + I18n.t(key).replace('{n}', total) + '</span>';
      } else {
        lowEl.style.display = 'none';
      }
    }

    // ── Driver Averages ────────────────────────────────
    var driversEl = document.getElementById('drawer-drivers');
    if (driversEl) {
      if (total === 0) {
        driversEl.innerHTML = '<div style="color:var(--color-text-ghost);font-size:13px;padding:12px 0;">' + I18n.t('dept.no_ratings') + '</div>';
      } else {
        driversEl.innerHTML = driverAvgs.map(function (d) {
          var right = d.avg !== null
            ? '<span class="dept-driver-row-stars">' + starsHtml(d.avg) + '</span>' +
            '<span class="dept-driver-row-score">' + d.avg.toFixed(1) + '</span>'
            : '<span class="dept-driver-row-score na">N/A</span>';
          return '<div class="dept-driver-row">' +
            '<span class="dept-driver-row-name">' + I18n.t('driver.' + d.name) + '</span>' +
            right +
            '</div>';
        }).join('');
      }
    }

    // ── Feedback-Verlauf ───────────────────────────────
    if (historyEl) {
      if (!feedbacks.length) {
        historyEl.innerHTML = '<div style="color:var(--color-text-ghost);font-size:13px;padding:12px 0;">' + I18n.t('dept.no_feedback') + '</div>';
      } else {
        historyEl.innerHTML = feedbacks.map(function (fb) {

          /* ── Absender-Info ── */
          var fromHtml = fb.anonymous
            ? '<div class="dept-history-from">' +
            '<div class="avatar anon-avatar" style="width:28px;height:28px;border-radius:7px;">' +
            '<img class="anon-avatar-icon" alt="Anonym" src="img/incognito.svg" style="width:14px;height:14px;"/>' +
            '</div>' +
            '<span class="dept-history-from-label" style="color:var(--color-text-ghost);">' + I18n.t('dept.anon_feedback') + '</span>' +
            '<span class="anon-badge-sm">' +
            '<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">' +
            '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>' +
            '<circle cx="12" cy="12" r="3"/>' +
            '<line x1="1" y1="1" x2="23" y2="23"/>' +
            '</svg> ' + I18n.t('common.anonymous') +
            '</span>' +
            '</div>'
            : '<div class="dept-history-from">' +
            '<div class="avatar" style="width:28px;height:28px;font-size:9px;border-radius:7px;">' + fb.fromInitials + '</div>' +
            '<span class="dept-history-from-label">' + fb.fromName + '</span>' +
            '</div>';

          /* ── Driver Chips ── */
          var chips = fb.drivers.map(function (d) {
            var shortName = I18n.t('driver.' + d.name).split('/')[0].trim();
            var chipClass = 'dept-history-driver-chip' + (d.na ? ' na-chip' : '');
            var score     = d.na ? '<span class="score">N/A</span>' : '<span class="score">' + d.rating + '★</span>';
            return '<span class="' + chipClass + '">' + shortName + ' ' + score + '</span>';
          }).join('');

          /* ── Expandable Detail ── */
          var hasStrengths    = fb.strengths && fb.strengths !== '-';
          var hasImprovements = fb.improvements && fb.improvements !== '-';
          var hasDetail       = hasStrengths || hasImprovements;

          var detailHtml = '';
          if (hasDetail) {
            detailHtml = '<div class="dept-fb-detail" id="dept-detail-' + fb.id + '">';

            if (hasStrengths) {
              detailHtml +=
                '<div class="dept-fb-text-block">' +
                '<div class="dept-fb-text-label">' +
                '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
                '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>' +
                '</svg>' +
                ' ' + I18n.t('dept.strengths_label') +
                '</div>' +
                '<p class="dept-fb-text-content">' + fb.strengths + '</p>' +
                '</div>';
            }

            if (hasImprovements) {
              detailHtml +=
                '<div class="dept-fb-text-block">' +
                '<div class="dept-fb-text-label">' +
                '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
                '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>' +
                '</svg>' +
                ' ' + I18n.t('dept.improvements_label') +
                '</div>' +
                '<p class="dept-fb-text-content">' + fb.improvements + '</p>' +
                '</div>';
            }

            detailHtml += '</div>';
          }

          /* ── Chevron für aufklappbar ── */
          var chevronHtml = hasDetail
            ? '<span class="dept-history-chevron" id="dept-chevron-' + fb.id + '">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
            '<polyline points="6 9 12 15 18 9"/>' +
            '</svg>' +
            '</span>'
            : '';

          return '<div class="dept-history-item' + (hasDetail ? ' has-detail' : '') + '" id="dept-item-' + fb.id + '">' +
            '<div class="dept-history-header" data-fb-id="' + fb.id + '"' + (hasDetail ? ' data-expandable="true"' : '') + '>' +
            fromHtml +
            '<div class="dept-history-header-right">' +
            '<span class="dept-history-date">' + fb.date + '</span>' +
            chevronHtml +
            '</div>' +
            '</div>' +
            '<div class="dept-history-drivers-mini">' + chips + '</div>' +
            detailHtml +
            '</div>';
        }).join('');

        /* ── Klick-Events für Aufklappen ── */
        historyEl.querySelectorAll('.dept-history-header[data-expandable]').forEach(function (header) {
          header.addEventListener('click', function () {
            var fbId    = header.getAttribute('data-fb-id');
            var detail  = document.getElementById('dept-detail-' + fbId);
            var chevron = document.getElementById('dept-chevron-' + fbId);
            var item    = document.getElementById('dept-item-' + fbId);

            if (!detail) return;

            var isOpen = detail.classList.toggle('open');
            if (item)    item.classList.toggle('expanded', isOpen);
            if (chevron) chevron.classList.toggle('rotated', isOpen);
          });
        });
      }
    }
  }

  function closeDrawer() {
    document.getElementById('deptDrawer').classList.remove('open');
    document.getElementById('deptDrawerOverlay').classList.remove('active');
    document.body.style.overflow = '';
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

    // ── Navbar mit aktivem Tab "department" ─────────────
    var navEl = document.getElementById('navbar-container');
    if (navEl) navEl.innerHTML = Render.navbar('department');

    Render.initProfileDropdown();

    // ── Drawer-Close-Handler ────────────────────────────
    var closeBtn = document.getElementById('deptDrawerClose');
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

    var overlay = document.getElementById('deptDrawerOverlay');
    if (overlay) overlay.addEventListener('click', closeDrawer);

    // ── Loading-State ───────────────────────────────────
    var membersEl = document.getElementById('dept-members-container');
    if (membersEl) {
      membersEl.innerHTML = '<p style="color:var(--color-text-muted);padding:40px;text-align:center;">' +
        'Lade Team ...</p>';
    }

    // ── Team laden ──────────────────────────────────────
    try {
      var team = await FeedbackAPI.getDepartmentTeam();
      renderMemberCards(team);
    } catch (e) {
      console.error('Team konnte nicht geladen werden:', e);
      if (membersEl) {
        if (e.status === 403) {
          membersEl.innerHTML = '<p style="color:var(--color-text-muted);padding:40px;text-align:center;">' +
            'Du hast keine Berechtigung, dieses Team einzusehen.</p>';
        } else {
          membersEl.innerHTML = '<p style="color:var(--color-danger);padding:40px;text-align:center;">' +
            'Fehler beim Laden (' + (e.errorCode || 'unknown') + ').</p>';
        }
      }
    }
  }

  document.addEventListener('DOMContentLoaded', init);

})();
