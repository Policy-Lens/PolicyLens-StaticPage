import React from 'react';
import { Form, Input, Row, Col, Divider, Typography, Button, Upload } from 'antd';
import { UploadOutlined, EyeOutlined } from '@ant-design/icons';

const { Title } = Typography;

const LegalInformationSection = ({ getFormItemProps, isEditMode, companyData, onFileChange }) => {
  return (
    <>
      <Title level={4} style={{ 
        display: 'flex', 
        alignItems: 'center',
        marginBottom: '16px',
        marginTop:"36px"
      }}>
        Legal Information
        <span style={{ 
          flex: 1, 
          height: '1px', 
          background: '#d9d9d9',
          marginLeft: '12px' 
        }}></span>
      </Title>
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            {...getFormItemProps('legal_status_of_company')}
            name="legal_status_of_company"
            label="Legal status of the company"
          >
            <Input placeholder="Enter legal status" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            {...getFormItemProps('trading_name')}
            name="trading_name"
            label="Trading name"
          >
            <Input placeholder="Enter trading name" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            {...getFormItemProps('statutory_obligations')}
            name="statutory_obligations"
            label="Statutory obligations"
          >
            <Input placeholder="Enter obligations" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            {...getFormItemProps('rugulatory_obligations')}
            name="rugulatory_obligations"
            label="Regulatory obligations"
          >
            <Input placeholder="Enter obligations" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            {...getFormItemProps('standards_to_be_followed')}
            name="standards_to_be_followed"
            label="Standards to be followed"
          >
            <Input placeholder="Enter standards" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            {...getFormItemProps('pan_number')}
            name="pan_number"
            label="PAN"
          >
            <Input placeholder="Enter PAN number" />
          </Form.Item>
          <div style={{ marginTop: '-16px', marginBottom: '24px' }}>
            {companyData?.pan && (
              <Button
                size="small"
                icon={<EyeOutlined />}
                onClick={() => window.open(companyData.pan, '_blank')}
                style={{ marginRight: '8px' }}
              >
                View
              </Button>
            )}
            {isEditMode && (
              <Upload
                beforeUpload={(file) => {
                  onFileChange('pan', file);
                  return false;
                }}
                showUploadList={false}
                accept="image/*,.pdf"
              >
                <Button size="small" icon={<UploadOutlined />}>
                  {companyData?.pan ? 'Change' : 'Upload'} PAN
                </Button>
              </Upload>
            )}
          </div>
        </Col>
        <Col span={8}>
          <Form.Item
            {...getFormItemProps('gst_number')}
            name="gst_number"
            label="GST"
          >
            <Input placeholder="Enter GST number" />
          </Form.Item>
          <div style={{ marginTop: '-16px', marginBottom: '24px' }}>
            {companyData?.gst && (
              <Button
                size="small"
                icon={<EyeOutlined />}
                onClick={() => window.open(companyData.gst, '_blank')}
                style={{ marginRight: '8px' }}
              >
                View
              </Button>
            )}
            {isEditMode && (
              <Upload
                beforeUpload={(file) => {
                  onFileChange('gst', file);
                  return false;
                }}
                showUploadList={false}
                accept="image/*,.pdf"
              >
                <Button size="small" icon={<UploadOutlined />}>
                  {companyData?.gst ? 'Change' : 'Upload'} GST
                </Button>
              </Upload>
            )}
          </div>
        </Col>
        <Col span={8}>
          <Form.Item
            {...getFormItemProps('cin_number')}
            name="cin_number"
            label="CIN"
          >
            <Input placeholder="Enter CIN number" />
          </Form.Item>
          <div style={{ marginTop: '-16px', marginBottom: '24px' }}>
            {companyData?.cin && (
              <Button
                size="small"
                icon={<EyeOutlined />}
                onClick={() => window.open(companyData.cin, '_blank')}
                style={{ marginRight: '8px' }}
              >
                View
              </Button>
            )}
            {isEditMode && (
              <Upload
                beforeUpload={(file) => {
                  onFileChange('cin', file);
                  return false;
                }}
                showUploadList={false}
                accept="image/*,.pdf"
              >
                <Button size="small" icon={<UploadOutlined />}>
                  {companyData?.cin ? 'Change' : 'Upload'} CIN
                </Button>
              </Upload>
            )}
          </div>
        </Col>
      </Row>
    </>
  );
};

export default LegalInformationSection;
