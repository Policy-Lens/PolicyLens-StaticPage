import React, { useState, useEffect, useContext } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  message,
  Space,
  Typography,
  Divider,
  Select,
  InputNumber
} from 'antd';
import { SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { WorkflowContext } from '../../../Context/WorkflowContext';

const { TextArea } = Input;
const { Title } = Typography;
const { Option } = Select;

const SRedit = ({ 
  editmodeoff, 
  stepSpecificData, 
  setStepSpecificData, 
  stepId, 
  projectId, 
  permissions, 
  refreshData 
}) => {
  const [form] = Form.useForm();
  const { updateStepData, patchUpdateStepData, isLoading } = useContext(WorkflowContext);
  const [saving, setSaving] = useState(false);
  const [originalData, setOriginalData] = useState({});
  const [changedFields, setChangedFields] = useState(new Set());

  useEffect(() => {
    // Initialize form with existing data and store original copy
    if (stepSpecificData) {
      const dataClone = JSON.parse(JSON.stringify(stepSpecificData));
      form.setFieldsValue(dataClone);
      setOriginalData(dataClone);
    }
  }, [stepSpecificData, form]);

  // Track field changes
  const handleFieldChange = (changedValues, allValues) => {
    const newChangedFields = new Set(changedFields);
    
    Object.keys(changedValues).forEach(field => {
      const currentValue = allValues[field];
      const originalValue = originalData[field];
      
      // Handle empty strings and undefined/null values properly
      const normalizedCurrent = currentValue === undefined || currentValue === null ? '' : String(currentValue).trim();
      const normalizedOriginal = originalValue === undefined || originalValue === null ? '' : String(originalValue).trim();
      
      if (normalizedCurrent !== normalizedOriginal) {
        newChangedFields.add(field);
      } else {
        newChangedFields.delete(field);
      }
    });
    
    setChangedFields(newChangedFields);
  };

  const handleSave = async (values) => {
    if (!permissions?.can_edit) {
      message.error('You do not have permission to edit this step');
      return;
    }

    try {
      setSaving(true);
      
      // Only send changed fields in patch update
      let dataToSend = values;
      if (stepId && changedFields.size > 0) {
        dataToSend = {};
        changedFields.forEach(field => {
          dataToSend[field] = values[field];
        });
      }
      
      const result = stepId 
        ? await patchUpdateStepData(stepId, dataToSend)
        : await updateStepData(stepId, values);

      if (result.success) {
        message.success(result.message || 'Service Requirements saved successfully');
        setStepSpecificData(result.data || values);
        refreshData();
        editmodeoff();
      } else {
        message.error(result.error || 'Failed to save Service Requirements');
      }
    } catch (error) {
      console.error('Error saving Service Requirements:', error);
      message.error('Error saving Service Requirements');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setChangedFields(new Set());
    editmodeoff();
  };

  // Helper function to get form item props with visual indicator for changes
  const getFormItemProps = (fieldName, baseProps = {}) => {
    const isChanged = changedFields.has(fieldName);
    return {
      ...baseProps,
      style: {
        ...baseProps.style,
        ...(isChanged && {
          '& .ant-input, & .ant-input-number, & .ant-select-selector': {
            borderColor: '#52c41a',
            boxShadow: '0 0 0 2px rgba(82, 196, 26, 0.2)'
          }
        })
      },
      className: isChanged ? 'field-changed' : ''
    };
  };

  return (
    <div style={{ height: '100%', overflowY: 'auto' }}>
      <style>
        {`
          .field-changed .ant-input,
          .field-changed .ant-input-number-input,
          .field-changed .ant-select-selector {
            border-color: #52c41a !important;
            box-shadow: 0 0 0 2px rgba(82, 196, 26, 0.2) !important;
          }
          
          .field-changed .ant-form-item-label > label::after {
            content: " ●";
            color: #52c41a;
            font-weight: bold;
          }
        `}
      </style>
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={4} style={{ margin: 0 }}>Edit Service Requirements</Title>
            <Space>
              <Button 
                icon={<CloseOutlined />} 
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button 
                type="primary" 
                disabled={changedFields.size === 0}
                loading={saving || isLoading}
                onClick={() => form.submit()}
              >
                Save
              </Button>
            </Space>
          </div>
        }
        type='inner'
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          onValuesChange={handleFieldChange}
          initialValues={stepSpecificData}
        >
          {/* Company Information Section */}
          <Title level={5}>Company Information</Title>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                {...getFormItemProps('registered_address')}
                name="registered_address"
                label="Registered Address"
              >
                <TextArea rows={3} placeholder="Enter registered address" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                {...getFormItemProps('legal_structure')}
                name="legal_structure"
                label="Legal Structure"
              >
                <Input placeholder="e.g., Private Limited Company" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                {...getFormItemProps('num_employees')}
                name="num_employees"
                label="Number of Employees"
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  min={1} 
                  placeholder="Enter number of employees" 
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                {...getFormItemProps('year_establishment')}
                name="year_establishment"
                label="Year of Establishment"
              >
                <Input placeholder="e.g., 2015" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                {...getFormItemProps('industry_sector')}
                name="industry_sector"
                label="Industry Sector"
              >
                <Input placeholder="e.g., Financial Services" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                {...getFormItemProps('business_model')}
                name="business_model"
                label="Business Model"
              >
                <Input placeholder="e.g., B2B SaaS subscription" />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          {/* Business Operations Section */}
          <Title level={5}>Business Operations</Title>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                {...getFormItemProps('primary_services')}
                name="primary_services"
                label="Primary Services"
              >
                <TextArea rows={3} placeholder="Describe your primary services" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                {...getFormItemProps('locations_of_operation')}
                name="locations_of_operation"
                label="Locations of Operation"
              >
                <TextArea rows={2} placeholder="List all operational locations" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                {...getFormItemProps('office_location')}
                name="office_location"
                label="Office Location"
              >
                <TextArea rows={2} placeholder="Describe office locations" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                {...getFormItemProps('revenue')}
                name="revenue"
                label="Revenue"
              >
                <Input placeholder="e.g., USD 5M (FY2024)" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                {...getFormItemProps('remote_workforce')}
                name="remote_workforce"
                label="Remote Workforce"
              >
                <Input placeholder="e.g., 30% remote, hybrid model" />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          {/* Technical Infrastructure Section */}
          <Title level={5}>Technical Infrastructure</Title>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                {...getFormItemProps('cloud_services')}
                name="cloud_services"
                label="Cloud Services"
              >
                <TextArea rows={2} placeholder="List cloud services used (e.g., AWS, GCP, Azure)" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                {...getFormItemProps('data_centers')}
                name="data_centers"
                label="Data Centers"
              >
                <TextArea rows={2} placeholder="Describe data center setup" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                {...getFormItemProps('cloud_usage')}
                name="cloud_usage"
                label="Cloud Usage"
              >
                <Input placeholder="e.g., 60% cloud, 40% on-premises" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                {...getFormItemProps('critical_it_systems')}
                name="critical_it_systems"
                label="Critical IT Systems"
              >
                <TextArea rows={2} placeholder="List critical IT systems" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                {...getFormItemProps('network_architecture')}
                name="network_architecture"
                label="Network Architecture"
              >
                <TextArea rows={2} placeholder="Describe network architecture" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                {...getFormItemProps('asset_inventory')}
                name="asset_inventory"
                label="Asset Inventory"
              >
                <TextArea rows={2} placeholder="Describe asset inventory management" />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          {/* Dependencies & Compliance Section */}
          <Title level={5}>Dependencies & Compliance</Title>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                {...getFormItemProps('third_party_dependencies')}
                name="third_party_dependencies"
                label="Third Party Dependencies"
              >
                <TextArea rows={3} placeholder="List third-party services and dependencies" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                {...getFormItemProps('existing_certifications')}
                name="existing_certifications"
                label="Existing Certifications"
              >
                <TextArea rows={2} placeholder="List current certifications (e.g., ISO 27001, SOC 2)" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                {...getFormItemProps('regulatory_environment')}
                name="regulatory_environment"
                label="Regulatory Environment"
              >
                <TextArea rows={2} placeholder="Describe applicable regulations (e.g., GDPR, PCI-DSS)" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                {...getFormItemProps('existing_policies')}
                name="existing_policies"
                label="Existing Policies"
              >
                <TextArea rows={2} placeholder="List existing security/compliance policies" />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          {/* Business Objectives & Functions Section */}
          <Title level={5}>Business Objectives & Functions</Title>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                {...getFormItemProps('key_clients')}
                name="key_clients"
                label="Key Clients"
              >
                <TextArea rows={2} placeholder="List key clients or client types" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                {...getFormItemProps('business_objectives')}
                name="business_objectives"
                label="Business Objectives"
              >
                <TextArea rows={3} placeholder="Describe main business objectives" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                {...getFormItemProps('critical_business_functions')}
                name="critical_business_functions"
                label="Critical Business Functions"
              >
                <TextArea rows={2} placeholder="List critical business functions" />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          {/* Online Presence Section */}
          <Title level={5}>Online Presence</Title>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                {...getFormItemProps('twitter')}
                name="twitter"
                label="Twitter Handle"
              >
                <Input placeholder="@company_handle" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                {...getFormItemProps('linkedin')}
                name="linkedin"
                label="LinkedIn URL"
              >
                <Input placeholder="https://linkedin.com/company/..." />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                {...getFormItemProps('youtube')}
                name="youtube"
                label="YouTube URL"
              >
                <Input placeholder="https://youtube.com/channel/..." />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          {/* Service Requirements Specific Section */}
          <Title level={5}>Service Requirements</Title>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                {...getFormItemProps('requirement_for_service')}
                name="requirement_for_service"
                label="Requirement for Service"
              >
                <TextArea rows={4} placeholder="Describe what services are required" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                {...getFormItemProps('description')}
                name="description"
                label="Additional Description"
              >
                <TextArea rows={3} placeholder="Any additional description or notes" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                {...getFormItemProps('compliances_in_scope')}
                name="compliances_in_scope"
                label="Compliances in Scope"
              >
                <TextArea rows={2} placeholder="List compliance requirements in scope" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                {...getFormItemProps('completion_time')}
                name="completion_time"
                label="Expected Completion Time"
              >
                <Input placeholder="e.g., 6 months" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                {...getFormItemProps('go_nogo_decision')}
                name="go_nogo_decision"
                label="Go/No-Go Decision"
              >
                <Select placeholder="Select decision">
                  <Option value="go">Go</Option>
                  <Option value="nogo">No-Go</Option>
                  <Option value="pending">Pending</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Hidden submit button - form submission is handled by the Save button */}
          <Form.Item style={{ display: 'none' }}>
            <Button htmlType="submit" />
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default SRedit;
