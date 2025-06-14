import React, { useState, useEffect, useRef, useContext, useCallback } from "react";
import { message, Popconfirm, Spin } from "antd";
import { Search, Plus, Upload, X, Edit, Trash2, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { apiRequest } from "../../../utils/api";
import { AuthContext } from "../../../AuthContext";
import { useNavigate } from "react-router-dom";
import { LoadingOutlined } from '@ant-design/icons';

const PaginationControls = ({ pagination, onPageChange, onPageSizeChange }) => {
  const { currentPage, totalPages, totalCount, pageSize } = pagination;

  if (!totalCount || totalCount === 0) return null;

  return (
    <div className="flex items-center justify-between p-4 bg-white border-t border-slate-200">
      <div className="flex items-center gap-2">
        <label htmlFor="pageSize" className="text-sm text-slate-600">
          Rows per page:
        </label>
        <select
          id="pageSize"
          value={pageSize}
          onChange={(e) => onPageSizeChange(e.target.value)}
          className="border border-slate-300 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value="all">All</option>
        </select>
      </div>
      <div className="text-sm text-slate-600">
        Page {currentPage} of {totalPages} ({totalCount} items)
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center justify-center w-8 h-8 rounded-md border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center justify-center w-8 h-8 rounded-md border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

const Regulations = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [regulations, setRegulations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRegName, setSelectedRegName] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 1,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [partialErrors, setPartialErrors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [activeRegulation, setActiveRegulation] = useState(null);
  const [regulationForm, setRegulationForm] = useState({
    reg_id: "",
    reg_name: "",
    reg_description: "",
    redirect_to: "",
  });
  const [expandedCells, setExpandedCells] = useState({});

  useEffect(() => {
    if (user?.role === "admin") {
      setIsAdmin(true);
    }
  }, [user]);

  const fetchRegulations = useCallback(async () => {
    try {
      setIsLoading(true);
      let url = "/api/policylens/regulations/";
      const params = new URLSearchParams();

      if (searchQuery) params.append("search", searchQuery);
      if (selectedRegName) params.append("reg_name", selectedRegName);
      params.append("page_size", pagination.pageSize === "all" ? "all" : pagination.pageSize);
      if (pagination.pageSize !== "all") {
        params.append("page", pagination.currentPage);
      }
      params.append("ordering", "reg_id");

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await apiRequest("GET", url, null, true);
      const results = response.data?.results || [];
      const totalCount = response.data?.count || 0;

      setRegulations(results);
      setPagination((prev) => ({
        ...prev,
        totalCount,
        totalPages:
          pagination.pageSize === "all"
            ? 1
            : Math.ceil(totalCount / (typeof pagination.pageSize === "string" ? parseInt(pagination.pageSize, 10) : pagination.pageSize)),
      }));
    } catch (error) {
      console.error("Error fetching regulations:", error);
      message.error("Failed to fetch regulations");
      setRegulations([]);
      setPagination((prev) => ({
        ...prev,
        totalCount: 0,
        totalPages: 1,
      }));
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedRegName, pagination.pageSize, pagination.currentPage]);

  useEffect(() => {
    fetchRegulations();
  }, [fetchRegulations]);

  const handlePageChange = useCallback((newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: newPage }));
    }
  }, [pagination.totalPages]);

  const handlePageSizeChange = useCallback((newPageSize) => {
    setPagination({
      currentPage: 1,
      pageSize: newPageSize === "all" ? "all" : parseInt(newPageSize, 10),
      totalCount: pagination.totalCount,
      totalPages: 1,
    });
  }, [pagination.totalCount]);

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  }, []);

  const handleFilterChange = useCallback((filterType, value) => {
    if (filterType === "reg_name") setSelectedRegName(value);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setSelectedRegName("");
    setSearchQuery("");
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setRegulationForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const openAddModal = useCallback(() => {
    setModalType("add");
    setShowModal(true);
    setRegulationForm({
      reg_id: "",
      reg_name: "",
      reg_description: "",
      redirect_to: "",
    });
  }, []);

  const openEditModal = useCallback((regulation) => {
    setModalType("edit");
    setActiveRegulation(regulation);
    setRegulationForm({
      reg_id: regulation.reg_id,
      reg_name: regulation.reg_name,
      reg_description: regulation.reg_description,
      redirect_to: regulation.redirect_to || "",
    });
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
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
  }, []);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  }, []);

  const handleFileUpload = useCallback(async () => {
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

      if (response.status === 201 || response.status === 207) {
        message.success(`Uploaded ${response.data.regulations_created || 0} regulations`);
        setPartialErrors(response.data.errors || []);
        fetchRegulations();
        closeModal();
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      if (error.response?.data?.errors) {
        setPartialErrors(error.response.data.errors);
      } else {
        message.error(error.response?.data?.error || "Failed to upload file");
      }
    } finally {
      setIsUploading(false);
    }
  }, [selectedFile, fetchRegulations]);

  const handleSubmit = useCallback(async (e) => {
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
      message.error(error.response?.data?.error || "Failed to save regulation");
    }
  }, [modalType, activeRegulation, regulationForm, fetchRegulations, closeModal]);

  const handleDelete = useCallback(async (id) => {
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
  }, [fetchRegulations]);

  const handleRedirect = useCallback((redirectTo) => {
    if (redirectTo) {
      if (redirectTo.startsWith("http")) {
        window.open(redirectTo, "_blank");
      } else {
        navigate(redirectTo);
      }
    } else {
      message.info("No redirect link available for this regulation");
    }
  }, [navigate]);

  const toggleCellExpansion = useCallback((regulationId, field) => {
    setExpandedCells((prev) => ({
      ...prev,
      [`${regulationId}-${field}`]: !prev[`${regulationId}-${field}`],
    }));
  }, []);

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white p-6 shadow-sm flex-none">
        <div className="flex items-center gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search regulations..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            <Search
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
            />
          </div>
          <select
            value={selectedRegName}
            onChange={(e) => handleFilterChange("reg_name", e.target.value)}
            className="block w-48 border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Regulation Names</option>
            {[...new Set(regulations.map((r) => r.reg_name))].sort().map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          {(selectedRegName || searchQuery) && (
            <button
              onClick={handleClearFilters}
              className="text-blue-600 hover:underline transition-colors flex items-center gap-2"
            >
              Clear Filters
            </button>
          )}
          {isAdmin && (
            <>
              <button
                onClick={() => {
                  setModalType("excel");
                  setShowModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
              >
                <Upload size={18} />
                Upload Excel
              </button>
              <button
                onClick={openAddModal}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus size={18} />
                Add Regulation
              </button>
            </>
          )}
        </div>
      </div>
      <div className="flex-1 mx-3 mb-3 bg-white rounded-lg shadow overflow-x-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Spin indicator={<LoadingOutlined style={{ fontSize: 40 }} spin />} />
          </div>
        ) : (
          <>
            <PaginationControls
              pagination={pagination}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
            <div className="relative">
              <table className="w-full border-collapse">
                <thead className="bg-slate-200 sticky top-0 z-10">
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
                <tbody>
                  {regulations.map((regulation) => (
                    <tr key={regulation.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 align-top whitespace-nowrap text-sm font-medium text-slate-900">
                        {regulation.reg_id}
                      </td>
                      <td className="px-6 py-4 align-top whitespace-nowrap text-sm font-medium text-slate-900">
                        {regulation.reg_name}
                      </td>
                      <td
                        className="px-6 py-4 align-top text-sm text-slate-600 min-w-[300px] max-w-[400px] whitespace-pre-wrap cursor-pointer"
                        onClick={() => toggleCellExpansion(regulation.id, 'reg_description')}
                        role="button"
                        tabIndex={0}
                        aria-expanded={expandedCells[`${regulation.id}-reg_description`] || false}
                        aria-label="Toggle regulation description"
                        onKeyDown={(e) => e.key === 'Enter' && toggleCellExpansion(regulation.id, 'reg_description')}
                      >
                        <div className={`${expandedCells[`${regulation.id}-reg_description`] ? '' : 'line-clamp-3'}`}>
                          {regulation.reg_description}
                        </div>
                        <span className="text-blue-600 hover:text-blue-800">
                          {expandedCells[`${regulation.id}-reg_description`] ? 'Show Less' : '...'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleRedirect(regulation.redirect_to)}
                            className={`text-blue-600 hover:text-blue-800 transition-colors ${!regulation.redirect_to ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                            aria-label="Go to regulation"
                            title={regulation.redirect_to ? "Go to regulation" : "No redirect link available"}
                          >
                            <ExternalLink size={18} />
                          </button>
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => openEditModal(regulation)}
                                className="text-blue-600 hover:text-blue-800 transition-colors"
                                aria-label="Edit regulation"
                                title="Edit Regulation"
                              >
                                <Edit size={18} />
                              </button>
                              <Popconfirm
                                title="Delete this regulation?"
                                description="This action cannot be undone."
                                onConfirm={() => handleDelete(regulation.id)}
                                okText="Yes"
                                cancelText="No"
                                okButtonProps={{ className: 'bg-red-500' }}
                              >
                                <button
                                  className="text-red-600 hover:text-red-800 transition-colors"
                                  aria-label="Delete regulation"
                                  title="Delete Regulation"
                                >
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
            <PaginationControls
              pagination={pagination}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          </>
        )}
      </div>
      {showModal && modalType !== "excel" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-medium text-slate-900">
                {modalType === "add" ? "Add New Regulation" : "Edit Regulation"}
              </h3>
              <button onClick={closeModal}>
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
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
                <div className="col-span-2">
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
                </div>
                <div className="col-span-2">
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
                      onClick={() => regulationForm.redirect_to && handleRedirect(regulationForm.redirect_to)}
                      className={`mt-1 px-3 py-2 rounded-md ${regulationForm.redirect_to ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-gray-100 cursor-not-allowed text-gray-400"}`}
                      title={regulationForm.redirect_to ? "Test redirect" : "Enter a URL first"}
                    >
                      <ExternalLink size={18} />
                    </button>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    Leave empty if no redirection is needed. Use the test button to verify the link.
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
      {showModal && modalType === "excel" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-xl w-full mx-4 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-medium text-slate-900">
                Upload Regulations Excel File
              </h3>
              <button onClick={closeModal}>
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
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
                          Row {error.row}: {Object.entries(error.errors || {}).map(([field, msg]) => `${field}: ${msg}`).join(", ") || error}
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
                  className={`px-4 py-2 rounded-md text-white ${!selectedFile || isUploading
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