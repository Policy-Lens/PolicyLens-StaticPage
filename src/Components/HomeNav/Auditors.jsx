import { useContext, useEffect, useState } from "react";
import { apiRequest } from "../../utils/api";
import { AuthContext } from "../../AuthContext";

const AuditorsPage = () => {
  const [auditors, setAuditors] = useState([]);
  const [selectedAuditors, setSelectedAuditors] = useState([]);
  const [isActionMode, setIsActionMode] = useState(false);
  const [loading, setLoading] = useState();
  const { user } = useContext(AuthContext);

  const getAuditors = async () => {
    setLoading(true);
    const res = await apiRequest(
      "GET",
      "/api/auth/users/?role=auditor",
      null,
      true
    );
    if (res.status == 200) {
      setAuditors(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    getAuditors();
  }, []);

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
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Auditors</h1>

      {user.role === "admin" ? (
        <div className="flex justify-end gap-4 mb-4">
          {isActionMode ? (
            <>
              <button
                className={`px-4 py-2 rounded-lg font-medium shadow-md transition ${
                  selectedAuditors.length === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-red-500 text-white hover:bg-red-600"
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
      ) : null}

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
                        setSelectedAuditors(
                          auditors.map((auditor) => auditor.name)
                        );
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
              <th className="py-4 px-6 text-left font-semibold text-blue-800 uppercase">
                Email
              </th>
            </tr>
          </thead>
          <tbody>
            {auditors.map((auditor, index) => (
              <tr
                key={index}
                className={`border-b border-gray-200 transition ${
                  index % 2 === 0 ? "bg-gray-50" : "bg-white"
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
                <td className="py-4 px-6 font-medium text-gray-900">
                  {auditor.name}
                </td>
                <td className="py-4 px-6 text-gray-700">{auditor.role}</td>
                <td className="py-4 px-6 text-gray-700">
                  <a
                    href={`mailto:${auditor.email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {auditor.email}
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

export default AuditorsPage;
