import { env } from "@/lib/env";
import { useMutation, useQuery } from "@tanstack/react-query";
import { fetch } from "@tauri-apps/plugin-http";
import { getDeviceCode } from "../api/github-login";

interface TokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
  error?: string;
}

export function useDeviceCode() {
  return useMutation({
    mutationFn: async () => {
      const response = await getDeviceCode();
      return response;
    },
  });
}

export function usePollToken(deviceCode: string | undefined, interval: number = 5) {
  return useQuery({
    queryKey: ["github-token-poll", deviceCode],
    queryFn: async () => {
      if (!deviceCode) throw new Error("No device code");

      const body = new URLSearchParams({
        client_id: env.VITE_GITHUB_CLIENT_ID,
        device_code: deviceCode,
        grant_type: "urn:ietf:params:oauth:grant-type:device_code",
      }).toString();

      const response = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      });

      if (!response.ok && response.status !== 400) {
        throw new Error(`Failed to poll token (${response.status})`);
      }

      return (await response.json()) as TokenResponse;
    },
    enabled: !!deviceCode,
    refetchInterval: (query) => {
      if (query.state.data?.access_token) return false;
      if (query.state.error) return false;
      return interval * 1000;
    },
  });
}
