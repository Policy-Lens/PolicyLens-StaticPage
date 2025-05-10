import React, { useState, useEffect } from "react";
import { apiRequest } from "../../../../utils/api";
import Vapt from "./Vapt";
import RiskTreatment from "./RiskTreatment";
import ASISReport from "./ASISReport";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import LegendsModal from "./LegendsModal";
import ReportsTable from "./ReportsTable";
import { message } from "antd"; // Import Ant Design message
import { FilePlus, FileUp, X, Plus } from "lucide-react";

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
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
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
                  aria-hidden="true"
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

// Detailed View Modal Component for viewing risk details
const DetailedViewModal = ({ isOpen, onClose, risk }) => {
  if (!isOpen || !risk) return null;

  // Helper function to get impact color (Y/N)
  const getImpactColorClass = (value) => {
    return value === "Y" ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200";
  };

  // Helper function to get rating color class based on numeric value
  const getRatingColorClass = (value) => {
    const numValue = Number(value) || 1;
    if (numValue === 5) return "bg-red-500 text-white border border-red-300";
    if (numValue === 4) return "bg-red-400 text-white border border-red-200";
    if (numValue === 3) return "bg-red-300 border border-red-200";
    if (numValue === 2) return "bg-orange-200 border border-orange-300";
    return "bg-yellow-300 border border-yellow-400";
  };

  // Helper function for control rating color class
  const getControlRatingColorClass = (value) => {
    return getRatingColorClass(value); // Uses the same scale
  };

  // Helper function for risk rating color class
  const getRiskRatingColorClass = (value) => {
    const numValue = Number(value) || 1;
    if (numValue >= 27) return "bg-red-600 text-white border border-red-500";
    if (numValue >= 20) return "bg-red-500 text-white border border-red-400";
    return "bg-yellow-100 border border-yellow-200";
  };

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
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-indigo-600 px-4 py-3 sm:px-6 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-white">
              Risk Details: {risk.risk_id}
            </h3>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="bg-white p-6 overflow-y-auto max-h-[70vh]">
            {/* Basic Information */}
            <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200">Basic Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Risk ID</label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                  {risk.risk_id}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vulnerability Type</label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                  {risk.vulnerabilityType || "Not Specified"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Context</label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                  {risk.context || "Not Specified"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Applicable Activity</label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                  {risk.applicableActivity || "Not Specified"}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Threat Description</label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                {risk.threatDescription || "Not Specified"}
              </div>
            </div>

            {/* Impact Assessment */}
            <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200 text-indigo-800">Impact Assessment</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-indigo-50 p-4 rounded-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Impact on Confidentiality</label>
                <div className={`px-3 py-2 rounded-md ${getImpactColorClass(risk.impactAssessment?.confidentiality)}`}>
                  {risk.impactAssessment?.confidentiality === 'Y' ? 'Yes' : 'No'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Impact on Integrity</label>
                <div className={`px-3 py-2 rounded-md ${getImpactColorClass(risk.impactAssessment?.integrity)}`}>
                  {risk.impactAssessment?.integrity === 'Y' ? 'Yes' : 'No'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Impact on Availability</label>
                <div className={`px-3 py-2 rounded-md ${getImpactColorClass(risk.impactAssessment?.availability)}`}>
                  {risk.impactAssessment?.availability === 'Y' ? 'Yes' : 'No'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Breach of Legal Obligation</label>
                <div className={`px-3 py-2 rounded-md ${getImpactColorClass(risk.impactAssessment?.legalObligation)}`}>
                  {risk.impactAssessment?.legalObligation === 'Y' ? 'Yes' : 'No'}
                </div>
              </div>
              {risk.impactAssessment?.legalObligation === 'Y' && risk.impactAssessment?.legalObligationDesc && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description of Legal Obligation</label>
                  <div className="px-3 py-2 bg-white border border-gray-200 rounded-md">
                    {risk.impactAssessment?.legalObligationDesc}
                  </div>
                </div>
              )}
            </div>

            {/* Impact Ratings */}
            <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200 text-indigo-800">Impact Ratings</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-indigo-50 p-4 rounded-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Impact on Customer</label>
                <div className={`px-3 py-2 rounded-md ${getRatingColorClass(risk.impactRatings?.customer)}`}>
                  {risk.impactRatings?.customer || "1"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Impact on Service Capability</label>
                <div className={`px-3 py-2 rounded-md ${getRatingColorClass(risk.impactRatings?.serviceCapability)}`}>
                  {risk.impactRatings?.serviceCapability || "1"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Financial Damage</label>
                <div className={`px-3 py-2 rounded-md ${getRatingColorClass(risk.impactRatings?.financialDamage)}`}>
                  {risk.impactRatings?.financialDamage || "1"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Spread Magnitude</label>
                <div className={`px-3 py-2 rounded-md ${getRatingColorClass(risk.impactRatings?.spreadMagnitude)}`}>
                  {risk.impactRatings?.spreadMagnitude || "1"}
                </div>
              </div>
            </div>

            {/* Severity */}
            <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200 text-amber-800">Severity Assessment</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-amber-50 p-4 rounded-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Consequence Rating</label>
                <div className={`px-3 py-2 rounded-md ${getRatingColorClass(risk.severity?.consequenceRating)}`}>
                  {risk.severity?.consequenceRating || "1"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Likelihood Rating</label>
                <div className={`px-3 py-2 rounded-md ${getRatingColorClass(risk.severity?.likelihoodRating)}`}>
                  {risk.severity?.likelihoodRating || "1"}
                </div>
              </div>
            </div>

            {/* Control Assessment */}
            <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200 text-gray-800">Control Assessment</h3>

            <div className="grid grid-cols-1 gap-4 mb-6 bg-gray-100 p-4 rounded-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <div className="px-3 py-2 bg-white border border-gray-200 rounded-md">
                  {risk.controlAssessment?.description || "Not specified"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                <div className={`px-3 py-2 rounded-md ${getControlRatingColorClass(risk.controlAssessment?.rating)}`}>
                  {risk.controlAssessment?.rating || "1"}
                </div>
              </div>
            </div>

            {/* Risk Assessment */}
            <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200 text-white bg-slate-700 pl-3 py-1 rounded-md">Risk Assessment</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-slate-100 p-4 rounded-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Risk Rating</label>
                <div className={`px-3 py-2 rounded-md ${getRiskRatingColorClass(risk.riskAssessment?.riskRating)}`}>
                  {risk.riskAssessment?.riskRating || "1"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Risk Category</label>
                <div className={`px-3 py-2 rounded-md bg-white border border-gray-200 ${risk.riskAssessment?.riskCategory === "Significant" ? "text-red-700 font-semibold" : ""}`}>
                  {risk.riskAssessment?.riskCategory || "Not Significant"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department/BU</label>
                <div className="px-3 py-2 bg-white border border-gray-200 rounded-md">
                  {risk.riskAssessment?.departmentBU || "-"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Risk Owner</label>
                <div className="px-3 py-2 bg-white border border-gray-200 rounded-md">
                  {risk.riskAssessment?.riskOwner || "-"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mitigation Strategy</label>
                <div className="px-3 py-2 bg-white border border-gray-200 rounded-md">
                  {risk.riskAssessment?.mitigationStrategy || "Tolerate"}
                </div>
              </div>
            </div>

            {/* Risk Revision */}
            <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200 text-white bg-indigo-600 pl-3 py-1 rounded-md">Risk Revision</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-indigo-100 p-4 rounded-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Applicable SoA Control</label>
                <div className="px-3 py-2 bg-white border border-gray-200 rounded-md">
                  {risk.riskRevision?.soaControl || "-"}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">SoA Control Description</label>
                <div className="px-3 py-2 bg-white border border-gray-200 rounded-md">
                  {risk.riskRevision?.soaControlDesc || "-"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Planned Controls Meet Requirements?</label>
                <div className={`px-3 py-2 rounded-md ${getImpactColorClass(risk.riskRevision?.meetsRequirements)}`}>
                  {risk.riskRevision?.meetsRequirements === 'Y' ? 'Yes' : 'No'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Revised Control Rating</label>
                <div className={`px-3 py-2 rounded-md ${getControlRatingColorClass(risk.riskRevision?.revisedControlRating)}`}>
                  {risk.riskRevision?.revisedControlRating || "1"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Residual Risk Rating</label>
                <div className={`px-3 py-2 rounded-md ${getRiskRatingColorClass(risk.riskRevision?.residualRiskRating)}`}>
                  {risk.riskRevision?.residualRiskRating || "1"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Acceptable to Risk Owner?</label>
                <div className={`px-3 py-2 rounded-md ${getImpactColorClass(risk.riskRevision?.acceptableToOwner)}`}>
                  {risk.riskRevision?.acceptableToOwner === 'Y' ? 'Yes' : 'No'}
                </div>
              </div>
            </div>

            {/* Mitigation Plan */}
            <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200 text-white bg-green-600 pl-3 py-1 rounded-md">Mitigation Plan</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-green-50 p-4 rounded-md">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Further Planned Action</label>
                <div className="px-3 py-2 bg-white border border-gray-200 rounded-md">
                  {risk.mitigationPlan?.furtherPlannedAction || "-"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task ID</label>
                <div className="px-3 py-2 bg-white border border-gray-200 rounded-md">
                  {risk.mitigationPlan?.taskId || "-"}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Description</label>
                <div className="px-3 py-2 bg-white border border-gray-200 rounded-md">
                  {risk.mitigationPlan?.taskDescription || "-"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Owner</label>
                <div className="px-3 py-2 bg-white border border-gray-200 rounded-md">
                  {risk.mitigationPlan?.taskOwner || "-"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ongoing Task?</label>
                <div className={`px-3 py-2 rounded-md ${risk.mitigationPlan?.isOngoing === 'Y' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-gray-50 text-gray-700 border border-gray-200'}`}>
                  {risk.mitigationPlan?.isOngoing === 'Y' ? 'Yes' : 'No'}
                </div>
              </div>
              {risk.mitigationPlan?.isOngoing !== 'Y' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Planned Completion Date</label>
                  <div className="px-3 py-2 bg-white border border-gray-200 rounded-md">
                    {risk.mitigationPlan?.plannedCompletionDate || "-"}
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recurrent Task?</label>
                <div className={`px-3 py-2 rounded-md ${risk.mitigationPlan?.isRecurrent === 'Y' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-gray-50 text-gray-700 border border-gray-200'}`}>
                  {risk.mitigationPlan?.isRecurrent === 'Y' ? 'Yes' : 'No'}
                </div>
              </div>
              {risk.mitigationPlan?.isRecurrent === 'Y' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                  <div className="px-3 py-2 bg-white border border-gray-200 rounded-md">
                    {risk.mitigationPlan?.frequency || "-"}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
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
  // State to track which column groups are expanded
  const { projectid } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Parse the path to determine if we're on a specific report tab
  const pathSegments = location.pathname.split('/');
  const reportType = pathSegments[pathSegments.length - 1];

  // State to track active tab
  const [activeTab, setActiveTab] = useState("table"); // Set default to 'table', not 'riskAssessment'

  // Handle tab changes, preserve reportId if it exists in URL
  const changeTab = (tab) => {
    try {
      setActiveTab(tab);

      // Get current reportId from URL if it exists
      const searchParams = new URLSearchParams(location.search);
      const reportId = searchParams.get('reportId');

      // Update URL to reflect selected tab
      if (tab === 'table') {
        navigate(`/project/${projectid}/myreports`);
      } else {
        // If we have a reportId, keep it in the URL
        const reportIdParam = reportId ? `?reportId=${reportId}` : '';
        navigate(`/project/${projectid}/myreports/${tab}${reportIdParam}`);
      }
    } catch (error) {
      console.error("Navigation error:", error);
      // Still update the active tab even if navigation fails
      setActiveTab(tab);
    }
  };

  const [expandedGroups, setExpandedGroups] = useState({
    impactAssessment: false,
    impactRatings: false,
    severity: false,
    controlAssessment: false,
    riskAssessment: false,
    riskRevision: false,
    mitigationPlan: false,
  });

  // State for managing modal visibility
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("form"); // 'form' or 'edit' or 'excel'

  // State for legends modal
  const [showLegendsModal, setShowLegendsModal] = useState(false);

  // State for tracking which risk is being edited
  const [editingRisk, setEditingRisk] = useState(null);

  // State for current project
  const [currentProject, setCurrentProject] = useState({
    id: "1",
    name: "Project Alpha",
  });

  // State for sheets and selected sheet
  const [sheets, setSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [showSheetModal, setShowSheetModal] = useState(false);
  const [newSheetName, setNewSheetName] = useState("");

  // States for API interactions
  const [riskData, setRiskData] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Start with loading state

  // State for form data - Updated structure
  const [formData, setFormData] = useState({
    risk_id: "",
    vulnerability_type: "",
    threat_description: "",
    context: "Natural",
    applicable_activity: "",
    impact_assessment: {
      impact_on_confidentiality: "N",
      impact_on_integrity: "N",
      impact_on_availability: "N",
      breach_of_legal_obligation: "N",
      description_of_legal_obligation: "",
    },
    // Added Impact Ratings section
    impact_ratings: {
      on_customer: 1,
      on_service_capability: 1,
      financial_damage: 1,
      spread_magnitude: 1,
    },
    severity: {
      consequence_rating: 1,
      likelihood_rating: 1,
    },
    control_assessment: {
      description: "",
      rating: 1,
    },
    risk_assessment: {
      risk_rating: 1, // Initialize with 1 or a calculated default
      risk_category: "Not Significant",
      department_bu: "",
      risk_owner: "",
      risk_mitigation_strategy: "Tolerate",
    },
    risk_revision: {
      applicable_soa_control: "",
      soaControlDesc: "", // Added SoA Control Description
      planned_controls_meet_requirements: "Y",
      revised_control_rating: 1,
      residual_risk_rating: 1, // Initialize with 1 or a calculated default
      acceptable_to_risk_owner: "Y",
    },
    mitigation_task: {
      further_planned_action: "", // Added Further Planned Action
      task_id: "",
      task_description: "",
      task_owner: "",
      is_ongoing: "N", // Defaulting to No
      is_recurrent: "N",
      frequency: "",
      planned_completion_date: "",
    },
  });

  // State for file upload
  const [excelFile, setExcelFile] = useState(null);

  // State for Confirmation Modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalProps, setConfirmModalProps] = useState({
    onConfirm: () => { },
    title: "Confirm Action",
    message: "Are you sure?",
  });

  // Add error state to the component
  const [componentError, setComponentError] = useState(null);

  // Add error state for form errors
  const [error, setError] = useState(null);

  // State for detailed view modal
  const [showDetailedView, setShowDetailedView] = useState(false);
  const [selectedRiskForView, setSelectedRiskForView] = useState(null);

  // Add state for dropdown toggle near the other state variables
  const [dropdownOpen, setDropdownOpen] = useState(false);
  // Add state for create report modal
  const [showCreateReportModal, setShowCreateReportModal] = useState(false);

  // Toggle dropdown function
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest('.dropdown-container')) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  // Toggle create report modal
  const toggleCreateReportModal = () => {
    setShowCreateReportModal(!showCreateReportModal);
  };

  // Function to handle refresh after successful report creation
  const [refreshCounter, setRefreshCounter] = useState(0);
  const handleReportCreationSuccess = () => {
    // Increment refresh counter to trigger a refresh
    setRefreshCounter(prev => prev + 1);
    // Close the modal
    setShowCreateReportModal(false);
  };

  // --- Automatic Calculation Logic ---
  useEffect(() => {
    // Calculate Total Impact
    const {
      on_customer,
      on_service_capability,
      financial_damage,
      spread_magnitude,
    } = formData.impact_ratings;
    const totalImpact =
      (on_customer || 0) +
      (on_service_capability || 0) +
      (financial_damage || 0) +
      (spread_magnitude || 0);

    // Calculate Consequence Rating based on Total Impact
    let calculatedConsequenceRating = 1;
    if (totalImpact >= 17) {
      calculatedConsequenceRating = 5;
    } else if (totalImpact >= 13) {
      calculatedConsequenceRating = 4;
    } else if (totalImpact >= 9) {
      calculatedConsequenceRating = 3;
    } else if (totalImpact >= 5) {
      calculatedConsequenceRating = 2;
    }

    // Calculate Risk Rating
    const likelihoodRating = formData.severity.likelihood_rating || 1;
    const controlRating = formData.control_assessment.rating || 1;
    const calculatedRiskRating =
      calculatedConsequenceRating * likelihoodRating * controlRating;

    // Calculate Risk Category
    let calculatedRiskCategory = "Not Significant";
    if (formData.impact_assessment.breach_of_legal_obligation === "Y") {
      calculatedRiskCategory = "Significant";
    } else if (calculatedRiskRating >= 27) {
      calculatedRiskCategory = "Significant";
    }

    // Calculate Residual Risk Rating
    const revisedControlRating =
      formData.risk_revision.revised_control_rating || 1;
    const calculatedResidualRiskRating =
      calculatedConsequenceRating * likelihoodRating * revisedControlRating;

    // Update formData state if calculated values differ from current state
    // Use functional update to avoid stale state issues
    setFormData((prevFormData) => {
      const needsUpdate =
        prevFormData.severity.consequence_rating !==
        calculatedConsequenceRating ||
        prevFormData.risk_assessment.risk_rating !== calculatedRiskRating ||
        prevFormData.risk_assessment.risk_category !== calculatedRiskCategory ||
        prevFormData.risk_revision.residual_risk_rating !==
        calculatedResidualRiskRating;

      if (needsUpdate) {
        return {
          ...prevFormData,
          severity: {
            ...prevFormData.severity,
            consequence_rating: calculatedConsequenceRating,
          },
          risk_assessment: {
            ...prevFormData.risk_assessment,
            risk_rating: calculatedRiskRating,
            risk_category: calculatedRiskCategory,
          },
          risk_revision: {
            ...prevFormData.risk_revision,
            residual_risk_rating: calculatedResidualRiskRating,
          },
        };
      }
      return prevFormData; // No update needed
    });
  }, [
    formData.impact_ratings,
    formData.severity.likelihood_rating,
    formData.control_assessment.rating,
    formData.risk_revision.revised_control_rating,
    formData.impact_assessment.breach_of_legal_obligation,
  ]);
  // Watch all dependencies for recalculation

  // Toggle expansion of a column group
  const toggleGroup = (group) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }));
  };

  // Function to fetch risks for current project
  useEffect(() => {
    if (projectid) {
      fetchSheets();
    }
  }, [projectid]);

  // Helper function to get cell background color based on Y/N value
  const getImpactColor = (value) => {
    if (value === "Y") return "bg-red-200";
    if (value === "N") return "bg-green-100";
    return "";
  };

  // Helper function to get cell background color based on rating value (1-5)
  const getRatingColor = (value) => {
    if (value === 5) return "bg-red-600 text-white";
    if (value === 4) return "bg-red-400 text-white";
    if (value === 3) return "bg-red-300";
    if (value === 2) return "bg-orange-200";
    if (value === 1) return "bg-yellow-300";
    return "";
  };

  // Helper function for control rating colors
  const getControlRatingColor = (value) => {
    if (value === 5) return "bg-red-600 text-white";
    if (value === 4) return "bg-red-400 text-white";
    if (value === 3) return "bg-red-300";
    if (value === 2) return "bg-orange-200";
    if (value === 1) return "bg-yellow-300";
    return "";
  };

  // Helper function for risk rating
  const getRiskRatingColor = (value) => {
    if (value >= 27) return "bg-red-600 text-white";
    if (value >= 20) return "bg-red-500 text-white";
    return "";
  };

  // Helper function to render expand/collapse icon
  const renderExpandIcon = (isExpanded) => (
    <span
      className={`ml-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-opacity-50 transition-transform duration-300 ${isExpanded ? "rotate-90" : ""
        }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="w-4 h-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.25 4.5l7.5 7.5-7.5 7.5"
        />
      </svg>
    </span>
  );

  // Function to open modal with specific type
  const openModal = (type, riskToEdit = null) => {
    setModalType(type);
    setExcelFile(null);

    if ((type === "edit" || type === "view") && riskToEdit) {
      setEditingRisk(riskToEdit);
      // Populate form with the risk data - Updated mapping
      setFormData({
        risk_id: riskToEdit.risk_id || "",
        vulnerability_type: riskToEdit.vulnerabilityType || "",
        threat_description: riskToEdit.threatDescription || "",
        context: riskToEdit.context || "",
        applicable_activity: riskToEdit.applicableActivity || "",
        impact_assessment: {
          impact_on_confidentiality:
            riskToEdit.impactAssessment?.confidentiality || "N",
          impact_on_integrity: riskToEdit.impactAssessment?.integrity || "N",
          impact_on_availability:
            riskToEdit.impactAssessment?.availability || "N",
          breach_of_legal_obligation:
            riskToEdit.impactAssessment?.legalObligation || "N",
          description_of_legal_obligation:
            riskToEdit.impactAssessment?.legalObligationDesc || "",
        },
        // Map impact ratings
        impact_ratings: {
          on_customer: riskToEdit.impactRatings?.customer || 1,
          on_service_capability:
            riskToEdit.impactRatings?.serviceCapability || 1,
          financial_damage: riskToEdit.impactRatings?.financialDamage || 1,
          spread_magnitude: riskToEdit.impactRatings?.spreadMagnitude || 1,
        },
        severity: {
          consequence_rating: riskToEdit.severity?.consequenceRating || 1,
          likelihood_rating: riskToEdit.severity?.likelihoodRating || 1,
        },
        control_assessment: {
          description: riskToEdit.controlAssessment?.description || "",
          rating: riskToEdit.controlAssessment?.rating || 1,
        },
        risk_assessment: {
          risk_rating: riskToEdit.riskAssessment?.riskRating || 1,
          risk_category:
            riskToEdit.riskAssessment?.riskCategory || "Not Significant",
          department_bu: riskToEdit.riskAssessment?.departmentBU || "",
          risk_owner: riskToEdit.riskAssessment?.riskOwner || "",
          risk_mitigation_strategy:
            riskToEdit.riskAssessment?.mitigationStrategy || "Tolerate",
        },
        risk_revision: {
          applicable_soa_control: riskToEdit.riskRevision?.soaControl || "",
          soaControlDesc: riskToEdit.riskRevision?.soaControlDesc || "", // Map SoA Control Desc
          planned_controls_meet_requirements:
            riskToEdit.riskRevision?.meetsRequirements || "Y",
          revised_control_rating:
            riskToEdit.riskRevision?.revisedControlRating || 1,
          residual_risk_rating:
            riskToEdit.riskRevision?.residualRiskRating || 1,
          acceptable_to_risk_owner:
            riskToEdit.riskRevision?.acceptableToOwner || "Y",
        },
        mitigation_task: {
          further_planned_action:
            riskToEdit.mitigationPlan?.furtherPlannedAction || "", // Map Further Planned Action
          task_id: riskToEdit.mitigationPlan?.taskId || "",
          task_description: riskToEdit.mitigationPlan?.taskDescription || "",
          task_owner: riskToEdit.mitigationPlan?.taskOwner || "",
          is_ongoing: riskToEdit.mitigationPlan?.isOngoing || "N",
          is_recurrent: riskToEdit.mitigationPlan?.isRecurrent || "N",
          frequency: riskToEdit.mitigationPlan?.frequency || "",
          planned_completion_date:
            riskToEdit.mitigationPlan?.plannedCompletionDate || "",
        },
      });
    } else if (type === "create") {
      setEditingRisk(null);
      // Reset form data to defaults - Updated structure
      setFormData({
        risk_id: "",
        vulnerability_type: "",
        threat_description: "",
        context: "Natural",
        applicable_activity: "",
        impact_assessment: {
          impact_on_confidentiality: "N",
          impact_on_integrity: "N",
          impact_on_availability: "N",
          breach_of_legal_obligation: "N",
          description_of_legal_obligation: "",
        },
        impact_ratings: {
          // Reset impact ratings
          on_customer: 1,
          on_service_capability: 1,
          financial_damage: 1,
          spread_magnitude: 1,
        },
        severity: {
          consequence_rating: 1,
          likelihood_rating: 1,
        },
        control_assessment: {
          description: "",
          rating: 1,
        },
        risk_assessment: {
          risk_rating: 1,
          risk_category: "Not Significant",
          department_bu: "",
          risk_owner: "",
          risk_mitigation_strategy: "Tolerate",
        },
        risk_revision: {
          // Reset risk revision
          applicable_soa_control: "",
          soaControlDesc: "",
          planned_controls_meet_requirements: "Y",
          revised_control_rating: 1,
          residual_risk_rating: 1,
          acceptable_to_risk_owner: "Y",
        },
        mitigation_task: {
          // Reset mitigation task
          further_planned_action: "",
          task_id: "",
          task_description: "",
          task_owner: "",
          is_ongoing: "N",
          is_recurrent: "N",
          frequency: "",
          planned_completion_date: "",
        },
      });
    }

    setShowModal(true);
  };

  // Close the modal and reset form state - Updated structure
  const closeModal = () => {
    setShowModal(false);
    setModalType("form");
    setEditingRisk(null);
    setError(null); // Clear any error messages
    setFormData({
      // Reset using the updated structure
      risk_id: "",
      vulnerability_type: "",
      threat_description: "",
      context: "Natural",
      applicable_activity: "",
      impact_assessment: {
        impact_on_confidentiality: "N",
        impact_on_integrity: "N",
        impact_on_availability: "N",
        breach_of_legal_obligation: "N",
        description_of_legal_obligation: "",
      },
      impact_ratings: {
        on_customer: 1,
        on_service_capability: 1,
        financial_damage: 1,
        spread_magnitude: 1,
      },
      severity: { consequence_rating: 1, likelihood_rating: 1 },
      control_assessment: { description: "", rating: 1 },
      risk_assessment: {
        risk_rating: 1,
        risk_category: "Not Significant",
        department_bu: "",
        risk_owner: "",
        risk_mitigation_strategy: "Tolerate",
      },
      risk_revision: {
        applicable_soa_control: "",
        soaControlDesc: "",
        planned_controls_meet_requirements: "Y",
        revised_control_rating: 1,
        residual_risk_rating: 1,
        acceptable_to_risk_owner: "Y",
      },
      mitigation_task: {
        further_planned_action: "",
        task_id: "",
        task_description: "",
        task_owner: "",
        is_ongoing: "N",
        is_recurrent: "N",
        frequency: "",
        planned_completion_date: "",
      },
    });
  };

  // Handle form input changes (No change needed here)
  const handleFormChange = (e, section, field) => {
    const { value } = e.target;

    if (section) {
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  // Handle numeric input changes (No change needed here)
  const handleNumericChange = (e, section, field) => {
    const value = parseInt(e.target.value) || 1;

    if (section) {
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  // Handle select input changes (No change needed here)
  const handleSelectChange = (e, section, field) => {
    if (section) {
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: e.target.value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    }
  };

  // Handle file input change (No change needed here)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setExcelFile(file);
    }
  };

  // Submit risk form - Updated API mapping
  const handleRiskSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSheet) {
      setError("Please select a report first");
      return;
    }

    // Basic form validation
    if (!formData.risk_id || !formData.vulnerability_type || !formData.threat_description) {
      setError("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    setError(null); // Clear previous errors

    try {
      const today = new Date().toISOString().split("T")[0];
      const apiData = {
        risk_id: formData.risk_id || "Risk_" + Date.now(),
        vulnerability_type: formData.vulnerability_type || "Default",
        threat_description:
          formData.threat_description || "Default threat description",
        context: formData.context || "Natural",
        applicable_activity:
          formData.applicable_activity || "Working in the organisation",
        // Combine impact assessment, ratings, and severity for API
        ra_impact_assessment: {
          impact_on_confidentiality:
            formData.impact_assessment.impact_on_confidentiality || "N",
          impact_on_integrity:
            formData.impact_assessment.impact_on_integrity || "N",
          impact_on_availability:
            formData.impact_assessment.impact_on_availability || "N",
          breach_of_legal_obligation:
            formData.impact_assessment.breach_of_legal_obligation || "N",
          description_of_legal_obligation:
            formData.impact_assessment.description_of_legal_obligation || "",
          on_customer: formData.impact_ratings.on_customer || 1,
          on_service_capability:
            formData.impact_ratings.on_service_capability || 1,
          financial_damage: formData.impact_ratings.financial_damage || 1,
          spread_magnitude: formData.impact_ratings.spread_magnitude || 1,
          consequence_rating: formData.severity.consequence_rating || 1,
          likelihood_rating: formData.severity.likelihood_rating || 1,
        },
        ra_control_assessment: {
          description:
            formData.control_assessment.description || "Not specified",
          rating: formData.control_assessment.rating || 1,
        },
        ra_risk_assessment: {
          risk_rating: formData.risk_assessment.risk_rating || 1,
          risk_category:
            formData.risk_assessment.risk_category || "Not Significant",
          department_bu: formData.risk_assessment.department_bu || "Admin",
          risk_owner: formData.risk_assessment.risk_owner || "Admin",
          risk_mitigation_strategy:
            formData.risk_assessment.risk_mitigation_strategy || "Tolerate",
        },
        ra_risk_revision: {
          applicable_soa_control:
            formData.risk_revision.applicable_soa_control || "",
          soa_control_description: formData.risk_revision.soaControlDesc || "", // Map SoA Control Desc
          planned_controls_meet_requirements:
            formData.risk_revision.planned_controls_meet_requirements || "Y",
          revised_control_rating:
            formData.risk_revision.revised_control_rating || 1,
          residual_risk_rating:
            formData.risk_revision.residual_risk_rating || 1,
          acceptable_to_risk_owner:
            formData.risk_revision.acceptable_to_risk_owner || "Y",
        },
        ra_mitigation_task: {
          task_id: formData.mitigation_task.task_id || "Task_" + Date.now(), // Task ID might be generated or optional
          task_description:
            formData.mitigation_task.task_description ||
            "Default task description",
          task_owner: formData.mitigation_task.task_owner || "Admin",
          is_ongoing: formData.mitigation_task.is_ongoing || "N",
          planned_completion_date:
            formData.mitigation_task.planned_completion_date || today,
          is_recurrent: formData.mitigation_task.is_recurrent || "N",
          frequency:
            formData.mitigation_task.is_recurrent === "Y"
              ? formData.mitigation_task.frequency
              : null, // Send null if not recurrent
          further_planned_action:
            formData.mitigation_task.further_planned_action || "", // Map Further Planned Action
        },
      };
      const response = await apiRequest(
        "POST",
        `/api/rarpt/assessment-sheets/${selectedSheet.id}/risks/create/`,
        apiData,
        true
      );

      if (response.status === 200 || response.status === 201) {
        message.success("Risk created successfully");
        await fetchRisksForSheet(selectedSheet.id);
        closeModal(); // Close modal immediately after success
      }
    } catch (err) {
      console.error("Error creating risk:", err.message || "Unknown error");
      setError(err.message || "Failed to create risk"); // Use setError
    } finally {
      setIsLoading(false);
    }
  };

  // Update existing risk - Updated API mapping
  const handleRiskUpdate = async (e) => {
    e.preventDefault();
    if (!selectedSheet || !editingRisk) {
      setError("Risk not selected");
      return;
    }

    // Basic form validation
    if (!formData.risk_id || !formData.vulnerability_type || !formData.threat_description) {
      setError("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    setError(null); // Clear previous errors

    try {
      const today = new Date().toISOString().split("T")[0];
      const apiData = {
        risk_id: formData.risk_id || "Risk_" + Date.now(),
        vulnerability_type: formData.vulnerability_type || "Default",
        threat_description:
          formData.threat_description || "Default threat description",
        context: formData.context || "Natural",
        applicable_activity:
          formData.applicable_activity || "Working in the organisation",
        ra_impact_assessment: {
          impact_on_confidentiality:
            formData.impact_assessment.impact_on_confidentiality || "N",
          impact_on_integrity:
            formData.impact_assessment.impact_on_integrity || "N",
          impact_on_availability:
            formData.impact_assessment.impact_on_availability || "N",
          breach_of_legal_obligation:
            formData.impact_assessment.breach_of_legal_obligation || "N",
          description_of_legal_obligation:
            formData.impact_assessment.description_of_legal_obligation || "",
          on_customer: formData.impact_ratings.on_customer || 1,
          on_service_capability:
            formData.impact_ratings.on_service_capability || 1,
          financial_damage: formData.impact_ratings.financial_damage || 1,
          spread_magnitude: formData.impact_ratings.spread_magnitude || 1,
          consequence_rating: formData.severity.consequence_rating || 1,
          likelihood_rating: formData.severity.likelihood_rating || 1,
        },
        ra_control_assessment: {
          description:
            formData.control_assessment.description || "Not specified",
          rating: formData.control_assessment.rating || 1,
        },
        ra_risk_assessment: {
          risk_rating: formData.risk_assessment.risk_rating || 1,
          risk_category:
            formData.risk_assessment.risk_category || "Not Significant",
          department_bu: formData.risk_assessment.department_bu || "Admin",
          risk_owner: formData.risk_assessment.risk_owner || "Admin",
          risk_mitigation_strategy:
            formData.risk_assessment.risk_mitigation_strategy || "Tolerate",
        },
        ra_risk_revision: {
          applicable_soa_control:
            formData.risk_revision.applicable_soa_control || "",
          soa_control_description: formData.risk_revision.soaControlDesc || "", // Map SoA Control Desc
          planned_controls_meet_requirements:
            formData.risk_revision.planned_controls_meet_requirements || "Y",
          revised_control_rating:
            formData.risk_revision.revised_control_rating || 1,
          residual_risk_rating:
            formData.risk_revision.residual_risk_rating || 1,
          acceptable_to_risk_owner:
            formData.risk_revision.acceptable_to_risk_owner || "Y",
        },
        ra_mitigation_task: {
          task_id:
            formData.mitigation_task.task_id ||
            editingRisk.mitigationPlan?.taskId ||
            "Task_" + Date.now(),
          task_description:
            formData.mitigation_task.task_description ||
            "Default task description",
          task_owner: formData.mitigation_task.task_owner || "Admin",
          is_ongoing: formData.mitigation_task.is_ongoing || "N",
          planned_completion_date:
            formData.mitigation_task.planned_completion_date || today,
          is_recurrent: formData.mitigation_task.is_recurrent || "N",
          frequency:
            formData.mitigation_task.is_recurrent === "Y"
              ? formData.mitigation_task.frequency
              : null,
          further_planned_action:
            formData.mitigation_task.further_planned_action || "",
        },
      };

      const response = await apiRequest(
        "PUT",
        `/api/rarpt/assessment-risks/${editingRisk.id}/`,
        apiData,
        true
      );

      if (response.status === 200 || response.status === 204) {
        message.success("Risk updated successfully");
        await fetchRisksForSheet(selectedSheet.id);
        closeModal(); // Close modal immediately after success
      }
    } catch (err) {
      console.error("Error updating risk:", err.message || "Unknown error");
      setError(err.message || "Failed to update risk"); // Use setError
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a risk
  const handleDeleteRisk = async (riskId) => {
    openConfirmModal({
      title: "Confirm Risk Deletion",
      message:
        "Are you sure you want to delete this risk assessment? This action cannot be undone.",
      onConfirm: async () => {
        closeConfirmModal();
        setIsLoading(true);
        try {
          await apiRequest(
            "DELETE",
            `/api/rarpt/assessment-risks/${riskId}/`,
            null,
            true
          );
          message.success("Risk deleted successfully");
          if (selectedSheet) {
            await fetchRisksForSheet(selectedSheet.id);
          }
        } catch (err) {
          console.error("Error deleting risk:", err);
          message.error(err.message || "Failed to delete risk");
        } finally {
          setIsLoading(false);
        }
      },
      onClose: closeConfirmModal,
    });
  };

  // Function to fetch a single risk by ID
  const fetchRiskById = async (riskId) => {
    setIsLoading(true);

    try {
      // Call the API to get a specific risk
      const response = await apiRequest(
        "GET",
        `/api/rarpt/risks/${riskId}/`,
        null,
        true
      );

      // Check if the response contains data
      if (response.data) {
        // Transform to frontend format
        const risk = response.data;
        const formattedRisk = {
          id: risk.id || "",
          risk_id: risk.risk_id || "",
          vulnerabilityType: risk.vulnerability_type || "",
          threatDescription: risk.threat_description || "",
          context: risk.context || "",
          applicableActivity: risk.applicable_activity || "",
          // Impact assessment fields
          impactAssessment: {
            confidentiality:
              risk.impact_assessment?.impact_on_confidentiality || "N",
            integrity: risk.impact_assessment?.impact_on_integrity || "N",
            availability: risk.impact_assessment?.impact_on_availability || "N",
            legalObligation:
              risk.impact_assessment?.breach_of_legal_obligation || "N",
            legalObligationDesc:
              risk.impact_assessment?.description_of_legal_obligation || "",
          },
          // Impact ratings fields - also come from impact_assessment
          impactRatings: {
            customer: risk.impact_assessment?.on_customer || 1,
            serviceCapability:
              risk.impact_assessment?.on_service_capability || 1,
            financialDamage: risk.impact_assessment?.financial_damage || 1,
            spreadMagnitude: risk.impact_assessment?.spread_magnitude || 1,
          },
          // Severity also comes from impact_assessment
          severity: {
            consequenceRating: risk.impact_assessment?.consequence_rating || 1,
            likelihoodRating: risk.impact_assessment?.likelihood_rating || 1,
          },
          // Control assessment
          controlAssessment: {
            description: risk.control_assessment?.description || "",
            rating: risk.control_assessment?.rating || 1,
          },
          // Risk assessment
          riskAssessment: {
            riskRating: risk.risk_assessment?.risk_rating || 1,
            riskCategory:
              risk.risk_assessment?.risk_category || "Not Significant",
            departmentBU: risk.risk_assessment?.department_bu || "",
            riskOwner: risk.risk_assessment?.risk_owner || "",
            mitigationStrategy:
              risk.risk_assessment?.risk_mitigation_strategy || "Tolerate",
          },
          // Risk revision
          riskRevision: {
            soaControl: risk.risk_revision?.applicable_soa_control || "",
            soaControlDesc: risk.risk_revision?.soa_control_description || "",
            meetsRequirements:
              risk.risk_revision?.planned_controls_meet_requirements || "Y",
            revisedControlRating:
              risk.risk_revision?.revised_control_rating || 1,
            residualRiskRating: risk.risk_revision?.residual_risk_rating || 1,
            acceptableToOwner:
              risk.risk_revision?.acceptable_to_risk_owner || "Y",
          },
          // Mitigation plan - construct from available data or use defaults
          mitigationPlan: {
            furtherPlannedAction: "Yes",
            taskId: risk.mitigation_task?.task_id || "",
            taskDescription: risk.mitigation_task?.task_description || "",
            taskOwner: risk.mitigation_task?.task_owner || "",
            isOngoing: risk.mitigation_task?.is_ongoing || "Y",
            plannedCompletionDate:
              risk.mitigation_task?.planned_completion_date || "",
            isRecurrent: risk.mitigation_task?.is_recurrent || "N",
            frequency: risk.mitigation_task?.frequency || "",
          },
        };

        return formattedRisk;
      } else {
        console.warn("API returned no risk data or invalid format");
        return null;
      }
    } catch (err) {
      console.error("Error fetching risk details:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle viewing a risk's details
  const handleViewRisk = async (riskId) => {
    const riskData = await fetchRiskById(riskId);
    if (riskData) {
      openModal("view", riskData);
    }
  };

  // Function to handle viewing a risk directly from an object
  const handleViewRiskByObject = (risk) => {
    // Set the selected risk for the detailed view
    setSelectedRiskForView(risk);
    // Show the detailed view modal
    setShowDetailedView(true);
  };

  // Function to handle editing a risk directly from an object
  const handleEditRiskByObject = (risk) => {
    // Reset any previous state
    setError(null);

    try {
      // Set the editing risk directly from the object passed
      setEditingRisk(risk);

      // Map the risk object directly to the form data - same as view function
      setFormData({
        risk_id: risk.risk_id || "",
        vulnerability_type: risk.vulnerabilityType || "",
        threat_description: risk.threatDescription || "",
        context: risk.context || "",
        applicable_activity: risk.applicableActivity || "",
        impact_assessment: {
          impact_on_confidentiality:
            risk.impactAssessment?.confidentiality || "N",
          impact_on_integrity: risk.impactAssessment?.integrity || "N",
          impact_on_availability: risk.impactAssessment?.availability || "N",
          breach_of_legal_obligation:
            risk.impactAssessment?.legalObligation || "N",
          description_of_legal_obligation:
            risk.impactAssessment?.legalObligationDesc || "",
        },
        impact_ratings: {
          on_customer: risk.impactRatings?.customer || 1,
          on_service_capability: risk.impactRatings?.serviceCapability || 1,
          financial_damage: risk.impactRatings?.financialDamage || 1,
          spread_magnitude: risk.impactRatings?.spreadMagnitude || 1,
        },
        severity: {
          consequence_rating: risk.severity?.consequenceRating || 1,
          likelihood_rating: risk.severity?.likelihoodRating || 1,
        },
        control_assessment: {
          description: risk.controlAssessment?.description || "",
          rating: risk.controlAssessment?.rating || 1,
        },
        risk_assessment: {
          risk_rating: risk.riskAssessment?.riskRating || 1,
          risk_category: risk.riskAssessment?.riskCategory || "Not Significant",
          department_bu: risk.riskAssessment?.departmentBU || "",
          risk_owner: risk.riskAssessment?.riskOwner || "",
          risk_mitigation_strategy:
            risk.riskAssessment?.mitigationStrategy || "Tolerate",
        },
        risk_revision: {
          applicable_soa_control: risk.riskRevision?.soaControl || "",
          soaControlDesc: risk.riskRevision?.soaControlDesc || "",
          meetsRequirements:
            risk.riskRevision?.meetsRequirements || "Y",
          revised_control_rating: risk.riskRevision?.revisedControlRating || 1,
          residual_risk_rating: risk.riskRevision?.residualRiskRating || 1,
          acceptable_to_risk_owner: risk.riskRevision?.acceptableToOwner || "Y",
        },
        mitigation_task: {
          task_id: risk.mitigationPlan?.taskId || "",
          task_description: risk.mitigationPlan?.taskDescription || "",
          task_owner: risk.mitigationPlan?.taskOwner || "",
          is_ongoing: risk.mitigationPlan?.isOngoing || "Y",
          is_recurrent: risk.mitigationPlan?.isRecurrent || "N",
          frequency: risk.mitigationPlan?.frequency || "",
          planned_completion_date:
            risk.mitigationPlan?.plannedCompletionDate || "",
        },
      });

      // Set modal to edit mode and show it
      setModalType("edit");
      setShowModal(true);
    } catch (err) {
      console.error("Error in handleEditRiskByObject:", err);
      setError("Failed to prepare risk for editing: " + (err.message || "Unknown error"));
    }
  };

  // Function to toggle the legends modal
  const toggleLegendsModal = () => {
    setShowLegendsModal(!showLegendsModal);
  };

  // Function to fetch all sheets for current project
  const fetchSheets = async () => {
    setIsLoading(true);

    try {
      // Call the API to get sheets for the current project
      const response = await apiRequest(
        "GET",
        `/api/rarpt/project/${projectid}/assessment-sheets/`,
        null,
        true
      );

      // Check if the response contains data
      if (response.data && Array.isArray(response.data)) {
        setSheets(response.data);

        // If there are sheets and no selected sheet, select the first one
        if (response.data.length > 0 && !selectedSheet) {
          // Find if the previously selected sheet still exists
          const previouslySelected = sheets.find(
            (s) => s.id === selectedSheet?.id
          );
          const sheetToSelect = previouslySelected || response.data[0];
          setSelectedSheet(sheetToSelect);
          await fetchRisksForSheet(sheetToSelect.id);
        } else if (response.data.length === 0) {
          setRiskData([]);
          setSelectedSheet(null);
        }
      } else {
        setSheets([]);
        setRiskData([]);
        setSelectedSheet(null);
      }
    } catch (err) {
      console.error("Error fetching sheets:", err);
      message.error(err.message || "Failed to fetch assessment sheets"); // Use message.error
      setSheets([]);
      setRiskData([]);
      setSelectedSheet(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to create a new sheet
  const createSheet = async () => {
    if (!newSheetName.trim()) {
      message.error("Report name cannot be empty"); // Use message.error
      return;
    }
    setIsLoading(true);

    try {
      const response = await apiRequest(
        "POST",
        `/api/rarpt/project/${projectid}/assessment-sheets/create/`,
        { name: newSheetName.trim() },
        true
      );
      message.success("Report created successfully"); // Use message.success
      setNewSheetName("");
      setShowSheetModal(false);

      // Refresh sheets
      await fetchSheets();

      // Select the newly created sheet
      if (response.data) {
        // Find the newly created sheet in the updated list to ensure we have the latest data
        const newSheet = response.data; // Assuming API returns the created sheet
        if (newSheet) {
          setSelectedSheet(newSheet);
          await fetchRisksForSheet(newSheet.id);
        }
      }
    } catch (err) {
      console.error("Error creating Report:", err);
      message.error(err.message || "Failed to create Report"); // Use message.error
    } finally {
      setIsLoading(false);
    }
  };

  // Function to delete a sheet
  const deleteSheet = async (sheetId, sheetName, riskCount) => {
    openConfirmModal({
      title: "Confirm Report Deletion",
      message: `Are you sure you want to delete the report "${sheetName}"? This will also delete ${riskCount} associated risks. This action cannot be undone.`,
      onConfirm: async () => {
        closeConfirmModal();
        setIsLoading(true);
        try {
          await apiRequest(
            "DELETE",
            `/api/rarpt/assessment-sheets/${sheetId}/`,
            null,
            true
          );
          message.success("Report deleted successfully");

          // Fetch updated sheets list *after* deletion
          const response = await apiRequest(
            "GET",
            `/api/rarpt/project/${projectid}/assessment-sheets/`,
            null,
            true
          );
          const updatedSheets = response.data || [];
          setSheets(updatedSheets);

          // Check if the deleted sheet was the selected one
          if (selectedSheet && selectedSheet.id === sheetId) {
            if (updatedSheets.length > 0) {
              // Select the first available sheet
              const nextSheet = updatedSheets[0];
              setSelectedSheet(nextSheet);
              await fetchRisksForSheet(nextSheet.id);
            } else {
              // No sheets left
              setSelectedSheet(null);
              setRiskData([]);
            }
          } else {
            // If a different sheet was deleted, just update the list
            // The current selection remains valid (unless it somehow got deleted, handled above)
          }
        } catch (err) {
          console.error(
            "Error deleting or fetching risks after deletion:",
            err
          );
          message.error(
            err.message || "Failed to delete risk or refresh list"
          );
        } finally {
          setIsLoading(false);
        }
      },
      onClose: closeConfirmModal,
    });
  };

  // Function to handle sheet selection change
  const handleSheetChange = async (sheetId) => {
    if (sheetId === "create") {
      setShowSheetModal(true);
      return;
    }

    const sheet = sheets.find((s) => s.id === parseInt(sheetId));
    if (sheet) {
      setSelectedSheet(sheet);
      await fetchRisksForSheet(sheet.id);
    }
  };

  // Function to fetch risks for a specific sheet
  const fetchRisksForSheet = async (sheetId) => {
    setIsLoading(true);
    console.log(`Attempting to fetch risks for sheet ID: ${sheetId}`);

    try {
      // Call the API to get risks for the selected sheet
      const response = await apiRequest(
        "GET",
        `/api/rarpt/assessment-sheets/${sheetId}/risks/`,
        null,
        true
      );

      console.log(`Risks response for sheet ${sheetId}:`, response);

      // Check if the response contains data
      if (response.data && Array.isArray(response.data)) {
        // Transform API data to match the expected format for the frontend
        const formattedRisks = response.data.map((risk) => {
          // Ensure all properties exist to prevent 'undefined' errors
          return {
            id: risk.id || "",
            risk_id: risk.risk_id || "",
            vulnerabilityType: risk.vulnerability_type || "Not Specified",
            threatDescription: risk.threat_description || "",
            context: risk.context || "",
            applicableActivity: risk.applicable_activity || "",
            // Impact assessment fields
            impactAssessment: {
              confidentiality:
                risk.ra_impact_assessment?.impact_on_confidentiality || "N",
              integrity: risk.ra_impact_assessment?.impact_on_integrity || "N",
              availability:
                risk.ra_impact_assessment?.impact_on_availability || "N",
              legalObligation:
                risk.ra_impact_assessment?.breach_of_legal_obligation || "N",
              legalObligationDesc:
                risk.ra_impact_assessment?.description_of_legal_obligation ||
                "",
            },
            // Impact ratings fields - also come from impact_assessment
            impactRatings: {
              customer: risk.ra_impact_assessment?.on_customer || 1,
              serviceCapability:
                risk.ra_impact_assessment?.on_service_capability || 1,
              financialDamage: risk.ra_impact_assessment?.financial_damage || 1,
              spreadMagnitude: risk.ra_impact_assessment?.spread_magnitude || 1,
            },
            // Severity also comes from impact_assessment
            severity: {
              consequenceRating:
                risk.ra_impact_assessment?.consequence_rating || 1,
              likelihoodRating:
                risk.ra_impact_assessment?.likelihood_rating || 1,
            },
            // Control assessment
            controlAssessment: {
              description: risk.ra_control_assessment?.description || "",
              rating: risk.ra_control_assessment?.rating || 1,
            },
            // Risk assessment
            riskAssessment: {
              riskRating: risk.ra_risk_assessment?.risk_rating || 1,
              riskCategory:
                risk.ra_risk_assessment?.risk_category || "Not Significant",
              departmentBU: risk.ra_risk_assessment?.department_bu || "",
              riskOwner: risk.ra_risk_assessment?.risk_owner || "",
              mitigationStrategy:
                risk.ra_risk_assessment?.risk_mitigation_strategy || "Tolerate",
            },
            // Risk revision
            riskRevision: {
              soaControl: risk.ra_risk_revision?.applicable_soa_control || "",
              soaControlDesc:
                risk.ra_risk_revision?.soa_control_description || "",
              meetsRequirements:
                risk.ra_risk_revision?.planned_controls_meet_requirements ||
                "Y",
              revisedControlRating:
                risk.ra_risk_revision?.revised_control_rating || 1,
              residualRiskRating:
                risk.ra_risk_revision?.residual_risk_rating || 1,
              acceptableToOwner:
                risk.ra_risk_revision?.acceptable_to_risk_owner || "Y",
            },
            // Mitigation plan - construct from available data or use defaults
            mitigationPlan: {
              taskId: risk.ra_mitigation_task?.task_id || "",
              taskDescription: risk.ra_mitigation_task?.task_description || "",
              taskOwner: risk.ra_mitigation_task?.task_owner || "",
              isOngoing: risk.ra_mitigation_task?.is_ongoing || "N",
              plannedCompletionDate:
                risk.ra_mitigation_task?.planned_completion_date || "",
              isRecurrent: risk.ra_mitigation_task?.is_recurrent || "N",
              frequency: risk.ra_mitigation_task?.frequency || "",
              furtherPlannedAction:
                risk.ra_mitigation_task?.further_planned_action || "",
            },
          };
        });

        console.log(`Formatted ${formattedRisks.length} risks for sheet ${sheetId}`);
        setRiskData(formattedRisks);
      } else {
        console.log(`No risks data received for sheet ${sheetId}`);
        setRiskData([]);
      }
    } catch (err) {
      console.error(`Error fetching risks for sheet ${sheetId}:`, err);
      message.error(err.message || "Failed to fetch risks"); // Use message.error
      setRiskData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Submit excel file
  const handleExcelSubmit = async (e) => {
    e.preventDefault();

    if (!excelFile) {
      setError("Please select an Excel file");
      return;
    }

    if (!selectedSheet) {
      setError("Please select a report first");
      return;
    }

    setIsLoading(true);
    setError(null); // Clear previous errors

    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append("file", excelFile);

      // Use the updated endpoint format for the sheet-based structure
      const response = await apiRequest(
        "POST",
        `/api/rarpt/assessment-sheets/${selectedSheet.id}/risks/create/`,
        formData,
        true
      );

      if (response.status === 200 || response.status === 201) {
        message.success("Excel file uploaded successfully."); // Use message.success
        // Always refresh the risk list after a successful upload
        await fetchRisksForSheet(selectedSheet.id);
        // Close modal immediately after success
        closeModal();
      }
    } catch (err) {
      console.error(
        "Error uploading Excel file:",
        err.message || "Unknown error"
      );
      setError(err.message || "Failed to upload Excel file");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to open confirmation modal
  const openConfirmModal = (props) => {
    setConfirmModalProps(props);
    setShowConfirmModal(true);
  };

  // Function to close confirmation modal
  const closeConfirmModal = () => {
    setShowConfirmModal(false);
    // Reset props if needed, or let the next openConfirmModal overwrite them
    setConfirmModalProps({
      onConfirm: () => { },
      title: "Confirm Action",
      message: "Are you sure?",
    });
  };

  // Return to reports table
  const goBackToTable = () => {
    changeTab('table');
  };

  // Close the detailed view modal
  const closeDetailedView = () => {
    setShowDetailedView(false);
    setSelectedRiskForView(null);
  };

  // Update the useEffect that handles route parameters to correctly check for report types
  useEffect(() => {
    // Check if we have a reportType parameter in the URL
    const reportParams = location.pathname.split('/');
    const reportType = reportParams[reportParams.length - 1];

    // Parse URL search params to get reportId if it exists
    const searchParams = new URLSearchParams(location.search);
    const reportId = searchParams.get('reportId');

    console.log("URL params:", { reportType, reportId, pathname: location.pathname, search: location.search });

    // If the URL contains a valid report type, set it as the active tab
    if (['riskAssessment', 'riskTreatment', 'vapt', 'asisReport'].includes(reportType)) {
      setActiveTab(reportType);

      // If we have a reportId, we should load that specific report
      if (reportId) {
        console.log(`REPORT DEBUG: Attempting to load report with ID ${reportId} in tab ${reportType}`);
        message.info(`Loading report ${reportId}...`);

        // Based on the report type, use the appropriate API endpoint to fetch the report
        let fetchSpecificReport = async () => {
          try {
            setIsLoading(true);

            // Different handling based on report type
            if (reportType === 'riskAssessment' || reportType === 'riskTreatment') {
              console.log(`Fetching risk assessment/treatment report ID: ${reportId}`);

              // For risk assessment/treatment, we need to:
              // 1. Set the selected sheet based on the reportId
              // 2. Then fetch all risks for that sheet

              try {
                // First, fetch the sheet details directly using the reportId as the sheet ID
                const sheetResponse = await apiRequest(
                  'GET',
                  `/api/rarpt/assessment-sheets/${reportId}/`,
                  null,
                  true
                );

                console.log("Sheet response:", sheetResponse);

                if (sheetResponse && sheetResponse.data) {
                  // Set the selected sheet
                  setSelectedSheet(sheetResponse.data);

                  // Now fetch all risks for this sheet
                  const risksResponse = await apiRequest(
                    'GET',
                    `/api/rarpt/assessment-sheets/${reportId}/risks/`,
                    null,
                    true
                  );

                  console.log("Risks response:", risksResponse);

                  if (risksResponse && risksResponse.data && Array.isArray(risksResponse.data)) {
                    // Transform the risks data to match our format
                    const formattedRisks = risksResponse.data.map(risk => ({
                      id: risk.id || "",
                      risk_id: risk.risk_id || "",
                      vulnerabilityType: risk.vulnerability_type || "Not Specified",
                      threatDescription: risk.threat_description || "",
                      context: risk.context || "",
                      applicableActivity: risk.applicable_activity || "",
                      // Map other fields as needed
                      impactAssessment: {
                        confidentiality: risk.ra_impact_assessment?.impact_on_confidentiality || "N",
                        integrity: risk.ra_impact_assessment?.impact_on_integrity || "N",
                        availability: risk.ra_impact_assessment?.impact_on_availability || "N",
                        legalObligation: risk.ra_impact_assessment?.breach_of_legal_obligation || "N",
                        legalObligationDesc: risk.ra_impact_assessment?.description_of_legal_obligation || "",
                      },
                      impactRatings: {
                        customer: risk.ra_impact_assessment?.on_customer || 1,
                        serviceCapability: risk.ra_impact_assessment?.on_service_capability || 1,
                        financialDamage: risk.ra_impact_assessment?.financial_damage || 1,
                        spreadMagnitude: risk.ra_impact_assessment?.spread_magnitude || 1,
                      },
                      severity: {
                        consequenceRating: risk.ra_impact_assessment?.consequence_rating || 1,
                        likelihoodRating: risk.ra_impact_assessment?.likelihood_rating || 1,
                      },
                      controlAssessment: {
                        description: risk.ra_control_assessment?.description || "",
                        rating: risk.ra_control_assessment?.rating || 1,
                      },
                      riskAssessment: {
                        riskRating: risk.ra_risk_assessment?.risk_rating || 1,
                        riskCategory: risk.ra_risk_assessment?.risk_category || "Not Significant",
                        departmentBU: risk.ra_risk_assessment?.department_bu || "",
                        riskOwner: risk.ra_risk_assessment?.risk_owner || "",
                        mitigationStrategy: risk.ra_risk_assessment?.risk_mitigation_strategy || "Tolerate",
                      },
                      riskRevision: {
                        soaControl: risk.ra_risk_revision?.applicable_soa_control || "",
                        soaControlDesc: risk.ra_risk_revision?.soa_control_description || "",
                        meetsRequirements: risk.ra_risk_revision?.planned_controls_meet_requirements || "Y",
                        revisedControlRating: risk.ra_risk_revision?.revised_control_rating || 1,
                        residualRiskRating: risk.ra_risk_revision?.residual_risk_rating || 1,
                        acceptableToOwner: risk.ra_risk_revision?.acceptable_to_risk_owner || "Y",
                      },
                      mitigationPlan: {
                        taskId: risk.ra_mitigation_task?.task_id || "",
                        taskDescription: risk.ra_mitigation_task?.task_description || "",
                        taskOwner: risk.ra_mitigation_task?.task_owner || "",
                        isOngoing: risk.ra_mitigation_task?.is_ongoing || "N",
                        plannedCompletionDate: risk.ra_mitigation_task?.planned_completion_date || "",
                        isRecurrent: risk.ra_mitigation_task?.is_recurrent || "N",
                        frequency: risk.ra_mitigation_task?.frequency || "",
                        furtherPlannedAction: risk.ra_mitigation_task?.further_planned_action || "",
                      },
                    }));

                    setRiskData(formattedRisks);
                  } else {
                    // No risks data received
                    setRiskData([]);
                  }
                } else {
                  message.warning("Could not load the selected report sheet");
                }
              } catch (error) {
                console.error("Error in risk assessment loading:", error);
                // Try an alternative approach - maybe the reportId is for a risk, not a sheet
                try {
                  // Try to fetch the risk directly
                  const riskResponse = await apiRequest(
                    'GET',
                    `/api/rarpt/assessment-risks/${reportId}/`,
                    null,
                    true
                  );

                  if (riskResponse && riskResponse.data) {
                    // If we got risk data, find the sheet it belongs to
                    const sheetId = riskResponse.data.sheet || riskResponse.data.assessment_sheet;

                    if (sheetId) {
                      // Fetch the sheet data
                      const sheetResponse = await apiRequest(
                        'GET',
                        `/api/rarpt/assessment-sheets/${sheetId}/`,
                        null,
                        true
                      );

                      if (sheetResponse && sheetResponse.data) {
                        setSelectedSheet(sheetResponse.data);
                        await fetchRisksForSheet(sheetId);
                      }
                    }
                  }
                } catch (innerError) {
                  console.error("Error in alternative risk loading approach:", innerError);
                  message.error("Failed to load the requested report");
                }
              }
            } else if (reportType === 'vapt') {
              // Handle VAPT report loading
              try {
                const vaptResponse = await apiRequest(
                  'GET',
                  `/api/rarpt/vapt/${reportId}/`,
                  null,
                  true
                );

                console.log("VAPT response:", vaptResponse);
                // VAPT component should handle its own data
              } catch (error) {
                console.error("Error loading VAPT report:", error);
                message.error("Failed to load VAPT report");
              }
            } else if (reportType === 'asisReport') {
              // Handle ASIS report loading
              try {
                const asisResponse = await apiRequest(
                  'GET',
                  `/api/rarpt/asis-reports/${reportId}/`,
                  null,
                  true
                );

                console.log("ASIS response:", asisResponse);
                // ASIS component should handle its own data
              } catch (error) {
                console.error("Error loading ASIS report:", error);
                message.error("Failed to load ASIS report");
              }
            }
          } catch (error) {
            console.error(`Error loading report ID ${reportId}:`, error);
            message.error('Failed to load the requested report. Please try again.');
          } finally {
            setIsLoading(false);
          }
        };

        fetchSpecificReport();
      }
    } else if (reportParams[reportParams.length - 1] === 'myreports') {
      // If we're just on the myreports path without a specific report type
      setActiveTab('table');
    }
  }, [location.pathname, location.search]);

  // Separate useEffect for data loading to avoid dependency issues
  useEffect(() => {
    // If we're on a specific report tab, fetch the relevant data
    if (selectedSheet && activeTab === 'riskAssessment') {
      try {
        fetchRisksForSheet(selectedSheet.id);
      } catch (error) {
        console.error("Error fetching risks:", error);
      }
    }
  }, [activeTab, selectedSheet]);

  // Add an effect to load sheets when the component mounts
  useEffect(() => {
    // Fetch sheets when component mounts
    if (projectid) {
      try {
        fetchSheets();
      } catch (error) {
        console.error("Error fetching sheets:", error);
      }
    }
  }, [projectid]);

  // Add error boundary around the render
  useEffect(() => {
    const handleError = (error) => {
      console.error("MyReports component error:", error);
      setComponentError(error.message);
    };

    window.addEventListener('error', handleError);
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);

  // Handle deleting a Risk Assessment report
  const handleDeleteReport = (sheetId, sheetName) => {
    if (!sheetId) return;

    // Show confirmation dialog
    openConfirmModal({
      title: "Delete Report",
      message: `Are you sure you want to delete the report "${sheetName}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: async () => {
        setIsLoading(true);
        try {
          // Call the DELETE API endpoint for risk assessment sheets
          const response = await apiRequest(
            'DELETE',
            `/api/rarpt/assessment-sheets/${sheetId}/`,
            null,
            true
          );

          // If successful, refresh the sheets list and show success message
          if (response.status === 204 || response.status === 200) {
            message.success('Report deleted successfully');
            setSelectedSheet(null);
            setRiskData([]);
            // Refresh the sheets list
            await fetchSheets();
          } else {
            throw new Error('Failed to delete report');
          }
        } catch (error) {
          console.error('Error deleting report:', error);
          message.error('Failed to delete report');
        } finally {
          setIsLoading(false);
          closeConfirmModal();
        }
      }
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Error display */}
      {componentError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded m-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{componentError}</span>
          <button
            className="float-right font-bold"
            onClick={() => setComponentError(null)}
          >
            ×
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 overflow-auto shadow-xl rounded-lg">
        <div className="flex flex-col w-full bg-white border-r border-slate-200 relative overflow-auto">
          {activeTab === 'table' ? (
            /* Table view */
            <>
              <ReportsTable refreshTrigger={refreshCounter} />

              {/* Create Report Modal */}
              <CreateReportModal
                isOpen={showCreateReportModal}
                onClose={() => setShowCreateReportModal(false)}
                projectid={projectid}
                onSuccess={handleReportCreationSuccess}
              />
            </>
          ) : (
            /* Tab views */
            <>
              {/* Tab Navigation with Back Button */}
              <div className="flex border-b border-slate-200 relative">
                <button
                  className={`py-4 px-6 font-medium transition-colors ${activeTab === "table"
                    ? "text-indigo-600 border-b-2 border-indigo-600"
                    : "text-slate-600 hover:text-slate-800"}`}
                  onClick={() => changeTab("table")}
                >
                  Reports Table
                </button>

                {activeTab === "riskAssessment" && (
                  <button
                    className="py-4 px-6 font-medium transition-colors text-indigo-600 border-b-2 border-indigo-600"
                  >
                    Risk Assessment
                  </button>
                )}

                {activeTab === "riskTreatment" && (
                  <button
                    className="py-4 px-6 font-medium transition-colors text-indigo-600 border-b-2 border-indigo-600"
                  >
                    Risk Treatment
                  </button>
                )}

                {activeTab === "vapt" && (
                  <button
                    className="py-4 px-6 font-medium transition-colors text-indigo-600 border-b-2 border-indigo-600"
                  >
                    VAPT
                  </button>
                )}

                {activeTab === "asisReport" && (
                  <button
                    className="py-4 px-6 font-medium transition-colors text-indigo-600 border-b-2 border-indigo-600"
                  >
                    ASIS Report
                  </button>
                )}

                {/* Close/Back button on the right end */}
                <button
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 py-2 px-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-full"
                  onClick={goBackToTable}
                  title="Back to Reports"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === "riskAssessment" && (
                <>
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-slate-200 p-2 bg-white sticky top-0 z-10 shadow-sm">
                    <div className="flex items-center">
                      <h2 className="text-xl font-bold text-slate-800">
                        Risk Assessment Reports
                      </h2>
                      <div className="ml-3 text-slate-600 font-medium bg-indigo-50 px-3 py-1 rounded-full">
                        {riskData.length}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-md flex items-center"
                        onClick={() => openModal("create")}
                        disabled={!selectedSheet}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5 mr-2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 4.5v15m7.5-7.5h-15"
                          />
                        </svg>
                        <span>Add Risk</span>
                      </button>
                      <button
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-md flex items-center"
                        onClick={() => openModal("excel")}
                        disabled={!selectedSheet}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5 mr-2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                          />
                        </svg>
                        <span>Upload Excel</span>
                      </button>
                      <button
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors shadow-md flex items-center"
                        onClick={toggleLegendsModal}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5 mr-2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                          />
                        </svg>
                        <span>Legend</span>
                      </button>
                    </div>
                  </div>

                  {/* Loading indicator */}
                  {isLoading && (
                    <div className="flex justify-center items-center py-1">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                  )}

                  {/* Risk table or empty state */}
                  {!isLoading && (
                    <>
                      {/* Show message when no sheet is selected */}
                      {!selectedSheet && (
                        <div className="p-6 text-center">
                          <p className="text-gray-500 mb-2">No risk assessment sheet selected</p>
                          <p className="text-gray-500">
                            Please select a report or create a new one to get started.
                          </p>
                        </div>
                      )}

                      {/* Show message when sheet is selected but has no risks */}
                      {selectedSheet && riskData.length === 0 && (
                        <div className="p-6 text-center">
                          <p className="text-gray-500 mb-2">No risks found in this report</p>
                          <p className="text-gray-500">
                            Click "Add Risk" to create your first risk assessment entry, or upload from Excel.
                          </p>
                        </div>
                      )}

                      {/* Show table when data is available */}
                      {selectedSheet && riskData.length > 0 && (
                        <div className="overflow-x-auto">
                          <div className="inline-block min-w-full whitespace-nowrap">
                            <table className="min-w-full border-collapse shadow-lg rounded-lg overflow-hidden">
                              <thead>
                                <tr className="bg-slate-100">
                                  {/* Action column */}
                                  <th className="border border-slate-200 p-3.5 text-left text-slate-700 font-semibold bg-slate-50">
                                    Actions
                                  </th>

                                  {/* Basic columns */}
                                  <th className="border border-slate-200 p-3.5 text-left text-slate-700 font-semibold bg-slate-50">
                                    Risk ID
                                  </th>
                                  <th className="border border-slate-200 p-3.5 text-left text-slate-700 font-semibold bg-slate-50">
                                    Vulnerability Type
                                  </th>
                                  <th className="border border-slate-200 p-3.5 text-left text-slate-700 font-semibold bg-slate-50">
                                    Risk Category
                                  </th>
                                  <th className="border border-slate-200 p-3.5 text-left text-slate-700 font-semibold bg-slate-50">
                                    Risk Rating
                                  </th>

                                  {/* Impact Assessment column group */}
                                  <th
                                    className="border border-slate-200 bg-indigo-50 p-3.5 cursor-pointer text-indigo-700 font-semibold hover:bg-indigo-100 transition-colors duration-300"
                                    onClick={() => toggleGroup("impactAssessment")}
                                    colSpan={expandedGroups.impactAssessment ? 5 : 1}
                                  >
                                    <div className="flex items-center justify-center">
                                      <span>Impact Assessment</span>
                                      {renderExpandIcon(expandedGroups.impactAssessment)}
                                    </div>
                                  </th>

                                  {/* Impact Ratings column group */}
                                  <th
                                    className="border border-slate-200 bg-indigo-50 p-3.5 cursor-pointer text-indigo-700 font-semibold hover:bg-indigo-100 transition-colors duration-300"
                                    onClick={() => toggleGroup("impactRatings")}
                                    colSpan={expandedGroups.impactRatings ? 4 : 1}
                                  >
                                    <div className="flex items-center justify-center">
                                      <span>Impact Ratings</span>
                                      {renderExpandIcon(expandedGroups.impactRatings)}
                                    </div>
                                  </th>

                                  {/* Severity column group */}
                                  <th
                                    className="border border-slate-200 bg-amber-50 p-3.5 cursor-pointer text-amber-700 font-semibold hover:bg-amber-100 transition-colors duration-300"
                                    onClick={() => toggleGroup("severity")}
                                    colSpan={expandedGroups.severity ? 2 : 1}
                                  >
                                    <div className="flex items-center justify-center">
                                      <span>Severity</span>
                                      {renderExpandIcon(expandedGroups.severity)}
                                    </div>
                                  </th>

                                  {/* Control Assessment column group */}
                                  <th
                                    className="border border-slate-200 bg-slate-100 p-3.5 cursor-pointer text-slate-700 font-semibold hover:bg-slate-200 transition-colors duration-300"
                                    onClick={() => toggleGroup("controlAssessment")}
                                    colSpan={expandedGroups.controlAssessment ? 2 : 1}
                                  >
                                    <div className="flex items-center justify-center">
                                      <span>Control Assessment</span>
                                      {renderExpandIcon(expandedGroups.controlAssessment)}
                                    </div>
                                  </th>

                                  {/* Risk Assessment column group */}
                                  <th
                                    className="border border-slate-200 bg-slate-700 text-white p-3.5 cursor-pointer font-semibold hover:bg-slate-800 transition-colors duration-300"
                                    onClick={() => toggleGroup("riskAssessment")}
                                    colSpan={expandedGroups.riskAssessment ? 5 : 1}
                                  >
                                    <div className="flex items-center justify-center">
                                      <span>Risk Assessment</span>
                                      {renderExpandIcon(expandedGroups.riskAssessment)}
                                    </div>
                                  </th>

                                  {/* Risk Revision column group */}
                                  <th
                                    className="border border-slate-200 bg-indigo-600 text-white p-3.5 cursor-pointer font-semibold hover:bg-indigo-700 transition-colors duration-300"
                                    onClick={() => toggleGroup("riskRevision")}
                                    colSpan={expandedGroups.riskRevision ? 6 : 1}
                                  >
                                    <div className="flex items-center justify-center">
                                      <span>Risk Revision</span>
                                      {renderExpandIcon(expandedGroups.riskRevision)}
                                    </div>
                                  </th>

                                  {/* Mitigation Plan column group */}
                                  <th
                                    className="border border-slate-200 bg-green-600 text-white p-3.5 cursor-pointer font-semibold hover:bg-green-700 transition-colors duration-300"
                                    onClick={() => toggleGroup("mitigationPlan")}
                                    colSpan={expandedGroups.mitigationPlan ? 8 : 1}
                                  >
                                    <div className="flex items-center justify-center">
                                      <span>Mitigation Plan</span>
                                      {renderExpandIcon(expandedGroups.mitigationPlan)}
                                    </div>
                                  </th>
                                </tr>

                                {/* Second row of headers for expanded column groups */}
                                <tr className="bg-slate-50">
                                  {/* Empty cell for action column */}
                                  <th className="border border-slate-200 p-3 font-medium"></th>

                                  {/* Empty cells for the basic columns */}
                                  <th className="border border-slate-200 p-3 font-medium"></th>
                                  <th className="border border-slate-200 p-3 font-medium"></th>
                                  <th className="border border-slate-200 p-3 font-medium"></th>
                                  <th className="border border-slate-200 p-3 font-medium"></th>

                                  {/* Impact Assessment subheaders */}
                                  {expandedGroups.impactAssessment ? (
                                    <>
                                      <th className="border border-slate-200 p-3 font-medium bg-indigo-50 transition-all duration-300">
                                        Impact on Confidentiality? (Y/N)
                                      </th>
                                      <th className="border border-slate-200 p-3 font-medium bg-indigo-50 transition-all duration-300">
                                        Impact on Integrity? (Y/N)
                                      </th>
                                      <th className="border border-slate-200 p-3 font-medium bg-indigo-50 transition-all duration-300">
                                        Impact on Availability? (Y/N)
                                      </th>
                                      <th className="border border-slate-200 p-3 font-medium bg-indigo-50 transition-all duration-300">
                                        Breach of legal obligation? (Y/N)
                                      </th>
                                      <th className="border border-slate-200 p-3 font-medium bg-indigo-50 transition-all duration-300">
                                        Description of legal obligation
                                      </th>
                                    </>
                                  ) : (
                                    <th className="border border-slate-200 p-3 font-medium bg-indigo-50"></th>
                                  )}

                                  {/* Impact Ratings subheaders */}
                                  {expandedGroups.impactRatings ? (
                                    <>
                                      <th className="border border-slate-200 p-3 font-medium bg-indigo-50 transition-all duration-300">
                                        On customer
                                      </th>
                                      <th className="border border-slate-200 p-3 font-medium bg-indigo-50 transition-all duration-300">
                                        On service capability
                                      </th>
                                      <th className="border border-slate-200 p-3 font-medium bg-indigo-50 transition-all duration-300">
                                        Financial damage
                                      </th>
                                      <th className="border border-slate-200 p-3 font-medium bg-indigo-50 transition-all duration-300">
                                        Spread / Magnitude
                                      </th>
                                    </>
                                  ) : (
                                    <th className="border border-slate-200 p-3 font-medium bg-indigo-50"></th>
                                  )}

                                  {/* Severity subheaders */}
                                  {expandedGroups.severity ? (
                                    <>
                                      <th className="border border-slate-200 p-3 font-medium bg-amber-50 transition-all duration-300">
                                        Consequence rating
                                      </th>
                                      <th className="border border-slate-200 p-3 font-medium bg-amber-50 transition-all duration-300">
                                        Likelihood rating
                                      </th>
                                    </>
                                  ) : (
                                    <th className="border border-slate-200 p-3 font-medium bg-amber-50"></th>
                                  )}

                                  {/* Control Assessment subheaders */}
                                  {expandedGroups.controlAssessment ? (
                                    <>
                                      <th className="border border-slate-200 p-3 font-medium bg-slate-100 transition-all duration-300">
                                        Description
                                      </th>
                                      <th className="border border-slate-200 p-3 font-medium bg-slate-100 transition-all duration-300">
                                        Rating
                                      </th>
                                    </>
                                  ) : (
                                    <th className="border border-slate-200 p-3 font-medium bg-slate-100"></th>
                                  )}

                                  {/* Risk Assessment subheaders */}
                                  {expandedGroups.riskAssessment ? (
                                    <>
                                      <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white transition-all duration-300">
                                        Risk Rating
                                      </th>
                                      <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white transition-all duration-300">
                                        Risk Category
                                      </th>
                                      <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white transition-all duration-300">
                                        Department / BU
                                      </th>
                                      <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white transition-all duration-300">
                                        Risk Owner
                                      </th>
                                      <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white transition-all duration-300">
                                        Risk Mitigation Strategy
                                      </th>
                                    </>
                                  ) : (
                                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white"></th>
                                  )}

                                  {/* Risk Revision subheaders */}
                                  {expandedGroups.riskRevision ? (
                                    <>
                                      <th className="border border-slate-200 p-3 font-medium bg-indigo-100 transition-all duration-300">
                                        Applicable SoA Control
                                      </th>
                                      <th className="border border-slate-200 p-3 font-medium bg-indigo-100 transition-all duration-300">
                                        SoA Control Description
                                      </th>
                                      <th className="border border-slate-200 p-3 font-medium bg-indigo-100 transition-all duration-300">
                                        Will the planned controls meet legal/ other requirements? (Y/N)
                                      </th>
                                      <th className="border border-slate-200 p-3 font-medium bg-indigo-100 transition-all duration-300">
                                        Revised control rating
                                      </th>
                                      <th className="border border-slate-200 p-3 font-medium bg-indigo-100 transition-all duration-300">
                                        Residual risk rating
                                      </th>
                                      <th className="border border-slate-200 p-3 font-medium bg-indigo-100 transition-all duration-300">
                                        Revised Risk Acceptable to risk owner? (Y/N)
                                      </th>
                                    </>
                                  ) : (
                                    <th className="border border-slate-200 p-3 font-medium bg-indigo-100"></th>
                                  )}

                                  {/* Mitigation Plan subheaders */}
                                  {expandedGroups.mitigationPlan ? (
                                    <>
                                      <th className="border border-slate-200 p-3 font-medium bg-green-100 transition-all duration-300">
                                        Further Planned action
                                      </th>
                                      <th className="border border-slate-200 p-3 font-medium bg-green-100 transition-all duration-300">
                                        Task ID
                                      </th>
                                      <th className="border border-slate-200 p-3 font-medium bg-green-100 transition-all duration-300">
                                        Task Description
                                      </th>
                                      <th className="border border-slate-200 p-3 font-medium bg-green-100 transition-all duration-300">
                                        Task Owner
                                      </th>
                                      <th className="border border-slate-200 p-3 font-medium bg-green-100 transition-all duration-300">
                                        Ongoing task? (Y/N)
                                      </th>
                                      <th className="border border-slate-200 p-3 font-medium bg-green-100 transition-all duration-300">
                                        If not ongoing, planned completion date
                                      </th>
                                      <th className="border border-slate-200 p-3 font-medium bg-green-100 transition-all duration-300">
                                        Recurrent task? (Y/N)
                                      </th>
                                      <th className="border border-slate-200 p-3 font-medium bg-green-100 transition-all duration-300">
                                        If yes, frequency
                                      </th>
                                    </>
                                  ) : (
                                    <th className="border border-slate-200 p-3 font-medium bg-green-100"></th>
                                  )}
                                </tr>
                              </thead>
                              <tbody>
                                {riskData.map((risk, index) => (
                                  <tr
                                    key={risk.id}
                                    className={
                                      index % 2 === 0
                                        ? "bg-white hover:bg-indigo-50 transition-colors duration-150"
                                        : "bg-slate-50 hover:bg-indigo-50 transition-colors duration-150"
                                    }
                                  >
                                    {/* Action buttons */}
                                    <td className="border border-slate-200 p-3">
                                      <div className="flex space-x-2 justify-center">
                                        <button
                                          onClick={() => handleViewRiskByObject(risk)}
                                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                          title="View Details"
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
                                              d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                                            />
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                          </svg>
                                        </button>
                                        <button
                                          onClick={() => handleEditRiskByObject(risk)}
                                          className="p-1 text-indigo-600 hover:bg-indigo-50 rounded"
                                          title="Edit Risk"
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
                                              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                                            />
                                          </svg>
                                        </button>
                                        <button
                                          onClick={() => handleDeleteRisk(risk.id)}
                                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                                          title="Delete Risk"
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
                                    </td>

                                    {/* Basic Information */}
                                    <td className="border border-slate-200 p-3">
                                      {risk.risk_id}
                                    </td>
                                    <td className="border border-slate-200 p-3">
                                      {risk.vulnerabilityType || "Not Specified"}
                                    </td>
                                    <td className="border border-slate-200 p-3">
                                      {risk.riskAssessment?.riskCategory || "Not Specified"}
                                    </td>
                                    <td className={`border border-slate-200 p-3 ${getRiskRatingColor(risk.riskAssessment?.riskRating)}`}>
                                      {risk.riskAssessment?.riskRating || "-"}
                                    </td>

                                    {/* Impact Assessment cells */}
                                    {expandedGroups.impactAssessment ? (
                                      <>
                                        <td className={`border border-slate-200 p-3 text-center ${getImpactColor(risk.impactAssessment?.confidentiality)}`}>
                                          {risk.impactAssessment?.confidentiality || "N"}
                                        </td>
                                        <td className={`border border-slate-200 p-3 text-center ${getImpactColor(risk.impactAssessment?.integrity)}`}>
                                          {risk.impactAssessment?.integrity || "N"}
                                        </td>
                                        <td className={`border border-slate-200 p-3 text-center ${getImpactColor(risk.impactAssessment?.availability)}`}>
                                          {risk.impactAssessment?.availability || "N"}
                                        </td>
                                        <td className={`border border-slate-200 p-3 text-center ${getImpactColor(risk.impactAssessment?.legalObligation)}`}>
                                          {risk.impactAssessment?.legalObligation || "N"}
                                        </td>
                                        <td className="border border-slate-200 p-3">
                                          {risk.impactAssessment?.legalObligationDesc || "-"}
                                        </td>
                                      </>
                                    ) : (
                                      <td className="border border-slate-200 p-3 text-center">
                                        {(risk.impactAssessment?.confidentiality || "N")}/
                                        {(risk.impactAssessment?.integrity || "N")}/
                                        {(risk.impactAssessment?.availability || "N")}/
                                        {(risk.impactAssessment?.legalObligation || "N")}
                                      </td>
                                    )}

                                    {/* Impact Ratings cells */}
                                    {expandedGroups.impactRatings ? (
                                      <>
                                        <td className={`border border-slate-200 p-3 text-center ${getRatingColor(risk.impactRatings?.customer)}`}>
                                          {risk.impactRatings?.customer || "1"}
                                        </td>
                                        <td className={`border border-slate-200 p-3 text-center ${getRatingColor(risk.impactRatings?.serviceCapability)}`}>
                                          {risk.impactRatings?.serviceCapability || "1"}
                                        </td>
                                        <td className={`border border-slate-200 p-3 text-center ${getRatingColor(risk.impactRatings?.financialDamage)}`}>
                                          {risk.impactRatings?.financialDamage || "1"}
                                        </td>
                                        <td className={`border border-slate-200 p-3 text-center ${getRatingColor(risk.impactRatings?.spreadMagnitude)}`}>
                                          {risk.impactRatings?.spreadMagnitude || "1"}
                                        </td>
                                      </>
                                    ) : (
                                      <td className="border border-slate-200 p-3 text-center">
                                        {((Number(risk.impactRatings?.customer || 1) +
                                          Number(risk.impactRatings?.serviceCapability || 1) +
                                          Number(risk.impactRatings?.financialDamage || 1) +
                                          Number(risk.impactRatings?.spreadMagnitude || 1)) / 4).toFixed(2)}
                                      </td>
                                    )}

                                    {/* Severity cells */}
                                    {expandedGroups.severity ? (
                                      <>
                                        <td className={`border border-slate-200 p-3 text-center ${getRatingColor(risk.severity?.consequenceRating)}`}>
                                          {risk.severity?.consequenceRating || "1"}
                                        </td>
                                        <td className={`border border-slate-200 p-3 text-center ${getRatingColor(risk.severity?.likelihoodRating)}`}>
                                          {risk.severity?.likelihoodRating || "1"}
                                        </td>
                                      </>
                                    ) : (
                                      <td className="border border-slate-200 p-3 text-center">
                                        C:{risk.severity?.consequenceRating || "1"} L:{risk.severity?.likelihoodRating || "1"}
                                      </td>
                                    )}

                                    {/* Control Assessment cells */}
                                    {expandedGroups.controlAssessment ? (
                                      <>
                                        <td className="border border-slate-200 p-3">
                                          {risk.controlAssessment?.description || "-"}
                                        </td>
                                        <td className={`border border-slate-200 p-3 text-center ${getControlRatingColor(risk.controlAssessment?.rating)}`}>
                                          {risk.controlAssessment?.rating || "1"}
                                        </td>
                                      </>
                                    ) : (
                                      <td className={`border border-slate-200 p-3 text-center ${getControlRatingColor(risk.controlAssessment?.rating)}`}>
                                        Rating: {risk.controlAssessment?.rating || "1"}
                                      </td>
                                    )}

                                    {/* Risk Assessment cells */}
                                    {expandedGroups.riskAssessment ? (
                                      <>
                                        <td className={`border border-slate-200 p-3 text-center ${getRiskRatingColor(risk.riskAssessment?.riskRating)}`}>
                                          {risk.riskAssessment?.riskRating || "1"}
                                        </td>
                                        <td className="border border-slate-200 p-3">
                                          {risk.riskAssessment?.riskCategory || "Not Significant"}
                                        </td>
                                        <td className="border border-slate-200 p-3">
                                          {risk.riskAssessment?.departmentBU || "-"}
                                        </td>
                                        <td className="border border-slate-200 p-3">
                                          {risk.riskAssessment?.riskOwner || "-"}
                                        </td>
                                        <td className="border border-slate-200 p-3">
                                          {risk.riskAssessment?.mitigationStrategy || "Tolerate"}
                                        </td>
                                      </>
                                    ) : (
                                      <td className={`border border-slate-200 p-3 text-center ${getRiskRatingColor(risk.riskAssessment?.riskRating)}`}>
                                        {risk.riskAssessment?.riskRating || "1"}
                                      </td>
                                    )}

                                    {/* Risk Revision cells */}
                                    {expandedGroups.riskRevision ? (
                                      <>
                                        <td className="border border-slate-200 p-3">
                                          {risk.riskRevision?.soaControl || "-"}
                                        </td>
                                        <td className="border border-slate-200 p-3">
                                          {risk.riskRevision?.soaControlDesc || "-"}
                                        </td>
                                        <td className={`border border-slate-200 p-3 text-center ${getImpactColor(risk.riskRevision?.meetsRequirements)}`}>
                                          {risk.riskRevision?.meetsRequirements || "Y"}
                                        </td>
                                        <td className={`border border-slate-200 p-3 text-center ${getControlRatingColor(risk.riskRevision?.revisedControlRating)}`}>
                                          {risk.riskRevision?.revisedControlRating || "1"}
                                        </td>
                                        <td className={`border border-slate-200 p-3 text-center ${getRiskRatingColor(risk.riskRevision?.residualRiskRating)}`}>
                                          {risk.riskRevision?.residualRiskRating || "1"}
                                        </td>
                                        <td className={`border border-slate-200 p-3 text-center ${getImpactColor(risk.riskRevision?.acceptableToOwner)}`}>
                                          {risk.riskRevision?.acceptableToOwner || "Y"}
                                        </td>
                                      </>
                                    ) : (
                                      <td className={`border border-slate-200 p-3 text-center ${getRiskRatingColor(risk.riskRevision?.residualRiskRating)}`}>
                                        RR: {risk.riskRevision?.residualRiskRating || "1"}
                                      </td>
                                    )}

                                    {/* Mitigation Plan cells */}
                                    {expandedGroups.mitigationPlan ? (
                                      <>
                                        <td className="border border-slate-200 p-3">
                                          {risk.mitigationPlan?.furtherPlannedAction || "-"}
                                        </td>
                                        <td className="border border-slate-200 p-3">
                                          {risk.mitigationPlan?.taskId || "-"}
                                        </td>
                                        <td className="border border-slate-200 p-3">
                                          {risk.mitigationPlan?.taskDescription || "-"}
                                        </td>
                                        <td className="border border-slate-200 p-3">
                                          {risk.mitigationPlan?.taskOwner || "-"}
                                        </td>
                                        <td className={`border border-slate-200 p-3 text-center ${getImpactColor(risk.mitigationPlan?.isOngoing)}`}>
                                          {risk.mitigationPlan?.isOngoing || "N"}
                                        </td>
                                        <td className="border border-slate-200 p-3">
                                          {risk.mitigationPlan?.plannedCompletionDate || "-"}
                                        </td>
                                        <td className={`border border-slate-200 p-3 text-center ${getImpactColor(risk.mitigationPlan?.isRecurrent)}`}>
                                          {risk.mitigationPlan?.isRecurrent || "N"}
                                        </td>
                                        <td className="border border-slate-200 p-3">
                                          {risk.mitigationPlan?.frequency || "-"}
                                        </td>
                                      </>
                                    ) : (
                                      <td className="border border-slate-200 p-3 text-center">
                                        {risk.mitigationPlan?.taskId ? `Task: ${risk.mitigationPlan.taskId}` : "No"}
                                      </td>
                                    )}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
              {activeTab === "riskTreatment" && (
                <div className="p-5">
                  <RiskTreatment />
                </div>
              )}
              {activeTab === "vapt" && (
                <div className="p-5">
                  <Vapt />
                </div>
              )}
              {activeTab === "asisReport" && (
                <div className="p-5">
                  <ASISReport />
                </div>
              )}
            </>
          )}

          {/* Modals */}
          <LegendsModal isOpen={showLegendsModal} onClose={toggleLegendsModal} />

          {/* Confirmation Modal */}
          <ConfirmationModal
            isOpen={showConfirmModal}
            onClose={closeConfirmModal}
            onConfirm={confirmModalProps.onConfirm}
            title={confirmModalProps.title}
            message={confirmModalProps.message}
          />

          {/* Detailed View Modal for viewing risk details */}
          <DetailedViewModal
            isOpen={showDetailedView}
            onClose={closeDetailedView}
            risk={selectedRiskForView}
          />

          {/* After DetailedViewModal component and before return() */}
          {/* Add this modal component for the form */}
          {showModal && (
            <div className="fixed inset-0 z-50 overflow-y-auto" aria-modal="true" role="dialog">
              <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                {/* Background overlay */}
                <div
                  className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                  aria-hidden="true"
                  onClick={closeModal}
                ></div>

                {/* Modal panel */}
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full">
                  <div className="bg-indigo-50 px-4 py-3 border-b border-gray-200">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {modalType === "edit"
                        ? "Edit Risk Assessment"
                        : modalType === "excel"
                          ? "Upload Excel Risk Data"
                          : "New Risk Assessment"}
                    </h3>
                  </div>
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 max-h-[80vh] overflow-y-auto">
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
                          <button
                            className="ml-auto text-red-700 hover:text-red-900"
                            onClick={() => setError(null)}
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Form for creating or editing risk */}
                    {(modalType === "create" || modalType === "edit" || modalType === "view") && (
                      <form className="space-y-6" onSubmit={modalType === "edit" ? handleRiskUpdate : handleRiskSubmit}>
                        {/* Basic Information */}
                        <div className="bg-gray-50 p-4 rounded-md">
                          <h4 className="text-lg font-medium mb-4 text-gray-800">
                            Basic Information
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Risk ID *
                              </label>
                              <input
                                type="text"
                                required
                                value={formData.risk_id}
                                onChange={(e) =>
                                  handleFormChange(e, null, "risk_id")
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="e.g., Admin_Risk_12"
                                disabled={modalType === "view"}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Vulnerability Type *
                              </label>
                              <input
                                type="text"
                                required
                                value={formData.vulnerability_type}
                                onChange={(e) =>
                                  handleFormChange(e, null, "vulnerability_type")
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="e.g., Earthquake"
                                disabled={modalType === "view"}
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Threat Description *
                              </label>
                              <textarea
                                required
                                value={formData.threat_description}
                                onChange={(e) =>
                                  handleFormChange(e, null, "threat_description")
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                rows="2"
                                placeholder="Describe the threat..."
                                disabled={modalType === "view"}
                              ></textarea>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Context
                              </label>
                              <select
                                value={formData.context}
                                onChange={(e) =>
                                  handleSelectChange(e, null, "context")
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                disabled={modalType === "view"}
                              >
                                <option value="Natural">Natural</option>
                                <option value="Resource management">
                                  Resource management
                                </option>
                                <option value="Infrastructure components">
                                  Infrastructure components
                                </option>
                                <option value="Employees">Employees</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Applicable Activity
                              </label>
                              <input
                                type="text"
                                value={formData.applicable_activity}
                                onChange={(e) =>
                                  handleFormChange(e, null, "applicable_activity")
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="e.g., Working in the organisation"
                                disabled={modalType === "view"}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Impact Assessment */}
                        <div className="bg-indigo-50 p-4 rounded-md">
                          <h4 className="text-lg font-medium mb-4 text-indigo-800">
                            Impact Assessment
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Impact on Confidentiality?
                              </label>
                              <select
                                value={
                                  formData.impact_assessment
                                    .impact_on_confidentiality
                                }
                                onChange={(e) =>
                                  handleSelectChange(
                                    e,
                                    "impact_assessment",
                                    "impact_on_confidentiality"
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                disabled={modalType === "view"}
                              >
                                <option value="Y">Yes (Y)</option>
                                <option value="N">No (N)</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Impact on Integrity?
                              </label>
                              <select
                                value={
                                  formData.impact_assessment.impact_on_integrity
                                }
                                onChange={(e) =>
                                  handleSelectChange(
                                    e,
                                    "impact_assessment",
                                    "impact_on_integrity"
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                disabled={modalType === "view"}
                              >
                                <option value="Y">Yes (Y)</option>
                                <option value="N">No (N)</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Impact on Availability?
                              </label>
                              <select
                                value={
                                  formData.impact_assessment.impact_on_availability
                                }
                                onChange={(e) =>
                                  handleSelectChange(
                                    e,
                                    "impact_assessment",
                                    "impact_on_availability"
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                disabled={modalType === "view"}
                              >
                                <option value="Y">Yes (Y)</option>
                                <option value="N">No (N)</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Breach of Legal Obligation?
                              </label>
                              <select
                                value={
                                  formData.impact_assessment
                                    .breach_of_legal_obligation
                                }
                                onChange={(e) =>
                                  handleSelectChange(
                                    e,
                                    "impact_assessment",
                                    "breach_of_legal_obligation"
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                disabled={modalType === "view"}
                              >
                                <option value="Y">Yes (Y)</option>
                                <option value="N">No (N)</option>
                              </select>
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description of Legal Obligation
                              </label>
                              <input
                                type="text"
                                value={
                                  formData.impact_assessment
                                    .description_of_legal_obligation
                                }
                                onChange={(e) =>
                                  handleFormChange(
                                    e,
                                    "impact_assessment",
                                    "description_of_legal_obligation"
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="If applicable"
                                disabled={modalType === "view"}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Impact Ratings (New Section) */}
                        <div className="bg-indigo-50 p-4 rounded-md">
                          <h4 className="text-lg font-medium mb-4 text-indigo-800">
                            Impact Ratings
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                On Customer (1-5)
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="5"
                                value={formData.impact_ratings.on_customer}
                                onChange={(e) =>
                                  handleNumericChange(
                                    e,
                                    "impact_ratings",
                                    "on_customer"
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                disabled={modalType === "view"}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                On Service Capability (1-5)
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="5"
                                value={
                                  formData.impact_ratings.on_service_capability
                                }
                                onChange={(e) =>
                                  handleNumericChange(
                                    e,
                                    "impact_ratings",
                                    "on_service_capability"
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                disabled={modalType === "view"}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Financial Damage (1-5)
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="5"
                                value={formData.impact_ratings.financial_damage}
                                onChange={(e) =>
                                  handleNumericChange(
                                    e,
                                    "impact_ratings",
                                    "financial_damage"
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                disabled={modalType === "view"}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Spread / Magnitude (1-5)
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="5"
                                value={formData.impact_ratings.spread_magnitude}
                                onChange={(e) =>
                                  handleNumericChange(
                                    e,
                                    "impact_ratings",
                                    "spread_magnitude"
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                disabled={modalType === "view"}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Severity & Control Assessment Sections */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-amber-50 p-4 rounded-md">
                            <h4 className="text-lg font-medium mb-4 text-amber-800">
                              Severity Assessment
                            </h4>
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Consequence Rating (1-5)
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  max="5"
                                  value={formData.severity.consequence_rating}
                                  onChange={(e) =>
                                    handleNumericChange(
                                      e,
                                      "severity",
                                      "consequence_rating"
                                    )
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  disabled
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Likelihood Rating (1-5)
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  max="5"
                                  value={formData.severity.likelihood_rating}
                                  onChange={(e) =>
                                    handleNumericChange(
                                      e,
                                      "severity",
                                      "likelihood_rating"
                                    )
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  disabled={modalType === "view"}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="bg-gray-100 p-4 rounded-md">
                            <h4 className="text-lg font-medium mb-4 text-gray-800">
                              Control Assessment
                            </h4>
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Description
                                </label>
                                <textarea
                                  value={formData.control_assessment.description}
                                  onChange={(e) =>
                                    handleFormChange(
                                      e,
                                      "control_assessment",
                                      "description"
                                    )
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  rows="2"
                                  placeholder="Describe existing controls..."
                                  disabled={modalType === "view"}
                                ></textarea>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Rating (1-5)
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  max="5"
                                  value={formData.control_assessment.rating}
                                  onChange={(e) =>
                                    handleNumericChange(
                                      e,
                                      "control_assessment",
                                      "rating"
                                    )
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  disabled={modalType === "view"}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Risk Assessment and Treatment */}
                        <div className="grid grid-cols-1 gap-6">
                          <div className="bg-slate-700 p-4 rounded-md text-white">
                            <h4 className="text-lg font-medium mb-4">
                              Risk Assessment
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm font-medium mb-1">
                                  Risk Rating
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  value={formData.risk_assessment.risk_rating}
                                  onChange={(e) =>
                                    handleNumericChange(
                                      e,
                                      "risk_assessment",
                                      "risk_rating"
                                    )
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                                  disabled
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">
                                  Risk Category
                                </label>
                                <select
                                  value={formData.risk_assessment.risk_category}
                                  onChange={(e) =>
                                    handleSelectChange(
                                      e,
                                      "risk_assessment",
                                      "risk_category"
                                    )
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                                  disabled
                                >
                                  <option value="Not Significant">
                                    Not Significant
                                  </option>
                                  <option value="Significant">Significant</option>
                                  <option value="Critical">Critical</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">
                                  Department/BU
                                </label>
                                <input
                                  type="text"
                                  value={formData.risk_assessment.department_bu}
                                  onChange={(e) =>
                                    handleFormChange(
                                      e,
                                      "risk_assessment",
                                      "department_bu"
                                    )
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                                  disabled={modalType === "view"}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">
                                  Risk Owner
                                </label>
                                <input
                                  type="text"
                                  value={formData.risk_assessment.risk_owner}
                                  onChange={(e) =>
                                    handleFormChange(
                                      e,
                                      "risk_assessment",
                                      "risk_owner"
                                    )
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                                  disabled={modalType === "view"}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">
                                  Mitigation Strategy
                                </label>
                                <select
                                  value={
                                    formData.risk_assessment
                                      .risk_mitigation_strategy
                                  }
                                  onChange={(e) =>
                                    handleSelectChange(
                                      e,
                                      "risk_assessment",
                                      "risk_mitigation_strategy"
                                    )
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                                  disabled={modalType === "view"}
                                >
                                  <option value="Tolerate">Tolerate</option>
                                  <option value="Treat">Treat</option>
                                  <option value="Transfer">Transfer</option>
                                  <option value="Terminate">Terminate</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Risk Revision - Updated */}
                        <div className="bg-indigo-100 p-4 rounded-md">
                          <h4 className="text-lg font-medium mb-4 text-indigo-800">
                            Risk Revision
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Applicable SoA Control
                              </label>
                              <input
                                type="text"
                                value={
                                  formData.risk_revision.applicable_soa_control
                                }
                                onChange={(e) =>
                                  handleFormChange(
                                    e,
                                    "risk_revision",
                                    "applicable_soa_control"
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                disabled={modalType === "view"}
                              />
                            </div>
                            {/* Added SoA Control Description Input */}
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                SoA Control Description
                              </label>
                              <input
                                type="text"
                                value={formData.risk_revision.soaControlDesc}
                                onChange={(e) =>
                                  handleFormChange(
                                    e,
                                    "risk_revision",
                                    "soaControlDesc"
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Description of the SoA control"
                                disabled={modalType === "view"}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Planned Controls Meet Requirements? (Y/N)
                              </label>
                              <select
                                value={
                                  formData.risk_revision
                                    .planned_controls_meet_requirements
                                }
                                onChange={(e) =>
                                  handleSelectChange(
                                    e,
                                    "risk_revision",
                                    "planned_controls_meet_requirements"
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                disabled={modalType === "view"}
                              >
                                <option value="Y">Yes</option>
                                <option value="N">No</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Revised Control Rating (1-5)
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="5"
                                value={
                                  formData.risk_revision.revised_control_rating
                                }
                                onChange={(e) =>
                                  handleNumericChange(
                                    e,
                                    "risk_revision",
                                    "revised_control_rating"
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                disabled={modalType === "view"}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Residual Risk Rating
                              </label>
                              <input
                                type="number"
                                min="1"
                                value={formData.risk_revision.residual_risk_rating}
                                onChange={(e) =>
                                  handleNumericChange(
                                    e,
                                    "risk_revision",
                                    "residual_risk_rating"
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                                disabled
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Revised Risk Acceptable to Owner? (Y/N)
                              </label>
                              <select
                                value={
                                  formData.risk_revision.acceptable_to_risk_owner
                                }
                                onChange={(e) =>
                                  handleSelectChange(
                                    e,
                                    "risk_revision",
                                    "acceptable_to_risk_owner"
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                disabled={modalType === "view"}
                              >
                                <option value="Y">Yes</option>
                                <option value="N">No</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Mitigation Task - Updated */}
                        <div className="bg-green-50 p-4 rounded-md">
                          <h4 className="text-lg font-medium mb-4 text-green-800">
                            Mitigation Plan
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Added Further Planned Action Textarea */}
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Further Planned Action
                              </label>
                              <textarea
                                value={
                                  formData.mitigation_task.further_planned_action
                                }
                                onChange={(e) =>
                                  handleFormChange(
                                    e,
                                    "mitigation_task",
                                    "further_planned_action"
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                rows="2"
                                placeholder="Detail further actions..."
                                disabled={modalType === "view"}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Task ID
                              </label>
                              <input
                                type="text"
                                value={formData.mitigation_task.task_id}
                                onChange={(e) =>
                                  handleFormChange(e, "mitigation_task", "task_id")
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                disabled={modalType === "view"}
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Task Description
                              </label>
                              <textarea
                                value={formData.mitigation_task.task_description}
                                onChange={(e) =>
                                  handleFormChange(
                                    e,
                                    "mitigation_task",
                                    "task_description"
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                rows="2"
                                disabled={modalType === "view"}
                              ></textarea>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Task Owner
                              </label>
                              <input
                                type="text"
                                value={formData.mitigation_task.task_owner}
                                onChange={(e) =>
                                  handleFormChange(
                                    e,
                                    "mitigation_task",
                                    "task_owner"
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                disabled={modalType === "view"}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ongoing Task? (Y/N)
                              </label>
                              <select
                                value={formData.mitigation_task.is_ongoing}
                                onChange={(e) =>
                                  handleSelectChange(
                                    e,
                                    "mitigation_task",
                                    "is_ongoing"
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                disabled={modalType === "view"}
                              >
                                <option value="Y">Yes</option>
                                <option value="N">No</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Planned Completion Date
                              </label>
                              <input
                                type="date"
                                value={
                                  formData.mitigation_task.planned_completion_date
                                }
                                onChange={(e) =>
                                  handleFormChange(
                                    e,
                                    "mitigation_task",
                                    "planned_completion_date"
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                disabled={
                                  modalType === "view" ||
                                  formData.mitigation_task.is_ongoing === "Y"
                                }
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Recurrent Task? (Y/N)
                              </label>
                              <select
                                value={formData.mitigation_task.is_recurrent}
                                onChange={(e) =>
                                  handleSelectChange(
                                    e,
                                    "mitigation_task",
                                    "is_recurrent"
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                disabled={modalType === "view"}
                              >
                                <option value="Y">Yes</option>
                                <option value="N">No</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Frequency
                              </label>
                              <input
                                type="text"
                                value={formData.mitigation_task.frequency}
                                onChange={(e) =>
                                  handleFormChange(
                                    e,
                                    "mitigation_task",
                                    "frequency"
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="e.g., Weekly, Monthly, Quarterly"
                                disabled={
                                  modalType === "view" ||
                                  formData.mitigation_task.is_recurrent === "N"
                                }
                              />
                            </div>
                          </div>
                        </div>

                        {/* Submit Buttons */}
                        {modalType !== "view" && (
                          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                            <button
                              type="button"
                              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                              onClick={closeModal}
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-4 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                              disabled={isLoading}
                            >
                              {isLoading
                                ? "Processing..."
                                : modalType === "edit"
                                  ? "Update Risk"
                                  : "Create Risk"}
                            </button>
                          </div>
                        )}

                        {/* View Mode Close Button */}
                        {modalType === "view" && (
                          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                            <button
                              type="button"
                              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                              onClick={closeModal}
                            >
                              Close
                            </button>
                          </div>
                        )}
                      </form>
                    )}

                    {/* Excel Upload Form */}
                    {modalType === "excel" && (
                      <form onSubmit={handleExcelSubmit} className="space-y-6">
                        {/* Add guidance for Excel format */}
                        <div className="rounded-md bg-blue-50 p-4">
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-5 h-5 text-blue-400"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                                />
                              </svg>
                            </div>
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-blue-800">
                                Download Template
                              </h3>
                              <div className="mt-1 text-sm text-blue-700">
                                <p>
                                  Please download and fill in the template below
                                  before submitting your risk assessment data.
                                </p>
                              </div>
                              <div className="mt-3">
                                <a
                                  href="/risk_assessment_template.xlsx"
                                  download
                                  className="inline-flex items-center px-3 py-2 border border-blue-300 shadow-sm text-sm leading-4 font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-4 h-4 mr-2"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                                    />
                                  </svg>
                                  Download Risk Assessment Template
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Upload Section */}
                        <div className="bg-white-50 p-6 rounded-lg border-2 border-dashed border-blue-300">
                          <div className="text-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="blue"
                              className="mx-auto h-12 w-12 text-green-500"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                              />
                            </svg>
                            <h4 className="mt-2 text-lg font-medium text-gray-900">
                              Upload Excel File
                            </h4>
                            <p className="mt-1 text-sm text-gray-500">
                              Upload a .xlsx or .xls file with multiple risk
                              assessments.
                            </p>
                            <div className="mt-6">
                              <label
                                htmlFor="file-upload"
                                className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50"
                              >
                                <span>Select file</span>
                                <input
                                  id="file-upload"
                                  name="file-upload"
                                  type="file"
                                  accept=".xlsx,.xls"
                                  className="sr-only"
                                  onChange={handleFileChange}
                                />
                              </label>
                            </div>
                          </div>
                        </div>

                        {excelFile && (
                          <div className="mt-4 flex items-center justify-center text-sm">
                            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                              Selected: {excelFile.name}
                            </div>
                          </div>
                        )}

                        {/* Submit Buttons */}
                        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                          <button
                            type="button"
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            onClick={closeModal}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700"
                            disabled={!excelFile || isLoading}
                          >
                            {isLoading ? "Uploading..." : "Upload Risk Data"}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sheet Creation Modal */}
          {showSheetModal && (
            <div
              className="fixed inset-0 z-50 overflow-y-auto"
              aria-labelledby="modal-title"
              role="dialog"
              aria-modal="true"
            >
              <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                {/* Background overlay */}
                <div
                  className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                  aria-hidden="true"
                  onClick={() => setShowSheetModal(false)}
                ></div>

                {/* Modal panel */}
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                  <div className="bg-indigo-50 px-4 py-3 border-b border-gray-200">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Create New Report
                    </h3>
                  </div>
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="sheet-name"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Report Name *
                        </label>
                        <input
                          type="text"
                          id="sheet-name"
                          value={newSheetName}
                          onChange={(e) => setNewSheetName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Enter report name"
                        />
                      </div>
                    </div>

                    <div className="mt-5 sm:mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        onClick={() => setShowSheetModal(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                        onClick={createSheet}
                        disabled={isLoading}
                      >
                        {isLoading ? "Creating..." : "Create Report"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyReports;
