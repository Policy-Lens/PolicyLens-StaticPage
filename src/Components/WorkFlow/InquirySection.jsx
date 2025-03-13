import React, { useState, useContext, useEffect } from "react";
import { Modal, Input, Upload, Button, message } from "antd";
import { PaperClipOutlined, FileTextOutlined } from "@ant-design/icons";
import { ProjectContext } from "../../Context/ProjectContext";
import { useParams } from "react-router-dom";

const { TextArea } = Input;

function InquirySection({ isVisible, onClose }) {
  const [fileLists, setFileLists] = useState({});
  const [inputs, setInputs] = useState({
    scope: "",
    timeline: "",
    budget: "",
    availability: "",
    draftProposal: ""
  });
  const [stepId, setStepId] = useState(null);
  const [isAssignedUser, setIsAssignedUser] = useState(false);
  const [inquiryData, setInquiryData] = useState([]);
  const { projectid } = useParams();
  const { addStepData, getStepData, getStepId, checkStepAuth, projectRole } = useContext(ProjectContext);

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const handleUploadChange = (panelKey, { fileList }) => {
    setFileLists((prev) => ({ ...prev, [panelKey]: fileList }));
  };

  const checkAssignedUser = async () => {
    const isAuthorized = await checkStepAuth(stepId);
    setIsAssignedUser(isAuthorized);
  };

  const handleSubmit = async (fieldName) => {
    if (!inputs[fieldName.replace(' ', '').toLowerCase()]?.trim()) {
      message.warning(`Please provide ${fieldName} details.`);
      return;
    }

    const formData = new FormData();
    formData.append("field_name", fieldName);
    formData.append("text_data", inputs[fieldName.replace(' ', '').toLowerCase()]);

    // Append files
    if (fileLists[fieldName]) {
      fileLists[fieldName].forEach((file) => {
        formData.append("files", file.originFileObj || file);
      });
    }

    try {
      const response = await addStepData(stepId, formData);
      console.log(response);
      if (response.status === 201) {
        message.success(`${fieldName} submitted successfully!`);
        
        // Reset the specific field and its files
        setInputs(prev => ({ ...prev, [fieldName]: "" }));
        setFileLists(prev => ({ ...prev, [fieldName]: [] }));
        
        // Refresh data
        get_step_data(stepId);
      } else {
        message.error(`Failed to submit ${fieldName}.`);
      }
    } catch (error) {
      message.error(`Failed to submit ${fieldName}.`);
      console.error(error);
    }
  };

  const get_step_id = async () => {
    const step_id = await getStepId(projectid, 2); // Assuming this is step 2
    setStepId(step_id);
    if (step_id) {
      get_step_data(step_id);
      checkAssignedUser();
    }
  };

  const get_step_data = async (step_id) => {
    const stepData = await getStepData(step_id);
    setInquiryData(stepData || []);
  };

  useEffect(() => {
    get_step_id();
  }, []);

  // Helper function to extract filename from path
  const getFileName = (filePath) => {
    return filePath.split('/').pop();
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const renderInputWithAttachButton = (panelKey, placeholder, isLarge = false) => (
    <div className="relative border border-gray-300 rounded-lg overflow-hidden">
      {isLarge ? (
        <TextArea
          rows={6}
          placeholder={placeholder}
          value={inputs[panelKey] || ""}
          onChange={(e) => handleInputChange(panelKey, e.target.value)}
          className="border-none resize-none p-4 pr-[100px] text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      ) : (
        <Input
          placeholder={placeholder}
          value={inputs[panelKey] || ""}
          onChange={(e) => handleInputChange(panelKey, e.target.value)}
          className="border-none p-4 pr-[100px] text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      )}
      <div className={`absolute ${isLarge ? 'bottom-3' : 'top-1/2 -translate-y-1/2'} right-4`}>
        <Upload
          fileList={fileLists[panelKey] || []}
          onChange={(info) => handleUploadChange(panelKey, info)}
          beforeUpload={() => false}
          showUploadList={false}
          multiple
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
  );

  return (
    <Modal open={isVisible} onCancel={onClose} footer={null} width={800}>
      <h2 className="text-xl font-bold text-gray-800 mb-4">Inquiry Section</h2>
      
      <div className="space-y-6">
        {/* Scope */}
        <div>
          <h3 className="text-md font-semibold text-gray-700 mb-2">Scope</h3>
          {renderInputWithAttachButton("scope", "Enter the scope of the project", true)}
          <div className="mt-2 flex justify-end">
            <Button 
              type="primary" 
              onClick={() => handleSubmit("Scope")}
              className="bg-blue-500 text-white"
            >
              Submit Scope
            </Button>
          </div>
        </div>

        {/* Timeline */}
        <div>
          <h3 className="text-md font-semibold text-gray-700 mb-2">Timeline</h3>
          {renderInputWithAttachButton("timeline", "Add timeline details")}
          <div className="mt-2 flex justify-end">
            <Button 
              type="primary" 
              onClick={() => handleSubmit("Timeline")}
              className="bg-blue-500 text-white"
            >
              Submit Timeline
            </Button>
          </div>
        </div>

        {/* Budget */}
        <div>
          <h3 className="text-md font-semibold text-gray-700 mb-2">Budget</h3>
          {renderInputWithAttachButton("budget", "Enter budget")}
          <div className="mt-2 flex justify-end">
            <Button 
              type="primary" 
              onClick={() => handleSubmit("Budget")}
              className="bg-blue-500 text-white"
            >
              Submit Budget
            </Button>
          </div>
        </div>

        {/* Availability */}
        <div>
          <h3 className="text-md font-semibold text-gray-700 mb-2">Availability</h3>
          {renderInputWithAttachButton("availability", "Enter availability details")}
          <div className="mt-2 flex justify-end">
            <Button 
              type="primary" 
              onClick={() => handleSubmit("Availability")}
              className="bg-blue-500 text-white"
            >
              Submit Availability
            </Button>
          </div>
        </div>

        {/* Draft Proposal */}
        <div>
          <h3 className="text-md font-semibold text-gray-700 mb-2">Draft Proposal</h3>
          {renderInputWithAttachButton("draftProposal", "Upload draft proposal", true)}
          <div className="mt-2 flex justify-end">
            <Button 
              type="primary" 
              onClick={() => handleSubmit("Draft Proposal")}
              className="bg-blue-500 text-white"
            >
              Submit Draft Proposal
            </Button>
          </div>
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
  const { getStepData, getStepId, checkStepAuth, projectRole } = useContext(ProjectContext);

  // Helper functions
  const getFileName = (filePath) => {
    return filePath.split('/').pop();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const checkAssignedUser = async () => {
    const isAuthorized = await checkStepAuth(stepId);
    setIsAssignedUser(isAuthorized);
  };

  const get_step_id = async () => {
    const step_id = await getStepId(projectid, 2); // Assuming this is step 2
    setStepId(step_id);
    if (step_id) {
      get_step_data(step_id);
      checkAssignedUser();
    }
  };

  const get_step_data = async (step_id) => {
    const stepData = await getStepData(step_id);
    setInquiryData(stepData || []);
  };

  useEffect(() => {
    get_step_id();
  }, []);

  // Group inquiry data by field_name
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
            Add Data
          </Button>
        )}
      </div>

      {/* Display Saved Information */}
      {Object.keys(groupedData).length > 0 && (
        <div className="bg-gray-50 p-6 rounded-lg space-y-3 mb-6">
          <h3 className="text-lg font-semibold text-gray-700">Saved Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(groupedData).map(([fieldName, items]) => (
              items.map((item) => (
                <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm">
                  <h4 className="font-medium text-gray-700">{item.field_name}</h4>
                  <p className="text-sm text-gray-600 mt-2">{item.text_data}</p>
                  <div className="text-xs text-gray-500 mt-2">
                    Saved by: {item.saved_by.name} - {item.saved_by.email}
                    <span className="mx-2">•</span>
                    Saved at: {formatDate(item.saved_at)}
                  </div>
                  {item.documents && item.documents.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-gray-600 mb-1">Attached Documents:</p>
                      <ul className="text-xs text-gray-500 list-disc pl-4">
                        {item.documents.map((doc) => (
                          <li key={doc.id}>{getFileName(doc.file)}</li>
                        ))}
                      </ul>
                    </div>
                  )}
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
