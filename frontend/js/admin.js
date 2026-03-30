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

});
