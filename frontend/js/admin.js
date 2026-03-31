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
      var items = document.querySelectorAll('.feedback-preview');
      items.forEach(function (item) {
        if (filter === 'all') {
          item.style.display = '';
          return;
        }
        var dot = item.querySelector('.status-dot');
        if (filter === 'open') {
          item.style.display = (dot && dot.classList.contains('flagged')) ? '' : 'none';
        } else if (filter === 'review') {
          item.style.display = (dot && dot.classList.contains('pending')) ? '' : 'none';
        } else if (filter === 'resolved') {
          item.style.display = (dot && dot.classList.contains('resolved')) ? '' : 'none';
        }
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

  /* ─── Feedback Detail Expand/Collapse ─── */
  var fbToggleRows = document.querySelectorAll('.fb-row-toggle');
  fbToggleRows.forEach(function (row) {
    row.addEventListener('click', function () {
      var targetId = row.dataset.target;
      var detailRow = document.getElementById(targetId);
      var chevron = row.querySelector('.fb-chevron');
      if (!detailRow) return;

      if (detailRow.style.display === 'none') {
        detailRow.style.display = '';
        if (chevron) chevron.style.transform = 'rotate(180deg)';
        row.style.background = 'rgba(255,255,255,0.02)';
      } else {
        detailRow.style.display = 'none';
        if (chevron) chevron.style.transform = 'rotate(0deg)';
        row.style.background = '';
      }
    });
  });

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
              titleFont: { family: "'Syne', sans-serif", weight: '600' }
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
