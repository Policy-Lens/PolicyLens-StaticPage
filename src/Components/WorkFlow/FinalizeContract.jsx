import React, { useState } from "react";
import { Button, Input, Upload, message } from "antd";
import { PaperClipOutlined, UploadOutlined } from "@ant-design/icons";

const { TextArea } = Input;

function FinalizeContract() {
  const [description, setDescription] = useState("");
  const [fileList, setFileList] = useState([]);
  const [contractFileList, setContractFileList] = useState([]);

  const handleDescriptionUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const handleContractUploadChange = ({ fileList: newFileList }) => {
    setContractFileList(newFileList);
  };

  const handleFinalize = () => {
    if (!description.trim()) {
      message.warning("Please provide a description.");
      return;
    }

    console.log("Description:", description);
    console.log("Attached Files:", fileList);
    console.log("Uploaded Contract:", contractFileList);
    message.success("Contract finalized successfully!");
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        Finalize Contract
      </h2>

      {/* Description Box with Attach Button */}
      <div className="relative border border-gray-300 rounded-lg overflow-hidden mb-4">
        <TextArea
          rows={6}
          placeholder="Enter a description for the contract"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border-none resize-none p-4 pr-[100px] text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="absolute bottom-3 right-4">
          <Upload
            fileList={fileList}
            onChange={handleDescriptionUploadChange}
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

      {/* Finalize Button */}
      <button
        className="w-full bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none"
        onClick={handleFinalize}
      >
        Finalize Contract
      </button>
    </div>
  );
}

export default FinalizeContract;
