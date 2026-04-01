/**
 * admin.js
 * Feedback Hub — Admin Panel Logic
 * No inline handlers — everything is bound via addEventListener
 */

/* ═══════════════════════════════════════════════════════
   Toast Helper
   ═══════════════════════════════════════════════════════ */

function showAdminToast(msg) {
  var toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = '\u2713 ' + msg;
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
   DOMContentLoaded — Bind ALL event listeners
   ═══════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function () {

  /* ─── Tab Switching ─── */
  var tabBtns = document.querySelectorAll('.admin-tab');
  var tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target = btn.id.replace('tabBtn-', 'tab-');

      tabBtns.forEach(function (b) { b.classList.remove('active'); });
      tabContents.forEach(function (c) { c.classList.remove('active'); });

      btn.classList.add('active');
      document.getElementById(target).classList.add('active');
    });
  });


  /* ─── User Search Filter ─── */
  var userSearch = document.getElementById('userSearch');
  if (userSearch) {
    userSearch.addEventListener('input', function () {
      var query = userSearch.value.toLowerCase();
      var rows = document.querySelectorAll('#userTableBody tr');
      rows.forEach(function (row) {
        var text = row.textContent.toLowerCase();
        row.style.display = text.includes(query) ? '' : 'none';
      });
    });
  }


  /* ─── Moderation Search Filter ─── */
  var modSearch = document.getElementById('moderationSearch');
  if (modSearch) {
    modSearch.addEventListener('input', function () {
      var query = modSearch.value.toLowerCase();
      var items = document.querySelectorAll('.feedback-preview');
      items.forEach(function (item) {
        var text = item.textContent.toLowerCase();
        item.style.display = text.includes(query) ? '' : 'none';
      });
    });
  }


  /* ─── Role Filter (Tag Pills) ─── */
  var roleFilters = document.querySelectorAll('input[name="userFilter"]');
  roleFilters.forEach(function (radio) {
    radio.addEventListener('change', function () {
      var filter = radio.value;
      var rows = document.querySelectorAll('#userTableBody tr');
      rows.forEach(function (row) {
        if (filter === 'all') {
          row.style.display = '';
          return;
        }
        var badge = row.querySelector('.role-badge');
        var statusDot = row.querySelector('.status-dot');

        if (filter === 'inactive') {
          row.style.display = (statusDot && statusDot.classList.contains('inactive')) ? '' : 'none';
        } else if (filter === 'admin') {
          row.style.display = (badge && badge.classList.contains('admin')) ? '' : 'none';
        } else if (filter === 'manager') {
          row.style.display = (badge && badge.classList.contains('manager')) ? '' : 'none';
        } else if (filter === 'user') {
          row.style.display = (badge && badge.classList.contains('user')) ? '' : 'none';
        }
      });
    });
  });


  /* ─── Moderation Status Filter ─── */
  var modFilters = document.querySelectorAll('input[name="modFilter"]');
  modFilters.forEach(function (radio) {
    radio.addEventListener('change', function () {
      var filter = radio.value;
      var rows = document.querySelectorAll('.mod-report-row');
      rows.forEach(function (row) {
        if (filter === 'all') { row.style.display = ''; return; }
        var sc = row.dataset.statusClass;
        if (filter === 'open')     { row.style.display = (sc === 'flagged')  ? '' : 'none'; }
        if (filter === 'review')   { row.style.display = (sc === 'pending')  ? '' : 'none'; }
        if (filter === 'resolved') { row.style.display = (sc === 'resolved') ? '' : 'none'; }
      });
    });
  });


  /* ─── Expand/Collapse Feedback Preview ─── */
  var expandBtns = document.querySelectorAll('.expand-btn');
  expandBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var preview = btn.closest('.feedback-preview');
      if (preview.classList.contains('expanded')) {
        preview.classList.remove('expanded');
        btn.textContent = 'Mehr anzeigen \u2193';
      } else {
        preview.classList.add('expanded');
        btn.textContent = 'Weniger anzeigen \u2191';
      }
    });
  });


  /* ─── Add User Modal ─── */
  var modal = document.getElementById('addUserModal');
  var closeModalBtn = document.getElementById('closeModalBtn');
  var cancelModalBtn = document.getElementById('cancelModalBtn');

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', function () {
      modal.classList.remove('show');
    });
  }
  if (cancelModalBtn) {
    cancelModalBtn.addEventListener('click', function () {
      modal.classList.remove('show');
    });
  }
  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === modal) modal.classList.remove('show');
    });
  }


  /* ─── Toggle Switches → Toast ─── */
  var toggles = document.querySelectorAll('.toggle-switch input');
  toggles.forEach(function (toggle) {
    toggle.addEventListener('change', function () {
      var label = toggle.closest('.notif-card').querySelector('.text-white');
      var action = toggle.checked ? 'aktiviert' : 'deaktiviert';
      showAdminToast(label.textContent + ' ' + action);
    });
  });


  /* ─── AD Sync Button → Toast ─── */
  var syncBtn = document.getElementById('syncAdBtn');
  if (syncBtn) {
    syncBtn.addEventListener('click', function () {
      syncBtn.disabled = true;
      syncBtn.textContent = '\u23F3 Synchronisiere\u2026';
      setTimeout(function () {
        syncBtn.disabled = false;
        syncBtn.textContent = '\uD83D\uDD04 Sync starten';
        showAdminToast('AD-Synchronisierung abgeschlossen');
      }, 2000);
    });
  }

  /* ─── Report Detail Modal — Moderation ─── */
  var reportDetailModal   = document.getElementById('reportDetailModal');
  var closeReportModalBtn = document.getElementById('closeReportModalBtn');

  function openReportModal(row) {
    var d = row.dataset;

    document.getElementById('reportModalId').textContent          = d.id;
    document.getElementById('reportModalVon').textContent         = d.von;
    document.getElementById('reportModalVonInline').textContent   = d.von;
    document.getElementById('reportModalAn').textContent          = d.an;
    document.getElementById('reportModalVonAvatar').textContent   = d.vonInitials;
    document.getElementById('reportModalAnAvatar').textContent    = d.anInitials;
    document.getElementById('reportModalDatum').textContent       = d.datum;
    document.getElementById('reportModalTyp').textContent         = d.typ;
    document.getElementById('reportModalRating').textContent      = '★ ' + d.rating;
    document.getElementById('reportModalReason').textContent      = d.reason;
    document.getElementById('reportModalStrengths').textContent   = d.strengths;
    document.getElementById('reportModalImprovements').textContent = d.improvements;

    // Status Badge
    var statusEl = document.getElementById('reportModalStatus');
    var statusColors = { flagged: '#E52620', pending: '#FF6B00', resolved: '#22c55e' };
    var statusLabels = { flagged: 'Gemeldet', pending: 'In Prüfung', resolved: 'Erledigt' };
    var sc = d.statusClass;
    statusEl.innerHTML = '<span class="status-dot ' + sc + '"></span>'
      + '<span style="color:' + (statusColors[sc] || '#999') + ';font-size:13px;">'
      + (statusLabels[sc] || d.statusLabel) + '</span>';

    // Driver Bewertungen
    var driversEl = document.getElementById('reportModalDrivers');
    driversEl.innerHTML = '';
    if (d.drivers) {
      d.drivers.split('|').forEach(function (part) {
        var p = document.createElement('div');
        p.style.cssText = 'display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #222;';
        var parts = part.trim().split(':');
        var name  = parts[0] ? parts[0].trim() : '';
        var val   = parts[1] ? parts[1].trim() : '';
        p.innerHTML = '<span style="color:#666;">' + name + '</span>'
          + '<span style="color:#FF6B00;">' + val + '</span>';
        driversEl.appendChild(p);
      });
      // letztes border entfernen
      var last = driversEl.lastChild;
      if (last) last.style.borderBottom = 'none';
    }

    reportDetailModal.classList.add('show');
  }

  function closeReportModal() {
    reportDetailModal.classList.remove('show');
  }

// Zeilen-Klick → Modal öffnen
  var modReportRows = document.querySelectorAll('.mod-report-row');
  modReportRows.forEach(function (row) {
    row.addEventListener('click', function () {
      openReportModal(row);
    });
  });

// Schliessen
  if (closeReportModalBtn) {
    closeReportModalBtn.addEventListener('click', closeReportModal);
  }
  if (reportDetailModal) {
    reportDetailModal.addEventListener('click', function (e) {
      if (e.target === reportDetailModal) closeReportModal();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeReportModal();
  });

// Aktions-Buttons im Modal
  var reportActionReview  = document.getElementById('reportActionReview');
  var reportActionResolve = document.getElementById('reportActionResolve');
  var reportActionDismiss = document.getElementById('reportActionDismiss');

  if (reportActionReview) {
    reportActionReview.addEventListener('click', function () {
      var id = document.getElementById('reportModalId').textContent;
      showAdminToast(id + ' — Status auf «In Prüfung» gesetzt');
      closeReportModal();
    });
  }
  if (reportActionResolve) {
    reportActionResolve.addEventListener('click', function () {
      var id = document.getElementById('reportModalId').textContent;
      showAdminToast(id + ' — Meldung erledigt');
      closeReportModal();
    });
  }
  if (reportActionDismiss) {
    reportActionDismiss.addEventListener('click', function () {
      var id = document.getElementById('reportModalId').textContent;
      showAdminToast(id + ' — Meldung abgelehnt');
      closeReportModal();
    });
  }

  /* ─── Deactivate User Modal ─── */
  var deactivateModal = document.getElementById('deactivateModal');
  var cancelDeactivateBtn = document.getElementById('cancelDeactivateBtn');
  var confirmDeactivateBtn = document.getElementById('confirmDeactivateBtn');
  var currentDeactivateRow = null;

  if (cancelDeactivateBtn) {
    cancelDeactivateBtn.addEventListener('click', function () {
      deactivateModal.classList.remove('show');
    });
  }
  if (deactivateModal) {
    deactivateModal.addEventListener('click', function (e) {
      if (e.target === deactivateModal) deactivateModal.classList.remove('show');
    });
  }

  var deactivateBtns = document.querySelectorAll('.btn-admin.danger[title="Deaktivieren"]');
  deactivateBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var row = btn.closest('tr');
      currentDeactivateRow = row;

      var name = row.querySelector('.text-white.text-sm.font-medium').textContent;
      var email = row.querySelector('.text-xs').textContent;
      var dept = row.querySelector('td:nth-child(2) span').textContent;
      var roleBadge = row.querySelector('.role-badge');
      var role = roleBadge ? roleBadge.textContent.trim() : '';
      var feedbacks = row.querySelector('.hide-mobile span')
        ? row.querySelector('.hide-mobile span').textContent
        : '—';
      var initials = row.querySelector('.avatar').textContent.trim();

      document.getElementById('deactivateAvatar').textContent = initials;
      document.getElementById('deactivateName').textContent = name;
      document.getElementById('deactivateEmail').textContent = email;
      document.getElementById('deactivateRole').textContent = role;
      document.getElementById('deactivateDept').textContent = dept;
      document.getElementById('deactivateFeedbacks').textContent = feedbacks;

      deactivateModal.classList.add('show');
    });
  });

  if (confirmDeactivateBtn) {
    confirmDeactivateBtn.addEventListener('click', function () {
      if (currentDeactivateRow) {
        var name = document.getElementById('deactivateName').textContent;
        showAdminToast(name + ' wurde deaktiviert');
      }
      deactivateModal.classList.remove('show');
      currentDeactivateRow = null;
    });
  }


  /* ═══════════════════════════════════════════════════════
     Dashboard Charts — Chart.js Initialization
     ═══════════════════════════════════════════════════════ */

  function initDashboardCharts() {
    if (typeof Chart === 'undefined') return;

    Chart.defaults.color = '#777';
    Chart.defaults.borderColor = '#2e2e2e';
    Chart.defaults.font.family = "'DM Sans', sans-serif";
    Chart.defaults.font.size = 12;

    /* ── Feedback-Aktivität — Bar Chart (6 Monate) ── */
    var activityCanvas = document.getElementById('activityChart');
    if (activityCanvas) {
      new Chart(activityCanvas.getContext('2d'), {
        type: 'bar',
        data: {
          labels: ['Okt', 'Nov', 'Dez', 'Jan', 'Feb', 'Mär'],
          datasets: [
            {
              label: 'Öffentlich',
              data: [8, 11, 7, 10, 9, 10],
              backgroundColor: '#FF6B00',
              borderRadius: 6,
              borderSkipped: false,
              barPercentage: 0.7,
              categoryPercentage: 0.6
            },
            {
              label: 'Anonym',
              data: [3, 5, 4, 6, 5, 8],
              backgroundColor: '#E52620',
              borderRadius: 6,
              borderSkipped: false,
              barPercentage: 0.7,
              categoryPercentage: 0.6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top',
              align: 'end',
              labels: {
                boxWidth: 10,
                boxHeight: 10,
                borderRadius: 3,
                useBorderRadius: true,
                padding: 16,
                font: { size: 11, family: "'DM Sans', sans-serif" },
                color: '#999'
              }
            },
            tooltip: {
              backgroundColor: '#1e1e1e',
              titleColor: '#fff',
              bodyColor: '#aaa',
              borderColor: '#2e2e2e',
              borderWidth: 1,
              cornerRadius: 8,
              padding: 12,
              titleFont: { family: "'Bodoni MT', sans-serif", weight: '600' }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: '#666', font: { size: 11 } }
            },
            y: {
              beginAtZero: true,
              grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
              ticks: { color: '#555', font: { size: 11 }, stepSize: 5 }
            }
          }
        }
      });
    }

    /* ── Sichtbarkeit — Donut Chart ── */
    var visibilityCanvas = document.getElementById('visibilityChart');
    if (visibilityCanvas) {
      new Chart(visibilityCanvas, {
        type: 'doughnut',
        data: {
          labels: ['Öffentlich', 'Anonym'],
          datasets: [{
            data: [55, 31],
            backgroundColor: ['#FF6B00', '#E52620'],
            borderColor: '#1e1e1e',
            borderWidth: 3,
            hoverOffset: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          cutout: '65%',
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#1e1e1e',
              titleColor: '#fff',
              bodyColor: '#aaa',
              borderColor: '#2e2e2e',
              borderWidth: 1,
              cornerRadius: 8,
              padding: 12,
              callbacks: {
                label: function (context) {
                  var total = context.dataset.data.reduce(function (a, b) { return a + b; }, 0);
                  var pct = Math.round((context.raw / total) * 100);
                  return context.label + ': ' + context.raw + ' (' + pct + '%)';
                }
              }
            }
          }
        }
      });
    }
  }

  /* Init charts (Chart.js might load async) */
  initDashboardCharts();

  /* ── Animate Driver/Dept Bars on Dashboard Tab Switch ── */
  var dashTab = document.getElementById('tabBtn-notifications');
  if (dashTab) {
    dashTab.addEventListener('click', function () {
      var fills = document.querySelectorAll('.dash-driver-bar-fill, .dash-dept-bar-fill');
      fills.forEach(function (fill) {
        var w = fill.style.width;
        fill.style.width = '0%';
        fill.offsetHeight;
        fill.style.width = w;
      });
      /* Re-init charts if they weren't ready on first load */
      initDashboardCharts();
    });
  }

}); /* END DOMContentLoaded */
