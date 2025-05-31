import { useContext, useEffect, useState } from "react";
import { apiRequest } from "../../utils/api";
import { AuthContext } from "../../AuthContext";

const CompaniesPage = () => {
  const [companies, setCompanies] = useState([]);
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);

  const getCompanies = async () => {
    setLoading(true);
    const res = await apiRequest("GET", "/api/auth/companies/", null, true);
    if (res.status == 200) {
      setCompanies(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    getCompanies();
  }, []);

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
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Companies</h1>

      {user?.role === "admin" ? (
        <div className="flex justify-end gap-4 mb-4">
          {isEditMode ? (
            <>
              <button
                onClick={handleDelete}
                className={`px-4 py-2 rounded-lg font-medium shadow-md transition 
                    ${
                      selectedCompanies.length === 0
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
      ) : null}

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
              <th className="py-4 px-6 text-left font-semibold text-blue-800 uppercase tracking-wide">
                Contact Person Name
              </th>
              <th className="py-4 px-6 text-left font-semibold text-blue-800 uppercase tracking-wide">
                Contact Email
              </th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company, index) => (
              <tr
                key={index}
                className={`border-b border-gray-200 transition ${
                  index % 2 === 0 ? "bg-gray-50" : "bg-white"
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
                <td className="py-4 px-6 text-gray-700">{company.industry}</td>
                <td className="py-4 px-6 text-gray-700">
                  {company.company_admin.name}
                </td>
                <td className="py-4 px-6 text-gray-700">
                  <a
                    href={`mailto:${company.company_admin.email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {company.company_admin.email}
                  </a>
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
