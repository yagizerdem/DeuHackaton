import { Navigate, NavLink, Outlet } from "react-router";
import AppLayout from "@/layouts/app-layout";
import { Skeleton } from "@components/ui/skeleton";
import { useAuth } from "@providers/auth-provider";
import { cn } from "@/lib/utils";

const TABS = [
  { to: "/plants", label: "Plants" },
  { to: "/parcels", label: "Parcels" },
  { to: "/records", label: "Analysis records" },
  { to: "/tasks", label: "Tasks" },
];

// AuthProvider lives inside AppLayout, so the login check has to be a child of it
function Gate({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <Skeleton className="mt-2 h-64 w-full" />;
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// Parent route of the garden pages. The header, the login check and the tab bar
// stay mounted while the tabs change, only the page in the Outlet is swapped.
export default function FarmLayout() {
  return (
    <AppLayout>
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
        <nav className="mb-6 flex gap-1 overflow-x-auto border-b border-border/40">
          {TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                cn(
                  "-mb-px whitespace-nowrap border-b-2 px-4 py-2 font-stitch-body text-stitch-body-md font-medium transition-colors",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-primary",
                )
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>
        <Gate>
          <Outlet />
        </Gate>
      </main>
    </AppLayout>
  );
}
