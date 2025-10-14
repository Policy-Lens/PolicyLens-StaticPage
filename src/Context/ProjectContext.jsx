import { createContext, useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { apiRequest } from "../utils/api";
import { useParams } from "react-router-dom";

export const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const [projectRole, setProjectRole] = useState("");
  const [project, setProject] = useState({ id: 4 });
  const [userRole, setUserRole] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [projectRoleCache, setProjectRoleCache] = useState({}); // Cache project roles

  // Centralized authentication check - runs once on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = Cookies.get("access_token");
        if (token) {
          const response = await apiRequest("GET", "/api/auth/token/verify/", null, true);
          if (response.status === 200) {
            setIsAuthenticated(true);
            setUserRole(response.data.role || "");
          } else {
            setIsAuthenticated(false);
            setUserRole("");
          }
        } else {
          setIsAuthenticated(false);
          setUserRole("");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false);
        setUserRole("");
      } finally {
        setAuthChecked(true);
      }
    };
    getProjectRole();
    checkAuth();
  }, []);

  const getProjectRole = async (projectid) => {
    // Check cache first
    // if (projectRoleCache[projectid]) {
    //   setProjectRole(projectRoleCache[projectid]);
    //   return projectRoleCache[projectid];
    // }

    try {
      const res = await apiRequest(
        "GET",
        `/api/project/${projectid}/my-role/`,
        null,
        true
      );
      
      if (res.status === 200) {
        const role = res.data.project_role;
        setProjectRole(role);
        console.log(role)
        // Cache the result
        // setProjectRoleCache(prev => ({
        //   ...prev,
        //   [projectid]: role
        // }));
        
        return role;
      }
    } catch (error) {
      console.error("Error fetching project role:", error);
      return null;
    }
  };

  const getStepId = async (project_id, step_no) => {
    const res = await apiRequest(
      "GET",
      `/api/plc/plc_step/${project_id}/${step_no}/get_id/`,
      null,
      true
    );
    if (res.status == 200) {
      return res.data;
    } else {
      console.error("Error fetching step ID:", res.error);
      return null;
    }
  };

  const checkStepAuth = async (step_id) => {
    const res = await apiRequest(
      "GET",
      `/api/plc/plc_step/${step_id}/authorization/`,
      null,
      true
    );
    if (res.status == 200) {
      return res.data.authorization;
    } else {
      console.error("Error checking step auth:", res.error);
      return false;
    }
  };

  const getStepData = async (step_id) => {
    const res = await apiRequest(
      "GET",
      `/api/plc/plc_data/${step_id}/latest/`,
      null,
      true
    );
    return res.data;
  };

  const addStepData = async (step_id, data) => {
    const res = await apiRequest(
      "POST",
      `/api/plc/plc_data/${step_id}/create/`,
      data,
      true
    );
    return res;
  };

  const assignStep = async (step_id, data) => {
    const res = await apiRequest(
      "POST",
      `/api/plc/step-assignment/${step_id}/create/`,
      data,
      true
    );
    if (res.status == 201) {
      return true;
    } else {
      console.error("Error assigning step:", res.error);
      return false;
    }
  };

  const getStepAssignment = async (step_id) => {
    const res = await apiRequest(
      "GET",
      `/api/plc/step-assignment/${step_id}/`,
      null,
      true
    );
    return res;
  };

  const getWorkflowStepsOverview = async (project_id) => {
    const res = await apiRequest(
      "GET",
      `/api/plc/project/${project_id}/workflow-overview/`,
      null,
      true
    );
    if (res.status === 200) {
      return res.data;
    } else {
      console.error("Error fetching workflow steps overview:", res.error);
      return null;
    }
  };

  const getProjectPlcOverview = async (project_id) => {
    const res = await apiRequest(
      "GET",
      `/api/plc/project/${project_id}/plc-overview/`,
      null,
      true
    );
    if (res.status === 200) {
      return res.data;
    } else {
      console.error("Error fetching project PLC overview:", res.error);
      return null;
    }
  };

  const getMembers = async (projectid) => {
    const res = await apiRequest(
      "GET",
      `/api/project/${projectid}/members/`,
      null,
      true
    );
    if (res.status === 200) {
      // Handle new API response structure with nested members array
      return res.data.members || res.data;
    }
  };

  // Clear cache when needed (e.g., on logout or project change)
  const clearProjectRoleCache = () => {
    setProjectRoleCache({});
  };

  return (
    <ProjectContext.Provider
      value={{
        projectRole,
        project,
        setProject,
        userRole,
        isAuthenticated,
        authChecked,
        getProjectRole,
        getStepId,
        checkStepAuth,
        getStepData,
        addStepData,
        assignStep,
        getStepAssignment,
        getWorkflowStepsOverview,
        getProjectPlcOverview,
        getMembers,
        clearProjectRoleCache,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};
