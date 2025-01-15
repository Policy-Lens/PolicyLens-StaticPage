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
  const [collapsed, setCollapsed] = useState(false);

  const renderListView = () => (
    <List
      bordered
      itemLayout="horizontal"
      dataSource={tasks}
      renderItem={(item) => (
        <List.Item className="bg-white mb-2 rounded-lg shadow-md p-5">
          <Space size="large" className="flex items-center">
            <CheckCircleOutlined className="text-2xl text-green-500" />
            <div>
              <Text className="text-lg font-medium">{item.name}</Text>
              {item.preview && (
                <div className="text-sm text-gray-500 mt-1">{item.preview}</div>
              )}
              <div className="text-sm text-gray-500 mt-1">
                <b>User:</b> {item.user} | <b>Role:</b> {item.role} |{" "}
                <b>Timestamp:</b> {item.timestamp}
              </div>
            </div>
          </Space>
          <Tag className="text-sm px-3 py-1 rounded-full bg-green-100 text-green-600">
            Completed
          </Tag>
        </List.Item>
      )}
    />
  );

  const renderJsonView = () => (
    <div className="flex justify-center items-center min-h-[60vh]">
      <pre className="bg-gray-100 p-5 rounded-lg shadow-md text-left max-w-[80%] overflow-x-auto">
        {JSON.stringify(tasks, null, 2)}
      </pre>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <SideNav collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Content */}
      <div
        className={`flex-1 p-6 bg-gray-100 transition-all duration-300 ${collapsed ? "ml-16" : "ml-60"
          }`}
      >
        <h1 className="text-2xl font-bold text-center mb-8">
          Preview of Completed Tasks
        </h1>
        <div className="text-center mb-5">
          <Button
            type={view === "list" ? "primary" : "default"}
            onClick={() => setView("list")}
            className="mr-2"
          >
            List View
          </Button>
          <Button
            type={view === "json" ? "primary" : "default"}
            onClick={() => setView("json")}
          >
            JSON View
          </Button>
        </div>
        {view === "list" && renderListView()}
        {view === "json" && renderJsonView()}
        {view === "" && (
          <p className="text-center">
            Please select a view to display the tasks.
          </p>
        )}
      </div>
    </div>
  );
};

export default PreviewPage;
