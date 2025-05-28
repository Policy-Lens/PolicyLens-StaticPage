import React, { useState, useEffect, useRef, useContext } from "react";
import { message, Popconfirm } from "antd";
import {
  Search,
  Plus,
  Upload,
  X,
  Edit,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { apiRequest } from "../../utils/api";
import { AuthContext } from "../../AuthContext";
import { useNavigate } from "react-router-dom";

const Regulations = () => {
  const { user } = useContext(AuthContext);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [regulations, setRegulations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // File upload states
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [partialErrors, setPartialErrors] = useState([]);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [activeRegulation, setActiveRegulation] = useState(null);

  // Form state
  const [regulationForm, setRegulationForm] = useState({
    reg_id: "",
    reg_name: "",
    reg_description: "",
    redirect_to: "",
  });

  // Check if user is admin
  useEffect(() => {
    if (user?.role === "admin") {
      setIsAdmin(true);
    }
  }, [user]);

  // Fetch regulations
  const fetchRegulations = async () => {
    try {
      setIsLoading(true);
      const response = await apiRequest(
        "GET",
        `/api/policylens/regulations/${
          searchQuery ? "?search=" + searchQuery : ""
        }`,
        null,
        true
      );
      setRegulations(response.data);
    } catch (error) {
      console.error("Error fetching regulations:", error);
      message.error("Failed to fetch regulations");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRegulations();
  }, [searchQuery]);

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRegulationForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const openAddModal = () => {
    setModalType("add");
    setShowModal(true);
    setRegulationForm({
      reg_id: "",
      reg_name: "",
      reg_description: "",
      redirect_to: "",
    });
  };

  const openEditModal = (regulation) => {
    setModalType("edit");
    setActiveRegulation(regulation);
    setRegulationForm({
      reg_id: regulation.reg_id,
      reg_name: regulation.reg_name,
      reg_description: regulation.reg_description,
      redirect_to: regulation.redirect_to || "",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType("");
    setActiveRegulation(null);
    setRegulationForm({
      reg_id: "",
      reg_name: "",
      reg_description: "",
      redirect_to: "",
    });
    setSelectedFile(null);
    setPartialErrors([]);
  };

  // File upload handlers
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await apiRequest(
        "POST",
        "/api/policylens/regulations/upload/",
        formData,
        true,
        true
      );

      if (response.status === 201) {
        message.success("File uploaded successfully");
        fetchRegulations();
        closeModal();
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      if (error.partial_errors) {
        setPartialErrors(error.partial_errors);
      } else {
        message.error("Failed to upload file");
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Submit handlers
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === "add") {
        const response = await apiRequest(
          "POST",
          "/api/policylens/regulations/create/",
          regulationForm,
          true
        );
        if (response.status === 201) {
          message.success("Regulation created successfully");
          fetchRegulations();
          closeModal();
        }
      } else if (modalType === "edit" && activeRegulation) {
        const response = await apiRequest(
          "PATCH",
          `/api/policylens/regulations/${activeRegulation.id}/update/`,
          regulationForm,
          true
        );
        if (response.status === 200) {
          message.success("Regulation updated successfully");
          fetchRegulations();
          closeModal();
        }
      }
    } catch (error) {
      console.error("Error submitting regulation:", error);
      message.error("Failed to save regulation");
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await apiRequest(
        "DELETE",
        `/api/policylens/regulations/${id}/delete/`,
        null,
        true
      );
      if (response.status === 204) {
        message.success("Regulation deleted successfully");
        fetchRegulations();
      }
    } catch (error) {
      console.error("Error deleting regulation:", error);
      message.error("Failed to delete regulation");
    }
  };
  const navigate = useNavigate();
  const handleRedirect = (redirectTo) => {
    if (redirectTo) {
      // Navigate to the specified route
      //   window.location.href = redirectTo;
      navigate(redirectTo);
    } else {
      message.info("No redirect link available for this regulation");
    }
  };

  return (
    <div className="p-6 max-w-full overflow-x-auto">
      {/* Search and Actions Bar */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search regulations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        {isAdmin && (
          <div className="flex gap-3">
            <button
              onClick={() => {
                setModalType("excel");
                setShowModal(true);
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Upload size={20} />
              Upload Excel
            </button>
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus size={20} />
              Add Regulation
            </button>
          </div>
        )}
      </div>

      {/* Regulations Table */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Regulation ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {regulations.map((regulation) => (
                <tr key={regulation.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    {regulation.reg_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {regulation.reg_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {regulation.reg_description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-between gap-2">
                      <button
                        onClick={() => handleRedirect(regulation.redirect_to)}
                        className={`text-blue-600 hover:text-blue-800 ${
                          !regulation.redirect_to
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer"
                        }`}
                        title={
                          regulation.redirect_to
                            ? "Go to regulation"
                            : "No redirect link available"
                        }
                      >
                        <ExternalLink size={18} />
                      </button>
                      {isAdmin && (
                        <>
                          <button
                            onClick={() => openEditModal(regulation)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit size={18} />
                          </button>
                          <Popconfirm
                            title="Delete this regulation?"
                            description="This action cannot be undone."
                            onConfirm={() => handleDelete(regulation.id)}
                            okText="Yes"
                            cancelText="No"
                            okButtonProps={{ className: "bg-red-500" }}
                          >
                            <button className="text-red-600 hover:text-red-800">
                              <Trash2 size={18} />
                            </button>
                          </Popconfirm>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && modalType !== "excel" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-xl w-full mx-4">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-medium text-slate-900">
                {modalType === "add" ? "Add New Regulation" : "Edit Regulation"}
              </h3>
              <button onClick={closeModal}>
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Regulation ID
                  </label>
                  <input
                    type="text"
                    name="reg_id"
                    value={regulationForm.reg_id}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Name
                  </label>
                  <input
                    type="text"
                    name="reg_name"
                    value={regulationForm.reg_name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Description
                  </label>
                  <textarea
                    name="reg_description"
                    value={regulationForm.reg_description}
                    onChange={handleInputChange}
                    rows={4}
                    className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>{" "}
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Redirect Link (Optional)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="redirect_to"
                      value={regulationForm.redirect_to}
                      onChange={handleInputChange}
                      placeholder="Enter URL or path to redirect"
                      className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        regulationForm.redirect_to &&
                        handleRedirect(regulationForm.redirect_to)
                      }
                      className={`mt-1 px-3 py-2 rounded-md ${
                        regulationForm.redirect_to
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "bg-gray-100 cursor-not-allowed text-gray-400"
                      }`}
                      title={
                        regulationForm.redirect_to
                          ? "Test redirect"
                          : "Enter a URL first"
                      }
                    >
                      <ExternalLink size={18} />
                    </button>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    Leave empty if no redirection is needed. Use the test button
                    to verify the link.
                  </p>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {modalType === "add" ? "Add Regulation" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Excel Upload Modal */}
      {showModal && modalType === "excel" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-xl w-full mx-4">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-medium text-slate-900">
                Upload Regulations Excel File
              </h3>
              <button onClick={closeModal}>
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".xlsx,.xls"
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {selectedFile && (
                    <p className="mt-2 text-sm text-slate-600">
                      Selected file: {selectedFile.name}
                    </p>
                  )}
                </div>

                {partialErrors.length > 0 && (
                  <div className="mt-4 p-4 bg-red-50 rounded-lg">
                    <h4 className="text-sm font-medium text-red-800 mb-2">
                      The following errors occurred:
                    </h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {partialErrors.map((error, index) => (
                        <li key={index} className="text-sm text-red-600">
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFileUpload}
                  disabled={!selectedFile || isUploading}
                  className={`px-4 py-2 rounded-md text-white ${
                    !selectedFile || isUploading
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isUploading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </div>
                  ) : (
                    "Upload File"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Regulations;
