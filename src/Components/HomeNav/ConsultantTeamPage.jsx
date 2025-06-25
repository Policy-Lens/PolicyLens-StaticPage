import { useState, useEffect, useContext } from "react";
import { apiRequest } from "../../utils/api";
import { AuthContext } from "../../AuthContext";
import { Modal } from "antd";

const ConsultantTeamPage = () => {
  const [consultants, setConsultants] = useState([]);
  const [selectedConsultants, setSelectedConsultants] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
    contact: "",
  });
  const [creating, setCreating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const canEdit = ["consultant admin", "admin", "Super Consultant"].includes(user?.role);

  useEffect(() => {
    const fetchConsultants = async () => {
      setLoading(true);
      try {
        const companyId = user?.company?.id || user?.company_id;
        let endpoint = "/api/auth/users/?role=consultant";
        if (companyId) {
          endpoint += `&company_id=${companyId}`;
        }
        const res = await apiRequest("GET", endpoint, null, true);
        if (res.status === 200) {
          setConsultants(res.data);
        }
      } catch (error) {
        setConsultants([]);
      } finally {
        setLoading(false);
      }
    };
    fetchConsultants();
  }, [user]);

  const handleSelectConsultant = (consultantName) => {
    setSelectedConsultants((prevSelected) =>
      prevSelected.includes(consultantName)
        ? prevSelected.filter((name) => name !== consultantName)
        : [...prevSelected, consultantName]
    );
  };

  const handleDelete = () => {
    setConsultants(
      consultants.filter((consultant) => !selectedConsultants.includes(consultant.name))
    );
    setSelectedConsultants([]);
    setIsEditMode(false);
  };

  const handleEditToggle = () => {
    setIsEditMode(!isEditMode);
    setSelectedConsultants([]);
  };

  const handleCreateConsultant = async () => {
    setCreating(true);
    try {
      const companyId = user?.company?.id || user?.company_id;
      const payload = {
        ...createForm,
        role_input: "consultant",
        company: companyId,
        is_staff: false,
      };
      const res = await apiRequest("POST", "/api/auth/signup/", payload, true);
      if (res.status === 201 || res.status === 200) {
        setShowCreateModal(false);
        setCreateForm({ name: "", email: "", password: "", contact: "" });
        // Refresh consultants
        const endpoint = `/api/auth/users/?role=consultant&company_id=${companyId}`;
        const refreshed = await apiRequest("GET", endpoint, null, true);
        if (refreshed.status === 200) setConsultants(refreshed.data);
      }
    } catch (error) {
      // Optionally show error
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-8 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Consultant Team</h1>
      
      <div className="flex justify-between items-center mb-4">
        {/* Create Consultant Button (Super Consultant only) */}
        <div>
          {user?.role === "Super Consultant" && (
            <button
              className="px-4 py-2 rounded-lg font-medium shadow-md bg-green-600 text-white hover:bg-green-700"
              onClick={() => setShowCreateModal(true)}
            >
              + Create Consultant
            </button>
          )}
        </div>

        {/* Edit/Delete Buttons */}
        {canEdit && (
          <div className="flex justify-end gap-4">
            {isEditMode ? (
              <>
                <button
                  onClick={handleDelete}
                  className={`px-4 py-2 rounded-lg font-medium shadow-md transition \
                    ${
                      selectedConsultants.length === 0
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-red-500 text-white hover:bg-red-600"
                    }`}
                  disabled={selectedConsultants.length === 0}
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
        )}
      </div>
      
      {/* Create Consultant Modal */}
      <Modal
        title="Create Consultant"
        open={showCreateModal}
        onCancel={() => setShowCreateModal(false)}
        onOk={handleCreateConsultant}
        okText={creating ? "Creating..." : "Create"}
        okButtonProps={{ disabled: creating }}
        cancelButtonProps={{ disabled: creating }}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={createForm.name}
              onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))}
              disabled={creating}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={createForm.email}
              onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))}
              disabled={creating}
              type="email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <div className="relative">
              <input
                className="w-full border border-gray-300 rounded px-3 py-2 pr-10"
                value={createForm.password}
                onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))}
                disabled={creating}
                type={showPassword ? "text" : "password"}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(v => !v)}
                tabIndex={-1}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Contact</label>
            <input
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={createForm.contact}
              onChange={e => setCreateForm(f => ({ ...f, contact: e.target.value }))}
              disabled={creating}
            />
          </div>
        </div>
      </Modal>
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
                        setSelectedConsultants(consultants.map((c) => c.name));
                      } else {
                        setSelectedConsultants([]);
                      }
                    }}
                    checked={selectedConsultants.length === consultants.length}
                    className="accent-blue-600"
                  />
                )}
              </th>
              <th className="py-4 px-6 text-left font-semibold text-blue-800 uppercase tracking-wide">Name</th>
              <th className="py-4 px-6 text-left font-semibold text-blue-800 uppercase tracking-wide">Email</th>
              <th className="py-4 px-6 text-left font-semibold text-blue-800 uppercase tracking-wide">Role</th>
              <th className="py-4 px-6 text-left font-semibold text-blue-800 uppercase tracking-wide">Phone</th>
              <th className="py-4 px-6 text-left font-semibold text-blue-800 uppercase tracking-wide">Company</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-8">Loading...</td>
              </tr>
            ) : consultants.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8">No consultants found.</td>
              </tr>
            ) : (
              consultants.map((consultant, index) => (
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
                        checked={selectedConsultants.includes(consultant.name)}
                        onChange={() => handleSelectConsultant(consultant.name)}
                        className="accent-blue-600"
                      />
                    )}
                  </td>
                  <td className="py-4 px-6 font-medium text-gray-900">{consultant.name}</td>
                  <td className="py-4 px-6 text-gray-700">
                    <a href={`mailto:${consultant.email}`} className="text-blue-600 hover:underline">
                      {consultant.email}
                    </a>
                  </td>
                  <td className="py-4 px-6 text-gray-700 capitalize">{consultant.role}</td>
                  <td className="py-4 px-6 text-gray-700">{consultant.contact}</td>
                  <td className="py-4 px-6 text-gray-700">{consultant.company.name}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ConsultantTeamPage; 