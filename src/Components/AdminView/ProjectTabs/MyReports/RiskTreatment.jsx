import React, { useState, useEffect } from 'react';
import { FilePlus2, FileUp } from 'lucide-react';
import { apiRequest } from "../../../../utils/api";

const RiskTreatment = () => {
    // State to track which column groups are expanded
    const [expandedGroups, setExpandedGroups] = useState({
        impactAssessment: false,
        impactRatings: false,
        severity: false,
        controlAssessment: false,
        riskAssessment: false,
        riskRevision: false,
        mitigationPlan: false
    });

    // State for managing modal visibility
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('form'); // 'form' or 'edit' or 'excel'

    // State for tracking which risk is being edited
    const [editingRisk, setEditingRisk] = useState(null);

    // State for current project
    const [currentProject, setCurrentProject] = useState({
        id: '1',
        name: 'Project Alpha'
    });

    // States for API interactions
    const [riskData, setRiskData] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Start with loading state
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

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
            risk_rating: 1,
            risk_category: 'Not Significant',
            department_bu: '',
            risk_owner: '',
            risk_mitigation_strategy: 'Tolerate'
        },
        risk_revision: {
            applicable_soa_control: '',
            planned_controls_meet_requirements: 'Y',
            revised_control_rating: 1,
            residual_risk_rating: 1,
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

    // Function to toggle column group expansion
    const toggleGroup = (group) => {
        setExpandedGroups(prev => ({
            ...prev,
            [group]: !prev[group]
        }));
    };

    // Function to render expand/collapse icons
    const renderExpandIcon = (isExpanded) => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 ml-2 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
    );

    // Function to get color for impact cells
    const getImpactColor = (value) => {
        return value === 'Y' ? 'bg-red-100 text-red-800' : '';
    };

    // Function to get color for rating cells
    const getRatingColor = (value) => {
        if (value >= 4) return 'bg-red-100 text-red-800';
        if (value >= 3) return 'bg-amber-100 text-amber-800';
        if (value >= 2) return 'bg-yellow-100 text-yellow-800';
        return 'bg-green-100 text-green-800';
    };

    // Function to open modal
    const openModal = (type) => {
        setModalType(type);
        setShowModal(true);
        setError(null);
        setSuccessMessage(null);

        // Reset form data if creating new risk
        if (type === 'create') {
            setEditingRisk(null);
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
                    risk_rating: 1,
                    risk_category: 'Not Significant',
                    department_bu: '',
                    risk_owner: '',
                    risk_mitigation_strategy: 'Tolerate'
                },
                risk_revision: {
                    applicable_soa_control: '',
                    planned_controls_meet_requirements: 'Y',
                    revised_control_rating: 1,
                    residual_risk_rating: 1,
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
    };

    // Function to close modal
    const closeModal = () => {
        setShowModal(false);
        setError(null);
        setSuccessMessage(null);
    };

    // Function to handle form changes
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

    // Function to handle select changes
    const handleSelectChange = (e, section, field) => {
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

    // Delete a risk
    const handleDeleteRisk = async (riskId) => {
        if (window.confirm('Are you sure you want to delete this treatment plan?')) {
            setIsLoading(true);
            setError(null);

            try {
                console.log("Deleting treatment plan:", riskId);

                // Call the API to delete the risk
                await apiRequest(
                    "DELETE",
                    `/api/rarpt/risks/${riskId}/`,
                    null,
                    true
                );

                setSuccessMessage('Treatment plan deleted successfully');

                // Refresh all risks to ensure data consistency
                await fetchRisks();

            } catch (err) {
                console.error('Error deleting treatment plan:', err);
                setError(err.message || 'Failed to delete treatment plan');
            } finally {
                setIsLoading(false);
            }
        }
    };

    // Function to fetch risks from the API
    const fetchRisks = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Call the API to get risks for the current project
            const response = await apiRequest(
                "GET",
                `/api/rarpt/project/${currentProject.id}/risks/`,
                null,
                true
            );

            // Check if the response contains data
            if (response.data && Array.isArray(response.data)) {
                // Transform API data to match the expected format for the frontend if needed
                const formattedRisks = response.data.map(risk => {
                    // Ensure all properties exist to prevent 'undefined' errors
                    return {
                        id: risk.id || '',
                        vulnerabilityType: risk.vulnerability_type || 'Not Specified', // Make sure this is correctly mapped
                        threatDescription: risk.threat_description || '',
                        context: risk.context || '',
                        applicableActivity: risk.applicable_activity || '',
                        // Ensure all nested objects have their properties defined with default values
                        impactAssessment: {
                            confidentiality: risk.impact_assessment?.impact_on_confidentiality || 'N',
                            integrity: risk.impact_assessment?.impact_on_integrity || 'N',
                            availability: risk.impact_assessment?.impact_on_availability || 'N',
                            legalObligation: risk.impact_assessment?.breach_of_legal_obligation || 'N',
                            legalObligationDesc: risk.impact_assessment?.description_of_legal_obligation || ''
                        },
                        impactRatings: {
                            customer: risk.impact_ratings?.on_customer || 1,
                            serviceCapability: risk.impact_ratings?.on_service_capability || 1,
                            financialDamage: risk.impact_ratings?.financial_damage || 1,
                            spreadMagnitude: risk.impact_ratings?.spread_magnitude || 1
                        },
                        severity: {
                            consequenceRating: risk.severity?.consequence_rating || 1,
                            likelihoodRating: risk.severity?.likelihood_rating || 1
                        },
                        controlAssessment: {
                            description: risk.control_assessment?.description || '',
                            rating: risk.control_assessment?.rating || 1
                        },
                        riskAssessment: {
                            riskRating: risk.risk_assessment?.risk_rating || 1,
                            riskCategory: risk.risk_assessment?.risk_category || 'Not Significant',
                            departmentBU: risk.risk_assessment?.department_bu || '',
                            riskOwner: risk.risk_assessment?.risk_owner || '',
                            mitigationStrategy: risk.risk_assessment?.risk_mitigation_strategy || 'Tolerate'
                        },
                        riskRevision: {
                            soaControl: risk.risk_revision?.applicable_soa_control || '',
                            soaControlDesc: '',
                            meetsRequirements: risk.risk_revision?.planned_controls_meet_requirements || 'Y',
                            revisedControlRating: risk.risk_revision?.revised_control_rating || 1,
                            residualRiskRating: risk.risk_revision?.residual_risk_rating || 1,
                            acceptableToOwner: risk.risk_revision?.acceptable_to_risk_owner || 'Y'
                        },
                        mitigationPlan: {
                            furtherPlannedAction: '',
                            taskId: risk.mitigation_task?.task_id || '',
                            taskDescription: risk.mitigation_task?.task_description || '',
                            taskOwner: risk.mitigation_task?.task_owner || '',
                            isOngoing: risk.mitigation_task?.is_ongoing || 'Y',
                            isRecurrent: risk.mitigation_task?.is_recurrent || 'N',
                            frequency: risk.mitigation_task?.frequency || '',
                            plannedCompletionDate: risk.mitigation_task?.planned_completion_date || ''
                        }
                    };
                });

                setRiskData(formattedRisks);
                setIsLoading(false);
                setError(null);
            } else {
                // Handle case where response doesn't contain data as expected
                setRiskData([]);
                setIsLoading(false);
                setError('No risk data available or invalid format');
            }
        } catch (err) {
            console.error('Error fetching risks:', err);
            setRiskData([]);
            setIsLoading(false);
            setError(`Failed to fetch risks: ${err.message || 'Unknown error'}`);
        }
    };

    // Fetch risks on component mount
    useEffect(() => {
        fetchRisks();
    }, [currentProject.id]);

    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 p-5 bg-white sticky top-0 z-10 shadow-sm">
                <div className="flex items-center">
                    <h2 className="text-xl font-bold text-slate-800">Risk Treatment & Implementation Plans</h2>
                    <div className="ml-3 text-slate-600 font-medium bg-indigo-50 px-3 py-1 rounded-full">
                        {riskData.length} plans
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-md flex items-center transform hover:scale-105 transition-transform duration-200"
                        onClick={() => openModal('create')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        <span>Add Treatment Plan</span>
                    </button>
                    <button
                        className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-md flex items-center transform hover:scale-105 transition-transform duration-200"
                        onClick={() => openModal('excel')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                        <span>Upload Excel</span>
                    </button>
                </div>
            </div>

            {/* Status Messages */}
            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-4 mx-4 rounded shadow">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                </div>
            )}

            {successMessage && (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 my-4 mx-4 rounded shadow">
                    <p className="font-bold">Success</p>
                    <p>{successMessage}</p>
                </div>
            )}

            {isLoading && (
                <div className="flex justify-center items-center p-4">
                    <div className="loader ease-linear rounded-full border-4 border-t-4 border-slate-200 h-12 w-12 mb-4 border-t-indigo-500 animate-spin"></div>
                </div>
            )}

            {/* Risk Treatment Table */}
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
                                        <span>(1) Impact Assessment</span>
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
                                        <span>(2) Impact Ratings</span>
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
                                        <span>(3) Severity</span>
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
                                        <span>(4) Control Assessment</span>
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
                                        <span>(5) Risk Assessment</span>
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
                                        <span>(6) Treatment Strategy</span>
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
                                        <span>(7) Implementation Plan</span>
                                        {renderExpandIcon(expandedGroups.mitigationPlan)}
                                    </div>
                                </th>
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
                                                title="View Treatment Plan"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-600">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            </button>
                                            <button
                                                className="p-1 bg-blue-100 rounded hover:bg-blue-200 transition-colors"
                                                title="Edit Treatment Plan"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-600">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                                </svg>
                                            </button>
                                            <button
                                                className="p-1 bg-red-100 rounded hover:bg-red-200 transition-colors"
                                                title="Delete"
                                                onClick={() => handleDeleteRisk(risk.id)}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-red-600">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>

                                    {/* Basic cells */}
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
                                            C:{risk.impactRatings.customer}/S:{risk.impactRatings.serviceCapability}
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
                                            C:{risk.severity.consequenceRating}/L:{risk.severity.likelihoodRating}
                                        </td>
                                    )}

                                    {/* Control Assessment cells */}
                                    {expandedGroups.controlAssessment ? (
                                        <>
                                            <td className="border border-slate-200 p-3">
                                                {risk.controlAssessment.description}
                                            </td>
                                            <td className={`border border-slate-200 p-3 text-center ${getRatingColor(risk.controlAssessment.rating)}`}>
                                                {risk.controlAssessment.rating}
                                            </td>
                                        </>
                                    ) : (
                                        <td className={`border border-slate-200 p-3 text-center ${getRatingColor(risk.controlAssessment.rating)}`}>
                                            {risk.controlAssessment.rating}
                                        </td>
                                    )}

                                    {/* Risk Assessment cells */}
                                    {expandedGroups.riskAssessment ? (
                                        <>
                                            <td className={`border border-slate-200 p-3 text-center ${risk.riskAssessment.riskRating > 20 ? "bg-red-500 text-white" : "bg-slate-50"}`}>
                                                {risk.riskAssessment.riskRating}
                                            </td>
                                            <td className="border border-slate-200 p-3 bg-slate-50">{risk.riskAssessment.riskCategory}</td>
                                            <td className="border border-slate-200 p-3 bg-slate-50">{risk.riskAssessment.departmentBU}</td>
                                            <td className="border border-slate-200 p-3 bg-slate-50">{risk.riskAssessment.riskOwner}</td>
                                            <td className="border border-slate-200 p-3 bg-slate-50">{risk.riskAssessment.mitigationStrategy}</td>
                                        </>
                                    ) : (
                                        <td className={`border border-slate-200 p-3 text-center ${risk.riskAssessment.riskRating > 20 ? "bg-red-500 text-white" : ""}`}>
                                            {risk.riskAssessment.riskRating}
                                        </td>
                                    )}

                                    {/* Risk Revision cells (renamed to Treatment Strategy) */}
                                    {expandedGroups.riskRevision ? (
                                        <>
                                            <td className="border border-slate-200 p-3 bg-indigo-50">{risk.riskRevision.soaControl}</td>
                                            <td className="border border-slate-200 p-3 bg-indigo-50">{risk.riskRevision.soaControlDesc}</td>
                                            <td className="border border-slate-200 p-3 text-center bg-indigo-50">{risk.riskRevision.meetsRequirements}</td>
                                            <td className={`border border-slate-200 p-3 text-center bg-yellow-200`}>
                                                {risk.riskRevision.revisedControlRating}
                                            </td>
                                            <td className="border border-slate-200 p-3 text-center bg-indigo-50">{risk.riskRevision.residualRiskRating}</td>
                                            <td className="border border-slate-200 p-3 text-center bg-indigo-50">{risk.riskRevision.acceptableToOwner}</td>
                                        </>
                                    ) : (
                                        <td className="border border-slate-200 p-3 text-center bg-indigo-50">
                                            RR: {risk.riskRevision.residualRiskRating}
                                        </td>
                                    )}

                                    {/* Mitigation Plan cells (renamed to Implementation Plan) */}
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
            </div>
        </>
    );
};

export default RiskTreatment;