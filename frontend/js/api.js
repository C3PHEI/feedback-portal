/**
 * api.js
 * Feedback Hub — Abstraktionsschicht zwischen Frontend und Backend.
 * Backend-DTOs werden hier auf das vom Frontend erwartete Format gemappt.
 */

var FeedbackAPI = (function () {

  var BASE_URL = 'http://localhost:5185';

  /* ═══════════════════════════════════════════════════════
     API Error Class
     ═══════════════════════════════════════════════════════ */

  function ApiError(status, errorCode, message) {
    this.name      = 'ApiError';
    this.status    = status;       // 0 = Netzwerk, 401, 403, 404, 422, 500 ...
    this.errorCode = errorCode;    // Backend-Code z.B. "coc_not_confirmed"
    this.message   = message || errorCode || 'API request failed';
  }
  ApiError.prototype = Object.create(Error.prototype);

  /* ═══════════════════════════════════════════════════════
     Core Fetch Wrapper
     ═══════════════════════════════════════════════════════ */

  async function apiFetch(path, options) {
    options = options || {};

    // Token holen
    var token;
    try {
      token = await window.getApiToken();
    } catch (e) {
      throw new ApiError(0, 'token_unavailable', 'Login erforderlich');
    }

    var headers = Object.assign({
      'Authorization': 'Bearer ' + token,
      'Content-Type':  'application/json'
    }, options.headers || {});

    var response;
    try {
      response = await fetch(BASE_URL + path, {
        method:  options.method || 'GET',
        headers: headers,
        body:    options.body ? JSON.stringify(options.body) : undefined
      });
    } catch (e) {
      throw new ApiError(0, 'network_error', 'Verbindung zum Server fehlgeschlagen');
    }

    // 401 → Token abgelaufen → MSAL Re-Login
    if (response.status === 401) {
      await window.getApiToken();
      throw new ApiError(401, 'unauthorized', 'Session abgelaufen');
    }

    // 204 No Content → kein Body
    if (response.status === 204) {
      return null;
    }

    // Body parsen
    var data = null;
    var text = await response.text();
    if (text) {
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = { error: 'invalid_response' };
      }
    }

    if (!response.ok) {
      var errorCode = (data && data.error) || ('http_' + response.status);
      throw new ApiError(response.status, errorCode, errorCode);
    }

    return data;
  }

  function apiGet(path)         { return apiFetch(path); }
  function apiPost(path, body)  { return apiFetch(path, { method: 'POST',  body: body }); }
  function apiPatch(path, body) { return apiFetch(path, { method: 'PATCH', body: body }); }
  function apiPut(path, body)   { return apiFetch(path, { method: 'PUT',   body: body }); }

  /* ═══════════════════════════════════════════════════════
     Helpers
     ═══════════════════════════════════════════════════════ */

  function buildInitials(displayName) {
    if (!displayName) return '';
    var parts = displayName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  // Inbox-Format: "heute" / "gestern" / "Mo, 22.04." / "22.04.2026"
  function formatDate(isoDate) {
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

    var dd2 = ('0' + d.getDate()).slice(-2);
    var mm2 = ('0' + (d.getMonth() + 1)).slice(-2);
    var yy  = d.getFullYear();
    return dd2 + '.' + mm2 + '.' + yy;
  }

  // History-Format: "Heute, 14:33" / "Gestern, 09:12" / "22.04.2026, 14:33"
  function formatDateLabel(isoTimestamp) {
    if (!isoTimestamp) return '';

    var d = new Date(isoTimestamp);
    if (isNaN(d.getTime())) return '';

    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var feedbackDay = new Date(d);
    feedbackDay.setHours(0, 0, 0, 0);

    var diffDays = Math.round((today - feedbackDay) / (1000 * 60 * 60 * 24));

    var hh   = ('0' + d.getHours()).slice(-2);
    var min  = ('0' + d.getMinutes()).slice(-2);
    var time = hh + ':' + min;

    if (diffDays === 0) return 'Heute, ' + time;
    if (diffDays === 1) return 'Gestern, ' + time;

    var dd = ('0' + d.getDate()).slice(-2);
    var mo = ('0' + (d.getMonth() + 1)).slice(-2);
    var yy = d.getFullYear();
    return dd + '.' + mo + '.' + yy + ', ' + time;
  }

  /* ═══════════════════════════════════════════════════════
     Bootstrap (Current User)
     ═══════════════════════════════════════════════════════ */

  var _currentUserCache = null;

  async function bootstrap() {
    if (_currentUserCache) return _currentUserCache;

    var dto = await apiGet('/api/me');

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

  function getCurrentUser() {
    if (!_currentUserCache) {
      console.error('FeedbackAPI.bootstrap() muss vor getCurrentUser() aufgerufen werden');
      return null;
    }
    return _currentUserCache;
  }

  /* ═══════════════════════════════════════════════════════
     Inbox (Schritt 5)
     ═══════════════════════════════════════════════════════ */

  async function getInboxFeedbacks() {
    var dtos = await apiGet('/api/feedback/inbox');
    return dtos.map(mapInboxFeedback);
  }

  async function getInboxAverages() {
    var dto = await apiGet('/api/feedback/inbox/averages');
    return mapInboxAverages(dto);
  }

  function mapInboxFeedback(dto) {
    var scoredRatings = dto.ratings.filter(function (r) { return !r.isNa && r.score != null; });
    var avgStars = 0;
    if (scoredRatings.length > 0) {
      var sum = scoredRatings.reduce(function (acc, r) { return acc + r.score; }, 0);
      avgStars = Math.round(sum / scoredRatings.length);
    }

    var previewSource = dto.strengths || dto.areasToImprove || '';
    var preview = previewSource.length > 120
      ? previewSource.substring(0, 120).trim() + '...'
      : previewSource;

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
      unread:       false,
      drivers:      dto.ratings.map(mapRating),
      strengths:    dto.strengths || '',
      improvements: dto.areasToImprove || ''
    };
  }

  function mapRating(r) {
    return {
      name:   r.driverName,
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

  /* ═══════════════════════════════════════════════════════
     History (Schritt 6)
     ═══════════════════════════════════════════════════════ */

  async function getHistoryFeedbacks() {
    var dtos = await apiGet('/api/feedback/history');
    return dtos.map(mapHistoryFeedback);
  }

  function mapHistoryFeedback(dto) {
    return {
      id:           dto.id,
      to: {
        name:     dto.recipientName,
        initials: buildInitials(dto.recipientName)
      },
      submittedAt:  dto.submittedAt,                       // ISO-String für Live-Timer
      dateLabel:    formatDateLabel(dto.submittedAt),
      visibility:   dto.isAnonymous ? 'anonymous' : 'named',
      edited:       dto.isEdited,
      locked:       dto.isLocked,
      avatarStyle:  null,
      drivers:      dto.ratings.map(mapRating),
      strengths:    dto.strengths || '',
      improvements: dto.areasToImprove || ''
    };
  }

  /* ═══════════════════════════════════════════════════════
     Mock-Funktionen (noch nicht angebunden)
     Werden in den nächsten Schritten umgestellt.
     ═══════════════════════════════════════════════════════ */

  function getRecipients()           { return MockData.recipients; }
  function getUsers()                { return MockData.users; }
  function getDriverDefinitions()    { return MockData.driverDefinitions; }
  function getAdminStats()           { return MockData.adminStats; }
  function getAdminKpis()            { return MockData.adminKpis; }
  function getAdminChartActivity()   { return MockData.adminChartActivity; }
  function getAdminChartVisibility() { return MockData.adminChartVisibility; }
  function getAdminDriverAverages()  { return MockData.adminDriverAverages; }
  function getAdminDepartments()     { return MockData.adminDepartments; }
  function getAdminSystemStatus()    { return MockData.adminSystemStatus; }
  function getModerationStats()      { return MockData.moderationStats; }
  function getModerationReports()    { return MockData.moderationReports; }
  function getDepartmentTeam()       { return MockData.departmentTeam; }

  /* ═══════════════════════════════════════════════════════
     Debug-Helper (Post-IPA entfernen)
     ═══════════════════════════════════════════════════════ */

  window.__api = {
    fetch:    apiFetch,
    get:      apiGet,
    post:     apiPost,
    patch:    apiPatch,
    put:      apiPut,
    ApiError: ApiError
  };

  /* ═══════════════════════════════════════════════════════
     Public API
     ═══════════════════════════════════════════════════════ */

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
