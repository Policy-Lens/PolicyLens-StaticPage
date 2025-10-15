import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Select, 
  Input, 
  Modal, 
  Tabs, 
  message, 
  Space, 
  Tooltip,
  Dropdown,
  Menu,
  Switch,
  Slider,
  ColorPicker,
  Divider,
  Badge,
  Progress,
  Spin,
  Alert,
  Row,
  Col,
  Typography,
  Grid
} from 'antd';
import {
  PlusOutlined,
  SaveOutlined,
  ShareAltOutlined,
  SettingOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  DownloadOutlined,
  UploadOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  TableOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  RobotOutlined,
  NodeIndexOutlined,
  DragOutlined,
  FullscreenOutlined,
  ReloadOutlined,
  FilterOutlined,
  SearchOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import { useTheme } from '../../../contexts/ThemeContext';
import { apiRequest } from '../../../utils/api';
import { AuthContext } from '../../../AuthContext';
import { ProjectContext } from '../../../Context/ProjectContext';
import SimpleChart from './SimpleChart';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

// Simple Dashboard Component without React Flow
const SimpleDashboard = () => {
  const { isDarkMode } = useTheme();
  const { user } = React.useContext(AuthContext);
  const { project } = React.useContext(ProjectContext);
  
  // State Management
  const [dashboards, setDashboards] = useState([]);
  const [currentDashboard, setCurrentDashboard] = useState(null);
  const [isCreatingDashboard, setIsCreatingDashboard] = useState(false);
  const [dashboardName, setDashboardName] = useState('');
  const [dashboardDescription, setDashboardDescription] = useState('');
  
  // Data Sources
  const [dataSources, setDataSources] = useState([]);
  const [availableDataSources, setAvailableDataSources] = useState([]);
  
  // AI Features
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  
  // UI State
  const [showDataSourcePanel, setShowDataSourcePanel] = useState(false);
  const [showChartLibrary, setShowChartLibrary] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  
  // Load initial data
  useEffect(() => {
    loadDashboards();
    loadDataSources();
    loadTemplates();
  }, [project]);

  const loadDashboards = async () => {
    try {
      const response = await apiRequest('GET', `/api/project/${project.id}/dashboards/`, null, true);
      if (response.data) {
        setDashboards(response.data);
      }
    } catch (error) {
      console.error('Failed to load dashboards:', error);
    }
  };

  const loadDataSources = async () => {
    try {
      const response = await apiRequest('GET', `/api/project/${project.id}/data-sources/`, null, true);
      if (response.data) {
        // Ensure we always set an array
        const data = Array.isArray(response.data) ? response.data : [];
        setAvailableDataSources(data);
      } else {
        setAvailableDataSources([]);
      }
    } catch (error) {
      console.error('Failed to load data sources:', error);
      setAvailableDataSources([]);
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await apiRequest('GET', '/api/project/dashboard-templates/', null, true);
      if (response.data) {
        // Handle templates
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  // Dashboard Management
  const createDashboard = async () => {
    try {
      const response = await apiRequest('POST', `/api/project/${project.id}/dashboards/`, {
        name: dashboardName,
        description: dashboardDescription,
        layout: { nodes: [], edges: [] }
      }, true);
      
      if (response.data) {
        setDashboards([...dashboards, response.data]);
        setCurrentDashboard(response.data);
        setIsCreatingDashboard(false);
        setDashboardName('');
        setDashboardDescription('');
        message.success('Dashboard created successfully!');
      }
    } catch (error) {
      message.error('Failed to create dashboard');
      console.error('Create dashboard error:', error);
    }
  };

  const saveDashboard = async () => {
    if (!currentDashboard) return;
    
    try {
      await apiRequest('PUT', `/api/project/${project.id}/dashboards/${currentDashboard.id}/`, {
        layout: { nodes: [], edges: [] }
      }, true);
      message.success('Dashboard saved successfully!');
    } catch (error) {
      message.error('Failed to save dashboard');
      console.error('Save dashboard error:', error);
    }
  };

  // AI Analysis
  const analyzeData = async () => {
    setIsAnalyzing(true);
    try {
      const response = await apiRequest('POST', `/api/project/${project.id}/ai-analysis/`, {
        data_sources: dataSources,
        analysis_type: 'chart_recommendation'
      }, true);
      
      if (response.data) {
        setAiAnalysis(response.data);
        setAiSuggestions(response.data.suggestions || []);
        setShowAIPanel(true);
      }
    } catch (error) {
      message.error('Failed to analyze data');
      console.error('AI analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Sample data for demonstration
  const sampleData = {
    bar: [
      { label: 'Q1', value: 100, color: '#1890ff' },
      { label: 'Q2', value: 150, color: '#52c41a' },
      { label: 'Q3', value: 120, color: '#fa8c16' },
      { label: 'Q4', value: 180, color: '#f5222d' }
    ],
    line: [
      { label: 'Jan', value: 100 },
      { label: 'Feb', value: 120 },
      { label: 'Mar', value: 110 },
      { label: 'Apr', value: 140 },
      { label: 'May', value: 160 },
      { label: 'Jun', value: 150 }
    ],
    pie: [
      { label: 'Desktop', value: 45, color: '#1890ff' },
      { label: 'Mobile', value: 35, color: '#52c41a' },
      { label: 'Tablet', value: 20, color: '#fa8c16' }
    ],
    table: [
      { name: 'John Doe', age: 30, department: 'Engineering', salary: 75000 },
      { name: 'Jane Smith', age: 28, department: 'Marketing', salary: 65000 },
      { name: 'Bob Johnson', age: 35, department: 'Sales', salary: 80000 },
      { name: 'Alice Brown', age: 32, department: 'HR', salary: 70000 }
    ],
    gauge: { value: 75, max: 100, label: 'Progress' }
  };

  // Toolbar Component
  const Toolbar = () => (
    <div className={`dashboard-toolbar ${isDarkMode ? 'dark' : ''}`}>
      <div className="toolbar-section">
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => setIsCreatingDashboard(true)}
        >
          New Dashboard
        </Button>
        <Button 
          icon={<SaveOutlined />}
          onClick={saveDashboard}
          disabled={!currentDashboard}
        >
          Save
        </Button>
        <Button 
          icon={<ShareAltOutlined />}
          onClick={() => setShowTemplates(true)}
        >
          Templates
        </Button>
      </div>
      
      <div className="toolbar-section">
        <Button 
          icon={<DatabaseOutlined />}
          onClick={() => setShowDataSourcePanel(true)}
        >
          Data Sources
        </Button>
        <Button 
          icon={<BarChartOutlined />}
          onClick={() => setShowChartLibrary(true)}
        >
          Charts
        </Button>
        <Button 
          icon={<RobotOutlined />}
          onClick={analyzeData}
          loading={isAnalyzing}
        >
          AI Analysis
        </Button>
      </div>
      
      <div className="toolbar-section">
        <Button 
          icon={<ReloadOutlined />}
          onClick={() => window.location.reload()}
        >
          Refresh
        </Button>
      </div>
    </div>
  );

  // Data Source Panel
  const DataSourcePanel = () => (
    <Modal
      title="Data Sources"
      open={showDataSourcePanel}
      onCancel={() => setShowDataSourcePanel(false)}
      width={800}
      footer={null}
    >
      <div className="data-sources-grid">
        {(availableDataSources || []).map((source) => (
          <Card
            key={source.id}
            hoverable
            className="data-source-card"
          >
            <div className="data-source-card-content">
              <DatabaseOutlined className="data-source-icon" />
              <div className="data-source-info">
                <Title level={5}>{source.name}</Title>
                <Text type="secondary">{source.description}</Text>
                <div className="data-source-meta">
                  <Badge status={source.connected ? 'success' : 'error'} />
                  <Text type="secondary">{source.recordCount} records</Text>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Modal>
  );

  // Chart Library Panel
  const ChartLibraryPanel = () => (
    <Modal
      title="Chart Library"
      open={showChartLibrary}
      onCancel={() => setShowChartLibrary(false)}
      width={600}
      footer={null}
    >
      <div className="chart-library">
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Card hoverable>
              <BarChartOutlined className="chart-icon" />
              <Title level={5}>Bar Chart</Title>
              <Text type="secondary">Compare values across categories</Text>
            </Card>
          </Col>
          <Col span={12}>
            <Card hoverable>
              <LineChartOutlined className="chart-icon" />
              <Title level={5}>Line Chart</Title>
              <Text type="secondary">Show trends over time</Text>
            </Card>
          </Col>
          <Col span={12}>
            <Card hoverable>
              <PieChartOutlined className="chart-icon" />
              <Title level={5}>Pie Chart</Title>
              <Text type="secondary">Show proportions</Text>
            </Card>
          </Col>
          <Col span={12}>
            <Card hoverable>
              <TableOutlined className="chart-icon" />
              <Title level={5}>Data Table</Title>
              <Text type="secondary">Display raw data</Text>
            </Card>
          </Col>
        </Row>
      </div>
    </Modal>
  );

  // AI Analysis Panel
  const AIAnalysisPanel = () => (
    <Modal
      title="AI Analysis & Recommendations"
      open={showAIPanel}
      onCancel={() => setShowAIPanel(false)}
      width={800}
      footer={null}
    >
      {aiAnalysis && (
        <div className="ai-analysis-content">
          <Alert
            message="AI Analysis Complete"
            description={aiAnalysis.summary}
            type="success"
            showIcon
          />
          
          <div className="ai-suggestions">
            <Title level={4}>Recommended Charts</Title>
            {(aiSuggestions || []).map((suggestion, index) => (
              <Card key={index} className="suggestion-card">
                <div className="suggestion-header">
                  <Title level={5}>{suggestion.chartType}</Title>
                  <Badge count={suggestion.confidence} />
                </div>
                <Text>{suggestion.reasoning}</Text>
                <div className="suggestion-actions">
                  <Button 
                    type="primary" 
                    size="small"
                  >
                    Add Chart
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );

  return (
    <div className={`simple-dashboard ${isDarkMode ? 'dark' : ''}`}>
      <Toolbar />
      
      <div className="dashboard-content">
        <div className="dashboard-canvas">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={8}>
              <SimpleChart 
                type="bar" 
                title="Quarterly Performance" 
                data={sampleData.bar} 
              />
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <SimpleChart 
                type="line" 
                title="Monthly Trends" 
                data={sampleData.line} 
              />
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <SimpleChart 
                type="pie" 
                title="Device Distribution" 
                data={sampleData.pie} 
              />
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <SimpleChart 
                type="gauge" 
                title="Project Progress" 
                data={sampleData.gauge} 
              />
            </Col>
            <Col xs={24} sm={12} lg={16}>
              <SimpleChart 
                type="table" 
                title="Employee Data" 
                data={sampleData.table} 
              />
            </Col>
          </Row>
        </div>
      </div>

      {/* Modals */}
      <DataSourcePanel />
      <ChartLibraryPanel />
      <AIAnalysisPanel />

      {/* Create Dashboard Modal */}
      <Modal
        title="Create New Dashboard"
        open={isCreatingDashboard}
        onOk={createDashboard}
        onCancel={() => setIsCreatingDashboard(false)}
      >
        <Input
          placeholder="Dashboard Name"
          value={dashboardName}
          onChange={(e) => setDashboardName(e.target.value)}
          style={{ marginBottom: 16 }}
        />
        <Input.TextArea
          placeholder="Description (optional)"
          value={dashboardDescription}
          onChange={(e) => setDashboardDescription(e.target.value)}
          rows={3}
        />
      </Modal>

      {/* Templates Modal */}
      <Modal
        title="Dashboard Templates"
        open={showTemplates}
        onCancel={() => setShowTemplates(false)}
        width={1000}
        footer={null}
      >
        <div className="templates-grid">
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Card hoverable>
                <Title level={4}>Executive Summary</Title>
                <Text>High-level overview with key metrics</Text>
              </Card>
            </Col>
            <Col span={8}>
              <Card hoverable>
                <Title level={4}>Compliance Dashboard</Title>
                <Text>Comprehensive compliance tracking</Text>
              </Card>
            </Col>
            <Col span={8}>
              <Card hoverable>
                <Title level={4}>Risk Management</Title>
                <Text>Risk assessment and mitigation</Text>
              </Card>
            </Col>
          </Row>
        </div>
      </Modal>

      <style jsx>{`
        .simple-dashboard {
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: ${isDarkMode ? '#1a1a1a' : '#f5f5f5'};
        }

        .dashboard-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: ${isDarkMode ? '#2a2a2a' : '#fff'};
          border-bottom: 1px solid ${isDarkMode ? '#333' : '#e8e8e8'};
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .toolbar-section {
          display: flex;
          gap: 8px;
        }

        .dashboard-content {
          flex: 1;
          padding: 24px;
        }

        .dashboard-canvas {
          height: 100%;
        }

        .canvas-card {
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .canvas-placeholder {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: ${isDarkMode ? '#2a2a2a' : '#f8f9fa'};
          border: 2px dashed ${isDarkMode ? '#555' : '#d9d9d9'};
          border-radius: 8px;
          margin-top: 24px;
        }

        .placeholder-icon {
          font-size: 48px;
          color: ${isDarkMode ? '#666' : '#999'};
          margin-bottom: 16px;
        }

        .data-sources-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 16px;
        }

        .data-source-card {
          cursor: pointer;
          transition: all 0.3s;
        }

        .data-source-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .data-source-card-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .data-source-icon {
          font-size: 24px;
          color: #1890ff;
        }

        .data-source-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 8px;
        }

        .chart-library {
          padding: 16px 0;
        }

        .chart-icon {
          font-size: 24px;
          color: #1890ff;
          margin-bottom: 8px;
        }

        .ai-analysis-content {
          padding: 16px 0;
        }

        .ai-suggestions {
          margin-top: 24px;
        }

        .suggestion-card {
          margin-bottom: 16px;
        }

        .suggestion-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .suggestion-actions {
          margin-top: 12px;
        }

        .templates-grid {
          padding: 16px 0;
        }

        .simple-chart {
          height: 100%;
        }

        .chart-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 200px;
          background: ${isDarkMode ? '#2a2a2a' : '#f8f9fa'};
          border: 1px dashed ${isDarkMode ? '#555' : '#d9d9d9'};
          border-radius: 4px;
        }

        .bar-chart {
          padding: 16px 0;
        }

        .bar-item {
          margin-bottom: 12px;
        }

        .bar-label {
          font-size: 12px;
          margin-bottom: 4px;
          color: ${isDarkMode ? '#ccc' : '#666'};
        }

        .bar-container {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .bar-fill {
          height: 20px;
          border-radius: 2px;
          transition: width 0.3s ease;
        }

        .bar-value {
          font-size: 12px;
          font-weight: 500;
          color: ${isDarkMode ? '#fff' : '#000'};
        }

        .line-chart {
          padding: 16px 0;
        }

        .line-chart-svg {
          margin-bottom: 16px;
        }

        .line-chart-labels {
          display: flex;
          justify-content: space-between;
        }

        .line-label {
          text-align: center;
        }

        .pie-chart {
          display: flex;
          align-items: center;
          gap: 24px;
          padding: 16px 0;
        }

        .pie-chart-svg {
          flex-shrink: 0;
        }

        .pie-chart-legend {
          flex: 1;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 2px;
        }

        .data-table {
          max-height: 300px;
          overflow-y: auto;
        }

        .gauge-chart {
          text-align: center;
          padding: 16px 0;
        }
      `}</style>
    </div>
  );
};

export default SimpleDashboard;
