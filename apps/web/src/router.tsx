import { createBrowserRouter } from "react-router";
import Home from "@pages/home-page";
import RegisterPage from "@pages/auth/register-page";
import LoginPage from "@pages/auth/login-page";
import MapPage from "@pages/2dmap/map-page";
import PlantProtectionAssistant from "@pages/plant-protection-assistant";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/plant-protection-assistant",
    element: <PlantProtectionAssistant />,
  },
  {
    path: "/map",
    element: <MapPage />,
  },
]);

export default router;
