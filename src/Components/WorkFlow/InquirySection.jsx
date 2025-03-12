import React, { useState } from "react";
import { Modal, Input, Upload, Button } from "antd";
import { PaperClipOutlined } from "@ant-design/icons";

const { TextArea } = Input;

function InquirySection({ isVisible, onClose }) {
  const [fileLists, setFileLists] = useState({});

  const handleUploadChange = (panelKey, { fileList }) => {
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
          onChange={(info) => handleUploadChange(panelKey, info)}
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

  const renderSmallInputWithAttachButton = (panelKey, placeholder) => (
    <div className="relative border border-gray-300 rounded-lg overflow-hidden">
      <Input
        placeholder={placeholder}
        className="border-none p-4 pr-[100px] text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="absolute top-1/2 right-4 -translate-y-1/2">
        <Upload
          fileList={fileLists[panelKey] || []}
          onChange={(info) => handleUploadChange(panelKey, info)}
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

  return (
    <Modal visible={isVisible} onCancel={onClose} footer={null} width={600}>
      <h2 className="text-xl font-bold text-gray-800 mb-4">Inquiry Section</h2>
      <div className="space-y-4">
        <div>{renderLargeInputWithAttachButton("scope", "Enter the scope of the project")}</div>
        <div>{renderSmallInputWithAttachButton("timeline", "Add timeline details")}</div>
        <div>{renderSmallInputWithAttachButton("budget", "Enter budget")}</div>
        <div>{renderSmallInputWithAttachButton("availability", "Enter availability details")}</div>
        <div>{renderLargeInputWithAttachButton("draftProposal", "Upload draft proposal")}</div>
      </div>
    </Modal>
  );
}

function InquiryPage() {
  const [isModalVisible, setIsModalVisible] = useState(false);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Inquiry Section</h2>
        <Button type="primary" onClick={() => setIsModalVisible(true)}>
          Add Data
        </Button>
      </div>

      {/* Display Saved Information */}
      <div className="bg-gray-50 p-6 rounded-lg space-y-3 mb-6">
        <h3 className="text-lg font-semibold text-gray-700">Saved Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h4 className="font-medium text-gray-700">Scope</h4>
            <p className="text-sm text-gray-600 mt-2">Text: updated 2</p>
            <div className="text-xs text-gray-500 mt-2">
              Saved by: User 8
              <span className="mx-2">•</span>
              Saved at: March 8, 2025, 20:55:41 UTC
            </div>
            <div className="mt-3">
              <p className="text-xs font-medium text-gray-600 mb-1">Attached Documents:</p>
              <ul className="text-xs text-gray-500 list-disc pl-4">
                <li>gaurav_aadhar_uEy7TKu.pdf</li>
                <li>gaurav_btech_NLmAjfB.pdf</li>
              </ul>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h4 className="font-medium text-gray-700">Timeline</h4>
            <p className="text-sm text-gray-600 mt-2">Text: updated 2</p>
            <div className="text-xs text-gray-500 mt-2">
              Saved by: User 8
              <span className="mx-2">•</span>
              Saved at: March 8, 2025, 20:55:31 UTC
            </div>
            <div className="mt-3">
              <p className="text-xs font-medium text-gray-600 mb-1">Attached Documents:</p>
              <ul className="text-xs text-gray-500 list-disc pl-4">
                <li>gaurav_aadhar_gFnz7mP.pdf</li>
                <li>gaurav_btech_qmYeG3t.pdf</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <InquirySection isVisible={isModalVisible} onClose={() => setIsModalVisible(false)} />
    </div>
  );
}

export default InquiryPage;
