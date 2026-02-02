import { useEffect } from "react";

import { useAuthStore } from "@/store/github-client";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const init = useAuthStore((state) => state.init);

  useEffect(() => {
    void init();
  }, [init]);

  return <>{children}</>;
}
