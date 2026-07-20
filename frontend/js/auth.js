/**
 * auth.js — MSAL Login Gate
 * Muss VOR allen anderen Scripts geladen werden.
 */
import * as msal from "@azure/msal-browser";

const msalConfig = {
  auth: {
    clientId: "d0795c1d-3049-4ed5-b613-48df870a10c6",
    authority: "https://login.microsoftonline.com/79686dd2-7fae-4fd8-83a2-40198e28d933",
    redirectUri: "https://feedbackhub.cd.ch/index.html"
  },
  cache: { cacheLocation: "sessionStorage" }
};

const apiScopes = ["api://d0795c1d-3049-4ed5-b613-48df870a10c6/access_as_user"];

const msalInstance = new msal.PublicClientApplication(msalConfig);

async function ensureLogin() {
  await msalInstance.initialize();

  const result = await msalInstance.handleRedirectPromise();
  if (result) {
    msalInstance.setActiveAccount(result.account);
    // Auth-Response-Fragment (#code=…&state=…&session_state=…) aus der
    // Adressleiste entfernen, damit keine langen Redirect-URLs sichtbar bleiben.
    if (window.history && window.history.replaceState) {
      window.history.replaceState({}, document.title,
        window.location.pathname + window.location.search);
    }
  }

  const accounts = msalInstance.getAllAccounts();
  if (accounts.length === 0) {
    await msalInstance.loginRedirect({ scopes: apiScopes });
    return;
  }
  msalInstance.setActiveAccount(accounts[0]);
}

// ensureLogin() einmal starten und das Promise festhalten,
// damit getApiToken() darauf warten kann (verhindert Race Condition).
const loginReady = ensureLogin();

async function getApiToken() {
  // Erst warten, bis MSAL initialisiert und der Account gesetzt ist.
  await loginReady;

  const account = msalInstance.getActiveAccount();
  if (!account) {
    // Kein Account vorhanden -> Login-Redirect anstossen.
    await msalInstance.loginRedirect({ scopes: apiScopes });
    return;
  }

  try {
    const res = await msalInstance.acquireTokenSilent({ scopes: apiScopes, account });
    return res.accessToken;
  } catch {
    await msalInstance.acquireTokenRedirect({ scopes: apiScopes });
  }
}

// Echtes Logout: MSAL-Session (sessionStorage) leeren und über den
// Microsoft-Logout-Endpoint abmelden. Ein blosser Redirect auf index.html
// hätte den Account im Cache belassen → User blieb angemeldet.
async function logout() {
  try { await loginReady; } catch (_) { /* Login evtl. nie abgeschlossen */ }

  const account = msalInstance.getActiveAccount()
                  || msalInstance.getAllAccounts()[0]
                  || null;

  await msalInstance.logoutRedirect({
    account,
    postLogoutRedirectUri: msalConfig.auth.redirectUri
  });
}

// Global verfügbar machen für api.js (kein ES-Modul)
window.getApiToken = getApiToken;
window.msalLogout = logout;

// um JWT zum testen in der Konsole auszulesen
window.__getToken = getApiToken;
