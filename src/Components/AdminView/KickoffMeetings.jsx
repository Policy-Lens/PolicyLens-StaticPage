import React, { useState } from "react";
import {
  HomeOutlined,
  FileTextOutlined,
  SettingOutlined,
  MessageOutlined,
  ProjectOutlined,
  TeamOutlined,
  BankOutlined,
} from "@ant-design/icons";
import {
  Menu,
  Input,
  Button,
  Collapse,
  Modal,
  Form,
  DatePicker,
  TimePicker,
} from "antd";

const { TextArea } = Input;
const { Panel } = Collapse;

const KickoffMeetings = () => {
  const [isMeetingModalVisible, setIsMeetingModalVisible] = useState(false);
  const [form] = Form.useForm();

  const topMenuItems = [
    { key: "dashboard", label: "Dashboard", icon: <HomeOutlined /> },
    { key: "projects", label: "Projects", icon: <ProjectOutlined /> },
    { key: "company", label: "Company", icon: <BankOutlined /> },
    { key: "consultants", label: "Consultant Team", icon: <TeamOutlined /> },
    { key: "documents", label: "Documents", icon: <FileTextOutlined /> },
    { key: "messages", label: "Messages", icon: <MessageOutlined /> },
    { key: "settings", label: "Settings", icon: <SettingOutlined /> },
  ];

  const leftSidebarItems = [
    { key: "lead", label: "Lead Generation" },
    { key: "inquiry", label: "Inquiry" },
    { key: "finalize", label: "Finalize Contract" },
    { key: "kickoff", label: "Kickoff Meetings" },
  ];

  const handleMeetingSchedule = () => {
    setIsMeetingModalVisible(true);
  };

  const closeMeetingModal = () => {
    setIsMeetingModalVisible(false);
    form.resetFields();
  };

  const handleFormSubmit = (values) => {
    console.log("Meeting Details:", values);
    closeMeetingModal(); // Close the modal after submission
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Sidebar */}
      <div className="w-48 bg-gray-800 text-white p-4">
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={["kickoff"]}
          items={leftSidebarItems.map(({ key, label }) => ({
            key,
            label,
          }))}
        />
      </div>

      {/* Main Content */}
      <div className="flex-grow flex flex-col shadow-lg">
        {/* Top Navbar */}
        <div className="bg-white border-b border-gray-200">
          <Menu
            mode="horizontal"
            className="flex justify-between px-4"
            style={{
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            }}
            items={topMenuItems.map(({ key, label, icon }) => ({
              key,
              label: (
                <div
                  className="px-3 py-1.5 rounded-md transition duration-300 cursor-pointer hover:bg-blue-500 hover:text-white"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: "100px",
                  }}
                >
                  {icon && <span className="mr-2">{icon}</span>}
                  <span>{label}</span>
                </div>
              ),
            }))}
          />
        </div>

        {/* Content Section */}
        <div className="p-8 bg-gray-50 flex-grow">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Kickoff Meetings
          </h1>
          <Button
            type="primary"
            onClick={handleMeetingSchedule}
            className="mt-4"
          >
            Schedule a Meeting
          </Button>

          <Collapse accordion className="space-y-4 mt-6">
            <Panel header="Discuss Project Plan" key="1">
              <TextArea
                rows={4}
                placeholder="Add notes for project plan discussion"
                className="mb-4"
              />
            </Panel>
            <Panel header="Discuss Next Steps" key="2">
              <TextArea
                rows={4}
                placeholder="Add notes for next steps discussion"
                className="mb-4"
              />
            </Panel>
          </Collapse>
        </div>
      </div>

      {/* Meeting Details Modal */}
      <Modal
        title="Schedule a Meeting"
        visible={isMeetingModalVisible}
        onCancel={closeMeetingModal}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
          initialValues={{ date: null, time: null }}
        >
          <Form.Item
            name="title"
            label="Meeting Title"
            rules={[
              { required: true, message: "Please enter a meeting title!" },
            ]}
          >
            <Input placeholder="Enter meeting title" />
          </Form.Item>
          <Form.Item
            name="date"
            label="Date"
            rules={[{ required: true, message: "Please select a date!" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="time"
            label="Time"
            rules={[{ required: true, message: "Please select a time!" }]}
          >
            <TimePicker style={{ width: "100%" }} use12Hours format="h:mm A" />
          </Form.Item>
          <Form.Item
            name="participants"
            label="Participants"
            rules={[
              {
                required: true,
                message: "Please enter participants' names!",
              },
            ]}
          >
            <Input placeholder="Enter participants (e.g., John, Mary)" />
          </Form.Item>
          <Form.Item
            name="agenda"
            label="Agenda"
            rules={[{ required: true, message: "Please enter an agenda!" }]}
          >
            <TextArea rows={4} placeholder="Enter meeting agenda" />
          </Form.Item>
          <div className="flex justify-end">
            <Button onClick={closeMeetingModal} className="mr-2">
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default KickoffMeetings;
