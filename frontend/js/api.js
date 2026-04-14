/**
 * api.js
 * Feedback Hub — Abstraktionsschicht
 * Später: fetch() gegen echte API-Endpoints ersetzen
 */

var FeedbackAPI = (function () {

  function getCurrentUser() {
    return MockData.currentUser;
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

  return {
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
