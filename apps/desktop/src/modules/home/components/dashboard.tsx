import { useAuthStore } from "@/store/github-client";
import { useNavigate } from "@tanstack/react-router";

export function Dashboard() {
  const navigate = useNavigate();
  const { token } = useAuthStore();

  if (!token) {
    navigate("/login");
  }

  return (
    <div>
      <h1>Dashboard</h1>
    </div>
  );
}
