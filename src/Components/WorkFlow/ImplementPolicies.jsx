import React, { useState } from "react";
import { Button, Collapse, Modal, Input, DatePicker, Select } from "antd";
import { PaperClipOutlined } from "@ant-design/icons";

const { Panel } = Collapse;
const { Option } = Select;

const ImplementPolicies = () => {
  const [isAddDataModalVisible, setIsAddDataModalVisible] = useState(false);
  const [isAssignTaskModalVisible, setIsAssignTaskModalVisible] = useState(false);

  const consultants = ["Consultant A", "Consultant B", "Consultant C"];

  const openAddDataModal = () => {
    setIsAddDataModalVisible(true);
  };

  const closeAddDataModal = () => {
    setIsAddDataModalVisible(false);
  };

  const openAssignTaskModal = () => {
    setIsAssignTaskModalVisible(true);
  };

  const closeAssignTaskModal = () => {
    setIsAssignTaskModalVisible(false);
  };

  return (
    <div className="p-16 pt-10 bg-gray-50 flex-grow relative">
      <h1 className="text-2xl font-bold text-gray-800 mb-5">Policy Lens</h1>

      {/* Feedback Section */}
      <div>
        <h2 className="text-xl font-bold mb-4">Conduct Reviews</h2>
      </div>

      {/* Add Data and Assign Task Buttons */}
      <div className="absolute bottom-4 right-8 flex flex-col space-y-2">
        <Button type="primary" onClick={openAddDataModal}>Add Data</Button>
        <Button type="default" onClick={openAssignTaskModal}>Assign Task</Button>
      </div>

      {/* Modal for Add Data */}
      <Modal
        title="Provide Feedback"
        visible={isAddDataModalVisible}
        onCancel={closeAddDataModal}
        footer={null}
      >
        <Input.TextArea placeholder="Enter your feedback" rows={4} />
        <div className="flex justify-center mt-4">
          <Button type="primary" onClick={closeAddDataModal}>Submit Feedback</Button>
        </div>
      </Modal>

      {/* Modal for Assign Task */}
      <Modal
        title="Assign Task"
        visible={isAssignTaskModalVisible}
        onCancel={closeAssignTaskModal}
        footer={null}
      >
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Team Members</label>
          <Select mode="multiple" placeholder="Select team members" className="w-full">
            {consultants.map((consultant) => (
              <Option key={consultant} value={consultant}>{consultant}</Option>
            ))}
          </Select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Team Deadline</label>
          <DatePicker className="w-full" />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Task Description</label>
          <Input placeholder="Enter task description" />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Task References</label>
          <Input placeholder="Add reference URLs" />
        </div>

        <div className="flex justify-center">
          <Button type="primary" onClick={closeAssignTaskModal}>Assign</Button>
        </div>
      </Modal>
    </div>
  );
};

export default ImplementPolicies;