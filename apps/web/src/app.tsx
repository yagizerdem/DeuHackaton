import { RouterProvider } from "react-router/dom";
import router from "@/router";
import { RiskMapProvider } from "@providers/risk-map-provider";
import { AuthProvider } from "@providers/auth-provider";

function App() {
  return (
    <AuthProvider>
      <RiskMapProvider>
        <RouterProvider router={router} />
      </RiskMapProvider>
    </AuthProvider>
  );
}

export default App;
