import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Typography
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
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  NodeTypes,
  EdgeTypes,
  ReactFlowProvider,
  ReactFlowInstance,
  Handle,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useTheme } from '../../../contexts/ThemeContext';
import { apiRequest } from '../../../utils/api';
import { AuthContext } from '../../../AuthContext';
import { ProjectContext } from '../../../Context/ProjectContext';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

// Custom Node Components for Dashboard Elements
const ChartNode = ({ data, selected }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className={`chart-node ${selected ? 'selected' : ''} ${isDarkMode ? 'dark' : ''}`}>
      <Handle type="target" position={Position.Top} />
      <div className="chart-header">
        <div className="chart-icon">
          {data.chartType === 'bar' && <BarChartOutlined />}
          {data.chartType === 'line' && <LineChartOutlined />}
          {data.chartType === 'pie' && <PieChartOutlined />}
          {data.chartType === 'table' && <TableOutlined />}
        </div>
        <div className="chart-title">{data.title}</div>
      </div>
      <div className="chart-preview">
        {data.preview && (
          <div className="preview-content">
            {data.chartType === 'table' ? (
              <div className="table-preview">
                <div className="table-row">
                  <div className="table-cell">Sample Data</div>
                  <div className="table-cell">Value</div>
                </div>
                <div className="table-row">
                  <div className="table-cell">Item 1</div>
                  <div className="table-cell">100</div>
                </div>
              </div>
            ) : (
              <div className="chart-placeholder">
                <div className="chart-bars">
                  <div className="bar" style={{ height: '60%' }}></div>
                  <div className="bar" style={{ height: '80%' }}></div>
                  <div className="bar" style={{ height: '40%' }}></div>
                  <div className="bar" style={{ height: '90%' }}></div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

const DataSourceNode = ({ data, selected }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className={`data-source-node ${selected ? 'selected' : ''} ${isDarkMode ? 'dark' : ''}`}>
      <Handle type="source" position={Position.Right} />
      <div className="data-source-header">
        <DatabaseOutlined className="data-source-icon" />
        <div className="data-source-title">{data.title}</div>
      </div>
      <div className="data-source-info">
        <Text type="secondary">{data.sourceType}</Text>
        <div className="data-status">
          <Badge status={data.connected ? 'success' : 'error'} />
          <Text type="secondary">{data.connected ? 'Connected' : 'Disconnected'}</Text>
        </div>
      </div>
    </div>
  );
};

const FilterNode = ({ data, selected }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className={`filter-node ${selected ? 'selected' : ''} ${isDarkMode ? 'dark' : ''}`}>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
      <div className="filter-header">
        <FilterOutlined className="filter-icon" />
        <div className="filter-title">{data.title}</div>
      </div>
      <div className="filter-content">
        <Text type="secondary">{data.filterType}</Text>
        <div className="filter-preview">
          {data.conditions?.map((condition, index) => (
            <div key={index} className="condition-tag">
              {condition.field} {condition.operator} {condition.value}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Node Types
const nodeTypes = {
  chart: ChartNode,
  dataSource: DataSourceNode,
  filter: FilterNode,
};

// Main Dashboard Component
const AdvancedDashboard = () => {
  const { isDarkMode } = useTheme();
  const { user } = React.useContext(AuthContext);
  const { project } = React.useContext(ProjectContext);
  
  // State Management
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Dashboard Management
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

  // React Flow Handlers
  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge(params, eds));
  }, [setEdges]);

  const onNodeClick = (event, node) => {
    setSelectedNode(node);
  };

  const onPaneClick = () => {
    setSelectedNode(null);
  };

  // Dashboard Management
  const createDashboard = async () => {
    try {
      const response = await apiRequest('POST', `/api/project/${project.id}/dashboards/`, {
        name: dashboardName,
        description: dashboardDescription,
        layout: { nodes, edges }
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
        layout: { nodes, edges }
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

  // Add Node Functions
  const addChartNode = (chartType) => {
    const newNode = {
      id: `chart-${Date.now()}`,
      type: 'chart',
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: {
        title: `New ${chartType} Chart`,
        chartType,
        preview: true,
        config: {}
      }
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const addDataSourceNode = (source) => {
    const newNode = {
      id: `source-${Date.now()}`,
      type: 'dataSource',
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: {
        title: source.name,
        sourceType: source.type,
        connected: source.connected,
        sourceId: source.id
      }
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const addFilterNode = () => {
    const newNode = {
      id: `filter-${Date.now()}`,
      type: 'filter',
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: {
        title: 'Data Filter',
        filterType: 'Custom Filter',
        conditions: []
      }
    };
    setNodes((nds) => [...nds, newNode]);
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
          icon={<FullscreenOutlined />}
          onClick={() => setIsFullscreen(!isFullscreen)}
        >
          {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </Button>
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
            onClick={() => addDataSourceNode(source)}
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
            <Card hoverable onClick={() => addChartNode('bar')}>
              <BarChartOutlined className="chart-icon" />
              <Title level={5}>Bar Chart</Title>
              <Text type="secondary">Compare values across categories</Text>
            </Card>
          </Col>
          <Col span={12}>
            <Card hoverable onClick={() => addChartNode('line')}>
              <LineChartOutlined className="chart-icon" />
              <Title level={5}>Line Chart</Title>
              <Text type="secondary">Show trends over time</Text>
            </Card>
          </Col>
          <Col span={12}>
            <Card hoverable onClick={() => addChartNode('pie')}>
              <PieChartOutlined className="chart-icon" />
              <Title level={5}>Pie Chart</Title>
              <Text type="secondary">Show proportions</Text>
            </Card>
          </Col>
          <Col span={12}>
            <Card hoverable onClick={() => addChartNode('table')}>
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
                    onClick={() => {
                      addChartNode(suggestion.chartType);
                      setShowAIPanel(false);
                    }}
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
    <div className={`advanced-dashboard ${isDarkMode ? 'dark' : ''} ${isFullscreen ? 'fullscreen' : ''}`}>
      <Toolbar />
      
      <div className="dashboard-content">
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            onInit={setReactFlowInstance}
            fitView
            attributionPosition="bottom-left"
          >
            <Controls />
            <MiniMap />
            <Background variant="dots" gap={12} size={1} />
          </ReactFlow>
        </ReactFlowProvider>
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
          {/* Template cards will be implemented */}
        </div>
      </Modal>

      <style jsx>{`
        .advanced-dashboard {
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
          position: relative;
        }

        .chart-node {
          background: ${isDarkMode ? '#2a2a2a' : '#fff'};
          border: 2px solid ${isDarkMode ? '#444' : '#d9d9d9'};
          border-radius: 8px;
          padding: 12px;
          min-width: 200px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .chart-node.selected {
          border-color: #1890ff;
        }

        .chart-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .chart-icon {
          font-size: 16px;
          color: #1890ff;
        }

        .chart-title {
          font-weight: 500;
          color: ${isDarkMode ? '#fff' : '#000'};
        }

        .chart-preview {
          height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .chart-bars {
          display: flex;
          gap: 4px;
          align-items: end;
          height: 60px;
        }

        .bar {
          width: 12px;
          background: #1890ff;
          border-radius: 2px;
        }

        .data-source-node {
          background: ${isDarkMode ? '#2a2a2a' : '#fff'};
          border: 2px solid ${isDarkMode ? '#444' : '#d9d9d9'};
          border-radius: 8px;
          padding: 12px;
          min-width: 180px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .data-source-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .data-source-icon {
          font-size: 16px;
          color: #52c41a;
        }

        .data-source-title {
          font-weight: 500;
          color: ${isDarkMode ? '#fff' : '#000'};
        }

        .data-source-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .data-status {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .filter-node {
          background: ${isDarkMode ? '#2a2a2a' : '#fff'};
          border: 2px solid ${isDarkMode ? '#444' : '#d9d9d9'};
          border-radius: 8px;
          padding: 12px;
          min-width: 160px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .filter-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .filter-icon {
          font-size: 16px;
          color: #fa8c16;
        }

        .filter-title {
          font-weight: 500;
          color: ${isDarkMode ? '#fff' : '#000'};
        }

        .condition-tag {
          background: #f0f0f0;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 12px;
          margin: 2px;
          display: inline-block;
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

        .fullscreen {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1000;
        }
      `}</style>
    </div>
  );
};

export default AdvancedDashboard;
