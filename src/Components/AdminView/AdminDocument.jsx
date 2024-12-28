import React, { useState } from "react";
import { Button, Upload, Collapse, Input } from "antd";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import SideNav from "../WorkFlow/SideNav"; 

const { TextArea } = Input;
const { Panel } = Collapse;

const AdminDocumentsPage = () => {
  const [currentSection, setCurrentSection] = useState("");
  const [isDeleteMode, setDeleteMode] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [documents, setDocuments] = useState([
    {
      name: "Admin ISO 9001 Certification",
      source: "ISO 9001",
      dateIssued: "2024-11-22",
    },
    {
      name: "Admin GDPR Compliance Report",
      source: "GDPR",
      dateIssued: "2024-11-18",
    },
    {
      name: "Admin SOC 2 Type II Report",
      source: "SOC 2",
      dateIssued: "2024-11-10",
    },
  ]);

  const handleCheckboxChange = (docName) => {
    setSelectedDocs((prev) =>
      prev.includes(docName)
        ? prev.filter((name) => name !== docName)
        : [...prev, docName]
    );
  };

  const handleDelete = () => {
    setDocuments((prev) =>
      prev.filter((doc) => !selectedDocs.includes(doc.name))
    );
    setDeleteMode(false); 
  };

  return (
    <div className="flex min-h-screen">
      {/* SideNav */}
      <SideNav />

      {/* Main Content */}
      <div className="flex-grow p-8 bg-gray-50">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Project Documents
          </h1>
          <div className="flex gap-4">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCurrentSection("add")}
            >
              Add Document
            </Button>
            <Button
              type="default"
              className={`${isDeleteMode
                  ? "bg-red-500 text-white"
                  : "bg-gray-500 text-white"
                } px-4 py-2 rounded-lg hover:bg-gray-600`}
              onClick={
                isDeleteMode ? handleDelete : () => setDeleteMode(true)
              }
            >
              {isDeleteMode ? "Confirm Delete" : "Delete"}
            </Button>
          </div>
        </div>

        {/* Documents Table */}
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-200 text-gray-600 uppercase text-sm">
            <tr>
              {isDeleteMode && (
                <th className="py-3 px-6 text-left">Select</th>
              )}
              <th className="py-3 px-6 text-left">Document Name</th>
              <th className="py-3 px-6 text-left">Source</th>
              <th className="py-3 px-6 text-left">Date Issued</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc, index) => (
              <tr
                key={index}
                className={`border-b ${index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  }`}
              >
                {isDeleteMode && (
                  <td className="py-3 px-6">
                    <input
                      type="checkbox"
                      className="w-4 h-4"
                      checked={selectedDocs.includes(doc.name)}
                      onChange={() => handleCheckboxChange(doc.name)}
                    />
                  </td>
                )}
                <td className="py-3 px-6">{doc.name}</td>
                <td className="py-3 px-6">{doc.source}</td>
                <td className="py-3 px-6">{doc.dateIssued}</td>
              </tr>
            ))}
          </tbody>
        </table>

        
        {currentSection === "add" && (
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Add New Document</h2>
            <TextArea
              rows={4}
              placeholder="Document description"
              className="mb-4"
            />
            <Upload>
              <Button icon={<UploadOutlined />}>Upload Document</Button>
            </Upload>
            <div className="mt-4">
              <Button type="primary">Save Document</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDocumentsPage;
