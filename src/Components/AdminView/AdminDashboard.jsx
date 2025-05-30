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
  ArrowLeft,
  FileText,
  TrendingUp,
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
import { useParams, useNavigate } from "react-router-dom";
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
  const { projectid, dashboardId } = useParams();
  const navigate = useNavigate();

  console.log("AdminDashboard component loaded");
  console.log("Project ID:", projectid);
  console.log("Dashboard ID:", dashboardId);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isChartModalOpen, setIsChartModalOpen] = useState(false);
  const [chartType, setChartType] = useState("bar");
  const [dataSource, setDataSource] = useState("questionnaireStatus");
  const [chartTitle, setChartTitle] = useState("");
  const [selectedPage, setSelectedPage] = useState("questionnaire");
  const [currentDashboard, setCurrentDashboard] = useState(null);
  const [customCharts, setCustomCharts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [questionnaireData, setQuestionnaireData] = useState([]);
  const [riskAssessmentData, setRiskAssessmentData] = useState([]);
  const [asisControlsData, setAsisControlsData] = useState([]);
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

  // Function to fetch risk assessment data directly
  const fetchRiskAssessmentData = async () => {
    try {
      // Directly fetch risks from the known endpoint
      const risksEndpoint = `/api/rarpt/assessment-sheets/31/risks/`;
      console.log("Fetching risks from:", risksEndpoint);

      const risksResponse = await apiRequest("GET", risksEndpoint, null, true);

      console.log("Risks response status:", risksResponse.status);
      console.log("Risks response data:", risksResponse.data);

      if (risksResponse.status === 200 && risksResponse.data) {
        console.log("Risk assessment data received, count:", risksResponse.data.length);
        return risksResponse.data;
      } else {
        console.warn("Risks response not successful or no data");
        return [];
      }
    } catch (error) {
      console.error("Failed to fetch risk assessment data:", error);
      return [];
    }
  };

  // Function to fetch ASIS controls data
  const fetchAsisControlsData = async () => {
    try {
      // First get ASIS reports for this project
      const reportsEndpoint = `/api/rarpt/project/${projectid}/asis-reports/`;
      console.log("Fetching ASIS reports from:", reportsEndpoint);

      const reportsResponse = await apiRequest("GET", reportsEndpoint, null, true);

      if (reportsResponse.status === 200 && reportsResponse.data && reportsResponse.data.length > 0) {
        // Use the first available report to get controls
        const firstReport = reportsResponse.data[0];
        const controlsEndpoint = `/api/rarpt/asis-reports/${firstReport.id}/controls/`;
        console.log("Fetching ASIS controls from:", controlsEndpoint);

        const controlsResponse = await apiRequest("GET", controlsEndpoint, null, true);

        console.log("ASIS controls response status:", controlsResponse.status);
        console.log("ASIS controls response data:", controlsResponse.data);

        if (controlsResponse.status === 200 && controlsResponse.data) {
          console.log("ASIS controls data received, count:", controlsResponse.data.length);
          console.log("Sample ASIS control data:", controlsResponse.data[0]);
          if (controlsResponse.data.length > 0) {
            console.log("Available fields in first control:", Object.keys(controlsResponse.data[0]));
          }
          return controlsResponse.data;
        } else {
          console.warn("ASIS controls response not successful or no data");
          return [];
        }
      } else {
        console.warn("No ASIS reports found for this project");
        return [];
      }
    } catch (error) {
      console.error("Failed to fetch ASIS controls data:", error);
      return [];
    }
  };

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

        // Also fetch risk assessment data
        const riskData = await fetchRiskAssessmentData();
        setRiskAssessmentData(riskData);

        // Also fetch ASIS controls data
        const asisData = await fetchAsisControlsData();
        setAsisControlsData(asisData);

        // Process all datasets
        processAllData(response.data, riskData, asisData);
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
      setRiskAssessmentData([]);
      setAsisControlsData([]);
    }
  };

  // Function to process both questionnaire and risk assessment data
  const processAllData = (questions, risks, asisControls) => {
    console.log('Processing questionnaire data:', questions.length, 'questions');
    console.log('Processing risk assessment data:', risks.length, 'risks');
    console.log('Processing ASIS controls data:', asisControls.length, 'controls');

    if (risks.length > 0) {
      console.log('Sample risk structure:', risks[0]);
    }

    if (asisControls.length > 0) {
      console.log('Sample ASIS control structure:', asisControls[0]);
    }

    // Process Questionnaire Status Data
    const statusCounts = {
      'Not Answered': 0,
      'Submitted': 0,
      'Under Review': 0,
      'Accepted': 0,
      'Needs More Info': 0,
      'Rejected': 0
    };

    questions.forEach((question, index) => {
      let questionStatus = 'Not Answered';

      if (question.answer && question.answer.status) {
        questionStatus = question.answer.status;
      } else if (question.status) {
        questionStatus = question.status;
      } else if (question.question_status) {
        questionStatus = question.question_status;
      }

      if (statusCounts.hasOwnProperty(questionStatus)) {
        statusCounts[questionStatus]++;
      } else {
        statusCounts['Not Answered']++;
      }
    });

    // Process Risk Assessment Data
    const controlAssessmentCounts = {};
    const riskRatingCounts = {};
    const riskCategoryCounts = {};
    const impactAssessmentCounts = {};
    const mitigationTasksCounts = {};
    const riskSeverityCounts = {};

    risks.forEach((risk, index) => {
      // Debug logging for first few risks
      if (index < 3) {
        console.log(`Risk ${index + 1} structure:`, {
          ra_control_assessment: risk.ra_control_assessment,
          ra_risk_assessment: risk.ra_risk_assessment,
          ra_impact_assessment: risk.ra_impact_assessment,
          ra_mitigation_task: risk.ra_mitigation_task,
          fullRisk: risk
        });
      }

      // Process Control Assessment
      if (risk.ra_control_assessment) {
        const description = risk.ra_control_assessment.description || 'No Description';
        const rating = risk.ra_control_assessment.rating;

        controlAssessmentCounts[description] = (controlAssessmentCounts[description] || 0) + 1;

        if (rating) {
          const ratingLabel = `Rating: ${rating}`;
          controlAssessmentCounts[ratingLabel] = (controlAssessmentCounts[ratingLabel] || 0) + 1;
        }
      }

      // Process Risk Assessment
      if (risk.ra_risk_assessment) {
        const riskRating = risk.ra_risk_assessment.risk_rating;
        const riskCategory = risk.ra_risk_assessment.risk_category || 'Not Categorized';

        // Group risk ratings into ranges
        if (riskRating && !isNaN(riskRating)) {
          const rating = parseInt(riskRating);
          let ratingRange;

          if (rating >= 1 && rating <= 20) {
            ratingRange = '1-20 (Low)';
          } else if (rating >= 21 && rating <= 40) {
            ratingRange = '21-40 (Medium)';
          } else if (rating >= 41 && rating <= 60) {
            ratingRange = '41-60 (High)';
          } else if (rating >= 61 && rating <= 80) {
            ratingRange = '61-80 (Very High)';
          } else if (rating >= 81 && rating <= 100) {
            ratingRange = '81-100 (Critical)';
          } else {
            ratingRange = 'Unknown Range';
          }

          riskRatingCounts[ratingRange] = (riskRatingCounts[ratingRange] || 0) + 1;
        }

        // Count risk categories
        riskCategoryCounts[riskCategory] = (riskCategoryCounts[riskCategory] || 0) + 1;
      }

      // Process Impact Assessment
      if (risk.ra_impact_assessment) {
        const impacts = [];
        const impactAssessment = risk.ra_impact_assessment;

        if (impactAssessment.impact_on_confidentiality === 'Y') impacts.push('Confidentiality');
        if (impactAssessment.impact_on_integrity === 'Y') impacts.push('Integrity');
        if (impactAssessment.impact_on_availability === 'Y') impacts.push('Availability');
        if (impactAssessment.breach_of_legal_obligation === 'Y') impacts.push('Legal Obligation');

        const impactKey = impacts.length > 0 ? impacts.join(' + ') : 'No Impact';
        impactAssessmentCounts[impactKey] = (impactAssessmentCounts[impactKey] || 0) + 1;

        // Process Risk Severity
        const consequence = impactAssessment.consequence_rating || 1;
        const likelihood = impactAssessment.likelihood_rating || 1;
        const severityProduct = consequence * likelihood;

        let severityLevel;
        if (severityProduct <= 4) {
          severityLevel = 'Low Severity (1-4)';
        } else if (severityProduct <= 9) {
          severityLevel = 'Medium Severity (5-9)';
        } else if (severityProduct <= 16) {
          severityLevel = 'High Severity (10-16)';
        } else {
          severityLevel = 'Critical Severity (17-25)';
        }

        riskSeverityCounts[severityLevel] = (riskSeverityCounts[severityLevel] || 0) + 1;
      }

      // Process Mitigation Tasks
      if (risk.ra_mitigation_task) {
        const task = risk.ra_mitigation_task;
        let taskStatus = 'Not Started';

        if (task.is_ongoing === 'Y') {
          taskStatus = 'Ongoing';
        } else if (task.planned_completion_date && new Date(task.planned_completion_date) < new Date()) {
          taskStatus = 'Completed';
        }

        if (task.is_recurrent === 'Y') {
          mitigationTasksCounts['Recurrent'] = (mitigationTasksCounts['Recurrent'] || 0) + 1;
        } else {
          mitigationTasksCounts[taskStatus] = (mitigationTasksCounts[taskStatus] || 0) + 1;
        }
      }
    });

    // Process ASIS Controls Data
    const asisControlStatusCounts = {};
    const asisControlPropertyCounts = {};
    const asisControlThemeCounts = {};
    const asisControlTypeCounts = {};

    asisControls.forEach((control, index) => {
      // Debug logging for first few controls
      if (index < 3) {
        console.log(`ASIS Control ${index + 1} structure:`, {
          control_property: control.control_property,
          control_theme: control.control_theme,
          control_type: control.control_type,
          preventive: control.control_type?.preventive,
          detective: control.control_type?.detective,
          corrective: control.control_type?.corrective,
          fullControl: control
        });
        console.log('All available keys in control:', Object.keys(control));
      }

      // Process Control Property
      if (control.control_property) {
        const property = control.control_property.name || control.control_property || 'Unknown Property';
        asisControlPropertyCounts[property] = (asisControlPropertyCounts[property] || 0) + 1;
      }

      // Process Control Theme
      if (control.control_theme) {
        const theme = control.control_theme.name || control.control_theme || 'Unknown Theme';
        asisControlThemeCounts[theme] = (asisControlThemeCounts[theme] || 0) + 1;
      }

      // Process Control Type (Preventive, Detective, Corrective)
      if (control.control_type?.preventive === 'Y' || control.control_type?.preventive === true) {
        asisControlTypeCounts['Preventive'] = (asisControlTypeCounts['Preventive'] || 0) + 1;
      }
      if (control.control_type?.detective === 'Y' || control.control_type?.detective === true) {
        asisControlTypeCounts['Detective'] = (asisControlTypeCounts['Detective'] || 0) + 1;
      }
      if (control.control_type?.corrective === 'Y' || control.control_type?.corrective === true) {
        asisControlTypeCounts['Corrective'] = (asisControlTypeCounts['Corrective'] || 0) + 1;
      }

      // Debug detective values specifically
      if (index < 10) { // Check first 10 controls
        console.log(`Control ${index + 1} - Detective value:`, control.control_type?.detective, 'Type:', typeof control.control_type?.detective);
        console.log(`Control ${index + 1} - All control types:`, {
          preventive: control.control_type?.preventive,
          detective: control.control_type?.detective,
          corrective: control.control_type?.corrective
        });
      }
    });

    console.log('=== ASIS Processing Results ===');
    console.log('Total ASIS controls processed:', asisControls.length);
    console.log('ASIS Control Type counts:', asisControlTypeCounts);
    console.log('Number of unique control types found:', Object.keys(asisControlTypeCounts).length);

    // Log all counts for debugging
    console.log('=== Data Processing Results ===');
    console.log('Status counts:', statusCounts);
    console.log('Control Assessment counts:', controlAssessmentCounts);
    console.log('Risk Rating counts:', riskRatingCounts);
    console.log('Risk Category counts:', riskCategoryCounts);
    console.log('Impact Assessment counts:', impactAssessmentCounts);
    console.log('Mitigation Tasks counts:', mitigationTasksCounts);
    console.log('Risk Severity counts:', riskSeverityCounts);
    console.log('ASIS Control Status counts:', asisControlStatusCounts);
    console.log('ASIS Control Property counts:', asisControlPropertyCounts);
    console.log('ASIS Control Theme counts:', asisControlThemeCounts);
    console.log('ASIS Control Type counts:', asisControlTypeCounts);

    // Prepare chart data with proper filtering
    const prepareChartData = (counts, colors, label) => {
      const filteredEntries = Object.entries(counts).filter(([key, value]) => value > 0);
      return {
        labels: filteredEntries.map(([key]) => key),
        datasets: [{
          label,
          data: filteredEntries.map(([, value]) => value),
          backgroundColor: colors.slice(0, filteredEntries.length),
          borderWidth: 1,
        }]
      };
    };

    // Create all chart data sources
    const processedDataSources = {
      questionnaireStatus: prepareChartData(statusCounts, [
        '#ef4444', '#3b82f6', '#f59e0b', '#10b981', '#f97316', '#dc2626'
      ], 'Questions by Status'),

      controlAssessment: prepareChartData(controlAssessmentCounts, [
        '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#06b6d4'
      ], 'Control Assessment Distribution'),

      riskRating: prepareChartData(riskRatingCounts, [
        '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#dc2626'
      ], 'Risk Rating Distribution'),

      riskCategory: prepareChartData(riskCategoryCounts, [
        '#10b981', '#ef4444', '#f59e0b', '#dc2626'
      ], 'Risk Category Distribution'),

      impactAssessment: prepareChartData(impactAssessmentCounts, [
        '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'
      ], 'Impact Assessment Types'),

      mitigationTasks: prepareChartData(mitigationTasksCounts, [
        '#10b981', '#3b82f6', '#f59e0b', '#ef4444'
      ], 'Mitigation Tasks Status'),

      riskSeverity: prepareChartData(riskSeverityCounts, [
        '#10b981', '#3b82f6', '#f59e0b', '#ef4444'
      ], 'Risk Severity Levels'),

      asisControlProperty: prepareChartData(asisControlPropertyCounts, [
        '#8b5cf6', '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#06b6d4'
      ], 'ASIS Control Properties'),

      asisControlTheme: prepareChartData(asisControlThemeCounts, [
        '#06b6d4', '#8b5cf6', '#10b981', '#3b82f6', '#f59e0b', '#ef4444'
      ], 'ASIS Control Themes'),

      asisControlType: prepareChartData(asisControlTypeCounts, [
        '#10b981', '#3b82f6', '#f59e0b', '#ef4444'
      ], 'ASIS Control Type'),

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
            borderColor: '#10b981',
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
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.3,
          },
        ],
      },
    };

    console.log('Final processed data sources:', processedDataSources);
    setRealDataSources(processedDataSources);
  };

  // Chart type options
  const chartTypes = [
    { label: "Bar Chart", value: "bar", icon: <BarChart3 size={18} /> },
    { label: "Line Chart", value: "line", icon: <LineChart size={18} /> },
    { label: "Pie Chart", value: "pie", icon: <PieChart size={18} /> },
    { label: "Doughnut Chart", value: "doughnut", icon: <PieChart size={18} /> },
  ];

  // Page options
  const pageOptions = [
    { label: "Questionnaire", value: "questionnaire", icon: <FileText size={20} />, description: "Survey and questionnaire data" },
    { label: "MyReports", value: "myreports", icon: <TrendingUp size={20} />, description: "Risk assessment and analytics" },
    { label: "ASIS Reports", value: "asis", icon: <Shield size={20} />, description: "ASIS control reports and compliance" }
  ];

  // Data source options organized by page
  const dataSourcesByPage = {
    questionnaire: [
      { label: "Questionnaire Status", value: "questionnaireStatus", description: "Track completion status of questionnaires" }
    ],
    myreports: [
      { label: "Risk Rating Distribution", value: "riskRating", description: "Distribution of risk ratings across ranges" },
      { label: "Risk Category Analysis", value: "riskCategory", description: "Analysis of significant vs non-significant risks" },
      { label: "Mitigation Tasks Status", value: "mitigationTasks", description: "Status tracking of mitigation tasks" },
      { label: "Risk Severity Analysis", value: "riskSeverity", description: "Risk severity based on consequence and likelihood" }
    ],
    asis: [
      { label: "Control Property Distribution", value: "asisControlProperty", description: "Distribution of control properties" },
      { label: "Control Theme Analysis", value: "asisControlTheme", description: "Analysis of control themes" },
      { label: "Control Type Distribution", value: "asisControlType", description: "Distribution of Preventive, Detective, and Corrective controls" }
    ]
  };

  // Get current data sources based on selected page
  const getCurrentDataSources = () => {
    return dataSourcesByPage[selectedPage] || [];
  };

  // Handle page selection change
  const handlePageChange = (newPage) => {
    setSelectedPage(newPage);
    // Reset data source to first available option for the new page
    const availableDataSources = dataSourcesByPage[newPage] || [];
    if (availableDataSources.length > 0) {
      setDataSource(availableDataSources[0].value);
    }
  };

  // Reset chart form
  const resetChartForm = () => {
    setChartTitle("");
    setSelectedPage("questionnaire");
    setDataSource("questionnaireStatus");
    setChartType("bar");
  };

  // Handle opening chart modal
  const handleOpenChartModal = () => {
    resetChartForm();
    setIsChartModalOpen(true);
  };

  // Handle closing chart modal
  const handleCloseChartModal = () => {
    resetChartForm();
    setIsChartModalOpen(false);
  };

  // Load dashboard and its charts from localStorage on component mount
  useEffect(() => {
    if (dashboardId) {
      const savedDashboards = localStorage.getItem('adminDashboards');
      if (savedDashboards) {
        const dashboards = JSON.parse(savedDashboards);
        const dashboard = dashboards.find(d => d.id === parseInt(dashboardId));
        if (dashboard) {
          setCurrentDashboard(dashboard);
          setCustomCharts(dashboard.charts || []);
        } else {
          message.error("Dashboard not found");
          navigate(-1);
        }
      } else {
        navigate(-1);
      }
    }
  }, [dashboardId, navigate]);

  // Fetch data on component mount
  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoadingData(true);
      try {
        // Fetch both questionnaire and risk data
        await fetchQuestionnaireData();
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchAllData();
  }, [projectid]);

  // Save charts to dashboard in localStorage whenever they change
  useEffect(() => {
    if (currentDashboard && dashboardId) {
      console.log('Saving charts to dashboard:', dashboardId);
      console.log('Current charts:', customCharts);
      const savedDashboards = localStorage.getItem('adminDashboards');
      if (savedDashboards) {
        const dashboards = JSON.parse(savedDashboards);
        console.log('Current dashboards in localStorage:', dashboards);
        const updatedDashboards = dashboards.map(dashboard =>
          dashboard.id === parseInt(dashboardId)
            ? { ...dashboard, charts: customCharts }
            : dashboard
        );
        console.log('Updated dashboards with charts:', updatedDashboards);
        localStorage.setItem('adminDashboards', JSON.stringify(updatedDashboards));
      }
    }
  }, [customCharts, currentDashboard, dashboardId]);

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
      page: selectedPage, // Store which page the data source is from
    };

    setCustomCharts([...customCharts, newChart]);
    handleCloseChartModal();
    message.success("Chart created successfully!");
  };

  // Function to remove a chart
  const handleRemoveChart = (chartId) => {
    const updatedCharts = customCharts.filter(chart => chart.id !== chartId);
    setCustomCharts(updatedCharts);
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
                  {currentDashboard?.name || "Dashboard"}
                </h1>
                {currentDashboard?.description && (
                  <p className="text-sm text-gray-600 mt-1">{currentDashboard.description}</p>
                )}
              </div>
              <span className="text-sm text-gray-500">
                {customCharts.length} chart{customCharts.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="h-0.5 bg-gradient-to-r from-blue-100 to-gray-100"></div>
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
                  onClick={handleOpenChartModal}
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
                    onClick={handleOpenChartModal}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Create Custom Chart</h2>
              <button
                onClick={handleCloseChartModal}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Chart Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Chart Title
                </label>
                <input
                  type="text"
                  value={chartTitle}
                  onChange={(e) => setChartTitle(e.target.value)}
                  placeholder="Enter a descriptive chart title"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Page Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Data Source
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {pageOptions.map((page) => (
                    <div
                      key={page.value}
                      onClick={() => handlePageChange(page.value)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${selectedPage === page.value
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${selectedPage === page.value ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                          }`}>
                          {page.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className={`font-semibold ${selectedPage === page.value ? 'text-blue-900' : 'text-gray-900'
                            }`}>
                            {page.label}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">{page.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chart Type Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Chart Type
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {chartTypes.map((type) => (
                    <div
                      key={type.value}
                      onClick={() => setChartType(type.value)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md text-center ${chartType === type.value
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <div className={`flex justify-center mb-2 ${chartType === type.value ? 'text-blue-600' : 'text-gray-600'
                        }`}>
                        {type.icon}
                      </div>
                      <p className={`text-sm font-medium ${chartType === type.value ? 'text-blue-900' : 'text-gray-900'
                        }`}>
                        {type.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data Source Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Data Source Column
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {getCurrentDataSources().map((source) => (
                    <div
                      key={source.value}
                      onClick={() => setDataSource(source.value)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${dataSource === source.value
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${dataSource === source.value ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                          }`}>
                          <BarChart3 size={20} />
                        </div>
                        <div className="flex-1">
                          <h3 className={`font-semibold ${dataSource === source.value ? 'text-blue-900' : 'text-gray-900'
                            }`}>
                            {source.label}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">{source.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preview of the selected chart */}
              {realDataSources[dataSource] && (
                <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Chart Preview</h3>
                  <div className="h-[200px] bg-white rounded-lg p-4">
                    {realDataSources[dataSource].labels && realDataSources[dataSource].labels.length > 0 ? (
                      <>
                        {chartType === 'bar' && <Bar data={realDataSources[dataSource]} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />}
                        {chartType === 'line' && <Line data={realDataSources[dataSource]} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />}
                        {chartType === 'pie' && <Pie data={realDataSources[dataSource]} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />}
                        {chartType === 'doughnut' && <Doughnut data={realDataSources[dataSource]} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />}
                      </>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-gray-400 mb-3">
                            <BarChart3 size={32} />
                          </div>
                          <p className="text-lg font-medium text-gray-500 mb-2">No data available</p>
                          <p className="text-sm text-gray-400">
                            {dataSource === "questionnaireStatus" && "No questionnaire status data found"}
                            {dataSource === "riskRating" && "No risk rating data found"}
                            {dataSource === "riskCategory" && "No risk category data found"}
                            {dataSource === "mitigationTasks" && "No mitigation tasks data found"}
                            {dataSource === "riskSeverity" && "No risk severity data found"}
                            {dataSource === "asisControlProperty" && "No ASIS control property data found"}
                            {dataSource === "asisControlTheme" && "No ASIS control theme data found"}
                            {dataSource === "asisControlType" && "No ASIS control type data found"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  onClick={handleCloseChartModal}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateChart}
                  disabled={!realDataSources[dataSource] || !chartTitle.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
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












