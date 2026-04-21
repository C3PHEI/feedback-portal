/**
 * auth.js — MSAL Login Gate
 * Muss VOR allen anderen Scripts geladen werden.
 */
const msalConfig = {
  auth: {
    clientId: "d0795c1d-3049-4ed5-b613-48df870a10c6",
    authority: "https://login.microsoftonline.com/79686dd2-7fae-4fd8-83a2-40198e28d933",
    redirectUri: "http://localhost:5500/index.html"
  },
  cache: { cacheLocation: "sessionStorage" }
};

const apiScopes = ["api://d0795c1d-3049-4ed5-b613-48df870a10c6"];

const msalInstance = new msal.PublicClientApplication(msalConfig);

async function ensureLogin() {
  await msalInstance.initialize();

  // Redirect-Rückkehr abfangen
  const result = await msalInstance.handleRedirectPromise();
  if (result) msalInstance.setActiveAccount(result.account);

  const accounts = msalInstance.getAllAccounts();
  if (accounts.length === 0) {
    // Kein Account → sofort zu Microsoft
    await msalInstance.loginRedirect({ scopes: apiScopes });
    return; // Seite wird weggeleitet
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

// Login-Gate gleich starten
ensureLogin();
