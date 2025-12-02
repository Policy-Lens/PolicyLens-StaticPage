import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  Input,
  Table,
  Modal,
  Form,
  Space,
  Spin,
  Popconfirm,
  message,
} from "antd";
import {
  SaveOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { apiRequest } from "../../../utils/api";

const CompanyProfileEdit = ({
  companyId,
  isEditMode,
  onClose,
  onDownloadPDF,
  previewHtml,
  previewLoading,
  canEdit,
  onEditClick,
}) => {
  const [profileData, setProfileData] = useState(null);
  const [requirements, setRequirements] = useState([]);
  const [requirementModalVisible, setRequirementModalVisible] = useState(false);
  const [editingRequirement, setEditingRequirement] = useState(null);
  const [requirementForm] = Form.useForm();
  const [executiveSummaryValue, setExecutiveSummaryValue] = useState("");
  const [orgStructureValue, setOrgStructureValue] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      fetchProfileData();
    }
  }, [isEditMode]);

  // Fetch profile data for editing
  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await apiRequest(
        "GET",
        `/api/company/${companyId}/profile/`,
        null,
        true
      );
      if (response.status === 200) {
        setProfileData(response.data);
        setRequirements(response.data.applicable_requirements || []);
        setExecutiveSummaryValue(response.data.executive_summary || "");
        setOrgStructureValue(response.data.org_structure || "");
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
      message.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  // Update executive summary
  const updateExecutiveSummary = async (value) => {
    try {
      const response = await apiRequest(
        "PATCH",
        `/api/company/${companyId}/profile/update/`,
        { executive_summary: value },
        true
      );
      if (response.status === 200) {
        message.success("Executive summary updated successfully");
        setProfileData({ ...profileData, executive_summary: value });
      }
    } catch (error) {
      console.error("Error updating executive summary:", error);
      message.error("Failed to update executive summary");
    }
  };

  // Update org structure
  const updateOrgStructure = async (value) => {
    try {
      const response = await apiRequest(
        "PATCH",
        `/api/company/${companyId}/profile/update/`,
        { org_structure: value },
        true
      );
      if (response.status === 200) {
        message.success("Organization structure updated successfully");
        setProfileData({ ...profileData, org_structure: value });
      }
    } catch (error) {
      console.error("Error updating org structure:", error);
      message.error("Failed to update organization structure");
    }
  };

  // Create requirement
  const createRequirement = async (values) => {
    try {
      const response = await apiRequest(
        "POST",
        `/api/company/${companyId}/profile/requirements/`,
        values,
        true
      );
      if (response.status === 201) {
        message.success("Requirement added successfully");
        const newRequirement = response.data.requirement || response.data;
        setRequirements([...requirements, newRequirement]);
        setRequirementModalVisible(false);
        requirementForm.resetFields();
      }
    } catch (error) {
      console.error("Error creating requirement:", error);
      message.error("Failed to add requirement");
    }
  };

  // Update requirement
  const updateRequirement = async (id, values) => {
    try {
      const response = await apiRequest(
        "PATCH",
        `/api/company/${companyId}/profile/requirements/${id}/`,
        values,
        true
      );
      if (response.status === 200) {
        message.success("Requirement updated successfully");
        setRequirements(
          requirements.map((req) => (req.id === id ? response.data : req))
        );
        setRequirementModalVisible(false);
        setEditingRequirement(null);
        requirementForm.resetFields();
      }
    } catch (error) {
      console.error("Error updating requirement:", error);
      message.error("Failed to update requirement");
    }
  };

  // Delete requirement
  const deleteRequirement = async (id) => {
    try {
      const response = await apiRequest(
        "DELETE",
        `/api/company/${companyId}/profile/requirements/${id}/delete/`,
        null,
        true
      );
      if (response.status === 200 || response.status === 204) {
        message.success("Requirement deleted successfully");
        setRequirements(requirements.filter((req) => req.id !== id));
      }
    } catch (error) {
      console.error("Error deleting requirement:", error);
      message.error("Failed to delete requirement");
    }
  };

  // Requirements table columns
  const requirementColumns = [
    { title: "Title", dataIndex: "title", key: "title" },
    {
      title: "Count of Requirements",
      dataIndex: "count_of_requirements",
      key: "count_of_requirements",
    },
    {
      title: "Count of Controls",
      dataIndex: "count_of_controls",
      key: "count_of_controls",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingRequirement(record);
              requirementForm.setFieldsValue(record);
              setRequirementModalVisible(true);
            }}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete this requirement?"
            onConfirm={() => deleteRequirement(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (loading || previewLoading) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <Spin size="large" />
        <div style={{ marginTop: "16px" }}>Loading...</div>
      </div>
    );
  }

  if (isEditMode) {
    return (
      <div>
        <div
          style={{
            marginBottom: "16px",
            display: "flex",
            justifyContent: "flex-end",
            gap: "8px",
          }}
        >
          <Button onClick={onClose}>Close Edit Mode</Button>
        </div>

        {/* Executive Summary */}
        <Card
          title="Executive Summary"
          style={{ marginBottom: "16px" }}
          extra={
            executiveSummaryValue !== profileData?.executive_summary && (
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={() => updateExecutiveSummary(executiveSummaryValue)}
              >
                Save
              </Button>
            )
          }
        >
          <Input.TextArea
            rows={8}
            value={executiveSummaryValue}
            onChange={(e) => setExecutiveSummaryValue(e.target.value)}
            placeholder="Enter executive summary..."
          />
        </Card>

        {/* Organization Structure */}
        <Card
          title="Organization Structure"
          style={{ marginBottom: "16px" }}
          extra={
            orgStructureValue !== profileData?.org_structure && (
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={() => updateOrgStructure(orgStructureValue)}
              >
                Save
              </Button>
            )
          }
        >
          <Input.TextArea
            rows={8}
            value={orgStructureValue}
            onChange={(e) => setOrgStructureValue(e.target.value)}
            placeholder="Enter organization structure..."
          />
        </Card>

        {/* Applicable Requirements */}
        <Card
          title="Applicable Requirements"
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingRequirement(null);
                requirementForm.resetFields();
                setRequirementModalVisible(true);
              }}
            >
              Add Requirement
            </Button>
          }
        >
          <Table
            dataSource={requirements}
            columns={requirementColumns}
            rowKey="id"
            pagination={false}
          />
        </Card>

        {/* Requirement Modal */}
        <Modal
          title={editingRequirement ? "Edit Requirement" : "Add Requirement"}
          open={requirementModalVisible}
          onCancel={() => {
            setRequirementModalVisible(false);
            setEditingRequirement(null);
            requirementForm.resetFields();
          }}
          onOk={() => requirementForm.submit()}
          okText={editingRequirement ? "Update" : "Add"}
        >
          <Form
            form={requirementForm}
            layout="vertical"
            onFinish={(values) => {
              if (editingRequirement) {
                updateRequirement(editingRequirement.id, values);
              } else {
                createRequirement(values);
              }
            }}
          >
            <Form.Item
              name="title"
              label="Title"
              rules={[{ required: true, message: "Please enter title" }]}
            >
              <Input placeholder="e.g., ISO 27001:2022" />
            </Form.Item>
            <Form.Item
              name="count_of_requirements"
              label="Count of Requirements"
              rules={[{ required: true, message: "Please enter count" }]}
            >
              <Input type="number" placeholder="e.g., 93" />
            </Form.Item>
            <Form.Item
              name="count_of_controls"
              label="Count of Controls"
              rules={[{ required: true, message: "Please enter count" }]}
            >
              <Input type="number" placeholder="e.g., 114" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    );
  }

  // Preview mode
  return (
    <div>
      <div
        style={{
          marginBottom: "16px",
          display: "flex",
          justifyContent: "flex-end",
          gap: "8px",
        }}
      >
        {canEdit && (
          <Button icon={<EditOutlined />} onClick={onEditClick}>
            Edit Profile
          </Button>
        )}
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={onDownloadPDF}
          disabled={!canEdit}
        >
          Download as PDF
        </Button>
      </div>
      <div
        id="profile-preview-content"
        dangerouslySetInnerHTML={{ __html: previewHtml }}
      />
    </div>
  );
};

export default CompanyProfileEdit;
