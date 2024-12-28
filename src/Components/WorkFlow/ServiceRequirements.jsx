import React, { useState } from "react";
import { Button, Input, Upload, message } from "antd";
import { PaperClipOutlined } from "@ant-design/icons";

const { TextArea } = Input;

function ServiceRequirements() {
  const [description, setDescription] = useState("");
  const [fileList, setFileList] = useState([]);

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
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Service Requirements</h2>
      <div className="relative border border-gray-300 rounded-lg overflow-hidden">
        <TextArea
          rows={6}
          placeholder="Enter the service requirements"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border-none resize-none p-4 pr-[100px] text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
      <button
        className="mt-4 w-full bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none"
        onClick={handleSubmit}
      >
        Continue
      </button>
    </div>
  );
}

export default ServiceRequirements;
