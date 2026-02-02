import { api } from "@/lib/axios";
import { env } from "@/lib/env";

export interface DeviceCodeResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number;
}

export async function getDeviceCode(): Promise<DeviceCodeResponse> {
  const response = await api.post<DeviceCodeResponse>("https://github.com/login/device/code", {
    client_id: env.VITE_GITHUB_CLIENT_ID,
    scope: 'repo read:org user:email'
  });

  if (!response.data) {
    throw new Error('Failed to get device code');
  }

  return response.data;
}
