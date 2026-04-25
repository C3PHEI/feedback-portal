/**
 * auth.js — MSAL Login Gate
 * Muss VOR allen anderen Scripts geladen werden.
 */
import * as msal from "@azure/msal-browser";

const msalConfig = {
  auth: {
    clientId: "d0795c1d-3049-4ed5-b613-48df870a10c6",
    authority: "https://login.microsoftonline.com/79686dd2-7fae-4fd8-83a2-40198e28d933",
    redirectUri: "http://localhost:5000/index.html"
  },
  cache: { cacheLocation: "sessionStorage" }
};

const apiScopes = ["api://d0795c1d-3049-4ed5-b613-48df870a10c6/access_as_user"];

const msalInstance = new msal.PublicClientApplication(msalConfig);

async function ensureLogin() {
  await msalInstance.initialize();

  const result = await msalInstance.handleRedirectPromise();
  if (result) msalInstance.setActiveAccount(result.account);

  const accounts = msalInstance.getAllAccounts();
  if (accounts.length === 0) {
    await msalInstance.loginRedirect({ scopes: apiScopes });
    return;
  }
  msalInstance.setActiveAccount(accounts[0]);
}

async function getApiToken() {
  const account = msalInstance.getActiveAccount();
  try {
    const res = await msalInstance.acquireTokenSilent({ scopes: apiScopes, account });
    return res.accessToken;
  } catch {
    await msalInstance.acquireTokenRedirect({ scopes: apiScopes });
  }
}

// Global verfügbar machen für api.js (kein ES-Modul)
window.getApiToken = getApiToken;

// um JWT zum testen in der Konsole auszulesen
window.__getToken = getApiToken;

ensureLogin();
