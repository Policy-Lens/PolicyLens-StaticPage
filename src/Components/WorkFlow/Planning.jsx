import React, { useState } from "react";
import { Button, Input, Collapse, Modal, Select, DatePicker, Upload } from "antd";
import { PaperClipOutlined } from "@ant-design/icons";

const { Panel } = Collapse;
const { TextArea } = Input;
const { Option } = Select;

const Planning = () => {
  const [fileLists, setFileLists] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);

  const consultants = ["Consultant 1", "Consultant 2", "Consultant 3"];

  const handleFileChange = (panelKey, { fileList }) => {
    setFileLists((prev) => ({ ...prev, [panelKey]: fileList }));
  };

  const renderLargeInputWithAttachButton = (panelKey, placeholder) => (
    <div className="relative border border-gray-300 rounded-lg overflow-hidden">
      <TextArea
        rows={6}
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

  return (
    <div className="p-8 flex-grow relative">
      <h1 className="text-2xl font-bold text-gray-800 mb-10">Policy Lens</h1>

      {/* Planning Section */}
      <div>
        <h2 className="text-xl font-bold mb-4">Create a Plan/Draft Policies</h2>
        <Collapse>
          <Panel header="Enter Plan Details" key="1">
            {renderLargeInputWithAttachButton(
              "planDetails",
              "Enter details for the plan or draft policies"
            )}
          </Panel>
        </Collapse>
      </div>

      {/* Assign Task Button */}
      <div className="absolute bottom--4 right-8">
        <Button
          className="mt-3"
          type="default"
          onClick={() => setIsModalVisible(true)}
        >
          Assign Task
        </Button>
      </div>

      {/* Modal for Assign Task */}
      <Modal
        title="Assign Task"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
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
          <Button type="primary" onClick={() => setIsModalVisible(false)}>
            Assign
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Planning;
