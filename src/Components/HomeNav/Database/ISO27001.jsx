import React, { useState, useEffect, useRef, useContext, useCallback } from "react";
import { message, Popconfirm, Spin, Table, Button, Input, Select, Modal, Form, Space, Tooltip } from "antd";
import { Search, Plus, Upload, X, Edit, Trash2, Eye, FileText } from "lucide-react";
import { apiRequest } from "../../../utils/api";
import { LoadingOutlined } from '@ant-design/icons';
import { AuthContext } from "../../../AuthContext";

const { Option } = Select;
const { TextArea } = Input;

const ISO27001 = () => {
  const { user } = useContext(AuthContext);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [controls, setControls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRegId, setSelectedRegId] = useState("");
  const [selectedParentId, setSelectedParentId] = useState("");
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
  const [form] = Form.useForm();

  const regIdOptions = [
    "REG00001",
  ];

  const parentIdOptions = [
    { id: "PCT00001", name: "Organizational controls" },
    { id: "PCT00002", name: "People controls" },
    { id: "PCT00003", name: "Physical controls" },
    { id: "PCT00004", name: "Technological controls" },
  ];

  useEffect(() => {
    if (user?.role === "Admin") {
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

      params.append("page_size", pagination.pageSize === "all" ? "all" : pagination.pageSize);
      if (pagination.pageSize !== "all") {
        params.append("page", pagination.current);
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
        total: totalCount,
      }));
    } catch (error) {
      console.error("Error fetching controls:", error);
      message.error("Failed to fetch controls");
      setControls([]);
      setPagination((prev) => ({
        ...prev,
        total: 0,
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
    pagination.current,
  ]);

  const handleTableChange = (paginationConfig, filters, sorter) => {
    setPagination((prev) => ({
      ...prev,
      current: paginationConfig.current,
      pageSize: paginationConfig.pageSize,
    }));
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPagination(p => ({ ...p, current: 1 }));
  };

  const handleParentIdChange = (value) => {
    setSelectedParentId(value || "");
    setPagination(p => ({ ...p, current: 1 }));
  };

  const handleClearFilters = () => {
    setSelectedRegId("");
    setSelectedParentId("");
    setSearchQuery("");
    setPagination(p => ({ ...p, current: 1 }));
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
    form.resetFields();
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
    form.setFieldsValue({
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
    form.resetFields();
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

  const handleSubmit = async (values) => {
    try {
      if (modalType === "add") {
        const response = await apiRequest(
          "POST",
          "/api/policylens/iso27001/create/",
          values,
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
          values,
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

  const columns = [
    {
      title: 'Reg ID',
      dataIndex: 'reg_id',
      key: 'reg_id',
      width: 100,
    },
    {
      title: 'Parent Control ID',
      dataIndex: 'parent_ctrl_id',
      key: 'parent_ctrl_id',
      width: 200,
    },
    {
      title: 'Parent Control Name',
      dataIndex: 'parent_ctrl_name',
      key: 'parent_ctrl_name',
      width: 240,
    },
    {
      title: 'Parent Control Description',
      dataIndex: 'parent_ctrl_description',
      key: 'parent_ctrl_description',
      width: 360,
      render: (text) => (
        <div className="whitespace-pre-wrap">{text}</div>
      ),
    },
    {
      title: 'Control ID',
      dataIndex: 'ctrl_id',
      key: 'ctrl_id',
      width: 120,
    },
    {
      title: 'Control Number',
      dataIndex: 'ctrl_number',
      key: 'ctrl_number',
      width: 200,
    },
    {
      title: 'Control Name',
      dataIndex: 'ctrl_name',
      key: 'ctrl_name',
      width: 200,
    },
    {
      title: 'Control Definition',
      dataIndex: 'ctrl_definition',
      key: 'ctrl_definition',
      width: 600,
      render: (text, record) => {
        const isExpanded = expandedCells[`${record.ctrl_id}-ctrl_definition`];
        return (
          <div
            className="cursor-pointer whitespace-pre-wrap"
            onClick={() => toggleCellExpansion(record.ctrl_id, 'ctrl_definition')}
          >
            <div className={`${isExpanded ? '' : 'line-clamp-3'}`}>
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
      title: 'Control Guidance',
      dataIndex: 'ctrl_guidance_text',
      key: 'ctrl_guidance_text',
      width: 600,
      render: (text, record) => {
        const isExpanded = expandedCells[`${record.ctrl_id}-ctrl_guidance_text`];
        return (
          <div
            className="cursor-pointer whitespace-pre-wrap"
            onClick={() => toggleCellExpansion(record.ctrl_id, 'ctrl_guidance_text')}
          >
            <div className={`${isExpanded ? '' : 'line-clamp-3'}`}>
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
          <Tooltip title="View Key Point Details">
            <Button
              type="text"
              icon={<Eye size={16} />}
              onClick={(e) => {
                e.stopPropagation();
                setKeyPointsModal({
                  isOpen: true,
                  control: record,
                });
              }}
              className="text-slate-400 hover:text-blue-600"
            />
          </Tooltip>
          {isAdmin && (
            <>
              <Tooltip title="Edit Control">
                <Button
                  type="text"
                  icon={<Edit size={18} />}
                  onClick={() => openEditModal(record)}
                  className="text-blue-600 hover:text-blue-800"
                />
              </Tooltip>
              <Popconfirm
                title="Delete this control?"
                description="This action cannot be undone."
                onConfirm={() => handleDelete(record.ctrl_id)}
                okText="Yes"
                cancelText="No"
                okButtonProps={{ danger: true }}
              >
                <Tooltip title="Delete Control">
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
              placeholder="Search controls..."
              value={searchQuery}
              onChange={handleSearchChange}
              prefix={<Search size={20} />}
              allowClear
            />
          </div>

          <Select
            value={selectedParentId || undefined}
            placeholder="All Parent Controls"
            onChange={handleParentIdChange}
            style={{ width: 250 }}
            allowClear
          >
            {parentIdOptions.map((option) => (
              <Option key={option.id} value={option.id}>
                {option.name}
              </Option>
            ))}
          </Select>

          {(selectedRegId || selectedParentId || searchQuery) && (
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
                Add Control
              </Button>
            </Space>
          )}
        </div>
      </div>

      <div className="flex-1 mx-3 mb-3">
        <Table
          columns={columns}
          dataSource={controls}
          rowKey="ctrl_id"
          loading={isLoading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1800 }}
          size="middle"
          sticky={true}
        />
      </div>

      {/* Add/Edit Modal */}
      <Modal
        title={modalType === "add" ? "Add New Control" : "Edit Control"}
        open={showModal && modalType !== "excel"}
        onCancel={closeModal}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={controlForm}
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
              name="parent_ctrl_id"
              label="Parent Control ID"
              rules={[{ required: true, message: 'Please input parent control ID!' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="parent_ctrl_name"
              label="Parent Control Name"
              rules={[{ required: true, message: 'Please input parent control name!' }]}
              className="col-span-2"
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="parent_ctrl_description"
              label="Parent Control Description"
              rules={[{ required: true, message: 'Please input parent control description!' }]}
              className="col-span-2"
            >
              <TextArea rows={2} />
            </Form.Item>
            <Form.Item
              name="ctrl_id"
              label="Control ID"
              rules={[{ required: true, message: 'Please input control ID!' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="ctrl_number"
              label="Control Number"
              rules={[{ required: true, message: 'Please input control number!' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="ctrl_name"
              label="Control Name"
              rules={[{ required: true, message: 'Please input control name!' }]}
              className="col-span-2"
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="ctrl_definition"
              label="Control Definition"
              rules={[{ required: true, message: 'Please input control definition!' }]}
              className="col-span-2"
            >
              <TextArea rows={3} />
            </Form.Item>
            <Form.Item
              name="ctrl_guidance_text"
              label="Control Guidance Text"
              rules={[{ required: true, message: 'Please input control guidance text!' }]}
              className="col-span-2"
            >
              <TextArea rows={3} />
            </Form.Item>
            <Form.Item
              name="key_point_id"
              label="Key Point ID"
              rules={[{ required: true, message: 'Please input key point ID!' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="key_point"
              label="Key Point"
              rules={[{ required: true, message: 'Please input key point!' }]}
            >
              <Input />
            </Form.Item>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button onClick={closeModal}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              {modalType === "add" ? "Add Control" : "Save Changes"}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Excel Upload Modal */}
      <Modal
        title="Upload ISO 27001 Controls Excel File"
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
                    Row {error.row}: {Object.entries(error.errors).map(([field, msg]) => `${field}: ${msg}`).join(", ")}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Modal>

      {/* Key Points Modal */}
      {keyPointsModal.isOpen && keyPointsModal.control && (
        <Modal
          title={
            <div className="flex items-center">
              <FileText size={20} className="mr-2" />
              Key Points for Control {keyPointsModal.control.ctrl_id}
            </div>
          }
          open={keyPointsModal.isOpen}
          onCancel={() => setKeyPointsModal({ isOpen: false, control: null })}
          footer={[
            <Button
              key="close"
              type="primary"
              onClick={() => setKeyPointsModal({ isOpen: false, control: null })}
            >
              Close
            </Button>
          ]}
          width={800}
        >
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h4 className="text-sm uppercase text-gray-700 font-semibold mb-3 border-b border-indigo-200 pb-1">
              Key Point Information
            </h4>
            <Table
              dataSource={keyPointsModal.control.key_point_ids?.map((id, idx) => ({
                key: id || idx,
                id: id || 'N/A',
                point: keyPointsModal.control.key_points?.[idx] || 'N/A'
              })) || []}
              columns={[
                {
                  title: 'Key Point ID',
                  dataIndex: 'id',
                  key: 'id',
                },
                {
                  title: 'Key Point',
                  dataIndex: 'point',
                  key: 'point',
                }
              ]}
              pagination={false}
              size="small"
              locale={{
                emptyText: 'No key points available.'
              }}
            />
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ISO27001;