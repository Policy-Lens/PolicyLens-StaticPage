import React, { useState, useContext, useRef, useEffect } from "react";
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
} from "lucide-react";
import { ProjectContext } from "../../../Context/ProjectContext";
import { apiRequest } from "../../../utils/api";
import { useParams } from "react-router-dom";
import { message } from "antd";
const Questionnaire = () => {
  const { projectid } = useParams();
  const { projectRole } = useContext(ProjectContext);
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

  const selectQuestion = (question) => {
    setActiveQuestion(question);
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
    });
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
    console.log("New question submitted:", newQuestion);
    const response = await apiRequest(
      "POST",
      `/api/project/${projectid}/questions/create/`,
      {
        control_number: newQuestion.control_number,
        control_name: newQuestion.control_name,
        audit_question: newQuestion.audit_question,
        functions_csv: associated_functions,
        control_theme: newQuestion.control_theme,
      },
      true
    );
    if (response.status === 201) {
      closeAddQuestionModal();
      handleGetQuestions();
      message.success("Question created successfully");
    } else {
      message.error("Failed to create question");
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
    // Edit functionality will be added later
    console.log("Edit question:", questionId);
  };

  const handleDeleteQuestion = (questionId, e) => {
    e.stopPropagation();
    setEditDropdownOpen(null);
    // Delete functionality will be added later
    console.log("Delete question:", questionId);
  };

  const handleSubmitAnswer = async (e) => {
    // Make this function async
    e.preventDefault();
    // Here you would typically save the answer to the backend
    console.log("New answer submitted:", newAnswer);

    // For this example, we'll just update the active question with the new answer
    const updatedQuestion = {
      ...activeQuestion,
      answer: {
        id: Math.floor(Math.random() * 1000), // Generate a random ID
        answer_text: newAnswer.answer_text,
        comments: newAnswer.comments,
        evidences: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };

    setActiveQuestion(updatedQuestion);
    setIsAddingAnswer(false);
    setNewAnswer({ answer_text: "", comments: "" });
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
      const response = await apiRequest(
        "POST",
        `/api/project/${projectid}/questions/upload/`,
        formData,
        true
      );
      if (response.status === 201) {
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
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString();
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
      `/api/project/${projectid}/questions/`,
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
        `/api/project/answers/${activeQuestion.answer.id}/evidence/add/`,
        formData,
        true
      );

      if (response.status === 201) {
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
        `/api/project/questions/${questionId}/delete/`,
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

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden shadow-xl rounded-lg m-6">
        {/* Questions Panel */}
        <div
          className={`flex flex-col ${
            activeQuestion ? "w-3/4" : "w-full"
          } bg-white border-r border-slate-200`}
        >
          {/* Tabs and Actions */}
          <div className="flex items-center border-b border-slate-200 p-4 bg-white sticky top-0 z-10">
            <button className="flex items-center px-5 py-2.5 bg-indigo-50 text-indigo-700 font-medium rounded-lg transition-colors hover:bg-indigo-100">
              <FileText size={16} className="mr-2" />
              <span>Questions</span>
            </button>
            <div className="ml-3 text-slate-600 font-medium">
              ({questions.length} of {questions.length})
            </div>
            <div className="flex ml-auto gap-2">
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

              <div className="relative">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search"
                  className="pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all w-64 placeholder-slate-400"
                />
              </div>
              <div className="relative">
                <button
                  className="px-4 py-2.5 border border-slate-200 rounded-lg flex items-center text-slate-700 hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-300 shadow-sm"
                  onClick={toggleFilterDropdown}
                >
                  <Filter size={16} className="mr-2 text-indigo-500" />
                  <span>Filter</span>
                </button>
                {filterDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-lg shadow-xl z-20">
                    <div className="p-3 border-b border-slate-200 bg-slate-50 font-medium text-slate-700">
                      Filter Options
                    </div>
                    {filterOptions.map((option) => (
                      <div
                        key={option.id}
                        className="p-2.5 hover:bg-slate-50 flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <span className="text-slate-700">{option.label}</span>
                        <div className="h-6 w-6 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors">
                          <X size={12} />
                        </div>
                      </div>
                    ))}
                    <div className="flex p-3 border-t border-slate-200 bg-slate-50 gap-2">
                      <button className="flex-1 py-2 text-center bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
                        Clear
                      </button>
                      <button className="flex-1 py-2 text-center bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                        Apply Filter
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
                </tr>
              </thead>
              <tbody>
                {questions.map((question) => (
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
                          className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            question.answer
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {question.answer ? "Completed" : "Pending"}
                        </span>
                      </div>
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
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white">
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

            {/* Question Badge */}
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <h4 className="font-medium text-slate-800">
                {activeQuestion.control_name}
              </h4>
              <div className="mt-2 text-sm text-slate-600">
                <p>{activeQuestion.audit_question}</p>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {activeQuestion.associated_functions.map((func) => (
                  <span
                    key={func}
                    className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium"
                  >
                    {func}
                  </span>
                ))}
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-medium">
                  {activeQuestion.control_theme}
                </span>
              </div>
            </div>

            {/* Sidebar Content - Scrollable area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Status */}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
                  <div className="flex items-center">
                    <span className="font-medium text-slate-700">Status</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center text-slate-700 hover:bg-slate-50 p-2 rounded-lg transition-colors">
                    <input
                      type="radio"
                      name="status"
                      className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                      checked={!activeQuestion.answer}
                      readOnly
                    />
                    <span className="text-sm">No Answer Provided</span>
                    {!activeQuestion.answer && (
                      <X size={16} className="ml-2 text-red-500" />
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
                    <span className="text-sm">Answer Provided</span>
                  </label>
                </div>
              </div>

              {/* Answer Section */}
              {activeQuestion.answer ? (
                <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                  <h3 className="font-medium text-slate-700 mb-3 border-b border-slate-200 pb-2">
                    Answer
                  </h3>
                  <div className="text-sm text-slate-600 mb-4">
                    {activeQuestion.answer.answer_text}
                  </div>

                  {activeQuestion.answer.comments && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-slate-700 mb-2">
                        Comments:
                      </h4>
                      <p className="text-sm text-slate-600 italic bg-slate-50 p-3 rounded-lg">
                        {activeQuestion.answer.comments}
                      </p>
                    </div>
                  )}

                  {activeQuestion.answer.evidences &&
                    activeQuestion.answer.evidences.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-slate-700 mb-2">
                          Evidence Files:
                        </h4>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                          {activeQuestion.answer.evidences.map((evidence) => (
                            <div
                              key={evidence.id}
                              className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-200"
                            >
                              <div className="flex items-center max-w-[70%]">
                                <FileText className="text-indigo-500 mr-2 h-4 w-4 flex-shrink-0" />
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
                                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
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
                                          `/api/project/evidence/${evidence.id}/delete/`,
                                          null,
                                          true
                                        );
                                        if (response.status === 204) {
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
                                    className="text-xs text-red-600 hover:text-red-800 font-medium"
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
                          className="border-2 border-slate-200 border-dashed rounded-lg p-4 flex flex-col items-center justify-center bg-slate-50 transition-colors hover:bg-slate-100 cursor-pointer"
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
                            <div className="loader">Loading...</div> // Replace with your loading animation
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
              ) : (
                <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                  <h3 className="font-medium text-slate-700 mb-3 border-b border-slate-200 pb-2">
                    Answer
                  </h3>
                  {projectRole === "company" ? (
                    isAddingAnswer ? (
                      <form
                        onSubmit={async (e) => {
                          e.preventDefault();
                          try {
                            const formData = new FormData();
                            formData.append(
                              "answer_text",
                              newAnswer.answer_text
                            );
                            formData.append(
                              "comments",
                              newAnswer.comments || ""
                            );

                            // Add evidence files if any
                            if (uploadedEvidences.length > 0) {
                              uploadedEvidences.forEach((evidence) => {
                                // Only append files, not object URLs
                                if (evidence.originalFile) {
                                  formData.append(
                                    "evidence_files",
                                    evidence.originalFile
                                  );
                                }
                              });
                            }

                            const response = await apiRequest(
                              "POST",
                              `/api/project/questions/${activeQuestion.id}/answer/create/`,
                              formData,
                              true
                            );

                            if (response.status === 201) {
                              message.success("Answer submitted successfully");
                              console.log(response.data);
                              setActiveQuestion({
                                ...activeQuestion,
                                answer: response.data,
                              });
                              setQuestions(
                                questions.map((question) =>
                                  question.id === activeQuestion.id
                                    ? response.data
                                    : question
                                )
                              );
                              setIsAddingAnswer(false);
                              setNewAnswer({ answer_text: "", comments: "" });
                              setUploadedEvidences([]);
                              handleGetQuestions();
                            } else {
                              message.error("Failed to submit answer");
                            }
                          } catch (error) {
                            console.error("Error submitting answer:", error);
                            message.error("Failed to submit answer");
                          }
                        }}
                      >
                        <div className="space-y-3">
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
                              className="border-2 border-slate-200 border-dashed rounded-lg p-4 flex flex-col items-center justify-center bg-slate-50 transition-colors hover:bg-slate-100 cursor-pointer"
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
                                        <FileText className="text-indigo-500 mr-2 h-4 w-4 flex-shrink-0" />
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
                                        Remove
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
                          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                          onClick={() => setIsAddingAnswer(true)}
                        >
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
                        Only company representatives can answer questions.
                      </p>
                    </div>
                  )}
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
                Ask a Question
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
                              key={func.id}
                              className="flex items-center py-1.5 px-3 hover:bg-slate-50 rounded-lg cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                id={func.id}
                                checked={newQuestion.associated_functions.includes(
                                  func.label
                                )}
                                onChange={() =>
                                  handleFunctionToggle(func.label)
                                }
                                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                onClick={(e) => e.stopPropagation()}
                              />
                              <label
                                htmlFor={func.id}
                                className="ml-2 text-sm text-slate-700 cursor-pointer w-full"
                                onClick={() => handleFunctionToggle(func.label)}
                              >
                                {func.label}
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
                      {newQuestion.associated_functions.map((func) => (
                        <span
                          key={func}
                          className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium"
                        >
                          {func}
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
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors shadow-sm"
                  onClick={closeAddQuestionModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  Submit Question
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
    </div>
  );
};

export default Questionnaire;
