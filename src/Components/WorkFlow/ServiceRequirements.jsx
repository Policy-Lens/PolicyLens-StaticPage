import React, { useState, useContext, useEffect } from "react";
import { Button, Modal, Input, Upload, message } from "antd";
import { PaperClipOutlined, FileTextOutlined } from "@ant-design/icons";
import { ProjectContext } from "../../Context/ProjectContext";
import { useParams } from "react-router-dom";
const { TextArea } = Input;

function ServiceRequirements() {
  const [fileList, setFileList] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [description, setDescription] = useState("");
  const [isAssignedUser, setIsAssignedUser] = useState(false);
  const { projectid } = useParams();
  const { addStepData, getStepData, getStepId, projectRole, checkStepAuth } = useContext(ProjectContext);
  const [serviceRequirementsData, setServiceRequirementsData] = useState([]);
  const [stepId, setStepId] = useState(null);
  const [oldFilesNeeded, setOldFilesNeeded] = useState([]);
  const [removedOldFiles, setRemovedOldFiles] = useState([]);

  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const handleRemoveFile = (fileUrl) => {
    setOldFilesNeeded(prev => prev.filter(file => file !== fileUrl));
    setRemovedOldFiles(prev => [...prev, fileUrl]);
  };

  const handleRestoreFile = (fileUrl) => {
    setRemovedOldFiles(prev => prev.filter(file => file !== fileUrl));
    setOldFilesNeeded(prev => [...prev, fileUrl]);
  };

  const checkAssignedUser = async (step_id) => {
    const isAuthorized = await checkStepAuth(step_id);
    setIsAssignedUser(isAuthorized);
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      message.warning("Please provide a description.");
      return;
    }

    const formData = new FormData();
    formData.append("field_name", "Service Requirements");
    formData.append("text_data", description);

    // Append old files array as JSON string
    formData.append("old_files", JSON.stringify(oldFilesNeeded));

    // Append new files
    fileList.forEach((file) => {
      formData.append("files", file.originFileObj || file);
    });

    try {
      const response = await addStepData(stepId, formData);
      if (response.status === 201) {
        message.success("Service requirements submitted successfully!");
        setIsModalVisible(false);
        setDescription("");
        setFileList([]);
        setOldFilesNeeded([]);
        setRemovedOldFiles([]);
        await get_step_data(stepId);
      } else {
        message.error("Failed to submit service requirements.");
      }
    } catch (error) {
      message.error("Failed to submit service requirements.");
      console.error(error);
    }
  };

  // Helper function to extract filename from path
  const getFileName = (filePath) => {
    return filePath.split('/').pop();
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Helper function to create a viewer URL instead of direct download
  const getViewerUrl = (filePath) => {
    // Extract file extension
    const extension = filePath.split('.').pop().toLowerCase();

    // For PDFs, use PDF viewer
    if (extension === 'pdf') {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(`http://localhost:8000${filePath}`)}&embedded=true`;
    }

    // For images, use direct URL (browsers will display these)
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(extension)) {
      return `http://localhost:8000${filePath}`;
    }

    // For other file types, use Google Docs viewer
    return `https://docs.google.com/viewer?url=${encodeURIComponent(`http://localhost:8000${filePath}`)}&embedded=true`;
  };

  const get_step_id = async () => {
    const step_id = await getStepId(projectid, 1);
    if (step_id) {
      setStepId(step_id);
      await get_step_data(step_id);
      await checkAssignedUser(step_id);
    }
  };

  const get_step_data = async (step_id) => {
    const stepData = await getStepData(step_id);
    setServiceRequirementsData(stepData || []);

    // If there's existing data, set it for editing
    if (stepData && stepData.length > 0) {
      const latestData = stepData[0];
      setDescription(latestData.text_data);

      // Initialize old files from existing documents
      const existingFiles = latestData.documents.map(doc => doc.file);
      setOldFilesNeeded(existingFiles);
      setRemovedOldFiles([]);
    }
  };

  useEffect(() => {
    get_step_id();
  }, []);

  return (
    <div className="bg-gray-50 min-h-full p-6">
      {/* Simple header with no background */}
      <div className="mb-8 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Service Requirements</h2>
        {(projectRole.includes("admin") || isAssignedUser) && (
          <Button
            type="primary"
            onClick={() => setIsModalVisible(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Update Requirements
          </Button>
        )}
      </div>

      {serviceRequirementsData.length > 0 ? (
        <div className="space-y-8">
          {serviceRequirementsData.map((item, index) => (
            <div key={item.id} className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all hover:shadow-lg">
              {/* Top section with colored accent */}
              <div className="h-2 bg-blue-600"></div>

              {/* Main content */}
              <div className="p-6">
                {/* Header with metadata */}
                <div className="flex flex-wrap justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">{item.field_name}</h3>
                    <div className="flex items-center mt-1">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-xs text-gray-500">Updated {formatDate(item.saved_at)}</span>
                    </div>
                  </div>

                  {/* User info with avatar */}
                  <div className="flex items-center bg-gray-50 px-3 py-2 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-inner">
                        {item.saved_by.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-800">{item.saved_by.name}</p>
                      <p className="text-xs text-gray-500">{item.saved_by.email}</p>
                    </div>
                  </div>
                </div>

                {/* Description with styled container */}
                <div className="mb-8">
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Description</h4>
                  <div className="bg-gray-50 rounded-lg p-5 border-l-4 border-blue-400">
                    <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">{item.text_data}</p>
                  </div>
                </div>

                {/* Documents with card layout */}
                {item.documents && item.documents.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                      Attached Documents ({item.documents.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {item.documents.map((doc) => (
                        <div key={doc.id} className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden transition-all hover:border-blue-300 hover:shadow-md">
                          {/* File type indicator */}
                          <div className="absolute top-0 right-0 bg-blue-100 text-xs text-blue-600 px-2 py-1 rounded-bl-lg">
                            {doc.file.split('.').pop().toUpperCase()}
                          </div>

                          <div className="p-4 pr-16">
                            <div className="flex items-start">
                              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                                <FileTextOutlined className="text-blue-600" />
                              </div>
                              <div className="overflow-hidden">
                                <p className="text-sm font-medium text-gray-800 truncate mb-1">{getFileName(doc.file)}</p>
                                <a
                                  href={getViewerUrl(doc.file)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 font-medium"
                                >
                                  View Document
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                                  </svg>
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md p-10 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Service Requirements</h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
              Service requirements help define what needs to be delivered for this project. Add your first requirement to get started.
            </p>
            <Button
              onClick={() => setIsModalVisible(true)}
              type="primary"
              size="large"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Service Requirements
            </Button>
          </div>
        </div>
      )}

      {/* Redesigned Modal */}
      <Modal
        title={serviceRequirementsData.length > 0 ? "Update Service Requirements" : "Add Service Requirements"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setDescription("");
          setFileList([]);
          setOldFilesNeeded([]);
          setRemovedOldFiles([]);
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setIsModalVisible(false);
              setDescription("");
              setFileList([]);
              setOldFilesNeeded([]);
              setRemovedOldFiles([]);
            }}
            className="border-gray-300 text-gray-700"
          >
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {serviceRequirementsData.length > 0 ? "Update" : "Save"}
          </Button>
        ]}
        width={700}
      >
        <div className="p-6">
          <div className="space-y-6">
            {/* Description Field */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <TextArea
                id="description"
                rows={6}
                placeholder="Enter the service requirements"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Existing Files */}
            {oldFilesNeeded.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Existing Files</h4>
                <div className="space-y-3">
                  {oldFilesNeeded.map((fileUrl) => (
                    <div key={fileUrl} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                      <div className="flex items-center overflow-hidden">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                          <FileTextOutlined className="text-blue-600" />
                        </div>
                        <span className="text-sm text-gray-700 truncate">{getFileName(fileUrl)}</span>
                      </div>
                      <div className="flex items-center">
                        <a
                          href={getViewerUrl(fileUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-4"
                        >
                          View
                        </a>
                        <Button
                          type="text"
                          danger
                          onClick={() => handleRemoveFile(fileUrl)}
                          className="flex items-center"
                          icon={
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Removed Files */}
            {removedOldFiles.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Removed Files</h4>
                <div className="space-y-3">
                  {removedOldFiles.map((fileUrl) => (
                    <div key={fileUrl} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center overflow-hidden">
                        <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center mr-3 flex-shrink-0">
                          <FileTextOutlined className="text-red-500" />
                        </div>
                        <span className="text-sm text-gray-500 truncate">{getFileName(fileUrl)}</span>
                      </div>
                      <Button
                        type="text"
                        onClick={() => handleRestoreFile(fileUrl)}
                        className="text-blue-600 hover:text-blue-800 flex items-center"
                        icon={
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                          </svg>
                        }
                      >
                        Restore
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add New Files */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Upload New Files</h4>
              <Upload
                fileList={fileList}
                onChange={handleUploadChange}
                beforeUpload={() => false}
                multiple
                showUploadList={true}
                className="upload-list-custom"
              >
                <Button
                  icon={<PaperClipOutlined />}
                  className="bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 hover:border-blue-300 rounded-lg shadow-sm flex items-center"
                >
                  Attach Files
                </Button>
              </Upload>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default ServiceRequirements;
