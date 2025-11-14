import React, { useState, useEffect, useRef, useContext, useCallback } from "react";
import { message, Popconfirm, Spin, Table, Button, Input, Select, Modal, Form, Space, Tooltip } from "antd";
import { Search, Plus, Upload, X, Edit, Trash2 } from "lucide-react";
import { apiRequest } from "../../../utils/api";
import { LoadingOutlined } from '@ant-design/icons';
import { AuthContext } from "../../../AuthContext";

const { Option } = Select;

const GICS = () => {
  const { user } = useContext(AuthContext);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [gicsEntries, setGicsEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSector, setSelectedSector] = useState("");
  const [selectedIndustryGroup, setSelectedIndustryGroup] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [selectedSubIndustry, setSelectedSubIndustry] = useState("");
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
  const [activeEntry, setActiveEntry] = useState(null);
  const [entryForm, setEntryForm] = useState({
    sector_number: "",
    sector: "",
    industry_group_number: "",
    industry_group: "",
    industry_number: "",
    industry: "",
    sub_industry_number: "",
    sub_industry: "",
    sub_industry_description: "",
  });
  const [expandedCells, setExpandedCells] = useState({});
  const [form] = Form.useForm();

  const sectorOptions = [
    "Energy",
    "Materials",
    "Industrials",
    "Consumer Discretionary",
    "Consumer Staples",
    "Health Care",
    "Financials",
    "Information Technology",
    "Communication Services",
    "Utilities",
    "Real Estate",
  ];

  const industryGroupOptions = [
    "Energy",
    "Materials",
    "Capital Goods",
    "Commercial & Professional Services",
    "Transportation",
    "Automobiles & Components",
    "Consumer Durables & Apparel",
    "Consumer Services",
    "Consumer Discretionary Distribution & Retail",
    "Consumer Staples Distribution & Retail",
    "Food, Beverage & Tobacco",
    "Household & Personal Products",
    "Health Care Equipment & Services",
    "Pharmaceuticals, Biotechnology & Life Sciences",
    "Banks",
    "Financial Services",
    "Insurance",
    "Software & Services",
    "Technology Hardware & Equipment",
    "Semiconductors & Semiconductor Equipment",
    "Telecommunication Services",
    "Media & Entertainment",
    "Utilities",
    "Equity Real Estate Investment Trusts (REITs)",
    "Real Estate Management & Development",
  ];

  useEffect(() => {
    if (user?.role === "Admin") {
      setIsAdmin(true);
    }
  }, [user]);

  const fetchGicsEntries = useCallback(async () => {
    try {
      setIsLoading(true);
      let url = "/api/policylens/gics/";
      const params = new URLSearchParams();

      if (searchQuery) params.append("search", searchQuery);
      if (selectedSector) params.append("sector", selectedSector);
      if (selectedIndustryGroup) params.append("industry_group", selectedIndustryGroup);
      if (selectedIndustry) params.append("industry", selectedIndustry);
      if (selectedSubIndustry) params.append("sub_industry", selectedSubIndustry);

      params.append("page_size", pagination.pageSize);
      params.append("page", pagination.current);
      params.append("ordering", "sector_number");

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await apiRequest("GET", url, null, true);
      const results = response.data?.results || [];
      const totalCount = response.data?.count || 0;

      setGicsEntries(results);
      setPagination((prev) => ({
        ...prev,
        total: totalCount,
      }));
    } catch (error) {
      console.error("Error fetching GICS entries:", error);
      message.error("Failed to fetch GICS entries");
      setGicsEntries([]);
      setPagination((prev) => ({
        ...prev,
        total: 0,
      }));
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedSector, selectedIndustryGroup, selectedIndustry, selectedSubIndustry, pagination.pageSize, pagination.current]);

  useEffect(() => {
    fetchGicsEntries();
  }, [fetchGicsEntries]);

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
    if (filterType === "sector") setSelectedSector(value);
    if (filterType === "industry_group") setSelectedIndustryGroup(value);
    if (filterType === "industry") setSelectedIndustry(value);
    if (filterType === "sub_industry") setSelectedSubIndustry(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setSelectedSector("");
    setSelectedIndustryGroup("");
    setSelectedIndustry("");
    setSelectedSubIndustry("");
    setSearchQuery("");
    setPagination((prev) => ({ ...prev, current: 1 }));
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setEntryForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const openAddModal = useCallback(() => {
    setModalType("add");
    setShowModal(true);
    setEntryForm({
      sector_number: "",
      sector: "",
      industry_group_number: "",
      industry_group: "",
      industry_number: "",
      industry: "",
      sub_industry_number: "",
      sub_industry: "",
      sub_industry_description: "",
    });
    form.resetFields();
  }, []);

  const openEditModal = useCallback((entry) => {
    setModalType("edit");
    setActiveEntry(entry);
    setEntryForm({
      sector_number: entry.sector_number,
      sector: entry.sector,
      industry_group_number: entry.industry_group_number,
      industry_group: entry.industry_group,
      industry_number: entry.industry_number,
      industry: entry.industry,
      sub_industry_number: entry.sub_industry_number,
      sub_industry: entry.sub_industry,
      sub_industry_description: entry.sub_industry_description,
    });
    form.setFieldsValue({
      sector_number: entry.sector_number,
      sector: entry.sector,
      industry_group_number: entry.industry_group_number,
      industry_group: entry.industry_group,
      industry_number: entry.industry_number,
      industry: entry.industry,
      sub_industry_number: entry.sub_industry_number,
      sub_industry: entry.sub_industry,
      sub_industry_description: entry.sub_industry_description,
    });
    setShowModal(true);
  }, [form]);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setModalType("");
    setActiveEntry(null);
    setEntryForm({
      sector_number: "",
      sector: "",
      industry_group_number: "",
      industry_group: "",
      industry_number: "",
      industry: "",
      sub_industry_number: "",
      sub_industry: "",
      sub_industry_description: "",
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

  const handleFileUpload = useCallback(async (e) => {
    if (!selectedFile) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await apiRequest(
        "POST",
        "/api/policylens/gics/upload/",
        formData,
        true,
        true
      );

      if (response.status === 201 || response.status === 207) {
        message.success(`Uploaded ${response.data.gics_created} GICS entries`);
        setPartialErrors(response.data.errors || []);
        fetchGicsEntries();
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
  }, [selectedFile, fetchGicsEntries, closeModal]);

  const handleSubmit = useCallback(async (values) => {
    try {
      if (modalType === "add") {
        const response = await apiRequest(
          "POST",
          "/api/policylens/gics/create/",
          values,
          true
        );
        if (response.status === 201) {
          message.success("GICS entry created successfully");
          fetchGicsEntries();
          closeModal();
        }
      } else if (modalType === "edit" && activeEntry) {
        const response = await apiRequest(
          "PATCH",
          `/api/policylens/gics/${activeEntry.id}/update/`,
          values,
          true
        );
        if (response.status === 200) {
          message.success("GICS entry updated successfully");
          fetchGicsEntries();
          closeModal();
        }
      }
    } catch (error) {
      console.error("Error submitting GICS entry:", error);
      message.error(error.response?.data?.error || "Failed to save GICS entry");
    }
  }, [modalType, activeEntry, fetchGicsEntries, closeModal]);

  const handleDelete = useCallback(async (id) => {
    try {
      const response = await apiRequest(
        "DELETE",
        `/api/policylens/gics/${id}/delete/`,
        null,
        true
      );
      if (response.status === 204) {
        message.success("GICS entry deleted successfully");
        fetchGicsEntries();
      }
    } catch (error) {
      console.error("Error deleting GICS entry:", error);
      message.error("Failed to delete GICS entry");
    }
  }, [fetchGicsEntries]);

  const toggleCellExpansion = useCallback((id, field) => {
    setExpandedCells((prev) => ({
      ...prev,
      [`${id}-${field}`]: !prev[`${id}-${field}`],
    }));
  }, []);

  const columns = [
    { title: 'Sector Number', dataIndex: 'sector_number', key: 'sector_number', width: 150 },
    { title: 'Sector', dataIndex: 'sector', key: 'sector', width: 200 },
    { title: 'Industry Group Number', dataIndex: 'industry_group_number', key: 'industry_group_number', width: 180 },
    { title: 'Industry Group', dataIndex: 'industry_group', key: 'industry_group', width: 200 },
    { title: 'Industry Number', dataIndex: 'industry_number', key: 'industry_number', width: 150 },
    { title: 'Industry', dataIndex: 'industry', key: 'industry', width: 200 },
    { title: 'Sub-Industry Number', dataIndex: 'sub_industry_number', key: 'sub_industry_number', width: 180 },
    { title: 'Sub-Industry', dataIndex: 'sub_industry', key: 'sub_industry', width: 200 },
    {
      title: 'Sub-Industry Description',
      dataIndex: 'sub_industry_description',
      key: 'sub_industry_description',
      width: 300,
      render: (text, record) => {
        const isExpanded = expandedCells[`${record.id}-sub_industry_description`];
        return (
          <div
            className="cursor-pointer"
            onClick={() => toggleCellExpansion(record.id, 'sub_industry_description')}
          >
            <div className={`whitespace-pre-wrap ${isExpanded ? '' : 'line-clamp-3'}`}>
              {text}
            </div>
            <span className="text-blue-600 hover:text-blue-800 text-xs">
              {isExpanded ? 'Show Less' : 'Show More'}
            </span>
          </div>
        );
      },
    },
    ...(isAdmin ? [{
      title: 'Actions',
      key: 'actions',
      width: 100,
      align: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit GICS Entry">
            <Button type="text" icon={<Edit size={18} />} onClick={() => openEditModal(record)} />
          </Tooltip>
          <Popconfirm
            title="Delete this GICS entry?"
            description="This action cannot be undone."
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Delete GICS Entry">
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
              placeholder="Search GICS entries..."
              prefix={<Search size={20} />}
              allowClear
            />
          </div>
          <Select
            value={selectedSector}
            onChange={(value) => handleFilterChange("sector", value || "")}
            style={{ width: 180 }}
            placeholder="All Sectors"
            allowClear
          >
            {sectorOptions.map((sector) => (
              <Option key={sector} value={sector}>
                {sector}
              </Option>
            ))}
          </Select>
          <Select
            value={selectedIndustryGroup}
            onChange={(value) => handleFilterChange("industry_group", value || "")}
            style={{ width: 200 }}
            placeholder="All Industry Groups"
            allowClear
          >
            {industryGroupOptions.map((group) => (
              <Option key={group} value={group}>
                {group}
              </Option>
            ))}
          </Select>
          <Select
            value={selectedIndustry}
            onChange={(value) => handleFilterChange("industry", value || "")}
            style={{ width: 200 }}
            placeholder="All Industries"
            allowClear
          >
            {[...new Set(gicsEntries.map((entry) => entry.industry))].sort().map((industry) => (
              <Option key={industry} value={industry}>
                {industry}
              </Option>
            ))}
          </Select>
          <Select
            value={selectedSubIndustry}
            onChange={(value) => handleFilterChange("sub_industry", value || "")}
            style={{ width: 200 }}
            placeholder="All Sub-Industries"
            allowClear
          >
            {[...new Set(gicsEntries.map((entry) => entry.sub_industry))].sort().map((subIndustry) => (
              <Option key={subIndustry} value={subIndustry}>
                {subIndustry}
              </Option>
            ))}
          </Select>
          {(selectedSector || selectedIndustryGroup || selectedIndustry || selectedSubIndustry || searchQuery) && (
            <Button type="link" onClick={handleClearFilters}>
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
                Add GICS Entry
              </Button>
            </Space>
          )}
        </div>
      </div>
      <div className="flex-1 p-4 bg-white overflow-x-auto">
        <Table
          columns={columns}
          dataSource={gicsEntries}
          rowKey="id"
          loading={isLoading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1500 }}
          size="middle"
        />
      </div>
      {showModal && modalType !== "excel" && (
        <Modal
          title={modalType === "add" ? "Add New GICS Entry" : "Edit GICS Entry"}
          open={showModal && modalType !== "excel"}
          onCancel={closeModal}
          footer={null}
          width={800}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={entryForm}>
              <div className="grid grid-cols-2 gap-4">
                <Form.Item name="sector_number" label="Sector Number" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
                <Form.Item name="sector" label="Sector" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
                <Form.Item name="industry_group_number" label="Industry Group Number">
                  <Input />
                </Form.Item>
                <Form.Item name="industry_group" label="Industry Group">
                  <Input />
                </Form.Item>
                <Form.Item name="industry_number" label="Industry Number">
                  <Input />
                </Form.Item>
                <Form.Item name="industry" label="Industry">
                  <Input />
                </Form.Item>
                <Form.Item name="sub_industry_number" label="Sub-Industry Number">
                  <Input />
                </Form.Item>
                <Form.Item name="sub_industry" label="Sub-Industry">
                  <Input />
                </Form.Item>
                <Form.Item name="sub_industry_description" label="Sub-Industry Description" className="col-span-2">
                  <Input.TextArea rows={3} />
                </Form.Item>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <Button onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit">
                  {modalType === "add" ? "Add GICS Entry" : "Save Changes"}
                </Button>
              </div>
          </Form>
        </Modal>
      )}
      {showModal && modalType === "excel" && (
        <Modal
          title="Upload GICS Excel File"
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
                          Row {error.row}: {Object.entries(error.errors).map(([field, msg]) => `${field}: ${msg}`).join(", ")}
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

export default GICS;