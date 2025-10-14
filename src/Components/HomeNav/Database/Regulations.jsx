import React, { useState, useEffect, useRef, useContext, useCallback } from "react";
import { message, Popconfirm, Spin, Table, Button, Input, Select, Modal, Form, Space, Tooltip } from "antd";
import { Search, Plus, Upload, X, Edit, Trash2, ExternalLink } from "lucide-react";
import { apiRequest } from "../../../utils/api";
import { AuthContext } from "../../../AuthContext";
import { useNavigate } from "react-router-dom";
import { LoadingOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

const Regulations = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [regulations, setRegulations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRegName, setSelectedRegName] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
    pageSizeOptions: ['10', '25', '50'],
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
  const [form] = Form.useForm();

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
        params.append("page", pagination.current);
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
        total: totalCount,
      }));
    } catch (error) {
      console.error("Error fetching regulations:", error);
      message.error("Failed to fetch regulations");
      setRegulations([]);
      setPagination((prev) => ({
        ...prev,
        total: 0,
      }));
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedRegName, pagination.pageSize, pagination.current]);

  useEffect(() => {
    fetchRegulations();
  }, [fetchRegulations]);

  const handleTableChange = (paginationConfig, filters, sorter) => {
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

  const handleFilterChange = useCallback((filterType, value) => {
    if (filterType === "reg_name") setSelectedRegName(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setSelectedRegName("");
    setSearchQuery("");
    setPagination((prev) => ({ ...prev, current: 1 }));
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
    form.resetFields();
  }, [form]);

  const openEditModal = useCallback((regulation) => {
    setModalType("edit");
    setActiveRegulation(regulation);
    setRegulationForm({
      reg_id: regulation.reg_id,
      reg_name: regulation.reg_name,
      reg_description: regulation.reg_description,
      redirect_to: regulation.redirect_to || "",
    });
    form.setFieldsValue({
      reg_id: regulation.reg_id,
      reg_name: regulation.reg_name,
      reg_description: regulation.reg_description,
      redirect_to: regulation.redirect_to || "",
    });
    setShowModal(true);
  }, [form]);

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
    form.resetFields();
  }, [form]);

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
  }, [selectedFile, fetchRegulations, closeModal]);

  const handleSubmit = useCallback(async (values) => {
    try {
      if (modalType === "add") {
        const response = await apiRequest(
          "POST",
          "/api/policylens/regulations/create/",
          values,
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
          values,
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
  }, [modalType, activeRegulation, fetchRegulations, closeModal]);

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

  const columns = [
    {
      title: 'Regulation ID',
      dataIndex: 'reg_id',
      key: 'reg_id',
      sorter: true,
      width: 150,
    },
    {
      title: 'Name',
      dataIndex: 'reg_name',
      key: 'reg_name',
      sorter: true,
      width: 200,
    },
    {
      title: 'Description',
      dataIndex: 'reg_description',
      key: 'reg_description',
      width: 400,
      render: (text, record) => {
        const isExpanded = expandedCells[`${record.id}-reg_description`];
        return (
          <div
            className="cursor-pointer"
            onClick={() => toggleCellExpansion(record.id, 'reg_description')}
          >
            <div className={`whitespace-pre-wrap ${isExpanded ? '' : 'line-clamp-3'}`}>
              {text}
            </div>
            <span className="text-blue-600 hover:text-blue-800">
              {isExpanded ? 'Show Less' : 'Show More'}
            </span>
          </div>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      align: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title={record.redirect_to ? "Go to regulation" : "No redirect link available"}>
            <Button
              type="text"
              icon={<ExternalLink size={18} />}
              onClick={() => handleRedirect(record.redirect_to)}
              disabled={!record.redirect_to}
              className={`text-blue-600 hover:text-blue-800 ${!record.redirect_to ? "opacity-50" : ""}`}
            />
          </Tooltip>
          {isAdmin && (
            <>
              <Tooltip title="Edit Regulation">
                <Button
                  type="text"
                  icon={<Edit size={18} />}
                  onClick={() => openEditModal(record)}
                  className="text-blue-600 hover:text-blue-800"
                />
              </Tooltip>
              <Popconfirm
                title="Delete this regulation?"
                description="This action cannot be undone."
                onConfirm={() => handleDelete(record.id)}
                okText="Yes"
                cancelText="No"
                okButtonProps={{ danger: true }}
              >
                <Tooltip title="Delete Regulation">
                  <Button
                    type="text"
                    icon={<Trash2 size={18} />}
                    className="text-red-600 hover:text-red-800"
                  />
                </Tooltip>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white p-6 shadow-sm flex-none">
        <div className="flex items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search regulations..."
              value={searchQuery}
              onChange={handleSearchChange}
              prefix={<Search size={20} />}
              allowClear
            />
          </div>
          <Select
            value={selectedRegName || undefined}
            placeholder="All Regulation Names"
            onChange={(value) => handleFilterChange("reg_name", value || "")}
            style={{ width: 200 }}
            allowClear
          >
            {[...new Set(regulations.map((r) => r.reg_name))].sort().map((name) => (
              <Option key={name} value={name}>
                {name}
              </Option>
            ))}
          </Select>
          {(selectedRegName || searchQuery) && (
            <Button
              type="link"
              onClick={handleClearFilters}
            >
              Clear Filters
            </Button>
          )}
          {isAdmin && (
            <Space>
              <Button
                type="primary"
                icon={<Upload size={18} />}
                onClick={() => {
                  setModalType("excel");
                  setShowModal(true);
                }}
                style={{ backgroundColor: '#059669' }}
              >
                Upload Excel
              </Button>
              <Button
                type="primary"
                icon={<Plus size={18} />}
                onClick={openAddModal}
              >
                Add Regulation
              </Button>
            </Space>
          )}
        </div>
      </div>
      
      <div className="flex-1 mx-3 mb-3">
        <Table
          columns={columns}
          dataSource={regulations}
          rowKey="id"
          loading={isLoading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 800 }}
          size="middle"
        />
      </div>

      {/* Add/Edit Modal */}
      <Modal
        title={modalType === "add" ? "Add New Regulation" : "Edit Regulation"}
        open={showModal && modalType !== "excel"}
        onCancel={closeModal}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={regulationForm}
        >
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="reg_id"
              label="Regulation ID"
              rules={[{ required: true, message: 'Please input regulation ID!' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="reg_name"
              label="Name"
              rules={[{ required: true, message: 'Please input regulation name!' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="reg_description"
              label="Description"
              rules={[{ required: true, message: 'Please input regulation description!' }]}
              className="col-span-2"
            >
              <TextArea rows={4} />
            </Form.Item>
            <Form.Item
              name="redirect_to"
              label="Redirect Link (Optional)"
              className="col-span-2"
            >
              <Input.Group compact>
                <Input
                  style={{ width: 'calc(100% - 40px)' }}
                  placeholder="Enter URL or path to redirect"
                />
                <Button
                  type="primary"
                  icon={<ExternalLink size={18} />}
                  onClick={() => form.getFieldValue('redirect_to') && handleRedirect(form.getFieldValue('redirect_to'))}
                  disabled={!form.getFieldValue('redirect_to')}
                  style={{ width: 40 }}
                />
              </Input.Group>
              <div className="text-sm text-gray-500 mt-1">
                Leave empty if no redirection is needed. Use the test button to verify the link.
              </div>
            </Form.Item>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button onClick={closeModal}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              {modalType === "add" ? "Add Regulation" : "Save Changes"}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Excel Upload Modal */}
      <Modal
        title="Upload Regulations Excel File"
        open={showModal && modalType === "excel"}
        onCancel={closeModal}
        footer={[
          <Button key="cancel" onClick={closeModal}>
            Cancel
          </Button>,
          <Button
            key="upload"
            type="primary"
            loading={isUploading}
            disabled={!selectedFile}
            onClick={handleFileUpload}
          >
            Upload File
          </Button>
        ]}
        width={600}
      >
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
      </Modal>
    </div>
  );
};

export default Regulations;