import React, { useState, useEffect, useRef, useContext } from "react";
import { message, Popconfirm, Spin } from "antd";
import { Search, Plus, Upload, X, Edit, Trash2 } from "lucide-react";
import { apiRequest } from "../../../utils/api";
import { AuthContext } from "../../../AuthContext";
import { LoadingOutlined } from "@ant-design/icons";

const ISO27001 = () => {
  const { user } = useContext(AuthContext);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [controls, setControls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRegId, setSelectedRegId] = useState("");
  const [selectedParentId, setSelectedParentId] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const regIdOptions = [
    "REG00001",
    // "REG00002",
    // "REG00003"
  ];

  const parentIdOptions = [
    { id: "PCT00001", name: "Organizational controls" },
    { id: "PCT00002", name: "People controls" },
    { id: "PCT00003", name: "Physical controls" },
    { id: "PCT00004", name: "Technological controls" },
  ];

  // File upload states
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [partialErrors, setPartialErrors] = useState([]);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [activeControl, setActiveControl] = useState(null);

  // Form state
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

  // Check if user is admin
  useEffect(() => {
    if (user?.role === "admin") {
      setIsAdmin(true);
    }
  }, [user]);

  // Fetch controls
  const fetchControls = async () => {
    try {
      setIsLoading(true);
      let url = "/api/policylens/iso27001/";
      const params = new URLSearchParams();

      if (searchQuery) params.append("search", searchQuery);
      if (selectedRegId) params.append("reg_id", selectedRegId);
      if (selectedParentId) params.append("parent_ctrl_id", selectedParentId);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await apiRequest("GET", url, null, true);
      setControls(response.data);
    } catch (error) {
      console.error("Error fetching controls:", error);
      message.error("Failed to fetch controls");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchControls();
  }, [searchQuery, selectedRegId, selectedParentId]);

  // Form handlers
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
        "/api/policylens/iso27001/upload/",
        formData,
        true,
        true
      );

      if (response.status === 201) {
        message.success("File uploaded successfully");
        fetchControls();
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
          "/api/policylens/iso27001/create/",
          controlForm,
          true
        );
        if (response.status === 201) {
          message.success("Control created successfully");
          fetchControls();
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
      message.error("Failed to save control");
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

  return (
    <div className="h-full flex flex-col">
      {" "}
      <div className="bg-white p-6 shadow-sm flex-none">
        <div className="flex items-center gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
            onChange={(e) => setSelectedParentId(e.target.value)}
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
              onClick={() => {
                setSelectedRegId("");
                setSelectedParentId("");
                setSearchQuery("");
              }}
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
            <Spin
              indicator={<LoadingOutlined style={{ fontSize: 40 }} spin />}
            />
          </div>
        ) : (
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Key Point ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Key Point
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200 overflow-y-auto">
                {controls.map((control) => (
                  <tr key={control.id} className="hover:bg-slate-50">
                    {" "}
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
                    </td>{" "}
                    <td className="px-6 py-4 align-top text-sm text-slate-600 min-w-[300px] max-w-[400px] whitespace-pre-wrap">
                      {control.ctrl_definition}
                    </td>
                    <td className="px-6 py-4 align-top text-sm text-slate-600 min-w-[1200px] max-w-[1200px] whitespace-pre-wrap">
                      {control.ctrl_guidance_text}
                    </td>
                    <td className="px-6 py-4 align-top whitespace-nowrap text-sm font-medium text-slate-900">
                      {control.key_point_id}
                    </td>
                    <td className="px-6 py-4 align-top text-sm text-slate-600 min-w-[200px] max-w-[300px] whitespace-pre-wrap">
                      {control.key_point}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => openEditModal(control)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Edit size={18} />
                            </button>
                            <Popconfirm
                              title="Delete this control?"
                              description="This action cannot be undone."
                              onConfirm={() => handleDelete(control.id)}
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
        )}{" "}
      </div>
      {/* Add/Edit Modal */}
      {showModal && modalType !== "excel" && (
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
      )}{" "}
      {/* Excel Upload Modal */}
      {showModal && modalType === "excel" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-xl w-full mx-4 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-medium text-slate-900">
                Upload ISO 27001 Controls Excel File
              </h3>
              <button onClick={closeModal}>
                <X size={20} className="text-slate-400" />
              </button>{" "}
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

export default ISO27001;
