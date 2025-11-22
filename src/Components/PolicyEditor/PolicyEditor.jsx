import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Save,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  FileText,
  FileDown,
} from "lucide-react";
import { Button, message, Form, Input, Select, Upload, Spin, Alert } from "antd";
const { useWatch } = Form;
import html2pdf from "html2pdf.js";
import { apiRequest } from "../../utils/api";
import RichTextEditor from "./RichTextEditor";
import AIPanel from "./AIPanel";
import PolicyTemplateList from "./PolicyTemplateList";

const { TextArea } = Input;
const { Option } = Select;

const PolicyEditor = () => {
  const { policyId, projectid } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [policyData, setPolicyData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const autoSaveIntervalRef = useRef(null);
  const hasUnsavedChanges = useRef(false);
  const originalContentRef = useRef(null); // Store original template content

  // Watch form values for real-time placeholder replacement
  const formValues = useWatch([], form);

  // Store original content when policy loads
  useEffect(() => {
    if (policyData?.policy_data?.content?.main_content) {
      originalContentRef.current = {
        html: policyData.template_details?.template_data?.content?.main_content?.html || 
              policyData.policy_data.content.main_content.html,
        plain_text: policyData.template_details?.template_data?.content?.main_content?.plain_text || 
                    policyData.policy_data.content.main_content.plain_text,
      };
    }
  }, [policyData?.policy_id]); // Only when policy ID changes

  // Update editor content when metadata changes (real-time placeholder replacement)
  useEffect(() => {
    if (!policyData || !formValues || !originalContentRef.current) return;

    const metadataValues = {};
    
    // Get current metadata values from form
    const metadata = policyData.policy_data?.metadata || {};
    Object.keys(metadata).forEach((key) => {
      const formValue = formValues[key];
      if (formValue !== undefined && formValue !== null && formValue !== "") {
        metadataValues[key] = String(formValue);
      }
    });

    // Replace placeholders in content using original template content
    if (Object.keys(metadataValues).length > 0) {
      let html = originalContentRef.current.html || "";
      let plainText = originalContentRef.current.plain_text || "";

      Object.keys(metadataValues).forEach((key) => {
        const value = metadataValues[key];
        const patterns = [
          `<${key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}>`,
          `<${key.replace(/_/g, " ").toUpperCase()}>`,
          `<${key.replace(/_/g, " ")}>`,
          `<${key}>`,
          `{${key}}`,
        ];

        patterns.forEach((pattern) => {
          const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          html = html.replace(new RegExp(escapedPattern, "g"), value);
          plainText = plainText.replace(new RegExp(escapedPattern, "g"), value);
        });
      });

      // Update policy data with replaced placeholders
      const updatedPolicyData = JSON.parse(JSON.stringify(policyData.policy_data));
      updatedPolicyData.content.main_content.html = html;
      updatedPolicyData.content.main_content.plain_text = plainText;
      updatedPolicyData.content.main_content.word_count = plainText.split(/\s+/).length;
      updatedPolicyData.content.main_content.char_count = plainText.length;
      
      // Only update if content actually changed
      const currentHtml = policyData.policy_data?.content?.main_content?.html || "";
      if (html !== currentHtml) {
        setPolicyData({ ...policyData, policy_data: updatedPolicyData });
        hasUnsavedChanges.current = true;
      }
    }
  }, [formValues]); // Only depend on formValues

  // Auto-save every 10 seconds
  useEffect(() => {
    if (policyId && policyData) {
      autoSaveIntervalRef.current = setInterval(() => {
        if (hasUnsavedChanges.current) {
          handleAutoSave();
        }
      }, 10000); // 10 seconds

      return () => {
        if (autoSaveIntervalRef.current) {
          clearInterval(autoSaveIntervalRef.current);
        }
      };
    }
  }, [policyId, policyData]);

  useEffect(() => {
    if (policyId) {
      fetchPolicy();
    }
  }, [policyId]);

  const fetchPolicy = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest(
        "GET",
        `/api/plc_workflow/policies/${policyId}/`,
        null,
        true
      );

      if (response.data) {
        setPolicyData(response.data);
        populateForm(response.data.policy_data);
      }
    } catch (error) {
      console.error("Error fetching policy:", error);
      message.error("Failed to load policy");
    } finally {
      setIsLoading(false);
    }
  };

  const populateForm = (data) => {
    if (!data || !data.metadata) return;

    const formValues = {};
    Object.keys(data.metadata).forEach((key) => {
      const field = data.metadata[key];
      if (field.value !== undefined && field.value !== null) {
        formValues[key] = field.value;
      }
    });

    form.setFieldsValue(formValues);
  };

  const handleAutoSave = async () => {
    if (!policyId || !policyData) return;

    try {
      const formValues = form.getFieldsValue();
      const updatedPolicyData = { ...policyData.policy_data };

      // Update metadata values
      Object.keys(formValues).forEach((key) => {
        if (updatedPolicyData.metadata[key]) {
          updatedPolicyData.metadata[key].value = formValues[key] || "";
        }
      });

      // Replace placeholders
      const metadataValues = {};
      Object.keys(updatedPolicyData.metadata).forEach((key) => {
        const field = updatedPolicyData.metadata[key];
        if (field.value) {
          metadataValues[key] = field.value;
        }
      });

      // Replace placeholders in content
      const mainContent = updatedPolicyData.content?.main_content;
      if (mainContent) {
        let html = mainContent.html || "";
        let plainText = mainContent.plain_text || "";

        Object.keys(metadataValues).forEach((key) => {
          const value = metadataValues[key];
          const patterns = [
            `<${key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}>`,
            `<${key.replace(/_/g, " ").toUpperCase()}>`,
            `<${key.replace(/_/g, " ")}>`,
            `<${key}>`,
            `{${key}}`,
          ];

          patterns.forEach((pattern) => {
            html = html.replace(new RegExp(pattern, "g"), value);
            plainText = plainText.replace(new RegExp(pattern, "g"), value);
          });
        });

        updatedPolicyData.content.main_content.html = html;
        updatedPolicyData.content.main_content.plain_text = plainText;
        updatedPolicyData.content.main_content.word_count = plainText.split(/\s+/).length;
        updatedPolicyData.content.main_content.char_count = plainText.length;
      }

      await apiRequest(
        "POST",
        `/api/plc_workflow/policies/${policyId}/save-draft/`,
        { policy_data: updatedPolicyData },
        true
      );

      hasUnsavedChanges.current = false;
      setLastSaved(new Date());
    } catch (error) {
      console.error("Auto-save failed:", error);
      // Don't show error message for auto-save failures
    }
  };

  const handleSave = async () => {
    if (!policyId || !policyData) return;

    setIsSaving(true);
    try {
      const formValues = form.getFieldsValue();
      const updatedPolicyData = { ...policyData.policy_data };

      // Update metadata values
      Object.keys(formValues).forEach((key) => {
        if (updatedPolicyData.metadata[key]) {
          updatedPolicyData.metadata[key].value = formValues[key] || "";
        }
      });

      // Replace placeholders
      const metadataValues = {};
      Object.keys(updatedPolicyData.metadata).forEach((key) => {
        const field = updatedPolicyData.metadata[key];
        if (field.value) {
          metadataValues[key] = field.value;
        }
      });

      // Replace placeholders in content
      const mainContent = updatedPolicyData.content?.main_content;
      if (mainContent) {
        let html = mainContent.html || "";
        let plainText = mainContent.plain_text || "";

        Object.keys(metadataValues).forEach((key) => {
          const value = metadataValues[key];
          const patterns = [
            `<${key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}>`,
            `<${key.replace(/_/g, " ").toUpperCase()}>`,
            `<${key.replace(/_/g, " ")}>`,
            `<${key}>`,
            `{${key}}`,
          ];

          patterns.forEach((pattern) => {
            html = html.replace(new RegExp(pattern, "g"), value);
            plainText = plainText.replace(new RegExp(pattern, "g"), value);
          });
        });

        updatedPolicyData.content.main_content.html = html;
        updatedPolicyData.content.main_content.plain_text = plainText;
        updatedPolicyData.content.main_content.word_count = plainText.split(/\s+/).length;
        updatedPolicyData.content.main_content.char_count = plainText.length;
      }

      await apiRequest(
        "POST",
        `/api/plc_workflow/policies/${policyId}/save-draft/`,
        { policy_data: updatedPolicyData },
        true
      );

      hasUnsavedChanges.current = false;
      setLastSaved(new Date());
      message.success("Policy saved successfully");
    } catch (error) {
      console.error("Error saving policy:", error);
      message.error(error.data?.error || "Failed to save policy");
    } finally {
      setIsSaving(false);
    }
  };

  const handleValidate = async () => {
    if (!policyId) return;

    try {
      const response = await apiRequest(
        "POST",
        `/api/plc_workflow/policies/${policyId}/validate/`,
        null,
        true
      );

      if (response.data) {
        if (response.data.is_valid) {
          message.success("Policy validation passed!");
          setValidationErrors([]);
        } else {
          setValidationErrors(response.data.errors || []);
          message.warning("Policy validation failed. Please check the errors.");
        }
      }
    } catch (error) {
      console.error("Error validating policy:", error);
      message.error("Failed to validate policy");
    }
  };

  const handleContentChange = useCallback(({ html, text }) => {
    if (!policyData) return;

    const updatedPolicyData = { ...policyData.policy_data };
    updatedPolicyData.content.main_content.html = html;
    updatedPolicyData.content.main_content.plain_text = text;
    updatedPolicyData.content.main_content.word_count = text.split(/\s+/).length;
    updatedPolicyData.content.main_content.char_count = text.length;

    setPolicyData({ ...policyData, policy_data: updatedPolicyData });
    hasUnsavedChanges.current = true;
  }, [policyData]);

  const handleGeneratePDF = async () => {
    if (!policyData) {
      message.warning("No policy data available");
      return;
    }

    try {
      message.loading({ content: "Generating PDF...", key: "pdf-generation" });

      // Create a temporary container for PDF generation
      const pdfContainer = document.createElement("div");
      pdfContainer.style.padding = "40px";
      pdfContainer.style.fontFamily = "Arial, sans-serif";
      pdfContainer.style.fontSize = "12pt";
      pdfContainer.style.lineHeight = "1.6";
      pdfContainer.style.color = "#000";

      // Add title
      const title = document.createElement("h1");
      title.textContent = policyData.template_details?.template_name || "Policy Document";
      title.style.fontSize = "24pt";
      title.style.fontWeight = "bold";
      title.style.marginBottom = "20px";
      title.style.textAlign = "center";
      pdfContainer.appendChild(title);

      // Add metadata section
      const metadata = policyData.policy_data?.metadata || {};
      if (Object.keys(metadata).length > 0) {
        const metadataSection = document.createElement("div");
        metadataSection.style.marginBottom = "30px";
        metadataSection.style.padding = "15px";
        metadataSection.style.backgroundColor = "#f5f5f5";
        metadataSection.style.borderRadius = "5px";

        const metadataTitle = document.createElement("h2");
        metadataTitle.textContent = "Metadata";
        metadataTitle.style.fontSize = "18pt";
        metadataTitle.style.fontWeight = "bold";
        metadataTitle.style.marginBottom = "15px";
        metadataSection.appendChild(metadataTitle);

        Object.keys(metadata).forEach((key) => {
          const field = metadata[key];
          if (field.value) {
            const metadataItem = document.createElement("div");
            metadataItem.style.marginBottom = "10px";
            const label = document.createElement("strong");
            label.textContent = `${key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}: `;
            const value = document.createTextNode(field.value);
            metadataItem.appendChild(label);
            metadataItem.appendChild(value);
            metadataSection.appendChild(metadataItem);
          }
        });

        pdfContainer.appendChild(metadataSection);
      }

      // Add content section
      const contentSection = document.createElement("div");
      contentSection.style.marginTop = "20px";
      const mainContent = policyData.policy_data?.content?.main_content || {};
      
      if (mainContent.html) {
        // Create a temporary div to parse HTML
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = mainContent.html;
        contentSection.appendChild(tempDiv);
      } else {
        const noContent = document.createElement("p");
        noContent.textContent = "No content available.";
        noContent.style.fontStyle = "italic";
        noContent.style.color = "#666";
        contentSection.appendChild(noContent);
      }

      pdfContainer.appendChild(contentSection);

      // Add footer with policy ID
      const footer = document.createElement("div");
      footer.style.marginTop = "40px";
      footer.style.paddingTop = "20px";
      footer.style.borderTop = "1px solid #ddd";
      footer.style.fontSize = "10pt";
      footer.style.color = "#666";
      footer.textContent = `Policy ID: ${policyData.policy_id} | Generated on ${new Date().toLocaleString()}`;
      pdfContainer.appendChild(footer);

      // Append to body temporarily
      document.body.appendChild(pdfContainer);

      // Generate PDF
      const opt = {
        margin: [15, 15, 15, 15],
        filename: `${policyData.template_details?.template_name || "Policy"}_${policyData.policy_id}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          allowTaint: true,
          scrollY: 0,
          scrollX: 0,
          windowHeight: pdfContainer.scrollHeight,
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
        },
        pagebreak: {
          mode: ["avoid-all", "css", "legacy"],
        },
      };

      await html2pdf().set(opt).from(pdfContainer).save();

      // Clean up
      document.body.removeChild(pdfContainer);

      message.success({ content: "PDF generated successfully!", key: "pdf-generation" });
    } catch (error) {
      console.error("PDF generation error:", error);
      message.error({ content: "Failed to generate PDF", key: "pdf-generation" });
    }
  };

  const renderMetadataField = (key, field) => {
    if (field.field_type === "readonly") {
      return (
        <Form.Item key={key} label={key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}>
          <Input value={field.value} disabled />
        </Form.Item>
      );
    }

    if (field.field_type === "select" || field.type === "dropdown") {
      return (
        <Form.Item
          key={key}
          name={key}
          label={key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
          rules={field.required ? [{ required: true, message: "This field is required" }] : []}
        >
          <Select placeholder={field.placeholder}>
            {field.options?.map((option) => (
              <Option key={option} value={option}>
                {option}
              </Option>
            ))}
          </Select>
        </Form.Item>
      );
    }

    if (field.field_type === "textarea") {
      return (
        <Form.Item
          key={key}
          name={key}
          label={key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
          rules={field.required ? [{ required: true, message: "This field is required" }] : []}
        >
          <TextArea
            rows={3}
            placeholder={field.placeholder}
            maxLength={field.max_length}
            onChange={() => {
              hasUnsavedChanges.current = true;
            }}
          />
        </Form.Item>
      );
    }

    if (field.field_type === "file_upload") {
      return (
        <Form.Item
          key={key}
          name={key}
          label={key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
        >
          <Upload
            accept={field.accept}
            maxCount={1}
            beforeUpload={() => false} // Prevent auto upload
          >
            <Button>Upload {key.replace(/_/g, " ")}</Button>
          </Upload>
        </Form.Item>
      );
    }

    // Default text input
    return (
      <Form.Item
        key={key}
        name={key}
        label={key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
        rules={field.required ? [{ required: true, message: "This field is required" }] : []}
      >
          <Input
          placeholder={field.placeholder}
          maxLength={field.max_length}
          onChange={() => {
            hasUnsavedChanges.current = true;
            // Trigger placeholder replacement on metadata change
            setTimeout(() => {
              handleAutoSave();
            }, 1000); // Debounce
          }}
        />
      </Form.Item>
    );
  };

  if (!policyId) {
    // Show template selection
    return (
      <div className="h-full">
        <PolicyTemplateList
          projectId={projectid ? parseInt(projectid) : null}
          onSelectTemplate={(policy) => {
            if (projectid) {
              navigate(`/project/${projectid}/policy-editor/${policy.policy_id}`);
            } else {
              navigate(`/policy-editor/${policy.policy_id}`);
            }
          }}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!policyData) {
    return (
      <div className="p-6">
        <Alert
          message="Policy not found"
          description="The policy you're looking for doesn't exist."
          type="error"
          showIcon
          action={
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          }
        />
      </div>
    );
  }

  const metadata = policyData.policy_data?.metadata || {};
  const mainContent = policyData.policy_data?.content?.main_content || {};

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              icon={<ArrowLeft />}
              onClick={() => navigate(-1)}
            >
              Back
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                {policyData.template_details?.template_name || "Policy Editor"}
              </h1>
              <p className="text-sm text-gray-500">
                Policy ID: {policyData.policy_id}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {lastSaved && (
              <span className="text-xs text-gray-500">
                Last saved: {lastSaved.toLocaleTimeString()}
              </span>
            )}
            <Button
              icon={<CheckCircle />}
              onClick={handleValidate}
            >
              Validate
            </Button>
            <Button
              type="primary"
              icon={<Save />}
              onClick={handleSave}
              loading={isSaving}
            >
              Save
            </Button>
            <Button
              icon={<FileDown />}
              onClick={handleGeneratePDF}
            >
              Generate PDF
            </Button>
            <Button
              icon={<Sparkles />}
              onClick={() => setShowAIPanel(!showAIPanel)}
            >
              AI Assistant
            </Button>
          </div>
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="px-6 py-2 bg-red-50 border-b border-red-200">
          <Alert
            message="Validation Errors"
            description={
              <ul className="list-disc list-inside">
                {validationErrors.map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            }
            type="error"
            showIcon
            closable
            onClose={() => setValidationErrors([])}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Metadata */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto p-3">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Metadata
          </h2>
          <Form form={form} layout="vertical">
            {Object.keys(metadata).map((key) =>
              renderMetadataField(key, metadata[key])
            )}
          </Form>
        </div>

        {/* Center Panel - Rich Text Editor */}
        <div className="flex-1 flex flex-col overflow-hidden p-3">
          <div className="flex-1 overflow-y-auto">
            <RichTextEditor
              content={mainContent.html || ""}
              onChange={handleContentChange}
              placeholder="Start writing your policy content..."
            />
            <div className="mt-3 text-sm text-gray-500">
              Words: {mainContent.word_count || 0} | Characters:{" "}
              {mainContent.char_count || 0}
            </div>
          </div>
        </div>

        {/* Right Panel - AI Assistant */}
        {showAIPanel && (
          <div className="w-96 bg-white border-l border-gray-200 overflow-y-auto p-3">
            <AIPanel
              policyId={policyId}
              policyText={mainContent.plain_text || ""}
              policyType={policyData.template_details?.template_type || "Information Security"}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PolicyEditor;

