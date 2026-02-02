import { invoke } from "@tauri-apps/api/core";

const fallbackTokenKey = "better-github-session-token";

function setFallbackToken(token: string) {
  localStorage.setItem(fallbackTokenKey, token);
}

function getFallbackToken() {
  return localStorage.getItem(fallbackTokenKey);
}

function clearFallbackToken() {
  localStorage.removeItem(fallbackTokenKey);
}

export async function secureMyToken(accessToken: string) {
  try {
    await invoke("save_auth_token", { token_str: accessToken });
    clearFallbackToken();
  } catch {
    setFallbackToken(accessToken);
  }
}

export async function retrieveMyToken(): Promise<string | null> {
  try {
    const token: string = await invoke("get_auth_token");
    return token;
  } catch {
    const token = getFallbackToken();
    return token ?? null;
  }
}

export async function deleteMyToken() {
  try {
    await invoke("delete_auth_token");
  } catch {
    // ignore keychain errors and still clear fallback
  }
  clearFallbackToken();
}
