import React, { useState } from 'react';
import { Button, Divider, Typography, Table, Modal, Form, Input, message } from 'antd';
import { PlusOutlined, DeleteOutlined, UndoOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { TextArea } = Input;

const FontsSection = ({ 
  fonts, 
  setFonts, 
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
      add_font: [...prev.add_font, values]
    }));
    const newFont = { ...values, id: `temp-${Date.now()}` };
    setFonts([...fonts, newFont]);
    setModalVisible(false);
    form.resetFields();
    message.success('Font added (will be saved when you click Save)');
  };

  const handleDelete = (id) => {
    if (String(id).startsWith('temp-')) {
      setFonts(fonts.filter(item => item.id !== id));
      const tempFonts = fonts.filter(item => String(item.id).startsWith('temp-'));
      const index = tempFonts.findIndex(t => t.id === id);
      setItemsToAdd(prev => ({
        ...prev,
        add_font: prev.add_font.filter((_, i) => i !== index)
      }));
    } else {
      setItemsToRemove(prev => ({
        ...prev,
        remove_fonts: [...prev.remove_fonts, id]
      }));
    }
  };

  const handleRevert = (id) => {
    setItemsToRemove(prev => ({
      ...prev,
      remove_fonts: prev.remove_fonts.filter(itemId => itemId !== id)
    }));
  };

  const isMarkedForDeletion = (id) => itemsToRemove.remove_fonts.includes(id);

  const columns = [
    { title: 'Font Name', dataIndex: 'font_name', key: 'font_name' },
    { title: 'Usage', dataIndex: 'font_usage', key: 'font_usage' },
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
        marginTop:"36px",
      }}>
        Company Font
        <span style={{ 
          flex: 1, 
          height: '1px', 
          background: '#d9d9d9',
          marginLeft: '12px' 
        }}></span>
      </Title>

      <Table 
        dataSource={fonts} 
        columns={columns} 
        rowKey="id" 
        pagination={false} 
        locale={{ emptyText: 'No fonts added' }}
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
          Add Font
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
        title="Add Font"
        open={modalVisible}
        onCancel={() => { setModalVisible(false); form.resetFields(); }}
        onOk={() => form.submit()}
        okText="Add"
      >
        <Form form={form} layout="vertical" onFinish={handleAdd}>
          <Form.Item name="font_name" label="Font Name" rules={[{ required: true }]}>
            <Input placeholder="e.g., Roboto" />
          </Form.Item>
          <Form.Item name="font_usage" label="Usage">
            <TextArea rows={2} placeholder="e.g., Headers and body text" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default FontsSection;
