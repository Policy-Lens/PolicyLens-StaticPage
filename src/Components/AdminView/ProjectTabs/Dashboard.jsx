import React, { useState } from 'react';
import { Tabs, Button, Space, Typography, Card, Row, Col } from 'antd';
import { 
  BarChart3, 
  Grid3X3, 
  Sparkles, 
  LayoutTemplate
} from 'lucide-react';
import { PlusOutlined, EyeOutlined } from '@ant-design/icons';
import SimpleDashboard from './SimpleDashboard';
import DashboardTemplates from './DashboardTemplates';
import { useTheme } from '../../../contexts/ThemeContext';

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;

const Dashboard = () => {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('builder');
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setActiveTab('builder');
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  return (
    <div className={`dashboard-container ${isDarkMode ? 'dark' : ''}`}>
      <div className="dashboard-header">
        <div className="header-content">
          <Title level={2}>
            <BarChart3 size={24} style={{ marginRight: 12 }} />
            Project Dashboard
          </Title>
          <Paragraph>
            Create powerful analytics dashboards with AI-powered insights and custom visualizations.
          </Paragraph>
        </div>
        
        <div className="header-actions">
          <Space>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setActiveTab('builder')}
            >
              New Dashboard
            </Button>
            <Button 
              icon={<LayoutTemplate />}
              onClick={() => setActiveTab('templates')}
            >
              Templates
            </Button>
          </Space>
        </div>
      </div>

      <div className="dashboard-content">
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          className="dashboard-tabs"
          items={[
            {
              key: 'builder',
              label: (
                <Space>
                  <Grid3X3 size={16} />
                  <span>Dashboard Builder</span>
                </Space>
              ),
              children: (
                <SimpleDashboard 
                  selectedTemplate={selectedTemplate}
                  onTemplateClear={() => setSelectedTemplate(null)}
                />
              )
            },
            {
              key: 'templates',
              label: (
                <Space>
                  <LayoutTemplate size={16} />
                  <span>Templates</span>
                </Space>
              ),
              children: (
                <DashboardTemplates 
                  onTemplateSelect={handleTemplateSelect}
                  onClose={() => setActiveTab('builder')}
                />
              )
            }
          ]}
        />
      </div>

      <style jsx>{`
        .dashboard-container {
          min-height: 100vh;
          background: ${isDarkMode ? '#1a1a1a' : '#f5f5f5'};
        }

        .dashboard-header {
          background: ${isDarkMode ? '#2a2a2a' : '#fff'};
          border-bottom: 1px solid ${isDarkMode ? '#333' : '#e8e8e8'};
          padding: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-content {
          flex: 1;
        }

        .header-content h2 {
          margin: 0;
          color: ${isDarkMode ? '#fff' : '#000'};
          display: flex;
          align-items: center;
        }

        .header-content p {
          margin: 8px 0 0 0;
          color: ${isDarkMode ? '#ccc' : '#666'};
        }

        .header-actions {
          margin-left: 24px;
        }

        .dashboard-content {
          padding: 24px;
        }

        .dashboard-tabs {
          background: ${isDarkMode ? '#2a2a2a' : '#fff'};
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .dashboard-tabs .ant-tabs-nav {
          margin: 0;
          padding: 0 24px;
        }

        .dashboard-tabs .ant-tabs-content-holder {
          padding: 24px;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
