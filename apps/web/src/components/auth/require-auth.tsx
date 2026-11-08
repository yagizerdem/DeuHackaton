import { Navigate } from "react-router";
import { Skeleton } from "@components/ui/skeleton";
import { useAuth } from "@providers/auth-provider";

// Sends visitors who are not logged in to the login page. It reads the auth
// state, so it has to be rendered inside AppLayout (which provides it).
export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <Skeleton className="m-4 h-96" />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
