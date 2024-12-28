import React, { useState } from "react";
import { List, Tag, Typography, Space, Button } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
import SideNav from "../WorkFlow/SideNav"; 

const { Text } = Typography;

const PreviewPage = () => {
  const tasks = [
    {
      name: "Service Requirements Completed",
      user: "User1",
      role: "Consultant",
      timestamp: "2024-12-19T10:00:00Z",
    },
    {
      name: "Inquiry Completed",
      user: "User2",
      role: "Company Representative",
      timestamp: "2024-12-19T11:00:00Z",
    },
    {
      name: "Contract Finalized",
      preview: "FinalContract.pdf Uploaded",
      user: "User3",
      role: "Auditor",
      timestamp: "2024-12-19T12:00:00Z",
    },
    {
      name: "Gap Analysis Plan Created",
      user: "User1",
      role: "Consultant",
      timestamp: "2024-12-19T13:00:00Z",
    },
    {
      name: "Stakeholder Interviews Conducted",
      user: "User2",
      role: "Company Representative",
      timestamp: "2024-12-19T14:00:00Z",
    },
    {
      name: "Data Analysis Completed",
      user: "User3",
      role: "Auditor",
      timestamp: "2024-12-19T15:00:00Z",
    },
    {
      name: "Report Presentation Delivered",
      preview: "PresentationReport.ppt Uploaded",
      user: "User1",
      role: "Consultant",
      timestamp: "2024-12-19T16:00:00Z",
    },
    {
      name: "Solution Brainstormed",
      user: "User2",
      role: "Company Representative",
      timestamp: "2024-12-19T17:00:00Z",
    },
    {
      name: "Project Planning Finalized",
      user: "User3",
      role: "Auditor",
      timestamp: "2024-12-19T18:00:00Z",
    },
    {
      name: "Policy Discussion Held",
      preview: "PolicyMeeting.pdf Uploaded",
      user: "User1",
      role: "Consultant",
      timestamp: "2024-12-19T19:00:00Z",
    },
    {
      name: "Policies Finalized",
      user: "User2",
      role: "Company Representative",
      timestamp: "2024-12-19T20:00:00Z",
    },
    {
      name: "Policy Implementation Discussed",
      user: "User3",
      role: "Auditor",
      timestamp: "2024-12-19T21:00:00Z",
    },
    {
      name: "Implemented Policies Reviewed",
      user: "User1",
      role: "Consultant",
      timestamp: "2024-12-19T22:00:00Z",
    },
    {
      name: "Feedback Provided",
      user: "User2",
      role: "Company Representative",
      timestamp: "2024-12-19T23:00:00Z",
    },
    {
      name: "Meeting Scheduled",
      preview: "Conducted on 2024-12-20 at 10:00 AM",
      user: "User3",
      role: "Auditor",
      timestamp: "2024-12-20T00:00:00Z",
    },
    {
      name: "Queries Resolved",
      user: "User1",
      role: "Consultant",
      timestamp: "2024-12-20T01:00:00Z",
    },
  ];

  const [view, setView] = useState("");

  const renderListView = () => (
    <List
      bordered
      itemLayout="horizontal"
      dataSource={tasks}
      renderItem={(item) => (
        <List.Item
          style={{
            background: "#FFFFFF",
            marginBottom: "8px",
            borderRadius: "10px",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            padding: "20px",
          }}
        >
          <Space size="large" style={{ display: "flex", alignItems: "center" }}>
            <CheckCircleOutlined
              style={{ fontSize: "24px", color: "#52c41a" }}
            />
            <div>
              <Text style={{ fontSize: "16px", fontWeight: "500" }}>
                {item.name}
              </Text>
              {item.preview && (
                <div
                  style={{ fontSize: "14px", color: "gray", marginTop: "4px" }}
                >
                  {item.preview}
                </div>
              )}
              <div
                style={{ fontSize: "14px", color: "gray", marginTop: "4px" }}
              >
                <b>User:</b> {item.user} | <b>Role:</b> {item.role} |{" "}
                <b>Timestamp:</b> {item.timestamp}
              </div>
            </div>
          </Space>
          <Tag
            color="success"
            style={{
              fontSize: "14px",
              padding: "5px 10px",
              borderRadius: "20px",
            }}
          >
            Completed
          </Tag>
        </List.Item>
      )}
    />
  );

  const renderJsonView = () => (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "60vh",
      }}
    >
      <pre
        style={{
          backgroundColor: "#f5f5f5",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          textAlign: "left",
          maxWidth: "80%",
          overflowX: "auto",
        }}
      >
        {JSON.stringify(tasks, null, 2)}
      </pre>
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <SideNav />

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          padding: "24px",
          backgroundColor: "#F5F5F5",
        }}
      >
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: "30px",
          }}
        >
          Preview of Completed Tasks
        </h1>
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <Button
            type={view === "list" ? "primary" : "default"}
            onClick={() => setView("list")}
          >
            List View
          </Button>
          <Button
            type={view === "json" ? "primary" : "default"}
            style={{ marginLeft: "10px" }}
            onClick={() => setView("json")}
          >
            JSON View
          </Button>
        </div>
        {view === "list" && renderListView()}
        {view === "json" && renderJsonView()}
        {view === "" && (
          <p style={{ textAlign: "center" }}>
            Please select a view to display the tasks.
          </p>
        )}
      </div>
    </div>
  );
};

export default PreviewPage;
