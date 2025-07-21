import React, { useState, useEffect, useCallback, useRef } from "react";
import { FilePlus, FileUp, Plus, Upload, Trash2, Edit, Eye, Download, X } from "lucide-react";
import { apiRequest } from "../../../../utils/api";
import { useParams } from "react-router-dom";
import LegendsModal from "./LegendsModal";
import { message } from "antd";
import UnifiedUploadModal from "./UnifiedUploadModal";
import ConfirmationModal from "./ConfirmationModal";
import { getRatingColor, getRiskRatingColor, getImpactColor, getResidualRiskColor } from "./colorUtils";
import { toggleGroup, renderExpandIcon } from "./uiUtils.jsx";

// ConfirmationModal component is now imported from shared component



const RiskAssessment = ({ reportId, projectId, specificReportMode = false }) => {
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
    context: "Natural",
    applicable_activity: "",
    // Impact Assessment fields
    ra_impact_assessment: {
      impact_on_confidentiality: "N",
      impact_on_integrity: "N",
      impact_on_availability: "N",
      breach_of_legal_obligation: "N",
      description_of_legal_obligation: "",
      on_customer: 1,
      on_service_capability: 1,
      financial_damage: 1,
      spread_magnitude: 1,
      consequence_rating: 1,
      likelihood_rating: 1,
    },
    // Control Assessment fields
    ra_control_assessment: {
      description: "",
      rating: 1,
    },
    // Risk Assessment fields
    ra_risk_assessment: {
      risk_rating: 1,
      risk_category: "Not Significant",
      department_bu: "",
      risk_owner: "",
      risk_mitigation_strategy: "Tolerate",
    },
    // Risk Revision fields
    ra_risk_revision: {
      applicable_soa_control: "",
      soa_control_description: "",
      planned_controls_meet_requirements: "Y",
      revised_control_rating: 1,
      residual_risk_rating: 1,
      acceptable_to_risk_owner: "Y",
    },
    // Mitigation Task fields
    ra_mitigation_task: {
      task_id: "",
      task_description: "",
      task_owner: "",
      is_ongoing: "N",
      planned_completion_date: "",
      is_recurrent: "N",
      frequency: null,
      further_planned_action: "",
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
        `/api/rarpt/vulnerability-types/?report_type=assessment&report_id=${selectedSheet.id}&project_id=${effectiveProjectId}`,
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

  // --- Automatic Calculation Logic for Risk Assessment ---
  useEffect(() => {
    // Calculate risk rating based on control rating and impact assessment
    const controlRating = formData.ra_control_assessment.rating || 1;
    const consequenceRating = formData.ra_impact_assessment.consequence_rating || 1;
    const likelihoodRating = formData.ra_impact_assessment.likelihood_rating || 1;
    
    const calculatedRiskRating = controlRating * consequenceRating * likelihoodRating;

    // Calculate Risk Category based on calculated risk rating
    const calculatedRiskCategory = calculatedRiskRating >= 27 ? "Significant" : "Not Significant";

    // Calculate residual risk rating based on revised control rating
    const revisedControlRating = formData.ra_risk_revision.revised_control_rating || 1;
    const calculatedResidualRiskRating = revisedControlRating * consequenceRating * likelihoodRating;

    // Update formData state if calculated values differ
    setFormData((prevFormData) => {
      const needsUpdate =
        prevFormData.ra_risk_assessment.risk_rating !== calculatedRiskRating ||
        prevFormData.ra_risk_assessment.risk_category !== calculatedRiskCategory ||
        prevFormData.ra_risk_revision.residual_risk_rating !== calculatedResidualRiskRating;

      if (needsUpdate) {
        return {
          ...prevFormData,
          ra_risk_assessment: {
            ...prevFormData.ra_risk_assessment,
            risk_rating: calculatedRiskRating,
            risk_category: calculatedRiskCategory,
          },
          ra_risk_revision: {
            ...prevFormData.ra_risk_revision,
            residual_risk_rating: calculatedResidualRiskRating,
          },
        };
      }
      return prevFormData; // No update needed
    });
  }, [
    formData.ra_control_assessment.rating,
    formData.ra_impact_assessment.consequence_rating,
    formData.ra_impact_assessment.likelihood_rating,
    formData.ra_risk_revision.revised_control_rating,
  ]);

  // Function to toggle column group expansion
  // UI utility functions are now imported from shared uiUtils.js
  const handleToggleGroup = (group) => toggleGroup(expandedGroups, setExpandedGroups, group);

  // Update color functions to match Legend modal scheme
  const getRatingColor = (value) => {
    if (!value || value === 0) return 'bg-gray-100';
    
    const numValue = parseInt(value);
    switch (numValue) {
      case 1:
        return 'bg-yellow-300'; // Insignificant - Good
      case 2:
        return 'bg-orange-200'; // Minor - Low-Medium
      case 3:
        return 'bg-red-300'; // Moderate - Medium
      case 4:
        return 'bg-red-400'; // Major - High
      case 5:
        return 'bg-red-600 text-white'; // Catastrophic - Very High
      default:
        return 'bg-gray-100';
    }
  };

  // Function to get risk rating color based on threshold (>= 27 is high priority)
  const getRiskRatingColor = (value) => {
    if (!value || value === 0) return 'bg-gray-100';
    
    const numValue = parseInt(value);
    if (numValue >= 27) {
      return 'bg-red-600 text-white font-bold'; // High priority - Dark red
    } else if (numValue >= 20) {
      return 'bg-red-400'; // High risk
    } else if (numValue >= 15) {
      return 'bg-red-300'; // Medium-High risk
    } else if (numValue >= 10) {
      return 'bg-orange-200'; // Medium risk
    } else {
      return 'bg-yellow-300'; // Low risk
    }
  };

  // Function to get impact color for Y/N fields
  const getImpactColor = (value) => {
    if (!value) return 'bg-gray-100';
    
    const strValue = String(value).toUpperCase();
    if (strValue === 'Y' || strValue === 'YES') {
      return 'bg-red-300'; // Impact exists - Light red
    } else if (strValue === 'N' || strValue === 'NO') {
      return 'bg-green-200'; // No impact - Light green
    } else {
      return 'bg-gray-100'; // Default
    }
  };

  // Function to get residual risk rating color
  const getResidualRiskColor = (value) => {
    if (!value || value === 0) return 'bg-gray-100';
    
    const numValue = parseInt(value);
    if (numValue >= 27) {
      return 'bg-red-600 text-white font-bold'; // High priority - Dark red
    } else if (numValue >= 20) {
      return 'bg-red-400'; // High risk
    } else if (numValue >= 15) {
      return 'bg-red-300'; // Medium-High risk
    } else if (numValue >= 10) {
      return 'bg-orange-200'; // Medium risk
    } else {
      return 'bg-yellow-300'; // Low risk
    }
  };

  // Function to open modal
  const openModal = (type, riskToEdit = null) => {
    setModalType(type);
    setShowModal(true);
    setExcelFile(null); // Reset file state when opening modal

    if ((type === "edit" || type === "view") && riskToEdit) {
      setEditingRisk(riskToEdit);

      // Deep clone the risk object to avoid reference issues
      const riskDataToSet = {
        risk_id: riskToEdit.risk_id || "",
        vulnerability_type: riskToEdit.vulnerabilityType || "",
        threat_description: riskToEdit.threatDescription || "",
        context: riskToEdit.context || "Natural",
        applicable_activity: riskToEdit.applicableActivity || "",
        
        // Map the impact assessment data
        ra_impact_assessment: {
          impact_on_confidentiality: riskToEdit.impactAssessment?.confidentiality || "N",
          impact_on_integrity: riskToEdit.impactAssessment?.integrity || "N",
          impact_on_availability: riskToEdit.impactAssessment?.availability || "N",
          breach_of_legal_obligation: riskToEdit.impactAssessment?.legalBreach || "N",
          description_of_legal_obligation: riskToEdit.impactAssessment?.legalDescription || "",
          on_customer: riskToEdit.impactRatings?.customer || 1,
          on_service_capability: riskToEdit.impactRatings?.serviceCapability || 1,
          financial_damage: riskToEdit.impactRatings?.financialDamage || 1,
          spread_magnitude: riskToEdit.impactRatings?.spreadMagnitude || 1,
          consequence_rating: riskToEdit.severity?.consequenceRating || 1,
          likelihood_rating: riskToEdit.severity?.likelihoodRating || 1,
        },
        
        // Map control assessment
        ra_control_assessment: {
          description: riskToEdit.controlAssessment?.description || "",
          rating: riskToEdit.controlAssessment?.rating || 1,
        },
        
        // Map risk assessment
        ra_risk_assessment: {
          risk_rating: riskToEdit.riskAssessment?.riskRating || 1,
          risk_category: riskToEdit.riskAssessment?.riskCategory || "Not Significant",
          department_bu: riskToEdit.riskAssessment?.departmentBU || "",
          risk_owner: riskToEdit.riskAssessment?.riskOwner || "",
          risk_mitigation_strategy: riskToEdit.riskAssessment?.mitigationStrategy || "Tolerate",
        },
        
        // Map risk revision
        ra_risk_revision: {
          applicable_soa_control: riskToEdit.riskRevision?.soaControl || "",
          soa_control_description: riskToEdit.riskRevision?.soaControlDesc || "",
          planned_controls_meet_requirements: riskToEdit.riskRevision?.meetsRequirements || "Y",
          revised_control_rating: riskToEdit.riskRevision?.revisedControlRating || 1,
          residual_risk_rating: riskToEdit.riskRevision?.residualRiskRating || 1,
          acceptable_to_risk_owner: riskToEdit.riskRevision?.acceptableToOwner || "Y",
        },
        
        // Map mitigation task
        ra_mitigation_task: {
          task_id: riskToEdit.mitigationTask?.taskId || "",
          task_description: riskToEdit.mitigationTask?.taskDescription || "",
          task_owner: riskToEdit.mitigationTask?.taskOwner || "",
          is_ongoing: riskToEdit.mitigationTask?.isOngoing || "N",
          planned_completion_date: riskToEdit.mitigationTask?.plannedCompletionDate || "",
          is_recurrent: riskToEdit.mitigationTask?.isRecurrent || "N",
          frequency: riskToEdit.mitigationTask?.frequency || null,
          further_planned_action: riskToEdit.mitigationTask?.furtherPlannedAction || "",
        },
      };

      
      setFormData(riskDataToSet);


    } else if (type === "create") {
      setEditingRisk(null);
      // Reset form data to defaults for Risk Assessment
      setFormData({
        risk_id: "",
        vulnerability_type: "",
        threat_description: "",
        context: "Natural",
        applicable_activity: "",
        // Impact Assessment fields
        ra_impact_assessment: {
          impact_on_confidentiality: "N",
          impact_on_integrity: "N",
          impact_on_availability: "N",
          breach_of_legal_obligation: "N",
          description_of_legal_obligation: "",
          on_customer: 1,
          on_service_capability: 1,
          financial_damage: 1,
          spread_magnitude: 1,
          consequence_rating: 1,
          likelihood_rating: 1,
        },
        // Control Assessment fields
        ra_control_assessment: {
          description: "",
          rating: 1,
        },
        // Risk Assessment fields
        ra_risk_assessment: {
          risk_rating: 1,
          risk_category: "Not Significant",
          department_bu: "",
          risk_owner: "",
          risk_mitigation_strategy: "Tolerate",
        },
        // Risk Revision fields
        ra_risk_revision: {
          applicable_soa_control: "",
          soa_control_description: "",
          planned_controls_meet_requirements: "Y",
          revised_control_rating: 1,
          residual_risk_rating: 1,
          acceptable_to_risk_owner: "Y",
        },
        // Mitigation Task fields
        ra_mitigation_task: {
          task_id: "",
          task_description: "",
          task_owner: "",
          is_ongoing: "N",
          planned_completion_date: "",
          is_recurrent: "N",
          frequency: null,
          further_planned_action: "",
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
        `/api/rarpt/assessment-sheets/${sheetId}/risks/`,
        null,
        true
      );

      if (response.data && Array.isArray(response.data)) {
        // Format the data for display
        const formattedRisks = response.data.map((risk) => {
          // Get nested objects or provide defaults
          const impactAssessment = risk.ra_impact_assessment || {};
          const controlAssessment = risk.ra_control_assessment || {};
          const riskAssessment = risk.ra_risk_assessment || {};
          const riskRevision = risk.ra_risk_revision || {};
          const mitigationTask = risk.ra_mitigation_task || {};
          
          return {
            id: risk.id || "",
            risk_id: risk.risk_id || "",
            vulnerabilityType: risk.vulnerability_type || "Not Specified",
            threatDescription: risk.threat_description || "",
            context: risk.context || "",
            applicableActivity: risk.applicable_activity || "",
            
            // Map Impact Assessment data - FIXED: Use correct field names from backend
            impactAssessment: {
              confidentiality: impactAssessment.impact_on_confidentiality || "N",
              integrity: impactAssessment.impact_on_integrity || "N",
              availability: impactAssessment.impact_on_availability || "N",
              legalBreach: impactAssessment.breach_of_legal_obligation || "N",
              legalDescription: impactAssessment.description_of_legal_obligation || "",
              onCustomer: impactAssessment.on_customer || 1,
              onServiceCapability: impactAssessment.on_service_capability || 1,
              financialDamage: impactAssessment.financial_damage || 1,
              spreadMagnitude: impactAssessment.spread_magnitude || 1,
              consequenceRating: impactAssessment.consequence_rating || 1,
              likelihoodRating: impactAssessment.likelihood_rating || 1,
            },
            
            // Map Control Assessment
            controlAssessment: {
              description: controlAssessment.description || "",
              rating: controlAssessment.rating || 1,
            },
            
            // Map Risk Assessment
            riskAssessment: {
              riskRating: riskAssessment.risk_rating || 1,
              riskCategory: riskAssessment.risk_category || "Not Significant",
              departmentBU: riskAssessment.department_bu || "",
              riskOwner: riskAssessment.risk_owner || "",
              mitigationStrategy: riskAssessment.risk_mitigation_strategy || "Tolerate",
            },
            
            // Map Risk Revision
            riskRevision: {
              soaControl: riskRevision.applicable_soa_control || "",
              soaControlDesc: riskRevision.soa_control_description || "",
              meetsRequirements: riskRevision.planned_controls_meet_requirements || "Y",
              revisedControlRating: riskRevision.revised_control_rating || 1,
              residualRiskRating: riskRevision.residual_risk_rating || 1,
              acceptableToOwner: riskRevision.acceptable_to_risk_owner || "Y",
            },
            
            // Map Mitigation Task
            mitigationTask: {
              taskId: mitigationTask.task_id || "",
              taskDescription: mitigationTask.task_description || "",
              taskOwner: mitigationTask.task_owner || "",
              isOngoing: mitigationTask.is_ongoing || "N",
              plannedCompletionDate: mitigationTask.planned_completion_date || "",
              isRecurrent: mitigationTask.is_recurrent || "N",
              frequency: mitigationTask.frequency || "",
              furtherPlannedAction: mitigationTask.further_planned_action || "",
            },
          };
        });
        
        setRiskData(formattedRisks);
      } else {
        console.warn("API returned no risks for this sheet or invalid format");
        setRiskData([]);
      }
    } catch (err) {
      console.error("Error fetching assessment risks:", err);
      message.error(err.message || "Failed to fetch assessment risks");
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
        `/api/rarpt/project/${effectiveProjectId}/assessment-sheets/`,
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
              `/api/rarpt/assessment-sheets/${specificSheet.id}/risks/`,
              null,
              true
            );
            if (risksResponse.data && Array.isArray(risksResponse.data)) {
              const formattedRisks = risksResponse.data.map((risk) => {
                const impactAssessment = risk.ra_impact_assessment || {};
                const controlAssessment = risk.ra_control_assessment || {};
                const riskAssessment = risk.ra_risk_assessment || {};
                const riskRevision = risk.ra_risk_revision || {};
                const mitigationTask = risk.ra_mitigation_task || {};
                
                return {
                  id: risk.id || "",
                  risk_id: risk.risk_id || "",
                  vulnerabilityType: risk.vulnerability_type || "Not Specified",
                  threatDescription: risk.threat_description || "",
                  context: risk.context || "",
                  applicableActivity: risk.applicable_activity || "",
                  
                  // Map Impact Assessment
                  impactAssessment: {
                    confidentiality: impactAssessment.impact_on_confidentiality || "N",
                    integrity: impactAssessment.impact_on_integrity || "N",
                    availability: impactAssessment.impact_on_availability || "N",
                    legalBreach: impactAssessment.breach_of_legal_obligation || "N",
                    legalDescription: impactAssessment.description_of_legal_obligation || "",
                    onCustomer: impactAssessment.on_customer || 1,
                    onServiceCapability: impactAssessment.on_service_capability || 1,
                    financialDamage: impactAssessment.financial_damage || 1,
                    spreadMagnitude: impactAssessment.spread_magnitude || 1,
                    consequenceRating: impactAssessment.consequence_rating || 1,
                    likelihoodRating: impactAssessment.likelihood_rating || 1,
                  },
                  
                  // Map Control Assessment
                  controlAssessment: {
                    description: controlAssessment.description || "",
                    rating: controlAssessment.rating || 1,
                  },
                  
                  // Map Risk Assessment
                  riskAssessment: {
                    riskRating: riskAssessment.risk_rating || 1,
                    riskCategory: riskAssessment.risk_category || "Not Significant",
                    departmentBU: riskAssessment.department_bu || "",
                    riskOwner: riskAssessment.risk_owner || "",
                    mitigationStrategy: riskAssessment.risk_mitigation_strategy || "Tolerate",
                  },
                  
                  // Map Risk Revision
                  riskRevision: {
                    soaControl: riskRevision.applicable_soa_control || "",
                    soaControlDesc: riskRevision.soa_control_description || "",
                    meetsRequirements: riskRevision.planned_controls_meet_requirements || "Y",
                    revisedControlRating: riskRevision.revised_control_rating || 1,
                    residualRiskRating: riskRevision.residual_risk_rating || 1,
                    acceptableToOwner: riskRevision.acceptable_to_risk_owner || "Y",
                  },
                  
                  // Map Mitigation Task
                  mitigationTask: {
                    taskId: mitigationTask.task_id || "",
                    taskDescription: mitigationTask.task_description || "",
                    taskOwner: mitigationTask.task_owner || "",
                    isOngoing: mitigationTask.is_ongoing || "N",
                    plannedCompletionDate: mitigationTask.planned_completion_date || "",
                    isRecurrent: mitigationTask.is_recurrent || "N",
                    frequency: mitigationTask.frequency || "",
                    furtherPlannedAction: mitigationTask.further_planned_action || "",
                  },
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
              `/api/rarpt/assessment-sheets/${sheetToSelect.id}/risks/`,
              null,
              true
            );
            if (risksResponse.data && Array.isArray(risksResponse.data)) {
              const formattedRisks = risksResponse.data.map((risk) => {
                const impactAssessment = risk.ra_impact_assessment || {};
                const controlAssessment = risk.ra_control_assessment || {};
                const riskAssessment = risk.ra_risk_assessment || {};
                const riskRevision = risk.ra_risk_revision || {};
                const mitigationTask = risk.ra_mitigation_task || {};
                
                return {
                  id: risk.id || "",
                  risk_id: risk.risk_id || "",
                  vulnerabilityType: risk.vulnerability_type || "Not Specified",
                  threatDescription: risk.threat_description || "",
                  context: risk.context || "",
                  applicableActivity: risk.applicable_activity || "",
                  
                  // Map Impact Assessment
                  impactAssessment: {
                    confidentiality: impactAssessment.impact_on_confidentiality || "N",
                    integrity: impactAssessment.impact_on_integrity || "N",
                    availability: impactAssessment.impact_on_availability || "N",
                    legalBreach: impactAssessment.breach_of_legal_obligation || "N",
                    legalDescription: impactAssessment.description_of_legal_obligation || "",
                    onCustomer: impactAssessment.on_customer || 1,
                    onServiceCapability: impactAssessment.on_service_capability || 1,
                    financialDamage: impactAssessment.financial_damage || 1,
                    spreadMagnitude: impactAssessment.spread_magnitude || 1,
                    consequenceRating: impactAssessment.consequence_rating || 1,
                    likelihoodRating: impactAssessment.likelihood_rating || 1,
                  },
                  
                  // Map Control Assessment
                  controlAssessment: {
                    description: controlAssessment.description || "",
                    rating: controlAssessment.rating || 1,
                  },
                  
                  // Map Risk Assessment
                  riskAssessment: {
                    riskRating: riskAssessment.risk_rating || 1,
                    riskCategory: riskAssessment.risk_category || "Not Significant",
                    departmentBU: riskAssessment.department_bu || "",
                    riskOwner: riskAssessment.risk_owner || "",
                    mitigationStrategy: riskAssessment.risk_mitigation_strategy || "Tolerate",
                  },
                  
                  // Map Risk Revision
                  riskRevision: {
                    soaControl: riskRevision.applicable_soa_control || "",
                    soaControlDesc: riskRevision.soa_control_description || "",
                    meetsRequirements: riskRevision.planned_controls_meet_requirements || "Y",
                    revisedControlRating: riskRevision.revised_control_rating || 1,
                    residualRiskRating: riskRevision.residual_risk_rating || 1,
                    acceptableToOwner: riskRevision.acceptable_to_risk_owner || "Y",
                  },
                  
                  // Map Mitigation Task
                  mitigationTask: {
                    taskId: mitigationTask.task_id || "",
                    taskDescription: mitigationTask.task_description || "",
                    taskOwner: mitigationTask.task_owner || "",
                    isOngoing: mitigationTask.is_ongoing || "N",
                    plannedCompletionDate: mitigationTask.planned_completion_date || "",
                    isRecurrent: mitigationTask.is_recurrent || "N",
                    frequency: mitigationTask.frequency || "",
                    furtherPlannedAction: mitigationTask.further_planned_action || "",
                  },
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
      console.error("Error fetching assessment sheets:", err);
      message.error(err.message || "Failed to fetch assessment sheets");
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
        context: "Natural",
        applicable_activity: "",
        ra_impact_assessment: {
          impact_on_confidentiality: "N",
          impact_on_integrity: "N",
          impact_on_availability: "N",
          breach_of_legal_obligation: "N",
          description_of_legal_obligation: "",
          on_customer: 1,
          on_service_capability: 1,
          financial_damage: 1,
          spread_magnitude: 1,
          consequence_rating: 1,
          likelihood_rating: 1,
        },
        ra_control_assessment: {
          description: "",
          rating: 1,
        },
        ra_risk_assessment: {
          risk_rating: 1,
          risk_category: "Not Significant",
          department_bu: "",
          risk_owner: "",
          risk_mitigation_strategy: "Tolerate",
        },
        ra_risk_revision: {
          applicable_soa_control: "",
          soa_control_description: "",
          planned_controls_meet_requirements: "Y",
          revised_control_rating: 1,
          residual_risk_rating: 1,
          acceptable_to_risk_owner: "Y",
        },
        ra_mitigation_task: {
          task_id: "",
          task_description: "",
          task_owner: "",
          is_ongoing: "N",
          planned_completion_date: "",
          is_recurrent: "N",
          frequency: null,
          further_planned_action: "",
        },
      });
      fetchRisksForSheet(selectedSheet.id);
    } else {
      setRiskData([]);
    }
  }, [selectedSheet, fetchRisksForSheet]);

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
        `/api/rarpt/project/${projectid}/assessment-sheets/create/`,
        { name: newSheetName.trim() },
        true
      );
      message.success("Report created successfully");
      setNewSheetName("");
      setShowSheetModal(false);
      
      // Fetch sheets, then select the new one by id
      const sheetsResponse = await apiRequest(
        "GET",
        `/api/rarpt/project/${projectid}/assessment-sheets/`,
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
            onReportCreated({ id: newSheet.id, type: 'riskAssessment', name: newSheet.name });
          }
        }
      }
    } catch (err) {
      console.error("Error creating assessment report:", err);
      message.error(err.message || "Failed to create assessment report");
    } finally {
      setIsLoading(false);
    }
  };

  // Updated deleteSheet function
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

          // Fetch updated assessment sheets list *after* deletion
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
              await fetchRisksForSheet(nextSheet.id); // Fetch risks for the new sheet
            } else {
              // No sheets left
              setSelectedSheet(null);
              setRiskData([]); // Clear risk data
            }
          }
        } catch (err) {
          console.error(
            "Error deleting or fetching assessment reports after deletion:",
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
      context: "Natural",
      applicable_activity: "",
      ra_impact_assessment: {
        impact_on_confidentiality: "N",
        impact_on_integrity: "N",
        impact_on_availability: "N",
        breach_of_legal_obligation: "N",
        description_of_legal_obligation: "",
        on_customer: 1,
        on_service_capability: 1,
        financial_damage: 1,
        spread_magnitude: 1,
        consequence_rating: 1,
        likelihood_rating: 1,
      },
      ra_control_assessment: {
        description: "",
        rating: 1,
      },
      ra_risk_assessment: {
        risk_rating: 1,
        risk_category: "Not Significant",
        department_bu: "",
        risk_owner: "",
        risk_mitigation_strategy: "Tolerate",
      },
      ra_risk_revision: {
        applicable_soa_control: "",
        soa_control_description: "",
        planned_controls_meet_requirements: "Y",
        revised_control_rating: 1,
        residual_risk_rating: 1,
        acceptable_to_risk_owner: "Y",
      },
      ra_mitigation_task: {
        task_id: "",
        task_description: "",
        task_owner: "",
        is_ongoing: "N",
        planned_completion_date: "",
        is_recurrent: "N",
        frequency: null,
        further_planned_action: "",
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

  // Initialize rt_assessment and rt_revision in formData if they don't exist
  useEffect(() => {
    setFormData(prevFormData => {
      const updatedFormData = { ...prevFormData };
      
      // Add rt_assessment if it doesn't exist
      if (!updatedFormData.rt_assessment) {
        updatedFormData.rt_assessment = {
          risk_rating: 1,
          risk_category: "Not Significant",
          department_bu: "",
          risk_mitigation_strategy: "Tolerate"
        };
      }
      
      // Add rt_revision if it doesn't exist
      if (!updatedFormData.rt_revision) {
        updatedFormData.rt_revision = {
          applicable_annex_control_number: "",
          meet_legal_requirements: "Y",
          revised_control_rating: 1,
          revised_consequence_rating: 1,
          revised_likelihood_rating: 1,
          residual_risk_rating: 1,
          acceptable_to_risk_owner: "Y"
        };
      }
      
      // Add rt_mitigation_plans if it doesn't exist
      if (!updatedFormData.rt_mitigation_plans) {
        updatedFormData.rt_mitigation_plans = {
          policy_lense_task_id: "",
          task_description: "",
          task_owner: "",
          is_ongoing: "N",
          planned_completion_date: "",
          is_recurrent: "N",
          frequency: "",
          further_planned_action: ""
        };
      }
      
      // Add ra_impact_assessment if it doesn't exist
      if (!updatedFormData.ra_impact_assessment) {
        updatedFormData.ra_impact_assessment = {
          impact_on_confidentiality: "N",
          impact_on_integrity: "N",
          impact_on_availability: "N",
          breach_of_legal_obligation: "N",
          description_of_legal_obligation: "",
          on_customer: 1,
          on_service_capability: 1,
          financial_damage: 1,
          spread_magnitude: 1,
          consequence_rating: 1,
          likelihood_rating: 1
        };
      }
      
      // Add ra_control_assessment if it doesn't exist
      if (!updatedFormData.ra_control_assessment) {
        updatedFormData.ra_control_assessment = {
          description: "",
          rating: 1
        };
      }
      
      // Add ra_risk_assessment if it doesn't exist
      if (!updatedFormData.ra_risk_assessment) {
        updatedFormData.ra_risk_assessment = {
          risk_rating: 1,
          risk_category: "Not Significant",
          department_bu: "",
          risk_owner: "",
          risk_mitigation_strategy: "Tolerate"
        };
      }
      
      // Add ra_risk_revision if it doesn't exist
      if (!updatedFormData.ra_risk_revision) {
        updatedFormData.ra_risk_revision = {
          applicable_soa_control: "",
          soa_control_description: "",
          planned_controls_meet_requirements: "Y",
          revised_control_rating: 1,
          residual_risk_rating: 1,
          acceptable_to_risk_owner: "Y"
        };
      }
      
      // Add ra_mitigation_task if it doesn't exist
      if (!updatedFormData.ra_mitigation_task) {
        updatedFormData.ra_mitigation_task = {
          task_id: "",
          task_description: "",
          task_owner: "",
          is_ongoing: "N",
          planned_completion_date: "",
          is_recurrent: "N",
          frequency: null,
          further_planned_action: ""
        };
      }
      
      return updatedFormData;
    });
  }, []);

  // Submit risk assessment form
  const handleRiskSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSheet) {
      message.error("Please select an assessment report first");
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
        risk_id: formData.risk_id || "RA_" + Date.now(),
        vulnerability_type: formData.vulnerability_type || "Default",
        threat_description: formData.threat_description || "Default",
        context: formData.context || "Natural",
        applicable_activity: formData.applicable_activity || "Default Activity",
        
        // Include all nested objects
        ra_impact_assessment: { 
          ...formData.ra_impact_assessment
        },
        
        ra_control_assessment: {
          description: formData.ra_control_assessment.description || "Default control assessment",
          rating: formData.ra_control_assessment.rating || 1
        },
        
        ra_risk_assessment: {
          risk_rating: formData.ra_risk_assessment.risk_rating || 1,
          risk_category: formData.ra_risk_assessment.risk_category || "Not Significant",
          department_bu: formData.ra_risk_assessment.department_bu || "Default Department",
          risk_owner: formData.ra_risk_assessment.risk_owner || "Default Owner",
          risk_mitigation_strategy: formData.ra_risk_assessment.risk_mitigation_strategy || "Tolerate"
        },
        
        ra_risk_revision: {
          applicable_soa_control: formData.ra_risk_revision.applicable_soa_control || "",
          soa_control_description: formData.ra_risk_revision.soa_control_description || "",
          planned_controls_meet_requirements: formData.ra_risk_revision.planned_controls_meet_requirements || "Y",
          revised_control_rating: formData.ra_risk_revision.revised_control_rating || 1,
          residual_risk_rating: formData.ra_risk_revision.residual_risk_rating || 1,
          acceptable_to_risk_owner: formData.ra_risk_revision.acceptable_to_risk_owner || "Y"
        },
        
        ra_mitigation_task: {
          // Generate a more specific task_id that includes the risk_id for better traceability
          task_id: formData.ra_mitigation_task.task_id || `Task_${formData.risk_id || "RA_" + Date.now()}_${Date.now().toString().slice(-6)}`,
          task_description: formData.ra_mitigation_task.task_description || "Default task description",
          task_owner: formData.ra_mitigation_task.task_owner || "Admin",
          is_ongoing: formData.ra_mitigation_task.is_ongoing || "N",
          planned_completion_date: formData.ra_mitigation_task.planned_completion_date || today,
          is_recurrent: formData.ra_mitigation_task.is_recurrent || "N",
          frequency: formData.ra_mitigation_task.frequency || null,
          further_planned_action: formData.ra_mitigation_task.further_planned_action || ""
        }
      };

      const response = await apiRequest(
        "POST",
        `/api/rarpt/assessment-sheets/${selectedSheet.id}/risks/create/`,
        apiData,
        true
      );

      if (response.status === 200 || response.status === 201) {
        message.success("Risk assessment created successfully");
        await fetchRisksForSheet(selectedSheet.id);
        closeModal(); // Close modal immediately after success
      }
    } catch (err) {
      console.error("Error creating risk assessment:", err);
      message.error(err.message || "Failed to create risk assessment");
    } finally {
      setIsLoading(false);
    }
  };

  // Update existing risk assessment
  const handleRiskUpdate = async (e) => {
    e.preventDefault();
    if (!selectedSheet || !editingRisk) {
      message.error("Report or risk assessment not selected");
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
        // Avoid duplicate risk_id by only using one source
        risk_id: formData.risk_id || editingRisk.risk_id, // Prefer formData, fallback to original
        vulnerability_type:
          formData.vulnerability_type || editingRisk.vulnerabilityType,
        threat_description:
          formData.threat_description || editingRisk.threatDescription,
        context: formData.context || editingRisk.context,
        applicable_activity: formData.applicable_activity || editingRisk.applicableActivity || "Default Activity",

        // Map ra_impact_assessment from formData
        ra_impact_assessment: {
          impact_on_confidentiality: formData.ra_impact_assessment.impact_on_confidentiality,
          impact_on_integrity: formData.ra_impact_assessment.impact_on_integrity,
          impact_on_availability: formData.ra_impact_assessment.impact_on_availability,
          breach_of_legal_obligation: formData.ra_impact_assessment.breach_of_legal_obligation,
          description_of_legal_obligation: formData.ra_impact_assessment.description_of_legal_obligation || "",
          on_customer: formData.ra_impact_assessment.on_customer,
          on_service_capability: formData.ra_impact_assessment.on_service_capability,
          financial_damage: formData.ra_impact_assessment.financial_damage,
          spread_magnitude: formData.ra_impact_assessment.spread_magnitude,
          consequence_rating: formData.ra_impact_assessment.consequence_rating,
          likelihood_rating: formData.ra_impact_assessment.likelihood_rating,
        },

        // Map ra_control_assessment from formData
        ra_control_assessment: {
          description: formData.ra_control_assessment.description || "",
          rating: formData.ra_control_assessment.rating,
        },

        // Map ra_risk_assessment from formData
        ra_risk_assessment: {
          risk_rating: formData.ra_risk_assessment.risk_rating, // This is calculated
          risk_category: formData.ra_risk_assessment.risk_category, // This is calculated
          department_bu: formData.ra_risk_assessment.department_bu || "Default Department",
          risk_owner: formData.ra_risk_assessment.risk_owner || "Default Owner",
          risk_mitigation_strategy: formData.ra_risk_assessment.risk_mitigation_strategy,
        },

        // Map ra_risk_revision from formData
        ra_risk_revision: {
          applicable_soa_control: formData.ra_risk_revision.applicable_soa_control || "",
          soa_control_description: formData.ra_risk_revision.soa_control_description || "",
          planned_controls_meet_requirements: formData.ra_risk_revision.planned_controls_meet_requirements,
          revised_control_rating: formData.ra_risk_revision.revised_control_rating,
          residual_risk_rating: formData.ra_risk_revision.residual_risk_rating, // This is calculated
          acceptable_to_risk_owner: formData.ra_risk_revision.acceptable_to_risk_owner,
        },
      };
      
      // Always include ra_mitigation_task with a valid task_id
       const mitigationTask = formData.ra_mitigation_task;
       
       // Check if there's any mitigation task data
       if (mitigationTask && (
           mitigationTask.task_description ||
           mitigationTask.task_owner ||
           mitigationTask.planned_completion_date ||
           mitigationTask.further_planned_action
         )) {
         // Always generate a task_id if it's empty
         const taskId = mitigationTask.task_id || `Task_${formData.risk_id}_${Date.now().toString().slice(-6)}`;
         
         apiData.ra_mitigation_task = {
           task_id: taskId, // Ensure task_id is never blank
           task_description: mitigationTask.task_description || "",
           task_owner: mitigationTask.task_owner || "",
           is_ongoing: mitigationTask.is_ongoing || "N",
           planned_completion_date: mitigationTask.planned_completion_date || null,
           is_recurrent: mitigationTask.is_recurrent || "N",
           frequency: mitigationTask.frequency || null,
           further_planned_action: mitigationTask.further_planned_action || "",
         };
       } else {
         // If no valid data, send empty object to trigger deletion if it exists
         // But still include a task_id to avoid validation errors
         apiData.ra_mitigation_task = {
           task_id: `Task_${formData.risk_id}_${Date.now().toString().slice(-6)}`,
           task_description: "",
           task_owner: "",
           is_ongoing: "N",
           planned_completion_date: null,
           is_recurrent: "N",
           frequency: null,
           further_planned_action: ""
         };
       }

      const response = await apiRequest(
        "PATCH", // Ensure PUT method is used
        `/api/rarpt/assessment-risks/${editingRisk.id}/`, // Correct endpoint for update
        apiData, // Send the structured data
        true
      );

      if (response.status === 200 || response.status === 204) {
        message.success("Risk assessment updated successfully");
        await fetchRisksForSheet(selectedSheet.id);
        closeModal(); // Close modal immediately after success
      }
    } catch (err) {
      console.error("Error updating risk assessment:", err);
      message.error(err.message || "Failed to update risk assessment");
    } finally {
      setIsLoading(false);
    }
  };

  // Submit excel file for risk assessments
  const handleExcelSubmit = async (file) => {
    if (!file) {
      message.error("Please select an Excel file");
      return;
    }

    if (!selectedSheet) {
      message.error("Please select an Assessment Report first");
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Await the API request. If it fails, it will throw and go to the catch block.
      await apiRequest(
        "POST",
        `/api/rarpt/assessment-sheets/${selectedSheet.id}/risks/create/`,
        formData,
        true
      );

      // If the code reaches here, the upload was successful.
      message.success("Excel file uploaded successfully.");

      // Now, refresh the data from the server.
      await fetchRisksForSheet(selectedSheet.id);

      // Finally, close the modal.
      closeModal();

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

  // Delete a risk assessment - Assuming DELETE on /api/rarpt/assessment-risks/<risk_id>/
  const handleDeleteRisk = async (riskId) => {
    openConfirmModal({
      title: "Confirm Risk Assessment Deletion",
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
          message.success("Risk assessment deleted successfully");
          if (selectedSheet) {
            await fetchRisksForSheet(selectedSheet.id);
          }
        } catch (err) {
          console.error("Error deleting risk assessment:", err);
          message.error(err.message || "Failed to delete risk assessment");
        } finally {
          setIsLoading(false);
        }
      },
      onClose: closeConfirmModal,
    });
  };

  // Add function to handle row click


  // Add this function to map backend data to frontend format
  const mapRiskDataToDisplay = (riskData) => {
    if (!Array.isArray(riskData)) return [];
    
    return riskData.map(risk => ({
      id: risk.id,
      // Basic fields
      risk_id: risk.risk_id,
      vulnerabilityType: risk.vulnerability_type,
      threatDescription: risk.threat_description,
      context: risk.context,
      applicableActivity: risk.applicable_activity,
      
      // Impact Assessment
      impactAssessment: {
        confidentiality: risk.ra_impact_assessment?.impact_on_confidentiality,
        integrity: risk.ra_impact_assessment?.impact_on_integrity,
        availability: risk.ra_impact_assessment?.impact_on_availability,
        legalBreach: risk.ra_impact_assessment?.breach_of_legal_obligation,
        onCustomer: risk.ra_impact_assessment?.on_customer,
        onServiceCapability: risk.ra_impact_assessment?.on_service_capability,
        financialDamage: risk.ra_impact_assessment?.financial_damage,
        consequenceRating: risk.ra_impact_assessment?.consequence_rating,
        likelihoodRating: risk.ra_impact_assessment?.likelihood_rating,
      },
      
      // Control Assessment
      controlAssessment: {
        description: risk.ra_control_assessment?.description,
        rating: risk.ra_control_assessment?.rating,
      },
      
      // Risk Assessment
      riskAssessment: {
        riskRating: risk.ra_risk_assessment?.risk_rating,
        riskCategory: risk.ra_risk_assessment?.risk_category,
        departmentBU: risk.ra_risk_assessment?.department_bu,
        riskOwner: risk.ra_risk_assessment?.risk_owner,
        mitigationStrategy: risk.ra_risk_assessment?.risk_mitigation_strategy,
      },
      
      // Risk Revision
      riskRevision: {
        soaControl: risk.ra_risk_revision?.applicable_soa_control,
        soaControlDescription: risk.ra_risk_revision?.soa_control_description,
        meetsRequirements: risk.ra_risk_revision?.planned_controls_meet_requirements,
        revisedControlRating: risk.ra_risk_revision?.revised_control_rating,
        residualRiskRating: risk.ra_risk_revision?.residual_risk_rating,
        acceptableToOwner: risk.ra_risk_revision?.acceptable_to_risk_owner,
      },
      
      // Mitigation Task
      mitigationTask: {
        furtherPlannedAction: risk.ra_mitigation_task?.further_planned_action,
        taskId: risk.ra_mitigation_task?.task_id,
        taskDescription: risk.ra_mitigation_task?.task_description,
        taskOwner: risk.ra_mitigation_task?.task_owner,
        isOngoing: risk.ra_mitigation_task?.is_ongoing,
        isRecurrent: risk.ra_mitigation_task?.is_recurrent,
        plannedCompletionDate: risk.ra_mitigation_task?.planned_completion_date,
        frequency: risk.ra_mitigation_task?.frequency,
      },
    }));
  };

  // Update the useEffect to use the mapping function
  useEffect(() => {
    const fetchRiskData = async () => {
      if (!selectedSheet) {
        setRiskData([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await apiRequest(
          "GET",
          `/api/rarpt/assessment-sheets/${selectedSheet.id}/risks/`,
          null,
          true
        );

        if (response && response.data) {
          const mappedData = mapRiskDataToDisplay(response.data);
          setRiskData(mappedData);
        } else {
          setRiskData([]);
        }
      } catch (error) {
        console.error("Error fetching risk data:", error);
        setRiskData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRiskData();
  }, [selectedSheet]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 p-2 bg-white sticky top-0 z-10 shadow-sm">
        <div className="flex items-center">
          <h2 className="text-xl font-bold text-slate-800">Risk Assessment Reports</h2>
          <div className="ml-3 text-slate-600 font-medium bg-indigo-50 px-3 py-1 rounded-full">
            {riskData.length}
          </div>

          {/* Report Selection Dropdown - Only show if not in specific report mode */}
          {sheets.length > 0 && !specificReportMode && (
            <div className="ml-4 flex items-center">
              <label className="text-sm font-medium text-gray-700 mr-2">
                Report:
              </label>
              <select
                value={selectedSheet ? selectedSheet.id : ""}
                onChange={(e) => handleSheetChange(parseInt(e.target.value))}
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
                d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.007v.008H12V8.25z"
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
                  <th className="border border-slate-200 p-3.5 text-left text-slate-700 font-semibold bg-slate-50">
                    Context
                  </th>
                  <th className="border border-slate-200 p-3.5 text-left text-slate-700 font-semibold bg-slate-50">
                    Applicable Activity
                  </th>

                  {/* Impact Assessment column group */}
                  <th
                    className="border border-slate-200 bg-blue-600 text-white p-3.5 cursor-pointer font-semibold hover:bg-blue-700 transition-colors duration-300"
                    onClick={() => toggleGroup("impactAssessment")}
                    colSpan={expandedGroups.impactAssessment ? 7 : 1}
                  >
                    <div className="flex items-center justify-center">
                      <span>Impact Assessment</span>
                      {renderExpandIcon(expandedGroups.impactAssessment)}
                    </div>
                  </th>

                  {/* Impact Ratings column group */}
                  <th
                    className="border border-slate-200 bg-purple-600 text-white p-3.5 cursor-pointer font-semibold hover:bg-purple-700 transition-colors duration-300"
                    onClick={() => toggleGroup("impactRatings")}
                    colSpan={expandedGroups.impactRatings ? 2 : 1}
                  >
                    <div className="flex items-center justify-center">
                      <span>Impact Ratings</span>
                      {renderExpandIcon(expandedGroups.impactRatings)}
                    </div>
                  </th>

                  {/* Severity column group */}
                  <th
                    className="border border-slate-200 bg-orange-600 text-white p-3.5 cursor-pointer font-semibold hover:bg-orange-700 transition-colors duration-300"
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
                    className="border border-slate-200 bg-yellow-600 text-white p-3.5 cursor-pointer font-semibold hover:bg-yellow-700 transition-colors duration-300"
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
                    colSpan={expandedGroups.riskRevision ? 6 : 1}
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
                  <th className="border border-slate-200 p-3 font-medium"></th>
                  {/* Context */}
                  <th className="border border-slate-200 p-3 font-medium"></th>
                  {/* Applicable Activity */}

                  {/* Impact Assessment subheaders */}
                  {expandedGroups.impactAssessment ? (
                    <>
                      <th className="border border-slate-200 p-3 font-medium bg-blue-100 transition-all duration-300">
                        Impact on Confidentiality (Y/N)
                      </th>
                      <th className="border border-slate-200 p-3 font-medium bg-blue-100 transition-all duration-300">
                        Impact on Integrity (Y/N)
                      </th>
                      <th className="border border-slate-200 p-3 font-medium bg-blue-100 transition-all duration-300">
                        Impact on Availability (Y/N)
                      </th>
                      <th className="border border-slate-200 p-3 font-medium bg-blue-100 transition-all duration-300">
                        Breach of legal obligation (Y/N)
                      </th>
                      <th className="border border-slate-200 p-3 font-medium bg-blue-100 transition-all duration-300">
                        On customer
                      </th>
                      <th className="border border-slate-200 p-3 font-medium bg-blue-100 transition-all duration-300">
                        On operating capability
                      </th>
                      <th className="border border-slate-200 p-3 font-medium bg-blue-100 transition-all duration-300">
                        Financial damage
                      </th>
                    </>
                  ) : (
                    <th className="border border-slate-200 p-3 font-medium bg-blue-100"></th>
                  )}

                  {/* Impact Ratings subheaders */}
                  {expandedGroups.impactRatings ? (
                    <>
                      <th className="border border-slate-200 p-3 font-medium bg-purple-100 transition-all duration-300">
                        Consequence Rating
                      </th>
                      <th className="border border-slate-200 p-3 font-medium bg-purple-100 transition-all duration-300">
                        Likelihood Rating
                      </th>
                    </>
                  ) : (
                    <th className="border border-slate-200 p-3 font-medium bg-purple-100"></th>
                  )}

                  {/* Severity subheaders */}
                  {expandedGroups.severity ? (
                    <>
                      <th className="border border-slate-200 p-3 font-medium bg-orange-100 transition-all duration-300">
                        Consequence Rating
                      </th>
                      <th className="border border-slate-200 p-3 font-medium bg-orange-100 transition-all duration-300">
                        Likelihood Rating
                      </th>
                    </>
                  ) : (
                    <th className="border border-slate-200 p-3 font-medium bg-orange-100"></th>
                  )}

                  {/* Control Assessment subheaders */}
                  {expandedGroups.controlAssessment ? (
                    <>
                      <th className="border border-slate-200 p-3 font-medium bg-yellow-100 transition-all duration-300">
                        Description
                      </th>
                      <th className="border border-slate-200 p-3 font-medium bg-yellow-100 transition-all duration-300">
                        Rating
                      </th>
                    </>
                  ) : (
                    <th className="border border-slate-200 p-3 font-medium bg-yellow-100"></th>
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
                        Revised Control Rating
                      </th>
                      <th className="border border-slate-200 p-3 font-medium bg-indigo-100 transition-all duration-300">
                        Residual Risk Rating
                      </th>
                      <th className="border border-slate-200 p-3 font-medium bg-indigo-100 transition-all duration-300">
                        Revised Risk Acceptable to risk owner? (Y/N)
                      </th>
                    </>
                  ) : (
                    <th className="border border-slate-200 p-3 font-medium bg-indigo-100"></th>
                  )}

                  {/* Risk Mitigation Plan subheaders */}
                  {expandedGroups.mitigationPlan ? (
                    <>
                      <th className="border border-slate-200 p-3 font-medium bg-green-100 transition-all duration-300">
                        Further Planned Action
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
                        Is Ongoing?
                      </th>
                      <th className="border border-slate-200 p-3 font-medium bg-green-100 transition-all duration-300">
                        Is Recurrent?
                      </th>
                      <th className="border border-slate-200 p-3 font-medium bg-green-100 transition-all duration-300">
                        Planned Completion Date
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
        // Complete Table with All Required Fields
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
                  <th className="border border-slate-200 p-3.5 text-left text-slate-700 font-semibold bg-slate-50">
                    Context
                  </th>
                  <th className="border border-slate-200 p-3.5 text-left text-slate-700 font-semibold bg-slate-50">
                    Applicable Activity
                  </th>

                  {/* Impact Assessment column group */}
                  <th
                    className="border border-slate-200 bg-blue-600 text-white p-3.5 cursor-pointer font-semibold hover:bg-blue-700 transition-colors duration-300"
                    onClick={() => toggleGroup("impactAssessment")}
                    colSpan={expandedGroups.impactAssessment ? 7 : 1}
                  >
                    <div className="flex items-center justify-center">
                      <span>Impact Assessment</span>
                      {renderExpandIcon(expandedGroups.impactAssessment)}
                    </div>
                  </th>

                  {/* Impact Ratings column group */}
                  <th
                    className="border border-slate-200 bg-purple-600 text-white p-3.5 cursor-pointer font-semibold hover:bg-purple-700 transition-colors duration-300"
                    onClick={() => toggleGroup("impactRatings")}
                    colSpan={expandedGroups.impactRatings ? 2 : 1}
                  >
                    <div className="flex items-center justify-center">
                      <span>Impact Ratings</span>
                      {renderExpandIcon(expandedGroups.impactRatings)}
                    </div>
                  </th>

                  {/* Severity column group */}
                  <th
                    className="border border-slate-200 bg-orange-600 text-white p-3.5 cursor-pointer font-semibold hover:bg-orange-700 transition-colors duration-300"
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
                    className="border border-slate-200 bg-yellow-600 text-white p-3.5 cursor-pointer font-semibold hover:bg-yellow-700 transition-colors duration-300"
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
                    colSpan={expandedGroups.riskRevision ? 6 : 1}
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
                  <th className="border border-slate-200 p-3 font-medium"></th>
                  {/* Context */}
                  <th className="border border-slate-200 p-3 font-medium"></th>
                  {/* Applicable Activity */}

                  {/* Impact Assessment subheaders */}
                  {expandedGroups.impactAssessment ? (
                    <>
                      <th className="border border-slate-200 p-3 font-medium bg-blue-100 transition-all duration-300">
                        Impact on Confidentiality (Y/N)
                      </th>
                      <th className="border border-slate-200 p-3 font-medium bg-blue-100 transition-all duration-300">
                        Impact on Integrity (Y/N)
                      </th>
                      <th className="border border-slate-200 p-3 font-medium bg-blue-100 transition-all duration-300">
                        Impact on Availability (Y/N)
                      </th>
                      <th className="border border-slate-200 p-3 font-medium bg-blue-100 transition-all duration-300">
                        Breach of legal obligation (Y/N)
                      </th>
                      <th className="border border-slate-200 p-3 font-medium bg-blue-100 transition-all duration-300">
                        On customer
                      </th>
                      <th className="border border-slate-200 p-3 font-medium bg-blue-100 transition-all duration-300">
                        On operating capability
                      </th>
                      <th className="border border-slate-200 p-3 font-medium bg-blue-100 transition-all duration-300">
                        Financial damage
                      </th>
                    </>
                  ) : (
                    <th className="border border-slate-200 p-3 font-medium bg-blue-100"></th>
                  )}

                  {/* Impact Ratings subheaders */}
                  {expandedGroups.impactRatings ? (
                    <>
                      <th className="border border-slate-200 p-3 font-medium bg-purple-100 transition-all duration-300">
                        Consequence Rating
                      </th>
                      <th className="border border-slate-200 p-3 font-medium bg-purple-100 transition-all duration-300">
                        Likelihood Rating
                      </th>
                    </>
                  ) : (
                    <th className="border border-slate-200 p-3 font-medium bg-purple-100"></th>
                  )}

                  {/* Severity subheaders */}
                  {expandedGroups.severity ? (
                    <>
                      <th className="border border-slate-200 p-3 font-medium bg-orange-100 transition-all duration-300">
                        Consequence Rating
                      </th>
                      <th className="border border-slate-200 p-3 font-medium bg-orange-100 transition-all duration-300">
                        Likelihood Rating
                      </th>
                    </>
                  ) : (
                    <th className="border border-slate-200 p-3 font-medium bg-orange-100"></th>
                  )}

                  {/* Control Assessment subheaders */}
                  {expandedGroups.controlAssessment ? (
                    <>
                      <th className="border border-slate-200 p-3 font-medium bg-yellow-100 transition-all duration-300">
                        Description
                      </th>
                      <th className="border border-slate-200 p-3 font-medium bg-yellow-100 transition-all duration-300">
                        Rating
                      </th>
                    </>
                  ) : (
                    <th className="border border-slate-200 p-3 font-medium bg-yellow-100"></th>
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
                        Revised Control Rating
                      </th>
                      <th className="border border-slate-200 p-3 font-medium bg-indigo-100 transition-all duration-300">
                        Residual Risk Rating
                      </th>
                      <th className="border border-slate-200 p-3 font-medium bg-indigo-100 transition-all duration-300">
                        Revised Risk Acceptable to risk owner? (Y/N)
                      </th>
                    </>
                  ) : (
                    <th className="border border-slate-200 p-3 font-medium bg-indigo-100"></th>
                  )}

                  {/* Risk Mitigation Plan subheaders */}
                  {expandedGroups.mitigationPlan ? (
                    <>
                      <th className="border border-slate-200 p-3 font-medium bg-green-100 transition-all duration-300">
                        Further Planned Action
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
                        Is Ongoing?
                      </th>
                      <th className="border border-slate-200 p-3 font-medium bg-green-100 transition-all duration-300">
                        Is Recurrent?
                      </th>
                      <th className="border border-slate-200 p-3 font-medium bg-green-100 transition-all duration-300">
                        Planned Completion Date
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
                      {/* Action buttons */}
                      <td className="border border-slate-200 p-3">
                        <div className="flex space-x-2">
                          <button
                            className="p-1 bg-blue-100 rounded hover:bg-blue-200 transition-colors"
                            title="View Details"
                            onClick={(e) => {
                              e.stopPropagation();
                              openModal("view", risk);
                            }}
                          >
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
                            className="p-1 bg-green-100 rounded hover:bg-green-200 transition-colors"
                            title="Edit"
                            onClick={(e) => {
                              e.stopPropagation();
                              openModal("edit", risk);
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-5 h-5 text-green-600"
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
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteRisk(risk.id);
                            }}
                          >
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
                        {risk.risk_id || risk.riskId || '-'}
                      </td>
                      <td className="border border-slate-200 p-3">
                        {risk.vulnerabilityType || risk.vulnerability_type || '-'}
                      </td>
                      <td className="border border-slate-200 p-3">
                        {risk.threatDescription || risk.threat_description || '-'}
                      </td>
                      <td className="border border-slate-200 p-3">
                        {risk.context || '-'}
                      </td>
                      <td className="border border-slate-200 p-3">
                        {risk.applicableActivity || risk.applicable_activity || '-'}
                      </td>

                      {/* Impact Assessment cells */}
                      {expandedGroups.impactAssessment ? (
                        <>
                          <td className={`border border-slate-200 p-3 text-center ${getImpactColor(risk.impactAssessment?.confidentiality || risk.impact_confidentiality)}`}>
                            {risk.impactAssessment?.confidentiality || risk.impact_confidentiality || 'N'}
                          </td>
                          <td className={`border border-slate-200 p-3 text-center ${getImpactColor(risk.impactAssessment?.integrity || risk.impact_integrity)}`}>
                            {risk.impactAssessment?.integrity || risk.impact_integrity || 'N'}
                          </td>
                          <td className={`border border-slate-200 p-3 text-center ${getImpactColor(risk.impactAssessment?.availability || risk.impact_availability)}`}>
                            {risk.impactAssessment?.availability || risk.impact_availability || 'N'}
                          </td>
                          <td className={`border border-slate-200 p-3 text-center ${getImpactColor(risk.impactAssessment?.legalBreach || risk.breach_legal)}`}>
                            {risk.impactAssessment?.legalBreach || risk.breach_legal || 'N'}
                          </td>
                          <td className="border border-slate-200 p-3 text-center">
                            {risk.impactAssessment?.onCustomer || risk.impact_customer || 1}
                          </td>
                          <td className="border border-slate-200 p-3 text-center">
                            {risk.impactAssessment?.onServiceCapability || risk.impact_operating || 1}
                          </td>
                          <td className="border border-slate-200 p-3 text-center">
                            {risk.impactAssessment?.financialDamage || risk.impact_financial || 1}
                          </td>
                        </>
                      ) : (
                        <td className="border border-slate-200 p-3 text-center bg-blue-50">
                          {`${risk.impactAssessment?.confidentiality || risk.impact_confidentiality || 'N'}/${risk.impactAssessment?.integrity || risk.impact_integrity || 'N'}/${risk.impactAssessment?.availability || risk.impact_availability || 'N'}`}
                        </td>
                      )}

                      {/* Impact Ratings cells */}
                      {expandedGroups.impactRatings ? (
                        <>
                          <td className={`border border-slate-200 p-3 text-center ${getRatingColor(risk.impactAssessment?.consequenceRating || risk.consequence_rating)}`}>
                            {risk.impactAssessment?.consequenceRating || risk.consequence_rating || 1}
                          </td>
                          <td className={`border border-slate-200 p-3 text-center ${getRatingColor(risk.impactAssessment?.likelihoodRating || risk.likelihood_rating)}`}>
                            {risk.impactAssessment?.likelihoodRating || risk.likelihood_rating || 1}
                          </td>
                        </>
                      ) : (
                        <td className={`border border-slate-200 p-3 text-center bg-purple-50 ${getRatingColor(Math.max(risk.impactAssessment?.consequenceRating || risk.consequence_rating || 1, risk.impactAssessment?.likelihoodRating || risk.likelihood_rating || 1))}`}>
                          {`C:${risk.impactAssessment?.consequenceRating || risk.consequence_rating || 1} S:${risk.impactAssessment?.likelihoodRating || risk.likelihood_rating || 1}`}
                        </td>
                      )}

                      {/* Severity cells */}
                      {expandedGroups.severity ? (
                        <>
                          <td className={`border border-slate-200 p-3 text-center ${getRatingColor(risk.impactAssessment?.consequenceRating || risk.consequence_rating)}`}>
                            {risk.impactAssessment?.consequenceRating || risk.consequence_rating || 1}
                          </td>
                          <td className={`border border-slate-200 p-3 text-center ${getRatingColor(risk.impactAssessment?.likelihoodRating || risk.likelihood_rating)}`}>
                            {risk.impactAssessment?.likelihoodRating || risk.likelihood_rating || 1}
                          </td>
                        </>
                      ) : (
                        <td className="border border-slate-200 p-3 text-center bg-orange-50">
                          {`${risk.impactAssessment?.consequenceRating || risk.consequence_rating || 1}/${risk.impactAssessment?.likelihoodRating || risk.likelihood_rating || 1}`}
                        </td>
                      )}

                      {/* Control Assessment cells */}
                      {expandedGroups.controlAssessment ? (
                        <>
                          <td className="border border-slate-200 p-3">
                            {risk.controlAssessment?.description || risk.existing_control_desc || '-'}
                          </td>
                          <td className={`border border-slate-200 p-3 text-center ${getRatingColor(risk.controlAssessment?.rating || risk.existing_control_rating)}`}>
                            {risk.controlAssessment?.rating || risk.existing_control_rating || 1}
                          </td>
                        </>
                      ) : (
                        <td className="border border-slate-200 p-3 text-center bg-yellow-50">
                          {risk.controlAssessment?.rating || risk.existing_control_rating || 1}
                        </td>
                      )}

                      {/* Risk Assessment cells */}
                      {expandedGroups.riskAssessment ? (
                        <>
                          <td
                            className={`border border-slate-200 p-3 text-center ${getRiskRatingColor(
                              risk.riskAssessment?.riskRating || risk.risk_rating
                            )}`}
                          >
                            {risk.riskAssessment?.riskRating || risk.risk_rating || '-'}
                          </td>
                          <td className="border border-slate-200 p-3 bg-slate-50">
                            {risk.riskAssessment?.riskCategory || risk.risk_category || '-'}
                          </td>
                          <td className="border border-slate-200 p-3 bg-slate-50">
                            {risk.riskAssessment?.departmentBU || risk.department || '-'}
                          </td>
                          <td className="border border-slate-200 p-3 bg-slate-50">
                            {risk.riskAssessment?.riskOwner || risk.risk_owner || '-'}
                          </td>
                        </>
                      ) : (
                        <td
                          className={`border border-slate-200 p-3 text-center ${getRiskRatingColor(
                            risk.riskAssessment?.riskRating || risk.risk_rating
                          )}`}
                        >
                          {risk.riskAssessment?.riskRating || risk.risk_rating || '-'}
                        </td>
                      )}

                      {/* Risk Revision cells */}
                      {expandedGroups.riskRevision ? (
                        <>
                          <td className="border border-slate-200 p-3 bg-indigo-50">
                            {risk.riskRevision?.soaControl || risk.applicable_saf_control || '-'}
                          </td>
                          <td className="border border-slate-200 p-3 bg-indigo-50">
                            {risk.riskRevision?.soaControlDescription || risk.saf_control_desc || '-'}
                          </td>
                          <td className="border border-slate-200 p-3 text-center bg-indigo-50">
                            {risk.riskRevision?.meetsRequirements || risk.meets_legal || '-'}
                          </td>
                          <td
                            className={`border border-slate-200 p-3 text-center ${getRatingColor(
                              risk.riskRevision?.revisedControlRating || risk.revised_control_rating
                            )}`}
                          >
                            {risk.riskRevision?.revisedControlRating || risk.revised_control_rating || '-'}
                          </td>
                          <td
                            className={`border border-slate-200 p-3 text-center ${getResidualRiskColor(
                              risk.riskRevision?.residualRiskRating || risk.residual_risk_rating
                            )}`}
                          >
                            {risk.riskRevision?.residualRiskRating || risk.residual_risk_rating || '-'}
                          </td>
                          <td className="border border-slate-200 p-3 text-center bg-indigo-50">
                            {risk.riskRevision?.acceptableToOwner || risk.residual_risk_acceptable || '-'}
                          </td>
                        </>
                      ) : (
                        <td
                          className={`border border-slate-200 p-3 text-center bg-indigo-50 ${getResidualRiskColor(
                            risk.riskRevision?.residualRiskRating || risk.residual_risk_rating
                          )}`}
                        >
                          RR: {risk.riskRevision?.residualRiskRating || risk.residual_risk_rating || '-'}
                        </td>
                      )}

                      {/* Risk Mitigation Plan cells */}
                      {expandedGroups.mitigationPlan ? (
                        <>
                          <td className="border border-slate-200 p-3 bg-green-50">
                            {risk.mitigationTask?.furtherPlannedAction || risk.further_planned_action || '-'}
                          </td>
                          <td className="border border-slate-200 p-3 bg-green-50">
                            {risk.mitigationTask?.taskId || risk.task_id || '-'}
                          </td>
                          <td className="border border-slate-200 p-3 bg-green-50">
                            {risk.mitigationTask?.taskDescription || risk.task_description || '-'}
                          </td>
                          <td className="border border-slate-200 p-3 bg-green-50">
                            {risk.mitigationTask?.taskOwner || risk.task_owner || '-'}
                          </td>
                          <td className="border border-slate-200 p-3 text-center bg-green-50">
                            {risk.mitigationTask?.isOngoing || risk.ongoing_task || 'N'}
                          </td>
                          <td className="border border-slate-200 p-3 text-center bg-green-50">
                            {risk.mitigationTask?.isRecurrent || risk.recurrent_task || 'N'}
                          </td>
                          <td className="border border-slate-200 p-3 bg-green-50">
                            {risk.mitigationTask?.plannedCompletionDate || risk.planned_completion_date || '-'}
                          </td>
                          <td className="border border-slate-200 p-3 bg-green-50">
                            {risk.mitigationTask?.frequency || risk.recurrent_frequency || '-'}
                          </td>
                        </>
                      ) : (
                        <td className="border border-slate-200 p-3 text-center bg-green-50">
                          Task: {risk.mitigationTask?.taskId || risk.task_id || 'None'}
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
                    ? "Edit Assessment Plan"
                    : modalType === "view"
                      ? "View Assessment Plan"
                      : "New Assessment Plan"}
                </h3>
              </div>
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 max-h-[80vh] overflow-y-auto">
                {/* Form for creating/editing/viewing Assessment Plan */}
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
                              placeholder="e.g., RA_001"
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
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Context
                            </label>
                            <select
                              value={formData.context || "Natural"}
                              onChange={(e) =>
                                handleFormChange(e, null, "context")
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              disabled={modalType === "view"}
                            >
                              <option value="Natural">Natural</option>
                              <option value="Human">Human</option>
                              <option value="Technical">Technical</option>
                              <option value="Environmental">Environmental</option>
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

                      {/* Impact Assessment */}
                      <div className="bg-blue-50 p-4 rounded-md">
                        <h4 className="text-lg font-medium mb-4 text-blue-800">
                          Impact Assessment
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Impact on Confidentiality (Y/N)
                            </label>
                            <select
                              value={formData.ra_impact_assessment?.impact_on_confidentiality || "N"}
                              onChange={(e) =>
                                handleSelectChange(e, "ra_impact_assessment", "impact_on_confidentiality")
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
                              Impact on Integrity (Y/N)
                            </label>
                            <select
                              value={formData.ra_impact_assessment?.impact_on_integrity || "N"}
                              onChange={(e) =>
                                handleSelectChange(e, "ra_impact_assessment", "impact_on_integrity")
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
                              Impact on Availability (Y/N)
                            </label>
                            <select
                              value={formData.ra_impact_assessment?.impact_on_availability || "N"}
                              onChange={(e) =>
                                handleSelectChange(e, "ra_impact_assessment", "impact_on_availability")
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
                              Breach of Legal Obligation (Y/N)
                            </label>
                            <select
                              value={formData.ra_impact_assessment?.breach_of_legal_obligation || "N"}
                              onChange={(e) =>
                                handleSelectChange(e, "ra_impact_assessment", "breach_of_legal_obligation")
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              disabled={modalType === "view"}
                            >
                              <option value="Y">Yes</option>
                              <option value="N">No</option>
                            </select>
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Description of Legal Obligation
                            </label>
                            <textarea
                              value={formData.ra_impact_assessment?.description_of_legal_obligation || ""}
                              onChange={(e) =>
                                handleFormChange(e, "ra_impact_assessment", "description_of_legal_obligation")
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              rows="2"
                              disabled={modalType === "view"}
                            ></textarea>
                          </div>
                        </div>
                      </div>

                      {/* Impact Ratings */}
                      <div className="bg-purple-50 p-4 rounded-md">
                        <h4 className="text-lg font-medium mb-4 text-purple-800">
                          Impact Ratings
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              On Customer (1-5)
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="5"
                              value={formData.ra_impact_assessment?.on_customer || 1}
                              onChange={(e) =>
                                handleNumericChange(e, "ra_impact_assessment", "on_customer")
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
                              value={formData.ra_impact_assessment?.on_service_capability || 1}
                              onChange={(e) =>
                                handleNumericChange(e, "ra_impact_assessment", "on_service_capability")
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
                              value={formData.ra_impact_assessment?.financial_damage || 1}
                              onChange={(e) =>
                                handleNumericChange(e, "ra_impact_assessment", "financial_damage")
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              disabled={modalType === "view"}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Spread Magnitude (1-5)
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="5"
                              value={formData.ra_impact_assessment?.spread_magnitude || 1}
                              onChange={(e) =>
                                handleNumericChange(e, "ra_impact_assessment", "spread_magnitude")
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              disabled={modalType === "view"}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Severity Assessment */}
                      <div className="bg-orange-50 p-4 rounded-md">
                        <h4 className="text-lg font-medium mb-4 text-orange-800">
                          Severity Assessment
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Consequence Rating (1-5)
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="5"
                              value={formData.ra_impact_assessment?.consequence_rating || 1}
                              onChange={(e) =>
                                handleNumericChange(e, "ra_impact_assessment", "consequence_rating")
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              disabled={modalType === "view"}
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
                              value={formData.ra_impact_assessment?.likelihood_rating || 1}
                              onChange={(e) =>
                                handleNumericChange(e, "ra_impact_assessment", "likelihood_rating")
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              disabled={modalType === "view"}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Control Assessment */}
                      <div className="bg-yellow-50 p-4 rounded-md">
                        <h4 className="text-lg font-medium mb-4 text-yellow-800">
                          Control Assessment
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Control Description
                            </label>
                            <textarea
                              value={formData.ra_control_assessment?.description || ""}
                              onChange={(e) =>
                                handleFormChange(e, "ra_control_assessment", "description")
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              rows="3"
                              disabled={modalType === "view"}
                            ></textarea>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Control Rating (1-5)
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="5"
                              value={formData.ra_control_assessment?.rating || 1}
                              onChange={(e) =>
                                handleNumericChange(e, "ra_control_assessment", "rating")
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              disabled={modalType === "view"}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Risk Assessment */}
                      <div className="bg-slate-100 p-4 rounded-md">
                        <h4 className="text-lg font-medium mb-4 text-slate-800">
                          Risk Assessment
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Risk Rating
                            </label>
                            {/* This is calculated automatically */}
                            <input
                              type="number"
                              min="1"
                              value={formData.ra_risk_assessment?.risk_rating ?? 1}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-100"
                              readOnly
                              disabled
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Risk Category
                            </label>
                            {/* Make Category disabled and limit options */}
                            <select
                              value={formData.ra_risk_assessment?.risk_category ?? "Not Significant"}
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
                              value={formData.ra_risk_assessment?.department_bu ?? ""}
                              onChange={(e) =>
                                handleFormChange(
                                  e,
                                  "ra_risk_assessment",
                                  "department_bu"
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              disabled={modalType === "view"}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Risk Owner
                            </label>
                            <input
                              type="text"
                              value={formData.ra_risk_assessment?.risk_owner ?? ""}
                              onChange={(e) =>
                                handleFormChange(
                                  e,
                                  "ra_risk_assessment",
                                  "risk_owner"
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
                                formData.ra_risk_assessment?.risk_mitigation_strategy ?? "Tolerate"
                              }
                              onChange={(e) =>
                                handleSelectChange(
                                  e,
                                  "ra_risk_assessment",
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

                      {/* Risk Revision */}
                      <div className="bg-indigo-50 p-4 rounded-md">
                        <h4 className="text-lg font-medium mb-4 text-indigo-800">
                          Risk Revision
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Applicable SOA Control
                            </label>
                            <input
                              type="text"
                              value={
                                formData.ra_risk_revision?.applicable_soa_control ?? ""
                              }
                              onChange={(e) =>
                                handleFormChange(
                                  e,
                                  "ra_risk_revision",
                                  "applicable_soa_control"
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              disabled={modalType === "view"}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              SOA Control Description
                            </label>
                            <textarea
                              value={
                                formData.ra_risk_revision?.soa_control_description ?? ""
                              }
                              onChange={(e) =>
                                handleFormChange(
                                  e,
                                  "ra_risk_revision",
                                  "soa_control_description"
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              rows="2"
                              disabled={modalType === "view"}
                            ></textarea>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Meet Legal Requirements? (Y/N)
                            </label>
                            <select
                              value={formData.ra_risk_revision?.planned_controls_meet_requirements ?? "Y"}
                              onChange={(e) =>
                                handleSelectChange(
                                  e,
                                  "ra_risk_revision",
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
                              Revised Control Rating
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="5"
                              value={formData.ra_risk_revision?.revised_control_rating ?? 1}
                              onChange={(e) =>
                                handleNumericChange(
                                  e,
                                  "ra_risk_revision",
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
                            {/* Make Residual Risk disabled */}
                            <input
                              type="number"
                              min="1"
                              value={formData.ra_risk_revision?.residual_risk_rating ?? 1}
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
                                formData.ra_risk_revision?.acceptable_to_risk_owner ?? "Y"
                              }
                              onChange={(e) =>
                                handleSelectChange(
                                  e,
                                  "ra_risk_revision",
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

                      {/* Risk Mitigation Plan */}
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
                                formData.ra_mitigation_task?.further_planned_action ?? ""
                              }
                              onChange={(e) =>
                                handleFormChange(
                                  e,
                                  "ra_mitigation_task",
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
                              Task ID
                            </label>
                            <input
                              type="text"
                              value={
                                formData.ra_mitigation_task?.task_id ?? ""
                              }
                              onChange={(e) =>
                                handleFormChange(
                                  e,
                                  "ra_mitigation_task",
                                  "task_id"
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
                                formData.ra_mitigation_task?.task_description ?? ""
                              }
                              onChange={(e) =>
                                handleFormChange(
                                  e,
                                  "ra_mitigation_task",
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
                              value={formData.ra_mitigation_task?.task_owner ?? ""}
                              onChange={(e) =>
                                handleFormChange(
                                  e,
                                  "ra_mitigation_task",
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
                              value={formData.ra_mitigation_task?.is_ongoing ?? "N"}
                              onChange={(e) =>
                                handleSelectChange(
                                  e,
                                  "ra_mitigation_task",
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
                                formData.ra_mitigation_task?.planned_completion_date ?? ""
                              }
                              onChange={(e) =>
                                handleFormChange(
                                  e,
                                  "ra_mitigation_task",
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
                              value={formData.ra_mitigation_task?.is_recurrent ?? "N"}
                              onChange={(e) =>
                                handleSelectChange(
                                  e,
                                  "ra_mitigation_task",
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
                              value={formData.ra_mitigation_task?.frequency ?? ""}
                              onChange={(e) =>
                                handleFormChange(
                                  e,
                                  "ra_mitigation_task",
                                  "frequency"
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              placeholder="e.g., Monthly, Weekly"
                              disabled={
                                modalType === "view" ||
                                formData.ra_mitigation_task?.is_recurrent === "N"
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
        title="Upload Risk Assessment Excel"
        reportName={selectedSheet?.name}
        fileType="excel"
        showDownloadTemplate={true}
        reportType="risk_assessment"
        reportId={selectedSheet?.id}
        projectId={effectiveProjectId}
      />


    </div>
  );
};

export default RiskAssessment;
