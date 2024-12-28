import React, { useState } from "react";
import { Button, Modal, Select, DatePicker, Input } from "antd";

const { Option } = Select;

const ReportPresentation = () => {
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
      <h2 className="text-xl font-bold mb-4">Present AS-IS Report</h2>
      <div className="bg-white p-6 border rounded mb-4">
        <h3 className="text-lg font-semibold mb-2">Analysis Report</h3>
        <h4 className="text-md font-semibold mb-2">Overview</h4>
        <p>
          The AS-IS analysis identifies current operational inefficiencies, gaps
          in policy alignment, and opportunities for improvement. The report
          includes qualitative and quantitative data collected through stakeholder
          interviews and document analysis.
        </p>
        <h4 className="text-md font-semibold mb-2 mt-4">Key Findings</h4>
        <ul className="list-disc pl-6 mb-4">
          <li>75% of departmental policies lack standardization across teams.</li>
        </ul>
      </div>
      <Button type="primary">Send Detailed Report to Company</Button>

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

export default ReportPresentation;
