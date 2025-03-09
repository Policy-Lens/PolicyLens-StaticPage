import React, { useState } from "react";
import { Button, Upload, Input } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import SideNav from "../WorkFlow/SideNav";

const { TextArea } = Input;

const AdminDocumentsPage = () => {
  const [currentSection, setCurrentSection] = useState(""); // Manage sections (Add, Edit, etc.)
  const [isDeleteMode, setDeleteMode] = useState(false); // Track if delete mode is active
  const [selectedDocs, setSelectedDocs] = useState([]); // Track selected documents for deletion
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
  const [collapsed, setCollapsed] = useState(false); // Track SideNav state

  // Handle checkbox change for selecting documents for deletion
  const handleCheckboxChange = (docName) => {
    setSelectedDocs((prev) =>
      prev.includes(docName)
        ? prev.filter((name) => name !== docName)
        : [...prev, docName]
    );
  };

  // Handle deletion of selected documents
  const handleDelete = () => {
    setDocuments((prev) =>
      prev.filter((doc) => !selectedDocs.includes(doc.name))
    );
    setDeleteMode(false); // Exit delete mode after deletion
  };

  // Show "Edit" buttons and multi-select options
  const handleEditClick = () => {
    setCurrentSection("edit");
  };

  return (
    <div className="flex min-h-screen p-0">
      {/* Main Content */}
      <div
        className="flex-grow p-8 bg-gray-50 transition-all duration-300 "
      >
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Project Documents</h1>

        {/* Action buttons (Add, Delete, Cancel) */}
        <div className="flex justify-end gap-4 mb-4">
          {currentSection === "edit" ? (
            <>
              {/* Add Document Button */}
              <Button
                onClick={() => setCurrentSection("add")}
                className="px-4 py-2 rounded-lg font-medium shadow-md bg-gray-500 text-white hover:bg-gray-600"
              >
                Add Document
              </Button>

              {/* Delete Button */}
              <Button
                onClick={isDeleteMode ? handleDelete : () => setDeleteMode(true)}
                className={`px-4 py-2 rounded-lg font-medium shadow-md transition 
                ${isDeleteMode ? "bg-red-500 text-white hover:bg-red-600" : "bg-gray-500 text-white hover:bg-gray-600"}`}
              >
                {isDeleteMode ? "Confirm Delete" : "Delete"}
              </Button>

              {/* Cancel Button */}
              <Button
                onClick={() => setCurrentSection("")}
                className="px-4 py-2 rounded-lg font-medium shadow-md bg-gray-500 text-white hover:bg-gray-600"
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button
              onClick={handleEditClick}
              className="px-4 py-2 rounded-lg font-medium shadow-md bg-blue-500 text-white hover:bg-blue-600"
            >
              Edit
            </Button>
          )}
        </div>

        {/* Document Table */}
        <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
          <table className="min-w-full border-collapse border border-gray-300 text-sm">
            <thead className="bg-gradient-to-r from-blue-100 to-blue-200 border-b border-gray-300">
              <tr>
                {isDeleteMode && (
                  <th className="py-4 px-6 text-left font-semibold text-blue-800 uppercase">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedDocs(documents.map((doc) => doc.name));
                        } else {
                          setSelectedDocs([]);
                        }
                      }}
                      checked={selectedDocs.length === documents.length}
                      className="accent-blue-600"
                    />
                  </th>
                )}
                <th className="py-4 px-6 text-left font-semibold text-blue-800 uppercase">
                  Document Name
                </th>
                <th className="py-4 px-6 text-left font-semibold text-blue-800 uppercase">
                  Source
                </th>
                <th className="py-4 px-6 text-left font-semibold text-blue-800 uppercase">
                  Date Issued
                </th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc, index) => (
                <tr
                  key={index}
                  className={`border-b border-gray-200 transition ${index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    } hover:bg-blue-100`}
                >
                  {isDeleteMode && (
                    <td className="py-4 px-6">
                      <input
                        type="checkbox"
                        className="w-4 h-4"
                        checked={selectedDocs.includes(doc.name)}
                        onChange={() => handleCheckboxChange(doc.name)}
                      />
                    </td>
                  )}
                  <td className="py-4 px-6 font-medium text-gray-800">{doc.name}</td>
                  <td className="py-4 px-6 text-gray-700">{doc.source}</td>
                  <td className="py-4 px-6 text-gray-700">{doc.dateIssued}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Document Section */}
        {currentSection === "add" && (
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Add New Document</h2>
            <TextArea
              rows={4}
              placeholder="Document description"
              className="mb-4"
            />
            <Upload>
              <Button
                icon={<UploadOutlined />}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition"
              >
                Upload Document
              </Button>
            </Upload>
            <div className="mt-4">
              <Button
                type="primary"
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
              >
                Save Document
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDocumentsPage;
