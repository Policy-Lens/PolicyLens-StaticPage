import React, { useState } from "react";
import { Button, Modal, Input, DatePicker, Select } from "antd";

const { Option } = Select;

const ExternalAuditProcess = () => {
  const [isAssignTaskModalVisible, setIsAssignTaskModalVisible] = useState(false);

  const openAssignTaskModal = () => {
    setIsAssignTaskModalVisible(true);
  };

  const closeAssignTaskModal = () => {
    setIsAssignTaskModalVisible(false);
  };

  const auditors = ["Auditor 1", "Auditor 2", "Auditor 3"];

  return (
    <div className="max-w-4xl mx-auto p-6 relative">
      {/* Page Title */}
      <h1 className="text-2xl font-bold text-gray-800 mb-4">
        External Audit Process
      </h1>

      {/* Page Description */}
      <p className="text-gray-600 mb-8">
        Streamline the external audit process by creating profiles and
        templates. Choose one of the options below to proceed:
      </p>

      {/* Buttons Section */}
      <div className="space-y-4">
        {/* Create External Audit Profile Button */}
        <button
          onClick={() => alert("Create External Audit Profile clicked!")}
          className="w-full px-6 py-3 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
        >
          Create Profile
        </button>

        {/* Create Audit Templates and Send to Company Button */}
        <button
          onClick={() => alert("Create Audit Templates clicked!")}
          className="w-full px-6 py-3 text-white bg-green-500 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
        >
          Create Templates
        </button>
      </div>

      {/* Assign Task Button positioned in the bottom-right corner */}
      <div className="absolute bottom--8 right-8">
        <Button className="mt-3" type="default" onClick={openAssignTaskModal}>
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

export default ExternalAuditProcess;
