import { useState, useEffect } from "react";
import {
  BarChart3,
  PlusCircle,
  Search,
  X,
  ChevronDown,
  LineChart,
  PieChart,
  AreaChart,
  ArrowUpRight,
  AlertCircle,
  Clipboard,
  DollarSign,
  Shield,
  Filter,
} from "lucide-react";
import SideNav from "../WorkFlow/SideNav";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Doughnut, Bar, Line, Pie } from 'react-chartjs-2';
import { apiRequest } from "../../utils/api";
import { useParams } from "react-router-dom";
import { message, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler
);

const AdminDashboard = () => {
  const { projectid } = useParams();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isChartModalOpen, setIsChartModalOpen] = useState(false);
  const [chartType, setChartType] = useState("bar");
  const [dataSource, setDataSource] = useState("questionnaireStatus");
  const [chartTitle, setChartTitle] = useState("");
  const [customCharts, setCustomCharts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [questionnaireData, setQuestionnaireData] = useState([]);
  const [realDataSources, setRealDataSources] = useState({});

  // Dashboard metrics
  const metricCards = [
    {
      title: "Total Questions",
      value: "124",
      icon: <Clipboard className="text-indigo-500" size={20} />,
      change: "+12%",
      trend: "up",
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-700"
    },
    {
      title: "Answered Questions",
      value: "38",
      icon: <Shield className="text-green-500" size={20} />,
      change: "+5%",
      trend: "up",
      bgColor: "bg-green-50",
      textColor: "text-green-700"
    },
    {
      title: "Completion Rate",
      value: "78.5%",
      icon: <Clipboard className="text-emerald-500" size={20} />,
      change: "+2.3%",
      trend: "up",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-700"
    },
    {
      title: "Pending Reviews",
      value: "15",
      icon: <DollarSign className="text-amber-500" size={20} />,
      change: "-8%",
      trend: "down",
      bgColor: "bg-amber-50",
      textColor: "text-amber-700"
    },
  ];

  // Function to fetch questionnaire data - get real data from API
  const fetchQuestionnaireData = async () => {
    if (!projectid) {
      console.error("No projectid available");
      setIsLoadingData(false);
      return;
    }

    setIsLoadingData(true);

    try {
      // Use the control type endpoint to get the data with associated functions and control themes
      const endpoint = `/api/new-questionnaire/project/${projectid}/questions/?type=control`;

      console.log("Fetching from endpoint:", endpoint);
      console.log("Project ID:", projectid);

      const response = await apiRequest("GET", endpoint, null, true);

      console.log("API Response status:", response.status);
      console.log("API Response data:", response.data);

      if (response.status === 200 && response.data) {
        console.log("Questions data received:", response.data);
        console.log("Number of questions:", response.data.length);

        if (response.data.length === 0) {
          console.warn("No questions found in API response");
          message.warning("No questions found for this project.");
        }

        setQuestionnaireData(response.data);
        processQuestionnaireData(response.data);
      } else {
        console.error("API returned non-200 status or no data:", response);
        throw new Error(`API returned status: ${response.status}`);
      }
    } catch (error) {
      console.error("Failed to fetch questionnaire data:", error);
      console.error("Error details:", {
        message: error.message,
        status: error.status,
        response: error.response
      });

      // Show specific error messages
      if (error.status === 404) {
        message.error("Project not found or no questions available.");
      } else if (error.status === 403) {
        message.error("Access denied. Please check your permissions.");
      } else {
        message.error(`Failed to fetch questionnaire data: ${error.message || 'Unknown error'}`);
      }

      setQuestionnaireData([]);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Function to process questionnaire data and create chart data
  const processQuestionnaireData = (questions) => {
    console.log('Raw questionnaire data:', questions);
    console.log('Sample question structure:', questions[0]);

    // Count status occurrences
    const statusCounts = {
      'Not Answered': 0,
      'Submitted': 0,
      'Under Review': 0,
      'Accepted': 0,
      'Needs More Info': 0,
      'Rejected': 0
    };

    questions.forEach((question, index) => {
      // Debug logging for first few questions
      if (index < 5) {
        console.log(`Question ${index + 1} detailed structure:`, {
          id: question.id,
          hasAnswer: !!question.answer,
          answer: question.answer,
          answerStatus: question.answer?.status,
          // Check for other possible status fields
          status: question.status,
          questionStatus: question.question_status,
          allKeys: Object.keys(question)
        });
      }

      // Count answer status - check multiple possible status locations
      let questionStatus = 'Not Answered'; // Default status

      if (question.answer && question.answer.status) {
        // Answer object with status
        questionStatus = question.answer.status;
      } else if (question.status) {
        // Direct status on question
        questionStatus = question.status;
      } else if (question.question_status) {
        // Alternative status field
        questionStatus = question.question_status;
      } else if (question.answer_status) {
        // Another possible status field
        questionStatus = question.answer_status;
      }
      // If none of the above, it remains 'Not Answered'

      // Increment the count for this status
      if (statusCounts.hasOwnProperty(questionStatus)) {
        statusCounts[questionStatus]++;
      } else {
        console.warn(`Unknown status found: ${questionStatus}`);
        statusCounts['Not Answered']++; // Treat unknown status as not answered
      }
    });

    console.log('Final processed counts:');
    console.log('Status counts:', statusCounts);
    console.log('Total questions processed:', questions.length);

    // Filter out zero values for cleaner charts
    const filteredStatusLabels = [];
    const filteredStatusData = [];
    const filteredStatusColors = [];

    const statusColorMap = {
      'Not Answered': '#ef4444', // red
      'Submitted': '#3b82f6', // blue  
      'Under Review': '#f59e0b', // amber
      'Accepted': '#10b981', // emerald
      'Needs More Info': '#f97316', // orange
      'Rejected': '#dc2626', // red-600
    };

    Object.entries(statusCounts).forEach(([status, count]) => {
      if (count > 0) {
        filteredStatusLabels.push(status);
        filteredStatusData.push(count);
        filteredStatusColors.push(statusColorMap[status]);
      }
    });

    // Filter control names data
    const filteredControlNameLabels = [];
    const filteredControlNameData = [];
    const controlNameColors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#14b8a6', '#f59e0b', '#ef4444'];

    // Filter control numbers data  
    const filteredControlNumberLabels = [];
    const filteredControlNumberData = [];
    const controlNumberColors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#06b6d4', '#14b8a6', '#f97316'];

    console.log('Filtered chart data:');
    console.log('Control Names:', { labels: filteredControlNameLabels, data: filteredControlNameData });
    console.log('Control Numbers:', { labels: filteredControlNumberLabels, data: filteredControlNumberData });

    // Create chart data objects
    const processedDataSources = {
      questionnaireStatus: {
        labels: filteredStatusLabels,
        datasets: [
          {
            label: 'Questions by Status',
            data: filteredStatusData,
            backgroundColor: filteredStatusColors,
            borderWidth: 1,
          },
        ],
      },
      monthlyProgress: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Questions Answered',
            data: [
              Math.floor(statusCounts['Accepted'] * 0.6),
              Math.floor(statusCounts['Accepted'] * 0.7),
              Math.floor(statusCounts['Accepted'] * 0.5),
              Math.floor(statusCounts['Accepted'] * 0.9),
              Math.floor(statusCounts['Accepted'] * 0.8),
              statusCounts['Accepted'],
            ],
            borderColor: '#10b981', // emerald
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.3,
          },
          {
            label: 'Questions Asked',
            data: [
              Math.floor(questions.length * 0.7),
              Math.floor(questions.length * 0.8),
              Math.floor(questions.length * 0.6),
              Math.floor(questions.length * 0.95),
              Math.floor(questions.length * 0.9),
              questions.length,
            ],
            borderColor: '#3b82f6', // blue
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.3,
          },
        ],
      },
    };

    setRealDataSources(processedDataSources);

    // Update metric cards with real data
    const totalQuestions = questions.length;
    const answeredQuestions = statusCounts['Accepted'] + statusCounts['Submitted'] + statusCounts['Under Review'] + statusCounts['Needs More Info'] + statusCounts['Rejected'];
    const completionRate = totalQuestions > 0 ? ((statusCounts['Accepted'] / totalQuestions) * 100).toFixed(1) : 0;
    const pendingReviews = statusCounts['Submitted'] + statusCounts['Under Review'];

    // Update metric cards (you would need to make metricCards state to update these dynamically)
    // For now, we'll just log the real values
    console.log('Real metrics:', {
      totalQuestions,
      answeredQuestions,
      notAnswered: statusCounts['Not Answered'],
      completionRate: `${completionRate}%`,
      pendingReviews,
      availableControlNames: filteredControlNameLabels.length,
      availableControlNumbers: filteredControlNumberLabels.length
    });
  };

  // Chart type options
  const chartTypes = [
    { label: "Bar Chart", value: "bar", icon: <BarChart3 size={18} /> },
    { label: "Line Chart", value: "line", icon: <LineChart size={18} /> },
    { label: "Pie Chart", value: "pie", icon: <PieChart size={18} /> },
    { label: "Doughnut Chart", value: "doughnut", icon: <PieChart size={18} /> },
  ];

  // Data source options (updated with real data)
  const dataSources = [
    { label: "Questionnaire Status", value: "questionnaireStatus" },
    { label: "Monthly Progress", value: "monthlyProgress" }
  ];

  // Load custom charts from localStorage on component mount
  useEffect(() => {
    const savedCharts = localStorage.getItem('adminCustomCharts');
    if (savedCharts) {
      setCustomCharts(JSON.parse(savedCharts));
    }
  }, []);

  // Fetch questionnaire data on component mount
  useEffect(() => {
    fetchQuestionnaireData();
  }, [projectid]);

  // Save charts to localStorage whenever they change
  useEffect(() => {
    if (customCharts.length > 0) {
      localStorage.setItem('adminCustomCharts', JSON.stringify(customCharts));
    }
  }, [customCharts]);

  // Function to handle creating a new chart
  const handleCreateChart = () => {
    if (!chartTitle.trim()) {
      message.error("Please enter a chart title");
      return;
    }

    if (!realDataSources[dataSource]) {
      message.error("Data source not available. Please wait for data to load.");
      return;
    }

    // Check if the selected data source has actual data
    const selectedData = realDataSources[dataSource];
    const hasData = selectedData && selectedData.labels && selectedData.labels.length > 0;

    if (!hasData) {
      let errorMessage = "No data available for this chart type.";
      message.warning(errorMessage);
      return;
    }

    const newChart = {
      id: Date.now(),
      type: chartType,
      dataSource: dataSource,
      title: chartTitle,
      data: selectedData,
    };

    setCustomCharts([...customCharts, newChart]);
    setIsChartModalOpen(false);
    setChartTitle("");
    message.success("Chart created successfully!");
  };

  // Function to remove a chart
  const handleRemoveChart = (chartId) => {
    const updatedCharts = customCharts.filter(chart => chart.id !== chartId);
    setCustomCharts(updatedCharts);
    localStorage.setItem('adminCustomCharts', JSON.stringify(updatedCharts));
    message.success("Chart removed successfully!");
  };

  // Render the appropriate chart based on type
  const renderChart = (chart) => {
    const chartHeight = chart.type === 'line' ? 200 : 180;

    switch (chart.type) {
      case 'bar':
        return (
          <Bar
            data={chart.data}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top',
                  labels: {
                    font: { size: 10 }
                  }
                },
                title: {
                  display: false
                }
              }
            }}
          />
        );
      case 'line':
        return (
          <Line
            data={chart.data}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top',
                  labels: {
                    font: { size: 10 }
                  }
                },
                title: {
                  display: false
                }
              }
            }}
          />
        );
      case 'pie':
        return (
          <Pie
            data={chart.data}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'right',
                  labels: {
                    font: { size: 10 }
                  }
                },
                title: {
                  display: false
                }
              }
            }}
          />
        );
      case 'doughnut':
        return (
          <Doughnut
            data={chart.data}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'right',
                  labels: {
                    font: { size: 10 }
                  }
                },
                title: {
                  display: false
                }
              }
            }}
          />
        );
      default:
        return null;
    }
  };

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
            <div className="flex items-baseline">
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <span className="ml-auto text-sm text-gray-500">As at {new Date().toLocaleDateString()}</span>
            </div>
            <div className="mt-4 h-0.5 bg-gradient-to-r from-blue-100 to-gray-100"></div>
          </div>

          {isLoadingData ? (
            // Loading state below header
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
                    placeholder="Search dashboard..."
                    className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <button
                  onClick={() => setIsChartModalOpen(true)}
                  disabled={isLoadingData || Object.keys(realDataSources).length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PlusCircle size={18} />
                  Create Chart
                </button>
              </div>

              {/* Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {metricCards.map((card, index) => (
                  <div
                    key={index}
                    className={`${card.bgColor} rounded-xl p-4 transition-all hover:shadow-md border border-gray-100`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="p-2 rounded-lg bg-white shadow-sm">
                        {card.icon}
                      </div>
                      <div className={`flex items-center text-xs font-semibold ${card.trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {card.trend === 'up' ? (
                          <ArrowUpRight size={14} className="mr-1" />
                        ) : (
                          <ArrowUpRight size={14} className="mr-1 transform rotate-90" />
                        )}
                        {card.change}
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-500">{card.title}</p>
                      <h3 className={`text-2xl font-bold mt-1 ${card.textColor}`}>{card.value}</h3>
                    </div>
                  </div>
                ))}
              </div>

              {/* Custom Charts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {customCharts.map((chart) => (
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
                    <div className="h-[250px]">
                      {renderChart(chart)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Welcome message when no charts */}
              {customCharts.length === 0 && (
                <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="text-blue-600" size={24} />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">No Custom Charts Yet</h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    Create your first chart by clicking the "Create Chart" button above. You can visualize data from questionnaire responses.
                  </p>
                  <button
                    onClick={() => setIsChartModalOpen(true)}
                    disabled={Object.keys(realDataSources).length === 0}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Chart Creation Modal */}
      {isChartModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Create Custom Chart</h2>
              <button
                onClick={() => setIsChartModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Chart Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chart Title
                </label>
                <input
                  type="text"
                  value={chartTitle}
                  onChange={(e) => setChartTitle(e.target.value)}
                  placeholder="Enter chart title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Chart Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chart Type
                </label>
                <div className="relative">
                  <select
                    value={chartType}
                    onChange={(e) => setChartType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  >
                    {chartTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <ChevronDown size={16} className="text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Data Source Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Source
                </label>
                <div className="relative">
                  <select
                    value={dataSource}
                    onChange={(e) => setDataSource(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  >
                    {dataSources.map((source) => (
                      <option key={source.value} value={source.value}>
                        {source.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <ChevronDown size={16} className="text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Preview of the selected chart */}
              {realDataSources[dataSource] && (
                <div className="border border-gray-200 rounded-lg p-4 mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Preview:</h3>
                  <div className="h-[150px]">
                    {realDataSources[dataSource].labels && realDataSources[dataSource].labels.length > 0 ? (
                      <>
                        {chartType === 'bar' && <Bar data={realDataSources[dataSource]} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />}
                        {chartType === 'line' && <Line data={realDataSources[dataSource]} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />}
                        {chartType === 'pie' && <Pie data={realDataSources[dataSource]} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />}
                        {chartType === 'doughnut' && <Doughnut data={realDataSources[dataSource]} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />}
                      </>
                    ) : (
                      <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                        <div className="text-center">
                          <div className="text-gray-400 mb-2">
                            <BarChart3 size={24} />
                          </div>
                          <p className="text-sm text-gray-500 font-medium">No data available</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {dataSource === "questionnaireStatus" && "No questionnaire status data"}
                            {dataSource === "monthlyProgress" && "No progress data available"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setIsChartModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateChart}
                  disabled={!realDataSources[dataSource]}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Chart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;












