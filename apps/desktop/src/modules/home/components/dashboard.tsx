import { ProtectedRoute } from "@/components/protected-route";

export function Dashboard() {
  return (
    <ProtectedRoute>
      <div className="flex h-full items-center justify-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>
    </ProtectedRoute>
  );
}
