import React from "react";
import { Button } from "antd";

const InternalAuditProcess = () => {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Internal Audit Process</h1>
            <p className="text-gray-600 mb-6">
                Streamline the internal audit process by creating profiles and templates. Choose one of the options below to proceed:
            </p>

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Project Overview</h2>
                <ul className="list-disc pl-5 text-gray-600">
                    <li>Project Name: Compliance Audit 2025</li>
                    <li>Project Manager: Arjun Mehta</li>
                    <li>Start Date: January 15, 2025</li>
                    <li>End Date: December 15, 2025</li>
                    <li>Status: In Progress</li>
                </ul>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Audit Team</h2>
                <ul className="list-disc pl-5 text-gray-600">
                    <li>Lead Auditor: Neha Gupta</li>
                    <li>Senior Consultant: Anand Sharma</li>
                    <li>Compliance Specialist: Ravi Singh</li>
                    <li>Quality Assurance: Deepika Patel</li>
                </ul>
            </div>

            <Button type="primary" className="bg-blue-600 hover:bg-blue-700">
                Assign Task
            </Button>
        </div>
    );
};

export default InternalAuditProcess; 