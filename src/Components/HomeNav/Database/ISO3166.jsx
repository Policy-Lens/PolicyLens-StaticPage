import React, { useState, useEffect, useRef, useContext, useCallback } from "react";
import { message, Popconfirm, Spin, Table, Button, Input, Select, Modal, Form, Space, Tooltip } from "antd";
import { Search, Plus, Upload, X, Edit, Trash2 } from "lucide-react";
import { apiRequest } from "../../../utils/api";
import { AuthContext } from "../../../AuthContext";
import { LoadingOutlined } from '@ant-design/icons';

const { Option } = Select;

const ISO3166 = () => {
  const { user } = useContext(AuthContext);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [countries, setCountries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
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
  const [activeCountry, setActiveCountry] = useState(null);
  const [countryForm, setCountryForm] = useState({
    country: "",
    alpha2_code: "",
    alpha3_code: "",
    numeric_code: "",
  });
  const [form] = Form.useForm();

  useEffect(() => {
    if (user?.role === "Admin") {
      setIsAdmin(true);
    }
  }, [user]);

  const fetchCountries = useCallback(async () => {
    try {
      setIsLoading(true);
      let url = "/api/policylens/iso3166/";
      const params = new URLSearchParams();
      if (searchQuery) {
        params.append("search", searchQuery);
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

      setCountries(results);
      setPagination((prev) => ({
        ...prev,
        total: totalCount,
      }));
    } catch (error) {
      console.error("Error fetching countries:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url,
      });
      const errorMessage = error.response?.data?.error || error.message || "Failed to fetch countries";
      message.error(`Failed to fetch countries: ${errorMessage}`);
      setCountries([]);
      setPagination((prev) => ({
        ...prev,
        total: 0,
      }));
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, pagination.current, pagination.pageSize]);

  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

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

  const handleClearFilters = useCallback(() => {
    setSearchQuery("");
    setPagination((prev) => ({ ...prev, current: 1 }));
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setCountryForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const openAddModal = useCallback(() => {
    setModalType("add");
    setShowModal(true);
    setCountryForm({
      country: "",
      alpha2_code: "",
      alpha3_code: "",
      numeric_code: "",
    });
    form.resetFields();
  }, []);

  const openEditModal = useCallback((country) => {
    setModalType("edit");
    setActiveCountry(country);
    setCountryForm({
      country: country.country,
      alpha2_code: country.alpha2_code,
      alpha3_code: country.alpha3_code,
      numeric_code: country.numeric_code,
    });
    form.setFieldsValue({
      country: country.country,
      alpha2_code: country.alpha2_code,
      alpha3_code: country.alpha3_code,
      numeric_code: country.numeric_code,
    });
    setShowModal(true);
  }, [form]);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setModalType("");
    setActiveCountry(null);
    setCountryForm({
      country: "",
      alpha2_code: "",
      alpha3_code: "",
      numeric_code: "",
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
      if (modalType === "edit" && activeCountry) {
        response = await apiRequest(
          "PUT",
          `/api/policylens/iso3166/${activeCountry.id}/update/`,
          values,
          true
        );
      } else {
        response = await apiRequest(
          "POST",
          `/api/policylens/iso3166/create/`,
          values,
          true
        );
      }

      if (response.status === 200 || response.status === 201) {
        message.success(
          `Country ${modalType === "edit" ? "updated" : "created"} successfully`
        );
        fetchCountries();
        closeModal();
      }
    } catch (error) {
      console.error("Error submitting country:", error);
      const errorMessage = error.response?.data?.error || "Failed to save country";
      message.error(`Failed to ${modalType} country: ${errorMessage}`);
    }
  }, [modalType, activeCountry, fetchCountries, closeModal]);

  const handleFileUpload = useCallback(async () => {
    if (!selectedFile) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await apiRequest(
        "POST",
        "/api/policylens/iso3166/upload/",
        formData,
        true,
        true
      );

      if (response.status === 201 || response.status === 207) {
        message.success(
          `Successfully created ${response.data.countries_created || 0} countries`
        );
        if (response.data.errors?.length > 0) {
          setPartialErrors(response.data.errors);
        }
        fetchCountries();
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
  }, [selectedFile, fetchCountries, closeModal]);

  const handleDelete = useCallback(async (id) => {
    try {
      const response = await apiRequest(
        "DELETE",
        `/api/policylens/iso3166/${id}/delete/`,
        null,
        true
      );
      if (response.status === 204) {
        message.success("Country deleted successfully");
        fetchCountries();
      }
    } catch (error) {
      console.error("Error deleting country:", error);
      const errorMessage = error.response?.data?.error || "Failed to delete country";
      message.error(errorMessage);
    }
  }, [fetchCountries]);

  const columns = [
    { title: 'Country', dataIndex: 'country', key: 'country' },
    { title: 'Alpha-2 Code', dataIndex: 'alpha2_code', key: 'alpha2_code' },
    { title: 'Alpha-3 Code', dataIndex: 'alpha3_code', key: 'alpha3_code' },
    { title: 'Numeric Code', dataIndex: 'numeric_code', key: 'numeric_code' },
    ...(isAdmin ? [{
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit Country">
            <Button type="text" icon={<Edit size={18} />} onClick={() => openEditModal(record)} />
          </Tooltip>
          <Popconfirm
            title="Delete this country?"
            description="This action cannot be undone."
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Delete Country">
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
              placeholder="Search countries..."
              prefix={<Search size={20} />}
              allowClear
            />
          </div>
          
          {(searchQuery) && (
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
                Add Country
              </Button>
            </Space>
          )}
        </div>
      </div>
      <div className="flex-1 m-4 bg-white overflow-x-auto">
        <Table
          columns={columns}
          dataSource={countries}
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
          title={modalType === "add" ? "Add New Country" : "Edit Country"}
          open={showModal && modalType !== "excel"}
          onCancel={closeModal}
          footer={null}
          width={800}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={countryForm}>
              <div className="grid grid-cols-2 gap-4">
                <Form.Item name="country" label="Country Name" rules={[{ required: true, message: 'Please enter country name' }]}>
                  <Input placeholder="e.g., United States" />
                </Form.Item>
                <Form.Item name="alpha2_code" label="Alpha-2 Code" rules={[{ required: true, message: 'Please enter alpha-2 code' }]}>
                  <Input placeholder="e.g., US" maxLength={2} />
                </Form.Item>
                <Form.Item name="alpha3_code" label="Alpha-3 Code" rules={[{ required: true, message: 'Please enter alpha-3 code' }]}>
                  <Input placeholder="e.g., USA" maxLength={3} />
                </Form.Item>
                <Form.Item name="numeric_code" label="Numeric Code" rules={[{ required: true, message: 'Please enter numeric code' }]}>
                  <Input placeholder="e.g., 840" />
                </Form.Item>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <Button onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit">
                  {modalType === "add" ? "Add Country" : "Save Changes"}
                </Button>
              </div>
          </Form>
        </Modal>
      )}
      {showModal && modalType === "excel" && (
        <Modal
          title="Upload Countries Excel File"
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
                  <p className="text-sm text-gray-600 mb-2">
                    Required columns: <strong>country, alpha2_code, alpha3_code, numeric_code</strong>
                  </p>
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

export default ISO3166;
