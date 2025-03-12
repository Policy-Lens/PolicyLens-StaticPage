import React, { useState } from "react";
import { Button, Modal, Input, Upload, message } from "antd";
import { PaperClipOutlined, FileTextOutlined } from "@ant-design/icons";

const { TextArea } = Input;

function ServiceRequirements() {
  const [fileList, setFileList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [description, setDescription] = useState("");

  // Mock data from the provided JSON
  const serviceRequirementsData = [
    {
      "id": 7,
      "step": 27,
      "field_name": "Service Requirements",
      "text_data": "This is the service requirement description",
      "sequence_no": 2,
      "saved_by": 8,
      "saved_at": "2025-03-08T20:34:26.107907Z",
      "documents": [
        {
          "id": 3,
          "file": "/media/projects/16/documents/gaurav_aadhar_fiCPtp5.pdf",
          "tag": "",
          "created_at": "2025-03-08T20:34:26.119905Z"
        },
        {
          "id": 4,
          "file": "/media/projects/16/documents/gaurav_btech_4UvmJ0j.pdf",
          "tag": "",
          "created_at": "2025-03-08T20:34:26.126904Z"
        }
      ]
    }
  ];

  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const handleSubmit = () => {
    if (!description.trim()) {
      message.warning("Please provide a description.");
      return;
    }
    console.log("Description:", description);
    console.log("Uploaded Files:", fileList);
    message.success("Service requirements submitted successfully!");
    setIsModalOpen(false);
    setDescription("");
    setFileList([]);
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

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Service Requirements</h2>
        <Button
          className="bg-blue-500 text-white font-semibold py-1 px-4 rounded-lg hover:bg-blue-600 focus:outline-none"
          onClick={() => setIsModalOpen(true)}
        >
          Add Data
        </Button>
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
            <p>Saved by: User {item.saved_by}</p>
            <p>Saved at: {formatDate(item.saved_at)}</p>
          </div>
        </div>
      ))}

      <Modal
        title="Add Service Requirements"
        visible={isModalOpen}
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
