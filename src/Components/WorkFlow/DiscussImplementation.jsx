import React, { useState } from "react";
import { Button, Modal, Input, DatePicker, Select } from "antd";
import { PaperClipOutlined } from "@ant-design/icons";

const { Option } = Select;

const DiscussImplementation = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const consultants = ["Consultant A", "Consultant B", "Consultant C"];

  const openMeetingModal = () => {
    console.log("Open meeting modal for 'Organize Training for Implementation'");
  };

  const openAssignTaskModal = () => {
    setIsModalVisible(true);
  };

  return (
    <div className="p-16 pt-8 bg-gray-50 flex-grow relative">
      <h1 className="text-2xl font-bold text-gray-800 mb-10">Policy Lens</h1>

      {/* Discuss Implementation Section */}
      <div>
        <h2 className="text-xl font-bold mb-4">Organize Meeting</h2>
        <Button type="primary" onClick={openMeetingModal}>
          Schedule Meeting
        </Button>
      </div>

      {/* Assign Task Button positioned in the bottom-right corner */}
      <div className="absolute  right-8">
        <Button type="default" onClick={openAssignTaskModal}>
          Assign Task
        </Button>
      </div>

      {/* Modal for Assign Task */}
      <Modal
        title="Assign Task"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Team Members
          </label>
          <Select
            mode="multiple"
            placeholder="Select team members"
            className="w-full"
          >
            {consultants.map((consultant) => (
              <Option key={consultant} value={consultant}>
                {consultant}
              </Option>
            ))}
          </Select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Team Deadline
          </label>
          <DatePicker className="w-full" />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Task Description
          </label>
          <Input placeholder="Enter task description" />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Task References
          </label>
          <Input placeholder="Add reference URLs" />
        </div>

        <div className="flex justify-center">
          <Button type="primary" onClick={() => setIsModalVisible(false)}>
            Assign
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default DiscussImplementation;
