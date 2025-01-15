import { useState } from "react";
import { Select, Button } from "antd";
import SideNav from "./SideNav";
import ManualReport from "./ManualReport"; 
import { AuditorData } from "../../AuditorData";

const AuditorWorkspace = () => {
    const [selectedSource, setSelectedSource] = useState(null);
    const [selectedControls, setSelectedControls] = useState([]); 
    const [popupContent, setPopupContent] = useState(null);
    const [showManualReport, setShowManualReport] = useState(false); 
    const [selectedPolicy, setSelectedPolicy] = useState(null);
    const [collapsed, setCollapsed] = useState(false);

    const handleSourceChange = (value) => {
        setSelectedSource(value);
    };

    const handleControlSelection = (control) => {
        setSelectedControls((prev) => {
            const isAlreadySelected = prev.some((item) => item.controlName === control.controlName);
            if (isAlreadySelected) {
                return prev.filter((item) => item.controlName !== control.controlName);
            }
            return [...prev, control];
        });
    };

    const policies = [
        { id: 1, policyName: "Data Protection Policy", policyType: "ISO 27001" },
        { id: 2, policyName: "Privacy Policy", policyType: "ISO 27701" },
        { id: 3, policyName: "Payment Security Policy", policyType: "PCI DSS" },
        { id: 4, policyName: "Risk Management Policy", policyType: "ISO 31000" },
        { id: 5, policyName: "Access Control Policy", policyType: "NIST SP 800-53" },
    ];

    return (
        <div className="flex h-screen font-sans bg-gray-100">
            {/*SideNav*/}
            <SideNav collapsed={collapsed} setCollapsed={setCollapsed} />

            {/* Main Content */}
            <div className={`flex-1 pl-0 pb-8 pt-0 bg-gray-100 text-gray-800 mr-3 ${collapsed ? "ml-20" : "ml-60"}`}>
                {showManualReport ? (
                    <ManualReport
                        selectedControls={selectedControls} 
                        onBack={() => setShowManualReport(false)}
                    />
                ) : (
                    <>
                        <div className="flex justify-between items-center mb-8 mt-5">
                            <h1 className="text-2xl font-bold text-blue-900">Auditor Workspace</h1>
                        </div>

                        {/* Policies Table */}
                        <div className="mt-8">
                            <h3 className="mb-4 text-blue-900 font-medium">Policies</h3>
                            <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
                                <table className="min-w-full border-collapse border border-gray-300 text-sm">
                                    <thead className="bg-gradient-to-r from-blue-100 to-blue-200 border-b border-gray-300">
                                        <tr>
                                            <th className="py-4 px-6 text-left font-semibold text-blue-800 uppercase">
                                                Select
                                            </th>
                                            <th className="py-4 px-6 text-left font-semibold text-blue-800 uppercase">
                                                Policy Name
                                            </th>
                                            <th className="py-4 px-6 text-left font-semibold text-blue-800 uppercase">
                                                Policy Type
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {policies.map((policy) => (
                                            <tr
                                                key={policy.id}
                                                className="border-b border-gray-200 transition hover:bg-blue-100"
                                            >
                                                <td className="py-4 pl-10 text-left">
                                                    <input
                                                        type="checkbox"
                                                        name="policySelect"
                                                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                                        onChange={() => setSelectedPolicy(policy)}
                                                    />
                                                </td>
                                                <td className="py-4 px-6 text-gray-700">{policy.policyName}</td>
                                                <td className="py-4 px-6 text-gray-700">{policy.policyType}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                            {/* Policy Selection Dropdown */}
                            {selectedPolicy && (
                                <div className="mb-8 mt-8">
                                    <h3 className="mb-4 text-black font-bold">{selectedPolicy.policyName} selected</h3>
                                    <h3 className="mb-4 text-blue-900 font-medium">Select the Policy Standard</h3>
                                    <Select
                                        className="w-72"
                                        placeholder="Select Policy Standard"
                                        onChange={handleSourceChange}
                                    >
                                        <Select.Option value="iso27001">ISO 27001</Select.Option>
                                        <Select.Option value="iso27701">ISO 27701</Select.Option>
                                        <Select.Option value="pcidss">PCI DSS</Select.Option>
                                    </Select>
                                </div>
                            )}

                        {/*Table */}
                        {selectedSource && (
                            <div className="mt-8">
                                <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
                                    <table className="min-w-full border-collapse border border-gray-300 text-sm">
                                        <thead className="bg-gradient-to-r from-blue-100 to-blue-200 border-b border-gray-300">
                                            <tr>
                                                <th className="py-4 px-6 text-left font-semibold text-blue-800 uppercase">
                                                    Select
                                                </th>
                                                <th className="py-4 px-6 text-left font-semibold text-blue-800 uppercase">
                                                    Parent Control
                                                </th>
                                                <th className="py-4 px-6 text-left font-semibold text-blue-800 uppercase">
                                                    Control Name
                                                </th>
                                                <th className="py-4 px-6 text-center font-semibold text-blue-800 uppercase">
                                                    Key Points
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {AuditorData.map((item, index) => (
                                                <tr
                                                    key={index}
                                                    className={`border-b border-gray-200 transition ${index % 2 === 0 ? "bg-gray-50" : "bg-white"
                                                        } hover:bg-blue-100`}
                                                >
                                                    <td className="py-4 pl-10 text-left">
                                                        <input
                                                            type="checkbox"
                                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                            onChange={() => handleControlSelection(item)}
                                                        />
                                                    </td>
                                                    <td className="py-4 px-6 text-gray-700">{item.parentControl}</td>
                                                    <td className="py-4 px-6 text-gray-700">{item.controlName}</td>
                                                    <td className="py-4 px-6 text-center">
                                                        <button
                                                            className="text-blue-500 hover:text-blue-700"
                                                            onClick={() => setPopupContent(item.keyPoints)}
                                                            aria-label="Preview Key Points"
                                                        >
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                viewBox="0 0 24 24"
                                                                fill="currentColor"
                                                                className="w-5 h-5 mx-auto"
                                                            >
                                                                <path d="M12 4.5c-4.97 0-9.27 3.11-10.88 7.5 1.61 4.39 5.91 7.5 10.88 7.5s9.27-3.11 10.88-7.5C21.27 7.61 16.97 4.5 12 4.5zm0 12c-2.48 0-4.5-2.02-4.5-4.5s2.02-4.5 4.5-4.5 4.5 2.02 4.5 4.5-2.02 4.5-4.5 4.5zm0-7.5a3 3 0 100 6 3 3 0 000-6z" />
                                                            </svg>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Buttons: Generate ML Report and Skip */}
                        {selectedControls.length > 0 && (
                            <div className="mt-8 flex gap-4">
                                <Button
                                    type="primary"
                                    className="bg-blue-500 border-blue-500 hover:bg-blue-600 hover:border-blue-600 px-6 py-2 text-white rounded-md mb-5"
                                >
                                    Generate ML Report
                                </Button>
                                <Button
                                    type="default"
                                    className="border-gray-300 hover:border-gray-400 px-6 py-2 rounded-md mb-5"
                                    onClick={() => setShowManualReport(true)}
                                >
                                    Skip
                                </Button>
                            </div>
                        )}

                            {popupContent && (
                                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                                    <div className="bg-white p-6 rounded shadow-lg w-3/4 max-w-4xl">
                                        <h2 className="text-lg font-bold mb-4">Key Points</h2>
                                        <div className="max-h-96 overflow-y-auto">
                                            {Array.isArray(popupContent) ? (
                                                <ul className="list-disc pl-6">
                                                    {popupContent.map((point, idx) => {
                                                        const subPoints = point.split("\n");
                                                        return (
                                                            <li key={idx} className="mb-2">
                                                                {subPoints[0]}
                                                                {subPoints.length > 1 && (
                                                                    <ul className="list-disc pl-6">
                                                                        {subPoints.slice(1).map((subPoint, subIdx) => (
                                                                            <li key={subIdx} className="mb-1">
                                                                                {subPoint}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                )}
                                                            </li>
                                                        );
                                                    })}
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
                    </>
                )}
            </div>
        </div>
    );
};

export default AuditorWorkspace;
