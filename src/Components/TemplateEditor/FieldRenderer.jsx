import React from "react";
import { Form, Input, Select, DatePicker } from "antd";

const { TextArea } = Input;
const { Option } = Select;

const FieldRenderer = ({ field, form, name }) => {
  if (!field || !name) return null;

  const fieldType = field.type || "text";
  const validation = field.validation || {};
  const options = field.options || [];

  // Build validation rules
  const rules = [];
  if (validation.required) {
    rules.push({ required: true, message: `${field.name || "Field"} is required` });
  }
  if (validation.format === "email") {
    rules.push({ type: "email", message: "Please enter a valid email" });
  }
  if (validation.format === "url") {
    rules.push({ type: "url", message: "Please enter a valid URL" });
  }
  if (validation.min !== undefined || validation.max !== undefined) {
    rules.push({
      type: "number",
      min: validation.min,
      max: validation.max,
      message: `Value must be between ${validation.min} and ${validation.max}`,
    });
  }

  // Render based on field type
  const renderInput = () => {
    switch (fieldType) {
      case "dropdown":
      case "select":
        return (
          <Select
            placeholder={field.placeholder || `Select ${field.name || "option"}`}
            allowClear
          >
            {options.map((option, index) => (
              <Option key={index} value={option}>
                {option}
              </Option>
            ))}
            {!options.length && (
              <Option value="Option 1">Option 1</Option>
            )}
          </Select>
        );

      case "multiselect":
        return (
          <Select
            mode="multiple"
            placeholder={field.placeholder || `Select ${field.name || "options"}`}
            allowClear
          >
            {options.map((option, index) => (
              <Option key={index} value={option}>
                {option}
              </Option>
            ))}
            {!options.length && (
              <>
                <Option value="Option 1">Option 1</Option>
                <Option value="Option 2">Option 2</Option>
              </>
            )}
          </Select>
        );

      case "calculated":
        return (
          <Input
            readOnly
            placeholder={field.placeholder || "Auto-calculated field"}
            disabled
          />
        );

      case "date":
        return <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />;

      case "number":
        return (
          <Input
            type="number"
            placeholder={field.placeholder || `Enter ${field.name || "number"}`}
          />
        );

      case "textarea":
        return (
          <TextArea
            rows={4}
            placeholder={field.placeholder || `Enter ${field.name || "text"}`}
          />
        );

      case "text":
      default:
        return (
          <Input
            placeholder={field.placeholder || `Enter ${field.name || "text"}`}
          />
        );
    }
  };

  // For calculated fields, compute value if source is provided
  if (fieldType === "calculated" && field.source) {
    // This is a simplified version - in production, you'd compute based on source
    const computedValue = form.getFieldValue(field.source) || "";
    form.setFieldsValue({ [name]: computedValue });
  }

  return (
    <Form.Item
      name={name}
      label={field.name || field.placeholder || "Field"}
      rules={rules}
      tooltip={field.comment || null}
    >
      {renderInput()}
    </Form.Item>
  );
};

export default FieldRenderer;

