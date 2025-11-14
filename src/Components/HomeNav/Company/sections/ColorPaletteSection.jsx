import React, { useState } from 'react';
import { Button, Divider, Typography, Table, Modal, Form, Input, Space, message } from 'antd';
import { PlusOutlined, DeleteOutlined, UndoOutlined } from '@ant-design/icons';

const { Title } = Typography;

const ColorPaletteSection = ({ 
  colorPalette, 
  setColorPalette, 
  isEditMode, 
  itemsToAdd, 
  setItemsToAdd,
  itemsToRemove,
  setItemsToRemove
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const handleAdd = (values) => {
    setItemsToAdd(prev => ({
      ...prev,
      add_color: [...prev.add_color, values]
    }));
    const newColor = { ...values, id: `temp-${Date.now()}` };
    setColorPalette([...colorPalette, newColor]);
    setModalVisible(false);
    form.resetFields();
    message.success('Color added (will be saved when you click Save)');
  };

  const handleDelete = (id) => {
    if (String(id).startsWith('temp-')) {
      setColorPalette(colorPalette.filter(item => item.id !== id));
      const tempColors = colorPalette.filter(item => String(item.id).startsWith('temp-'));
      const index = tempColors.findIndex(t => t.id === id);
      setItemsToAdd(prev => ({
        ...prev,
        add_color: prev.add_color.filter((_, i) => i !== index)
      }));
    } else {
      setItemsToRemove(prev => ({
        ...prev,
        remove_colors: [...prev.remove_colors, id]
      }));
    }
  };

  const handleRevert = (id) => {
    setItemsToRemove(prev => ({
      ...prev,
      remove_colors: prev.remove_colors.filter(itemId => itemId !== id)
    }));
  };

  const isMarkedForDeletion = (id) => itemsToRemove.remove_colors.includes(id);

  const columns = [
    { title: 'Color Name', dataIndex: 'color_name', key: 'color_name' },
    { 
      title: 'Hex Code', 
      dataIndex: 'hex_code', 
      key: 'hex_code',
      render: (hex) => (
        <Space>
          <div style={{ width: 24, height: 24, backgroundColor: hex, border: '1px solid #d9d9d9', borderRadius: 4 }} />
          <span>{hex}</span>
        </Space>
      )
    },
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
        Company Color Palette
        <span style={{ 
          flex: 1, 
          height: '1px', 
          background: '#d9d9d9',
          marginLeft: '12px' 
        }}></span>
      </Title>

      <Table
        dataSource={colorPalette}
        columns={columns}
        rowKey="id"
        pagination={false}
        locale={{ emptyText: 'No colors added' }}
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
          Add Color
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

      {/* Add Color Modal */}
      <Modal
        title="Add Color"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText="Add"
      >
        <Form form={form} layout="vertical" onFinish={handleAdd}>
          <Form.Item name="color_name" label="Color Name" rules={[{ required: true, message: 'Please enter color name' }]}>
            <Input placeholder="e.g., Primary, Secondary" />
          </Form.Item>
          <Form.Item 
            name="hex_code" 
            label="Hex Code" 
            rules={[
              { required: true, message: 'Please enter hex code' },
              { pattern: /^#[0-9A-Fa-f]{6}$/, message: 'Please enter valid hex code (e.g., #212121)' }
            ]}
          >
            <Input placeholder="e.g., #212121" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ColorPaletteSection;
