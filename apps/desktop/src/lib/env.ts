import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  clientPrefix: "VITE_",
  client: {
    VITE_GITHUB_CLIENT_ID: z.string().min(1),
    VITE_SERVER_URL: z.url(),
  },
  server: {},

  runtimeEnv: import.meta.env,
});
