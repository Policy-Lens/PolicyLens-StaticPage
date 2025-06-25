import { useContext, useEffect, useState } from "react";
import { apiRequest } from "../../utils/api";
import { AuthContext } from "../../AuthContext";
import { Eye, Trash2 } from "lucide-react";
import { Modal, Spin } from "antd";

const CompaniesPage = () => {
  const [companies, setCompanies] = useState([]);
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    name: "",
    industry: "",
    contact_person_name: "",
    contact_email: "",
    password: ""
  });
  const [createLoading, setCreateLoading] = useState(false);
  const { user } = useContext(AuthContext);

  // Track which company row is expanded
  const [expandedCompany, setExpandedCompany] = useState(null);
  const [representatives, setRepresentatives] = useState([]);
  const [repsLoading, setRepsLoading] = useState(false);

  // Only show for company and consultant admin roles
  const canManageReps = user?.role === "Company" || user?.role === "Super Consultant";

  const [showRepModal, setShowRepModal] = useState(false);
  const [repForm, setRepForm] = useState({ name: "", email: "", contact: "", password: "" });
  const [repCompanyId, setRepCompanyId] = useState(null);
  const [repLoading, setRepLoading] = useState(false);
  const [showRepPassword, setShowRepPassword] = useState(false);

  const getCompanies = async () => {
    setLoading(true);
    try {
      let endpoint = "/api/auth/companies/";
      
      // Add query parameters based on user role
      if (user?.role === "admin") {
        // Admin can see all companies
        endpoint += "?company_type=client";
      } else {
        // Consultants and other users - backend will handle filtering based on user's company and relationships
        endpoint += "?company_type=client&user_role=" + user?.role;
      }
      
      const res = await apiRequest("GET", endpoint, null, true);
      if (res.status == 200) {
        setCompanies(res.data);
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
      setCompanies([]);
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

  const handleCreateCompany = async () => {
    if (!createFormData.name || !createFormData.industry || !createFormData.contact_person_name || !createFormData.contact_email || !createFormData.password) {
      alert("Please fill in all required fields");
      return;
    }

    setCreateLoading(true);
    try {
      const payload = {
        name: createFormData.name,
        industry: createFormData.industry,
        contact: createFormData.contact_email,
        company_type: "client", // Fixed company_type as client
        created_by: user.id, // Track who created the company
        company_admin: {
          email: createFormData.contact_email,
          name: createFormData.contact_person_name,
          password: createFormData.password,
          contact: createFormData.contact_email,
          role_input: "company",
        }
      };

      const res = await apiRequest("POST", "/api/auth/company/create/", payload, true);
      
      if (res.status === 201) {
        alert("Company created successfully!");
        setShowCreateModal(false);
        setCreateFormData({
          name: "",
          industry: "",
          contact_person_name: "",
          contact_email: "",
          password: ""
        });
        getCompanies(); // Refresh the companies list
      } else {
        alert("Failed to create company. Please try again.");
      }
    } catch (error) {
      console.error("Error creating company:", error);
      alert("Failed to create company. Please try again.");
    } finally {
      setCreateLoading(false);
    }
  };

  const canCreateCompany = user?.role === "admin" || user?.role === "Super Consultant";

  const fetchRepresentatives = async (companyId) => {
    setRepsLoading(true);
    try {
      // Use the new GET endpoint for representatives
      const res = await apiRequest("GET", `/api/auth/companies/${companyId}/representatives/`, null, true);
      if (res.status === 200) {
        setRepresentatives(res.data || []);
      } else {
        setRepresentatives([]);
      }
    } catch (error) {
      setRepresentatives([]);
    } finally {
      setRepsLoading(false);
    }
  };

  const handleExpandCompany = (companyId) => {
    if (expandedCompany === companyId) {
      setExpandedCompany(null);
      setRepresentatives([]);
    } else {
      setExpandedCompany(companyId);
      fetchRepresentatives(companyId);
    }
  };

  const handleAddRepClick = (companyId) => {
    setRepCompanyId(companyId);
    setShowRepModal(true);
    setRepForm({ name: "", email: "", contact: "", password: "" });
  };

  const handleRepFormChange = (e) => {
    setRepForm({ ...repForm, [e.target.name]: e.target.value });
  };

  const handleCreateRep = async () => {
    if (!repForm.name || !repForm.email || !repForm.password) {
      alert("Please fill in all required fields");
      return;
    }
    setRepLoading(true);
    try {
      const payload = {
        company_id: repCompanyId,
        users: [
          {
            email: repForm.email,
            name: repForm.name,
            contact: repForm.contact,
            role_input: "company_representative",
            password: repForm.password,
          },
        ],
      };
      await apiRequest("POST", "/api/auth/company/add-users/", payload, true);
      setShowRepModal(false);
      setRepForm({ name: "", email: "", contact: "", password: "" });
      setRepCompanyId(null);
      fetchRepresentatives(expandedCompany); // Refresh list
    } catch (error) {
      alert("Failed to create representative");
    } finally {
      setRepLoading(false);
    }
  };

  const handleDeleteRep = async (companyId, userId) => {
    if (!window.confirm("Are you sure you want to delete this representative?")) return;
    try {
      await apiRequest("DELETE", `/api/auth/companies/${companyId}/representatives/${userId}/`, null, true);
      fetchRepresentatives(companyId);
    } catch (error) {
      alert("Failed to delete representative");
    }
  };

  return (
    <div className="p-8 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Companies</h1>

      <div className="flex justify-between items-center mb-4">
        <div>
          {canCreateCompany && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 rounded-lg font-medium shadow-md bg-green-600 text-white hover:bg-green-700"
            >
              + Create Company
            </button>
          )}
        </div>

        <div className="flex justify-end gap-4">
          {user?.role === "admin" && (
            <>
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
            </>
          )}
        </div>
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
              <th className="py-4 px-6 text-left font-semibold text-blue-800 uppercase tracking-wide">
                Contact Person Name
              </th>
              <th className="py-4 px-6 text-left font-semibold text-blue-800 uppercase tracking-wide">
                Contact Email
              </th>
              <th className="py-4 px-6 text-left font-semibold text-blue-800 uppercase tracking-wide">
                Created By
              </th>
              <th className="py-4 px-6 text-left font-semibold text-blue-800 uppercase tracking-wide text-center">
                Representatives
              </th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company, index) => (
              <>
                <tr
                  key={company.id || index}
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
                  <td className="py-4 px-6 text-gray-700">
                    {company.created_by?.name || "N/A"}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <button
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700"
                      title="View Representatives"
                      onClick={() => handleExpandCompany(company.id)}
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
                {expandedCompany === company.id && (
                  <tr>
                    <td colSpan={8} className="bg-blue-50 p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-blue-800">Company Representatives</h3>
                        {canManageReps && (
                          <button
                            className="px-4 py-2 rounded-lg font-medium shadow-md bg-blue-600 text-white hover:bg-blue-700"
                            onClick={() => handleAddRepClick(company.id)}
                          >
                            + Add New Representative
                          </button>
                        )}
                      </div>
                      {repsLoading ? (
                        <div className="flex items-center justify-center py-6"><Spin /> Loading representatives...</div>
                      ) : representatives.length > 0 ? (
                        <table className="min-w-full border-collapse border border-gray-200 text-sm mb-2">
                          <thead className="bg-gradient-to-r from-blue-100 to-blue-200 border-b border-gray-300">
                            <tr>
                              <th className="py-3 px-4 text-left font-semibold text-blue-800 uppercase tracking-wide">Name</th>
                              <th className="py-3 px-4 text-left font-semibold text-blue-800 uppercase tracking-wide">Email</th>
                              <th className="py-3 px-4 text-left font-semibold text-blue-800 uppercase tracking-wide">Role</th>
                              <th className="py-3 px-4 text-left font-semibold text-blue-800 uppercase tracking-wide">Contact</th>
                              {canManageReps && <th className="py-3 px-4 text-left font-semibold text-blue-800 uppercase tracking-wide">Actions</th>}
                            </tr>
                          </thead>
                          <tbody>
                            {representatives.map((rep) => (
                              <tr key={rep.id || rep.email} className="border-b border-gray-200">
                                <td className="py-3 px-4 font-medium text-gray-900">
                                  {rep.name || rep.email}
                                </td>
                                <td className="py-3 px-4 text-gray-700">
                                  <a href={`mailto:${rep.email}`} className="text-blue-600 hover:underline">{rep.email}</a>
                                </td>
                                <td className="py-3 px-4 text-left text-gray-700">
                                  {rep.role || rep.role_input}
                                </td>
                                <td className="py-3 px-4 text-gray-700">{rep.contact}</td>
                                {canManageReps && (
                                  <td className="py-3 px-4 text-left">
                                    <button
                                      className="text-red-600 hover:text-red-800 p-1 rounded"
                                      title="Delete Representative"
                                      onClick={() => handleDeleteRep(expandedCompany, rep.id)}
                                    >
                                      <Trash2 size={18} />
                                    </button>
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="text-gray-500 text-sm">No representatives found for this company.</div>
                      )}
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Company Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Create New Company</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={createFormData.name}
                  onChange={(e) => setCreateFormData({...createFormData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter company name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Industry *
                </label>
                <input
                  type="text"
                  value={createFormData.industry}
                  onChange={(e) => setCreateFormData({...createFormData, industry: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter industry"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Person Name *
                </label>
                <input
                  type="text"
                  value={createFormData.contact_person_name}
                  onChange={(e) => setCreateFormData({...createFormData, contact_person_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter contact person name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Email *
                </label>
                <input
                  type="email"
                  value={createFormData.contact_email}
                  onChange={(e) => setCreateFormData({...createFormData, contact_email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter contact email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  value={createFormData.password}
                  onChange={(e) => setCreateFormData({...createFormData, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter password"
                />
              </div>

            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-lg font-medium shadow-md bg-gray-500 text-white hover:bg-gray-600"
                disabled={createLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCompany}
                className={`px-4 py-2 rounded-lg font-medium shadow-md ${
                  createLoading 
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                    : "bg-green-500 text-white hover:bg-green-600"
                }`}
                disabled={createLoading}
              >
                {createLoading ? "Creating..." : "Create Company"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Representative Modal */}
      <Modal
        title="Add Company Representative"
        open={showRepModal}
        onCancel={() => setShowRepModal(false)}
        onOk={handleCreateRep}
        okText={repLoading ? "Creating..." : "Create"}
        okButtonProps={{ disabled: repLoading }}
        cancelButtonProps={{ disabled: repLoading }}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              className="w-full border border-gray-300 rounded px-3 py-2"
              name="name"
              value={repForm.name}
              onChange={handleRepFormChange}
              disabled={repLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              className="w-full border border-gray-300 rounded px-3 py-2"
              name="email"
              value={repForm.email}
              onChange={handleRepFormChange}
              disabled={repLoading}
              type="email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <div className="relative">
              <input
                className="w-full border border-gray-300 rounded px-3 py-2 pr-10"
                name="password"
                value={repForm.password}
                onChange={handleRepFormChange}
                disabled={repLoading}
                type={showRepPassword ? "text" : "password"}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowRepPassword((v) => !v)}
                tabIndex={-1}
              >
                {showRepPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Contact</label>
            <input
              className="w-full border border-gray-300 rounded px-3 py-2"
              name="contact"
              value={repForm.contact}
              onChange={handleRepFormChange}
              disabled={repLoading}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CompaniesPage;
