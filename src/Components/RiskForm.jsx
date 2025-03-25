import React, { useState } from 'react';
import { X } from 'lucide-react';

const AddRiskForm = ({ onClose }) => {
    const [formData, setFormData] = useState({
        risk_id: '',
        vulnerability_type: '',
        threat_description: '',
        context: '',
        applicable_activity: '',
        impact_assessment: {
            impact_on_confidentiality: 'N',
            impact_on_integrity: 'N',
            impact_on_availability: 'N',
            breach_of_legal_obligation: 'N',
            description_of_legal_obligation: '',
            on_customer: 1,
            on_service_capability: 1,
            financial_damage: 1,
            spread_magnitude: 1,
            consequence_rating: 1,
            likelihood_rating: 1,
        },
        control_assessment: {
            description: '',
            rating: 1,
        },
        risk_assessment: {
            risk_rating: 1,
            risk_category: '',
            department_by: '',
            risk_owner: '',
            risk_mitigation_strategy: '',
        },
        risk_revision: {
            applicable_soa_control: '',
            planned_controls_meet_requirements: 'N',
            revised_control_rating: 1,
            residual_risk_rating: 1,
            acceptable_to_risk_owner: 'N',
        },
        mitigation_task: {
            task_id: '',
            task_description: '',
            task_owner: '',
            is_ongoing: 'N',
            is_recurrent: 'N',
            frequency: '',
        },
    });

    const handleChange = (e, section, field) => {
        if (section) {
            setFormData({
                ...formData,
                [section]: {
                    ...formData[section],
                    [field]: e.target.value,
                },
            });
        } else {
            setFormData({
                ...formData,
                [field]: e.target.value,
            });
        }
    };

    const handleNumericChange = (e, section, field) => {
        const value = parseInt(e.target.value) || 1;
        if (section) {
            setFormData({
                ...formData,
                [section]: {
                    ...formData[section],
                    [field]: value,
                },
            });
        } else {
            setFormData({
                ...formData,
                [field]: value,
            });
        }
    };

    const yesNoOptions = ['Y', 'N'];
    const ratingOptions = [1, 2, 3, 4, 5];
    const vulnerabilityTypes = ['Earthquake', 'Flood', 'Fire', 'Power Outage', 'Cyber Attack', 'Data Breach', 'Other'];
    const contextTypes = ['Natural', 'Technical', 'Human', 'Process', 'External', 'Internal'];
    const mitigationStrategies = ['Tolerate', 'Treat', 'Transfer', 'Terminate'];

    return (
        <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Add New Risk Assessment</h2>
                <button onClick={onClose}>
                    <X className="w-6 h-6 text-gray-600" />
                </button>
            </div>

            <form>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Basic Information */}
                    <div className="col-span-2">
                        <h3 className="text-lg font-semibold mb-2">Basic Information</h3>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Risk ID</label>
                        <input
                            type="text"
                            value={formData.risk_id}
                            onChange={(e) => handleChange(e, null, 'risk_id')}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Vulnerability Type</label>
                        <select
                            value={formData.vulnerability_type}
                            onChange={(e) => handleChange(e, null, 'vulnerability_type')}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        >
                            {vulnerabilityTypes.map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Threat Description</label>
                        <textarea
                            value={formData.threat_description}
                            onChange={(e) => handleChange(e, null, 'threat_description')}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            rows="2"
                            required
                        ></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Context</label>
                        <select
                            value={formData.context}
                            onChange={(e) => handleChange(e, null, 'context')}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        >
                            {contextTypes.map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Applicable Activity</label>
                        <input
                            type="text"
                            value={formData.applicable_activity}
                            onChange={(e) => handleChange(e, null, 'applicable_activity')}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                    </div>

                    {/* Impact Assessment */}
                    <div className="col-span-2 mt-4">
                        <h3 className="text-lg font-semibold mb-2">Impact Assessment</h3>
                    </div>
                    {['impact_on_confidentiality', 'impact_on_integrity', 'impact_on_availability'].map((field) => (
                        <div key={field}>
                            <label className="block text-sm font-medium text-gray-700 capitalize">{field.replace(/_/g, ' ')}</label>
                            <select
                                value={formData.impact_assessment[field]}
                                onChange={(e) => handleChange(e, 'impact_assessment', field)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                {yesNoOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ))}
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Description of Legal Obligation</label>
                        <textarea
                            value={formData.impact_assessment.description_of_legal_obligation}
                            onChange={(e) => handleChange(e, 'impact_assessment', 'description_of_legal_obligation')}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            rows="2"
                        ></textarea>
                    </div>

                    {/* Control Assessment */}
                    <div className="col-span-2 mt-4">
                        <h3 className="text-lg font-semibold mb-2">Control Assessment</h3>
                    </div>
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Control Description</label>
                        <textarea
                            value={formData.control_assessment.description}
                            onChange={(e) => handleChange(e, 'control_assessment', 'description')}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            rows="3"
                            required
                        ></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Control Rating</label>
                        <select
                            value={formData.control_assessment.rating}
                            onChange={(e) => handleNumericChange(e, 'control_assessment', 'rating')}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            {ratingOptions.map((rating) => (
                                <option key={rating} value={rating}>
                                    {rating}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Risk Assessment */}
                    <div className="col-span-2 mt-4">
                        <h3 className="text-lg font-semibold mb-2">Risk Assessment</h3>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Risk Rating</label>
                        <select
                            value={formData.risk_assessment.risk_rating}
                            onChange={(e) => handleNumericChange(e, 'risk_assessment', 'risk_rating')}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            {ratingOptions.map((rating) => (
                                <option key={rating} value={rating}>
                                    {rating}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Risk Category</label>
                        <input
                            type="text"
                            value={formData.risk_assessment.risk_category}
                            onChange={(e) => handleChange(e, 'risk_assessment', 'risk_category')}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Department</label>
                        <input
                            type="text"
                            value={formData.risk_assessment.department_by}
                            onChange={(e) => handleChange(e, 'risk_assessment', 'department_by')}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Risk Owner</label>
                        <input
                            type="text"
                            value={formData.risk_assessment.risk_owner}
                            onChange={(e) => handleChange(e, 'risk_assessment', 'risk_owner')}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Risk Mitigation Strategy</label>
                        <select
                            value={formData.risk_assessment.risk_mitigation_strategy}
                            onChange={(e) => handleChange(e, 'risk_assessment', 'risk_mitigation_strategy')}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        >
                            {mitigationStrategies.map((strategy) => (
                                <option key={strategy} value={strategy}>
                                    {strategy}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Risk Revision */}
                    <div className="col-span-2 mt-4">
                        <h3 className="text-lg font-semibold mb-2">Risk Revision</h3>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Applicable SOA Control</label>
                        <input
                            type="text"
                            value={formData.risk_revision.applicable_soa_control}
                            onChange={(e) => handleChange(e, 'risk_revision', 'applicable_soa_control')}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Planned Controls Meet Requirements</label>
                        <select
                            value={formData.risk_revision.planned_controls_meet_requirements}
                            onChange={(e) => handleChange(e, 'risk_revision', 'planned_controls_meet_requirements')}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            {yesNoOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Revised Control Rating</label>
                        <select
                            value={formData.risk_revision.revised_control_rating}
                            onChange={(e) => handleNumericChange(e, 'risk_revision', 'revised_control_rating')}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            {ratingOptions.map((rating) => (
                                <option key={rating} value={rating}>
                                    {rating}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Residual Risk Rating</label>
                        <select
                            value={formData.risk_revision.residual_risk_rating}
                            onChange={(e) => handleNumericChange(e, 'risk_revision', 'residual_risk_rating')}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            {ratingOptions.map((rating) => (
                                <option key={rating} value={rating}>
                                    {rating}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Acceptable to Risk Owner</label>
                        <select
                            value={formData.risk_revision.acceptable_to_risk_owner}
                            onChange={(e) => handleChange(e, 'risk_revision', 'acceptable_to_risk_owner')}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            {yesNoOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Mitigation Task */}
                    <div className="col-span-2 mt-4">
                        <h3 className="text-lg font-semibold mb-2">Mitigation Task</h3>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Task ID</label>
                        <input
                            type="text"
                            value={formData.mitigation_task.task_id}
                            onChange={(e) => handleChange(e, 'mitigation_task', 'task_id')}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Task Owner</label>
                        <input
                            type="text"
                            value={formData.mitigation_task.task_owner}
                            onChange={(e) => handleChange(e, 'mitigation_task', 'task_owner')}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Task Description</label>
                        <textarea
                            value={formData.mitigation_task.task_description}
                            onChange={(e) => handleChange(e, 'mitigation_task', 'task_description')}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            rows="2"
                        ></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Is Ongoing</label>
                        <select
                            value={formData.mitigation_task.is_ongoing}
                            onChange={(e) => handleChange(e, 'mitigation_task', 'is_ongoing')}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            {yesNoOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Is Recurrent</label>
                        <select
                            value={formData.mitigation_task.is_recurrent}
                            onChange={(e) => handleChange(e, 'mitigation_task', 'is_recurrent')}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            {yesNoOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Frequency</label>
                        <input
                            type="text"
                            value={formData.mitigation_task.frequency}
                            onChange={(e) => handleChange(e, 'mitigation_task', 'frequency')}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="e.g., Once every six months"
                        />
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        type="button"
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md mr-2"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md"
                    >
                        Submit Risk Assessment
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddRiskForm;