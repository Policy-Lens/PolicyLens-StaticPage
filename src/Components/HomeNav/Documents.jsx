import { useState } from "react";
import { Layout } from "antd";

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

  const [isActionMode, setIsActionMode] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState([]);

  const toggleActionMode = () => {
    setIsActionMode(!isActionMode);
    setSelectedDocs([]);
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
    toggleActionMode();
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Content className="p-8 bg-gray-50">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Documents</h1>
          <div className="flex gap-4">
            <button
              className={`px-4 py-2 rounded-lg font-medium shadow-md transition ${
                isActionMode
                  ? "bg-gray-500 text-white"
                  : "bg-blue-500 text-white"
              }`}
              onClick={toggleActionMode}
            >
              {isActionMode ? "Cancel" : "Edit"}
            </button>
            {isActionMode && (
              <>
                <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition">
                  Add Document
                </button>
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                  onClick={handleDelete}
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>

        {/* Documents Table */}
        <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
          <table className="min-w-full border-collapse border border-gray-200 text-sm">
            <thead className="bg-gradient-to-r from-blue-100 to-blue-200 border-b border-gray-300">
              <tr>
                {isActionMode && (
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
                  className={`border-b border-gray-200 transition ${
                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } hover:bg-blue-100`}
                >
                  {isActionMode && (
                    <td className="py-4 px-6 text-left">
                      <input
                        type="checkbox"
                        checked={selectedDocs.includes(doc.name)}
                        onChange={() => handleCheckboxChange(doc.name)}
                        className="accent-blue-600"
                      />
                    </td>
                  )}
                  <td className="py-4 px-6 font-medium text-gray-900">
                    {doc.name}
                  </td>
                  <td className="py-4 px-6 text-gray-700">{doc.source}</td>
                  <td className="py-4 px-6 text-gray-700">{doc.dateIssued}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Content>
    </Layout>
  );
};

export default DocumentsPage;
