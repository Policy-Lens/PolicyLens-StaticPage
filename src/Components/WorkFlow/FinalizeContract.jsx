import React, { useState, useContext, useEffect } from "react";
import { Button, Input, Upload, message, Modal } from "antd";
import { PaperClipOutlined, FileTextOutlined } from "@ant-design/icons";
import { ProjectContext } from "../../Context/ProjectContext";
import { useParams } from "react-router-dom";

const { TextArea } = Input;

function FinalizeContract() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [description, setDescription] = useState("");
  const [fileList, setFileList] = useState([]);
  const [finalizeContractData, setFinalizeContractData] = useState([]);
  const [stepId, setStepId] = useState(null);
  const [isAssignedUser, setIsAssignedUser] = useState(false);
  const [oldFilesNeeded, setOldFilesNeeded] = useState([]);
  const [removedOldFiles, setRemovedOldFiles] = useState([]);
  
  const { projectid } = useParams();
  const { addStepData, getStepData, getStepId, checkStepAuth, projectRole } = useContext(ProjectContext);

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
    formData.append("field_name", "Finalize Contract");
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
        message.success("Contract finalized successfully!");
        setIsModalVisible(false);
        setDescription("");
        setFileList([]);
        setOldFilesNeeded([]);
        setRemovedOldFiles([]);
        await get_step_data(stepId);
      } else {
        message.error("Failed to finalize contract.");
      }
    } catch (error) {
      message.error("Failed to finalize contract.");
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

  const get_step_id = async () => {
    const step_id = await getStepId(projectid, 3);
    if (step_id) {
      setStepId(step_id);
      await get_step_data(step_id);
      await checkAssignedUser(step_id);
    }
  };

  const get_step_data = async (step_id) => {
    const stepData = await getStepData(step_id);
    setFinalizeContractData(stepData || []);
    
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

  const handleAddData = () => {
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setDescription("");
    setFileList([]);
    setOldFilesNeeded([]);
    setRemovedOldFiles([]);
  };

  useEffect(() => {
    get_step_id();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Finalize Contract</h2>
        {(projectRole.includes("admin") || isAssignedUser) && (
          <Button type="primary" onClick={handleAddData} className="bg-blue-500">
            {finalizeContractData.length > 0 ? "Update Data" : "Add Data"}
          </Button>
        )}
      </div>

      {finalizeContractData.length > 0 && (
        <>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Contract Details</h3>
          
          <div className="border border-gray-200 rounded-lg shadow-sm p-6">
            {finalizeContractData.map((item, index) => (
              <div key={item.id} className={index !== 0 ? "mt-8 pt-8 border-t border-gray-200" : ""}>
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-lg font-semibold">{item.field_name}</h4>
                  <p className="text-sm text-gray-500">{formatDate(item.saved_at)}</p>
                </div>
                
                <p className="text-gray-600 mb-4">{item.text_data}</p>

                {item.documents && item.documents.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-base font-medium mb-2">Documents</h5>
                    <div className="space-y-1">
                      {item.documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <FileTextOutlined className="text-blue-500 mr-2" />
                            <span className="text-gray-600">{getFileName(doc.file)}</span>
                          </div>
                          <a 
                            href={`http://localhost:8000${doc.file}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700"
                          >
                            View File
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-sm text-gray-500">
                  <p>Saved by: {item.saved_by.name} - {item.saved_by.email}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {finalizeContractData.length === 0 && (
        <div className="text-center text-gray-500 my-10">
          <p>No contract data available.</p>
          <p>Click "Add Data" to get started.</p>
        </div>
      )}

      <Modal
        title={finalizeContractData.length > 0 ? "Update Contract" : "Add Contract"}
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={[
          <Button key="save" type="primary" onClick={handleSubmit} className="bg-blue-500">
            Save
          </Button>,
        ]}
      >
        <div className="mb-4">
          <h4 className="text-sm font-semibold mb-2">Description</h4>
          <TextArea
            rows={4}
            placeholder="Enter a description for the contract"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full"
          />
        </div>
        
        {/* Existing Files */}
        {oldFilesNeeded.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold mb-2">Existing Files</h4>
            <div className="space-y-2">
              {oldFilesNeeded.map((fileUrl) => (
                <div key={fileUrl} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <div className="flex items-center">
                    <FileTextOutlined className="text-blue-500 mr-2" />
                    <span className="text-sm text-gray-600">{getFileName(fileUrl)}</span>
                  </div>
                  <div className="flex items-center">
                    <a 
                      href={`http://localhost:8000${fileUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700 mr-2"
                    >
                      View File
                    </a>
                    <Button 
                      type="text" 
                      danger 
                      onClick={() => handleRemoveFile(fileUrl)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Removed Files */}
        {removedOldFiles.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold mb-2">Removed Files</h4>
            <div className="space-y-2">
              {removedOldFiles.map((fileUrl) => (
                <div key={fileUrl} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <div className="flex items-center">
                    <FileTextOutlined className="text-red-500 mr-2" />
                    <span className="text-sm text-gray-600">{getFileName(fileUrl)}</span>
                  </div>
                  <Button 
                    type="text" 
                    onClick={() => handleRestoreFile(fileUrl)}
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
          <h4 className="text-sm font-semibold mb-2">Upload New Files</h4>
          <Upload
            fileList={fileList}
            onChange={handleUploadChange}
            beforeUpload={() => false}
            multiple
            showUploadList={true}
          >
            <Button
              icon={<PaperClipOutlined />}
              className="bg-gray-100 hover:bg-gray-200"
            >
              Attach Files
            </Button>
          </Upload>
        </div>
      </Modal>
    </div>
  );
}

export default FinalizeContract;
