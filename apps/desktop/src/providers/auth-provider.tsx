import { useEffect } from "react";

import { useAuthStore } from "@/store/github-client";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const init = useAuthStore((state) => state.init);
  const setLastOpenedRepo = useAuthStore((state) => state.setLastOpenedRepo);

  useEffect(() => {
    const bootstrap = async () => {
      await init();
      await setLastOpenedRepo();
    };

    void bootstrap();
  }, [init, setLastOpenedRepo]);

  return <>{children}</>;
}
