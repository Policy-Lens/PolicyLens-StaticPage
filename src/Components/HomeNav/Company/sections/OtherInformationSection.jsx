import React from 'react';
import { Divider, Typography, Upload, Button, Row, Col, Image } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const { Title } = Typography;

const OtherInformationSection = ({ isEditMode, companyData, onFileChange }) => {
  return (
    <>
      <Title level={4} style={{ 
        display: 'flex', 
        alignItems: 'center', 
        width: '100%',
        marginBottom: '24px',
        marginTop:"36px"
      }}>
        Optional Information
        <span style={{ 
          flex: 1, 
          height: '1px', 
          background: 'linear-gradient(to left, transparent, #d9d9d9 20%, #d9d9d9 80%, transparent)',
          marginLeft: '12px' 
        }}></span>
      </Title>

      <Row gutter={24}>
        {/* Membership IDs */}
        <Col span={8}>
          <div>
            <Typography.Text strong>Membership IDs</Typography.Text>
            <div style={{ marginTop: '12px', textAlign: 'center', padding: '20px', border: '1px dashed #d9d9d9', borderRadius: '8px' }}>
              {companyData?.membership_ids ? (
                <div>
                  <a href={companyData.membership_ids} target="_blank" rel="noopener noreferrer">
                    View Document
                  </a>
                  {isEditMode && (
                    <Upload
                      beforeUpload={(file) => {
                        onFileChange('membership_ids', file);
                        return false;
                      }}
                      showUploadList={false}
                      accept=".pdf,.doc,.docx,image/*"
                    >
                      <Button icon={<UploadOutlined />} style={{ marginTop: '8px', display: 'block', margin: '8px auto 0' }}>
                        Upload
                      </Button>
                    </Upload>
                  )}
                </div>
              ) : isEditMode ? (
                <Upload
                  beforeUpload={(file) => {
                    onFileChange('membership_ids', file);
                    return false;
                  }}
                  showUploadList={false}
                  accept=".pdf,.doc,.docx,image/*"
                >
                  <Button icon={<UploadOutlined />}>Upload</Button>
                </Upload>
              ) : (
                <Typography.Text type="secondary">No document</Typography.Text>
              )}
            </div>
          </div>
        </Col>

        {/* Company Logo */}
        <Col span={8}>
          <div>
            <Typography.Text strong>Company Logo</Typography.Text>
            <div style={{ marginTop: '12px', textAlign: 'center', padding: '20px', border: '1px dashed #d9d9d9', borderRadius: '8px' }}>
              {companyData?.company_logo ? (
                <div>
                  <Image src={companyData.company_logo} alt="Company Logo" style={{ maxWidth: '100%', maxHeight: '100px' }} />
                  {isEditMode && (
                    <Upload
                      beforeUpload={(file) => {
                        onFileChange('company_logo', file);
                        return false;
                      }}
                      showUploadList={false}
                      accept="image/*"
                    >
                      <Button icon={<UploadOutlined />} style={{ marginTop: '8px', display: 'block', margin: '8px auto 0' }}>
                        Upload
                      </Button>
                    </Upload>
                  )}
                </div>
              ) : (
                <div>
                  <div style={{ 
                    width: '80px', 
                    height: '80px', 
                    margin: '0 auto 12px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '4px'
                  }}>
                    <span style={{ fontSize: '32px', color: '#d9d9d9' }}>+</span>
                  </div>
                  {isEditMode && (
                    <Upload
                      beforeUpload={(file) => {
                        onFileChange('company_logo', file);
                        return false;
                      }}
                      showUploadList={false}
                      accept="image/*"
                    >
                      <Button icon={<UploadOutlined />}>Upload</Button>
                    </Upload>
                  )}
                </div>
              )}
            </div>
          </div>
        </Col>

        {/* Existing Certificates */}
        <Col span={8}>
          <div>
            <Typography.Text strong>Existing certificates and assessments</Typography.Text>
            <div style={{ marginTop: '12px', textAlign: 'center', padding: '20px', border: '1px dashed #d9d9d9', borderRadius: '8px' }}>
              {companyData?.existing_certificates_and_assessments ? (
                <div>
                  <a href={companyData.existing_certificates_and_assessments} target="_blank" rel="noopener noreferrer">
                    View Document
                  </a>
                  {isEditMode && (
                    <Upload
                      beforeUpload={(file) => {
                        onFileChange('existing_certificates_and_assessments', file);
                        return false;
                      }}
                      showUploadList={false}
                      accept=".pdf,.doc,.docx,image/*"
                    >
                      <Button icon={<UploadOutlined />} style={{ marginTop: '8px', display: 'block', margin: '8px auto 0' }}>
                        Upload
                      </Button>
                    </Upload>
                  )}
                </div>
              ) : isEditMode ? (
                <Upload
                  beforeUpload={(file) => {
                    onFileChange('existing_certificates_and_assessments', file);
                    return false;
                  }}
                  showUploadList={false}
                  accept=".pdf,.doc,.docx,image/*"
                >
                  <Button icon={<UploadOutlined />}>Upload</Button>
                </Upload>
              ) : (
                <Typography.Text type="secondary">No document</Typography.Text>
              )}
            </div>
          </div>
        </Col>
      </Row>
    </>
  );
};

export default OtherInformationSection;
