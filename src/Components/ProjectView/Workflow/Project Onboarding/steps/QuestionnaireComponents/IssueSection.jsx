import { useState } from "react";
import { Card, Typography, Button, Table, Space, Empty } from "antd";
import { SettingOutlined, DownOutlined, UpOutlined } from "@ant-design/icons";
import ManageIssuesModal from "./ManageIssuesModal";

const { Title, Text } = Typography;

const IssueSection = ({
  title,
  category,
  issues,
  projectId,
  canEdit,
  onboardingStatus,
  loadAllIssues,
  maxIssues,
}) => {
  const [manageModalVisible, setManageModalVisible] = useState(false);
  const [collapsed, setCollapsed] = useState(true);

  const isReadOnly = onboardingStatus === "completed";

  const columns = [
    {
      title: "Issue",
      dataIndex: "text",
      key: "text",
      ellipsis: true,
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (text) => <Text type="secondary">{text}</Text>,
    },
    {
      title: "Selected By",
      dataIndex: "created_by_name",
      key: "created_by",
      width: 120,
      align: "center",
      render: (name) => <Text>{name || "AI"}</Text>,
    },
  ];

  return (
    <Card size="small" style={{ marginBottom: 16 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: collapsed ? 0 : 12,
        }}
      >
        <div>
          <Title level={5} style={{ margin: 0, fontSize: 14 }}>
            {title}
          </Title>
          <Text type="secondary" style={{ fontSize: 11 }}>
            {issues.length} {maxIssues ? `/ ${maxIssues}` : ""} issues
          </Text>
        </div>
        <Space>
          {canEdit && !isReadOnly && (
            <Button
              size="small"
              icon={<SettingOutlined />}
              onClick={() => setManageModalVisible(true)}
            >
              Manage
            </Button>
          )}
          <Button
            type="text"
            size="small"
            icon={collapsed ? <DownOutlined /> : <UpOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />
        </Space>
      </div>

      {!collapsed && (
        <>
          {issues.length === 0 ? (
            <Empty
              description="No issues selected"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <Table
              columns={columns}
              dataSource={issues}
              pagination={false}
              size="small"
              rowKey="id"
              scroll={{ x: 600 }}
            />
          )}
        </>
      )}

      <ManageIssuesModal
        visible={manageModalVisible}
        onClose={() => setManageModalVisible(false)}
        category={category}
        projectId={projectId}
        maxIssues={maxIssues}
        currentCount={issues.length}
        loadAllIssues={loadAllIssues}
      />
    </Card>
  );
};

export default IssueSection;
