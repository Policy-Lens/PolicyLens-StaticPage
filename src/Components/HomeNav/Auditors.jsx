import React, { useState } from "react";
import Sidebar from "./Sidebar"; // Adjust the path to your Sidebar component

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

    const toggleActionMode = () => {
        setIsActionMode(!isActionMode);
        setSelectedAuditors([]); // Reset selections when toggling
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
        toggleActionMode(); // Exit action mode after deleting
    };

    const handleEdit = () => {
        alert(
            `Edit mode activated for the following auditors: ${selectedAuditors.join(
                ", "
            )}`
        );
        // Here you can implement a modal or redirection to an edit page
        toggleActionMode(); // Exit action mode
    };

    return (
        <div className="flex">
            {/* Sidebar */}
            <Sidebar activeItem="auditors" setActiveItem={() => { }} />

            {/* Main Content */}
            <div className="ml-52 w-full p-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Auditors</h1>
                    <div className="flex gap-4">
                        <button
                            className={`${isActionMode
                                    ? "bg-blue-500 text-white"
                                    : "bg-blue-500 text-white"
                                } px-4 py-2 rounded-lg hover:bg-blue-600 transition`}
                            onClick={isActionMode ? handleEdit : toggleActionMode}
                        >
                            {isActionMode ? "Confirm Edit" : "Edit"}
                        </button>
                        <button
                            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                            onClick={isActionMode ? handleDelete : toggleActionMode}
                        >
                            {isActionMode ? "Confirm Delete" : "Delete"}
                        </button>
                    </div>
                </div>

                {/* Auditors Table */}
                <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                    <thead className="bg-gray-200 text-gray-600 uppercase text-sm">
                        <tr>
                            {isActionMode && (
                                <th className="py-3 px-6 text-left">Select</th>
                            )}
                            <th className="py-3 px-6 text-left">Auditor Name</th>
                            <th className="py-3 px-6 text-left">Role</th>
                            <th className="py-3 px-6 text-left">Projects Completed</th>
                            <th className="py-3 px-6 text-left">Contact</th>
                            <th className="py-3 px-6 text-left">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {auditors.map((auditor, index) => (
                            <tr
                                key={index}
                                className={`border-b ${index % 2 === 0 ? "bg-gray-50" : "bg-white"
                                    }`}
                            >
                                {isActionMode && (
                                    <td className="py-3 px-6">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4"
                                            checked={selectedAuditors.includes(auditor.name)}
                                            onChange={() => handleCheckboxChange(auditor.name)}
                                        />
                                    </td>
                                )}
                                <td className="py-3 px-6">{auditor.name}</td>
                                <td className="py-3 px-6">{auditor.role}</td>
                                <td className="py-3 px-6 text-center">
                                    {auditor.projectsCompleted}
                                </td>
                                <td className="py-3 px-6">{auditor.contact}</td>
                                <td className="py-3 px-6">
                                    <span
                                        className={`px-2 py-1 rounded-full text-white ${auditor.status === "Active"
                                                ? "bg-green-500"
                                                : auditor.status === "On Leave"
                                                    ? "bg-yellow-500"
                                                    : "bg-blue-500"
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
    );
};

export default AuditorsPage;
