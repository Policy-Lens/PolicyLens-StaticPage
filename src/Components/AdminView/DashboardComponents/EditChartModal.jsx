import { useState, useEffect } from "react";
import { X, BarChart3, LineChart, PieChart } from "lucide-react";
import { message } from "antd";
import { apiRequest } from "../../../utils/api";
import { Bar, Line, Pie, Doughnut, Radar, PolarArea } from "react-chartjs-2";

const EditChartModal = ({
  isOpen,
  onClose,
  chart,
  projectId,
  onChartUpdated,
}) => {
  const [chartTitle, setChartTitle] = useState(chart?.title || "");
  const [chartType, setChartType] = useState(chart?.chart_type || "bar");
  const [modelName, setModelName] = useState(chart?.model_name || "");
  const [xField, setXField] = useState(chart?.x_field || "");
  const [aggregation, setAggregation] = useState(chart?.aggregation || "count");
  const [previewData, setPreviewData] = useState(null);
  const [previewError, setPreviewError] = useState("");
  const [isPreviewValid, setIsPreviewValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [chartConfigs, setChartConfigs] = useState([]);
  const [availableChartTypes, setAvailableChartTypes] = useState([]);
  const [fieldOptions, setFieldOptions] = useState([]);
  const [availableAggregations, setAvailableAggregations] = useState([]);
  const [groupBy, setGroupBy] = useState("");
  const [stacked, setStacked] = useState(false);

  const DEFAULT_CHART_CONFIGS = [
    {
      model_name: "ProjectQuestion",
      allowed_charts: [
        { x_field: { field_name: "status", related_name: "Status" }, allowed: [{ aggregation: "count", charts: ["bar", "line", "pie", "doughnut"] }] },
        { x_field: { field_name: "type", related_name: "Type" }, allowed: [{ aggregation: "count", charts: ["bar", "pie", "doughnut"] }] },
        { x_field: { field_name: "control_theme", related_name: "Control Theme" }, allowed: [{ aggregation: "count", charts: ["bar", "pie", "doughnut"] }] },
        { x_field: { field_name: "standard", related_name: "Standard" }, allowed: [{ aggregation: "count", charts: ["bar", "pie", "doughnut"] }] },
      ],
    },
    {
      model_name: "ProjectReport",
      allowed_charts: [
        { x_field: { field_name: "category", related_name: "Category" }, allowed: [{ aggregation: "count", charts: ["bar", "pie", "doughnut"] }] },
        { x_field: { field_name: "status", related_name: "Status" }, allowed: [{ aggregation: "count", charts: ["bar", "pie", "doughnut", "line"] }] },
        { x_field: { field_name: "report_type", related_name: "Report Type" }, allowed: [{ aggregation: "count", charts: ["bar", "pie", "doughnut"] }] },
      ],
    },
    {
      model_name: "PlcStep",
      allowed_charts: [
        { x_field: { field_name: "status", related_name: "PLC Status" }, allowed: [{ aggregation: "count", charts: ["bar", "line", "pie", "doughnut"] }] },
        { x_field: { field_name: "process", related_name: "PLC Process" }, allowed: [{ aggregation: "count", charts: ["bar", "pie", "doughnut"] }] },
      ],
    },
  ];

useEffect(() => {
  if (!isOpen) return;
  setChartTitle(chart?.title || "");
  setChartType(chart?.chart_type || "bar");
  const incomingModel = chart?.model_name || chart?.model || "";
  setModelName(incomingModel);
  setXField(chart?.x_field || "");
  setAggregation(chart?.aggregation || "count");
  const f = chart?.filters || {};
  if (f && typeof f === 'object') {
    setGroupBy(f.__group_by || "");
    setStacked(Boolean(f.__stacked));
  } else {
    setGroupBy("");
    setStacked(false);
  }
  setPreviewData(null);
  setIsPreviewValid(false);
  setPreviewError("");
}, [isOpen, chart]);

  useEffect(() => {
    const fetchChartConfigs = async () => {
      try {
        const response = await apiRequest(
          "GET",
          "/api/project/chart-configurations/list/",
          null,
          true
        );
        if (response.status === 200 && Array.isArray(response.data) && response.data.length > 0) {
          setChartConfigs(response.data);
        } else {
          setChartConfigs(DEFAULT_CHART_CONFIGS);
        }
      } catch (error) {
        console.error("Error fetching chart configurations:", error);
        setChartConfigs(DEFAULT_CHART_CONFIGS);
        message.warning("Using default chart configurations");
      }
    };
    if (isOpen) fetchChartConfigs();
  }, [isOpen]);

useEffect(() => {
  if (modelName) {
    const config = chartConfigs.find((c) => (c.model_name || '').toLowerCase() === modelName.toLowerCase());
    if (!config) {
      const plc = chartConfigs.find((c) => (c.model_name || '').toLowerCase() === 'plcstep');
      if (plc) {
        setModelName(plc.model_name);
      }
    }
    if (config && config.allowed_charts.length > 0) {
      const fields = config.allowed_charts.map((c) => ({
        label: c.x_field.related_name,
        value: c.x_field.field_name,
        allowedAggregations: c.allowed,
      }));
      setFieldOptions(fields);
    }
  } else {
    setFieldOptions([]);
    setAvailableAggregations([]);
    setAvailableChartTypes([]);
  }
}, [modelName, chartConfigs]);

  useEffect(() => {
    if (modelName && xField) {
      const field = fieldOptions.find((f) => f.value === xField);
      if (field) {
        const aggregations = field.allowedAggregations.map((agg) => ({
          value: agg.aggregation,
          label: agg.aggregation.charAt(0).toUpperCase() + agg.aggregation.slice(1),
          allowedCharts: agg.charts,
        }));
        setAvailableAggregations(aggregations);
      }
    } else {
      setAvailableAggregations([]);
      setAvailableChartTypes([]);
    }
  }, [xField, modelName, fieldOptions]);

  useEffect(() => {
    if (modelName && xField && aggregation) {
      const aggConfig = availableAggregations.find((a) => a.value === aggregation);
      if (aggConfig) {
        setAvailableChartTypes(aggConfig.allowedCharts);
        if (!aggConfig.allowedCharts.includes(chartType)) setChartType("");
      }
    } else {
      setAvailableChartTypes([]);
    }
  }, [aggregation, modelName, xField, availableAggregations]);

  const arePreviewFieldsSelected = () => Boolean(modelName && xField && aggregation && chartType);

  useEffect(() => {
    if (arePreviewFieldsSelected() && !isLoading) fetchPreviewData();
  }, [modelName, xField, aggregation, chartType]);

const getFilters = () => {
    const filters = {};
    if (modelName === "ProjectQuestion") {
      filters["project__id"] = parseInt(projectId);
  } else if (modelName === "PLCStep" || modelName === "PlcStep") {
    filters["project__id"] = parseInt(projectId);
  }
    if (groupBy) filters["__group_by"] = groupBy;
    if (groupBy && stacked) filters["__stacked"] = true;
    return filters;
  };

  const isGrouped = Boolean(groupBy);
  const isChartTypeSupported = () => {
    if (isGrouped && (chartType === "pie" || chartType === "doughnut")) return false;
    return true;
  };

  const fetchPreviewData = async () => {
    if (!arePreviewFieldsSelected()) return;
    try {
      setIsLoading(true);
      const response = await apiRequest(
        "POST",
        `/api/project/${projectId}/charts/preview/`,
        {
          model_name: modelName,
          x_field: xField,
          aggregation: aggregation,
          filters: getFilters(),
        },
        true
      );
      if (response.status === 200) {
        setPreviewData(response.data);
        setPreviewError("");
        setIsPreviewValid(true);
      }
    } catch (error) {
      const errMsg = error?.response?.data?.error || "Failed to fetch preview data";
      console.error("Error fetching preview data:", errMsg);
      message.error(errMsg);
      setPreviewData(null);
      setPreviewError(errMsg);
      setIsPreviewValid(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateChart = async () => {
    if (!chartTitle.trim()) {
      message.error("Please enter a chart title");
      return;
    }
    if (!arePreviewFieldsSelected()) {
      message.error("Please select all required fields");
      return;
    }
    try {
      setIsLoading(true);
      if (!isChartTypeSupported()) {
        message.error("Selected chart type does not support Group By. Choose bar/line/radar.");
        return;
      }
      if (!isPreviewValid) {
        message.error(previewError || "Chart configuration is not valid.");
        return;
      }
      const response = await apiRequest(
        "PUT",
        `/api/project/dashboards/charts/${chart.id}/update/`,
        {
          title: chartTitle,
          model_name: modelName,
          x_field: xField,
          aggregation: aggregation,
          chart_type: chartType,
          filters: getFilters(),
          position: chart.position || {},
        },
        true
      );
      if (response.status === 200) {
        message.success("Chart updated successfully!");
        onChartUpdated(response.data);
        onClose();
      }
    } catch (error) {
      const errMsg = error?.response?.data?.error || "Failed to update chart";
      console.error("Error updating chart:", errMsg);
      message.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const renderPreviewChart = () => {
    if (!previewData) return null;
    const baseColors = ["#3b82f6","#10b981","#f59e0b","#ef4444","#8b5cf6","#06b6d4","#14b8a6","#f97316","#22c55e","#84cc16"];
    const labels = previewData.labels || [];
    const datasets = Array.isArray(previewData.datasets) && previewData.datasets.length
      ? previewData.datasets.map((ds, idx) => ({
          label: ds.label || (chartTitle || "Preview"),
          data: ds.data || [],
          backgroundColor: baseColors[idx % baseColors.length],
          borderColor: baseColors[idx % baseColors.length],
          borderWidth: 1,
        }))
      : [
          { label: chartTitle || "Preview", data: previewData.values || [], backgroundColor: baseColors.slice(0, labels.length), borderWidth: 1 },
        ];
    const chartData = { labels, datasets };
    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: chartType === "pie" || chartType === "doughnut" ? "right" : "top",
          labels: { font: { size: 10 } },
        },
        title: { display: false },
      },
      scales: previewData.stacked ? { x: { stacked: true }, y: { stacked: true } } : undefined,
    };
    switch (chartType) {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Edit Chart</h2>
          <button onClick={onClose} disabled={isLoading} className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Chart Title</label>
            <input type="text" value={chartTitle} onChange={(e) => setChartTitle(e.target.value)} disabled={isLoading} placeholder="Enter chart title" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:bg-gray-50 disabled:cursor-not-allowed" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Data Model</label>
            <select value={modelName} onChange={(e) => setModelName(e.target.value)} disabled={isLoading} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:bg-gray-50 disabled:cursor-not-allowed">
              <option value="">Select a model</option>
              {chartConfigs.map((c) => (
                <option key={c.model_name} value={c.model_name}>{c.model_name.replace(/([A-Z])/g, " $1").trim()}</option>
              ))}
            </select>
          </div>

          {modelName && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Field to Analyze</label>
              <select value={xField} onChange={(e) => setXField(e.target.value)} disabled={isLoading} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:bg-gray-50 disabled:cursor-not-allowed">
                <option value="">Select a field</option>
                {fieldOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          )}

          {modelName && xField && availableAggregations.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Aggregation Type</label>
              <select value={aggregation} onChange={(e) => setAggregation(e.target.value)} disabled={isLoading} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:bg-gray-50 disabled:cursor-not-allowed">
                <option value="">Select aggregation type</option>
                {availableAggregations.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          )}

          {modelName && xField && aggregation && availableChartTypes.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Chart Type</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(isGrouped ? availableChartTypes.filter((t) => t !== "pie" && t !== "doughnut") : availableChartTypes).map((type) => {
                  const icon = type === "bar" ? <BarChart3 size={18} /> : type === "line" ? <LineChart size={18} /> : <PieChart size={18} />;
                  return (
                    <div key={type} onClick={() => !isLoading && setChartType(type)} className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md text-center ${chartType === type ? "border-blue-500 bg-blue-50 shadow-md" : "border-gray-200 hover:border-gray-300"} ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}>
                      <div className={`flex justify-center mb-2 ${chartType === type ? "text-blue-600" : "text-gray-600"}`}>{icon}</div>
                      <p className={`text-sm font-medium ${chartType === type ? "text-blue-900" : "text-gray-900"}`}>{type.charAt(0).toUpperCase() + type.slice(1)} Chart</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Group By / Stacked */}
          {modelName && xField && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Group By (optional)</label>
                <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)} disabled={isLoading} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:bg-gray-50 disabled:cursor-not-allowed">
                  <option value="">None</option>
                  {fieldOptions.filter((f) => f.value !== xField).map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                {groupBy && (chartType === "pie" || chartType === "doughnut") && (
                  <div className="mt-1 text-xs text-amber-600">Group by is not supported for pie/doughnut. Choose bar/line/radar.</div>
                )}
              </div>
              <div className="flex items-end">
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" className="rounded" checked={stacked} onChange={(e) => setStacked(e.target.checked)} disabled={!groupBy || isLoading} />
                  Stacked Series
                </label>
              </div>
            </div>
          )}

          <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Chart Preview</h3>
              {isLoading && (
                <div className="flex items-center gap-2 text-blue-600 text-sm">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                  Updating preview...
                </div>
              )}
            </div>
            <div className="h-[200px] bg-white rounded-lg p-4 relative">
              {isLoading ? (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mx-auto mb-3"></div>
                    <p className="text-sm text-gray-600">Loading preview data...</p>
                  </div>
                </div>
              ) : previewData ? (
                renderPreviewChart()
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-gray-400 mb-3"><BarChart3 size={32} /></div>
                    <p className="text-lg font-medium text-gray-500 mb-2">No Preview Available</p>
                    <p className="text-sm text-gray-400">Select model, field, aggregation and chart type to preview</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <button onClick={onClose} disabled={isLoading} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed">Cancel</button>
            <button onClick={handleUpdateChart} disabled={!arePreviewFieldsSelected() || isLoading} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium">Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditChartModal;


