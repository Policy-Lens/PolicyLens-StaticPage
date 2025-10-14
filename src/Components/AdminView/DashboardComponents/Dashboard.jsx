import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BarChart3, PlusCircle, Search, X, ArrowLeft, Edit3, Clipboard, FileText, CheckSquare, ShieldCheck, Percent, AlertCircle, Info, Copy, LayoutGrid, List as ListIcon } from "lucide-react";
import { message, Spin, Tooltip } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import SideNav from "../../WorkFlow/SideNav";
import { apiRequest } from "../../../utils/api";
import { Bar, Line, Pie, Doughnut, Radar, PolarArea } from "react-chartjs-2";
import CreateChartModal from "./CreateChartModal";
import EditChartModal from "./EditChartModal";

const Dashboard = () => {
  const { projectid, dashboardId } = useParams();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [charts, setCharts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dashboardName, setDashboardName] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [chartBeingEdited, setChartBeingEdited] = useState(null);
  const [isMetricsLoading, setIsMetricsLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [metrics, setMetrics] = useState({
    questionnaire: { total: 0, answered: 0, accepted: 0 },
    reports: { total: 0 },
    plc: { completed: 0, total: 0, active: 0 },
  });
  const [questionBreakdown, setQuestionBreakdown] = useState({ control: 0, clause: 0, vapt: 0, vapt_form: 0 });
  const [reportBreakdown, setReportBreakdown] = useState({ risk_assessment: 0, risk_treatment: 0, vapt: 0, asis: 0 });
  const [genModal, setGenModal] = useState({ open: false, errors: [], created: 0 });

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

  // Handle chart updated
  const handleChartUpdated = (updatedChart) => {
    setCharts((prev) => prev.map((c) => (c.id === updatedChart.id ? updatedChart : c)));
  };

  const handleDuplicateChart = async (chart) => {
    try {
      const response = await apiRequest(
        "POST",
        `/api/project/dashboards/${dashboardId}/charts/`,
        {
          title: `${chart.title} (Copy)`,
          model_name: chart.model || chart.model_name,
          x_field: chart.x_field,
          aggregation: chart.aggregation,
          chart_type: chart.chart_type,
          filters: chart.filters || {},
          position: {},
        },
        true
      );
      if (response.status === 201) {
        setCharts((prev) => [...prev, response.data]);
        message.success("Chart duplicated");
      }
    } catch (e) {
      message.error("Failed to duplicate chart");
    }
  };

  const handleGenerateAllCharts = async () => {
    try {
      const res = await apiRequest(
        "POST",
        `/api/project/${projectid}/dashboards/${dashboardId}/generate-all/`,
        {},
        true
      );
      if (res.status === 201) {
        const created = Array.isArray(res.data?.created) ? res.data.created.length : 0;
        const errors = Array.isArray(res.data?.errors) ? res.data.errors : [];
        setGenModal({ open: true, errors, created });
        message.success(`Generated ${created} chart(s)`);
        await fetchDashboardData();
      }
    } catch (e) {
      message.error("Failed to generate charts");
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchDashboardData();
    fetchDashboardName();
    fetchDashboardMetrics();
  }, [dashboardId, projectid]);

  // Fetch KPI metrics for cards
  const fetchDashboardMetrics = async () => {
    try {
      setIsMetricsLoading(true);

      // Fetch questionnaire across all categories and aggregate
      const QUESTION_TYPES = ["control", "clause", "vapt", "vapt_form"];
      const fetchQuestionsPromises = QUESTION_TYPES.map((t) =>
        apiRequest(
          "GET",
          `/api/new-questionnaire/project/${projectid}/questions/?type=${t}&page_size=10000`,
          null,
          true
        )
      );

      const fetchReports = apiRequest(
        "GET",
        `/api/rarpt/project/${projectid}/sheets/overview/`,
        null,
        true
      );

      const fetchPlc = apiRequest(
        "GET",
        `/api/plc_workflow/projects/${projectid}/steps/`,
        null,
        true
      );

      const [questionsResList, reportsRes, plcRes] = await Promise.allSettled([
        Promise.allSettled(fetchQuestionsPromises),
        fetchReports,
        fetchPlc,
      ]);

      // Questionnaire metrics
      let qTotal = 0;
      let qAnswered = 0;
      let qAccepted = 0;
      if (
        questionsResList.status === "fulfilled" &&
        Array.isArray(questionsResList.value)
      ) {
        const answeredStatuses = [
          "Answered",
          "Needs Review",
          "Needs More Information",
          "Accepted",
        ];
        const typeTotals = { control: 0, clause: 0, vapt: 0, vapt_form: 0 };
        questionsResList.value.forEach((res, idx) => {
          if (res.status === "fulfilled" && res.value?.status === 200) {
            const body = res.value.data;
            const list = Array.isArray(body) ? body : body?.results || [];
            const t = ["control", "clause", "vapt", "vapt_form"][idx] || "control";
            const currentTotal = typeof body?.count === "number" ? body.count : list.length;
            qTotal += currentTotal;
            typeTotals[t] += currentTotal;
            list.forEach((q) => {
              const status = (q.status || q.question_status || "").toString();
              const hasAnswer = Boolean(
                q.answer || q.answer_text || q.selected_option || q.answer_id
              );
              if (hasAnswer || answeredStatuses.includes(status)) qAnswered += 1;
              if (["Accepted", "APPROVED", "ACCEPTED"].includes(status)) qAccepted += 1;
            });
          }
        });
        setQuestionBreakdown(typeTotals);
      }

      // Reports metrics
      let reportsTotal = 0;
      if (reportsRes.status === "fulfilled" && reportsRes.value?.data) {
        const list = Array.isArray(reportsRes.value.data)
          ? reportsRes.value.data
          : reportsRes.value.data?.results || [];
        reportsTotal = list.length;
        const rb = { risk_assessment: 0, risk_treatment: 0, vapt: 0, asis: 0 };
        list.forEach((r) => {
          const slug = (r.type || "")
            .toString()
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "_");
          if (rb.hasOwnProperty(slug)) {
            rb[slug] += 1;
          } else {
            // ignore unknowns for now
          }
        });
        setReportBreakdown(rb);
      }

      // PLC metrics
      let plcCompleted = 0;
      let plcTotal = 0;
      let plcActive = 0;
      if (plcRes.status === "fulfilled" && plcRes.value?.data) {
        const data = plcRes.value.data;
        const steps = Array.isArray(data?.steps) ? data.steps : [];
        plcTotal = Number(data?.total_steps) || steps.length || 0;
        steps.forEach((s) => {
          const st = (s.status || "").toString().toLowerCase();
          if (st === "completed") plcCompleted += 1;
          if (st === "in_progress" || st === "awaiting_approval") plcActive += 1;
        });
      }

      setMetrics({
        questionnaire: { total: qTotal, answered: qAnswered, accepted: qAccepted },
        reports: { total: reportsTotal },
        plc: { completed: plcCompleted, total: plcTotal, active: plcActive },
      });
    } catch (e) {
      // Non-fatal: show message and keep defaults
      message.warning("Some dashboard metrics could not be loaded");
    } finally {
      setIsMetricsLoading(false);
    }
  };

  // Render chart based on type
  const renderChart = (chart) => {
    const baseColors = ["#3b82f6","#10b981","#f59e0b","#ef4444","#8b5cf6","#06b6d4","#14b8a6","#f97316","#22c55e","#84cc16"];
    const labels = chart.labels || [];
    const datasets = chart.datasets && Array.isArray(chart.datasets)
      ? chart.datasets.map((ds, idx) => ({
          label: ds.label || chart.title,
          data: ds.data || [],
          backgroundColor: baseColors[idx % baseColors.length],
          borderColor: baseColors[idx % baseColors.length],
          borderWidth: 1,
        }))
      : [
          {
            label: chart.title,
            data: chart.values || [],
            backgroundColor: baseColors.slice(0, labels.length),
            borderWidth: 1,
          },
        ];
    const chartData = { labels, datasets };

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
      case "radar":
        return <Radar data={chartData} options={chartOptions} />;
      case "polarArea":
      case "polar_area":
        return <PolarArea data={chartData} options={chartOptions} />;
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
              <div className="flex items-center gap-2 mr-3">
                <span className="text-sm text-gray-500">
                  {charts.length} chart{charts.length !== 1 ? "s" : ""}
                </span>
                <div className="flex items-center gap-1 ml-2">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-md border ${viewMode === "grid" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200"}`}
                    title="Grid view"
                  >
                    <LayoutGrid size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-md border ${viewMode === "list" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200"}`}
                    title="List view"
                  >
                    <ListIcon size={16} />
                  </button>
                </div>
              </div>
              <button
                onClick={handleGenerateAllCharts}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                title="Generate all meaningful charts"
              >
                <PlusCircle size={16} />
                Generate All Charts
              </button>
            </div>
            <div className="h-0.5 bg-gradient-to-r from-blue-100 to-gray-100"></div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            {/* Questionnaire */}
            <div className="rounded-xl p-5 border border-gray-100 bg-emerald-50">
              <div className="flex justify-between items-start">
                <div className="p-2 rounded-lg bg-white shadow-sm">
                  <Clipboard className="text-emerald-600" size={18} />
                </div>
                <div className="flex items-center gap-2">
                  {!isMetricsLoading && (
                    <div className="text-xs font-semibold text-emerald-700">{metrics.questionnaire.total ? `${Math.round((metrics.questionnaire.accepted / Math.max(metrics.questionnaire.total,1)) * 100)}% accepted` : ""}</div>
                  )}
                  <Tooltip
                    placement="topRight"
                    color="#ffffff"
                    overlayInnerStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e5e7eb",
                      boxShadow:
                        "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
                      borderRadius: 12,
                      padding: 12,
                    }}
                    title={
                      <div>
                        <div className="text-xs text-gray-700 font-semibold mb-1">Breakdown</div>
                        <div className="text-xs text-gray-700">Control: {questionBreakdown.control}</div>
                        <div className="text-xs text-gray-700">Clause: {questionBreakdown.clause}</div>
                        <div className="text-xs text-gray-700">VAPT: {questionBreakdown.vapt}</div>
                        <div className="text-xs text-gray-700">VAPT Form: {questionBreakdown.vapt_form}</div>
                      </div>
                    }
                  >
                    <button className="p-1 rounded-md bg-white hover:bg-emerald-100 transition-colors border border-emerald-100" aria-label="Question breakdown info">
                      <Info size={14} className="text-emerald-700" />
                    </button>
                  </Tooltip>
                </div>
              </div>
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-600">Questionnaire</p>
                <h3 className="text-2xl font-bold text-emerald-700">
                  {isMetricsLoading ? "--" : `${metrics.questionnaire.answered}/${metrics.questionnaire.total}`}
                </h3>
              </div>
            </div>

            {/* Reports */}
            <div className="rounded-xl p-5 border border-gray-100 bg-blue-50">
              <div className="flex justify-between items-start">
                <div className="p-2 rounded-lg bg-white shadow-sm">
                  <FileText className="text-blue-600" size={18} />
                </div>
                <Tooltip
                  placement="topRight"
                  color="#ffffff"
                  overlayInnerStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e7eb",
                    boxShadow:
                      "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
                    borderRadius: 12,
                    padding: 12,
                  }}
                  title={
                    <div>
                      <div className="text-xs text-gray-700 font-semibold mb-1">Breakdown</div>
                      <div className="text-xs text-gray-700">Risk Assessment: {reportBreakdown.risk_assessment}</div>
                      <div className="text-xs text-gray-700">Risk Treatment: {reportBreakdown.risk_treatment}</div>
                      <div className="text-xs text-gray-700">VAPT: {reportBreakdown.vapt}</div>
                      <div className="text-xs text-gray-700">ASIS: {reportBreakdown.asis}</div>
                    </div>
                  }
                >
                  <button className="p-1 rounded-md bg-white hover:bg-blue-100 transition-colors border border-blue-100" aria-label="Report breakdown info">
                    <Info size={14} className="text-blue-700" />
                  </button>
                </Tooltip>
              </div>
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-600">Reports</p>
                <h3 className="text-2xl font-bold text-blue-700">
                  {isMetricsLoading ? "--" : metrics.reports.total}
                </h3>
              </div>
            </div>

            {/* PLC */}
            <div className="rounded-xl p-5 border border-gray-100 bg-amber-50">
              <div className="flex justify-between items-start">
                <div className="p-2 rounded-lg bg-white shadow-sm">
                  <CheckSquare className="text-amber-600" size={18} />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-600">PLC Steps</p>
                <h3 className="text-2xl font-bold text-amber-700">
                  {isMetricsLoading ? "--" : `${metrics.plc.completed}/${metrics.plc.total}`}
                </h3>
              </div>
            </div>

            {/* Compliance Score (from accepted/total) */}
            <div className="rounded-xl p-5 border border-gray-100 bg-indigo-50">
              <div className="flex justify-between items-start">
                <div className="p-2 rounded-lg bg-white shadow-sm">
                  <Percent className="text-indigo-600" size={18} />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-600">Compliance Score</p>
                <h3 className="text-2xl font-bold text-indigo-700">
                  {isMetricsLoading || !metrics.questionnaire.total ? "--" : `${Math.round((metrics.questionnaire.accepted / Math.max(metrics.questionnaire.total,1)) * 100)}%`}
                </h3>
              </div>
            </div>

            {/* Pending Actions (questions not accepted) */}
            <div className="rounded-xl p-5 border border-gray-100 bg-rose-50">
              <div className="flex justify-between items-start">
                <div className="p-2 rounded-lg bg-white shadow-sm">
                  <AlertCircle className="text-rose-600" size={18} />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-600">Pending Actions</p>
                <h3 className="text-2xl font-bold text-rose-700">
                  {isMetricsLoading ? "--" : Math.max(metrics.questionnaire.total - metrics.questionnaire.accepted, 0)}
                </h3>
              </div>
            </div>
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
              <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "grid grid-cols-1 gap-6"}>
                {filteredCharts.map((chart) => (
                  <div
                    key={chart.id}
                    className={viewMode === "grid" ? "bg-white p-5 rounded-lg hover:shadow-sm transition-shadow duration-200 border border-gray-100" : "bg-white p-6 rounded-lg hover:shadow-sm transition-shadow duration-200 border border-gray-100"}
                  >
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                      <h2 className="text-base font-medium text-blue-600">
                        {chart.title}
                      </h2>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDuplicateChart(chart)}
                          className="text-gray-400 hover:text-blue-600 transition-colors"
                          title="Duplicate Chart"
                        >
                          <Copy size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setChartBeingEdited(chart);
                            setIsEditModalOpen(true);
                          }}
                          className="text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit Chart"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button
                          onClick={() => handleRemoveChart(chart.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          title="Delete Chart"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </div>
                    <div className={viewMode === "grid" ? "h-[250px]" : "h-[400px]"}>{renderChart(chart)}</div>
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

      {/* Generation Error Modal */}
      {genModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-5 w-full max-w-lg shadow-lg">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Chart Generation Report</h3>
              <button
                onClick={() => setGenModal({ open: false, errors: [], created: 0 })}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>
            <div className="text-sm text-gray-700 mb-2">Created: {genModal.created}</div>
            {genModal.errors.length > 0 ? (
              <div className="max-h-60 overflow-auto border border-gray-100 rounded-md">
                {genModal.errors.map((err, idx) => (
                  <div key={idx} className="p-2 border-b border-gray-100 text-xs">
                    <div className="font-semibold">{err.title || "Untitled"}</div>
                    <div>Model: {err.model}</div>
                    <div>X Field: {err.x_field}</div>
                    <div className="text-red-600">{err.error}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-600">No errors.</div>
            )}
            <div className="mt-3 text-right">
              <button
                onClick={() => setGenModal({ open: false, errors: [], created: 0 })}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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

      {isEditModalOpen && chartBeingEdited && (
        <EditChartModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setChartBeingEdited(null);
          }}
          chart={chartBeingEdited}
          projectId={projectid}
          onChartUpdated={handleChartUpdated}
        />
      )}
    </div>
  );
};

export default Dashboard;
