import { useState, useEffect, useContext } from "react";
import {
  Modal,
  List,
  Switch,
  Typography,
  message,
  Space,
  Tag,
  Collapse,
  Alert,
  Spin,
} from "antd";
import { DownOutlined } from "@ant-design/icons";
import { OnboardingContext } from "../../../../../../Context/OnboardingContext";

const { Text } = Typography;
const { Panel } = Collapse;

const ManageQuestionsModal = ({
  visible,
  onClose,
  domain,
  projectId,
  maxQuestions,
  currentCount,
  loadAllQuestions,
}) => {
  const [questionBank, setQuestionBank] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const { getQuestionBank, selectQuestion, unselectQuestion } =
    useContext(OnboardingContext);

  useEffect(() => {
    if (visible) {
      loadQuestionBank();
    }
  }, [visible, domain]);

  const loadQuestionBank = async () => {
    try {
      setLoading(true);
      const data = await getQuestionBank(projectId, domain);
      setQuestionBank(data);
    } catch (error) {
      message.error("Failed to load question bank");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (question, checked) => {
    // Check if we're at max capacity when trying to select
    const selectedCount = questionBank.filter((q) => q.selected).length;
    if (checked && maxQuestions && selectedCount >= maxQuestions) {
      message.warning(
        `Maximum ${maxQuestions} questions allowed for this section`
      );
      return;
    }

    try {
      setUpdating(true);

      if (checked) {
        // Select question
        const result = await selectQuestion(projectId, question.id);
        if (result.success) {
          message.success("Question added successfully");
        }
      } else {
        // Unselect question
        if (question.project_question_id) {
          const result = await unselectQuestion(
            projectId,
            question.project_question_id
          );
          if (result.success) {
            message.success("Question removed successfully");
          }
        }
      }

      // Reload question bank and all questions
      await loadQuestionBank();
      await loadAllQuestions();
    } catch (error) {
      if (error.data?.error) {
        message.error(error.data.error);
      } else {
        message.error(
          checked ? "Failed to add question" : "Failed to remove question"
        );
      }
    } finally {
      setUpdating(false);
    }
  };

  const selectedCount = questionBank.filter((q) => q.selected).length;

  return (
    <Modal
      title={`Manage Questions - ${
        domain.charAt(0).toUpperCase() + domain.slice(1)
      }`}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      {maxQuestions && (
        <Alert
          message={`${selectedCount} / ${maxQuestions} questions selected`}
          type={selectedCount >= maxQuestions ? "warning" : "info"}
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Spin spinning={loading || updating}>
        <List
          dataSource={questionBank}
          renderItem={(question) => (
            <List.Item
              key={question.id}
              style={{
                padding: "12px 0",
                borderBottom: "1px solid #f0f0f0",
              }}
            >
              <div style={{ width: "100%" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "start",
                  }}
                >
                  <div style={{ flex: 1, marginRight: 16 }}>
                    <Space
                      direction="vertical"
                      size="small"
                      style={{ width: "100%" }}
                    >
                      <div>
                        <Text strong style={{ marginRight: 8 }}>
                          Q{question.q_no}:
                        </Text>
                        <Text>{question.question}</Text>
                      </div>
                      {question.follow_ups &&
                        question.follow_ups.length > 0 && (
                          <Tag color="blue">
                            {question.follow_ups.length} Follow-up(s)
                          </Tag>
                        )}
                    </Space>
                  </div>
                  <Switch
                    checked={question.selected}
                    onChange={(checked) => handleToggle(question, checked)}
                    disabled={
                      updating ||
                      (!question.selected &&
                        maxQuestions &&
                        selectedCount >= maxQuestions)
                    }
                  />
                </div>

                {/* Show follow-ups */}
                {question.follow_ups && question.follow_ups.length > 0 && (
                  <Collapse
                    ghost
                    style={{ marginTop: 8 }}
                    expandIcon={({ isActive }) => (
                      <DownOutlined rotate={isActive ? 180 : 0} />
                    )}
                  >
                    <Panel
                      header={
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          View follow-up questions
                        </Text>
                      }
                      key="1"
                    >
                      <Space
                        direction="vertical"
                        size="small"
                        style={{ width: "100%", paddingLeft: 16 }}
                      >
                        {question.follow_ups.map((followUp) => (
                          <div key={followUp.id}>
                            <Text
                              strong
                              style={{ marginRight: 8, fontSize: 12 }}
                            >
                              Q{followUp.q_no}:
                            </Text>
                            <Text style={{ fontSize: 12 }}>
                              {followUp.question}
                            </Text>
                          </div>
                        ))}
                      </Space>
                    </Panel>
                  </Collapse>
                )}
              </div>
            </List.Item>
          )}
          style={{ maxHeight: "500px", overflow: "auto" }}
        />
      </Spin>
    </Modal>
  );
};

export default ManageQuestionsModal;
