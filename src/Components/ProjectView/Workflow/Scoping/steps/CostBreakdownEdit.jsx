import React, { useState, useEffect, useContext } from "react";
import {
  Table,
  Typography,
  Spin,
  message,
  Button,
  Card,
  Space,
  InputNumber,
  Input,
  Modal,
  Form,
  Popconfirm,
  Tag,
} from "antd";
import { PlusOutlined, DeleteOutlined, SaveOutlined } from "@ant-design/icons";
import { ScopingContext } from "../../../../../Context/ScopingContext";

const { Title, Text } = Typography;

const CostBreakdownEdit = ({ projectId, onCancel, onSave }) => {
  const {
    getPricingData,
    addPricingEntry,
    updatePricingEntry,
    deletePricingEntry,
  } = useContext(ScopingContext);
  const [loading, setLoading] = useState(true);
  const [pricingData, setPricingData] = useState([]);
  const [editingKey, setEditingKey] = useState("");
  const [editingValues, setEditingValues] = useState({});
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadPricingData();
  }, [projectId]);

  const loadPricingData = async () => {
    try {
      setLoading(true);
      const data = await getPricingData(projectId);
      setPricingData(data || []);
    } catch (error) {
      console.error("Error loading pricing data:", error);
      message.error("Failed to load pricing data");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record) => {
    setEditingKey(record.id);
    setEditingValues({
      unit_price: record.unit_price,
      total_units: record.total_units,
      title: record.title,
      unit_of_measurement: record.unit_of_measurement,
    });
  };

  const handleSaveRow = async (record) => {
    try {
      // Prepare update data based on generated_by
      const updateData = {};
      if (record.generated_by === "system") {
        // System generated - only unit_price can be updated
        updateData.unit_price = editingValues.unit_price;
      } else {
        // User generated - all fields can be updated
        updateData.title = editingValues.title;
        updateData.unit_of_measurement = editingValues.unit_of_measurement;
        updateData.total_units = editingValues.total_units;
        updateData.unit_price = editingValues.unit_price;
      }

      const result = await updatePricingEntry(record.id, updateData);
      if (result.success) {
        message.success("Pricing entry updated");
        setEditingKey("");
        loadPricingData();
        setHasChanges(true);
      } else {
        message.error("Failed to update pricing entry");
      }
    } catch (error) {
      message.error(error.data?.error || "Failed to update pricing entry");
    }
  };

  const handleDelete = async (priceId) => {
    try {
      const result = await deletePricingEntry(priceId);
      if (result.success) {
        message.success("Pricing entry deleted");
        loadPricingData();
        setHasChanges(true);
      } else {
        message.error("Failed to delete pricing entry");
      }
    } catch (error) {
      message.error(error.data?.error || "Failed to delete pricing entry");
    }
  };

  const handleAddEntry = async (values) => {
    try {
      const result = await addPricingEntry(projectId, values);
      if (result.success) {
        message.success("Pricing entry added");
        form.resetFields();
        setAddModalVisible(false);
        loadPricingData();
        setHasChanges(true);
      } else {
        message.error("Failed to add pricing entry");
      }
    } catch (error) {
      message.error(error.data?.error || "Failed to add pricing entry");
    }
  };

  const calculateTotal = () => {
    return pricingData.reduce((sum, item) => {
      const total = (item.total_units || 0) * (item.unit_price || 0);
      return sum + total;
    }, 0);
  };

  const columns = [
    {
      title: "Sr. No.",
      key: "index",
      width: 80,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Expense Head",
      key: "expense_head",
      width: 250,
      render: (_, record) => {
        if (editingKey === record.id && record.generated_by !== "system") {
          return (
            <Input
              value={editingValues.title}
              onChange={(e) =>
                setEditingValues({ ...editingValues, title: e.target.value })
              }
              placeholder="Enter title"
            />
          );
        }
        return (
          <div>
            <div>
              <Text strong>{record.title}</Text>
              {record.generated_by === "system" && (
                <Tag color="blue" style={{ marginLeft: 8 }}>
                  System
                </Tag>
              )}
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.expence_for}
            </Text>
          </div>
        );
      },
    },
    {
      title: "Unit of Measurement",
      dataIndex: "unit_of_measurement",
      key: "unit_of_measurement",
      width: 180,
      align: "center",
      render: (value, record) => {
        if (editingKey === record.id && record.generated_by !== "system") {
          return (
            <Input
              value={editingValues.unit_of_measurement}
              onChange={(e) =>
                setEditingValues({
                  ...editingValues,
                  unit_of_measurement: e.target.value,
                })
              }
              placeholder="e.g., days, trips"
            />
          );
        }
        return value || "-";
      },
    },
    {
      title: "Units",
      dataIndex: "total_units",
      key: "total_units",
      width: 120,
      align: "center",
      render: (value, record) => {
        if (editingKey === record.id && record.generated_by !== "system") {
          return (
            <InputNumber
              value={editingValues.total_units}
              onChange={(val) =>
                setEditingValues({ ...editingValues, total_units: val })
              }
              min={0}
              step={0.5}
              style={{ width: "100%" }}
            />
          );
        }
        return value || 0;
      },
    },
    {
      title: "Unit Price",
      dataIndex: "unit_price",
      key: "unit_price",
      width: 120,
      align: "right",
      render: (value, record) => {
        if (editingKey === record.id) {
          return (
            <InputNumber
              value={editingValues.unit_price}
              onChange={(val) =>
                setEditingValues({ ...editingValues, unit_price: val })
              }
              min={0}
              prefix="$"
              style={{ width: "100%" }}
            />
          );
        }
        return `$${(value || 0).toLocaleString()}`;
      },
    },
    {
      title: "Total Price",
      key: "total_price",
      width: 150,
      align: "right",
      render: (_, record) => {
        let total;
        if (editingKey === record.id) {
          total =
            (editingValues.total_units || 0) * (editingValues.unit_price || 0);
        } else {
          total = (record.total_units || 0) * (record.unit_price || 0);
        }
        return <Text strong>${total.toLocaleString()}</Text>;
      },
    },
    {
      title: "Action",
      key: "action",
      width: 150,
      fixed: "right",
      render: (_, record) => (
        <Space>
          {editingKey === record.id ? (
            <Button
              type="link"
              onClick={() => handleSaveRow(record)}
              icon={<SaveOutlined />}
            >
              Save
            </Button>
          ) : (
            <Button type="link" onClick={() => handleEdit(record)}>
              Edit
            </Button>
          )}
          {record.generated_by !== "system" && (
            <Popconfirm
              title="Delete this entry?"
              onConfirm={() => handleDelete(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button type="link" danger icon={<DeleteOutlined />}>
                Delete
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Card
      title="Cost Breakdown - Edit Mode"
      extra={
        <Space>
          {/* <Button onClick={onCancel}>Cancel</Button> */}
          <Button
            type="primary"
            onClick={() => (hasChanges ? onSave() : onCancel())}
          >
            Done
          </Button>
        </Space>
      }
    >
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => setAddModalVisible(true)}
        style={{ marginBottom: 16 }}
      >
        Add Entry
      </Button>

      <Table
        columns={columns}
        dataSource={pricingData}
        rowKey="id"
        pagination={false}
        bordered
        size="small"
        scroll={{ x: 1000 }}
        footer={() => (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontWeight: "bold",
            }}
          >
            <span>Total</span>
            <span>${calculateTotal().toLocaleString()}</span>
          </div>
        )}
      />

      {/* Add Entry Modal */}
      <Modal
        title="Add Pricing Entry"
        open={addModalVisible}
        onOk={() => form.submit()}
        onCancel={() => {
          setAddModalVisible(false);
          form.resetFields();
        }}
        okText="Add"
      >
        <Form form={form} onFinish={handleAddEntry} layout="vertical">
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: "Please enter title" }]}
          >
            <Input placeholder="e.g., Travel Expenses" />
          </Form.Item>
          <Form.Item
            name="expence_for"
            label="Expense For"
            rules={[{ required: true, message: "Please enter expense for" }]}
          >
            <Input placeholder="e.g., Site visits" />
          </Form.Item>
          <Form.Item
            name="unit_of_measurement"
            label="Unit of Measurement"
            rules={[{ required: true, message: "Please enter unit" }]}
          >
            <Input placeholder="e.g., trips, days" />
          </Form.Item>
          <Form.Item
            name="total_units"
            label="Total Units"
            rules={[{ required: true, message: "Please enter total units" }]}
          >
            <InputNumber
              min={0}
              step={0.5}
              style={{ width: "100%" }}
              placeholder="Enter quantity"
            />
          </Form.Item>
          <Form.Item
            name="unit_price"
            label="Unit Price"
            rules={[{ required: true, message: "Please enter unit price" }]}
          >
            <InputNumber
              min={0}
              prefix="$"
              style={{ width: "100%" }}
              placeholder="Enter price"
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default CostBreakdownEdit;
