import React, { useState } from "react";
import { Button, Input, Collapse, Modal, Select, DatePicker, Upload } from "antd";
import { PaperClipOutlined } from "@ant-design/icons";

const { Panel } = Collapse;
const { TextArea } = Input;
const { Option } = Select;

const Planning = () => {
  const [fileLists, setFileLists] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  const consultants = ["Consultant 1", "Consultant 2", "Consultant 3"];

  const handleFileChange = (panelKey, { fileList }) => {
    setFileLists((prev) => ({ ...prev, [panelKey]: fileList }));
  };

  const jsonData = [{ "id": 7, "step": 27, "field_name": "Service Requirements", "text_data": "This is the Planning page description", "sequence_no": 2, "saved_by": 8, "saved_at": "2025-03-08T20:34:26.107907Z", "documents": [{ "id": 3, "file": "/media/projects/16/documents/gaurav_aadhar_fiCPtp5.pdf", "tag": "", "created_at": "2025-03-08T20:34:26.119905Z" }, { "id": 4, "file": "/media/projects/16/documents/gaurav_btech_4UvmJ0j.pdf", "tag": "", "created_at": "2025-03-08T20:34:26.126904Z" }] }];

  const { text_data, documents, saved_by, saved_at } = jsonData[0];

  return (
    <div className="p-8 flex-grow relative">
      <h1 className="text-2xl font-bold text-gray-800 mb-10">Policy Lens</h1>

      {/* Planning Section */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Create a Plan/Draft Policies</h2>
        <div className="ml-auto">
          <Button type="primary" onClick={() => setIsPopupVisible(true)}>
            Add Data
          </Button>
        </div>
      </div>

      {/* Assign Task Button */}
      <div className="absolute bottom--4 right-8">
        <Button className="mt-3" type="default" onClick={() => setIsModalVisible(true)}>
          Assign Task
        </Button>
      </div>

      {/* Modal for Assign Task */}
      <Modal title="Assign Task" visible={isModalVisible} onCancel={() => setIsModalVisible(false)} footer={null}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Team Members</label>
          <Select mode="multiple" placeholder="Select team members" className="w-full">
            {consultants.map((consultant) => (
              <Option key={consultant} value={consultant}>
                {consultant}
              </Option>
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
          <Button type="primary" onClick={() => setIsModalVisible(false)}>
            Assign
          </Button>
        </div>
      </Modal>

      {/* Popup for Adding Data */}
      <Modal title="Enter Data" visible={isPopupVisible} onCancel={() => setIsPopupVisible(false)} footer={null}>
        <h2 className="text-lg font-bold mb-4">Plan/Draft Policies</h2>
        <Collapse>
          <Panel header="Enter Plan Details" key="1">
            <div className="relative border border-gray-300 rounded-lg overflow-hidden">
              <TextArea
                rows={6}
                placeholder="Enter details for the plan or draft policies"
                className="border-none resize-none p-4 pr-[100px] text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="absolute bottom-3 right-4">
                <Upload
                  fileList={fileLists["planDetails"] || []}
                  onChange={(info) => handleFileChange("planDetails", info)}
                  beforeUpload={() => false}
                  showUploadList={false}
                  multiple
                >
                  <button className="bg-gray-100 rounded-full px-4 py-1 text-sm font-semibold text-gray-600 shadow-sm hover:bg-gray-200 focus:outline-none">
                    <PaperClipOutlined className="mr-2" />
                    Attach Files
                  </button>
                </Upload>
              </div>
            </div>
          </Panel>
        </Collapse>
      </Modal>

      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-800">Planning Details</h3>
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

export default Planning;
