import React, { useState, useEffect, useContext } from 'react';
import { 
  Table, 
  Tag, 
  Button, 
  Card, 
  Typography, 
  Space, 
  message,
  Avatar,
  Tooltip,
  Flex
} from 'antd';
import { 
  CheckCircleOutlined, 
  SyncOutlined, 
  DashOutlined, 
  ExclamationCircleFilled,
  UserOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { WorkflowContext } from '../../Context/WorkflowContext';
import { ProjectContext } from '../../Context/ProjectContext';

const { Title } = Typography;

const Tableview = ({ projectId, onStepClick }) => {
  const { 
    getAllProjectSteps, 
    isLoading 
  } = useContext(WorkflowContext);
  
  const { projectRole } = useContext(ProjectContext);
  
  const [stepsData, setStepsData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all project steps
  const fetchProjectSteps = async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      const response = await getAllProjectSteps(projectId);
      
      if (response) {
        setStepsData(response.steps || []);
      } else {
        message.error('Failed to load workflow steps');
      }
    } catch (error) {
      console.error('Error fetching project steps:', error);
      message.error('Error loading workflow steps');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectSteps();
  }, [projectId]);

  // Get status display configuration
  const getStatusConfig = (status) => {
    switch (status) {
      case 'completed':
        return { 
          color: 'green', 
          icon: <CheckCircleOutlined />, 
          text: 'Completed' 
        };
      case 'in_progress':
        return { 
          color: 'blue', 
          icon: <SyncOutlined spin />, 
          text: 'In Progress' 
        };
      case 'not_started':
        return { 
          color: 'orange', 
          icon: <DashOutlined />, 
          text: 'Not Started' 
        };
      case 'awaiting_approval':
        return { 
          color: 'purple', 
          icon: <ExclamationCircleFilled />, 
          text: 'Awaiting Approval' 
        };
      default:
        return { 
          color: 'default', 
          icon: null, 
          text: status || 'Unknown' 
        };
    }
  };

  // Get process color
  const getProcessColor = (process) => {
    return process === 'core' ? 'purple' : 'cyan';
  };

  // Table columns configuration
  const columns = [
    {
      title: 'Step',
      dataIndex: 'step_no',
      key: 'step_no',
      width: 80,
      render: (stepNo, record) => (
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: getStatusConfig(record.status).color === 'green' ? '#52c41a' :
                              getStatusConfig(record.status).color === 'blue' ? '#1890ff' :
                              getStatusConfig(record.status).color === 'purple' ? '#722ed1' : '#faad14',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              margin: '0 auto'
            }}
          >
            {stepNo}
          </div>
        </div>
      )
    },
    {
      title: 'Step Name',
      dataIndex: 'step_name',
      key: 'step_name',
      render: (stepName, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{stepName}</div>
          {!record.has_data && (
            <div style={{ fontSize: '12px', color: '#999' }}>No data</div>
          )}
        </div>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status) => {
        const config = getStatusConfig(status);
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      }
    },
    {
      title: 'Process Type',
      dataIndex: 'process',
      key: 'process',
      width: 120,
      render: (process) => (
        <Tag color={getProcessColor(process)}>
          {process === 'core' ? 'Core' : 'Non Core'}
        </Tag>
      )
    },
    {
      title: 'Assigned To',
      dataIndex: 'assigned_to',
      key: 'assigned_to',
      width: 200,
      render: (assignedTo) => {
        if (!assignedTo) {
          return <span style={{ color: '#999' }}>Not assigned</span>;
        }
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Avatar size="small" icon={<UserOutlined />} />
            <span>{assignedTo.name}</span>
          </div>
        );
      }
    },
    {
      title: 'Reviewer',
      dataIndex: 'reviewer',
      key: 'reviewer',
      width: 200,
      render: (reviewer) => {
        // Only show reviewer column to users who can see it
        if (projectRole !== 'company' && projectRole !== 'consultant admin') {
          return null;
        }
        
        if (!reviewer) {
          return <span style={{ color: '#999' }}>Not assigned</span>;
        }
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Avatar size="small" icon={<UserOutlined />} />
            <span>{reviewer.name}</span>
          </div>
        );
      }
    },
    {
      title: 'Progress',
      key: 'progress',
      width: 100,
      render: (_, record) => {
        const progress = record.status === 'completed' ? 100 :
                        record.status === 'awaiting_approval' ? 85 :
                        record.status === 'in_progress' ? 50 : 0;
        
        return (
          <div style={{ width: 80 }}>
            <div style={{ 
              width: '100%', 
              height: 8, 
              backgroundColor: '#f0f0f0', 
              borderRadius: 4,
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${progress}%`,
                height: '100%',
                backgroundColor: getStatusConfig(record.status).color === 'green' ? '#52c41a' :
                               getStatusConfig(record.status).color === 'blue' ? '#1890ff' :
                               getStatusConfig(record.status).color === 'purple' ? '#722ed1' : '#faad14',
                transition: 'width 0.3s ease'
              }} />
            </div>
            <div style={{ fontSize: '12px', textAlign: 'center', marginTop: 2 }}>
              {progress}%
            </div>
          </div>
        );
      }
    },
    {
      title: 'Action',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => onStepClick && onStepClick(record.step_no - 1)} // Convert to 0-based index
        >
          View
        </Button>
      )
    }
  ];

  // Filter columns based on user role
  const filteredColumns = columns.filter(col => {
    if (col.key === 'reviewer') {
      return projectRole === 'company' || projectRole === 'consultant admin';
    }
    return true;
  });

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      
            <Flex justify='space-between' style={{padding:"10px",marginBottom:"10px"}}>

            <Title level={4} style={{ margin: 0 }}>
              Workflow Steps Overview
            </Title>
            <Button 
              onClick={fetchProjectSteps}
              loading={loading}
              >
              Refresh
            </Button>
              </Flex>
        
        <Table
          columns={filteredColumns}
          dataSource={stepsData}
          loading={loading || isLoading}
          rowKey="step_id"
          pagination={false}
          scroll={{y:'67vh'}}
          marginBottom="10px"
          size="small"
          onRow={(record) => ({
            style: {
              cursor: 'pointer'
            },
            onClick: () => onStepClick && onStepClick(record.step_no - 1)
          })}
        />
    </div>
  );
};

export default Tableview;