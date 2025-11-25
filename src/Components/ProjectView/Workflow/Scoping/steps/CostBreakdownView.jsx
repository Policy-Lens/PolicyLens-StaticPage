import React, { useState, useEffect, useContext } from "react";
import { Table, Typography, Spin, message, Button, Card, Tag } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { ScopingContext } from "../../../../../Context/ScopingContext";

const { Title, Text } = Typography;

const CostBreakdownView = ({ projectId, canEdit, onEdit }) => {
  const { getPricingData } = useContext(ScopingContext);
  const [loading, setLoading] = useState(true);
  const [pricingData, setPricingData] = useState([]);

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

  // Calculate total
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
      render: (_, record) => (
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
      ),
    },
    {
      title: "Unit of Measurement",
      dataIndex: "unit_of_measurement",
      key: "unit_of_measurement",
      width: 180,
      align: "center",
      render: (value) => value || "-",
    },
    {
      title: "Units",
      dataIndex: "total_units",
      key: "total_units",
      width: 100,
      align: "center",
      render: (value) => value || 0,
    },
    {
      title: "Unit Price",
      dataIndex: "unit_price",
      key: "unit_price",
      width: 120,
      align: "right",
      render: (value) => `$${(value || 0).toLocaleString()}`,
    },
    {
      title: "Total Price",
      key: "total_price",
      width: 150,
      align: "right",
      render: (_, record) => {
        const total = (record.total_units || 0) * (record.unit_price || 0);
        return <Text strong>${total.toLocaleString()}</Text>;
      },
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
      title="Cost Breakdown"
      extra={
        canEdit && (
          <Button type="primary" icon={<EditOutlined />} onClick={onEdit}>
            Edit
          </Button>
        )
      }
    >
      <Table
        columns={columns}
        dataSource={pricingData}
        rowKey="id"
        pagination={false}
        bordered
        size="small"
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
    </Card>
  );
};

export default CostBreakdownView;
