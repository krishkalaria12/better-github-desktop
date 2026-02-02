import { env } from "@/lib/env";
import { fetch } from "@tauri-apps/plugin-http";

export interface DeviceCodeResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number;
}

export async function getDeviceCode(): Promise<DeviceCodeResponse> {
  const body = new URLSearchParams({
    client_id: env.VITE_GITHUB_CLIENT_ID,
    scope: "repo read:org user:email",
  }).toString();

  const response = await fetch("https://github.com/login/device/code", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`Failed to get device code (${response.status})`);
  }

  const data = (await response.json()) as DeviceCodeResponse | null;

  if (!data) {
    throw new Error('Failed to get device code');
  }

  return data;
}
