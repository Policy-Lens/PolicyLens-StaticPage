import React, { useState } from "react";
import Sidebar from "./Sidebar"; 

const CompaniesPage = () => {
    const [companies, setCompanies] = useState([
        {
            name: "Tech Solutions Ltd.",
            industry: "Information Technology",
            projectsCreated: 25,
            contactPerson: "Alice Johnson",
            contactEmail: "alice.johnson@techsolutions.com",
            status: "Active",
        },
        {
            name: "Green Earth Inc.",
            industry: "Environmental Services",
            projectsCreated: 10,
            contactPerson: "Mark Davis",
            contactEmail: "mark.davis@greenearth.com",
            status: "Active",
        },
        {
            name: "Urban Builders Co.",
            industry: "Construction",
            projectsCreated: 15,
            contactPerson: "Emily Carter",
            contactEmail: "emily.carter@urbanbuilders.com",
            status: "Inactive",
        },
        {
            name: "HealthPlus Corp.",
            industry: "Healthcare",
            projectsCreated: 8,
            contactPerson: "Sarah Lee",
            contactEmail: "sarah.lee@healthplus.com",
            status: "Active",
        },
        {
            name: "Foodies Delight",
            industry: "Food & Beverages",
            projectsCreated: 5,
            contactPerson: "James Wilson",
            contactEmail: "james.wilson@foodiesdelight.com",
            status: "On Hold",
        },
    ]);

    const [selectedCompanies, setSelectedCompanies] = useState([]);
    const [isEditOrDeleteMode, setIsEditOrDeleteMode] = useState(false);

    const handleSelectCompany = (companyName) => {
        setSelectedCompanies((prevSelectedCompanies) =>
            prevSelectedCompanies.includes(companyName)
                ? prevSelectedCompanies.filter((name) => name !== companyName)
                : [...prevSelectedCompanies, companyName]
        );
    };

    const handleDelete = () => {
        setCompanies(
            companies.filter((company) => !selectedCompanies.includes(company.name))
        );
        setSelectedCompanies([]);
        setIsEditOrDeleteMode(false);
    };

    const handleEdit = () => {
        alert("Edit functionality is under construction!");
        setIsEditOrDeleteMode(false);
    };

    const handleEditOrDeleteClick = () => {
        setIsEditOrDeleteMode(!isEditOrDeleteMode);
        if (isEditOrDeleteMode) {
            setSelectedCompanies([]);
        }
    };

    return (
        <div className="flex">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex-1 ml-[240px] p-8 bg-gray-50"> 
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Companies</h1>

                <div className="flex justify-end gap-4 mb-4">
                    <button
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                        onClick={handleEditOrDeleteClick}
                    >
                        {isEditOrDeleteMode ? "Cancel" : "Edit"}
                    </button>
                    <button
                        onClick={handleDelete}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                        disabled={selectedCompanies.length === 0}
                    >
                        Delete
                    </button>
                </div>

                <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                    <thead className="bg-gray-200 text-gray-600 uppercase text-sm">
                        <tr>
                            <th className="py-3 px-6 text-left">
                                {isEditOrDeleteMode && (
                                    <input
                                        type="checkbox"
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedCompanies(
                                                    companies.map((company) => company.name)
                                                );
                                            } else {
                                                setSelectedCompanies([]);
                                            }
                                        }}
                                        checked={selectedCompanies.length === companies.length}
                                    />
                                )}
                            </th>
                            <th className="py-3 px-6 text-left">Company Name</th>
                            <th className="py-3 px-6 text-left">Industry</th>
                            <th className="py-3 px-6 text-center">Projects Created</th>
                            <th className="py-3 px-6 text-left">Contact Person</th>
                            <th className="py-3 px-6 text-left">Contact Email</th>
                            <th className="py-3 px-6 text-left">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {companies.map((company, index) => (
                            <tr
                                key={index}
                                className={`border-b ${index % 2 === 0 ? "bg-gray-50" : "bg-white"
                                    } ${selectedCompanies.includes(company.name) ? "bg-blue-100" : ""
                                    }`}
                            >
                                <td className="py-3 px-6 align-middle">
                                    {isEditOrDeleteMode && (
                                        <input
                                            type="checkbox"
                                            checked={selectedCompanies.includes(company.name)}
                                            onChange={() => handleSelectCompany(company.name)}
                                        />
                                    )}
                                </td>
                                <td className="py-3 px-6 align-middle">{company.name}</td>
                                <td className="py-3 px-6 align-middle">{company.industry}</td>
                                <td className="py-3 px-6 text-center align-middle">
                                    {company.projectsCreated}
                                </td>
                                <td className="py-3 px-6 align-middle">
                                    {company.contactPerson}
                                </td>
                                <td className="py-3 px-6 align-middle">{company.contactEmail}</td>
                                <td className="py-3 px-6 align-middle">
                                    <span
                                        className={`px-2 py-1 rounded-full text-white ${company.status === "Active"
                                            ? "bg-green-500"
                                            : company.status === "Inactive"
                                                ? "bg-red-500"
                                                : "bg-yellow-500"
                                            }`}
                                    >
                                        {company.status}
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

export default CompaniesPage;
