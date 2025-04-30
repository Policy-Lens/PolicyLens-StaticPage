import React, { useState, useEffect } from "react";
import { FilePlus, FileUp } from "lucide-react";
import { apiRequest } from "../../../../utils/api";
import { useParams } from "react-router-dom";
import { message } from "antd";

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

const ASISReport = () => {
  // State for data - now empty as we'll fetch from API
  const [controls, setControls] = useState([]);

  // Expanded groups state
  const [expandedGroups, setExpandedGroups] = useState({
    controlType: false,
    controlProperty: false,
    cyberSecurityConcept: false,
    securityDomain: false,
    operationalCapability: false,
    other: false,
  });

  // State for reports and selected report
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [newReportName, setNewReportName] = useState("");

  // State for modal visibility
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("form"); // 'form' or 'edit' or 'excel'
  const [editingControl, setEditingControl] = useState(null);

  // State for file upload
  const [excelFile, setExcelFile] = useState(null);

  // Loading state
  const [isLoading, setIsLoading] = useState(true);

  // Confirmation modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalProps, setConfirmModalProps] = useState({
    onConfirm: () => {},
    title: "Confirm Action",
    message: "Are you sure?",
  });

  // State for the control form data
  const [formData, setFormData] = useState({
    control_id: "",
    control_name: "",
    associated_functions: "",
    control_theme: "Organizational",
    control_type: {
      preventive: "N",
      detective: "N",
      corrective: "N",
    },
    control_property: {
      confidentiality: "N",
      integrity: "N",
      availability: "N",
      does_control_cover_intent: "N",
      does_control_cover_implementation: "N",
      does_control_cover_effectiveness: "N",
    },
    cybersecurity_concept: {
      identify: "N",
      protect: "N",
      detect: "N",
      respond: "N",
      recover: "N",
    },
    security_domain: {
      governance_and_ecosystem: "N",
      protection: "N",
      defence: "N",
      resilience: "N",
    },
    operational_capability: {
      governance: "N",
      asset_management: "N",
      information_protection: "N",
      human_resource_security: "N",
      physical_security: "N",
      system_and_network_security: "N",
      application_security: "N",
      secure_configuration: "N",
      identity_and_access_management: "N",
      threat_and_vulnerability_management: "N",
      continuity: "N",
      supplier_relationship_security: "N",
      legal_and_compliance: "N",
      information_security_event_management: "N",
      information_security_assurance: "N",
    },
    additional_info: {
      related_to: "Plan",
      must_have: "N",
      nice_to_have: "N",
      sample_audit_questions: "",
    },
  });

  // State for functions list
  const [functions, setFunctions] = useState([]);

  // Get project ID from URL
  const { projectid } = useParams();

  // Toggle group expansion
  const toggleGroup = (groupName) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  // Helper function to render expand/collapse icon
  const renderExpandIcon = (isExpanded) => (
    <span
      className={`ml-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-opacity-50 transition-transform duration-300 ${
        isExpanded ? "rotate-90" : ""
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

  // =================== FETCH FUNCTIONS =================== //

  // Fetch all ASIS reports for current project
  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest(
        "GET",
        `/api/rarpt/project/${projectid}/asis-reports/`,
        null,
        true
      );

      if (response.data && Array.isArray(response.data)) {
        setReports(response.data);
        if (response.data.length > 0 && !selectedReport) {
          const previouslySelected = reports.find(
            (r) => r.id === selectedReport?.id
          );
          const reportToSelect = previouslySelected || response.data[0];
          setSelectedReport(reportToSelect);
          await fetchControlsForReport(reportToSelect.id);
        } else if (response.data.length === 0) {
          setControls([]);
          setSelectedReport(null);
        }
      } else {
        setReports([]);
        setControls([]);
        setSelectedReport(null);
      }
    } catch (err) {
      console.error("Error fetching ASIS reports:", err);
      message.error(err.message || "Failed to fetch ASIS reports");
      setReports([]);
      setControls([]);
      setSelectedReport(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch controls for a specific report
  const fetchControlsForReport = async (reportId) => {
    setIsLoading(true);
    try {
      const response = await apiRequest(
        "GET",
        `/api/rarpt/asis-reports/${reportId}/controls/`,
        null,
        true
      );

      if (response.data && Array.isArray(response.data)) {
        setControls(response.data);
      } else {
        console.warn(
          "API returned no controls for this report or invalid format"
        );
        setControls([]);
      }
    } catch (err) {
      console.error("Error fetching ASIS controls:", err);
      message.error(err.message || "Failed to fetch ASIS controls");
      setControls([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch functions on component mount
  useEffect(() => {
    const fetchFunctions = async () => {
      try {
        const response = await apiRequest(
          "GET",
          "/api/questionnaire/functions/",
          null,
          true
        );
        if (Array.isArray(response.data)) {
          setFunctions(response.data);
        }
      } catch (err) {
        console.error("Error fetching functions:", err);
        message.error("Failed to fetch associated functions");
      }
    };
    fetchFunctions();
  }, []);

  // =================== CRUD OPERATIONS =================== //

  // Create a new ASIS report
  const createReport = async () => {
    if (!newReportName.trim()) {
      message.error("Report name cannot be empty");
      return;
    }
    setIsLoading(true);
    try {
      const response = await apiRequest(
        "POST",
        `/api/rarpt/project/${projectid}/asis-reports/create/`,
        { name: newReportName.trim() },
        true
      );
      message.success("Report created successfully");
      setNewReportName("");
      setShowReportModal(false);
      await fetchReports(); // Refresh report list
      if (response.data) {
        const newReport = response.data;
        if (newReport) {
          setSelectedReport(newReport);
          await fetchControlsForReport(newReport.id);
        }
      }
    } catch (err) {
      console.error("Error creating ASIS report:", err);
      message.error(err.message || "Failed to create ASIS report");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete an ASIS report
  const deleteReport = async (reportId, reportName, controlCount) => {
    openConfirmModal({
      title: "Confirm Report Deletion",
      message: `Are you sure you want to delete the report "${reportName}"? This will also delete ${controlCount} associated controls. This action cannot be undone.`,
      onConfirm: async () => {
        closeConfirmModal();
        setIsLoading(true);
        try {
          await apiRequest(
            "DELETE",
            `/api/rarpt/asis-reports/${reportId}/`,
            null,
            true
          );
          message.success("Report deleted successfully");

          // Fetch updated reports list after deletion
          const response = await apiRequest(
            "GET",
            `/api/rarpt/project/${projectid}/asis-reports/`,
            null,
            true
          );
          const updatedReports = response.data || [];
          setReports(updatedReports);

          // Check if the deleted report was the selected one
          if (selectedReport && selectedReport.id === reportId) {
            if (updatedReports.length > 0) {
              // Select the first available report
              const nextReport = updatedReports[0];
              setSelectedReport(nextReport);
              await fetchControlsForReport(nextReport.id);
            } else {
              // No reports left
              setSelectedReport(null);
              setControls([]);
            }
          }
        } catch (err) {
          console.error(
            "Error deleting or fetching ASIS reports after deletion:",
            err
          );
          message.error(
            err.message || "Failed to delete report or refresh list"
          );
        } finally {
          setIsLoading(false);
        }
      },
      onClose: closeConfirmModal,
    });
  };

  // Handle report change
  const handleReportChange = async (reportId) => {
    if (reportId === "create") {
      setShowReportModal(true);
      return;
    }
    const report = reports.find((r) => r.id === parseInt(reportId));
    if (report) {
      setSelectedReport(report);
      await fetchControlsForReport(report.id);
    }
  };

  // =================== CONTROL OPERATIONS =================== //

  // Open modal for adding or editing a control
  const openModal = (type, controlToEdit = null) => {
    if (!selectedReport) {
      message.error("Please select a report first");
      return;
    }

    setModalType(type);

    if (type === "edit" && controlToEdit) {
      setEditingControl(controlToEdit);

      // Map API format to form data
      setFormData({
        control_id: controlToEdit.control_id || "",
        control_name: controlToEdit.control_name || "",
        associated_functions:
          controlToEdit.associated_functions?.map((f) => f.name).join(",") ||
          "",
        control_theme: controlToEdit.control_theme || "Organizational",
        control_type: {
          preventive: controlToEdit.control_type?.preventive || "N",
          detective: controlToEdit.control_type?.detective || "N",
          corrective: controlToEdit.control_type?.corrective || "N",
        },
        control_property: {
          confidentiality:
            controlToEdit.control_property?.confidentiality || "N",
          integrity: controlToEdit.control_property?.integrity || "N",
          availability: controlToEdit.control_property?.availability || "N",
          does_control_cover_intent:
            controlToEdit.control_property?.does_control_cover_intent || "N",
          does_control_cover_implementation:
            controlToEdit.control_property?.does_control_cover_implementation ||
            "N",
          does_control_cover_effectiveness:
            controlToEdit.control_property?.does_control_cover_effectiveness ||
            "N",
        },
        cybersecurity_concept: {
          identify: controlToEdit.cybersecurity_concept?.identify || "N",
          protect: controlToEdit.cybersecurity_concept?.protect || "N",
          detect: controlToEdit.cybersecurity_concept?.detect || "N",
          respond: controlToEdit.cybersecurity_concept?.respond || "N",
          recover: controlToEdit.cybersecurity_concept?.recover || "N",
        },
        security_domain: {
          governance_and_ecosystem:
            controlToEdit.security_domain?.governance_and_ecosystem || "N",
          protection: controlToEdit.security_domain?.protection || "N",
          defence: controlToEdit.security_domain?.defence || "N",
          resilience: controlToEdit.security_domain?.resilience || "N",
        },
        operational_capability: {
          governance: controlToEdit.operational_capability?.governance || "N",
          asset_management:
            controlToEdit.operational_capability?.asset_management || "N",
          information_protection:
            controlToEdit.operational_capability?.information_protection || "N",
          human_resource_security:
            controlToEdit.operational_capability?.human_resource_security ||
            "N",
          physical_security:
            controlToEdit.operational_capability?.physical_security || "N",
          system_and_network_security:
            controlToEdit.operational_capability?.system_and_network_security ||
            "N",
          application_security:
            controlToEdit.operational_capability?.application_security || "N",
          secure_configuration:
            controlToEdit.operational_capability?.secure_configuration || "N",
          identity_and_access_management:
            controlToEdit.operational_capability
              ?.identity_and_access_management || "N",
          threat_and_vulnerability_management:
            controlToEdit.operational_capability
              ?.threat_and_vulnerability_management || "N",
          continuity: controlToEdit.operational_capability?.continuity || "N",
          supplier_relationship_security:
            controlToEdit.operational_capability
              ?.supplier_relationship_security || "N",
          legal_and_compliance:
            controlToEdit.operational_capability?.legal_and_compliance || "N",
          information_security_event_management:
            controlToEdit.operational_capability
              ?.information_security_event_management || "N",
          information_security_assurance:
            controlToEdit.operational_capability
              ?.information_security_assurance || "N",
        },
        additional_info: {
          related_to: controlToEdit.additional_info?.related_to || "Plan",
          must_have: controlToEdit.additional_info?.must_have || "N",
          nice_to_have: controlToEdit.additional_info?.nice_to_have || "N",
          sample_audit_questions:
            controlToEdit.additional_info?.sample_audit_questions || "",
        },
      });
    } else if (type === "form") {
      // Reset form for new control
      setEditingControl(null);
      setFormData({
        control_id: "",
        control_name: "",
        associated_functions: "",
        control_theme: "Organizational",
        control_type: {
          preventive: "N",
          detective: "N",
          corrective: "N",
        },
        control_property: {
          confidentiality: "N",
          integrity: "N",
          availability: "N",
          does_control_cover_intent: "N",
          does_control_cover_implementation: "N",
          does_control_cover_effectiveness: "N",
        },
        cybersecurity_concept: {
          identify: "N",
          protect: "N",
          detect: "N",
          respond: "N",
          recover: "N",
        },
        security_domain: {
          governance_and_ecosystem: "N",
          protection: "N",
          defence: "N",
          resilience: "N",
        },
        operational_capability: {
          governance: "N",
          asset_management: "N",
          information_protection: "N",
          human_resource_security: "N",
          physical_security: "N",
          system_and_network_security: "N",
          application_security: "N",
          secure_configuration: "N",
          identity_and_access_management: "N",
          threat_and_vulnerability_management: "N",
          continuity: "N",
          supplier_relationship_security: "N",
          legal_and_compliance: "N",
          information_security_event_management: "N",
          information_security_assurance: "N",
        },
        additional_info: {
          related_to: "Plan",
          must_have: "N",
          nice_to_have: "N",
          sample_audit_questions: "",
        },
      });
    } else if (type === "excel") {
      setExcelFile(null);
    }
    console.log("Modal opened with type:", type);
    setShowModal(true);
  };

  // Close any modal
  const closeModal = () => {
    setShowModal(false);
    setShowReportModal(false);
    setEditingControl(null);
    setExcelFile(null);
  };

  // Handle form input changes
  const handleFormChange = (e, section, field) => {
    const { value } = e.target;

    if (!section) {
      // Handle top-level fields
      setFormData((prev) => ({ ...prev, [field]: value }));
    } else {
      // Handle nested fields
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }));
    }
  };

  // Handle yes/no select changes
  const handleSelectChange = (e, section, field) => {
    const { value } = e.target;

    if (!section) {
      // Handle top-level fields
      setFormData((prev) => ({ ...prev, [field]: value }));
    } else {
      // Handle nested fields
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }));
    }
  };

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setExcelFile(file);
    }
  };

  // Submit a new control
  const handleControlSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReport) {
      message.error("Please select a report first");
      return;
    }
    setIsLoading(true);
    try {
      const apiData = {
        report: selectedReport.id,
        control_id: formData.control_id,
        control_name: formData.control_name,
        associated_functions: formData.associated_functions,
        control_theme: formData.control_theme,
        control_type: formData.control_type,
        control_property: formData.control_property,
        cybersecurity_concept: formData.cybersecurity_concept,
        security_domain: formData.security_domain,
        operational_capability: formData.operational_capability,
        additional_info: formData.additional_info,
      };

      const response = await apiRequest(
        "POST",
        `/api/rarpt/asis-reports/${selectedReport.id}/controls/create/`,
        apiData,
        true
      );

      if (response.data) {
        message.success("Control created successfully");
        await fetchControlsForReport(selectedReport.id);
        closeModal();
      }
    } catch (err) {
      console.error("Error creating control:", err);
      message.error(err.message || "Failed to create control");
    } finally {
      setIsLoading(false);
    }
  };

  // Update an existing control
  const handleControlUpdate = async (e) => {
    e.preventDefault();
    if (!selectedReport || !editingControl) {
      message.error("Report or control not selected");
      return;
    }
    setIsLoading(true);
    try {
      const apiData = {
        report: selectedReport.id,
        control_id: formData.control_id,
        control_name: formData.control_name,
        associated_functions: formData.associated_functions,
        control_theme: formData.control_theme,
        control_type: formData.control_type,
        control_property: formData.control_property,
        cybersecurity_concept: formData.cybersecurity_concept,
        security_domain: formData.security_domain,
        operational_capability: formData.operational_capability,
        additional_info: formData.additional_info,
      };

      const response = await apiRequest(
        "PUT",
        `/api/rarpt/asis-controls/${editingControl.id}/`,
        apiData,
        true
      );

      if (response.status === 200 || response.status === 204) {
        message.success("Control updated successfully");
        await fetchControlsForReport(selectedReport.id);
        closeModal();
      }
    } catch (err) {
      console.error("Error updating control:", err);
      message.error(err.message || "Failed to update control");
    } finally {
      setIsLoading(false);
    }
  };

  // Submit excel file for controls
  const handleExcelSubmit = async (e) => {
    e.preventDefault();

    if (!excelFile) {
      message.error("Please select an Excel file");
      return;
    }

    if (!selectedReport) {
      message.error("Please select a report first");
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", excelFile);

      const response = await apiRequest(
        "POST",
        `/api/rarpt/asis-reports/${selectedReport.id}/controls/create/`,
        formData,
        true
      );

      if (response.status === 200 || response.status === 201) {
        message.success("Excel file uploaded successfully.");
        await fetchControlsForReport(selectedReport.id);
        closeModal();
      }
    } catch (err) {
      console.error(
        "Error uploading Excel file:",
        err.message || "Unknown error"
      );
      message.error(err.message || "Failed to upload Excel file");
    } finally {
      setIsLoading(false);
      setExcelFile(null);
    }
  };

  // Delete a control
  const handleDeleteControl = async (controlId) => {
    openConfirmModal({
      title: "Confirm Control Deletion",
      message:
        "Are you sure you want to delete this control? This action cannot be undone.",
      onConfirm: async () => {
        closeConfirmModal();
        setIsLoading(true);
        try {
          await apiRequest(
            "DELETE",
            `/api/rarpt/asis-controls/${controlId}/`,
            null,
            true
          );
          message.success("Control deleted successfully");
          if (selectedReport) {
            await fetchControlsForReport(selectedReport.id);
          }
        } catch (err) {
          console.error("Error deleting control:", err);
          message.error(err.message || "Failed to delete control");
        } finally {
          setIsLoading(false);
        }
      },
      onClose: closeConfirmModal,
    });
  };

  // Modal control functions
  const openConfirmModal = (props) => {
    setConfirmModalProps(props);
    setShowConfirmModal(true);
  };

  const closeConfirmModal = () => {
    setShowConfirmModal(false);
    setConfirmModalProps({
      onConfirm: () => {},
      title: "Confirm Action",
      message: "Are you sure?",
    });
  };

  // Load reports on component mount
  useEffect(() => {
    fetchReports();
  }, [projectid]);

  return (
    <>
      {/* Header with Buttons */}
      <div className="flex items-center justify-between border-b border-slate-200 p-5 bg-white sticky top-0 z-10 shadow-sm">
        <div className="flex items-center">
          <h2 className="text-xl font-bold text-slate-800">ASIS Report</h2>
          <div className="ml-3 text-slate-600 font-medium bg-indigo-50 px-3 py-1 rounded-full">
            {controls.length}
          </div>
        </div>

        {/* Actions and Report Selector */}
        <div className="flex space-x-3 items-center">
          {/* Report Selector Dropdown */}
          <div className="relative">
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={selectedReport ? selectedReport.id : ""}
              onChange={(e) => handleReportChange(e.target.value)}
              disabled={isLoading}
            >
              {reports.length === 0 && (
                <option value="" disabled>
                  No reports available
                </option>
              )}
              {reports.map((report) => (
                <option key={report.id} value={report.id}>
                  {report.name}
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
                />
              </svg>
            </div>
          </div>

          {/* Delete Report Button */}
          <button
            className={`p-2.5 rounded-lg text-red-600 hover:bg-red-100 disabled:text-gray-400 disabled:bg-transparent disabled:cursor-not-allowed transition-colors`}
            onClick={() =>
              deleteReport(
                selectedReport?.id,
                selectedReport?.name,
                controls.length
              )
            }
            disabled={!selectedReport || isLoading}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>

          {/* Action buttons */}
          <button
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center"
            onClick={() => openModal("form")}
            disabled={!selectedReport || isLoading}
          >
            <FilePlus className="w-5 h-5 mr-2" />
            Add Control
          </button>

          <button
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center"
            onClick={() => openModal("excel")}
            disabled={!selectedReport || isLoading}
          >
            <FileUp className="w-5 h-5 mr-2" />
            Upload Excel
          </button>

          <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Legend
          </button>
        </div>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      )}

      {/* No Reports Message */}
      {!isLoading && reports.length === 0 && (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <svg
            className="w-16 h-16 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-xl font-medium text-gray-700 mb-2">
            No Reports Available
          </h3>
          <p className="text-gray-500 mb-6">
            Create your first ASIS report to get started.
          </p>
          <button
            onClick={() => setShowReportModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Create Report
          </button>
        </div>
      )}

      {/* No Controls Message */}
      {!isLoading && selectedReport && controls.length === 0 && (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <svg
            className="w-16 h-16 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-xl font-medium text-gray-700 mb-2">
            No Controls Available
          </h3>
          <p className="text-gray-500 mb-6">
            Add your first control to this report.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => openModal("form")}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center"
            >
              <FilePlus className="w-5 h-5 mr-2" />
              Add Control
            </button>
            <button
              onClick={() => openModal("excel")}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center"
            >
              <FileUp className="w-5 h-5 mr-2" />
              Upload Excel
            </button>
          </div>
        </div>
      )}

      {/* Table Container - Only shown when we have controls */}
      {!isLoading && selectedReport && controls.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            {/* Table Header */}
            <thead>
              <tr>
                {/* Actions column */}
                <th className="border border-slate-200 p-3 bg-gray-100 sticky left-0 z-10">
                  Actions
                </th>

                {/* Basic columns */}
                <th className="border border-slate-200 p-3 bg-gray-100">
                  Control ID
                </th>
                <th className="border border-slate-200 p-3 bg-gray-100 min-w-[250px]">
                  Control Name
                </th>
                <th className="border border-slate-200 p-3 bg-gray-100 min-w-[200px]">
                  Associated org function
                </th>
                <th className="border border-slate-200 p-3 bg-gray-100">
                  Control Theme
                </th>

                {/* Control Type header group */}
                <th
                  onClick={() => toggleGroup("controlType")}
                  colSpan={expandedGroups.controlType ? 3 : 1}
                  className="border border-slate-200 p-3 bg-slate-700 text-white text-left cursor-pointer font-medium"
                >
                  Control Type {renderExpandIcon(expandedGroups.controlType)}
                </th>

                {/* Control property / Control objective header group */}
                <th
                  onClick={() => toggleGroup("controlProperty")}
                  colSpan={expandedGroups.controlProperty ? 6 : 1}
                  className="border border-slate-200 p-3 bg-slate-700 text-white text-left cursor-pointer font-medium"
                >
                  Control property / Control objective{" "}
                  {renderExpandIcon(expandedGroups.controlProperty)}
                </th>

                {/* Control Type / Cyber security concept header group */}
                <th
                  onClick={() => toggleGroup("cyberSecurityConcept")}
                  colSpan={expandedGroups.cyberSecurityConcept ? 5 : 1}
                  className="border border-slate-200 p-3 bg-slate-700 text-white text-left cursor-pointer font-medium"
                >
                  Control Type / Cyber security concept{" "}
                  {renderExpandIcon(expandedGroups.cyberSecurityConcept)}
                </th>

                {/* Security domain header group */}
                <th
                  onClick={() => toggleGroup("securityDomain")}
                  colSpan={expandedGroups.securityDomain ? 4 : 1}
                  className="border border-slate-200 p-3 bg-slate-700 text-white text-left cursor-pointer font-medium"
                >
                  Security domain{" "}
                  {renderExpandIcon(expandedGroups.securityDomain)}
                </th>

                {/* Operational capability header group */}
                <th
                  onClick={() => toggleGroup("operationalCapability")}
                  colSpan={expandedGroups.operationalCapability ? 15 : 1}
                  className="border border-slate-200 p-3 bg-slate-700 text-white text-left cursor-pointer font-medium"
                >
                  Operational capability{" "}
                  {renderExpandIcon(expandedGroups.operationalCapability)}
                </th>

                {/* Other header group */}
                <th
                  onClick={() => toggleGroup("other")}
                  colSpan={expandedGroups.other ? 4 : 1}
                  className="border border-slate-200 p-3 bg-slate-700 text-white text-left cursor-pointer font-medium"
                >
                  Other {renderExpandIcon(expandedGroups.other)}
                </th>
              </tr>

              {/* Subheaders for expanded groups */}
              <tr>
                {/* Actions placeholder */}
                <th className="border border-slate-200 p-3 bg-gray-100 sticky left-0"></th>

                {/* Basic placeholder columns */}
                <th className="border border-slate-200 p-3 bg-gray-100"></th>
                <th className="border border-slate-200 p-3 bg-gray-100"></th>
                <th className="border border-slate-200 p-3 bg-gray-100"></th>
                <th className="border border-slate-200 p-3 bg-gray-100"></th>

                {/* Control Type subheaders */}
                {expandedGroups.controlType ? (
                  <>
                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white">
                      Preventive
                    </th>
                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white">
                      Detective
                    </th>
                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white">
                      Corrective
                    </th>
                  </>
                ) : (
                  <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white"></th>
                )}

                {/* Control property subheaders */}
                {expandedGroups.controlProperty ? (
                  <>
                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white">
                      Confidentiality
                    </th>
                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white">
                      Integrity
                    </th>
                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white">
                      Availability
                    </th>
                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white">
                      Covers Intent
                    </th>
                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white">
                      Covers Implementation
                    </th>
                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white">
                      Covers Effectiveness
                    </th>
                  </>
                ) : (
                  <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white"></th>
                )}

                {/* Cyber security concept subheaders */}
                {expandedGroups.cyberSecurityConcept ? (
                  <>
                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white">
                      Identify
                    </th>
                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white">
                      Protect
                    </th>
                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white">
                      Detect
                    </th>
                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white">
                      Respond
                    </th>
                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white">
                      Recover
                    </th>
                  </>
                ) : (
                  <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white"></th>
                )}

                {/* Security domain subheaders */}
                {expandedGroups.securityDomain ? (
                  <>
                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white">
                      Governance_and_Ecosystem
                    </th>
                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white">
                      Protection
                    </th>
                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white">
                      Defence
                    </th>
                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white">
                      Resilience
                    </th>
                  </>
                ) : (
                  <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white"></th>
                )}

                {/* Operational capability subheaders */}
                {expandedGroups.operationalCapability ? (
                  <>
                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white">
                      Governance
                    </th>
                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white">
                      Asset_management
                    </th>
                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white">
                      Information_protection
                    </th>
                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white">
                      Human_resource_security
                    </th>
                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white">
                      Physical_security
                    </th>
                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white">
                      System_and_network_security
                    </th>
                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white">
                      Application_security
                    </th>
                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white">
                      Secure_configuration
                    </th>
                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white">
                      Identity_and_access_management
                    </th>
                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white">
                      Threat_and_vulnerability_management
                    </th>
                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white">
                      Continuity
                    </th>
                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white">
                      Supplier_relationships_security
                    </th>
                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white">
                      Legal_and_compliance
                    </th>
                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white">
                      Information_security_event_management
                    </th>
                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white">
                      Information_security_assurance
                    </th>
                  </>
                ) : (
                  <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white"></th>
                )}

                {/* Other subheaders */}
                {expandedGroups.other ? (
                  <>
                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white">
                      Related to
                    </th>
                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white">
                      Must have
                    </th>
                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white">
                      Nice to have
                    </th>
                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white">
                      Sample audit questions
                    </th>
                  </>
                ) : (
                  <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white"></th>
                )}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {controls.map((control) => (
                <tr key={control.id} className="hover:bg-gray-50">
                  {/* Actions */}
                  <td className="border border-slate-200 p-3 sticky left-0 bg-white">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openModal("edit", control)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded-full"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteControl(control.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded-full"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>

                  {/* Basic columns */}
                  <td className="border border-slate-200 p-3">
                    {control.control_id}
                  </td>
                  <td className="border border-slate-200 p-3">
                    {control.control_name}
                  </td>
                  <td className="border border-slate-200 p-3">
                    {control.associated_functions
                      ?.map((f) => f.name)
                      .join(", ")}
                  </td>
                  <td className="border border-slate-200 p-3">
                    {control.control_theme}
                  </td>

                  {/* Control Type cells */}
                  {expandedGroups.controlType ? (
                    <>
                      <td className="border border-slate-200 p-3 text-center">
                        {control.control_type?.preventive}
                      </td>
                      <td className="border border-slate-200 p-3 text-center">
                        {control.control_type?.detective}
                      </td>
                      <td className="border border-slate-200 p-3 text-center">
                        {control.control_type?.corrective}
                      </td>
                    </>
                  ) : (
                    <td className="border border-slate-200 p-3 text-center">
                      P:{control.control_type?.preventive} D:
                      {control.control_type?.detective} C:
                      {control.control_type?.corrective}
                    </td>
                  )}

                  {/* Control property cells */}
                  {expandedGroups.controlProperty ? (
                    <>
                      <td className="border border-slate-200 p-3 text-center">
                        {control.control_property?.confidentiality}
                      </td>
                      <td className="border border-slate-200 p-3 text-center">
                        {control.control_property?.integrity}
                      </td>
                      <td className="border border-slate-200 p-3 text-center">
                        {control.control_property?.availability}
                      </td>
                      <td className="border border-slate-200 p-3 text-center">
                        {control.control_property?.does_control_cover_intent}
                      </td>
                      <td className="border border-slate-200 p-3 text-center">
                        {
                          control.control_property
                            ?.does_control_cover_implementation
                        }
                      </td>
                      <td className="border border-slate-200 p-3 text-center">
                        {
                          control.control_property
                            ?.does_control_cover_effectiveness
                        }
                      </td>
                    </>
                  ) : (
                    <td className="border border-slate-200 p-3 text-center">
                      C:{control.control_property?.confidentiality} I:
                      {control.control_property?.integrity} A:
                      {control.control_property?.availability}
                    </td>
                  )}

                  {/* Cyber security concept cells */}
                  {expandedGroups.cyberSecurityConcept ? (
                    <>
                      <td className="border border-slate-200 p-3 text-center">
                        {control.cybersecurity_concept?.identify}
                      </td>
                      <td className="border border-slate-200 p-3 text-center">
                        {control.cybersecurity_concept?.protect}
                      </td>
                      <td className="border border-slate-200 p-3 text-center">
                        {control.cybersecurity_concept?.detect}
                      </td>
                      <td className="border border-slate-200 p-3 text-center">
                        {control.cybersecurity_concept?.respond}
                      </td>
                      <td className="border border-slate-200 p-3 text-center">
                        {control.cybersecurity_concept?.recover}
                      </td>
                    </>
                  ) : (
                    <td className="border border-slate-200 p-3 text-center">
                      I:{control.cybersecurity_concept?.identify} P:
                      {control.cybersecurity_concept?.protect} D:
                      {control.cybersecurity_concept?.detect}
                    </td>
                  )}

                  {/* Security domain cells */}
                  {expandedGroups.securityDomain ? (
                    <>
                      <td className="border border-slate-200 p-3 text-center">
                        {control.security_domain?.governance_and_ecosystem}
                      </td>
                      <td className="border border-slate-200 p-3 text-center">
                        {control.security_domain?.protection}
                      </td>
                      <td className="border border-slate-200 p-3 text-center">
                        {control.security_domain?.defence}
                      </td>
                      <td className="border border-slate-200 p-3 text-center">
                        {control.security_domain?.resilience}
                      </td>
                    </>
                  ) : (
                    <td className="border border-slate-200 p-3 text-center">
                      {control.security_domain?.governance_and_ecosystem === "Y"
                        ? "G"
                        : ""}
                      {control.security_domain?.protection === "Y" ? "P" : ""}
                      {control.security_domain?.defence === "Y" ? "D" : ""}
                    </td>
                  )}

                  {/* Operational capability cells */}
                  {expandedGroups.operationalCapability ? (
                    <>
                      <td className="border border-slate-200 p-3 text-center">
                        {control.operational_capability?.governance}
                      </td>
                      <td className="border border-slate-200 p-3 text-center">
                        {control.operational_capability?.asset_management}
                      </td>
                      <td className="border border-slate-200 p-3 text-center">
                        {control.operational_capability?.information_protection}
                      </td>
                      <td className="border border-slate-200 p-3 text-center">
                        {
                          control.operational_capability
                            ?.human_resource_security
                        }
                      </td>
                      <td className="border border-slate-200 p-3 text-center">
                        {control.operational_capability?.physical_security}
                      </td>
                      <td className="border border-slate-200 p-3 text-center">
                        {
                          control.operational_capability
                            ?.system_and_network_security
                        }
                      </td>
                      <td className="border border-slate-200 p-3 text-center">
                        {control.operational_capability?.application_security}
                      </td>
                      <td className="border border-slate-200 p-3 text-center">
                        {control.operational_capability?.secure_configuration}
                      </td>
                      <td className="border border-slate-200 p-3 text-center">
                        {
                          control.operational_capability
                            ?.identity_and_access_management
                        }
                      </td>
                      <td className="border border-slate-200 p-3 text-center">
                        {
                          control.operational_capability
                            ?.threat_and_vulnerability_management
                        }
                      </td>
                      <td className="border border-slate-200 p-3 text-center">
                        {control.operational_capability?.continuity}
                      </td>
                      <td className="border border-slate-200 p-3 text-center">
                        {
                          control.operational_capability
                            ?.supplier_relationship_security
                        }
                      </td>
                      <td className="border border-slate-200 p-3 text-center">
                        {control.operational_capability?.legal_and_compliance}
                      </td>
                      <td className="border border-slate-200 p-3 text-center">
                        {
                          control.operational_capability
                            ?.information_security_event_management
                        }
                      </td>
                      <td className="border border-slate-200 p-3 text-center">
                        {
                          control.operational_capability
                            ?.information_security_assurance
                        }
                      </td>
                    </>
                  ) : (
                    <td className="border border-slate-200 p-3 text-center">
                      {control.operational_capability?.governance === "Y"
                        ? "G"
                        : ""}
                      {control.operational_capability?.physical_security === "Y"
                        ? "P"
                        : ""}
                    </td>
                  )}

                  {/* Other cells */}
                  {expandedGroups.other ? (
                    <>
                      <td className="border border-slate-200 p-3 text-center">
                        {control.additional_info?.related_to}
                      </td>
                      <td className="border border-slate-200 p-3 text-center">
                        {control.additional_info?.must_have}
                      </td>
                      <td className="border border-slate-200 p-3 text-center">
                        {control.additional_info?.nice_to_have}
                      </td>
                      <td className="border border-slate-200 p-3 text-center">
                        {control.additional_info?.sample_audit_questions}
                      </td>
                    </>
                  ) : (
                    <td className="border border-slate-200 p-3 text-center">
                      {control.additional_info?.related_to}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={closeModal}
            ></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Create New ASIS Report
                </h3>
                <div className="mt-2">
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Report Name"
                    value={newReportName}
                    onChange={(e) => setNewReportName(e.target.value)}
                  />
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={createReport}
                  disabled={isLoading}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {isLoading ? "Creating..." : "Create"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Control Form Modal */}
      {showModal && (modalType === "form" || modalType === "edit") && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              aria-hidden="true"
              onClick={closeModal}
            ></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <form
                onSubmit={
                  editingControl ? handleControlUpdate : handleControlSubmit
                }
                className="bg-white"
              >
                <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="space-y-6">
                    {/* Basic Information */}
                    <div className="bg-white px-4 py-5 sm:p-6 rounded-lg border border-gray-200 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Basic Information
                      </h3>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Control ID
                          </label>
                          <input
                            type="text"
                            value={formData.control_id}
                            onChange={(e) =>
                              handleFormChange(e, null, "control_id")
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Control Name
                          </label>
                          <input
                            type="text"
                            value={formData.control_name}
                            onChange={(e) =>
                              handleFormChange(e, null, "control_name")
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Associated Functions
                          </label>
                          <select
                            multiple
                            value={formData.associated_functions.split(",")}
                            onChange={(e) => {
                              const selected = Array.from(
                                e.target.selectedOptions
                              ).map((option) => option.value);
                              handleFormChange(
                                { target: { value: selected.join(",") } },
                                null,
                                "associated_functions"
                              );
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            {functions.map((func) => (
                              <option key={func.id} value={func.name}>
                                {func.name}
                              </option>
                            ))}
                          </select>
                          <p className="mt-1 text-xs text-gray-500">
                            Hold Ctrl/Cmd to select multiple
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Control Theme
                          </label>
                          <select
                            value={formData.control_theme}
                            onChange={(e) =>
                              handleFormChange(e, null, "control_theme")
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="Organizational">
                              Organizational
                            </option>
                            <option value="Technical">Technical</option>
                            <option value="Physical">Physical</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Control Type */}
                    <div className="bg-white px-4 py-5 sm:p-6 rounded-lg border border-gray-200 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Control Type
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        {Object.keys(formData.control_type).map((key) => (
                          <div
                            key={key}
                            className="flex items-center space-x-3"
                          >
                            <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                              {key}
                            </label>
                            <select
                              value={formData.control_type[key]}
                              onChange={(e) =>
                                handleSelectChange(e, "control_type", key)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                              <option value="Y">Yes</option>
                              <option value="N">No</option>
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Control Property */}
                    <div className="bg-white px-4 py-5 sm:p-6 rounded-lg border border-gray-200 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Control Property
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        {Object.keys(formData.control_property).map((key) => (
                          <div
                            key={key}
                            className="flex items-center space-x-3"
                          >
                            <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                              {key.split("_").join(" ")}
                            </label>
                            <select
                              value={formData.control_property[key]}
                              onChange={(e) =>
                                handleSelectChange(e, "control_property", key)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                              <option value="Y">Yes</option>
                              <option value="N">No</option>
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Cybersecurity Concept */}
                    <div className="bg-white px-4 py-5 sm:p-6 rounded-lg border border-gray-200 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Cybersecurity Concept
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        {Object.keys(formData.cybersecurity_concept).map(
                          (key) => (
                            <div
                              key={key}
                              className="flex items-center space-x-3"
                            >
                              <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                                {key}
                              </label>
                              <select
                                value={formData.cybersecurity_concept[key]}
                                onChange={(e) =>
                                  handleSelectChange(
                                    e,
                                    "cybersecurity_concept",
                                    key
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              >
                                <option value="Y">Yes</option>
                                <option value="N">No</option>
                              </select>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    {/* Security Domain */}
                    <div className="bg-white px-4 py-5 sm:p-6 rounded-lg border border-gray-200 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Security Domain
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        {Object.keys(formData.security_domain).map((key) => (
                          <div
                            key={key}
                            className="flex items-center space-x-3"
                          >
                            <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                              {key.split("_").join(" ")}
                            </label>
                            <select
                              value={formData.security_domain[key]}
                              onChange={(e) =>
                                handleSelectChange(e, "security_domain", key)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                              <option value="Y">Yes</option>
                              <option value="N">No</option>
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Operational Capability */}
                    <div className="bg-white px-4 py-5 sm:p-6 rounded-lg border border-gray-200 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Operational Capability
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        {Object.keys(formData.operational_capability).map(
                          (key) => (
                            <div
                              key={key}
                              className="flex items-center space-x-3"
                            >
                              <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                                {key.split("_").join(" ")}
                              </label>
                              <select
                                value={formData.operational_capability[key]}
                                onChange={(e) =>
                                  handleSelectChange(
                                    e,
                                    "operational_capability",
                                    key
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              >
                                <option value="Y">Yes</option>
                                <option value="N">No</option>
                              </select>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="bg-white px-4 py-5 sm:p-6 rounded-lg border border-gray-200 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Additional Information
                      </h3>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Related To
                          </label>
                          <select
                            value={formData.additional_info.related_to}
                            onChange={(e) =>
                              handleSelectChange(
                                e,
                                "additional_info",
                                "related_to"
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="Plan">Plan</option>
                            <option value="Do">Do</option>
                            <option value="Check">Check</option>
                            <option value="Act">Act</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Must Have
                          </label>
                          <select
                            value={formData.additional_info.must_have}
                            onChange={(e) =>
                              handleSelectChange(
                                e,
                                "additional_info",
                                "must_have"
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="Y">Yes</option>
                            <option value="N">No</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nice to Have
                          </label>
                          <select
                            value={formData.additional_info.nice_to_have}
                            onChange={(e) =>
                              handleSelectChange(
                                e,
                                "additional_info",
                                "nice_to_have"
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="Y">Yes</option>
                            <option value="N">No</option>
                          </select>
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Sample Audit Questions
                          </label>
                          <textarea
                            value={
                              formData.additional_info.sample_audit_questions
                            }
                            onChange={(e) =>
                              handleFormChange(
                                e,
                                "additional_info",
                                "sample_audit_questions"
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                            rows={3}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {editingControl ? "Update Control" : "Add Control"}
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Excel Upload Modal */}
      {showModal && modalType === "excel" && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={closeModal}
            ></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleExcelSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Upload Excel File
                  </h3>
                  <div className="mt-2">
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="excel-file"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg
                            className="w-10 h-10 mb-3 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">
                              Click to upload
                            </span>{" "}
                            or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">
                            Excel files only
                          </p>
                        </div>
                        <input
                          id="excel-file"
                          type="file"
                          className="hidden"
                          accept=".xlsx,.xls"
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>
                    {excelFile && (
                      <p className="mt-2 text-sm text-gray-500 truncate">
                        Selected file: {excelFile.name}
                      </p>
                    )}
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={!excelFile || isLoading}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-gray-300"
                  >
                    {isLoading ? "Uploading..." : "Upload"}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={closeConfirmModal}
        onConfirm={confirmModalProps.onConfirm}
        title={confirmModalProps.title}
        message={confirmModalProps.message}
      />
    </>
  );
};

export default ASISReport;
