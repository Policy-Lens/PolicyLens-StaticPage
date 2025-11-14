import React, { useState } from 'react';
import { Button, Divider, Typography, Table, Modal, Form, Input, Select, Row, Col, Upload, message, Image } from 'antd';
import { PlusOutlined, DeleteOutlined, UploadOutlined, UndoOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;

const ITInformationSection = ({ 
  assets, 
  setAssets, 
  isEditMode, 
  itemsToAdd, 
  setItemsToAdd,
  itemsToRemove,
  setItemsToRemove,
  companyData,
  onFileChange
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const handleAdd = (values) => {
    setItemsToAdd(prev => ({
      ...prev,
      add_asset: [...prev.add_asset, values]
    }));
    const newAsset = { ...values, id: `temp-${Date.now()}` };
    setAssets([...assets, newAsset]);
    setModalVisible(false);
    form.resetFields();
    message.success('Asset added (will be saved when you click Save)');
  };

  const handleDelete = (id) => {
    if (String(id).startsWith('temp-')) {
      setAssets(assets.filter(item => item.id !== id));
      const tempAssets = assets.filter(item => String(item.id).startsWith('temp-'));
      const index = tempAssets.findIndex(t => t.id === id);
      setItemsToAdd(prev => ({
        ...prev,
        add_asset: prev.add_asset.filter((_, i) => i !== index)
      }));
    } else {
      setItemsToRemove(prev => ({
        ...prev,
        remove_assets: [...prev.remove_assets, id]
      }));
    }
  };

  const handleRevert = (id) => {
    setItemsToRemove(prev => ({
      ...prev,
      remove_assets: prev.remove_assets.filter(itemId => itemId !== id)
    }));
  };

  const isMarkedForDeletion = (id) => itemsToRemove.remove_assets.includes(id);

  const columns = [
    { title: 'Asset Name', dataIndex: 'name', key: 'name' },
    { title: 'Asset Type', dataIndex: 'asset_type', key: 'asset_type' },
    { title: 'Service Provider', dataIndex: 'service_provider', key: 'service_provider' },
    { title: 'Year of Commissioning', dataIndex: 'year_of_commissioning', key: 'year_of_commissioning' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    { title: 'Owner', dataIndex: 'owner', key: 'owner' },
    { title: 'Criticality', dataIndex: 'criticality', key: 'criticality' },
    ...(isEditMode ? [{
      title: 'Actions',
      key: 'actions',
      align: 'center',
      render: (_, record) => {
        const markedForDeletion = isMarkedForDeletion(record.id);
        return markedForDeletion ? (
          <Button
            type="link"
            icon={<UndoOutlined />}
            onClick={() => handleRevert(record.id)}
          >
            Revert
          </Button>
        ) : (
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Delete
          </Button>
        );
      },
    }] : [])
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Title level={4} style={{ 
          display: 'flex', 
          alignItems: 'center',
          marginTop:"36px",
          flex: 1
        }}>
          IT Information
          <span style={{ 
            flex: 1, 
            height: '1px', 
            background: '#d9d9d9',
            marginLeft: '12px' 
          }}></span>
        </Title>
      </div>

      <Table
        dataSource={assets}
        columns={columns}
        rowKey="id"
        pagination={false}
        locale={{ emptyText: 'No assets added' }}
        rowClassName={(record) => isMarkedForDeletion(record.id) ? 'row-deleted' : ''}
      />
      
      {isEditMode && (
        <Button 
          color="default" 
          variant="dashed" 
          icon={<PlusOutlined />} 
          onClick={() => setModalVisible(true)}
          style={{ width: '100%', marginTop: '16px' }}
        >
          Add Asset
        </Button>
      )}

      <style>{`
        .row-deleted {
          background-color: #ffebee !important;
          opacity: 0.7;
        }
        .row-deleted:hover {
          background-color: #ffcdd2 !important;
        }
      `}</style>

      {/* Network Architecture Diagram */}
      <div style={{ marginTop: '24px' }}>
        <Typography.Text strong>Network Architecture Diagram</Typography.Text>
        <div style={{ marginTop: '12px' }}>
          {companyData?.network_architecture_diagram ? (
            <div>
              <Image src={companyData.network_architecture_diagram} alt="Architecture Diagram" style={{ maxWidth: '100%', maxHeight: '400px' }} />
              {isEditMode && (
                <Upload
                  beforeUpload={(file) => {
                    onFileChange('network_architecture_diagram', file);
                    return false;
                  }}
                  showUploadList={false}
                  accept="image/*"
                >
                  <Button icon={<UploadOutlined />} style={{ marginTop: '8px' }}>
                    Change Diagram
                  </Button>
                </Upload>
              )}
            </div>
          ) : isEditMode ? (
            <Upload
              beforeUpload={(file) => {
                onFileChange('network_architecture_diagram', file);
                return false;
              }}
              showUploadList={false}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />}>Upload Architecture Diagram</Button>
            </Upload>
          ) : (
            <Typography.Text type="secondary">No diagram uploaded</Typography.Text>
          )}
        </div>
      </div>

      {/* Add Asset Modal */}
      <Modal
        title="Add New Asset"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText="OK"
        cancelText="Cancel"
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleAdd}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label={<span><span style={{ color: 'red' }}></span>Asset Name</span>} rules={[{ required: true, message: 'Please enter asset name' }]}>
                <Input placeholder="Enter asset name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="asset_type" label="Asset Type" rules={[{ required: true, message: 'Please enter asset type' }]}>
                <Select placeholder="Select asset type">
                  <Option value="Server">Server</Option>
                  <Option value="Database">Database</Option>
                  <Option value="Third party Application">Third party Application</Option>
                  <Option value="Firewall">Firewall</Option>
                  <Option value="End user device">End user device</Option>
                  <Option value="Cloud">Cloud</Option>
                  <Option value="Peripheral">Peripheral</Option>
                  <Option value="Network Switch">Network Switch</Option>
                  <Option value="Network Device">Network Device</Option>
                  <Option value="Printer">Printer</Option>
                  <Option value="Power back up">Power back up</Option>
                  <Option value="Projection(TV & Projector)">Projection(TV & Projector)</Option>
                  <Option value="Other">Other</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="service_provider" label="Service Provider">
                <Input placeholder="Select service provider"/>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="year_of_commissioning" label="Year of Commissioning">
                <Input type='number' min={1900} max={2025} placeholder="e.g., 2020" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="status" label="Status">
                <Select placeholder="Select status">
                  <Option value="active">Active</Option>
                  <Option value="retiring">Retiring</Option>
                  <Option value="decommissioned">Decommissioned</Option>
                  <Option value="faulty">Faulty</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="owner" label="Owner">
                <Input placeholder="e.g., IT Department" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="criticality" label="Criticality">
            <Select placeholder="Select criticality">
              <Option value="High">High</Option>
              <Option value="Medium">Medium</Option>
              <Option value="Low">Low</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ITInformationSection;
