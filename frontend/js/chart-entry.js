/**
 * chart-entry.js
 * Bündelt Chart.js lokal (statt externem CDN) und stellt es global bereit.
 * admin.js nutzt das globale `Chart`. Ein externes CDN (cdn.jsdelivr.net)
 * kann in internen Netzen von Firewall/CSP blockiert werden — dann blieben
 * die Dashboard-Charts leer. Lokal gebündelt entfällt diese Abhängigkeit.
 *
 * "chart.js/auto" registriert alle Controller/Elemente/Scales automatisch.
 */
import Chart from 'chart.js/auto';

window.Chart = Chart;
