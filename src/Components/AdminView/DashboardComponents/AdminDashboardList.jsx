import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  PlusCircle,
  Search,
  X,
  BarChart3,
  Calendar,
  Eye,
  Edit,
  Trash2,
  ChevronRight,
} from "lucide-react";
import SideNav from "../../WorkFlow/SideNav";
import { message } from "antd";
import { apiRequest } from "../../../utils/api";

const AdminDashboardList = () => {
  const navigate = useNavigate();
  const { projectid } = useParams();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [dashboards, setDashboards] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDashboard, setEditingDashboard] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [newDashboardName, setNewDashboardName] = useState("");
  const [newDashboardDescription, setNewDashboardDescription] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch dashboards
  const fetchDashboards = async () => {
    try {
      setIsLoading(true);
      const response = await apiRequest(
        "GET",
        `/api/project/${projectid}/dashboards/`,
        null,
        true
      );

      if (response.status === 200) {
        setDashboards(response.data);
      }
    } catch (error) {
      console.error("Error fetching dashboards:", error);
      message.error("Failed to fetch dashboards");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboards();
  }, [projectid]);

  // Handle create dashboard
  const handleCreateDashboard = async () => {
    if (!newDashboardName.trim()) {
      message.error("Please enter a dashboard name");
      return;
    }

    try {
      const response = await apiRequest(
        "POST",
        `/api/project/${projectid}/dashboards/create/`,
        {
          name: newDashboardName,
          description: newDashboardDescription,
        },
        true
      );

      if (response.status === 201) {
        // Add new dashboard to state
        setDashboards((prev) => [...prev, response.data]);
        setNewDashboardName("");
        setNewDashboardDescription("");
        setIsCreateModalOpen(false);
        message.success("Dashboard created successfully!");
      }
    } catch (error) {
      console.error("Error creating dashboard:", error);
      message.error("Failed to create dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle edit dashboard
  const handleEditDashboard = (dashboard) => {
    setEditingDashboard(dashboard);
    setEditName(dashboard.name);
    setEditDescription(dashboard.description || "");
    setIsEditModalOpen(true);
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    if (!editName.trim()) {
      message.error("Please enter a dashboard name");
      return;
    }

    try {
      const response = await apiRequest(
        "PATCH",
        `/api/project/dashboards/${editingDashboard.id}/update/`,
        {
          name: editName,
          description: editDescription,
        },
        true
      );

      if (response.status === 200) {
        // Update dashboard in state
        setDashboards((prev) =>
          prev.map((dashboard) =>
            dashboard.id === editingDashboard.id
              ? { ...dashboard, name: editName, description: editDescription }
              : dashboard
          )
        );
        setIsEditModalOpen(false);
        setEditingDashboard(null);
        message.success("Dashboard updated successfully!");
      }
    } catch (error) {
      console.error("Error updating dashboard:", error);
      message.error("Failed to update dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete dashboard
  const handleDeleteDashboard = async (dashboardId) => {
    try {
      const response = await apiRequest(
        "DELETE",
        `/api/project/dashboards/${dashboardId}/delete/`,
        null,
        true
      );

      if (response.status === 204) {
        // Remove dashboard from state
        setDashboards((prev) =>
          prev.filter((dashboard) => dashboard.id !== dashboardId)
        );
        message.success("Dashboard deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting dashboard:", error);
      message.error("Failed to delete dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle open dashboard
  const handleOpenDashboard = (dashboardId) => {
    navigate(`${dashboardId}`);
  };

  // Filter dashboards based on search
  const filteredDashboards = dashboards.filter(
    (dashboard) =>
      dashboard.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (dashboard.description &&
        dashboard.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50 text-gray-800">
        <SideNav onToggle={setIsSidebarCollapsed} />
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">
      <SideNav onToggle={setIsSidebarCollapsed} />

      <div
        className="transition-all duration-300 p-6 w-full"
        style={{ marginLeft: "0px", flex: 1 }}
      >
        <div className="w-full">
          {/* Header section */}
          <div className="flex flex-col mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Admin Dashboards
                </h1>
                <p className="text-gray-600">
                  Manage and organize your analytics dashboards
                </p>
              </div>
              <div className="text-right">
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  <BarChart3 size={16} className="mr-2" />
                  {dashboards.length} dashboard
                  {dashboards.length !== 1 ? "s" : ""}
                </div>
              </div>
            </div>
            <div className="mt-6 h-px bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200"></div>
          </div>

          {/* Search and Controls */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search dashboards by name or description..."
                className="pl-12 pr-4 py-3 w-full border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm hover:shadow-md"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl flex items-center gap-2 hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <PlusCircle size={20} />
              Create Dashboard
            </button>
          </div>

          {/* Dashboards Table */}
          {filteredDashboards.length > 0 ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Dashboard Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Charts
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {filteredDashboards.map((dashboard) => (
                      <tr
                        key={dashboard.id}
                        className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 cursor-pointer transition-all duration-200 group"
                        onClick={() => handleOpenDashboard(dashboard.id)}
                      >
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 mr-4 group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-200">
                              <BarChart3 className="text-blue-600" size={22} />
                            </div>
                            <div>
                              <div className="text-base font-semibold text-gray-900 group-hover:text-blue-900 transition-colors">
                                {dashboard.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-sm text-gray-600 max-w-xs truncate">
                            {dashboard.description || (
                              <span className="italic text-gray-400">
                                No description
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 group-hover:bg-blue-100 group-hover:text-blue-800 transition-all duration-200">
                            <span className="font-semibold">
                              {dashboard.charts.length}
                            </span>
                            <span className="ml-1">
                              chart{dashboard.charts.length !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar
                              size={16}
                              className="mr-2 text-gray-400"
                            />
                            {new Date(dashboard.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDashboard(dashboard.id);
                              }}
                              className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-100 transition-all duration-200"
                              title="View Dashboard"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditDashboard(dashboard);
                              }}
                              className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100 transition-all duration-200"
                              title="Edit Dashboard"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteDashboard(dashboard.id);
                              }}
                              className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-100 transition-all duration-200"
                              title="Delete Dashboard"
                            >
                              <Trash2 size={18} />
                            </button>
                            <ChevronRight
                              size={18}
                              className="text-gray-400 ml-2 group-hover:text-blue-500 transition-colors"
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="bg-gradient-to-br from-white to-gray-50 p-16 rounded-2xl border border-gray-100 text-center shadow-lg">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md">
                <BarChart3 className="text-blue-600" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                No Dashboards Yet
              </h3>
              <p className="text-gray-600 mb-8 max-w-lg mx-auto text-lg">
                Create your first dashboard to start organizing your charts and
                analytics. Build beautiful visualizations and track your data
                insights.
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl flex items-center gap-3 hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 mx-auto text-lg font-medium"
              >
                <PlusCircle size={22} />
                Create Your First Dashboard
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create Dashboard Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200">
                  <PlusCircle className="text-blue-600" size={24} />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Create New Dashboard
                </h2>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-all"
              >
                <X size={22} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Dashboard Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Dashboard Name *
                </label>
                <input
                  type="text"
                  value={newDashboardName}
                  onChange={(e) => setNewDashboardName(e.target.value)}
                  placeholder="Enter dashboard name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm hover:shadow-md"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newDashboardDescription}
                  onChange={(e) => setNewDashboardDescription(e.target.value)}
                  placeholder="Enter dashboard description"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm hover:shadow-md"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 mt-8">
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateDashboard}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
                >
                  Create Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Dashboard Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200">
                  <Edit className="text-gray-600" size={24} />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Edit Dashboard
                </h2>
              </div>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingDashboard(null);
                  setEditName("");
                  setEditDescription("");
                }}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-all"
              >
                <X size={22} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Dashboard Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Dashboard Name *
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter dashboard name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm hover:shadow-md"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Enter dashboard description"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm hover:shadow-md"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 mt-8">
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingDashboard(null);
                    setEditName("");
                    setEditDescription("");
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardList;
