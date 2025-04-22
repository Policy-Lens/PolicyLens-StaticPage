import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../../../utils/api';
import Vapt from './Vapt';
import RiskTreatment from "./RiskTreatment"
import { useParams } from 'react-router-dom';
import LegendsModal from './LegendsModal';
import { message } from "antd"; // Import Ant Design message

// Reusable Confirmation Modal Component
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Delete", cancelText = "Cancel" }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                {/* Background overlay */}
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

                {/* Modal panel */}
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                </svg>
                            </div>
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">{title}</h3>
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

const MyReports = () => {
    // State to track which column groups are expanded
    const {projectid} = useParams()
    const [expandedGroups, setExpandedGroups] = useState({
        impactAssessment: false,
        impactRatings: false,
        severity: false,
        controlAssessment: false,
        riskAssessment: false,
        riskRevision: false,
        mitigationPlan: false
    });

    // State to track active tab
    const [activeTab, setActiveTab] = useState('riskAssessment'); // 'riskAssessment', 'riskTreatment', or 'vapt'

    // State for managing modal visibility
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('form'); // 'form' or 'edit' or 'excel'

    // State for legends modal
    const [showLegendsModal, setShowLegendsModal] = useState(false);

    // State for tracking which risk is being edited
    const [editingRisk, setEditingRisk] = useState(null);

    // State for current project
    const [currentProject, setCurrentProject] = useState({
        id: '1',
        name: 'Project Alpha'
    });

    // State for sheets and selected sheet
    const [sheets, setSheets] = useState([]);
    const [selectedSheet, setSelectedSheet] = useState(null);
    const [showSheetModal, setShowSheetModal] = useState(false);
    const [newSheetName, setNewSheetName] = useState('');

    // States for API interactions
    const [riskData, setRiskData] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Start with loading state

    // State for form data
    const [formData, setFormData] = useState({
        risk_id: '',
        vulnerability_type: '',
        threat_description: '',
        context: 'Natural',
        applicable_activity: '',
        impact_assessment: {
            impact_on_confidentiality: 'N',
            impact_on_integrity: 'N',
            impact_on_availability: 'N',
            breach_of_legal_obligation: 'N',
            description_of_legal_obligation: ''
        },
        impact_ratings: {
            on_customer: 1,
            on_service_capability: 1,
            financial_damage: 1,
            spread_magnitude: 1
        },
        severity: {
            consequence_rating: 1,
            likelihood_rating: 1
        },
        control_assessment: {
            description: '',
            rating: 1
        },
        risk_assessment: {
            risk_rating: 5,
            risk_category: 'Not Significant',
            department_bu: 'Admin',
            risk_owner: '',
            risk_mitigation_strategy: 'Tolerate'
        },
        risk_revision: {
            applicable_soa_control: '',
            planned_controls_meet_requirements: 'Y',
            revised_control_rating: 1,
            residual_risk_rating: 5,
            acceptable_to_risk_owner: 'Y'
        },
        mitigation_task: {
            task_id: '',
            task_description: '',
            task_owner: '',
            is_ongoing: 'Y',
            is_recurrent: 'N',
            frequency: '',
            planned_completion_date: ''
        }
    });

    // State for file upload
    const [excelFile, setExcelFile] = useState(null);

    // State for Confirmation Modal
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmModalProps, setConfirmModalProps] = useState({
        onConfirm: () => { },
        title: 'Confirm Action',
        message: 'Are you sure?',
    });

    // Toggle expansion of a column group
    const toggleGroup = (group) => {
        setExpandedGroups(prev => ({
            ...prev,
            [group]: !prev[group]
        }));
    };

    // Function to fetch risks
    const fetchRisks = async () => {
        setIsLoading(true);

        try {
            // Call the API to get risks for the current project
            const response = await apiRequest(
                "GET",
                `/api/rarpt/project/${projectid}/risks/`,
                null,
                true
            );

            // Check if the response contains data
            if (response.data && Array.isArray(response.data)) {
                // Transform API data to match the expected format for the frontend
                const formattedRisks = response.data.map(risk => {
                    // Ensure all properties exist to prevent 'undefined' errors
                    return {
                        id: risk.id || '',
                        risk_id: risk.risk_id || '',
                        vulnerabilityType: risk.vulnerability_type || 'Not Specified',
                        threatDescription: risk.threat_description || '',
                        context: risk.context || '',
                        applicableActivity: risk.applicable_activity || '',
                        // Impact assessment fields
                        impactAssessment: {
                            confidentiality: risk.impact_assessment?.impact_on_confidentiality || 'N',
                            integrity: risk.impact_assessment?.impact_on_integrity || 'N',
                            availability: risk.impact_assessment?.impact_on_availability || 'N',
                            legalObligation: risk.impact_assessment?.breach_of_legal_obligation || 'N',
                            legalObligationDesc: risk.impact_assessment?.description_of_legal_obligation || ''
                        },
                        // Impact ratings fields - also come from impact_assessment
                        impactRatings: {
                            customer: risk.impact_assessment?.on_customer || 1,
                            serviceCapability: risk.impact_assessment?.on_service_capability || 1,
                            financialDamage: risk.impact_assessment?.financial_damage || 1,
                            spreadMagnitude: risk.impact_assessment?.spread_magnitude || 1
                        },
                        // Severity also comes from impact_assessment
                        severity: {
                            consequenceRating: risk.impact_assessment?.consequence_rating || 1,
                            likelihoodRating: risk.impact_assessment?.likelihood_rating || 1
                        },
                        // Control assessment
                        controlAssessment: {
                            description: risk.control_assessment?.description || '',
                            rating: risk.control_assessment?.rating || 1
                        },
                        // Risk assessment
                        riskAssessment: {
                            riskRating: risk.risk_assessment?.risk_rating || 1,
                            riskCategory: risk.risk_assessment?.risk_category || 'Not Significant',
                            departmentBU: risk.risk_assessment?.department_bu || '',
                            riskOwner: risk.risk_assessment?.risk_owner || '',
                            mitigationStrategy: risk.risk_assessment?.risk_mitigation_strategy || 'Tolerate'
                        },
                        // Risk revision
                        riskRevision: {
                            soaControl: risk.risk_revision?.applicable_soa_control || '',
                            soaControlDesc: risk.risk_revision?.soa_control_description || '',
                            meetsRequirements: risk.risk_revision?.planned_controls_meet_requirements || 'Y',
                            revisedControlRating: risk.risk_revision?.revised_control_rating || 1,
                            residualRiskRating: risk.risk_revision?.residual_risk_rating || 1,
                            acceptableToOwner: risk.risk_revision?.acceptable_to_risk_owner || 'Y'
                        },
                        // Mitigation plan - construct from available data or use defaults
                        mitigationPlan: {
                            furtherPlannedAction: 'Yes',
                            taskId: risk.mitigation_task?.task_id || '',
                            taskDescription: risk.mitigation_task?.task_description || '',
                            taskOwner: risk.mitigation_task?.task_owner || '',
                            isOngoing: risk.mitigation_task?.is_ongoing || 'Y',
                            plannedCompletionDate: risk.mitigation_task?.planned_completion_date || '',
                            isRecurrent: risk.mitigation_task?.is_recurrent || 'N',
                            frequency: risk.mitigation_task?.frequency || ''
                        }
                    };
                });

                setRiskData(formattedRisks);
            } else {
                console.warn("API returned no risks or invalid data format");
                setRiskData([]);
            }
        } catch (err) {
            console.error('Error fetching risks:', err);
            setRiskData([]);
        } finally {
            setIsLoading(false);
        }
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
        <span className={`ml-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-opacity-50 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
        </span>
    );

    // Function to open modal with specific type
    const openModal = (type, riskToEdit = null) => {
        setModalType(type);
        setExcelFile(null);

        if ((type === 'edit' || type === 'view') && riskToEdit) {
            // When editing or viewing, populate form with existing risk data
            setEditingRisk(riskToEdit);
            // Populate form with the risk data
            setFormData({
                risk_id: riskToEdit.risk_id || '',
                vulnerability_type: riskToEdit.vulnerability_type || riskToEdit.vulnerabilityType || '',
                threat_description: riskToEdit.threat_description || riskToEdit.threatDescription || '',
                context: riskToEdit.context || '',
                applicable_activity: riskToEdit.applicable_activity || riskToEdit.applicableActivity || '',
                impact_assessment: {
                    impact_on_confidentiality: riskToEdit.impact_assessment?.impact_on_confidentiality || riskToEdit.impactAssessment?.confidentiality || 'N',
                    impact_on_integrity: riskToEdit.impact_assessment?.impact_on_integrity || riskToEdit.impactAssessment?.integrity || 'N',
                    impact_on_availability: riskToEdit.impact_assessment?.impact_on_availability || riskToEdit.impactAssessment?.availability || 'N',
                    breach_of_legal_obligation: riskToEdit.impact_assessment?.breach_of_legal_obligation || riskToEdit.impactAssessment?.legalObligation || 'N',
                    description_of_legal_obligation: riskToEdit.impact_assessment?.description_of_legal_obligation || riskToEdit.impactAssessment?.legalObligationDesc || ''
                },
                impact_ratings: {
                    on_customer: riskToEdit.impact_assessment?.on_customer || riskToEdit.impactRatings?.customer || 1,
                    on_service_capability: riskToEdit.impact_assessment?.on_service_capability || riskToEdit.impactRatings?.serviceCapability || 1,
                    financial_damage: riskToEdit.impact_assessment?.financial_damage || riskToEdit.impactRatings?.financialDamage || 1,
                    spread_magnitude: riskToEdit.impact_assessment?.spread_magnitude || riskToEdit.impactRatings?.spreadMagnitude || 1
                },
                severity: {
                    consequence_rating: riskToEdit.impact_assessment?.consequence_rating || riskToEdit.severity?.consequenceRating || 1,
                    likelihood_rating: riskToEdit.impact_assessment?.likelihood_rating || riskToEdit.severity?.likelihoodRating || 1
                },
                control_assessment: {
                    description: riskToEdit.control_assessment?.description || riskToEdit.controlAssessment?.description || '',
                    rating: riskToEdit.control_assessment?.rating || riskToEdit.controlAssessment?.rating || 1
                },
                risk_assessment: {
                    risk_rating: riskToEdit.risk_assessment?.risk_rating || riskToEdit.riskAssessment?.riskRating || 1,
                    risk_category: riskToEdit.risk_assessment?.risk_category || riskToEdit.riskAssessment?.riskCategory || 'Not Significant',
                    department_bu: riskToEdit.risk_assessment?.department_bu || riskToEdit.riskAssessment?.departmentBU || '',
                    risk_owner: riskToEdit.risk_assessment?.risk_owner || riskToEdit.riskAssessment?.riskOwner || '',
                    risk_mitigation_strategy: riskToEdit.risk_assessment?.risk_mitigation_strategy || riskToEdit.riskAssessment?.mitigationStrategy || 'Tolerate'
                },
                risk_revision: {
                    applicable_soa_control: riskToEdit.risk_revision?.applicable_soa_control || riskToEdit.riskRevision?.soaControl || '',
                    soaControlDesc: riskToEdit.risk_revision?.soa_control_description || riskToEdit.riskRevision?.soaControlDesc || '',
                    planned_controls_meet_requirements: riskToEdit.risk_revision?.planned_controls_meet_requirements || riskToEdit.riskRevision?.meetsRequirements || 'Y',
                    revised_control_rating: riskToEdit.risk_revision?.revised_control_rating || riskToEdit.riskRevision?.revisedControlRating || 1,
                    residual_risk_rating: riskToEdit.risk_revision?.residual_risk_rating || riskToEdit.riskRevision?.residualRiskRating || 1,
                    acceptable_to_risk_owner: riskToEdit.risk_revision?.acceptable_to_risk_owner || riskToEdit.riskRevision?.acceptableToOwner || 'Y'
                },
                mitigation_task: {
                    task_id: riskToEdit.mitigation_task?.task_id || riskToEdit.mitigationPlan?.taskId || '',
                    task_description: riskToEdit.mitigation_task?.task_description || riskToEdit.mitigationPlan?.taskDescription || '',
                    task_owner: riskToEdit.mitigation_task?.task_owner || riskToEdit.mitigationPlan?.taskOwner || '',
                    is_ongoing: riskToEdit.mitigation_task?.is_ongoing || riskToEdit.mitigationPlan?.isOngoing || 'Y',
                    is_recurrent: riskToEdit.mitigation_task?.is_recurrent || riskToEdit.mitigationPlan?.isRecurrent || 'N',
                    frequency: riskToEdit.mitigation_task?.frequency || riskToEdit.mitigationPlan?.frequency || '',
                    planned_completion_date: riskToEdit.mitigation_task?.planned_completion_date || riskToEdit.mitigationPlan?.plannedCompletionDate || ''
                }
            });
        } else if (type === 'create') {
            // For new risk form, reset to default values
            setEditingRisk(null);
            // Reset form data to defaults
            setFormData({
                risk_id: '',
                vulnerability_type: '',
                threat_description: '',
                context: 'Natural',
                applicable_activity: '',
                impact_assessment: {
                    impact_on_confidentiality: 'N',
                    impact_on_integrity: 'N',
                    impact_on_availability: 'N',
                    breach_of_legal_obligation: 'N',
                    description_of_legal_obligation: ''
                },
                impact_ratings: {
                    on_customer: 1,
                    on_service_capability: 1,
                    financial_damage: 1,
                    spread_magnitude: 1
                },
                severity: {
                    consequence_rating: 1,
                    likelihood_rating: 1
                },
                control_assessment: {
                    description: '',
                    rating: 1
                },
                risk_assessment: {
                    risk_rating: 5,
                    risk_category: 'Not Significant',
                    department_bu: 'Admin',
                    risk_owner: '',
                    risk_mitigation_strategy: 'Tolerate'
                },
                risk_revision: {
                    applicable_soa_control: '',
                    soaControlDesc: '',
                    planned_controls_meet_requirements: 'Y',
                    revised_control_rating: 1,
                    residual_risk_rating: 5,
                    acceptable_to_risk_owner: 'Y'
                },
                mitigation_task: {
                    task_id: '',
                    task_description: '',
                    task_owner: '',
                    is_ongoing: 'Y',
                    is_recurrent: 'N',
                    frequency: '',
                    planned_completion_date: ''
                }
            });
        }

        setShowModal(true);
    };

    // Close the modal and reset form state
    const closeModal = () => {
        setShowModal(false);
        setModalType('form');
        setEditingRisk(null);

        // Reset form data to defaults
        setFormData({
            risk_id: '',
            vulnerability_type: '',
            threat_description: '',
            context: 'Natural',
            applicable_activity: '',
            impact_assessment: {
                impact_on_confidentiality: 'N',
                impact_on_integrity: 'N',
                impact_on_availability: 'N',
                breach_of_legal_obligation: 'N',
                description_of_legal_obligation: ''
            },
            impact_ratings: {
                on_customer: 1,
                on_service_capability: 1,
                financial_damage: 1,
                spread_magnitude: 1
            },
            severity: {
                consequence_rating: 1,
                likelihood_rating: 1
            },
            control_assessment: {
                description: '',
                rating: 1
            },
            risk_assessment: {
                risk_rating: 5,
                risk_category: 'Not Significant',
                department_bu: 'Admin',
                risk_owner: '',
                risk_mitigation_strategy: 'Tolerate'
            },
            risk_revision: {
                applicable_soa_control: '',
                planned_controls_meet_requirements: 'Y',
                revised_control_rating: 1,
                residual_risk_rating: 5,
                acceptable_to_risk_owner: 'Y'
            },
            mitigation_task: {
                task_id: '',
                task_description: '',
                task_owner: '',
                is_ongoing: 'Y',
                is_recurrent: 'N',
                frequency: '',
                planned_completion_date: ''
            }
        });
    };

    // Handle form input changes
    const handleFormChange = (e, section, field) => {
        const { value } = e.target;

        if (section) {
            setFormData(prev => ({
                ...prev,
                [section]: {
                    ...prev[section],
                    [field]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    // Handle numeric input changes
    const handleNumericChange = (e, section, field) => {
        const value = parseInt(e.target.value) || 1;

        if (section) {
            setFormData(prev => ({
                ...prev,
                [section]: {
                    ...prev[section],
                    [field]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    // Handle select input changes
    const handleSelectChange = (e, section, field) => {
        if (section) {
            setFormData(prev => ({
                ...prev,
                [section]: {
                    ...prev[section],
                    [field]: e.target.value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: e.target.value
            }));
        }
    };

    // Handle file input change - static stub, no actual functionality
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setExcelFile(file);
        }
    };

    // Submit risk form
    const handleRiskSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedSheet) {
            message.error("Please select a sheet first"); // Use message.error
            return;
        }
        
        setIsLoading(true);

        try {
            const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

            // Convert form data to API format
            const apiData = {
                risk_id: formData.risk_id || "Risk_" + Date.now(),
                vulnerability_type: formData.vulnerability_type || "Default",
                threat_description: formData.threat_description || "Default threat description",
                context: formData.context || "Natural",
                applicable_activity: formData.applicable_activity || "Working in the organisation",
                ra_impact_assessment: {
                    impact_on_confidentiality: formData.impact_assessment.impact_on_confidentiality || "N",
                    impact_on_integrity: formData.impact_assessment.impact_on_integrity || "N",
                    impact_on_availability: formData.impact_assessment.impact_on_availability || "N",
                    breach_of_legal_obligation: formData.impact_assessment.breach_of_legal_obligation || "N",
                    description_of_legal_obligation: formData.impact_assessment.description_of_legal_obligation || "",
                    // Impact ratings data
                    on_customer: formData.impact_ratings.on_customer || 1,
                    on_service_capability: formData.impact_ratings.on_service_capability || 1,
                    financial_damage: formData.impact_ratings.financial_damage || 1,
                    spread_magnitude: formData.impact_ratings.spread_magnitude || 1,
                    // Severity data
                    consequence_rating: formData.severity.consequence_rating || 1,
                    likelihood_rating: formData.severity.likelihood_rating || 1
                },
                ra_control_assessment: {
                    description: formData.control_assessment.description || "Not specified",
                    rating: formData.control_assessment.rating || 1
                },
                ra_risk_assessment: {
                    risk_rating: formData.risk_assessment.risk_rating || 1,
                    risk_category: formData.risk_assessment.risk_category || "Not Significant",
                    department_bu: formData.risk_assessment.department_bu || "Admin",
                    risk_owner: formData.risk_assessment.risk_owner || "Admin",
                    risk_mitigation_strategy: formData.risk_assessment.risk_mitigation_strategy || "Tolerate"
                },
                ra_risk_revision: {
                    applicable_soa_control: formData.risk_revision.applicable_soa_control || "",
                    soa_control_description: formData.risk_revision.soaControlDesc || "",
                    planned_controls_meet_requirements: formData.risk_revision.planned_controls_meet_requirements || "Y",
                    revised_control_rating: formData.risk_revision.revised_control_rating || 1,
                    residual_risk_rating: formData.risk_revision.residual_risk_rating || 1,
                    acceptable_to_risk_owner: formData.risk_revision.acceptable_to_risk_owner || "Y"
                },
                ra_mitigation_task: {
                    task_id: formData.mitigation_task.task_id || "Task_" + Date.now(),
                    task_description: formData.mitigation_task.task_description || "Default task description",
                    task_owner: formData.mitigation_task.task_owner || "Admin",
                    is_ongoing: formData.mitigation_task.is_ongoing || "Y",
                    is_recurrent: formData.mitigation_task.is_recurrent || "N",
                    frequency: formData.mitigation_task.frequency || "",
                    planned_completion_date: formData.mitigation_task.planned_completion_date || today,
                    further_planned_action: "Yes"
                }
            };

            // Send data to the API
            const response = await apiRequest(
                "POST",
                `/api/rarpt/assessment-sheets/${selectedSheet.id}/risks/create/`,
                apiData,
                true
            );

            message.success('Risk created successfully'); // Use message.success

            // Refresh risks for the current sheet
            await fetchRisksForSheet(selectedSheet.id);

            // Reset form after successful submission
            setTimeout(() => {
                closeModal();
            }, 2000);

        } catch (err) {
            console.error('Error creating risk:', err.message || 'Unknown error');
            message.error(err.message || 'Failed to create risk'); // Use message.error
        } finally {
            setIsLoading(false);
        }
    };

    // Update existing risk
    const handleRiskUpdate = async (e) => {
        e.preventDefault();
        
        if (!selectedSheet || !editingRisk) {
            message.error("Sheet or risk not selected"); // Use message.error
            return;
        }
        
        setIsLoading(true);

        try {
            const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

            // Convert form data to API format
            const apiData = {
                risk_id: formData.risk_id || "Risk_" + Date.now(),
                vulnerability_type: formData.vulnerability_type || "Default",
                threat_description: formData.threat_description || "Default threat description",
                context: formData.context || "Natural",
                applicable_activity: formData.applicable_activity || "Working in the organisation",
                ra_impact_assessment: {
                    impact_on_confidentiality: formData.impact_assessment.impact_on_confidentiality || "N",
                    impact_on_integrity: formData.impact_assessment.impact_on_integrity || "N",
                    impact_on_availability: formData.impact_assessment.impact_on_availability || "N",
                    breach_of_legal_obligation: formData.impact_assessment.breach_of_legal_obligation || "N",
                    description_of_legal_obligation: formData.impact_assessment.description_of_legal_obligation || "",
                    // Impact ratings data
                    on_customer: formData.impact_ratings.on_customer || 1,
                    on_service_capability: formData.impact_ratings.on_service_capability || 1,
                    financial_damage: formData.impact_ratings.financial_damage || 1,
                    spread_magnitude: formData.impact_ratings.spread_magnitude || 1,
                    // Severity data
                    consequence_rating: formData.severity.consequence_rating || 1,
                    likelihood_rating: formData.severity.likelihood_rating || 1
                },
                ra_control_assessment: {
                    description: formData.control_assessment.description || "Not specified",
                    rating: formData.control_assessment.rating || 1
                },
                ra_risk_assessment: {
                    risk_rating: formData.risk_assessment.risk_rating || 1,
                    risk_category: formData.risk_assessment.risk_category || "Not Significant",
                    department_bu: formData.risk_assessment.department_bu || "Admin",
                    risk_owner: formData.risk_assessment.risk_owner || "Admin",
                    risk_mitigation_strategy: formData.risk_assessment.risk_mitigation_strategy || "Tolerate"
                },
                ra_risk_revision: {
                    applicable_soa_control: formData.risk_revision.applicable_soa_control || "",
                    soa_control_description: formData.risk_revision.soaControlDesc || "",
                    planned_controls_meet_requirements: formData.risk_revision.planned_controls_meet_requirements || "Y",
                    revised_control_rating: formData.risk_revision.revised_control_rating || 1,
                    residual_risk_rating: formData.risk_revision.residual_risk_rating || 1,
                    acceptable_to_risk_owner: formData.risk_revision.acceptable_to_risk_owner || "Y"
                },
                ra_mitigation_task: {
                    task_id: formData.mitigation_task.task_id || "Task_" + Date.now(),
                    task_description: formData.mitigation_task.task_description || "Default task description",
                    task_owner: formData.mitigation_task.task_owner || "Admin",
                    is_ongoing: formData.mitigation_task.is_ongoing || "Y",
                    is_recurrent: formData.mitigation_task.is_recurrent || "N",
                    frequency: formData.mitigation_task.frequency || "",
                    planned_completion_date: formData.mitigation_task.planned_completion_date || today,
                    further_planned_action: "Yes"
                }
            };

            // Send update to the API
            const response = await apiRequest(
                "PUT",
                `/api/rarpt/assessment-risks/${editingRisk.id}/`,
                apiData,
                true
            );

            message.success('Risk updated successfully'); // Use message.success

            // Refresh risks to ensure data consistency
            await fetchRisksForSheet(selectedSheet.id);

            // Close modal after successful update
            setTimeout(() => {
                closeModal();
            }, 2000);

        } catch (err) {
            console.error('Error updating risk:', err.message || 'Unknown error');
            message.error(err.message || 'Failed to update risk'); // Use message.error
        } finally {
            setIsLoading(false);
        }
    };

    // Delete a risk
    const handleDeleteRisk = async (riskId) => {
        openConfirmModal({
            title: "Confirm Risk Deletion",
            message: "Are you sure you want to delete this risk assessment? This action cannot be undone.",
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
                    message.success('Risk deleted successfully');
                    if (selectedSheet) {
                        await fetchRisksForSheet(selectedSheet.id);
                    }
                } catch (err) {
                    console.error('Error deleting risk:', err);
                    message.error(err.message || 'Failed to delete risk');
                } finally {
                    setIsLoading(false);
                }
            },
            onClose: closeConfirmModal
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
                    id: risk.id || '',
                    risk_id: risk.risk_id || '',
                    vulnerabilityType: risk.vulnerability_type || '',
                    threatDescription: risk.threat_description || '',
                    context: risk.context || '',
                    applicableActivity: risk.applicable_activity || '',
                    // Impact assessment fields
                    impactAssessment: {
                        confidentiality: risk.impact_assessment?.impact_on_confidentiality || 'N',
                        integrity: risk.impact_assessment?.impact_on_integrity || 'N',
                        availability: risk.impact_assessment?.impact_on_availability || 'N',
                        legalObligation: risk.impact_assessment?.breach_of_legal_obligation || 'N',
                        legalObligationDesc: risk.impact_assessment?.description_of_legal_obligation || ''
                    },
                    // Impact ratings fields - also come from impact_assessment
                    impactRatings: {
                        customer: risk.impact_assessment?.on_customer || 1,
                        serviceCapability: risk.impact_assessment?.on_service_capability || 1,
                        financialDamage: risk.impact_assessment?.financial_damage || 1,
                        spreadMagnitude: risk.impact_assessment?.spread_magnitude || 1
                    },
                    // Severity also comes from impact_assessment
                    severity: {
                        consequenceRating: risk.impact_assessment?.consequence_rating || 1,
                        likelihoodRating: risk.impact_assessment?.likelihood_rating || 1
                    },
                    // Control assessment
                    controlAssessment: {
                        description: risk.control_assessment?.description || '',
                        rating: risk.control_assessment?.rating || 1
                    },
                    // Risk assessment
                    riskAssessment: {
                        riskRating: risk.risk_assessment?.risk_rating || 1,
                        riskCategory: risk.risk_assessment?.risk_category || 'Not Significant',
                        departmentBU: risk.risk_assessment?.department_bu || '',
                        riskOwner: risk.risk_assessment?.risk_owner || '',
                        mitigationStrategy: risk.risk_assessment?.risk_mitigation_strategy || 'Tolerate'
                    },
                    // Risk revision
                    riskRevision: {
                        soaControl: risk.risk_revision?.applicable_soa_control || '',
                        soaControlDesc: risk.risk_revision?.soa_control_description || '',
                        meetsRequirements: risk.risk_revision?.planned_controls_meet_requirements || 'Y',
                        revisedControlRating: risk.risk_revision?.revised_control_rating || 1,
                        residualRiskRating: risk.risk_revision?.residual_risk_rating || 1,
                        acceptableToOwner: risk.risk_revision?.acceptable_to_risk_owner || 'Y'
                    },
                    // Mitigation plan - construct from available data or use defaults
                    mitigationPlan: {
                        furtherPlannedAction: 'Yes',
                        taskId: risk.mitigation_task?.task_id || '',
                        taskDescription: risk.mitigation_task?.task_description || '',
                        taskOwner: risk.mitigation_task?.task_owner || '',
                        isOngoing: risk.mitigation_task?.is_ongoing || 'Y',
                        plannedCompletionDate: risk.mitigation_task?.planned_completion_date || '',
                        isRecurrent: risk.mitigation_task?.is_recurrent || 'N',
                        frequency: risk.mitigation_task?.frequency || ''
                    }
                };

                return formattedRisk;
            } else {
                console.warn("API returned no risk data or invalid format");
                return null;
            }
        } catch (err) {
            console.error('Error fetching risk details:', err);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    // Function to handle viewing a risk's details
    const handleViewRisk = async (riskId) => {
        const riskData = await fetchRiskById(riskId);
        if (riskData) {
            openModal('view', riskData);
        }
    };

    // Function to handle viewing a risk directly from an object
    const handleViewRiskByObject = (risk) => {
        // Reset any previous state
        setError(null);

        try {
            // Set the editing risk directly from the object passed
            setEditingRisk(risk);

            // Map the risk object directly to the form data
            setFormData({
                risk_id: risk.risk_id || '',
                vulnerability_type: risk.vulnerabilityType || '',
                threat_description: risk.threatDescription || '',
                context: risk.context || '',
                applicable_activity: risk.applicableActivity || '',
                impact_assessment: {
                    impact_on_confidentiality: risk.impactAssessment?.confidentiality || 'N',
                    impact_on_integrity: risk.impactAssessment?.integrity || 'N',
                    impact_on_availability: risk.impactAssessment?.availability || 'N',
                    breach_of_legal_obligation: risk.impactAssessment?.legalObligation || 'N',
                    description_of_legal_obligation: risk.impactAssessment?.legalObligationDesc || ''
                },
                impact_ratings: {
                    on_customer: risk.impactRatings?.customer || 1,
                    on_service_capability: risk.impactRatings?.serviceCapability || 1,
                    financial_damage: risk.impactRatings?.financialDamage || 1,
                    spread_magnitude: risk.impactRatings?.spreadMagnitude || 1
                },
                severity: {
                    consequence_rating: risk.severity?.consequenceRating || 1,
                    likelihood_rating: risk.severity?.likelihoodRating || 1
                },
                control_assessment: {
                    description: risk.controlAssessment?.description || '',
                    rating: risk.controlAssessment?.rating || 1
                },
                risk_assessment: {
                    risk_rating: risk.riskAssessment?.riskRating || 1,
                    risk_category: risk.riskAssessment?.riskCategory || 'Not Significant',
                    department_bu: risk.riskAssessment?.departmentBU || '',
                    risk_owner: risk.riskAssessment?.riskOwner || '',
                    risk_mitigation_strategy: risk.riskAssessment?.mitigationStrategy || 'Tolerate'
                },
                risk_revision: {
                    applicable_soa_control: risk.riskRevision?.soaControl || '',
                    soaControlDesc: risk.riskRevision?.soaControlDesc || '',
                    planned_controls_meet_requirements: risk.riskRevision?.meetsRequirements || 'Y',
                    revised_control_rating: risk.riskRevision?.revisedControlRating || 1,
                    residual_risk_rating: risk.riskRevision?.residualRiskRating || 1,
                    acceptable_to_risk_owner: risk.riskRevision?.acceptableToOwner || 'Y'
                },
                mitigation_task: {
                    task_id: risk.mitigationPlan?.taskId || '',
                    task_description: risk.mitigationPlan?.taskDescription || '',
                    task_owner: risk.mitigationPlan?.taskOwner || '',
                    is_ongoing: risk.mitigationPlan?.isOngoing || 'Y',
                    is_recurrent: risk.mitigationPlan?.isRecurrent || 'N',
                    frequency: risk.mitigationPlan?.frequency || '',
                    planned_completion_date: risk.mitigationPlan?.plannedCompletionDate || ''
                }
            });

            // Set modal to view mode and show it
            setModalType('view');
            setShowModal(true);

        } catch (err) {
            console.error("Error preparing risk for viewing:", err.message || 'Unknown error');
        }
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
                risk_id: risk.risk_id || '',
                vulnerability_type: risk.vulnerabilityType || '',
                threat_description: risk.threatDescription || '',
                context: risk.context || '',
                applicable_activity: risk.applicableActivity || '',
                impact_assessment: {
                    impact_on_confidentiality: risk.impactAssessment?.confidentiality || 'N',
                    impact_on_integrity: risk.impactAssessment?.integrity || 'N',
                    impact_on_availability: risk.impactAssessment?.availability || 'N',
                    breach_of_legal_obligation: risk.impactAssessment?.legalObligation || 'N',
                    description_of_legal_obligation: risk.impactAssessment?.legalObligationDesc || ''
                },
                impact_ratings: {
                    on_customer: risk.impactRatings?.customer || 1,
                    on_service_capability: risk.impactRatings?.serviceCapability || 1,
                    financial_damage: risk.impactRatings?.financialDamage || 1,
                    spread_magnitude: risk.impactRatings?.spreadMagnitude || 1
                },
                severity: {
                    consequence_rating: risk.severity?.consequenceRating || 1,
                    likelihood_rating: risk.severity?.likelihoodRating || 1
                },
                control_assessment: {
                    description: risk.controlAssessment?.description || '',
                    rating: risk.controlAssessment?.rating || 1
                },
                risk_assessment: {
                    risk_rating: risk.riskAssessment?.riskRating || 1,
                    risk_category: risk.riskAssessment?.riskCategory || 'Not Significant',
                    department_bu: risk.riskAssessment?.departmentBU || '',
                    risk_owner: risk.riskAssessment?.riskOwner || '',
                    risk_mitigation_strategy: risk.riskAssessment?.mitigationStrategy || 'Tolerate'
                },
                risk_revision: {
                    applicable_soa_control: risk.riskRevision?.soaControl || '',
                    soaControlDesc: risk.riskRevision?.soaControlDesc || '',
                    planned_controls_meet_requirements: risk.riskRevision?.meetsRequirements || 'Y',
                    revised_control_rating: risk.riskRevision?.revisedControlRating || 1,
                    residual_risk_rating: risk.riskRevision?.residualRiskRating || 1,
                    acceptable_to_risk_owner: risk.riskRevision?.acceptableToOwner || 'Y'
                },
                mitigation_task: {
                    task_id: risk.mitigationPlan?.taskId || '',
                    task_description: risk.mitigationPlan?.taskDescription || '',
                    task_owner: risk.mitigationPlan?.taskOwner || '',
                    is_ongoing: risk.mitigationPlan?.isOngoing || 'Y',
                    is_recurrent: risk.mitigationPlan?.isRecurrent || 'N',
                    frequency: risk.mitigationPlan?.frequency || '',
                    planned_completion_date: risk.mitigationPlan?.plannedCompletionDate || ''
                }
            });

            // Set modal to edit mode and show it
            setModalType('edit');
            setShowModal(true);

        } catch (err) {
            console.error("Error in handleEditRiskByObject:", err);
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
                    const previouslySelected = sheets.find(s => s.id === selectedSheet?.id);
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
            console.error('Error fetching sheets:', err);
            message.error(err.message || 'Failed to fetch assessment sheets'); // Use message.error
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
            message.error("Sheet name cannot be empty"); // Use message.error
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
            message.success('Sheet created successfully'); // Use message.success
            setNewSheetName('');
            setShowSheetModal(false);
            
            // Refresh sheets
            await fetchSheets();
            
            // Select the newly created sheet
            if (response.data) {
                // Find the newly created sheet in the updated list to ensure we have the latest data
                const newSheet = response.data; // Assuming API returns the created sheet
                if(newSheet) {
                    setSelectedSheet(newSheet);
                    await fetchRisksForSheet(newSheet.id);
                }
            }
        } catch (err) {
            console.error('Error creating sheet:', err);
            message.error(err.message || 'Failed to create sheet'); // Use message.error
        } finally {
            setIsLoading(false);
        }
    };

    // Function to delete a sheet
    const deleteSheet = async (sheetId, sheetName, riskCount) => {
        openConfirmModal({
            title: "Confirm Sheet Deletion",
            message: `Are you sure you want to delete the sheet "${sheetName}"? This will also delete ${riskCount} associated risks. This action cannot be undone.`, 
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
                    message.success('Sheet deleted successfully');
                    
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
                    console.error('Error deleting or fetching sheets after deletion:', err);
                    message.error(err.message || 'Failed to delete sheet or refresh list');
                } finally {
                    setIsLoading(false);
                }
            },
            onClose: closeConfirmModal
        });
    };

    // Function to handle sheet selection change
    const handleSheetChange = async (sheetId) => {
        if (sheetId === 'create') {
            setShowSheetModal(true);
            return;
        }

        const sheet = sheets.find(s => s.id === parseInt(sheetId));
        if (sheet) {
            setSelectedSheet(sheet);
            await fetchRisksForSheet(sheet.id);
        }
    };

    // Function to fetch risks for a specific sheet
    const fetchRisksForSheet = async (sheetId) => {
        setIsLoading(true);

        try {
            // Call the API to get risks for the selected sheet
            const response = await apiRequest(
                "GET",
                `/api/rarpt/assessment-sheets/${sheetId}/risks/`,
                null,
                true
            );

            // Check if the response contains data
            if (response.data && Array.isArray(response.data)) {
                // Transform API data to match the expected format for the frontend
                const formattedRisks = response.data.map(risk => {
                    // Ensure all properties exist to prevent 'undefined' errors
                    return {
                        id: risk.id || '',
                        risk_id: risk.risk_id || '',
                        vulnerabilityType: risk.vulnerability_type || 'Not Specified',
                        threatDescription: risk.threat_description || '',
                        context: risk.context || '',
                        applicableActivity: risk.applicable_activity || '',
                        // Impact assessment fields
                        impactAssessment: {
                            confidentiality: risk.ra_impact_assessment?.impact_on_confidentiality || 'N',
                            integrity: risk.ra_impact_assessment?.impact_on_integrity || 'N',
                            availability: risk.ra_impact_assessment?.impact_on_availability || 'N',
                            legalObligation: risk.ra_impact_assessment?.breach_of_legal_obligation || 'N',
                            legalObligationDesc: risk.ra_impact_assessment?.description_of_legal_obligation || ''
                        },
                        // Impact ratings fields - also come from impact_assessment
                        impactRatings: {
                            customer: risk.ra_impact_assessment?.on_customer || 1,
                            serviceCapability: risk.ra_impact_assessment?.on_service_capability || 1,
                            financialDamage: risk.ra_impact_assessment?.financial_damage || 1,
                            spreadMagnitude: risk.ra_impact_assessment?.spread_magnitude || 1
                        },
                        // Severity also comes from impact_assessment
                        severity: {
                            consequenceRating: risk.ra_impact_assessment?.consequence_rating || 1,
                            likelihoodRating: risk.ra_impact_assessment?.likelihood_rating || 1
                        },
                        // Control assessment
                        controlAssessment: {
                            description: risk.ra_control_assessment?.description || '',
                            rating: risk.ra_control_assessment?.rating || 1
                        },
                        // Risk assessment
                        riskAssessment: {
                            riskRating: risk.ra_risk_assessment?.risk_rating || 1,
                            riskCategory: risk.ra_risk_assessment?.risk_category || 'Not Significant',
                            departmentBU: risk.ra_risk_assessment?.department_bu || '',
                            riskOwner: risk.ra_risk_assessment?.risk_owner || '',
                            mitigationStrategy: risk.ra_risk_assessment?.risk_mitigation_strategy || 'Tolerate'
                        },
                        // Risk revision
                        riskRevision: {
                            soaControl: risk.ra_risk_revision?.applicable_soa_control || '',
                            soaControlDesc: risk.ra_risk_revision?.soa_control_description || '',
                            meetsRequirements: risk.ra_risk_revision?.planned_controls_meet_requirements || 'Y',
                            revisedControlRating: risk.ra_risk_revision?.revised_control_rating || 1,
                            residualRiskRating: risk.ra_risk_revision?.residual_risk_rating || 1,
                            acceptableToOwner: risk.ra_risk_revision?.acceptable_to_risk_owner || 'Y'
                        },
                        // Mitigation plan - construct from available data or use defaults
                        mitigationPlan: {
                            furtherPlannedAction: 'Yes',
                            taskId: risk.ra_mitigation_tasks?.[0]?.task_id || '',
                            taskDescription: risk.ra_mitigation_tasks?.[0]?.task_description || '',
                            taskOwner: risk.ra_mitigation_tasks?.[0]?.task_owner || '',
                            isOngoing: risk.ra_mitigation_tasks?.[0]?.is_ongoing || 'Y',
                            plannedCompletionDate: risk.ra_mitigation_tasks?.[0]?.planned_completion_date || '',
                            isRecurrent: risk.ra_mitigation_tasks?.[0]?.is_recurrent || 'N',
                            frequency: risk.ra_mitigation_tasks?.[0]?.frequency || ''
                        }
                    };
                });

                setRiskData(formattedRisks);
            } else {
                setRiskData([]);
            }
        } catch (err) {
            console.error('Error fetching risks:', err);
            message.error(err.message || 'Failed to fetch risks'); // Use message.error
            setRiskData([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Submit excel file
    const handleExcelSubmit = async (e) => {
        e.preventDefault();

        if (!excelFile) {
            message.error('Please select an Excel file'); // Use message.error
            return;
        }
        
        if (!selectedSheet) {
            message.error('Please select a sheet first'); // Use message.error
            return;
        }

        setIsLoading(true);

        try {
            // Create form data for file upload
            const formData = new FormData();
            formData.append('file', excelFile);

            // Use the updated endpoint format for the sheet-based structure
            const response = await apiRequest(
                "POST",
                `/api/rarpt/assessment-sheets/${selectedSheet.id}/risks/create/`,
                formData,
                true
            );

            message.success('Excel file uploaded successfully.'); // Use message.success

            // Always refresh the risk list after a successful upload
            await fetchRisksForSheet(selectedSheet.id);

            // Reset form after successful submission
            setTimeout(() => {
                closeModal();
            }, 2000);

        } catch (err) {
            console.error('Error uploading Excel file:', err.message || 'Unknown error');
            message.error(err.message || 'Failed to upload Excel file'); // Use message.error
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
        setConfirmModalProps({ onConfirm: () => { }, title: 'Confirm Action', message: 'Are you sure?' });
    };

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 overflow-auto">
            {/* Main Content */}
            <div className="flex flex-1 overflow-auto shadow-xl rounded-lg">
                <div className="flex flex-col w-full bg-white border-r border-slate-200 relative overflow-auto">
                    {/* Tab Navigation */}
                    <div className="flex border-b border-slate-200">
                        <button
                            className={`py-4 px-6 font-medium transition-colors ${activeTab === 'riskAssessment' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-600 hover:text-slate-800'}`}
                            onClick={() => setActiveTab('riskAssessment')}
                        >
                            Risk Assessment
                        </button>
                        <button
                            className={`py-4 px-6 font-medium transition-colors ${activeTab === 'riskTreatment' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-600 hover:text-slate-800'}`}
                            onClick={() => setActiveTab('riskTreatment')}
                        >
                            Risk Treatment
                        </button>
                        <button
                            className={`py-4 px-6 font-medium transition-colors ${activeTab === 'vapt' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-600 hover:text-slate-800'}`}
                            onClick={() => setActiveTab('vapt')}
                        >
                            VAPT
                        </button>
                    </div>

                    {/* Risk Assessment View Tab */}
                    {activeTab === 'riskAssessment' && (
                        <>
                            {/* Header */}
                            <div className="flex items-center justify-between border-b border-slate-200 p-5 bg-white sticky top-0 z-10 shadow-sm">
                                <div className="flex items-center">
                                    <h2 className="text-xl font-bold text-slate-800">Risk Assessment Reports</h2>
                                    <div className="ml-3 text-slate-600 font-medium bg-indigo-50 px-3 py-1 rounded-full">
                                        {riskData.length} reports
                                    </div>
                                </div>
                                <div className="flex items-center gap-3"> {/* Wrap dropdown and delete button */}
                                    {/* Sheet Selector Dropdown */}
                                    <div className="relative">
                                        <select
                                            className="pl-4 pr-10 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            value={selectedSheet ? selectedSheet.id : ''}
                                            onChange={(e) => handleSheetChange(e.target.value)}
                                            disabled={isLoading}
                                        >
                                            {sheets.length === 0 && (
                                                <option value="" disabled>No sheets available</option>
                                            )}
                                            {sheets.map(sheet => (
                                                <option key={sheet.id} value={sheet.id}>
                                                    {sheet.name}
                                                </option>
                                            ))}
                                            <option value="create">+ Create New Sheet</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                            </svg>
                                        </div>
                                    </div>
                                    {/* Delete Sheet Button */}
                                    <button
                                        className={`p-2.5 rounded-lg text-red-600 hover:bg-red-100 disabled:text-gray-400 disabled:bg-transparent disabled:cursor-not-allowed transition-colors`}
                                        onClick={() => selectedSheet && deleteSheet(selectedSheet.id, selectedSheet.name, riskData.length)} // Use updated deleteSheet
                                        disabled={!selectedSheet || isLoading}
                                        title={selectedSheet ? "Delete selected sheet" : "Select a sheet to delete"}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="flex gap-3">
    
                                    <button
                                        className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-md flex items-center transform hover:scale-105 transition-transform duration-200"
                                        onClick={() => openModal('create')}
                                        disabled={!selectedSheet}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                        </svg>
                                        <span>Add Risk</span>
                                    </button>
                                    <button
                                        className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-md flex items-center transform hover:scale-105 transition-transform duration-200"
                                        onClick={() => openModal('excel')}
                                        disabled={!selectedSheet}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                        </svg>
                                        <span>Upload Excel</span>
                                    </button>
                                    <button
                                        className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors shadow-md flex items-center transform hover:scale-105 transition-transform duration-200"
                                        onClick={toggleLegendsModal}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                                        </svg>
                                        <span>Show Legends</span>
                                    </button>
                                </div>
                            </div>

                            {isLoading && (
                                <div className="flex justify-center items-center p-4">
                                    <div className="loader ease-linear rounded-full border-4 border-t-4 border-slate-200 h-12 w-12 mb-4 border-t-indigo-500 animate-spin"></div>
                                </div>
                            )}

                            {/* No Sheet Selected Message */}
                            {!selectedSheet && !isLoading && (
                                <div className="flex flex-col items-center justify-center p-8 text-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-gray-400 mb-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                    </svg>
                                    <h3 className="text-xl font-medium text-gray-700 mb-2">No assessment sheet selected</h3>
                                    <p className="text-gray-500 mb-4">Please select an existing sheet or create a new one to get started.</p>
                                    <button
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                        onClick={() => setShowSheetModal(true)}
                                    >
                                        Create New Sheet
                                    </button>
                                </div>
                            )}
                            
                            {/* Risk Assessment Table or Empty State - Only show if sheet is selected */}
                            {selectedSheet && !isLoading && (
                                <> { /* Wrap conditional content in fragment */}
                                {riskData.length === 0 ? (
                                    // Empty State UI
                                    <div className="flex flex-col items-center justify-center p-10 text-center border-t border-slate-200 min-h-[300px]">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-gray-400 mb-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75c0-.231-.035-.454-.1-.664M18.75 7.5H18a2.25 2.25 0 00-2.25 2.25v6.75m0 0a2.25 2.25 0 01-2.25 2.25H5.625a2.25 2.25 0 01-2.25-2.25V6.75a2.25 2.25 0 012.25-2.25h3.75a48.47 48.47 0 011.07-.069" />
                                        </svg>
                                        <h3 className="text-xl font-medium text-gray-700 mb-2">No Risk Assessments Yet</h3>
                                        <p className="text-gray-500 mb-6">Get started by adding a risk assessment manually or uploading an Excel file.</p>
                                        <div className="flex gap-4">
                                            <button
                                                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-md flex items-center transform hover:scale-105 transition-transform duration-200"
                                                onClick={() => openModal('create')}
                                                disabled={!selectedSheet} // Keep disabled check
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                                </svg>
                                                <span>Add Risk</span>
                                            </button>
                                            <button
                                                className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-md flex items-center transform hover:scale-105 transition-transform duration-200"
                                                onClick={() => openModal('excel')}
                                                disabled={!selectedSheet} // Keep disabled check
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                                </svg>
                                                <span>Upload Excel</span>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                            <div className="overflow-x-auto w-full p-4" style={{ maxWidth: '100vw' }}>
                                <div className="inline-block min-w-full whitespace-nowrap">
                                    <table className="border-collapse shadow-lg rounded-lg overflow-hidden">
                                        <thead>
                                            <tr className="bg-slate-100">
                                                {/* Action column */}
                                                <th className="border border-slate-200 p-3.5 text-left text-slate-700 font-semibold bg-slate-50">Actions</th>

                                                {/* Basic columns */}
                                                <th className="border border-slate-200 p-3.5 text-left text-slate-700 font-semibold bg-slate-50">Risk ID</th>
                                                <th className="border border-slate-200 p-3.5 text-left text-slate-700 font-semibold bg-slate-50">Vulnerability Type</th>
                                                <th className="border border-slate-200 p-3.5 text-left text-slate-700 font-semibold bg-slate-50">Threat Description</th>
                                                <th className="border border-slate-200 p-3.5 text-left text-slate-700 font-semibold bg-slate-50">Context</th>
                                                <th className="border border-slate-200 p-3.5 text-left text-slate-700 font-semibold bg-slate-50">Applicable Activity</th>

                                                {/* Impact Assessment column group */}
                                                <th
                                                    className="border border-slate-200 bg-indigo-50 p-3.5 cursor-pointer text-indigo-700 font-semibold hover:bg-indigo-100 transition-colors duration-300"
                                                    onClick={() => toggleGroup('impactAssessment')}
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
                                                    onClick={() => toggleGroup('impactRatings')}
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
                                                    onClick={() => toggleGroup('severity')}
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
                                                    onClick={() => toggleGroup('controlAssessment')}
                                                    colSpan={expandedGroups.controlAssessment ? 2 : 1}
                                                >
                                                    <div className="flex items-center justify-center">
                                                            <span> Control Assessment</span>
                                                        {renderExpandIcon(expandedGroups.controlAssessment)}
                                                    </div>
                                                </th>

                                                {/* Risk Assessment column group */}
                                                <th
                                                    className="border border-slate-200 bg-slate-700 text-white p-3.5 cursor-pointer font-semibold hover:bg-slate-800 transition-colors duration-300"
                                                    onClick={() => toggleGroup('riskAssessment')}
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
                                                    onClick={() => toggleGroup('riskRevision')}
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
                                                    onClick={() => toggleGroup('mitigationPlan')}
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
                                                <th className="border border-slate-200 p-3 font-medium"></th>

                                                {/* Impact Assessment subheaders */}
                                                {expandedGroups.impactAssessment ? (
                                                    <>
                                                        <th className="border border-slate-200 p-3 font-medium bg-indigo-50 transition-all duration-300">Impact on Confidentiality? (Y/N)</th>
                                                        <th className="border border-slate-200 p-3 font-medium bg-indigo-50 transition-all duration-300">Impact on Integrity? (Y/N)</th>
                                                        <th className="border border-slate-200 p-3 font-medium bg-indigo-50 transition-all duration-300">Impact on Availability? (Y/N)</th>
                                                        <th className="border border-slate-200 p-3 font-medium bg-indigo-50 transition-all duration-300">Breach of legal obligation? (Y/N)</th>
                                                        <th className="border border-slate-200 p-3 font-medium bg-indigo-50 transition-all duration-300">Description of legal obligation</th>
                                                    </>
                                                ) : (
                                                    <th className="border border-slate-200 p-3 font-medium bg-indigo-50"></th>
                                                )}

                                                {/* Impact Ratings subheaders */}
                                                {expandedGroups.impactRatings ? (
                                                    <>
                                                        <th className="border border-slate-200 p-3 font-medium bg-indigo-50 transition-all duration-300">On customer</th>
                                                        <th className="border border-slate-200 p-3 font-medium bg-indigo-50 transition-all duration-300">On service capability</th>
                                                        <th className="border border-slate-200 p-3 font-medium bg-indigo-50 transition-all duration-300">Financial damage</th>
                                                        <th className="border border-slate-200 p-3 font-medium bg-indigo-50 transition-all duration-300">Spread / Magnitude</th>
                                                    </>
                                                ) : (
                                                    <th className="border border-slate-200 p-3 font-medium bg-indigo-50"></th>
                                                )}

                                                {/* Severity subheaders */}
                                                {expandedGroups.severity ? (
                                                    <>
                                                        <th className="border border-slate-200 p-3 font-medium bg-amber-50 transition-all duration-300">Consequence rating</th>
                                                        <th className="border border-slate-200 p-3 font-medium bg-amber-50 transition-all duration-300">Likelihood rating</th>
                                                    </>
                                                ) : (
                                                    <th className="border border-slate-200 p-3 font-medium bg-amber-50"></th>
                                                )}

                                                {/* Control Assessment subheaders */}
                                                {expandedGroups.controlAssessment ? (
                                                    <>
                                                        <th className="border border-slate-200 p-3 font-medium bg-slate-100 transition-all duration-300">Description</th>
                                                        <th className="border border-slate-200 p-3 font-medium bg-slate-100 transition-all duration-300">Rating</th>
                                                    </>
                                                ) : (
                                                    <th className="border border-slate-200 p-3 font-medium bg-slate-100"></th>
                                                )}

                                                {/* Risk Assessment subheaders */}
                                                {expandedGroups.riskAssessment ? (
                                                    <>
                                                        <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white transition-all duration-300">Risk Rating</th>
                                                        <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white transition-all duration-300">Risk Category</th>
                                                        <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white transition-all duration-300">Department / BU</th>
                                                        <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white transition-all duration-300">Risk Owner</th>
                                                        <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white transition-all duration-300">Risk Mitigation Strategy</th>
                                                    </>
                                                ) : (
                                                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white"></th>
                                                )}

                                                {/* Risk Revision subheaders */}
                                                {expandedGroups.riskRevision ? (
                                                    <>
                                                        <th className="border border-slate-200 p-3 font-medium bg-indigo-100 transition-all duration-300">Applicable SoA Control</th>
                                                        <th className="border border-slate-200 p-3 font-medium bg-indigo-100 transition-all duration-300">SoA Control Description</th>
                                                        <th className="border border-slate-200 p-3 font-medium bg-indigo-100 transition-all duration-300">Will the planned controls meet legal/ other requirements? (Y/N)</th>
                                                        <th className="border border-slate-200 p-3 font-medium bg-indigo-100 transition-all duration-300">Revised control rating</th>
                                                        <th className="border border-slate-200 p-3 font-medium bg-indigo-100 transition-all duration-300">Residual risk rating</th>
                                                        <th className="border border-slate-200 p-3 font-medium bg-indigo-100 transition-all duration-300">Revised Risk Acceptable to risk owner? (Y/N)</th>
                                                    </>
                                                ) : (
                                                    <th className="border border-slate-200 p-3 font-medium bg-indigo-100"></th>
                                                )}

                                                {/* Mitigation Plan subheaders */}
                                                {expandedGroups.mitigationPlan ? (
                                                    <>
                                                        <th className="border border-slate-200 p-3 font-medium bg-green-100 transition-all duration-300">Further Planned action</th>
                                                        <th className="border border-slate-200 p-3 font-medium bg-green-100 transition-all duration-300">Task ID</th>
                                                        <th className="border border-slate-200 p-3 font-medium bg-green-100 transition-all duration-300">Task Description</th>
                                                        <th className="border border-slate-200 p-3 font-medium bg-green-100 transition-all duration-300">Task Owner</th>
                                                        <th className="border border-slate-200 p-3 font-medium bg-green-100 transition-all duration-300">Ongoing task? (Y/N)</th>
                                                        <th className="border border-slate-200 p-3 font-medium bg-green-100 transition-all duration-300">If not ongoing, planned completion date</th>
                                                        <th className="border border-slate-200 p-3 font-medium bg-green-100 transition-all duration-300">Recurrent task? (Y/N)</th>
                                                        <th className="border border-slate-200 p-3 font-medium bg-green-100 transition-all duration-300">If yes, frequency</th>
                                                    </>
                                                ) : (
                                                    <th className="border border-slate-200 p-3 font-medium bg-green-100"></th>
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Array.isArray(riskData) && riskData.map((risk, index) => (
                                                <tr key={risk.id}
                                                    className={index % 2 === 0 ? "bg-white hover:bg-indigo-50 transition-colors duration-150" : "bg-slate-50 hover:bg-indigo-50 transition-colors duration-150"}>
                                                    {/* Action buttons */}
                                                    <td className="border border-slate-200 p-3">
                                                        <div className="flex space-x-2">
                                                            <button
                                                                className="p-1 bg-blue-100 rounded hover:bg-blue-200 transition-colors"
                                                                title="View Risk"
                                                                onClick={() => {
                                                                    // Button is now static/disabled
                                                                }}
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-600">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                </svg>
                                                            </button>
                                                            <button
                                                                className="p-1 bg-blue-100 rounded hover:bg-blue-200 transition-colors"
                                                                title="Edit Risk"
                                                                onClick={() => {
                                                                    // Button is now static/disabled
                                                                }}
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-600">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                                                </svg>
                                                            </button>
                                                            <button
                                                                className="p-1 bg-red-100 rounded hover:bg-red-200 transition-colors"
                                                                title="Delete"
                                                                onClick={() => handleDeleteRisk(risk.id)} // Use updated handleDeleteRisk
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-red-600">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </td>

                                                    {/* Basic columns */}
                                                    <td className="border border-slate-200 p-3">{risk.id}</td>
                                                    <td className="border border-slate-200 p-3">{risk.vulnerabilityType}</td>
                                                    <td className="border border-slate-200 p-3">{risk.threatDescription}</td>
                                                    <td className="border border-slate-200 p-3">{risk.context}</td>
                                                    <td className="border border-slate-200 p-3">{risk.applicableActivity}</td>

                                                    {/* Impact Assessment cells */}
                                                    {expandedGroups.impactAssessment ? (
                                                        <>
                                                            <td className={`border border-slate-200 p-3 text-center ${getImpactColor(risk.impactAssessment.confidentiality)}`}>
                                                                {risk.impactAssessment.confidentiality}
                                                            </td>
                                                            <td className={`border border-slate-200 p-3 text-center ${getImpactColor(risk.impactAssessment.integrity)}`}>
                                                                {risk.impactAssessment.integrity}
                                                            </td>
                                                            <td className={`border border-slate-200 p-3 text-center ${getImpactColor(risk.impactAssessment.availability)}`}>
                                                                {risk.impactAssessment.availability}
                                                            </td>
                                                            <td className={`border border-slate-200 p-3 text-center ${getImpactColor(risk.impactAssessment.legalObligation)}`}>
                                                                {risk.impactAssessment.legalObligation}
                                                            </td>
                                                            <td className="border border-slate-200 p-3">
                                                                {risk.impactAssessment.legalObligationDesc}
                                                            </td>
                                                        </>
                                                    ) : (
                                                        <td className="border border-slate-200 p-3 text-center">
                                                            {risk.impactAssessment.confidentiality}/{risk.impactAssessment.integrity}/{risk.impactAssessment.availability}
                                                        </td>
                                                    )}

                                                    {/* Impact Ratings cells */}
                                                    {expandedGroups.impactRatings ? (
                                                        <>
                                                            <td className={`border border-slate-200 p-3 text-center ${getRatingColor(risk.impactRatings.customer)}`}>
                                                                {risk.impactRatings.customer}
                                                            </td>
                                                            <td className={`border border-slate-200 p-3 text-center ${getRatingColor(risk.impactRatings.serviceCapability)}`}>
                                                                {risk.impactRatings.serviceCapability}
                                                            </td>
                                                            <td className={`border border-slate-200 p-3 text-center ${getRatingColor(risk.impactRatings.financialDamage)}`}>
                                                                {risk.impactRatings.financialDamage}
                                                            </td>
                                                            <td className={`border border-slate-200 p-3 text-center ${getRatingColor(risk.impactRatings.spreadMagnitude)}`}>
                                                                {risk.impactRatings.spreadMagnitude}
                                                            </td>
                                                        </>
                                                    ) : (
                                                        <td className="border border-slate-200 p-3 text-center">
                                                            {(risk.impactRatings.customer + risk.impactRatings.serviceCapability +
                                                                risk.impactRatings.financialDamage + risk.impactRatings.spreadMagnitude) / 4}
                                                        </td>
                                                    )}

                                                    {/* Severity cells */}
                                                    {expandedGroups.severity ? (
                                                        <>
                                                            <td className={`border border-slate-200 p-3 text-center ${getRatingColor(risk.severity.consequenceRating)}`}>
                                                                {risk.severity.consequenceRating}
                                                            </td>
                                                            <td className={`border border-slate-200 p-3 text-center ${getRatingColor(risk.severity.likelihoodRating)}`}>
                                                                {risk.severity.likelihoodRating}
                                                            </td>
                                                        </>
                                                    ) : (
                                                        <td className="border border-slate-200 p-3 text-center">
                                                            C:{risk.severity.consequenceRating} L:{risk.severity.likelihoodRating}
                                                        </td>
                                                    )}

                                                    {/* Control Assessment cells */}
                                                    {expandedGroups.controlAssessment ? (
                                                        <>
                                                            <td className="border border-slate-200 p-3">{risk.controlAssessment.description}</td>
                                                            <td className={`border border-slate-200 p-3 text-center ${getControlRatingColor(risk.controlAssessment.rating)}`}>
                                                                {risk.controlAssessment.rating}
                                                            </td>
                                                        </>
                                                    ) : (
                                                        <td className={`border border-slate-200 p-3 text-center ${getControlRatingColor(risk.controlAssessment.rating)}`}>
                                                            Rating: {risk.controlAssessment.rating}
                                                        </td>
                                                    )}

                                                    {/* Risk Assessment cells */}
                                                    {expandedGroups.riskAssessment ? (
                                                        <>
                                                            <td className={`border border-slate-200 p-3 text-center ${getRiskRatingColor(risk.riskAssessment.riskRating)}`}>
                                                                {risk.riskAssessment.riskRating}
                                                            </td>
                                                            <td className="border border-slate-200 p-3 bg-slate-50">{risk.riskAssessment.riskCategory}</td>
                                                            <td className="border border-slate-200 p-3 bg-slate-50">{risk.riskAssessment.departmentBU}</td>
                                                            <td className="border border-slate-200 p-3 bg-slate-50">{risk.riskAssessment.riskOwner}</td>
                                                            <td className="border border-slate-200 p-3 bg-slate-50">{risk.riskAssessment.mitigationStrategy}</td>
                                                        </>
                                                    ) : (
                                                        <td className={`border border-slate-200 p-3 text-center ${getRiskRatingColor(risk.riskAssessment.riskRating)}`}>
                                                            {risk.riskAssessment.riskRating}
                                                        </td>
                                                    )}

                                                    {/* Risk Revision cells */}
                                                    {expandedGroups.riskRevision ? (
                                                        <>
                                                            <td className="border border-slate-200 p-3 bg-indigo-50">{risk.riskRevision.soaControl}</td>
                                                            <td className="border border-slate-200 p-3 bg-indigo-50">{risk.riskRevision.soaControlDesc}</td>
                                                            <td className="border border-slate-200 p-3 text-center bg-indigo-50">{risk.riskRevision.meetsRequirements}</td>
                                                            <td className={`border border-slate-200 p-3 text-center ${getControlRatingColor(risk.riskRevision.revisedControlRating)}`}>
                                                                {risk.riskRevision.revisedControlRating}
                                                            </td>
                                                            <td className={`border border-slate-200 p-3 text-center ${getRiskRatingColor(risk.riskRevision.residualRiskRating)}`}>
                                                                {risk.riskRevision.residualRiskRating}
                                                            </td>
                                                            <td className="border border-slate-200 p-3 text-center bg-indigo-50">{risk.riskRevision.acceptableToOwner}</td>
                                                        </>
                                                    ) : (
                                                        <td className={`border border-slate-200 p-3 text-center ${getRiskRatingColor(risk.riskRevision.residualRiskRating)}`}>
                                                            RR: {risk.riskRevision.residualRiskRating}
                                                        </td>
                                                    )}

                                                    {/* Mitigation Plan cells */}
                                                    {expandedGroups.mitigationPlan ? (
                                                        <>
                                                            <td className="border border-slate-200 p-3">{risk.mitigationPlan.furtherPlannedAction}</td>
                                                            <td className="border border-slate-200 p-3">{risk.mitigationPlan.taskId}</td>
                                                            <td className="border border-slate-200 p-3">{risk.mitigationPlan.taskDescription}</td>
                                                            <td className="border border-slate-200 p-3">{risk.mitigationPlan.taskOwner}</td>
                                                            <td className="border border-slate-200 p-3 text-center">{risk.mitigationPlan.isOngoing}</td>
                                                            <td className="border border-slate-200 p-3">{risk.mitigationPlan.plannedCompletionDate}</td>
                                                            <td className="border border-slate-200 p-3 text-center">{risk.mitigationPlan.isRecurrent}</td>
                                                            <td className="border border-slate-200 p-3">{risk.mitigationPlan.frequency}</td>
                                                        </>
                                                    ) : (
                                                        <td className="border border-slate-200 p-3 text-center">
                                                            {risk.mitigationPlan.furtherPlannedAction}
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>)}
                        </>)}
                        </>
                    )} {/* Closing parenthesis for activeTab check */}

                    {/* Risk Treatment Tab */}
                    {activeTab === 'riskTreatment' && (
                        <RiskTreatment />
                    )}

                    {/* VAPT Tab */}
                    {activeTab === 'vapt' && (
                        <Vapt />
                    )}
                </div>
            </div>

            {/* Modal */}
            {
                showModal && (
                    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            {/* Background overlay */}
                            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={closeModal}></div>

                            {/* Modal panel */}
                            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full">
                                <div className="bg-indigo-50 px-4 py-3 border-b border-gray-200">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                                        {modalType === 'edit' ? 'Edit Risk Assessment' :
                                            modalType === 'excel' ? 'Upload Excel Risk Data' :
                                                'New Risk Assessment'}
                                    </h3>
                                </div>
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 max-h-[80vh] overflow-y-auto">
                                    {/* Form for creating or editing risk */}
                                    {(modalType === 'create' || modalType === 'edit' || modalType === 'view') && (
                                        <form className="space-y-6">
                                            {/* Basic Information */}
                                            <div className="bg-gray-50 p-4 rounded-md">
                                                <h4 className="text-lg font-medium mb-4 text-gray-800">Basic Information</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Risk ID *</label>
                                                        <input
                                                            type="text"
                                                            required
                                                            value={formData.risk_id}
                                                            onChange={(e) => handleFormChange(e, null, 'risk_id')}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                            placeholder="e.g., Admin_Risk_12"
                                                            disabled={modalType === 'view'}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Vulnerability Type *</label>
                                                        <input
                                                            type="text"
                                                            required
                                                            value={formData.vulnerability_type}
                                                            onChange={(e) => handleFormChange(e, null, 'vulnerability_type')}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                            placeholder="e.g., Earthquake"
                                                            disabled={modalType === 'view'}
                                                        />
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Threat Description *</label>
                                                        <textarea
                                                            required
                                                            value={formData.threat_description}
                                                            onChange={(e) => handleFormChange(e, null, 'threat_description')}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                            rows="2"
                                                            placeholder="Describe the threat..."
                                                            disabled={modalType === 'view'}
                                                        ></textarea>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Context</label>
                                                        <select
                                                            value={formData.context}
                                                            onChange={(e) => handleSelectChange(e, null, 'context')}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                            disabled={modalType === 'view'}
                                                        >
                                                            <option value="Natural">Natural</option>
                                                            <option value="Resource management">Resource management</option>
                                                            <option value="Infrastructure components">Infrastructure components</option>
                                                            <option value="Employees">Employees</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Applicable Activity</label>
                                                        <input
                                                            type="text"
                                                            value={formData.applicable_activity}
                                                            onChange={(e) => handleFormChange(e, null, 'applicable_activity')}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                            placeholder="e.g., Working in the organisation"
                                                            disabled={modalType === 'view'}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Impact Assessment */}
                                            <div className="bg-indigo-50 p-4 rounded-md">
                                                <h4 className="text-lg font-medium mb-4 text-indigo-800">Impact Assessment</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Impact on Confidentiality?</label>
                                                        <select
                                                            value={formData.impact_assessment.impact_on_confidentiality}
                                                            onChange={(e) => handleSelectChange(e, 'impact_assessment', 'impact_on_confidentiality')}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                            disabled={modalType === 'view'}
                                                        >
                                                            <option value="Y">Yes (Y)</option>
                                                            <option value="N">No (N)</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Impact on Integrity?</label>
                                                        <select
                                                            value={formData.impact_assessment.impact_on_integrity}
                                                            onChange={(e) => handleSelectChange(e, 'impact_assessment', 'impact_on_integrity')}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                            disabled={modalType === 'view'}
                                                        >
                                                            <option value="Y">Yes (Y)</option>
                                                            <option value="N">No (N)</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Impact on Availability?</label>
                                                        <select
                                                            value={formData.impact_assessment.impact_on_availability}
                                                            onChange={(e) => handleSelectChange(e, 'impact_assessment', 'impact_on_availability')}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                            disabled={modalType === 'view'}
                                                        >
                                                            <option value="Y">Yes (Y)</option>
                                                            <option value="N">No (N)</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Breach of Legal Obligation?</label>
                                                        <select
                                                            value={formData.impact_assessment.breach_of_legal_obligation}
                                                            onChange={(e) => handleSelectChange(e, 'impact_assessment', 'breach_of_legal_obligation')}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                            disabled={modalType === 'view'}
                                                        >
                                                            <option value="Y">Yes (Y)</option>
                                                            <option value="N">No (N)</option>
                                                        </select>
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description of Legal Obligation</label>
                                                        <input
                                                            type="text"
                                                            value={formData.impact_assessment.description_of_legal_obligation}
                                                            onChange={(e) => handleFormChange(e, 'impact_assessment', 'description_of_legal_obligation')}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                            placeholder="If applicable"
                                                            disabled={modalType === 'view'}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Impact Ratings and Control Assessment */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="bg-amber-50 p-4 rounded-md">
                                                    <h4 className="text-lg font-medium mb-4 text-amber-800">Severity Assessment</h4>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Consequence Rating (1-5)</label>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                max="5"
                                                                value={formData.severity.consequence_rating}
                                                                onChange={(e) => handleNumericChange(e, 'severity', 'consequence_rating')}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                                disabled={modalType === 'view'}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Likelihood Rating (1-5)</label>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                max="5"
                                                                value={formData.severity.likelihood_rating}
                                                                onChange={(e) => handleNumericChange(e, 'severity', 'likelihood_rating')}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                                disabled={modalType === 'view'}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="bg-gray-100 p-4 rounded-md">
                                                    <h4 className="text-lg font-medium mb-4 text-gray-800">Control Assessment</h4>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                                            <textarea
                                                                value={formData.control_assessment.description}
                                                                onChange={(e) => handleFormChange(e, 'control_assessment', 'description')}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                                rows="2"
                                                                placeholder="Describe existing controls..."
                                                                disabled={modalType === 'view'}
                                                            ></textarea>
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Rating (1-5)</label>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                max="5"
                                                                value={formData.control_assessment.rating}
                                                                onChange={(e) => handleNumericChange(e, 'control_assessment', 'rating')}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                                disabled={modalType === 'view'}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Risk Assessment and Treatment */}
                                            <div className="grid grid-cols-1 gap-6">
                                                <div className="bg-slate-700 p-4 rounded-md text-white">
                                                    <h4 className="text-lg font-medium mb-4">Risk Assessment</h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-medium mb-1">Risk Rating</label>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                value={formData.risk_assessment.risk_rating}
                                                                onChange={(e) => handleNumericChange(e, 'risk_assessment', 'risk_rating')}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                                                                disabled={modalType === 'view'}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium mb-1">Risk Category</label>
                                                            <select
                                                                value={formData.risk_assessment.risk_category}
                                                                onChange={(e) => handleSelectChange(e, 'risk_assessment', 'risk_category')}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                                                                disabled={modalType === 'view'}
                                                            >
                                                                <option value="Not Significant">Not Significant</option>
                                                                <option value="Significant">Significant</option>
                                                                <option value="Critical">Critical</option>
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium mb-1">Department/BU</label>
                                                            <input
                                                                type="text"
                                                                value={formData.risk_assessment.department_bu}
                                                                onChange={(e) => handleFormChange(e, 'risk_assessment', 'department_bu')}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                                                                disabled={modalType === 'view'}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium mb-1">Risk Owner</label>
                                                            <input
                                                                type="text"
                                                                value={formData.risk_assessment.risk_owner}
                                                                onChange={(e) => handleFormChange(e, 'risk_assessment', 'risk_owner')}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                                                                disabled={modalType === 'view'}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium mb-1">Mitigation Strategy</label>
                                                            <select
                                                                value={formData.risk_assessment.risk_mitigation_strategy}
                                                                onChange={(e) => handleSelectChange(e, 'risk_assessment', 'risk_mitigation_strategy')}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                                                                disabled={modalType === 'view'}
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

                                            {/* Submit Buttons */}
                                            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                                                <button
                                                    type="button"
                                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                                    onClick={closeModal}
                                                >
                                                    Cancel
                                                </button>
                                                {modalType !== 'view' && (
                                                    <button
                                                        type="button"
                                                        className="px-4 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                                        onClick={modalType === 'edit' ? handleRiskUpdate : handleRiskSubmit}
                                                    >
                                                        {modalType === 'edit' ? 'Update Risk Assessment' : 'Save Risk Assessment'}
                                                    </button>
                                                )}
                                            </div>
                                        </form>
                                    )}

                                    {/* Form for uploading Excel */}
                                    {modalType === 'excel' && (
                                        <form className="space-y-6">
                                            <div className="bg-green-50 p-6 rounded-lg border-2 border-dashed border-green-300">
                                                <div className="text-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mx-auto h-12 w-12 text-green-500">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                                    </svg>
                                                    <h4 className="mt-2 text-lg font-medium text-gray-900">Upload Excel File</h4>
                                                    <p className="mt-1 text-sm text-gray-500">
                                                        Upload a .xlsx or .xls file with multiple risk assessments.
                                                    </p>
                                                     <div className="mt-4">
                                                        <a href="/risk_assessment_template.xlsx" download className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                                                            Download Template
                                                        </a>
                                                    </div>
                                                    <div className="mt-6">
                                                        <label htmlFor="file-upload" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50">
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
                                                    type="button"
                                                    className="px-4 py-2 rounded-md text-white bg-green-600 hover:bg-green-700"
                                                    onClick={handleExcelSubmit}
                                                    disabled={!excelFile || isLoading}
                                                >
                                                     {isLoading ? 'Uploading...' : 'Upload Risk Data'}
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Legends Modal */}
            <LegendsModal isOpen={showLegendsModal} onClose={toggleLegendsModal} />

            {/* Sheet Creation Modal */}
            {showSheetModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        {/* Background overlay */}
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowSheetModal(false)}></div>

                        {/* Modal panel */}
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-indigo-50 px-4 py-3 border-b border-gray-200">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">Create New Assessment Sheet</h3>
                            </div>
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="sheet-name" className="block text-sm font-medium text-gray-700 mb-1">Sheet Name *</label>
                                        <input
                                            type="text"
                                            id="sheet-name"
                                            value={newSheetName}
                                            onChange={(e) => setNewSheetName(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="Enter sheet name"
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
                                        {isLoading ? 'Creating...' : 'Create Sheet'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={showConfirmModal}
                onClose={closeConfirmModal}
                onConfirm={confirmModalProps.onConfirm} // Pass the onConfirm from state
                title={confirmModalProps.title}
                message={confirmModalProps.message}
            />
        </div>
    );
};

export default MyReports;