import { ChooseGitClient } from "@/modules/git-client/components/choose-git-client";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/choosegitclient")({
  component: ChooseGitClient,
});
