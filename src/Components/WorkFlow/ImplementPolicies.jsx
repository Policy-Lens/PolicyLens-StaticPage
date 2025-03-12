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

  const jsonData = [{ "id": 7, "step": 27, "field_name": "Service Requirements", "text_data": "This is the Implement Policies page description", "sequence_no": 2, "saved_by": 8, "saved_at": "2025-03-08T20:34:26.107907Z", "documents": [{ "id": 3, "file": "/media/projects/16/documents/gaurav_aadhar_fiCPtp5.pdf", "tag": "", "created_at": "2025-03-08T20:34:26.119905Z" }, { "id": 4, "file": "/media/projects/16/documents/gaurav_btech_4UvmJ0j.pdf", "tag": "", "created_at": "2025-03-08T20:34:26.126904Z" }] }];

  const { text_data, documents, saved_by, saved_at } = jsonData[0];

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

      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-800">Implement Policies Details</h3>
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

export default ImplementPolicies;