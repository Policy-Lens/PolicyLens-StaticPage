import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../AuthContext";
import {
  BarChart3,
  Home,
  FileText,
  Users,
  Settings,
  LogOut,
  Search,
  Sliders,
  ArrowUpRight,
  ArrowDownRight,
  Clipboard,
  DollarSign,
  Shield,
  AlertCircle,
  Filter,
} from "lucide-react";
import Sidebar from "./Sidebar";
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
  Filler,
} from "chart.js";
import { Doughnut, Bar, Pie, Line } from "react-chartjs-2";

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

const DashboardPage = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const { user, loading, checkLogin } = useContext(AuthContext);
  const navigate = useNavigate();

  console.log("Dashboard rendering");

  // useEffect(() => {
  //     // if (!loading && !user) {
  //     //     navigate("/"); // Redirect to login if not authenticated
  //     // }
  //     const verifyLogin = async () => {
  //         const isLoggedIn = await checkLogin();
  //         if (!isLoggedIn) {
  //             navigate("/"); // Redirect to the dashboard if logged in
  //         }
  //     };

  //     verifyLogin();
  // }, []);

  //   if (loading) return <p>Loading...</p>;

  // Metric Cards Data
  const metricCards = [
    {
      title: "Total Risks",
      value: "126",
      icon: <AlertCircle className="text-indigo-500" size={20} />,
      change: "+12%",
      trend: "up",
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-700",
    },
    {
      title: "High Priority",
      value: "38",
      icon: <Shield className="text-red-500" size={20} />,
      change: "+5%",
      trend: "up",
      bgColor: "bg-red-50",
      textColor: "text-red-700",
    },
    {
      title: "Compliance Score",
      value: "78.5%",
      icon: <Clipboard className="text-emerald-500" size={20} />,
      change: "+2.3%",
      trend: "up",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-700",
    },
    {
      title: "Risk Budget",
      value: "$45,250",
      icon: <DollarSign className="text-blue-500" size={20} />,
      change: "-8%",
      trend: "down",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
    },
    {
      title: "Pending Actions",
      value: "54",
      icon: <Clipboard className="text-amber-500" size={20} />,
      change: "-14%",
      trend: "down",
      bgColor: "bg-amber-50",
      textColor: "text-amber-700",
    },
  ];

  // Filter options
  const filterOptions = [
    { label: "All Risks", value: "all" },
    { label: "High Priority", value: "high" },
    { label: "Medium Priority", value: "medium" },
    { label: "Low Priority", value: "low" },
    { label: "Compliance Only", value: "compliance" },
  ];

  // Chart data for Risk by Categories donut chart
  const riskCategoriesData = {
    labels: [
      "Strategic",
      "Financial",
      "Reputational",
      "People",
      "Governance",
      "Legal",
      "Technical",
      "Competition",
    ],
    datasets: [
      {
        data: [3, 4, 6, 3, 8, 2, 1, 5],
        backgroundColor: [
          "#4f46e5", // Strategic - indigo
          "#0ea5e9", // Financial - sky
          "#06b6d4", // Reputational - cyan
          "#14b8a6", // People - teal
          "#10b981", // Governance - emerald
          "#84cc16", // Legal - lime
          "#8b5cf6", // Technical - violet
          "#6366f1", // Competition - indigo
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart data for Risks per Auditable Entity
  const risksPerEntityData = {
    labels: [
      "Finance",
      "People",
      "Marketing",
      "Tech",
      "Subsidiary 1",
      "Subsidiary 2",
    ],
    datasets: [
      {
        label: "Low",
        data: [4, 2, 3, 1, 4, 5],
        backgroundColor: "#10b981", // emerald
        stack: "Stack 0",
      },
      {
        label: "Medium",
        data: [3, 6, 2, 1, 5, 3],
        backgroundColor: "#f59e0b", // amber
        stack: "Stack 0",
      },
      {
        label: "High",
        data: [1, 0, 1, 2, 0, 2],
        backgroundColor: "#ef4444", // red
        stack: "Stack 0",
      },
    ],
  };

  // Chart options for Risks per Auditable Entity
  const entityChartOptions = {
    plugins: {
      title: {
        display: false,
      },
      legend: {
        position: "top",
      },
    },
    responsive: true,
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
        beginAtZero: true,
      },
    },
  };

  // Risk Assessment bar chart data
  const riskAssessmentData = {
    labels: [
      "Finance",
      "People",
      "Marketing",
      "Tech",
      "Subsidiary 1",
      "Subsidiary 2",
    ],
    datasets: [
      {
        label: "Ineffective",
        data: [1, 2, 0.5, 1, 5, 1],
        backgroundColor: "#ef4444", // Red
        barPercentage: 0.7,
        categoryPercentage: 0.9,
      },
      {
        label: "Partially Effective",
        data: [2, 3, 4, 2, 0, 3],
        backgroundColor: "#f59e0b", // Amber
        barPercentage: 0.7,
        categoryPercentage: 0.9,
      },
      {
        label: "Effective",
        data: [5, 3, 3, 1, 0, 5],
        backgroundColor: "#10b981", // Emerald
        barPercentage: 0.7,
        categoryPercentage: 0.9,
      },
    ],
  };

  // Options for Risk Assessment bar chart
  const riskAssessmentOptions = {
    indexAxis: "y",
    plugins: {
      legend: {
        position: "bottom",
      },
    },
    responsive: true,
    scales: {
      x: {
        stacked: true,
        max: 9,
      },
      y: {
        stacked: true,
      },
    },
  };

  // Compliance Trends Line Chart Data
  const trendLabels = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const complianceTrendsData = {
    labels: trendLabels,
    datasets: [
      {
        label: "Cybersecurity",
        data: [
          1800, 200, 1600, 300, 1900, 200, 1700, 300, 1800, 200, 1900, 1600,
        ],
        borderColor: "#4f46e5", // indigo
        backgroundColor: "rgba(79, 70, 229, 0.1)",
        fill: false,
        tension: 0.3,
        borderWidth: 3,
      },
      {
        label: "Data Privacy",
        data: [300, 180, 250, 120, 280, 150, 220, 100, 260, 180, 320, 220],
        borderColor: "#0ea5e9", // sky
        backgroundColor: "rgba(14, 165, 233, 0.1)",
        fill: false,
        tension: 0.3,
        borderWidth: 3,
      },
      {
        label: "Operational",
        data: [120, 100, 180, 90, 150, 90, 210, 120, 170, 90, 180, 150],
        borderColor: "#8b5cf6", // violet
        backgroundColor: "rgba(139, 92, 246, 0.1)",
        fill: false,
        tension: 0.3,
        borderWidth: 3,
      },
      {
        label: "Governance",
        data: [80, 120, 150, 100, 180, 120, 90, 80, 140, 110, 160, 120],
        borderColor: "#10b981", // emerald
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        fill: false,
        tension: 0.3,
        borderWidth: 3,
      },
    ],
  };

  const complianceTrendsOptions = {
    plugins: {
      tooltip: {
        mode: "index",
        intersect: false,
      },
      legend: {
        position: "top",
        labels: {
          boxWidth: 15,
          padding: 15,
          font: {
            size: 11,
          },
        },
      },
    },
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
  };

  // Create a custom gauge chart for Overall Risk Assessment
  const GaugeChart = () => {
    useEffect(() => {
      const canvas = document.getElementById("gauge-chart");
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      const centerX = canvas.width / 2;
      const centerY = canvas.height - 40;
      const radius = canvas.width / 2.5;

      // Draw the gauge arc
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw the gauge background
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, Math.PI, 0, false);
      ctx.lineWidth = 30;

      // Create gradient for gauge background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, "#10b981"); // Emerald
      gradient.addColorStop(0.5, "#f59e0b"); // Amber
      gradient.addColorStop(1, "#ef4444"); // Red

      ctx.strokeStyle = gradient;
      ctx.stroke();

      // Draw the needle
      const value = 0.65; // 65% - medium-high risk
      const angle = Math.PI * (1 - value);

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + radius * Math.cos(angle),
        centerY - radius * Math.sin(angle)
      );
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#4b5563";
      ctx.stroke();

      // Draw the center circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, 10, 0, 2 * Math.PI);
      ctx.fillStyle = "#4b5563";
      ctx.fill();
    }, []);

    return (
      <div className="flex flex-col items-center justify-center h-full">
        <canvas id="gauge-chart" width="260" height="180"></canvas>
        <div className="text-center mt-1 text-sm font-medium text-gray-700">
          Medium-High Risk
        </div>
      </div>
    );
  };

  // Risk Heat Map component
  const RiskHeatMap = () => {
    return (
      <div className="border border-gray-100 rounded-md bg-white overflow-hidden">
        <table className="w-full">
          <thead>
            <tr>
              <th className="border border-gray-100 p-2 bg-gray-50"></th>
              <th className="border border-gray-100 p-2 text-xs font-medium text-gray-600 bg-gray-50">
                Very Low
              </th>
              <th className="border border-gray-100 p-2 text-xs font-medium text-gray-600 bg-gray-50">
                Low
              </th>
              <th className="border border-gray-100 p-2 text-xs font-medium text-gray-600 bg-gray-50">
                Medium
              </th>
              <th className="border border-gray-100 p-2 text-xs font-medium text-gray-600 bg-gray-50">
                High
              </th>
              <th className="border border-gray-100 p-2 text-xs font-medium text-gray-600 bg-gray-50">
                Very High
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-100 p-2 text-xs font-medium text-gray-700">
                Very High
              </td>
              <td className="border border-gray-100 p-2 bg-green-100"></td>
              <td className="border border-gray-100 p-2 bg-yellow-100"></td>
              <td className="border border-gray-100 p-2 bg-red-500 text-white text-center font-medium">
                1
              </td>
              <td className="border border-gray-100 p-2 bg-red-600 text-white text-center font-medium">
                1
              </td>
              <td className="border border-gray-100 p-2 bg-red-700 text-white"></td>
            </tr>
            <tr>
              <td className="border border-gray-100 p-2 text-xs font-medium text-gray-700">
                High
              </td>
              <td className="border border-gray-100 p-2 bg-green-200"></td>
              <td className="border border-gray-100 p-2 bg-yellow-200"></td>
              <td className="border border-gray-100 p-2 bg-orange-300"></td>
              <td className="border border-gray-100 p-2 bg-red-500 text-white text-center font-medium">
                2
              </td>
              <td className="border border-gray-100 p-2 bg-red-600 text-white"></td>
            </tr>
            <tr>
              <td className="border border-gray-100 p-2 text-xs font-medium text-gray-700">
                Medium
              </td>
              <td className="border border-gray-100 p-2 bg-green-400"></td>
              <td className="border border-gray-100 p-2 bg-green-300"></td>
              <td className="border border-gray-100 p-2 bg-yellow-300 text-center font-medium">
                6
              </td>
              <td className="border border-gray-100 p-2 bg-orange-400"></td>
              <td className="border border-gray-100 p-2 bg-red-500 text-white"></td>
            </tr>
            <tr>
              <td className="border border-gray-100 p-2 text-xs font-medium text-gray-700">
                Low
              </td>
              <td className="border border-gray-100 p-2 bg-green-500 text-white text-center font-medium">
                5
              </td>
              <td className="border border-gray-100 p-2 bg-green-400"></td>
              <td className="border border-gray-100 p-2 bg-green-300"></td>
              <td className="border border-gray-100 p-2 bg-yellow-300"></td>
              <td className="border border-gray-100 p-2 bg-orange-400"></td>
            </tr>
            <tr>
              <td className="border border-gray-100 p-2 text-xs font-medium text-gray-700">
                Very Low
              </td>
              <td className="border border-gray-100 p-2 bg-green-600 text-white text-center font-medium">
                3
              </td>
              <td className="border border-gray-100 p-2 bg-green-500 text-white"></td>
              <td className="border border-gray-100 p-2 bg-green-400"></td>
              <td className="border border-gray-100 p-2 bg-green-300"></td>
              <td className="border border-gray-100 p-2 bg-yellow-200"></td>
            </tr>
          </tbody>
        </table>
        <div className="text-center mt-2 mb-1 text-xs font-medium text-gray-500">
          Impact
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header section - simplified */}
        <div className="flex flex-col mb-6">
          <div className="flex items-baseline">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <span className="ml-3 text-blue-600 text-sm">Audit Committee</span>
            <span className="ml-auto text-sm text-gray-500">
              As at {new Date().toLocaleDateString()}
            </span>
          </div>
          <div className="mt-4 h-0.5 bg-gradient-to-r from-blue-100 to-gray-100"></div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="relative w-full md:w-1/3">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search risks, entities or categories..."
              className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setActiveFilter(option.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  activeFilter === option.value
                    ? "bg-blue-100 text-blue-700 border border-blue-200"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {option.value === "all" && <Filter size={14} />}
                {option.value === "high" && (
                  <AlertCircle size={14} className="text-red-500" />
                )}
                {option.value === "medium" && (
                  <AlertCircle size={14} className="text-yellow-500" />
                )}
                {option.value === "low" && (
                  <AlertCircle size={14} className="text-green-500" />
                )}
                {option.value === "compliance" && (
                  <Shield size={14} className="text-blue-500" />
                )}
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {metricCards.map((card, index) => (
            <div
              key={index}
              className={`${card.bgColor} rounded-xl p-4 transition-all hover:shadow-md border border-gray-100`}
            >
              <div className="flex justify-between items-start">
                <div className="p-2 rounded-lg bg-white shadow-sm">
                  {card.icon}
                </div>
                <div
                  className={`flex items-center text-xs font-semibold ${
                    card.trend === "up" ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  {card.trend === "up" ? (
                    <ArrowUpRight size={14} className="mr-1" />
                  ) : (
                    <ArrowDownRight size={14} className="mr-1" />
                  )}
                  {card.change}
                </div>
              </div>
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-500">
                  {card.title}
                </p>
                <h3 className={`text-2xl font-bold mt-1 ${card.textColor}`}>
                  {card.value}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {/* First row - top stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
          <div className="bg-white p-5 rounded-lg hover:shadow-sm transition-shadow duration-200 border border-gray-100">
            <h2 className="text-base font-medium text-blue-600 mb-4 pb-2 border-b border-gray-100">
              Overall Risk
            </h2>
            <GaugeChart />
          </div>

          <div className="bg-white p-5 rounded-lg hover:shadow-sm transition-shadow duration-200 border border-gray-100">
            <h2 className="text-base font-medium text-blue-600 mb-4 pb-2 border-b border-gray-100">
              Risks by Entity
            </h2>
            <div className="h-[250px]">
              <Bar data={risksPerEntityData} options={entityChartOptions} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg hover:shadow-sm transition-shadow duration-200 border border-gray-100">
            <h2 className="text-base font-medium text-blue-600 mb-4 pb-2 border-b border-gray-100">
              Risk Categories
            </h2>
            <div className="h-[250px] flex justify-center">
              <Doughnut
                data={riskCategoriesData}
                options={{
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "right",
                      align: "start",
                      labels: {
                        boxWidth: 15,
                        padding: 15,
                        font: {
                          size: 11,
                        },
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Middle row - Compliance Trends - Left-aligned */}
        <div className="mb-5 ml-0 mr-auto" style={{ width: "90%" }}>
          <div className="bg-white p-5 rounded-lg hover:shadow-sm transition-shadow duration-200 border border-gray-100">
            <h2 className="text-base font-medium text-blue-600 mb-4 pb-2 border-b border-gray-100">
              Risk Compliance Trends (Last 12 Months)
            </h2>
            <div className="h-[350px] w-full">
              <Line
                data={complianceTrendsData}
                options={{
                  ...complianceTrendsOptions,
                  maintainAspectRatio: false,
                  responsive: true,
                  layout: {
                    padding: {
                      left: 10,
                      right: 20,
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Last row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white p-5 rounded-lg hover:shadow-sm transition-shadow duration-200 border border-gray-100">
            <h2 className="text-base font-medium text-blue-600 mb-4 pb-2 border-b border-gray-100">
              Risk Assessment
            </h2>
            <div className="h-[300px]">
              <Bar data={riskAssessmentData} options={riskAssessmentOptions} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg hover:shadow-sm transition-shadow duration-200 border border-gray-100">
            <h2 className="text-base font-medium text-blue-600 mb-4 pb-2 border-b border-gray-100">
              Risk Heat Map
            </h2>
            <div className="h-[300px] flex items-center justify-center">
              <RiskHeatMap />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
