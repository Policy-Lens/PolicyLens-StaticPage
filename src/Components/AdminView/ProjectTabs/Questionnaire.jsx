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
  RotateCcw, // Undo icon
  UploadCloud, // Upload icon
  ThumbsUp, // Accept icon
  MessageCircle, // Feedback icon
} from "lucide-react";
import { ProjectContext } from "../../../Context/ProjectContext";
import { AuthContext } from "../../../AuthContext";
import { apiRequest, BASE_URL } from "../../../utils/api";
import { useParams } from "react-router-dom";
import { message, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const Questionnaire = () => {
  const { projectid } = useParams();
  const { projectRole, project, getMembers } = useContext(ProjectContext);
  const { user } = useContext(AuthContext);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [isEvidenceUploading, setIsEvidenceUploading] = useState(false); // Keep for direct upload in view mode if needed?
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  // const [evidenceUploaded, setEvidenceUploaded] = useState({}); // May be redundant now
  const [isAddQuestionModalOpen, setIsAddQuestionModalOpen] = useState(false);
  const [editDropdownOpen, setEditDropdownOpen] = useState(null);
  const [isAddingAnswer, setIsAddingAnswer] = useState(false); // True for both new answer and editing existing
  const [newAnswer, setNewAnswer] = useState({ answer_text: "", comments: "" });
  const [newQuestion, setNewQuestion] = useState({
    control_number: "",
    control_name: "",
    audit_question: "",
    associated_functions: [],
    control_theme: "",
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [uploadedEvidences, setUploadedEvidences] = useState([]); // Used for NEW answers only
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false); // For editing QUESTIONS
  const [questionToEdit, setQuestionToEdit] = useState(null);
  const [questionVersions, setQuestionVersions] = useState([]);
  const [currentVersionIndex, setCurrentVersionIndex] = useState(0);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    control_theme: "",
    function: "",
  });
  const [companyRepresentatives, setCompanyRepresentatives] = useState([]);
  const [isAssignDropdownOpen, setIsAssignDropdownOpen] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedRepresentative, setSelectedRepresentative] = useState(null);
  const assignDropdownRef = useRef(null);
  const assignReviewerDropdownRef = useRef(null);
  const [questionAssignments, setQuestionAssignments] = useState([]);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);
  const [isDeletingAssignment, setIsDeletingAssignment] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isCurrentUserAssigned, setIsCurrentUserAssigned] = useState(false);
  const [activeQuestionTab, setActiveQuestionTab] = useState("all");
  const [activeSidebarTab, setActiveSidebarTab] = useState("question");
  const [isEditingAnswerId, setIsEditingAnswerId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state for submit/update

  // --- State for Evidence Management during Edit ---
  const [edit_currentEvidences, setEdit_currentEvidences] = useState([]);
  const [edit_deletedCurrentEvidences, setEdit_deletedCurrentEvidences] =
    useState([]);
  const [edit_oldRemovedEvidences, setEdit_oldRemovedEvidences] = useState([]);
  const [edit_restoredOldEvidences, setEdit_restoredOldEvidences] = useState(
    []
  );
  const [edit_newlyAddedEvidences, setEdit_newlyAddedEvidences] = useState([]);
  // -------------------------------------------------

  // --- State for Review Functionality ---
  const [isAddingFeedback, setIsAddingFeedback] = useState(false);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [isReviewSubmitting, setIsReviewSubmitting] = useState(false); // Loading for Accept/Feedback
  // ------------------------------------

  // Define available control themes
  const controlThemes = [
    "Organizational",
    "People",
    "Physical",
    "Technological",
  ];

  // Helper function to format associated functions
  const formatAssociatedFunctions = (functions) => {
    if (!functions) return [];
    if (Array.isArray(functions)) {
      return functions
        .map((func) =>
          typeof func === "object" ? func.name || func.label || "" : func
        )
        .filter(Boolean);
    }
    if (typeof functions === "string") {
      return functions
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean);
    }
    return [];
  };

  // Function to select a question and fetch its details
  const selectQuestion = async (question) => {
    console.log(question);
    setActiveQuestion(question);
    setActiveSidebarTab("question");
    setQuestionAssignments([]);
    setIsLoadingAssignments(true);
    // Reset edit states if a new question is selected
    setIsAddingAnswer(false);
    setIsEditingAnswerId(null);
    setEdit_currentEvidences([]);
    setEdit_deletedCurrentEvidences([]);
    setEdit_oldRemovedEvidences([]);
    setEdit_restoredOldEvidences([]);
    setEdit_newlyAddedEvidences([]);
    // Reset review state
    setIsAddingFeedback(false);
    setFeedbackComment("");

    // Fetch question assignments
    await fetchQuestionAssignments(question.id);

    // Fetch the answer
    try {
      const answerResponse = await apiRequest(
        "GET",
        `/api/questionnaire/questions/${question.id}/answers/`,
        null,
        true
      );

      if (answerResponse.status === 200) {
        if (answerResponse.data.message === "Not yet answered") {
          setActiveQuestion((prev) =>
            prev && prev.id === question.id ? { ...prev, answer: null } : prev
          );
        } else {
          console.log(answerResponse.data);
          setActiveQuestion((prev) =>
            prev && prev.id === question.id
              ? { ...prev, answer: answerResponse.data }
              : prev
          );
        }
      }
    } catch (error) {
      if (error.status === 404) {
        setActiveQuestion((prev) =>
          prev && prev.id === question.id ? { ...prev, answer: null } : prev
        );
      } else {
        console.error("Error fetching question answer:", error);
        message.error("Failed to load answer details.");
      }
    }
  };

  // Function to fetch question assignments
  const fetchQuestionAssignments = async (questionId) => {
    // Keep existing logic, just ensure setIsLoadingAssignments(false) is called in finally block
    setIsLoadingAssignments(true);
    try {
      const response = await apiRequest(
        "GET",
        `/api/questionnaire/questions/${questionId}/assignments/`,
        null,
        true
      );
      if (response.status === 200) {
        setQuestionAssignments(response.data);
        if (user && response.data.length > 0) {
          const isAssigned = response.data.some(
            (assignment) => assignment.assigned_to_details?.id === user.id
          );
          setIsCurrentUserAssigned(isAssigned);
        } else {
          setIsCurrentUserAssigned(false);
        }
      } else {
        setQuestionAssignments([]);
        setIsCurrentUserAssigned(false);
        console.error("Failed to fetch question assignments");
      }
    } catch (error) {
      console.error("Error fetching question assignments:", error);
      setQuestionAssignments([]);
      setIsCurrentUserAssigned(false);
    } finally {
      setIsLoadingAssignments(false);
    }
  };

  // Toggle filter dropdown
  const toggleFilterDropdown = () => {
    setFilterDropdownOpen(!filterDropdownOpen);
  };

  // Open/Close Add Question Modal (for questions, not answers)
  const openAddQuestionModal = () => setIsAddQuestionModalOpen(true);
  const closeAddQuestionModal = () => {
    setIsAddQuestionModalOpen(false);
    setNewQuestion({
      control_number: "",
      control_name: "",
      audit_question: "",
      associated_functions: [],
      control_theme: "",
    });
    setIsEditMode(false);
    setQuestionToEdit(null);
  };

  // Handle input changes for the New Question form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewQuestion({ ...newQuestion, [name]: value });
  };

  // Handle toggling associated functions for a new question
  const handleFunctionToggle = (func) => {
    const currentFunctions = newQuestion.associated_functions || [];
    if (currentFunctions.includes(func)) {
      setNewQuestion({
        ...newQuestion,
        associated_functions: currentFunctions.filter((f) => f !== func),
      });
    } else {
      setNewQuestion({
        ...newQuestion,
        associated_functions: [...currentFunctions, func],
      });
    }
  };

  // Toggle dropdown for associated functions in the modal
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  // Submit new or updated QUESTION
  const handleSubmitQuestion = async (e) => {
    // ... (Keep existing logic for submitting/updating questions) ...
    e.preventDefault();
    let associated_functions_csv = "";
    if (Array.isArray(newQuestion.associated_functions)) {
      associated_functions_csv = newQuestion.associated_functions.join(",");
    }

    const questionData = {
      control_number: newQuestion.control_number,
      control_name: newQuestion.control_name,
      audit_question: newQuestion.audit_question,
      functions_csv: associated_functions_csv,
      control_theme: newQuestion.control_theme,
    };

    let response;
    try {
      if (isEditMode && questionToEdit) {
        response = await apiRequest(
          "PUT",
          `/api/questionnaire/questions/${questionToEdit}/`,
          questionData,
          true
        );
      } else {
        response = await apiRequest(
          "POST",
          `/api/questionnaire/projects/${projectid}/questions/`,
          questionData,
          true
        );
      }

      if (response.status === 200 || response.status === 201) {
        closeAddQuestionModal();
        handleGetQuestions(); // Refresh the list
        message.success(
          isEditMode
            ? "Question updated successfully"
            : "Question created successfully"
        );
      } else {
        throw new Error(`Failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error submitting/updating question:", error);
      message.error(
        isEditMode ? "Failed to update question" : "Failed to create question"
      );
    }
  };

  // Toggle edit dropdown for a specific question in the list
  const toggleEditDropdown = (questionId, e) => {
    e.stopPropagation();
    setEditDropdownOpen(editDropdownOpen === questionId ? null : questionId);
  };

  // Handle clicking the Edit Question option
  const handleEditQuestion = (questionId, e) => {
    // ... (Keep existing logic for populating the question edit form) ...
    e.stopPropagation();
    setEditDropdownOpen(null);
    const questionToUpdate = questions.find((q) => q.id === questionId);
    if (questionToUpdate) {
      let associatedFunctions = [];
      if (questionToUpdate.associated_functions) {
        if (
          Array.isArray(questionToUpdate.associated_functions) &&
          questionToUpdate.associated_functions.length > 0 &&
          typeof questionToUpdate.associated_functions[0] === "object"
        ) {
          associatedFunctions = questionToUpdate.associated_functions.map(
            (func) => func.name || func.label || ""
          );
        } else if (typeof questionToUpdate.associated_functions === "string") {
          associatedFunctions = questionToUpdate.associated_functions
            .split(",")
            .map((func) => func.trim());
        } else if (Array.isArray(questionToUpdate.associated_functions)) {
          associatedFunctions = questionToUpdate.associated_functions; // Assume array of strings
        }
      }
      setNewQuestion({
        control_number: questionToUpdate.control_number || "",
        control_name: questionToUpdate.control_name || "",
        audit_question: questionToUpdate.audit_question || "",
        associated_functions: associatedFunctions.filter(Boolean), // Ensure no empty strings
        control_theme: questionToUpdate.control_theme || "",
      });
      setQuestionToEdit(questionId);
      setIsEditMode(true);
      setIsAddQuestionModalOpen(true);
    }
  };

  // --- Evidence Management Handlers (for Edit Mode) ---

  const handleMarkForDelete = (evidenceId) => {
    const evidenceToMove = edit_currentEvidences.find(
      (ev) => ev.id === evidenceId
    );
    if (evidenceToMove) {
      setEdit_currentEvidences((prev) =>
        prev.filter((ev) => ev.id !== evidenceId)
      );
      setEdit_deletedCurrentEvidences((prev) => [...prev, evidenceToMove]);
    }
  };

  const handleUndoDelete = (evidenceId) => {
    const evidenceToMove = edit_deletedCurrentEvidences.find(
      (ev) => ev.id === evidenceId
    );
    if (evidenceToMove) {
      setEdit_deletedCurrentEvidences((prev) =>
        prev.filter((ev) => ev.id !== evidenceId)
      );
      setEdit_currentEvidences((prev) => [...prev, evidenceToMove]);
    }
  };

  const handleMarkForRestore = (removedEvidenceId) => {
    const evidenceToMove = edit_oldRemovedEvidences.find(
      (ev) => ev.id === removedEvidenceId
    );
    if (evidenceToMove) {
      setEdit_oldRemovedEvidences((prev) =>
        prev.filter((ev) => ev.id !== removedEvidenceId)
      );
      setEdit_restoredOldEvidences((prev) => [...prev, evidenceToMove]);
    }
  };

  const handleUndoRestore = (removedEvidenceId) => {
    const evidenceToMove = edit_restoredOldEvidences.find(
      (ev) => ev.id === removedEvidenceId
    );
    if (evidenceToMove) {
      setEdit_restoredOldEvidences((prev) =>
        prev.filter((ev) => ev.id !== removedEvidenceId)
      );
      setEdit_oldRemovedEvidences((prev) => [...prev, evidenceToMove]);
    }
  };

  const handleAddNewEvidenceFiles = (files) => {
    if (!files || !files.length) return;
    const newFiles = Array.from(files).map((file) => ({
      id: `new-${Date.now()}-${Math.random()}`, // Temporary ID for UI key
      file: URL.createObjectURL(file), // For preview if needed
      displayName: file.name,
      originalFile: file, // The actual File object
      isNew: true,
      size: file.size,
    }));
    setEdit_newlyAddedEvidences((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveNewEvidence = (tempId) => {
    setEdit_newlyAddedEvidences((prev) =>
      prev.filter((ev) => ev.id !== tempId)
    );
    // Optional: Revoke object URL if created: URL.revokeObjectURL(evidence.file);
  };

  // --- End Evidence Handlers ---

  // Submit new or updated ANSWER
  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // Start loading

    try {
      if (isEditingAnswerId) {
        // --- EDITING EXISTING ANSWER ---

        // Prepare Data for API calls
        const formData = new FormData();
        formData.append("answer_text", newAnswer.answer_text);
        formData.append("comments", newAnswer.comments || "");
        formData.append("status", "Under Review");
        edit_newlyAddedEvidences.forEach((evidence) => {
          formData.append("evidence_files", evidence.originalFile);
        });

        const deleteIds = edit_deletedCurrentEvidences.map((ev) => ev.id);
        const restoreIds = edit_restoredOldEvidences.map((ev) => ev.id);

        // Step 1: Update Answer Text & Add New Evidence
        const updateResponse = await apiRequest(
          "PUT",
          `/api/questionnaire/answers/${isEditingAnswerId}/`,
          formData,
          true
        );

        if (updateResponse.status !== 200) {
          throw new Error("Failed to update answer text or add new evidence.");
        }
        message.success("Answer text and new evidence updated."); // Partial success message

        // Step 2: Bulk Delete (if needed)
        if (deleteIds.length > 0) {
          try {
            const deleteResponse = await apiRequest(
              "POST", // Changed to POST as per API docs usually for bulk actions with body
              "/api/questionnaire/evidence/bulk-delete/",
              { evidence_ids: deleteIds },
              true
            );
            if (
              deleteResponse.status !== 204 &&
              deleteResponse.status !== 200
            ) {
              // Allow 200 or 204 for delete
              console.warn(
                "Bulk delete API did not return 200/204, but proceeding.",
                deleteResponse
              );
              // Decide if this should throw an error or just warn
              // throw new Error("Failed to delete marked evidence.");
              message.warning(
                "Could not confirm deletion of all marked evidence."
              );
            } else {
              message.success("Marked evidence deleted.");
            }
          } catch (deleteError) {
            console.error("Error during bulk delete:", deleteError);
            message.error(
              "Failed to delete marked evidence. Please try editing again."
            );
            // Potentially revert? Or leave as is? For now, we stop.
            setIsSubmitting(false);
            return; // Stop processing further steps
          }
        }

        // Step 3: Bulk Restore (if needed)
        if (restoreIds.length > 0) {
          try {
            const restoreResponse = await apiRequest(
              "POST", // Assuming POST for restore based on API doc format
              "/api/questionnaire/removed-evidence/bulk-restore/",
              { removed_evidence_ids: restoreIds },
              true
            );
            if (
              restoreResponse.status !== 200 &&
              restoreResponse.status !== 201
            ) {
              // Allow 200 or 201
              console.warn(
                "Bulk restore API did not return 200/201, but proceeding.",
                restoreResponse
              );
              // Decide if this should throw an error or just warn
              // throw new Error("Failed to restore marked evidence.");
              message.warning(
                "Could not confirm restoration of all marked evidence."
              );
            } else {
              message.success("Marked evidence restored.");
            }
          } catch (restoreError) {
            console.error("Error during bulk restore:", restoreError);
            message.error(
              "Failed to restore marked evidence. Please try editing again."
            );
            // If delete succeeded but restore failed, the state is partially updated.
            setIsSubmitting(false);
            return; // Stop processing
          }
        }

        // All steps succeeded (or handled gracefully)
        message.success("Answer update process completed.");
      } else {
        // --- CREATING NEW ANSWER ---
        const formData = new FormData();
        formData.append("answer_text", newAnswer.answer_text);
        formData.append("comments", newAnswer.comments || "");
        // Use the correct state for NEW answers
        uploadedEvidences.forEach((evidence) => {
          if (evidence.originalFile) {
            // Ensure it's a real file
            formData.append("evidence_files", evidence.originalFile);
          }
        });

        const response = await apiRequest(
          "POST",
          `/api/questionnaire/questions/${activeQuestion.id}/answer/`,
          formData,
          true
        );

        if (response.status !== 201 && response.status !== 200) {
          throw new Error("Failed to submit new answer.");
        }
        message.success("Answer submitted successfully");
      }

      // Common Success Steps: Reset state and refresh data
      setIsAddingAnswer(false);
      setNewAnswer({ answer_text: "", comments: "" });
      setUploadedEvidences([]); // Reset new answer evidence state
      setIsEditingAnswerId(null);
      // Reset edit-specific evidence states
      setEdit_currentEvidences([]);
      setEdit_deletedCurrentEvidences([]);
      setEdit_oldRemovedEvidences([]);
      setEdit_restoredOldEvidences([]);
      setEdit_newlyAddedEvidences([]);

      // Refresh the active question data fully
      const freshQuestionData = questions.find(
        (q) => q.id === activeQuestion.id
      );
      if (freshQuestionData) {
        await selectQuestion(freshQuestionData); // Re-run selectQuestion
      }
      setActiveSidebarTab("answer"); // Ensure user sees the result
    } catch (error) {
      console.error("Error submitting/updating answer:", error);
      message.error(`Operation failed: ${error.message || "Unknown error"}`);
      // Keep the form open if an error occurred during edit?
      // if (!isEditingAnswerId) setIsAddingAnswer(false); // Maybe close only if it was a new submission?
    } finally {
      setIsSubmitting(false); // End loading
    }
  };

  // Function to handle starting an edit for an ANSWER
  const handleEditAnswer = () => {
    if (!activeQuestion || !activeQuestion.answer) return;

    setIsAddingAnswer(true); // Show the form
    setNewAnswer({
      answer_text: activeQuestion.answer.answer_text || "",
      comments: activeQuestion.answer.comments || "",
    });
    setIsEditingAnswerId(activeQuestion.answer.id);

    // Initialize evidence states for editing
    setEdit_currentEvidences(activeQuestion.answer.evidence_files || []);
    setEdit_oldRemovedEvidences(
      activeQuestion.answer.removed_evidence_files || []
    );
    setEdit_deletedCurrentEvidences([]);
    setEdit_restoredOldEvidences([]);
    setEdit_newlyAddedEvidences([]);

    // Clear the state used for *new* answer uploads
    setUploadedEvidences([]);
  };

  // Helper to reset all edit-related states (used in Cancel)
  const resetEditStates = () => {
    setIsAddingAnswer(false);
    setNewAnswer({ answer_text: "", comments: "" });
    setUploadedEvidences([]); // Clear new answer evidence state too
    setIsEditingAnswerId(null);
    setEdit_currentEvidences([]);
    setEdit_deletedCurrentEvidences([]);
    setEdit_oldRemovedEvidences([]);
    setEdit_restoredOldEvidences([]);
    setEdit_newlyAddedEvidences([]);
    // Also reset review feedback state
    setIsAddingFeedback(false);
    setFeedbackComment("");
  };

  // --- Review Functionality ---
  const canUserReview = useMemo(() => {
    if (!user || !activeQuestion?.answer) return false;

    // Admins and consultants can always review
    if (projectRole === "consultant admin") {
      return true;
    }

    // Check if user is in the review assignments list for this answer
    const reviewAssignments = activeQuestion.answer.review_assignments || [];
    return reviewAssignments.some(
      (assignment) => assignment.assigned_to_details?.id === user.id
    );
  }, [user, projectRole, activeQuestion?.answer]);

  // Handle clicking "Accept"
  const handleAcceptAnswer = async () => {
    if (!activeQuestion?.answer) return;
    setIsReviewSubmitting(true);
    try {
      const response = await apiRequest(
        "PUT",
        `/api/questionnaire/answers/${activeQuestion.answer.id}/`,
        { status: "Accepted" }, // Changed body to reflect 'Approved'
        true
      );
      if (response.status === 200) {
        message.success("Answer Approved!");
        // Refresh data
        const freshQuestionData = questions.find(
          (q) => q.id === activeQuestion.id
        );
        if (freshQuestionData) {
          await selectQuestion(freshQuestionData);
        }
        setActiveSidebarTab("answer");
      } else {
        throw new Error(`Failed with status ${response.status}`);
      }
    } catch (error) {
      console.error("Error accepting answer:", error);
      message.error(`Failed to accept answer: ${error.message}`);
    } finally {
      setIsReviewSubmitting(false);
    }
  };

  // Handle clicking "Submit Feedback"
  const handleSubmitFeedback = async () => {
    if (!activeQuestion?.answer || !feedbackComment.trim()) {
      message.warning("Feedback cannot be empty.");
      return;
    }
    setIsReviewSubmitting(true);
    try {
      const response = await apiRequest(
        "POST",
        `/api/questionnaire/answers/${activeQuestion.answer.id}/review/`,
        { comments: feedbackComment },
        true
      );
      if (response.status === 201 || response.status === 200) {
        message.success("Feedback submitted successfully!");
        // Reset feedback state
        setIsAddingFeedback(false);
        setFeedbackComment("");
        // Refresh data
        const freshQuestionData = questions.find(
          (q) => q.id === activeQuestion.id
        );
        if (freshQuestionData) {
          await selectQuestion(freshQuestionData);
        }
        setActiveSidebarTab("answer");
      } else {
        throw new Error(`Failed with status ${response.status}`);
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      message.error(`Failed to submit feedback: ${error.error}`);
    } finally {
      setIsReviewSubmitting(false);
    }
  };

  // ----------------------------

  // Define if the current user can answer the active question
  const canUserAnswer = useMemo(() => {
    // Allow company role or specifically assigned users to answer
    return projectRole === "company" || isCurrentUserAssigned;
  }, [projectRole, isCurrentUserAssigned]);

  // Questions data state
  const [questions, setQuestions] = useState([]);
  const [isQuestionsLoading, setIsQuestionsLoading] = useState(true);

  // Handle Excel file selection
  const handleFileSelect = (e) => {
    // ... (keep existing logic) ...
    const file = e.target.files[0];
    if (file) {
      if (
        file.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/vnd.ms-excel"
      ) {
        setSelectedFile(file);
      } else {
        message.error("Please upload an Excel file (.xlsx or .xls)");
        e.target.value = null;
      }
    }
  };

  // Handle uploading questions from Excel
  const handleUploadQuestions = async () => {
    // ... (keep existing logic) ...
    if (selectedFile) {
      const formData = new FormData();
      formData.append("file", selectedFile);
      try {
        const response = await apiRequest(
          "POST",
          `/api/questionnaire/projects/${projectid}/questions/`,
          formData,
          true
        );
        if (response.status === 201 || response.status === 200) {
          message.success("Questions uploaded successfully");
          setIsUploadModalOpen(false);
          setSelectedFile(null);
          handleGetQuestions(); // Refresh list
        } else {
          throw new Error(`Upload failed with status: ${response.status}`);
        }
      } catch (error) {
        console.error("Error uploading questions:", error);
        message.error(
          `Failed to upload questions: ${error.message || "Check file format."}`
        );
      }
    }
  };

  // Available functions for filtering/adding questions
  const availableFunctions = [
    // ... (keep existing list) ...
    { name: "Compliance", id: "1" },
    {
      name: "Exec. Management",
      id: "2",
    },
    { name: "Legal", id: "3" },
    { name: "HR", id: "4" },
    { name: "Finance", id: "5" },
    { name: "IT", id: "6" },
    { name: "Business ops", id: "7" },
    { name: "Admin", id: "8" },
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

  // Helper function to get filename from path
  const getFileName = (filePath) => {
    if (!filePath) return "Unnamed File";
    try {
      // Handle potential URL objects if used for previews
      if (filePath instanceof URL) {
        // Attempt to get name from URL path
        const pathSegments = filePath.pathname.split("/");
        return decodeURIComponent(pathSegments.pop() || "Unnamed File");
      }
      // Handle string paths
      return decodeURIComponent(
        String(filePath).split("/").pop() || "Unnamed File"
      );
    } catch (e) {
      return "Unnamed File";
    }
  };

  // Handle drag events for file uploads
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (isAddingAnswer && isEditingAnswerId) {
      handleAddNewEvidenceFiles(files); // Use edit handler
    } else if (isAddingAnswer) {
      handleMultipleFileSelect(files); // Use new answer handler
    }
    // else: Drag/drop might not be active elsewhere
  };

  // Format bytes to human-readable size
  const formatBytes = (bytes, decimals = 2) => {
    // ... (keep existing logic) ...
    if (bytes === 0 || typeof bytes !== "number") return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  // Fetch questions based on tab, filters, search
  const handleGetQuestions = async () => {
    setIsQuestionsLoading(true);
    let endpoint = `/api/questionnaire/projects/${projectid}/questions/list/?`;
    const params = new URLSearchParams();
    if (activeQuestionTab === "assigned_for_answering")
      params.append("assigned_to_me", "true");
    if (activeQuestionTab === "assigned_for_review")
      params.append("assigned_to_me_for_review", "true");
    if (searchQuery) params.append("search", searchQuery);
    if (filters.control_theme)
      params.append("control_theme", filters.control_theme);
    if (filters.function) params.append("functions_csv", filters.function); // Assuming API takes CSV
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

  // Effect to refetch questions when dependencies change
  useEffect(() => {
    handleGetQuestions();
  }, [activeQuestionTab, searchQuery, filters, projectid]);

  // Close Excel upload modal
  const handleCloseUploadModal = () => {
    setIsUploadModalOpen(false);
    setSelectedFile(null);
  };

  // Handle adding multiple files for a NEW answer
  const handleMultipleFileSelect = (files) => {
    if (!files || !files.length) return;
    const newEvidences = Array.from(files).map((file) => ({
      id: `new-${Date.now()}-${Math.random()}`, // Temp ID
      file: URL.createObjectURL(file), // Preview URL
      displayName: file.name,
      originalFile: file, // Actual file for upload
      size: file.size,
      isNew: true, // Mark as new
    }));
    setUploadedEvidences((prev) => [...prev, ...newEvidences]);
  };

  // Handle deleting a QUESTION from the list
  const handleDeleteQuestionFromList = async (questionId) => {
    // ... (keep existing logic) ...
    try {
      const response = await apiRequest(
        "DELETE",
        `/api/questionnaire/questions/${questionId}/`,
        null,
        true
      );
      if (response.status === 204 || response.status === 200) {
        message.success("Question deleted successfully");
        setQuestions((prev) => prev.filter((q) => q.id !== questionId));
        if (activeQuestion && activeQuestion.id === questionId) {
          setActiveQuestion(null); // Clear selection if active one deleted
        }
      } else {
        throw new Error(`Failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error deleting question:", error);
      message.error(
        `Failed to delete question: ${error.message || "Unknown error"}`
      );
    } finally {
      setDeleteConfirmVisible(false);
      setQuestionToDelete(null);
    }
  };

  // Questions to display in the table (already filtered by API)
  const questionsToDisplay = questions;

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value === prev[filterType] ? "" : value, // Toggle
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({ control_theme: "", function: "" });
    setSearchQuery("");
  };

  // Fetch company representatives for assignment dropdown
  const fetchCompanyRepresentatives = async () => {
    // ... (keep existing logic) ...
    try {
      const response = await apiRequest(
        "GET",
        `/api/auth/projects/${projectid}/representatives/`,
        null,
        true
      );
      console.log(response.data);
      if (response.status === 200) {
        const filteredRes = response.data.filter((cr) => {
          return !activeQuestion.assignments.some(
            (e) => e.assigned_to === cr.id
          );
        });
        setCompanyRepresentatives(filteredRes);
      } else {
        throw new Error(`Failed with status ${response.status}`);
      }
    } catch (error) {
      console.error("Error fetching company representatives:", error);
      message.error("Failed to fetch company representatives.");
      setCompanyRepresentatives([]); // Ensure it's an array on error
    }
  };

  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);

  const fetchMembers = async () => {
    try {
      const response = await getMembers(projectid);
      const reviewAssignments = activeQuestion.answer.review_assignments || [];
      console.log(reviewAssignments);

      let filteredRes = response.filter((member) => {
        return !reviewAssignments.some(
          (assignment) => assignment.assigned_to === member.id
        );
      });
      filteredRes = filteredRes.filter((member) => user.id != member.id);
      setMembers(filteredRes);
    } catch (error) {
      console.error("Error fetching members:", error);
      message.error("Failed to fetch members.");
      setMembers([]);
    }
  };

  const assignMemberForReview = async (answerId) => {
    setIsAssigning(true);
    try {
      const response = await apiRequest(
        "POST",
        `/api/questionnaire/answers/${answerId}/assign-review/`,
        { assigned_to_ids: [selectedMember.id] },
        true
      );
      if (response.status === 200 || response.status === 201) {
        message.success("Member assigned for review successfully");
        await fetchMembers();
        selectQuestion(activeQuestion);
      } else {
        throw new Error(`Failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error assigning member for review:", error);
      message.error(
        `Failed to assign member for review: ${
          error.message || "Unknown error"
        }`
      );
    } finally {
      setIsAssignMemberDropdownOpen(false);
      setIsAssigning(false);
    }
  };

  // Assign representative to question
  const assignRepresentativeToQuestion = async (
    questionId,
    representativeId
  ) => {
    // ... (keep existing logic, ensure error handling) ...
    setIsAssigning(true);
    try {
      const response = await apiRequest(
        "POST",
        `/api/questionnaire/questions/${questionId}/assign/`,
        { assigned_to_ids: [representativeId] },
        true
      );
      if (response.status === 200 || response.status === 201) {
        message.success("Representative assigned successfully");
        // await fetchQuestionAssignments(questionId); // Refresh assignments for active question
        // Optional: Refresh the main list if assignment count is shown there
        // handleGetQuestions();
        await fetchCompanyRepresentatives();
        selectQuestion(activeQuestion);
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

  // Toggle assign representative dropdown
  const toggleAssignDropdown = () => {
    if (!isAssignDropdownOpen) {
      fetchCompanyRepresentatives(); // Fetch only when opening
    }
    setIsAssignDropdownOpen(!isAssignDropdownOpen);
  };
  const [isAssignMemberDropdownOpen, setIsAssignMemberDropdownOpen] =
    useState(false);
  const toggleAssignMemberDropdown = () => {
    if (!isAssignMemberDropdownOpen) {
      fetchMembers(); // Fetch only when opening
      setSelectedMember(null);
    }
    setIsAssignMemberDropdownOpen(!isAssignMemberDropdownOpen);
  };

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
        setIsAssignMemberDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Remove assignment from question
  const removeAssignment = async (assignmentId) => {
    // ... (keep existing logic, ensure error handling) ...
    setIsDeletingAssignment(true);
    try {
      const response = await apiRequest(
        "DELETE",
        `/api/questionnaire/question-assignments/${assignmentId}/remove/`,
        null,
        true
      );
      // Check for 204 No Content specifically for successful deletion
      if (response.status === 204) {
        message.success("Assignment removed successfully");
        if (activeQuestion) {
          await fetchQuestionAssignments(activeQuestion.id); // Refresh assignments for active q
        }
        // handleGetQuestions(); // Refresh main list if needed
      } else if (response.status === 403) {
        message.error("Unauthorized: Only the company can remove this.");
      } else {
        // Handle other non-success statuses if needed
        throw new Error(`Failed with status: ${response.status}`);
      }
    } catch (error) {
      // Catch specific errors if thrown (like 403 from API response handling)
      if (error.response && error.response.status === 403) {
        message.error(
          "Unauthorized: Only the user who created this assignment can remove it."
        );
      } else {
        console.error("Error removing assignment:", error);
        message.error(
          `Failed to remove assignment: ${error.message || "Unknown error"}`
        );
      }
    } finally {
      setIsDeletingAssignment(false);
      setShowDeleteConfirmation(false);
      setAssignmentToDelete(null);
    }
  };

  const [isDeletingReviewerAssignment, setIsDeletingReviewerAssignment] =
    useState(false);
  const [showDeleteConfirmationReviewer, setShowDeleteConfirmationReviewer] =
    useState(false);
  const [reviewerToDelete, setReviewerToDelete] = useState(null);
  // Remove Reviewer Assignment from question
  const removeReviewerAssignment = async (assignmentId) => {
    // ... (keep existing logic, ensure error handling) ...
    setIsDeletingReviewerAssignment(true);
    try {
      const response = await apiRequest(
        "DELETE",
        `/api/questionnaire/review-assignments/${assignmentId}/delete/`,
        null,
        true
      );
      // Check for 204 No Content specifically for successful deletion
      if (response.status === 204) {
        message.success("Reviewer assignment removed successfully");
        if (activeQuestion) {
          await selectQuestion(activeQuestion); // Refresh question for active question
        }
        // handleGetQuestions(); // Refresh main list if needed
      } else if (response.status === 403) {
        message.error("Unauthorized: Only the admin can remove this.");
      } else {
        // Handle other non-success statuses if needed
        throw new Error(`Failed with status: ${response.status}`);
      }
    } catch (error) {
      // Catch specific errors if thrown (like 403 from API response handling)
      if (error.response && error.response.status === 403) {
        message.error("Unauthorized: Only the admin can remove it.");
      } else {
        console.error("Error removing assignment:", error);
        message.error(
          `Failed to remove assignment: ${error.message || "Unknown error"}`
        );
      }
    } finally {
      setIsDeletingReviewerAssignment(false);
      setShowDeleteConfirmationReviewer(false);
      setReviewerToDelete(null);
    }
  };
  // Open delete confirmation for reviewer assignment
  const confirmDeleteReviewerAssignment = (assignment) => {
    setReviewerToDelete(assignment);
    setShowDeleteConfirmationReviewer(true);
  };
  // Close delete confirmation for reviewer assignment
  const cancelDeleteReviewerAssignment = () => {
    setShowDeleteConfirmationReviewer(false);
    setReviewerToDelete(null);
  };

  // Open delete confirmation for assignment
  const confirmDeleteAssignment = (assignment) => {
    setAssignmentToDelete(assignment);
    setShowDeleteConfirmation(true);
  };

  // Close delete confirmation for assignment
  const cancelDeleteAssignment = () => {
    setShowDeleteConfirmation(false);
    setAssignmentToDelete(null);
  };

  // --- JSX Rendering ---
  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden shadow-xl rounded-lg ">
        {/* Left Panel: Questions List */}
        <div
          className={`flex flex-col ${
            activeQuestion ? "w-3/4" : "w-full"
          } bg-white border-r border-slate-200 transition-width duration-300 ease-in-out`} // Added transition
        >
          {/* Top Bar: Tabs and Actions */}
          <div className="flex items-center border-b border-slate-200 p-4 bg-white sticky top-0 z-10">
            {/* ... (Tabs: All, Assigned, Review - Keep existing logic) ... */}
            <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
              {/* All Questions Tab (Always visible) */}
              <button
                className={`flex items-center px-4 py-1.5 rounded-md text-sm transition-colors ${
                  activeQuestionTab === "all"
                    ? "bg-white text-indigo-700 font-semibold shadow-sm"
                    : "text-slate-600 hover:text-slate-800"
                }`}
                onClick={() => setActiveQuestionTab("all")}
              >
                <FileText size={14} className="mr-1.5" />
                <span>All Questions</span>
              </button>

              {/* Assigned for Answering Tab (Company Representative) */}
              {projectRole === "company_representative" && (
                <button
                  className={`flex items-center px-4 py-1.5 rounded-md text-sm transition-colors ${
                    activeQuestionTab === "assigned_for_answering"
                      ? "bg-white text-indigo-700 font-semibold shadow-sm"
                      : "text-slate-600 hover:text-slate-800"
                  }`}
                  onClick={() => setActiveQuestionTab("assigned_for_answering")}
                >
                  <User size={14} className="mr-1.5" />
                  <span>Assigned to Me</span>
                </button>
              )}

              {/* Assigned for Review Tab (Consultant/Auditor) */}
              {(projectRole === "consultant" || projectRole === "auditor") && (
                <button
                  className={`flex items-center px-4 py-1.5 rounded-md text-sm transition-colors ${
                    activeQuestionTab === "assigned_for_review"
                      ? "bg-white text-indigo-700 font-semibold shadow-sm"
                      : "text-slate-600 hover:text-slate-800"
                  }`}
                  onClick={() => setActiveQuestionTab("assigned_for_review")}
                >
                  <CheckCircle size={14} className="mr-1.5" />
                  <span>For My Review</span>
                </button>
              )}
            </div>
            {/* ... (Action Buttons: Search, Filter, Add, Upload - Keep existing logic) ... */}
            <div className="flex ml-auto gap-2">
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
                        ? "text-indigo-500" // Active if any filter or search is set
                        : "text-slate-400"
                    }`}
                  />
                  <span>Filter</span>
                  {(filters.control_theme ||
                    filters.function ||
                    searchQuery) && (
                    <span className="ml-2 bg-indigo-100 text-indigo-600 text-xs font-medium px-2 py-0.5 rounded-full">
                      {
                        [
                          filters.control_theme && "Theme",
                          filters.function && "Function",
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
                      {(filters.control_theme ||
                        filters.function ||
                        searchQuery) && (
                        <span className="text-xs text-indigo-600">
                          {/* Display count if needed */}
                        </span>
                      )}
                    </div>
                    {/* Scrollable Filters */}
                    <div className="overflow-y-auto">
                      {/* Control Theme */}
                      <div className="p-3 border-b border-slate-200">
                        <h4 className="text-sm font-medium text-slate-700 mb-2 flex justify-between">
                          <span>Control Theme</span>
                          {filters.control_theme && (
                            <button
                              onClick={() =>
                                handleFilterChange("control_theme", "")
                              }
                              className="text-xs text-slate-500 hover:text-slate-700"
                            >
                              Clear
                            </button>
                          )}
                        </h4>
                        <div className="space-y-1">
                          {controlThemes.map((theme) => (
                            <button
                              key={theme}
                              onClick={() =>
                                handleFilterChange("control_theme", theme)
                              }
                              className={`w-full text-left px-2 py-1.5 rounded text-sm ${
                                filters.control_theme === theme
                                  ? "bg-indigo-50 text-indigo-700 font-medium"
                                  : "text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              {theme}
                            </button>
                          ))}
                        </div>
                      </div>
                      {/* Associated Function */}
                      <div className="p-3 border-b border-slate-200">
                        <h4 className="text-sm font-medium text-slate-700 mb-2 flex justify-between">
                          <span>Associated Function</span>
                          {filters.function && (
                            <button
                              onClick={() => handleFilterChange("function", "")}
                              className="text-xs text-slate-500 hover:text-slate-700"
                            >
                              Clear
                            </button>
                          )}
                        </h4>
                        <div className="space-y-1">
                          {availableFunctions.map((func) => (
                            <button
                              key={func.id}
                              onClick={() =>
                                handleFilterChange("function", func.label)
                              }
                              className={`w-full text-left px-2 py-1.5 rounded text-sm ${
                                filters.function === func.label
                                  ? "bg-indigo-50 text-indigo-700 font-medium"
                                  : "text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              {func.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      {/* Active Filters Summary */}
                      {(filters.control_theme ||
                        filters.function ||
                        searchQuery) && (
                        <div className="px-3 py-2 bg-slate-50 border-b border-slate-200">
                          <h4 className="text-xs font-medium text-slate-600 mb-1">
                            Active Filters:
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {filters.control_theme && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs">
                                Theme: {filters.control_theme}
                                <button
                                  onClick={() =>
                                    handleFilterChange("control_theme", "")
                                  }
                                  className="ml-1 hover:text-indigo-900"
                                >
                                  <X size={12} />
                                </button>
                              </span>
                            )}
                            {filters.function && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs">
                                Function: {filters.function}
                                <button
                                  onClick={() =>
                                    handleFilterChange("function", "")
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
              {/* More Options Button (Placeholder) */}
              {/* <button className="p-2.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                <MoreHorizontal size={16} />
              </button> */}
              {/* Prev/Next Buttons (Placeholder) */}
              {/* <button className="p-2.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                <ChevronLeft size={16} />
              </button> */}
              {/* Add/Upload Buttons (Conditional) */}
              {(projectRole === "consultant admin" ||
                projectRole === "company") && (
                <>
                  <button
                    className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg flex items-center hover:bg-indigo-700 transition-colors shadow-sm hover:shadow-md"
                    onClick={openAddQuestionModal}
                  >
                    <Plus size={16} className="mr-1.5" />
                    <span>Ask Question</span>
                  </button>
                  <button
                    className="px-4 py-2.5 border border-slate-200 bg-white rounded-lg flex items-center hover:bg-slate-50 transition-colors shadow-sm text-slate-700"
                    onClick={() => setIsUploadModalOpen(true)}
                  >
                    <FileText size={16} className="mr-1.5 text-indigo-500" />
                    <span>Upload Excel</span>
                  </button>
                </>
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
                    <th className="w-12 p-4 text-left font-semibold text-slate-600"></th>
                    <th className="w-24 p-4 text-left font-semibold text-slate-600">
                      Control #
                    </th>
                    <th className="w-52 p-4 text-left font-semibold text-slate-600">
                      Control Name
                    </th>
                    <th className="p-4 text-left font-semibold text-slate-600">
                      Audit Question
                    </th>
                    {/* Conditionally render Assigned To header */}
                    {projectRole === "company" && (
                      <th className="w-32 p-4 text-left font-semibold text-slate-600">
                        Assigned To
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {questionsToDisplay.map((question) => (
                    <tr
                      key={question.id}
                      className={`hover:bg-indigo-50/50 cursor-pointer transition-colors ${
                        activeQuestion?.id === question.id
                          ? "bg-indigo-50/70" // Slightly stronger highlight
                          : ""
                      }`}
                      onClick={() => selectQuestion(question)}
                    >
                      <td className="p-4">
                        {/* Checkbox (keep styling) */}
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          onClick={(e) => e.stopPropagation()} // Prevent row click
                        />
                      </td>
                      <td className="p-4">
                        {/* Control Number */}
                        <span className="text-indigo-600 font-semibold">
                          {question.control_number}
                        </span>
                      </td>
                      {/* Control Name */}
                      <td className="p-4 text-slate-700 font-medium">
                        {question.control_name}
                      </td>
                      {/* Audit Question & Actions */}
                      <td className="p-4 pr-6 text-slate-600">
                        <div className="flex justify-between items-start">
                          {/* Question Text (Truncated) */}
                          <div
                            className="line-clamp-2"
                            title={question.audit_question}
                          >
                            {question.audit_question}
                          </div>
                          {/* Actions (Edit/Delete Question) - Conditional */}
                          <div className="flex items-center ml-2 flex-shrink-0">
                            {(projectRole === "consultant admin" ||
                              projectRole === "consultant") && (
                              <>
                                {/* Edit Button */}
                                <button
                                  className="text-slate-400 hover:text-indigo-600 transition-colors p-1 rounded hover:bg-slate-100" // Added padding/bg
                                  onClick={(e) =>
                                    handleEditQuestion(question.id, e)
                                  }
                                  title="Edit Question"
                                >
                                  <Edit size={16} />
                                </button>
                                {/* Delete Button */}
                                <button
                                  className="text-slate-400 hover:text-red-600 transition-colors ml-1 p-1 rounded hover:bg-slate-100" // Added padding/bg
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setQuestionToDelete(question.id);
                                    setDeleteConfirmVisible(true);
                                  }}
                                  title="Delete Question"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                      {/* Assigned To Cell (Conditional) */}
                      {projectRole === "company" && (
                        <td className="p-4">
                          {question.assignments &&
                          question.assignments.length > 0 ? (
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-600 font-medium">
                                {question.assignments.length} assigned
                              </span>
                              <button
                                className="ml-2 px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded hover:bg-slate-200 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveQuestion(question); // Set context
                                  toggleAssignDropdown(); // Open dropdown
                                }}
                                title="Assign more representatives"
                              >
                                Assign More
                              </button>
                            </div>
                          ) : (
                            <button
                              className="px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded hover:bg-slate-200 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveQuestion(question);
                                toggleAssignDropdown();
                              }}
                            >
                              Assign
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                  {/* No Questions Message */}
                  {questionsToDisplay.length === 0 && (
                    <tr>
                      <td
                        colSpan={projectRole === "company" ? 5 : 4}
                        className="text-center p-10 text-slate-500"
                      >
                        {" "}
                        {/* Adjusted colspan */}
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
            {" "}
            {/* Added transition */}
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white sticky top-0 z-30 shadow-md">
              <div>
                <h3 className="text-sm font-semibold">
                  Control {activeQuestion.control_number}
                </h3>
              </div>
              <div className="flex gap-1">
                <button
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                  onClick={() => {
                    setActiveQuestion(null);
                    setActiveSidebarTab("question");
                    resetEditStates();
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            {/* Tabs */}
            <div className="border-b border-slate-200 bg-white sticky top-[60px] z-20">
              {" "}
              {/* Adjust top based on header height */}
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
                  Answer & Evidence
                </button>
              </div>
            </div>
            {/* Tab Content Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {/* --- Question Tab --- */}
              {activeSidebarTab === "question" && (
                <>
                  {/* ... (Keep existing Question Header Info and Assignments sections) ... */}
                  {/* Question Header Information */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-slate-800 text-base">
                          {activeQuestion.control_name}
                        </h4>
                        {/* Assign Button (Conditional for Company) */}
                        {projectRole === "company" && (
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
                              <div className="absolute right-0 mt-1 w-64 bg-white border border-slate-200 rounded-lg shadow-xl z-30 max-h-[300px] overflow-y-auto">
                                {/* Dropdown Content */}
                                <div className="p-2 border-b border-slate-200 bg-slate-50 font-medium text-slate-700 text-sm">
                                  Assign Representative
                                </div>
                                {companyRepresentatives.length === 0 ? (
                                  <div className="p-3 text-center text-slate-500 text-sm">
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
                        )}{" "}
                        {/* End of conditional render for company role */}
                      </div>

                      {/* Use activeQuestion.audit_question */}
                      <div className="mt-3 text-sm text-slate-600 leading-relaxed">
                        <p>{activeQuestion.audit_question}</p>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {/* Use activeQuestion.associated_functions */}
                        {formatAssociatedFunctions(
                          activeQuestion.associated_functions
                        ).map((func, index) => (
                          <span
                            key={`func-${index}`}
                            className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium"
                          >
                            {func}
                          </span>
                        ))}
                        {/* Use activeQuestion.control_theme */}
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-medium">
                          {activeQuestion.control_theme}
                        </span>
                      </div>

                      {/* Removed Creator/Created At info specific to versions */}
                      {/* Optional: Add creator info from activeQuestion if needed */}
                      <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
                        {activeQuestion.created_by_details && (
                          <div className="flex items-center">
                            <User size={12} className="mr-1.5 text-slate-400" />
                            <span className="font-medium text-slate-600">
                              Created by:
                            </span>
                            &nbsp;
                            {activeQuestion.created_by_details.name}
                          </div>
                        )}
                        <div className="flex items-center">
                          <CalendarIcon
                            size={12}
                            className="mr-1.5 text-slate-400"
                          />
                          <span>{formatDate(activeQuestion.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Question Assignments Section */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between">
                      <h5 className="text-sm font-medium text-slate-700 flex items-center">
                        <Users size={15} className="mr-2 text-indigo-500" />{" "}
                        Assigned Representatives
                      </h5>
                      <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                        {questionAssignments.length}{" "}
                        {questionAssignments.length === 1 ? "Person" : "People"}
                      </span>
                    </div>

                    <div className="p-4">
                      {isLoadingAssignments ? (
                        <div className="py-8 flex flex-col items-center justify-center text-center">
                          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                          <p className="text-sm text-slate-500">
                            Loading assignments...
                          </p>
                        </div>
                      ) : questionAssignments.length > 0 ? (
                        <div className="space-y-3">
                          {questionAssignments.map((assignment) => (
                            <div
                              key={assignment.id}
                              className="bg-blue-50 rounded-lg p-3 relative group hover:shadow-md transition-shadow"
                            >
                              {/* Delete button - show for all assignments but backend will handle authorization */}
                              {projectRole === "company" && ( // Only company can delete assignments? Or creator? Confirm logic.
                                <button
                                  className="absolute top-2 right-2 p-1.5 bg-white text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 shadow-sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    confirmDeleteAssignment(assignment);
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
                                    {assignment.assigned_to_details?.name}
                                  </div>
                                  <div className="text-xs text-blue-600 truncate">
                                    {assignment.assigned_to_details?.email}
                                  </div>
                                  <div className="flex flex-wrap items-center mt-2 text-xs text-blue-500 gap-y-1">
                                    <div className="flex items-center bg-blue-100 px-2 py-0.5 rounded-full">
                                      <User size={10} className="mr-1" />
                                      <span className="truncate max-w-[100px]">
                                        {assignment.assigned_by_details?.name}
                                      </span>
                                    </div>
                                    <div className="mx-1.5 text-blue-300">
                                      •
                                    </div>
                                    <div className="flex items-center">
                                      <CalendarIcon
                                        size={10}
                                        className="mr-1"
                                      />
                                      <span>
                                        {formatDate(assignment.assigned_at)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-8 flex flex-col items-center justify-center text-center">
                          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
                            <Users size={20} />
                          </div>
                          <p className="text-slate-600 mb-1 font-medium">
                            No representatives assigned
                          </p>
                          <p className="text-xs text-slate-500">
                            Use the assign button to add company representatives
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
              {/* Answer Tab Content */}
              {activeSidebarTab === "answer" && (
                <>
                  {/* Answer & Evidence Section */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* Header with Conditional Edit Button */}
                    <div className="flex justify-between items-start px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex items-center">
                      <h5 className="font-medium text-slate-700 flex items-center">
                        <FileText size={15} className="mr-2 text-green-500" />{" "}
                        Answer & Evidence
                      </h5>
                      {/* Assign Button (Conditional for Admin) */}
                      {projectRole === "consultant admin" &&
                        activeQuestion.answer && (
                          <div
                            className="relative"
                            ref={assignReviewerDropdownRef}
                          >
                            <button
                              className="right-0 p-1.5 text-slate-500 hover:text-indigo-600 transition-colors hover:bg-slate-100 rounded-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleAssignMemberDropdown();
                              }}
                              title="Assign Reviewers"
                            >
                              <UserPlus size={16} />
                            </button>
                            {/* Assign Dropdown */}
                            {isAssignMemberDropdownOpen && (
                              <div className="absolute right-0 mt-1 w-64 bg-white border border-slate-200 rounded-lg shadow-xl z-30 max-h-[300px] overflow-y-auto">
                                {/* Dropdown Content */}
                                <div className="p-2 border-b border-slate-200 bg-slate-50 font-medium text-slate-700 text-sm">
                                  Assign Reviewers
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
                                          selectedMember?.id === member.id
                                            ? "bg-indigo-50 text-indigo-700"
                                            : "text-slate-700"
                                        }`}
                                        onClick={() =>
                                          setSelectedMember(member)
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
                                        {selectedMember?.id === member.id && (
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
                                          setIsAssignMemberDropdownOpen(false)
                                        }
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        className="px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={
                                          !selectedMember || isAssigning
                                        }
                                        onClick={() =>
                                          assignMemberForReview(
                                            activeQuestion.answer.id
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
                        )}{" "}
                      {/* End of conditional render for company role */}
                      {/* Edit Button */}
                      {activeQuestion.answer &&
                        (activeQuestion.answer.status === "Needs More Info" ||
                          activeQuestion.answer.status === "Submitted") &&
                        !isAddingAnswer &&
                        canUserAnswer && (
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
                      {/* Simple Status Indicator */}
                      {/* Conditionally display Review Comments FIRST if status is Needs More Info */}
                      {activeQuestion.answer &&
                        activeQuestion.answer.status === "Needs More Info" &&
                        activeQuestion.answer.review && (
                          <div className="mb-4 p-3 border border-yellow-300 bg-yellow-50 rounded-lg">
                            <h6 className="text-sm font-medium text-yellow-800 mb-2 flex items-center">
                              <AlertCircle size={14} className="mr-1.5" />{" "}
                              Feedback :
                            </h6>
                            <p className="text-sm text-yellow-700 italic mb-2">
                              {activeQuestion.answer.review.comments}
                            </p>
                            <div className="text-xs text-yellow-600 flex items-center justify-end">
                              <span>
                                by{" "}
                                {activeQuestion.answer.review.created_by_details
                                  ?.name || "Unknown"}{" "}
                                on{" "}
                                {formatDate(
                                  activeQuestion.answer.review.created_at
                                )}
                              </span>
                            </div>
                          </div>
                        )}

                      <p className="text-sm font-medium text-slate-600 mb-4 pb-3 border-b border-slate-100">
                        Status:{" "}
                        {activeQuestion.answer?.status ? (
                          <span
                            className={`inline-flex items-center ml-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${
                              activeQuestion.answer.status === "Accepted"
                                ? "bg-emerald-100 text-emerald-700"
                                : activeQuestion.answer.status === "Rejected"
                                ? "bg-red-100 text-red-700"
                                : activeQuestion.answer.status ===
                                  "Needs More Info"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-blue-100 text-blue-700" // Default for Submitted, etc.
                            }`}
                          >
                            {activeQuestion.answer.status === "Accepted" && (
                              <CheckCircle size={12} className="mr-1" />
                            )}
                            {activeQuestion.answer.status === "Rejected" && (
                              <X size={12} className="mr-1" />
                            )}
                            {activeQuestion.answer.status ===
                              "Needs More Info" && (
                              <AlertCircle size={12} className="mr-1" />
                            )}
                            {activeQuestion.answer.status}
                          </span>
                        ) : (
                          <span className="inline-flex items-center ml-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                            <X size={12} className="mr-1" /> Not Answered
                          </span>
                        )}
                      </p>

                      {/* --- Display Existing Answer (Read Only Mode) --- */}
                      {activeQuestion.answer && !isAddingAnswer && (
                        <>
                          {/* Answer Text */}
                          <div className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg mb-4">
                            {activeQuestion.answer.answer_text}
                          </div>
                          {/* Comments */}
                          {activeQuestion.answer.comments && (
                            <div className="mb-4">
                              <h6 className="text-sm font-medium text-slate-700 mb-2 flex items-center">
                                <MessageSquare
                                  size={12}
                                  className="mr-1.5 text-indigo-400"
                                />
                                Comments:
                              </h6>
                              <p className="text-sm text-slate-600 italic bg-indigo-50 p-3 rounded-lg">
                                {activeQuestion.answer.comments}
                              </p>
                            </div>
                          )}
                          {/* Evidence Files */}
                          {activeQuestion.answer.evidence_files &&
                            activeQuestion.answer.evidence_files.length > 0 && (
                              <div className="mb-4">
                                <h6 className="text-sm font-medium text-slate-700 mb-2 flex items-center">
                                  <FileText
                                    size={12}
                                    className="mr-1.5 text-indigo-400"
                                  />
                                  Evidence Files:
                                </h6>
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                  {activeQuestion.answer.evidence_files.map(
                                    (evidence) => (
                                      <div
                                        key={evidence.id}
                                        className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
                                      >
                                        <div className="flex items-center max-w-[70%]">
                                          <div className="bg-indigo-100 p-1.5 rounded flex-shrink-0 mr-2">
                                            <FileText className="text-indigo-500 h-4 w-4" />
                                          </div>
                                          <div className="overflow-hidden">
                                            <p
                                              className="text-sm font-medium text-slate-700 truncate"
                                              title={getFileName(evidence.file)}
                                            >
                                              {getFileName(evidence.file)}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                              {formatDate(evidence.uploaded_at)}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          {/* Updated href to use BASE_URL */}
                                          <a
                                            href={`${BASE_URL}${evidence.file}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium bg-indigo-50 px-2.5 py-1 rounded-full hover:bg-indigo-100 transition-colors"
                                          >
                                            View
                                          </a>
                                          {/* Evidence Delete Button - Logic removed for now during view */}
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                          {/* Removed Evidence Files (Read Only)
                            {activeQuestion.answer.removed_evidence_files &&
                              activeQuestion.answer.removed_evidence_files
                                .length > 0 && (
                                <div className="mt-4 pt-4 border-t border-dashed border-slate-200">
                                  <h6 className="text-sm font-medium text-slate-500 mb-2 flex items-center">
                                    <Trash2
                                      size={12}
                                      className="mr-1.5 text-slate-400"
                                    />{" "}
                                    Previously Removed Evidence:
                                  </h6>
                                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                    {activeQuestion.answer.removed_evidence_files.map(
                                      (removed_evidence) => (
                                        <div
                                          key={removed_evidence.id}
                                          className="flex items-center bg-slate-100 p-2.5 rounded-lg border border-slate-200"
                                        >
                                          <div className="bg-slate-200 p-1.5 rounded flex-shrink-0 mr-2">
                                            <FileText className="text-slate-500 h-4 w-4" />
                                          </div>
                                          <div className="overflow-hidden">
                                            <p
                                              className="text-sm font-medium text-slate-500 truncate line-through"
                                              title={getFileName(
                                                removed_evidence.file_path
                                              )}
                                            >
                                              {getFileName(
                                                removed_evidence.file_path
                                              )}
                                            </p>
                                            <p className="text-xs text-slate-400">
                                              Removed:{" "}
                                              {formatDate(
                                                removed_evidence.removed_at
                                              )}
                                            </p>
                                          </div>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              )} */}
                        </>
                      )}

                      {/* --- Add New Answer OR Edit Existing Answer Form --- */}
                      {isAddingAnswer && canUserAnswer && (
                        <form onSubmit={handleSubmitAnswer}>
                          <div className="space-y-4">
                            {/* Answer Text Input */}
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">
                                {isEditingAnswerId
                                  ? "Edit Your Answer"
                                  : "Your Answer"}
                              </label>
                              <textarea
                                value={newAnswer.answer_text}
                                onChange={(e) =>
                                  setNewAnswer({
                                    ...newAnswer,
                                    answer_text: e.target.value,
                                  })
                                }
                                rows="4"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all"
                                placeholder="Provide your answer here..."
                                required
                              ></textarea>
                            </div>
                            {/* Comments Input */}
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">
                                {isEditingAnswerId
                                  ? "Edit Comments (Optional)"
                                  : "Comments (Optional)"}
                              </label>
                              <textarea
                                value={newAnswer.comments}
                                onChange={(e) =>
                                  setNewAnswer({
                                    ...newAnswer,
                                    comments: e.target.value,
                                  })
                                }
                                rows="2"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all"
                                placeholder="Add any additional comments..."
                              ></textarea>
                            </div>

                            {/* --- Evidence Management (Only in Edit Mode) --- */}
                            {isEditingAnswerId && (
                              <div className="space-y-4 mt-4 pt-4 border-t border-dashed border-slate-200">
                                {/* 1. Current Evidence (with Delete option) */}
                                {edit_currentEvidences.length > 0 && (
                                  <div>
                                    <h6 className="text-sm font-medium text-slate-700 mb-2">
                                      Current Evidence:
                                    </h6>
                                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                      {edit_currentEvidences.map((ev) => (
                                        <div
                                          key={ev.id}
                                          className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-200"
                                        >
                                          <div className="flex items-center max-w-[70%]">
                                            <div className="bg-indigo-100 p-1.5 rounded flex-shrink-0 mr-2">
                                              <FileText className="text-indigo-500 h-4 w-4" />
                                            </div>
                                            <p
                                              className="text-sm font-medium text-slate-700 truncate"
                                              title={getFileName(
                                                ev.file || ev.file_path
                                              )}
                                            >
                                              {getFileName(
                                                ev.file || ev.file_path
                                              )}
                                            </p>
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleMarkForDelete(ev.id)
                                            }
                                            className="text-xs text-red-600 hover:text-red-800 font-medium flex items-center"
                                            title="Mark for Deletion"
                                          >
                                            <Trash2
                                              size={14}
                                              className="mr-1"
                                            />{" "}
                                            Delete
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* 2. Evidence Marked for Deletion (with Undo option) */}
                                {edit_deletedCurrentEvidences.length > 0 && (
                                  <div>
                                    <h6 className="text-sm font-medium text-amber-700 mb-2">
                                      Marked for Deletion:
                                    </h6>
                                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                      {edit_deletedCurrentEvidences.map(
                                        (ev) => (
                                          <div
                                            key={ev.id}
                                            className="flex items-center justify-between bg-amber-50 p-2 rounded-lg border border-amber-200"
                                          >
                                            <div className="flex items-center max-w-[70%]">
                                              <div className="bg-amber-100 p-1.5 rounded flex-shrink-0 mr-2">
                                                <FileText className="text-amber-500 h-4 w-4" />
                                              </div>
                                              <p
                                                className="text-sm font-medium text-amber-700 truncate line-through"
                                                title={getFileName(
                                                  ev.file || ev.file_path
                                                )}
                                              >
                                                {getFileName(
                                                  ev.file || ev.file_path
                                                )}
                                              </p>
                                            </div>
                                            <button
                                              type="button"
                                              onClick={() =>
                                                handleUndoDelete(ev.id)
                                              }
                                              className="text-xs text-slate-600 hover:text-slate-800 font-medium flex items-center"
                                              title="Undo Delete"
                                            >
                                              <RotateCcw
                                                size={14}
                                                className="mr-1"
                                              />{" "}
                                              Undo
                                            </button>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* 3. Previously Removed Evidence (with Restore option) */}
                                {edit_oldRemovedEvidences.length > 0 && (
                                  <div>
                                    <h6 className="text-sm font-medium text-slate-500 mb-2">
                                      Previously Removed:
                                    </h6>
                                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                      {edit_oldRemovedEvidences.map((ev) => (
                                        <div
                                          key={ev.id}
                                          className="flex items-center justify-between bg-slate-100 p-2 rounded-lg border border-slate-200"
                                        >
                                          <div className="flex items-center max-w-[70%]">
                                            <div className="bg-slate-200 p-1.5 rounded flex-shrink-0 mr-2">
                                              <FileText className="text-slate-500 h-4 w-4" />
                                            </div>
                                            <p
                                              className="text-sm font-medium text-slate-500 truncate line-through"
                                              title={getFileName(ev.file_path)}
                                            >
                                              {getFileName(ev.file_path)}
                                            </p>
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleMarkForRestore(ev.id)
                                            }
                                            className="text-xs text-emerald-600 hover:text-emerald-800 font-medium flex items-center"
                                            title="Mark for Restoration"
                                          >
                                            <RotateCcw
                                              size={14}
                                              className="mr-1"
                                            />{" "}
                                            Restore
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* 4. Evidence Marked for Restoration (with Undo option) */}
                                {edit_restoredOldEvidences.length > 0 && (
                                  <div>
                                    <h6 className="text-sm font-medium text-emerald-700 mb-2">
                                      Marked for Restoration:
                                    </h6>
                                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                      {edit_restoredOldEvidences.map((ev) => (
                                        <div
                                          key={ev.id}
                                          className="flex items-center justify-between bg-emerald-50 p-2 rounded-lg border border-emerald-200"
                                        >
                                          <div className="flex items-center max-w-[70%]">
                                            <div className="bg-emerald-100 p-1.5 rounded flex-shrink-0 mr-2">
                                              <FileText className="text-emerald-500 h-4 w-4" />
                                            </div>
                                            <p
                                              className="text-sm font-medium text-emerald-700 truncate"
                                              title={getFileName(ev.file_path)}
                                            >
                                              {getFileName(ev.file_path)}
                                            </p>
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleUndoRestore(ev.id)
                                            }
                                            className="text-xs text-slate-600 hover:text-slate-800 font-medium flex items-center"
                                            title="Undo Restore"
                                          >
                                            <RotateCcw
                                              size={14}
                                              className="mr-1"
                                            />{" "}
                                            Undo
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                            {/* --- End Evidence Management --- */}

                            {/* Upload NEW Evidence Area (for both New and Edit modes) */}
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">
                                {isEditingAnswerId
                                  ? "Upload New Evidence (Optional)"
                                  : "Upload Evidence Files (Optional)"}
                              </label>
                              {/* Drag & Drop Area */}
                              <div
                                className="border-2 border-dashed border-indigo-200 rounded-lg p-4 flex flex-col items-center justify-center bg-indigo-50/50 transition-colors hover:bg-indigo-50 cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={handleDragOver}
                                onDragEnter={handleDragEnter}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                              >
                                <input
                                  type="file"
                                  multiple
                                  className="hidden"
                                  ref={fileInputRef}
                                  onChange={(e) => {
                                    if (isEditingAnswerId) {
                                      handleAddNewEvidenceFiles(e.target.files);
                                    } else {
                                      handleMultipleFileSelect(e.target.files);
                                    }
                                    e.target.value = null; // Reset input
                                  }}
                                />
                                <div className="text-indigo-400 mb-2">
                                  <UploadCloud size={24} />
                                </div>
                                <p className="text-sm text-center text-slate-700 font-medium">
                                  Click to select files
                                </p>
                                <p className="text-xs text-center text-slate-500 mt-1">
                                  or drag and drop
                                </p>
                              </div>

                              {/* Display Newly Added Files (State depends on mode) */}
                              {((isEditingAnswerId &&
                                edit_newlyAddedEvidences.length > 0) ||
                                (!isEditingAnswerId &&
                                  uploadedEvidences.length > 0)) && (
                                <div className="mt-3">
                                  <h5 className="text-xs font-medium text-slate-700 mb-2">
                                    Files to Upload:
                                  </h5>
                                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                    {(isEditingAnswerId
                                      ? edit_newlyAddedEvidences
                                      : uploadedEvidences
                                    ).map((evidence) => (
                                      <div
                                        key={evidence.id}
                                        className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-200"
                                      >
                                        <div className="flex items-center max-w-[70%]">
                                          <div className="bg-indigo-100 p-1.5 rounded flex-shrink-0 mr-2">
                                            <FileText className="text-indigo-500 h-4 w-4" />
                                          </div>
                                          <p
                                            className="text-sm font-medium text-slate-700 truncate"
                                            title={evidence.displayName}
                                          >
                                            {evidence.displayName}
                                          </p>
                                        </div>
                                        {/* Remove button for newly added files */}
                                        <button
                                          type="button"
                                          onClick={() => {
                                            if (isEditingAnswerId) {
                                              handleRemoveNewEvidence(
                                                evidence.id
                                              );
                                            } else {
                                              setUploadedEvidences((prev) =>
                                                prev.filter(
                                                  (e) => e.id !== evidence.id
                                                )
                                              );
                                            }
                                          }}
                                          className="text-xs text-red-600 hover:text-red-800 font-medium"
                                        >
                                          <X size={16} />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 justify-end mt-4">
                              <button
                                type="button"
                                className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors text-sm"
                                onClick={resetEditStates}
                              >
                                {" "}
                                {/* Use consolidated reset */}
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
                                ) : isEditingAnswerId ? (
                                  "Update Answer"
                                ) : (
                                  "Submit Answer"
                                )}
                              </button>
                            </div>
                          </div>
                        </form>
                      )}

                      {/* --- Display "Cannot Answer" Message --- */}
                      {!isAddingAnswer &&
                        canUserAnswer &&
                        !activeQuestion.answer && (
                          <div className="py-8 flex flex-col items-center justify-center text-center">
                            <p className="text-slate-700 mb-1 font-medium">
                              {!activeQuestion.answer &&
                                "No answer has been provided yet."}
                            </p>
                            <p className="text-sm text-slate-500">
                              Click the button below to add an answer.
                            </p>
                            <button
                              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm flex items-center"
                              onClick={() => setIsAddingAnswer(true)}
                            >
                              <Plus size={16} className="mr-1.5" />
                              Add Answer
                            </button>
                            {!activeQuestion.answer && (
                              <p className="text-sm text-slate-500 italic">
                                {questionAssignments.length > 0
                                  ? "Only the Company admin or assigned users can answer."
                                  : "Waiting for assignment or admin action."}
                              </p>
                            )}
                          </div>
                        )}
                      {/* --- Display "Cannot Answer" Message --- */}
                      {!isAddingAnswer &&
                        !canUserAnswer &&
                        !activeQuestion.answer && (
                          <div className="py-8 flex flex-col items-center justify-center text-center">
                            {/* Message indicating no answer and why */}
                            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mb-3">
                              <X className="h-6 w-6 text-amber-600" />
                            </div>
                            <p className="text-slate-700 mb-1 font-medium">
                              {activeQuestion.answer
                                ? ""
                                : "No answer has been provided yet."}
                            </p>
                            {!activeQuestion.answer && (
                              <p className="text-sm text-slate-500 italic">
                                {questionAssignments.length > 0
                                  ? "Only the Company admin or assigned users can answer."
                                  : "Waiting for assignment or admin action."}
                              </p>
                            )}
                          </div>
                        )}

                      {/* --- Review Actions Section --- */}
                      {activeQuestion.answer &&
                        !isAddingAnswer &&
                        canUserReview &&
                        (activeQuestion.answer.status === "Submitted" ||
                          activeQuestion.answer.status === "Under Review") && (
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
                                  {isReviewSubmitting &&
                                    feedbackComment === "ACCEPT" && (
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
                                    {isReviewSubmitting &&
                                      feedbackComment !== "ACCEPT" && (
                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                                      )}
                                    Submit Feedback
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                    </div>{" "}
                    {/* End p-4 content area */}
                  </div>{" "}
                  {/* End Answer Section Card */}
                  {/* Reviewer Section */}
                  {activeQuestion.answer &&
                    activeQuestion.answer.review_assignments &&
                    activeQuestion.answer.review_assignments.length > 0 && (
                      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-5">
                        {" "}
                        {/* Added mt-5 for spacing */}
                        <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                          {" "}
                          {/* Header for review card */}
                          <h6 className="text-sm font-medium text-slate-700 flex items-center">
                            <Users
                              size={14}
                              className="mr-1.5 text-purple-500"
                            />{" "}
                            Reviewers
                          </h6>
                        </div>
                        <div className="p-4">
                          {" "}
                          {/* Content area for review card */}
                          <div className="space-y-3">
                            {activeQuestion.answer.review_assignments.map(
                              (reviewAssignment) => (
                                <div
                                  key={reviewAssignment.id}
                                  className="bg-purple-50 rounded-lg p-3 relative group border border-purple-100 hover:shadow-md transition-shadow"
                                >
                                  {/* Delete button - show for admin */}
                                  {projectRole === "consultant admin" && ( // Only admin can delete reviewers.
                                    <button
                                      className="absolute top-2 right-2 p-1.5 bg-white text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-100 shadow-sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        confirmDeleteReviewerAssignment(
                                          reviewAssignment
                                        );
                                      }}
                                      title="Remove assignment"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  )}
                                  <div className="flex items-start justify-between mb-1">
                                    <div className="flex items-center">
                                      <div className="h-8 w-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mr-2">
                                        <User size={16} />
                                      </div>
                                      <div>
                                        <div className="text-sm font-medium text-purple-800">
                                          {reviewAssignment.assigned_to_details
                                            ?.name || "N/A"}
                                        </div>
                                        <div className="text-xs text-purple-600 truncate">
                                          {reviewAssignment.assigned_to_details
                                            ?.email || "N/A"}
                                        </div>
                                      </div>
                                    </div>
                                    {/* Status Badge */}
                                  </div>
                                  {/* <div className="text-xs text-purple-500 pl-10 space-y-1"> 
                                 <p>
                                  Assigned by:{" "}
                                  <span className="font-medium text-purple-600">
                                    {reviewAssignment.assigned_by_details
                                      ?.name || "N/A"}
                                  </span>
                                </p>
                                <p>
                                  Assigned at:{" "}
                                  <span className="font-medium text-purple-600">
                                    {formatDate(reviewAssignment.assigned_at)}
                                  </span>
                                </p>
                                {reviewAssignment.is_completed &&
                                  reviewAssignment.completed_at && (
                                    <p>
                                      Completed at:{" "}
                                      <span className="font-medium text-purple-600">
                                        {formatDate(
                                          reviewAssignment.completed_at
                                        )}
                                      </span>
                                    </p>
                                  )}
                              </div> */}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  {/* End Answer Section Card */}
                </>
              )}{" "}
              {/* End Answer Tab Content */}
            </div>{" "}
            {/* End Sidebar Content */}
          </div> /* End Right Panel */
        )}

        {/* --- Modals --- */}
        {/* Add/Edit Question Modal */}
        {isAddQuestionModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 backdrop-blur-sm">
            {/* ... (Keep existing Add/Edit Question Modal JSX) ... */}
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
              <div className="flex items-center justify-between p-4 border-b border-slate-200">
                <h3 className="text-lg font-medium text-slate-800">
                  {isEditMode ? "Edit Question" : "Ask a Question"}
                </h3>
                <button
                  className="text-slate-400 hover:text-slate-500 transition-colors"
                  onClick={closeAddQuestionModal}
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmitQuestion}>
                <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
                  {" "}
                  {/* Added scroll */}
                  {/* Control Number */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Control Number(s)
                    </label>
                    <input
                      type="text"
                      name="control_number"
                      value={newQuestion.control_number}
                      onChange={handleInputChange}
                      placeholder="e.g. 5.1, 5.2, 5.3"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all"
                      required
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Separate multiple control numbers with commas
                    </p>
                  </div>
                  {/* Control Name */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Control Name(s)
                    </label>
                    <input
                      type="text"
                      name="control_name"
                      value={newQuestion.control_name}
                      onChange={handleInputChange}
                      placeholder="e.g. Policies for Information Security"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all"
                      required
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Separate multiple control names with commas
                    </p>
                  </div>
                  {/* Audit Question */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Audit Question
                    </label>
                    <textarea
                      name="audit_question"
                      value={newQuestion.audit_question}
                      onChange={handleInputChange}
                      placeholder="Enter your question here..."
                      rows="4"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all"
                      required
                    ></textarea>
                  </div>
                  {/* Associated Functions */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Associated Functions
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={toggleDropdown}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 bg-white text-left flex justify-between items-center"
                      >
                        <span className="text-sm text-slate-700">
                          {(newQuestion.associated_functions?.length || 0) === 0
                            ? "Select functions..."
                            : `${newQuestion.associated_functions.length} function(s) selected`}
                        </span>
                        <ChevronRight
                          size={16}
                          className={`text-slate-400 transform transition-transform ${
                            dropdownOpen ? "rotate-90" : ""
                          }`}
                        />{" "}
                        {/* Better icon */}
                      </button>
                      {dropdownOpen && (
                        <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                          <div className="p-2">
                            {availableFunctions.map((func) => (
                              <div
                                key={func.id}
                                className="flex items-center py-1.5 px-3 hover:bg-slate-50 rounded-lg cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  id={`func-${func.id}`}
                                  checked={newQuestion.associated_functions?.includes(
                                    func.name
                                  )}
                                  onChange={() =>
                                    handleFunctionToggle(func.name)
                                  }
                                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <label
                                  htmlFor={`func-${func.id}`}
                                  className="ml-2 text-sm text-slate-700 cursor-pointer w-full"
                                  onClick={() =>
                                    handleFunctionToggle(func.name)
                                  }
                                >
                                  {func.name}
                                </label>
                              </div>
                            ))}
                          </div>
                          <div className="p-2 border-t border-slate-200 flex justify-between">
                            <button
                              type="button"
                              className="text-xs text-slate-600 hover:text-slate-800"
                              onClick={() =>
                                setNewQuestion({
                                  ...newQuestion,
                                  associated_functions: [],
                                })
                              }
                            >
                              Clear all
                            </button>
                            <button
                              type="button"
                              className="text-xs text-indigo-600 hover:text-indigo-800"
                              onClick={toggleDropdown}
                            >
                              Done
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    {newQuestion.associated_functions?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {newQuestion.associated_functions.map((func, index) => (
                          <span
                            key={`selected-func-${index}`}
                            className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium"
                          >
                            {func}{" "}
                            <button
                              type="button"
                              onClick={() => handleFunctionToggle(func)}
                              className="ml-1.5 text-blue-600 hover:text-blue-800"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Control Theme */}
                  <div className="mb-4">
                    <label
                      htmlFor="control_theme"
                      className="block text-sm font-medium text-slate-700 mb-1"
                    >
                      Control Theme
                    </label>
                    <select
                      id="control_theme"
                      name="control_theme"
                      value={newQuestion.control_theme}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    >
                      <option value="">Select a control theme</option>
                      <option value="Organizational">Organizational</option>
                      <option value="People">People</option>
                      <option value="Physical">Physical</option>
                      <option value="Technological">Technological</option>
                    </select>
                  </div>
                </div>
                {/* Modal Footer */}
                <div className="flex justify-end p-4 border-t border-slate-200 bg-slate-50 rounded-b-xl gap-2">
                  <button
                    type="button"
                    className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors text-sm"
                    onClick={closeAddQuestionModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    {isEditMode ? "Update Question" : "Submit Question"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Question Confirmation Modal */}
        {deleteConfirmVisible && questionToDelete && (
          <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 backdrop-blur-sm">
            {/* ... (Keep existing Delete Question Modal JSX) ... */}
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
              <h3 className="text-lg font-medium text-slate-800 mb-4">
                Confirm Deletion
              </h3>
              <p className="text-slate-600 mb-6">
                Are you sure you want to delete this question? This action
                cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setDeleteConfirmVisible(false);
                    setQuestionToDelete(null);
                  }}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteQuestionFromList(questionToDelete)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Upload Excel Modal */}
        {isUploadModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            {/* ... (Keep existing Upload Excel Modal JSX) ... */}
            <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Upload Questions
                  </h3>
                  <button
                    onClick={handleCloseUploadModal}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500">
                    Upload an Excel file containing questions.
                  </p>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileSelect}
                    className="mt-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                  {selectedFile && (
                    <p className="mt-2 text-sm font-medium text-indigo-600">
                      {selectedFile.name}
                    </p>
                  )}
                  <div className="mt-5 flex justify-end space-x-2">
                    <button
                      onClick={handleCloseUploadModal}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUploadQuestions}
                      disabled={!selectedFile}
                      className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                        selectedFile
                          ? "bg-indigo-600 hover:bg-indigo-700"
                          : "bg-gray-300 cursor-not-allowed"
                      }`}
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Assignment Confirmation Modal */}
        {showDeleteConfirmation && assignmentToDelete && (
          <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 backdrop-blur-sm">
            {/* ... (Keep existing Delete Assignment Modal JSX) ... */}
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
                  {assignmentToDelete.assigned_to_details?.name}
                </span>{" "}
                will no longer be assigned to this question.
              </p>
              <p className="text-xs text-amber-600 mb-5 flex items-start bg-amber-50 p-3 rounded-lg">
                <AlertCircle size={16} className="mr-2 flex-shrink-0 mt-0.5" />{" "}
                Note: Only the campany can remove it. If you didn't create this
                assignment, this action will fail.
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
            {/* ... (Keep existing Delete Assignment Modal JSX) ... */}
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
                  {reviewerToDelete.assigned_to_details?.name}
                </span>{" "}
                will no longer be assigned to this answer for reviewing.
              </p>
              <p className="text-xs text-amber-600 mb-5 flex items-start bg-amber-50 p-3 rounded-lg">
                <AlertCircle size={16} className="mr-2 flex-shrink-0 mt-0.5" />{" "}
                Note: Only the admin can remove it. If you are not the admin,
                this action will fail.
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
      </div>{" "}
      {/* End Main Content Flex Container */}
    </div> // End Top Level Container
  );
};

export default Questionnaire;
