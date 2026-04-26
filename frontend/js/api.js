/**
 * api.js
 * Feedback Hub — Abstraktionsschicht
 * Später: fetch() gegen echte API-Endpoints ersetzen
 */

var FeedbackAPI = (function () {

  async function apiFetch(path, options = {}) {
    const token = await window.getApiToken();
    return fetch(`http://localhost:5185${path}`, {
      ...options,
      headers: {
        ...(options.headers || {}),
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
  }

  function getCurrentUser() {
    if (!_currentUserCache) {
      console.error('FeedbackAPI.bootstrap() muss vor getCurrentUser() aufgerufen werden');
      return null;
    }
    return _currentUserCache;
  }

  function getRecipients() {
    return MockData.recipients;
  }

  function getUsers() {
    return MockData.users;
  }

  /* ─── Inbox ─── */

  function getInboxAverages() {
    return MockData.inboxAverages;
  }

  function getInboxFeedbacks() {
    return MockData.inboxFeedbacks;
  }

  /* ─── History ─── */

  function getHistoryFeedbacks() {
    return MockData.historyFeedbacks;
  }

  /* ─── Feedback Form ─── */

  function getDriverDefinitions() {
    return MockData.driverDefinitions;
  }

  /* ─── Admin ─── */

  function getAdminStats() {
    return MockData.adminStats;
  }

  function getAdminKpis() {
    return MockData.adminKpis;
  }

  function getAdminChartActivity() {
    return MockData.adminChartActivity;
  }

  function getAdminChartVisibility() {
    return MockData.adminChartVisibility;
  }

  function getAdminDriverAverages() {
    return MockData.adminDriverAverages;
  }

  function getAdminDepartments() {
    return MockData.adminDepartments;
  }

  function getAdminSystemStatus() {
    return MockData.adminSystemStatus;
  }

  function getModerationStats() {
    return MockData.moderationStats;
  }

  function getModerationReports() {
    return MockData.moderationReports;
  }

  function getDepartmentTeam() {
    return MockData.departmentTeam;
  }

  /* ─── Current User Cache ─── */

  var _currentUserCache = null;

  async function bootstrap() {
    // Schon geladen? Dann Cache zurückgeben (mehrfacher Aufruf unschädlich)
    if (_currentUserCache) return _currentUserCache;

    var dto = await apiGet('/api/me');

    // Backend liefert PascalCase → auf Frontend-Format mappen
    // Frontend erwartet: { id, name, initials, email, role, department }
    _currentUserCache = {
      id:                  dto.id,
      name:                dto.displayName,
      initials:            buildInitials(dto.displayName),
      email:               dto.email,
      role:                dto.role,
      isDepartmentManager: dto.isDepartmentManager,
      department:          dto.department ? dto.department.name : null,
      departmentId:        dto.department ? dto.department.id   : null
    };

    return _currentUserCache;
  }

  function buildInitials(displayName) {
    if (!displayName) return '';
    var parts = displayName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  return {
    bootstrap:               bootstrap,
    getCurrentUser:          getCurrentUser,
    getRecipients:           getRecipients,
    getUsers:                getUsers,
    getInboxAverages:        getInboxAverages,
    getInboxFeedbacks:       getInboxFeedbacks,
    getHistoryFeedbacks:     getHistoryFeedbacks,
    getDriverDefinitions:    getDriverDefinitions,
    getAdminStats:           getAdminStats,
    getAdminKpis:            getAdminKpis,
    getAdminChartActivity:   getAdminChartActivity,
    getAdminChartVisibility: getAdminChartVisibility,
    getAdminDriverAverages:  getAdminDriverAverages,
    getAdminDepartments:     getAdminDepartments,
    getAdminSystemStatus:    getAdminSystemStatus,
    getModerationStats:      getModerationStats,
    getModerationReports:    getModerationReports,
    getDepartmentTeam:       getDepartmentTeam
  };

})();
