import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Table, Tag, Button, Typography, message, Flex, Card } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { ScopingContext } from "../../../Context/ScopingContext";
import { getStatusConfig } from "../../../utils/statusConfig.jsx";

const { Title } = Typography;

const WorkflowOverview = () => {
  const { projectid } = useParams();
  const navigate = useNavigate();
  const { getWorkflowOverview, isLoading } = useContext(ScopingContext);

  const [workflowData, setWorkflowData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [projectName, setProjectName] = useState("");

  // Fetch workflow overview
  const fetchWorkflowOverview = async () => {
    if (!projectid) return;

    try {
      setLoading(true);
      const response = await getWorkflowOverview(projectid);

      if (response) {
        setProjectName(response.project_name || "");
        setWorkflowData(response.workflow_steps || []);
      } else {
        message.error("Failed to load workflow overview");
      }
    } catch (error) {
      console.error("Error fetching workflow overview:", error);
      if (error.status === 403) {
        message.error("You do not have permission to view this workflow");
      } else {
        message.error("Error loading workflow overview");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflowOverview();
  }, [projectid]);

  // Handle view step
  const handleViewStep = (step) => {
    if (!step.view_allowed) {
      message.warning("You do not have permission to view this step");
      return;
    }

    // Navigate to the specific workflow step
    // Using current_phase from the step data
    const phase = step.step.toLowerCase().replace(/\s+/g, "-");
    navigate(`/project/${projectid}/workflow/${phase}`);
  };

  // Table columns configuration
  const columns = [
    {
      title: "Step",
      dataIndex: "step",
      key: "step",
      width: 200,
      render: (step) => <strong>{step}</strong>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 180,
      render: (status) => {
        const config = getStatusConfig(status);
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: "Assigned To",
      dataIndex: "assigned_to",
      key: "assigned_to",
      width: 150,
      render: (assignedTo) =>
        assignedTo || <span style={{ color: "#999" }}>N/A</span>,
    },
    {
      title: "Reviewer",
      dataIndex: "reviewer",
      key: "reviewer",
      width: 150,
      render: (reviewer) =>
        reviewer || <span style={{ color: "#999" }}>Not assigned</span>,
    },
    {
      title: "Action",
      key: "action",
      width: 120,
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          disabled={!record.view_allowed}
          onClick={() => handleViewStep(record)}
        >
          {record.view_allowed ? "View" : "Locked"}
        </Button>
      ),
    },
  ];

  return (
    <Card style={{ height: "100%" }}>
      <Flex justify="space-between" align="center" style={{ marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>
            Workflow Overview
          </Title>
          {projectName && (
            <div style={{ color: "#666", marginTop: 4 }}>{projectName}</div>
          )}
        </div>
        <Button onClick={fetchWorkflowOverview} loading={loading || isLoading}>
          Refresh
        </Button>
      </Flex>

      <Table
        columns={columns}
        dataSource={workflowData}
        loading={loading || isLoading}
        rowKey={(record) => record.step}
        pagination={false}
        scroll={{ y: "calc(100vh - 280px)" }}
        size="middle"
        onRow={(record) => ({
          style: {
            cursor: record.view_allowed ? "pointer" : "not-allowed",
            opacity: record.view_allowed ? 1 : 0.6,
          },
          onClick: () => record.view_allowed && handleViewStep(record),
        })}
      />
    </Card>
  );
};

export default WorkflowOverview;
