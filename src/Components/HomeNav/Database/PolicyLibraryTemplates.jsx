import React, { useState, useRef, useContext, useCallback, useEffect } from "react";
import { message, Button, Modal, Table, Input, Spin, Switch, Popconfirm } from "antd";
import { UploadCloud, Search, Download, Edit, Trash2 } from "lucide-react";
import { apiRequest } from "../../../utils/api";
import { AuthContext } from "../../../AuthContext";

const PolicyLibraryTemplates = () => {
  const { user } = useContext(AuthContext);
  const [isAdmin, setIsAdmin] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [uploadTemplateModal, setUploadTemplateModal] = useState({
    isOpen: false,
  });
  const [editTemplateModal, setEditTemplateModal] = useState({
    isOpen: false,
    template: null,
  });
  const [templateFormData, setTemplateFormData] = useState({
    template_id: "",
    template_name: "",
    template_type: "",
    active: true,
    version: "",
  });
  const [selectedTemplateFile, setSelectedTemplateFile] = useState(null);
  const [isUploadingTemplate, setIsUploadingTemplate] = useState(false);
  const [isUpdatingTemplate, setIsUpdatingTemplate] = useState(false);
  const [isDeletingTemplate, setIsDeletingTemplate] = useState(false);
  const templateFileInputRef = useRef(null);

  React.useEffect(() => {
    // Check for admin role (case-insensitive) to handle different serialization formats
    // The backend returns "Admin" (capitalized) via get_role_display(), but we check case-insensitively
    if (user?.role && user.role.toLowerCase() === "admin") {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  // Fetch templates from PolicyTemplate API
  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    try {
      let url = "/api/plc_workflow/templates/";
      const params = new URLSearchParams();
      
      if (searchQuery) params.append("search", searchQuery);
      // Explicitly show all templates (both active and inactive) - don't filter by active status
      // Note: Not passing 'active' parameter means backend will return all templates
      params.append("page", pagination.current);
      params.append("page_size", pagination.pageSize);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await apiRequest("GET", url, null, true);
      const results = response.data?.results || [];
      const totalCount = response.data?.count || 0;

      setTemplates(results);
      setPagination((prev) => ({
        ...prev,
        total: totalCount,
      }));
    } catch (error) {
      console.error("Error fetching templates:", error);
      message.error("Failed to fetch templates");
      setTemplates([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, pagination.current, pagination.pageSize]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleTableChange = (paginationConfig) => {
    setPagination((prev) => ({
      ...prev,
      current: paginationConfig.current,
      pageSize: paginationConfig.pageSize,
    }));
  };

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const openUploadTemplateModal = useCallback(() => {
    setUploadTemplateModal({
      isOpen: true,
    });
    setTemplateFormData({
      template_id: "",
      template_name: "",
      template_type: "",
    });
    setSelectedTemplateFile(null);
  }, []);

  const closeUploadTemplateModal = useCallback(() => {
    setUploadTemplateModal({
      isOpen: false,
    });
    setTemplateFormData({
      template_id: "",
      template_name: "",
      template_type: "",
    });
    setSelectedTemplateFile(null);
    if (templateFileInputRef.current) {
      templateFileInputRef.current.value = "";
    }
  }, []);

  const handleTemplateFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedTemplateFile(file);
    }
  }, []);

  const handleTemplateInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setTemplateFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleTemplateUpload = useCallback(async () => {
    if (!selectedTemplateFile) {
      message.warning("Please select a file to upload.");
      return;
    }

    setIsUploadingTemplate(true);
    try {
      const uploadData = new FormData();
      uploadData.append("file", selectedTemplateFile);
      
      // Optional fields - only append if provided
      if (templateFormData.template_id) {
        uploadData.append("template_id", templateFormData.template_id);
      }
      if (templateFormData.template_name) {
        uploadData.append("template_name", templateFormData.template_name);
      }
      if (templateFormData.template_type) {
        uploadData.append("template_type", templateFormData.template_type);
      }

      await apiRequest(
        "POST",
        "/api/plc_workflow/templates/upload/",
        uploadData,
        true
      );
      message.success("Template uploaded successfully!");
      closeUploadTemplateModal();
      fetchTemplates(); // Refresh templates list
    } catch (error) {
      console.error("Error uploading template:", error);
      message.error(
        error.response?.data?.error || error.response?.data?.detail || "Failed to upload template. Please try again."
      );
    } finally {
      setIsUploadingTemplate(false);
    }
  }, [selectedTemplateFile, templateFormData, closeUploadTemplateModal, fetchTemplates]);

  const openEditTemplateModal = useCallback((template) => {
    setEditTemplateModal({
      isOpen: true,
      template: template,
    });
    setTemplateFormData({
      template_id: template.template_id || "",
      template_name: template.template_name || "",
      template_type: template.template_type || "",
      active: template.active !== undefined ? template.active : true,
      version: template.version || "",
    });
  }, []);

  const closeEditTemplateModal = useCallback(() => {
    setEditTemplateModal({
      isOpen: false,
      template: null,
    });
    setTemplateFormData({
      template_id: "",
      template_name: "",
      template_type: "",
      active: true,
      version: "",
    });
  }, []);

  const handleTemplateUpdate = useCallback(async () => {
    if (!editTemplateModal.template) return;

    setIsUpdatingTemplate(true);
    try {
      const updateData = {
        template_id: templateFormData.template_id,
        template_name: templateFormData.template_name,
        template_type: templateFormData.template_type,
        active: templateFormData.active,
        version: templateFormData.version,
      };

      await apiRequest(
        "PATCH",
        `/api/plc_workflow/templates/${editTemplateModal.template.id}/`,
        updateData,
        true
      );
      message.success("Template updated successfully!");
      closeEditTemplateModal();
      fetchTemplates(); // Refresh templates list
    } catch (error) {
      console.error("Error updating template:", error);
      message.error(
        error.response?.data?.error || 
        error.response?.data?.detail || 
        Object.values(error.response?.data || {}).flat().join(", ") ||
        "Failed to update template. Please try again."
      );
    } finally {
      setIsUpdatingTemplate(false);
    }
  }, [editTemplateModal.template, templateFormData, closeEditTemplateModal, fetchTemplates]);

  const handleTemplateDelete = useCallback(async (template) => {
    setIsDeletingTemplate(true);
    try {
      await apiRequest(
        "DELETE",
        `/api/plc_workflow/templates/${template.id}/`,
        null,
        true
      );
      message.success("Template deleted successfully!");
      fetchTemplates(); // Refresh templates list
    } catch (error) {
      console.error("Error deleting template:", error);
      message.error(
        error.response?.data?.error || 
        error.response?.data?.detail || 
        "Failed to delete template. Please try again."
      );
    } finally {
      setIsDeletingTemplate(false);
    }
  }, [fetchTemplates]);

  const columns = [
    {
      title: 'Template ID',
      dataIndex: 'template_id',
      key: 'template_id',
      width: 200,
    },
    {
      title: 'Template Name',
      dataIndex: 'template_name',
      key: 'template_name',
      width: 250,
    },
    {
      title: 'Template Type',
      dataIndex: 'template_type',
      key: 'template_type',
      width: 150,
    },
    {
      title: 'Version',
      dataIndex: 'version',
      key: 'version',
      width: 100,
    },
    {
      title: 'Created By',
      key: 'created_by',
      width: 200,
      render: (_, record) => record.created_by_details?.name || record.created_by || "N/A",
    },
    {
      title: 'Created Date',
      dataIndex: 'created_date',
      key: 'created_date',
      width: 150,
      render: (date) => formatDate(date),
    },
    {
      title: 'Status',
      dataIndex: 'active',
      key: 'active',
      width: 100,
      render: (active) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          active 
            ? "bg-green-100 text-green-800" 
            : "bg-gray-100 text-gray-800"
        }`}>
          {active ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <div className="flex gap-2">
          {record.excel_file && (
            <Button
              type="text"
              icon={<Download size={16} />}
              onClick={() => window.open(record.excel_file, "_blank")}
              title="Download Excel"
            />
          )}
          {isAdmin && (
            <>
              <Button
                type="text"
                icon={<Edit size={16} />}
                onClick={() => openEditTemplateModal(record)}
                title="Edit Template"
              />
              <Popconfirm
                title="Delete Template"
                description={`Are you sure you want to delete "${record.template_name}"? This action cannot be undone.`}
                onConfirm={() => handleTemplateDelete(record)}
                okText="Yes, Delete"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
              >
                <Button
                  type="text"
                  danger
                  icon={<Trash2 size={16} />}
                  loading={isDeletingTemplate}
                  title="Delete Template"
                />
              </Popconfirm>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="h-full flex flex-col p-6">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">Policy Library Templates</h2>
            <p className="text-sm text-slate-500 mt-1">
              Manage policy templates that will be available in the Policy Library
            </p>
          </div>
          {isAdmin && (
            <Button
              type="primary"
              icon={<UploadCloud size={18} />}
              onClick={openUploadTemplateModal}
            >
              Upload Template
            </Button>
          )}
        </div>
        <div className="mb-4">
          <Input
            placeholder="Search templates by name or ID..."
            value={searchQuery}
            onChange={handleSearchChange}
            prefix={<Search size={20} />}
            allowClear
            style={{ maxWidth: 400 }}
          />
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Spin size="large" />
        </div>
      ) : templates.length === 0 ? (
        <div className="flex-1 flex items-center justify-center bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
          <div className="text-center">
            <UploadCloud size={48} className="mx-auto text-slate-400 mb-4" />
            <p className="text-slate-600 font-medium mb-2">No templates found</p>
            <p className="text-sm text-slate-500">
              {searchQuery 
                ? "No templates match your search criteria" 
                : isAdmin 
                  ? "Click 'Upload Template' to add a new template" 
                  : "Only administrators can upload templates"}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <Table
            columns={columns}
            dataSource={templates}
            rowKey="id"
            loading={isLoading}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} templates`,
              pageSizeOptions: ['10', '20', '50', '100'],
            }}
            onChange={handleTableChange}
            scroll={{ x: 1200 }}
            size="middle"
          />
        </div>
      )}

      {/* Upload Template Modal */}
      <Modal
        title="Upload Policy Library Template"
        open={uploadTemplateModal.isOpen}
        onCancel={closeUploadTemplateModal}
        footer={[
          <Button key="cancel" onClick={closeUploadTemplateModal}>
            Cancel
          </Button>,
          <Button
            key="upload"
            type="primary"
            loading={isUploadingTemplate}
            disabled={!selectedTemplateFile}
            onClick={handleTemplateUpload}
          >
            Upload Template
          </Button>,
        ]}
        width={600}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Excel File *
            </label>
            <input
              ref={templateFileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleTemplateFileChange}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {selectedTemplateFile && (
              <p className="mt-2 text-sm text-green-600">
                Selected: {selectedTemplateFile.name}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              The template ID, name, and type will be extracted from the Excel file. You can override them below if needed.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template ID (Optional)
            </label>
            <input
              type="text"
              name="template_id"
              value={templateFormData.template_id}
              onChange={handleTemplateInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., ISMS-DOC-A05-1-1 (will be extracted from Excel if not provided)"
            />
            <p className="mt-1 text-xs text-gray-500">
              Override the template ID extracted from Excel
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template Name (Optional)
            </label>
            <input
              type="text"
              name="template_name"
              value={templateFormData.template_name}
              onChange={handleTemplateInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Social Media Policy (will be extracted from Excel if not provided)"
            />
            <p className="mt-1 text-xs text-gray-500">
              Override the template name extracted from Excel
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template Type (Optional)
            </label>
            <input
              type="text"
              name="template_type"
              value={templateFormData.template_type}
              onChange={handleTemplateInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., ISMS, ISO27001 (will be extracted from Excel if not provided)"
            />
            <p className="mt-1 text-xs text-gray-500">
              Override the template type extracted from Excel
            </p>
          </div>
        </div>
      </Modal>

      {/* Edit Template Modal */}
      <Modal
        title="Edit Policy Library Template"
        open={editTemplateModal.isOpen}
        onCancel={closeEditTemplateModal}
        footer={[
          <Button key="cancel" onClick={closeEditTemplateModal}>
            Cancel
          </Button>,
          <Button
            key="update"
            type="primary"
            loading={isUpdatingTemplate}
            onClick={handleTemplateUpdate}
          >
            Update Template
          </Button>,
        ]}
        width={600}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template ID *
            </label>
            <input
              type="text"
              name="template_id"
              value={templateFormData.template_id}
              onChange={handleTemplateInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., ISMS-DOC-A05-1-1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template Name *
            </label>
            <input
              type="text"
              name="template_name"
              value={templateFormData.template_name}
              onChange={handleTemplateInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Social Media Policy"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template Type
            </label>
            <input
              type="text"
              name="template_type"
              value={templateFormData.template_type}
              onChange={handleTemplateInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., ISMS, ISO27001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Version
            </label>
            <input
              type="text"
              name="version"
              value={templateFormData.version}
              onChange={handleTemplateInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., v1.0"
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={templateFormData.active}
              onChange={(checked) =>
                setTemplateFormData((prev) => ({ ...prev, active: checked }))
              }
            />
            <label className="text-sm font-medium text-gray-700">
              Active Status
            </label>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PolicyLibraryTemplates;

