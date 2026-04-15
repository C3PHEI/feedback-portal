/**
 * render.js
 * Feedback Hub — Shared Render Helpers
 * Wiederverwendbare HTML-Generatoren fuer alle Seiten
 */

var Render = (function () {

  /* ═══════════════════════════════════════════════════════
     Stars
     ═══════════════════════════════════════════════════════ */

  function stars(count, max) {
    max = max || 5;
    var filled = Math.round(count);
    var empty = max - filled;
    var html = '';
    for (var i = 0; i < filled; i++) html += '★';
    if (empty > 0) html += '<span class="empty">';
    for (var j = 0; j < empty; j++) html += '★';
    if (empty > 0) html += '</span>';
    return html;
  }

  function starsDisplay(count) {
    return '<span class="star-display">' + stars(count) + '</span>';
  }

  /* ═══════════════════════════════════════════════════════
     Avatar
     ═══════════════════════════════════════════════════════ */

  function avatar(initials, opts) {
    opts = opts || {};
    var cls = opts.className || 'avatar';
    var style = opts.style || '';
    var size = opts.size || '';
    var sizeStyle = '';
    if (size) sizeStyle = 'width:' + size + 'px;height:' + size + 'px;font-size:' + Math.round(size * 0.32) + 'px;border-radius:' + Math.round(size * 0.23) + 'px;';

    if (opts.anonymous) {
      return '<div class="avatar anon-avatar">' +
        '<img class="anon-avatar-icon" alt="Icon" src="img/incognito.svg"/>' +
        '</div>';
    }

    if (opts.anonIcon) {
      return '<div class="avatar" style="' + sizeStyle + style + '">' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>' +
        '</svg></div>';
    }

    return '<div class="' + cls + '" style="' + sizeStyle + style + '">' + (initials || '') + '</div>';
  }

  /* ═══════════════════════════════════════════════════════
     Navbar
     ═══════════════════════════════════════════════════════ */

  function navbar(activePage) {
    var user = FeedbackAPI.getCurrentUser();

    var links = [
      { href: 'index.html',      label: I18n.t('nav.inbox'),      key: 'inbox' },
      { href: 'feedback.html',   label: I18n.t('nav.feedback'),   key: 'feedback' },
      { href: 'history.html',    label: I18n.t('nav.history'),    key: 'history' },
      { href: 'department.html', label: I18n.t('nav.department'), key: 'department' },
      { href: 'admin.html',      label: I18n.t('nav.admin'),      key: 'admin' }
    ];

    var filteredLinks = links.filter(function (l) {
      if (l.key === 'department') return user && (user.role === 'manager' || user.role === 'admin');
      if (l.key === 'admin')      return user && user.role === 'admin';
      return true;
    });

    var linksHtml = filteredLinks.map(function (l) {
      var activeClass = l.key === activePage ? ' active' : '';
      var href = l.key === activePage ? '' : l.href;
      return '<a href="' + href + '" class="nav-link' + activeClass + '">' + l.label + '</a>';
    }).join('\n        ');

    // Aktive Sprache für Switcher-Buttons
    var langDe = I18n.getLang() === 'de' ? ' lang-btn-active' : '';
    var langEn = I18n.getLang() === 'en' ? ' lang-btn-active' : '';

    return '<nav class="site-nav">\n' +
      '  <div class="site-nav-inner">\n' +
      '    <img src="img/777ch_Logo.svg" alt="Logo" class="nav-logo">\n' +
      '    <div class="nav-content">\n' +
      '      <div class="nav-links">\n        ' + linksHtml + '\n      </div>\n' +
      '      <div class="nav-icons">\n' +
      '        <div class="avatar anon-avatar">\n' +
      '          <div class="nav-profile-wrapper" id="profileWrapper">\n' +
      '            <button class="nav-profile-btn" id="profileBtn" aria-expanded="false">\n' +
      '              <span class="nav-avatar">' + user.initials + '</span>\n' +
      '            </button>\n' +
      '            <div class="profile-dropdown" id="profileDropdown">\n' +

      // ── Header mit Name / E-Mail ──────────────────────
      '              <div class="profile-dropdown-header">\n' +
      '                <span class="profile-dropdown-name">' + user.name + '</span>\n' +
      '                <span class="profile-dropdown-email">' + user.email + '</span>\n' +
      '              </div>\n' +
      '              <div class="profile-dropdown-divider"></div>\n' +

      // ── Sprachumschalter ──────────────────────────────
      '              <div class="profile-dropdown-lang">\n' +
      '                <span class="profile-dropdown-lang-label">' + I18n.t('profile.language') + '</span>\n' +
      '                <div class="lang-switcher">\n' +
      '                  <button class="lang-btn' + langDe + '" data-lang-btn="de" onclick="I18n.setLang(\'de\')" type="button">DE</button>\n' +
      '                  <button class="lang-btn' + langEn + '" data-lang-btn="en" onclick="I18n.setLang(\'en\')" type="button">EN</button>\n' +
      '                </div>\n' +
      '              </div>\n' +
      '              <div class="profile-dropdown-divider"></div>\n' +

      // ── Abmelden / Sign out ───────────────────────────
      '              <button class="profile-dropdown-logout" id="logoutBtn">\n' +
      '                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">\n' +
      '                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>\n' +
      '                  <polyline points="16 17 21 12 16 7"/>\n' +
      '                  <line x1="21" y1="12" x2="9" y2="12"/>\n' +
      '                </svg>\n' +
      '                ' + I18n.t('profile.logout') + '\n' +
      '              </button>\n' +

      '            </div>\n' +  // /profile-dropdown
      '          </div>\n' +    // /nav-profile-wrapper
      '        </div>\n' +      // /avatar
      '      </div>\n' +        // /nav-icons
      '    </div>\n' +          // /nav-content
      '  </div>\n' +            // /site-nav-inner
      '</nav>';
  }

  /* ═══════════════════════════════════════════════════════
     Toast
     ═══════════════════════════════════════════════════════ */

  function showToast(msg) {
    var toast = document.getElementById('toast');
    if (!toast) return;
    if (msg) toast.textContent = '\u2713 ' + msg;
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
     Profile Dropdown Init
     ═══════════════════════════════════════════════════════ */

  function initProfileDropdown() {
    var profileBtn = document.getElementById('profileBtn');
    var profileDropdown = document.getElementById('profileDropdown');
    var logoutBtn = document.getElementById('logoutBtn');

    if (profileBtn && profileDropdown) {
      profileBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        var isOpen = profileDropdown.classList.toggle('is-open');
        profileBtn.setAttribute('aria-expanded', isOpen);
      });

      document.addEventListener('click', function () {
        profileDropdown.classList.remove('is-open');
        profileBtn.setAttribute('aria-expanded', 'false');
      });

      profileDropdown.addEventListener('click', function (e) { e.stopPropagation(); });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', function () {
        window.location.href = 'index.html';
      });
    }
  }

  /* ═══════════════════════════════════════════════════════
     Edit Icon SVG
     ═══════════════════════════════════════════════════════ */

  function editIconSvg(size) {
    size = size || 14;
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>' +
      '<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
  }

  return {
    stars:               stars,
    starsDisplay:        starsDisplay,
    avatar:              avatar,
    navbar:              navbar,
    showToast:           showToast,
    initProfileDropdown: initProfileDropdown,
    editIconSvg:         editIconSvg
  };

  /* ═══════════════════════════════════════════════════════
   Drivers / Ratings helper
   ═══════════════════════════════════════════════════════ */

  /**
   * Gibt das übersetzte Label für einen Driver-Key zurück.
   * @param {string} key  – z.B. 'impact'
   */
  function driverLabel(key) {
    return I18n.t('driver.' + key);
  }

  /**
   * Gibt die 5 Tooltip-Texte für einen Driver zurück.
   * @param {string} key  – z.B. 'impact'
   * @returns {string[]}
   */
  function driverTooltips(key) {
    return [
      I18n.t('driver.' + key + '.1'),
      I18n.t('driver.' + key + '.2'),
      I18n.t('driver.' + key + '.3'),
      I18n.t('driver.' + key + '.4'),
      I18n.t('driver.' + key + '.5')
    ];
  }

})();
