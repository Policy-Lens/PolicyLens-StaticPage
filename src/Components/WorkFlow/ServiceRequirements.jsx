import React, { useState,useContext,useEffect } from "react";
import { Button, Modal, Input, Upload, message } from "antd";
import { PaperClipOutlined, FileTextOutlined } from "@ant-design/icons";
import { ProjectContext } from "../../Context/ProjectContext";
import { useParams } from "react-router-dom";
const { TextArea } = Input;

function ServiceRequirements() {
  const [fileList, setFileList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [isAssignedUser,setIsAssignedUser] = useState(false);
  const {projectid} = useParams();
  const { addStepData,getStepData, getStepId ,projectRole,checkStepAuth} = useContext(ProjectContext);
  const [serviceRequirementsData, setServiceRequirementsData] = useState([]);
  const [stepId, setStepId] = useState(null);
  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const checkAssignedUser = async() =>{
    const isAuthorized = await checkStepAuth(stepId);
    console.log(isAuthorized);
    setIsAssignedUser(isAuthorized);
  }

  const handleSubmit = async () => {
    if (!description.trim()) {
        message.warning("Please provide a description.");
        return;
    }

    // Create a FormData object
    const formData = new FormData();
    formData.append("field_name", "Service Requirements");
    formData.append("text_data", description);

    // Append files to FormData
    fileList.forEach((file, index) => {
        formData.append(`files`, file);
    });

    try {
        const response = await addStepData(stepId, formData);
        if(response.status==201){
            message.success("Service requirements submitted successfully!");
        }
        else{
            message.error("Failed to submit service requirements.");
        }
    } catch (error) {
        message.error("Failed to submit service requirements.");
        console.error(error);
    }

    setIsModalOpen(false);
    setDescription("");
    setFileList([]);
    getStepData(stepId)
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
  const get_step_id = async() =>{
    const step_id = await getStepId(projectid,1);
    setStepId(step_id);
    console.log(step_id)
    get_step_data(step_id);
    checkAssignedUser();
  }

  const get_step_data = async(step_id) =>{
    const stepData = await getStepData(step_id);
    console.log(stepData);
    setServiceRequirementsData(stepData);
  }

  useEffect(() => {
    get_step_id();
  }, []);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Service Requirements</h2>
        {(projectRole.includes("admin") || isAssignedUser) && <Button
          className="bg-blue-500 text-white font-semibold py-1 px-4 rounded-lg hover:bg-blue-600 focus:outline-none"
          onClick={() => setIsModalOpen(true)}
        >
          Add Data
        </Button>}
      </div>

      {/* Display the service requirements data */}
      {serviceRequirementsData.map((item) => (
        <div key={item.id} className="bg-white rounded-lg p-4 mb-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Description</h3>
            <p className="text-gray-600">{item.text_data}</p>
          </div>

          {item.documents.length > 0 && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Documents</h3>
              <ul className="space-y-2">
                {item.documents.map((doc) => (
                  <li key={doc.id} className="flex items-center">
                    <FileTextOutlined className="text-blue-500 mr-2" />
                    <span className="text-gray-600">{getFileName(doc.file)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="text-sm text-gray-500 mt-2">
            <p><b>Saved by:</b> {item.saved_by.name} - {item.saved_by.email}</p>
            <p><b>Saved at:</b> {formatDate(item.saved_at)}</p>
          </div>
        </div>
      ))}

      <Modal
        title="Add Service Requirements"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
        width={600}
      >
        <div className="relative border border-gray-300 rounded-lg overflow-hidden p-4">
          <TextArea
            rows={4}
            placeholder="Enter the service requirements"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border-none resize-none text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
      </Modal>
    </div>
  );
}

export default ServiceRequirements;
