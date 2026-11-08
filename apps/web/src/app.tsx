import { RouterProvider } from "react-router/dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import router from "@/router";
import { RiskMapProvider } from "@providers/risk-map-provider";
import { AuthProvider } from "@providers/auth-provider";

// at the root so pages can call query hooks before they render their layout
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RiskMapProvider>
          <RouterProvider router={router} />
        </RiskMapProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
