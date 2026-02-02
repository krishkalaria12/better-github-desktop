import { z } from "zod";

export const desktopEnvSchema = {
  clientPrefix: "VITE_",

  client: {
    GITHUB_CLIENT_ID: z.string().min(1),
  },

  server: {
    SERVER_URL: z.url(),
  },
};
