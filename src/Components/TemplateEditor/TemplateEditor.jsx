import React, { useState, useEffect, useContext } from "react";
import {
  Form,
  Modal,
  Button,
  Tabs,
  message,
  Spin,
  Space,
  Typography,
} from "antd";
import { SaveOutlined, DownloadOutlined, CloseOutlined } from "@ant-design/icons";
import { apiRequest } from "../../utils/api";
import { AuthContext } from "../../AuthContext";
import FieldRenderer from "./FieldRenderer";
import EditableTable from "./EditableTable";

const { TabPane } = Tabs;
const { Title } = Typography;

const TemplateEditor = ({
  visible,
  onClose,
  templateId,
  projectId,
  instanceId = null,
}) => {
  const [form] = Form.useForm();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [structure, setStructure] = useState(null);
  const [instance, setInstance] = useState(null);
  const [activeTab, setActiveTab] = useState("sheet_0");

  // Fetch template structure
  useEffect(() => {
    if (visible && templateId) {
      fetchStructure();
      if (instanceId) {
        fetchInstance();
      }
    }
  }, [visible, templateId, instanceId]);

  const fetchStructure = async () => {
    setLoading(true);
    try {
      const response = await apiRequest(
        "GET",
        `/api/controlfiles/templates/${templateId}/structure/`,
        null,
        true
      );
      setStructure(response.data);
      
      // Set active tab to first sheet
      if (response.data?.structure_data?.sheets?.length > 0) {
        setActiveTab("sheet_0");
      }
    } catch (error) {
      console.error("Error fetching template structure:", error);
      message.error("Failed to load template structure");
    } finally {
      setLoading(false);
    }
  };

  const fetchInstance = async () => {
    try {
      const response = await apiRequest(
        "GET",
        `/api/controlfiles/template-instances/${instanceId}/`,
        null,
        true
      );
      setInstance(response.data);
      
      // Load form data if instance exists
      if (response.data?.form_data) {
        form.setFieldsValue(response.data.form_data);
      }
    } catch (error) {
      console.error("Error fetching instance:", error);
      message.error("Failed to load template instance");
    }
  };

  // Auto-save with debouncing
  useEffect(() => {
    if (!visible || !structure) return;

    let debounceTimer;
    const unsubscribe = form.getFieldsValue();

    const handleValuesChange = (changedValues, allValues) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        autoSave(allValues);
      }, 2000); // 2 second debounce
    };

    // Note: This is a simplified version. In production, you'd use Form's onValuesChange
    return () => clearTimeout(debounceTimer);
  }, [form, structure, visible]);

  const autoSave = async (formData) => {
    if (!templateId) return;

    try {
      const payload = {
        template_id: templateId,
        form_data: formData,
        status: "draft",
      };

      if (projectId) {
        payload.project_id = projectId;
      }

      if (instance?.id) {
        // Update existing instance
        await apiRequest(
          "PATCH",
          `/api/controlfiles/template-instances/${instance.id}/`,
          payload,
          true
        );
      } else {
        // Create new instance
        const response = await apiRequest(
          "POST",
          "/api/controlfiles/template-instances/",
          payload,
          true
        );
        setInstance(response.data);
      }
    } catch (error) {
      console.error("Error auto-saving:", error);
      // Don't show error for auto-save failures
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const values = await form.validateFields();
      
      const payload = {
        template_id: templateId,
        form_data: values,
        status: "completed",
      };

      if (projectId) {
        payload.project_id = projectId;
      }

      if (instance?.id) {
        const response = await apiRequest(
          "PATCH",
          `/api/controlfiles/template-instances/${instance.id}/`,
          payload,
          true
        );
        setInstance(response.data);
        message.success("Template saved successfully!");
      } else {
        const response = await apiRequest(
          "POST",
          "/api/controlfiles/template-instances/",
          payload,
          true
        );
        setInstance(response.data);
        message.success("Template saved successfully!");
      }
    } catch (error) {
      console.error("Error saving template:", error);
      if (error.response?.data?.error) {
        message.error(error.response.data.error);
      } else {
        message.error("Failed to save template");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleExportPDF = async () => {
    if (!instance?.id) {
      message.warning("Please save the template first before exporting");
      return;
    }

    try {
      setSaving(true);
      const response = await apiRequest(
        "GET",
        `/api/controlfiles/template-instances/${instance.id}/export-pdf/`,
        null,
        true
      );

      // Download PDF if URL is provided
      if (response.data?.pdf_file_url) {
        const link = document.createElement("a");
        link.href = response.data.pdf_file_url;
        link.download = `${instance.template_name}_${instance.id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        message.success("PDF exported successfully!");
      } else {
        message.error("PDF generation failed");
      }
    } catch (error) {
      console.error("Error exporting PDF:", error);
      message.error("Failed to export PDF");
    } finally {
      setSaving(false);
    }
  };

  const renderSheet = (sheet, sheetIndex) => {
    const fields = sheet.fields || [];
    const tables = sheet.tables || [];

    return (
      <div key={sheetIndex} style={{ padding: "20px 0" }}>
        <Title level={4}>{sheet.name}</Title>
        
        {/* Render fields */}
        {fields.map((field, fieldIndex) => (
          <FieldRenderer
            key={`field_${fieldIndex}`}
            field={field}
            form={form}
            name={`${sheet.name}_${field.name}`}
          />
        ))}

        {/* Render tables */}
        {tables.map((table, tableIndex) => (
          <EditableTable
            key={`table_${tableIndex}`}
            table={table}
            form={form}
            name={`${sheet.name}_table_${tableIndex}`}
          />
        ))}
      </div>
    );
  };

  if (!structure && loading) {
    return (
      <Modal
        visible={visible}
        onCancel={onClose}
        footer={null}
        width={1200}
        title="Loading Template..."
      >
        <div style={{ textAlign: "center", padding: "40px" }}>
          <Spin size="large" />
        </div>
      </Modal>
    );
  }

  if (!structure) {
    return (
      <Modal
        visible={visible}
        onCancel={onClose}
        footer={null}
        width={1200}
        title="Template Error"
      >
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p>Template structure not found. Please parse the template first.</p>
        </div>
      </Modal>
    );
  }

  const sheets = structure.structure_data?.sheets || [];

  return (
    <Modal
      visible={visible}
      onCancel={onClose}
      width={1200}
      title={`Edit Template: ${structure.template_name || "Untitled"}`}
      footer={
        <Space>
          <Button icon={<CloseOutlined />} onClick={onClose}>
            Close
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={saving}
            onClick={handleSave}
          >
            Save
          </Button>
          <Button
            type="default"
            icon={<DownloadOutlined />}
            loading={saving}
            onClick={handleExportPDF}
          >
            Export PDF
          </Button>
        </Space>
      }
      style={{ top: 20 }}
      bodyStyle={{ maxHeight: "80vh", overflowY: "auto" }}
    >
      <Form
        form={form}
        layout="vertical"
        onValuesChange={(changedValues, allValues) => {
          // Trigger auto-save
          autoSave(allValues);
        }}
      >
        {sheets.length > 1 ? (
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            {sheets.map((sheet, index) => (
              <TabPane tab={sheet.name} key={`sheet_${index}`}>
                {renderSheet(sheet, index)}
              </TabPane>
            ))}
          </Tabs>
        ) : (
          sheets.length === 1 && renderSheet(sheets[0], 0)
        )}
      </Form>
    </Modal>
  );
};

export default TemplateEditor;

