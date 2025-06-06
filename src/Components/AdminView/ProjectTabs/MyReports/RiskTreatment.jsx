import React, { useState, useEffect } from "react";
import { FilePlus, FileUp, Plus, Upload } from "lucide-react";
import { apiRequest } from "../../../../utils/api";
import { useParams } from "react-router-dom";
import LegendsModal from "./LegendsModal";
import { message } from "antd";

// Reusable Confirmation Modal Component (Copied from MyReports.jsx for standalone use)
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
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
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

const RiskTreatment = () => {
  // State to track which column groups are expanded
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
  const { projectid } = useParams();

  // State for sheets and selected sheet
  const [sheets, setSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [showSheetModal, setShowSheetModal] = useState(false);
  const [newSheetName, setNewSheetName] = useState("");

  // States for API interactions
  const [riskData, setRiskData] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Start with loading state

  // State for file upload
  const [excelFile, setExcelFile] = useState(null);

  // State for form data
  const [formData, setFormData] = useState({
    risk_id: "",
    vulnerability_type: "",
    threat_description: "",
    // Note: Risk Treatment form might need different default fields based on its specific needs
    rt_assessment: {
      risk_rating: 1,
      risk_category: "Not Significant",
      department_bu: "",
      risk_mitigation_strategy: "Tolerate",
    },
    rt_revision: {
      applicable_annex_control_number: "",
      meet_legal_requirements: "Y",
      revised_control_rating: 1,
      revised_consequence_rating: 1,
      revised_likelihood_rating: 1,
      residual_risk_rating: 1,
      acceptable_to_risk_owner: "Y",
    },
    // rt_mitigation_plans is now an object for the primary plan
    rt_mitigation_plans: {
      further_planned_action: "",
      policy_lense_task_id: "",
      task_description: "",
      task_owner: "",
      is_ongoing: "N",
      planned_completion_date: "",
      is_recurrent: "N",
      frequency: null,
    },
  });

  // State for Confirmation Modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalProps, setConfirmModalProps] = useState({
    onConfirm: () => { },
    title: "Confirm Action",
    message: "Are you sure?",
  });

  // --- Automatic Calculation Logic for Risk Treatment ---
  useEffect(() => {
    // Calculate Residual Risk Rating
    const {
      revised_control_rating,
      revised_consequence_rating,
      revised_likelihood_rating,
    } = formData.rt_revision;
    const calculatedResidualRiskRating =
      (revised_control_rating || 1) *
      (revised_consequence_rating || 1) *
      (revised_likelihood_rating || 1);

    // Calculate Risk Category based on rt_assessment.risk_rating
    const assessmentRiskRating = formData.rt_assessment.risk_rating || 1;
    const calculatedRiskCategory =
      assessmentRiskRating >= 27 ? "Significant" : "Not Significant";

    // Update formData state if calculated values differ
    setFormData((prevFormData) => {
      const needsUpdate =
        prevFormData.rt_revision.residual_risk_rating !==
        calculatedResidualRiskRating ||
        prevFormData.rt_assessment.risk_category !== calculatedRiskCategory;

      if (needsUpdate) {
        return {
          ...prevFormData,
          rt_assessment: {
            ...prevFormData.rt_assessment,
            risk_category: calculatedRiskCategory,
          },
          rt_revision: {
            ...prevFormData.rt_revision,
            residual_risk_rating: calculatedResidualRiskRating,
          },
        };
      }
      return prevFormData; // No update needed
    });
  }, [
    formData.rt_revision.revised_control_rating,
    formData.rt_revision.revised_consequence_rating,
    formData.rt_revision.revised_likelihood_rating,
    formData.rt_assessment.risk_rating, // Dependency for Risk Category calc
  ]);

  // Function to toggle column group expansion
  const toggleGroup = (group) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }));
  };

  // Function to render expand/collapse icons
  const renderExpandIcon = (isExpanded) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={`h-5 w-5 ml-2 transition-transform ${isExpanded ? "rotate-180" : ""
        }`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );

  // Function to get color for impact cells
  const getImpactColor = (value) => {
    return value === "Y" ? "bg-red-100 text-red-800" : "";
  };

  // Function to get color for rating cells
  const getRatingColor = (value) => {
    if (value >= 4) return "bg-red-100 text-red-800";
    if (value >= 3) return "bg-amber-100 text-amber-800";
    if (value >= 2) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  // Function to open modal
  const openModal = (type, riskToEdit = null) => {
    setModalType(type);
    setShowModal(true);
    // setError(null);
    // setSuccessMessage(null);
    setExcelFile(null); // Reset file state when opening modal

    if ((type === "edit" || type === "view") && riskToEdit) {
      setEditingRisk(riskToEdit);

      // Deep clone the risk object to avoid reference issues
      const riskDataToSet = {
        risk_id: riskToEdit.risk_id || "",
        vulnerability_type: riskToEdit.vulnerabilityType || "",
        threat_description: riskToEdit.threatDescription || "",
        context: riskToEdit.context || "",
        applicable_activity: riskToEdit.applicableActivity || "",
        rt_assessment: {
          risk_rating: riskToEdit.riskAssessment?.riskRating || 1,
          risk_category:
            riskToEdit.riskAssessment?.riskCategory || "Not Significant",
          department_bu: riskToEdit.riskAssessment?.departmentBU || "",
          risk_mitigation_strategy:
            riskToEdit.riskAssessment?.mitigationStrategy || "Tolerate",
        },
        rt_revision: {
          applicable_annex_control_number:
            riskToEdit.riskRevision?.soaControl || "",
          meet_legal_requirements:
            riskToEdit.riskRevision?.meetsRequirements || "Y",
          revised_control_rating:
            riskToEdit.riskRevision?.revisedControlRating || 1,
          revised_consequence_rating:
            riskToEdit.riskRevision?.revisedConsequenceRating || 1,
          revised_likelihood_rating:
            riskToEdit.riskRevision?.revisedLikelihoodRating || 1,
          residual_risk_rating:
            riskToEdit.riskRevision?.residualRiskRating || 1,
          acceptable_to_risk_owner:
            riskToEdit.riskRevision?.acceptableToOwner || "Y",
        },
        rt_mitigation_plans: {
          further_planned_action:
            riskToEdit.mitigationPlan?.furtherPlannedAction || "",
          policy_lense_task_id: riskToEdit.mitigationPlan?.taskId || "",
          task_description: riskToEdit.mitigationPlan?.taskDescription || "",
          task_owner: riskToEdit.mitigationPlan?.taskOwner || "",
          is_ongoing: riskToEdit.mitigationPlan?.isOngoing || "N",
          planned_completion_date:
            riskToEdit.mitigationPlan?.plannedCompletionDate || "",
          is_recurrent: riskToEdit.mitigationPlan?.isRecurrent || "N",
          frequency: riskToEdit.mitigationPlan?.frequency || null,
        },
      };

      console.log("Setting formData to:", riskDataToSet); // Debugging
      setFormData(riskDataToSet);

      // Force a UI update after setting state
      setTimeout(() => {
        console.log("Current formData after state update:", formData); // Check if formData updated
      }, 100);
    } else if (type === "create") {
      setEditingRisk(null);
      // Reset form data to defaults for Treatment Plan
      setFormData({
        risk_id: "",
        vulnerability_type: "",
        threat_description: "",
        rt_assessment: {
          risk_rating: 1,
          risk_category: "Not Significant",
          department_bu: "",
          risk_mitigation_strategy: "Tolerate",
        },
        rt_revision: {
          applicable_annex_control_number: "",
          meet_legal_requirements: "Y",
          revised_control_rating: 1,
          revised_consequence_rating: 1,
          revised_likelihood_rating: 1,
          residual_risk_rating: 1,
          acceptable_to_risk_owner: "Y",
        },
        rt_mitigation_plans: {
          // Reset as object
          further_planned_action: "",
          policy_lense_task_id: "",
          task_description: "",
          task_owner: "",
          is_ongoing: "N",
          planned_completion_date: "",
          is_recurrent: "N",
          frequency: null,
        },
      });
    } else if (type === "excel") {
      setEditingRisk(null); // Not editing when uploading excel
      // Reset relevant parts of formData if necessary, though excel form is separate
    }
  };

  // Function to close modal
  const closeModal = () => {
    setShowModal(false);
    // setError(null);
    // setSuccessMessage(null);
  };

  // Function to handle form changes
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

  // Function to handle numeric input changes
  const handleNumericChange = (e, section, field) => {
    // Parse value as integer, default to 1 if NaN or less than 1
    const value = parseInt(e.target.value) || 1;
    // Ensure value is at least 1 (or adjust min as needed per field logic, e.g., 0)
    const validatedValue = Math.max(1, value);

    if (section) {
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: validatedValue, // Use validated value
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: validatedValue, // Use validated value
      }));
    }
  };

  // Function to handle select changes
  const handleSelectChange = (e, section, field) => {
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

  // Handle file input change for Excel upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setExcelFile(file);
    }
  };

  // Fetch risks on component mount - now fetches sheets instead
  useEffect(() => {
    if (projectid) {
      fetchSheets(); // Fetches sheets, which then fetches risks for the selected sheet
    }
  }, [projectid]);

  // Function to fetch risks for a specific treatment sheet
  const fetchRisksForSheet = async (sheetId) => {
    setIsLoading(true);
    try {
      const response = await apiRequest(
        "GET",
        `/api/rarpt/treatment-sheets/${sheetId}/risks/`,
        null,
        true
      );

      if (response.data && Array.isArray(response.data)) {
        const formattedRisks = response.data.map((risk) => {
          // rt_mitigation_plans is now expected as an object
          const mitigationPlan = risk.rt_mitigation_plans || {};
          return {
            id: risk.id || "",
            risk_id: risk.risk_id || "",
            vulnerabilityType: risk.vulnerability_type || "Not Specified",
            threatDescription: risk.threat_description || "",
            riskAssessment: {
              riskRating: risk.rt_assessment?.risk_rating || 1,
              riskCategory:
                risk.rt_assessment?.risk_category || "Not Significant",
              departmentBU: risk.rt_assessment?.department_bu || "",
              riskOwner: "", // Not in rt_assessment
              mitigationStrategy:
                risk.rt_assessment?.risk_mitigation_strategy || "Tolerate",
            },
            riskRevision: {
              soaControl:
                risk.rt_revision?.applicable_annex_control_number || "",
              soaControlDesc: "",
              meetsRequirements:
                risk.rt_revision?.meet_legal_requirements || "Y",
              revisedControlRating:
                risk.rt_revision?.revised_control_rating || 1,
              revisedConsequenceRating:
                risk.rt_revision?.revised_consequence_rating || 1,
              revisedLikelihoodRating:
                risk.rt_revision?.revised_likelihood_rating || 1,
              residualRiskRating: risk.rt_revision?.residual_risk_rating || 1,
              acceptableToOwner:
                risk.rt_revision?.acceptable_to_risk_owner || "Y",
            },
            // Map from the rt_mitigation_plans object
            mitigationPlan: {
              furtherPlannedAction: mitigationPlan.further_planned_action || "",
              taskId: mitigationPlan.policy_lense_task_id || "",
              taskDescription: mitigationPlan.task_description || "",
              taskOwner: mitigationPlan.task_owner || "",
              isOngoing: mitigationPlan.is_ongoing || "N",
              plannedCompletionDate:
                mitigationPlan.planned_completion_date || "",
              isRecurrent: mitigationPlan.is_recurrent || "N",
              frequency: mitigationPlan.frequency || "",
            },
            context: risk.context || "",
            applicableActivity: risk.applicable_activity || "",
          };
        });
        setRiskData(formattedRisks);
      } else {
        console.warn("API returned no risks for this sheet or invalid format");
        setRiskData([]);
      }
    } catch (err) {
      console.error("Error fetching treatment risks:", err);
      message.error(err.message || "Failed to fetch treatment risks");
      setRiskData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Submit treatment plan form
  const handleRiskSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSheet) {
      message.error("Please select a treatment report first");
      return;
    }
    setIsLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const apiData = {
        risk_id: formData.risk_id || "RT_" + Date.now(),
        vulnerability_type: formData.vulnerability_type || "Default",
        threat_description: formData.threat_description || "Default",
        rt_assessment: { ...formData.rt_assessment },
        rt_revision: { ...formData.rt_revision },
        // Send rt_mitigation_plans as an object
        rt_mitigation_plans: {
          further_planned_action:
            formData.rt_mitigation_plans.further_planned_action || "",
          policy_lense_task_id:
            formData.rt_mitigation_plans.policy_lense_task_id ||
            "Task_" + Date.now(),
          task_description:
            formData.rt_mitigation_plans.task_description ||
            "Default task description",
          task_owner: formData.rt_mitigation_plans.task_owner || "Admin",
          is_ongoing: formData.rt_mitigation_plans.is_ongoing || "N",
          planned_completion_date:
            formData.rt_mitigation_plans.planned_completion_date || today,
          is_recurrent: formData.rt_mitigation_plans.is_recurrent || "N",
          frequency: formData.rt_mitigation_plans.frequency || null,
        },
      };

      const response = await apiRequest(
        "POST",
        `/api/rarpt/treatment-sheets/${selectedSheet.id}/risks/create/`,
        apiData,
        true
      );

      if (response.status === 200 || response.status === 201) {
        message.success("Report created successfully");
        await fetchRisksForSheet(selectedSheet.id);
        closeModal(); // Close modal immediately after success
      }
    } catch (err) {
      console.error("Error creating report:", err);
      message.error(err.message || "Failed to create report");
    } finally {
      setIsLoading(false);
    }
  };

  // Update existing treatment plan
  const handleRiskUpdate = async (e) => {
    e.preventDefault();
    if (!selectedSheet || !editingRisk) {
      message.error("Report or treatment plan not selected");
      return;
    }
    setIsLoading(true);
    try {
      // Construct the API payload based on the required structure
      const apiData = {
        risk_id: formData.risk_id || editingRisk.risk_id, // Prefer formData, fallback to original
        vulnerability_type:
          formData.vulnerability_type || editingRisk.vulnerabilityType,
        threat_description:
          formData.threat_description || editingRisk.threatDescription,

        // Map rt_assessment from formData
        rt_assessment: {
          risk_rating: formData.rt_assessment.risk_rating,
          risk_category: formData.rt_assessment.risk_category, // This is calculated, ensure it's up-to-date
          department_bu: formData.rt_assessment.department_bu,
          risk_mitigation_strategy:
            formData.rt_assessment.risk_mitigation_strategy,
        },

        // Map rt_revision from formData
        rt_revision: {
          applicable_annex_control_number:
            formData.rt_revision.applicable_annex_control_number,
          meet_legal_requirements: formData.rt_revision.meet_legal_requirements,
          revised_control_rating: formData.rt_revision.revised_control_rating,
          revised_consequence_rating:
            formData.rt_revision.revised_consequence_rating,
          revised_likelihood_rating:
            formData.rt_revision.revised_likelihood_rating,
          residual_risk_rating: formData.rt_revision.residual_risk_rating, // This is calculated
          acceptable_to_risk_owner:
            formData.rt_revision.acceptable_to_risk_owner,
        },

        // Map rt_mitigation_plans object from formData
        rt_mitigation_plans: {
          further_planned_action:
            formData.rt_mitigation_plans.further_planned_action,
          policy_lense_task_id:
            formData.rt_mitigation_plans.policy_lense_task_id,
          task_description: formData.rt_mitigation_plans.task_description,
          task_owner: formData.rt_mitigation_plans.task_owner,
          is_ongoing: formData.rt_mitigation_plans.is_ongoing,
          planned_completion_date:
            formData.rt_mitigation_plans.planned_completion_date,
          is_recurrent: formData.rt_mitigation_plans.is_recurrent,
          frequency: formData.rt_mitigation_plans.frequency,
        },
      };

      const response = await apiRequest(
        "PUT", // Ensure PUT method is used
        `/api/rarpt/treatment-risks/${editingRisk.id}/`, // Correct endpoint for update
        apiData, // Send the structured data
        true
      );

      if (response.status === 200 || response.status === 204) {
        message.success("Treatment plan updated successfully");
        await fetchRisksForSheet(selectedSheet.id);
        closeModal(); // Close modal immediately after success
      }
    } catch (err) {
      console.error("Error updating treatment plan:", err);
      message.error(err.message || "Failed to update treatment plan");
    } finally {
      setIsLoading(false);
    }
  };

  // Submit excel file for treatment plans
  const handleExcelSubmit = async (e) => {
    e.preventDefault();

    if (!excelFile) {
      message.error("Please select an Excel file");
      return;
    }

    if (!selectedSheet) {
      message.error("Please select a treatment Report first");
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", excelFile);

      // Use the API endpoint for uploading treatment plans via Excel
      const response = await apiRequest(
        "POST",
        `/api/rarpt/treatment-sheets/${selectedSheet.id}/risks/create/`,
        formData,
        true
      );

      if (response.status === 200 || response.status === 201) {
        message.success("Excel file uploaded successfully.");
        // Refresh the treatment plan list
        await fetchRisksForSheet(selectedSheet.id);
        // Close modal immediately after success
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
      setExcelFile(null); // Reset file state
    }
  };

  // Delete a treatment plan - Assuming DELETE on /api/rarpt/treatment-risks/<risk_id>/
  const handleDeleteRisk = async (riskId) => {
    openConfirmModal({
      title: "Confirm Treatment Plan Deletion",
      message:
        "Are you sure you want to delete this treatment plan? This action cannot be undone.",
      onConfirm: async () => {
        closeConfirmModal();
        setIsLoading(true);
        try {
          await apiRequest(
            "DELETE",
            `/api/rarpt/treatment-risks/${riskId}/`,
            null,
            true
          );
          message.success("Treatment plan deleted successfully");
          if (selectedSheet) {
            await fetchRisksForSheet(selectedSheet.id);
          }
        } catch (err) {
          console.error("Error deleting risk:", err);
          message.error(err.message || "Failed to delete treatment plan");
        } finally {
          setIsLoading(false);
        }
      },
      onClose: closeConfirmModal,
    });
  };

  // Function to fetch all treatment sheets for current project
  const fetchSheets = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest(
        "GET",
        `/api/rarpt/project/${projectid}/treatment-sheets/`,
        null,
        true
      );

      if (response.data && Array.isArray(response.data)) {
        setSheets(response.data);
        if (response.data.length > 0 && !selectedSheet) {
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
      console.error("Error fetching treatment reports:", err);
      message.error(err.message || "Failed to fetch treatment reports");
      setSheets([]);
      setRiskData([]);
      setSelectedSheet(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to create a new treatment sheet
  const createSheet = async () => {
    if (!newSheetName.trim()) {
      message.error("Report name cannot be empty");
      return;
    }
    setIsLoading(true);
    try {
      const response = await apiRequest(
        "POST",
        `/api/rarpt/project/${projectid}/treatment-sheets/create/`,
        { name: newSheetName.trim() },
        true
      );
      message.success("Report created successfully");
      setNewSheetName("");
      setShowSheetModal(false);
      await fetchSheets(); // Refresh sheet list
      if (response.data) {
        const newSheet = response.data;
        if (newSheet) {
          setSelectedSheet(newSheet);
          await fetchRisksForSheet(newSheet.id);
        }
      }
    } catch (err) {
      console.error("Error creating treatment report:", err);
      message.error(err.message || "Failed to create treatment report");
    } finally {
      setIsLoading(false);
    }
  };

  // Updated deleteSheet to handle modal later
  const deleteSheet = async (sheetId, sheetName, riskCount) => {
    openConfirmModal({
      title: "Confirm Report Deletion",
      message: `Are you sure you want to delete the report "${sheetName}"? This will also delete ${riskCount} associated treatment plans. This action cannot be undone.`,
      onConfirm: async () => {
        closeConfirmModal();
        setIsLoading(true);
        try {
          await apiRequest(
            "DELETE",
            `/api/rarpt/treatment-sheets/${sheetId}/`, // Endpoint for deleting treatment sheets
            null,
            true
          );
          message.success("Report deleted successfully");

          // Fetch updated treatment sheets list *after* deletion
          const response = await apiRequest(
            "GET",
            `/api/rarpt/project/${projectid}/treatment-sheets/`, // Endpoint for fetching treatment sheets
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
              await fetchRisksForSheet(nextSheet.id); // Fetch treatment plans for the new sheet
            } else {
              // No sheets left
              setSelectedSheet(null);
              setRiskData([]); // Clear treatment plan data
            }
          } else {
            // If a different sheet was deleted, just update the list
            // The current selection remains valid
          }
        } catch (err) {
          console.error(
            "Error deleting or fetching treatment reports after deletion:",
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

  // Function to toggle the legends modal
  const toggleLegendsModal = () => {
    setShowLegendsModal(!showLegendsModal);
  };

  // --- Modal Control Functions ---
  const openConfirmModal = (props) => {
    setConfirmModalProps(props);
    setShowConfirmModal(true);
  };

  const closeConfirmModal = () => {
    setShowConfirmModal(false);
    setConfirmModalProps({
      onConfirm: () => { },
      title: "Confirm Action",
      message: "Are you sure?",
    }); // Reset
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 p-2 bg-white sticky top-0 z-10 shadow-sm">
        <div className="flex items-center">
          <h2 className="text-xl font-bold text-slate-800">Risk Treatment Plans</h2>
          <div className="ml-3 text-slate-600 font-medium bg-indigo-50 px-3 py-1 rounded-full">
            {riskData.length}
          </div>

          {/* Report Selection Dropdown */}
          {sheets.length > 0 && (
            <div className="ml-4 flex items-center">
              <label className="text-sm font-medium text-gray-700 mr-2">
                Report:
              </label>
              <select
                value={selectedSheet ? selectedSheet.id : ""}
                onChange={(e) => handleSheetChange(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white shadow-sm min-w-[200px]"
              >
                {sheets.map((sheet) => (
                  <option key={sheet.id} value={sheet.id}>
                    {sheet.name}
                  </option>
                ))}
                <option value="create" className="font-semibold text-indigo-600">
                  + Create New Report
                </option>
              </select>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Action buttons section */}
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
            onClick={() => openModal("create")}
          >
            <Plus size={18} className="mr-1" /> Add Risk
          </button>
          <button
            className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 flex items-center"
            onClick={() => openModal("excel")}
          >
            <Upload size={18} className="mr-1" /> Upload Excel
          </button>
          <button
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors shadow-md flex items-center"
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

      {isLoading && (
        <div className="flex justify-center items-center py-1">
          <div className="loader ease-linear rounded-full border-4 border-t-4 border-slate-200 h-12 w-12 border-t-indigo-500 animate-spin"></div>
        </div>
      )}

      {/* Empty state when no sheets are available */}
      {!isLoading && sheets.length === 0 && (
        <div className="flex flex-col items-center justify-center p-10 text-center border-t border-slate-200 min-h-[300px] bg-white rounded-lg shadow-sm mt-2 mx-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-20 h-20 text-gray-400 mb-4 animate-pulse"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z"
            />
          </svg>

          <h3 className="text-2xl font-medium text-gray-700 mb-2">
            No Treatment Reports Available
          </h3>
          <p className="text-gray-500 mb-8 max-w-md">
            Get started by creating a new treatment report to organize your treatment plans.
          </p>
          <button
            onClick={() => setShowSheetModal(true)}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all shadow-md flex items-center transform hover:scale-105 hover:shadow-lg duration-200"
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
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
            <span>Create New Report</span>
          </button>
        </div>
      )}

      {/* Risk Treatment Table or Empty State - Only show if sheet is selected */}
      {selectedSheet && !isLoading && (
        <>
          {/* Wrap conditional content in fragment */}
          {riskData.length === 0 ? (
            // Empty Table with Headers - Show when sheet is selected but has no risks
            <div className="overflow-x-auto w-full px-1 pt-1" style={{ maxWidth: "100vw" }}>
              <div className="inline-block min-w-full whitespace-nowrap">
                <table className="border-collapse shadow-lg rounded-lg overflow-hidden">
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
                        Threat Description
                      </th>

                      {/* Risk Assessment column group */}
                      <th
                        className="border border-slate-200 bg-slate-700 text-white p-3.5 cursor-pointer font-semibold hover:bg-slate-800 transition-colors duration-300"
                        onClick={() => toggleGroup("riskAssessment")}
                        colSpan={expandedGroups.riskAssessment ? 4 : 1}
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
                        colSpan={expandedGroups.riskRevision ? 7 : 1}
                      >
                        <div className="flex items-center justify-center">
                          <span>Risk Revision</span>
                          {renderExpandIcon(expandedGroups.riskRevision)}
                        </div>
                      </th>

                      {/* Risk Mitigation Plan column group */}
                      <th
                        className="border border-slate-200 bg-green-600 text-white p-3.5 cursor-pointer font-semibold hover:bg-green-700 transition-colors duration-300"
                        onClick={() => toggleGroup("mitigationPlan")}
                        colSpan={expandedGroups.mitigationPlan ? 8 : 1}
                      >
                        <div className="flex items-center justify-center">
                          <span>Risk Mitigation Plan</span>
                          {renderExpandIcon(expandedGroups.mitigationPlan)}
                        </div>
                      </th>
                    </tr>

                    {/* Second row for subheaders */}
                    <tr className="bg-slate-50">
                      <th className="border border-slate-200 p-3 font-medium"></th>
                      {/* Actions */}
                      <th className="border border-slate-200 p-3 font-medium"></th>
                      {/* Risk ID */}
                      <th className="border border-slate-200 p-3 font-medium"></th>
                      {/* Vuln Type */}
                      <th className="border border-slate-200 p-3 font-medium"></th>
                      {/* Threat Desc */}
                      {/* rt_assessment subheaders */}
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
                            Risk Mitigation Strategy
                          </th>
                        </>
                      ) : (
                        <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white"></th>
                      )}
                      {/* rt_revision subheaders */}
                      {expandedGroups.riskRevision ? (
                        <>
                          <th className="border border-slate-200 p-3 font-medium bg-indigo-100 transition-all duration-300">
                            Applicable Annex Control No.
                          </th>
                          <th className="border border-slate-200 p-3 font-medium bg-indigo-100 transition-all duration-300">
                            Meet Legal Requirements? (Y/N)
                          </th>
                          <th className="border border-slate-200 p-3 font-medium bg-indigo-100 transition-all duration-300">
                            Revised Control Rating
                          </th>
                          <th className="border border-slate-200 p-3 font-medium bg-indigo-100 transition-all duration-300">
                            Revised Consequence Rating
                          </th>
                          <th className="border border-slate-200 p-3 font-medium bg-indigo-100 transition-all duration-300">
                            Revised Likelihood Rating
                          </th>
                          <th className="border border-slate-200 p-3 font-medium bg-indigo-100 transition-all duration-300">
                            Residual Risk Rating
                          </th>
                          <th className="border border-slate-200 p-3 font-medium bg-indigo-100 transition-all duration-300">
                            Acceptable to Risk Owner? (Y/N)
                          </th>
                        </>
                      ) : (
                        <th className="border border-slate-200 p-3 font-medium bg-indigo-100"></th>
                      )}
                      {/* rt_mitigation_plans subheaders */}
                      {expandedGroups.mitigationPlan ? (
                        <>
                          <th className="border border-slate-200 p-3 font-medium bg-green-100 transition-all duration-300">
                            Further Planned Action
                          </th>
                          <th className="border border-slate-200 p-3 font-medium bg-green-100 transition-all duration-300">
                            Policy Lense Task ID
                          </th>
                          <th className="border border-slate-200 p-3 font-medium bg-green-100 transition-all duration-300">
                            Task Description
                          </th>
                          <th className="border border-slate-200 p-3 font-medium bg-green-100 transition-all duration-300">
                            Task Owner
                          </th>
                          <th className="border border-slate-200 p-3 font-medium bg-green-100 transition-all duration-300">
                            Ongoing Task? (Y/N)
                          </th>
                          <th className="border border-slate-200 p-3 font-medium bg-green-100 transition-all duration-300">
                            Planned Completion Date
                          </th>
                          <th className="border border-slate-200 p-3 font-medium bg-green-100 transition-all duration-300">
                            Recurrent Task? (Y/N)
                          </th>
                          <th className="border border-slate-200 p-3 font-medium bg-green-100 transition-all duration-300">
                            Frequency
                          </th>
                        </>
                      ) : (
                        <th className="border border-slate-200 p-3 font-medium bg-green-100"></th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Empty tbody for the empty state */}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            // Existing Table Rendering
            <div
              className="overflow-x-auto w-full px-1 pt-1"
              style={{ maxWidth: "100vw" }}
            >
              <div className="inline-block min-w-full whitespace-nowrap">
                <table className="border-collapse shadow-lg rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-slate-100">
                      {/* Action column */}
                      <th className="border border-slate-200 p-3.5 text-left text-slate-700 font-semibold bg-slate-50">
                        Actions
                      </th>

                      {/* Basic columns - Adjust based on what needs to be shown */}
                      <th className="border border-slate-200 p-3.5 text-left text-slate-700 font-semibold bg-slate-50">
                        Risk ID
                      </th>
                      <th className="border border-slate-200 p-3.5 text-left text-slate-700 font-semibold bg-slate-50">
                        Vulnerability Type
                      </th>
                      <th className="border border-slate-200 p-3.5 text-left text-slate-700 font-semibold bg-slate-50">
                        Threat Description
                      </th>
                      {/* Remove columns not present in rt_ data if necessary */}
                      {/* <th className="border border-slate-200 p-3.5 text-left text-slate-700 font-semibold bg-slate-50">Context</th> */}
                      {/* <th className="border border-slate-200 p-3.5 text-left text-slate-700 font-semibold bg-slate-50">Applicable Activity</th> */}

                      {/* Risk Assessment column group (from rt_assessment) */}
                      <th
                        className="border border-slate-200 bg-slate-700 text-white p-3.5 cursor-pointer font-semibold hover:bg-slate-800 transition-colors duration-300"
                        onClick={() => toggleGroup("riskAssessment")} // Keep state key or update if needed
                        colSpan={expandedGroups.riskAssessment ? 4 : 1} // Adjusted colspan
                      >
                        <div className="flex items-center justify-center">
                          <span>Risk Assessment</span>
                          {renderExpandIcon(expandedGroups.riskAssessment)}
                        </div>
                      </th>

                      {/* Risk Revision column group (from rt_revision) */}
                      <th
                        className="border border-slate-200 bg-indigo-600 text-white p-3.5 cursor-pointer font-semibold hover:bg-indigo-700 transition-colors duration-300"
                        onClick={() => toggleGroup("riskRevision")} // Keep state key or update if needed
                        colSpan={expandedGroups.riskRevision ? 7 : 1} // Adjusted colspan
                      >
                        <div className="flex items-center justify-center">
                          <span>Risk Revision</span>
                          {renderExpandIcon(expandedGroups.riskRevision)}
                        </div>
                      </th>

                      {/* Risk Mitigation Plan column group (from rt_mitigation_plans) */}
                      <th
                        className="border border-slate-200 bg-green-600 text-white p-3.5 cursor-pointer font-semibold hover:bg-green-700 transition-colors duration-300"
                        onClick={() => toggleGroup("mitigationPlan")} // Keep state key or update if needed
                        colSpan={expandedGroups.mitigationPlan ? 8 : 1} // Adjusted colspan
                      >
                        <div className="flex items-center justify-center">
                          <span>Risk Mitigation Plan</span>
                          {renderExpandIcon(expandedGroups.mitigationPlan)}
                        </div>
                      </th>
                    </tr>

                    {/* Second row for subheaders */}
                    <tr className="bg-slate-50">
                      <th className="border border-slate-200 p-3 font-medium"></th>
                      {/* Actions */}
                      <th className="border border-slate-200 p-3 font-medium"></th>
                      {/* Risk ID */}
                      <th className="border border-slate-200 p-3 font-medium"></th>
                      {/* Vuln Type */}
                      <th className="border border-slate-200 p-3 font-medium"></th>
                      {/* Threat Desc */}
                      {/* rt_assessment subheaders */}
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
                            Risk Mitigation Strategy
                          </th>
                        </>
                      ) : (
                        <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white"></th>
                      )}
                      {/* rt_revision subheaders */}
                      {expandedGroups.riskRevision ? (
                        <>
                          <th className="border border-slate-200 p-3 font-medium bg-indigo-100 transition-all duration-300">
                            Applicable Annex Control No.
                          </th>
                          <th className="border border-slate-200 p-3 font-medium bg-indigo-100 transition-all duration-300">
                            Meet Legal Requirements? (Y/N)
                          </th>
                          <th className="border border-slate-200 p-3 font-medium bg-indigo-100 transition-all duration-300">
                            Revised Control Rating
                          </th>
                          <th className="border border-slate-200 p-3 font-medium bg-indigo-100 transition-all duration-300">
                            Revised Consequence Rating
                          </th>
                          <th className="border border-slate-200 p-3 font-medium bg-indigo-100 transition-all duration-300">
                            Revised Likelihood Rating
                          </th>
                          <th className="border border-slate-200 p-3 font-medium bg-indigo-100 transition-all duration-300">
                            Residual Risk Rating
                          </th>
                          <th className="border border-slate-200 p-3 font-medium bg-indigo-100 transition-all duration-300">
                            Acceptable to Risk Owner? (Y/N)
                          </th>
                        </>
                      ) : (
                        <th className="border border-slate-200 p-3 font-medium bg-indigo-100"></th>
                      )}
                      {/* rt_mitigation_plans subheaders */}
                      {expandedGroups.mitigationPlan ? (
                        <>
                          <th className="border border-slate-200 p-3 font-medium bg-green-100 transition-all duration-300">
                            Further Planned Action
                          </th>
                          <th className="border border-slate-200 p-3 font-medium bg-green-100 transition-all duration-300">
                            Policy Lense Task ID
                          </th>
                          <th className="border border-slate-200 p-3 font-medium bg-green-100 transition-all duration-300">
                            Task Description
                          </th>
                          <th className="border border-slate-200 p-3 font-medium bg-green-100 transition-all duration-300">
                            Task Owner
                          </th>
                          <th className="border border-slate-200 p-3 font-medium bg-green-100 transition-all duration-300">
                            Ongoing Task? (Y/N)
                          </th>
                          <th className="border border-slate-200 p-3 font-medium bg-green-100 transition-all duration-300">
                            Planned Completion Date
                          </th>
                          <th className="border border-slate-200 p-3 font-medium bg-green-100 transition-all duration-300">
                            Recurrent Task? (Y/N)
                          </th>
                          <th className="border border-slate-200 p-3 font-medium bg-green-100 transition-all duration-300">
                            Frequency
                          </th>
                        </>
                      ) : (
                        <th className="border border-slate-200 p-3 font-medium bg-green-100"></th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(riskData) &&
                      riskData.map((risk, index) => (
                        <tr
                          key={risk.id}
                          className={
                            index % 2 === 0
                              ? "bg-white hover:bg-indigo-50 transition-colors duration-150"
                              : "bg-slate-50 hover:bg-indigo-50 transition-colors duration-150"
                          }
                        >
                          {/* Action buttons - Link to openModal with type 'edit' or 'view' */}
                          <td className="border border-slate-200 p-3">
                            <div className="flex space-x-2">
                              <button
                                className="p-1 bg-blue-100 rounded hover:bg-blue-200 transition-colors"
                                title="View Treatment Plan"
                                onClick={() => openModal("view", risk)} // Pass risk object
                              >
                                {/* View Icon */}
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={1.5}
                                  stroke="currentColor"
                                  className="w-5 h-5 text-blue-600"
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
                                className="p-1 bg-blue-100 rounded hover:bg-blue-200 transition-colors"
                                title="Edit Treatment Plan"
                                onClick={() => openModal("edit", risk)} // Pass risk object
                              >
                                {/* Edit Icon */}
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={1.5}
                                  stroke="currentColor"
                                  className="w-5 h-5 text-blue-600"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                                  />
                                </svg>
                              </button>
                              <button
                                className="p-1 bg-red-100 rounded hover:bg-red-200 transition-colors"
                                title="Delete"
                                onClick={() => handleDeleteRisk(risk.id)}
                              >
                                {/* Delete Icon */}
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={1.5}
                                  stroke="currentColor"
                                  className="w-5 h-5 text-red-600"
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

                          {/* Basic cells */}
                          <td className="border border-slate-200 p-3">
                            {risk.risk_id}
                          </td>
                          <td className="border border-slate-200 p-3">
                            {risk.vulnerabilityType}
                          </td>
                          <td className="border border-slate-200 p-3">
                            {risk.threatDescription}
                          </td>

                          {/* rt_assessment cells */}
                          {expandedGroups.riskAssessment ? (
                            <>
                              <td
                                className={`border border-slate-200 p-3 text-center ${getRatingColor(
                                  risk.riskAssessment.riskRating
                                )}`}
                              >
                                {risk.riskAssessment.riskRating}
                              </td>
                              <td className="border border-slate-200 p-3 bg-slate-50">
                                {risk.riskAssessment.riskCategory}
                              </td>
                              <td className="border border-slate-200 p-3 bg-slate-50">
                                {risk.riskAssessment.departmentBU}
                              </td>
                              <td className="border border-slate-200 p-3 bg-slate-50">
                                {risk.riskAssessment.mitigationStrategy}
                              </td>
                            </>
                          ) : (
                            <td
                              className={`border border-slate-200 p-3 text-center ${getRatingColor(
                                risk.riskAssessment.riskRating
                              )}`}
                            >
                              {risk.riskAssessment.riskRating}
                            </td>
                          )}

                          {/* rt_revision cells */}
                          {expandedGroups.riskRevision ? (
                            <>
                              <td className="border border-slate-200 p-3 bg-indigo-50">
                                {risk.riskRevision.soaControl}
                              </td>
                              <td className="border border-slate-200 p-3 text-center bg-indigo-50">
                                {risk.riskRevision.meetsRequirements}
                              </td>
                              <td
                                className={`border border-slate-200 p-3 text-center ${getRatingColor(
                                  risk.riskRevision.revisedControlRating
                                )}`}
                              >
                                {risk.riskRevision.revisedControlRating}
                              </td>
                              <td
                                className={`border border-slate-200 p-3 text-center ${getRatingColor(
                                  risk.riskRevision.revisedConsequenceRating
                                )}`}
                              >
                                {risk.riskRevision.revisedConsequenceRating}
                              </td>
                              <td
                                className={`border border-slate-200 p-3 text-center ${getRatingColor(
                                  risk.riskRevision.revisedLikelihoodRating
                                )}`}
                              >
                                {risk.riskRevision.revisedLikelihoodRating}
                              </td>
                              <td
                                className={`border border-slate-200 p-3 text-center ${getRatingColor(
                                  risk.riskRevision.residualRiskRating
                                )}`}
                              >
                                {risk.riskRevision.residualRiskRating}
                              </td>
                              <td className="border border-slate-200 p-3 text-center bg-indigo-50">
                                {risk.riskRevision.acceptableToOwner}
                              </td>
                            </>
                          ) : (
                            <td
                              className={`border border-slate-200 p-3 text-center bg-indigo-50 ${getRatingColor(
                                risk.riskRevision.residualRiskRating
                              )}`}
                            >
                              RR: {risk.riskRevision.residualRiskRating}
                            </td>
                          )}

                          {/* rt_mitigation_plans cells */}
                          {expandedGroups.mitigationPlan ? (
                            <>
                              <td className="border border-slate-200 p-3">
                                {risk.mitigationPlan.furtherPlannedAction}
                              </td>
                              <td className="border border-slate-200 p-3">
                                {risk.mitigationPlan.taskId}
                              </td>
                              <td className="border border-slate-200 p-3">
                                {risk.mitigationPlan.taskDescription}
                              </td>
                              <td className="border border-slate-200 p-3">
                                {risk.mitigationPlan.taskOwner}
                              </td>
                              <td className="border border-slate-200 p-3 text-center">
                                {risk.mitigationPlan.isOngoing}
                              </td>
                              <td className="border border-slate-200 p-3">
                                {risk.mitigationPlan.plannedCompletionDate}
                              </td>
                              <td className="border border-slate-200 p-3 text-center">
                                {risk.mitigationPlan.isRecurrent}
                              </td>
                              <td className="border border-slate-200 p-3">
                                {risk.mitigationPlan.frequency}
                              </td>
                            </>
                          ) : (
                            <td className="border border-slate-200 p-3 text-center">
                              {(
                                risk.mitigationPlan.furtherPlannedAction || ""
                              ).substring(0, 15)}
                              ...
                            </td>
                          )}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </> // Close fragment
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
                      Sheet Name *
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

      {/* Treatment Plan Modal (Add/Edit/View) */}
      {showModal && (
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
              onClick={closeModal}
            ></div>

            {/* Modal panel - Use max-w-5xl for consistency */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full">
              <div className="bg-indigo-50 px-4 py-3 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {modalType === "edit"
                    ? "Edit Treatment Plan"
                    : modalType === "excel"
                      ? "Upload Excel Treatment Data"
                      : modalType === "view"
                        ? "View Treatment Plan"
                        : "New Treatment Plan"}
                </h3>
              </div>
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 max-h-[80vh] overflow-y-auto">
                {/* Form for creating/editing/viewing Treatment Plan */}
                {(modalType === "create" ||
                  modalType === "edit" ||
                  modalType === "view") && (
                    <form className="space-y-6">
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
                              placeholder="e.g., RT_001"
                              disabled={modalType === "view"}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Vulnerability Type
                            </label>
                            <input
                              type="text"
                              value={formData.vulnerability_type}
                              onChange={(e) =>
                                handleFormChange(e, null, "vulnerability_type")
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              disabled={modalType === "view"}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Threat Description
                            </label>
                            <textarea
                              value={formData.threat_description}
                              onChange={(e) =>
                                handleFormChange(e, null, "threat_description")
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              rows="2"
                              disabled={modalType === "view"}
                            ></textarea>
                          </div>
                        </div>
                      </div>

                      {/* Risk Assessment (rt_assessment) */}
                      <div className="bg-slate-100 p-4 rounded-md">
                        <h4 className="text-lg font-medium mb-4 text-slate-800">
                          Risk Assessment
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Risk Rating
                            </label>
                            {/* Assuming this is manually entered or fetched, not calculated here */}
                            <input
                              type="number"
                              min="1"
                              value={formData.rt_assessment.risk_rating}
                              onChange={(e) =>
                                handleNumericChange(
                                  e,
                                  "rt_assessment",
                                  "risk_rating"
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              disabled={modalType === "view"}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Risk Category
                            </label>
                            {/* Make Category disabled and limit options */}
                            <select
                              value={formData.rt_assessment.risk_category}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-100 appearance-none"
                              disabled
                            >
                              <option value="Not Significant">
                                Not Significant
                              </option>
                              <option value="Significant">Significant</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Department/BU
                            </label>
                            <input
                              type="text"
                              value={formData.rt_assessment.department_bu}
                              onChange={(e) =>
                                handleFormChange(
                                  e,
                                  "rt_assessment",
                                  "department_bu"
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              disabled={modalType === "view"}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Mitigation Strategy
                            </label>
                            <select
                              value={
                                formData.rt_assessment.risk_mitigation_strategy
                              }
                              onChange={(e) =>
                                handleSelectChange(
                                  e,
                                  "rt_assessment",
                                  "risk_mitigation_strategy"
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

                      {/* Risk Revision (rt_revision) */}
                      <div className="bg-indigo-50 p-4 rounded-md">
                        <h4 className="text-lg font-medium mb-4 text-indigo-800">
                          Risk Revision
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Applicable Annex Control No.
                            </label>
                            <input
                              type="text"
                              value={
                                formData.rt_revision
                                  .applicable_annex_control_number
                              }
                              onChange={(e) =>
                                handleFormChange(
                                  e,
                                  "rt_revision",
                                  "applicable_annex_control_number"
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              disabled={modalType === "view"}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Meet Legal Requirements? (Y/N)
                            </label>
                            <select
                              value={formData.rt_revision.meet_legal_requirements}
                              onChange={(e) =>
                                handleSelectChange(
                                  e,
                                  "rt_revision",
                                  "meet_legal_requirements"
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
                              Revised Control Rating
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="5"
                              value={formData.rt_revision.revised_control_rating}
                              onChange={(e) =>
                                handleNumericChange(
                                  e,
                                  "rt_revision",
                                  "revised_control_rating"
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              disabled={modalType === "view"}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Revised Consequence Rating
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="5"
                              value={
                                formData.rt_revision.revised_consequence_rating
                              }
                              onChange={(e) =>
                                handleNumericChange(
                                  e,
                                  "rt_revision",
                                  "revised_consequence_rating"
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              disabled={modalType === "view"}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Revised Likelihood Rating
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="5"
                              value={
                                formData.rt_revision.revised_likelihood_rating
                              }
                              onChange={(e) =>
                                handleNumericChange(
                                  e,
                                  "rt_revision",
                                  "revised_likelihood_rating"
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
                            {/* Make Residual Risk disabled */}
                            <input
                              type="number"
                              min="1"
                              value={formData.rt_revision.residual_risk_rating}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-100"
                              readOnly
                              disabled
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Acceptable to Risk Owner? (Y/N)
                            </label>
                            <select
                              value={
                                formData.rt_revision.acceptable_to_risk_owner
                              }
                              onChange={(e) =>
                                handleSelectChange(
                                  e,
                                  "rt_revision",
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

                      {/* Risk Mitigation Plan (rt_mitigation_plans - Object) */}
                      <div className="bg-green-50 p-4 rounded-md">
                        <h4 className="text-lg font-medium mb-4 text-green-800">
                          Risk Mitigation Plan
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Further Planned Action
                            </label>
                            <textarea
                              value={
                                formData.rt_mitigation_plans
                                  .further_planned_action
                              }
                              onChange={(e) =>
                                handleFormChange(
                                  e,
                                  "rt_mitigation_plans",
                                  "further_planned_action"
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              rows="2"
                              disabled={modalType === "view"}
                            ></textarea>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Policy Lense Task ID
                            </label>
                            <input
                              type="text"
                              value={
                                formData.rt_mitigation_plans.policy_lense_task_id
                              }
                              onChange={(e) =>
                                handleFormChange(
                                  e,
                                  "rt_mitigation_plans",
                                  "policy_lense_task_id"
                                )
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
                              value={
                                formData.rt_mitigation_plans.task_description
                              }
                              onChange={(e) =>
                                handleFormChange(
                                  e,
                                  "rt_mitigation_plans",
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
                              value={formData.rt_mitigation_plans.task_owner}
                              onChange={(e) =>
                                handleFormChange(
                                  e,
                                  "rt_mitigation_plans",
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
                              value={formData.rt_mitigation_plans.is_ongoing}
                              onChange={(e) =>
                                handleSelectChange(
                                  e,
                                  "rt_mitigation_plans",
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
                                formData.rt_mitigation_plans
                                  .planned_completion_date
                              }
                              onChange={(e) =>
                                handleFormChange(
                                  e,
                                  "rt_mitigation_plans",
                                  "planned_completion_date"
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              disabled={modalType === "view"}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Recurrent Task? (Y/N)
                            </label>
                            <select
                              value={formData.rt_mitigation_plans.is_recurrent}
                              onChange={(e) =>
                                handleSelectChange(
                                  e,
                                  "rt_mitigation_plans",
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
                              Frequency (if recurrent)
                            </label>
                            <input
                              type="text"
                              value={formData.rt_mitigation_plans.frequency || ""}
                              onChange={(e) =>
                                handleFormChange(
                                  e,
                                  "rt_mitigation_plans",
                                  "frequency"
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              placeholder="e.g., Monthly, Weekly"
                              disabled={
                                modalType === "view" ||
                                formData.rt_mitigation_plans.is_recurrent === "N"
                              }
                            />
                          </div>
                        </div>
                      </div>

                      {/* Submit/Cancel Buttons */}
                      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                        <button
                          type="button"
                          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          onClick={closeModal}
                        >
                          Cancel
                        </button>
                        {modalType !== "view" && (
                          <button
                            type="button"
                            className="px-4 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                            onClick={
                              modalType === "edit"
                                ? handleRiskUpdate
                                : handleRiskSubmit
                            }
                          >
                            {modalType === "edit" ? "Update Plan" : "Save Plan"}
                          </button>
                        )}
                      </div>
                    </form>
                  )}

                {/* Form for uploading Excel */}
                {modalType === "excel" && (
                  <form className="space-y-6">
                    {/* Download Template Section */}
                    <div className="bg-blue-50 p-4 rounded-md mb-5">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-0.5">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-5 h-5 text-blue-600"
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
                              before submitting your treatment plan data.
                            </p>
                          </div>
                          <div className="mt-3">
                            <a
                              href="/risk_treatment_template.xlsx"
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
                              Download Treatment Plan Template
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
                          stroke="currentColor"
                          className="mx-auto h-12 w-12 text-blue-500"
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
                          Upload a .xlsx or .xls file with multiple treatment
                          plans.
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
                              onChange={handleFileChange} // Ensure this uses the new function
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    {excelFile && (
                      <div className="mt-4 flex items-center justify-center text-sm">
                        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
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
                        type="button"
                        className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        onClick={handleExcelSubmit} // Use the new function
                        disabled={!excelFile || isLoading} // Disable if no file or loading
                      >
                        {isLoading ? "Uploading..." : "Upload Treatment Data"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Legends Modal */}
      <LegendsModal isOpen={showLegendsModal} onClose={toggleLegendsModal} />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={closeConfirmModal}
        onConfirm={confirmModalProps.onConfirm} // Pass the onConfirm from state
        title={confirmModalProps.title}
        message={confirmModalProps.message}
      />
    </>
  );
};

export default RiskTreatment;
