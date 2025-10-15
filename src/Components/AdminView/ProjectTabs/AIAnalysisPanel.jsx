import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Modal,
  Row,
  Col,
  Typography,
  Progress,
  Tag,
  Space,
  Alert,
  Spin,
  Divider,
  Badge,
  Tooltip,
  Collapse,
  List,
  Statistic
} from 'antd';
import {
  RobotOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  TableOutlined,
  ThunderboltOutlined,
  BulbOutlined,
  EyeOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  TrendingUpOutlined,
  DatabaseOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { useTheme } from '../../../contexts/ThemeContext';
import { apiRequest } from '../../../utils/api';
import { AuthContext } from '../../../AuthContext';
import { ProjectContext } from '../../../Context/ProjectContext';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const AIAnalysisPanel = ({ visible, onClose, onChartRecommendation }) => {
  const { isDarkMode } = useTheme();
  const { user } = React.useContext(AuthContext);
  const { project } = React.useContext(ProjectContext);
  
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedSources, setSelectedSources] = useState([]);
  const [dataSources, setDataSources] = useState([]);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    if (visible) {
      loadDataSources();
    }
  }, [visible]);

  const loadDataSources = async () => {
    try {
      const response = await apiRequest('GET', `/api/project/${project.id}/data-sources/`, null, true);
      if (response.data && response.data.success) {
        setDataSources(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load data sources:', error);
    }
  };

  const performAnalysis = async () => {
    if (selectedSources.length === 0) {
      return;
    }

    setLoading(true);
    try {
      const response = await apiRequest('POST', `/api/project/${project.id}/ai-analysis/`, {
        source_ids: selectedSources,
        filters: filters,
        user_preferences: {
          preferred_chart_types: ['bar', 'line', 'pie', 'scatter'],
          complexity_level: 'medium'
        }
      }, true);

      if (response.data && response.data.success) {
        setAnalysis(response.data.data);
      }
    } catch (error) {
      console.error('AI analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getChartIcon = (chartType) => {
    const iconMap = {
      bar: <BarChartOutlined />,
      line: <LineChartOutlined />,
      pie: <PieChartOutlined />,
      table: <TableOutlined />,
      scatter: <BarChartOutlined />,
      heatmap: <BarChartOutlined />,
      radar: <BarChartOutlined />
    };
    return iconMap[chartType] || <BarChartOutlined />;
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'green';
    if (confidence >= 0.6) return 'orange';
    return 'red';
  };

  const getConfidenceText = (confidence) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  const handleApplyRecommendation = (recommendation) => {
    onChartRecommendation(recommendation);
    onClose();
  };

  const DataSourceSelector = () => (
    <Card title="Select Data Sources" className="data-source-selector">
      <Row gutter={[16, 16]}>
        {dataSources.map((source) => (
          <Col xs={24} sm={12} md={8} key={source.id}>
            <Card
              hoverable
              className={`source-card ${selectedSources.includes(source.id) ? 'selected' : ''}`}
              onClick={() => {
                if (selectedSources.includes(source.id)) {
                  setSelectedSources(selectedSources.filter(id => id !== source.id));
                } else {
                  setSelectedSources([...selectedSources, source.id]);
                }
              }}
            >
              <div className="source-header">
                <DatabaseOutlined className="source-icon" />
                <div className="source-info">
                  <Title level={5} className="source-name">{source.name}</Title>
                  <Text type="secondary">{source.description}</Text>
                </div>
              </div>
              <div className="source-stats">
                <Space>
                  <Badge status={source.connected ? 'success' : 'error'} />
                  <Text type="secondary">{source.record_count} records</Text>
                </Space>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
      
      <div className="analysis-actions">
        <Button
          type="primary"
          icon={<RobotOutlined />}
          onClick={performAnalysis}
          loading={loading}
          disabled={selectedSources.length === 0}
          size="large"
        >
          Analyze with AI
        </Button>
      </div>
    </Card>
  );

  const AnalysisResults = () => {
    if (!analysis) return null;

    return (
      <div className="analysis-results">
        <Card title="AI Analysis Results" className="analysis-card">
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
              <Card title="Data Pattern Analysis" size="small">
                <div className="pattern-info">
                  <Tag color="blue" icon={<InfoCircleOutlined />}>
                    {analysis.analysis.pattern.toUpperCase()}
                  </Tag>
                  <Paragraph>
                    The AI has identified your data as having a <strong>{analysis.analysis.pattern}</strong> pattern.
                  </Paragraph>
                </div>
                
                <div className="field-types">
                  <Title level={5}>Field Types</Title>
                  {Object.entries(analysis.analysis.field_types).map(([field, type]) => (
                    <Tag key={field} color="geekblue">
                      {field}: {type}
                    </Tag>
                  ))}
                </div>
              </Card>
            </Col>
            
            <Col xs={24} lg={12}>
              <Card title="Statistical Summary" size="small">
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Statistic
                      title="Total Records"
                      value={analysis.data_summary.total_records}
                      prefix={<DatabaseOutlined />}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Data Sources"
                      value={analysis.data_summary.sources.length}
                      prefix={<DatabaseOutlined />}
                    />
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
          
          <Divider />
          
          <div className="insights-section">
            <Title level={4}>Key Insights</Title>
            <List
              dataSource={analysis.analysis.insights}
              renderItem={(insight) => (
                <List.Item>
                  <BulbOutlined className="insight-icon" />
                  <Text>{insight}</Text>
                </List.Item>
              )}
            />
          </div>
          
          {analysis.analysis.trends.length > 0 && (
            <div className="trends-section">
              <Title level={4}>Trends Identified</Title>
              <List
                dataSource={analysis.analysis.trends}
                renderItem={(trend) => (
                  <List.Item>
                    <TrendingUpOutlined className="trend-icon" />
                    <Text>{trend}</Text>
                  </List.Item>
                )}
              />
            </div>
          )}
        </Card>
        
        <Card title="Chart Recommendations" className="recommendations-card">
          <Row gutter={[16, 16]}>
            {analysis.recommendations.map((rec, index) => (
              <Col xs={24} sm={12} lg={8} key={index}>
                <Card
                  hoverable
                  className="recommendation-card"
                  actions={[
                    <Button
                      key="preview"
                      icon={<EyeOutlined />}
                      size="small"
                    >
                      Preview
                    </Button>,
                    <Button
                      key="apply"
                      type="primary"
                      icon={<PlusOutlined />}
                      size="small"
                      onClick={() => handleApplyRecommendation(rec)}
                    >
                      Add Chart
                    </Button>
                  ]}
                >
                  <div className="recommendation-header">
                    <div className="chart-icon">
                      {getChartIcon(rec.chart_type)}
                    </div>
                    <div className="chart-info">
                      <Title level={5}>{rec.chart_type.toUpperCase()}</Title>
                      <Progress
                        percent={Math.round(rec.confidence * 100)}
                        size="small"
                        status={rec.confidence >= 0.8 ? 'success' : rec.confidence >= 0.6 ? 'normal' : 'exception'}
                      />
                    </div>
                  </div>
                  
                  <div className="confidence-badge">
                    <Badge
                      count={getConfidenceText(rec.confidence)}
                      style={{ backgroundColor: getConfidenceColor(rec.confidence) }}
                    />
                  </div>
                  
                  <Paragraph className="reasoning">
                    {rec.reasoning}
                  </Paragraph>
                  
                  <div className="use-cases">
                    <Text type="secondary">Use cases:</Text>
                    <div className="use-case-tags">
                      {rec.use_cases.slice(0, 2).map((useCase, idx) => (
                        <Tag key={idx} size="small">
                          {useCase}
                        </Tag>
                      ))}
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      </div>
    );
  };

  return (
    <Modal
      title={
        <Space>
          <RobotOutlined />
          AI Dashboard Analysis
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={1200}
      footer={null}
      className={`ai-analysis-modal ${isDarkMode ? 'dark' : ''}`}
    >
      <div className="ai-analysis-content">
        {!analysis ? (
          <DataSourceSelector />
        ) : (
          <AnalysisResults />
        )}
      </div>

      <style jsx>{`
        .ai-analysis-modal {
          .ant-modal-content {
            background: ${isDarkMode ? '#1a1a1a' : '#fff'};
          }
        }

        .ai-analysis-content {
          max-height: 80vh;
          overflow-y: auto;
        }

        .data-source-selector {
          margin-bottom: 24px;
        }

        .source-card {
          cursor: pointer;
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }

        .source-card.selected {
          border-color: #1890ff;
          background: ${isDarkMode ? '#2a2a2a' : '#f0f8ff'};
        }

        .source-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .source-header {
          display: flex;
          align-items: center;
          margin-bottom: 12px;
        }

        .source-icon {
          font-size: 24px;
          color: #1890ff;
          margin-right: 12px;
        }

        .source-info {
          flex: 1;
        }

        .source-name {
          margin: 0;
        }

        .source-stats {
          margin-top: 8px;
        }

        .analysis-actions {
          text-align: center;
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid ${isDarkMode ? '#333' : '#e8e8e8'};
        }

        .analysis-results {
          .analysis-card {
            margin-bottom: 24px;
          }

          .pattern-info {
            margin-bottom: 16px;
          }

          .field-types {
            margin-top: 16px;
          }

          .insights-section,
          .trends-section {
            margin-top: 24px;
          }

          .insight-icon,
          .trend-icon {
            color: #1890ff;
            margin-right: 8px;
          }
        }

        .recommendations-card {
          .recommendation-card {
            height: 100%;
            transition: all 0.3s ease;
          }

          .recommendation-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 24px rgba(0,0,0,0.15);
          }

          .recommendation-header {
            display: flex;
            align-items: center;
            margin-bottom: 12px;
          }

          .chart-icon {
            font-size: 24px;
            color: #1890ff;
            margin-right: 12px;
          }

          .chart-info {
            flex: 1;
          }

          .confidence-badge {
            position: absolute;
            top: 12px;
            right: 12px;
          }

          .reasoning {
            margin-bottom: 16px;
            color: ${isDarkMode ? '#ccc' : '#666'};
          }

          .use-cases {
            margin-top: 16px;
          }

          .use-case-tags {
            margin-top: 8px;
          }
        }
      `}</style>
    </Modal>
  );
};

export default AIAnalysisPanel;
