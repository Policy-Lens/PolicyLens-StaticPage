import React, { useState } from "react";
import { Button, Modal, Input, DatePicker, Select } from "antd";

const { Option } = Select;

const AuditDecisionPage = () => {
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [isAssignTaskModalVisible, setIsAssignTaskModalVisible] = useState(false);
  const [selectedMeetingType, setSelectedMeetingType] = useState(null);

  const openAssignTaskModal = () => {
    setIsAssignTaskModalVisible(true);
  };

  const closeAssignTaskModal = () => {
    setIsAssignTaskModalVisible(false);
  };

  const handleScheduleMeeting = () => {
    if (selectedMeetingType) {
      alert(`Schedule Meeting: ${selectedMeetingType} clicked!`);
    } else {
      alert("Please select a meeting type.");
    }
  };

  const auditors = ["Auditor 1", "Auditor 2", "Auditor 3"];
  const meetingOptions = [
    "With External Auditor",
    "With Team",
    "With Company Representatives",
  ];

  return (
    <div className="max-w-2xl mx-auto p-6 relative">
      {/* Page Title */}
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Audit Decision</h1>

      {/* Buttons Section */}
      <div className="space-y-6">
        {/* Schedule Meeting Dropdown and Button */}
        <div className="border-t border-gray-300 pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Meeting Type
          </label>
          <Select
            placeholder="Select meeting type"
            className="w-full mb-4"
            onChange={(value) => setSelectedMeetingType(value)}
          >
            {meetingOptions.map((option) => (
              <Option key={option} value={option}>
                {option}
              </Option>
            ))}
          </Select>
          <button
            onClick={handleScheduleMeeting}
            className="px-3 py-1.5 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
          >
            Schedule Meeting
          </button>
        </div>

        {/* Collapsible Description Box */}
        <div className="border-t border-gray-300 pt-4">
          <button
            onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
            className="px-3 py-1.5 text-white bg-green-500 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
          >
            {isDescriptionOpen ? "Hide Description" : "Show Description"}
          </button>
          {isDescriptionOpen && (
            <div className="mt-4 p-4 bg-gray-100 rounded-lg">
              <textarea
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                rows="4"
                placeholder="Add your description here..."
              ></textarea>
            </div>
          )}
        </div>
      </div>

      {/* Assign Task Button positioned in the bottom-right corner */}
      <div className="absolute bottom-4 right-4">
        <Button type="default" onClick={openAssignTaskModal}>
          Assign Task
        </Button>
      </div>

      {/* Modal for Assign Task */}
      <Modal
        title="Assign Task"
        visible={isAssignTaskModalVisible}
        onCancel={closeAssignTaskModal}
        footer={null}
      >
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Auditors
          </label>
          <Select
            mode="multiple"
            placeholder="Select auditors"
            className="w-full"
          >
            {auditors.map((auditor) => (
              <Option key={auditor} value={auditor}>
                {auditor}
              </Option>
            ))}
          </Select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Task Deadline
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
          <Button type="primary" onClick={closeAssignTaskModal}>
            Assign
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default AuditDecisionPage;
