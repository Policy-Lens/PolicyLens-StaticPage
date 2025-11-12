import React, { useState, useEffect, useCallback } from 'react';
import { Button, Divider, Typography, Table, Modal, Form, Input, Select, message } from 'antd';
import { PlusOutlined, DeleteOutlined, UndoOutlined } from '@ant-design/icons';
import { getCountryOptions } from '../../../../utils/getMasterData';
import { debounce } from 'lodash';

const { Title } = Typography;

const ClientsSection = ({ 
  clients, 
  setClients, 
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
      add_client: [...prev.add_client, values]
    }));
    const newClient = { ...values, id: `temp-${Date.now()}` };
    setClients([...clients, newClient]);
    setModalVisible(false);
    form.resetFields();
    message.success('Client added (will be saved when you click Save)');
  };

  const handleDelete = (id) => {
    if (String(id).startsWith('temp-')) {
      setClients(clients.filter(item => item.id !== id));
      const tempClients = clients.filter(item => String(item.id).startsWith('temp-'));
      const index = tempClients.findIndex(t => t.id === id);
      setItemsToAdd(prev => ({
        ...prev,
        add_client: prev.add_client.filter((_, i) => i !== index)
      }));
    } else {
      setItemsToRemove(prev => ({
        ...prev,
        remove_clients: [...prev.remove_clients, id]
      }));
    }
  };

  const handleRevert = (id) => {
    setItemsToRemove(prev => ({
      ...prev,
      remove_clients: prev.remove_clients.filter(itemId => itemId !== id)
    }));
  };

  const isMarkedForDeletion = (id) => itemsToRemove.remove_clients.includes(id);

  const columns = [
    { title: 'Client Name', dataIndex: 'client_name', key: 'client_name' },
    { title: 'Country Location', dataIndex: 'client_country', key: 'client_country' },
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
        Top 10 Clients
        <span style={{ 
          flex: 1, 
          height: '1px', 
          background: '#d9d9d9',
          marginLeft: '12px' 
        }}></span>
      </Title>

      <Table 
        dataSource={clients} 
        columns={columns} 
        rowKey="id" 
        pagination={false} 
        locale={{ emptyText: 'No clients added' }}
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
          Add Client
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
        title="Add Client"
        open={modalVisible}
        onCancel={() => { setModalVisible(false); form.resetFields(); }}
        onOk={() => form.submit()}
        okText="Add"
      >
        <Form form={form} layout="vertical" onFinish={handleAdd}>
          <Form.Item name="client_name" label="Client Name" rules={[{ required: true, message: 'Please enter client name' }]}>
            <Input placeholder="e.g., ABC Corp" />
          </Form.Item>
          <Form.Item name="client_country" label="Client Country Location" rules={[{ required: true, message: 'Please select client country' }]}>
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

export default ClientsSection;
