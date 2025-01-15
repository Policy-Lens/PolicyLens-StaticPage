import { useState } from "react";
import Sidebar from "./Sidebar";

const AuditorsPage = () => {
    const [auditors, setAuditors] = useState([
        {
            name: "John Smith",
            role: "Lead Auditor",
            projectsCompleted: 15,
            contact: "john.smith@example.com",
            status: "Active",
        },
        {
            name: "Emily Davis",
            role: "Assistant Auditor",
            projectsCompleted: 8,
            contact: "emily.davis@example.com",
            status: "On Leave",
        },
        {
            name: "Michael Brown",
            role: "Senior Auditor",
            projectsCompleted: 20,
            contact: "michael.brown@example.com",
            status: "Active",
        },
        {
            name: "Sophia Wilson",
            role: "Auditor Intern",
            projectsCompleted: 3,
            contact: "sophia.wilson@example.com",
            status: "Training",
        },
        {
            name: "David Lee",
            role: "Quality Control Auditor",
            projectsCompleted: 12,
            contact: "david.lee@example.com",
            status: "Active",
        },
    ]);

    const [selectedAuditors, setSelectedAuditors] = useState([]);
    const [isActionMode, setIsActionMode] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const toggleActionMode = () => {
        setIsActionMode(!isActionMode);
        setSelectedAuditors([]);
    };

    const handleCheckboxChange = (auditorName) => {
        setSelectedAuditors((prev) =>
            prev.includes(auditorName)
                ? prev.filter((name) => name !== auditorName)
                : [...prev, auditorName]
        );
    };

    const handleDelete = () => {
        setAuditors((prev) =>
            prev.filter((auditor) => !selectedAuditors.includes(auditor.name))
        );
        toggleActionMode();
    };

    return (
        <div className="flex">
            {/* Sidebar */}
            <Sidebar onToggle={setIsSidebarCollapsed} />
            {/* Main Content */}
            <div className={`flex-1 p-8 bg-gray-100 transition-all ${isSidebarCollapsed ? 'ml-16' : 'ml-[240px]'}`} style={{ width: isSidebarCollapsed ? 'calc(100% - 4rem)' : 'calc(100% - 15rem)' }}>
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Auditors</h1>

                <div className="flex justify-end gap-4 mb-4">
                    {isActionMode ? (
                        <>
                            <button
                                className={`px-4 py-2 rounded-lg font-medium shadow-md transition ${selectedAuditors.length === 0 ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-red-500 text-white hover:bg-red-600"
                                    }`}
                                onClick={handleDelete}
                                disabled={selectedAuditors.length === 0}
                            >
                                Delete
                            </button>
                            <button
                                className="px-4 py-2 rounded-lg font-medium shadow-md bg-gray-500 text-white hover:bg-gray-600 transition"
                                onClick={toggleActionMode}
                            >
                                Cancel
                            </button>
                        </>
                    ) : (
                        <button
                            className="px-4 py-2 rounded-lg font-medium shadow-md bg-blue-500 text-white hover:bg-blue-600"
                            onClick={toggleActionMode}
                        >
                            Edit
                        </button>
                    )}
                </div>

                <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
                    <table className="min-w-full border-collapse border border-gray-200 text-sm">
                        <thead className="bg-gradient-to-r from-blue-100 to-blue-200 border-b border-gray-300">
                            <tr>
                                {isActionMode && (
                                    <th className="py-4 px-6 text-left font-semibold text-blue-800 uppercase">
                                        <input
                                            type="checkbox"
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedAuditors(auditors.map((auditor) => auditor.name));
                                                } else {
                                                    setSelectedAuditors([]);
                                                }
                                            }}
                                            checked={selectedAuditors.length === auditors.length}
                                            className="accent-blue-600"
                                        />
                                    </th>
                                )}
                                <th className="py-4 px-6 text-left font-semibold text-blue-800 uppercase">
                                    Auditor Name
                                </th>
                                <th className="py-4 px-6 text-left font-semibold text-blue-800 uppercase">
                                    Role
                                </th>
                                <th className="py-4 px-6 text-center font-semibold text-blue-800 uppercase">
                                    Projects Completed
                                </th>
                                <th className="py-4 px-6 text-left font-semibold text-blue-800 uppercase">
                                    Contact
                                </th>
                                <th className="py-4 px-6 text-left font-semibold text-blue-800 uppercase">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {auditors.map((auditor, index) => (
                                <tr
                                    key={index}
                                    className={`border-b border-gray-200 transition ${index % 2 === 0 ? "bg-gray-50" : "bg-white"
                                        } hover:bg-blue-100`}
                                >
                                    {isActionMode && (
                                        <td className="py-4 px-6 text-left">
                                            <input
                                                type="checkbox"
                                                checked={selectedAuditors.includes(auditor.name)}
                                                onChange={() => handleCheckboxChange(auditor.name)}
                                                className="accent-blue-600"
                                            />
                                        </td>
                                    )}
                                    <td className="py-4 px-6 font-medium text-gray-900">{auditor.name}</td>
                                    <td className="py-4 px-6 text-gray-700">{auditor.role}</td>
                                    <td className="py-4 px-6 text-center text-gray-700">
                                        {auditor.projectsCompleted}
                                    </td>
                                    <td className="py-4 px-6 text-gray-700">
                                        <a
                                            href={`mailto:${auditor.contact}`}
                                            className="text-blue-600 hover:underline"
                                        >
                                            {auditor.contact}
                                        </a>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span
                                            className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-700 
                                        ${auditor.status === "Active"
                                                    ? "border border-green-500"
                                                    : auditor.status === "On Leave"
                                                        ? "border border-yellow-500"
                                                        : "border border-blue-500"
                                                }`}
                                        >
                                            {auditor.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AuditorsPage;
