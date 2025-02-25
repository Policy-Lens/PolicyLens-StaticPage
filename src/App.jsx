import "./App.css";
import Home from "./Components/AdminView/Projects";
import { createBrowserRouter,RouterProvider } from "react-router-dom";
import CarouselHorizontalStepper from "./Components/WorkFlow/VertStepper"
import AdminDashboard from "./Components/AdminView/AdminDashboard"
import ProjectTeam from "./Components/AdminView/ProjectTeam"
import AdminPreview from "./Components/AdminView/AdminPreview"
import AdminDocument from "./Components/AdminView/AdminDocument"
import AuditorsPage from "./Components/HomeNav/Auditors";
import CompaniesPage from "./Components/HomeNav/Company";
import DashboardPage from "./Components/HomeNav/Dashboard";
import DocumentsPage from "./Components/HomeNav/Documents";
import SettingsPage from "./Components/HomeNav/Settings";
import MessagingPage from "./Components/HomeNav/Messaging";
import Projects from "./Components/AdminView/Projects";
import AuditorWorkspace from "./Components/WorkFlow/AuditorsWorkspace"
import { LogIn } from "lucide-react";
import LoginPage from "./Components/login";
import { AuthProvider } from "./AuthContext";

const router = createBrowserRouter( [
  {
    path:"/",
    element:<LoginPage/>,
  },
  {
    path: "/Dashboard",
    element: <DashboardPage />
  },
  {
    path: "/register",
    element: <LoginPage />
  },
  {
    path: "/auditors",
    element: <AuditorsPage />,
  },
  {
    path: "/company",
    element: <CompaniesPage />,
  },
  {
    path: "/dashboard",
    element: <DashboardPage />,
  },
  {
    path: "/documents",
    element: <DocumentsPage />,
  },
  {
    path: "/messaging",
    element: <MessagingPage />,
  },
  {
    path: "/settings",
    element: <SettingsPage />,
  },
  {
    path:"/projects",
    element:<Projects/>,
  },
  {
    path:"/projects/dashboard",
    element:<AdminDashboard/>,
  },
  {
    path:"/projects/documents",
    element:<AdminDocument/>
  },
  {
    path: "/projects/Team",
    element: <ProjectTeam />
  },
  {
    path: "/projects/preview",
    element: <AdminPreview />
  },
  {
    path: "/projectinfo",
    element: <CarouselHorizontalStepper />,
  },
  {
    path:"projects/auditorsworkspace",
    element:<AuditorWorkspace/>
  }, 
]
 )

const AppLayout = () => {
  return (
      <AuthProvider> {/* Wrap the entire app with AuthProvider */}
        <RouterProvider router={router} />
      </AuthProvider>
  );
};


export default AppLayout;
