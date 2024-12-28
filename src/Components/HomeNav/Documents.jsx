import React, { useState } from "react";
import { Layout } from "antd";
import Sidebar from "./Sidebar"; // Adjust the import path to match your project structure

const { Content } = Layout;

const DocumentsPage = () => {
    const [documents, setDocuments] = useState([
        {
            name: "ISO 27001 Certification",
            source: "ISO 27001",
            dateIssued: "2024-11-25",
        },
        {
            name: "ISO 27701 Certification",
            source: "ISO 27701",
            dateIssued: "2024-11-20",
        },
        {
            name: "PCI DSS Compliance Report",
            source: "PCI DSS",
            dateIssued: "2024-11-15",
        },
    ]);

    const [isDeleteMode, setDeleteMode] = useState(false);
    const [selectedDocs, setSelectedDocs] = useState([]);

    const toggleDeleteMode = () => {
        setDeleteMode(!isDeleteMode);
        setSelectedDocs([]); // Reset selections when toggling
    };

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
        toggleDeleteMode(); // Exit delete mode after deleting
    };

    return (
        <Layout style={{ minHeight: "100vh" }}>
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <Layout style={{ marginLeft: "220px" }}> {/* Added marginLeft for sidebar width */}
                <Content className="p-8 bg-gray-50">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">
                            Documents
                        </h1>
                        <div className="flex gap-4">
                            <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition">
                                Add Document
                            </button>
                            <button
                                className={`${isDeleteMode ? "bg-red-500 text-white" : "bg-gray-500 text-white"
                                    } px-4 py-2 rounded-lg hover:bg-gray-600 hover:text-white transition`}
                                onClick={isDeleteMode ? handleDelete : toggleDeleteMode}
                            >
                                {isDeleteMode ? "Confirm Delete" : "Delete"}
                            </button>
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
                                                onChange={() =>
                                                    handleCheckboxChange(doc.name)
                                                }
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
                </Content>
            </Layout>
        </Layout>
    );
};

export default DocumentsPage;
