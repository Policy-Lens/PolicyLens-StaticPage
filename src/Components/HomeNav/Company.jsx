import { useState } from "react";
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
    const [isEditMode, setIsEditMode] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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
        setIsEditMode(false);
    };

    const handleEditToggle = () => {
        setIsEditMode(!isEditMode);
        setSelectedCompanies([]);
    };

    return (
        <div className="flex bg-gray-100 min-h-screen">
            {/* Sidebar */}
            <Sidebar onToggle={setIsSidebarCollapsed} />

            {/* Main Content */}
            <div
                className="transition-all duration-300"
                style={{
                    marginLeft: isSidebarCollapsed ? "80px" : "240px",
                    flex: 1,
                }}
            >
                <div className="p-8">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6">Companies</h1>

                    <div className="flex justify-end gap-4 mb-4">
                        {isEditMode ? (
                            <>
                                <button
                                    onClick={handleDelete}
                                    className={`px-4 py-2 rounded-lg font-medium shadow-md transition 
                  ${selectedCompanies.length === 0
                                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                            : "bg-red-500 text-white hover:bg-red-600"
                                        }`}
                                    disabled={selectedCompanies.length === 0}
                                >
                                    Delete
                                </button>
                                <button
                                    onClick={handleEditToggle}
                                    className="px-4 py-2 rounded-lg font-medium shadow-md bg-gray-500 text-white hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={handleEditToggle}
                                className="px-4 py-2 rounded-lg font-medium shadow-md bg-blue-500 text-white hover:bg-blue-600"
                            >
                                Edit
                            </button>
                        )}
                    </div>

                    <div className="overflow-x-auto bg-white shadow-md rounded-lg">
                        <table className="min-w-full border-collapse border border-gray-200 text-sm">
                            <thead className="bg-gradient-to-r from-blue-100 to-blue-200 border-b border-gray-300">
                                <tr>
                                    <th className="py-4 px-6 text-left font-semibold text-blue-800 uppercase tracking-wide">
                                        {isEditMode && (
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
                                                className="accent-blue-600"
                                            />
                                        )}
                                    </th>
                                    <th className="py-4 px-6 text-left font-semibold text-blue-800 uppercase tracking-wide">
                                        Company Name
                                    </th>
                                    <th className="py-4 px-6 text-left font-semibold text-blue-800 uppercase tracking-wide">
                                        Industry
                                    </th>
                                    <th className="py-4 px-6 text-center font-semibold text-blue-800 uppercase tracking-wide">
                                        Projects Created
                                    </th>
                                    <th className="py-4 px-6 text-left font-semibold text-blue-800 uppercase tracking-wide">
                                        Contact Person
                                    </th>
                                    <th className="py-4 px-6 text-left font-semibold text-blue-800 uppercase tracking-wide">
                                        Contact Email
                                    </th>
                                    <th className="py-4 px-6 text-left font-semibold text-blue-800 uppercase tracking-wide">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {companies.map((company, index) => (
                                    <tr
                                        key={index}
                                        className={`border-b border-gray-200 transition ${index % 2 === 0 ? "bg-gray-50" : "bg-white"
                                            } hover:bg-blue-100`}
                                    >
                                        <td className="py-4 px-6 text-left">
                                            {isEditMode && (
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCompanies.includes(company.name)}
                                                    onChange={() => handleSelectCompany(company.name)}
                                                    className="accent-blue-600"
                                                />
                                            )}
                                        </td>
                                        <td className="py-4 px-6 font-medium text-gray-900">
                                            {company.name}
                                        </td>
                                        <td className="py-4 px-6 text-gray-700">
                                            {company.industry}
                                        </td>
                                        <td className="py-4 px-6 text-center text-gray-700">
                                            {company.projectsCreated}
                                        </td>
                                        <td className="py-4 px-6 text-gray-700">
                                            {company.contactPerson}
                                        </td>
                                        <td className="py-4 px-6 text-gray-700">
                                            <a
                                                href={`mailto:${company.contactEmail}`}
                                                className="text-blue-600 hover:underline"
                                            >
                                                {company.contactEmail}
                                            </a>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span
                                                className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-700 
        ${company.status === "Active" ? "border border-green-500" : ""}
        ${company.status === "Inactive" ? "border border-red-500" : ""}
        ${company.status === "On Hold" ? "border border-yellow-500" : ""}`}
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
            </div>
        </div>
    );
};

export default CompaniesPage;
