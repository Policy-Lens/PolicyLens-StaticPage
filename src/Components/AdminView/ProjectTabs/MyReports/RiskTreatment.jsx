import React, { useState, useEffect, useCallback, useRef } from "react";
import { FilePlus, FileUp, Plus, Upload, Trash2, Edit, Eye, Download, X } from "lucide-react";
import { apiRequest } from "../../../../utils/api";
import { useParams } from "react-router-dom";
import LegendsModal from "./LegendsModal";
import { message } from "antd";
import UnifiedUploadModal from "./UnifiedUploadModal";
import ConfirmationModal from "./ConfirmationModal";
import { getRatingColor, getImpactColor } from "./colorUtils";
import { toggleGroup, renderExpandIcon } from "./uiUtils.jsx";

// ConfirmationModal component is now imported from shared component



const RiskTreatment = ({ reportId, projectId, specificReportMode = false }) => {
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
  
  // Use props if provided, otherwise fall back to URL params
  const effectiveProjectId = projectId || projectid;
  const effectiveReportId = reportId;

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

  // State for vulnerability types
  const [vulnerabilityTypes, setVulnerabilityTypes] = useState([]);
  const [loadingVulnerabilityTypes, setLoadingVulnerabilityTypes] = useState(false);

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

  // Add ref to track if we've already selected a sheet to prevent infinite loops
  const hasSelectedSheet = useRef(false);

  // Add drag scrolling state and refs
  const tableContainerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Mouse event handlers for drag scrolling
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - tableContainerRef.current.offsetLeft);
    setScrollLeft(tableContainerRef.current.scrollLeft);
    tableContainerRef.current.style.cursor = 'grabbing';
    tableContainerRef.current.style.userSelect = 'none';
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    if (tableContainerRef.current) {
      tableContainerRef.current.style.cursor = 'grab';
      tableContainerRef.current.style.userSelect = 'auto';
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (tableContainerRef.current) {
      tableContainerRef.current.style.cursor = 'grab';
      tableContainerRef.current.style.userSelect = 'auto';
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - tableContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    tableContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  // Fetch vulnerability types when selected sheet changes
  useEffect(() => {
    if (selectedSheet) {
      fetchVulnerabilityTypes();
    }
  }, [selectedSheet]);

  // Fetch vulnerability types
  const fetchVulnerabilityTypes = async () => {
    if (!selectedSheet) return;
    
    setLoadingVulnerabilityTypes(true);
    try {
      const response = await apiRequest(
        'GET',
        `/api/rarpt/vulnerability-types/?report_type=treatment&report_id=${selectedSheet.id}&project_id=${effectiveProjectId}`,
        null,
        true
      );
      if (response && response.data && response.data.vulnerability_types) {
        setVulnerabilityTypes(response.data.vulnerability_types);
      }
    } catch (error) {
      console.error('Error fetching vulnerability types:', error);
      // Fallback to some common types if API fails
      setVulnerabilityTypes([
        "Access card left unattended",
        "Clear desk and screen policy not adhered",
        "Unlocked screen",
        "Weak password policy",
        "No multi-factor authentication",
        "Outdated software",
        "Unpatched systems",
        "Social engineering",
        "Phishing attacks",
        "Malware infection",
        "Data breach",
        "Insider threat"
      ]);
    } finally {
      setLoadingVulnerabilityTypes(false);
    }
  };

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
  // UI utility functions are now imported from shared uiUtils.js

  // Color utility functions are now imported from shared colorUtils.js
  const handleToggleGroup = (group) => toggleGroup(expandedGroups, setExpandedGroups, group);

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

  // Memoize fetch functions to prevent unnecessary re-renders
  const fetchRisksForSheet = useCallback(async (sheetId) => {
    if (!sheetId) return;
    
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
  }, []);

  const fetchSheets = useCallback(async () => {
    if (!effectiveProjectId) return;
    
    setIsLoading(true);
    try {
      const response = await apiRequest(
        "GET",
        `/api/rarpt/project/${effectiveProjectId}/treatment-sheets/`,
        null,
        true
      );

      if (response.data && Array.isArray(response.data)) {
        setSheets(response.data);
        
        if (specificReportMode && effectiveReportId) {
          // In specific report mode, find and select the specific report
          const specificSheet = response.data.find(sheet => sheet.id === parseInt(effectiveReportId));
          if (specificSheet) {
            setSelectedSheet(specificSheet);
            hasSelectedSheet.current = true;
            // Call fetchRisksForSheet directly without dependency
            const risksResponse = await apiRequest(
              "GET",
              `/api/rarpt/treatment-sheets/${specificSheet.id}/risks/`,
              null,
              true
            );
            if (risksResponse.data && Array.isArray(risksResponse.data)) {
              const formattedRisks = risksResponse.data.map((risk) => {
                const mitigationPlan = risk.rt_mitigation_plans || {};
                return {
                  id: risk.id || "",
                  risk_id: risk.risk_id || "",
                  vulnerabilityType: risk.vulnerability_type || "Not Specified",
                  threatDescription: risk.threat_description || "",
                  riskAssessment: {
                    riskRating: risk.rt_assessment?.risk_rating || 1,
                    riskCategory: risk.rt_assessment?.risk_category || "Not Significant",
                    departmentBU: risk.rt_assessment?.department_bu || "",
                    riskOwner: "",
                    mitigationStrategy: risk.rt_assessment?.risk_mitigation_strategy || "Tolerate",
                  },
                  riskRevision: {
                    soaControl: risk.rt_revision?.applicable_annex_control_number || "",
                    soaControlDesc: "",
                    meetsRequirements: risk.rt_revision?.meet_legal_requirements || "Y",
                    revisedControlRating: risk.rt_revision?.revised_control_rating || 1,
                    revisedConsequenceRating: risk.rt_revision?.revised_consequence_rating || 1,
                    revisedLikelihoodRating: risk.rt_revision?.revised_likelihood_rating || 1,
                    residualRiskRating: risk.rt_revision?.residual_risk_rating || 1,
                    acceptableToOwner: risk.rt_revision?.acceptable_to_risk_owner || "Y",
                  },
                  mitigationPlan: {
                    furtherPlannedAction: mitigationPlan.further_planned_action || "",
                    taskId: mitigationPlan.policy_lense_task_id || "",
                    taskDescription: mitigationPlan.task_description || "",
                    taskOwner: mitigationPlan.task_owner || "",
                    isOngoing: mitigationPlan.is_ongoing || "N",
                    plannedCompletionDate: mitigationPlan.planned_completion_date || "",
                    isRecurrent: mitigationPlan.is_recurrent || "N",
                    frequency: mitigationPlan.frequency || "",
                  },
                  context: risk.context || "",
                  applicableActivity: risk.applicable_activity || "",
                };
              });
              setRiskData(formattedRisks);
            }
          } else {
            message.error("Specified report not found");
            setSelectedSheet(null);
            setRiskData([]);
          }
        } else {
          // Normal mode - auto-select the first sheet if none is selected and we haven't selected one yet
          if (response.data.length > 0 && !selectedSheet && !hasSelectedSheet.current) {
            const sheetToSelect = response.data[0];
            setSelectedSheet(sheetToSelect);
            hasSelectedSheet.current = true;
            // Call fetchRisksForSheet directly without dependency
            const risksResponse = await apiRequest(
              "GET",
              `/api/rarpt/treatment-sheets/${sheetToSelect.id}/risks/`,
              null,
              true
            );
            if (risksResponse.data && Array.isArray(risksResponse.data)) {
              const formattedRisks = risksResponse.data.map((risk) => {
                const mitigationPlan = risk.rt_mitigation_plans || {};
                return {
                  id: risk.id || "",
                  risk_id: risk.risk_id || "",
                  vulnerabilityType: risk.vulnerability_type || "Not Specified",
                  threatDescription: risk.threat_description || "",
                  riskAssessment: {
                    riskRating: risk.rt_assessment?.risk_rating || 1,
                    riskCategory: risk.rt_assessment?.risk_category || "Not Significant",
                    departmentBU: risk.rt_assessment?.department_bu || "",
                    riskOwner: "",
                    mitigationStrategy: risk.rt_assessment?.risk_mitigation_strategy || "Tolerate",
                  },
                  riskRevision: {
                    soaControl: risk.rt_revision?.applicable_annex_control_number || "",
                    soaControlDesc: "",
                    meetsRequirements: risk.rt_revision?.meet_legal_requirements || "Y",
                    revisedControlRating: risk.rt_revision?.revised_control_rating || 1,
                    revisedConsequenceRating: risk.rt_revision?.revised_consequence_rating || 1,
                    revisedLikelihoodRating: risk.rt_revision?.revised_likelihood_rating || 1,
                    residualRiskRating: risk.rt_revision?.residual_risk_rating || 1,
                    acceptableToOwner: risk.rt_revision?.acceptable_to_risk_owner || "Y",
                  },
                  mitigationPlan: {
                    furtherPlannedAction: mitigationPlan.further_planned_action || "",
                    taskId: mitigationPlan.policy_lense_task_id || "",
                    taskDescription: mitigationPlan.task_description || "",
                    taskOwner: mitigationPlan.task_owner || "",
                    isOngoing: mitigationPlan.is_ongoing || "N",
                    plannedCompletionDate: mitigationPlan.planned_completion_date || "",
                    isRecurrent: mitigationPlan.is_recurrent || "N",
                    frequency: mitigationPlan.frequency || "",
                  },
                  context: risk.context || "",
                  applicableActivity: risk.applicable_activity || "",
                };
              });
              setRiskData(formattedRisks);
            }
          }
        }
      } else {
        setSheets([]);
        setSelectedSheet(null);
        setRiskData([]);
      }
    } catch (err) {
      console.error("Error fetching treatment sheets:", err);
      message.error(err.message || "Failed to fetch treatment sheets");
      setSheets([]);
      setSelectedSheet(null);
      setRiskData([]);
    } finally {
      setIsLoading(false);
    }
  }, [effectiveProjectId, effectiveReportId, specificReportMode]);

  // Optimized useEffect - only fetch sheets on projectid change
  useEffect(() => {
    if (effectiveProjectId) {
      hasSelectedSheet.current = false; // Reset selection flag when project changes
      fetchSheets();
    }
  }, [effectiveProjectId, fetchSheets]);

  // Optimized useEffect - only fetch risks when selectedSheet changes
  useEffect(() => {
    if (selectedSheet && selectedSheet.id) {
      setRiskData([]);
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
      fetchRisksForSheet(selectedSheet.id);
    } else {
      setRiskData([]);
    }
  }, [selectedSheet, fetchRisksForSheet]);

  // Submit treatment plan form
  const handleRiskSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSheet) {
      message.error("Please select a treatment report first");
      return;
    }
    
    // Client-side validation for required fields - Only Risk ID is required
    if (!formData.risk_id?.trim()) {
      message.error("Risk ID is required");
      return;
    }
    
    setIsLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const apiData = {
        risk_id: formData.risk_id || "RT_" + Date.now(),
        vulnerability_type: formData.vulnerability_type || "Default",
        threat_description: formData.threat_description || "Default",
        rt_assessment: { 
          ...formData.rt_assessment,
          department_bu: formData.rt_assessment.department_bu || "Default Department"
        },
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
    
    // Client-side validation for required fields - Only Risk ID is required
    if (!formData.risk_id?.trim()) {
      message.error("Risk ID is required");
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
          department_bu: formData.rt_assessment.department_bu || "Default Department",
          risk_mitigation_strategy:
            formData.rt_assessment.risk_mitigation_strategy,
        },

        // Map rt_revision from formData
        rt_revision: {
          applicable_annex_control_number:
            formData.rt_revision.applicable_annex_control_number || "",
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
      };
      
      // Only include rt_mitigation_plans if it has valid data
       const mitigationPlans = formData.rt_mitigation_plans;
       if (mitigationPlans && (
           mitigationPlans.further_planned_action ||
           mitigationPlans.policy_lense_task_id ||
           mitigationPlans.task_description ||
           mitigationPlans.task_owner ||
           mitigationPlans.planned_completion_date
         )) {
         apiData.rt_mitigation_plans = {
           further_planned_action: mitigationPlans.further_planned_action || "",
           policy_lense_task_id: mitigationPlans.policy_lense_task_id || "",
           task_description: mitigationPlans.task_description || "",
           task_owner: mitigationPlans.task_owner || "",
           is_ongoing: mitigationPlans.is_ongoing || "N",
           planned_completion_date: mitigationPlans.planned_completion_date || null,
           is_recurrent: mitigationPlans.is_recurrent || "N",
           frequency: mitigationPlans.frequency || null,
         };
       } else {
         // If no valid data, send empty object to trigger deletion if it exists
         apiData.rt_mitigation_plans = {};
       }

      const response = await apiRequest(
        "PATCH", // Use PATCH method instead of PUT
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
  const handleExcelSubmit = async (file) => {
    if (!file) {
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
      formData.append("file", file);

      // Use the API endpoint for uploading treatment plans via Excel
      const response = await apiRequest(
        "POST",
        `/api/rarpt/treatment-sheets/${selectedSheet.id}/risks/create/`,
        formData,
        true
      );

      if (response.status === 200 || response.status === 207) {
        message.success("Treatment data uploaded successfully");
        setShowModal(false); // Close the modal
        // Immediately refresh risk data for the selected sheet
        if (selectedSheet) {
          await fetchRisksForSheet(selectedSheet.id);
        }
      }
    } catch (err) {
      console.error(
        "Error uploading Excel file:",
        err.message || "Unknown error"
      );
      message.error(err.message || "Failed to upload Excel file");
    } finally {
      setIsLoading(false);
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

  // Function to create a new assessment sheet
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
      
      // Fetch sheets, then select the new one by id
      const sheetsResponse = await apiRequest(
        "GET",
        `/api/rarpt/project/${projectid}/treatment-sheets/`,
        null,
        true
      );
      
      if (sheetsResponse.data && Array.isArray(sheetsResponse.data)) {
        setSheets(sheetsResponse.data);
        const newSheet = sheetsResponse.data.find(s => s.id === response.data.id);
        
        if (newSheet) {
          setSelectedSheet(newSheet);
          setRiskData([]);
          setFormData({ /* ...default form data... */ });
          // Notify parent to open a new tab with unique URL
          if (typeof onReportCreated === 'function') {
            onReportCreated({ id: newSheet.id, type: 'riskTreatment', name: newSheet.name });
          }
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

          // Notify parent component to close any open tabs for this report
          // This assumes that MyReports.jsx has added a prop called onReportDeleted
          if (typeof window !== 'undefined' && window.dispatchEvent) {
            // Create and dispatch a custom event that MyReports component can listen for
            const deleteEvent = new CustomEvent('reportDeleted', {
              detail: {
                reportId: sheetId,
                reportType: 'riskTreatment'
              }
            });
            window.dispatchEvent(deleteEvent);
          }

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
    setSelectedSheet(null);
    setRiskData([]);
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
    if (sheetId) {
      const sheet = sheets.find((s) => s.id === sheetId);
      setSelectedSheet(sheet);
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
          {/* Report Selection Dropdown - Only show if not in specific report mode */}
          {sheets.length > 0 && !specificReportMode && (
            <div className="ml-4 flex items-center">
              <label className="text-sm font-medium text-gray-700 mr-2">
                Report:
              </label>
              <select
                value={selectedSheet ? selectedSheet.id : ""}
                onChange={(e) => handleSheetChange(e.target.value === "create" ? "create" : parseInt(e.target.value))}
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
          
          {/* Show current report name in specific report mode */}
          {specificReportMode && selectedSheet && (
            <div className="ml-4 flex items-center">
              <span className="text-sm font-medium text-gray-700 mr-2">
                Current Report:
              </span>
              <span className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-md text-sm text-indigo-700 font-medium">
                {selectedSheet.name}
              </span>
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
            <div 
              className="overflow-x-auto w-full px-1 pt-1 cursor-grab active:cursor-grabbing select-none" 
              style={{ maxWidth: "100vw" }}
              ref={tableContainerRef}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              onDragStart={(e) => e.preventDefault()}
            >
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
                    onClick={() => handleToggleGroup("riskAssessment")}
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
                        onClick={() => handleToggleGroup("riskRevision")}
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
                    onClick={() => handleToggleGroup("mitigationPlan")}
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
              className="overflow-x-auto w-full px-1 pt-1 cursor-grab active:cursor-grabbing select-none"
              style={{ maxWidth: "100vw" }}
              ref={tableContainerRef}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              onDragStart={(e) => e.preventDefault()}
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
                        onClick={() => handleToggleGroup("riskAssessment")} // Keep state key or update if needed
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
                        onClick={() => handleToggleGroup("riskRevision")} // Keep state key or update if needed
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
                        onClick={() => handleToggleGroup("mitigationPlan")} // Keep state key or update if needed
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
                              ? "bg-white hover:bg-indigo-50 transition-colors duration-150 cursor-pointer"
                              : "bg-slate-50 hover:bg-indigo-50 transition-colors duration-150 cursor-pointer"
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

      {showModal && modalType !== "excel" && (
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
                            <select
                              value={formData.vulnerability_type}
                              onChange={(e) =>
                                handleFormChange(e, null, "vulnerability_type")
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              disabled={modalType === "view" || loadingVulnerabilityTypes}
                            >
                              <option value="">Select vulnerability type</option>
                              {vulnerabilityTypes.map((type, index) => (
                                <option key={index} value={type}>
                                  {type}
                                </option>
                              ))}
                            </select>
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
                              Department/BU <span className="text-red-500">*</span>
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

      {/* Excel Upload Modal */}
      <UnifiedUploadModal
        isOpen={showModal && modalType === "excel"}
        onClose={closeModal}
        onSubmit={handleExcelSubmit}
        isSubmitting={isLoading}
        title="Upload Risk Treatment Excel"
        reportName={selectedSheet?.name}
        fileType="excel"
        showDownloadTemplate={true}
        reportType="risk_treatment"
      />


    </>
  );
};

export default RiskTreatment;
