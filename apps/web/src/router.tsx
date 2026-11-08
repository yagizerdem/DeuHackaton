import { createBrowserRouter } from "react-router";
import Home from "@pages/home-page";
import RegisterPage from "@pages/auth/register-page";
import LoginPage from "@pages/auth/login-page";
import MapPage from "@pages/2dmap/map-page";
import FarmLayout from "@/layouts/farm-layout";
import PlantsPage from "@pages/farm/plants-page";
import ParcelsPage from "@pages/farm/parcels-page";
import RecordsPage from "@pages/farm/records-page";
import TasksPage from "@pages/farm/tasks-page";
import PlantsOverviewPage from "@pages/farm/plants-overview-page";
import TaskBoardPage from "@pages/farm/task-board-page";
import InvasiveSpeciesPage from "@pages/invasive-species/invasive-species-page";
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
    path: "/2dmap",
    element: <MapPage />,
  },
  {
    element: <FarmLayout />,
    children: [
      { path: "/plants", element: <PlantsPage /> },
      { path: "/parcels", element: <ParcelsPage /> },
      { path: "/records", element: <RecordsPage /> },
      { path: "/tasks", element: <TasksPage /> },
  { path: "/plants/overview", element: <PlantsOverviewPage /> },
  { path: "/tasks/board", element: <TaskBoardPage /> },
    ],
  },
  { path: "/invasive-species", element: <InvasiveSpeciesPage /> },
]);

export default router;
