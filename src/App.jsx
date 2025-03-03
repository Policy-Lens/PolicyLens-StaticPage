import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import CarouselHorizontalStepper from "./Components/WorkFlow/VertStepper";
import AdminDashboard from "./Components/AdminView/AdminDashboard";
import ProjectTeam from "./Components/AdminView/ProjectTeam";
import AdminPreview from "./Components/AdminView/AdminPreview";
import AdminDocument from "./Components/AdminView/AdminDocument";
import AuditorsPage from "./Components/HomeNav/Auditors";
import CompaniesPage from "./Components/HomeNav/Company";
import DashboardPage from "./Components/HomeNav/Dashboard";
import DocumentsPage from "./Components/HomeNav/Documents";
import SettingsPage from "./Components/HomeNav/Settings";
import MessagingPage from "./Components/HomeNav/Messaging";
import Projects from "./Components/AdminView/Projects";
import AuditorWorkspace from "./Components/WorkFlow/AuditorsWorkspace";
import LoginPage from "./Components/login";
import { AuthProvider } from "./AuthContext";
import { ProjectProvider } from "./Context/ProjectContext";
import AdminLayout from "./Components/AdminView/AdminLayout";
const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <LoginPage />,
  },
  {
    path: "/Dashboard",
    element: <DashboardPage />,
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
    path: "/projects",
    element: <Projects />,
  },
  {
    path: "project/:projectid",
    element: <AdminLayout />,
    children: [
      {
        // path: "plc",
        index:true,
        element: <CarouselHorizontalStepper />,
      },
      {
        path: "admindashboard",
        element: <AdminDashboard />
      },
      {
        path: "admindocuments",
        element: <AdminDocument />
      },
      {
        path: "adminpreview",
        element: <AdminPreview />
      },
      {
        path: "projectteam",
        element: <ProjectTeam />
      },
      {
        path: "auditorworkspace",
        element: <AuditorWorkspace />
      },
    ]
  }

]);

const AppLayout = () => {
  return (
    <AuthProvider>
      <ProjectProvider>
        {/* Wrap the entire app with AuthProvider */}
        <RouterProvider router={router} />
      </ProjectProvider>
    </AuthProvider>
  );
};

export default AppLayout;
