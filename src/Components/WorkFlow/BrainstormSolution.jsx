import React, { useState } from "react";
import { Collapse, Button, Input, Modal, Select, DatePicker, Form } from "antd";
import { PaperClipOutlined } from "@ant-design/icons";
import { useTheme } from "../../contexts/ThemeContext";

const { Panel } = Collapse;
const { TextArea } = Input;

const BrainstormSolution = () => {
  const { isDarkMode } = useTheme();
  const [fileLists, setFileLists] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  const consultants = ["Consultant A", "Consultant B", "Consultant C"];

  const handleFileChange = (panelKey, { fileList }) => {
    setFileLists((prev) => ({ ...prev, [panelKey]: fileList }));
  };

  const renderLargeInputWithAttachButton = (panelKey, placeholder) => (
    <div className={`relative border rounded-lg overflow-hidden ${isDarkMode ? 'dark-border' : 'border-gray-300'}`}>
      <TextArea
        rows={4}
        placeholder={placeholder}
        className={`border-none resize-none p-4 pr-[100px] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'dark-text-primary dark-bg-card' : 'text-gray-800'}`}
      />
      <div className="absolute bottom-3 right-4">
        <Button
          className={`rounded-full px-4 py-1 text-sm font-semibold shadow-sm focus:outline-none ${
            isDarkMode 
              ? 'dark-bg-tertiary dark-text-secondary hover:dark-bg-hover' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <PaperClipOutlined className="mr-2" />
          Attach Files
        </Button>
      </div>
    </div>
  );

  return (
    <div className={`relative p-6 rounded-md ${isDarkMode ? 'dark-bg-card' : 'bg-white'}`}>
      <h2 className="text-xl font-bold mb-4">Schedule Meeting</h2>
      <Button
        type="primary"
        onClick={() => console.log("Meeting Scheduled")}
        className="mb-4"
      >
        Schedule Meeting
      </Button>

      <h2 className="text-xl font-bold mb-4">Future Steps</h2>
      <Collapse className="mb-4">
        <Panel header="Enter details for future steps" key="3">
          {renderLargeInputWithAttachButton("futureSteps", "Enter details for future steps")}
        </Panel>
      </Collapse>

      <h2 className="text-xl font-bold mb-4">Project Plan</h2>
      <Collapse className="mb-4">
        <Panel header="Enter details for the project plan" key="4">
          {renderLargeInputWithAttachButton("projectPlan", "Enter details for the project plan")}
        </Panel>
      </Collapse>

      {/* Assign Task Modal */}
      <Modal
        title="Assign Task"
        visible={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form layout="vertical">
          <Form.Item label="Team Members">
            <Select
              mode="multiple"
              placeholder="Select team members"
              options={consultants.map((consultant) => ({ value: consultant, label: consultant }))}
            />
          </Form.Item>
          <Form.Item label="Team Deadline">
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="Task Description">
            <Input.TextArea rows={3} placeholder="Enter task description" />
          </Form.Item>
          <Form.Item label="Task References">
            <Input placeholder="Add reference URLs" />
          </Form.Item>
          <div className="text-center">
            <Button type="primary" onClick={() => setIsModalOpen(false)}>
              Assign
            </Button>
          </div>
        </Form>
      </Modal>

      
      <div className="absolute bottom--8 right-4">
        <Button type="default" onClick={() => setIsModalOpen(true)}>
          Assign Task
        </Button>
      </div>
    </div>
  );
};

export default BrainstormSolution;
