import React, { useState, useEffect, useRef, useContext, useCallback } from "react";
import { message, Popconfirm, Spin } from "antd";
import { Search, Plus, Upload, X, Edit, Trash2, ChevronLeft, ChevronRight, Eye, FileText } from "lucide-react";
import { apiRequest } from "../../../utils/api";
import { LoadingOutlined } from '@ant-design/icons';
import { AuthContext } from "../../../AuthContext";

// PaginationControls Component
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

const ISO27001 = () => {
  const { user } = useContext(AuthContext);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [controls, setControls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRegId, setSelectedRegId] = useState("");
  const [selectedParentId, setSelectedParentId] = useState("");
  const [showFilters, setShowFilters] = useState(false);
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
  const [activeControl, setActiveControl] = useState(null);
  const [controlForm, setControlForm] = useState({
    reg_id: "",
    parent_ctrl_id: "",
    parent_ctrl_name: "",
    parent_ctrl_description: "",
    ctrl_id: "",
    ctrl_number: "",
    ctrl_name: "",
    ctrl_definition: "",
    ctrl_guidance_text: "",
    key_point_id: "",
    key_point: "",
  });
  const [expandedCells, setExpandedCells] = useState({});

  const [keyPointsModal, setKeyPointsModal] = useState({ isOpen: false, control: null });

  const regIdOptions = [
    "REG00001",
    // "REG00002",
    // "REG00003",
  ];

  const parentIdOptions = [
    { id: "PCT00001", name: "Organizational controls" },
    { id: "PCT00002", name: "People controls" },
    { id: "PCT00003", name: "Physical controls" },
    { id: "PCT00004", name: "Technological controls" },
  ];

  useEffect(() => {
    if (user?.role === "admin") {
      setIsAdmin(true);
    }
  }, [user]);

  const fetchControls = async () => {
    try {
      setIsLoading(true);
      let url = "/api/policylens/iso27001/";
      const params = new URLSearchParams();

      if (searchQuery) params.append("search", searchQuery);
      if (selectedRegId) params.append("reg_id", selectedRegId);
      if (selectedParentId) params.append("parent_ctrl_id", selectedParentId);

      // Set page size and page number
      params.append("page_size", pagination.pageSize === "all" ? "all" : pagination.pageSize);
      if (pagination.pageSize !== "all") {
        params.append("page", pagination.currentPage);
      }
      params.append("ordering", "ctrl_id");

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await apiRequest("GET", url, null, true);
      const results = response.data?.results || [];
      const totalCount = response.data?.count || 0;

      setControls(results);
      setPagination((prev) => ({
        ...prev,
        totalCount,
        totalPages:
          pagination.pageSize === "all"
            ? 1
            : Math.ceil(totalCount / (typeof pagination.pageSize === "string" ? parseInt(pagination.pageSize, 10) : pagination.pageSize)),
      }));
    } catch (error) {
      console.error("Error fetching controls:", error);
      message.error("Failed to fetch controls");
      setControls([]);
      setPagination((prev) => ({
        ...prev,
        totalCount: 0,
        totalPages: 1,
      }));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchControls();
  }, [
    searchQuery,
    selectedRegId,
    selectedParentId,
    pagination.pageSize,
    pagination.currentPage, // Add currentPage to trigger fetch on page change
  ]);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: newPage }));
    }
  };

  const handlePageSizeChange = (newPageSize) => {
    setPagination({
      currentPage: 1, // Reset to page 1 on page size change
      pageSize: newPageSize === "all" ? "all" : parseInt(newPageSize, 10),
      totalCount: pagination.totalCount,
      totalPages: 1, // Will be updated after fetch
    });
  };


  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPagination(p => ({ ...p, currentPage: 1 }));
  };

  const handleParentIdChange = (e) => {
    setSelectedParentId(e.target.value);
    setPagination(p => ({ ...p, currentPage: 1 }));
  };

  const handleClearFilters = () => {
    setSelectedRegId("");
    setSelectedParentId("");
    setSearchQuery("");
    setPagination(p => ({ ...p, currentPage: 1 }));
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setControlForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const openAddModal = () => {
    setModalType("add");
    setShowModal(true);
    setControlForm({
      reg_id: "",
      parent_ctrl_id: "",
      parent_ctrl_name: "",
      parent_ctrl_description: "",
      ctrl_id: "",
      ctrl_number: "",
      ctrl_name: "",
      ctrl_definition: "",
      ctrl_guidance_text: "",
      key_point_id: "",
      key_point: "",
    });
  };

  const openEditModal = (control) => {
    setModalType("edit");
    setActiveControl(control);
    setControlForm({
      reg_id: control.reg_id,
      parent_ctrl_id: control.parent_ctrl_id,
      parent_ctrl_name: control.parent_ctrl_name,
      parent_ctrl_description: control.parent_ctrl_description,
      ctrl_id: control.ctrl_id,
      ctrl_number: control.ctrl_number,
      ctrl_name: control.ctrl_name,
      ctrl_definition: control.ctrl_definition,
      ctrl_guidance_text: control.ctrl_guidance_text,
      key_point_id: control.key_point_id,
      key_point: control.key_point,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType("");
    setActiveControl(null);
    setControlForm({
      reg_id: "",
      parent_ctrl_id: "",
      parent_ctrl_name: "",
      parent_ctrl_description: "",
      ctrl_id: "",
      ctrl_number: "",
      ctrl_name: "",
      ctrl_definition: "",
      ctrl_guidance_text: "",
      key_point_id: "",
      key_point: "",
    });
    setSelectedFile(null);
    setPartialErrors([]);
  };

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
        "/api/policylens/iso27001/upload/",
        formData,
        true,
        true
      );

      if (response.status === 201 || response.status === 207) {
        message.success(response.data.message || "File uploaded successfully");
        setPartialErrors(response.data.errors || []);
        fetchControls();
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === "add") {
        const response = await apiRequest(
          "POST",
          "/api/policylens/iso27001/create/",
          controlForm,
          true
        );
        if (response.status === 201) {
          message.success("Control created successfully");
          fetchControls(1);
          closeModal();
        }
      } else if (modalType === "edit" && activeControl) {
        const response = await apiRequest(
          "PATCH",
          `/api/policylens/iso27001/${activeControl.id}/update/`,
          controlForm,
          true
        );
        if (response.status === 200) {
          message.success("Control updated successfully");
          fetchControls();
          closeModal();
        }
      }
    } catch (error) {
      console.error("Error submitting control:", error);
      message.error(error.response?.data?.error || "Failed to save control");
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await apiRequest(
        "DELETE",
        `/api/policylens/iso27001/${id}/delete/`,
        null,
        true
      );
      if (response.status === 204) {
        message.success("Control deleted successfully");
        fetchControls();
      }
    } catch (error) {
      console.error("Error deleting control:", error);
      message.error("Failed to delete control");
    }
  };

  const toggleCellExpansion = (controlId, field) => {
    setExpandedCells((prev) => ({
      ...prev,
      [`${controlId}-${field}`]: !prev[`${controlId}-${field}`],
    }));
  };

  const uniqueControls = Array.from(
    new Map(controls.map((c) => [c.ctrl_id, c])).values()
  ).sort((a, b) => a.ctrl_id.localeCompare(b.ctrl_id));

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white p-6 shadow-sm flex-none">
        <div className="flex items-center gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search controls..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            <Search
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
            />
          </div>

          {/* <select
            value={selectedRegId}
            onChange={(e) => setSelectedRegId(e.target.value)}
            className="block w-40 border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Reg IDs</option>
            {regIdOptions.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select> */}

          <select
            value={selectedParentId}
            onChange={handleParentIdChange}
            className="block w-64 border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Parent Controls</option>
            {parentIdOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
          {(selectedRegId || selectedParentId || searchQuery) && (
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
                Add Control
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
            <div className="sticky top-0 z-20 bg-white border-b border-slate-200">
              <PaginationControls
                pagination={pagination}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            </div>
            <div className="relative">
              <table className="w-full border-collapse">
                <thead className="bg-slate-200 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Reg ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Parent Control ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Parent Control Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Parent Control Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Control ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Control Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Control Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Control Definition
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Control Guidance
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {controls.map((control) => (
                    <tr key={control.ctrl_id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 align-top whitespace-nowrap text-sm font-medium text-slate-900">
                        {control.reg_id}
                      </td>
                      <td className="px-6 py-4 align-top whitespace-nowrap text-sm font-medium text-slate-900">
                        {control.parent_ctrl_id}
                      </td>
                      <td className="px-6 py-4 align-top whitespace-nowrap text-sm font-medium text-slate-900">
                        {control.parent_ctrl_name}
                      </td>
                      <td className="px-6 py-4 align-top whitespace-pre-wrap text-sm text-slate-600">
                        {control.parent_ctrl_description}
                      </td>
                      <td className="px-6 py-4 align-top whitespace-nowrap text-sm font-medium text-slate-900">
                        {control.ctrl_id}
                      </td>
                      <td className="px-6 py-4 align-top whitespace-nowrap text-sm font-medium text-slate-900">
                        {control.ctrl_number}
                      </td>
                      <td className="px-6 py-4 align-top whitespace-nowrap text-sm text-slate-600">
                        {control.ctrl_name}
                      </td>
                      <td
                        className="px-6 py-4 align-top text-sm text-slate-600 min-w-[300px] max-w-[400px] whitespace-pre-wrap cursor-pointer"
                        onClick={() => toggleCellExpansion(control.ctrl_id, 'ctrl_definition')}
                        role="button"
                        tabIndex={0}
                        aria-expanded={expandedCells[`${control.ctrl_id}-ctrl_definition`] || false}
                        aria-label="Toggle control definition"
                        onKeyDown={(e) => e.key === 'Enter' && toggleCellExpansion(control.ctrl_id, 'ctrl_definition')}
                      >
                        <div className={`${expandedCells[`${control.ctrl_id}-ctrl_definition`] ? '' : 'line-clamp-3'}`}>
                          {control.ctrl_definition}
                        </div>
                        <span className="text-blue-600 hover:text-blue-800">
                          {expandedCells[`${control.ctrl_id}-ctrl_definition`] ? 'Show Less' : '...'}
                        </span>
                      </td>
                      <td
                        className="px-6 py-4 align-top text-sm text-slate-600 min-w-[300px] max-w-[400px] whitespace-pre-wrap cursor-pointer"
                        onClick={() => toggleCellExpansion(control.ctrl_id, 'ctrl_guidance_text')}
                        role="button"
                        tabIndex={0}
                        aria-expanded={expandedCells[`${control.ctrl_id}-ctrl_guidance_text`] || false}
                        aria-label="Toggle control guidance"
                        onKeyDown={(e) => e.key === 'Enter' && toggleCellExpansion(control.ctrl_id, 'ctrl_guidance_text')}
                      >
                        <div className={`${expandedCells[`${control.ctrl_id}-ctrl_guidance_text`] ? '' : 'line-clamp-3'}`}>
                          {control.ctrl_guidance_text}
                        </div>
                        <span className="text-blue-600 hover:text-blue-800">
                          {expandedCells[`${control.ctrl_id}-ctrl_guidance_text`] ? 'Show Less' : '...'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            className="text-slate-400 hover:text-blue-600 transition-colors p-1 rounded hover:bg-slate-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              setKeyPointsModal({
                                isOpen: true,
                                control: control,
                              });
                            }}
                            title="View Key Point Details"
                            aria-label="View key point details"
                            aria-describedby={`key-point-${control.ctrl_id}`}
                          >
                            <Eye size={16} />
                          </button>
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => openEditModal(control)}
                                className="text-blue-600 hover:text-blue-800 transition-colors"
                                aria-label="Edit control"
                                title="Edit Control"
                              >
                                <Edit size={18} />
                              </button>
                              <Popconfirm
                                title="Delete this control?"
                                description="This action cannot be undone."
                                onConfirm={() => handleDelete(control.ctrl_id)}
                                okText="Yes"
                                cancelText="No"
                                okButtonProps={{ className: 'bg-red-500' }}
                              >
                                <button
                                  className="text-red-600 hover:text-red-800 transition-colors"
                                  aria-label="Delete control"
                                  title="Delete Control"
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
      {
        showModal && modalType !== "excel" && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-lg font-medium text-slate-900">
                  {modalType === "add" ? "Add New Control" : "Edit Control"}
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
                      value={controlForm.reg_id}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Parent Control ID
                    </label>
                    <input
                      type="text"
                      name="parent_ctrl_id"
                      value={controlForm.parent_ctrl_id}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Parent Control Name
                    </label>
                    <input
                      type="text"
                      name="parent_ctrl_name"
                      value={controlForm.parent_ctrl_name}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Parent Control Description
                    </label>
                    <textarea
                      name="parent_ctrl_description"
                      value={controlForm.parent_ctrl_description}
                      onChange={handleInputChange}
                      rows={2}
                      className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Control ID
                    </label>
                    <input
                      type="text"
                      name="ctrl_id"
                      value={controlForm.ctrl_id}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Control Number
                    </label>
                    <input
                      type="text"
                      name="ctrl_number"
                      value={controlForm.ctrl_number}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Control Name
                    </label>
                    <input
                      type="text"
                      name="ctrl_name"
                      value={controlForm.ctrl_name}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Control Definition
                    </label>
                    <textarea
                      name="ctrl_definition"
                      value={controlForm.ctrl_definition}
                      onChange={handleInputChange}
                      rows={3}
                      className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Control Guidance Text
                    </label>
                    <textarea
                      name="ctrl_guidance_text"
                      value={controlForm.ctrl_guidance_text}
                      onChange={handleInputChange}
                      rows={3}
                      className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Key Point ID
                    </label>
                    <input
                      type="text"
                      name="key_point_id"
                      value={controlForm.key_point_id}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Key Point
                    </label>
                    <input
                      type="text"
                      name="key_point"
                      value={controlForm.key_point}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
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
                    {modalType === "add" ? "Add Control" : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }
      {
        showModal && modalType === "excel" && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-xl w-full mx-4 max-h-[90vh] flex flex-col">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-lg font-medium text-slate-900">
                  Upload ISO 27001 Controls Excel File
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
                            Row {error.row}: {Object.entries(error.errors).map(([field, msg]) => `${field}: ${msg}`).join(", ")}
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
        )
      }
      {/* Key Points Modal */}

      {keyPointsModal.isOpen && keyPointsModal.control && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-3xl p-0 shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-indigo-600 p-4 text-white">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold flex items-center">
                  <FileText size={20} className="mr-2" />
                  Key Points for Control {keyPointsModal.control.ctrl_id}
                </h3>
                <button
                  type="button"
                  onClick={() => setKeyPointsModal({ isOpen: false, control: null })}
                  className="text-white hover:text-gray-200 transition-colors focus:outline-none"
                  aria-label="Close modal"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Content - Scrollable */}
            <div className="p-6 overflow-y-auto flex-grow">
              {/* Key Points Section */}
              <div className="bg-indigo-50 p-4 rounded-lg">
                <h4 className="text-sm uppercase text-gray-700 font-semibold mb-3 border-b border-indigo-200 pb-1">
                  Key Point Information
                </h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 rounded-md">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-2 text-left text-xs text-gray-700 font-semibold uppercase tracking-wider border-b">
                          Key Point ID
                        </th>
                        <th className="px-4 py-2 text-left text-xs text-gray-700 font-semibold uppercase tracking-wider border-b">
                          Key Point
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {keyPointsModal.control.key_point_ids.map((id, idx) => (
                        <tr key={id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm text-gray-900 font-medium">{id || 'N/A'}</td>
                          <td className="px-4 py-2 text-sm text-gray-900 font-medium">
                            {keyPointsModal.control.key_points[idx] || 'N/A'}
                          </td>
                        </tr>
                      ))}
                      {keyPointsModal.control.key_point_ids.length === 0 && (
                        <tr>
                          <td colSpan="2" className="px-4 py-2 text-sm text-gray-600 text-center">
                            No key points available.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-4 flex justify-end bg-white">
              <button
                type="button"
                onClick={() => setKeyPointsModal({ isOpen: false, control: null })}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div >
  );
};

export default ISO27001;