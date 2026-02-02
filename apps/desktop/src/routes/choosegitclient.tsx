import { ChooseGitClient } from "@/modules/git-client/components/choose-git-client";
import { ProtectedRoute } from "@/components/protected-route";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/choosegitclient")({
  component: () => (
    <ProtectedRoute>
      <ChooseGitClient />
    </ProtectedRoute>
  ),
});
