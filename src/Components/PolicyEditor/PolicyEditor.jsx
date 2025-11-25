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
import { getDefaultBranding, createBrandedPDFHTML } from "../../utils/branding";
import RichTextEditor from "./RichTextEditor";
import AIPanel from "./AIPanel";
import PolicyTemplateList from "./PolicyTemplateList";
import PDFPreviewModal from "./PDFPreviewModal";

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
  const [companyBranding, setCompanyBranding] = useState(null);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const autoSaveIntervalRef = useRef(null);
  const hasUnsavedChanges = useRef(false);
  const originalContentRef = useRef(null); // Store original template content
  const contentManuallyEditedRef = useRef(false); // Track if content has been manually edited
  const lastMetadataHashRef = useRef(""); // Track metadata state to detect changes

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
      // Reset manual edit flag when loading a new policy
      contentManuallyEditedRef.current = false;
      // Check if current content differs from original (indicating manual edits)
      const currentHtml = policyData.policy_data.content.main_content.html || "";
      const originalHtml = originalContentRef.current.html || "";
      if (currentHtml !== originalHtml) {
        contentManuallyEditedRef.current = true;
      }
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

    // Create hash of metadata values to detect changes
    const metadataHash = JSON.stringify(metadataValues);
    
    // Skip if metadata hasn't changed
    if (metadataHash === lastMetadataHashRef.current) {
      return;
    }
    lastMetadataHashRef.current = metadataHash;

    // Replace placeholders in content
    if (Object.keys(metadataValues).length > 0) {
      // If content has been manually edited, replace placeholders in the current content
      // Otherwise, use original template content
      let html, plainText;
      
      if (contentManuallyEditedRef.current) {
        // Use current content and replace placeholders in it (preserve user edits)
        html = policyData.policy_data?.content?.main_content?.html || "";
        plainText = policyData.policy_data?.content?.main_content?.plain_text || "";
      } else {
        // Use original template content for placeholder replacement
        html = originalContentRef.current.html || "";
        plainText = originalContentRef.current.plain_text || "";
      }

      // Replace placeholders
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
  }, [formValues, policyData]); // Include policyData to access current content

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
        // Fetch branding data if company exists
        if (response.data.company) {
          fetchCompanyBranding(response.data.policy_id);
        } else {
          // Use default branding if no company
          setCompanyBranding(getDefaultBranding());
        }
      }
    } catch (error) {
      console.error("Error fetching policy:", error);
      message.error("Failed to load policy");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCompanyBranding = async (policyId) => {
    try {
      const response = await apiRequest(
        "GET",
        `/api/plc_workflow/policies/${policyId}/branding/`,
        null,
        true
      );

      if (response.data) {
        setCompanyBranding(response.data);
      } else {
        setCompanyBranding(getDefaultBranding());
      }
    } catch (error) {
      console.error("Error fetching company branding:", error);
      // Use default branding on error
      setCompanyBranding(getDefaultBranding());
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
      const updatedPolicyData = JSON.parse(JSON.stringify(policyData.policy_data));

      // Update metadata values
      Object.keys(formValues).forEach((key) => {
        if (updatedPolicyData.metadata[key]) {
          updatedPolicyData.metadata[key].value = formValues[key] || "";
        }
      });

      // Get current content (preserve user edits)
      const mainContent = updatedPolicyData.content?.main_content;
      if (mainContent) {
        // Use the current content as-is (already has user edits and placeholder replacements from useEffect)
        // Only update word/char counts if needed
        const plainText = mainContent.plain_text || "";
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
      const updatedPolicyData = JSON.parse(JSON.stringify(policyData.policy_data));

      // Update metadata values
      Object.keys(formValues).forEach((key) => {
        if (updatedPolicyData.metadata[key]) {
          updatedPolicyData.metadata[key].value = formValues[key] || "";
        }
      });

      // Get current content (preserve user edits)
      const mainContent = updatedPolicyData.content?.main_content;
      if (mainContent) {
        // Use the current content as-is (already has user edits and placeholder replacements from useEffect)
        // Only update word/char counts if needed
        const plainText = mainContent.plain_text || "";
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

    // Mark content as manually edited
    contentManuallyEditedRef.current = true;

    const updatedPolicyData = { ...policyData.policy_data };
    updatedPolicyData.content.main_content.html = html;
    updatedPolicyData.content.main_content.plain_text = text;
    updatedPolicyData.content.main_content.word_count = text.split(/\s+/).length;
    updatedPolicyData.content.main_content.char_count = text.length;

    setPolicyData({ ...policyData, policy_data: updatedPolicyData });
    hasUnsavedChanges.current = true;
  }, [policyData]);

  const handleGeneratePDF = () => {
    if (!policyData) {
      message.warning("No policy data available");
      return;
    }

    // Ensure we have branding (use default if not loaded yet)
    if (!companyBranding) {
      setCompanyBranding(getDefaultBranding());
    }

    // Show preview modal
    setShowPDFPreview(true);
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

      {/* PDF Preview Modal */}
      <PDFPreviewModal
        visible={showPDFPreview}
        onClose={() => setShowPDFPreview(false)}
        policyData={policyData}
        companyBranding={companyBranding || getDefaultBranding()}
        onDownload={() => {
          setShowPDFPreview(false);
          message.success("PDF downloaded successfully!");
        }}
      />
    </div>
  );
};

export default PolicyEditor;

