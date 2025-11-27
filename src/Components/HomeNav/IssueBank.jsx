import { useState, useContext, useEffect, useRef } from "react";
import {
  Filter,
  X,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  UploadCloud,
  Download,
  Search,
} from "lucide-react";
import { AuthContext } from "../../AuthContext";
import { apiRequest } from "../../utils/api";
import {
  message,
  Button,
  Input,
  Space,
  Result,
  Table,
  Tag,
  Dropdown,
  Menu,
} from "antd";
import { MoreOutlined } from "@ant-design/icons";
import { useLocation } from "react-router-dom";

const IssueBank = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  // Issue list state
  const [issues, setIssues] = useState([]);
  const [isIssuesLoading, setIsIssuesLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: "",
  });
  const [pendingFilters, setPendingFilters] = useState({
    category: "",
  });

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [activeIssue, setActiveIssue] = useState(null);

  // Form state
  const [newIssue, setNewIssue] = useState({
    category: "internal",
    text: "",
    description: "",
    impact: "medium",
    mitigation: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // File upload state
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  // Delete confirmation state
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [issueToDelete, setIssueToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Category choices
  const categoryChoices = ["internal", "external", "risk", "opportunity"];

  // Category labels
  const getCategoryLabel = (category) => {
    const labels = {
      internal: "Internal Issues",
      external: "External Issues",
      risk: "Risks and Threats",
      opportunity: "Opportunities",
    };
    return labels[category] || category;
  };

  // Impact choices
  const impactChoices = ["low", "medium", "high"];

  // Fetch issues
  const handleGetIssues = async () => {
    setIsIssuesLoading(true);
    let endpoint = `/api/policylens/issues/?`;
    const params = new URLSearchParams();

    if (searchQuery) params.append("search", searchQuery);
    if (filters.category) params.append("category", filters.category);

    endpoint += params.toString();

    try {
      const response = await apiRequest("GET", endpoint, null, true);
      if (response.status === 200) {
        setIssues(response.data.issues || response.data);
        setUnauthorized(false);
      } else {
        throw new Error(`Failed with status: ${response.status}`);
      }
    } catch (error) {
      if (error.status === 403) {
        setUnauthorized(true);
      } else {
        console.error("Failed to fetch issues:", error);
        message.error("Failed to fetch issues.");
        setIssues([]);
      }
    } finally {
      setIsIssuesLoading(false);
    }
  };

  // Toggle filter dropdown
  const toggleFilterDropdown = () => {
    setPendingFilters(filters);
    setFilterDropdownOpen(!filterDropdownOpen);
  };

  // Update pendingFilters
  const handlePendingFilterChange = (value) => {
    setPendingFilters({
      category: value === pendingFilters.category ? "" : value,
    });
  };

  // Apply filters
  const applyFilters = () => {
    setFilters(pendingFilters);
    setFilterDropdownOpen(false);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({ category: "" });
    setPendingFilters({ category: "" });
    setSearchQuery("");
  };

  // Handle input changes
  const handleIssueInputChange = (e) => {
    const { name, value } = e.target;
    setNewIssue((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Reset issue form
  const resetIssueForm = () => {
    setNewIssue({
      category: "internal",
      text: "",
      description: "",
      impact: "medium",
      mitigation: "",
    });
    setActiveIssue(null);
  };

  // Open modal functions
  const openAddModal = () => {
    resetIssueForm();
    setModalType("add");
    setShowModal(true);
  };

  const openEditModal = (issue) => {
    setActiveIssue(issue);
    setNewIssue({
      category: issue.category,
      text: issue.text,
      description: issue.description,
      impact: issue.impact,
      mitigation: issue.mitigation || "",
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
    resetIssueForm();
    setSelectedFile(null);
  };

  // Submit issue form
  const handleSubmitIssue = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let response;

      if (modalType === "edit" && activeIssue) {
        response = await apiRequest(
          "PATCH",
          `/api/policylens/issues/${activeIssue.id}/`,
          newIssue,
          true
        );
      } else {
        response = await apiRequest(
          "POST",
          `/api/policylens/issues/create/`,
          newIssue,
          true
        );
      }

      if (response.status === 200 || response.status === 201) {
        message.success(
          modalType === "edit"
            ? "Issue updated successfully"
            : "Issue created successfully"
        );

        if (modalType === "edit") {
          setIssues((prev) =>
            prev.map((i) => (i.id === activeIssue.id ? response.data : i))
          );
        } else {
          setIssues((prev) => [...prev, response.data]);
        }

        closeModal();
      } else {
        throw new Error(`Failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error submitting issue:", error);
      message.error(
        `Failed to ${modalType === "edit" ? "update" : "create"} issue: ${
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

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await apiRequest(
        "POST",
        "/api/policylens/issues/upload/",
        formData,
        true
      );

      if (
        response.status === 200 ||
        response.status === 201 ||
        response.status === 207
      ) {
        message.success(
          `Successfully created ${
            response.data.issues_created || response.data.count
          } issues`
        );

        if (response.data.issues && response.data.issues.length > 0) {
          setIssues((prev) => [...prev, ...response.data.issues]);
        }

        if (response.data.errors && response.data.errors.length > 0) {
          message.warning(
            `${response.data.errors.length} errors occurred during upload`
          );
          setPartialErrorsWhileUploading(response.data.errors);
          setPartialErrors(true);
        }

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

  // Delete issue
  const confirmDeleteIssue = (issue) => {
    setIssueToDelete(issue);
    setShowDeleteConfirmation(true);
  };

  const cancelDeleteIssue = () => {
    setShowDeleteConfirmation(false);
    setIssueToDelete(null);
  };

  const handleDeleteIssue = async () => {
    if (!issueToDelete) return;

    setIsDeleting(true);

    try {
      const response = await apiRequest(
        "DELETE",
        `/api/policylens/issues/${issueToDelete.id}/delete/`,
        null,
        true
      );

      if (response.status === 204 || response.status === 200) {
        message.success("Issue deleted successfully");
        setIssues((prev) => prev.filter((i) => i.id !== issueToDelete.id));
        setShowDeleteConfirmation(false);
        setIssueToDelete(null);
      } else {
        throw new Error(`Failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error deleting issue:", error);
      message.error(
        `Failed to delete issue: ${error.message || "Unknown error"}`
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Effect to refetch issues
  useEffect(() => {
    handleGetIssues();
  }, [searchQuery, filters, user, location.pathname]);

  // If unauthorized, show 403 page
  if (unauthorized) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-slate-50">
        <Result
          status="403"
          title="403"
          subTitle="Sorry, you are not authorized to access this page."
          extra={
            <Button type="primary" href="/home/dashboard">
              Back to Dashboard
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-1 overflow-hidden shadow-xl rounded-lg h-screen">
      <div className="flex flex-col w-full bg-white transition-width duration-300 ease-in-out">
        {/* Top Bar */}
        <div className="flex flex-col border-b border-slate-200 bg-white sticky top-0 z-10">
          <div className="flex items-center p-4">
            <h2 className="text-lg font-semibold text-slate-700">Issue Bank</h2>

            <Space className="ml-auto" size="middle">
              <Input
                placeholder="Search issues..."
                prefix={<Search size={16} className="text-slate-400" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: 250 }}
                allowClear
              />

              {/* Filter Button */}
              <div className="relative">
                <Button
                  onClick={toggleFilterDropdown}
                  icon={<Filter size={16} />}
                >
                  <span>Filter</span>
                  {filters.category && (
                    <span className="ml-2 bg-indigo-100 text-indigo-600 text-xs font-medium px-2 py-0.5 rounded-full">
                      1 Active
                    </span>
                  )}
                </Button>

                {filterDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-lg shadow-xl z-20 max-h-[calc(100vh-120px)] flex flex-col">
                    <div className="p-3 border-b border-slate-200 bg-slate-50 font-medium text-slate-700 flex justify-between items-center sticky top-0 z-10">
                      <span>Filter Options</span>
                    </div>

                    <div className="overflow-y-auto">
                      <div className="p-3 border-b border-slate-200">
                        <h4 className="text-sm font-medium text-slate-700 mb-2 flex justify-between">
                          <span>Category</span>
                          {pendingFilters.category && (
                            <button
                              onClick={() => handlePendingFilterChange("")}
                              className="text-xs text-slate-500 hover:text-slate-700"
                            >
                              Clear
                            </button>
                          )}
                        </h4>
                        <div className="space-y-1">
                          {categoryChoices.map((category) => (
                            <button
                              key={category}
                              onClick={() =>
                                handlePendingFilterChange(category)
                              }
                              className={`w-full text-left px-2 py-1.5 rounded text-sm ${
                                pendingFilters.category === category
                                  ? "bg-indigo-50 text-indigo-700 font-medium"
                                  : "text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              {getCategoryLabel(category)}
                            </button>
                          ))}
                        </div>
                      </div>

                      {filters.category && (
                        <div className="px-3 py-2 bg-slate-50 border-b border-slate-200">
                          <h4 className="text-xs font-medium text-slate-600 mb-1">
                            Active Filters:
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            <span className="inline-flex items-center px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs">
                              Category: {getCategoryLabel(filters.category)}
                              <button
                                onClick={() => {
                                  setFilters({ category: "" });
                                  setPendingFilters({ category: "" });
                                }}
                                className="ml-1 hover:text-indigo-900"
                              >
                                <X size={12} />
                              </button>
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex p-3 border-t border-slate-200 bg-slate-50 gap-2 sticky bottom-0 z-10">
                      <button
                        onClick={clearFilters}
                        className="flex-1 py-2 text-center bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                      >
                        Clear All
                      </button>
                      <button
                        onClick={applyFilters}
                        className="flex-1 py-2 text-center bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <Button
                onClick={openUploadModal}
                icon={<UploadCloud size={16} />}
              >
                Upload Excel
              </Button>

              <Button
                type="primary"
                onClick={openAddModal}
                icon={<Plus size={16} />}
              >
                Add Issue
              </Button>
            </Space>
          </div>
        </div>

        {/* Issues Table */}
        <div className="flex-1 overflow-auto p-4">
          <Table
            dataSource={issues}
            loading={isIssuesLoading}
            rowKey="id"
            pagination={{
              pageSize: 50,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} items`,
            }}
            scroll={{ x: 1200 }}
            columns={[
              {
                title: "Category",
                dataIndex: "category",
                key: "category",
                width: 180,
                filters: categoryChoices.map((c) => ({
                  text: getCategoryLabel(c),
                  value: c,
                })),
                onFilter: (value, record) => record.category === value,
                render: (category) => (
                  <Tag
                    color={
                      category === "internal"
                        ? "blue"
                        : category === "external"
                        ? "green"
                        : category === "risk"
                        ? "red"
                        : "purple"
                    }
                  >
                    {getCategoryLabel(category)}
                  </Tag>
                ),
              },
              {
                title: "Issue",
                dataIndex: "text",
                key: "text",
                ellipsis: true,
                render: (text) => (
                  <span className="font-semibold text-slate-700">{text}</span>
                ),
              },
              {
                title: "Description",
                dataIndex: "description",
                key: "description",
                ellipsis: true,
                render: (text) => (
                  <span className="text-slate-600">{text}</span>
                ),
              },
              {
                title: "Impact",
                dataIndex: "impact",
                key: "impact",
                width: 100,
                align: "center",
                filters: impactChoices.map((i) => ({
                  text: i.toUpperCase(),
                  value: i,
                })),
                onFilter: (value, record) => record.impact === value,
                render: (impact) => (
                  <Tag
                    color={
                      impact === "high"
                        ? "red"
                        : impact === "medium"
                        ? "orange"
                        : "green"
                    }
                  >
                    {impact?.toUpperCase()}
                  </Tag>
                ),
              },
              {
                title: "Mitigation",
                dataIndex: "mitigation",
                key: "mitigation",
                ellipsis: true,
                render: (text) => text || "-",
              },
              {
                title: "Actions",
                key: "actions",
                width: 100,
                align: "center",
                render: (_, record) => (
                  <Dropdown
                    overlay={
                      <Menu>
                        <Menu.Item
                          key="edit"
                          icon={<Edit size={14} />}
                          onClick={() => openEditModal(record)}
                        >
                          Edit
                        </Menu.Item>
                        <Menu.Item
                          key="delete"
                          icon={<Trash2 size={14} />}
                          danger
                          onClick={() => confirmDeleteIssue(record)}
                        >
                          Delete
                        </Menu.Item>
                      </Menu>
                    }
                    trigger={["click"]}
                  >
                    <Button type="text" icon={<MoreOutlined />} />
                  </Dropdown>
                ),
              },
            ]}
          />
        </div>
      </div>

      {/* Add/Edit Issue Modal */}
      {showModal && (modalType === "add" || modalType === "edit") && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-t-lg">
              <h3 className="text-lg font-medium">
                {modalType === "edit" ? "Edit Issue" : "Add New Issue"}
              </h3>
              <button
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                onClick={closeModal}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitIssue} className="p-6">
              <div className="space-y-4">
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={newIssue.category}
                    onChange={handleIssueInputChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all"
                    required
                  >
                    {categoryChoices.map((category) => (
                      <option key={category} value={category}>
                        {getCategoryLabel(category)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Text */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Issue *
                  </label>
                  <input
                    type="text"
                    name="text"
                    value={newIssue.text}
                    onChange={handleIssueInputChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all"
                    placeholder="Enter the issue"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={newIssue.description}
                    onChange={handleIssueInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all"
                    placeholder="Enter the description..."
                    required
                  ></textarea>
                </div>

                {/* Impact */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Impact *
                  </label>
                  <select
                    name="impact"
                    value={newIssue.impact}
                    onChange={handleIssueInputChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all"
                    required
                  >
                    {impactChoices.map((impact) => (
                      <option
                        key={impact}
                        value={impact}
                        className="capitalize"
                      >
                        {impact.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Mitigation */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Mitigation (Optional)
                  </label>
                  <textarea
                    name="mitigation"
                    value={newIssue.mitigation}
                    onChange={handleIssueInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all"
                    placeholder="Enter mitigation strategy..."
                  ></textarea>
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
                  {modalType === "edit" ? "Update Issue" : "Add Issue"}
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
              <h3 className="text-lg font-medium">Upload Issues from Excel</h3>
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
                  Upload an Excel file with issues to add to the bank. The file
                  should follow the required format.
                </p>

                <a
                  href="/IssuesBankTemplate.xlsx"
                  className="flex items-center text-indigo-600 hover:text-indigo-800 mb-6"
                  download
                >
                  <Download size={16} className="mr-2" />
                  Download Template
                </a>

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
      {showDeleteConfirmation && issueToDelete && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 mx-4">
            <div className="flex items-center text-red-600 mb-4">
              <AlertCircle size={24} className="mr-3" />
              <h3 className="text-lg font-medium">Delete Issue</h3>
            </div>
            <p className="text-slate-600 mb-2">
              Are you sure you want to delete this issue?
            </p>
            <p className="text-sm text-slate-500 mb-5">
              Issue: <span className="font-medium">{issueToDelete.text}</span>
              <br />
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                onClick={cancelDeleteIssue}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center disabled:opacity-70"
                onClick={handleDeleteIssue}
                disabled={isDeleting}
              >
                {isDeleting && (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                )}
                {isDeleting ? "Deleting..." : "Delete Issue"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Partial Errors Modal */}
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
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssueBank;
