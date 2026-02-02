import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";

import Loader from "@/components/loader";
import { useAuthStore } from "@/store/github-client";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { token, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !token) {
      navigate({ to: "/login" });
    }
  }, [isLoading, token, navigate]);

  if (isLoading) {
    return <Loader />;
  }

  if (!token) {
    return null;
  }

  return <>{children}</>;
}
