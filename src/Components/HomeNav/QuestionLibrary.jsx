import React, { useState, useContext, useEffect, useRef } from "react";
import {
  Search,
  Filter,
  X,
  FileText,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  UploadCloud,
  Download,
} from "lucide-react";
import { AuthContext } from "../../AuthContext";
import { apiRequest } from "../../utils/api";
import { message, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import Sidebar from "./Sidebar";
import { useLocation } from "react-router-dom";

const QuestionLibrary = () => {
  const { user } = useContext(AuthContext);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState("clause"); // "clause", "control", "vapt", or "vapt_form"

  // Question list state
  const [questions, setQuestions] = useState([]);
  const [isQuestionsLoading, setIsQuestionsLoading] = useState(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [filters, setFilters] = useState({
    type: "",
    standard: "ISO27001", // Default standard
  });
  // Add pendingFilters state for dropdown
  const [pendingFilters, setPendingFilters] = useState({
    type: "",
    standard: "ISO27001",
  });

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // "add", "edit", "upload"
  const [activeQuestion, setActiveQuestion] = useState(null);

  // Form state
  const [newQuestion, setNewQuestion] = useState({
    reference: "",
    question: "",
    type: activeTab, // Defaults to activeTab value ("clause", "control", or "vapt")
    pdca_cycle: "", // Only for clause questions
    type_description: "",
    standard: "ISO27001",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // File upload state
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  // Delete confirmation state
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Type choices for filtering and form
  const clauseTypeChoices = [
    "4 - Context of the Organization",
    "5 - Leadership",
    "6 - Planning",
    "7 - Support",
    "8 - Operation",
    "9 - Performance Evaluation",
    "10 - Improvement",
  ];

  const controlTypeChoices = [
    "5 - Organizational Controls",
    "6 - People Controls",
    "7 - Physical Controls",
    "8 - Technological Controls",
  ];

  const vaptTypeChoices = [
    "Web Application Security Testing Questionnaire",
    "Android / iOS Application  Security Testing Questionnaire",
    "APIs Security Testing Questionnaire"
  ];

  const vaptFormTypeChoices = [
    "IT Infrastructure Details",
    "Cloud Infrastructure Details"
  ];

  // Get type choices based on active tab
  const typeChoices =
    activeTab === "clause"
      ? clauseTypeChoices
      : activeTab === "control"
      ? controlTypeChoices
      : activeTab === "vapt"
      ? vaptTypeChoices
      : vaptFormTypeChoices;

  // Check if user is admin
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  useEffect(() => {
    setIsAdmin(user?.role == "Admin");
  }, [user]);

  // Update question form when active tab changes
  useEffect(() => {
    setNewQuestion((prev) => ({
      ...prev,
      type: activeTab,
    }));
  }, [activeTab]);

  // Fetch questions
  const handleGetQuestions = async () => {
    if (!isAdmin) return;

    setIsQuestionsLoading(true);
    let endpoint = `/api/new-questionnaire/library/?`;
    const params = new URLSearchParams();

    // Add type parameter based on active tab
    params.append("type", activeTab);

    // Add search and filters
    if (searchQuery) params.append("search", searchQuery);
    if (filters.type) params.append("type_description", filters.type);
    if (filters.standard) params.append("standard", filters.standard);

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

  // Toggle filter dropdown
  const toggleFilterDropdown = () => {
    setPendingFilters(filters);
    setFilterDropdownOpen(!filterDropdownOpen);
  };

  // Update pendingFilters in the dropdown
  const handlePendingFilterChange = (filterType, value) => {
    setPendingFilters((prev) => ({
      ...prev,
      [filterType]: value === prev[filterType] ? "" : value, // Toggle
    }));
  };

  // Apply filters only when Apply Filters is clicked
  const applyFilters = () => {
    setFilters(pendingFilters);
    setFilterDropdownOpen(false);
  };

  // Clear all filters in both states
  const clearFilters = () => {
    setFilters({
      type: "",
      standard: "ISO27001",
    });
    setPendingFilters({
      type: "",
      standard: "ISO27001",
    });
    setSearchQuery("");
  };

  // Handle input changes for question form
  const handleQuestionInputChange = (e) => {
    const { name, value } = e.target;
    setNewQuestion((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Reset question form
  const resetQuestionForm = () => {
    setNewQuestion({
      reference: "",
      question: "",
      type: activeTab, // Use current activeTab
      type_description: "",
      standard: "ISO27001",
    });
    setActiveQuestion(null);
  };

  // Open modal functions
  const openAddModal = () => {
    resetQuestionForm();
    setModalType("add");
    setShowModal(true);
  };

  const openEditModal = (question) => {
    setActiveQuestion(question);
    setNewQuestion({
      reference: question.reference,
      question: question.question,
      type: question.type || activeTab,
      type_description: question.type_description || "",
      standard: question.standard,
    });
    setModalType("edit");
    setShowModal(true);
  };

  const openUploadModal = () => {
    setSelectedFile(null);
    setModalType("upload");
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setModalType("");
    resetQuestionForm();
    setSelectedFile(null);
  };

  // Format date
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

  // Submit question form (create or update)
  const handleSubmitQuestion = async (e) => {
    e.preventDefault();

    if (!isAdmin) {
      message.error("You don't have permission to perform this action.");
      return;
    }

    setIsSubmitting(true);

    try {
      let response;

      if (modalType === "edit" && activeQuestion) {
        // Update existing question
        response = await apiRequest(
          "PATCH",
          `/api/new-questionnaire/library/${activeQuestion.id}/update/`,
          newQuestion.type === "clause"
            ? newQuestion
            : { ...newQuestion, pdca_cycle: "" },
          true
        );
      } else {
        // Create new question
        response = await apiRequest(
          "POST",
          `/api/new-questionnaire/library/create/`,
          newQuestion.type === "clause"
            ? newQuestion
            : { ...newQuestion, pdca_cycle: "" },
          true
        );
      }

      if (response.status === 200 || response.status === 201) {
        message.success(
          modalType === "edit"
            ? "Question updated successfully"
            : "Question created successfully"
        );

        // Update questions list
        if (modalType === "edit") {
          setQuestions((prev) =>
            prev.map((q) => (q.id === activeQuestion.id ? response.data : q))
          );
        } else {
          setQuestions((prev) => [...prev, response.data]);
        }

        closeModal();
      } else {
        throw new Error(`Failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error submitting question:", error);
      message.error(
        `Failed to ${modalType === "edit" ? "update" : "create"} question: ${
          error.message || "Unknown error"
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // File upload handlers
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };
  const [partialErrorsWhileUploading, setPartialErrorsWhileUploading] =
    useState([]);
  const [partialErrors, setPartialErrors] = useState(false);
  const handleFileUpload = async () => {
    if (!selectedFile) {
      message.warning("Please select a file to upload");
      return;
    }

    if (!isAdmin) {
      message.error("You don't have permission to perform this action.");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await apiRequest(
        "POST",
        "/api/new-questionnaire/library/upload/",
        formData,
        true
      );

      if (
        response.status === 200 ||
        response.status === 201 ||
        response.status === 207
      ) {
        message.success(
          `Successfully created ${response.data.questions_created} questions`
        );

        // Add new questions to state
        if (response.data.questions && response.data.questions.length > 0) {
          setQuestions((prev) => [...prev, ...response.data.questions]);
        }

        // Show errors if any
        if (response.data.errors && response.data.errors.length > 0) {
          message.warning(
            `${response.data.errors.length} errors occurred during upload`
          );
          setPartialErrorsWhileUploading(response.data.errors);
          setPartialErrors(true);
        }

        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        setSelectedFile(null);
        closeModal();
      } else {
        throw new Error(`Failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      message.error(
        `Failed to upload file: ${error.message || "Unknown error"}`
      );
    } finally {
      setIsUploading(false);
    }
  };

  // Delete question
  const confirmDeleteQuestion = (question) => {
    setQuestionToDelete(question);
    setShowDeleteConfirmation(true);
  };

  const cancelDeleteQuestion = () => {
    setShowDeleteConfirmation(false);
    setQuestionToDelete(null);
  };

  const handleDeleteQuestion = async () => {
    if (!questionToDelete || !isAdmin) return;

    setIsDeleting(true);

    try {
      const response = await apiRequest(
        "DELETE",
        `/api/new-questionnaire/library/${questionToDelete.id}/delete/`,
        null,
        true
      );

      if (response.status === 204 || response.status === 200) {
        message.success("Question deleted successfully");

        // Remove question from state
        setQuestions((prev) =>
          prev.filter((q) => q.id !== questionToDelete.id)
        );

        setShowDeleteConfirmation(false);
        setQuestionToDelete(null);
      } else {
        throw new Error(`Failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error deleting question:", error);
      message.error(
        `Failed to delete question: ${error.message || "Unknown error"}`
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Effect to refetch questions when dependencies change
  useEffect(() => {
    handleGetQuestions();
  }, [searchQuery, filters, user, activeTab, location.pathname, isAdmin]);

  // Add sorting state
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');

  // Sorting handler
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Sort questions before rendering
  const sortedQuestions = [...questions].sort((a, b) => {
    let aValue = '';
    let bValue = '';
    switch (sortColumn) {
      case 'reference': {
        aValue = a.reference || '';
        bValue = b.reference || '';
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue, undefined, { numeric: true, sensitivity: 'base' })
          : bValue.localeCompare(aValue, undefined, { numeric: true, sensitivity: 'base' });
      }
      case 'type':
        aValue = a.type_description?.split(' - ')[0] || '';
        bValue = b.type_description?.split(' - ')[0] || '';
        break;
      case 'control_no':
        aValue = a.type_description?.split(' - ')[0] || '';
        bValue = b.type_description?.split(' - ')[0] || '';
        break;
      case 'control_name':
        aValue = a.type_description?.split(' - ')[1] || '';
        bValue = b.type_description?.split(' - ')[1] || '';
        break;
      case 'pdca_cycle':
        aValue = a.pdca_cycle || '';
        bValue = b.pdca_cycle || '';
        break;
      default:
        return 0;
    }
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // If not admin, show access denied message
  if (!isAdmin) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-slate-50">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-6">
            You don't have permission to access the Question Library. This area
            is restricted to administrators only.
          </p>
          <a
            href="/dashboard"
            className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 overflow-hidden shadow-xl rounded-lg h-screen">
      {/* Question List */}
      <div className="flex flex-col w-full bg-white transition-width duration-300 ease-in-out">
        {/* Top Bar: Header and Actions */}
        <div className="flex flex-col border-b border-slate-200 bg-white sticky top-0 z-10">
          {/* Header and Actions */}
          <div className="flex items-center p-4">
            {/* Header */}
            <h2 className="text-lg font-semibold text-slate-700">
              Question Library
            </h2>

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
                      Object.values(pendingFilters).some((f) => f !== "") ||
                      searchQuery
                        ? "text-indigo-500"
                        : "text-slate-400"
                    }`}
                  />
                  <span>Filter</span>
                  {(pendingFilters.type || searchQuery) && (
                    <span className="ml-2 bg-indigo-100 text-indigo-600 text-xs font-medium px-2 py-0.5 rounded-full">
                      {
                        [
                          pendingFilters.type && "Type",
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
                    </div>

                    {/* Scrollable Filters */}
                    <div className="overflow-y-auto">
                      {/* Type Filter */}
                      <div className="p-3 border-b border-slate-200">
                        <h4 className="text-sm font-medium text-slate-700 mb-2 flex justify-between">
                          <span>
                            {activeTab === "clause"
                              ? "Clause Type"
                              : activeTab === "control"
                              ? "Control Type"
                              : activeTab === "vapt"
                              ? "VAPT Type"
                              : "VAPT Form Type"}
                            {activeTab === "clause" ? "Clause" : activeTab === "control" ? "Control" : activeTab === "vapt" ? "VAPT Type" : "VAPT Form Type"} Type
                          </span>
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

                      {/* Active Filters Summary */}
                      {(filters.type || searchQuery) && (
                        <div className="px-3 py-2 bg-slate-50 border-b border-slate-200">
                          <h4 className="text-xs font-medium text-slate-600 mb-1">
                            Active Filters:
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {filters.type && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs">
                                {activeTab === "clause" ? "Clause" : activeTab === "control" ? "Control" : activeTab === "vapt" ? "VAPT Type" : "VAPT Form Type"}:{" "}
                                {filters.type}
                                <button
                                  onClick={() => handleFilterChange("type", "")}
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

              {/* Upload Button */}
              <button
                className="px-4 py-2.5 border border-slate-200 rounded-lg flex items-center text-slate-700 hover:bg-slate-50 transition-colors focus:outline-none shadow-sm"
                onClick={openUploadModal}
              >
                <UploadCloud size={16} className="mr-2 text-slate-400" />
                <span>Upload Excel</span>
              </button>

              {/* Add Question Button */}
              <button
                className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg flex items-center hover:bg-indigo-700 transition-colors shadow-sm hover:shadow-md"
                onClick={openAddModal}
              >
                <Plus size={16} className="mr-1.5" />
                <span>Add Question</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex px-4 border-t border-slate-200">
            <button
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "clause"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
              onClick={() => setActiveTab("clause")}
            >
              Clause Questions
            </button>
            <button
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "control"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
              onClick={() => setActiveTab("control")}
            >
              Control Questions
            </button>
            <button
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "vapt"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
              onClick={() => setActiveTab("vapt")}
            >
              VAPT Questions
            </button>
            <button
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "vapt_form"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
              onClick={() => setActiveTab("vapt_form")}
            >
              VAPT Form
            </button>
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
                  <th className="w-40 min-w-[10rem] p-4 text-left font-semibold text-slate-600 cursor-pointer" onClick={() => handleSort('reference')}>
                    Reference {sortColumn === 'reference' ? (sortDirection === 'asc' ? '▲' : '▼') : '▲▼'}
                  </th>
                  <th className="w-80 p-4 text-left font-semibold text-slate-600">
                    Question
                  </th>
                  {['vapt', 'vapt_form'].includes(activeTab) && (
                    <th className="w-40 min-w-[8rem] p-4 text-left font-semibold text-slate-600 cursor-pointer" onClick={() => handleSort('type')}>
                      Type {sortColumn === 'type' ? (sortDirection === 'asc' ? '▲' : '▼') : '▲▼'}
                    </th>
                  )}
                  {activeTab !== 'vapt' && activeTab !== 'vapt_form' && (
                    <th className="w-48 min-w-[10rem] p-4 text-center font-semibold text-slate-600 cursor-pointer" onClick={() => handleSort('control_no')}>
                      {activeTab === 'clause' ? 'Clause No.' : 'Control No.'} {sortColumn === 'control_no' ? (sortDirection === 'asc' ? '▲' : '▼') : '▲▼'}
                    </th>
                  )}
                  {activeTab !== 'vapt' && activeTab !== 'vapt_form' && (
                    <th className="w-48 min-w-[11rem] p-4 text-center font-semibold text-slate-600 cursor-pointer" onClick={() => handleSort('control_name')}>
                      {activeTab === 'clause' ? 'Clause Name' : 'Control Name'} {sortColumn === 'control_name' ? (sortDirection === 'asc' ? '▲' : '▼') : '▲▼'}
                    </th>
                  )}
                  <th className="w-44 p-4 text-center font-semibold text-slate-600">
                    Standard
                  </th>
                  {activeTab === "clause" && (
                    <th className="w-40 min-w-[10rem] p-4 text-center font-semibold text-slate-600 cursor-pointer" onClick={() => handleSort('pdca_cycle')}>
                      PDCA Cycle {sortColumn === 'pdca_cycle' ? (sortDirection === 'asc' ? '▲' : '▼') : '▲▼'}
                    </th>
                  )}
                  <th className="w-28 p-4 text-left font-semibold text-slate-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedQuestions.length > 0 ? (
                  sortedQuestions.map((question) => (
                    <tr
                      key={question.id}
                      className="hover:bg-indigo-50/50 transition-colors"
                    >
                      <td className="p-4">
                        <span className="text-indigo-600 font-semibold">
                          {question.reference}
                        </span>
                      </td>
                      <td className="p-4 text-slate-700">
                        <div className="line-clamp-2" title={question.question}>
                          {question.question}
                        </div>
                      </td>
                      {['vapt', 'vapt_form'].includes(activeTab) && (
                        <td className="p-4 text-slate-600 text-left">
                          {question.type_description}
                        </td>
                      )}
                      {activeTab !== 'vapt' && activeTab !== 'vapt_form' && (
                        <td className="p-4 text-slate-600 text-center">
                          {question.type_description?.split(' - ')[0]}
                        </td>
                      )}
                      {activeTab !== 'vapt' && activeTab !== 'vapt_form' && (
                        <td className="p-4 text-slate-600 text-center">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                            {question.type_description?.split(' - ')[1]}
                          </span>
                        </td>
                      )}
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-medium">
                          {question.standard}
                        </span>
                      </td>
                      {activeTab === "clause" && (
                        <td className="p-4 text-center">
                          <span className={`inline-flex text-center items-center px-2.5 py-1 rounded-full text-xs font-medium ${question.pdca_cycle === "Plan"
                            ? "bg-emerald-100 text-emerald-700"
                            : question.pdca_cycle === "Do"
                            ? "bg-pink-100 text-pink-700"
                            : question.pdca_cycle === "Check"
                            ? "bg-orange-100 text-orange-700"
                            : question.pdca_cycle === "Act"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-slate-100 text-slate-700"
                          }`}>
                            {question.pdca_cycle}
                          </span>
                        </td>
                      )}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            className="p-1.5 text-slate-500 hover:text-indigo-600 transition-colors hover:bg-slate-100 rounded-full"
                            onClick={() => openEditModal(question)}
                            title="Edit Question"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="p-1.5 text-slate-500 hover:text-red-600 transition-colors hover:bg-slate-100 rounded-full"
                            onClick={() => confirmDeleteQuestion(question)}
                            title="Delete Question"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={activeTab === 'clause' ? 8 : activeTab === 'vapt' || activeTab === 'vapt_form' ? 5 : 7} className="p-4 text-center text-slate-500">
                      No questions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add/Edit Question Modal */}
      {showModal && (modalType === "add" || modalType === "edit") && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-t-lg">
              <h3 className="text-lg font-medium">
                {modalType === "edit" ? "Edit Question" : "Add New Question"}
              </h3>
              <button
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                onClick={closeModal}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitQuestion} className="p-6">
              <div className="space-y-4">
                {/* Reference */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Reference *
                  </label>
                  <input
                    type="text"
                    name="reference"
                    value={newQuestion.reference}
                    onChange={handleQuestionInputChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all"
                    placeholder="e.g., 5.1a"
                    required
                  />
                </div>

                {/* Question */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Question *
                  </label>
                  <textarea
                    name="question"
                    value={newQuestion.question}
                    onChange={handleQuestionInputChange}
                    rows="5"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all"
                    placeholder="Enter the question text..."
                    required
                  ></textarea>
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Type *
                  </label>
                  <select
                    name="type"
                    value={newQuestion.type}
                    onChange={(e) => {
                      handleQuestionInputChange(e);
                      setNewQuestion((prev) => ({
                        ...prev,
                        type_description: "",
                        pdca_cycle: "",
                      }));
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all"
                    required
                  >
                    <option value="clause">Clause</option>
                    <option value="control">Control</option>
                    <option value="vapt">VAPT</option>
                    <option value="vapt_form">VAPT Form</option>
                  </select>
                </div>

                {/* Type Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {activeTab === "clause"
                      ? "Clause"
                      : activeTab === "control"
                      ? "Control"
                      : activeTab === "vapt"
                      ? "VAPT Type"
                      : "VAPT Form Type"} *
                  </label>
                  <select
                    name="type_description"
                    value={newQuestion.type_description}
                    onChange={handleQuestionInputChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all"
                    required
                  >
                    <option value="">
                      Select a{" "}
                      {activeTab === "clause"
                        ? "clause"
                        : activeTab === "control"
                        ? "control"
                        : activeTab === "vapt"
                        ? "VAPT type"
                        : "VAPT form type"}
                    </option>
                    {activeTab === "clause"
                      ? clauseTypeChoices.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))
                      : activeTab === "control"
                      ? controlTypeChoices.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))
                      : activeTab === "vapt"
                      ? vaptTypeChoices.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))
                      : vaptFormTypeChoices.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                  </select>
                </div>

                {/* PDCA Cycle (only for clause questions) */}
                {activeTab === "clause" && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      PDCA Cycle
                    </label>
                    <select
                      name="pdca_cycle"
                      disabled={newQuestion.type !== "clause"}
                      value={newQuestion.pdca_cycle}
                      onChange={handleQuestionInputChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all"
                      required={newQuestion.type === "clause"}
                    >
                      <option value="">Select a PDCA Cycle</option>
                      <option value="Plan">Plan</option>
                      <option value="Do">Do</option>
                      <option value="Check">Check</option>
                      <option value="Act">Act</option>
                    </select>
                  </div>
                )}

                {/* Standard (fixed to ISO27001) */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Standard *
                  </label>
                  <select
                    name="standard"
                    value={newQuestion.standard}
                    onChange={handleQuestionInputChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all"
                    required
                  >
                    <option value="">Select a type</option>
                    <option key="ISO27001" value="ISO27001">
                      ISO27001
                    </option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  className="px-4 py-2 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center disabled:opacity-70"
                  disabled={isSubmitting}
                >
                  {isSubmitting && (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  )}
                  {modalType === "edit" ? "Update Question" : "Add Question"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Excel Modal */}
      {showModal && modalType === "upload" && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-t-lg">
              <h3 className="text-lg font-medium">
                Upload Questions from Excel
              </h3>
              <button
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                onClick={closeModal}
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <p className="text-slate-600 mb-4">
                  Upload an Excel file with questions to add to the library. The
                  file should follow the required format.
                </p>

                {/* Download Template Button */}
                <a
                  href="/QuestionLibraryTemplate.xlsx"
                  className="flex items-center text-indigo-600 hover:text-indigo-800 mb-6"
                  download
                >
                  <Download size={16} className="mr-2" />
                  Download Template
                </a>

                {/* File Upload Area */}
                <div
                  className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadCloud
                    size={36}
                    className="mx-auto mb-3 text-slate-400"
                  />

                  {selectedFile ? (
                    <div>
                      <p className="text-indigo-600 font-medium">
                        {selectedFile.name}
                      </p>
                      <p className="text-slate-500 text-sm mt-1">
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </p>
                      <button
                        className="mt-2 text-red-500 text-sm hover:text-red-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                          if (fileInputRef.current)
                            fileInputRef.current.value = "";
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-slate-500">
                        Click to select a file or drag and drop
                      </p>
                      <p className="text-slate-400 text-sm mt-1">
                        Supports Excel files (.xlsx, .xls)
                      </p>
                    </div>
                  )}

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".xlsx,.xls"
                    className="hidden"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  className="px-4 py-2 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center disabled:opacity-70"
                  onClick={handleFileUpload}
                  disabled={!selectedFile || isUploading}
                >
                  {isUploading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <UploadCloud size={16} className="mr-2" />
                      Upload
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && questionToDelete && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 mx-4">
            <div className="flex items-center text-red-600 mb-4">
              <AlertCircle size={24} className="mr-3" />
              <h3 className="text-lg font-medium">Delete Question</h3>
            </div>
            <p className="text-slate-600 mb-2">
              Are you sure you want to delete this question?
            </p>
            <p className="text-sm text-slate-500 mb-5">
              Reference:{" "}
              <span className="font-medium">{questionToDelete.reference}</span>
              <br />
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                onClick={cancelDeleteQuestion}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center disabled:opacity-70"
                onClick={handleDeleteQuestion}
                disabled={isDeleting}
              >
                {isDeleting && (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                )}
                {isDeleting ? "Deleting..." : "Delete Question"}
              </button>
            </div>
          </div>
        </div>
      )}
      {partialErrors && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-xl p-6 mx-4 h-80 overflow-y-auto">
            <div className="flex items-center text-red-600 mb-4">
              <AlertCircle size={24} className="mr-3" />
              <h3 className="text-lg font-medium">
                Errors in Excel File While Uploading
              </h3>
            </div>
            <p className="text-slate-600 mb-2">
              The following errors were found in the uploaded Excel file:
            </p>
            <ul className="list-inside mb-5">
              {partialErrorsWhileUploading.map((error, index) => (
                <li key={index} className="text-sm text-slate-500">
                  <div className="flex items-start flex-col p-2 border border-slate-200 rounded-lg mb-2">
                    <div className="font-bold text-size">Row {error.row} </div>
                    <div className="bg-slate-200 text-red-600 p-1">
                      {error.error}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                onClick={() => {
                  setPartialErrors(false);
                  setPartialErrorsWhileUploading([]);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionLibrary;
