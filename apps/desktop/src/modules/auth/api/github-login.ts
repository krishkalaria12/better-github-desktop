import { api } from "@/lib/axios";
import { env } from "@/lib/env";
import { sleep } from "@/utils/sleep";

export interface DeviceCodeResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number;
}

export interface AccessTokenSuccess {
  access_token: string;
  token_type: string;
  scope: string;
}

export interface AccessTokenError {
  error: 'authorization_pending' | 'slow_down' | 'expired_token' | 'access_denied' | string;
  error_description?: string;
  error_uri?: string;
}

type PollTokenResponse = AccessTokenSuccess | AccessTokenError;

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

export async function pollDeviceToken(deviceCode: string, intervalSecond = 5): Promise<string> {
  let interval = intervalSecond * 1000;

  while (true) {
    await sleep(interval);

    const response = await api.post<PollTokenResponse>("https://github.com/login/oauth/access_token", {
      client_id: env.VITE_GITHUB_CLIENT_ID,
      device_code: deviceCode,
      grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
    });

    const data = response.data;

    if (!data) {
      throw new Error('Failed to get device token response');
    }

    if ('access_token' in data) {
      console.log("Success! Token received.");
      return data.access_token;
    }

    switch (data.error) {
      case 'authorization_pending':
        continue;

      case 'slow_down':
        interval += 5000;
        continue;

      case 'expired_token':
        throw new Error('Device code expired. Please try logging in again.');

      default:
        throw new Error(`Login failed: ${data.error_description || data.error}`);
    }
  }
}
