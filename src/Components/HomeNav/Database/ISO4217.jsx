import React, { useState, useEffect, useRef, useContext, useCallback } from "react";
import { message, Popconfirm, Spin, Table, Button, Input, Select, Modal, Form, Space, Tooltip } from "antd";
import { Search, Plus, Upload, X, Edit, Trash2 } from "lucide-react";
import { apiRequest } from "../../../utils/api";
import { AuthContext } from "../../../AuthContext";
import { LoadingOutlined } from '@ant-design/icons';

const { Option } = Select;

const ISO4217 = () => {
  const { user } = useContext(AuthContext);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currencies, setCurrencies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAlphabeticCode, setSelectedAlphabeticCode] = useState("");
  const [selectedNumericCode, setSelectedNumericCode] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    pageSizeOptions: ['10', '25', '50'],
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [partialErrors, setPartialErrors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [activeCurrency, setActiveCurrency] = useState(null);
  const [currencyForm, setCurrencyForm] = useState({
    entity: "",
    currency: "",
    alphabetic_code: "",
    numeric_code: "",
    minor_unit: "",
  });
  const [form] = Form.useForm();

  useEffect(() => {
    if (user?.role === "Admin") {
      setIsAdmin(true);
    }
  }, [user]);

  const fetchCurrencies = useCallback(async () => {
    try {
      setIsLoading(true);
      let url = "/api/policylens/iso4217/";
      const params = new URLSearchParams();
      if (searchQuery) {
        params.append("search", searchQuery);
      }
      if (selectedAlphabeticCode) {
        params.append("alphabetic_code", selectedAlphabeticCode);
      }
      if (selectedNumericCode) {
        params.append("numeric_code", selectedNumericCode);
      }
      params.append("page", pagination.current);
      params.append("page_size", pagination.pageSize);
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await apiRequest("GET", url, null, true);

      let results = [];
      let totalCount = 0;

      if (Array.isArray(response.data)) {
        results = response.data;
        totalCount = results.length;
      } else if (response.data?.results) {
        results = response.data.results;
        totalCount = response.data.count || results.length;
      } else if (Array.isArray(response.data?.data)) {
        results = response.data.data;
        totalCount = results.length;
      } else {
        console.warn("Unexpected response structure:", response.data);
        message.warning("Unexpected response format from server");
      }

      setCurrencies(results);
      setPagination((prev) => ({
        ...prev,
        total: totalCount,
      }));
    } catch (error) {
      console.error("Error fetching currencies:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url,
      });
      const errorMessage = error.response?.data?.error || error.message || "Failed to fetch currencies";
      message.error(`Failed to fetch currencies: ${errorMessage}`);
      setCurrencies([]);
      setPagination((prev) => ({
        ...prev,
        total: 0,
      }));
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedAlphabeticCode, selectedNumericCode, pagination.current, pagination.pageSize]);

  useEffect(() => {
    fetchCurrencies();
  }, [fetchCurrencies]);

  const handleTableChange = (paginationConfig) => {
    setPagination(prev => ({
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
    if (filterType === "alphabetic_code") setSelectedAlphabeticCode(value);
    if (filterType === "numeric_code") setSelectedNumericCode(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setSelectedAlphabeticCode("");
    setSelectedNumericCode("");
    setSearchQuery("");
    setPagination((prev) => ({ ...prev, current: 1 }));
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setCurrencyForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const openAddModal = useCallback(() => {
    setModalType("add");
    setShowModal(true);
    setCurrencyForm({
      entity: "",
      currency: "",
      alphabetic_code: "",
      numeric_code: "",
      minor_unit: "",
    });
    form.resetFields();
  }, []);

  const openEditModal = useCallback((currency) => {
    setModalType("edit");
    setActiveCurrency(currency);
    setCurrencyForm({
      entity: currency.entity,
      currency: currency.currency,
      alphabetic_code: currency.alphabetic_code,
      numeric_code: currency.numeric_code,
      minor_unit: currency.minor_unit,
    });
    form.setFieldsValue({
      entity: currency.entity,
      currency: currency.currency,
      alphabetic_code: currency.alphabetic_code,
      numeric_code: currency.numeric_code,
      minor_unit: currency.minor_unit,
    });
    setShowModal(true);
  }, [form]);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setModalType("");
    setActiveCurrency(null);
    setCurrencyForm({
      entity: "",
      currency: "",
      alphabetic_code: "",
      numeric_code: "",
      minor_unit: "",
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

  const handleSubmit = useCallback(async (values) => {
    try {
      let response;
      if (modalType === "edit" && activeCurrency) {
        response = await apiRequest(
          "PUT",
          `/api/policylens/iso4217/${activeCurrency.id}/update/`,
          values,
          true
        );
      } else {
        response = await apiRequest(
          "POST",
          `/api/policylens/iso4217/create/`,
          values,
          true
        );
      }

      if (response.status === 200 || response.status === 201) {
        message.success(
          `Currency ${modalType === "edit" ? "updated" : "created"} successfully`
        );
        fetchCurrencies();
        closeModal();
      }
    } catch (error) {
      console.error("Error submitting currency:", error);
      const errorMessage = error.response?.data?.error || "Failed to save currency";
      message.error(`Failed to ${modalType} currency: ${errorMessage}`);
    }
  }, [modalType, activeCurrency, fetchCurrencies, closeModal]);

  const handleFileUpload = useCallback(async () => {
    if (!selectedFile) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await apiRequest(
        "POST",
        "/api/policylens/iso4217/upload/",
        formData,
        true,
        true
      );

      if (response.status === 201 || response.status === 207) {
        message.success(
          `Successfully created ${response.data.currencies_created || 0} currencies`
        );
        if (response.data.errors?.length > 0) {
          setPartialErrors(response.data.errors);
        }
        fetchCurrencies();
        closeModal();
        setSelectedFile(null);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      const errorMessage = error.response?.data?.error || "Failed to upload file";
      message.error(errorMessage);
      if (error.response?.data?.errors) {
        setPartialErrors(error.response.data.errors);
      }
    } finally {
      setIsUploading(false);
    }
  }, [selectedFile, fetchCurrencies, closeModal]);

  const handleDelete = useCallback(async (id) => {
    try {
      const response = await apiRequest(
        "DELETE",
        `/api/policylens/iso4217/${id}/delete/`,
        null,
        true
      );
      if (response.status === 204) {
        message.success("Currency deleted successfully");
        fetchCurrencies();
      }
    } catch (error) {
      console.error("Error deleting currency:", error);
      const errorMessage = error.response?.data?.error || "Failed to delete currency";
      message.error(errorMessage);
    }
  }, [fetchCurrencies]);

  const columns = [
    { title: 'Entity', dataIndex: 'entity', key: 'entity' },
    { title: 'Currency', dataIndex: 'currency', key: 'currency' },
    { title: 'Alphabetic Code', dataIndex: 'alphabetic_code', key: 'alphabetic_code' },
    { title: 'Numeric Code', dataIndex: 'numeric_code', key: 'numeric_code' },
    { title: 'Minor Unit', dataIndex: 'minor_unit', key: 'minor_unit' },
    ...(isAdmin ? [{
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit Currency">
            <Button type="text" icon={<Edit size={18} />} onClick={() => openEditModal(record)} />
          </Tooltip>
          <Popconfirm
            title="Delete this currency?"
            description="This action cannot be undone."
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Delete Currency">
              <Button type="text" danger icon={<Trash2 size={18} />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    }] : []),
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white p-6 shadow-sm flex-none">
        <div className="flex items-center gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Input
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search currencies..."
              prefix={<Search size={20} />}
              allowClear
            />
          </div>
          <Select
            value={selectedAlphabeticCode}
            onChange={(value) => handleFilterChange("alphabetic_code", value || "")}
            style={{ width: 200 }}
            placeholder="All Alphabetic Codes"
            allowClear
          >
            {[...new Set(currencies.map((c) => c.alphabetic_code))].sort().map((code) => (
              <Option key={code} value={code}>
                {code}
              </Option>
            ))}
          </Select>
          <Select
            value={selectedNumericCode}
            onChange={(value) => handleFilterChange("numeric_code", value || "")}
            style={{ width: 200 }}
            placeholder="All Numeric Codes"
            allowClear
          >
            {[...new Set(currencies.map((c) => c.numeric_code))].sort().map((code) => (
              <Option key={code} value={code}>
                {code}
              </Option>
            ))}
          </Select>
          {(selectedAlphabeticCode || selectedNumericCode || searchQuery) && (
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
              <Button type="primary" icon={<Plus size={18} />} onClick={openAddModal}>
                Add Currency
              </Button>
            </Space>
          )}
        </div>
      </div>
      <div className="flex-1 m-4 bg-white overflow-x-auto">
        <Table
          columns={columns}
          dataSource={currencies}
          rowKey="id"
          loading={isLoading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 800 }}
          size="middle"
          sticky={true}
        />
      </div>
      {showModal && modalType !== "excel" && (
        <Modal
          title={modalType === "add" ? "Add New Currency" : "Edit Currency"}
          open={showModal && modalType !== "excel"}
          onCancel={closeModal}
          footer={null}
          width={800}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={currencyForm}>
              <div className="grid grid-cols-2 gap-4">
                <Form.Item name="entity" label="Entity" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
                <Form.Item name="currency" label="Currency" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
                <Form.Item name="alphabetic_code" label="Alphabetic Code">
                  <Input />
                </Form.Item>
                <Form.Item name="numeric_code" label="Numeric Code">
                  <Input />
                </Form.Item>
                <Form.Item name="minor_unit" label="Minor Unit">
                  <Input />
                </Form.Item>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <Button onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit">
                  {modalType === "add" ? "Add Currency" : "Save Changes"}
                </Button>
              </div>
          </Form>
        </Modal>
      )}
      {showModal && modalType === "excel" && (
        <Modal
          title="Upload Currencies Excel File"
          open={showModal && modalType === "excel"}
          onCancel={closeModal}
          footer={[
            <Button key="cancel" onClick={closeModal}>Cancel</Button>,
            <Button key="upload" type="primary" loading={isUploading} disabled={!selectedFile} onClick={handleFileUpload}>
              {isUploading ? 'Uploading...' : 'Upload File'}
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
      )}
    </div>
  );
};

export default ISO4217;
