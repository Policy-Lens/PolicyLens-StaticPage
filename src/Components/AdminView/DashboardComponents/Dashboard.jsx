import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BarChart3, PlusCircle, Search, X, ArrowLeft } from "lucide-react";
import { message, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import SideNav from "../../WorkFlow/SideNav";
import { apiRequest } from "../../../utils/api";
import { Bar, Line, Pie, Doughnut } from "react-chartjs-2";
import CreateChartModal from "./CreateChartModal";

const Dashboard = () => {
  const { projectid, dashboardId } = useParams();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [charts, setCharts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dashboardName, setDashboardName] = useState("");

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const response = await apiRequest(
        "GET",
        `/api/project/dashboards/${dashboardId}/data/`,
        null,
        true
      );

      if (response.status === 200) {
        setCharts(response.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      message.error("Failed to fetch dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch dashboard name
  const fetchDashboardName = async () => {
    try {
      const response = await apiRequest(
        "GET",
        `/api/project/${projectid}/dashboards/`,
        null,
        true
      );

      if (response.status === 200) {
        const dashboard = response.data.find(
          (d) => d.id === parseInt(dashboardId)
        );
        if (dashboard) {
          setDashboardName(dashboard.name);
        }
      }
    } catch (error) {
      console.error("Error fetching dashboard name:", error);
    }
  };

  // Handle chart removal
  const handleRemoveChart = async (chartId) => {
    try {
      const response = await apiRequest(
        "DELETE",
        `/api/project/dashboards/charts/${chartId}/`,
        null,
        true
      );

      if (response.status === 204) {
        // Remove chart from state
        setCharts((prev) => prev.filter((chart) => chart.id !== chartId));
        message.success("Chart removed successfully!");
      }
    } catch (error) {
      console.error("Error removing chart:", error);
      message.error("Failed to remove chart");
    }
  };

  // Handle chart creation
  const handleChartCreated = (newChart) => {
    // Add new chart to state
    setCharts((prev) => [...prev, newChart]);
  };

  // Initial fetch
  useEffect(() => {
    fetchDashboardData();
    fetchDashboardName();
  }, [dashboardId, projectid]);

  // Render chart based on type
  const renderChart = (chart) => {
    const chartData = {
      labels: chart.labels,
      datasets: [
        {
          label: chart.title,
          data: chart.values,
          backgroundColor: [
            "#3b82f6", // blue
            "#10b981", // green
            "#f59e0b", // amber
            "#ef4444", // red
            "#8b5cf6", // purple
            "#06b6d4", // cyan
          ].slice(0, chart.labels.length),
          borderWidth: 1,
        },
      ],
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position:
            chart.chart_type === "pie" || chart.chart_type === "doughnut"
              ? "right"
              : "top",
          labels: {
            font: { size: 10 },
          },
        },
        title: {
          display: false,
        },
      },
    };

    switch (chart.chart_type) {
      case "bar":
        return <Bar data={chartData} options={chartOptions} />;
      case "line":
        return <Line data={chartData} options={chartOptions} />;
      case "pie":
        return <Pie data={chartData} options={chartOptions} />;
      case "doughnut":
        return <Doughnut data={chartData} options={chartOptions} />;
      default:
        return null;
    }
  };

  // Filter charts based on search
  const filteredCharts = charts.filter((chart) =>
    chart.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">
      <SideNav onToggle={setIsSidebarCollapsed} />

      <div
        className="transition-all duration-300 p-6"
        style={{ marginLeft: "0px", flex: 1 }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Header section */}
          <div className="flex flex-col mb-6">
            <div className="flex items-center mb-4">
              <button
                onClick={() => navigate(-1)}
                className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Back to Dashboards"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">
                  {dashboardName || "Dashboard"}
                </h1>
              </div>
              <span className="text-sm text-gray-500">
                {charts.length} chart{charts.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="h-0.5 bg-gradient-to-r from-blue-100 to-gray-100"></div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-96">
              <Spin
                indicator={<LoadingOutlined style={{ fontSize: 60 }} spin />}
                tip="Loading dashboard data..."
                className="text-center"
              />
            </div>
          ) : (
            <>
              {/* Search and Controls */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="relative w-full md:w-1/3">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search charts..."
                    className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                >
                  <PlusCircle size={18} />
                  Create Chart
                </button>
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredCharts.map((chart) => (
                  <div
                    key={chart.id}
                    className="bg-white p-5 rounded-lg hover:shadow-sm transition-shadow duration-200 border border-gray-100"
                  >
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                      <h2 className="text-base font-medium text-blue-600">
                        {chart.title}
                      </h2>
                      <button
                        onClick={() => handleRemoveChart(chart.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    <div className="h-[250px]">{renderChart(chart)}</div>
                  </div>
                ))}
              </div>

              {/* Empty state */}
              {filteredCharts.length === 0 && (
                <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="text-blue-600" size={24} />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    No Charts Yet
                  </h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    Create your first chart by clicking the "Create Chart"
                    button above.
                  </p>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors mx-auto"
                  >
                    <PlusCircle size={18} />
                    Create Your First Chart
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Create Chart Modal */}
      {isCreateModalOpen && (
        <CreateChartModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          dashboardId={dashboardId}
          projectId={projectid}
          onChartCreated={handleChartCreated}
        />
      )}
    </div>
  );
};

export default Dashboard;
