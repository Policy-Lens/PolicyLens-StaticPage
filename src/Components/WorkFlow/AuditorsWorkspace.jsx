import { useState, useEffect } from "react";
import { Eye, Download } from "lucide-react";
import FileViewerModal from "../FileViewer/FileViewerModal";
import { message } from "antd";
import { apiRequest, BASE_URL } from "../../utils/api";
import { useParams } from "react-router-dom";
import { useContext } from "react";
import { ProjectContext } from "../../Context/ProjectContext";

const AuditorWorkspace = () => {
  const [files, setFiles] = useState([]);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [viewerModal, setViewerModal] = useState({
    isOpen: false,
    fileUrl: "",
    fileType: "",
    fileName: "",
  });
  const { projectid } = useParams();

  useEffect(() => {
    fetchFiles();
  }, [projectid]);

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest(
        "GET",
        `/api/controlfiles/projects/${projectid}/control-files/`,
        null,
        true
      );
      if (response.status === 200) {
        setFiles(response.data);
      }
    } catch (error) {
      console.error("Error fetching files:", error);
      message.error("Failed to load files");
    } finally {
      setIsLoading(false);
    }
  };

  const openFileViewer = (file) => {
    setViewerModal({
      isOpen: true,
      fileUrl: file.file_path || "",
      fileType: file.file_type?.toLowerCase() || "",
      fileName: file.file_name || "",
    });
  };

  const closeFileViewer = () => {
    setViewerModal({
      ...viewerModal,
      isOpen: false,
    });
  };

  const handleDownload = (file) => {
    if (file.file_path) {
      window.open(`${file.file_path}`, "_blank");
    }
  };

  const handleGenerateMLReport = () => {
    // This is a dummy button for now
    message.info("ML Report generation will be implemented in the future");
  };

  const formatDate = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="flex flex-col h-screen font-sans pl-6 bg-gray-100">
      <div className="flex-1 pl-0 pb-8 pt-0 bg-gray-100 text-gray-800 mr-3">
        <div className="flex justify-between items-center mb-8 mt-5">
          <h1 className="text-2xl font-bold text-blue-900">
            Auditor Workspace
          </h1>
          {selectedFileId && (
            <button
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center hover:bg-indigo-700 transition-colors shadow-sm font-medium"
              onClick={handleGenerateMLReport}
            >
              Generate ML Report
            </button>
          )}
        </div>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              {" "}
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600">
                    Select
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600">
                    File Name
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600">
                    File Type
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600">
                    Regulation Standard
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600">
                    Regulation Control No.
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600">
                    Regulation Control Name
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600">
                    Parent Control
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600">
                    Upload Date
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {files.map((file) => (
                  <tr
                    key={file.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-3 py-2.5 text-sm text-gray-900">
                      <input
                        type="radio"
                        name="fileSelection"
                        checked={selectedFileId === file.id}
                        onChange={() => setSelectedFileId(file.id)}
                        className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-3 py-2.5 text-sm font-medium text-blue-600">
                      {file.file_name}
                    </td>{" "}
                    <td className="px-3 py-2.5 text-sm text-gray-900">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {file.file_type}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-sm text-gray-900">
                      {file.regulation_standard}
                    </td>
                    <td className="px-3 py-2.5 text-sm text-gray-900">
                      {file.regulation_control_no}
                    </td>
                    <td className="px-3 py-2.5 text-sm text-gray-900">
                      {file.regulation_control_name}
                    </td>
                    <td className="px-3 py-2.5 text-sm text-gray-900">
                      {file.parent_control}
                    </td>
                    <td className="px-3 py-2.5 text-sm text-gray-900">
                      {formatDate(file.created_at)}
                    </td>
                    <td className="px-3 py-2.5 text-sm text-gray-900">
                      <div className="flex space-x-2">
                        <button
                          className="p-1 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
                          title="View File"
                          onClick={() => openFileViewer(file)}
                        >
                          <Eye size={16} className="text-blue-600" />
                        </button>
                        <button
                          className="p-1 bg-green-100 rounded-md hover:bg-green-200 transition-colors"
                          title="Download File"
                          onClick={() => handleDownload(file)}
                        >
                          <Download size={16} className="text-green-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* File Viewer Modal */}
      <FileViewerModal
        isOpen={viewerModal.isOpen}
        onClose={closeFileViewer}
        fileUrl={viewerModal.fileUrl}
        fileType={viewerModal.fileType}
        fileName={viewerModal.fileName}
      />
    </div>
  );
};

export default AuditorWorkspace;
