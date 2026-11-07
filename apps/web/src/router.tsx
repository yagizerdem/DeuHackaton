import { createBrowserRouter } from "react-router";
import Home from "@pages/home-page";
import RegisterPage from "@pages/auth/register-page";
import LoginPage from "@pages/auth/login-page";

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
]);

export default router;
