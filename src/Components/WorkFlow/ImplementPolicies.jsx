import React, { useState } from "react";
import { Button, Collapse, Modal, Input, DatePicker, Select } from "antd";
import { PaperClipOutlined } from "@ant-design/icons";

const { Panel } = Collapse;
const { Option } = Select;

const ImplementPolicies = () => {
  const [isFeedbackModalVisible, setIsFeedbackModalVisible] = useState(false);
  const [isAssignTaskModalVisible, setIsAssignTaskModalVisible] = useState(false);

  const consultants = ["Consultant A", "Consultant B", "Consultant C"];

  const openFeedbackModal = () => {
    setIsFeedbackModalVisible(true);
  };

  const closeFeedbackModal = () => {
    setIsFeedbackModalVisible(false);
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

      {/* Implement Policies Section */}
      <div>
        <h2 className="text-xl font-bold mb-4">Conduct Reviews</h2>
        <Button type="primary" onClick={openFeedbackModal} className="mb-4">
          Provide Policy Feedback
        </Button>

        <Collapse defaultActiveKey={["1"]}>
          <Panel header="Policy Reviews and Feedback" key="1">
            <p>Review and provide feedback for the implemented policies.</p>
            <Button onClick={openFeedbackModal}>Give Feedback</Button>
          </Panel>
        </Collapse>
      </div>

      {/* Assign Task Button positioned in the bottom-right corner */}
      <div className="absolute bottom-4 right-8">
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
          <Button type="primary" onClick={closeAssignTaskModal}>
            Assign
          </Button>
        </div>
      </Modal>

      {/* Feedback Modal */}
      <Modal
        title="Provide Feedback"
        visible={isFeedbackModalVisible}
        onCancel={closeFeedbackModal}
        footer={null}
      >
        <p>Here you can provide feedback for the implemented policies.</p>
        <Input.TextArea placeholder="Enter your feedback" rows={4} />
        <div className="flex justify-center mt-4">
          <Button type="primary" onClick={closeFeedbackModal}>
            Submit Feedback
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ImplementPolicies;
