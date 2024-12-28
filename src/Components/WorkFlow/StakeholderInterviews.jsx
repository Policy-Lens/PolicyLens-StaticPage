import React, { useState } from "react";
import { Collapse, Button, Input, Upload, DatePicker, Modal, Select } from "antd";
import { PaperClipOutlined } from "@ant-design/icons";

const { Panel } = Collapse;
const { TextArea } = Input;
const { Option } = Select;

const StakeholderInterviews = () => {
  const [fileLists, setFileLists] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);

  const consultants = ["Consultant A", "Consultant B", "Consultant C"];

  const handleFileChange = (panelKey, { fileList }) => {
    setFileLists((prev) => ({ ...prev, [panelKey]: fileList }));
  };

  const renderLargeInputWithAttachButton = (panelKey, placeholder) => (
    <div className="relative border border-gray-300 rounded-lg overflow-hidden">
      <TextArea
        rows={4}
        placeholder={placeholder}
        className="border-none resize-none p-4 pr-[100px] text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="absolute bottom-3 right-4">
        <Upload
          fileList={fileLists[panelKey] || []}
          onChange={(info) => handleFileChange(panelKey, info)}
          beforeUpload={() => false} // Prevent auto-upload
          showUploadList={false} // Hide file previews
          multiple
        >
          <button
            className="bg-gray-100 rounded-full px-4 py-1 text-sm font-semibold text-gray-600 shadow-sm hover:bg-gray-200 focus:outline-none"
          >
            <PaperClipOutlined className="mr-2" />
            Attach Files
          </button>
        </Upload>
      </div>
    </div>
  );

  const handleAssignTask = () => {
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  return (
    <div className="relative p-6 rounded-md bg-white">
      <h2 className="text-xl font-bold mb-4">Conduct Interviews</h2>
      <Button type="primary" onClick={() => console.log("Meeting Scheduled")}>
        Schedule Meeting
      </Button>

      <h2 className="text-xl font-bold mb-4 mt-6">
        Request Evidence and Policies
      </h2>
      <Collapse className="mb-4">
        <Panel header="Request evidence and policies from stakeholders" key="2">
          {renderLargeInputWithAttachButton(
            "stakeholderEvidence",
            "Request evidence and policies from stakeholders"
          )}
        </Panel>
      </Collapse>

      {/* Assign Task Button */}
      <div className="absolute bottom--8 right-4">
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

export default StakeholderInterviews;
