import React, { useState } from "react";
import { Collapse, Input, Upload } from "antd";
import { PaperClipOutlined } from "@ant-design/icons";

const { TextArea } = Input;
const { Panel } = Collapse;

function InquirySection({ onContinue }) {
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
    <div className="p-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Inquiry</h2>
      <Collapse accordion className="space-y-4">
        <Panel header="Scope" key="1">
          {renderLargeInputWithAttachButton("scope", "Enter the scope of the project")}
        </Panel>
        <Panel header="Timeline" key="2">
          {renderSmallInputWithAttachButton("timeline", "Add timeline details")}
        </Panel>
        <Panel header="Budget" key="3">
          {renderSmallInputWithAttachButton("budget", "Enter budget")}
        </Panel>
        <Panel header="Availability" key="4">
          {renderSmallInputWithAttachButton("availability", "Enter availability details")}
        </Panel>
        <Panel header="Draft Proposal" key="5">
          {renderLargeInputWithAttachButton("draftProposal", "Upload draft proposal")}
        </Panel>
      </Collapse>
      <button
        className="mt-4 w-full bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none"
        onClick={() => onContinue && onContinue()}
      >
        Continue
      </button>
    </div>
  );
}

export default InquirySection;
