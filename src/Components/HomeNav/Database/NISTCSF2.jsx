import React, { useState, useEffect, useCallback, useRef } from "react";
import { Search, Filter, Upload, Plus, Eye, Edit, Trash2, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { message, Popconfirm, Spin } from "antd";
import { apiRequest } from "../../../utils/api";
import { useTheme } from "../../../contexts/ThemeContext";

const NISTCSF2 = () => {
  const { isDarkMode } = useTheme();
  const [controls, setControls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [functionFilter, setFunctionFilter] = useState("");
  const [parentCtrlFilter, setParentCtrlFilter] = useState("");
  const [functions, setFunctions] = useState([]);
  const [parentCtrls, setParentCtrls] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedControl, setSelectedControl] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingControl, setEditingControl] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [formData, setFormData] = useState({
    reg_id: "REG00004",
    function_id: "",
    function_name: "",
    function_description: "",
    parent_ctrl: "",
    parent_ctrl_id: "",
    ctrl_id: "",
    ctrl_number: "",
    ctrl_name: "",
    ctrl_definition: "",
    ctrl_guidance: "",
    key_point: "",
    key_point_id: "",
  });
  const fileInputRef = useRef(null);

  // Fetch controls
  const fetchControls = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (functionFilter) params.append("function_id", functionFilter);
      if (parentCtrlFilter) params.append("parent_ctrl_id", parentCtrlFilter);
      
      // Add pagination parameters
      params.append("page", currentPage.toString());
      params.append("page_size", rowsPerPage.toString());

      const response = await apiRequest("GET", `/api/policylens/nist-csf-2-0/?${params}`, null, true);
      
      // Handle both paginated and non-paginated responses
      if (response.data.results) {
        setControls(response.data.results);
        setTotalCount(response.data.count || response.data.results.length);
      } else {
        setControls(response.data);
        setTotalCount(response.data.length);
      }
    } catch (error) {
      console.error("Error fetching controls:", error);
      message.error("Failed to fetch controls");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, functionFilter, parentCtrlFilter, currentPage, rowsPerPage]);

  // Fetch unique functions and parent controls for filters
  const fetchFilters = useCallback(async () => {
    try {
      const response = await apiRequest("GET", "/api/policylens/nist-csf-2-0/", null, true);
      const data = response.data.results || response.data;
      
      const uniqueFunctions = [...new Set(data.map(item => item.function_id))].map(id => {
        const item = data.find(d => d.function_id === id);
        return { id, name: item.function_name };
      });
      
      const uniqueParentCtrls = [...new Set(data.map(item => item.parent_ctrl_id))].map(id => {
        const item = data.find(d => d.parent_ctrl_id === id);
        return { id, name: item.parent_ctrl };
      });
      
      setFunctions(uniqueFunctions);
      setParentCtrls(uniqueParentCtrls);
    } catch (error) {
      console.error("Error fetching filters:", error);
    }
  }, []);

  useEffect(() => {
    fetchControls();
    fetchFilters();
  }, [fetchControls, fetchFilters]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, functionFilter, parentCtrlFilter]);

  // Pagination calculations
  const totalPages = Math.ceil(totalCount / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage + 1;
  const endIndex = Math.min(currentPage * rowsPerPage, totalCount);
  

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1); // Reset to first page
  };

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await apiRequest("POST", "/api/policylens/nist-csf-2-0/upload/", formData, true, true);
      message.success("File uploaded successfully");
      fetchControls();
      fetchFilters();
    } catch (error) {
      console.error("Error uploading file:", error);
      message.error(`Failed to upload file: ${error.message || error.detail || "Unknown error"}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Handle add/edit control
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingControl) {
        await apiRequest("PUT", `/api/policylens/nist-csf-2-0/${editingControl.ctrl_id}/`, formData, true);
        message.success("Control updated successfully");
      } else {
        await apiRequest("POST", "/api/policylens/nist-csf-2-0/create/", formData, true);
        message.success("Control created successfully");
      }
      setShowAddModal(false);
      setEditingControl(null);
      setFormData({
        reg_id: "REG00004",
        function_id: "",
        function_name: "",
        function_description: "",
        parent_ctrl: "",
        parent_ctrl_id: "",
        ctrl_id: "",
        ctrl_number: "",
        ctrl_name: "",
        ctrl_definition: "",
        ctrl_guidance: "",
        key_point: "",
        key_point_id: "",
      });
      fetchControls();
      fetchFilters();
    } catch (error) {
      console.error("Error saving control:", error);
      message.error(`Failed to save control: ${error.message || error.detail || "Unknown error"}`);
    }
  };

  // Handle delete control
  const handleDelete = async (ctrlId) => {
    try {
      await apiRequest("DELETE", `/api/policylens/nist-csf-2-0/${ctrlId}/`, null, true);
      message.success("Control deleted successfully");
      fetchControls();
    } catch (error) {
      console.error("Error deleting control:", error);
      message.error(`Failed to delete control: ${error.message || error.detail || "Unknown error"}`);
    }
  };

  // Handle edit control
  const handleEdit = (control) => {
    setEditingControl(control);
    setFormData({
      reg_id: control.reg_id,
      function_id: control.function_id,
      function_name: control.function_name,
      function_description: control.function_description,
      parent_ctrl: control.parent_ctrl,
      parent_ctrl_id: control.parent_ctrl_id,
      ctrl_id: control.ctrl_id,
      ctrl_number: control.ctrl_number,
      ctrl_name: control.ctrl_name,
      ctrl_definition: control.ctrl_definition,
      ctrl_guidance: control.ctrl_guidance,
      key_point: control.key_point,
      key_point_id: control.key_point_id,
    });
    setShowAddModal(true);
  };

  // Handle view control details
  const handleView = (control) => {
    setSelectedControl(control);
    setShowModal(true);
  };

  return (
    <div className="h-full flex flex-col">
      <div className={`p-6 shadow-sm flex-none ${isDarkMode ? 'dark-bg-card' : 'bg-white'}`}>
        <div className="flex items-center justify-between">
          <h2 className={`text-xl font-semibold ${isDarkMode ? 'dark-text-primary' : 'text-gray-800'}`}>NIST CSF 2.0 Controls</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg disabled:opacity-50 ${
                isDarkMode 
                  ? 'dark-bg-card dark-border dark-text-primary hover:dark-bg-hover' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Upload size={16} />
              {uploading ? "Uploading..." : "Upload Excel"}
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Plus size={16} />
              Add Control
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className={`p-4 shadow-sm border-b flex-none ${isDarkMode ? 'dark-bg-card dark-border' : 'bg-white'}`}>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search controls..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  isDarkMode 
                    ? 'dark-bg-card dark-border dark-text-primary' 
                    : 'border-gray-300'
                }`}
              />
            </div>
          </div>
          <div className="min-w-48 max-w-64">
            <select
              value={functionFilter}
              onChange={(e) => setFunctionFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Functions</option>
              {functions.map((func) => (
                <option key={func.id} value={func.id}>
                  {func.name}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-48 max-w-64">
            <select
              value={parentCtrlFilter}
              onChange={(e) => setParentCtrlFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Parent Controls</option>
              {parentCtrls.map((ctrl) => (
                <option key={ctrl.id} value={ctrl.id}>
                  {ctrl.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Controls Table */}
      <div className={`flex-1 flex flex-col overflow-hidden ${isDarkMode ? 'dark-bg-card' : 'bg-white'}`}>
        <div className="flex-1 overflow-auto">
          <table className="w-full min-w-max">
            <thead className={`sticky top-0 z-10 ${isDarkMode ? 'dark-bg-tertiary' : 'bg-gray-50'}`}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'dark-text-secondary' : 'text-gray-500'}`}>
                  REG ID
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'dark-text-secondary' : 'text-gray-500'}`}>
                  FUNCTION ID
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'dark-text-secondary' : 'text-gray-500'}`}>
                  FUNCTION NAME
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'dark-text-secondary' : 'text-gray-500'}`}>
                  FUNCTION DESCRIPTION
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'dark-text-secondary' : 'text-gray-500'}`}>
                  PARENT CTRL
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'dark-text-secondary' : 'text-gray-500'}`}>
                  PARENT CTRL ID
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'dark-text-secondary' : 'text-gray-500'}`}>
                  CTRL ID
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'dark-text-secondary' : 'text-gray-500'}`}>
                  CTRL NUMBER
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'dark-text-secondary' : 'text-gray-500'}`}>
                  CTRL NAME
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'dark-text-secondary' : 'text-gray-500'}`}>
                  CTRL DEFINITION
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'dark-text-secondary' : 'text-gray-500'}`}>
                  CTRL GUIDANCE
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'dark-text-secondary' : 'text-gray-500'}`}>
                  KEY POINT
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'dark-text-secondary' : 'text-gray-500'}`}>
                  KEY POINT ID
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'dark-text-secondary' : 'text-gray-500'}`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="14" className="px-6 py-12 text-center">
                    <Spin size="large" />
                  </td>
                </tr>
              ) : controls.length === 0 ? (
                <tr>
                  <td colSpan="14" className="px-6 py-12 text-center text-gray-500">
                    No controls found
                  </td>
                </tr>
              ) : (
                controls.map((control) => (
                  <tr key={control.ctrl_id} className={isDarkMode ? 'hover:dark-bg-hover' : 'hover:bg-gray-50'}>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDarkMode ? 'dark-text-primary' : 'text-gray-900'}`}>
                      {control.reg_id}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'dark-text-secondary' : 'text-gray-500'}`}>
                      {control.function_id}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'dark-text-secondary' : 'text-gray-500'}`}>
                      {control.function_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="max-w-xs truncate" title={control.function_description}>
                        {control.function_description}
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'dark-text-secondary' : 'text-gray-500'}`}>
                      {control.parent_ctrl}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'dark-text-secondary' : 'text-gray-500'}`}>
                      {control.parent_ctrl_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {control.ctrl_id}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'dark-text-secondary' : 'text-gray-500'}`}>
                      {control.ctrl_number}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="max-w-xs truncate" title={control.ctrl_name}>
                        {control.ctrl_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="max-w-xs truncate" title={control.ctrl_definition}>
                        {control.ctrl_definition}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="max-w-xs truncate" title={control.ctrl_guidance}>
                        {control.ctrl_guidance}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="max-w-xs truncate" title={control.key_point}>
                        {control.key_point}
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'dark-text-secondary' : 'text-gray-500'}`}>
                      {control.key_point_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleView(control)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleEdit(control)}
                          className="text-green-600 hover:text-green-900"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <Popconfirm
                          title="Are you sure you want to delete this control?"
                          onConfirm={() => handleDelete(control.ctrl_id)}
                          okText="Yes"
                          cancelText="No"
                        >
                          <button
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </Popconfirm>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        <div className={`flex items-center justify-between p-4 border-t flex-none ${isDarkMode ? 'dark-bg-card dark-border' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-2">
            <label htmlFor="pageSize" className={`text-sm ${isDarkMode ? 'dark-text-secondary' : 'text-slate-600'}`}>
              Rows per page:
            </label>
            <select
              id="pageSize"
              value={rowsPerPage}
              onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
              className={`border rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                isDarkMode 
                  ? 'dark-bg-card dark-border dark-text-primary' 
                  : 'border-slate-300'
              }`}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          <div className={`text-sm ${isDarkMode ? 'dark-text-secondary' : 'text-slate-600'}`}>
            Page {currentPage} of {totalPages} ({totalCount} items)
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`flex items-center justify-center w-8 h-8 rounded-md border disabled:opacity-50 disabled:cursor-not-allowed ${
                isDarkMode 
                  ? 'dark-border hover:dark-bg-hover' 
                  : 'border-slate-300 hover:bg-slate-100'
              }`}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`flex items-center justify-center w-8 h-8 rounded-md border disabled:opacity-50 disabled:cursor-not-allowed ${
                isDarkMode 
                  ? 'dark-border hover:dark-bg-hover' 
                  : 'border-slate-300 hover:bg-slate-100'
              }`}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* View Details Modal */}
      {showModal && selectedControl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Control Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">REG ID</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedControl.reg_id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">FUNCTION ID</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedControl.function_id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">FUNCTION NAME</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedControl.function_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">PARENT CTRL</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedControl.parent_ctrl}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">PARENT CTRL ID</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedControl.parent_ctrl_id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">CTRL ID</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedControl.ctrl_id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">CTRL NUMBER</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedControl.ctrl_number}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">KEY POINT ID</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedControl.key_point_id}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">FUNCTION DESCRIPTION</label>
                <p className="mt-1 text-sm text-gray-900">{selectedControl.function_description}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">CTRL NAME</label>
                <p className="mt-1 text-sm text-gray-900">{selectedControl.ctrl_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">CTRL DEFINITION</label>
                <p className="mt-1 text-sm text-gray-900">{selectedControl.ctrl_definition}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">CTRL GUIDANCE</label>
                <p className="mt-1 text-sm text-gray-900">{selectedControl.ctrl_guidance}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">KEY POINT</label>
                <p className="mt-1 text-sm text-gray-900">{selectedControl.key_point}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingControl ? "Edit Control" : "Add New Control"}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingControl(null);
                  setFormData({
                    reg_id: "REG00004",
                    function_id: "",
                    function_name: "",
                    function_description: "",
                    parent_ctrl: "",
                    parent_ctrl_id: "",
                    ctrl_id: "",
                    ctrl_number: "",
                    ctrl_name: "",
                    ctrl_definition: "",
                    ctrl_guidance: "",
                    key_point: "",
                    key_point_id: "",
                  });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">REG ID *</label>
                  <input
                    type="text"
                    required
                    value={formData.reg_id}
                    onChange={(e) => setFormData({ ...formData, reg_id: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">CTRL ID *</label>
                  <input
                    type="text"
                    required
                    value={formData.ctrl_id}
                    onChange={(e) => setFormData({ ...formData, ctrl_id: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">CTRL NUMBER *</label>
                  <input
                    type="text"
                    required
                    value={formData.ctrl_number}
                    onChange={(e) => setFormData({ ...formData, ctrl_number: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">FUNCTION ID *</label>
                  <input
                    type="text"
                    required
                    value={formData.function_id}
                    onChange={(e) => setFormData({ ...formData, function_id: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">FUNCTION NAME *</label>
                  <input
                    type="text"
                    required
                    value={formData.function_name}
                    onChange={(e) => setFormData({ ...formData, function_name: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">PARENT CTRL ID *</label>
                  <input
                    type="text"
                    required
                    value={formData.parent_ctrl_id}
                    onChange={(e) => setFormData({ ...formData, parent_ctrl_id: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">PARENT CTRL *</label>
                  <input
                    type="text"
                    required
                    value={formData.parent_ctrl}
                    onChange={(e) => setFormData({ ...formData, parent_ctrl: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">CTRL NAME *</label>
                <input
                  type="text"
                  required
                  value={formData.ctrl_name}
                  onChange={(e) => setFormData({ ...formData, ctrl_name: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">FUNCTION DESCRIPTION</label>
                <textarea
                  value={formData.function_description}
                  onChange={(e) => setFormData({ ...formData, function_description: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">CTRL DEFINITION</label>
                <textarea
                  value={formData.ctrl_definition}
                  onChange={(e) => setFormData({ ...formData, ctrl_definition: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">CTRL GUIDANCE</label>
                <textarea
                  value={formData.ctrl_guidance}
                  onChange={(e) => setFormData({ ...formData, ctrl_guidance: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">KEY POINT</label>
                <textarea
                  value={formData.key_point}
                  onChange={(e) => setFormData({ ...formData, key_point: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">KEY POINT ID</label>
                <input
                  type="text"
                  value={formData.key_point_id}
                  onChange={(e) => setFormData({ ...formData, key_point_id: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingControl(null);
                    setFormData({
                      reg_id: "REG00004",
                      function_id: "",
                      function_name: "",
                      function_description: "",
                      parent_ctrl: "",
                      parent_ctrl_id: "",
                      ctrl_id: "",
                      ctrl_number: "",
                      ctrl_name: "",
                      ctrl_definition: "",
                      ctrl_guidance: "",
                      key_point: "",
                      key_point_id: "",
                    });
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingControl ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NISTCSF2;
