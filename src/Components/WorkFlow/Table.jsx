import React, { useState } from "react";
import AuditorWorkspace from "./AuditorsWorkspace";

const AuditorWorkspace = () => {
    // Mock data simulating the structure and requirements
    const data = [
        {
            "parentControl": "Organizational controls",
            "controlName": "5.1 Policies for information security",
            "keyPoints": [
                "Define an organization-wide information security policy approved by top management.",
                "Consider requirements derived from:",
                "  - Business strategy.",
                "  - Regulations and legislation.",
                "  - Contracts.",
                "  - Information security risks and threats.",
                "Include statements on:",
                "  - Definition of information security.",
                "  - Information security objectives or framework for setting objectives.",
                "  - Principles guiding information security activities.",
                "  - Commitment to meet applicable information security requirements.",
                "  - Commitment to continual improvement of the information security management system.",
                "  - Assignment of responsibilities for information security management.",
                "  - Procedures for handling exemptions and exceptions.",
                "Ensure top management approves changes to the information security policy.",
                "Support the policy with topic-specific policies addressing specific needs or security areas, such as:",
                "  - Access control.",
                "  - Physical and environmental security.",
                "  - Asset management.",
                "  - Information transfer.",
                "  - Secure configuration and handling of user endpoint devices.",
                "  - Networking security.",
                "  - Information security incident management.",
                "  - Backup.",
                "  - Cryptography and key management.",
                "  - Information classification and handling.",
                "  - Management of technical vulnerabilities.",
                "  - Secure development.",
                "Allocate responsibility for development, review, and approval of policies to personnel with appropriate authority and technical competency.",
                "Review policies considering:",
                "  - Business strategy.",
                "  - Technical environment.",
                "  - Regulations.",
                "  - Risks and threats.",
                "  - Lessons learned from incidents.",
                "Ensure policies are consistent across the organization and update related policies as needed.",
                "Communicate policies to relevant personnel and interested parties in accessible and understandable formats.",
                "Require recipients to acknowledge understanding and agreement to comply with policies.",
                "Consider combining the information security policy and topic-specific policies in a single document if appropriate.",
                "Ensure external distribution of policies does not disclose confidential information improperly."
            ]
        },

        {
            parentControl: "Organizational controls",
            controlName: "5.2 Information security roles and responsibilities",
            keyPoints: ["Allocate information security roles and responsibilities in line with the information security policy and topic-specific policies.", "Define and manage responsibilities for:", " - Protecting information and associated assets.", " - Executing specific information security processes.", " - Managing information security risks, including acceptance of residual risks by risk owners.", " - Ensuring all personnel use the organization's information and assets responsibly.", "Supplement responsibilities with detailed guidance for specific sites and processing facilities, as needed.", "Individuals with allocated responsibilities can delegate tasks but remain accountable for ensuring delegated tasks are correctly performed.", "Clearly define, document, and communicate each security area and responsibilities.", "Define and document authorization levels.", "Ensure individuals in specific information security roles are competent and supported to stay updated on role-specific developments.", "Additional Notes:", " - Organizations often appoint an information security manager for overall responsibility of information security implementation and risk management.", " - Responsibility for implementing controls may lie with individual managers.", " - Asset owners are commonly designated to manage the day-to-day protection of specific assets.", " - Information security can be managed by dedicated roles or integrated into existing roles, depending on organizational size and resources."]
        },
        {
            parentControl: "Organizational controls",
            controlName: "5.3 Segregation of duties",
            keyPoints: "This is the key point information for Control 3."
        },
        {
            parentControl: "People controls",
            controlName: "6.1 Screening",
            keyPoints: "This is the key point information for Control B2."
        },
        {
            parentControl: "People controls",
            controlName: "6.2 Terms and conditions of employment",
            keyPoints: "This is the key point information for Control C1."
        },
        {
            parentControl: "People controls",
            controlName: "6.3 Information security awareness, education and training",
            keyPoints: "This is the key point information for Control C2."
        },
        {
            parentControl: "Physical controls",
            controlName: "7.1 Physical security perimeters",
            keyPoints: "This is the key point information for Control D1."
        },
        {
            parentControl: "Physical controls",
            controlName: "7.2 Physical entry",
            keyPoints: "This is the key point information for Control D2."
        },
        {
            parentControl: "Technological controls",
            controlName: "8.1 User endpoint devices",
            keyPoints: "This is the key point information for Control D3."
        },
        {
            parentControl: "Technological controls",
            controlName: "8.2 Privileged access rights",
            keyPoints: "This is the key point information for Control A3."
        }
    ];

    const [popupContent, setPopupContent] = useState(null);

    return (
        <div className="p-4">
            <table className="min-w-full bg-white border border-gray-300">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="px-4 py-2 text-left">Parent Control</th>
                        <th className="px-4 py-2 text-left">Control Name</th>
                        <th className="px-4 py-2 text-left">Key Points</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr key={index} className="border-t">
                            <td className="px-4 py-2">{item.parentControl}</td>
                            <td className="px-4 py-2 flex items-center">
                                <input
                                    type="checkbox"
                                    className="mr-2 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                {item.controlName}
                            </td>
                            <td className="px-4 py-2">
                                <button
                                    className="text-blue-500 underline"
                                    onClick={() => setPopupContent(item.keyPoints)}
                                >
                                    i
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Popup for key points */}
            {popupContent && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded shadow-lg w-3/4 max-w-4xl">
                        <h2 className="text-lg font-bold mb-4">Key Points</h2>
                        <div className="max-h-96 overflow-y-auto">
                            {Array.isArray(popupContent) ? (
                                <ul className="list-disc pl-6">
                                    {popupContent.map((point, idx) => (
                                        <li key={idx} className="mb-2">{point}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p>{popupContent}</p>
                            )}
                        </div>
                        <div className="text-right">
                            <button
                                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                onClick={() => setPopupContent(null)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuditorWorkspace;
