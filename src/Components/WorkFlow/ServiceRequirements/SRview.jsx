import React, { useContext } from 'react';
import { Card, Row, Col, Tag, Typography, Divider, Button, Empty, Space } from 'antd';
import { EditOutlined, LinkOutlined, TwitterOutlined, LinkedinOutlined, YoutubeOutlined } from '@ant-design/icons';
import { WorkflowContext } from '../../../Context/WorkflowContext';

const { Title, Text, Paragraph } = Typography;

const SRview = ({ editmodeon, stepSpecificData, stepDetails, permissions, projectRole }) => {
  const { canUserEdit } = useContext(WorkflowContext);
  const hasData = stepSpecificData && Object.keys(stepSpecificData).length > 0;
  
  // Check if user can edit based on role and permissions
  const userCanEdit = canUserEdit(projectRole, permissions);

  if (!hasData) {
    return (
      <Card bordered={"none"} style={{ height: '100%',width:"100%" }}>
        <Empty
          description={
            <div>
              <Text>No Service Requirements data found</Text>
              <br />
              <Text type="secondary">Click Edit to add the required information</Text>
            </div>
          }
        >
          {userCanEdit && (
            <Button type="primary" icon={<EditOutlined />} onClick={editmodeon}>
              Add Service Requirements
            </Button>
          )}
        </Empty>
      </Card>
    );
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto' }}>
      <Card bordered={false}
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Title level={4} style={{ margin: 0 }}>Service Requirements Details</Title>
              <Text type="secondary" style={{ fontSize: '10px' }}>
                  Last updated on: {new Date(stepSpecificData.updated_at).toLocaleDateString()}
                  {stepSpecificData.last_updated_by && (
                    <> by {stepSpecificData.last_updated_by.name}</>
                  )}
                </Text>
            </div>
            {userCanEdit && stepDetails.status !== "awaiting_approval" && stepDetails.status !== "completed" && (
              <Button type="primary" icon={<EditOutlined />} onClick={editmodeon}>
                Edit
              </Button>
            )}
          </div>
        }
        
        style={{ marginBottom: 16 }}
      >
        {/* Company Basic Information */}
        <Title level={5}>Company Information</Title>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Text strong>Registered Address:</Text>
            <br />
            <Text>{stepSpecificData.registered_address || ''}</Text>
          </Col>
          <Col span={12}>
            <Text strong>Legal Structure:</Text>
            <br />
            <Text>{stepSpecificData.legal_structure || ''}</Text>
          </Col>
          <Col span={12}>
            <Text strong>Number of Employees:</Text>
            <br />
            <Text>{stepSpecificData.num_employees || ''}</Text>
          </Col>
          <Col span={12}>
            <Text strong>Year of Establishment:</Text>
            <br />
            <Text>{stepSpecificData.year_establishment || ''}</Text>
          </Col>
          <Col span={12}>
            <Text strong>Industry Sector:</Text>
            <br />
            <Text>{stepSpecificData.industry_sector || ''}</Text>
          </Col>
          <Col span={12}>
            <Text strong>Business Model:</Text>
            <br />
            <Text>{stepSpecificData.business_model || ''}</Text>
          </Col>
        </Row>

        <Divider />

        {/* Business Operations */}
        <Title level={5}>Business Operations</Title>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Text strong>Primary Services:</Text>
            <Paragraph>{stepSpecificData.primary_services || ''}</Paragraph>
          </Col>
          <Col span={24}>
            <Text strong>Locations of Operation:</Text>
            <Paragraph>{stepSpecificData.locations_of_operation || ''}</Paragraph>
          </Col>
          <Col span={24}>
            <Text strong>Office Location:</Text>
            <Paragraph>{stepSpecificData.office_location || ''}</Paragraph>
          </Col>
          <Col span={12}>
            <Text strong>Revenue:</Text>
            <Paragraph>{stepSpecificData.revenue || ''}</Paragraph>
          </Col>
          <Col span={12}>
            <Text strong>Remote Workforce:</Text>
            <Paragraph>{stepSpecificData.remote_workforce || ''}</Paragraph>
          </Col>
        </Row>

        <Divider />

        {/* Technical Infrastructure */}
        <Title level={5}>Technical Infrastructure</Title>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Text strong>Cloud Services:</Text>
            <Paragraph>{stepSpecificData.cloud_services || ''}</Paragraph>
          </Col>
          <Col span={24}>
            <Text strong>Data Centers:</Text>
            <Paragraph>{stepSpecificData.data_centers || ''}</Paragraph>
          </Col>
          <Col span={24}>
            <Text strong>Cloud Usage:</Text>
            <Paragraph>{stepSpecificData.cloud_usage || ''}</Paragraph>
          </Col>
          <Col span={24}>
            <Text strong>Critical IT Systems:</Text>
            <Paragraph>{stepSpecificData.critical_it_systems || ''}</Paragraph>
          </Col>
          <Col span={24}>
            <Text strong>Network Architecture:</Text>
            <Paragraph>{stepSpecificData.network_architecture || ''}</Paragraph>
          </Col>
          <Col span={24}>
            <Text strong>Asset Inventory:</Text>
            <Paragraph>{stepSpecificData.asset_inventory || ''}</Paragraph>
          </Col>
        </Row>

        <Divider />

        {/* Dependencies & Compliance */}
        <Title level={5}>Dependencies & Compliance</Title>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Text strong>Third Party Dependencies:</Text>
            <Paragraph>{stepSpecificData.third_party_dependencies || ''}</Paragraph>
          </Col>
          <Col span={24}>
            <Text strong>Existing Certifications:</Text>
            <Paragraph>{stepSpecificData.existing_certifications || ''}</Paragraph>
          </Col>
          <Col span={24}>
            <Text strong>Regulatory Environment:</Text>
            <Paragraph>{stepSpecificData.regulatory_environment || ''}</Paragraph>
          </Col>
          <Col span={24}>
            <Text strong>Existing Policies:</Text>
            <Paragraph>{stepSpecificData.existing_policies || ''}</Paragraph>
          </Col>
        </Row>

        <Divider />

        {/* Business Objectives & Functions */}
        <Title level={5}>Business Objectives & Functions</Title>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Text strong>Key Clients:</Text>
            <Paragraph>{stepSpecificData.key_clients || ''}</Paragraph>
          </Col>
          <Col span={24}>
            <Text strong>Business Objectives:</Text>
            <Paragraph>{stepSpecificData.business_objectives || ''}</Paragraph>
          </Col>
          <Col span={24}>
            <Text strong>Critical Business Functions:</Text>
            <Paragraph>{stepSpecificData.critical_business_functions || ''}</Paragraph>
          </Col>
        </Row>

        <Divider />

        {/* Social Media & Online Presence */}
        <Title level={5}>Online Presence</Title>
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Text strong>Twitter:</Text>
            <div>
              {stepSpecificData.twitter ? (
                <Space>
                  <TwitterOutlined />
                  <a href={`https://twitter.com/${stepSpecificData.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                    {stepSpecificData.twitter}
                  </a>
                </Space>
              ) : (
                <Text type="secondary">Not provided</Text>
              )}
            </div>
          </Col>
          <Col span={8}>
            <Text strong>LinkedIn:</Text>
            <div>
              {stepSpecificData.linkedin ? (
                <Space>
                  <LinkedinOutlined />
                  <a href={stepSpecificData.linkedin} target="_blank" rel="noopener noreferrer">
                    LinkedIn Profile
                  </a>
                </Space>
              ) : (
                <Text type="secondary">Not provided</Text>
              )}
            </div>
          </Col>
          <Col span={8}>
            <Text strong>YouTube:</Text>
            <div>
              {stepSpecificData.youtube ? (
                <Space>
                  <YoutubeOutlined />
                  <a href={stepSpecificData.youtube} target="_blank" rel="noopener noreferrer">
                    YouTube Channel
                  </a>
                </Space>
              ) : (
                <Text type="secondary">Not provided</Text>
              )}
            </div>
          </Col>
        </Row>

        <Divider />

        {/* Service Requirements Specific */}
        <Title level={5}>Service Requirements</Title>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Text strong>Requirement for Service:</Text>
            <Paragraph>{stepSpecificData.requirement_for_service || ''}</Paragraph>
          </Col>
          <Col span={24}>
            <Text strong>Description:</Text>
            <Paragraph>{stepSpecificData.description || ''}</Paragraph>
          </Col>
          <Col span={24}>
            <Text strong>Compliances in Scope:</Text>
            <Paragraph>{stepSpecificData.compliances_in_scope || ''}</Paragraph>
          </Col>
          <Col span={12}>
            <Text strong>Completion Time:</Text>
            <Paragraph>{stepSpecificData.completion_time || ''}</Paragraph>
          </Col>
          <Col span={12}>
            <Text strong>Go/No-Go Decision:</Text>
            <div>
              {stepSpecificData.go_nogo_decision === 'go' ? (
                <Tag color="green">GO</Tag>
              ) : stepSpecificData.go_nogo_decision === 'nogo' ? (
                <Tag color="red">NO-GO</Tag>
              ) : (
                <Tag color="default">Pending</Tag>
              )}
            </div>
          </Col>
        </Row>

        
      </Card>
    </div>
  );
};

export default SRview;
