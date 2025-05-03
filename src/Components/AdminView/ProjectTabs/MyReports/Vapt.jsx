import React, { useState, useRef, useEffect } from "react";
import { apiRequest } from "../../../../utils/api";
import { useParams } from "react-router-dom";
import { use } from "react";
import { message } from "antd";

// Remove the WebViewer import from @pdftron/webviewer
// import WebViewer from '@pdftron/webviewer';

// Add a script loader function to dynamically load WebViewer from CDN
const loadWebViewerScript = () => {
  return new Promise((resolve, reject) => {
    // Check if script is already loaded
    if (window.WebViewer) {
      resolve(window.WebViewer);
      return;
    }

    const script = document.createElement("script");
    script.type = "text/javascript";
    // Use the CDN URL for the latest version
    script.src =
      "https://cdn.jsdelivr.net/npm/@pdftron/webviewer@11.4.0/webviewer.min.js";
    script.async = true;
    script.onload = () => resolve(window.WebViewer);
    script.onerror = (error) =>
      reject(new Error(`Failed to load WebViewer script: ${error}`));
    document.head.appendChild(script);
  });
};

// Reusable Confirmation Modal Component
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        ></div>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg
                  className="h-6 w-6 text-red-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3
                  className="text-lg leading-6 font-medium text-gray-900"
                  id="modal-title"
                >
                  {title}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">{message}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onConfirm}
            >
              {confirmText}
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Vapt = () => {
  // PDF viewer state
  const [loading, setLoading] = useState(false);
  // const pdfFile = '/VAPTSummary.pdf'; // Fixed file path
  const [pdfFile, setPdfFile] = useState(null);
  const viewerDiv = useRef(null);
  const instance = useRef(null);
  const [vapt_reports, setVaptReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const { projectid } = useParams();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [newReportName, setNewReportName] = useState("");
  const [newReportFile, setNewReportFile] = useState(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);

  // Fetch VAPT reports
  const fetchVaptReports = async () => {
    setIsLoading(true);
    try {
      const res = await apiRequest(
        "GET",
        `/api/rarpt/project/${projectid}/vapt/`,
        null,
        true
      );

      if (res.status === 200) {
        setIsLoading(false);
        setVaptReports(res.data);

        // Only set selected report and PDF if we have reports
        if (res.data.length > 0) {
          const reportToSelect = res.data[0]; // Select the first report by default
          setSelectedReport(reportToSelect);
          setPdfFile(reportToSelect.file);

          // Add a small delay to ensure DOM is ready
          setTimeout(async () => {
            try {
              // Clean up existing viewer if it exists
              if (instance.current?.Core?.documentViewer) {
                await instance.current.Core.documentViewer.closeDocument();
              }
              if (viewerDiv.current) {
                while (viewerDiv.current.firstChild) {
                  viewerDiv.current.removeChild(viewerDiv.current.firstChild);
                }
              }

              // Initialize new viewer
              const WebViewer = await loadWebViewerScript();
              instance.current = await WebViewer(
                {
                  path: "https://cdn.jsdelivr.net/npm/@pdftron/webviewer@11.4.0/public",
                  licenseKey:
                    "demo:1745828072801:611d0a550300000000bd7a20b30087cff7b07798aba974b478971f4722",
                  fullAPI: true,
                  enableFilePicker: false,
                  disabledElements: ["ribbons", "toolsHeader"],
                  initialDoc: reportToSelect.file,
                },
                viewerDiv.current
              );

              const { UI } = instance.current;
              UI.setTheme("light");
            } catch (e) {
              console.error("Error initializing viewer:", e);
              setError("Failed to initialize document viewer");
            }
          }, 100); // 100ms delay
        } else {
          setSelectedReport(null);
          setPdfFile(null);
        }
      } else {
        setVaptReports([]);
        setSelectedReport(null);
        setPdfFile(null);
      }
    } catch (err) {
      console.error("Error fetching VAPT reports:", err);
      setError("Failed to fetch reports");
      setVaptReports([]);
      setSelectedReport(null);
      setPdfFile(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVaptReports();
  }, [projectid]); // Add projectid as dependency

  // Handle report selection change
  const handleSheetChange = async (reportId) => {
    if (reportId === "create") {
      setShowReportModal(true);
      return;
    }

    const report = vapt_reports.find((r) => r.id === parseInt(reportId));
    if (report) {
      setLoading(true);
      try {
        // Clean up existing viewer completely
        if (instance.current?.Core?.documentViewer) {
          await instance.current.Core.documentViewer.closeDocument();
        }
        if (viewerDiv.current) {
          while (viewerDiv.current.firstChild) {
            viewerDiv.current.removeChild(viewerDiv.current.firstChild);
          }
        }

        // Update state
        setSelectedReport(report);
        setPdfFile(report.file);

        // Reinitialize viewer with new document
        const WebViewer = await loadWebViewerScript();
        instance.current = await WebViewer(
          {
            path: "https://cdn.jsdelivr.net/npm/@pdftron/webviewer@11.4.0/public",
            licenseKey:
              "demo:1745828072801:611d0a550300000000bd7a20b30087cff7b07798aba974b478971f4722",
            fullAPI: true,
            enableFilePicker: false,
            disabledElements: ["ribbons", "toolsHeader"],
            initialDoc: report.file,
          },
          viewerDiv.current
        );

        const { UI } = instance.current;
        UI.setTheme("light");
      } catch (e) {
        console.error("Error switching document:", e);
        setError("Failed to load document");
      } finally {
        setLoading(false);
      }
    }
  };

  // Create new VAPT report
  const createReport = async () => {
    if (!newReportFile) {
      setError("Please select a file to upload");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", newReportFile);
      if (newReportName.trim()) {
        formData.append("name", newReportName.trim());
      }

      const response = await apiRequest(
        "POST",
        `/api/rarpt/project/${projectid}/vapt/create/`,
        formData,
        true
      );

      if (response.data) {
        // Update reports list with new report included
        await fetchVaptReports();

        // Switch to the newly created report
        setSelectedReport(response.data);
        setPdfFile(response.data.file);

        // Load the new document in viewer if instance exists
        if (instance.current?.Core?.documentViewer) {
          await instance.current.Core.documentViewer.loadDocument(
            response.data.file
          );
        }

        message.success("Report created successfully");
        setNewReportName("");
        setNewReportFile(null);
        setShowReportModal(false);
        setError(null);
      }
    } catch (err) {
      console.error("Error creating VAPT report:", err);
      setError(err.message || "Failed to create report");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete VAPT report
  const deleteSheet = async (reportId, reportName) => {
    setReportToDelete({ reportId, reportName });
    setShowConfirmationModal(true);
  };

  const confirmDelete = async () => {
    if (!reportToDelete) return;

    setIsLoading(true);
    try {
      const res = await apiRequest(
        "DELETE",
        `/api/rarpt/vapt/${reportToDelete.reportId}/delete/`,
        null,
        true
      );
      if (res.status === 204) {

        setShowConfirmationModal(false);
        setReportToDelete(null);
        message.success("Report deleted successfully");
        await fetchVaptReports();
      }
      else{
        message.error("Failed to delete report");
      }

      // Fetch updated reports list after deletion

    //   message.success("Report deleted successfully");
    } catch (err) {
      console.error("Error deleting VAPT report:", err);
      setError(err.message || "Failed to delete report");
    } finally {
      setIsLoading(false);
      setReportToDelete(null);
      setShowConfirmationModal(false);
    }
  };

  // Clean up viewer when switching reports
  useEffect(() => {
    return () => {
      if (instance.current?.Core?.documentViewer) {
        try {
          instance.current.Core.documentViewer.closeDocument();
          if (viewerDiv.current) {
            while (viewerDiv.current.firstChild) {
              viewerDiv.current.removeChild(viewerDiv.current.firstChild);
            }
          }
        } catch (e) {
          console.warn("Error during cleanup:", e);
        }
      }
    };
  }, [selectedReport]);

  // Clean up viewer when component unmounts or when no reports are available
  useEffect(() => {
    if (!vapt_reports.length && instance.current) {
      if (instance.current.Core?.documentViewer) {
        try {
          instance.current.Core.documentViewer.closeDocument();
        } catch (e) {
          console.warn("Error closing document:", e);
        }
      }

      // Clear viewer div
      if (viewerDiv.current) {
        try {
          while (viewerDiv.current.firstChild) {
            viewerDiv.current.removeChild(viewerDiv.current.firstChild);
          }
        } catch (e) {
          console.warn("Error cleaning viewer div:", e);
        }
      }
    }
  }, [vapt_reports.length]);

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* Error Alert */}
      {error && (
        <div className="p-4 mb-4 bg-red-100 border border-red-400 text-red-700 rounded relative">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 011.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white">
        <h2 className="text-2xl font-bold text-slate-800">VAPT Summary</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              className="pl-4 pr-10 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={selectedReport ? selectedReport.id : ""}
              onChange={(e) => handleSheetChange(e.target.value)}
              disabled={isLoading}
            >
              {vapt_reports.length === 0 && (
                <option value="" disabled>
                  No reports available
                </option>
              )}
              {vapt_reports.map((sheet) => (
                <option key={sheet.id} value={sheet.id}>
                  {sheet.name}
                </option>
              ))}
              <option value="create">+ Create New Report</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </div>
          </div>

          {/* Delete Button */}
          <button
            className="p-2.5 rounded-lg text-red-600 hover:bg-red-100 disabled:text-gray-400 disabled:bg-transparent disabled:cursor-not-allowed transition-colors"
            onClick={() =>
              selectedReport &&
              deleteSheet(selectedReport.id, selectedReport.name)
            }
            disabled={!selectedReport || isLoading}
            title={
              selectedReport
                ? "Delete selected report"
                : "Select a report to delete"
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Create Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowReportModal(false)}
            ></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Create New VAPT Report
                </h3>
                <div className="space-y-4">
                  {/* Name Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Report Name (Optional)
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Give a name or the file name will be used as Report Name"
                      value={newReportName}
                      onChange={(e) => setNewReportName(e.target.value)}
                    />
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Upload File *
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                          >
                            <span>Upload a file</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              accept=".pdf,.doc,.docx,.xls,.xlsx"
                              onChange={(e) =>
                                setNewReportFile(e.target.files[0])
                              }
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PDF, Word or Excel up to 10MB
                        </p>
                      </div>
                    </div>
                    {newReportFile && (
                      <p className="mt-2 text-sm text-gray-500">
                        Selected file: {newReportFile.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={createReport}
                  disabled={isLoading}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-indigo-400"
                >
                  {isLoading ? "Creating..." : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowReportModal(false);
                    setNewReportFile(null);
                    setNewReportName("");
                    setError(null);
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        onConfirm={confirmDelete}
        title="Delete Report"
        message={`Are you sure you want to delete "${reportToDelete?.reportName}"? This action cannot be undone.`}
      />

      {/* PDFTron WebViewer */}
      <div className="flex-1 overflow-hidden border-t border-gray-200 relative">
        {(loading || isLoading) && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {!isLoading && (!vapt_reports || vapt_reports.length === 0) && (
          <div className="h-full flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Reports Available
              </h3>
              <p className="text-gray-500 mb-6">
                Get started by adding your first VAPT report
              </p>
              <button
                onClick={() => setShowReportModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={isLoading}
              >
                <svg
                  className="-ml-1 mr-2 h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
                Add Report
              </button>
            </div>
          </div>
        )}

        {!isLoading && selectedReport && (
          <div
            ref={viewerDiv}
            className="h-full w-full"
            style={{ height: "calc(100vh - 80px)" }}
          ></div>
        )}
      </div>
    </div>
  );
};

export default Vapt;
