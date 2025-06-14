import { useState, useEffect } from "react";
import { X, BarChart3, LineChart, PieChart } from "lucide-react";
import { message } from "antd";
import { apiRequest } from "../../../utils/api";
import { Bar, Line, Pie, Doughnut } from "react-chartjs-2";

const CreateChartModal = ({
  isOpen,
  onClose,
  dashboardId,
  projectId,
  onChartCreated,
}) => {
  const [chartTitle, setChartTitle] = useState("");
  const [chartType, setChartType] = useState("bar");
  const [modelName, setModelName] = useState("");
  const [xField, setXField] = useState("");
  const [aggregation, setAggregation] = useState("count");
  const [previewData, setPreviewData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [chartConfigs, setChartConfigs] = useState([]);
  const [availableChartTypes, setAvailableChartTypes] = useState([]);
  const [fieldOptions, setFieldOptions] = useState([]);
  const [availableAggregations, setAvailableAggregations] = useState([]);

  // Fetch chart configurations on component mount
  useEffect(() => {
    const fetchChartConfigs = async () => {
      try {
        const response = await apiRequest(
          "GET",
          "/api/project/chart-configurations/list/",
          null,
          true
        );

        if (response.status === 200) {
          setChartConfigs(response.data);
        }
      } catch (error) {
        console.error("Error fetching chart configurations:", error);
        message.error("Failed to fetch chart configurations");
      }
    };

    if (isOpen) {
      fetchChartConfigs();
    }
  }, [isOpen]);

  // Update available options when model changes
  useEffect(() => {
    if (modelName) {
      const config = chartConfigs.find((c) => c.model_name === modelName);
      if (config && config.allowed_charts.length > 0) {
        // Set field options
        const fields = config.allowed_charts.map((chart) => ({
          label: chart.x_field.related_name,
          value: chart.x_field.field_name,
          allowedAggregations: chart.allowed,
        }));
        setFieldOptions(fields);
      }
    } else {
      // Reset all selections when model is cleared
      setXField("");
      setAggregation("");
      setAvailableChartTypes([]);
      setAvailableAggregations([]);
      setFieldOptions([]);
      setPreviewData(null);
    }
  }, [modelName, chartConfigs]);

  // Update available aggregations when field changes
  useEffect(() => {
    if (modelName && xField) {
      const field = fieldOptions.find((f) => f.value === xField);
      if (field) {
        const aggregations = field.allowedAggregations.map((agg) => ({
          value: agg.aggregation,
          label:
            agg.aggregation.charAt(0).toUpperCase() + agg.aggregation.slice(1),
          allowedCharts: agg.charts,
        }));
        setAvailableAggregations(aggregations);
      }
    } else {
      // Reset aggregation and chart type when field is cleared
      setAggregation("");
      setAvailableChartTypes([]);
      setAvailableAggregations([]);
      setPreviewData(null);
    }
  }, [xField, modelName, fieldOptions]);

  // Update available chart types when aggregation changes
  useEffect(() => {
    if (modelName && xField && aggregation) {
      const aggConfig = availableAggregations.find(
        (a) => a.value === aggregation
      );
      if (aggConfig) {
        setAvailableChartTypes(aggConfig.allowedCharts);
        // Reset chart type if current one is not allowed
        if (!aggConfig.allowedCharts.includes(chartType)) {
          setChartType("");
        }
      }
    } else {
      // Reset chart type when aggregation is cleared
      setChartType("");
      setAvailableChartTypes([]);
      setPreviewData(null);
    }
  }, [aggregation, modelName, xField, availableAggregations]);

  // Helper function to check if all required fields are selected for preview
  const arePreviewFieldsSelected = () => {
    return Boolean(modelName && xField && aggregation && chartType);
  };

  // Helper function to check if all required fields are selected for saving
  const areAllFieldsSelected = () => {
    return Boolean(
      modelName && xField && aggregation && chartType && chartTitle.trim()
    );
  };

  // Effect to automatically fetch preview when required fields are selected
  useEffect(() => {
    if (arePreviewFieldsSelected() && !isLoading) {
      fetchPreviewData();
    }
  }, [modelName, xField, aggregation, chartType]);

  // Get model options from configurations
  const modelOptions = chartConfigs.map((config) => ({
    label: config.model_name.replace(/([A-Z])/g, " $1").trim(), // Convert camelCase to spaces
    value: config.model_name,
  }));

  // Get filters based on model
  const getFilters = () => {
    const filters = {};
    if (modelName === "ProjectQuestion") {
      filters["project__id"] = parseInt(projectId);
    }
    return filters;
  };

  // Fetch preview data
  const fetchPreviewData = async () => {
    if (!arePreviewFieldsSelected()) {
      return;
    }

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
      }
    } catch (error) {
      console.error("Error fetching preview data:", error);
      message.error("Failed to fetch preview data");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle model change
  const handleModelChange = (newModel) => {
    if (isLoading) return;
    setModelName(newModel);
    // Reset dependent fields
    setXField("");
    setAggregation("");
    setChartType("");
    setPreviewData(null);
  };

  // Handle field change
  const handleFieldChange = (newField) => {
    if (isLoading) return;
    setXField(newField);
    // Reset dependent fields
    setAggregation("");
    setChartType("");
    setPreviewData(null);
  };

  // Handle aggregation change
  const handleAggregationChange = (newAggregation) => {
    if (isLoading) return;
    setAggregation(newAggregation);
    // Reset chart type
    setChartType("");
    setPreviewData(null);
  };

  // Handle chart type change
  const handleChartTypeChange = (newType) => {
    if (isLoading) return;
    setChartType(newType);
    setPreviewData(null);
  };

  // Handle title change
  const handleTitleChange = (e) => {
    if (isLoading) return;
    setChartTitle(e.target.value);
  };

  // Handle create chart
  const handleCreateChart = async () => {
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
      const response = await apiRequest(
        "POST",
        `/api/project/dashboards/${dashboardId}/charts/`,
        {
          title: chartTitle,
          model_name: modelName,
          x_field: xField,
          aggregation: aggregation,
          chart_type: chartType,
          filters: getFilters(),
          position: {},
        },
        true
      );

      if (response.status === 201) {
        message.success("Chart created successfully!");
        onChartCreated(response.data);
        onClose();
      }
    } catch (error) {
      console.error("Error creating chart:", error);
      message.error("Failed to create chart");
    } finally {
      setIsLoading(false);
    }
  };

  // Render preview chart
  const renderPreviewChart = () => {
    if (!previewData) return null;

    const chartData = {
      labels: previewData.labels,
      datasets: [
        {
          label: chartTitle || "Preview", // Use empty title or "Preview" for preview
          data: previewData.values,
          backgroundColor: [
            "#3b82f6", // blue
            "#10b981", // green
            "#f59e0b", // amber
            "#ef4444", // red
            "#8b5cf6", // purple
            "#06b6d4", // cyan
          ].slice(0, previewData.labels.length),
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
            chartType === "pie" || chartType === "doughnut" ? "right" : "top",
          labels: {
            font: { size: 10 },
          },
        },
        title: {
          display: false,
        },
      },
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
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Create Custom Chart
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Chart Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Chart Title
            </label>
            <input
              type="text"
              value={chartTitle}
              onChange={handleTitleChange}
              disabled={isLoading}
              placeholder="Enter a descriptive chart title"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Data Model
            </label>
            <select
              value={modelName}
              onChange={(e) => handleModelChange(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:bg-gray-50 disabled:cursor-not-allowed"
            >
              <option value="">Select a model</option>
              {modelOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Field Selection */}
          {modelName && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Field to Analyze
              </label>
              <select
                value={xField}
                onChange={(e) => handleFieldChange(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:bg-gray-50 disabled:cursor-not-allowed"
              >
                <option value="">Select a field</option>
                {fieldOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Aggregation Selection */}
          {modelName && xField && availableAggregations.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Aggregation Type
              </label>
              <select
                value={aggregation}
                onChange={(e) => handleAggregationChange(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:bg-gray-50 disabled:cursor-not-allowed"
              >
                <option value="">Select aggregation type</option>
                {availableAggregations.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Chart Type Selection */}
          {modelName &&
            xField &&
            aggregation &&
            availableChartTypes.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Chart Type
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {availableChartTypes.map((type) => {
                    const icon =
                      type === "bar" ? (
                        <BarChart3 size={18} />
                      ) : type === "line" ? (
                        <LineChart size={18} />
                      ) : (
                        <PieChart size={18} />
                      );

                    return (
                      <div
                        key={type}
                        onClick={() =>
                          !isLoading && handleChartTypeChange(type)
                        }
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md text-center ${
                          chartType === type
                            ? "border-blue-500 bg-blue-50 shadow-md"
                            : "border-gray-200 hover:border-gray-300"
                        } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <div
                          className={`flex justify-center mb-2 ${
                            chartType === type
                              ? "text-blue-600"
                              : "text-gray-600"
                          }`}
                        >
                          {icon}
                        </div>
                        <p
                          className={`text-sm font-medium ${
                            chartType === type
                              ? "text-blue-900"
                              : "text-gray-900"
                          }`}
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)} Chart
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          {/* Preview Section */}
          <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-700">
                Chart Preview
              </h3>
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
                    <p className="text-sm text-gray-600">
                      Loading preview data...
                    </p>
                  </div>
                </div>
              ) : previewData ? (
                renderPreviewChart()
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-gray-400 mb-3">
                      <BarChart3 size={32} />
                    </div>
                    <p className="text-lg font-medium text-gray-500 mb-2">
                      No Preview Available
                    </p>
                    <p className="text-sm text-gray-400">
                      {!modelName
                        ? "Select a model first"
                        : !xField
                        ? "Select a field to analyze"
                        : !aggregation
                        ? "Select an aggregation type"
                        : !chartType
                        ? "Select a chart type"
                        : "Preview will update automatically"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateChart}
              disabled={!areAllFieldsSelected() || isLoading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Creating...
                </div>
              ) : (
                "Create Chart"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateChartModal;
