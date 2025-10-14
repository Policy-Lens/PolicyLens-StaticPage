import { createContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import { apiRequest } from "../utils/api";

export const WorkflowContext = createContext();

export const WorkflowProvider = ({ children }) => {
  const [workflowData, setWorkflowData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Get step details by project_id and step_no
  const getStepDetails = async (project_id, step_no) => {
    try {
      setIsLoading(true);
      const response = await apiRequest(
        "GET",
        `/api/plc_workflow/projects/${project_id}/step_no/${step_no}/`,
        null,
        true
      );
      
      if (response.status === 200) {
        return response.data;
      } else {
        console.error("Error fetching step details:", response.error);
        return null;
      }
    } catch (error) {
      console.error("Error fetching step details:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Get all project steps
  const getAllProjectSteps = async (project_id) => {
    try {
      setIsLoading(true);
      const response = await apiRequest(
        "GET",
        `/api/plc_workflow/projects/${project_id}/steps/`,
        null,
        true
      );
      
      if (response.status === 200) {
        return response.data;
      } else {
        console.error("Error fetching project steps:", response.error);
        return null;
      }
    } catch (error) {
      console.error("Error fetching project steps:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Update step data
  const updateStepData = async (step_id, data) => {
    try {
      setIsLoading(true);
      const response = await apiRequest(
        "PUT",
        `/api/plc_workflow/steps/${step_id}/update/`,
        data,
        true
      );
      
      if (response.status === 200) {
        return response.data;
      } else {
        console.error("Error updating step data:", response.error);
        return null;
      }
    } catch (error) {
      console.error("Error updating step data:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Patch update step data
  const patchUpdateStepData = async (step_id, data) => {
    try {
      setIsLoading(true);
      const response = await apiRequest(
        "PATCH",
        `/api/plc_workflow/steps/${step_id}/update/`,
        data,
        true
      );
      
      if (response.status === 200) {
        // Response: { message, step_no, data, step_status, last_updated_by }
        return {
          success: true,
          message: response.data.message,
          stepNo: response.data.step_no,
          data: response.data.data,
          stepStatus: response.data.step_status,
          lastUpdatedBy: response.data.last_updated_by
        };
      } else {
        console.error("Error patching step data:", response.error);
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error("Error patching step data:", error);
      return { success: false, error: error.message || "Failed to update step data" };
    } finally {
      setIsLoading(false);
    }
  };

  // Assign task to step
  const assignTask = async (step_id, taskData) => {
    try {
      setIsLoading(true);
      // Expected body: { assigned_to: <user_id>, description: "optional", references: "optional", deadline: "date" }
      const response = await apiRequest(
        "POST",
        `/api/plc_workflow/steps/${step_id}/task/`,
        taskData,
        true
      );
      
      if (response.status === 200) {
        // Response includes: message, data (assignment details), step_status
        return {
          success: true,
          data: response.data.data,
          stepStatus: response.data.step_status,
          message: response.data.message
        };
      } else {
        console.error("Error assigning task:", response.error);
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error("Error assigning task:", error);
      return { success: false, error: error.message || "Failed to assign task" };
    } finally {
      setIsLoading(false);
    }
  };

  // Delete task assignment
  const deleteTaskAssignment = async (step_id) => {
    try {
      setIsLoading(true);
      const response = await apiRequest(
        "DELETE",
        `/api/plc_workflow/steps/${step_id}/task/`,
        null,
        true
      );
      
      if (response.status === 204) {
        return { success: true };
      } else {
        console.error("Error deleting task assignment:", response.error);
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error("Error deleting task assignment:", error);
      return { success: false, error: error.message || "Failed to delete task assignment" };
    } finally {
      setIsLoading(false);
    }
  };

  // Update step status
  const updateStepStatus = async (step_id, statusData) => {
    try {
      setIsLoading(true);
      // Expected body: { status: "new_status", comment: "when rejecting" }
      const response = await apiRequest(
        "PATCH",
        `/api/plc_workflow/steps/${step_id}/status/`,
        statusData,
        true
      );
      
      if (response.status === 200) {
        return { success: true, data: response.data };
      } else {
        console.error("Error updating step status:", response.error);
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error("Error updating step status:", error);
      return { success: false, error: error.message || "Failed to update status" };
    } finally {
      setIsLoading(false);
    }
  };

  // Assign reviewer to step
  const assignReviewer = async (step_id, reviewerData) => {
    try {
      setIsLoading(true);
      // Expected body: { assigned_to: <reviewer_id> }
      const response = await apiRequest(
        "POST",
        `/api/plc_workflow/steps/${step_id}/reviewer/`,
        reviewerData,
        true
      );
      
      if (response.status === 200) {
        return { success: true, data: response.data };
      } else {
        console.error("Error assigning reviewer:", response.error);
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error("Error assigning reviewer:", error);
      return { success: false, error: error.message || "Failed to assign reviewer" };
    } finally {
      setIsLoading(false);
    }
  };

  // Delete reviewer assignment
  const deleteReviewerAssignment = async (step_id) => {
    try {
      setIsLoading(true);
      const response = await apiRequest(
        "DELETE",
        `/api/plc_workflow/steps/${step_id}/reviewer/`,
        null,
        true
      );
      
      if (response.status === 204) {
        return { success: true };
      } else {
        console.error("Error deleting reviewer assignment:", response.error);
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error("Error deleting reviewer assignment:", error);
      return { success: false, error: error.message || "Failed to delete reviewer assignment" };
    } finally {
      setIsLoading(false);
    }
  };


  // Utility function to check if user can edit based on role and permissions
  const canUserEdit = (projectRole, permissions) => {
    return projectRole === 'consultant admin' || permissions?.can_edit === true;
  };

  // Utility function to check if user can assign tasks
  const canAssignTask = (projectRole, status) => {
    return projectRole === 'consultant admin' && 
           (status === 'not_started' || status === 'in_progress');
  };

  // Utility function to check if user can assign/manage reviewers
  const canManageReviewer = (projectRole, status, permissions) => {
    return projectRole === 'company' && 
           status === 'awaiting_approval' && 
           permissions?.can_review === true;
  };

  // Utility function to check if reviewer section should be visible
  const canSeeReviewer = (permissions, projectRole) => {
    return permissions?.can_review === true || projectRole === 'company';
  };

  // Utility function to check if user can send for review
  const canSendForReview = (projectRole, status, hasAllRequiredData) => {
    return projectRole === 'consultant admin' && 
           status === 'in_progress' && 
           hasAllRequiredData;
  };

  // Utility function to check if user can approve/reject
  const canApproveReject = (projectRole, status, permissions) => {
    return (projectRole === 'company' || permissions?.can_review === true)
          && status === 'awaiting_approval' ;
  };

  // Utility function to check if form has all required data
  const hasAllRequiredFields = (formData) => {
    if (!formData) return false;
    
    const requiredFields = [
      'registered_address', 'legal_structure', 'num_employees', 
      'year_establishment', 'industry_sector', 'business_model', 
      'primary_services', 'requirement_for_service'
    ];
    
    return requiredFields.every(field => 
      formData[field] && 
      formData[field].toString().trim() !== ''
    );
  };

  return (
    <WorkflowContext.Provider
      value={{
        // API Functions
        getStepDetails,
        getAllProjectSteps,
        updateStepData,
        patchUpdateStepData,
        assignTask,
        deleteTaskAssignment,
        updateStepStatus,
        assignReviewer,
        deleteReviewerAssignment,
        
        
        // Utility Functions
        canUserEdit,
        canAssignTask,
        canManageReviewer,
        canSeeReviewer,
        canSendForReview,
        canApproveReject,
        hasAllRequiredFields,
        
        // State
        workflowData,
        isLoading,
        setIsLoading
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
};
