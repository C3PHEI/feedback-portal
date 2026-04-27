/**
 * pages/admin.js
 * Feedback Hub — Admin-Seite dynamisch rendern
 *
 * Schritt 8: Dashboard-Tab via Backend-API.
 * Schritt 9: User-Tab via Backend-API (Liste, Rolle, Department, Aktivieren/Deaktivieren).
 * Moderation-Tab läuft weiter mit Mock (Schritt 10).
 *
 * Pattern: Render-Funktionen sind synchron und nehmen Daten als Parameter.
 * Asynchrones Datenladen passiert in init() via Promise.all.
 * User-Tabelle hält State in modul-internem `_userCache`, damit
 * optimistische Updates nach API-Aktionen ohne kompletten Reload möglich sind.
 */

(function () {

  // Modul-State für User-Tab (Schritt 9)
  var _userCache       = [];
  var _departmentCache = [];

  /* ═══════════════════════════════════════════════════════
     Render: Stats Overview (Backend)
     ═══════════════════════════════════════════════════════ */

  function renderStats(stats) {
    var el = document.getElementById('admin-stats-container');
    if (!el || !stats) return;
    el.innerHTML =
      '<div class="stat-card"><div class="stat-number" style="color:#22c55e">' + stats.totalFeedbacks + '</div><div class="stat-label">' + I18n.t('admin.total_feedback') + '</div></div>' +
      '<div class="stat-card"><div class="stat-number highlight">' + stats.totalUsers + '</div><div class="stat-label">' + I18n.t('admin.total_users') + '</div></div>';
  }

  function renderKpis(kpis) {
    var el = document.getElementById('admin-kpis-container');
    if (!el || !kpis) return;
    el.innerHTML = kpis.map(function (k) {
      var unit = k.unit ? '<span class="dash-kpi-unit">' + k.unit + '</span>' : '';
      return '<div class="dash-kpi-card">' +
        '<div class="dash-kpi-number">' + k.number + unit + '</div>' +
        '<div class="dash-kpi-label">' + k.label + '</div>' +
        '<div class="dash-kpi-trend ' + k.trendType + '">' + k.trend + '</div></div>';
    }).join('');
  }

  function renderDriverAverages(drivers) {
    var el = document.getElementById('admin-driver-averages');
    if (!el || !drivers) return;
    el.innerHTML = drivers.map(function (d) {
      return '<div class="dash-driver-row">' +
        '<span class="dash-driver-name">' + I18n.t('driver.' + d.name) + '</span>' +
        '<div class="dash-driver-bar-track"><div class="dash-driver-bar-fill" style="width:' + d.pct + '%;" data-val="' + d.value + '"></div></div>' +
        '<span class="dash-driver-val">' + d.value + '</span></div>';
    }).join('');
  }

  function renderDepartments(depts) {
    var el = document.getElementById('admin-departments');
    if (!el || !depts) return;
    el.innerHTML = depts.map(function (d) {
      return '<div class="dash-dept-row">' +
        '<span class="dash-dept-name">' + d.name + '</span>' +
        '<div class="dash-dept-bar-track"><div class="dash-dept-bar-fill" style="width:' + d.pct + '%;"></div></div>' +
        '<span class="dash-dept-count">' + d.count + '</span></div>';
    }).join('');
  }

  function renderDonutLegend(vis) {
    var el = document.getElementById('admin-donut-legend');
    if (!el || !vis) return;
    var colors = ['#FF6B00', '#E52620'];
    el.innerHTML = vis.labels.map(function (l, i) {
      return '<div class="dash-donut-legend-item">' +
        '<span class="dash-dot" style="background:' + colors[i] + ';"></span>' +
        '<span>' + l + ' - ' + vis.data[i] + '</span></div>';
    }).join('');
  }

  function renderSystemStatus(items) {
    var el = document.getElementById('admin-system-status');
    if (!el || !items) return;
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
     Render: Moderation (Mock — Schritt 10)
     ═══════════════════════════════════════════════════════ */

  function renderModerationStats() {
    var el = document.getElementById('admin-mod-stats');
    if (!el) return;
    var stats = FeedbackAPI.getModerationStats();
    el.innerHTML = stats.map(function (s) {
      return '<div class="stat-card"><div class="stat-number" style="color:' + s.color + ';">' + s.number + '</div><div class="stat-label">' + s.label + '</div></div>';
    }).join('');
  }

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
     Render: User Table (Backend — Schritt 9)
     ═══════════════════════════════════════════════════════ */

  function renderUserTable(users) {
    var el = document.getElementById('userTableBody');
    if (!el) return;

    _userCache = users || [];

    if (!_userCache.length) {
      el.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--color-text-ghost);padding:40px;">' +
        'Keine Benutzer gefunden.</td></tr>';
      return;
    }

    el.innerHTML = _userCache.map(buildUserRow).join('\n');
  }

  function buildUserRow(u) {
    var roleCls = u.role === 'admin' ? 'admin' : u.role === 'manager' ? 'manager' : 'user';
    var roleLabel = u.role === 'admin'
      ? I18n.t('admin.role_badge')
      : u.role === 'manager'
        ? I18n.t('admin.role_manager')
        : I18n.t('admin.role_user');

    // Manager-Marker für Department-Manager
    var managerSuffix = u.isDepartmentManager
      ? ' <span style="color:var(--color-orange);font-size:10px;margin-left:4px;" title="Abteilungsleiter">\u2605</span>'
      : '';

    var feedbackStr = u.feedbackReceived + ' / ' + u.feedbackGiven;
    var inactiveCls = !u.active ? ' style="opacity:0.55;"' : '';

    var activateBtn;
    if (u.active) {
      activateBtn = '<button class="btn-admin danger user-action-btn" data-action="deactivate" data-user-id="' + u.id + '" type="button" title="' + I18n.t('admin.btn_deactivate') + '">\uD83D\uDEAB</button>';
    } else {
      activateBtn = '<button class="btn-admin user-action-btn" data-action="activate" data-user-id="' + u.id + '" type="button" title="' + I18n.t('admin.btn_activate') + '" style="color:#22c55e;border-color:#22c55e33;">\u2705</button>';
    }

    return '<tr' + inactiveCls + ' data-user-id="' + u.id + '">' +
      '<td><div class="flex items-center gap-3">' +
      '<div class="avatar" style="width:34px;height:34px;font-size:11px;border-radius:8px;">' + u.initials + '</div>' +
      '<div><div class="text-white text-sm font-medium">' + u.name + '</div>' +
      '<div class="text-xs" style="color:#666;">' + u.email + '</div></div></div></td>' +
      '<td><span style="color:#999;font-size:13px;">' + u.department + '</span></td>' +
      '<td><span class="role-badge ' + roleCls + '">' + roleLabel + '</span>' + managerSuffix + '</td>' +
      '<td class="hide-mobile"><span style="color:#999;font-size:13px;">' + feedbackStr + '</span></td>' +
      '<td style="text-align:right;"><div class="flex gap-2 justify-end">' +
      '<button class="btn-admin user-action-btn" data-action="role" data-user-id="' + u.id + '" type="button" title="' + I18n.t('admin.btn_change_role') + '">\uD83D\uDC64</button>' +
      '<button class="btn-admin user-action-btn" data-action="dept" data-user-id="' + u.id + '" type="button" title="' + I18n.t('admin.btn_change_dept') + '">\uD83C\uDFE2</button>' +
      activateBtn +
      '</div></td></tr>';
  }

  function refreshUserRow(updatedUser) {
    var idx = _userCache.findIndex(function (u) { return u.id === updatedUser.id; });
    if (idx === -1) return;
    _userCache[idx] = updatedUser;

    var oldRow = document.querySelector('tr[data-user-id="' + updatedUser.id + '"]');
    if (!oldRow) return;
    var temp = document.createElement('tbody');
    temp.innerHTML = buildUserRow(updatedUser);
    var newRow = temp.querySelector('tr');
    oldRow.parentNode.replaceChild(newRow, oldRow);
  }

  /* ═══════════════════════════════════════════════════════
     Charts
     ═══════════════════════════════════════════════════════ */

  function initDashboardCharts(activityData, visData) {
    if (typeof Chart === 'undefined') return;

    Chart.defaults.color = '#777';
    Chart.defaults.borderColor = '#2e2e2e';
    Chart.defaults.font.family = "'DM Sans', sans-serif";
    Chart.defaults.font.size = 12;

    var activityCanvas = document.getElementById('activityChart');
    if (activityCanvas && activityData) {
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

    var visCanvas = document.getElementById('visibilityChart');
    if (visCanvas && visData) {
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
     Tab Switching
     ═══════════════════════════════════════════════════════ */

  function initTabSwitching() {
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
  }

  /* ═══════════════════════════════════════════════════════
     Helper: Backend-Errorcode → übersetzte Meldung
     ═══════════════════════════════════════════════════════ */

  function translateError(e) {
    var key = 'error.' + (e.errorCode || 'generic');
    var translated = I18n.t(key);
    if (translated === key) {
      return I18n.t('error.generic') + ' (' + (e.errorCode || 'unknown') + ')';
    }
    return translated;
  }

  /* ═══════════════════════════════════════════════════════
     User-Aktionen via Event-Delegation
     ═══════════════════════════════════════════════════════ */

  function bindUserTableActions() {
    var tbody = document.getElementById('userTableBody');
    if (!tbody) return;

    tbody.addEventListener('click', function (e) {
      var btn = e.target.closest('.user-action-btn');
      if (!btn) return;

      var action = btn.dataset.action;
      var userId = btn.dataset.userId;
      var user   = _userCache.find(function (u) { return u.id === userId; });
      if (!user) return;

      if (action === 'role')       openRoleModal(user);
      if (action === 'dept')       openDeptModal(user);
      if (action === 'activate')   handleActivate(user);
      if (action === 'deactivate') openDeactivateModal(user);
    });
  }

  /* ═══════════════════════════════════════════════════════
     Modal: Rolle ändern
     ═══════════════════════════════════════════════════════ */

  var _currentRoleUser = null;

  function openRoleModal(user) {
    _currentRoleUser = user;
    var modal = document.getElementById('roleModal');
    if (!modal) return;

    document.getElementById('roleUserAvatar').textContent = user.initials;
    document.getElementById('roleUserName').textContent = user.name;
    document.getElementById('roleUserEmail').textContent = user.email;

    document.querySelectorAll('input[name="userRole"]').forEach(function (radio) {
      radio.checked = (radio.value === user.role);
    });

    document.getElementById('roleManagerFlag').checked = !!user.isDepartmentManager;

    modal.classList.add('show');
  }

  function closeRoleModal() {
    var modal = document.getElementById('roleModal');
    if (modal) modal.classList.remove('show');
    _currentRoleUser = null;
  }

  async function confirmRoleChange() {
    if (!_currentRoleUser) return;
    var user = _currentRoleUser;

    var newRole = document.querySelector('input[name="userRole"]:checked');
    if (!newRole) return;
    var roleValue   = newRole.value;
    var managerFlag = document.getElementById('roleManagerFlag').checked;

    var btn = document.getElementById('confirmRoleBtn');
    btn.disabled = true;

    try {
      if (roleValue !== user.role) {
        await FeedbackAPI.updateUserRole(user.id, roleValue);
        user.role = roleValue;
      }
      if (managerFlag !== user.isDepartmentManager) {
        await FeedbackAPI.updateUserManagerFlag(user.id, managerFlag);
        user.isDepartmentManager = managerFlag;
      }

      refreshUserRow(user);
      Render.showToast(user.name + ' \u2014 ' + I18n.t('admin.toast_role_updated'));
      closeRoleModal();
    } catch (e) {
      console.error('updateUserRole failed:', e);
      Render.showToast(translateError(e));
    } finally {
      btn.disabled = false;
    }
  }

  /* ═══════════════════════════════════════════════════════
     Modal: Department zuweisen
     ═══════════════════════════════════════════════════════ */

  var _currentDeptUser = null;

  function openDeptModal(user) {
    _currentDeptUser = user;
    var modal = document.getElementById('deptModal');
    if (!modal) return;

    document.getElementById('deptUserAvatar').textContent = user.initials;
    document.getElementById('deptUserName').textContent = user.name;
    document.getElementById('deptUserEmail').textContent = user.email;

    var sel = document.getElementById('deptSelect');
    sel.innerHTML = '<option value="">\u2014 keine Zuweisung \u2014</option>' +
      _departmentCache.map(function (d) {
        var selected = d.id === user.departmentId ? ' selected' : '';
        return '<option value="' + d.id + '"' + selected + '>' + d.name + '</option>';
      }).join('');

    modal.classList.add('show');
  }

  function closeDeptModal() {
    var modal = document.getElementById('deptModal');
    if (modal) modal.classList.remove('show');
    _currentDeptUser = null;
  }

  async function confirmDeptChange() {
    if (!_currentDeptUser) return;
    var user = _currentDeptUser;
    var newDeptId = document.getElementById('deptSelect').value || null;

    if (newDeptId === user.departmentId) {
      closeDeptModal();
      return;
    }

    var btn = document.getElementById('confirmDeptBtn');
    btn.disabled = true;

    try {
      await FeedbackAPI.updateUserDepartment(user.id, newDeptId);

      user.departmentId = newDeptId;
      var dept = _departmentCache.find(function (d) { return d.id === newDeptId; });
      user.department = dept ? dept.name : '\u2013';

      refreshUserRow(user);
      Render.showToast(user.name + ' \u2014 ' + I18n.t('admin.toast_dept_updated'));
      closeDeptModal();
    } catch (e) {
      console.error('updateUserDepartment failed:', e);
      Render.showToast(translateError(e));
    } finally {
      btn.disabled = false;
    }
  }

  /* ═══════════════════════════════════════════════════════
     Aktivieren / Deaktivieren
     ═══════════════════════════════════════════════════════ */

  async function handleActivate(user) {
    try {
      await FeedbackAPI.activateUser(user.id);
      user.active = true;
      user.deactivatedAt = null;
      refreshUserRow(user);
      Render.showToast(user.name + ' \u2014 ' + I18n.t('admin.toast_activated'));
    } catch (e) {
      console.error('activateUser failed:', e);
      Render.showToast(translateError(e));
    }
  }

  var _currentDeactivateUser = null;

  function openDeactivateModal(user) {
    _currentDeactivateUser = user;
    var modal = document.getElementById('deactivateModal');
    if (!modal) return;

    document.getElementById('deactivateAvatar').textContent = user.initials;
    document.getElementById('deactivateName').textContent = user.name;
    document.getElementById('deactivateEmail').textContent = user.email;
    document.getElementById('deactivateRole').textContent =
      user.role === 'admin'   ? I18n.t('admin.role_badge') :
        user.role === 'manager' ? I18n.t('admin.role_manager') :
          I18n.t('admin.role_user');
    document.getElementById('deactivateDept').textContent = user.department;
    document.getElementById('deactivateFeedbacks').textContent = user.feedbackReceived + ' / ' + user.feedbackGiven;

    modal.classList.add('show');
  }

  async function confirmDeactivate() {
    if (!_currentDeactivateUser) return;
    var user = _currentDeactivateUser;
    var modal = document.getElementById('deactivateModal');
    var btn   = document.getElementById('confirmDeactivateBtn');
    btn.disabled = true;

    try {
      await FeedbackAPI.deactivateUser(user.id);
      user.active = false;
      user.deactivatedAt = new Date().toISOString();
      refreshUserRow(user);
      Render.showToast(user.name + ' ' + I18n.t('admin.toast_deactivated'));
      modal.classList.remove('show');
      _currentDeactivateUser = null;
    } catch (e) {
      console.error('deactivateUser failed:', e);
      Render.showToast(translateError(e));
    } finally {
      btn.disabled = false;
    }
  }

  /* ═══════════════════════════════════════════════════════
     Event Bindings (Such, Filter, Modale)
     ═══════════════════════════════════════════════════════ */

  function bindEvents() {

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
          var inactive = row.style.opacity === '0.55';
          if (filter === 'inactive') { row.style.display = inactive ? '' : 'none'; }
          else if (filter === 'admin')   { row.style.display = (badge && badge.classList.contains('admin'))   ? '' : 'none'; }
          else if (filter === 'manager') { row.style.display = (badge && badge.classList.contains('manager')) ? '' : 'none'; }
          else if (filter === 'user')    { row.style.display = (badge && badge.classList.contains('user'))    ? '' : 'none'; }
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
      if (reportDetailModal) reportDetailModal.classList.remove('show');
    }

    var modReportRows = document.querySelectorAll('.mod-report-row');
    modReportRows.forEach(function (row) {
      row.addEventListener('click', function () { openReportModal(row); });
    });

    if (closeReportModalBtn) closeReportModalBtn.addEventListener('click', closeReportModal);
    if (reportDetailModal) reportDetailModal.addEventListener('click', function (e) { if (e.target === reportDetailModal) closeReportModal(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeReportModal();
        closeRoleModal();
        closeDeptModal();
      }
    });

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

    if (cancelDeactivateBtn) cancelDeactivateBtn.addEventListener('click', function () {
      deactivateModal.classList.remove('show');
      _currentDeactivateUser = null;
    });
    if (deactivateModal) deactivateModal.addEventListener('click', function (e) {
      if (e.target === deactivateModal) {
        deactivateModal.classList.remove('show');
        _currentDeactivateUser = null;
      }
    });
    if (confirmDeactivateBtn) {
      confirmDeactivateBtn.addEventListener('click', confirmDeactivate);
    }

    /* Role Modal */
    var roleModal = document.getElementById('roleModal');
    var closeRoleBtn = document.getElementById('closeRoleModalBtn');
    var cancelRoleBtn = document.getElementById('cancelRoleBtn');
    var confirmRoleBtn = document.getElementById('confirmRoleBtn');

    if (closeRoleBtn)  closeRoleBtn.addEventListener('click', closeRoleModal);
    if (cancelRoleBtn) cancelRoleBtn.addEventListener('click', closeRoleModal);
    if (confirmRoleBtn) confirmRoleBtn.addEventListener('click', confirmRoleChange);
    if (roleModal) roleModal.addEventListener('click', function (e) {
      if (e.target === roleModal) closeRoleModal();
    });

    /* Department Modal */
    var deptModal = document.getElementById('deptModal');
    var closeDeptBtn = document.getElementById('closeDeptModalBtn');
    var cancelDeptBtn = document.getElementById('cancelDeptBtn');
    var confirmDeptBtn = document.getElementById('confirmDeptBtn');

    if (closeDeptBtn)  closeDeptBtn.addEventListener('click', closeDeptModal);
    if (cancelDeptBtn) cancelDeptBtn.addEventListener('click', closeDeptModal);
    if (confirmDeptBtn) confirmDeptBtn.addEventListener('click', confirmDeptChange);
    if (deptModal) deptModal.addEventListener('click', function (e) {
      if (e.target === deptModal) closeDeptModal();
    });
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
        '</div>';
      return;
    }

    var me = FeedbackAPI.getCurrentUser();
    if (!me || me.role !== 'admin') {
      document.body.innerHTML = '<div style="padding:40px;color:#fff;font-family:sans-serif;">' +
        '<h1>Keine Berechtigung</h1>' +
        '<p>Diese Seite ist nur für Administratoren zugänglich.</p>' +
        '</div>';
      return;
    }

    var navEl = document.getElementById('navbar-container');
    if (navEl) navEl.innerHTML = Render.navbar('admin');

    Render.initProfileDropdown();
    initTabSwitching();

    // Mock-Render (Schritt 10)
    renderSystemStatus(FeedbackAPI.getAdminSystemStatus());
    renderModerationStats();
    renderModerationTable();

    // Backend-Daten parallel
    try {
      var results = await Promise.all([
        FeedbackAPI.getAdminStats(),
        FeedbackAPI.getAdminKpis(),
        FeedbackAPI.getAdminChartActivity(),
        FeedbackAPI.getAdminChartVisibility(),
        FeedbackAPI.getAdminDriverAverages(),
        FeedbackAPI.getAdminDepartments(),
        FeedbackAPI.getUsers(),
        FeedbackAPI.getDepartments()
      ]);

      var stats        = results[0];
      var kpis         = results[1];
      var activity     = results[2];
      var visibility   = results[3];
      var drivers      = results[4];
      var depts        = results[5];
      var users        = results[6];
      _departmentCache = results[7];

      renderStats(stats);
      renderKpis(kpis);
      renderDriverAverages(drivers);
      renderDepartments(depts);
      renderDonutLegend(visibility);
      renderUserTable(users);

      initDashboardCharts(activity, visibility);
    } catch (e) {
      console.error('Admin-Daten konnten nicht geladen werden:', e);
      var kpisEl = document.getElementById('admin-kpis-container');
      if (kpisEl) {
        kpisEl.innerHTML = '<p style="color:var(--color-danger);padding:20px;text-align:center;grid-column:1/-1;">' +
          'Fehler beim Laden (' + (e.errorCode || 'unknown') + '). Bitte Seite neu laden.</p>';
      }
    }

    // Event-Bindings ZULETZT
    bindEvents();
    bindUserTableActions();
  }

  document.addEventListener('DOMContentLoaded', init);

})();
