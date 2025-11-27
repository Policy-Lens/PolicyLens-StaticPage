import { createContext, useState } from "react";
import { apiRequest } from "../utils/api";

export const OnboardingContext = createContext();

export const OnboardingProvider = ({ children }) => {
  const [onboardingData, setOnboardingData] = useState(null);
  const [riskRatingSetup, setRiskRatingSetup] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const getOnboardingDetails = async (projectId) => {
    try {
      setIsLoading(true);
      const response = await apiRequest(
        "GET",
        `/api/project/onboarding/${projectId}/`,
        null,
        true
      );

      if (response.status === 200) {
        setOnboardingData(response.data);
        return response.data;
      }
      return null;
    } catch (error) {
      console.error("Error fetching onboarding details:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const assignAdvisor = async (projectId, advisorId) => {
    try {
      setIsLoading(true);
      const response = await apiRequest(
        "POST",
        `/api/project/onboarding/${projectId}/assign-advisor/`,
        { advisor_id: advisorId },
        true
      );

      if (response.status === 200) {
        return { success: true, data: response.data };
      }
      return { success: false };
    } catch (error) {
      console.error("Error assigning advisor:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const removeAdvisor = async (projectId, advisorId) => {
    try {
      setIsLoading(true);
      const response = await apiRequest(
        "POST",
        `/api/project/onboarding/${projectId}/remove-advisor/`,
        { advisor_id: advisorId },
        true
      );

      if (response.status === 200) {
        return { success: true, data: response.data };
      }
      return { success: false };
    } catch (error) {
      console.error("Error removing advisor:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateOnboardingStatus = async (projectId, status) => {
    try {
      setIsLoading(true);
      const response = await apiRequest(
        "PATCH",
        `/api/project/onboarding/${projectId}/status/`,
        { status },
        true
      );

      if (response.status === 200) {
        return { success: true, data: response.data };
      }
      return { success: false };
    } catch (error) {
      console.error("Error updating onboarding status:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Get questions by domain
  const getQuestionsByDomain = async (projectId, domain) => {
    try {
      const response = await apiRequest(
        "GET",
        `/api/new-questionnaire/project/${projectId}/questions/?domain=${domain}`,
        null,
        true
      );

      if (response.status === 200) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error("Error fetching questions:", error);
      throw error;
    }
  };

  // Get question bank by domain
  const getQuestionBank = async (projectId, domain) => {
    try {
      const response = await apiRequest(
        "GET",
        `/api/project/${projectId}/questions/bank/?domain=${domain}`,
        null,
        true
      );

      if (response.status === 200) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error("Error fetching question bank:", error);
      throw error;
    }
  };

  // Update question metadata
  const updateQuestionMetadata = async (projectId, questionId, metadata) => {
    try {
      const response = await apiRequest(
        "PATCH",
        `/api/project/${projectId}/questions/${questionId}/metadata/`,
        metadata,
        true
      );

      if (response.status === 200) {
        return { success: true, data: response.data };
      }
      return { success: false };
    } catch (error) {
      console.error("Error updating question metadata:", error);
      throw error;
    }
  };

  // Select question
  const selectQuestion = async (projectId, questionId) => {
    try {
      const response = await apiRequest(
        "POST",
        `/api/project/${projectId}/questions/select/`,
        { question_id: questionId },
        true
      );

      if (response.status === 200 || response.status === 201) {
        return { success: true, data: response.data };
      }
      return { success: false };
    } catch (error) {
      console.error("Error selecting question:", error);
      throw error;
    }
  };

  // Unselect question
  const unselectQuestion = async (projectId, projectQuestionId) => {
    try {
      const response = await apiRequest(
        "DELETE",
        `/api/project/${projectId}/questions/${projectQuestionId}/unselect/`,
        null,
        true
      );

      if (response.status === 200 || response.status === 204) {
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error("Error unselecting question:", error);
      throw error;
    }
  };

  // Get issues by category
  const getIssuesByCategory = async (projectId, category) => {
    try {
      const response = await apiRequest(
        "GET",
        `/api/project/${projectId}/issues/?category=${category}`,
        null,
        true
      );

      if (response.status === 200) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error("Error fetching issues:", error);
      throw error;
    }
  };

  // Get issue bank
  const getIssueBank = async (projectId) => {
    try {
      const response = await apiRequest(
        "GET",
        `/api/project/${projectId}/issues/bank/`,
        null,
        true
      );

      if (response.status === 200) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error("Error fetching issue bank:", error);
      throw error;
    }
  };

  // Select issue
  const selectIssue = async (projectId, issueId) => {
    try {
      const response = await apiRequest(
        "POST",
        `/api/project/${projectId}/issues/select/`,
        { issue_id: issueId },
        true
      );

      if (response.status === 200 || response.status === 201) {
        return { success: true, data: response.data };
      }
      return { success: false };
    } catch (error) {
      console.error("Error selecting issue:", error);
      throw error;
    }
  };

  // Unselect issue
  const unselectIssue = async (projectId, projectIssueItemId) => {
    try {
      const response = await apiRequest(
        "DELETE",
        `/api/project/${projectId}/issues/${projectIssueItemId}/unselect/`,
        null,
        true
      );

      if (response.status === 200 || response.status === 204) {
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error("Error unselecting issue:", error);
      throw error;
    }
  };

  // Get risk rating setup
  const getRiskRatingSetup = async (projectId) => {
    try {
      setIsLoading(true);
      const response = await apiRequest(
        "GET",
        `/api/project/${projectId}/setup/`,
        null,
        true
      );

      if (response.status === 200) {
        setRiskRatingSetup(response.data);
        return response.data;
      }
      return null;
    } catch (error) {
      console.error("Error fetching risk rating setup:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update risk rating scale
  const updateRiskRatingScale = async (projectId, scale) => {
    try {
      setIsLoading(true);
      const response = await apiRequest(
        "PATCH",
        `/api/project/${projectId}/setup/update/`,
        { risk_rating_scale: scale },
        true
      );

      if (response.status === 200) {
        setRiskRatingSetup(response.data);
        return { success: true, data: response.data };
      }
      return { success: false };
    } catch (error) {
      console.error("Error updating risk rating scale:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <OnboardingContext.Provider
      value={{
        onboardingData,
        setOnboardingData,
        riskRatingSetup,
        setRiskRatingSetup,
        isLoading,
        getOnboardingDetails,
        assignAdvisor,
        removeAdvisor,
        updateOnboardingStatus,
        getQuestionsByDomain,
        getQuestionBank,
        updateQuestionMetadata,
        selectQuestion,
        unselectQuestion,
        getIssuesByCategory,
        getIssueBank,
        selectIssue,
        unselectIssue,
        getRiskRatingSetup,
        updateRiskRatingScale,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};
