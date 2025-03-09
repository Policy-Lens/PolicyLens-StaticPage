import React, { useState } from "react";
import { Button, Modal, Input, Upload, message } from "antd";
import { PaperClipOutlined } from "@ant-design/icons";

const { TextArea } = Input;

function ServiceRequirements() {
  const [fileList, setFileList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [description, setDescription] = useState("");

  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const handleSubmit = () => {
    if (!description.trim()) {
      message.warning("Please provide a description.");
      return;
    }
    console.log("Description:", description);
    console.log("Uploaded Files:", fileList);
    message.success("Service requirements submitted successfully!");
    setIsModalOpen(false);
    setDescription("");
    setFileList([]);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Service Requirements</h2>
        <Button
          className="bg-blue-500 text-white font-semibold py-1 px-4 rounded-lg hover:bg-blue-600 focus:outline-none"
          onClick={() => setIsModalOpen(true)}
        >
          Add Data
        </Button>
      </div>
      <Modal
        title="Add Service Requirements"
        visible={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
        width={600}
      >
        <div className="relative border border-gray-300 rounded-lg overflow-hidden p-4">
          <TextArea
            rows={4}
            placeholder="Enter the service requirements"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border-none resize-none text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute bottom-3 right-4">
            <Upload
              fileList={fileList}
              onChange={handleUploadChange}
              beforeUpload={() => false}
              multiple
              showUploadList={false}
            >
              <Button
                icon={<PaperClipOutlined />}
                className="bg-gray-100 rounded-full px-4 py-1 text-sm font-semibold text-gray-600 shadow-sm hover:bg-gray-200 focus:outline-none"
              >
                Attach Files
              </Button>
            </Upload>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default ServiceRequirements;
