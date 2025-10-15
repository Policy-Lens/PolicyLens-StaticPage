import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Modal,
  Row,
  Col,
  Typography,
  Tag,
  Badge,
  Space,
  Divider,
  Alert,
  Spin,
  Input,
  message
} from 'antd';
import {
  DashboardOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  TableOutlined,
  DashboardFilled,
  AppstoreOutlined,
  DotChartOutlined,
  FundOutlined,
  ClusterOutlined,
  EyeOutlined,
  PlusOutlined,
  StarOutlined,
  ThunderboltOutlined,
  DatabaseOutlined
} from '@ant-design/icons';
import { useTheme } from '../../../contexts/ThemeContext';
import { apiRequest } from '../../../utils/api';
import { AuthContext } from '../../../AuthContext';
import { ProjectContext } from '../../../Context/ProjectContext';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

const DashboardTemplates = ({ onTemplateSelect, onClose }) => {
  const { isDarkMode } = useTheme();
  const { user } = React.useContext(AuthContext);
  const { project } = React.useContext(ProjectContext);
  
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const response = await apiRequest('GET', '/api/project/dashboard-templates/', null, true);
      if (response.data && response.data.success) {
        setTemplates(response.data.data);
      }
    } catch (error) {
      message.error('Failed to load dashboard templates');
      console.error('Load templates error:', error);
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
      gauge: <DashboardFilled />,
      heatmap: <AppstoreOutlined />,
      scatter: <DotChartOutlined />,
      radar: <FundOutlined />,
      treemap: <ClusterOutlined />
    };
    return iconMap[chartType] || <BarChartOutlined />;
  };

  const getCategoryColor = (category) => {
    const colorMap = {
      'Executive': 'blue',
      'Compliance': 'green',
      'Risk': 'red',
      'Performance': 'orange',
      'Operational': 'purple'
    };
    return colorMap[category] || 'default';
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set((templates || []).map(t => t.category))];

  const handlePreview = (template) => {
    setPreviewTemplate(template);
    setShowPreview(true);
  };

  const handleApplyTemplate = async (template) => {
    try {
      const response = await apiRequest('POST', `/api/project/${project.id}/apply-template/`, {
        template_id: template.id,
        name: `${template.name} - ${new Date().toLocaleDateString()}`
      }, true);

      if (response.data && response.data.success) {
        message.success('Dashboard template applied successfully!');
        onTemplateSelect(response.data.data);
        onClose();
      }
    } catch (error) {
      message.error('Failed to apply template');
      console.error('Apply template error:', error);
    }
  };

  const TemplateCard = ({ template }) => (
    <Card
      hoverable
      className={`template-card ${isDarkMode ? 'dark' : ''}`}
      cover={
        <div className="template-preview">
          <div className="preview-grid">
            {(template.charts || []).slice(0, 4).map((chart, index) => (
              <div key={index} className="preview-chart">
                <div className="chart-icon">
                  {getChartIcon(chart.type)}
                </div>
                <div className="chart-title">{chart.title}</div>
              </div>
            ))}
          </div>
        </div>
      }
      actions={[
        <Button
          key="preview"
          icon={<EyeOutlined />}
          onClick={() => handlePreview(template)}
        >
          Preview
        </Button>,
        <Button
          key="apply"
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => handleApplyTemplate(template)}
        >
          Apply Template
        </Button>
      ]}
    >
      <div className="template-header">
        <Title level={4} className="template-name">
          {template.name}
        </Title>
        <Tag color={getCategoryColor(template.category)}>
          {template.category}
        </Tag>
      </div>
      
      <Paragraph className="template-description">
        {template.description}
      </Paragraph>
      
      <div className="template-stats">
        <Space>
          <Badge count={template.charts.length} showZero>
            <DatabaseOutlined />
          </Badge>
          <Text type="secondary">Charts</Text>
        </Space>
      </div>
      
      <div className="template-charts">
        <Text type="secondary">Includes:</Text>
        <div className="chart-list">
          {(template.charts || []).map((chart, index) => (
            <Tag key={index} icon={getChartIcon(chart.type)}>
              {chart.title}
            </Tag>
          ))}
        </div>
      </div>
    </Card>
  );

  const TemplatePreview = () => (
    <Modal
      title={`Preview: ${previewTemplate?.name}`}
      open={showPreview}
      onCancel={() => setShowPreview(false)}
      width={800}
      footer={[
        <Button key="close" onClick={() => setShowPreview(false)}>
          Close
        </Button>,
        <Button
          key="apply"
          type="primary"
          onClick={() => {
            handleApplyTemplate(previewTemplate);
            setShowPreview(false);
          }}
        >
          Apply Template
        </Button>
      ]}
    >
      {previewTemplate && (
        <div className="template-preview-content">
          <div className="preview-description">
            <Paragraph>{previewTemplate.description}</Paragraph>
          </div>
          
          <div className="preview-layout">
            <Title level={5}>Dashboard Layout</Title>
            <div className="layout-grid">
              {(previewTemplate.charts || []).map((chart, index) => (
                <div key={index} className="layout-chart">
                  <div className="chart-icon">
                    {getChartIcon(chart.type)}
                  </div>
                  <div className="chart-info">
                    <Text strong>{chart.title}</Text>
                    <br />
                    <Text type="secondary">{chart.type.toUpperCase()}</Text>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="preview-features">
            <Title level={5}>Features</Title>
            <ul>
              <li>Pre-configured chart types</li>
              <li>Optimized layout for {previewTemplate.category.toLowerCase()} use cases</li>
              <li>Ready-to-use data connections</li>
              <li>Customizable and extensible</li>
            </ul>
          </div>
        </div>
      )}
    </Modal>
  );

  return (
    <div className={`dashboard-templates ${isDarkMode ? 'dark' : ''}`}>
      <div className="templates-header">
        <Title level={2}>
          <DashboardOutlined /> Dashboard Templates
        </Title>
        <Paragraph>
          Choose from pre-designed dashboard templates to quickly get started with your analytics.
          Each template is optimized for specific use cases and includes pre-configured charts.
        </Paragraph>
      </div>

      <div className="templates-controls">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Space>
              <Text>Category:</Text>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`category-select ${isDarkMode ? 'dark' : ''}`}
              >
                {(categories || []).map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </Space>
          </Col>
          <Col xs={24} sm={24} md={8}>
            <Space>
              <ThunderboltOutlined />
              <Text type="secondary">
                {filteredTemplates.length} templates available
              </Text>
            </Space>
          </Col>
        </Row>
      </div>

      {loading ? (
        <div className="loading-container">
          <Spin size="large" />
          <Text>Loading templates...</Text>
        </div>
      ) : (
        <div className="templates-grid">
          <Row gutter={[24, 24]}>
            {(filteredTemplates || []).map((template) => (
              <Col xs={24} sm={12} lg={8} xl={6} key={template.id}>
                <TemplateCard template={template} />
              </Col>
            ))}
          </Row>
        </div>
      )}

      {filteredTemplates.length === 0 && !loading && (
        <div className="no-templates">
          <Alert
            message="No templates found"
            description="Try adjusting your search criteria or category filter."
            type="info"
            showIcon
          />
        </div>
      )}

      <TemplatePreview />

      <style jsx>{`
        .dashboard-templates {
          padding: 24px;
          background: ${isDarkMode ? '#1a1a1a' : '#f5f5f5'};
          min-height: 100vh;
        }

        .templates-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .templates-controls {
          margin-bottom: 32px;
          padding: 16px;
          background: ${isDarkMode ? '#2a2a2a' : '#fff'};
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .category-select {
          padding: 4px 8px;
          border: 1px solid ${isDarkMode ? '#444' : '#d9d9d9'};
          border-radius: 4px;
          background: ${isDarkMode ? '#2a2a2a' : '#fff'};
          color: ${isDarkMode ? '#fff' : '#000'};
        }

        .templates-grid {
          margin-bottom: 32px;
        }

        .template-card {
          height: 100%;
          transition: all 0.3s ease;
        }

        .template-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        }

        .template-preview {
          height: 200px;
          background: ${isDarkMode ? '#2a2a2a' : '#f8f9fa'};
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .preview-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-rows: 1fr 1fr;
          gap: 8px;
          width: 80%;
          height: 80%;
        }

        .preview-chart {
          background: ${isDarkMode ? '#3a3a3a' : '#fff'};
          border: 1px solid ${isDarkMode ? '#555' : '#e8e8e8'};
          border-radius: 4px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 8px;
        }

        .chart-icon {
          font-size: 20px;
          color: #1890ff;
          margin-bottom: 4px;
        }

        .chart-title {
          font-size: 10px;
          text-align: center;
          color: ${isDarkMode ? '#fff' : '#666'};
        }

        .template-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .template-name {
          margin: 0;
          flex: 1;
        }

        .template-description {
          margin-bottom: 16px;
          color: ${isDarkMode ? '#ccc' : '#666'};
        }

        .template-stats {
          margin-bottom: 16px;
        }

        .template-charts {
          margin-top: 16px;
        }

        .chart-list {
          margin-top: 8px;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 64px;
        }

        .no-templates {
          margin-top: 64px;
        }

        .template-preview-content {
          padding: 16px 0;
        }

        .preview-description {
          margin-bottom: 24px;
        }

        .preview-layout {
          margin-bottom: 24px;
        }

        .layout-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
          margin-top: 12px;
        }

        .layout-chart {
          display: flex;
          align-items: center;
          padding: 12px;
          background: ${isDarkMode ? '#2a2a2a' : '#f8f9fa'};
          border-radius: 6px;
          border: 1px solid ${isDarkMode ? '#444' : '#e8e8e8'};
        }

        .chart-info {
          margin-left: 12px;
        }

        .preview-features ul {
          margin: 0;
          padding-left: 20px;
        }

        .preview-features li {
          margin-bottom: 8px;
          color: ${isDarkMode ? '#ccc' : '#666'};
        }
      `}</style>
    </div>
  );
};

export default DashboardTemplates;
