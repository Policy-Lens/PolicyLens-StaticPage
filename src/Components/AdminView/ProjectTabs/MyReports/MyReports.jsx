// import ReportsTable from "./ReportsTable";

// const MyReports = () => {
//   return <ReportsTable />;
// };

// src/Components/ProjectTabs/MyReports/MyReports.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { apiRequest } from '../../../../utils/api';

// Component Imports
import ReportsTable from "./ReportsTable";
import Vapt from "./Vapt";
import RiskTreatment from "./RiskTreatment";
import ASISReport from "./ASISReport";
import LegendsModal from './LegendsModal';
import PDFTronViewer from '../../../FileViewer/PDFTronViewer';

// Add riskAssessmentFields and groupColors from ReportsTable.jsx
const riskAssessmentFields = [
  { key: 'risk_id', label: 'Risk ID', group: 'gray' },
  { key: 'vulnerability_type', label: 'Vulnerability Type', group: 'gray' },
  { key: 'threat_description', label: 'Threat Description', group: 'gray' },
  { key: 'context', label: 'Context', group: 'gray' },
  { key: 'applicable_activity', label: 'Applicable Activity', group: 'gray' },
  { key: 'impact_confidentiality', label: 'Impact on Confidentiality (Y/N)', group: 'blue' },
  { key: 'impact_integrity', label: 'Impact on Integrity (Y/N)', group: 'blue' },
  { key: 'impact_availability', label: 'Impact on Availability (Y/N)', group: 'blue' },
  { key: 'breach_legal', label: 'Breach of legal obligation (Y/N)', group: 'blue' },
  { key: 'impact_customer', label: 'On customer', group: 'blue' },
  { key: 'impact_operating', label: 'On operating capability', group: 'blue' },
  { key: 'impact_financial', label: 'Financial damage', group: 'blue' },
  { key: 'impact_severity', label: 'Severity / Magnitude', group: 'blue' },
  { key: 'consequence_rating', label: 'Consequence rating', group: 'orange' },
  { key: 'likelihood_rating', label: 'Likelihood rating', group: 'orange' },
  { key: 'existing_control_desc', label: 'Description', group: 'yellow' },
  { key: 'existing_control_rating', label: 'Rating', group: 'yellow' },
  { key: 'risk_rating', label: 'Risk Rating', group: 'black' },
  { key: 'risk_category', label: 'Risk Category', group: 'black' },
  { key: 'department', label: 'Department', group: 'black' },
  { key: 'risk_owner', label: 'Risk Owner', group: 'black' },
  { key: 'risk_mitigation_strategy', label: 'Risk Mitigation Strategy', group: 'black' },
  { key: 'applicable_saf_control', label: 'Applicable Saf Control', group: 'blue2' },
  { key: 'saf_control_desc', label: 'Saf Control Description', group: 'blue2' },
  { key: 'meets_legal', label: 'Meets all relevant controls meet legal/other requirements? (Y/N)', group: 'blue2' },
  { key: 'revised_control_rating', label: 'Revised control rating', group: 'blue2' },
  { key: 'residual_risk_acceptable', label: 'Residual risk Acceptable to risk owner? (Y/N)', group: 'blue2' },
  { key: 'further_planned_action', label: 'Further Planned action', group: 'green' },
  { key: 'task_id', label: 'Task ID', group: 'green' },
  { key: 'task_description', label: 'Task Description', group: 'green' },
  { key: 'task_owner', label: 'Task Owner', group: 'green' },
  { key: 'ongoing_task', label: 'Ongoing task? (Y/N)', group: 'green' },
  { key: 'planned_completion_date', label: 'If not ongoing, planned completion date', group: 'green' },
  { key: 'recurrent_task', label: 'Recurrent task? (Y/N)', group: 'green' },
  { key: 'recurrent_frequency', label: 'If yes, frequency', group: 'green' },
];
const groupColors = {
  gray: 'bg-gray-200 text-gray-800',
  blue: 'bg-blue-100 text-blue-800',
  blue2: 'bg-blue-300 text-blue-900',
  orange: 'bg-orange-100 text-orange-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  green: 'bg-green-100 text-green-800',
  black: 'bg-black text-white',
};

// Create Report Modal Component
const CreateReportModal = ({ isOpen, onClose, projectid, onSuccess }) => {
  const [activeTab, setActiveTab] = useState("form"); // "form" or "excel"
  const [reportType, setReportType] = useState("Risk Assessment");
  const [reportName, setReportName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");
  const [systemType, setSystemType] = useState("Information System");

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setActiveTab("form");
      setReportType("Risk Assessment");
      setReportName("");
      setFile(null);
      setError(null);
      setDescription("");
      setSystemType("Information System");
    }
  }, [isOpen]);

  // Handle file selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  // Create report based on type
  const handleCreateReport = async () => {
    if (!reportName.trim()) {
      setError("Please enter a report name");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let response;

      // Different API calls based on report type and creation method
      if (reportType === "VAPT") {
        // VAPT only supports file upload
        if (!file) {
          setError("Please select a file to upload");
          setIsLoading(false);
          return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("name", reportName.trim());

        response = await apiRequest(
          "POST",
          `/api/rarpt/project/${projectid}/vapt/create/`,
          formData,
          true
        );
      } else if (reportType === "Risk Assessment" || reportType === "Risk Treatment") {
        if (activeTab === "form") {
          // Create sheet via form
          const payload = {
            name: reportName.trim(),
            description: description.trim() || null
          };

          // Add type for Risk Treatment
          if (reportType === "Risk Treatment") {
            payload.type = "Risk Treatment";
          }

          response = await apiRequest(
            "POST",
            `/api/rarpt/project/${projectid}/assessment-sheets/create/`,
            payload,
            true
          );
        } else {
          // Excel upload requires creating sheet first, then uploading Excel
          if (!file) {
            setError("Please select an Excel file to upload");
            setIsLoading(false);
            return;
          }

          // First create the sheet
          const payload = {
            name: reportName.trim(),
            description: description.trim() || null
          };

          // Add type for Risk Treatment
          if (reportType === "Risk Treatment") {
            payload.type = "Risk Treatment";
          }

          const sheetResponse = await apiRequest(
            "POST",
            `/api/rarpt/project/${projectid}/assessment-sheets/create/`,
            payload,
            true
          );

          if (sheetResponse && sheetResponse.data) {
            // Now upload the Excel to this sheet
            const formData = new FormData();
            formData.append("file", file);

            response = await apiRequest(
              "POST",
              `/api/rarpt/assessment-sheets/${sheetResponse.data.id}/risks/`,
              formData,
              true
            );
          }
        }
      } else if (reportType === "ASIS Report") {
        if (activeTab === "form") {
          // Create ASIS report via form
          response = await apiRequest(
            "POST",
            `/api/rarpt/project/${projectid}/asis-reports/create/`,
            {
              name: reportName.trim(),
              system_type: systemType,
              description: description.trim() || null
            },
            true
          );
        } else {
          // Excel upload for ASIS
          if (!file) {
            setError("Please select an Excel file to upload");
            setIsLoading(false);
            return;
          }

          // First create the report
          const reportResponse = await apiRequest(
            "POST",
            `/api/rarpt/project/${projectid}/asis-reports/create/`,
            {
              name: reportName.trim(),
              system_type: systemType,
              description: description.trim() || null
            },
            true
          );

          if (reportResponse && reportResponse.data) {
            // Now upload the Excel to this report
            const formData = new FormData();
            formData.append("file", file);

            response = await apiRequest(
              "POST",
              `/api/rarpt/project/${projectid}/asis-reports/${reportResponse.data.id}/upload-excel/`,
              formData,
              true
            );
          }
        }
      }

      // Handle successful response
      message.success(`${reportType} report created successfully`);
      // Call onSuccess callback if provided, otherwise just close the modal
      if (onSuccess) {
        onSuccess();
      } else {
        onClose();
      }

      // Refresh the reports table or navigate to the new report
      // This will depend on the parent component's implementation

    } catch (err) {
      console.error("Error creating report:", err);
      setError(err.message || `Failed to create ${reportType} report`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-modal="true" role="dialog">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className="bg-indigo-600 px-4 py-3 sm:px-6 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-white">
              Create New Report
            </h3>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 focus:outline-none"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="bg-white p-6">
            {/* Error Alert */}
            {error && (
              <div className="p-3 mb-4 bg-red-100 border border-red-400 text-red-700 rounded">
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
                </div>
              </div>
            )}

            {/* Common Fields */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Report Type *
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Risk Assessment">Risk Assessment</option>
                <option value="Risk Treatment">Risk Treatment</option>
                <option value="VAPT">VAPT</option>
                <option value="ASIS Report">ASIS Report</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Report Name *
              </label>
              <input
                type="text"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter report name"
              />
            </div>

            {/* VAPT only has file upload */}
            {reportType === "VAPT" ? (
              <div className="mb-4">
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
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PDF, Word or Excel up to 10MB
                    </p>
                  </div>
                </div>
                {file && (
                  <p className="mt-2 text-sm text-gray-500">
                    Selected file: {file.name}
                  </p>
                )}
              </div>
            ) : (
              <>
                {/* Other report types have form and excel options */}
                <div className="mb-4">
                  <div className="flex border-b mb-4 w-full">
                    <button
                      className={`py-2 px-6 font-medium relative flex-1 transition-all ${activeTab === "form"
                        ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50"
                        : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                        }`}
                      onClick={() => setActiveTab("form")}
                    >
                      <div className="flex items-center justify-center">
                        <FilePlus className="mr-2" size={18} />
                        <span>Manual Form</span>
                      </div>
                    </button>
                    <button
                      className={`py-2 px-6 font-medium relative flex-1 transition-all ${activeTab === "excel"
                        ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50"
                        : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                        }`}
                      onClick={() => setActiveTab("excel")}
                    >
                      <div className="flex items-center justify-center">
                        <FileUp className="mr-2" size={18} />
                        <span>Upload Excel</span>
                      </div>
                    </button>
                  </div>

                  {activeTab === "form" ? (
                    <div className="py-2">
                      <div className="text-sm text-gray-600 mb-4 bg-blue-50 p-3 rounded-md border border-blue-100">
                        <p className="flex items-center">
                          <svg className="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          Create a new {reportType} with basic information. You can add more details after creation.
                        </p>
                      </div>
                      {/* Form-specific input fields based on report type */}
                      {reportType === "Risk Assessment" || reportType === "Risk Treatment" ? (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                            <textarea
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              placeholder="Enter a brief description for this report"
                              rows={3}
                            />
                          </div>
                        </div>
                      ) : reportType === "ASIS Report" ? (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">System Type</label>
                            <select
                              value={systemType}
                              onChange={(e) => setSystemType(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                              <option value="Information System">Information System</option>
                              <option value="Operational Technology">Operational Technology</option>
                              <option value="IoT">IoT</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">System Description (Optional)</label>
                            <textarea
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              placeholder="Describe the system"
                              rows={3}
                            />
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Upload Excel File *
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
                              htmlFor="excel-upload"
                              className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                            >
                              <span>Upload Excel file</span>
                              <input
                                id="excel-upload"
                                name="excel-upload"
                                type="file"
                                className="sr-only"
                                accept=".xls,.xlsx"
                                onChange={handleFileChange}
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">
                            Excel files only (.xls, .xlsx)
                          </p>
                        </div>
                      </div>
                      {file && (
                        <p className="mt-2 text-sm text-gray-500">
                          Selected file: {file.name}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-indigo-400"
              onClick={handleCreateReport}
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Create Report"}
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};



const MyReports = () => {
  const { projectid, reportType, reportId } = useParams();
  const navigate = useNavigate();

  // State for managing which view is active (the main table or a specific report tab)
  const [activeView, setActiveView] = useState({ type: 'table', report: null });
  
  // State to trigger a refresh of the reports table
  const [refreshCounter, setRefreshCounter] = useState(0);

  // New: When a report row is clicked, navigate to the extracted data route
  const handleViewReportData = (report) => {
    const typeSlug = report.type.replace(/\s/g, '').toLowerCase();
    navigate(`/project/${projectid}/myreports/${typeSlug}/${report.id}/extracted`);
  };

  /**
   * Opens a full-page view for a specific report type (e.g., RiskTreatment, ASISReport).
   * This is separate from the data modal and is used for more complex, interactive views.
   * @param {object} report - The report object to open.
   */
  const openReportTabView = (report) => {
    // The 'report_tab' property should correspond to a view type.
    setActiveView({ type: report.report_tab, report: report });
  };

  /**
   * Renders the currently active view based on the state.
   */
  const renderActiveView = () => {
    const { type, report } = activeView;
    
    switch (type) {
      case 'riskAssessment':
        // Risk Assessment might use the same detailed table view.
        // If it has its own component, you would render it here.
        // For now, we assume it's handled by the modal.
        return <ReportsTable onRowClick={handleViewReportData} onReportOpen={openReportTabView} refreshTrigger={refreshCounter} />;
      
      case 'riskTreatment':
        return <RiskTreatment report={report} onBack={() => setActiveView({ type: 'table', report: null })} />;
      
      case 'vapt':
        return <Vapt report={report} onBack={() => setActiveView({ type: 'table', report: null })} />;
        
      case 'asisReport':
        return <ASISReport report={report} onBack={() => setActiveView({ type: 'table', report: null })} />;
        
      case 'table':
      default:
        return <ReportsTable onRowClick={handleViewReportData} onReportOpen={openReportTabView} refreshTrigger={refreshCounter} />;
    }
  };

      return (
        <>
      {renderActiveView()}
    </>
  );
};

export default MyReports;
