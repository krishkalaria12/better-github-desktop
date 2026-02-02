import { invoke } from "@tauri-apps/api/core";

export async function secureMyToken(accessToken: string) {
  try {
    await invoke("save_token", { token: accessToken });
  } catch {
    throw new Error("Failed to save to keychain");
  }
}

export async function retrieveMyToken() {
  try {
    const token: string = await invoke("get_token");
    return token;
  } catch {
    throw new Error("Failed to retrieve from keychain");
  }
}

export async function deleteMyToken() {
  try {
    await invoke("delete_token");
  } catch {
    throw new Error("Failed to delete from keychain");
  }
}
