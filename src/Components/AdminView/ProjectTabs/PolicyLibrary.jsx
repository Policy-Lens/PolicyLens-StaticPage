import React, { useState, useEffect, useContext, useRef } from "react";
import {
  Eye,
  Download,
  Filter,
  Search,
  UploadCloud,
  Users,
  ChevronDown,
  Clock,
  Check,
  X,
  Upload,
  Trash2,
  Plus,
  FileText,
  File,
  Calendar,
} from "lucide-react";
import FileViewerModal from "../../FileViewer/FileViewerModal";
import { useParams } from "react-router-dom";
import { apiRequest } from "../../../utils/api";
import { AuthContext } from "../../../AuthContext";
import { ProjectContext } from "../../../Context/ProjectContext";
import { message } from "antd";

// Control name options for filtering
const CONTROL_NAME_OPTIONS = [
  { value: "", label: "All Controls" },
  { value: "Organizational", label: "Organizational" },
  { value: "People", label: "People" },
  { value: "Physical", label: "Physical" },
  { value: "Technological", label: "Technological" },
];

// Category options for file type
const CATEGORY_OPTIONS = [
  { value: "", label: "All Categories" },
  { value: "Policy", label: "Policy" },
  { value: "Report", label: "Report" },
];

// Sub-category options based on category
const REPORT_SUBCATEGORY_OPTIONS = [
  { value: "Risk Assessment", label: "Risk Assessment" },
  { value: "Risk Treatment", label: "Risk Treatment" },
  { value: "VAPT", label: "VAPT" },
  { value: "ASIS Report", label: "ASIS Report" },
];

// Modal for selecting consultants
const ConsultantSelectionModal = ({
  isOpen,
  onClose,
  onSubmit,
  projectId,
  selectedFileIds = [],
}) => {
  const [consultants, setConsultants] = useState([]);
  const [selectedConsultants, setSelectedConsultants] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useContext(AuthContext);
  const { getMembers } = useContext(ProjectContext);

  // Fetch consultants for the project
  useEffect(() => {
    if (isOpen && projectId) {
      fetchConsultants();
    }
  }, [isOpen, projectId]);

  const fetchConsultants = async () => {
    setIsLoading(true);
    try {
      // Use the getMembers function from ProjectContext
      const members = await getMembers(projectId);

      if (members && Array.isArray(members)) {
        // Filter to include only consultants and admins, excluding the current user
        const filteredConsultants = members.filter(
          (member) =>
            (member.project_role === "consultant" ||
              member.project_role === "consultant admin") &&
            member.id !== user?.id
        );
        setConsultants(filteredConsultants);
      }
    } catch (error) {
      console.error("Error fetching consultants:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleConsultant = (consultantId) => {
    setSelectedConsultants((prevSelected) => {
      if (prevSelected.includes(consultantId)) {
        return prevSelected.filter((id) => id !== consultantId);
      } else {
        return [...prevSelected, consultantId];
      }
    });
  };

  const handleSubmit = () => {
    onSubmit({
      file_ids: selectedFileIds,
      assign_to: selectedConsultants,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Assign to Consultants</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Select consultants to assign {selectedFileIds.length} file(s)
                to:
              </p>
              <div className="max-h-60 overflow-y-auto border rounded-md">
                {consultants.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {consultants.map((consultant) => (
                      <li key={consultant.id} className="p-3 hover:bg-gray-50">
                        <label className="flex items-center justify-between space-x-3 cursor-pointer">
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              checked={selectedConsultants.includes(
                                consultant.id
                              )}
                              onChange={() => toggleConsultant(consultant.id)}
                            />
                            <span className="text-gray-800">
                              {consultant.name || consultant.email}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {consultant.project_role}
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="p-4 text-center text-gray-500">
                    No consultants available for this project
                  </p>
                )}
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={selectedConsultants.length === 0}
                className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white ${
                  selectedConsultants.length === 0
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                Assign
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Modal for uploading a file
const FileUploadModal = ({ isOpen, onClose, onSubmit, fileName, fileId }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      message.warning("Please select a file to upload.");
      return;
    }
    setIsUploading(true);
    try {
      await onSubmit(selectedFile);
      // Reset state on success
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onClose(); // Close modal after successful submission
    } catch (error) {
      // Error handling is done in the parent onSubmit
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-lg p-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Upload New Version</h3>
          <button
            onClick={handleCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Upload a new version for the file:{" "}
          <span className="font-semibold">{fileName}</span>
        </p>

        <div className="mb-4">
          <label
            htmlFor="file-upload-input"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Select File
          </label>
          <input
            ref={fileInputRef}
            id="file-upload-input"
            type="file"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {selectedFile && (
            <p className="mt-2 text-sm text-green-600">
              Selected: {selectedFile.name}
            </p>
          )}
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedFile || isUploading}
            className={`flex items-center px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white ${
              !selectedFile || isUploading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Uploading...
              </>
            ) : (
              "Upload File"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Confirmation Modal (Generic)
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message: confirmMessage,
  isLoading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-red-600">
            {title || "Confirm Action"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          {confirmMessage || "Are you sure?"}
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex items-center px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Filter dropdown component
const FilterDropdown = ({ options, value, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);
  const closeDropdown = () => setIsOpen(false);

  const handleSelect = (option) => {
    onChange(option.value);
    closeDropdown();
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-2 px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors min-w-[180px]"
        type="button"
      >
        <Filter size={16} />
        <span>
          {label}: {options.find((opt) => opt.value === value)?.label || "All"}
        </span>
        <ChevronDown size={14} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={closeDropdown}></div>
          <ul className="absolute z-20 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
            {options.map((option) => (
              <li
                key={option.value}
                className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                  value === option.value ? "bg-blue-50 text-blue-700" : ""
                }`}
                onClick={() => handleSelect(option)}
              >
                {option.label}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

// Modal for uploading a new template
const UploadTemplateModal = ({ isOpen, onClose, onSubmit }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    regulation_standard: "",
    regulation_control_no: "",
    regulation_control_name: "",
    parent_control: "",
    category: "",
    sub_category: "",
  });
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      message.warning("Please select a file to upload.");
      return;
    }

    if (
      !formData.regulation_standard ||
      !formData.regulation_control_no ||
      !formData.regulation_control_name
    ) {
      message.warning("Please fill all required fields.");
      return;
    }

    setIsUploading(true);
    try {
      await onSubmit(selectedFile, formData);
      // Reset state on success
      setSelectedFile(null);
      setFormData({
        regulation_standard: "",
        regulation_control_no: "",
        regulation_control_name: "",
        parent_control: "",
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onClose(); // Close modal after successful submission
    } catch (error) {
      // Error handling is done in the parent onSubmit
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setFormData({
      regulation_standard: "",
      regulation_control_no: "",
      regulation_control_name: "",
      parent_control: "",
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-lg p-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Upload New Template</h3>
          <button
            onClick={handleCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        <div className="mb-4">
          <label
            htmlFor="file-upload-input"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Select File *
          </label>
          <input
            ref={fileInputRef}
            id="file-upload-input"
            type="file"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {selectedFile && (
            <p className="mt-2 text-sm text-green-600">
              Selected: {selectedFile.name}
            </p>
          )}
        </div>
        <div className="mb-4">
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Category *
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Category</option>
            {CATEGORY_OPTIONS.filter((opt) => opt.value).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        {formData.category && (
          <div className="mb-4">
            <label
              htmlFor="sub_category"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Sub Category *
            </label>
            {formData.category === "Policy" ? (
              <input
                type="text"
                id="sub_category"
                name="sub_category"
                value={formData.sub_category}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter sub category"
                required
              />
            ) : (
              <select
                id="sub_category"
                name="sub_category"
                value={formData.sub_category}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Sub Category</option>
                {REPORT_SUBCATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}
        <div className="mb-4">
          <label
            htmlFor="regulation_standard"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Regulation Standard *
          </label>
          <input
            type="text"
            id="regulation_standard"
            name="regulation_standard"
            value={formData.regulation_standard}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter regulation standard"
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="regulation_control_no"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Regulation Control No. *
          </label>
          <input
            type="text"
            id="regulation_control_no"
            name="regulation_control_no"
            value={formData.regulation_control_no}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter regulation control number"
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="regulation_control_name"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Regulation Control Name *
          </label>
          <input
            type="text"
            id="regulation_control_name"
            name="regulation_control_name"
            value={formData.regulation_control_name}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter regulation control name"
          />
        </div>{" "}
        <div className="mb-4">
          <label
            htmlFor="parent_control"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Parent Control
          </label>
          <input
            type="text"
            id="parent_control"
            name="parent_control"
            value={formData.parent_control}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter parent control"
          />
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={
              !selectedFile ||
              !formData.category ||
              !formData.sub_category ||
              isUploading
            }
            className={`flex items-center px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white ${
              !selectedFile ||
              !formData.category ||
              !formData.sub_category ||
              isUploading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Uploading...
              </>
            ) : (
              "Upload Template"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const PolicyLibrary = () => {
  const [activeTab, setActiveTab] = useState("templates");
  const [viewerModal, setViewerModal] = useState({
    isOpen: false,
    fileUrl: "",
    fileType: "",
    fileName: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [templatesData, setTemplatesData] = useState([]);
  const [projectFilesData, setProjectFilesData] = useState([]);
  const [selectedFileIds, setSelectedFileIds] = useState([]);
  const [consultantModal, setConsultantModal] = useState({
    isOpen: false,
    fileIds: [],
  });
  const [uploadModal, setUploadModal] = useState({
    isOpen: false,
    fileId: null,
    fileName: "",
  });
  const [confirmDeleteModal, setConfirmDeleteModal] = useState({
    isOpen: false,
    fileId: null,
    fileName: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [controlNameFilter, setControlNameFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [uploadTemplateModal, setUploadTemplateModal] = useState({
    isOpen: false,
  });
  const [detailsModal, setDetailsModal] = useState({
    isOpen: false,
    file: null,
  });
  const { projectid } = useParams();
  const { user } = useContext(AuthContext);
  const { projectRole } = useContext(ProjectContext);

  // Log roles for debugging
  useEffect(() => {
    console.log("Project Role:", projectRole);
    console.log("User:", user);
    console.log("User Role:", user?.role);
  }, [projectRole, user]);

  // Set the initial active tab based on projectRole
  // useEffect(() => {
  //   if (projectRole) {
  //     setActiveTab("templates");
  //   }
  // }, [projectRole]);

  // Check user role in the project
  // Using projectRole from ProjectContext as the primary source of truth
  const isAdmin = projectRole === "consultant admin";
  // Use user.role as fallback for consultant role
  const isConsultant =
    projectRole === "consultant" || user?.role === "consultant";

  // Fetch templates data with filters
  const fetchTemplates = async (
    currentSearch = searchTerm,
    currentControl = controlNameFilter
  ) => {
    setIsLoading(true);
    try {
      let queryParams = new URLSearchParams();
      if (currentSearch) queryParams.append("search", currentSearch);
      if (currentControl) queryParams.append("control", currentControl);
      const queryString = queryParams.toString()
        ? `?${queryParams.toString()}`
        : "";
      const response = await apiRequest(
        "GET",
        `/api/controlfiles/all-control-files/${queryString}`,
        null,
        true
      );
      setTemplatesData(
        response.data && Array.isArray(response.data) ? response.data : []
      );
    } catch (error) {
      console.error("Error fetching templates:", error);
      message.error("Failed to fetch templates.");
      setTemplatesData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch project files data with optional parameters and filters
  const fetchProjectFiles = async (
    params = {},
    currentSearch = searchTerm,
    currentControl = controlNameFilter
  ) => {
    setIsLoading(true);
    try {
      let queryParams = new URLSearchParams();
      if (params.assigned_to_me) queryParams.append("assigned_to_me", "true");
      if (params.assigned_by_me) queryParams.append("assigned_by_me", "true");
      if (currentSearch) queryParams.append("search", currentSearch);
      if (currentControl) queryParams.append("control", currentControl);
      const queryString = queryParams.toString()
        ? `?${queryParams.toString()}`
        : "";
      const response = await apiRequest(
        "GET",
        `/api/controlfiles/projects/${projectid}/control-files/${queryString}`,
        null,
        true
      );
      setProjectFilesData(
        response.data && Array.isArray(response.data) ? response.data : []
      );
    } catch (error) {
      console.error("Error fetching project files:", error);
      message.error("Failed to fetch project files.");
      setProjectFilesData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when tab or filters change
  useEffect(() => {
    if (activeTab === "templates") {
      fetchTemplates();
    } else if (activeTab === "myFiles") {
      if (projectRole === "consultant") {
        fetchProjectFiles({ assigned_to_me: true });
      } else if (projectRole === "consultant admin") {
        fetchProjectFiles({ assigned_by_me: true });
      } else {
        // For other roles, show all files as a default behavior
        fetchProjectFiles();
      }
    } else if (activeTab === "allFiles") {
      fetchProjectFiles();
    }
  }, [activeTab, searchTerm, controlNameFilter, projectid]); // Re-fetch on filter changes

  // Reset filters when tab changes
  useEffect(() => {
    setSearchTerm("");
    setControlNameFilter("");
    setSelectedFileIds([]);
  }, [activeTab]);

  // Handle search input change
  const handleSearchChange = (e) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    // Trigger fetch based on active tab
    if (activeTab === "templates") {
      fetchTemplates(newSearchTerm, controlNameFilter);
    } else {
      fetchProjectFiles(
        activeTab === "myFiles" && projectRole === "consultant"
          ? { assigned_to_me: true }
          : activeTab === "myFiles" && projectRole === "consultant admin"
          ? { assigned_by_me: true }
          : {},
        newSearchTerm,
        controlNameFilter
      );
    }
  };

  // Handle control name filter change
  const handleControlNameChange = (value) => {
    setControlNameFilter(value);
    // Trigger fetch based on active tab
    if (activeTab === "templates") {
      fetchTemplates(searchTerm, value);
    } else {
      fetchProjectFiles(
        activeTab === "myFiles" && projectRole === "consultant"
          ? { assigned_to_me: true }
          : activeTab === "myFiles" && projectRole === "consultant admin"
          ? { assigned_by_me: true }
          : {},
        searchTerm,
        value
      );
    }
  };

  // Reset filters and trigger fetch
  const resetFilters = () => {
    const currentActiveTab = activeTab; // Capture activeTab before state updates
    setSearchTerm("");
    setControlNameFilter("");
    // Trigger fetch for the current tab with cleared filters
    if (currentActiveTab === "templates") {
      fetchTemplates("", "");
    } else {
      fetchProjectFiles(
        activeTab === "myFiles" && projectRole === "consultant"
          ? { assigned_to_me: true }
          : activeTab === "myFiles" && projectRole === "consultant admin"
          ? { assigned_by_me: true }
          : {},
        "",
        ""
      );
    }
  };

  // Function to refresh current tab's data
  const refreshCurrentTabData = () => {
    if (activeTab === "templates") {
      fetchTemplates();
    } else {
      fetchProjectFiles(
        activeTab === "myFiles" && projectRole === "consultant"
          ? { assigned_to_me: true }
          : activeTab === "myFiles" && projectRole === "consultant admin"
          ? { assigned_by_me: true }
          : {}
      );
    }
  };

  // Column headers configuration for templates
  const templateColumns = [
    { key: "select", label: "" },
    { key: "category", label: "Category" },
    { key: "sub_category", label: "Sub-Category" },
    // { key: "id", label: "No." },
    { key: "file_name", label: "File Name" },
    { key: "file_type", label: "File Type" },
    { key: "regulation_standard", label: "Regulation Standard" },
    { key: "regulation_control_no", label: "Regulation Control No." },
    { key: "regulation_control_name", label: "Regulation Control Name" },
    { key: "parent_control", label: "Parent Control" },
  ];

  // Column headers for project files
  const projectFileColumns = [
    // { key: "id", label: "No." },
    { key: "category", label: "Category" },
    { key: "sub_category", label: "Sub-Category" },
    { key: "file_name", label: "File Name" },
    { key: "file_type", label: "File Type" },
    { key: "regulation_standard", label: "Regulation Standard" },
    { key: "regulation_control_no", label: "Regulation Control No." },
    { key: "regulation_control_name", label: "Regulation Control Name" },
    { key: "parent_control", label: "Parent Control" },
    { key: "assigned_by", label: "Assigned By" },
    { key: "assigned_to", label: "Assigned To" },
    { key: "created_at", label: "Created At" },
    { key: "updated_at", label: "Updated At" },
  ];

  // Toggle file selection
  const toggleFileSelection = (fileId) => {
    setSelectedFileIds((prevSelected) => {
      if (prevSelected.includes(fileId)) {
        return prevSelected.filter((id) => id !== fileId);
      } else {
        return [...prevSelected, fileId];
      }
    });
  };

  // Toggle select all templates
  const toggleSelectAllTemplates = () => {
    if (templatesData.length === 0) return;

    if (selectedFileIds.length === templatesData.length) {
      // If all are selected, unselect all
      setSelectedFileIds([]);
    } else {
      // Otherwise, select all
      setSelectedFileIds(templatesData.map((template) => template.id));
    }
  };

  // Open consultant selection modal for multiple files
  const openConsultantModal = (fileIds = selectedFileIds) => {
    setConsultantModal({
      isOpen: true,
      fileIds,
    });
  };

  // Close consultant selection modal
  const closeConsultantModal = () => {
    setConsultantModal({
      ...consultantModal,
      isOpen: false,
    });
  };

  // Handle assignment submission
  const handleAssignment = async (assignmentData) => {
    setAssignmentLoading(true);
    try {
      await apiRequest(
        "POST",
        `/api/controlfiles/projects/${projectid}/control-files/`,
        assignmentData,
        true
      );
      message.success("Files assigned successfully!");
      // Success - clear selections and close modal
      setSelectedFileIds([]);
      closeConsultantModal();
      // Refresh data if in templates tab
      if (activeTab === "templates") {
        fetchTemplates();
      }
    } catch (error) {
      console.error("Error assigning files:", error);
      message.error(
        error.detail || "Failed to assign files. Please try again."
      );
    } finally {
      setAssignmentLoading(false);
    }
  };

  // Open file upload modal
  const openUploadModal = (file) => {
    setUploadModal({
      isOpen: true,
      fileId: file.id,
      fileName: file.file_name,
    });
  };

  // Close file upload modal
  const closeUploadModal = () => {
    setUploadModal({
      isOpen: false,
      fileId: null,
      fileName: "",
    });
  };

  // Handle file upload submission
  const handleFileUpload = async (fileToUpload) => {
    if (!uploadModal.fileId) return;

    const formData = new FormData();
    formData.append("file", fileToUpload);

    try {
      await apiRequest(
        "PATCH",
        `/api/controlfiles/project-control-files/${uploadModal.fileId}/update-file/`,
        formData,
        true
      );
      message.success(`File '${uploadModal.fileName}' updated successfully!`);
      refreshCurrentTabData(); // Refresh the data in the current tab
      // No need to close modal here, FileUploadModal handles it on success
    } catch (error) {
      console.error("Error uploading file:", error);
      message.error(error.detail || "Failed to update file. Please try again.");
      throw error; // Re-throw error so FileUploadModal knows it failed
    }
  };

  // Open delete confirmation modal
  const openDeleteModal = (file) => {
    setConfirmDeleteModal({
      isOpen: true,
      fileId: file.id,
      fileName: file.file_name,
    });
  };

  // Close delete confirmation modal
  const closeDeleteModal = () => {
    setConfirmDeleteModal({
      isOpen: false,
      fileId: null,
      fileName: "",
    });
  };

  // Handle delete confirmation
  const handleDeleteAssignment = async () => {
    if (!confirmDeleteModal.fileId) return;
    setIsDeleting(true);
    try {
      await apiRequest(
        "DELETE",
        `/api/controlfiles/project-control-files/${confirmDeleteModal.fileId}/`,
        null,
        true
      );
      message.success(
        `Assignment '${confirmDeleteModal.fileName}' deleted successfully!`
      );
      closeDeleteModal();
      refreshCurrentTabData(); // Refresh the data in the current tab
    } catch (error) {
      console.error("Error deleting assignment:", error);
      message.error(
        error.detail || "Failed to delete assignment. Please try again."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Open file viewer modal
  const openFileViewer = (file) => {
    setViewerModal({
      isOpen: true,
      fileUrl: file.file_path || "",
      fileType: file.file_type?.toLowerCase() || "",
      fileName: file.file_name || "",
    });
  };

  // Close file viewer modal
  const closeFileViewer = () => {
    setViewerModal({
      ...viewerModal,
      isOpen: false,
    });
  };

  // Handle file download
  const handleDownload = (file) => {
    if (file.file_path) {
      window.open(file.file_path, "_blank");
    }
  };

  // Format date from ISO string
  const formatDate = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Render assigned to names
  const renderAssignedTo = (assignedToDetails) => {
    if (
      !assignedToDetails ||
      !Array.isArray(assignedToDetails) ||
      assignedToDetails.length === 0
    ) {
      return "None";
    }

    return assignedToDetails.map((user) => user.name).join(", ");
  };

  // Open upload template modal
  const openUploadTemplateModal = () => {
    setUploadTemplateModal({
      isOpen: true,
    });
  };

  // Close upload template modal
  const closeUploadTemplateModal = () => {
    setUploadTemplateModal({
      isOpen: false,
    });
  };

  // Handle template upload submission
  const handleTemplateUpload = async (fileToUpload, formData) => {
    const uploadData = new FormData();
    uploadData.append("file_path", fileToUpload);
    uploadData.append("regulation_standard", formData.regulation_standard);
    uploadData.append("regulation_control_no", formData.regulation_control_no);
    uploadData.append(
      "regulation_control_name",
      formData.regulation_control_name
    );
    uploadData.append("parent_control", formData.parent_control);
    uploadData.append("category", formData.category);
    uploadData.append("sub_category", formData.sub_category);

    try {
      await apiRequest(
        "POST",
        "/api/controlfiles/all-control-files/",
        uploadData,
        true
      );
      message.success("Template uploaded successfully!");
      fetchTemplates(); // Refresh templates data
    } catch (error) {
      console.error("Error uploading template:", error);
      message.error(
        error.detail || "Failed to upload template. Please try again."
      );
      throw error; // Re-throw error so modal knows it failed
    }
  };

  // Move FileDetailsModal here so it can access formatDate and renderAssignedTo
  const FileDetailsModal = ({ isOpen, onClose, file }) => {
    if (!isOpen || !file) return null;

    // Function to open file viewer with the current file
    const handleFileNameClick = () => {
      openFileViewer(file);
      onClose(); // Close the details modal when opening the viewer
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full max-w-2xl p-0 shadow-xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 p-4 text-white">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                File Details
              </h3>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors focus:outline-none"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
            {/* File Information Section */}
            <div className="mb-6 bg-blue-50 p-4 rounded-lg">
              <h4 className="text-sm uppercase text-blue-700 font-semibold mb-3 border-b border-blue-200 pb-1">
                File Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-gray-500 text-sm">File Name</div>
                  <div
                    className="text-blue-600 font-medium break-words cursor-pointer hover:underline"
                    onClick={handleFileNameClick}
                  >
                    {file.file_name}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 text-sm">File Type</div>
                  <div className="text-gray-900 font-medium">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {file.file_type}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Regulation Information Section */}
            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm uppercase text-gray-700 font-semibold mb-3 border-b border-gray-200 pb-1">
                Regulation Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-gray-500 text-sm">
                    Regulation Standard
                  </div>
                  <div className="text-gray-900 font-medium">
                    {file.regulation_standard}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 text-sm">
                    Regulation Control No.
                  </div>
                  <div className="text-gray-900 font-medium">
                    {file.regulation_control_no}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <div className="text-gray-500 text-sm">
                    Regulation Control Name
                  </div>
                  <div className="text-gray-900 font-medium">
                    {file.regulation_control_name}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 text-sm">Parent Control</div>
                  <div className="text-gray-900 font-medium">
                    {file.parent_control || "None"}
                  </div>
                </div>
              </div>
            </div>

            {/* Assignment Information Section */}
            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm uppercase text-gray-700 font-semibold mb-3 border-b border-gray-200 pb-1">
                Assignment Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {file.assigned_by && (
                  <div>
                    <div className="text-gray-500 text-sm">Assigned By</div>
                    <div className="text-gray-900 font-medium">
                      {file.assigned_by.name}
                    </div>
                  </div>
                )}
                {file.assigned_to_details && (
                  <div>
                    <div className="text-gray-500 text-sm">Assigned To</div>
                    <div className="text-gray-900 font-medium">
                      {renderAssignedTo(file.assigned_to_details)}
                    </div>
                  </div>
                )}
                {file.created_at && (
                  <div>
                    <div className="text-gray-500 text-sm flex items-center">
                      <Calendar className="w-3 h-3 mr-1" /> Created At
                    </div>
                    <div className="text-gray-900 font-medium">
                      {formatDate(file.created_at)}
                    </div>
                  </div>
                )}
                {file.updated_at && (
                  <div>
                    <div className="text-gray-500 text-sm flex items-center">
                      <Calendar className="w-3 h-3 mr-1" /> Updated At
                    </div>
                    <div className="text-gray-900 font-medium">
                      {formatDate(file.updated_at)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4 flex justify-end bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Policy Library</h1>

      {/* Tabs */}
      <div className="flex border-b mb-4 bg-gradient-to-r from-indigo-50 to-white rounded-t-lg">
        {/* <button
          className={`py-3 px-6 font-medium relative transition-all ${
            activeTab === "allFiles"
              ? "text-blue-600 font-semibold"
              : "text-gray-600 hover:text-gray-800"
          }`}
          onClick={() => setActiveTab("allFiles")}
        >
          All Files
          {activeTab === "allFiles" && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></span>
          )}
        </button> */}

        {/* My Files tab - visible to all roles, fetches different data based on role */}
        <button
          className={`py-3 px-6 font-medium relative transition-all ${
            activeTab === "myFiles"
              ? "text-blue-600 font-semibold"
              : "text-gray-600 hover:text-gray-800"
          }`}
          onClick={() => setActiveTab("myFiles")}
        >
          My Files
          {activeTab === "myFiles" && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></span>
          )}
        </button>

        {/* Removed Assigned By Me Tab */}
        {/* {isAdmin && (
          <button
            className={`py-3 px-6 font-medium relative transition-all ${
              activeTab === 'assignedByMe'
                ? 'text-blue-600 font-semibold'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('assignedByMe')}
          >
            Files Assigned by Me
            {activeTab === 'assignedByMe' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></span>
            )}
          </button>
        )} */}

        <button
          className={`py-3 px-6 font-medium relative transition-all ${
            activeTab === "templates"
              ? "text-blue-600 font-semibold"
              : "text-gray-600 hover:text-gray-800"
          }`}
          onClick={() => setActiveTab("templates")}
        >
          Templates
          {activeTab === "templates" && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></span>
          )}
        </button>

        {/* Upload Template button in the top tab area if admin */}
        {activeTab === "templates" && user?.role === "admin" && (
          <button
            onClick={openUploadTemplateModal}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm ml-auto mr-2 my-auto"
          >
            <UploadCloud size={16} />
            <span>Upload Template</span>
          </button>
        )}
      </div>

      {/* Common content for all tabs */}
      <div>
        <div className="flex flex-col md:flex-row md:justify-between mb-4 space-y-3 md:space-y-0">
          <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
            {/* Search form */}
            <form className="flex items-center">
              <div className="relative">
                <input
                  type="text"
                  placeholder={`Search ${
                    activeTab === "templates" ? "templates" : "files"
                  }...`}
                  className="pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-72"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
                <div className="absolute left-3 top-2.5 text-gray-400">
                  <Search size={16} />
                </div>
              </div>
              {/* <button
                type="submit"
                className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm"
              >
                Search
              </button> */}
            </form>

            {/* Filter dropdown */}
            <div className="flex items-center space-x-3">
              <FilterDropdown
                options={CONTROL_NAME_OPTIONS}
                value={controlNameFilter}
                onChange={handleControlNameChange}
                label="Control"
              />

              {(searchTerm || controlNameFilter) && (
                <button
                  onClick={resetFilters}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Action buttons container - Upload & Assign */}
          <div className="flex space-x-3">
            {/* Upload Template button removed from here since it's now in the tab bar */}

            {/* Action buttons for Template tab - Only show Assign button when files are selected */}
            {activeTab === "templates" &&
              projectRole === "consultant admin" &&
              selectedFileIds.length > 0 && (
                <button
                  onClick={() => openConsultantModal()}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors shadow-sm"
                >
                  <Users size={16} />
                  <span>Assign Templates ({selectedFileIds.length})</span>
                </button>
              )}
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
          </div>
        )}

        {/* Templates Table */}
        {!isLoading && activeTab === "templates" && (
          <div className="rounded-lg border border-gray-200 shadow-lg">
            <table className="min-w-full bg-white divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  {templateColumns.map((column) => (
                    <th
                      key={column.key}
                      className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b"
                    >
                      <div className="flex items-center">
                        {column.key === "select" &&
                        projectRole === "consultant admin" ? (
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={
                              templatesData.length > 0 &&
                              selectedFileIds.length === templatesData.length
                            }
                            onChange={toggleSelectAllTemplates}
                          />
                        ) : (
                          <span>{column.label}</span>
                        )}
                      </div>
                    </th>
                  ))}
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {templatesData.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-3 py-2.5 text-sm text-gray-900">
                      {projectRole === "consultant admin" && (
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          checked={selectedFileIds.includes(item.id)}
                          onChange={() => toggleFileSelection(item.id)}
                        />
                      )}
                    </td>
                    {/* <td className="px-3 py-2.5 text-sm text-gray-900">
                      {item.id}
                    </td> */}
                    <td className="px-3 py-2.5 text-sm font-medium">
                      {item.category}
                    </td>
                    <td className="px-3 py-2.5 text-sm font-medium">
                      {item.sub_category}
                    </td>
                    <td
                      className="px-3 py-2.5 text-sm font-medium text-blue-600 cursor-pointer hover:underline"
                      onClick={() => openFileViewer(item)}
                    >
                      {item.file_name}
                    </td>
                    <td className="px-3 py-2.5 text-sm text-gray-900">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {item.file_type}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-sm text-gray-900">
                      {item.regulation_standard}
                    </td>
                    <td className="px-3 py-2.5 text-sm text-gray-900">
                      {item.regulation_control_no}
                    </td>
                    <td className="px-3 py-2.5 text-sm text-gray-900">
                      {item.regulation_control_name}
                    </td>
                    <td className="px-3 py-2.5 text-sm text-gray-900">
                      {item.parent_control || "None"}
                    </td>
                    <td className="px-3 py-2.5 text-sm text-gray-900">
                      <div className="flex space-x-2">
                        <button
                          className="p-1 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
                          title="View Details"
                          onClick={() =>
                            setDetailsModal({ isOpen: true, file: item })
                          }
                        >
                          <Eye size={16} className="text-blue-600" />
                        </button>
                        <button
                          className="p-1 bg-green-100 rounded-md hover:bg-green-200 transition-colors"
                          title="Download File"
                          onClick={() => handleDownload(item)}
                        >
                          <Download size={16} className="text-green-600" />
                        </button>
                        {projectRole === "consultant admin" && (
                          <button
                            className="p-1 bg-purple-100 rounded-md hover:bg-purple-200 transition-colors"
                            title="Assign File"
                            onClick={() => openConsultantModal([item.id])}
                          >
                            <Users size={16} className="text-purple-600" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Project Files Table (My Files tab handles both roles) */}
        {!isLoading && activeTab === "myFiles" && (
          <div className="rounded-lg border border-gray-200 shadow-lg">
            <table className="min-w-full bg-white divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  {projectFileColumns.map((column) => (
                    <th
                      key={column.key}
                      className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b"
                    >
                      <div className="flex items-center">
                        <span>{column.label}</span>
                      </div>
                    </th>
                  ))}
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {projectFilesData.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* <td className="px-3 py-2.5 text-sm text-gray-900">
                      {item.id}
                    </td> */}
                    <td className="px-3 py-2.5 text-sm font-medium">
                      {item.category}
                    </td>
                    <td className="px-3 py-2.5 text-sm font-medium">
                      {item.sub_category}
                    </td>
                    <td
                      className="px-3 py-2.5 text-sm font-medium text-blue-600 cursor-pointer hover:underline"
                      onClick={() => openFileViewer(item)}
                    >
                      {item.file_name}
                    </td>
                    <td className="px-3 py-2.5 text-sm text-gray-900">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {item.file_type}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-sm text-gray-900">
                      {item.regulation_standard}
                    </td>
                    <td className="px-3 py-2.5 text-sm text-gray-900">
                      {item.regulation_control_no}
                    </td>
                    <td className="px-3 py-2.5 text-sm text-gray-900">
                      {item.regulation_control_name}
                    </td>
                    <td className="px-3 py-2.5 text-sm text-gray-900">
                      {item.parent_control || "None"}
                    </td>
                    <td className="px-3 py-2.5 text-sm text-gray-900">
                      {item.assigned_by?.name || "None"}
                    </td>
                    <td className="px-3 py-2.5 text-sm text-gray-900">
                      {renderAssignedTo(item.assigned_to_details)}
                    </td>
                    <td className="px-3 py-2.5 text-sm text-gray-900">
                      <div className="flex items-center">
                        <Clock size={14} className="text-gray-400 mr-1.5" />
                        {formatDate(item.created_at)}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-sm text-gray-900">
                      {formatDate(item.updated_at)}
                    </td>
                    <td className="px-3 py-2.5 text-sm text-gray-900">
                      <div className="flex space-x-2">
                        <button
                          className="p-1 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
                          title="View Details"
                          onClick={() =>
                            setDetailsModal({ isOpen: true, file: item })
                          }
                        >
                          <Eye size={16} className="text-blue-600" />
                        </button>
                        <button
                          className="p-1 bg-green-100 rounded-md hover:bg-green-200 transition-colors"
                          title="Download File"
                          onClick={() => handleDownload(item)}
                        >
                          <Download size={16} className="text-green-600" />
                        </button>
                        {/* Show Upload for Consultants, Delete for Admins in My Files tab */}
                        {activeTab === "myFiles" &&
                          projectRole === "consultant" && (
                            <button
                              className="p-1 bg-orange-100 rounded-md hover:bg-orange-200 transition-colors"
                              title="Upload New Version"
                              onClick={() => openUploadModal(item)}
                            >
                              <Upload size={16} className="text-orange-600" />
                            </button>
                          )}
                        {activeTab === "myFiles" &&
                          projectRole === "consultant admin" && (
                            <button
                              className="p-1 bg-red-100 rounded-md hover:bg-red-200 transition-colors"
                              title="Delete Assignment"
                              onClick={() => openDeleteModal(item)}
                            >
                              <Trash2 size={16} className="text-red-600" />
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty state */}
        {!isLoading &&
          ((activeTab === "templates" && templatesData.length === 0) ||
            (activeTab === "myFiles" && projectFilesData.length === 0)) && (
            <div className="flex flex-col items-center justify-center p-10 text-center border-t border-slate-200 rounded-lg bg-white shadow min-h-[300px]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="text-xl font-medium text-gray-700 mb-2">
                No {activeTab === "templates" ? "templates" : "files"} found
              </h3>
              <p className="text-gray-500 mb-6">
                {activeTab === "templates"
                  ? "No templates are available at the moment."
                  : activeTab === "myFiles"
                  ? projectRole === "consultant admin"
                    ? "You have not assigned any files yet."
                    : projectRole === "consultant"
                    ? "You have no files assigned to you yet."
                    : "No files are available for you in this project."
                  : "No files have been added to this project yet."}
              </p>
              {(searchTerm || controlNameFilter) && (
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
      </div>

      {/* Modals */}
      <FileViewerModal
        isOpen={viewerModal.isOpen}
        onClose={closeFileViewer}
        fileUrl={viewerModal.fileUrl}
        fileType={viewerModal.fileType}
        fileName={viewerModal.fileName}
      />
      <ConsultantSelectionModal
        isOpen={consultantModal.isOpen}
        onClose={closeConsultantModal}
        onSubmit={handleAssignment}
        projectId={projectid}
        selectedFileIds={consultantModal.fileIds}
      />
      <FileUploadModal
        isOpen={uploadModal.isOpen}
        onClose={closeUploadModal}
        onSubmit={handleFileUpload}
        fileName={uploadModal.fileName}
        fileId={uploadModal.fileId}
      />
      <ConfirmationModal
        isOpen={confirmDeleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteAssignment}
        title="Confirm Deletion"
        message={`Are you sure you want to delete the assignment for '${confirmDeleteModal.fileName}'?`}
        isLoading={isDeleting}
      />
      <UploadTemplateModal
        isOpen={uploadTemplateModal.isOpen}
        onClose={closeUploadTemplateModal}
        onSubmit={handleTemplateUpload}
      />
      <FileDetailsModal
        isOpen={detailsModal.isOpen}
        onClose={() => setDetailsModal({ isOpen: false, file: null })}
        file={detailsModal.file}
      />
    </div>
  );
};

export default PolicyLibrary;
