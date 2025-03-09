import React, { useState } from "react";
import { Button, Modal, Select, DatePicker, Input } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Worker, Viewer, ScrollMode } from "@react-pdf-viewer/core";
import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/page-navigation/lib/styles/index.css";

const { Option } = Select;

const ReportPresentation = () => {
  const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);
  const [isPdfModalVisible, setIsPdfModalVisible] = useState(false);
  
  // Define auditors array
  const auditors = ["Auditor A", "Auditor B", "Auditor C", "Auditor D"];
  
  // PDF viewer plugin setup
  const pageNavigationPluginInstance = pageNavigationPlugin();
  const { jumpToNextPage, jumpToPreviousPage, CurrentPageLabel, NumberOfPages } =
    pageNavigationPluginInstance;
  
  const handleAssignTask = () => {
    setIsTaskModalVisible(true);
  };
  
  const handleTaskModalClose = () => {
    setIsTaskModalVisible(false);
  };
  
  const handleViewPdf = () => {
    setIsPdfModalVisible(true);
  };
  
  const handlePdfModalClose = () => {
    setIsPdfModalVisible(false);
  };
  
  return (
    <div className="relative">
      <h2 className="text-xl font-bold mb-4">Present AS-IS Report</h2>
      <div className="bg-white p-6 border rounded mb-4">
        <div className="flex justify-center">
          <Button type="primary" onClick={handleViewPdf}>
            View PDF Report
          </Button>
        </div>
      </div>
      
      {/* Assign Task Button */}
      <div className="absolute bottom-0 right-4">
        <Button type="default" onClick={handleAssignTask}>
          Assign Task
        </Button>
      </div>
      
      {/* PDF Viewer Modal */}
      <Modal
        title="AS-IS Report PDF"
        open={isPdfModalVisible}
        onCancel={handlePdfModalClose}
        width={900}
        style={{ top: 20 }}
        bodyStyle={{ padding: 0, height: "80vh" }}
        footer={[
          <Button key="close" type="primary" onClick={handlePdfModalClose}>
            Close
          </Button>
        ]}
      >
        <div className="h-full flex flex-col items-center justify-center relative">
          {/* Use the exact same worker URL as in ManualReport */}
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.0.279/build/pdf.worker.min.js">
            <Viewer
              fileUrl={"/Document1.pdf"}
              plugins={[pageNavigationPluginInstance]}
              scrollMode={ScrollMode.Page}
            />
          </Worker>
          <button
            type="button"
            onClick={jumpToPreviousPage}
            className="absolute left-10 top-1/2 transform -translate-y-1/2 text-xl font-bold hover:text-blue-500"
          >
            <LeftOutlined />
          </button>
          <button
            type="button"
            onClick={jumpToNextPage}
            className="absolute right-10 top-1/2 transform -translate-y-1/2 text-xl font-bold hover:text-blue-500"
          >
            <RightOutlined />
          </button>
          <div className="flex items-center gap-4 mt-1 absolute bottom-4">
            <span className="text-xs font-bold bg-white px-2 py-1 rounded">
              Page <CurrentPageLabel /> of <NumberOfPages />
            </span>
          </div>
        </div>
      </Modal>
      
      {/* Modal for Assign Task */}
      <Modal
        title="Assign Task"
        open={isTaskModalVisible}
        onCancel={handleTaskModalClose}
        footer={null}
      >
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Auditors
          </label>
          <Select
            mode="multiple"
            placeholder="Select auditors"
            className="w-full"
          >
            {auditors.map((auditor) => (
              <Option key={auditor} value={auditor}>
                {auditor}
              </Option>
            ))}
          </Select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Task Deadline
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
          <Button type="primary" onClick={handleTaskModalClose}>
            Assign
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ReportPresentation;