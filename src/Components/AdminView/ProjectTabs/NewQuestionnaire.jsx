import React, { useState, useContext, useRef, useEffect, useMemo } from "react";
import {
  Search,
  Filter,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  X,
  MessageSquare,
  Users,
  FileText,
  Calendar,
  Download,
  Plus,
  Edit,
  Trash2,
  Clock,
  ArrowLeft,
  ArrowRight,
  UserPlus,
  CheckCircle,
  User,
  Calendar as CalendarIcon,
  AlertCircle,
  RotateCcw,
  UploadCloud,
  ThumbsUp,
  MessageCircle,
} from "lucide-react";
import { ProjectContext } from "../../../Context/ProjectContext";
import { AuthContext } from "../../../AuthContext";
import { apiRequest, BASE_URL } from "../../../utils/api";
import { useParams } from "react-router-dom";
import { message, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const NewQuestionnaire = () => {
  const { projectid } = useParams();
  const { projectRole, project, getMembers } = useContext(ProjectContext);
  const { user } = useContext(AuthContext);

  // Question list state
  const [questions, setQuestions] = useState([]);
  const [isQuestionsLoading, setIsQuestionsLoading] = useState(true);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [activeSidebarTab, setActiveSidebarTab] = useState("question");
  const [activeQuestionTab, setActiveQuestionTab] = useState("all");

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [filters, setFilters] = useState({
    type: "",
    standard: "",
    status: "",
  });

  // Assignment state
  const [isAssignDropdownOpen, setIsAssignDropdownOpen] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [companyRepresentatives, setCompanyRepresentatives] = useState([]);
  const [selectedRepresentative, setSelectedRepresentative] = useState(null);
  const assignDropdownRef = useRef(null);
  const assignReviewerDropdownRef = useRef(null);

  // Bulk Assignment Modal state
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [unassignedQuestions, setUnassignedQuestions] = useState([]);
  const [isLoadingUnassignedQuestions, setIsLoadingUnassignedQuestions] =
    useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [bulkAssignmentMethod, setBulkAssignmentMethod] = useState("specific"); // specific, random, sequential
  const [bulkAssignmentReps, setBulkAssignmentReps] = useState([]);
  const [isBulkAssigning, setIsBulkAssigning] = useState(false);

  // Review state
  const [isAssignReviewerDropdownOpen, setIsAssignReviewerDropdownOpen] =
    useState(false);
  const [selectedReviewer, setSelectedReviewer] = useState(null);
  const [members, setMembers] = useState([]);
  const [isAddingFeedback, setIsAddingFeedback] = useState(false);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [isReviewSubmitting, setIsReviewSubmitting] = useState(false);

  // Answer state
  const [isAddingAnswer, setIsAddingAnswer] = useState(false);
  const [newAnswer, setNewAnswer] = useState({
    response: "",
    policy: "",
    document_reference: "",
    comments: "",
    files: [], // Add files array
    doc_to_delete: [], // Add doc_to_delete array
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete confirmation state
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState(null);
  const [isDeletingAssignment, setIsDeletingAssignment] = useState(false);
  const [showDeleteConfirmationReviewer, setShowDeleteConfirmationReviewer] =
    useState(false);
  const [reviewerToDelete, setReviewerToDelete] = useState(null);
  const [isDeletingReviewerAssignment, setIsDeletingReviewerAssignment] =
    useState(false);

  // Type choices for filtering
  const typeChoices = [
    "Clause 4 - Context of the Organization",
    "Clause 5 - Leadership",
    "Clause 6 - Planning",
    "Clause 7 - Support",
    "Clause 8 - Operation",
    "Clause 9 - Performance Evaluation",
    "Clause 10 - Improvement",
    "5 - ORGANIZATIONAL CONTROLS",
    "6 - PEOPLE CONTROLS",
    "7 - PHYSICAL CONTROLS",
    "8 - TECHNOLOGICAL CONTROLS",
  ];

  // Response choices for answers
  const responseChoices = [
    "Yes",
    "No",
    "Not Applicable",
    "Refer to comments",
    "Clarification required",
  ];

  // Status choices
  const statusChoices = [
    "Not Answered",
    "Answered",
    "Needs Review",
    "Accepted",
    "Needs More Information",
  ];

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "Invalid Date";
    try {
      return new Date(dateString).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "Invalid Date";
    }
  };

  // Fetch questions based on role
  const handleGetQuestions = async () => {
    setIsQuestionsLoading(true);
    // Close details panel when refreshing
    setActiveQuestion(null);
    let endpoint = `/api/new-questionnaire/project/${projectid}/questions/?`;
    const params = new URLSearchParams();

    // Add filters based on user role
    if (projectRole === "company_representative") {
      params.append("assigned_to_answer", "true");
    } else if (projectRole === "consultant") {
      params.append("assigned_to_review", "true");
    }
    // company and consultant admin get all questions (no filter)

    // Add search and filters
    if (searchQuery) params.append("search", searchQuery);
    if (filters.type) params.append("type", filters.type);
    if (filters.standard) params.append("standard", filters.standard);
    if (filters.status) params.append("status", filters.status);

    endpoint += params.toString();

    try {
      const response = await apiRequest("GET", endpoint, null, true);
      if (response.status === 200) {
        setQuestions(response.data);
      } else {
        throw new Error(`Failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error("Failed to fetch questions:", error);
      message.error("Failed to fetch questions.");
      setQuestions([]);
    } finally {
      setIsQuestionsLoading(false);
    }
  };

  // Select a question and fetch its details
  const selectQuestion = async (question) => {
    console.log("Selected question:", question);
    setActiveQuestion(question);
    setActiveSidebarTab("question");

    // Reset states
    setIsAddingAnswer(false);
    setIsAddingFeedback(false);
    setFeedbackComment("");

    // If the question has no response or we need to refresh it, we could fetch additional details
    try {
      // For now, we're just using the selected question data directly
      // If you need to fetch additional details, you can uncomment this section
      /*
      const detailResponse = await apiRequest(
        "GET",
        `/api/new-questionnaire/project/question/${question.id}/`,
        null,
        true
      );
      
      if (detailResponse.status === 200) {
        setActiveQuestion(detailResponse.data);
      }
      */
    } catch (error) {
      console.error("Error fetching question details:", error);
      message.error("Failed to load question details.");
    }
  };

  // Toggle filter dropdown
  const toggleFilterDropdown = () => {
    setFilterDropdownOpen(!filterDropdownOpen);
  };

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value === prev[filterType] ? "" : value, // Toggle
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      type: "",
      standard: "",
      status: "",
    });
    setSearchQuery("");
  };

  // Effect to refetch questions when dependencies change
  useEffect(() => {
    handleGetQuestions();
  }, [searchQuery, filters, projectid]);

  // Handle click outside assign dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        assignDropdownRef.current &&
        !assignDropdownRef.current.contains(event.target)
      ) {
        setIsAssignDropdownOpen(false);
      }
      if (
        assignReviewerDropdownRef.current &&
        !assignReviewerDropdownRef.current.contains(event.target)
      ) {
        setIsAssignReviewerDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Define if the current user can answer the active question
  const canUserAnswer = useMemo(() => {
    if (!activeQuestion) return false;

    // Cannot edit if status is "Needs Review" or "Accepted"
    if (
      activeQuestion.status === "Needs Review" ||
      activeQuestion.status === "Accepted"
    ) {
      return false;
    }

    // Company role can always answer
    if (projectRole === "company") return true;

    // Company rep can answer if assigned to them
    if (projectRole === "company_representative") {
      return activeQuestion.assigned_to_answer === user?.id;
    }

    return false;
  }, [activeQuestion, projectRole, user]);

  // Define if the current user can review the active question
  const canUserReview = useMemo(() => {
    if (!activeQuestion || !activeQuestion.status) return false;

    if (activeQuestion.status !== "Needs Review") return false;

    // Admins can always review
    if (projectRole === "consultant admin") return true;

    // Check if user is assigned as reviewer
    return activeQuestion.assigned_for_answer_review === user?.id;
  }, [activeQuestion, projectRole, user]);

  // Toggle assign representative dropdown
  const toggleAssignDropdown = () => {
    if (!isAssignDropdownOpen) {
      fetchCompanyRepresentatives(); // Fetch only when opening
    }
    setIsAssignDropdownOpen(!isAssignDropdownOpen);
  };

  // Toggle assign reviewer dropdown
  const toggleAssignReviewerDropdown = () => {
    if (!isAssignReviewerDropdownOpen) {
      fetchMembers(); // Fetch only when opening
    }
    setIsAssignReviewerDropdownOpen(!isAssignReviewerDropdownOpen);
  };

  // Fetch company representatives for assignment dropdown
  const fetchCompanyRepresentatives = async () => {
    try {
      const response = await apiRequest(
        "GET",
        `/api/auth/projects/${projectid}/representatives/`,
        null,
        true
      );

      if (response.status === 200) {
        // Filter out already assigned representative if exists
        const filteredReps = response.data.filter((rep) => {
          return activeQuestion && activeQuestion.assigned_to_answer !== rep.id;
        });
        setCompanyRepresentatives(filteredReps);
      } else {
        throw new Error(`Failed with status ${response.status}`);
      }
    } catch (error) {
      console.error("Error fetching company representatives:", error);
      message.error("Failed to fetch company representatives.");
      setCompanyRepresentatives([]);
    }
  };

  // Fetch reviewers (project members who can review)
  const fetchMembers = async () => {
    try {
      const response = await apiRequest(
        "GET",
        `/api/project/${projectid}/members/`,
        null,
        true
      );

      // Filter out non-consultants and already assigned reviewer
      let filteredMembers = response.data.filter((member) => {
        return (
          // Only include consultants or consultant admins
          member.project_role === "consultant" &&
          // Don't include current user
          user.id !== member.id
        );
      });
      console.log(filteredMembers);
      setMembers(filteredMembers);
    } catch (error) {
      console.error("Error fetching members:", error);
      message.error("Failed to fetch members.");
      setMembers([]);
    }
  };

  // Assign representative to question
  const assignRepresentativeToQuestion = async (
    questionId,
    representativeId
  ) => {
    setIsAssigning(true);
    try {
      const response = await apiRequest(
        "POST",
        `/api/new-questionnaire/project/${projectid}/assign/`,
        {
          question_id: questionId,
          assign_to: representativeId,
        },
        true
      );

      if (response.status === 200 || response.status === 201) {
        message.success("Representative assigned successfully");

        // Update active question
        if (activeQuestion.id === response.data.id) {
          setActiveQuestion(response.data);
        }
        // update the question in the list
        setQuestions((prev) => {
          return prev.map((question) => {
            if (question.id === response.data.id) {
              return response.data;
            }
            return question;
          });
        });
        setIsAssignDropdownOpen(false);
      } else {
        throw new Error(`Failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error assigning representative:", error);
      message.error(
        `Failed to assign representative: ${error.message || "Unknown error"}`
      );
    } finally {
      setIsAssigning(false);
      setIsAssignDropdownOpen(false);
      setSelectedRepresentative(null);
    }
  };

  // Assign reviewer to question
  const assignReviewerToQuestion = async (questionId, reviewerId) => {
    setIsAssigning(true);
    try {
      const response = await apiRequest(
        "POST",
        `/api/new-questionnaire/project/${projectid}/assign-reviewer/`,
        {
          question_id: questionId,
          reviewer_id: reviewerId,
        },
        true
      );

      if (response.status === 200 || response.status === 201) {
        message.success("Reviewer assigned successfully");

        // Update active question
        if (activeQuestion.id === response.data.id) {
          setActiveQuestion(response.data);
        }
        // update the question in the list
        setQuestions((prev) => {
          return prev.map((question) => {
            if (question.id === response.data.id) {
              return response.data;
            }
            return question;
          });
        });
        setIsAssignReviewerDropdownOpen(false);
      } else {
        throw new Error(`Failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error assigning reviewer:", error);
      message.error(
        `Failed to assign reviewer: ${error.message || "Unknown error"}`
      );
    } finally {
      setIsAssigning(false);
      setIsAssignReviewerDropdownOpen(false);
      setSelectedReviewer(null);
    }
  };

  // Remove assignment from question
  const removeAssignment = async (questionId) => {
    setIsDeletingAssignment(true);
    try {
      const response = await apiRequest(
        "POST",
        `/api/new-questionnaire/project/question/${questionId}/remove-assignment/`,
        { remove_type: "answerer" },
        true
      );

      if (response.status === 204 || response.status === 200) {
        message.success("Assignment removed successfully");

        // Update active question and refresh list
        // Update active question
        if (activeQuestion.id === response.data.id) {
          setActiveQuestion(response.data);
        }
        // update the question in the list
        setQuestions((prev) => {
          return prev.map((question) => {
            if (question.id === response.data.id) {
              return response.data;
            }
            return question;
          });
        });
        setAssignmentToDelete(null);
      } else {
        throw new Error(`Failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error removing assignment:", error);
      message.error(
        `Failed to remove assignment: ${error.message || "Unknown error"}`
      );
    } finally {
      setIsDeletingAssignment(false);
      setShowDeleteConfirmation(false);
    }
  };

  // Remove reviewer assignment
  const removeReviewerAssignment = async (questionId) => {
    setIsDeletingReviewerAssignment(true);
    try {
      const response = await apiRequest(
        "POST",
        `/api/new-questionnaire/project/question/${questionId}/remove-assignment/`,
        { remove_type: "reviewer" },
        true
      );

      if (response.status === 204 || response.status === 200) {
        message.success("Reviewer assignment removed successfully");

        // Update active question
        if (activeQuestion.id === response.data.id) {
          setActiveQuestion(response.data);
        }
        // update the question in the list
        setQuestions((prev) => {
          return prev.map((question) => {
            if (question.id === response.data.id) {
              return response.data;
            }
            return question;
          });
        });
        
        setReviewerToDelete(null);
      } else {
        throw new Error(`Failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error removing reviewer assignment:", error);
      message.error(
        `Failed to remove reviewer assignment: ${
          error.message || "Unknown error"
        }`
      );
    } finally {
      setIsDeletingReviewerAssignment(false);
      setShowDeleteConfirmationReviewer(false);
    }
  };

  // Function to handle adding or editing an answer
  const handleEditAnswer = () => {
    setIsAddingAnswer(true);

    // Pre-populate form with existing answer if available
    if (activeQuestion) {
      setNewAnswer({
        response: activeQuestion.response || "",
        policy: activeQuestion.policy || "",
        document_reference: activeQuestion.document_reference || "",
        comments: activeQuestion.comments || "",
        files: [], // Initialize empty files array
        doc_to_delete: [], // Initialize empty doc_to_delete array
      });
    }
  };

  // Handle input changes for answer form
  const handleAnswerInputChange = (e) => {
    const { name, value } = e.target;
    setNewAnswer((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Reset answer form and states
  const resetAnswerForm = () => {
    setIsAddingAnswer(false);
    setNewAnswer({
      response: "",
      policy: "",
      document_reference: "",
      comments: "",
      files: [],
      doc_to_delete: [],
    });
  };

  // Add function to handle file selection
  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setNewAnswer((prev) => ({
      ...prev,
      files: [...prev.files, ...selectedFiles],
    }));
  };

  // Add function to remove selected file
  const handleRemoveFile = (index) => {
    setNewAnswer((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }));
  };

  // Add function to mark existing file for deletion
  const handleMarkFileForDeletion = (fileId) => {
    setNewAnswer((prev) => ({
      ...prev,
      doc_to_delete: [...prev.doc_to_delete, fileId],
    }));
  };

  // Add function to unmark file for deletion
  const handleUnmarkFileDeletion = (fileId) => {
    setNewAnswer((prev) => ({
      ...prev,
      doc_to_delete: prev.doc_to_delete.filter((id) => id !== fileId),
    }));
  };

  // Add function to send answer for review
  const handleSendForReview = async () => {
    setIsSubmitting(true);
    try {
      const response = await apiRequest(
        "POST",
        `/api/new-questionnaire/project/question/${activeQuestion.id}/status/`,
        { status: "Needs Review" },
        true
      );

      if (response.status === 200) {
        message.success("Answer sent for review successfully");

        // Update active question
        if (activeQuestion.id === response.data.id) {
          setActiveQuestion(response.data);
        }
        // update the question in the list
        setQuestions((prev) => {
          return prev.map((question) => {
            if (question.id === response.data.id) {
              return response.data;
            }
            return question;
          });
        });
      } else {
        throw new Error(`Failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error sending answer for review:", error);
      message.error(
        `Failed to send for review: ${error.message || "Unknown error"}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit answer
  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("response", newAnswer.response);
      formData.append("policy", newAnswer.policy || "");
      formData.append("document_reference", newAnswer.document_reference || "");
      formData.append("comments", newAnswer.comments || "");

      // Append files
      newAnswer.files.forEach((file) => {
        formData.append("files", file);
      });

      // Fix doc_to_delete format to be a list of IDs
      if (newAnswer.doc_to_delete.length > 0) {
        // Convert array to string and append as a single value
        formData.append("doc_to_delete", newAnswer.doc_to_delete.join(","));
      }

      const response = await apiRequest(
        "PATCH", // Use PATCH instead of PUT
        `/api/new-questionnaire/project/question/${activeQuestion.id}/answer/`,
        formData,
        true
      );

      if (response.status === 200 || response.status === 201) {
        message.success("Answer submitted successfully");

        // Update active question
        if (activeQuestion.id === response.data.id) {
          setActiveQuestion(response.data);
        }
        // update the question in the list
        setQuestions((prev) => {
          return prev.map((question) => {
            if (question.id === response.data.id) {
              return response.data;
            }
            return question;
          });
        });

        resetAnswerForm();
      } else {
        throw new Error(`Failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
      message.error(
        `Failed to submit answer: ${error.message || "Unknown error"}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Accept Answer
  const handleAcceptAnswer = async () => {
    if (!activeQuestion) return;
    setIsReviewSubmitting(true);

    try {
      const response = await apiRequest(
        "POST",
        `/api/new-questionnaire/project/question/${activeQuestion.id}/status/`,
        { status: "Accepted" },
        true
      );

      if (response.status === 200) {
        message.success("Answer accepted successfully");

        // Update active question
        if (activeQuestion.id === response.data.id) {
          setActiveQuestion(response.data);
        }
        // update the question in the list
        setQuestions((prev) => {
          return prev.map((question) => {
            if (question.id === response.data.id) {
              return response.data;
            }
            return question;
          });
        });
      } else {
        throw new Error(`Failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error accepting answer:", error);
      message.error(
        `Failed to accept answer: ${error.message || "Unknown error"}`
      );
    } finally {
      setIsReviewSubmitting(false);
    }
  };

  // Handle Request More Info
  const handleSubmitFeedback = async () => {
    if (!activeQuestion || !feedbackComment.trim()) {
      message.warning("Feedback comment cannot be empty");
      return;
    }

    setIsReviewSubmitting(true);
    try {
      const response = await apiRequest(
        "POST",
        `/api/new-questionnaire/project/question/${activeQuestion.id}/status/`,
        {
          status: "Needs More Information",
          description: feedbackComment,
        },
        true
      );

      if (response.status === 200 || response.status === 201) {
        message.success("Feedback submitted successfully");

        // Update active question
        if (activeQuestion.id === response.data.id) {
          setActiveQuestion(response.data);
        }
        // update the question in the list
        setQuestions((prev) => {
          return prev.map((question) => {
            if (question.id === response.data.id) {
              return response.data;
            }
            return question;
          });
        });
        setIsAddingFeedback(false);
        setFeedbackComment("");
      } else {
        throw new Error(`Failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      message.error(
        `Failed to submit feedback: ${error.message || "Unknown error"}`
      );
    } finally {
      setIsReviewSubmitting(false);
    }
  };

  // Open delete confirmation for assignment
  const confirmDeleteAssignment = (question) => {
    setAssignmentToDelete(question);
    setShowDeleteConfirmation(true);
  };

  // Close delete confirmation for assignment
  const cancelDeleteAssignment = () => {
    setShowDeleteConfirmation(false);
    setAssignmentToDelete(null);
  };

  // Open delete confirmation for reviewer assignment
  const confirmDeleteReviewerAssignment = (question) => {
    setReviewerToDelete(question);
    setShowDeleteConfirmationReviewer(true);
  };

  // Close delete confirmation for reviewer assignment
  const cancelDeleteReviewerAssignment = () => {
    setShowDeleteConfirmationReviewer(false);
    setReviewerToDelete(null);
  };

  // Function to open the assignment modal
  const openAssignmentModal = async () => {
    setIsAssignmentModalOpen(true);
    fetchUnassignedQuestions();
    fetchAllCompanyReps();
  };

  // Function to fetch unassigned questions
  const fetchUnassignedQuestions = async () => {
    setIsLoadingUnassignedQuestions(true);
    try {
      const endpoint = `/api/new-questionnaire/project/${projectid}/questions/?assigned_to_answer=false`;
      const response = await apiRequest("GET", endpoint, null, true);

      if (response.status === 200) {
        setUnassignedQuestions(response.data);
      } else {
        throw new Error(`Failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error("Failed to fetch unassigned questions:", error);
      message.error("Failed to fetch unassigned questions.");
      setUnassignedQuestions([]);
    } finally {
      setIsLoadingUnassignedQuestions(false);
    }
  };

  // Function to fetch all company representatives for bulk assignment
  const fetchAllCompanyReps = async () => {
    try {
      const response = await apiRequest(
        "GET",
        `/api/auth/projects/${projectid}/representatives/`,
        null,
        true
      );

      if (response.status === 200) {
        setBulkAssignmentReps(response.data);
      } else {
        throw new Error(`Failed with status ${response.status}`);
      }
    } catch (error) {
      console.error("Error fetching company representatives:", error);
      message.error("Failed to fetch company representatives.");
      setBulkAssignmentReps([]);
    }
  };

  // Bulk assign questions
  const handleBulkAssign = async () => {
    if (bulkAssignmentMethod === "specific") {
      if (!selectedRepresentative) {
        message.warning("Please select a representative");
        return;
      }
      if (selectedQuestions.length === 0) {
        message.warning("Please select at least one question");
        return;
      }

      // Assign selected questions to specific representative
      await bulkAssignSpecific(selectedQuestions, selectedRepresentative.id);
    } else {
      // Auto-assign (random or sequential)
      if (bulkAssignmentReps.length === 0) {
        message.warning("No representatives available for assignment");
        return;
      }

      await bulkAssignAuto(bulkAssignmentMethod);
    }
  };

  // Bulk assign specific questions to a representative
  const bulkAssignSpecific = async (questionIds, userId) => {
    setIsBulkAssigning(true);
    try {
      const response = await apiRequest(
        "POST",
        `/api/new-questionnaire/project/${projectid}/assign-bulk/`,
        {
          question_ids: questionIds,
          assign_to: userId,
        },
        true
      );

      if (response.status === 200 || response.status === 201) {
        const successCount = response.data.results.filter(
          (r) => r.status === "success"
        ).length;
        message.success(`Successfully assigned ${successCount} question(s)`);

        // Check if there were any errors
        const errors = response.data.results.filter(
          (r) => r.status === "error"
        );
        if (errors.length > 0) {
          console.warn("Some questions couldn't be assigned:", errors);
          message.warning(`${errors.length} question(s) could not be assigned`);
        }

        // Close the modal and refresh
        setIsAssignmentModalOpen(false);
        handleGetQuestions();
        setSelectedQuestions([]);
      } else {
        throw new Error(`Failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error bulk assigning questions:", error);
      message.error(
        `Failed to assign questions: ${error.message || "Unknown error"}`
      );
    } finally {
      setIsBulkAssigning(false);
    }
  };

  // Bulk auto-assign questions
  const bulkAssignAuto = async (method) => {
    setIsBulkAssigning(true);
    try {
      const response = await apiRequest(
        "POST",
        `/api/new-questionnaire/project/${projectid}/assign-bulk/`,
        {
          auto_assign: true,
          company_rep_ids: bulkAssignmentReps.map((rep) => rep.id),
          method: method, // "random" or "sequential"
        },
        true
      );

      if (response.status === 200 || response.status === 201) {
        message.success(
          response.data.message || "Questions assigned successfully"
        );

        // Close the modal and refresh
        setIsAssignmentModalOpen(false);
        handleGetQuestions();
      } else {
        throw new Error(`Failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error auto-assigning questions:", error);
      message.error(
        `Failed to auto-assign questions: ${error.message || "Unknown error"}`
      );
    } finally {
      setIsBulkAssigning(false);
    }
  };

  // Add a utility function to get filename from document URL
  const getFileNameFromUrl = (url) => {
    if (!url) return "Unknown";
    try {
      // Extract filename from S3 URL
      const urlParts = url.split("/");
      return decodeURIComponent(urlParts[urlParts.length - 1]);
    } catch (e) {
      return "Unknown File";
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden shadow-xl rounded-lg">
        {/* Left Panel: Questions List */}
        <div
          className={`flex flex-col ${
            activeQuestion ? "w-3/4" : "w-full"
          } bg-white border-r border-slate-200 transition-width duration-300 ease-in-out`}
        >
          {/* Top Bar: Header and Actions */}
          <div className="flex items-center border-b border-slate-200 p-4 bg-white sticky top-0 z-10">
            {/* Header */}
            <h2 className="text-lg font-semibold text-slate-700">Questions</h2>

            {/* Search, Filter, and Actions */}
            <div className="flex ml-auto gap-2">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all w-64 placeholder-slate-400"
                />
              </div>

              {/* Filter Button */}
              <div className="relative">
                <button
                  className={`px-4 py-2.5 border ${
                    filterDropdownOpen
                      ? "border-indigo-300 ring-2 ring-indigo-300"
                      : "border-slate-200"
                  } rounded-lg flex items-center text-slate-700 hover:bg-slate-50 transition-colors focus:outline-none shadow-sm`}
                  onClick={toggleFilterDropdown}
                >
                  <Filter
                    size={16}
                    className={`mr-2 ${
                      Object.values(filters).some((f) => f !== "") ||
                      searchQuery
                        ? "text-indigo-500"
                        : "text-slate-400"
                    }`}
                  />
                  <span>Filter</span>
                  {(filters.type ||
                    filters.standard ||
                    filters.status ||
                    searchQuery) && (
                    <span className="ml-2 bg-indigo-100 text-indigo-600 text-xs font-medium px-2 py-0.5 rounded-full">
                      {
                        [
                          filters.type && "Type",
                          filters.standard && "Standard",
                          filters.status && "Status",
                          searchQuery && "Search",
                        ].filter(Boolean).length
                      }{" "}
                      Active
                    </span>
                  )}
                </button>

                {/* Filter Dropdown Content */}
                {filterDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-lg shadow-xl z-20 max-h-[calc(100vh-120px)] flex flex-col">
                    {/* Header */}
                    <div className="p-3 border-b border-slate-200 bg-slate-50 font-medium text-slate-700 flex justify-between items-center sticky top-0 z-10">
                      <span>Filter Options</span>
                      {(filters.type ||
                        filters.standard ||
                        filters.status ||
                        searchQuery) && (
                        <span className="text-xs text-indigo-600">
                          {/* Display count if needed */}
                        </span>
                      )}
                    </div>

                    {/* Scrollable Filters */}
                    <div className="overflow-y-auto">
                      {/* Type Filter */}
                      <div className="p-3 border-b border-slate-200">
                        <h4 className="text-sm font-medium text-slate-700 mb-2 flex justify-between">
                          <span>Question Type</span>
                          {filters.type && (
                            <button
                              onClick={() => handleFilterChange("type", "")}
                              className="text-xs text-slate-500 hover:text-slate-700"
                            >
                              Clear
                            </button>
                          )}
                        </h4>
                        <div className="space-y-1">
                          {typeChoices.map((type) => (
                            <button
                              key={type}
                              onClick={() => handleFilterChange("type", type)}
                              className={`w-full text-left px-2 py-1.5 rounded text-sm ${
                                filters.type === type
                                  ? "bg-indigo-50 text-indigo-700 font-medium"
                                  : "text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Status Filter */}
                      <div className="p-3 border-b border-slate-200">
                        <h4 className="text-sm font-medium text-slate-700 mb-2 flex justify-between">
                          <span>Status</span>
                          {filters.status && (
                            <button
                              onClick={() => handleFilterChange("status", "")}
                              className="text-xs text-slate-500 hover:text-slate-700"
                            >
                              Clear
                            </button>
                          )}
                        </h4>
                        <div className="space-y-1">
                          {statusChoices.map((status) => (
                            <button
                              key={status}
                              onClick={() =>
                                handleFilterChange("status", status)
                              }
                              className={`w-full text-left px-2 py-1.5 rounded text-sm ${
                                filters.status === status
                                  ? "bg-indigo-50 text-indigo-700 font-medium"
                                  : "text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Standard Filter - Simplified for now */}
                      <div className="p-3 border-b border-slate-200">
                        <h4 className="text-sm font-medium text-slate-700 mb-2 flex justify-between">
                          <span>Standard</span>
                          {filters.standard && (
                            <button
                              onClick={() => handleFilterChange("standard", "")}
                              className="text-xs text-slate-500 hover:text-slate-700"
                            >
                              Clear
                            </button>
                          )}
                        </h4>
                        <div className="space-y-1">
                          <button
                            onClick={() =>
                              handleFilterChange("standard", "ISO27001")
                            }
                            className={`w-full text-left px-2 py-1.5 rounded text-sm ${
                              filters.standard === "ISO27001"
                                ? "bg-indigo-50 text-indigo-700 font-medium"
                                : "text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            ISO27001
                          </button>
                        </div>
                      </div>

                      {/* Active Filters Summary */}
                      {(filters.type ||
                        filters.standard ||
                        filters.status ||
                        searchQuery) && (
                        <div className="px-3 py-2 bg-slate-50 border-b border-slate-200">
                          <h4 className="text-xs font-medium text-slate-600 mb-1">
                            Active Filters:
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {filters.type && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs">
                                Type: {filters.type}
                                <button
                                  onClick={() => handleFilterChange("type", "")}
                                  className="ml-1 hover:text-indigo-900"
                                >
                                  <X size={12} />
                                </button>
                              </span>
                            )}
                            {filters.standard && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs">
                                Standard: {filters.standard}
                                <button
                                  onClick={() =>
                                    handleFilterChange("standard", "")
                                  }
                                  className="ml-1 hover:text-indigo-900"
                                >
                                  <X size={12} />
                                </button>
                              </span>
                            )}
                            {filters.status && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs">
                                Status: {filters.status}
                                <button
                                  onClick={() =>
                                    handleFilterChange("status", "")
                                  }
                                  className="ml-1 hover:text-indigo-900"
                                >
                                  <X size={12} />
                                </button>
                              </span>
                            )}
                            {searchQuery && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs">
                                Search: {searchQuery}
                                <button
                                  onClick={() => setSearchQuery("")}
                                  className="ml-1 hover:text-indigo-900"
                                >
                                  <X size={12} />
                                </button>
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex p-3 border-t border-slate-200 bg-slate-50 gap-2 sticky bottom-0 z-10">
                      <button
                        onClick={clearFilters}
                        className="flex-1 py-2 text-center bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                      >
                        Clear All
                      </button>
                      <button
                        onClick={() => setFilterDropdownOpen(false)}
                        className="flex-1 py-2 text-center bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Assignment Button (for company role) */}
              {projectRole === "company" && (
                <button
                  className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg flex items-center hover:bg-indigo-700 transition-colors shadow-sm hover:shadow-md"
                  onClick={openAssignmentModal}
                >
                  <UserPlus size={16} className="mr-1.5" />
                  <span>Assign Questions</span>
                </button>
              )}
            </div>
          </div>

          {/* Questions Table */}
          <div className="flex-1 overflow-auto">
            {isQuestionsLoading ? (
              <div className="flex flex-col items-center justify-center h-64">
                <Spin
                  indicator={<LoadingOutlined style={{ fontSize: 40 }} spin />}
                  tip="Loading questions..."
                  className="text-center"
                />
              </div>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="w-32 p-4 text-left font-semibold text-slate-600">
                      Reference
                    </th>
                    <th className="p-4 text-left font-semibold text-slate-600">
                      Question
                    </th>
                    <th className="w-44 p-4 text-left font-semibold text-slate-600">
                      Type
                    </th>
                    <th className="w-44 p-4 text-left font-semibold text-slate-600">
                      Status
                    </th>
                    <th className="w-44 p-4 text-left font-semibold text-slate-600">
                      Response
                    </th>
                    <th className="w-44 p-4 text-left font-semibold text-slate-600">
                      Assigned To
                    </th>
                    {projectRole === "consultant admin" && (
                      <th className="w-44 p-4 text-left font-semibold text-slate-600">
                        Reviewer
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {questions.length > 0 ? (
                    questions.map((question) => (
                      <tr
                        key={question.id}
                        className={`hover:bg-indigo-50/50 cursor-pointer transition-colors ${
                          activeQuestion?.id === question.id
                            ? "bg-indigo-50/70"
                            : ""
                        }`}
                        onClick={() => selectQuestion(question)}
                      >
                        <td className="p-4">
                          <span className="text-indigo-600 font-semibold">
                            {question.reference}
                          </span>
                        </td>
                        <td className="p-4 text-slate-700">
                          <div
                            className="line-clamp-2"
                            title={question.question}
                          >
                            {question.question}
                          </div>
                        </td>
                        <td className="p-4 text-slate-600">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                            {question.type_display || question.type}
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              question.status === "Accepted"
                                ? "bg-emerald-100 text-emerald-700"
                                : question.status === "Needs More Information"
                                ? "bg-yellow-100 text-yellow-700"
                                : question.status === "Needs Review"
                                ? "bg-blue-100 text-blue-700"
                                : question.status === "Answered"
                                ? "bg-indigo-100 text-indigo-700"
                                : "bg-slate-100 text-slate-700" // Not Answered
                            }`}
                          >
                            {question.status}
                          </span>
                        </td>
                        <td className="p-4 ">
                          {question.response ? question.response : "-"}
                        </td>
                        <td className="p-4 text-slate-600">
                          {question.assigned_to_answer_details ? (
                            <div className="flex items-center">
                              <div className="h-6 w-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 mr-2">
                                <User size={12} />
                              </div>
                              <span className="text-sm truncate max-w-[120px]">
                                {question.assigned_to_answer_details.name}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center relative">
                              <span className="text-xs text-slate-500 mr-2">
                                Not assigned
                              </span>
                              {projectRole === "company" &&
                                question.status !== "Accepted" &&
                                !question.assigned_to_answer_details && (
                                  <button
                                    className="px-2 py-1 text-xs bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100 transition-colors"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveQuestion(question);
                                      toggleAssignDropdown();
                                    }}
                                  >
                                    Assign
                                  </button>
                                )}
                            </div>
                          )}
                        </td>
                        {projectRole === "consultant admin" && (
                          <td className="p-4 text-slate-600">
                            {question.assigned_for_answer_review_details ? (
                              <div className="flex items-center">
                                <div className="h-6 w-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mr-2">
                                  <User size={12} />
                                </div>
                                <span className="text-sm truncate max-w-[120px]">
                                  {
                                    question.assigned_for_answer_review_details
                                      .name
                                  }
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <span className="text-xs text-slate-500 mr-2">
                                  Not assigned
                                </span>
                                {question.status === "Needs Review" && (
                                  <button
                                    className="px-2 py-1 text-xs bg-purple-50 text-purple-600 rounded hover:bg-purple-100 transition-colors"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveQuestion(question);
                                      toggleAssignReviewerDropdown();
                                    }}
                                  >
                                    Assign
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center p-10 text-slate-500"
                      >
                        No questions found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Panel: Question/Answer Details (Conditional) */}
        {activeQuestion && (
          <div className="w-1/4 bg-white border-l border-slate-200 flex flex-col transition-transform duration-300 ease-in-out">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white sticky top-0 z-30 shadow-md">
              <div>
                <h3 className="text-sm font-semibold">
                  {activeQuestion.reference} - {activeQuestion.standard}
                </h3>
              </div>
              <div className="flex gap-1">
                <button
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                  onClick={() => {
                    setActiveQuestion(null);
                    setActiveSidebarTab("question");
                    setIsAddingAnswer(false);
                    setIsAddingFeedback(false);
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200 bg-white sticky top-[60px] z-20">
              <div className="flex px-2 pt-2">
                <button
                  className={`flex-1 py-2 px-1 text-center text-sm border-b-2 transition-colors ${
                    activeSidebarTab === "question"
                      ? "border-indigo-600 text-indigo-600 font-semibold"
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                  }`}
                  onClick={() => setActiveSidebarTab("question")}
                >
                  Question Details
                </button>
                <button
                  className={`flex-1 py-2 px-1 text-center text-sm border-b-2 transition-colors ${
                    activeSidebarTab === "answer"
                      ? "border-indigo-600 text-indigo-600 font-semibold"
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                  }`}
                  onClick={() => setActiveSidebarTab("answer")}
                >
                  Answer & Review
                </button>
              </div>
            </div>

            {/* Tab Content Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {/* Question Tab */}
              {activeSidebarTab === "question" && (
                <>
                  {/* Question Header Information */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-slate-800 text-base">
                          {activeQuestion.type_display || activeQuestion.type}
                        </h4>
                      </div>

                      {/* Question Text */}
                      <div className="mt-3 text-sm text-slate-600 leading-relaxed">
                        <p>{activeQuestion.question}</p>
                      </div>

                      {/* Standard & Type Tags */}
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                          {activeQuestion.standard}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-medium">
                          {activeQuestion.type_display || activeQuestion.type}
                        </span>
                      </div>

                      {/* Status & Date */}
                      <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
                        <div className="flex items-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              activeQuestion.status === "Accepted"
                                ? "bg-emerald-100 text-emerald-700"
                                : activeQuestion.status ===
                                  "Needs More Information"
                                ? "bg-yellow-100 text-yellow-700"
                                : activeQuestion.status === "Needs Review"
                                ? "bg-blue-100 text-blue-700"
                                : activeQuestion.status === "Answered"
                                ? "bg-indigo-100 text-indigo-700"
                                : "bg-slate-100 text-slate-700" // Not Answered
                            }`}
                          >
                            {activeQuestion.status}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <CalendarIcon
                            size={12}
                            className="mr-1.5 text-slate-400"
                          />
                          <span>
                            Updated: {formatDate(activeQuestion.updated_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Assignment Information */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between">
                      <h5 className="text-sm font-medium text-slate-700 flex items-center">
                        <Users size={15} className="mr-2 text-indigo-500" />{" "}
                        Assigned Representative
                      </h5>

                      {/* Assign Button (Conditional for Company) */}
                      {projectRole === "company" &&
                        activeQuestion.status !== "Accepted" &&
                        !activeQuestion.assigned_to_answer && (
                          <div className="relative" ref={assignDropdownRef}>
                            <button
                              className="p-1.5 text-slate-500 hover:text-indigo-600 transition-colors hover:bg-slate-100 rounded-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleAssignDropdown();
                              }}
                              title="Assign Representative"
                            >
                              <UserPlus size={16} />
                            </button>

                            {/* Assign Dropdown */}
                            {isAssignDropdownOpen && (
                              <div className="absolute right-0 mt-1 w-64 bg-white border border-slate-200 rounded-lg shadow-xl z-30">
                                <div className="p-2 border-b border-slate-200 bg-slate-50 font-medium text-slate-700 text-sm">
                                  Assign Representative
                                </div>
                                {companyRepresentatives.length === 0 ? (
                                  <div className="p-3 text-center text-slate-500 h-64 overflow-y-scroll text-sm">
                                    {isAssigning
                                      ? "Loading..."
                                      : "No representatives found"}
                                  </div>
                                ) : (
                                  <div className="p-1">
                                    {companyRepresentatives.map((rep) => (
                                      <button
                                        key={rep.id}
                                        className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between rounded-md hover:bg-slate-50 ${
                                          selectedRepresentative?.id === rep.id
                                            ? "bg-indigo-50 text-indigo-700"
                                            : "text-slate-700"
                                        }`}
                                        onClick={() =>
                                          setSelectedRepresentative(rep)
                                        }
                                      >
                                        <div>
                                          <div className="font-medium">
                                            {rep.name}
                                          </div>
                                          <div className="text-xs text-slate-500">
                                            {rep.email}
                                          </div>
                                        </div>
                                        {selectedRepresentative?.id ===
                                          rep.id && (
                                          <CheckCircle
                                            size={16}
                                            className="text-indigo-600"
                                          />
                                        )}
                                      </button>
                                    ))}

                                    {/* Assign Actions */}
                                    <div className="p-2 border-t border-slate-200 mt-1 flex justify-end gap-2">
                                      <button
                                        className="px-3 py-1.5 text-xs bg-white border border-slate-200 text-slate-600 rounded-md hover:bg-slate-50"
                                        onClick={() =>
                                          setIsAssignDropdownOpen(false)
                                        }
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        className="px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={
                                          !selectedRepresentative || isAssigning
                                        }
                                        onClick={() =>
                                          assignRepresentativeToQuestion(
                                            activeQuestion.id,
                                            selectedRepresentative.id
                                          )
                                        }
                                      >
                                        {isAssigning
                                          ? "Assigning..."
                                          : "Assign"}
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                    </div>

                    <div className="p-4">
                      {activeQuestion.assigned_to_answer_details ? (
                        <div className="bg-blue-50 rounded-lg p-3 relative group hover:shadow-md transition-shadow">
                          {/* Delete button - show for company role only */}
                          {projectRole === "company" &&
                            activeQuestion.status !== "Accepted" && (
                              <button
                                className="absolute top-2 right-2 p-1.5 bg-white text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 shadow-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  confirmDeleteAssignment(activeQuestion);
                                }}
                                title="Remove assignment"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}

                          <div className="flex items-start">
                            <div className="h-9 w-9 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <User size={18} />
                            </div>
                            <div className="ml-3 flex-1 min-w-0">
                              <div className="text-sm font-medium text-blue-800">
                                {activeQuestion.assigned_to_answer_details.name}
                              </div>
                              <div className="text-xs text-blue-600 truncate">
                                {
                                  activeQuestion.assigned_to_answer_details
                                    .email
                                }
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="py-8 flex flex-col items-center justify-center text-center">
                          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
                            <Users size={20} />
                          </div>
                          <p className="text-slate-600 mb-1 font-medium">
                            No representative assigned
                          </p>
                          <p className="text-xs text-slate-500">
                            {projectRole === "company"
                              ? "Use the assign button to add a company representative"
                              : "Waiting for assignment by company admin"}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Reviewer Information (if status requires review) */}
                  {(activeQuestion.status === "Needs Review" ||
                    activeQuestion.assigned_for_answer_review_details) && (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between">
                        <h5 className="text-sm font-medium text-slate-700 flex items-center">
                          <CheckCircle
                            size={15}
                            className="mr-2 text-indigo-500"
                          />{" "}
                          Assigned Reviewer
                        </h5>

                        {/* Assign Reviewer Button (For admin only) */}
                        {projectRole === "consultant admin" &&
                          activeQuestion.status !== "Accepted" &&
                          !activeQuestion.assigned_for_answer_review && (
                            <div
                              className="relative"
                              ref={assignReviewerDropdownRef}
                            >
                              <button
                                className="p-1.5 text-slate-500 hover:text-indigo-600 transition-colors hover:bg-slate-100 rounded-full"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleAssignReviewerDropdown();
                                }}
                                title="Assign Reviewer"
                              >
                                <UserPlus size={16} />
                              </button>

                              {/* Assign Reviewer Dropdown */}
                              {isAssignReviewerDropdownOpen && (
                                <div className="absolute right-0 mt-1 w-64 bg-white border border-slate-200 rounded-lg shadow-xl z-30 max-h-[300px] overflow-y-auto">
                                  <div className="p-2 border-b border-slate-200 bg-slate-50 font-medium text-slate-700 text-sm">
                                    Assign Reviewer
                                  </div>
                                  {members.length === 0 ? (
                                    <div className="p-3 text-center text-slate-500 text-sm">
                                      {isAssigning
                                        ? "Loading..."
                                        : "No members found"}
                                    </div>
                                  ) : (
                                    <div className="p-1">
                                      {members.map((member) => (
                                        <button
                                          key={member.id}
                                          className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between rounded-md hover:bg-slate-50 ${
                                            selectedReviewer?.id === member.id
                                              ? "bg-indigo-50 text-indigo-700"
                                              : "text-slate-700"
                                          }`}
                                          onClick={() =>
                                            setSelectedReviewer(member)
                                          }
                                        >
                                          <div>
                                            <div className="font-medium">
                                              {member.name}
                                            </div>
                                            <div className="text-xs text-slate-500">
                                              {member.email}
                                            </div>
                                          </div>
                                          {selectedReviewer?.id ===
                                            member.id && (
                                            <CheckCircle
                                              size={16}
                                              className="text-indigo-600"
                                            />
                                          )}
                                        </button>
                                      ))}

                                      {/* Assign Actions */}
                                      <div className="p-2 border-t border-slate-200 mt-1 flex justify-end gap-2">
                                        <button
                                          className="px-3 py-1.5 text-xs bg-white border border-slate-200 text-slate-600 rounded-md hover:bg-slate-50"
                                          onClick={() =>
                                            setIsAssignReviewerDropdownOpen(
                                              false
                                            )
                                          }
                                        >
                                          Cancel
                                        </button>
                                        <button
                                          className="px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                          disabled={
                                            !selectedReviewer || isAssigning
                                          }
                                          onClick={() =>
                                            assignReviewerToQuestion(
                                              activeQuestion.id,
                                              selectedReviewer.id
                                            )
                                          }
                                        >
                                          {isAssigning
                                            ? "Assigning..."
                                            : "Assign"}
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                      </div>

                      <div className="p-4">
                        {activeQuestion.assigned_for_answer_review_details ? (
                          <div className="bg-purple-50 rounded-lg p-3 relative group hover:shadow-md transition-shadow">
                            {/* Delete button - show for consultant admin only */}
                            {projectRole === "consultant admin" &&
                              activeQuestion.status !== "Accepted" && (
                                <button
                                  className="absolute top-2 right-2 p-1.5 bg-white text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 shadow-sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    confirmDeleteReviewerAssignment(
                                      activeQuestion
                                    );
                                  }}
                                  title="Remove reviewer"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}

                            <div className="flex items-start">
                              <div className="h-9 w-9 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <User size={18} />
                              </div>
                              <div className="ml-3 flex-1 min-w-0">
                                <div className="text-sm font-medium text-purple-800">
                                  {
                                    activeQuestion
                                      .assigned_for_answer_review_details.name
                                  }
                                </div>
                                <div className="text-xs text-purple-600 truncate">
                                  {
                                    activeQuestion
                                      .assigned_for_answer_review_details.email
                                  }
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="py-8 flex flex-col items-center justify-center text-center">
                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
                              <CheckCircle size={20} />
                            </div>
                            <p className="text-slate-600 mb-1 font-medium">
                              No reviewer assigned
                            </p>
                            <p className="text-xs text-slate-500">
                              {projectRole === "consultant admin"
                                ? "Use the assign button to add a reviewer"
                                : "Waiting for reviewer assignment"}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Answer Tab */}
              {activeSidebarTab === "answer" && (
                <>
                  {/* Answer & Review Section */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* Header with Conditional Edit Button */}
                    <div className="flex justify-between items-start px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                      <h5 className="font-medium text-slate-700 flex items-center">
                        <FileText size={15} className="mr-2 text-green-500" />{" "}
                        Answer & Evidence
                      </h5>

                      {/* Edit Button (for company role) */}
                      {activeQuestion.status !== "Accepted" &&
                        canUserAnswer &&
                        !isAddingAnswer && (
                          <button
                            onClick={handleEditAnswer}
                            className="ml-auto p-1.5 text-slate-500 hover:text-indigo-600 transition-colors hover:bg-slate-100 rounded-full"
                            title="Edit Answer"
                          >
                            <Edit size={16} />
                          </button>
                        )}
                    </div>

                    {/* Content Area */}
                    <div className="p-4">
                      {/* Display "Needs More Info" feedback if present */}
                      {activeQuestion.status === "Needs More Information" &&
                        activeQuestion.needs_more_info && (
                          <div className="mb-4 p-3 border border-yellow-300 bg-yellow-50 rounded-lg">
                            <h6 className="text-sm font-medium text-yellow-800 mb-2 flex items-center">
                              <AlertCircle size={14} className="mr-1.5" />{" "}
                              Feedback:
                            </h6>
                            <p className="text-sm text-yellow-700 italic mb-2">
                              {activeQuestion.needs_more_info.description}
                            </p>
                            {activeQuestion.needs_more_info
                              .created_by_details && (
                              <div className="text-xs text-yellow-600 flex items-center justify-end">
                                <span>
                                  by{" "}
                                  {
                                    activeQuestion.needs_more_info
                                      .created_by_details.name
                                  }{" "}
                                  on{" "}
                                  {formatDate(
                                    activeQuestion.needs_more_info.created_at
                                  )}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                      {/* Status Indicator */}
                      <p className="text-sm font-medium text-slate-600 mb-4 pb-3 border-b border-slate-100">
                        Status:{" "}
                        <span
                          className={`inline-flex items-center ml-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${
                            activeQuestion.status === "Accepted"
                              ? "bg-emerald-100 text-emerald-700"
                              : activeQuestion.status ===
                                "Needs More Information"
                              ? "bg-yellow-100 text-yellow-700"
                              : activeQuestion.status === "Needs Review"
                              ? "bg-blue-100 text-blue-700"
                              : activeQuestion.status === "Answered"
                              ? "bg-indigo-100 text-indigo-700"
                              : "bg-slate-100 text-slate-700" // Not Answered
                          }`}
                        >
                          {activeQuestion.status === "Accepted" && (
                            <CheckCircle size={12} className="mr-1" />
                          )}
                          {activeQuestion.status ===
                            "Needs More Information" && (
                            <AlertCircle size={12} className="mr-1" />
                          )}
                          {activeQuestion.status}
                        </span>
                      </p>

                      {/* Display Existing Answer (Read Only Mode) */}
                      {(activeQuestion.response || activeQuestion.comments) &&
                      !isAddingAnswer ? (
                        <>
                          {/* Response Choice */}
                          <div className="mb-4">
                            <h6 className="text-sm font-medium text-slate-700 mb-2">
                              Response:
                            </h6>
                            <div className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">
                              {activeQuestion.response_display ||
                                activeQuestion.response ||
                                "No response provided"}
                            </div>
                          </div>

                          {/* Policy Info */}
                          {activeQuestion.policy && (
                            <div className="mb-4">
                              <h6 className="text-sm font-medium text-slate-700 mb-2">
                                Policy:
                              </h6>
                              <div className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">
                                {activeQuestion.policy}
                              </div>
                            </div>
                          )}

                          {/* Document Info */}
                          {activeQuestion.document && (
                            <div className="mb-4">
                              <h6 className="text-sm font-medium text-slate-700 mb-2">
                                Document:
                              </h6>
                              <div className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">
                                {activeQuestion.document}
                              </div>
                            </div>
                          )}

                          {/* Document Reference */}
                          {activeQuestion.document_reference && (
                            <div className="mb-4">
                              <h6 className="text-sm font-medium text-slate-700 mb-2">
                                Document Reference:
                              </h6>
                              <div className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">
                                {activeQuestion.document_reference}
                              </div>
                            </div>
                          )}

                          {/* Documents */}
                          {activeQuestion.documents &&
                            activeQuestion.documents.length > 0 && (
                              <div className="mb-4">
                                <h6 className="text-sm font-medium text-slate-700 mb-2">
                                  Documents:
                                </h6>
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                  {activeQuestion.documents.map((doc) => (
                                    <div
                                      key={doc.id}
                                      className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
                                    >
                                      <div className="flex items-center max-w-[70%]">
                                        <div className="bg-indigo-100 p-1.5 rounded flex-shrink-0 mr-2">
                                          <FileText className="text-indigo-500 h-4 w-4" />
                                        </div>
                                        <div className="overflow-hidden">
                                          <p
                                            className="text-sm font-medium text-slate-700 truncate"
                                            title={getFileNameFromUrl(doc.file)}
                                          >
                                            {getFileNameFromUrl(doc.file)}
                                          </p>
                                          <p className="text-xs text-slate-500">
                                            {formatDate(doc.uploaded_at)}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <a
                                          href={doc.file}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium bg-indigo-50 px-2.5 py-1 rounded-full hover:bg-indigo-100 transition-colors"
                                        >
                                          View
                                        </a>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                          {/* Comments */}
                          {activeQuestion.comments && (
                            <div className="mb-4">
                              <h6 className="text-sm font-medium text-slate-700 mb-2 flex items-center">
                                <MessageSquare
                                  size={12}
                                  className="mr-1.5 text-indigo-400"
                                />
                                Comments:
                              </h6>
                              <p className="text-sm text-slate-600 italic bg-indigo-50 p-3 rounded-lg">
                                {activeQuestion.comments}
                              </p>
                            </div>
                          )}

                          {/* Add "Send for Review" button here */}
                          {(activeQuestion.status === "Answered" ||
                            activeQuestion.status ===
                              "Needs More Information") &&
                            (projectRole === "company" ||
                              (projectRole === "company_representative" &&
                                activeQuestion.assigned_to_answer ===
                                  user?.id)) && (
                              <button
                                type="button"
                                onClick={handleSendForReview}
                                disabled={isSubmitting}
                                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center w-full"
                              >
                                {isSubmitting ? (
                                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                                ) : null}
                                Send for Review
                              </button>
                            )}
                        </>
                      ) : !isAddingAnswer ? (
                        /* No Answer Yet Message */
                        <div className="py-8 flex flex-col items-center justify-center text-center">
                          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mb-3">
                            <X className="h-6 w-6 text-amber-600" />
                          </div>
                          <p className="text-slate-700 mb-1 font-medium">
                            No answer has been provided yet
                          </p>
                          {canUserAnswer ? (
                            <button
                              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm flex items-center"
                              onClick={handleEditAnswer}
                            >
                              <Plus size={16} className="mr-1.5" />
                              Add Answer
                            </button>
                          ) : (
                            <p className="text-sm text-slate-500 italic">
                              {activeQuestion.assigned_to_answer
                                ? "Waiting for the assigned user to answer"
                                : "Waiting for assignment and answer"}
                            </p>
                          )}
                        </div>
                      ) : null}

                      {/* Add/Edit Answer Form */}
                      {isAddingAnswer && (
                        <form onSubmit={handleSubmitAnswer}>
                          <div className="space-y-4">
                            {/* Response Choice */}
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">
                                Response *
                              </label>
                              <select
                                name="response"
                                value={newAnswer.response}
                                onChange={handleAnswerInputChange}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all"
                                required
                              >
                                <option value="">Select a response</option>
                                {responseChoices.map((choice) => (
                                  <option key={choice} value={choice}>
                                    {choice}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Policy */}
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">
                                Policy
                              </label>
                              <input
                                type="text"
                                name="policy"
                                value={newAnswer.policy}
                                onChange={handleAnswerInputChange}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all"
                                placeholder="Enter policy information"
                              />
                            </div>

                            {/* Document Input - convert to file input */}
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">
                                Document
                              </label>
                              <input
                                type="file"
                                onChange={handleFileSelect}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all"
                                multiple
                              />

                              {/* Display selected files */}
                              {newAnswer.files.length > 0 && (
                                <div className="mt-2 space-y-2">
                                  <p className="text-xs font-medium text-slate-700">
                                    Selected files:
                                  </p>
                                  {newAnswer.files.map((file, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center justify-between bg-slate-50 p-2 rounded-lg"
                                    >
                                      <span className="text-sm truncate max-w-[80%]">
                                        {file.name}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveFile(index)}
                                        className="text-red-500 hover:text-red-700 transition-colors"
                                      >
                                        <X size={16} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Display existing files with delete option when editing */}
                              {activeQuestion &&
                                activeQuestion.documents &&
                                activeQuestion.documents.length > 0 && (
                                  <div className="mt-3 space-y-2">
                                    <p className="text-xs font-medium text-slate-700">
                                      Existing documents:
                                    </p>
                                    {activeQuestion.documents.map((doc) => {
                                      const markedForDeletion =
                                        newAnswer.doc_to_delete.includes(
                                          doc.id
                                        );
                                      return (
                                        <div
                                          key={doc.id}
                                          className={`flex items-center justify-between p-2 rounded-lg ${
                                            markedForDeletion
                                              ? "bg-red-50 line-through text-red-700"
                                              : "bg-slate-50"
                                          }`}
                                        >
                                          <span className="text-sm truncate max-w-[80%]">
                                            {getFileNameFromUrl(doc.file)}
                                          </span>
                                          {markedForDeletion ? (
                                            <button
                                              type="button"
                                              onClick={() =>
                                                handleUnmarkFileDeletion(doc.id)
                                              }
                                              className="text-indigo-500 hover:text-indigo-700 transition-colors"
                                            >
                                              <RotateCcw size={16} />
                                            </button>
                                          ) : (
                                            <button
                                              type="button"
                                              onClick={() =>
                                                handleMarkFileForDeletion(
                                                  doc.id
                                                )
                                              }
                                              className="text-red-500 hover:text-red-700 transition-colors"
                                            >
                                              <Trash2 size={16} />
                                            </button>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                            </div>

                            {/* Document Reference */}
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">
                                Document Reference
                              </label>
                              <input
                                type="text"
                                name="document_reference"
                                value={newAnswer.document_reference}
                                onChange={handleAnswerInputChange}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all"
                                placeholder="Enter document reference"
                              />
                            </div>

                            {/* Comments */}
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">
                                Comments
                              </label>
                              <textarea
                                name="comments"
                                value={newAnswer.comments}
                                onChange={handleAnswerInputChange}
                                rows="3"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all"
                                placeholder="Add any additional comments..."
                              ></textarea>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 justify-end mt-4">
                              <button
                                type="button"
                                className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors text-sm"
                                onClick={resetAnswerForm}
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm disabled:opacity-50"
                                disabled={isSubmitting}
                              >
                                {isSubmitting ? (
                                  <span className="flex items-center justify-center">
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                                    Processing...
                                  </span>
                                ) : (
                                  "Submit Answer"
                                )}
                              </button>
                            </div>
                          </div>
                        </form>
                      )}

                      {/* Review Actions Section */}
                      {activeQuestion.status === "Needs Review" &&
                        canUserReview &&
                        !isAddingAnswer && (
                          <div className="mt-6 pt-4 border-t border-dashed border-slate-200">
                            <h6 className="text-sm font-medium text-slate-700 mb-3">
                              Review Actions
                            </h6>
                            {!isAddingFeedback ? (
                              <div className="flex gap-3">
                                <button
                                  onClick={handleAcceptAnswer}
                                  disabled={isReviewSubmitting}
                                  className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
                                >
                                  {isReviewSubmitting && !isAddingFeedback && (
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                                  )}
                                  <ThumbsUp size={16} className="mr-1.5" />{" "}
                                  Accept
                                </button>
                                <button
                                  onClick={() => setIsAddingFeedback(true)}
                                  disabled={isReviewSubmitting}
                                  className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-yellow-300 rounded-md shadow-sm text-sm font-medium text-yellow-700 bg-yellow-50 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
                                >
                                  <MessageCircle size={16} className="mr-1.5" />{" "}
                                  Needs More Info
                                </button>
                              </div>
                            ) : (
                              // Feedback Input Form
                              <div className="space-y-3">
                                <label
                                  htmlFor="feedbackComment"
                                  className="block text-sm font-medium text-slate-700"
                                >
                                  Provide Feedback:
                                </label>
                                <textarea
                                  id="feedbackComment"
                                  rows="3"
                                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all"
                                  placeholder="Explain what needs to be changed or added..."
                                  value={feedbackComment}
                                  onChange={(e) =>
                                    setFeedbackComment(e.target.value)
                                  }
                                ></textarea>
                                <div className="flex justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setIsAddingFeedback(false);
                                      setFeedbackComment("");
                                    }}
                                    disabled={isReviewSubmitting}
                                    className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors text-sm"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleSubmitFeedback}
                                    disabled={
                                      isReviewSubmitting ||
                                      !feedbackComment.trim()
                                    }
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm text-sm disabled:opacity-50"
                                  >
                                    {isReviewSubmitting && (
                                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                                    )}
                                    Submit Feedback
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Delete Assignment Confirmation Modal */}
      {showDeleteConfirmation && assignmentToDelete && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 mx-4">
            <div className="flex items-center text-red-600 mb-4">
              <AlertCircle size={24} className="mr-3" />
              <h3 className="text-lg font-medium">Remove Assignment</h3>
            </div>
            <p className="text-slate-600 mb-2">
              Are you sure you want to remove this assignment?
            </p>
            <p className="text-sm text-slate-500 mb-5">
              <span className="font-medium">
                {assignmentToDelete.assigned_to_answer_details?.name}
              </span>{" "}
              will no longer be assigned to this question.
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                onClick={cancelDeleteAssignment}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center disabled:opacity-70"
                onClick={() => removeAssignment(assignmentToDelete.id)}
                disabled={isDeletingAssignment}
              >
                {isDeletingAssignment && (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                )}
                {isDeletingAssignment ? "Removing..." : "Remove Assignment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Reviewer Confirmation Modal */}
      {showDeleteConfirmationReviewer && reviewerToDelete && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 mx-4">
            <div className="flex items-center text-red-600 mb-4">
              <AlertCircle size={24} className="mr-3" />
              <h3 className="text-lg font-medium">Remove Reviewer</h3>
            </div>
            <p className="text-slate-600 mb-2">
              Are you sure you want to remove this reviewer?
            </p>
            <p className="text-sm text-slate-500 mb-5">
              <span className="font-medium">
                {reviewerToDelete.assigned_for_answer_review_details?.name}
              </span>{" "}
              will no longer be assigned to review this question.
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                onClick={cancelDeleteReviewerAssignment}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center disabled:opacity-70"
                onClick={() => removeReviewerAssignment(reviewerToDelete.id)}
                disabled={isDeletingReviewerAssignment}
              >
                {isDeletingReviewerAssignment && (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                )}
                {isDeletingReviewerAssignment
                  ? "Removing..."
                  : "Remove Reviewer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Assignment Modal */}
      {isAssignmentModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-white">
              <h2 className="text-lg font-semibold text-slate-800">
                Assign Questions
              </h2>
              <button
                className="p-1 hover:bg-slate-100 rounded-full transition-colors"
                onClick={() => setIsAssignmentModalOpen(false)}
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex flex-col flex-1 overflow-hidden">
              {/* Assignment Method Selector */}
              <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Assignment Method
                </label>
                <div className="flex gap-3">
                  <button
                    className={`px-3 py-2 rounded-lg text-sm font-medium ${
                      bulkAssignmentMethod === "specific"
                        ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                        : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                    }`}
                    onClick={() => setBulkAssignmentMethod("specific")}
                  >
                    <span>Specific Assignment</span>
                  </button>
                  <button
                    className={`px-3 py-2 rounded-lg text-sm font-medium ${
                      bulkAssignmentMethod === "random"
                        ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                        : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                    }`}
                    onClick={() => setBulkAssignmentMethod("random")}
                  >
                    <span>Random Assignment</span>
                  </button>
                  <button
                    className={`px-3 py-2 rounded-lg text-sm font-medium ${
                      bulkAssignmentMethod === "sequential"
                        ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                        : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                    }`}
                    onClick={() => setBulkAssignmentMethod("sequential")}
                  >
                    <span>Sequential Assignment</span>
                  </button>
                </div>
              </div>

              {/* Assignment Content */}
              <div className="flex-1 overflow-auto p-4">
                {bulkAssignmentMethod === "specific" ? (
                  <div className="flex flex-col h-full">
                    {/* Representative Selection */}
                    <div className="mb-4">
                      <label className="text-sm font-medium text-slate-700 mb-2 block">
                        Select Representative
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {bulkAssignmentReps.length > 0 ? (
                          bulkAssignmentReps.map((rep) => (
                            <div
                              key={rep.id}
                              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                                selectedRepresentative?.id === rep.id
                                  ? "bg-indigo-50 border-indigo-300"
                                  : "bg-white border-slate-200 hover:bg-slate-50"
                              }`}
                              onClick={() => setSelectedRepresentative(rep)}
                            >
                              <div className="flex items-center">
                                <div className="h-8 w-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                                  <User size={16} />
                                </div>
                                <div>
                                  <div className="font-medium text-slate-700">
                                    {rep.name}
                                  </div>
                                  <div className="text-xs text-slate-500 truncate">
                                    {rep.email}
                                  </div>
                                </div>
                                {selectedRepresentative?.id === rep.id && (
                                  <CheckCircle
                                    size={16}
                                    className="ml-auto text-indigo-600"
                                  />
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="col-span-full p-4 text-center text-slate-500 bg-slate-50 rounded-lg">
                            No representatives available
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Questions Selection */}
                    <div className="flex-1 overflow-auto">
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-slate-700">
                          Select Questions to Assign
                        </label>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">
                            {selectedQuestions.length} of{" "}
                            {unassignedQuestions.length} selected
                          </span>
                          {selectedQuestions.length > 0 && (
                            <button
                              className="text-xs text-indigo-600 hover:text-indigo-800"
                              onClick={() => setSelectedQuestions([])}
                            >
                              Clear Selection
                            </button>
                          )}
                        </div>
                      </div>
                      {isLoadingUnassignedQuestions ? (
                        <div className="flex justify-center items-center h-64">
                          <Spin
                            indicator={
                              <LoadingOutlined style={{ fontSize: 24 }} spin />
                            }
                          />
                        </div>
                      ) : unassignedQuestions.length > 0 ? (
                        <div className="border border-slate-200 rounded-lg overflow-hidden">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="w-12 p-3 text-left">
                                  <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                    checked={
                                      selectedQuestions.length ===
                                      unassignedQuestions.length
                                    }
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedQuestions(
                                          unassignedQuestions.map((q) => q.id)
                                        );
                                      } else {
                                        setSelectedQuestions([]);
                                      }
                                    }}
                                  />
                                </th>
                                <th className="w-24 p-3 text-left font-medium text-slate-600">
                                  Ref
                                </th>
                                <th className="p-3 text-left font-medium text-slate-600">
                                  Question
                                </th>
                                <th className="w-44 p-3 text-left font-medium text-slate-600">
                                  Type
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {unassignedQuestions.map((question) => (
                                <tr
                                  key={question.id}
                                  className={`hover:bg-slate-50 cursor-pointer ${
                                    selectedQuestions.includes(question.id)
                                      ? "bg-indigo-50/30"
                                      : ""
                                  }`}
                                  onClick={() => {
                                    if (
                                      selectedQuestions.includes(question.id)
                                    ) {
                                      setSelectedQuestions(
                                        selectedQuestions.filter(
                                          (id) => id !== question.id
                                        )
                                      );
                                    } else {
                                      setSelectedQuestions([
                                        ...selectedQuestions,
                                        question.id,
                                      ]);
                                    }
                                  }}
                                >
                                  <td className="p-3">
                                    <input
                                      type="checkbox"
                                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                      checked={selectedQuestions.includes(
                                        question.id
                                      )}
                                      onChange={(e) => {
                                        e.stopPropagation();
                                        if (e.target.checked) {
                                          setSelectedQuestions([
                                            ...selectedQuestions,
                                            question.id,
                                          ]);
                                        } else {
                                          setSelectedQuestions(
                                            selectedQuestions.filter(
                                              (id) => id !== question.id
                                            )
                                          );
                                        }
                                      }}
                                    />
                                  </td>
                                  <td className="p-3">
                                    <span className="text-indigo-600 font-medium">
                                      {question.reference}
                                    </span>
                                  </td>
                                  <td className="p-3 text-slate-700">
                                    <div
                                      className="line-clamp-2"
                                      title={question.question}
                                    >
                                      {question.question}
                                    </div>
                                  </td>
                                  <td className="p-3">
                                    <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-full">
                                      {question.type_display || question.type}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-64 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="text-slate-400 mb-2">
                            <FileText size={32} />
                          </div>
                          <p className="text-slate-600 mb-1">
                            No unassigned questions found
                          </p>
                          <p className="text-xs text-slate-500">
                            All questions have been assigned
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Auto Assignment UI */
                  <div className="flex flex-col items-center justify-center h-64">
                    <div className="bg-indigo-50 p-6 rounded-xl max-w-md text-center">
                      <div className="flex justify-center mb-4">
                        <div className="p-3 bg-indigo-100 rounded-full text-indigo-600">
                          <UserPlus size={24} />
                        </div>
                      </div>
                      <h3 className="text-lg font-medium text-slate-800 mb-2">
                        {bulkAssignmentMethod === "random"
                          ? "Random Assignment"
                          : "Sequential Assignment"}
                      </h3>
                      <p className="text-slate-600 mb-4">
                        {bulkAssignmentMethod === "random"
                          ? "Questions will be randomly distributed among all company representatives."
                          : "Questions will be assigned sequentially to company representatives."}
                      </p>
                      <div className="bg-white p-3 rounded-lg border border-slate-200 mb-4">
                        <div className="flex justify-between items-center text-sm text-slate-700 mb-2">
                          <span>Available Representatives:</span>
                          <span className="font-medium">
                            {bulkAssignmentReps.length}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm text-slate-700">
                          <span>Unassigned Questions:</span>
                          <span className="font-medium">
                            {unassignedQuestions.length}
                          </span>
                        </div>
                      </div>
                      {bulkAssignmentReps.length === 0 && (
                        <div className="text-yellow-600 bg-yellow-50 p-2 rounded-lg text-sm mb-4">
                          No representatives available for assignment
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                <button
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
                  onClick={() => setIsAssignmentModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center disabled:opacity-50"
                  onClick={handleBulkAssign}
                  disabled={
                    isBulkAssigning ||
                    (bulkAssignmentMethod === "specific" &&
                      (selectedQuestions.length === 0 ||
                        !selectedRepresentative)) ||
                    (bulkAssignmentMethod !== "specific" &&
                      bulkAssignmentReps.length === 0)
                  }
                >
                  {isBulkAssigning && (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  )}
                  {isBulkAssigning
                    ? "Assigning..."
                    : `Assign ${
                        bulkAssignmentMethod === "specific"
                          ? `${selectedQuestions.length} Question${
                              selectedQuestions.length !== 1 ? "s" : ""
                            }`
                          : "Questions"
                      }`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewQuestionnaire;
