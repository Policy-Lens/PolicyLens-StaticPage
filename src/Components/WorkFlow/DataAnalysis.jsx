import React, { useState } from "react";
import { Upload, Button, Modal, Select, DatePicker, Input } from "antd";
import { UploadOutlined } from "@ant-design/icons";

const { Option } = Select;

const DataAnalysis = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);

  const consultants = ["Consultant A", "Consultant B", "Consultant C"];

  const handleAssignTask = () => {
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  return (
    <div className="relative">
      <h2 className="text-xl font-bold mb-4">ASIS Report</h2>
      <Upload className="mb-4">
        <Button icon={<UploadOutlined />}>Upload ASIS Report</Button>
      </Upload>

      {/* Assign Task Button */}
      <div className="absolute bottom-0 right-4">
        <Button type="default" onClick={handleAssignTask}>
          Assign Task
        </Button>
      </div>

      {/* Assign Task Modal */}
      <Modal
        title="Assign Task"
        visible={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
      >
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Team Members</label>
          <Select
            mode="multiple"
            placeholder="Select team members"
            value={selectedTeamMembers}
            onChange={setSelectedTeamMembers}
            style={{ width: "100%" }}
          >
            {consultants.map((consultant) => (
              <Option key={consultant} value={consultant}>
                {consultant}
              </Option>
            ))}
          </Select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Team Deadline</label>
          <DatePicker style={{ width: "100%" }} />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Task Description</label>
          <Input placeholder="Enter task description" />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Task References</label>
          <Input placeholder="Add reference URLs" />
        </div>
        <div className="text-center">
          <Button type="primary" onClick={handleModalClose}>
            Assign
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default DataAnalysis;
