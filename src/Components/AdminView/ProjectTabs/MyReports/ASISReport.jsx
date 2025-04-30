import React, { useState } from "react";

const ASISReport = () => {
    // State for data - using the first 15 rows from the Excel data provided
    const [controls] = useState([
        {
            controlID: "A.5.1",
            controlName: "Policies for information security",
            associatedOrgFunction: "Compliance, Exec. Management, Legal",
            controlTheme: "Organizational",
            preventive: "Yes",
            detective: "No",
            corrective: "No",
            confidentiality: "Yes",
            integrity: "Yes",
            availability: "Yes",
            doesControlCoverIntent: "Yes",
            doesControlCoverImplementation: "No",
            doesControlCoverEffectiveness: "No",
            identify: "Yes",
            protect: "No",
            detect: "No",
            respond: "No",
            recover: "No",
            governanceAndEcosystem: "Yes",
            protection: "No",
            defence: "No",
            resilience: "Yes",
            governance: "Yes",
            assetManagement: "No",
            informationProtection: "No",
            humanResourceSecurity: "No",
            physicalSecurity: "No",
            systemAndNetworkSecurity: "No",
            applicationSecurity: "No",
            secureConfiguration: "No",
            identityAndAccessManagement: "No",
            threatAndVulnerabilityManagement: "No",
            continuity: "No",
            supplierRelationshipsSecurity: "No",
            legalAndCompliance: "No",
            informationSecurityEventManagement: "No",
            informationSecurityAssurance: "No",
            relatedTo: "Plan"
        },
        {
            controlID: "A.5.2",
            controlName: "Information security roles and responsibilities",
            associatedOrgFunction: "Compliance, Exec. Management",
            controlTheme: "Organizational",
            preventive: "Yes",
            detective: "No",
            corrective: "No",
            confidentiality: "Yes",
            integrity: "Yes",
            availability: "Yes",
            doesControlCoverIntent: "Yes",
            doesControlCoverImplementation: "No",
            doesControlCoverEffectiveness: "No",
            identify: "Yes",
            protect: "No",
            detect: "No",
            respond: "No",
            recover: "No",
            governanceAndEcosystem: "Yes",
            protection: "Yes",
            defence: "No",
            resilience: "Yes",
            governance: "Yes",
            assetManagement: "No",
            informationProtection: "No",
            humanResourceSecurity: "No",
            physicalSecurity: "No",
            systemAndNetworkSecurity: "No",
            applicationSecurity: "No",
            secureConfiguration: "No",
            identityAndAccessManagement: "No",
            threatAndVulnerabilityManagement: "No",
            continuity: "No",
            supplierRelationshipsSecurity: "No",
            legalAndCompliance: "No",
            informationSecurityEventManagement: "No",
            informationSecurityAssurance: "No",
            relatedTo: "Plan"
        },
        {
            controlID: "A.5.3",
            controlName: "Segregation of duties",
            associatedOrgFunction: "Compliance, HR, Exec. Management",
            controlTheme: "Organizational",
            preventive: "Yes",
            detective: "No",
            corrective: "No",
            confidentiality: "Yes",
            integrity: "Yes",
            availability: "Yes",
            doesControlCoverIntent: "Yes",
            doesControlCoverImplementation: "No",
            doesControlCoverEffectiveness: "No",
            identify: "No",
            protect: "Yes",
            detect: "No",
            respond: "No",
            recover: "No",
            governanceAndEcosystem: "Yes",
            protection: "No",
            defence: "No",
            resilience: "No",
            governance: "Yes",
            assetManagement: "No",
            informationProtection: "No",
            humanResourceSecurity: "Yes",
            physicalSecurity: "No",
            systemAndNetworkSecurity: "No",
            applicationSecurity: "No",
            secureConfiguration: "No",
            identityAndAccessManagement: "Yes",
            threatAndVulnerabilityManagement: "No",
            continuity: "No",
            supplierRelationshipsSecurity: "No",
            legalAndCompliance: "No",
            informationSecurityEventManagement: "No",
            informationSecurityAssurance: "No",
            relatedTo: "Plan"
        },
        {
            controlID: "A.5.4",
            controlName: "Management responsibilities",
            associatedOrgFunction: "Exec. Management, HR",
            controlTheme: "Organizational",
            preventive: "Yes",
            detective: "No",
            corrective: "No",
            confidentiality: "Yes",
            integrity: "Yes",
            availability: "Yes",
            doesControlCoverIntent: "Yes",
            doesControlCoverImplementation: "No",
            doesControlCoverEffectiveness: "No",
            identify: "Yes",
            protect: "No",
            detect: "No",
            respond: "No",
            recover: "No",
            governanceAndEcosystem: "Yes",
            protection: "No",
            defence: "No",
            resilience: "No",
            governance: "Yes",
            assetManagement: "No",
            informationProtection: "No",
            humanResourceSecurity: "No",
            physicalSecurity: "No",
            systemAndNetworkSecurity: "No",
            applicationSecurity: "No",
            secureConfiguration: "No",
            identityAndAccessManagement: "No",
            threatAndVulnerabilityManagement: "No",
            continuity: "No",
            supplierRelationshipsSecurity: "No",
            legalAndCompliance: "No",
            informationSecurityEventManagement: "No",
            informationSecurityAssurance: "No",
            relatedTo: "Plan"
        },
        {
            controlID: "A.5.5",
            controlName: "Contact with authorities",
            associatedOrgFunction: "Compliance, Legal, Finance",
            controlTheme: "Organizational",
            preventive: "Yes",
            detective: "No",
            corrective: "Yes",
            confidentiality: "Yes",
            integrity: "Yes",
            availability: "Yes",
            doesControlCoverIntent: "Yes",
            doesControlCoverImplementation: "No",
            doesControlCoverEffectiveness: "No",
            identify: "Yes",
            protect: "Yes",
            detect: "No",
            respond: "Yes",
            recover: "Yes",
            governanceAndEcosystem: "No",
            protection: "No",
            defence: "Yes",
            resilience: "Yes",
            governance: "Yes",
            assetManagement: "No",
            informationProtection: "No",
            humanResourceSecurity: "No",
            physicalSecurity: "No",
            systemAndNetworkSecurity: "No",
            applicationSecurity: "No",
            secureConfiguration: "No",
            identityAndAccessManagement: "No",
            threatAndVulnerabilityManagement: "No",
            continuity: "No",
            supplierRelationshipsSecurity: "No",
            legalAndCompliance: "No",
            informationSecurityEventManagement: "No",
            informationSecurityAssurance: "No",
            relatedTo: "Plan"
        }
    ]);

    // Expanded groups state
    const [expandedGroups, setExpandedGroups] = useState({
        controlType: false,
        controlProperty: false,
        cyberSecurityConcept: false,
        securityDomain: false,
        operationalCapability: false,
        other: false
    });

    // Toggle group expansion
    const toggleGroup = (groupName) => {
        setExpandedGroups((prev) => ({
            ...prev,
            [groupName]: !prev[groupName]
        }));
    };

    // Helper function to render expand/collapse icon
    const renderExpandIcon = (isExpanded) => (
        <span
            className={`ml-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-opacity-50 transition-transform duration-300 ${isExpanded ? "rotate-90" : ""}`}
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

                {/* Action buttons */}
                <div className="flex space-x-3">
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Risk
                    </button>

                    <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Upload Excel
                    </button>

                    <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Legend
                    </button>
                </div>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                    {/* Table Header */}
                    <thead>
                        <tr>
                            {/* Basic columns */}
                            <th className="border border-slate-200 p-3 bg-gray-100 sticky left-0 z-10">Control ID</th>
                            <th className="border border-slate-200 p-3 bg-gray-100 min-w-[250px]">Control Name</th>
                            <th className="border border-slate-200 p-3 bg-gray-100 min-w-[200px]">Associated org function</th>
                            <th className="border border-slate-200 p-3 bg-gray-100">Control Theme</th>

                            {/* Control Type header group */}
                            <th
                                onClick={() => toggleGroup('controlType')}
                                colSpan={expandedGroups.controlType ? 3 : 1}
                                className="border border-slate-200 p-3 bg-slate-700 text-white text-left cursor-pointer font-medium"
                            >
                                Control Type {renderExpandIcon(expandedGroups.controlType)}
                            </th>

                            {/* Control property / Control objective header group */}
                            <th
                                onClick={() => toggleGroup('controlProperty')}
                                colSpan={expandedGroups.controlProperty ? 3 : 1}
                                className="border border-slate-200 p-3 bg-slate-700 text-white text-left cursor-pointer font-medium"
                            >
                                Control property / Control objective {renderExpandIcon(expandedGroups.controlProperty)}
                            </th>

                            {/* Standalone columns for coverage assessment - no header group */}
                            <th className="border border-slate-200 p-3 bg-gray-100">Does the control cover intent?</th>
                            <th className="border border-slate-200 p-3 bg-gray-100">Does the control cover implementation?</th>
                            <th className="border border-slate-200 p-3 bg-gray-100">Does the control cover effectiveness?</th>

                            {/* Control Type / Cyber security concept header group */}
                            <th
                                onClick={() => toggleGroup('cyberSecurityConcept')}
                                colSpan={expandedGroups.cyberSecurityConcept ? 5 : 1}
                                className="border border-slate-200 p-3 bg-slate-700 text-white text-left cursor-pointer font-medium"
                            >
                                Control Type / Cyber security concept {renderExpandIcon(expandedGroups.cyberSecurityConcept)}
                            </th>

                            {/* Security domain header group */}
                            <th
                                onClick={() => toggleGroup('securityDomain')}
                                colSpan={expandedGroups.securityDomain ? 4 : 1}
                                className="border border-slate-200 p-3 bg-slate-700 text-white text-left cursor-pointer font-medium"
                            >
                                Security domain {renderExpandIcon(expandedGroups.securityDomain)}
                            </th>

                            {/* Operational capability header group */}
                            <th
                                onClick={() => toggleGroup('operationalCapability')}
                                colSpan={expandedGroups.operationalCapability ? 15 : 1}
                                className="border border-slate-200 p-3 bg-slate-700 text-white text-left cursor-pointer font-medium"
                            >
                                Operational capability {renderExpandIcon(expandedGroups.operationalCapability)}
                            </th>

                            {/* Other header group */}
                            <th
                                onClick={() => toggleGroup('other')}
                                colSpan={expandedGroups.other ? 4 : 1}
                                className="border border-slate-200 p-3 bg-slate-700 text-white text-left cursor-pointer font-medium"
                            >
                                Other {renderExpandIcon(expandedGroups.other)}
                            </th>
                        </tr>

                        {/* Subheaders for expanded groups */}
                        <tr>
                            {/* Basic placeholder columns */}
                            <th className="border border-slate-200 p-3 bg-gray-100 sticky left-0"></th>
                            <th className="border border-slate-200 p-3 bg-gray-100"></th>
                            <th className="border border-slate-200 p-3 bg-gray-100"></th>
                            <th className="border border-slate-200 p-3 bg-gray-100"></th>

                            {/* Control Type subheaders */}
                            {expandedGroups.controlType ? (
                                <>
                                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white">Preventive</th>
                                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white">Detective</th>
                                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white">Corrective</th>
                                </>
                            ) : (
                                <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white"></th>
                            )}

                            {/* Control property subheaders */}
                            {expandedGroups.controlProperty ? (
                                <>
                                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white">Confidentiality</th>
                                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white">Integrity</th>
                                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white">Availability</th>
                                </>
                            ) : (
                                <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white"></th>
                            )}

                            {/* Standalone columns for coverage assessment - placeholder in subheader row */}
                            <th className="border border-slate-200 p-3 bg-gray-100"></th>
                            <th className="border border-slate-200 p-3 bg-gray-100"></th>
                            <th className="border border-slate-200 p-3 bg-gray-100"></th>

                            {/* Cyber security concept subheaders */}
                            {expandedGroups.cyberSecurityConcept ? (
                                <>
                                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white">Identify</th>
                                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white">Protect</th>
                                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white">Detect</th>
                                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white">Respond</th>
                                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white">Recover</th>
                                </>
                            ) : (
                                <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white"></th>
                            )}

                            {/* Security domain subheaders */}
                            {expandedGroups.securityDomain ? (
                                <>
                                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white">Governance_and_Ecosystem</th>
                                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white">Protection</th>
                                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white">Defence</th>
                                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white">Resilience</th>
                                </>
                            ) : (
                                <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white"></th>
                            )}

                            {/* Operational capability subheaders */}
                            {expandedGroups.operationalCapability ? (
                                <>
                                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white">Governance</th>
                                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white">Asset_management</th>
                                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white">Information_protection</th>
                                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white">Human_resource_security</th>
                                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white">Physical_security</th>
                                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white">System_and_network_security</th>
                                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white">Application_security</th>
                                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white">Secure_configuration</th>
                                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white">Identity_and_access_management</th>
                                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white">Threat_and_vulnerability_management</th>
                                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white">Continuity</th>
                                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white">Supplier_relationships_security</th>
                                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white">Legal_and_compliance</th>
                                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white">Information_security_event_management</th>
                                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white">Information_security_assurance</th>
                                </>
                            ) : (
                                <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white"></th>
                            )}

                            {/* Other subheaders */}
                            {expandedGroups.other ? (
                                <>
                                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white">Related to P or D or C or A</th>
                                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white">Must have</th>
                                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white">Nice to have</th>
                                    <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white">Sample audit questions</th>
                                </>
                            ) : (
                                <th className="border border-slate-200 p-3 font-medium bg-slate-600 text-white"></th>
                            )}
                        </tr>
                    </thead>

                    {/* Table Body */}
                    <tbody>
                        {controls.map((control, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                {/* Basic columns */}
                                <td className="border border-slate-200 p-3 sticky left-0 bg-white">{control.controlID}</td>
                                <td className="border border-slate-200 p-3">{control.controlName}</td>
                                <td className="border border-slate-200 p-3">{control.associatedOrgFunction}</td>
                                <td className="border border-slate-200 p-3">{control.controlTheme}</td>

                                {/* Control Type cells */}
                                {expandedGroups.controlType ? (
                                    <>
                                        <td className="border border-slate-200 p-3 text-center">{control.preventive}</td>
                                        <td className="border border-slate-200 p-3 text-center">{control.detective}</td>
                                        <td className="border border-slate-200 p-3 text-center">{control.corrective}</td>
                                    </>
                                ) : (
                                    <td className="border border-slate-200 p-3 text-center">
                                        P:{control.preventive} D:{control.detective} C:{control.corrective}
                                    </td>
                                )}

                                {/* Control property cells */}
                                {expandedGroups.controlProperty ? (
                                    <>
                                        <td className="border border-slate-200 p-3 text-center">{control.confidentiality}</td>
                                        <td className="border border-slate-200 p-3 text-center">{control.integrity}</td>
                                        <td className="border border-slate-200 p-3 text-center">{control.availability}</td>
                                    </>
                                ) : (
                                    <td className="border border-slate-200 p-3 text-center">
                                        C:{control.confidentiality} I:{control.integrity} A:{control.availability}
                                    </td>
                                )}

                                {/* Standalone cells for coverage assessment */}
                                <td className="border border-slate-200 p-3 text-center">{control.doesControlCoverIntent}</td>
                                <td className="border border-slate-200 p-3 text-center">{control.doesControlCoverImplementation}</td>
                                <td className="border border-slate-200 p-3 text-center">{control.doesControlCoverEffectiveness}</td>

                                {/* Cyber security concept cells */}
                                {expandedGroups.cyberSecurityConcept ? (
                                    <>
                                        <td className="border border-slate-200 p-3 text-center">{control.identify}</td>
                                        <td className="border border-slate-200 p-3 text-center">{control.protect}</td>
                                        <td className="border border-slate-200 p-3 text-center">{control.detect}</td>
                                        <td className="border border-slate-200 p-3 text-center">{control.respond}</td>
                                        <td className="border border-slate-200 p-3 text-center">{control.recover}</td>
                                    </>
                                ) : (
                                    <td className="border border-slate-200 p-3 text-center">
                                        I:{control.identify} P:{control.protect} D:{control.detect} R:{control.respond}
                                    </td>
                                )}

                                {/* Security domain cells */}
                                {expandedGroups.securityDomain ? (
                                    <>
                                        <td className="border border-slate-200 p-3 text-center">{control.governanceAndEcosystem}</td>
                                        <td className="border border-slate-200 p-3 text-center">{control.protection}</td>
                                        <td className="border border-slate-200 p-3 text-center">{control.defence}</td>
                                        <td className="border border-slate-200 p-3 text-center">{control.resilience}</td>
                                    </>
                                ) : (
                                    <td className="border border-slate-200 p-3 text-center">
                                        {control.governanceAndEcosystem === "Yes" ? "G" : ""}{control.protection === "Yes" ? "P" : ""}{control.defence === "Yes" ? "D" : ""}
                                    </td>
                                )}

                                {/* Operational capability cells */}
                                {expandedGroups.operationalCapability ? (
                                    <>
                                        <td className="border border-slate-200 p-3 text-center">{control.governance}</td>
                                        <td className="border border-slate-200 p-3 text-center">{control.assetManagement}</td>
                                        <td className="border border-slate-200 p-3 text-center">{control.informationProtection}</td>
                                        <td className="border border-slate-200 p-3 text-center">{control.humanResourceSecurity}</td>
                                        <td className="border border-slate-200 p-3 text-center">{control.physicalSecurity}</td>
                                        <td className="border border-slate-200 p-3 text-center">{control.systemAndNetworkSecurity}</td>
                                        <td className="border border-slate-200 p-3 text-center">{control.applicationSecurity}</td>
                                        <td className="border border-slate-200 p-3 text-center">{control.secureConfiguration}</td>
                                        <td className="border border-slate-200 p-3 text-center">{control.identityAndAccessManagement}</td>
                                        <td className="border border-slate-200 p-3 text-center">{control.threatAndVulnerabilityManagement}</td>
                                        <td className="border border-slate-200 p-3 text-center">{control.continuity}</td>
                                        <td className="border border-slate-200 p-3 text-center">{control.supplierRelationshipsSecurity}</td>
                                        <td className="border border-slate-200 p-3 text-center">{control.legalAndCompliance}</td>
                                        <td className="border border-slate-200 p-3 text-center">{control.informationSecurityEventManagement}</td>
                                        <td className="border border-slate-200 p-3 text-center">{control.informationSecurityAssurance}</td>
                                    </>
                                ) : (
                                    <td className="border border-slate-200 p-3 text-center">
                                        {control.physicalSecurity === "Yes" ? "P" : ""}{control.identityAndAccessManagement === "Yes" ? "I" : ""}
                                    </td>
                                )}

                                {/* Other cells */}
                                {expandedGroups.other ? (
                                    <>
                                        <td className="border border-slate-200 p-3 text-center">{control.relatedTo}</td>
                                        <td className="border border-slate-200 p-3 text-center">{control.mustHave || ""}</td>
                                        <td className="border border-slate-200 p-3 text-center">{control.niceToHave || ""}</td>
                                        <td className="border border-slate-200 p-3 text-center">{control.sampleAuditQuestions || ""}</td>
                                    </>
                                ) : (
                                    <td className="border border-slate-200 p-3 text-center">
                                        {control.relatedTo}
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default ASISReport; 