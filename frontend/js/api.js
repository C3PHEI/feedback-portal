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

  async function getInboxFeedbacks() {
    var dtos = await apiGet('/api/feedback/inbox');
    return dtos.map(mapInboxFeedback);
  }

  async function getInboxAverages() {
    var dto = await apiGet('/api/feedback/inbox/averages');
    return mapInboxAverages(dto);
  }

  /* ─── Mappers (Backend-DTO → Frontend-Format) ─── */

  function mapInboxFeedback(dto) {
    // Stars: Durchschnitt der nicht-NA-Ratings, gerundet
    var scoredRatings = dto.ratings.filter(function (r) { return !r.isNa && r.score != null; });
    var avgStars = 0;
    if (scoredRatings.length > 0) {
      var sum = scoredRatings.reduce(function (acc, r) { return acc + r.score; }, 0);
      avgStars = Math.round(sum / scoredRatings.length);
    }

    // Preview: erste ~120 Zeichen aus Strengths, sonst AreasToImprove
    var previewSource = dto.strengths || dto.areasToImprove || '';
    var preview = previewSource.length > 120
      ? previewSource.substring(0, 120).trim() + '...'
      : previewSource;

    // From: anonym oder Submitter-Info
    var from;
    if (dto.isAnonymous) {
      from = { name: 'Anonymes Feedback', initials: null, anonymous: true };
    } else {
      from = {
        name:      dto.submitter.displayName,
        initials:  buildInitials(dto.submitter.displayName),
        anonymous: false
      };
    }

    return {
      id:           dto.id,
      from:         from,
      stars:        avgStars,
      preview:      preview,
      date:         formatDate(dto.submittedDate),
      unread:       false,                  // Notifications-Feature ist Post-IPA
      drivers:      dto.ratings.map(mapRating),
      strengths:    dto.strengths || '',
      improvements: dto.areasToImprove || ''
    };
  }

  function mapRating(r) {
    return {
      name:   r.driverName,    // "impact" | "ownership" | "collaboration" | "growth"
      rating: r.isNa ? null : r.score,
      na:     r.isNa
    };
  }

  function mapInboxAverages(dto) {
    return {
      totalReviews:   dto.totalReviews,
      anonymousCount: dto.anonymousCount,
      drivers: dto.driverAverages.map(function (d) {
        return {
          name:  d.driverName,
          value: d.average != null ? d.average : 0,
          stars: d.average != null ? Math.round(d.average) : 0
        };
      })
    };
  }

  /* ─── Date Formatter ─── */

  function formatDate(isoDate) {
    // isoDate kommt als "2026-04-22" (DateOnly) oder "2026-04-22T..." (DateTime)
    if (!isoDate) return '';

    var d = new Date(isoDate);
    if (isNaN(d.getTime())) return isoDate;

    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var feedbackDay = new Date(d);
    feedbackDay.setHours(0, 0, 0, 0);

    var diffDays = Math.round((today - feedbackDay) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'heute';
    if (diffDays === 1) return 'gestern';

    if (diffDays < 7) {
      var weekdays = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
      var dd = ('0' + d.getDate()).slice(-2);
      var mm = ('0' + (d.getMonth() + 1)).slice(-2);
      return weekdays[d.getDay()] + ', ' + dd + '.' + mm + '.';
    }

    // Älter als 7 Tage: volles Datum
    var dd = ('0' + d.getDate()).slice(-2);
    var mm = ('0' + (d.getMonth() + 1)).slice(-2);
    var yy = d.getFullYear();
    return dd + '.' + mm + '.' + yy;
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
