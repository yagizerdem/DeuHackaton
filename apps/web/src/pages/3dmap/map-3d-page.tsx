import AppLayout from "@/layouts/app-layout";
import RequireAuth from "@components/auth/require-auth";
import Map3DExplorer from "@components/map3d/map3d-explorer";

export default function Map3DPage() {
  return (
    <AppLayout>
      <main className="mx-auto w-full max-w-[1600px] px-4 py-4 sm:px-6">
        <RequireAuth>
          <Map3DExplorer />
        </RequireAuth>
      </main>
    </AppLayout>
  );
}
