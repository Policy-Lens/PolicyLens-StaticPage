import React, { useState } from "react";
import { Collapse, Button, Input, Upload, DatePicker, Modal, Select } from "antd";
import { PaperClipOutlined } from "@ant-design/icons";

const { Panel } = Collapse;
const { TextArea } = Input;
const { Option } = Select;

const GapAnalysis = () => {
  const [fileLists, setFileLists] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAssignTaskVisible, setIsAssignTaskVisible] = useState(false);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);

  const consultants = ["Consultant 1", "Consultant 2", "Consultant 3"];

  const handleFileChange = (panelKey, { fileList }) => {
    setFileLists((prev) => ({ ...prev, [panelKey]: fileList }));
  };

  const handleAddData = () => {
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  const handleAssignTask = () => {
    setIsAssignTaskVisible(true);
  };

  const handleAssignTaskClose = () => {
    setIsAssignTaskVisible(false);
  };

  return (
    <div className="relative p-6 rounded-md bg-white">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Create Plan for Gap Analysis</h2>
        <Button type="primary" onClick={handleAddData}>
          Add Data
        </Button>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-bold mb-2">Schedule Interviews</h2>
        <Button type="primary" onClick={() => console.log("Meeting Scheduled")}>
          Schedule Meeting
        </Button>
      </div>

      {/* Assign Task Button Positioned Properly */}
      <div className="flex justify-end mt-4">
        <Button type="default" onClick={handleAssignTask}>
          Assign Task
        </Button>
      </div>

      {/* Add Data Modal */}
      <Modal
        title="Enter Details for Gap Analysis Plan"
        visible={isModalVisible}
        onCancel={handleModalClose}
        footer={[
          <Button key="save" type="primary" onClick={handleModalClose}>
            Save
          </Button>,
        ]}
      >
        <Collapse>
          <Panel header="Enter details for the gap analysis plan" key="1">
            <TextArea rows={6} placeholder="Enter details for the gap analysis plan" />
            <div className="mt-3">
              <Upload
                fileList={fileLists["gapAnalysisPlan"] || []}
                onChange={(info) => handleFileChange("gapAnalysisPlan", info)}
                beforeUpload={() => false}
                showUploadList={false}
                multiple
              >
                <Button icon={<PaperClipOutlined />}>Attach Files</Button>
              </Upload>
            </div>
          </Panel>
        </Collapse>
      </Modal>

      {/* Assign Task Modal */}
      <Modal
        title="Assign Task"
        visible={isAssignTaskVisible}
        onCancel={handleAssignTaskClose}
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
          <Button type="primary" onClick={handleAssignTaskClose}>
            Assign
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default GapAnalysis;
