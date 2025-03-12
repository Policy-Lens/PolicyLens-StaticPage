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
  const [isAddDataModalVisible, setIsAddDataModalVisible] = useState(false);

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
          beforeUpload={() => false}
          showUploadList={false}
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

  const handleAddData = () => {
    setIsAddDataModalVisible(true);
  };

  const handleAddDataModalClose = () => {
    setIsAddDataModalVisible(false);
  };

  const jsonData = [{ "id": 7, "step": 27, "field_name": "Service Requirements", "text_data": "This is the Stakeholder Interviews page description", "sequence_no": 2, "saved_by": 8, "saved_at": "2025-03-08T20:34:26.107907Z", "documents": [{ "id": 3, "file": "/media/projects/16/documents/gaurav_aadhar_fiCPtp5.pdf", "tag": "", "created_at": "2025-03-08T20:34:26.119905Z" }, { "id": 4, "file": "/media/projects/16/documents/gaurav_btech_4UvmJ0j.pdf", "tag": "", "created_at": "2025-03-08T20:34:26.126904Z" }] }];

  const { text_data, documents, saved_by, saved_at } = jsonData[0];

  return (
    <div className="relative p-6 rounded-md bg-white">
      <h2 className="text-xl font-bold mb-4">Conduct Interviews</h2>

      <div className="flex justify-between items-center mb-4">
        <Button type="primary" onClick={() => console.log("Meeting Scheduled")}>
          Schedule Meeting
        </Button>
        <Button type="primary" onClick={handleAddData}>Add Data</Button>
      </div>

      {/* Add Data Modal */}
      <Modal
        title="Request Evidence and Policies"
        visible={isAddDataModalVisible}
        onCancel={handleAddDataModalClose}
        footer={[
          <Button key="continue" type="primary" onClick={handleAddDataModalClose}>
            Continue
          </Button>,
        ]}
      >
        <Collapse className="mb-4">
          <Panel header="Request evidence and policies from stakeholders" key="2">
            {renderLargeInputWithAttachButton(
              "stakeholderEvidence",
              "Request evidence and policies from stakeholders"
            )}
          </Panel>
        </Collapse>
      </Modal>

      {/* Assign Task Button */}
      <div className="flex justify-end mt-4">
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

      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-800">Stakeholder Interviews Details</h3>
        <p className="text-sm text-gray-600 mb-2">{text_data}</p>
        <h4 className="text-md font-semibold text-gray-800">Documents:</h4>
        <ul className="list-disc list-inside mb-2">
          {documents.map((doc, index) => (
            <li key={index} className="text-sm text-gray-600">
              {doc.file.split('/').pop()}
            </li>
          ))}
        </ul>
        <p className="text-sm text-gray-600">Saved by: {saved_by}</p>
        <p className="text-sm text-gray-600">Saved at: {new Date(saved_at).toLocaleString()}</p>
      </div>
    </div>
  );
};

export default StakeholderInterviews;
