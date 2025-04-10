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
} from "lucide-react";
import { ProjectContext } from "../../../Context/ProjectContext";
import { AuthContext } from "../../../AuthContext";
import { apiRequest, BASE_URL } from "../../../utils/api";
import { useParams } from "react-router-dom";
import { message } from "antd";
const Questionnaire = () => {
  const { projectid } = useParams();
  const { projectRole, project } = useContext(ProjectContext);
  const { user } = useContext(AuthContext);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [isEvidenceUploading, setIsEvidenceUploading] = useState(false);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [evidenceUploaded, setEvidenceUploaded] = useState({});
  const [isAddQuestionModalOpen, setIsAddQuestionModalOpen] = useState(false);
  const [editDropdownOpen, setEditDropdownOpen] = useState(null);
  const [isAddingAnswer, setIsAddingAnswer] = useState(false);
  const [newAnswer, setNewAnswer] = useState({ answer_text: "", comments: "" });
  const [newQuestion, setNewQuestion] = useState({
    control_number: "",
    control_name: "",
    audit_question: "",
    associated_functions: [],
    control_theme: "",
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [uploadedEvidences, setUploadedEvidences] = useState([]);
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
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
  const [questionAssignments, setQuestionAssignments] = useState([]);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);
  const [isDeletingAssignment, setIsDeletingAssignment] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isCurrentUserAssigned, setIsCurrentUserAssigned] = useState(false);

  // Define available control themes
  const controlThemes = [
    "Organizational",
    "People",
    "Physical",
    "Technological"
  ];

  const selectQuestion = async (question) => {
    setActiveQuestion(question);
    setCurrentVersionIndex(0); // Reset to the latest version

    // Fetch question versions
    await fetchQuestionVersions(question.id);

    // Fetch question assignments
    await fetchQuestionAssignments(question.id);
  };

  const fetchQuestionVersions = async (questionId) => {
    setIsLoadingVersions(true);
    try {
      const response = await apiRequest(
        "GET",
        `/api/questionnaire/questions/${questionId}/versions/`,
        null,
        true
      );

      if (response.status === 200) {
        setQuestionVersions(response.data);
      } else {
        message.error("Failed to fetch question versions");
        setQuestionVersions([]);
      }
    } catch (error) {
      console.error("Error fetching question versions:", error);
      message.error("Failed to fetch question versions");
      setQuestionVersions([]);
    } finally {
      setIsLoadingVersions(false);
    }
  };

  const fetchQuestionAssignments = async (questionId) => {
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
        console.log("Question assignments:", response.data);

        // Check if current user is assigned to this question
        if (user && response.data.length > 0) {
          const isAssigned = response.data.some(assignment =>
            assignment.assigned_to_details &&
            assignment.assigned_to_details.id === user.id
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

  const navigateToVersion = (direction) => {
    if (direction === "prev" && currentVersionIndex < questionVersions.length - 1) {
      setCurrentVersionIndex(currentVersionIndex + 1);
    } else if (direction === "next" && currentVersionIndex > 0) {
      setCurrentVersionIndex(currentVersionIndex - 1);
    }
  };

  // Get the current version to display
  const getCurrentVersionToDisplay = () => {
    if (questionVersions.length === 0) {
      return activeQuestion;
    }
    return questionVersions[currentVersionIndex];
  };

  const toggleFilterDropdown = () => {
    setFilterDropdownOpen(!filterDropdownOpen);
  };

  const openAddQuestionModal = () => {
    setIsAddQuestionModalOpen(true);
  };

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewQuestion({
      ...newQuestion,
      [name]: value,
    });
  };

  const handleFunctionToggle = (func) => {
    if (newQuestion.associated_functions.includes(func)) {
      setNewQuestion({
        ...newQuestion,
        associated_functions: newQuestion.associated_functions.filter(
          (f) => f !== func
        ),
      });
    } else {
      setNewQuestion({
        ...newQuestion,
        associated_functions: [...newQuestion.associated_functions, func],
      });
    }
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleSubmitQuestion = async (e) => {
    e.preventDefault();
    let associated_functions = newQuestion.associated_functions.reduce(
      (acc, func) => {
        return (acc += "," + func);
      },
      ""
    );
    associated_functions = associated_functions.slice(1);

    const questionData = {
      control_number: newQuestion.control_number,
      control_name: newQuestion.control_name,
      audit_question: newQuestion.audit_question,
      functions_csv: associated_functions,
      control_theme: newQuestion.control_theme,
    };

    let response;

    if (isEditMode && questionToEdit) {
      // Update existing question
      response = await apiRequest(
        "PUT",
        `/api/questionnaire/questions/${questionToEdit}/`,
        questionData,
        true
      );
    } else {
      // Create new question
      response = await apiRequest(
        "POST",
        `/api/questionnaire/projects/${projectid}/questions/create/`,
        questionData,
        true
      );
    }

    if (response.status === 200 || response.status === 201) {
      closeAddQuestionModal();
      handleGetQuestions();
      message.success(isEditMode ? "Question updated successfully" : "Question created successfully");
    } else {
      message.error(isEditMode ? "Failed to update question" : "Failed to create question");
    }
  };

  const toggleEditDropdown = (questionId, e) => {
    e.stopPropagation();
    if (editDropdownOpen === questionId) {
      setEditDropdownOpen(null);
    } else {
      setEditDropdownOpen(questionId);
    }
  };

  const handleEditQuestion = (questionId, e) => {
    e.stopPropagation();
    setEditDropdownOpen(null);

    // Find the question to edit
    const questionToUpdate = questions.find(q => q.id === questionId);
    if (questionToUpdate) {
      // Ensure associated_functions is an array of strings
      let associatedFunctions = [];

      if (questionToUpdate.associated_functions) {
        // If it's already an array of strings, use it directly
        if (Array.isArray(questionToUpdate.associated_functions)) {
          associatedFunctions = questionToUpdate.associated_functions;
        }
        // If it's a comma-separated string, split it
        else if (typeof questionToUpdate.associated_functions === 'string') {
          associatedFunctions = questionToUpdate.associated_functions.split(',').map(func => func.trim());
        }
        // If it's an array of objects with id and name, extract the names
        else if (Array.isArray(questionToUpdate.associated_functions) &&
          questionToUpdate.associated_functions.length > 0 &&
          typeof questionToUpdate.associated_functions[0] === 'object') {
          associatedFunctions = questionToUpdate.associated_functions.map(func => func.name || func.label || '');
        }
      }

      // Set the question data to the form
      setNewQuestion({
        control_number: questionToUpdate.control_number,
        control_name: questionToUpdate.control_name,
        audit_question: questionToUpdate.audit_question,
        associated_functions: associatedFunctions,
        control_theme: questionToUpdate.control_theme || "",
      });
      setQuestionToEdit(questionId);
      setIsEditMode(true);
      setIsAddQuestionModalOpen(true);
    }
  };

  const handleDeleteQuestion = (questionId, e) => {
    e.stopPropagation();
    setEditDropdownOpen(null);
    // Delete functionality will be added later
    console.log("Delete question:", questionId);
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("answer_text", newAnswer.answer_text);
      formData.append("comments", newAnswer.comments || "");

      // Add evidence files if any
      if (uploadedEvidences.length > 0) {
        uploadedEvidences.forEach((evidence) => {
          // Only append files, not object URLs
          if (evidence.originalFile) {
            formData.append("evidence_files", evidence.originalFile);
          }
        });
      }

      const response = await apiRequest(
        "POST",
        `/api/questionnaire/questions/${activeQuestion.id}/answer/`,
        formData,
        true
      );

      if (response.status === 201 || response.status === 200) {
        message.success("Answer submitted successfully");
        console.log(response.data);
        setActiveQuestion({
          ...activeQuestion,
          answer: response.data,
        });

        // Refresh the questions list
        handleGetQuestions();

        // Reset form
        setIsAddingAnswer(false);
        setNewAnswer({ answer_text: "", comments: "" });
        setUploadedEvidences([]);
      } else {
        message.error("Failed to submit answer");
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
      message.error("Failed to submit answer");
    }
  };

  // Check if user can answer questions
  const canAnswerQuestions =
    projectRole === "admin" || projectRole === "consultant";

  // Questions data from the provided JSON
  const [questions, setQuestions] = useState([]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check if the file is an Excel file
      if (
        file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/vnd.ms-excel"
      ) {
        setSelectedFile(file);
      } else {
        message.error("Please upload an Excel file (.xlsx or .xls)");
        e.target.value = null; // Reset file input
      }
    }
  };

  const handleUploadQuestions = async () => {
    if (selectedFile) {
      const formData = new FormData();
      formData.append("file", selectedFile);

      // Using the new API endpoint format with BASE_URL and projectid
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
        handleGetQuestions();
      } else {
        message.error("Failed to upload questions");
      }
    }
  };

  const filterOptions = [
    { id: "control-number", label: "Control Number" },
    { id: "control-name", label: "Control Name" },
    { id: "control-theme", label: "Control Theme" },
    { id: "functions", label: "Associated Functions" },
    { id: "status", label: "Status" },
    { id: "evidence", label: "Evidence" },
  ];

  const availableFunctions = [
    { id: "Compliance", label: "Compliance" },
    {
      id: "Exec. Management",
      label: "Exec. Management (Executive Management)",
    },
    { id: "Legal", label: "Legal" },
    { id: "HR", label: "HR (Human Resources)" },
    { id: "Finance", label: "Finance" },
    { id: "IT", label: "IT (Information Technology)" },
    { id: "Business ops", label: "Business ops (Business Operations)" },
    { id: "Admin", label: "Admin (Administration)" },
  ];

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper function to get filename from path
  const getFileName = (filePath) => {
    if (!filePath) return "";
    return filePath.split("/").pop();
  };

  // Handle evidence file upload
  const handleEvidenceUpload = (e) => {
    const files = e.target.files || e.dataTransfer.files;
    if (!files || !files.length) return;

    const newEvidences = Array.from(files).map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file: URL.createObjectURL(file),
      displayName: file.name,
      description: `Uploaded ${file.name}`,
      uploaded_at: new Date().toISOString(),
      size: file.size,
    }));

    setUploadedEvidences([...uploadedEvidences, ...newEvidences]);

    // If we have an active question, associate these evidences with it
    if (activeQuestion && activeQuestion.answer) {
      const updatedQuestion = {
        ...activeQuestion,
        answer: {
          ...activeQuestion.answer,
          evidences: [
            ...(activeQuestion.answer.evidences || []),
            ...newEvidences,
          ],
        },
      };
      setActiveQuestion(updatedQuestion);
    }
  };

  // Trigger file input click
  const triggerFileUpload = () => {
    fileInputRef.current.click();
  };

  // Handle drag events
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
    handleEvidenceUpload(e);
  };

  // Format bytes to human-readable size
  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const handleGetQuestions = async () => {
    const response = await apiRequest(
      "GET",
      `/api/questionnaire/projects/${projectid}/questions/list/`,
      null,
      true
    );
    if (response.status === 200) {
      setQuestions(response.data);
    }
  };

  useEffect(() => {
    handleGetQuestions();
  }, []);

  // Close upload modal and reset selected file
  const handleCloseUploadModal = () => {
    setIsUploadModalOpen(false);
    setSelectedFile(null);
  };

  const handleFileUploadForEvidence = async (file) => {
    if (!file) return;

    // Show loading animation
    setIsEvidenceUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await apiRequest(
        "POST",
        `/api/questionnaire/projects/${projectid}/answers/${activeQuestion.answer.id}/evidence/add/`,
        formData,
        true
      );

      if (response.status === 201 || response.status === 200) {
        message.success("Evidence added successfully");

        // Update the active question with the new evidence
        setActiveQuestion({
          ...activeQuestion,
          answer: {
            ...activeQuestion.answer,
            evidences: [...activeQuestion.answer.evidences, response.data],
          },
        });

        // Refresh the question data
        handleGetQuestions();
      } else {
        message.error("Failed to add evidence");
      }
    } catch (error) {
      console.error("Error adding evidence:", error);
      message.error("Failed to add evidence");
    } finally {
      // Hide loading animation
      setIsEvidenceUploading(false);
    }
  };

  const handleMultipleFileSelect = (files) => {
    if (!files || !files.length) return;

    const newEvidences = Array.from(files).map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file: URL.createObjectURL(file),
      displayName: file.name,
      originalFile: file, // Store the actual file for FormData
      description: `Uploaded ${file.name}`,
      uploaded_at: new Date().toISOString(),
      size: file.size,
    }));

    setUploadedEvidences([...uploadedEvidences, ...newEvidences]);
  };

  const handleDeleteQuestionFromList = async (questionId) => {
    try {
      const response = await apiRequest(
        "DELETE",
        `/api/questionnaire/questions/${questionId}/`,
        null,
        true
      );

      if (response.status === 204 || response.status === 200) {
        message.success("Question deleted successfully");
        // Remove the question from state
        setQuestions(questions.filter((q) => q.id !== questionId));
        // If the active question was deleted, clear it
        if (activeQuestion && activeQuestion.id === questionId) {
          setActiveQuestion(null);
        }
      } else {
        message.error("Failed to delete question");
      }
    } catch (error) {
      console.error("Error deleting question:", error);
      message.error("Failed to delete question");
    } finally {
      // Reset the confirmation dialog state
      setDeleteConfirmVisible(false);
      setQuestionToDelete(null);
    }
  };

  // Filter questions based on search and filters
  const getFilteredQuestions = () => {
    console.log('Current Filters:', filters);
    console.log('Search Query:', searchQuery);
    console.log('All Questions:', questions);

    return questions.filter(question => {
      // Search filter
      const searchLower = searchQuery.toLowerCase().trim();
      const matchesSearch = searchQuery === "" ||
        question.control_number?.toLowerCase().includes(searchLower) ||
        question.control_name?.toLowerCase().includes(searchLower) ||
        question.audit_question?.toLowerCase().includes(searchLower);

      // Theme filter
      const matchesTheme = !filters.control_theme ||
        question.control_theme?.toLowerCase() === filters.control_theme.toLowerCase();

      // Function filter
      const matchesFunction = !filters.function ||
        (Array.isArray(question.associated_functions) &&
          question.associated_functions.some(func => {
            if (typeof func === 'string') {
              return func.toLowerCase() === filters.function.toLowerCase();
            }
            // Handle both possible object formats
            if (typeof func === 'object') {
              const funcName = func.name || func.label || '';
              return funcName.toLowerCase() === filters.function.toLowerCase();
            }
            return false;
          })) ||
        // Handle case where associated_functions is a comma-separated string
        (typeof question.associated_functions === 'string' &&
          question.associated_functions.split(',').map(f => f.trim().toLowerCase())
            .includes(filters.function.toLowerCase()));

      console.log('Question:', question.control_number, {
        matchesSearch,
        matchesTheme,
        matchesFunction,
        'control_theme': question.control_theme,
        'associated_functions': question.associated_functions,
        'function_filter': filters.function
      });

      return matchesSearch && matchesTheme && matchesFunction;
    });
  };

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    console.log('Changing filter:', filterType, 'to:', value);
    setFilters(prev => {
      const newFilters = {
        ...prev,
        [filterType]: value === prev[filterType] ? "" : value // Toggle filter if clicking the same value
      };
      console.log('New filters:', newFilters);
      return newFilters;
    });
  };

  // Clear all filters
  const clearFilters = () => {
    console.log('Clearing all filters');
    setFilters({
      control_theme: "",
      function: "",
    });
    setSearchQuery("");
  };

  // Get filtered questions
  const filteredQuestions = useMemo(() => {
    const filtered = getFilteredQuestions();
    console.log('Filtered Questions:', filtered.length, 'of', questions.length);
    return filtered;
  }, [questions, filters, searchQuery]);

  // When displaying associated functions in the question list or details
  const formatAssociatedFunctions = (functions) => {
    if (!functions) return [];
    if (Array.isArray(functions)) {
      return functions.map(func =>
        typeof func === 'object' ? (func.name || func.label || '') : func
      );
    }
    if (typeof functions === 'string') {
      return functions.split(',').map(f => f.trim());
    }
    return [];
  };

  // Fetch company representatives
  const fetchCompanyRepresentatives = async () => {
    try {
      const response = await apiRequest(
        "GET",
        `/api/auth/projects/${projectid}/representatives/`,
        null,
        true
      );

      if (response.status === 200) {
        setCompanyRepresentatives(response.data);
      } else {
        message.error("Failed to fetch company representatives");
      }
    } catch (error) {
      console.error("Error fetching company representatives:", error);
      message.error("Failed to fetch company representatives");
    }
  };

  // Assign representative to question
  const assignRepresentativeToQuestion = async (questionId, representativeId) => {
    setIsAssigning(true);
    try {
      const response = await apiRequest(
        "POST",
        `/api/questionnaire/questions/${questionId}/assign/`,
        {
          assigned_to_ids: [representativeId] // Format as an array as per API reference
        },
        true
      );

      if (response.status === 200 || response.status === 201) {
        message.success("Representative assigned successfully");
        // Refresh assignments data
        await fetchQuestionAssignments(questionId);
        handleGetQuestions(); // Refresh questions list
      } else {
        message.error("Failed to assign representative");
      }
    } catch (error) {
      console.error("Error assigning representative:", error);
      message.error("Failed to assign representative");
    } finally {
      setIsAssigning(false);
      setIsAssignDropdownOpen(false);
      setSelectedRepresentative(null);
    }
  };

  // Toggle assign dropdown
  const toggleAssignDropdown = () => {
    if (!isAssignDropdownOpen) {
      fetchCompanyRepresentatives();
    }
    setIsAssignDropdownOpen(!isAssignDropdownOpen);
  };

  // Handle click outside assign dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (assignDropdownRef.current && !assignDropdownRef.current.contains(event.target)) {
        setIsAssignDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Remove assignment from question
  const removeAssignment = async (assignmentId) => {
    setIsDeletingAssignment(true);
    try {
      const response = await apiRequest(
        "DELETE",
        `/api/questionnaire/question-assignments/${assignmentId}/remove/`,
        null,
        true
      );

      if (response.status === 204) {
        message.success("Assignment removed successfully");
        // Refresh assignments data
        await fetchQuestionAssignments(activeQuestion.id);
        handleGetQuestions(); // Refresh questions list
      }
    } catch (error) {
      console.error("Error removing assignment:", error);
      // Check for specific error status
      if (error.response && error.response.status === 403) {
        message.error("Unauthorized: Only the user who created this assignment can remove it");
      } else {
        message.error("Failed to remove assignment");
      }
    } finally {
      setIsDeletingAssignment(false);
      setShowDeleteConfirmation(false);
      setAssignmentToDelete(null);
    }
  };

  // Open delete confirmation
  const confirmDeleteAssignment = (assignment) => {
    setAssignmentToDelete(assignment);
    setShowDeleteConfirmation(true);
  };

  // Close delete confirmation
  const cancelDeleteAssignment = () => {
    setShowDeleteConfirmation(false);
    setAssignmentToDelete(null);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden shadow-xl rounded-lg ">
        {/* Questions Panel */}
        <div
          className={`flex flex-col ${activeQuestion ? "w-3/4" : "w-full"
            } bg-white border-r border-slate-200`}
        >
          {/* Tabs and Actions */}
          <div className="flex items-center border-b border-slate-200 p-4 bg-white sticky top-0 z-10">
            <button className="flex items-center px-5 py-2.5 bg-indigo-50 text-indigo-700 font-medium rounded-lg transition-colors hover:bg-indigo-100">
              <FileText size={16} className="mr-2" />
              <span>Questions</span>
            </button>
            <div className="ml-3 text-slate-600 font-medium">
              ({filteredQuestions.length} of {questions.length})
            </div>
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
                  className={`px-4 py-2.5 border ${filterDropdownOpen ? 'border-indigo-300 ring-2 ring-indigo-300' : 'border-slate-200'} rounded-lg flex items-center text-slate-700 hover:bg-slate-50 transition-colors focus:outline-none shadow-sm`}
                  onClick={toggleFilterDropdown}
                >
                  <Filter size={16} className={`mr-2 ${Object.values(filters).some(f => f !== "") ? 'text-indigo-500' : 'text-slate-400'}`} />
                  <span>Filter</span>
                  {(filters.control_theme || filters.function || searchQuery) && (
                    <span className="ml-2 bg-indigo-100 text-indigo-600 text-xs font-medium px-2 py-0.5 rounded-full">
                      {[
                        filters.control_theme && "Theme",
                        filters.function && "Function",
                        searchQuery && "Search"
                      ].filter(Boolean).length}
                    </span>
                  )}
                </button>

                {filterDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-lg shadow-xl z-20 max-h-[calc(100vh-120px)] flex flex-col">
                    <div className="p-3 border-b border-slate-200 bg-slate-50 font-medium text-slate-700 flex justify-between items-center sticky top-0 z-10">
                      <span>Filter Options</span>
                      {(filters.control_theme || filters.function || searchQuery) && (
                        <span className="text-xs text-indigo-600">
                          {filteredQuestions.length} of {questions.length} questions
                        </span>
                      )}
                    </div>

                    <div className="overflow-y-auto">
                      {/* Control Theme Filter */}
                      <div className="p-3 border-b border-slate-200">
                        <h4 className="text-sm font-medium text-slate-700 mb-2 flex justify-between">
                          <span>Control Theme</span>
                          {filters.control_theme && (
                            <button
                              onClick={() => handleFilterChange('control_theme', '')}
                              className="text-xs text-slate-500 hover:text-slate-700"
                            >
                              Clear
                            </button>
                          )}
                        </h4>
                        <div className="space-y-1">
                          {controlThemes.map(theme => (
                            <button
                              key={theme}
                              onClick={() => handleFilterChange('control_theme', theme)}
                              className={`w-full text-left px-2 py-1.5 rounded text-sm ${filters.control_theme === theme
                                ? 'bg-indigo-50 text-indigo-700 font-medium'
                                : 'text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                              {theme}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Function Filter */}
                      <div className="p-3 border-b border-slate-200">
                        <h4 className="text-sm font-medium text-slate-700 mb-2 flex justify-between">
                          <span>Associated Function</span>
                          {filters.function && (
                            <button
                              onClick={() => handleFilterChange('function', '')}
                              className="text-xs text-slate-500 hover:text-slate-700"
                            >
                              Clear
                            </button>
                          )}
                        </h4>
                        <div className="space-y-1">
                          {availableFunctions.map(func => {
                            const funcLabel = typeof func === 'object' ? func.label : func;
                            return (
                              <button
                                key={typeof func === 'object' ? func.id : func}
                                onClick={() => handleFilterChange('function', funcLabel)}
                                className={`w-full text-left px-2 py-1.5 rounded text-sm ${filters.function === funcLabel
                                  ? 'bg-indigo-50 text-indigo-700 font-medium'
                                  : 'text-slate-600 hover:bg-slate-50'
                                  }`}
                              >
                                {funcLabel}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Active Filters Summary */}
                      {(filters.control_theme || filters.function || searchQuery) && (
                        <div className="px-3 py-2 bg-slate-50 border-b border-slate-200">
                          <h4 className="text-xs font-medium text-slate-600 mb-1">Active Filters:</h4>
                          <div className="flex flex-wrap gap-1">
                            {filters.control_theme && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs">
                                Theme: {filters.control_theme}
                                <button
                                  onClick={() => handleFilterChange('control_theme', '')}
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
                                  onClick={() => handleFilterChange('function', '')}
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
                                  onClick={() => setSearchQuery('')}
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

                    {/* Filter Actions - Sticky Footer */}
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
              <button className="p-2.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                <MoreHorizontal size={16} />
              </button>
              <button className="p-2.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                <ChevronLeft size={16} />
              </button>
              {(projectRole === "admin" || projectRole === "consultant") && (
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

          {/* Question List */}
          <div className="flex-1 overflow-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="w-12 p-4 text-left font-semibold text-slate-600"></th>
                  <th className="w-24 p-4 text-left font-semibold text-slate-600">
                    Control #
                  </th>
                  <th className="w-64 p-4 text-left font-semibold text-slate-600">
                    Control Name
                  </th>
                  <th className="p-4 text-left font-semibold text-slate-600">
                    Audit Question
                  </th>
                  <th className="w-24 p-4 text-left font-semibold text-slate-600">
                    Status
                  </th>
                  <th className="w-24 p-4 text-left font-semibold text-slate-600">
                    Assigned To
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredQuestions.map((question) => (
                  <tr
                    key={question.id}
                    className={`hover:bg-indigo-50/50 cursor-pointer transition-colors ${activeQuestion?.id === question.id
                      ? "bg-indigo-50/70"
                      : ""
                      }`}
                    onClick={() => selectQuestion(question)}
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    <td className="p-4">
                      <span className="text-indigo-600 font-semibold">
                        {question.control_number}
                      </span>
                    </td>
                    <td className="p-4 text-slate-700 font-medium">
                      {question.control_name}
                    </td>
                    <td className="p-4 pr-6 text-slate-600">
                      <div className="flex justify-between items-start">
                        <div className="line-clamp-2">
                          {question.audit_question}
                        </div>
                        <div className="flex items-center ml-2 flex-shrink-0">
                          {(projectRole === "admin" ||
                            projectRole === "consultant") && (
                              <>
                                <button
                                  className="text-slate-400 hover:text-indigo-600 transition-colors mr-2"
                                  onClick={(e) =>
                                    toggleEditDropdown(question.id, e)
                                  }
                                >
                                  <Edit size={16} />
                                </button>
                                {editDropdownOpen === question.id && (
                                  <div className="absolute mt-6 right-24 bg-white border border-slate-200 rounded-lg shadow-xl z-20">
                                    <div className="py-1">
                                      <button
                                        className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center"
                                        onClick={(e) =>
                                          handleEditQuestion(question.id, e)
                                        }
                                      >
                                        <Edit size={14} className="mr-2" />
                                        Edit
                                      </button>
                                      <button
                                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-slate-50 flex items-center"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setQuestionToDelete(question.id);
                                          setDeleteConfirmVisible(true);
                                        }}
                                      >
                                        <Trash2 size={14} className="mr-2" />
                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                )}
                                <button
                                  className="text-slate-400 hover:text-red-600 transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setQuestionToDelete(question.id);
                                    setDeleteConfirmVisible(true);
                                  }}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </>
                            )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center">
                        <span
                          className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-medium ${question.answer
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                            }`}
                        >
                          {question.answer ? "Completed" : "Pending"}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      {question.assigned_to ? (
                        <div className="flex items-center text-xs text-slate-600">
                          <span className="truncate max-w-[100px]" title={question.assigned_to.name}>
                            {question.assigned_to.name}
                          </span>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Panel - Only show when a question is selected */}
        {activeQuestion && (
          <div className="w-1/4 bg-white border-l border-slate-200 flex flex-col">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white sticky top-0 z-30 shadow-md">
              <div>
                <h3 className="text-sm font-semibold">
                  Control {activeQuestion.control_number}
                </h3>
              </div>
              <div className="flex gap-1">
                <button className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                  <ChevronLeft size={16} />
                </button>
                <button className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                  <ChevronRight size={16} />
                </button>
                <button
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                  onClick={() => setActiveQuestion(null)}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Version Navigation */}
            {questionVersions.length > 0 && (
              <div className="p-2 bg-indigo-50 border-b border-indigo-100 flex items-center justify-between sticky top-[60px] z-20">
                <div className="flex items-center text-xs text-indigo-700">
                  <Clock size={14} className="mr-1" />
                  <span>Version: {questionVersions.length - currentVersionIndex} of {questionVersions.length}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    className={`p-1.5 rounded-full transition-colors ${currentVersionIndex < questionVersions.length - 1
                      ? "text-indigo-600 hover:bg-indigo-100"
                      : "text-slate-300 cursor-not-allowed"}`}
                    onClick={() => navigateToVersion("prev")}
                    disabled={currentVersionIndex >= questionVersions.length - 1}
                  >
                    <ArrowLeft size={14} />
                  </button>
                  <button
                    className={`p-1.5 rounded-full transition-colors ${currentVersionIndex > 0
                      ? "text-indigo-600 hover:bg-indigo-100"
                      : "text-slate-300 cursor-not-allowed"}`}
                    onClick={() => navigateToVersion("next")}
                    disabled={currentVersionIndex <= 0}
                  >
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Version Info */}
            {questionVersions.length > 0 && currentVersionIndex > 0 && (
              <div className="px-4 py-2 bg-amber-50 border-b border-amber-100 text-xs text-amber-800 flex items-center">
                <Clock size={14} className="mr-2 flex-shrink-0 text-amber-500" />
                <p>
                  Viewing previous version from {new Date(questionVersions[currentVersionIndex].version_created_at).toLocaleString()}
                </p>
              </div>
            )}

            {/* Sidebar Content - Scrollable area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {/* Question Header Information */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-slate-800 text-base">
                      {getCurrentVersionToDisplay().control_name}
                    </h4>

                    {/* Assign Representative Button */}
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
                          <div className="p-2 border-b border-slate-200 bg-slate-50 font-medium text-slate-700 text-sm">
                            Assign Representative
                          </div>

                          {companyRepresentatives.length === 0 ? (
                            <div className="p-3 text-center text-slate-500 text-sm">
                              {isAssigning ? "Loading..." : "No representatives found"}
                            </div>
                          ) : (
                            <div className="p-1">
                              {companyRepresentatives.map((rep) => (
                                <button
                                  key={rep.id}
                                  className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between rounded-md hover:bg-slate-50 ${selectedRepresentative?.id === rep.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700'
                                    }`}
                                  onClick={() => setSelectedRepresentative(rep)}
                                >
                                  <div>
                                    <div className="font-medium">{rep.name}</div>
                                    <div className="text-xs text-slate-500">{rep.email}</div>
                                  </div>
                                  {selectedRepresentative?.id === rep.id && (
                                    <CheckCircle size={16} className="text-indigo-600" />
                                  )}
                                </button>
                              ))}

                              <div className="p-2 border-t border-slate-200 mt-1 flex justify-end gap-2">
                                <button
                                  className="px-3 py-1.5 text-xs bg-white border border-slate-200 text-slate-600 rounded-md hover:bg-slate-50"
                                  onClick={() => setIsAssignDropdownOpen(false)}
                                >
                                  Cancel
                                </button>
                                <button
                                  className="px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                  disabled={!selectedRepresentative || isAssigning}
                                  onClick={() => assignRepresentativeToQuestion(activeQuestion.id, selectedRepresentative.id)}
                                >
                                  {isAssigning ? "Assigning..." : "Assign"}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 text-sm text-slate-600 leading-relaxed">
                    <p>{getCurrentVersionToDisplay().audit_question}</p>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {formatAssociatedFunctions(getCurrentVersionToDisplay().associated_functions).map((func, index) => (
                      <span
                        key={`func-${index}`}
                        className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium"
                      >
                        {func}
                      </span>
                    ))}
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-medium">
                      {getCurrentVersionToDisplay().control_theme}
                    </span>
                  </div>

                  {/* Creator info - added for versions */}
                  {questionVersions.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
                      {questionVersions[currentVersionIndex].created_by_details && (
                        <div className="flex items-center">
                          <User size={12} className="mr-1.5 text-slate-400" />
                          <span className="font-medium text-slate-600">Created by:</span>&nbsp;
                          {questionVersions[currentVersionIndex].created_by_details.name}
                        </div>
                      )}
                      <div className="flex items-center">
                        <CalendarIcon size={12} className="mr-1.5 text-slate-400" />
                        <span>{new Date(questionVersions[currentVersionIndex].created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Question Assignments Section */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between">
                  <h5 className="text-sm font-medium text-slate-700 flex items-center">
                    <Users size={15} className="mr-2 text-indigo-500" />
                    Assigned Representatives
                  </h5>
                  <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                    {questionAssignments.length} {questionAssignments.length === 1 ? 'Person' : 'People'}
                  </span>
                </div>

                <div className="p-4">
                  {isLoadingAssignments ? (
                    <div className="py-8 flex flex-col items-center justify-center text-center">
                      <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                      <p className="text-sm text-slate-500">Loading assignments...</p>
                    </div>
                  ) : questionAssignments.length > 0 ? (
                    <div className="space-y-3">
                      {questionAssignments.map(assignment => (
                        <div key={assignment.assigned_to} className="bg-blue-50 rounded-lg p-3 relative group hover:shadow-md transition-shadow">
                          {/* Delete button - show for all assignments but backend will handle authorization */}
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
                                  <span className="truncate max-w-[100px]">{assignment.assigned_by_details?.name}</span>
                                </div>
                                <div className="mx-1.5 text-blue-300">•</div>
                                <div className="flex items-center">
                                  <CalendarIcon size={10} className="mr-1" />
                                  <span>{formatDate(assignment.assigned_at)}</span>
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
                      <p className="text-slate-600 mb-1 font-medium">No representatives assigned</p>
                      <p className="text-xs text-slate-500">
                        Use the assign button to add company representatives
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                  <h5 className="font-medium text-slate-700 flex items-center">
                    <MessageSquare size={15} className="mr-2 text-indigo-500" />
                    Response Status
                  </h5>
                </div>
                <div className="p-4">
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center text-slate-700 hover:bg-slate-50 p-2 rounded-lg transition-colors">
                      <input
                        type="radio"
                        name="status"
                        className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                        checked={!activeQuestion.answer}
                        readOnly
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">No Answer Provided</span>
                        <span className="text-xs text-slate-500">Question is pending response</span>
                      </div>
                      {!activeQuestion.answer && (
                        <X size={16} className="ml-auto text-red-500" />
                      )}
                    </label>
                    <label className="flex items-center text-slate-700 hover:bg-slate-50 p-2 rounded-lg transition-colors">
                      <input
                        type="radio"
                        name="status"
                        className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                        checked={!!activeQuestion.answer}
                        readOnly
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">Answer Provided</span>
                        <span className="text-xs text-slate-500">Question has been answered</span>
                      </div>
                      {!!activeQuestion.answer && (
                        <CheckCircle size={16} className="ml-auto text-green-500" />
                      )}
                    </label>
                  </div>
                </div>
              </div>

              {/* Answer Section */}
              {activeQuestion.answer ? (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                    <h5 className="font-medium text-slate-700 flex items-center">
                      <MessageSquare size={15} className="mr-2 text-green-500" />
                      Answer
                    </h5>
                  </div>
                  <div className="p-4">
                    <div className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">
                      {activeQuestion.answer.answer_text}
                    </div>

                    {activeQuestion.answer.comments && (
                      <div className="mt-4">
                        <h6 className="text-sm font-medium text-slate-700 mb-2 flex items-center">
                          <MessageSquare size={12} className="mr-1.5 text-indigo-400" />
                          Comments:
                        </h6>
                        <p className="text-sm text-slate-600 italic bg-indigo-50 p-3 rounded-lg">
                          {activeQuestion.answer.comments}
                        </p>
                      </div>
                    )}

                    {activeQuestion.answer.evidences &&
                      activeQuestion.answer.evidences.length > 0 && (
                        <div className="mt-4">
                          <h6 className="text-sm font-medium text-slate-700 mb-2 flex items-center">
                            <FileText size={12} className="mr-1.5 text-indigo-400" />
                            Evidence Files:
                          </h6>
                          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                            {activeQuestion.answer.evidences.map((evidence) => (
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
                                  <a
                                    href={evidence.file}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium bg-indigo-50 px-2.5 py-1 rounded-full hover:bg-indigo-100 transition-colors"
                                  >
                                    View
                                  </a>
                                  {projectRole === "company" && (
                                    <button
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        try {
                                          const response = await apiRequest(
                                            "DELETE",
                                            `/api/questionnaire/question-assignments/${evidence.id}/remove/`,
                                            null,
                                            true
                                          );
                                          if (response.status === 204 || response.status === 200) {
                                            message.success(
                                              "Evidence deleted successfully"
                                            );
                                            // Update the active question to remove the deleted evidence
                                            const updatedEvidences =
                                              activeQuestion.answer.evidences.filter(
                                                (e) => e.id !== evidence.id
                                              );
                                            setActiveQuestion({
                                              ...activeQuestion,
                                              answer: {
                                                ...activeQuestion.answer,
                                                evidences: updatedEvidences,
                                              },
                                            });
                                          } else {
                                            message.error(
                                              "Failed to delete evidence"
                                            );
                                          }
                                        } catch (error) {
                                          console.error(
                                            "Error deleting evidence:",
                                            error
                                          );
                                          message.error(
                                            "Failed to delete evidence"
                                          );
                                        }
                                      }}
                                      className="text-xs text-red-600 hover:text-red-800 font-medium bg-red-50 px-2.5 py-1 rounded-full hover:bg-red-100 transition-colors"
                                    >
                                      Delete
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {projectRole === "company" && (
                      <div className="mt-5 space-y-4">
                        <div className="border-t border-slate-200 pt-4">
                          <h4 className="text-sm font-medium text-slate-700 mb-3">
                            Add More Evidence
                          </h4>
                          <div
                            className="border-2 border-dashed border-indigo-200 rounded-lg p-4 flex flex-col items-center justify-center bg-indigo-50/50 transition-colors hover:bg-indigo-50 cursor-pointer"
                            onClick={triggerFileUpload}
                            onDragOver={handleDragOver}
                            onDragEnter={handleDragEnter}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                          >
                            <input
                              type="file"
                              className="hidden"
                              ref={fileInputRef}
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  handleFileUploadForEvidence(file);
                                  e.target.value = null; // Clear the input
                                }
                              }}
                            />
                            {isEvidenceUploading ? (
                              <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                            ) : (
                              <>
                                <div className="text-indigo-400 mb-2">
                                  <FileText size={24} />
                                </div>
                                <p className="text-sm text-center text-slate-700 font-medium">
                                  Click to select a file
                                </p>
                                <p className="text-xs text-center text-slate-500 mt-1">
                                  or drag and drop
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                    <h5 className="font-medium text-slate-700 flex items-center">
                      <MessageSquare size={15} className="mr-2 text-indigo-500" />
                      Answer
                    </h5>
                  </div>
                  <div className="p-4">
                    {/* Only show add answer form if:
                        1. User is assigned to this question OR
                        2. User is a company representative (for backward compatibility) */}
                    {(isCurrentUserAssigned || projectRole === "company") ? (
                      isAddingAnswer ? (
                        <form onSubmit={handleSubmitAnswer}>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">
                                Your Answer
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
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">
                                Comments (Optional)
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

                            {/* Evidence Upload Area */}
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">
                                Upload Evidence Files (Optional)
                              </label>
                              <div
                                className="border-2 border-dashed border-indigo-200 rounded-lg p-4 flex flex-col items-center justify-center bg-indigo-50/50 transition-colors hover:bg-indigo-50 cursor-pointer"
                                onClick={() =>
                                  fileInputRef.current &&
                                  fileInputRef.current.click()
                                }
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
                                    handleMultipleFileSelect(e.target.files);
                                    e.target.value = null; // Clear the input after processing
                                  }}
                                />
                                <div className="text-indigo-400 mb-2">
                                  <FileText size={24} />
                                </div>
                                <p className="text-sm text-center text-slate-700 font-medium">
                                  Click to select files
                                </p>
                                <p className="text-xs text-center text-slate-500 mt-1">
                                  or drag and drop
                                </p>
                              </div>

                              {/* Display uploaded evidence files */}
                              {uploadedEvidences.length > 0 && (
                                <div className="mt-3">
                                  <h5 className="text-xs font-medium text-slate-700 mb-2">
                                    Selected Files:
                                  </h5>
                                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                    {uploadedEvidences.map((evidence) => (
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
                                        <button
                                          onClick={() =>
                                            setUploadedEvidences(
                                              uploadedEvidences.filter(
                                                (e) => e.id !== evidence.id
                                              )
                                            )
                                          }
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

                            <div className="flex gap-2 justify-end mt-4">
                              <button
                                type="button"
                                className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors text-sm"
                                onClick={() => {
                                  setIsAddingAnswer(false);
                                  setNewAnswer({ answer_text: "", comments: "" });
                                  setUploadedEvidences([]);
                                }}
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                              >
                                Submit Answer
                              </button>
                            </div>
                          </div>
                        </form>
                      ) : (
                        <div className="py-8 flex flex-col items-center justify-center text-center">
                          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mb-3">
                            <X className="h-6 w-6 text-amber-600" />
                          </div>
                          <p className="text-slate-700 mb-1 font-medium">
                            No answer has been provided yet.
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
                        </div>
                      )
                    ) : (
                      <div className="py-8 flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mb-3">
                          <X className="h-6 w-6 text-amber-600" />
                        </div>
                        <p className="text-slate-700 mb-1 font-medium">
                          No answer has been provided yet.
                        </p>
                        <p className="text-sm text-slate-500 italic">
                          {questionAssignments.length > 0
                            ? "Only assigned users can answer this question."
                            : "Waiting for assignment of company representatives."}
                        </p>
                        {user && questionAssignments.length > 0 && (
                          <div className="mt-3 text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
                            <p>Assigned to:</p>
                            <ul className="mt-1 space-y-1">
                              {questionAssignments.map(assignment => (
                                <li key={assignment.assigned_to} className="flex items-center">
                                  <div className="h-4 w-4 bg-indigo-100 rounded-full flex items-center justify-center mr-1.5">
                                    <span className="text-indigo-600 text-[8px]">●</span>
                                  </div>
                                  {assignment.assigned_to_details?.name}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Question Modal */}
      {isAddQuestionModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 backdrop-blur-sm">
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
              <div className="p-4 space-y-4">
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
                        {newQuestion.associated_functions.length === 0
                          ? "Select functions..."
                          : `${newQuestion.associated_functions.length} function(s) selected`}
                      </span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-slate-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>

                    {dropdownOpen && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                        <div className="p-2">
                          {availableFunctions.map((func) => (
                            <div
                              key={typeof func === 'object' ? func.id : String(func)}
                              className="flex items-center py-1.5 px-3 hover:bg-slate-50 rounded-lg cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                id={typeof func === 'object' ? `func-${func.id}` : `func-${func}`}
                                checked={newQuestion.associated_functions.includes(
                                  typeof func === 'object' ? func.label : func
                                )}
                                onChange={() =>
                                  handleFunctionToggle(typeof func === 'object' ? func.label : func)
                                }
                                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                onClick={(e) => e.stopPropagation()}
                              />
                              <label
                                htmlFor={typeof func === 'object' ? `func-${func.id}` : `func-${func}`}
                                className="ml-2 text-sm text-slate-700 cursor-pointer w-full"
                                onClick={() => handleFunctionToggle(typeof func === 'object' ? func.label : func)}
                              >
                                {typeof func === 'object' ? func.label : func}
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
                  {newQuestion.associated_functions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {newQuestion.associated_functions.map((func, index) => (
                        <span
                          key={`selected-func-${index}`}
                          className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium"
                        >
                          {typeof func === 'object' ? func.name || func.label || JSON.stringify(func) : func}
                          <button
                            type="button"
                            onClick={() => handleFunctionToggle(typeof func === 'object' ? func.label || func.name : func)}
                            className="ml-1.5 text-blue-600 hover:text-blue-800"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
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
              </div>
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

      {deleteConfirmVisible && questionToDelete && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-medium text-slate-800 mb-4">
              Confirm Deletion
            </h3>
            <p className="text-slate-600 mb-6">
              Are you sure you want to delete this question? This action cannot
              be undone.
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
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Upload Questions
                </h3>
                <button
                  onClick={() => handleCloseUploadModal()}
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
                  onChange={(e) => handleFileSelect(e)}
                  className="mt-4 block w-full text-sm text-gray-500
                                                file:mr-4 file:py-2 file:px-4
                                                file:rounded-full file:border-0
                                                file:text-sm file:font-semibold
                                                file:bg-indigo-50 file:text-indigo-700
                                                hover:file:bg-indigo-100"
                />
                {selectedFile && (
                  <p className="mt-2 text-sm font-medium text-indigo-600">
                    {selectedFile.name}
                  </p>
                )}
                <div className="mt-5 flex justify-end space-x-2">
                  <button
                    onClick={() => handleCloseUploadModal()}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleUploadQuestions()}
                    disabled={!selectedFile}
                    className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${selectedFile
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

      {/* Delete Assignment Confirmation Dialog */}
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
              <span className="font-medium">{assignmentToDelete.assigned_to_details?.name}</span> will no longer be assigned to this question.
            </p>
            <p className="text-xs text-amber-600 mb-5 flex items-start bg-amber-50 p-3 rounded-lg">
              <AlertCircle size={16} className="mr-2 flex-shrink-0 mt-0.5" />
              Note: Only the user who created this assignment can remove it. If you didn't create this assignment, this action will fail.
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
    </div>
  );
};

export default Questionnaire;
