import { useState, useEffect, useContext } from "react";
import { Modal, Form, Select, Switch, message, Typography } from "antd";
import { OnboardingContext } from "../../../../../../Context/OnboardingContext";

const { Text } = Typography;

const EditQuestionModal = ({
  visible,
  onClose,
  question,
  projectId,
  loadAllQuestions,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { updateQuestionMetadata } = useContext(OnboardingContext);

  useEffect(() => {
    if (visible && question) {
      form.setFieldsValue({
        priority: question.priority,
        response_mandatory: question.response_mandatory,
        evidence_required: question.evidence_required,
      });
    }
  }, [visible, question, form]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      const result = await updateQuestionMetadata(
        projectId,
        question.id,
        values
      );

      if (result.success) {
        message.success("Question metadata updated successfully");
        await loadAllQuestions();
        onClose();
      } else {
        message.error("Failed to update question metadata");
      }
    } catch (error) {
      if (error.data?.error) {
        message.error(error.data.error);
      } else {
        message.error("Failed to update question metadata");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Edit Question Metadata"
      open={visible}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={loading}
      okText="Save"
      width={500}
    >
      <div style={{ marginBottom: 16 }}>
        <Text strong>Question:</Text>
        <div style={{ marginTop: 4 }}>
          <Text type="secondary">Q{question?.q_no}: </Text>
          <Text>{question?.question}</Text>
        </div>
      </div>

      <Form form={form} layout="vertical">
        <Form.Item
          name="priority"
          label="Priority"
          rules={[{ required: true, message: "Please select priority" }]}
        >
          <Select>
            <Select.Option value="low">Low</Select.Option>
            <Select.Option value="medium">Medium</Select.Option>
            <Select.Option value="high">High</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="response_mandatory"
          label="Response Mandatory"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          name="evidence_required"
          label="Evidence Required"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
      </Form>

      {question?.follow_ups && question.follow_ups.length > 0 && (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            background: "#f0f2f5",
            borderRadius: 4,
          }}
        >
          <Text type="secondary" style={{ fontSize: 12 }}>
            Note: Changes will also apply to {question.follow_ups.length}{" "}
            follow-up question(s)
          </Text>
        </div>
      )}
    </Modal>
  );
};

export default EditQuestionModal;
