
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Plus, X, FileText, Info } from 'lucide-react';
import { message } from 'antd';
import { apiRequest } from '../../../../utils/api';

// Component Imports
import ReportsTable from "./ReportsTable";
import Vapt from "./Vapt";
import RiskTreatment from "./RiskTreatment";
import ASISReport from "./ASISReport";
import RiskAssessment from "./RiskAssessment";
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

// Global Scroll Container Component
const GlobalScrollContainer = ({ children }) => {
  const scrollRef = useRef(null);
  
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    
    let isDown = false;
    let startX, startY, scrollLeft, scrollTop;
    
    const onMouseDown = (e) => {
      isDown = true;
      el.classList.add('cursor-grabbing');
      startX = e.pageX - el.offsetLeft;
      startY = e.pageY - el.offsetTop;
      scrollLeft = el.scrollLeft;
      scrollTop = el.scrollTop;
    };
    
    const onMouseLeave = () => { 
      isDown = false; 
      el.classList.remove('cursor-grabbing'); 
    };
    
    const onMouseUp = () => { 
      isDown = false; 
      el.classList.remove('cursor-grabbing'); 
    };
    
    const onMouseMove = (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      const y = e.pageY - el.offsetTop;
      el.scrollLeft = scrollLeft - (x - startX);
      el.scrollTop = scrollTop - (y - startY);
    };
    
    el.addEventListener('mousedown', onMouseDown);
    el.addEventListener('mouseleave', onMouseLeave);
    el.addEventListener('mouseup', onMouseUp);
    el.addEventListener('mousemove', onMouseMove);
    
    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      el.removeEventListener('mouseleave', onMouseLeave);
      el.removeEventListener('mouseup', onMouseUp);
      el.removeEventListener('mousemove', onMouseMove);
    };
  }, []);
  
  return (
    <div
      ref={scrollRef}
      className="overflow-x-auto overflow-y-scroll h-full max-h-full scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 cursor-grab active:cursor-grabbing custom-scrollbar hover:shadow-inner transition-shadow duration-200"
      style={{ 
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'thin',
        scrollbarColor: '#d1d5db #f3f4f6',
        minHeight: '600px',
        maxHeight: 'calc(100vh - 200px)'
      }}
    >
      {children}
    </div>
  );
};

// Create Report Modal Component
const CreateReportModal = ({ isOpen, onClose, projectid, onSuccess }) => {
  const [activeTab, setActiveTab] = useState("form"); // "form" or "excel"
  const [reportType, setReportType] = useState("");
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
      setReportType("");
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
    if (!reportType) {
      setError("Please select a report type");
      return;
    }
    
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
                required
              >
                <option value="">Select report type</option>
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
                        <FileText className="mr-2" size={18} />
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
                        <FileText className="mr-2" size={18} />
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
  const location = useLocation();

  // Helper function to get localStorage key for this project
  const getStorageKey = () => `myreports_tabs_${projectid}`;

  // Helper function to save tabs to localStorage
  const saveTabsToStorage = (tabs, activeTabId) => {
    try {
      // Only save if we have valid data
      if (!tabs || !Array.isArray(tabs) || tabs.length === 0) {
        return;
      }

      const tabsData = {
        tabs: tabs,
        activeTabId: activeTabId,
        timestamp: Date.now()
      };

      localStorage.setItem(getStorageKey(), JSON.stringify(tabsData));
    } catch (error) {
      console.warn('Failed to save tabs to localStorage:', error);
    }
  };

  // Helper function to load tabs from localStorage
  const loadTabsFromStorage = () => {
    try {
      const storageKey = getStorageKey();
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const tabsData = JSON.parse(stored);

        // Validate the structure
        if (!tabsData.tabs || !Array.isArray(tabsData.tabs) || !tabsData.activeTabId) {
          console.warn('Invalid tabs data structure in localStorage');
          return null;
        }

        // Check if the stored data is not too old (24 hours)
        const isRecent = Date.now() - tabsData.timestamp < 24 * 60 * 60 * 1000;
        if (isRecent) {
          return {
            tabs: tabsData.tabs,
            activeTabId: tabsData.activeTabId
          };
        } else {
          // Remove expired data
          localStorage.removeItem(storageKey);
        }
      }
    } catch (error) {
      console.warn('Failed to load tabs from localStorage:', error);
      // Remove corrupted data
      try {
        localStorage.removeItem(getStorageKey());
      } catch (removeError) {
        console.warn('Failed to remove corrupted localStorage data:', removeError);
      }
    }
    return null;
  };

  // Initialize tabs from localStorage or default
  const initializeTabs = () => {
    const storedData = loadTabsFromStorage();
    if (storedData) {
      return storedData;
    }
    return {
      tabs: [{ id: 'reports-table', title: 'Reports Table', type: 'table', isActive: true, canClose: false }],
      activeTabId: 'reports-table'
    };
  };

  // State for managing tabs
  const initialTabsData = initializeTabs();
  const [tabs, setTabs] = useState(initialTabsData.tabs);
  const [activeTabId, setActiveTabId] = useState(initialTabsData.activeTabId);
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Restore tabs on mount if they were loaded from localStorage
  useEffect(() => {
    const restoreTabsOnMount = async () => {
      const storedData = loadTabsFromStorage();
      if (storedData && storedData.tabs.length > 1) { // More than just the default table tab

        // Immediately restore tabs without validation to avoid authentication issues
        const restoredTabs = storedData.tabs.map(tab => ({
          ...tab,
          isActive: tab.id === storedData.activeTabId
        }));

        setTabs(restoredTabs);
        setActiveTabId(storedData.activeTabId);

        // Optionally validate in background (non-blocking)
        setTimeout(async () => {
          try {
            const validatedTabs = await validateAndRefreshReportData(storedData.tabs);

            // Only update if validation was successful and found differences
            if (validatedTabs.length === storedData.tabs.length) {
              setTabs(validatedTabs.map(tab => ({
                ...tab,
                isActive: tab.id === storedData.activeTabId
              })));
            }
          } catch (error) {
            console.warn('Background validation failed, keeping original tabs:', error);
          }
        }, 2000); // Wait 2 seconds before background validation
      }
    };

    restoreTabsOnMount();
  }, [projectid]); // Add projectid as dependency

  // Save tabs to localStorage whenever they change
  useEffect(() => {
    saveTabsToStorage(tabs, activeTabId);
  }, [tabs, activeTabId]);

  // Clear localStorage when project changes
  useEffect(() => {
    return () => {
      // This cleanup function runs when the component unmounts or projectid changes
      // We don't clear localStorage here as we want to persist tabs across navigation
      // The cleanup of old data is handled by the cleanup effect
    };
  }, [projectid]);

  // Cleanup old localStorage data on component mount
  useEffect(() => {
    const cleanupOldStorage = () => {
      try {
        const keys = Object.keys(localStorage);
        const myreportsKeys = keys.filter(key => key.startsWith('myreports_tabs_'));

        myreportsKeys.forEach(key => {
          try {
            const stored = localStorage.getItem(key);
            if (stored) {
              const tabsData = JSON.parse(stored);
              // Remove data older than 24 hours
              if (Date.now() - tabsData.timestamp > 24 * 60 * 60 * 1000) {
                localStorage.removeItem(key);
              }
            }
          } catch (error) {
            // Remove corrupted data
            localStorage.removeItem(key);
          }
        });
      } catch (error) {
        console.warn('Failed to cleanup localStorage:', error);
      }
    };

    cleanupOldStorage();
  }, []);

  // Validate and refresh report data when restoring from localStorage
  const validateAndRefreshReportData = async (tabs) => {
    const validatedTabs = [];

    for (const tab of tabs) {
      if (tab.type === 'table') {
        // Table tabs are always valid
        validatedTabs.push(tab);
      } else if (tab.report && tab.report.id) {
        // For report tabs, validate that the report still exists
        try {
          // Map report types to API endpoints
          const reportTypeMap = {
            'riskAssessment': 'riskassessment',
            'riskTreatment': 'risktreatment',
            'vapt': 'vapt',
            'asisReport': 'asis'
          };

          const reportType = reportTypeMap[tab.type];
          if (!reportType) {
            console.warn(`Unknown report type: ${tab.type}, skipping tab`);
            continue;
          }

          const response = await apiRequest('GET', `/api/rarpt/project/${projectid}/reports/${reportType}/${tab.report.id}/`, null, true);
          if (response && response.data) {
            // Report exists, update with fresh data
            validatedTabs.push({
              ...tab,
              report: response.data
            });
          }
          // If report doesn't exist, skip this tab
        } catch (error) {
          // Check if it's an authentication error (401)
          if (error.response && error.response.status === 401) {
            console.warn(`Authentication failed for report ${tab.report.id}, keeping tab but not refreshing data`);
            // Keep the tab but don't refresh the data - user can still see the cached data
            validatedTabs.push(tab);
          } else {
            // For other errors (404, 500, etc.), skip the tab
            console.warn(`Report ${tab.report.id} validation failed, skipping tab:`, error);
          }
        }
      }
    }

    return validatedTabs;
  };

  // Handle report row click to open in new tab
  const handleOpenReportInTab = (report) => {
    const tabId = `report-${report.id}`;
    const tabTitle = `${report.name} (${report.type})`;

    // Check if tab already exists
    const existingTabIndex = tabs.findIndex(tab => tab.id === tabId);

    if (existingTabIndex !== -1) {
      // Tab exists, just activate it
      setActiveTabId(tabId);
      setTabs(tabs.map(tab => ({
        ...tab,
        isActive: tab.id === tabId
      })));
    } else {
      // Create new tab
      const newTab = {
        id: tabId,
        title: tabTitle,
        type: report.report_tab,
        report: report,
        isActive: true,
        canClose: true
      };

      setTabs(prevTabs =>
        prevTabs.map(tab => ({ ...tab, isActive: false })).concat(newTab)
      );
      setActiveTabId(tabId);
    }
  };

  // Handle tab click
  const handleTabClick = (tabId) => {
    setActiveTabId(tabId);
    setTabs(tabs.map(tab => ({
      ...tab,
      isActive: tab.id === tabId
    })));
  };

  // Handle tab close
  const handleTabClose = (e, tabId) => {
    e.stopPropagation();

    const tabIndex = tabs.findIndex(tab => tab.id === tabId);
    if (tabIndex === -1) return;

    const newTabs = tabs.filter(tab => tab.id !== tabId);

    // If we're closing the active tab, activate the previous tab or the reports table
    if (activeTabId === tabId) {
      const newActiveTab = newTabs[tabIndex - 1] || newTabs[0];
      setActiveTabId(newActiveTab.id);
      setTabs(newTabs.map(tab => ({
        ...tab,
        isActive: tab.id === newActiveTab.id
      })));
    } else {
      setTabs(newTabs);
    }
  };

  // Handle refresh trigger
  const handleRefreshTrigger = () => {
    setRefreshCounter(prev => prev + 1);
  };

  // Handle report deletion and close corresponding tab
  const handleReportDelete = (deletedReport) => {
    const tabId = `report-${deletedReport.id}`;

    // Check if the deleted report's tab is open
    const tabIndex = tabs.findIndex(tab => tab.id === tabId);
    if (tabIndex !== -1) {
      // Close the tab for the deleted report
      const newTabs = tabs.filter(tab => tab.id !== tabId);

      // If we're closing the active tab, activate the previous tab or the reports table
      if (activeTabId === tabId) {
        const newActiveTab = newTabs[tabIndex - 1] || newTabs[0];
        setActiveTabId(newActiveTab.id);
        setTabs(newTabs.map(tab => ({
          ...tab,
          isActive: tab.id === newActiveTab.id
        })));
      } else {
        setTabs(newTabs);
      }
    }
  };

  // Handle opening reports table in new tab
  const handleOpenReportsTable = () => {
    const tabId = 'reports-table-new';
    const tabTitle = 'Reports Table';

    // Check if tab already exists
    const existingTabIndex = tabs.findIndex(tab => tab.id === tabId);

    if (existingTabIndex !== -1) {
      // Tab exists, just activate it
      setActiveTabId(tabId);
      setTabs(tabs.map(tab => ({
        ...tab,
        isActive: tab.id === tabId
      })));
    } else {
      // Create new tab
      const newTab = {
        id: tabId,
        title: tabTitle,
        type: 'table',
        isActive: true,
        canClose: true
      };

      setTabs(prevTabs =>
        prevTabs.map(tab => ({ ...tab, isActive: false })).concat(newTab)
      );
      setActiveTabId(tabId);
    }
  };



  // Get current active tab
  const activeTab = tabs.find(tab => tab.id === activeTabId);

  // Render tab content
  const renderTabContent = () => {
    if (!activeTab) return null;

    // Handle case where report data might be missing
    if (activeTab.type !== 'table' && !activeTab.report) {
      return (
        <div className="h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-semibold text-gray-500">{activeTab.title}</h2>
            <button
              onClick={() => handleTabClose({ stopPropagation: () => { } }, activeTab.id)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-600 mb-4">Report data not available</p>
              <p className="text-sm text-gray-500">This tab will be removed when you close it</p>
            </div>
          </div>
        </div>
      );
    }

    switch (activeTab.type) {
      case 'table':
        return (
          <div className="p-4">
            <ReportsTable
              onRowClick={handleOpenReportInTab}
              refreshTrigger={refreshCounter}
              onReportDelete={handleReportDelete}
            />
          </div>
        );
      case 'riskAssessment':
        return (
          <div className="h-full">
            <div className="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-10">
              <h2 className="text-xl font-semibold">{activeTab.report?.name}</h2>
              <button
                onClick={() => handleTabClose({ stopPropagation: () => { } }, activeTab.id)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <RiskAssessment
                reportId={activeTab.report?.id}
                projectId={projectid}
                specificReportMode={true}
              />
            </div>
          </div>
        );
      case 'riskTreatment':
        return (
          <div className="h-full">
            <div className="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-10">
              <h2 className="text-xl font-semibold">{activeTab.report?.name}</h2>
              <button
                onClick={() => handleTabClose({ stopPropagation: () => { } }, activeTab.id)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <RiskTreatment
                reportId={activeTab.report?.id}
                projectId={projectid}
                specificReportMode={true}
              />
            </div>
          </div>
        );
      case 'vapt':
        return (
          <div className="h-full">
            <div className="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-10">
              <h2 className="text-xl font-semibold">{activeTab.report?.name}</h2>
              <button
                onClick={() => handleTabClose({ stopPropagation: () => { } }, activeTab.id)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <Vapt
                reportId={activeTab.report?.id}
                projectId={projectid}
                specificReportMode={true}
              />
            </div>
          </div>
        );
      case 'asisReport':
        return (
          <div className="h-full">
            <div className="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-10">
              <h2 className="text-xl font-semibold">{activeTab.report?.name}</h2>
              <button
                onClick={() => handleTabClose({ stopPropagation: () => { } }, activeTab.id)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <ASISReport
                reportId={activeTab.report?.id}
                projectId={projectid}
                specificReportMode={true}
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 flex-1">
            <div className="flex items-center min-w-full bg-gray-50">
              {tabs.map((tab) => (
                <div
                  key={tab.id}
                  className={`flex items-center min-w-0 flex-shrink-0 cursor-pointer transition-all duration-200 border-r border-gray-200 last:border-r-0 relative ${tab.isActive
                      ? 'bg-white border-b-2 border-indigo-500 text-indigo-600 shadow-sm'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                    }`}
                  onClick={() => handleTabClick(tab.id)}
                >
                  <div className="px-4 py-3 flex items-center space-x-2 max-w-xs min-w-0">
                    <span className="truncate text-sm font-medium">
                      {tab.title}
                    </span>
                    {tab.canClose && (
                      <button
                        onClick={(e) => handleTabClose(e, tab.id)}
                        className="ml-2 p-1 rounded-full hover:bg-gray-200 transition-colors flex-shrink-0 group"
                        title="Close tab"
                      >
                        <X size={14} className="group-hover:text-red-500" />
                      </button>
                    )}
                  </div>
                  {tab.isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center px-3 py-2 bg-gray-50 border-l border-gray-200">
            <span className="text-xs text-gray-500 mr-2">
              {tabs.length} tab{tabs.length !== 1 ? 's' : ''}
            </span>
            <button
              onClick={handleOpenReportsTable}
              className="p-1 rounded hover:bg-gray-200 transition-colors"
              title="Open new Reports Table tab"
            >
              <Plus size={16} className="text-gray-600" />
            </button>

          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden bg-gray-50" style={{ height: 'calc(100vh - 120px)' }}>
        <GlobalScrollContainer>
          {renderTabContent()}
        </GlobalScrollContainer>
      </div>
    </div>
  );
};

export default MyReports;
