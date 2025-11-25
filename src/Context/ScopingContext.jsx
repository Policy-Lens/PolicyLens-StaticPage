import { createContext, useState } from "react";
import { apiRequest } from "../utils/api";

export const ScopingContext = createContext();

export const ScopingProvider = ({ children }) => {
  const [scopingData, setScopingData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get workflow overview
  const getWorkflowOverview = async (projectId) => {
    try {
      setIsLoading(true);
      const response = await apiRequest(
        "GET",
        `/api/project/${projectId}/get_workflow_overview/`,
        null,
        true
      );

      if (response.status === 200) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error("Error fetching workflow overview:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Get scoping data
  const getScopingData = async (projectId) => {
    try {
      setIsLoading(true);
      const response = await apiRequest(
        "GET",
        `/api/project_scoping/scoping/${projectId}/`,
        null,
        true
      );

      if (response.status === 200) {
        setScopingData(response.data);
        return response.data;
      }
      return null;
    } catch (error) {
      console.error("Error fetching scoping data:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Get predefined resource requirements
  const getPredefinedRR = async () => {
    try {
      const response = await apiRequest(
        "GET",
        `/api/project_scoping/predefined-rr/`,
        null,
        true
      );

      if (response.status === 200) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error("Error fetching predefined RR:", error);
      return [];
    }
  };

  // Get resource requirements
  const getResourceRequirements = async (projectId) => {
    try {
      const response = await apiRequest(
        "GET",
        `/api/project_scoping/resource-requirements/${projectId}/`,
        null,
        true
      );

      if (response.status === 200) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error("Error fetching resource requirements:", error);
      return [];
    }
  };

  // Update resource requirements
  const updateResourceRequirements = async (projectId, data) => {
    try {
      setIsLoading(true);
      const response = await apiRequest(
        "POST",
        `/api/project_scoping/resource-requirements/${projectId}/update/`,
        data,
        true
      );

      if (response.status === 200) {
        return { success: true, data: response.data };
      }
      return { success: false };
    } catch (error) {
      console.error("Error updating resource requirements:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update RACI matrix for a task
  const updateRACIMatrix = async (rrId, data) => {
    try {
      const response = await apiRequest(
        "PATCH",
        `/api/project_scoping/raci/${rrId}/update/`,
        data,
        true
      );

      if (response.status === 200) {
        return { success: true, data: response.data };
      }
      return { success: false };
    } catch (error) {
      console.error("Error updating RACI matrix:", error);
      throw error;
    }
  };

  // Get milestone data
  const getMilestoneData = async (projectId) => {
    try {
      const response = await apiRequest(
        "GET",
        `/api/project_scoping/milestone-data/${projectId}/`,
        null,
        true
      );

      if (response.status === 200) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error("Error fetching milestone data:", error);
      return [];
    }
  };

  // Get pricing data
  const getPricingData = async (projectId) => {
    try {
      const response = await apiRequest(
        "GET",
        `/api/project_scoping/pricing/${projectId}/`,
        null,
        true
      );

      if (response.status === 200) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error("Error fetching pricing data:", error);
      return [];
    }
  };

  // Add pricing entry
  const addPricingEntry = async (projectId, data) => {
    try {
      const response = await apiRequest(
        "POST",
        `/api/project_scoping/pricing/${projectId}/add/`,
        data,
        true
      );

      if (response.status === 200 || response.status === 201) {
        return { success: true, data: response.data };
      }
      return { success: false };
    } catch (error) {
      console.error("Error adding pricing entry:", error);
      throw error;
    }
  };

  // Update pricing entry
  const updatePricingEntry = async (priceId, data) => {
    try {
      const response = await apiRequest(
        "PATCH",
        `/api/project_scoping/pricing/${priceId}/update/`,
        data,
        true
      );

      if (response.status === 200) {
        return { success: true, data: response.data };
      }
      return { success: false };
    } catch (error) {
      console.error("Error updating pricing entry:", error);
      throw error;
    }
  };

  // Delete pricing entry
  const deletePricingEntry = async (priceId) => {
    try {
      const response = await apiRequest(
        "DELETE",
        `/api/project_scoping/pricing/${priceId}/delete/`,
        null,
        true
      );

      if (response.status === 204) {
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error("Error deleting pricing entry:", error);
      throw error;
    }
  };

  // Get payment tranches
  const getPaymentTranches = async (projectId) => {
    try {
      const response = await apiRequest(
        "GET",
        `/api/project_scoping/tranches/${projectId}/`,
        null,
        true
      );

      if (response.status === 200) {
        return response.data;
      }
      return { tranches: [], total_percentage: 0 };
    } catch (error) {
      console.error("Error fetching payment tranches:", error);
      return { tranches: [], total_percentage: 0 };
    }
  };

  // Update payment tranches
  const updatePaymentTranches = async (projectId, data) => {
    try {
      setIsLoading(true);
      const response = await apiRequest(
        "POST",
        `/api/project_scoping/tranches/${projectId}/update/`,
        data,
        true
      );

      if (response.status === 200) {
        return { success: true, data: response.data };
      }
      return { success: false };
    } catch (error) {
      console.error("Error updating payment tranches:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Send for approval
  const sendForApproval = async (projectId, signature) => {
    try {
      setIsLoading(true);
      const response = await apiRequest(
        "POST",
        `/api/project_scoping/send-for-approval/${projectId}/`,
        signature,
        true
      );

      if (response.status === 200) {
        return { success: true, data: response.data };
      }
      return { success: false };
    } catch (error) {
      console.error("Error sending for approval:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Assign reviewer
  const assignReviewer = async (projectId, reviewerId) => {
    try {
      const response = await apiRequest(
        "PATCH",
        `/api/project_scoping/assign-reviewer/${projectId}/`,
        { reviewer_id: reviewerId },
        true
      );

      if (response.status === 200) {
        return { success: true, data: response.data };
      }
      return { success: false };
    } catch (error) {
      console.error("Error assigning reviewer:", error);
      throw error;
    }
  };

  // Approve/Reject scoping
  const approveRejectScoping = async (
    projectId,
    action,
    feedback = null,
    signature = null
  ) => {
    try {
      setIsLoading(true);
      const body = new FormData();
      body.append("action", action);
      if (feedback) body.append("feedback", feedback);
      if (signature) body.append("signature", signature);

      const response = await apiRequest(
        "POST",
        `/api/project_scoping/approve-reject/${projectId}/`,
        body,
        true
      );

      if (response.status === 200) {
        return { success: true, data: response.data };
      }
      return { success: false };
    } catch (error) {
      console.error("Error approving/rejecting scoping:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Get contract clauses
  const getContractClauses = async (projectId) => {
    try {
      const response = await apiRequest(
        "GET",
        `/api/project_scoping/contract/${projectId}/`,
        null,
        true
      );

      if (response.status === 200) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error("Error fetching contract clauses:", error);
      throw error;
    }
  };

  // Update contract clauses
  const updateContractClauses = async (projectId, data) => {
    try {
      setIsLoading(true);
      const response = await apiRequest(
        "PATCH",
        `/api/project_scoping/contract/${projectId}/update/`,
        data,
        true
      );

      if (response.status === 200) {
        return { success: true, data: response.data };
      }
      return { success: false };
    } catch (error) {
      console.error("Error updating contract clauses:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScopingContext.Provider
      value={{
        // State
        scopingData,
        setScopingData,
        isLoading,
        setIsLoading,

        // API Functions
        getWorkflowOverview,
        getScopingData,
        getPredefinedRR,
        getResourceRequirements,
        updateResourceRequirements,
        updateRACIMatrix,
        getMilestoneData,
        getPricingData,
        addPricingEntry,
        updatePricingEntry,
        deletePricingEntry,
        getPaymentTranches,
        updatePaymentTranches,
        sendForApproval,
        assignReviewer,
        approveRejectScoping,
        getContractClauses,
        updateContractClauses,
      }}
    >
      {children}
    </ScopingContext.Provider>
  );
};
