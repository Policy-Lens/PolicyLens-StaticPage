import React, { useState, useEffect, useCallback } from 'react';
import { Button, Divider, Typography, Table, Modal, Form, Input, Select, message } from 'antd';
import { PlusOutlined, DeleteOutlined, UndoOutlined } from '@ant-design/icons';
import { getCountryOptions } from '../../../../utils/getMasterData';
import { debounce } from 'lodash';

const { Title } = Typography;

const VendorsSection = ({ 
  vendors, 
  setVendors, 
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
      add_vendor: [...prev.add_vendor, values]
    }));
    const newVendor = { ...values, id: `temp-${Date.now()}` };
    setVendors([...vendors, newVendor]);
    setModalVisible(false);
    form.resetFields();
    message.success('Vendor added (will be saved when you click Save)');
  };

  const handleDelete = (id) => {
    if (String(id).startsWith('temp-')) {
      setVendors(vendors.filter(item => item.id !== id));
      const tempVendors = vendors.filter(item => String(item.id).startsWith('temp-'));
      const index = tempVendors.findIndex(t => t.id === id);
      setItemsToAdd(prev => ({
        ...prev,
        add_vendor: prev.add_vendor.filter((_, i) => i !== index)
      }));
    } else {
      setItemsToRemove(prev => ({
        ...prev,
        remove_vendors: [...prev.remove_vendors, id]
      }));
    }
  };

  const handleRevert = (id) => {
    setItemsToRemove(prev => ({
      ...prev,
      remove_vendors: prev.remove_vendors.filter(itemId => itemId !== id)
    }));
  };

  const isMarkedForDeletion = (id) => itemsToRemove.remove_vendors.includes(id);

  const columns = [
    { title: 'Vendor Name', dataIndex: 'vendor_name', key: 'vendor_name' },
    { title: 'Country Location', dataIndex: 'vendor_country', key: 'vendor_country' },
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
        flex: 1,
        marginTop:"36px"
      }}>
        List of Vendors
        <span style={{ 
          flex: 1, 
          height: '1px', 
          background: '#d9d9d9',
          marginLeft: '12px' 
        }}></span>
      </Title>

      <Table 
        dataSource={vendors} 
        columns={columns} 
        rowKey="id" 
        pagination={false} 
        locale={{ emptyText: 'No vendors added' }}
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
          Add Vendor
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

      <Modal
        title="Add Vendor"
        open={modalVisible}
        onCancel={() => { setModalVisible(false); form.resetFields(); }}
        onOk={() => form.submit()}
        okText="Add"
      >
        <Form form={form} layout="vertical" onFinish={handleAdd}>
          <Form.Item name="vendor_name" label="Vendor Name" rules={[{ required: true, message: 'Please enter vendor name' }]}>
            <Input placeholder="e.g., XYZ Supplies" />
          </Form.Item>
          <Form.Item name="vendor_country" label="Vendor Country Location" rules={[{ required: true, message: 'Please select vendor country' }]}>
            <Select
              showSearch
              placeholder="Select country"
              options={countryOptions}
              loading={loadingCountries}
              onSearch={debouncedCountrySearch}
              filterOption={false}
              allowClear
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default VendorsSection;
