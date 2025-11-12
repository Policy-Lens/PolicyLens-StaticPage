import React, { useState, useEffect, useCallback } from 'react';
import { Button, Divider, Typography, Table, Modal, Form, Input, Select, Row, Col, message } from 'antd';
import { PlusOutlined, DeleteOutlined, UndoOutlined } from '@ant-design/icons';
import { getCountryOptions } from '../../../../utils/getMasterData';
import { debounce } from 'lodash';

const { Title } = Typography;
const { Option } = Select;

const LocationsSection = ({ 
  locations, 
  setLocations, 
  isEditMode, 
  itemsToAdd, 
  setItemsToAdd,
  itemsToRemove,
  setItemsToRemove
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [countryOptions, setCountryOptions] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(false);

  // Load initial countries
  useEffect(() => {
    if (modalVisible) {
      loadCountries('');
    }
  }, [modalVisible]);

  const loadCountries = async (searchText) => {
    setLoadingCountries(true);
    try {
      const options = await getCountryOptions(searchText);
      setCountryOptions(options);
    } catch (error) {
      console.error('Error loading countries:', error);
    } finally {
      setLoadingCountries(false);
    }
  };

  const debouncedCountrySearch = useCallback(
    debounce((value) => loadCountries(value), 350),
    []
  );

  const handleAdd = (values) => {
    setItemsToAdd(prev => ({
      ...prev,
      add_location: [...prev.add_location, values]
    }));
    const newLocation = { ...values, id: `temp-${Date.now()}` };
    setLocations([...locations, newLocation]);
    setModalVisible(false);
    form.resetFields();
    message.success('Location added (will be saved when you click Save)');
  };

  const handleDelete = (id) => {
    if (String(id).startsWith('temp-')) {
      setLocations(locations.filter(item => item.id !== id));
      const tempLocations = locations.filter(item => String(item.id).startsWith('temp-'));
      const index = tempLocations.findIndex(t => t.id === id);
      setItemsToAdd(prev => ({
        ...prev,
        add_location: prev.add_location.filter((_, i) => i !== index)
      }));
    } else {
      setItemsToRemove(prev => ({
        ...prev,
        remove_locations: [...prev.remove_locations, id]
      }));
    }
  };

  const handleRevert = (id) => {
    setItemsToRemove(prev => ({
      ...prev,
      remove_locations: prev.remove_locations.filter(itemId => itemId !== id)
    }));
  };

  const isMarkedForDeletion = (id) => itemsToRemove.remove_locations.includes(id);

  const columns = [
    { title: 'Country', dataIndex: 'country', key: 'country' },
    { title: 'City', dataIndex: 'city', key: 'city' },
    { title: 'Zipcode', dataIndex: 'zipcode', key: 'zipcode' },
    { title: 'Headcount', dataIndex: 'headcount', key: 'headcount' },
    { title: 'Legal Status', dataIndex: 'legal_status', key: 'legal_status' },
    { title: 'Statutory Obligations', dataIndex: 'statutory_obligations', key: 'statutory_obligations' },
    { title: 'Regulatory Obligations', dataIndex: 'rugulatory_obligations', key: 'rugulatory_obligations' },
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
      <Title level={4} style={{ 
        display: 'flex', 
        alignItems: 'center',
        marginBottom: '16px',
        flex: 1,
        marginTop:"36px"
      }}>
        Location Specific Information
        <span style={{ 
          flex: 1, 
          height: '1px', 
          background: '#d9d9d9',
          marginLeft: '12px' 
        }}></span>
      </Title>

      <Table
        dataSource={locations}
        columns={columns}
        rowKey="id"
        pagination={false}
        locale={{ emptyText: 'No locations added' }}
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
          Add Location
        </Button>
      )}

      <style>{`
        .row-deleted {
          color: red;
        }
      `}</style>

      {/* Add Location Modal */}
      <Modal
        title="Add New Location"
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
              <Form.Item name="country" label={<span><span style={{ color: 'red' }}>* </span>Location Country</span>} rules={[{ required: true, message: 'Please select country' }]}>
                <Select
                  showSearch
                  placeholder="Select a country"
                  options={countryOptions}
                  loading={loadingCountries}
                  onSearch={debouncedCountrySearch}
                  filterOption={false}
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="city" label="Location City">
                <Select placeholder="Select a city">
                  <Option value="New York">New York</Option>
                  <Option value="Mumbai">Mumbai</Option>
                  <Option value="London">London</Option>
                  <Option value="Toronto">Toronto</Option>
                  <Option value="Sydney">Sydney</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="zipcode" label="Location Zip Code">
                <Input placeholder="Zip Code" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="headcount" label="Location Headcount">
                <Input placeholder="Headcount" type="number" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="legal_status" label="Legal status of the entity at the location">
            <Select placeholder="Select legal status">
              <Option value="Branch Office">Branch Office</Option>
              <Option value="Headquarters">Headquarters</Option>
              <Option value="Subsidiary">Subsidiary</Option>
              <Option value="Regional Office">Regional Office</Option>
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="statutory_obligations" label="Statutory Obligations">
                <Select placeholder="Select obligations">
                  <Option value="State tax compliance">State tax compliance</Option>
                  <Option value="Local regulations">Local regulations</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="rugulatory_obligations" label="Regulatory Obligations">
                <Select placeholder="Select obligations">
                  <Option value="Federal regulations">Federal regulations</Option>
                  <Option value="International standards">International standards</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};

export default LocationsSection;
