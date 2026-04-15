/**
 * pages/admin.js
 * Feedback Hub — Admin-Seite dynamisch rendern
 */

(function () {

  /* ═══════════════════════════════════════════════════════
     Render Stats Overview
     ═══════════════════════════════════════════════════════ */

  function renderStats() {
    var el = document.getElementById('admin-stats-container');
    if (!el) return;
    var stats = FeedbackAPI.getAdminStats();
    el.innerHTML =
      '<div class="stat-card"><div class="stat-number" style="color:#22c55e">' + stats.totalFeedbacks + '</div><div class="stat-label">' + I18n.t('admin.total_feedback') + '</div></div>' +
      '<div class="stat-card"><div class="stat-number highlight">' + stats.totalUsers + '</div><div class="stat-label">' + I18n.t('admin.total_users') + '</div></div>';
  }

  /* ═══════════════════════════════════════════════════════
     Render KPI Cards
     ═══════════════════════════════════════════════════════ */

  function renderKpis() {
    var el = document.getElementById('admin-kpis-container');
    if (!el) return;
    var kpis = FeedbackAPI.getAdminKpis();
    el.innerHTML = kpis.map(function (k) {
      var unit = k.unit ? '<span class="dash-kpi-unit">' + k.unit + '</span>' : '';
      return '<div class="dash-kpi-card">' +
        '<div class="dash-kpi-number">' + k.number + unit + '</div>' +
        '<div class="dash-kpi-label">' + k.label + '</div>' +
        '<div class="dash-kpi-trend ' + k.trendType + '">' + k.trend + '</div></div>';
    }).join('');
  }

  /* ═══════════════════════════════════════════════════════
     Render Driver Averages
     ═══════════════════════════════════════════════════════ */

  function renderDriverAverages() {
    var el = document.getElementById('admin-driver-averages');
    if (!el) return;
    var drivers = FeedbackAPI.getAdminDriverAverages();
    el.innerHTML = drivers.map(function (d) {
      return '<div class="dash-driver-row">' +
        '<span class="dash-driver-name">' + I18n.t('driver.' + d.name) + '</span>' +
        '<div class="dash-driver-bar-track"><div class="dash-driver-bar-fill" style="width:' + d.pct + '%;" data-val="' + d.value + '"></div></div>' +
        '<span class="dash-driver-val">' + d.value + '</span></div>';
    }).join('');
  }

  /* ═══════════════════════════════════════════════════════
     Render Department Breakdown
     ═══════════════════════════════════════════════════════ */

  function renderDepartments() {
    var el = document.getElementById('admin-departments');
    if (!el) return;
    var depts = FeedbackAPI.getAdminDepartments();
    el.innerHTML = depts.map(function (d) {
      return '<div class="dash-dept-row">' +
        '<span class="dash-dept-name">' + d.name + '</span>' +
        '<div class="dash-dept-bar-track"><div class="dash-dept-bar-fill" style="width:' + d.pct + '%;"></div></div>' +
        '<span class="dash-dept-count">' + d.count + '</span></div>';
    }).join('');
  }

  /* ═══════════════════════════════════════════════════════
     Render System Status
     ═══════════════════════════════════════════════════════ */

  function renderSystemStatus() {
    var el = document.getElementById('admin-system-status');
    if (!el) return;
    var items = FeedbackAPI.getAdminSystemStatus();
    el.innerHTML = items.map(function (s) {
      var details = s.details.map(function (d) {
        return '<div class="dash-status-detail">' + d + '</div>';
      }).join('');
      return '<div class="dash-status-item">' +
        '<div class="dash-status-header"><span class="dash-status-dot ' + s.dot + '"></span><span class="dash-status-title">' + s.title + '</span></div>' +
        details + '</div>';
    }).join('');
  }

  /* ═══════════════════════════════════════════════════════
     Render Donut Legend
     ═══════════════════════════════════════════════════════ */

  function renderDonutLegend() {
    var el = document.getElementById('admin-donut-legend');
    if (!el) return;
    var vis = FeedbackAPI.getAdminChartVisibility();
    var colors = ['#FF6B00', '#E52620'];
    el.innerHTML = vis.labels.map(function (l, i) {
      return '<div class="dash-donut-legend-item">' +
        '<span class="dash-dot" style="background:' + colors[i] + ';"></span>' +
        '<span>' + l + ' - ' + vis.data[i] + '</span></div>';
    }).join('');
  }

  /* ═══════════════════════════════════════════════════════
     Render Moderation Stats
     ═══════════════════════════════════════════════════════ */

  function renderModerationStats() {
    var el = document.getElementById('admin-mod-stats');
    if (!el) return;
    var stats = FeedbackAPI.getModerationStats();
    el.innerHTML = stats.map(function (s) {
      return '<div class="stat-card"><div class="stat-number" style="color:' + s.color + ';">' + s.number + '</div><div class="stat-label">' + s.label + '</div></div>';
    }).join('');
  }

  /* ═══════════════════════════════════════════════════════
     Render Moderation Table
     ═══════════════════════════════════════════════════════ */

  function renderModerationTable() {
    var el = document.getElementById('feedbackTableBody1');
    if (!el) return;
    var reports = FeedbackAPI.getModerationReports();

    el.innerHTML = reports.map(function (r) {
      var statusColors = { flagged: '#E52620', pending: '#FF6B00', resolved: '#22c55e' };
      var statusColor = statusColors[r.statusClass] || '#999';

      var vonAvatar = r.vonInitials === '?'
        ? '<div class="avatar" style="width:28px;height:28px;font-size:10px;border-radius:6px;background:#333;color:#666;">?</div>'
        : '<div class="avatar" style="width:28px;height:28px;font-size:10px;border-radius:6px;">' + r.vonInitials + '</div>';

      var vonName = r.von === I18n.t('common.anonymous')
        ? '<span style="color:#666;font-size:13px;">' + I18n.t('common.anonymous') + '</span>'
        : '<span class="text-white text-sm">' + r.von + '</span>';

      var typBadge = r.typ === I18n.t('common.anonymous')
        ? '<span class="role-badge" style="background:rgba(229,38,32,0.1);color:#E52620;">' + I18n.t('common.anonymous') + '</span>'
        : '<span class="role-badge user">' + I18n.t('common.public') + '</span>';

      var ratingColor = r.typ === I18n.t('common.anonymous') ? '#E52620' : '#FF6B00';

      return '<tr class="mod-report-row"' +
        ' data-id="' + r.id + '"' +
        ' data-von="' + r.von + '" data-von-initials="' + r.vonInitials + '"' +
        ' data-an="' + r.an + '" data-an-initials="' + r.anInitials + '"' +
        ' data-datum="' + r.datum + '" data-typ="' + r.typ + '" data-rating="' + r.rating + '"' +
        ' data-status-label="' + r.statusLabel + '" data-status-class="' + r.statusClass + '"' +
        ' data-reason="' + r.reason.replace(/"/g, '&quot;') + '"' +
        ' data-strengths="' + r.strengths.replace(/"/g, '&quot;') + '"' +
        ' data-improvements="' + r.improvements.replace(/"/g, '&quot;') + '"' +
        ' data-drivers="' + r.drivers.replace(/"/g, '&quot;') + '"' +
        ' style="cursor:pointer;">' +
        '<td><span style="color:#666;font-size:12px;font-family:\'Bodoni MT\',sans-serif;">' + r.id + '</span></td>' +
        '<td><div class="flex items-center gap-2">' + vonAvatar + vonName + '</div></td>' +
        '<td><div class="flex items-center gap-2"><div class="avatar" style="width:28px;height:28px;font-size:10px;border-radius:6px;">' + r.anInitials + '</div><span class="text-white text-sm">' + r.an + '</span></div></td>' +
        '<td><span style="color:#999;font-size:13px;">' + r.datum + '</span></td>' +
        '<td>' + typBadge + '</td>' +
        '<td class="hide-mobile"><span style="color:' + ratingColor + ';font-size:13px;">★ ' + r.rating + '</span></td>' +
        '<td class="fb-status-cell"><span class="status-dot ' + r.statusClass + '"></span><span style="color:' + statusColor + ';font-size:12px;">' + r.statusLabel + '</span></td>' +
        '</tr>';
    }).join('\n');
  }

  /* ═══════════════════════════════════════════════════════
     Render User Table
     ═══════════════════════════════════════════════════════ */

  function renderUserTable() {
    var el = document.getElementById('userTableBody');
    if (!el) return;
    var users = FeedbackAPI.getUsers();

    el.innerHTML = users.map(function (u) {
      var roleCls = u.role === 'admin' ? 'admin' : u.role === 'manager' ? 'manager' : 'user';
      var roleLabel = u.role === 'admin'
        ? I18n.t('admin.role_badge')
        : u.role === 'manager'
          ? I18n.t('admin.role_manager')
          : I18n.t('admin.role_user');
      var feedbackStr = u.feedbackReceived + ' / ' + u.feedbackGiven;

      var actionBtn;
      if (u.active) {
        actionBtn = '<button class="btn-admin danger" type="button" data-i18n-title="admin.btn_deactivate" title="' + I18n.t('admin.btn_deactivate') + '">\uD83D\uDEAB</button>';
      } else {
        actionBtn = '<button class="btn-admin" type="button" data-i18n-title="admin.btn_activate" title="' + I18n.t('admin.btn_activate') + '" style="color:#22c55e;border-color:#22c55e33;">\u2705</button>';
      }

      return '<tr>' +
        '<td><div class="flex items-center gap-3">' +
        '<div class="avatar" style="width:34px;height:34px;font-size:11px;border-radius:8px;">' + u.initials + '</div>' +
        '<div><div class="text-white text-sm font-medium">' + u.name + '</div>' +
        '<div class="text-xs" style="color:#666;">' + u.email + '</div></div></div></td>' +
        '<td><span style="color:#999;font-size:13px;">' + u.department + '</span></td>' +
        '<td><span class="role-badge ' + roleCls + '">' + roleLabel + '</span></td>' +
        '<td class="hide-mobile"><span style="color:#999;font-size:13px;">' + feedbackStr + '</span></td>' +
        '<td style="text-align:right;"><div class="flex gap-2 justify-end">' +
        actionBtn +
        '<button class="btn-admin" type="button" data-i18n-title="admin.btn_legal_hold" title="' + I18n.t('admin.btn_legal_hold') + '">\uD83D\uDD12</button>' +
        '</div></td></tr>';
    }).join('\n');
  }

  /* ═══════════════════════════════════════════════════════
     Charts
     ═══════════════════════════════════════════════════════ */

  function initDashboardCharts() {
    if (typeof Chart === 'undefined') return;

    Chart.defaults.color = '#777';
    Chart.defaults.borderColor = '#2e2e2e';
    Chart.defaults.font.family = "'DM Sans', sans-serif";
    Chart.defaults.font.size = 12;

    var activityData = FeedbackAPI.getAdminChartActivity();
    var activityCanvas = document.getElementById('activityChart');
    if (activityCanvas) {
      new Chart(activityCanvas.getContext('2d'), {
        type: 'bar',
        data: {
          labels: activityData.labels,
          datasets: activityData.datasets.map(function (ds, i) {
            var colors = ['#FF6B00', '#E52620'];
            return {
              label: ds.label,
              data: ds.data,
              backgroundColor: colors[i] + '33',
              borderColor: colors[i],
              borderWidth: 2,
              borderRadius: 6,
              borderSkipped: false
            };
          })
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { display: true, position: 'top', labels: { color: '#777', font: { size: 12 }, boxWidth: 12, padding: 16 } },
            tooltip: { backgroundColor: '#1e1e1e', titleColor: '#fff', bodyColor: '#aaa', borderColor: '#2e2e2e', borderWidth: 1, cornerRadius: 8, padding: 12 }
          },
          scales: {
            x: { grid: { display: false }, ticks: { color: '#555' } },
            y: { grid: { color: '#1e1e1e' }, ticks: { color: '#555', stepSize: 5 }, beginAtZero: true }
          }
        }
      });
    }

    var visData = FeedbackAPI.getAdminChartVisibility();
    var visCanvas = document.getElementById('visibilityChart');
    if (visCanvas) {
      new Chart(visCanvas.getContext('2d'), {
        type: 'doughnut',
        data: {
          labels: visData.labels,
          datasets: [{ data: visData.data, backgroundColor: ['#FF6B00', '#E52620'], borderColor: '#1e1e1e', borderWidth: 3, hoverOffset: 6 }]
        },
        options: {
          responsive: true, maintainAspectRatio: true, cutout: '65%',
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#1e1e1e', titleColor: '#fff', bodyColor: '#aaa', borderColor: '#2e2e2e', borderWidth: 1, cornerRadius: 8, padding: 12,
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

  /* ═══════════════════════════════════════════════════════
     Event Bindings
     ═══════════════════════════════════════════════════════ */

  function bindEvents() {

    /* Tab Switching */
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

    /* User Search */
    var userSearch = document.getElementById('userSearch');
    if (userSearch) {
      userSearch.addEventListener('input', function () {
        var query = userSearch.value.toLowerCase();
        var rows = document.querySelectorAll('#userTableBody tr');
        rows.forEach(function (row) { row.style.display = row.textContent.toLowerCase().includes(query) ? '' : 'none'; });
      });
    }

    /* Moderation Search */
    var modSearch = document.getElementById('moderationSearch');
    if (modSearch) {
      modSearch.addEventListener('input', function () {
        var query = modSearch.value.toLowerCase();
        var items = document.querySelectorAll('.feedback-preview');
        items.forEach(function (item) { item.style.display = item.textContent.toLowerCase().includes(query) ? '' : 'none'; });
      });
    }

    /* Role Filter */
    var roleFilters = document.querySelectorAll('input[name="userFilter"]');
    roleFilters.forEach(function (radio) {
      radio.addEventListener('change', function () {
        var filter = radio.value;
        var rows = document.querySelectorAll('#userTableBody tr');
        rows.forEach(function (row) {
          if (filter === 'all') { row.style.display = ''; return; }
          var badge = row.querySelector('.role-badge');
          var statusDot = row.querySelector('.status-dot');
          if (filter === 'inactive') { row.style.display = (statusDot && statusDot.classList.contains('inactive')) ? '' : 'none'; }
          else if (filter === 'admin') { row.style.display = (badge && badge.classList.contains('admin')) ? '' : 'none'; }
          else if (filter === 'manager') { row.style.display = (badge && badge.classList.contains('manager')) ? '' : 'none'; }
          else if (filter === 'user') { row.style.display = (badge && badge.classList.contains('user')) ? '' : 'none'; }
        });
      });
    });

    /* Moderation Status Filter */
    var modFilters = document.querySelectorAll('input[name="modFilter"]');
    modFilters.forEach(function (radio) {
      radio.addEventListener('change', function () {
        var filter = radio.value;
        var rows = document.querySelectorAll('.mod-report-row');
        rows.forEach(function (row) {
          if (filter === 'all') { row.style.display = ''; return; }
          var sc = row.dataset.statusClass;
          if (filter === 'open')     row.style.display = (sc === 'flagged')  ? '' : 'none';
          if (filter === 'review')   row.style.display = (sc === 'pending')  ? '' : 'none';
          if (filter === 'resolved') row.style.display = (sc === 'resolved') ? '' : 'none';
        });
      });
    });

    /* Expand/Collapse */
    var expandBtns = document.querySelectorAll('.expand-btn');
    expandBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var preview = btn.closest('.feedback-preview');
        if (preview.classList.contains('expanded')) {
          preview.classList.remove('expanded');
          btn.textContent = I18n.t('admin.expand_more');
        } else {
          preview.classList.add('expanded');
          btn.textContent = I18n.t('admin.expand_less');
        }
      });
    });

    /* Report Detail Modal */
    var reportDetailModal = document.getElementById('reportDetailModal');
    var closeReportModalBtn = document.getElementById('closeReportModalBtn');

    function openReportModal(row) {
      document.getElementById('reportModalId').textContent = row.dataset.id;

      var vonAvatar = document.getElementById('reportModalVonAvatar');
      var vonInitials = row.dataset.vonInitials;
      if (vonInitials === '?') {
        vonAvatar.style.background = '#333';
        vonAvatar.style.color = '#666';
      }
      vonAvatar.textContent = vonInitials;
      document.getElementById('reportModalVon').textContent = row.dataset.von === I18n.t('common.anonymous')
        ? I18n.t('common.anonymous')
        : row.dataset.von;

      var anAvatar = document.getElementById('reportModalAnAvatar');
      anAvatar.textContent = row.dataset.anInitials;
      document.getElementById('reportModalAn').textContent = row.dataset.an;
      document.getElementById('reportModalDatum').textContent = row.dataset.datum;

      var typEl = document.getElementById('reportModalTyp');
      if (row.dataset.typ === I18n.t('common.anonymous')) {
        typEl.innerHTML = '<span class="role-badge" style="background:rgba(229,38,32,0.1);color:#E52620;">' + I18n.t('common.anonymous') + '</span>';
      } else {
        typEl.innerHTML = '<span class="role-badge user">' + I18n.t('common.public') + '</span>';
      }

      document.getElementById('reportModalReason').textContent = row.dataset.reason;
      document.getElementById('reportModalStrengths').textContent = row.dataset.strengths;
      document.getElementById('reportModalImprovements').textContent = row.dataset.improvements;

      var driversEl = document.getElementById('reportModalDrivers');
      driversEl.innerHTML = '';
      if (row.dataset.drivers) {
        row.dataset.drivers.split('|').forEach(function (entry) {
          var parts = entry.split(':');
          var name = parts[0] ? parts[0].trim() : '';
          var val = parts[1] ? parts[1].trim() : '';
          var p = document.createElement('div');
          p.style.cssText = 'display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #2e2e2e;font-size:13px;font-family:\'DM Sans\',sans-serif;';
          p.innerHTML = '<span style="color:#666;">' + name + '</span><span style="color:#FF6B00;">' + val + '</span>';
          driversEl.appendChild(p);
        });
        var last = driversEl.lastChild;
        if (last) last.style.borderBottom = 'none';
      }
      reportDetailModal.classList.add('show');
    }

    function closeReportModal() {
      reportDetailModal.classList.remove('show');
    }

    var modReportRows = document.querySelectorAll('.mod-report-row');
    modReportRows.forEach(function (row) {
      row.addEventListener('click', function () { openReportModal(row); });
    });

    if (closeReportModalBtn) closeReportModalBtn.addEventListener('click', closeReportModal);
    if (reportDetailModal) reportDetailModal.addEventListener('click', function (e) { if (e.target === reportDetailModal) closeReportModal(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeReportModal(); });

    var reportActionReview = document.getElementById('reportActionReview');
    var reportActionResolve = document.getElementById('reportActionResolve');
    var reportActionDismiss = document.getElementById('reportActionDismiss');

    if (reportActionReview) reportActionReview.addEventListener('click', function () {
      Render.showToast(document.getElementById('reportModalId').textContent + ' - ' + I18n.t('admin.toast_review'));
      closeReportModal();
    });
    if (reportActionResolve) reportActionResolve.addEventListener('click', function () {
      Render.showToast(document.getElementById('reportModalId').textContent + ' - ' + I18n.t('admin.toast_resolved'));
      closeReportModal();
    });
    if (reportActionDismiss) reportActionDismiss.addEventListener('click', function () {
      Render.showToast(document.getElementById('reportModalId').textContent + ' - ' + I18n.t('admin.toast_dismissed'));
      closeReportModal();
    });

    /* Deactivate User Modal */
    var deactivateModal = document.getElementById('deactivateModal');
    var cancelDeactivateBtn = document.getElementById('cancelDeactivateBtn');
    var confirmDeactivateBtn = document.getElementById('confirmDeactivateBtn');
    var currentDeactivateRow = null;

    if (cancelDeactivateBtn) cancelDeactivateBtn.addEventListener('click', function () { deactivateModal.classList.remove('show'); });
    if (deactivateModal) deactivateModal.addEventListener('click', function (e) { if (e.target === deactivateModal) deactivateModal.classList.remove('show'); });

    var deactivateBtns = document.querySelectorAll('.btn-admin.danger[title="' + I18n.t('admin.btn_deactivate') + '"]');
    deactivateBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var row = btn.closest('tr');
        currentDeactivateRow = row;
        var name = row.querySelector('.text-white.text-sm.font-medium').textContent;
        var email = row.querySelector('.text-xs').textContent;
        var dept = row.querySelector('td:nth-child(2) span').textContent;
        var roleBadge = row.querySelector('.role-badge');
        var role = roleBadge ? roleBadge.textContent.trim() : '';
        var feedbacks = row.querySelector('.hide-mobile span') ? row.querySelector('.hide-mobile span').textContent : '-';
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
          Render.showToast(document.getElementById('deactivateName').textContent + ' ' + I18n.t('admin.toast_deactivated'));
        }
        deactivateModal.classList.remove('show');
        currentDeactivateRow = null;
      });
    }
  }

  /* ═══════════════════════════════════════════════════════
     Init
     ═══════════════════════════════════════════════════════ */

  function init() {
    // Navbar
    var navEl = document.getElementById('navbar-container');
    if (navEl) navEl.innerHTML = Render.navbar('admin');

    // Render all dynamic content
    renderStats();
    renderKpis();
    renderDriverAverages();
    renderDepartments();
    renderSystemStatus();
    renderDonutLegend();
    renderModerationStats();
    renderModerationTable();
    renderUserTable();

    // Charts
    initDashboardCharts();

    // Events
    bindEvents();

    // Profile Dropdown
    Render.initProfileDropdown();
  }

  document.addEventListener('DOMContentLoaded', init);

})();
