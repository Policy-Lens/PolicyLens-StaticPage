// import React, { useState, useEffect } from 'react';
// import { FilePlus2, FileUp } from 'lucide-react';
// import { apiRequest } from "../../../utils/api";
// import Vapt from './MyReports/Vapt';
// import RiskTreatment from './MyReports/RiskTreatment';

// const MyReports = () => {
//     // State to track which column groups are expanded
//     const [expandedGroups, setExpandedGroups] = useState({
//         impactAssessment: false,
//         impactRatings: false,
//         severity: false,
//         controlAssessment: false,
//         riskAssessment: false,
//         riskRevision: false,
//         mitigationPlan: false
//     });

//     // State to track active tab
//     const [activeTab, setActiveTab] = useState('riskAssessment'); // 'riskAssessment', 'riskTreatment', or 'vapt'

//     // State for managing modal visibility
//     const [showModal, setShowModal] = useState(false);
//     const [modalType, setModalType] = useState('form'); // 'form' or 'edit' or 'excel'

//     // State for tracking which risk is being edited
//     const [editingRisk, setEditingRisk] = useState(null);

//     // State for current project
//     const [currentProject, setCurrentProject] = useState({
//         id: '1',
//         name: 'Project Alpha'
//     });

//     // States for API interactions
//     const [riskData, setRiskData] = useState([]);
//     const [isLoading, setIsLoading] = useState(true); // Start with loading state
//     const [error, setError] = useState(null);
//     const [successMessage, setSuccessMessage] = useState(null);

//     // State for form data
//     const [formData, setFormData] = useState({
//         risk_id: '',
//         vulnerability_type: '',
//         threat_description: '',
//         context: 'Natural',
//         applicable_activity: '',
//         impact_assessment: {
//             impact_on_confidentiality: 'N',
//             impact_on_integrity: 'N',
//             impact_on_availability: 'N',
//             breach_of_legal_obligation: 'N',
//             description_of_legal_obligation: ''
//         },
//         impact_ratings: {
//             on_customer: 1,
//             on_service_capability: 1,
//             financial_damage: 1,
//             spread_magnitude: 1
//         },
//         severity: {
//             consequence_rating: 1,
//             likelihood_rating: 1
//         },
//         control_assessment: {
//             description: '',
//             rating: 1
//         },
//         risk_assessment: {
//             risk_rating: 5,
//             risk_category: 'Not Significant',
//             department_bu: 'Admin',
//             risk_owner: '',
//             risk_mitigation_strategy: 'Tolerate'
//         },
//         risk_revision: {
//             applicable_soa_control: '',
//             planned_controls_meet_requirements: 'Y',
//             revised_control_rating: 1,
//             residual_risk_rating: 5,
//             acceptable_to_risk_owner: 'Y'
//         },
//         mitigation_task: {
//             task_id: '',
//             task_description: '',
//             task_owner: '',
//             is_ongoing: 'Y',
//             is_recurrent: 'N',
//             frequency: '',
//             planned_completion_date: ''
//         }
//     });

//     // State for file upload
//     const [excelFile, setExcelFile] = useState(null);

//     // Toggle expansion of a column group
//     const toggleGroup = (group) => {
//         setExpandedGroups(prev => ({
//             ...prev,
//             [group]: !prev[group]
//         }));
//     };

//     // Function to fetch risks
//     const fetchRisks = async () => {
//         setIsLoading(true);
//         setError(null);

//         try {
//             // Call the API to get risks for the current project
//             const response = await apiRequest(
//                 "GET",
//                 `/api/rarpt/project/${currentProject.id}/risks/`,
//                 null,
//                 true
//             );

//             // Check if the response contains data
//             if (response.data && Array.isArray(response.data)) {
//                 // Transform API data to match the expected format for the frontend if needed
//                 const formattedRisks = response.data.map(risk => {
//                     // Ensure all properties exist to prevent 'undefined' errors
//                     return {
//                         id: risk.id || '',
//                         vulnerabilityType: risk.vulnerability_type || 'Not Specified', // Make sure this is correctly mapped
//                         threatDescription: risk.threat_description || '',
//                         context: risk.context || '',
//                         applicableActivity: risk.applicable_activity || '',
//                         // Ensure all nested objects have their properties defined with default values
//                         impactAssessment: {
//                             confidentiality: risk.impact_assessment?.impact_on_confidentiality || 'N',
//                             integrity: risk.impact_assessment?.impact_on_integrity || 'N',
//                             availability: risk.impact_assessment?.impact_on_availability || 'N',
//                             legalObligation: risk.impact_assessment?.breach_of_legal_obligation || 'N',
//                             legalObligationDesc: risk.impact_assessment?.description_of_legal_obligation || ''
//                         },
//                         impactRatings: {
//                             customer: risk.impact_ratings?.on_customer || 1,
//                             serviceCapability: risk.impact_ratings?.on_service_capability || 1,
//                             financialDamage: risk.impact_ratings?.financial_damage || 1,
//                             spreadMagnitude: risk.impact_ratings?.spread_magnitude || 1
//                         },
//                         severity: {
//                             consequenceRating: risk.severity?.consequence_rating || 1,
//                             likelihoodRating: risk.severity?.likelihood_rating || 1
//                         },
//                         controlAssessment: {
//                             description: risk.control_assessment?.description || '',
//                             rating: risk.control_assessment?.rating || 1
//                         },
//                         riskAssessment: {
//                             riskRating: risk.risk_assessment?.risk_rating || 1,
//                             riskCategory: risk.risk_assessment?.risk_category || 'Not Significant',
//                             departmentBU: risk.risk_assessment?.department_bu || '',
//                             riskOwner: risk.risk_assessment?.risk_owner || '',
//                             mitigationStrategy: risk.risk_assessment?.risk_mitigation_strategy || 'Tolerate'
//                         },
//                         riskRevision: {
//                             soaControl: risk.risk_revision?.applicable_soa_control || '',
//                             soaControlDesc: '',
//                             meetsRequirements: risk.risk_revision?.planned_controls_meet_requirements || 'Y',
//                             revisedControlRating: risk.risk_revision?.revised_control_rating || 1,
//                             residualRiskRating: risk.risk_revision?.residual_risk_rating || 1,
//                             acceptableToOwner: risk.risk_revision?.acceptable_to_risk_owner || 'Y'
//                         },
//                         mitigationPlan: {
//                             furtherPlannedAction: 'Yes',
//                             taskId: risk.mitigation_task?.task_id || '',
//                             taskDescription: risk.mitigation_task?.task_description || '',
//                             taskOwner: risk.mitigation_task?.task_owner || '',
//                             isOngoing: risk.mitigation_task?.is_ongoing || 'Y',
//                             plannedCompletionDate: risk.mitigation_task?.planned_completion_date || '',
//                             isRecurrent: risk.mitigation_task?.is_recurrent || 'N',
//                             frequency: risk.mitigation_task?.frequency || ''
//                         }
//                     };
//                 });

//                 setRiskData(formattedRisks);
//             } else {
//                 console.warn("API returned no risks or invalid data format");
//                 setRiskData([]);
//             }
//         } catch (err) {
//             console.error('Error fetching risks:', err);
//             setError(err.message || 'Failed to fetch risks');
//             setRiskData([]);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     // Function to fetch risks for current project
//     useEffect(() => {
//         if (currentProject && currentProject.id) {
//             fetchRisks();
//         }
//     }, [currentProject]);

//     // Helper function to get cell background color based on Y/N value
//     const getImpactColor = (value) => {
//         if (value === "Y") return "bg-red-200";
//         if (value === "N") return "bg-green-100";
//         return "";
//     };

//     // Helper function to get cell background color based on rating value
//     const getRatingColor = (value) => {
//         if (value >= 4) return "bg-red-500 text-white";
//         if (value === 3) return "bg-red-300";
//         if (value === 2) return "bg-orange-200";
//         if (value === 1) return "bg-yellow-200";
//         return "";
//     };

//     // Helper function to render expand/collapse icon
//     const renderExpandIcon = (isExpanded) => (
//         <span className={`ml-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-opacity-50 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}>
//             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
//                 <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
//             </svg>
//         </span>
//     );

//     // Function to open modal with specific type
//     const openModal = (type, riskToEdit = null) => {
//         setModalType(type);
//         setError(null);
//         setSuccessMessage(null);
//         setExcelFile(null);

//         if ((type === 'edit' || type === 'view') && riskToEdit) {
//             // When editing or viewing, populate form with existing risk data
//             setEditingRisk(riskToEdit);
//             // Populate form with the risk data
//             setFormData({
//                 risk_id: riskToEdit.risk_id,
//                 vulnerability_type: riskToEdit.vulnerability_type,
//                 threat_description: riskToEdit.threat_description,
//                 context: riskToEdit.context,
//                 applicable_activity: riskToEdit.applicable_activity,
//                 impact_assessment: {
//                     impact_on_confidentiality: riskToEdit.impact_assessment.impact_on_confidentiality,
//                     impact_on_integrity: riskToEdit.impact_assessment.impact_on_integrity,
//                     impact_on_availability: riskToEdit.impact_assessment.impact_on_availability,
//                     breach_of_legal_obligation: riskToEdit.impact_assessment.breach_of_legal_obligation,
//                     description_of_legal_obligation: riskToEdit.impact_assessment.description_of_legal_obligation
//                 },
//                 impact_ratings: {
//                     on_customer: riskToEdit.impact_ratings?.on_customer || 1,
//                     on_service_capability: riskToEdit.impact_ratings?.on_service_capability || 1,
//                     financial_damage: riskToEdit.impact_ratings?.financial_damage || 1,
//                     spread_magnitude: riskToEdit.impact_ratings?.spread_magnitude || 1
//                 },
//                 severity: {
//                     consequence_rating: riskToEdit.severity?.consequence_rating || 1,
//                     likelihood_rating: riskToEdit.severity?.likelihood_rating || 1
//                 },
//                 control_assessment: {
//                     description: riskToEdit.control_assessment.description,
//                     rating: riskToEdit.control_assessment.rating
//                 },
//                 risk_assessment: {
//                     risk_rating: riskToEdit.risk_assessment.risk_rating,
//                     risk_category: riskToEdit.risk_assessment.risk_category,
//                     department_bu: riskToEdit.risk_assessment.department_bu,
//                     risk_owner: riskToEdit.risk_assessment.risk_owner,
//                     risk_mitigation_strategy: riskToEdit.risk_assessment.risk_mitigation_strategy
//                 },
//                 risk_revision: {
//                     applicable_soa_control: riskToEdit.risk_revision.applicable_soa_control,
//                     planned_controls_meet_requirements: riskToEdit.risk_revision.planned_controls_meet_requirements,
//                     revised_control_rating: riskToEdit.risk_revision.revised_control_rating,
//                     residual_risk_rating: riskToEdit.risk_revision.residual_risk_rating,
//                     acceptable_to_risk_owner: riskToEdit.risk_revision.acceptable_to_risk_owner
//                 },
//                 mitigation_task: {
//                     task_id: riskToEdit.mitigation_task.task_id,
//                     task_description: riskToEdit.mitigation_task.task_description,
//                     task_owner: riskToEdit.mitigation_task.task_owner,
//                     is_ongoing: riskToEdit.mitigation_task.is_ongoing,
//                     is_recurrent: riskToEdit.mitigation_task.is_recurrent,
//                     frequency: riskToEdit.mitigation_task.frequency,
//                     planned_completion_date: riskToEdit.mitigation_task.planned_completion_date
//                 }
//             });
//         } else if (type === 'create') {
//             // For new risk form, reset to default values
//             setEditingRisk(null);
//             // Reset form data to defaults
//             setFormData({
//                 risk_id: '',
//                 vulnerability_type: '',
//                 threat_description: '',
//                 context: 'Natural',
//                 applicable_activity: '',
//                 impact_assessment: {
//                     impact_on_confidentiality: 'N',
//                     impact_on_integrity: 'N',
//                     impact_on_availability: 'N',
//                     breach_of_legal_obligation: 'N',
//                     description_of_legal_obligation: ''
//                 },
//                 impact_ratings: {
//                     on_customer: 1,
//                     on_service_capability: 1,
//                     financial_damage: 1,
//                     spread_magnitude: 1
//                 },
//                 severity: {
//                     consequence_rating: 1,
//                     likelihood_rating: 1
//                 },
//                 control_assessment: {
//                     description: '',
//                     rating: 1
//                 },
//                 risk_assessment: {
//                     risk_rating: 5,
//                     risk_category: 'Not Significant',
//                     department_bu: 'Admin',
//                     risk_owner: '',
//                     risk_mitigation_strategy: 'Tolerate'
//                 },
//                 risk_revision: {
//                     applicable_soa_control: '',
//                     planned_controls_meet_requirements: 'Y',
//                     revised_control_rating: 1,
//                     residual_risk_rating: 5,
//                     acceptable_to_risk_owner: 'Y'
//                 },
//                 mitigation_task: {
//                     task_id: '',
//                     task_description: '',
//                     task_owner: '',
//                     is_ongoing: 'Y',
//                     is_recurrent: 'N',
//                     frequency: '',
//                     planned_completion_date: ''
//                 }
//             });
//         }

//         setShowModal(true);
//     };

//     // Close the modal and reset form state
//     const closeModal = () => {
//         setShowModal(false);
//         setModalType('form');
//         setEditingRisk(null);
//         setError(null);
//         setSuccessMessage(null);

//         // Reset form data to defaults
//         setFormData({
//             risk_id: '',
//             vulnerability_type: '',
//             threat_description: '',
//             context: 'Natural',
//             applicable_activity: '',
//             impact_assessment: {
//                 impact_on_confidentiality: 'N',
//                 impact_on_integrity: 'N',
//                 impact_on_availability: 'N',
//                 breach_of_legal_obligation: 'N',
//                 description_of_legal_obligation: ''
//             },
//             impact_ratings: {
//                 on_customer: 1,
//                 on_service_capability: 1,
//                 financial_damage: 1,
//                 spread_magnitude: 1
//             },
//             severity: {
//                 consequence_rating: 1,
//                 likelihood_rating: 1
//             },
//             control_assessment: {
//                 description: '',
//                 rating: 1
//             },
//             risk_assessment: {
//                 risk_rating: 5,
//                 risk_category: 'Not Significant',
//                 department_bu: 'Admin',
//                 risk_owner: '',
//                 risk_mitigation_strategy: 'Tolerate'
//             },
//             risk_revision: {
//                 applicable_soa_control: '',
//                 planned_controls_meet_requirements: 'Y',
//                 revised_control_rating: 1,
//                 residual_risk_rating: 5,
//                 acceptable_to_risk_owner: 'Y'
//             },
//             mitigation_task: {
//                 task_id: '',
//                 task_description: '',
//                 task_owner: '',
//                 is_ongoing: 'Y',
//                 is_recurrent: 'N',
//                 frequency: '',
//                 planned_completion_date: ''
//             }
//         });
//     };

//     // Handle form input changes
//     const handleFormChange = (e, section, field) => {
//         const { value } = e.target;

//         if (section) {
//             setFormData(prev => ({
//                 ...prev,
//                 [section]: {
//                     ...prev[section],
//                     [field]: value
//                 }
//             }));
//         } else {
//             setFormData(prev => ({
//                 ...prev,
//                 [field]: value
//             }));
//         }
//     };

//     // Handle numeric input changes
//     const handleNumericChange = (e, section, field) => {
//         const value = parseInt(e.target.value) || 1;

//         if (section) {
//             setFormData(prev => ({
//                 ...prev,
//                 [section]: {
//                     ...prev[section],
//                     [field]: value
//                 }
//             }));
//         } else {
//             setFormData(prev => ({
//                 ...prev,
//                 [field]: value
//             }));
//         }
//     };

//     // Handle select input changes
//     const handleSelectChange = (e, section, field) => {
//         if (section) {
//             setFormData(prev => ({
//                 ...prev,
//                 [section]: {
//                     ...prev[section],
//                     [field]: e.target.value
//                 }
//             }));
//         } else {
//             setFormData(prev => ({
//                 ...prev,
//                 [field]: e.target.value
//             }));
//         }
//     };

//     // Handle file input change - static stub, no actual functionality
//     const handleFileChange = (e) => {
//         const file = e.target.files[0];
//         if (file) {
//             setExcelFile(file);
//         }
//     };

//     // Submit risk form
//     const handleRiskSubmit = async (e) => {
//         e.preventDefault();
//         setIsLoading(true);
//         setError(null);

//         try {
//             const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

//             // Convert form data to API format
//             const apiData = {
//                 risk_id: formData.risk_id || "Risk_" + Date.now(),
//                 vulnerability_type: formData.vulnerability_type || "Default",
//                 threat_description: formData.threat_description || "Default threat description",
//                 context: formData.context || "Natural",
//                 applicable_activity: formData.applicable_activity || "Working in the organisation",
//                 impact_assessment: {
//                     impact_on_confidentiality: formData.impact_assessment.impact_on_confidentiality || "N",
//                     impact_on_integrity: formData.impact_assessment.impact_on_integrity || "N",
//                     impact_on_availability: formData.impact_assessment.impact_on_availability || "N",
//                     breach_of_legal_obligation: formData.impact_assessment.breach_of_legal_obligation || "N",
//                     description_of_legal_obligation: formData.impact_assessment.description_of_legal_obligation || "",
//                     // These fields need to be directly in impact_assessment based on the API error
//                     on_customer: 1,
//                     on_service_capability: 1,
//                     financial_damage: 1,
//                     spread_magnitude: 1,
//                     consequence_rating: 1,
//                     likelihood_rating: 1
//                 },
//                 control_assessment: {
//                     description: formData.control_assessment.description || "Not specified",
//                     rating: formData.control_assessment.rating || 1
//                 },
//                 risk_assessment: {
//                     risk_rating: formData.risk_assessment.risk_rating || 1,
//                     risk_category: formData.risk_assessment.risk_category || "Not Significant",
//                     department_bu: formData.risk_assessment.department_bu || "Admin",
//                     risk_owner: formData.risk_assessment.risk_owner || "Admin",
//                     risk_mitigation_strategy: formData.risk_assessment.risk_mitigation_strategy || "Tolerate"
//                 },
//                 risk_revision: {
//                     applicable_soa_control: formData.risk_revision.applicable_soa_control || "",
//                     planned_controls_meet_requirements: formData.risk_revision.planned_controls_meet_requirements || "Y",
//                     revised_control_rating: formData.risk_revision.revised_control_rating || 1,
//                     residual_risk_rating: formData.risk_revision.residual_risk_rating || 1,
//                     acceptable_to_risk_owner: formData.risk_revision.acceptable_to_risk_owner || "Y"
//                 },
//                 mitigation_task: {
//                     task_id: formData.mitigation_task.task_id || "Task_" + Date.now(),
//                     task_description: formData.mitigation_task.task_description || "Default task description",
//                     task_owner: formData.mitigation_task.task_owner || "Admin",
//                     is_ongoing: formData.mitigation_task.is_ongoing || "Y",
//                     is_recurrent: formData.mitigation_task.is_recurrent || "N",
//                     frequency: formData.mitigation_task.frequency || "",
//                     planned_completion_date: today // Use simple YYYY-MM-DD format
//                 }
//             };

//             // Send data to the API
//             const response = await apiRequest(
//                 "POST",
//                 `/api/rarpt/project/${currentProject.id}/risks/create/`,
//                 apiData,
//                 true
//             );

//             setSuccessMessage('Risk created successfully');

//             // Refresh all risks to ensure data consistency
//             await fetchRisks();

//             // Reset form after successful submission
//             setTimeout(() => {
//                 closeModal();
//             }, 2000);

//         } catch (err) {
//             console.error('Error creating risk:', err.message || 'Unknown error');
//             setError(err.message || 'Failed to create risk');
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     // Update existing risk
//     const handleRiskUpdate = async (e) => {
//         e.preventDefault();
//         setIsLoading(true);
//         setError(null);

//         try {
//             const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

//             // Convert form data to API format
//             const apiData = {
//                 risk_id: formData.risk_id || "Risk_" + Date.now(),
//                 vulnerability_type: formData.vulnerability_type || "Default",
//                 threat_description: formData.threat_description || "Default threat description",
//                 context: formData.context || "Natural",
//                 applicable_activity: formData.applicable_activity || "Working in the organisation",
//                 impact_assessment: {
//                     impact_on_confidentiality: formData.impact_assessment.impact_on_confidentiality || "N",
//                     impact_on_integrity: formData.impact_assessment.impact_on_integrity || "N",
//                     impact_on_availability: formData.impact_assessment.impact_on_availability || "N",
//                     breach_of_legal_obligation: formData.impact_assessment.breach_of_legal_obligation || "N",
//                     description_of_legal_obligation: formData.impact_assessment.description_of_legal_obligation || "",
//                     // These fields need to be directly in impact_assessment based on the API error
//                     on_customer: 1,
//                     on_service_capability: 1,
//                     financial_damage: 1,
//                     spread_magnitude: 1,
//                     consequence_rating: 1,
//                     likelihood_rating: 1
//                 },
//                 control_assessment: {
//                     description: formData.control_assessment.description || "Not specified",
//                     rating: formData.control_assessment.rating || 1
//                 },
//                 risk_assessment: {
//                     risk_rating: formData.risk_assessment.risk_rating || 1,
//                     risk_category: formData.risk_assessment.risk_category || "Not Significant",
//                     department_bu: formData.risk_assessment.department_bu || "Admin",
//                     risk_owner: formData.risk_assessment.risk_owner || "Admin",
//                     risk_mitigation_strategy: formData.risk_assessment.risk_mitigation_strategy || "Tolerate"
//                 },
//                 risk_revision: {
//                     applicable_soa_control: formData.risk_revision.applicable_soa_control || "",
//                     planned_controls_meet_requirements: formData.risk_revision.planned_controls_meet_requirements || "Y",
//                     revised_control_rating: formData.risk_revision.revised_control_rating || 1,
//                     residual_risk_rating: formData.risk_revision.residual_risk_rating || 1,
//                     acceptable_to_risk_owner: formData.risk_revision.acceptable_to_risk_owner || "Y"
//                 },
//                 mitigation_task: {
//                     task_id: formData.mitigation_task.task_id || "Task_" + Date.now(),
//                     task_description: formData.mitigation_task.task_description || "Default task description",
//                     task_owner: formData.mitigation_task.task_owner || "Admin",
//                     is_ongoing: formData.mitigation_task.is_ongoing || "Y",
//                     is_recurrent: formData.mitigation_task.is_recurrent || "N",
//                     frequency: formData.mitigation_task.frequency || "",
//                     planned_completion_date: today // Use simple YYYY-MM-DD format
//                 }
//             };

//             // Send update to the API
//             const response = await apiRequest(
//                 "PUT",
//                 `/api/rarpt/risks/${editingRisk.id}/`,
//                 apiData,
//                 true
//             );

//             setSuccessMessage('Risk updated successfully');

//             // Refresh all risks to ensure data consistency
//             await fetchRisks();

//             // Close modal after successful update
//             setTimeout(() => {
//                 closeModal();
//             }, 2000);

//         } catch (err) {
//             console.error('Error updating risk:', err.message || 'Unknown error');
//             setError(err.message || 'Failed to update risk');
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     // Submit excel file
//     const handleExcelSubmit = async (e) => {
//         e.preventDefault();

//         if (!excelFile) {
//             setError('Please select an Excel file');
//             return;
//         }

//         setIsLoading(true);
//         setError(null);

//         try {
//             // Create form data for file upload
//             const formData = new FormData();
//             formData.append('file', excelFile);

//             // Use the exact endpoint format that works in the Questionnaire component
//             const response = await apiRequest(
//                 "POST",
//                 `/api/rarpt/project/${currentProject.id}/risks/create/`,
//                 formData,
//                 true
//             );

//             setSuccessMessage('Excel file uploaded successfully. The risk data is now updated in the database.');

//             // Always refresh the risk list after a successful upload
//             await fetchRisks();

//             // Reset form after successful submission
//             setTimeout(() => {
//                 closeModal();
//             }, 2000);

//         } catch (err) {
//             console.error('Error uploading Excel file:', err.message || 'Unknown error');
//             setError(err.message || 'Failed to upload Excel file');
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     // Delete a risk
//     const handleDeleteRisk = async (riskId) => {
//         if (window.confirm('Are you sure you want to delete this risk?')) {
//             setIsLoading(true);
//             setError(null);

//             try {
//                 console.log("Deleting risk:", riskId);

//                 // Call the API to delete the risk
//                 await apiRequest(
//                     "DELETE",
//                     `/api/rarpt/risks/${riskId}/`,
//                     null,
//                     true
//                 );

//                 setSuccessMessage('Risk deleted successfully');

//                 // Refresh all risks to ensure data consistency
//                 await fetchRisks();

//             } catch (err) {
//                 console.error('Error deleting risk:', err);
//                 setError(err.message || 'Failed to delete risk');
//             } finally {
//                 setIsLoading(false);
//             }
//         }
//     };

//     // Function to fetch a single risk by ID
//     const fetchRiskById = async (riskId) => {
//         setIsLoading(true);
//         setError(null);

//         try {
//             // Call the API to get a specific risk
//             const response = await apiRequest(
//                 "GET",
//                 `/api/rarpt/risks/${riskId}/`,
//                 null,
//                 true
//             );

//             // Check if the response contains data
//             if (response.data) {
//                 // Transform to frontend format
//                 const risk = response.data;
//                 const formattedRisk = {
//                     id: risk.id || '',
//                     risk_id: risk.risk_id || '',
//                     vulnerabilityType: risk.vulnerability_type || '',
//                     threatDescription: risk.threat_description || '',
//                     context: risk.context || '',
//                     applicableActivity: risk.applicable_activity || '',
//                     // Ensure all nested objects have their properties defined with default values
//                     impactAssessment: {
//                         confidentiality: risk.impact_assessment?.impact_on_confidentiality || 'N',
//                         integrity: risk.impact_assessment?.impact_on_integrity || 'N',
//                         availability: risk.impact_assessment?.impact_on_availability || 'N',
//                         legalObligation: risk.impact_assessment?.breach_of_legal_obligation || 'N',
//                         legalObligationDesc: risk.impact_assessment?.description_of_legal_obligation || ''
//                     },
//                     impactRatings: {
//                         customer: risk.impact_ratings?.on_customer || 1,
//                         serviceCapability: risk.impact_ratings?.on_service_capability || 1,
//                         financialDamage: risk.impact_ratings?.financial_damage || 1,
//                         spreadMagnitude: risk.impact_ratings?.spread_magnitude || 1
//                     },
//                     severity: {
//                         consequenceRating: risk.severity?.consequence_rating || 1,
//                         likelihoodRating: risk.severity?.likelihood_rating || 1
//                     },
//                     controlAssessment: {
//                         description: risk.control_assessment?.description || '',
//                         rating: risk.control_assessment?.rating || 1
//                     },
//                     riskAssessment: {
//                         riskRating: risk.risk_assessment?.risk_rating || 1,
//                         riskCategory: risk.risk_assessment?.risk_category || 'Not Significant',
//                         departmentBU: risk.risk_assessment?.department_bu || '',
//                         riskOwner: risk.risk_assessment?.risk_owner || '',
//                         mitigationStrategy: risk.risk_assessment?.risk_mitigation_strategy || 'Tolerate'
//                     },
//                     riskRevision: {
//                         soaControl: risk.risk_revision?.applicable_soa_control || '',
//                         soaControlDesc: '',
//                         meetsRequirements: risk.risk_revision?.planned_controls_meet_requirements || 'Y',
//                         revisedControlRating: risk.risk_revision?.revised_control_rating || 1,
//                         residualRiskRating: risk.risk_revision?.residual_risk_rating || 1,
//                         acceptableToOwner: risk.risk_revision?.acceptable_to_risk_owner || 'Y'
//                     },
//                     mitigationPlan: {
//                         furtherPlannedAction: 'Yes',
//                         taskId: risk.mitigation_task?.task_id || '',
//                         taskDescription: risk.mitigation_task?.task_description || '',
//                         taskOwner: risk.mitigation_task?.task_owner || '',
//                         isOngoing: risk.mitigation_task?.is_ongoing || 'Y',
//                         plannedCompletionDate: risk.mitigation_task?.planned_completion_date || '',
//                         isRecurrent: risk.mitigation_task?.is_recurrent || 'N',
//                         frequency: risk.mitigation_task?.frequency || ''
//                     }
//                 };

//                 return formattedRisk;
//             } else {
//                 console.warn("API returned no risk data or invalid format");
//                 return null;
//             }
//         } catch (err) {
//             console.error('Error fetching risk details:', err);
//             setError(err.message || 'Failed to fetch risk details');
//             return null;
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     // Function to handle viewing a risk's details
//     const handleViewRisk = async (riskId) => {
//         const riskData = await fetchRiskById(riskId);
//         if (riskData) {
//             openModal('view', riskData);
//         }
//     };

//     // Function to handle viewing a risk directly from an object
//     const handleViewRiskByObject = (risk) => {
//         // Reset any previous state
//         setError(null);
//         setSuccessMessage(null);

//         try {
//             // Set the editing risk directly from the object passed
//             setEditingRisk(risk);

//             // Map the risk object directly to the form data
//             setFormData({
//                 risk_id: risk.id || '',
//                 vulnerability_type: risk.vulnerabilityType || '',
//                 threat_description: risk.threatDescription || '',
//                 context: risk.context || '',
//                 applicable_activity: risk.applicableActivity || '',
//                 impact_assessment: {
//                     impact_on_confidentiality: risk.impactAssessment?.confidentiality || 'N',
//                     impact_on_integrity: risk.impactAssessment?.integrity || 'N',
//                     impact_on_availability: risk.impactAssessment?.availability || 'N',
//                     breach_of_legal_obligation: risk.impactAssessment?.legalObligation || 'N',
//                     description_of_legal_obligation: risk.impactAssessment?.legalObligationDesc || ''
//                 },
//                 control_assessment: {
//                     description: risk.controlAssessment?.description || '',
//                     rating: risk.controlAssessment?.rating || 1
//                 },
//                 risk_assessment: {
//                     risk_rating: risk.riskAssessment?.riskRating || 1,
//                     risk_category: risk.riskAssessment?.riskCategory || 'Not Significant',
//                     department_bu: risk.riskAssessment?.departmentBU || '',
//                     risk_owner: risk.riskAssessment?.riskOwner || '',
//                     risk_mitigation_strategy: risk.riskAssessment?.mitigationStrategy || 'Tolerate'
//                 },
//                 risk_revision: {
//                     applicable_soa_control: risk.riskRevision?.soaControl || '',
//                     planned_controls_meet_requirements: risk.riskRevision?.meetsRequirements || 'Y',
//                     revised_control_rating: risk.riskRevision?.revisedControlRating || 1,
//                     residual_risk_rating: risk.riskRevision?.residualRiskRating || 1,
//                     acceptable_to_risk_owner: risk.riskRevision?.acceptableToOwner || 'Y'
//                 },
//                 mitigation_task: {
//                     task_id: risk.mitigationPlan?.taskId || '',
//                     task_description: risk.mitigationPlan?.taskDescription || '',
//                     task_owner: risk.mitigationPlan?.taskOwner || '',
//                     is_ongoing: risk.mitigationPlan?.isOngoing || 'Y',
//                     is_recurrent: risk.mitigationPlan?.isRecurrent || 'N',
//                     frequency: risk.mitigationPlan?.frequency || '',
//                     planned_completion_date: risk.mitigationPlan?.plannedCompletionDate || ''
//                 }
//             });

//             // Set modal to view mode and show it
//             setModalType('view');
//             setShowModal(true);

//         } catch (err) {
//             console.error("Error preparing risk for viewing:", err.message || 'Unknown error');
//             setError("Failed to prepare risk for viewing");
//         }
//     };

//     // Function to handle editing a risk directly from an object
//     const handleEditRiskByObject = (risk) => {
//         // Reset any previous state
//         setError(null);
//         setSuccessMessage(null);

//         try {
//             // Set the editing risk directly from the object passed
//             setEditingRisk(risk);

//             // Map the risk object directly to the form data - same as view function
//             setFormData({
//                 risk_id: risk.id || '',
//                 vulnerability_type: risk.vulnerabilityType || '',
//                 threat_description: risk.threatDescription || '',
//                 context: risk.context || '',
//                 applicable_activity: risk.applicableActivity || '',
//                 impact_assessment: {
//                     impact_on_confidentiality: risk.impactAssessment?.confidentiality || 'N',
//                     impact_on_integrity: risk.impactAssessment?.integrity || 'N',
//                     impact_on_availability: risk.impactAssessment?.availability || 'N',
//                     breach_of_legal_obligation: risk.impactAssessment?.legalObligation || 'N',
//                     description_of_legal_obligation: risk.impactAssessment?.legalObligationDesc || ''
//                 },
//                 control_assessment: {
//                     description: risk.controlAssessment?.description || '',
//                     rating: risk.controlAssessment?.rating || 1
//                 },
//                 risk_assessment: {
//                     risk_rating: risk.riskAssessment?.riskRating || 1,
//                     risk_category: risk.riskAssessment?.riskCategory || 'Not Significant',
//                     department_bu: risk.riskAssessment?.departmentBU || '',
//                     risk_owner: risk.riskAssessment?.riskOwner || '',
//                     risk_mitigation_strategy: risk.riskAssessment?.mitigationStrategy || 'Tolerate'
//                 },
//                 risk_revision: {
//                     applicable_soa_control: risk.riskRevision?.soaControl || '',
//                     planned_controls_meet_requirements: risk.riskRevision?.meetsRequirements || 'Y',
//                     revised_control_rating: risk.riskRevision?.revisedControlRating || 1,
//                     residual_risk_rating: risk.riskRevision?.residualRiskRating || 1,
//                     acceptable_to_risk_owner: risk.riskRevision?.acceptableToOwner || 'Y'
//                 },
//                 mitigation_task: {
//                     task_id: risk.mitigationPlan?.taskId || '',
//                     task_description: risk.mitigationPlan?.taskDescription || '',
//                     task_owner: risk.mitigationPlan?.taskOwner || '',
//                     is_ongoing: risk.mitigationPlan?.isOngoing || 'Y',
//                     is_recurrent: risk.mitigationPlan?.isRecurrent || 'N',
//                     frequency: risk.mitigationPlan?.frequency || '',
//                     planned_completion_date: risk.mitigationPlan?.plannedCompletionDate || ''
//                 }
//             });

//             // Set modal to edit mode and show it
//             setModalType('edit');
//             setShowModal(true);

//         } catch (err) {
//             console.error("Error in handleEditRiskByObject:", err);
//             setError("Failed to prepare risk for editing: " + (err.message || "Unknown error"));
//         }
//     };

//     return (
//         <div className="flex flex-col min-h-screen bg-slate-50 overflow-auto">
//             {/* Main Content */}
//             <div className="flex flex-1 overflow-auto shadow-xl rounded-lg">
//                 <div className="flex flex-col w-full bg-white border-r border-slate-200 relative overflow-auto">
//                     {/* Tab Navigation */}
//                     <div className="flex border-b border-slate-200">
//                         <button
//                             className={`py-4 px-6 font-medium transition-colors ${activeTab === 'riskAssessment' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-600 hover:text-slate-800'}`}
//                             onClick={() => setActiveTab('riskAssessment')}
//                         >
//                             Risk Assessment
//                         </button>
//                         <button
//                             className={`py-4 px-6 font-medium transition-colors ${activeTab === 'riskTreatment' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-600 hover:text-slate-800'}`}
//                             onClick={() => setActiveTab('riskTreatment')}
//                         >
//                             Risk Treatment
//                         </button>
//                         <button
//                             className={`py-4 px-6 font-medium transition-colors ${activeTab === 'vapt' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-600 hover:text-slate-800'}`}
//                             onClick={() => setActiveTab('vapt')}
//                         >
//                             VAPT
//                         </button>
//                     </div>

//                     {/* Risk Assessment View Tab */}
//                     {activeTab === 'riskAssessment' && (
//                         <>
//                             {/* Header */}
//                             <div className="flex items-center justify-between border-b border-slate-200 p-5 bg-white sticky top-0 z-10 shadow-sm">
//                                 <div className="flex items-center">
//                                     <h2 className="text-xl font-bold text-slate-800">Risk Assessment Reports</h2>
//                                     <div className="ml-3 text-slate-600 font-medium bg-indigo-50 px-3 py-1 rounded-full">
//                                         {riskData.length} reports
//                                     </div>
//                                 </div>
//                                 <div className="flex gap-3">
//                                     <button
//                                         className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-md flex items-center transform hover:scale-105 transition-transform duration-200"
//                                         onClick={() => openModal('create')}
//                                     >
//                                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
//                                             <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
//                                         </svg>
//                                         <span>Add Risk</span>
//                                     </button>
//                                     <button
//                                         className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-md flex items-center transform hover:scale-105 transition-transform duration-200"
//                                         onClick={() => openModal('excel')}
//                                     >
//                                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
//                                             <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
//                                         </svg>
//                                         <span>Upload Excel</span>
//                                     </button>
//                                 </div>
//                             </div>

//                             {/* Status Messages */}
//                             {error && (
//                                 <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-4 mx-4 rounded shadow">
//                                     <p className="font-bold">Error</p>
//                                     <p>{error}</p>
//                                 </div>
//                             )}

//                             {successMessage && (
//                                 <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 my-4 mx-4 rounded shadow">
//                                     <p className="font-bold">Success</p>
//                                     <p>{successMessage}</p>
//                                 </div>
//                             )}

//                             {isLoading && (
//                                 <div className="flex justify-center items-center p-4">
//                                     <div className="loader ease-linear rounded-full border-4 border-t-4 border-slate-200 h-12 w-12 mb-4 border-t-indigo-500 animate-spin"></div>
//                                 </div>
//                             )}

//                             {/* Risk Assessment Table */}
//                             <div className="overflow-x-auto w-full p-4" style={{ maxWidth: '100vw' }}>
//                                 <div className="inline-block min-w-full whitespace-nowrap">
//                                     <table className="border-collapse shadow-lg rounded-lg overflow-hidden">
//                                         <thead>
//                                             <tr className="bg-slate-100">
//                                                 {/* Action column */}
//                                                 <th className="border border-slate-200 p-3.5 text-left text-slate-700 font-semibold bg-slate-50">Actions</th>

//                                                 {/* Basic columns */}
//                                                 <th className="border border-slate-200 p-3.5 text-left text-slate-700 font-semibold bg-slate-50">Risk ID</th>
//                                                 <th className="border border-slate-200 p-3.5 text-left text-slate-700 font-semibold bg-slate-50">Vulnerability Type</th>
//                                                 <th className="border border-slate-200 p-3.5 text-left text-slate-700 font-semibold bg-slate-50">Threat Description</th>
//                                                 <th className="border border-slate-200 p-3.5 text-left text-slate-700 font-semibold bg-slate-50">Context</th>
//                                                 <th className="border border-slate-200 p-3.5 text-left text-slate-700 font-semibold bg-slate-50">Applicable Activity</th>

//                                                 {/* Impact Assessment column group */}
//                                                 <th
//                                                     className="border border-slate-200 bg-indigo-50 p-3.5 cursor-pointer text-indigo-700 font-semibold hover:bg-indigo-100 transition-colors duration-300"
//                                                     onClick={() => toggleGroup('impactAssessment')}
//                                                     colSpan={expandedGroups.impactAssessment ? 5 : 1}
//                                                 >
//                                                     <div className="flex items-center justify-center">
//                                                         <span>(1) Impact Assessment</span>
//                                                         {renderExpandIcon(expandedGroups.impactAssessment)}
//                                                     </div>
//                                                 </th>

//                                                 {/* Impact Ratings column group */}
//                                                 <th
//                                                     className="border border-slate-200 bg-indigo-50 p-3.5 cursor-pointer text-indigo-700 font-semibold hover:bg-indigo-100 transition-colors duration-300"
//                                                     onClick={() => toggleGroup('impactRatings')}
//                                                     colSpan={expandedGroups.impactRatings ? 4 : 1}
//                                                 >
//                                                     <div className="flex items-center justify-center">
//                                                         <span>(2) Impact Ratings</span>
//                                                         {renderExpandIcon(expandedGroups.impactRatings)}
//                                                     </div>
//                                                 </th>

//                                                 {/* Severity column group */}
//                                                 <th
//                                                     className="border border-slate-200 bg-amber-50 p-3.5 cursor-pointer text-amber-700 font-semibold hover:bg-amber-100 transition-colors duration-300"
//                                                     onClick={() => toggleGroup('severity')}
//                                                     colSpan={expandedGroups.severity ? 2 : 1}
//                                                 >
//                                                     <div className="flex items-center justify-center">
//                                                         <span>(3) Severity</span>
//                                                         {renderExpandIcon(expandedGroups.severity)}
//                                                     </div>
//                                                 </th>

//                                                 {/* Control Assessment column group */}
//                                                 <th
//                                                     className="border border-slate-200 bg-slate-100 p-3.5 cursor-pointer text-slate-700 font-semibold hover:bg-slate-200 transition-colors duration-300"
//                                                     onClick={() => toggleGroup('controlAssessment')}
//                                                     colSpan={expandedGroups.controlAssessment ? 2 : 1}
//                                                 >
//                                                     <div className="flex items-center justify-center">
//                                                         <span>(4) Control Assessment</span>
//                                                         {renderExpandIcon(expandedGroups.controlAssessment)}
//                                                     </div>
//                                                 </th>

//                                                 {/* Risk Assessment column group */}
//                                                 <th
//                                                     className="border border-slate-200 bg-slate-700 text-white p-3.5 cursor-pointer font-semibold hover:bg-slate-800 transition-colors duration-300"
//                                                     onClick={() => toggleGroup('riskAssessment')}
//                                                     colSpan={expandedGroups.riskAssessment ? 5 : 1}
//                                                 >
//                                                     <div className="flex items-center justify-center">
//                                                         <span>(5) Risk Assessment</span>
//                                                         {renderExpandIcon(expandedGroups.riskAssessment)}
//                                                     </div>
//                                                 </th>

//                                                 {/* Risk Revision column group */}
//                                                 <th
//                                                     className="border border-slate-200 bg-indigo-600 text-white p-3.5 cursor-pointer font-semibold hover:bg-indigo-700 transition-colors duration-300"
//                                                     onClick={() => toggleGroup('riskRevision')}
//                                                     colSpan={expandedGroups.riskRevision ? 6 : 1}
//                                                 >
//                                                     <div className="flex items-center justify-center">
//                                                         <span>(6) Risk Revision</span>
//                                                         {renderExpandIcon(expandedGroups.riskRevision)}
//                                                     </div>
//                                                 </th>

//                                                 {/* Mitigation Plan column group */}
//                                                 <th
//                                                     className="border border-slate-200 bg-green-600 text-white p-3.5 cursor-pointer font-semibold hover:bg-green-700 transition-colors duration-300"
//                                                     onClick={() => toggleGroup('mitigationPlan')}
//                                                     colSpan={expandedGroups.mitigationPlan ? 8 : 1}
//                                                 >
//                                                     <div className="flex items-center justify-center">
//                                                         <span>(7) Mitigation Plan</span>
//                                                         {renderExpandIcon(expandedGroups.mitigationPlan)}
//                                                     </div>
//                                                 </th>
//                                             </tr>

//                                             {/* Second row of headers for expanded column groups */}
//                                             <tr className="bg-slate-50">
//                                                 {/* Empty cell for action column */}
//                                                 <th className="border border-slate-200 p-3 font-medium"></th>

//                                                 {/* Empty cells for the basic columns */}
//                                                 <th className="border border-slate-200 p-3 font-medium"></th>
//                                                 <th className="border border-slate-200 p-3 font-medium"></th>
//                                                 <th className="border border-slate-200 p-3 font-medium"></th>
//                                                 <th className="border border-slate-200 p-3 font-medium"></th>
//                                                 <th className="border border-slate-200 p-3 font-medium"></th>

//                                                 {/* Impact Assessment subheaders */}
//                                                 {expandedGroups.impactAssessment ? (
//                                                     <>
//                                                         <th className="border border-slate-200 p-3 font-medium bg-indigo-50 transition-all duration-300">Impact on Confidentiality? (Y/N)</th>
//                                                         <th className="border border-slate-200 p-3 font-medium bg-indigo-50 transition-all duration-300">Impact on Integrity? (Y/N)</th>
//                                                         <th className="border border-slate-200 p-3 font-medium bg-indigo-50 transition-all duration-300">Impact on Availability? (Y/N)</th>
//                                                         <th className="border border-slate-200 p-3 font-medium bg-indigo-50 transition-all duration-300">Breach of legal obligation? (Y/N)</th>
//                                                         <th className="border border-slate-200 p-3 font-medium bg-indigo-50 transition-all duration-300">Description of legal obligation</th>
//                                                     </>
//                                                 ) : (
//                                                     <th className="border border-slate-200 p-3 font-medium bg-indigo-50"></th>
//                                                 )}

//                                                 {/* Impact Ratings subheaders */}
//                                                 {expandedGroups.impactRatings ? (
//                                                     <>
//                                                         <th className="border border-slate-200 p-3 font-medium bg-indigo-50 transition-all duration-300">On customer</th>
//                                                         <th className="border border-slate-200 p-3 font-medium bg-indigo-50 transition-all duration-300">On service capability</th>
//                                                         <th className="border border-slate-200 p-3 font-medium bg-indigo-50 transition-all duration-300">Financial damage</th>
//                                                         <th className="border border-slate-200 p-3 font-medium bg-indigo-50 transition-all duration-300">Spread / Magnitude</th>
//                                                     </>
//                                                 ) : (
//                                                     <th className="border border-slate-200 p-3 font-medium bg-indigo-50"></th>
//                                                 )}

//                                                 {/* Severity subheaders */}
//                                                 {expandedGroups.severity ? (
//                                                     <>
//                                                         <th className="border border-slate-200 p-3 font-medium bg-amber-50 transition-all duration-300">Consequence rating</th>
//                                                         <th className="border border-slate-200 p-3 font-medium bg-amber-50 transition-all duration-300">Likelihood rating</th>
//                                                     </>
//                                                 ) : (
//                                                     <th className="border border-slate-200 p-3 font-medium bg-amber-50"></th>
//                                                 )}

//                                                 {/* Control Assessment subheaders */}
//                                                 {expandedGroups.controlAssessment ? (
//                                                     <>
//                                                         <th className="border border-slate-200 p-3 font-medium bg-slate-100 transition-all duration-300">Description</th>
//                                                         <th className="border border-slate-200 p-3 font-medium bg-slate-100 transition-all duration-300">Rating</th>
//                                                     </>
//                                                 ) : (
//                                                     <th className="border border-slate-200 p-3 font-medium bg-slate-100"></th>
//                                                 )}

//                                                 {/* Risk Assessment subheaders */}
//                                                 {expandedGroups.riskAssessment ? (
//                                                     <>
//                                                         <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white transition-all duration-300">Risk Rating</th>
//                                                         <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white transition-all duration-300">Risk Category</th>
//                                                         <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white transition-all duration-300">Department / BU</th>
//                                                         <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white transition-all duration-300">Risk Owner</th>
//                                                         <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white transition-all duration-300">Risk Mitigation Strategy</th>
//                                                     </>
//                                                 ) : (
//                                                     <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white"></th>
//                                                 )}

//                                                 {/* Risk Revision subheaders */}
//                                                 {expandedGroups.riskRevision ? (
//                                                     <>
//                                                         <th className="border border-slate-200 p-3 font-medium bg-indigo-100 transition-all duration-300">Applicable SoA Control</th>
//                                                         <th className="border border-slate-200 p-3 font-medium bg-indigo-100 transition-all duration-300">SoA Control Description</th>
//                                                         <th className="border border-slate-200 p-3 font-medium bg-indigo-100 transition-all duration-300">Will the planned controls meet legal/ other requirements? (Y/N)</th>
//                                                         <th className="border border-slate-200 p-3 font-medium bg-indigo-100 transition-all duration-300">Revised control rating</th>
//                                                         <th className="border border-slate-200 p-3 font-medium bg-indigo-100 transition-all duration-300">Residual risk rating</th>
//                                                         <th className="border border-slate-200 p-3 font-medium bg-indigo-100 transition-all duration-300">Revised Risk Acceptable to risk owner? (Y/N)</th>
//                                                     </>
//                                                 ) : (
//                                                     <th className="border border-slate-200 p-3 font-medium bg-indigo-100"></th>
//                                                 )}

//                                                 {/* Mitigation Plan subheaders */}
//                                                 {expandedGroups.mitigationPlan ? (
//                                                     <>
//                                                         <th className="border border-slate-200 p-3 font-medium bg-green-100 transition-all duration-300">Further Planned action</th>
//                                                         <th className="border border-slate-200 p-3 font-medium bg-green-100 transition-all duration-300">Task ID</th>
//                                                         <th className="border border-slate-200 p-3 font-medium bg-green-100 transition-all duration-300">Task Description</th>
//                                                         <th className="border border-slate-200 p-3 font-medium bg-green-100 transition-all duration-300">Task Owner</th>
//                                                         <th className="border border-slate-200 p-3 font-medium bg-green-100 transition-all duration-300">Ongoing task? (Y/N)</th>
//                                                         <th className="border border-slate-200 p-3 font-medium bg-green-100 transition-all duration-300">If not ongoing, planned completion date</th>
//                                                         <th className="border border-slate-200 p-3 font-medium bg-green-100 transition-all duration-300">Recurrent task? (Y/N)</th>
//                                                         <th className="border border-slate-200 p-3 font-medium bg-green-100 transition-all duration-300">If yes, frequency</th>
//                                                     </>
//                                                 ) : (
//                                                     <th className="border border-slate-200 p-3 font-medium bg-green-100"></th>
//                                                 )}
//                                             </tr>
//                                         </thead>
//                                         <tbody>
//                                             {Array.isArray(riskData) && riskData.map((risk, index) => (
//                                                 <tr key={risk.id}
//                                                     className={index % 2 === 0 ? "bg-white hover:bg-indigo-50 transition-colors duration-150" : "bg-slate-50 hover:bg-indigo-50 transition-colors duration-150"}>
//                                                     {/* Action buttons */}
//                                                     <td className="border border-slate-200 p-3">
//                                                         <div className="flex space-x-2">
//                                                             <button
//                                                                 className="p-1 bg-blue-100 rounded hover:bg-blue-200 transition-colors"
//                                                                 title="View Risk"
//                                                                 onClick={() => {
//                                                                     // Button is now static/disabled
//                                                                 }}
//                                                             >
//                                                                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-600">
//                                                                     <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
//                                                                     <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                                                                 </svg>
//                                                             </button>
//                                                             <button
//                                                                 className="p-1 bg-blue-100 rounded hover:bg-blue-200 transition-colors"
//                                                                 title="Edit Risk"
//                                                                 onClick={() => {
//                                                                     // Button is now static/disabled
//                                                                 }}
//                                                             >
//                                                                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-600">
//                                                                     <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
//                                                                 </svg>
//                                                             </button>
//                                                             <button
//                                                                 className="p-1 bg-red-100 rounded hover:bg-red-200 transition-colors"
//                                                                 title="Delete"
//                                                                 onClick={() => handleDeleteRisk(risk.id)}
//                                                             >
//                                                                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-red-600">
//                                                                     <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
//                                                                 </svg>
//                                                             </button>
//                                                         </div>
//                                                     </td>

//                                                     {/* Basic columns */}
//                                                     <td className="border border-slate-200 p-3">{risk.id}</td>
//                                                     <td className="border border-slate-200 p-3">{risk.vulnerabilityType}</td>
//                                                     <td className="border border-slate-200 p-3">{risk.threatDescription}</td>
//                                                     <td className="border border-slate-200 p-3">{risk.context}</td>
//                                                     <td className="border border-slate-200 p-3">{risk.applicableActivity}</td>

//                                                     {/* Impact Assessment cells */}
//                                                     {expandedGroups.impactAssessment ? (
//                                                         <>
//                                                             <td className={`border border-slate-200 p-3 text-center ${getImpactColor(risk.impactAssessment.confidentiality)}`}>
//                                                                 {risk.impactAssessment.confidentiality}
//                                                             </td>
//                                                             <td className={`border border-slate-200 p-3 text-center ${getImpactColor(risk.impactAssessment.integrity)}`}>
//                                                                 {risk.impactAssessment.integrity}
//                                                             </td>
//                                                             <td className={`border border-slate-200 p-3 text-center ${getImpactColor(risk.impactAssessment.availability)}`}>
//                                                                 {risk.impactAssessment.availability}
//                                                             </td>
//                                                             <td className={`border border-slate-200 p-3 text-center ${getImpactColor(risk.impactAssessment.legalObligation)}`}>
//                                                                 {risk.impactAssessment.legalObligation}
//                                                             </td>
//                                                             <td className="border border-slate-200 p-3">
//                                                                 {risk.impactAssessment.legalObligationDesc}
//                                                             </td>
//                                                         </>
//                                                     ) : (
//                                                         <td className="border border-slate-200 p-3 text-center">
//                                                             {risk.impactAssessment.confidentiality}/{risk.impactAssessment.integrity}/{risk.impactAssessment.availability}
//                                                         </td>
//                                                     )}

//                                                     {/* Impact Ratings cells */}
//                                                     {expandedGroups.impactRatings ? (
//                                                         <>
//                                                             <td className={`border border-slate-200 p-3 text-center ${getRatingColor(risk.impactRatings.customer)}`}>
//                                                                 {risk.impactRatings.customer}
//                                                             </td>
//                                                             <td className={`border border-slate-200 p-3 text-center ${getRatingColor(risk.impactRatings.serviceCapability)}`}>
//                                                                 {risk.impactRatings.serviceCapability}
//                                                             </td>
//                                                             <td className={`border border-slate-200 p-3 text-center ${getRatingColor(risk.impactRatings.financialDamage)}`}>
//                                                                 {risk.impactRatings.financialDamage}
//                                                             </td>
//                                                             <td className={`border border-slate-200 p-3 text-center ${getRatingColor(risk.impactRatings.spreadMagnitude)}`}>
//                                                                 {risk.impactRatings.spreadMagnitude}
//                                                             </td>
//                                                         </>
//                                                     ) : (
//                                                         <td className="border border-slate-200 p-3 text-center">
//                                                             {(risk.impactRatings.customer + risk.impactRatings.serviceCapability +
//                                                                 risk.impactRatings.financialDamage + risk.impactRatings.spreadMagnitude) / 4}
//                                                         </td>
//                                                     )}

//                                                     {/* Severity cells */}
//                                                     {expandedGroups.severity ? (
//                                                         <>
//                                                             <td className={`border border-slate-200 p-3 text-center ${getRatingColor(risk.severity.consequenceRating)}`}>
//                                                                 {risk.severity.consequenceRating}
//                                                             </td>
//                                                             <td className={`border border-slate-200 p-3 text-center ${getRatingColor(risk.severity.likelihoodRating)}`}>
//                                                                 {risk.severity.likelihoodRating}
//                                                             </td>
//                                                         </>
//                                                     ) : (
//                                                         <td className="border border-slate-200 p-3 text-center">
//                                                             C:{risk.severity.consequenceRating} L:{risk.severity.likelihoodRating}
//                                                         </td>
//                                                     )}

//                                                     {/* Control Assessment cells */}
//                                                     {expandedGroups.controlAssessment ? (
//                                                         <>
//                                                             <td className="border border-slate-200 p-3">{risk.controlAssessment.description}</td>
//                                                             <td className={`border border-slate-200 p-3 text-center ${getRatingColor(risk.controlAssessment.rating)}`}>
//                                                                 {risk.controlAssessment.rating}
//                                                             </td>
//                                                         </>
//                                                     ) : (
//                                                         <td className="border border-slate-200 p-3 text-center">
//                                                             Rating: {risk.controlAssessment.rating}
//                                                         </td>
//                                                     )}

//                                                     {/* Risk Assessment cells */}
//                                                     {expandedGroups.riskAssessment ? (
//                                                         <>
//                                                             <td className={`border border-slate-200 p-3 text-center ${risk.riskAssessment.riskRating > 20 ? "bg-red-500 text-white" : "bg-slate-50"}`}>
//                                                                 {risk.riskAssessment.riskRating}
//                                                             </td>
//                                                             <td className="border border-slate-200 p-3 bg-slate-50">{risk.riskAssessment.riskCategory}</td>
//                                                             <td className="border border-slate-200 p-3 bg-slate-50">{risk.riskAssessment.departmentBU}</td>
//                                                             <td className="border border-slate-200 p-3 bg-slate-50">{risk.riskAssessment.riskOwner}</td>
//                                                             <td className="border border-slate-200 p-3 bg-slate-50">{risk.riskAssessment.mitigationStrategy}</td>
//                                                         </>
//                                                     ) : (
//                                                         <td className={`border border-slate-200 p-3 text-center ${risk.riskAssessment.riskRating > 20 ? "bg-red-500 text-white" : ""}`}>
//                                                             {risk.riskAssessment.riskRating}
//                                                         </td>
//                                                     )}

//                                                     {/* Risk Revision cells */}
//                                                     {expandedGroups.riskRevision ? (
//                                                         <>
//                                                             <td className="border border-slate-200 p-3 bg-indigo-50">{risk.riskRevision.soaControl}</td>
//                                                             <td className="border border-slate-200 p-3 bg-indigo-50">{risk.riskRevision.soaControlDesc}</td>
//                                                             <td className="border border-slate-200 p-3 text-center bg-indigo-50">{risk.riskRevision.meetsRequirements}</td>
//                                                             <td className={`border border-slate-200 p-3 text-center bg-yellow-200`}>
//                                                                 {risk.riskRevision.revisedControlRating}
//                                                             </td>
//                                                             <td className="border border-slate-200 p-3 text-center bg-indigo-50">{risk.riskRevision.residualRiskRating}</td>
//                                                             <td className="border border-slate-200 p-3 text-center bg-indigo-50">{risk.riskRevision.acceptableToOwner}</td>
//                                                         </>
//                                                     ) : (
//                                                         <td className="border border-slate-200 p-3 text-center bg-indigo-50">
//                                                             RR: {risk.riskRevision.residualRiskRating}
//                                                         </td>
//                                                     )}

//                                                     {/* Mitigation Plan cells */}
//                                                     {expandedGroups.mitigationPlan ? (
//                                                         <>
//                                                             <td className="border border-slate-200 p-3">{risk.mitigationPlan.furtherPlannedAction}</td>
//                                                             <td className="border border-slate-200 p-3">{risk.mitigationPlan.taskId}</td>
//                                                             <td className="border border-slate-200 p-3">{risk.mitigationPlan.taskDescription}</td>
//                                                             <td className="border border-slate-200 p-3">{risk.mitigationPlan.taskOwner}</td>
//                                                             <td className="border border-slate-200 p-3 text-center">{risk.mitigationPlan.isOngoing}</td>
//                                                             <td className="border border-slate-200 p-3">{risk.mitigationPlan.plannedCompletionDate}</td>
//                                                             <td className="border border-slate-200 p-3 text-center">{risk.mitigationPlan.isRecurrent}</td>
//                                                             <td className="border border-slate-200 p-3">{risk.mitigationPlan.frequency}</td>
//                                                         </>
//                                                     ) : (
//                                                         <td className="border border-slate-200 p-3 text-center">
//                                                             {risk.mitigationPlan.furtherPlannedAction}
//                                                         </td>
//                                                     )}
//                                                 </tr>
//                                             ))}
//                                         </tbody>
//                                     </table>
//                                 </div>
//                             </div>
//                         </>
//                     )}

//                     {/* Risk Treatment Tab */}
//                     {activeTab === 'riskTreatment' && (
//                         <RiskTreatment />
//                     )}

//                     {/* VAPT Tab */}
//                     {activeTab === 'vapt' && (
//                         <Vapt />
//                     )}
//                 </div>
//             </div>

//             {/* Modal */}
//             {
//                 showModal && (
//                     <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
//                         <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
//                             {/* Background overlay */}
//                             <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={closeModal}></div>

//                             {/* Modal panel */}
//                             <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full">
//                                 <div className="bg-indigo-50 px-4 py-3 border-b border-gray-200">
//                                     <h3 className="text-lg leading-6 font-medium text-gray-900">
//                                         {modalType === 'edit' ? 'Edit Risk Assessment' :
//                                             modalType === 'excel' ? 'Upload Excel Risk Data' :
//                                                 'New Risk Assessment'}
//                                     </h3>
//                                 </div>
//                                 <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 max-h-[80vh] overflow-y-auto">
//                                     {/* Form for creating or editing risk */}
//                                     {(modalType === 'create' || modalType === 'edit' || modalType === 'view') && (
//                                         <form className="space-y-6">
//                                             {/* Basic Information */}
//                                             <div className="bg-gray-50 p-4 rounded-md">
//                                                 <h4 className="text-lg font-medium mb-4 text-gray-800">Basic Information</h4>
//                                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                                     <div>
//                                                         <label className="block text-sm font-medium text-gray-700 mb-1">Risk ID *</label>
//                                                         <input
//                                                             type="text"
//                                                             required
//                                                             value={formData.risk_id}
//                                                             onChange={(e) => handleFormChange(e, null, 'risk_id')}
//                                                             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                                                             placeholder="e.g., Admin_Risk_12"
//                                                             disabled={modalType === 'view'}
//                                                         />
//                                                     </div>
//                                                     <div>
//                                                         <label className="block text-sm font-medium text-gray-700 mb-1">Vulnerability Type *</label>
//                                                         <input
//                                                             type="text"
//                                                             required
//                                                             value={formData.vulnerability_type}
//                                                             onChange={(e) => handleFormChange(e, null, 'vulnerability_type')}
//                                                             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                                                             placeholder="e.g., Earthquake"
//                                                             disabled={modalType === 'view'}
//                                                         />
//                                                     </div>
//                                                     <div className="md:col-span-2">
//                                                         <label className="block text-sm font-medium text-gray-700 mb-1">Threat Description *</label>
//                                                         <textarea
//                                                             required
//                                                             value={formData.threat_description}
//                                                             onChange={(e) => handleFormChange(e, null, 'threat_description')}
//                                                             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                                                             rows="2"
//                                                             placeholder="Describe the threat..."
//                                                             disabled={modalType === 'view'}
//                                                         ></textarea>
//                                                     </div>
//                                                     <div>
//                                                         <label className="block text-sm font-medium text-gray-700 mb-1">Context</label>
//                                                         <select
//                                                             value={formData.context}
//                                                             onChange={(e) => handleSelectChange(e, null, 'context')}
//                                                             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                                                             disabled={modalType === 'view'}
//                                                         >
//                                                             <option value="Natural">Natural</option>
//                                                             <option value="Resource management">Resource management</option>
//                                                             <option value="Infrastructure components">Infrastructure components</option>
//                                                             <option value="Employees">Employees</option>
//                                                         </select>
//                                                     </div>
//                                                     <div>
//                                                         <label className="block text-sm font-medium text-gray-700 mb-1">Applicable Activity</label>
//                                                         <input
//                                                             type="text"
//                                                             value={formData.applicable_activity}
//                                                             onChange={(e) => handleFormChange(e, null, 'applicable_activity')}
//                                                             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                                                             placeholder="e.g., Working in the organisation"
//                                                             disabled={modalType === 'view'}
//                                                         />
//                                                     </div>
//                                                 </div>
//                                             </div>

//                                             {/* Impact Assessment */}
//                                             <div className="bg-indigo-50 p-4 rounded-md">
//                                                 <h4 className="text-lg font-medium mb-4 text-indigo-800">Impact Assessment</h4>
//                                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                                     <div>
//                                                         <label className="block text-sm font-medium text-gray-700 mb-1">Impact on Confidentiality?</label>
//                                                         <select
//                                                             value={formData.impact_assessment.impact_on_confidentiality}
//                                                             onChange={(e) => handleSelectChange(e, 'impact_assessment', 'impact_on_confidentiality')}
//                                                             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                                                             disabled={modalType === 'view'}
//                                                         >
//                                                             <option value="Y">Yes (Y)</option>
//                                                             <option value="N">No (N)</option>
//                                                         </select>
//                                                     </div>
//                                                     <div>
//                                                         <label className="block text-sm font-medium text-gray-700 mb-1">Impact on Integrity?</label>
//                                                         <select
//                                                             value={formData.impact_assessment.impact_on_integrity}
//                                                             onChange={(e) => handleSelectChange(e, 'impact_assessment', 'impact_on_integrity')}
//                                                             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                                                             disabled={modalType === 'view'}
//                                                         >
//                                                             <option value="Y">Yes (Y)</option>
//                                                             <option value="N">No (N)</option>
//                                                         </select>
//                                                     </div>
//                                                     <div>
//                                                         <label className="block text-sm font-medium text-gray-700 mb-1">Impact on Availability?</label>
//                                                         <select
//                                                             value={formData.impact_assessment.impact_on_availability}
//                                                             onChange={(e) => handleSelectChange(e, 'impact_assessment', 'impact_on_availability')}
//                                                             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                                                             disabled={modalType === 'view'}
//                                                         >
//                                                             <option value="Y">Yes (Y)</option>
//                                                             <option value="N">No (N)</option>
//                                                         </select>
//                                                     </div>
//                                                     <div>
//                                                         <label className="block text-sm font-medium text-gray-700 mb-1">Breach of Legal Obligation?</label>
//                                                         <select
//                                                             value={formData.impact_assessment.breach_of_legal_obligation}
//                                                             onChange={(e) => handleSelectChange(e, 'impact_assessment', 'breach_of_legal_obligation')}
//                                                             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                                                             disabled={modalType === 'view'}
//                                                         >
//                                                             <option value="Y">Yes (Y)</option>
//                                                             <option value="N">No (N)</option>
//                                                         </select>
//                                                     </div>
//                                                     <div className="md:col-span-2">
//                                                         <label className="block text-sm font-medium text-gray-700 mb-1">Description of Legal Obligation</label>
//                                                         <input
//                                                             type="text"
//                                                             value={formData.impact_assessment.description_of_legal_obligation}
//                                                             onChange={(e) => handleFormChange(e, 'impact_assessment', 'description_of_legal_obligation')}
//                                                             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                                                             placeholder="If applicable"
//                                                             disabled={modalType === 'view'}
//                                                         />
//                                                     </div>
//                                                 </div>
//                                             </div>

//                                             {/* Impact Ratings and Control Assessment */}
//                                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                                                 <div className="bg-amber-50 p-4 rounded-md">
//                                                     <h4 className="text-lg font-medium mb-4 text-amber-800">Severity Assessment</h4>
//                                                     <div className="space-y-4">
//                                                         <div>
//                                                             <label className="block text-sm font-medium text-gray-700 mb-1">Consequence Rating (1-5)</label>
//                                                             <input
//                                                                 type="number"
//                                                                 min="1"
//                                                                 max="5"
//                                                                 value={formData.severity.consequence_rating}
//                                                                 onChange={(e) => handleNumericChange(e, 'severity', 'consequence_rating')}
//                                                                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                                                                 disabled={modalType === 'view'}
//                                                             />
//                                                         </div>
//                                                         <div>
//                                                             <label className="block text-sm font-medium text-gray-700 mb-1">Likelihood Rating (1-5)</label>
//                                                             <input
//                                                                 type="number"
//                                                                 min="1"
//                                                                 max="5"
//                                                                 value={formData.severity.likelihood_rating}
//                                                                 onChange={(e) => handleNumericChange(e, 'severity', 'likelihood_rating')}
//                                                                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                                                                 disabled={modalType === 'view'}
//                                                             />
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                                 <div className="bg-gray-100 p-4 rounded-md">
//                                                     <h4 className="text-lg font-medium mb-4 text-gray-800">Control Assessment</h4>
//                                                     <div className="space-y-4">
//                                                         <div>
//                                                             <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
//                                                             <textarea
//                                                                 value={formData.control_assessment.description}
//                                                                 onChange={(e) => handleFormChange(e, 'control_assessment', 'description')}
//                                                                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                                                                 rows="2"
//                                                                 placeholder="Describe existing controls..."
//                                                                 disabled={modalType === 'view'}
//                                                             ></textarea>
//                                                         </div>
//                                                         <div>
//                                                             <label className="block text-sm font-medium text-gray-700 mb-1">Rating (1-5)</label>
//                                                             <input
//                                                                 type="number"
//                                                                 min="1"
//                                                                 max="5"
//                                                                 value={formData.control_assessment.rating}
//                                                                 onChange={(e) => handleNumericChange(e, 'control_assessment', 'rating')}
//                                                                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                                                                 disabled={modalType === 'view'}
//                                                             />
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                             </div>

//                                             {/* Risk Assessment and Treatment */}
//                                             <div className="grid grid-cols-1 gap-6">
//                                                 <div className="bg-slate-700 p-4 rounded-md text-white">
//                                                     <h4 className="text-lg font-medium mb-4">Risk Assessment</h4>
//                                                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                                                         <div>
//                                                             <label className="block text-sm font-medium mb-1">Risk Rating</label>
//                                                             <input
//                                                                 type="number"
//                                                                 min="1"
//                                                                 value={formData.risk_assessment.risk_rating}
//                                                                 onChange={(e) => handleNumericChange(e, 'risk_assessment', 'risk_rating')}
//                                                                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
//                                                                 disabled={modalType === 'view'}
//                                                             />
//                                                         </div>
//                                                         <div>
//                                                             <label className="block text-sm font-medium mb-1">Risk Category</label>
//                                                             <select
//                                                                 value={formData.risk_assessment.risk_category}
//                                                                 onChange={(e) => handleSelectChange(e, 'risk_assessment', 'risk_category')}
//                                                                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
//                                                                 disabled={modalType === 'view'}
//                                                             >
//                                                                 <option value="Not Significant">Not Significant</option>
//                                                                 <option value="Significant">Significant</option>
//                                                                 <option value="Critical">Critical</option>
//                                                             </select>
//                                                         </div>
//                                                         <div>
//                                                             <label className="block text-sm font-medium mb-1">Department/BU</label>
//                                                             <input
//                                                                 type="text"
//                                                                 value={formData.risk_assessment.department_bu}
//                                                                 onChange={(e) => handleFormChange(e, 'risk_assessment', 'department_bu')}
//                                                                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
//                                                                 disabled={modalType === 'view'}
//                                                             />
//                                                         </div>
//                                                         <div>
//                                                             <label className="block text-sm font-medium mb-1">Risk Owner</label>
//                                                             <input
//                                                                 type="text"
//                                                                 value={formData.risk_assessment.risk_owner}
//                                                                 onChange={(e) => handleFormChange(e, 'risk_assessment', 'risk_owner')}
//                                                                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
//                                                                 disabled={modalType === 'view'}
//                                                             />
//                                                         </div>
//                                                         <div>
//                                                             <label className="block text-sm font-medium mb-1">Mitigation Strategy</label>
//                                                             <select
//                                                                 value={formData.risk_assessment.risk_mitigation_strategy}
//                                                                 onChange={(e) => handleSelectChange(e, 'risk_assessment', 'risk_mitigation_strategy')}
//                                                                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
//                                                                 disabled={modalType === 'view'}
//                                                             >
//                                                                 <option value="Tolerate">Tolerate</option>
//                                                                 <option value="Treat">Treat</option>
//                                                                 <option value="Transfer">Transfer</option>
//                                                                 <option value="Terminate">Terminate</option>
//                                                             </select>
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                             </div>

//                                             {/* Submit Buttons */}
//                                             <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
//                                                 <button
//                                                     type="button"
//                                                     className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
//                                                     onClick={closeModal}
//                                                 >
//                                                     Cancel
//                                                 </button>
//                                                 {modalType !== 'view' && (
//                                                     <button
//                                                         type="button"
//                                                         className="px-4 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
//                                                         onClick={modalType === 'edit' ? handleRiskUpdate : handleRiskSubmit}
//                                                     >
//                                                         {modalType === 'edit' ? 'Update Risk Assessment' : 'Save Risk Assessment'}
//                                                     </button>
//                                                 )}
//                                             </div>
//                                         </form>
//                                     )}

//                                     {/* Form for uploading Excel */}
//                                     {modalType === 'excel' && (
//                                         <form className="space-y-6">
//                                             <div className="bg-green-50 p-6 rounded-lg border-2 border-dashed border-green-300">
//                                                 <div className="text-center">
//                                                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mx-auto h-12 w-12 text-green-500">
//                                                         <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
//                                                     </svg>
//                                                     <h4 className="mt-2 text-lg font-medium text-gray-900">Upload Excel File</h4>
//                                                     <p className="mt-1 text-sm text-gray-500">
//                                                         Upload a .xlsx or .xls file with multiple risk assessments
//                                                     </p>
//                                                     <div className="mt-6">
//                                                         <label htmlFor="file-upload" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50">
//                                                             <span>Select file</span>
//                                                             <input
//                                                                 id="file-upload"
//                                                                 name="file-upload"
//                                                                 type="file"
//                                                                 accept=".xlsx,.xls"
//                                                                 className="sr-only"
//                                                                 onChange={handleFileChange}
//                                                             />
//                                                         </label>
//                                                     </div>
//                                                 </div>
//                                             </div>

//                                             {excelFile && (
//                                                 <div className="mt-4 flex items-center justify-center text-sm">
//                                                     <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
//                                                         Selected: {excelFile.name}
//                                                     </div>
//                                                 </div>
//                                             )}

//                                             {/* Submit Buttons */}
//                                             <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
//                                                 <button
//                                                     type="button"
//                                                     className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
//                                                     onClick={closeModal}
//                                                 >
//                                                     Cancel
//                                                 </button>
//                                                 <button
//                                                     type="button"
//                                                     className="px-4 py-2 rounded-md text-white bg-green-600 hover:bg-green-700"
//                                                     onClick={handleExcelSubmit}
//                                                 >
//                                                     Upload Risk Data
//                                                 </button>
//                                             </div>
//                                         </form>
//                                     )}
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 )
//             }
//         </div >
//     );
// };

// export default MyReports;