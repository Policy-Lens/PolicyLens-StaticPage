import "./App.css";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import CarouselHorizontalStepper from "./Components/WorkFlow/VertStepper";
import AdminDashboard from "./Components/AdminView/DashboardComponents/AdminDashboard";
import ProjectTeam from "./Components/ProjectView/Manage Team/ProjectTeam";
import AdminPreview from "./Components/AdminView/AdminPreview";
import AuditorsPage from "./Components/HomeNav/Auditors";
import CompaniesPage from "./Components/HomeNav/Company/CompanyList";
import CompanyDetail from "./Components/HomeNav/Company/CompanyDetail";
import AccountActivation from "./Components/Auth/AccountActivation";
import DashboardPage from "./Components/HomeNav/Dashboard";
import DocumentsPage from "./Components/HomeNav/Documents";
import SettingsPage from "./Components/HomeNav/Settings";
import MessagingPage from "./Components/HomeNav/Messaging";
import Projects from "./Components/AdminView/Projects";
import AuditorWorkspace from "./Components/WorkFlow/AuditorsWorkspace";
import LoginPage from "./Components/login";
import Questionnaire from "./Components/AdminView/ProjectTabs/Questionnaire";
import MeetingCalendar from "./Components/AdminView/ProjectTabs/Calender";
import EvidenceData from "./Components/AdminView/ProjectTabs/EvidenceData";
import Support from "./Components/AdminView/ProjectTabs/Support";
import MyReports from "./Components/AdminView/ProjectTabs/MyReports/MyReports";
import { AuthProvider } from "./AuthContext";
import { ProjectProvider } from "./Context/ProjectContext";
import { WorkflowProvider } from "./Context/WorkflowContext";
import { ScopingProvider } from "./Context/ScopingContext";
import AdminLayout from "./Components/AdminView/AdminLayout";
import InternalAuditProcess from "./Components/WorkFlow/InternalAuditProcess";
import PolicyLibrary from "./Components/AdminView/ProjectTabs/PolicyLibrary";
import NewQuestionnaire from "./Components/AdminView/ProjectTabs/NewQuestionnaire";
import QuestionLibrary from "./Components/HomeNav/QuestionLibrary";
import ISO4217 from "./Components/HomeNav/Database/ISO4217";
import ISO3166 from "./Components/HomeNav/Database/ISO3166";
import GICS from "./Components/HomeNav/Database/GICS";
import Database from "./Components/HomeNav/Database";
import SupportChat from "./wstest/SupportChat";
import AdminDashboardRouter from "./Components/AdminView/DashboardComponents/AdminDashboardRouter";
import Regulations from "./Components/HomeNav/Database/Regulations";
import ISO27001 from "./Components/HomeNav/Database/ISO27001";
import PolicyLibraryTemplates from "./Components/HomeNav/Database/PolicyLibraryTemplates";
import HomeLayout from "./Components/HomeNav/HomeLayout";
import { NotificationProvider } from "./Context/NotificationContext";
import NotificationToast from "./Components/Common/NotificationToast";
import ConsultantTeamPage from "./Components/HomeNav/ConsultantTeamPage";
import VaptQuestions from "./Components/AdminView/ProjectTabs/VaptQuestions";
import VaptForm from "./Components/AdminView/ProjectTabs/VaptForm";
import EditorView from "./Components/EditorView/EditorView";
import PolicyEditor from "./Components/PolicyEditor/PolicyEditor";
import WorkflowOverview from "./Components/ProjectView/Workflow/WorkflowOverview";
import Scoping from "./Components/ProjectView/Workflow/Scoping/Scoping";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginPage />,
  },
  {
    path: "/chat",
    element: <SupportChat />,
  },
  {
    path: "/register",
    element: <LoginPage />,
  },
  {
    path: "/activateaccount",
    element: <AccountActivation />,
  },
  {
    path: "home",
    element: <HomeLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="dashboard" replace />,
      },
      {
        path: "Dashboard",
        element: <DashboardPage />,
      },
      {
        path: "auditors",
        element: <AuditorsPage />,
      },
      {
        path: "company",
        element: <CompaniesPage />,
      },
      {
        path: "company/:companyId",
        element: <CompanyDetail />,
      },
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
      {
        path: "documents",
        element: <DocumentsPage />,
      },
      {
        path: "messaging",
        element: <MessagingPage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
      {
        path: "questionlibrary",
        element: <QuestionLibrary />,
      },
      {
        path: "database",
        element: <Database />,
        children: [
          {
            index: true,
            element: <Navigate to="regulations" replace />,
          },
          {
            path: "regulations",
            element: <Regulations />,
          },
          {
            path: "iso27001",
            element: <ISO27001 />,
          },
          {
            path: "iso4217",
            element: <ISO4217 />,
          },
          {
            path: "countries",
            element: <ISO3166 />,
          },
          {
            path: "gics",
            element: <GICS />,
          },
          {
            path: "policy-library-templates",
            element: <PolicyLibraryTemplates />,
          },
        ],
      },
      {
        path: "projects",
        element: <Projects />,
      },
      {
        path: "consultant-team",
        element: <ConsultantTeamPage />,
      },
    ],
  },
  {
    path: "/ques",
    element: <Questionnaire />,
  },
  {
    path: "/calender",
    element: <MeetingCalendar />,
  },
  {
    path: "project/:projectid",
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <CarouselHorizontalStepper />,
      },
      {
        path: "projectdashboard/*",
        element: <AdminDashboardRouter />,
      },
      {
        path: "internalauditprocess",
        element: <InternalAuditProcess />,
      },
      {
        path: "adminpreview",
        element: <AdminPreview />,
      },
      {
        path: "projectteam",
        element: <ProjectTeam />,
      },
      {
        path: "auditorworkspace",
        element: <AuditorWorkspace />,
      },
      {
        path: "questionbank",
        element: <NewQuestionnaire />,
      },
      {
        path: "questionbank/vaptquestions",
        element: <VaptQuestions />,
      },
      {
        path: "questionbank/vaptform",
        element: <VaptForm />,
      },
      {
        path: "myevidences",
        element: <EvidenceData />,
      },
      {
        path: "calender",
        element: <MeetingCalendar />,
      },
      {
        path: "askforhelp",
        element: <Support />,
      },
      {
        path: "myreports",
        element: <MyReports />,
      },
      {
        path: "myreports/:reportType",
        element: <MyReports />,
      },
      {
        path: "myreports/:reportType/:reportId",
        element: <MyReports />,
      },
      {
        path: "policylibrary",
        element: <PolicyLibrary />,
      },
      {
        path: "editor",
        element: <EditorView />,
      },
      {
        path: "policy-editor/:policyId?",
        element: <PolicyEditor />,
      },
      {
        path: "workflow",
        element: <WorkflowOverview />,
      },
      {
        path: "workflow/scoping",
        element: <Scoping />,
      },
    ],
  },
]);

const AppLayout = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <WorkflowProvider>
          <ScopingProvider>
            <ProjectProvider>
                <RouterProvider router={router} />
                <NotificationToast />
            </ProjectProvider>
          </ScopingProvider>
        </WorkflowProvider>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default AppLayout;
