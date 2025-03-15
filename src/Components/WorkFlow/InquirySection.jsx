import React, { useState, useContext, useEffect } from "react";
import { Modal, Input, Upload, Button, message, Select, DatePicker } from "antd";
import { PaperClipOutlined, FileTextOutlined } from "@ant-design/icons";
import { ProjectContext } from "../../Context/ProjectContext";
import { useParams } from "react-router-dom";

const { TextArea } = Input;
const { Option } = Select;

function InquirySection({ isVisible, onClose }) {
  const [fileLists, setFileLists] = useState({});
  const [inputs, setInputs] = useState({
    "Scope": "",
    "Timeline": "",
    "Budget": "",
    "Availability": "",
    "Draft Proposal": ""
  });
  const [stepId, setStepId] = useState(null);
  const [isAssignedUser, setIsAssignedUser] = useState(false);
  const [inquiryData, setInquiryData] = useState([]);
  const [oldFilesNeeded, setOldFilesNeeded] = useState({});
  const [removedOldFiles, setRemovedOldFiles] = useState({});
  const { projectid } = useParams();
  const { addStepData, getStepData, getStepId, checkStepAuth, projectRole } = useContext(ProjectContext);

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const handleUploadChange = (panelKey, { fileList }) => {
    setFileLists((prev) => ({ ...prev, [panelKey]: fileList }));
  };

  const handleRemoveFile = (fieldKey, fileUrl) => {
    setOldFilesNeeded(prev => ({
      ...prev,
      [fieldKey]: prev[fieldKey].filter(file => file !== fileUrl)
    }));
    setRemovedOldFiles(prev => ({
      ...prev,
      [fieldKey]: [...(prev[fieldKey] || []), fileUrl]
    }));
  };

  const handleRestoreFile = (fieldKey, fileUrl) => {
    setRemovedOldFiles(prev => ({
      ...prev,
      [fieldKey]: prev[fieldKey].filter(file => file !== fileUrl)
    }));
    setOldFilesNeeded(prev => ({
      ...prev,
      [fieldKey]: [...(prev[fieldKey] || []), fileUrl]
    }));
  };

  const checkAssignedUser = async (step_id) => {
    const isAuthorized = await checkStepAuth(step_id);
    setIsAssignedUser(isAuthorized);
  };

  const handleSubmit = async (fieldName) => {
    if (!inputs[fieldName]?.trim()) {
      message.warning(`Please provide ${fieldName} details.`);
      return;
    }

    const formData = new FormData();
    formData.append("field_name", fieldName);
    formData.append("text_data", inputs[fieldName]);

    if (oldFilesNeeded[fieldName]?.length > 0) {
      formData.append("old_files", JSON.stringify(oldFilesNeeded[fieldName]));
    }

    if (fileLists[fieldName]) {
      fileLists[fieldName].forEach((file) => {
        formData.append("files", file.originFileObj || file);
      });
    }

    try {
      const response = await addStepData(stepId, formData);
      
      if (response.status === 201) {
        message.success(`${fieldName} submitted successfully!`);
        
        setFileLists(prev => ({ ...prev, [fieldName]: [] }));
        
        await get_step_data(stepId);
      } else {
        message.error(`Failed to submit ${fieldName}.`);
      }
    } catch (error) {
      message.error(`Failed to submit ${fieldName}.`);
      console.error(error);
    }
  };

  const get_step_id = async () => {
    const step_id = await getStepId(projectid, 2);
    if (step_id) {
      setStepId(step_id);
      await get_step_data(step_id);
      await checkAssignedUser(step_id);
    }
  };

  const get_step_data = async (step_id) => {
    const stepData = await getStepData(step_id);
    setInquiryData(stepData || []);
    
    if (stepData && stepData.length > 0) {
      const newInputs = {};
      const newOldFiles = {};
      const newRemovedFiles = {};
      
      const groupedData = stepData.reduce((acc, item) => {
        const fieldName = item.field_name;
        acc[fieldName] = item;
        return acc;
      }, {});
      
      Object.entries(groupedData).forEach(([fieldName, item]) => {
        newInputs[fieldName] = item.text_data;
        
        if (item.documents && item.documents.length > 0) {
          newOldFiles[fieldName] = item.documents.map(doc => doc.file);
          newRemovedFiles[fieldName] = [];
        } else {
          newOldFiles[fieldName] = [];
          newRemovedFiles[fieldName] = [];
        }
      });
      
      const allFields = ['Scope', 'Timeline', 'Budget', 'Availability', 'Draft Proposal'];
      allFields.forEach(field => {
        if (!newInputs[field]) newInputs[field] = '';
        if (!newOldFiles[field]) newOldFiles[field] = [];
        if (!newRemovedFiles[field]) newRemovedFiles[field] = [];
      });

      setInputs(newInputs);
      setOldFilesNeeded(newOldFiles);
      setRemovedOldFiles(newRemovedFiles);
      setFileLists({});
    } else {
      setInputs({
        "Scope": "",
        "Timeline": "",
        "Budget": "",
        "Availability": "",
        "Draft Proposal": ""
      });
      setOldFilesNeeded({
        "Scope": [],
        "Timeline": [],
        "Budget": [],
        "Availability": [],
        "Draft Proposal": []
      });
      setRemovedOldFiles({
        "Scope": [],
        "Timeline": [],
        "Budget": [],
        "Availability": [],
        "Draft Proposal": []
      });
      setFileLists({});
    }
  };

  useEffect(() => {
    get_step_id();
  }, []);

  useEffect(() => {
    if (isVisible && stepId) {
      get_step_data(stepId);
    }
  }, [isVisible]);

  const getFileName = (filePath) => {
    return filePath.split('/').pop();
  };

  const renderInputWithAttachButton = (fieldName, placeholder, isLarge = false) => {
    const hasExistingData = inquiryData.some(item => 
      item.field_name === fieldName
    );

    return (
      <div className="space-y-4">
        <div className="relative border border-gray-300 rounded-lg overflow-hidden">
          {isLarge ? (
            <TextArea
              rows={6}
              placeholder={placeholder}
              value={inputs[fieldName] || ""}
              onChange={(e) => handleInputChange(fieldName, e.target.value)}
              className="border-none resize-none p-4 pr-[100px] text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <Input
              placeholder={placeholder}
              value={inputs[fieldName] || ""}
              onChange={(e) => handleInputChange(fieldName, e.target.value)}
              className="border-none p-4 pr-[100px] text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
        </div>

        {oldFilesNeeded[fieldName]?.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Existing Files</h4>
            <div className="space-y-2">
              {oldFilesNeeded[fieldName].map((fileUrl) => (
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
                      onClick={() => handleRemoveFile(fieldName, fileUrl)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {removedOldFiles[fieldName]?.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Removed Files</h4>
            <div className="space-y-2">
              {removedOldFiles[fieldName].map((fileUrl) => (
                <div key={fileUrl} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <div className="flex items-center">
                    <FileTextOutlined className="text-red-500 mr-2" />
                    <span className="text-sm text-gray-600">{getFileName(fileUrl)}</span>
                  </div>
                  <Button 
                    type="text" 
                    onClick={() => handleRestoreFile(fieldName, fileUrl)}
                  >
                    Restore
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4">
          <Upload
            fileList={fileLists[fieldName] || []}
            onChange={(info) => handleUploadChange(fieldName, info)}
            beforeUpload={() => false}
            showUploadList={true}
            multiple
          >
            <Button
              icon={<PaperClipOutlined />}
              className="bg-gray-100 rounded-full px-4 py-1 text-sm font-semibold text-gray-600 shadow-sm hover:bg-gray-200 focus:outline-none"
            >
              Attach New Files
            </Button>
          </Upload>
        </div>

        <div className="mt-4 flex justify-end">
          <Button 
            type="primary" 
            onClick={() => handleSubmit(fieldName)}
            className="bg-blue-500 text-white"
          >
            {hasExistingData ? "Update" : "Submit"} {fieldName}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Modal 
      open={isVisible} 
      onCancel={() => {
        onClose();
      }} 
      footer={null} 
      width={800}
    >
      <h2 className="text-xl font-bold text-gray-800 mb-4">Inquiry Section</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-md font-semibold text-gray-700 mb-2">Scope</h3>
          {renderInputWithAttachButton("Scope", "Enter the scope of the project", true)}
        </div>

        <div>
          <h3 className="text-md font-semibold text-gray-700 mb-2">Timeline</h3>
          {renderInputWithAttachButton("Timeline", "Add timeline details")}
        </div>

        <div>
          <h3 className="text-md font-semibold text-gray-700 mb-2">Budget</h3>
          {renderInputWithAttachButton("Budget", "Enter budget")}
        </div>

        <div>
          <h3 className="text-md font-semibold text-gray-700 mb-2">Availability</h3>
          {renderInputWithAttachButton("Availability", "Enter availability details")}
        </div>

        <div>
          <h3 className="text-md font-semibold text-gray-700 mb-2">Draft Proposal</h3>
          {renderInputWithAttachButton("Draft Proposal", "Upload draft proposal", true)}
        </div>
      </div>
    </Modal>
  );
}

function InquiryPage() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [inquiryData, setInquiryData] = useState([]);
  const [stepId, setStepId] = useState(null);
  const [isAssignedUser, setIsAssignedUser] = useState(false);
  const { projectid } = useParams();
  const { 
    getStepData, 
    getStepId, 
    checkStepAuth, 
    projectRole
  } = useContext(ProjectContext);

  const getFileName = (filePath) => {
    return filePath.split('/').pop();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const checkAssignedUser = async (step_id) => {
    const isAuthorized = await checkStepAuth(step_id);
    setIsAssignedUser(isAuthorized);
  };

  const get_step_id = async () => {
    const step_id = await getStepId(projectid, 2);
    if (step_id) {
      setStepId(step_id);
      await get_step_data(step_id);
      await checkAssignedUser(step_id);
    }
  };

  const get_step_data = async (step_id) => {
    const stepData = await getStepData(step_id);
    setInquiryData(stepData || []);
  };

  useEffect(() => {
    get_step_id();
  }, []);

  const groupedData = inquiryData.reduce((acc, item) => {
    if (!acc[item.field_name]) {
      acc[item.field_name] = [];
    }
    acc[item.field_name].push(item);
    return acc;
  }, {});

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Inquiry Section</h2>
        {(projectRole.includes("admin") || isAssignedUser) && (
          <Button 
            type="primary" 
            onClick={() => setIsModalVisible(true)}
            className="bg-blue-500 text-white font-semibold py-1 px-4 rounded-lg hover:bg-blue-600 focus:outline-none"
          >
            {inquiryData.length > 0 ? "Update Data" : "Add Data"}
          </Button>
        )}
      </div>

      {Object.keys(groupedData).length > 0 && (
        <div className="bg-gray-50 p-6 rounded-lg space-y-3 mb-6">
          <h3 className="text-lg font-semibold text-gray-700">Saved Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(groupedData).map(([fieldName, items]) => (
              items.map((item) => (
                <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-gray-700">{item.field_name}</h4>
                    <p className="text-xs text-gray-500 mb-2">{formatDate(item.saved_at)}</p>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{item.text_data}</p>
                  {item.documents && item.documents.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-gray-600 mb-1">Attached Documents:</p>
                      <ul className="text-xs text-gray-500">
                        {item.documents.map((doc) => (
                          <li key={doc.id} className="flex items-center justify-between mb-1">
                            <span>{getFileName(doc.file)}</span>
                            <a 
                              href={`http://localhost:8000${doc.file}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:text-blue-700"
                            >
                              View File
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-2">
                    <p>Saved by: {item.saved_by.name} - {item.saved_by.email}</p>
                  </div>
                </div>
              ))
            ))}
          </div>
        </div>
      )}

      <InquirySection 
        isVisible={isModalVisible} 
        onClose={() => setIsModalVisible(false)} 
      />
    </div>
  );
}

export default InquiryPage;
