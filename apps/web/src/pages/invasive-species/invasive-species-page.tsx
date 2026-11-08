import AppLayout from "@/layouts/app-layout";
import RequireAuth from "@components/auth/require-auth";
import InvasiveSpeciesExplorer from "@components/invasive-species/invasive-species-explorer";

export default function InvasiveSpeciesPage() {
  return (
    <AppLayout>
      <main className="mx-auto w-full max-w-[1600px] px-4 py-4 sm:px-6">
        <RequireAuth>
          <InvasiveSpeciesExplorer />
        </RequireAuth>
      </main>
    </AppLayout>
  );
}
