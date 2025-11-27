import { useEffect, useState } from "react";
import { Card, Typography, Button, Table, Space, Empty, Tag } from "antd";
import {
  SettingOutlined,
  EditOutlined,
  DownOutlined,
  UpOutlined,
} from "@ant-design/icons";
import EditQuestionModal from "./EditQuestionModal";
import ManageQuestionsModal from "./ManageQuestionsModal";

const { Title, Text } = Typography;

const QuestionSection = ({
  title,
  domain,
  questions,
  projectId,
  canEdit,
  onboardingStatus,
  loadAllQuestions,
  maxQuestions,
  isPlaceholder = false,
}) => {
  const [manageModalVisible, setManageModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [collapsed, setCollapsed] = useState(true);

  const isReadOnly = onboardingStatus === "completed";

  // useEffect(()=>{
  //   if(domain === "organization"){
  //     setCollapsed(false)
  //   }
  // },[])

  const handleEdit = (question) => {
    setSelectedQuestion(question);
    setEditModalVisible(true);
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: "red",
      medium: "orange",
      low: "green",
    };
    return colors[priority] || "default";
  };

  const columns = [
    {
      title: "Q No.",
      dataIndex: "q_no",
      key: "q_no",
      width: 80,
      render: (text) => <Text strong>Q{text}</Text>,
    },
    {
      title: "Question",
      dataIndex: "question",
      key: "question",
      ellipsis: true,
      render: (text) => <Text>{text}</Text>,
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      width: 100,
      align: "center",
      render: (priority) => (
        <Tag color={getPriorityColor(priority)}>{priority?.toUpperCase()}</Tag>
      ),
    },
    {
      title: "Response Mandatory",
      dataIndex: "response_mandatory",
      key: "response_mandatory",
      width: 150,
      align: "center",
      render: (value) => (
        <Text style={{ color: value ? "#cf1322" : "#1890ff" }}>
          {value ? "Yes" : "No"}
        </Text>
      ),
    },
    {
      title: "Evidence Required",
      dataIndex: "evidence_required",
      key: "evidence_required",
      width: 150,
      align: "center",
      render: (value) => (
        <Text style={{ color: value ? "#cf1322" : "#1890ff" }}>
          {value ? "Yes" : "No"}
        </Text>
      ),
    },
    {
      title: "Selected By",
      dataIndex: "created_by_details",
      key: "selected_by",
      width: 120,
      align: "center",
      render: (createdBy) => <Text>{createdBy?.name || "AI"}</Text>,
    },
  ];

  // Add action column only if not read-only
  if (canEdit && !isReadOnly) {
    columns.push({
      title: "Action",
      key: "action",
      width: 80,
      align: "center",
      render: (_, record) => (
        <Button
          type="text"
          icon={<EditOutlined />}
          onClick={() => handleEdit(record)}
        />
      ),
    });
  }

  // Expandable row configuration for follow-up questions
  const expandable = {
    expandedRowRender: (record) => {
      if (!record.follow_ups || record.follow_ups.length === 0) {
        return null;
      }

      const followUpColumns = [
        {
          title: "Q No.",
          dataIndex: "q_no",
          key: "q_no",
          width: 80,
          render: (text) => (
            <Text strong style={{ fontSize: 12 }}>
              Q{text}
            </Text>
          ),
        },
        {
          title: "Question",
          dataIndex: "question",
          key: "question",
          ellipsis: true,
          render: (text) => <Text style={{ fontSize: 12 }}>{text}</Text>,
        },
        {
          title: "Priority",
          dataIndex: "priority",
          key: "priority",
          width: 100,
          align: "center",
          render: (priority) => (
            <Tag color={getPriorityColor(priority)} style={{ fontSize: 11 }}>
              {priority?.toUpperCase()}
            </Tag>
          ),
        },
        {
          title: "Response Mandatory",
          dataIndex: "response_mandatory",
          key: "response_mandatory",
          width: 150,
          align: "center",
          render: (value) => (
            <Text
              style={{ color: value ? "#cf1322" : "#1890ff", fontSize: 12 }}
            >
              {value ? "Yes" : "No"}
            </Text>
          ),
        },
        {
          title: "Evidence Required",
          dataIndex: "evidence_required",
          key: "evidence_required",
          width: 150,
          align: "center",
          render: (value) => (
            <Text
              style={{ color: value ? "#cf1322" : "#1890ff", fontSize: 12 }}
            >
              {value ? "Yes" : "No"}
            </Text>
          ),
        },
        {
          title: "Selected By",
          dataIndex: "created_by_details",
          key: "selected_by",
          width: 120,
          align: "center",
          render: (createdBy) => (
            <Text style={{ fontSize: 12 }}>{createdBy?.name || "AI"}</Text>
          ),
        },
      ];

      return (
        <div style={{ padding: "0 48px", backgroundColor: "#fafafa" }}>
          <Text
            type="secondary"
            style={{ fontSize: 12, marginBottom: 8, display: "block" }}
          >
            Follow-up Questions:
          </Text>
          <Table
            columns={followUpColumns}
            dataSource={record.follow_ups}
            pagination={false}
            size="small"
            rowKey="id"
            showHeader={false}
          />
        </div>
      );
    },
    rowExpandable: (record) =>
      record.follow_ups && record.follow_ups.length > 0,
    expandIcon: ({ expanded, onExpand, record }) => {
      if (!record.follow_ups || record.follow_ups.length === 0) {
        return null;
      }
      return (
        <DownOutlined
          rotate={expanded ? 180 : 0}
          onClick={(e) => onExpand(record, e)}
          style={{ cursor: "pointer", color: "#1890ff" }}
        />
      );
    },
  };

  if (isPlaceholder) {
    return (
      <Card>
        <Title level={5}>{title}</Title>
        <Empty
          description="This section will be implemented soon"
          style={{ padding: "40px 0" }}
        />
      </Card>
    );
  }

  return (
    <Card>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: collapsed ? 0 : 16,
        }}
      >
        <div>
          <Title level={5} style={{ margin: 0 }}>
            {title}
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {questions.length} {maxQuestions ? `/ ${maxQuestions}` : ""}{" "}
            questions
          </Text>
        </div>
        <Space>
          {canEdit && !isReadOnly && (
            <Button
              icon={<SettingOutlined />}
              onClick={() => setManageModalVisible(true)}
            >
              Manage Questions
            </Button>
          )}
          <Button
            type="text"
            icon={collapsed ? <DownOutlined /> : <UpOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />
        </Space>
      </div>

      {!collapsed && (
        <>
          {questions.length === 0 ? (
            <Empty description="No questions selected" />
          ) : (
            <Table
              columns={columns}
              dataSource={questions}
              pagination={false}
              size="middle"
              rowKey="id"
              expandable={expandable}
              scroll={{ x: 1000 }}
            />
          )}
        </>
      )}

      <ManageQuestionsModal
        visible={manageModalVisible}
        onClose={() => setManageModalVisible(false)}
        domain={domain}
        projectId={projectId}
        maxQuestions={maxQuestions}
        currentCount={questions.length}
        loadAllQuestions={loadAllQuestions}
      />

      <EditQuestionModal
        visible={editModalVisible}
        onClose={() => {
          setEditModalVisible(false);
          setSelectedQuestion(null);
        }}
        question={selectedQuestion}
        projectId={projectId}
        loadAllQuestions={loadAllQuestions}
      />
    </Card>
  );
};

export default QuestionSection;
