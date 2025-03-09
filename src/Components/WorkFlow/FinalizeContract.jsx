import React, { useState } from "react";
import { Button, Input, Upload, message, Modal } from "antd";
import { PaperClipOutlined, PlusOutlined } from "@ant-design/icons";

const { TextArea } = Input;

function FinalizeContract() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [description, setDescription] = useState("");
  const [fileList, setFileList] = useState([]);

  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const handleFinalize = () => {
    if (!description.trim()) {
      message.warning("Please provide a description.");
      return;
    }

    console.log("Description:", description);
    console.log("Attached Files:", fileList);
    message.success("Contract finalized successfully!");
    setIsModalVisible(false);
  };

  return (
    <div className="p-4 relative">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Finalize Contract</h2>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        className="absolute top-0 right-0"
        onClick={() => setIsModalVisible(true)}
      >
        Add Data
      </Button>
      <Modal
        title="Add Contract Data"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
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
              onChange={handleUploadChange}
              beforeUpload={() => false}
              showUploadList={false}
              multiple
            >
              <button className="bg-gray-100 rounded-full px-4 py-1 text-sm font-semibold text-gray-600 shadow-sm hover:bg-gray-200 focus:outline-none">
                <PaperClipOutlined className="mr-2" /> Attach Files
              </button>
            </Upload>
          </div>
        </div>
        <button
          className="w-full bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none"
          onClick={handleFinalize}
        >
          Finalize Contract
        </button>
      </Modal>
    </div>
  );
}

export default FinalizeContract;
