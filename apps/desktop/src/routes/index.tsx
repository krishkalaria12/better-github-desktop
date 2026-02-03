import { ProtectedRoute } from "@/components/protected-route";
import { Dashboard } from "@/modules/home/components/dashboard";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: () => (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  ),
});
