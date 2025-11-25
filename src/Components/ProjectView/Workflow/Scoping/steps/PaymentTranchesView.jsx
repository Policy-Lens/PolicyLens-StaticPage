import React, { useState, useEffect, useContext } from "react";
import {
  Table,
  Typography,
  Spin,
  message,
  Button,
  Card,
  Tag,
  Alert,
} from "antd";
import { EditOutlined } from "@ant-design/icons";
import { ScopingContext } from "../../../../../Context/ScopingContext";

const { Title, Text } = Typography;

const PaymentTranchesView = ({ projectId, canEdit, onEdit }) => {
  const { getPaymentTranches, getPricingData } = useContext(ScopingContext);
  const [loading, setLoading] = useState(true);
  const [tranchesData, setTranchesData] = useState({
    tranches: [],
    total_percentage: 0,
  });
  const [grandTotal, setGrandTotal] = useState(0);

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load both tranches and pricing to calculate grand total
      const [tranchesResponse, pricingResponse] = await Promise.all([
        getPaymentTranches(projectId),
        getPricingData(projectId),
      ]);

      setTranchesData(
        tranchesResponse || { tranches: [], total_percentage: 0 }
      );

      // Calculate grand total from pricing
      const total = (pricingResponse || []).reduce((sum, item) => {
        return sum + (item.total_units || 0) * (item.unit_price || 0);
      }, 0);
      setGrandTotal(total);
    } catch (error) {
      console.error("Error loading payment tranches:", error);
      message.error("Failed to load payment tranches");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Sr. No.",
      key: "index",
      width: 80,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Particulars",
      dataIndex: "particular",
      key: "particular",
      width: 200,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: 300,
    },
    {
      title: "% of Total",
      dataIndex: "percentage_of_total",
      key: "percentage_of_total",
      width: 120,
      align: "right",
      render: (value) => `${value}%`,
    },
    {
      title: "Payable Amount",
      dataIndex: "percentage_of_total",
      key: "percentage_of_total",
      width: 150,
      align: "right",
      render: (value) => (
        <Text strong>
          ${(parseFloat(value || 0) * parseFloat(grandTotal)) / 100}
        </Text>
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
      title="Payment Tranches"
      extra={
        canEdit && (
          <Button type="primary" icon={<EditOutlined />} onClick={onEdit}>
            Edit
          </Button>
        )
      }
    >
      {tranchesData.total_percentage !== 100 &&
        tranchesData.tranches.length > 0 && (
          <Alert
            message="Warning"
            description={`Payment tranches must sum to 100%. Current total: ${tranchesData.total_percentage}%`}
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

      <Table
        columns={columns}
        dataSource={tranchesData.tranches}
        rowKey="id"
        pagination={false}
        bordered
        size="small"
        locale={{
          emptyText: "No payment tranches defined yet",
        }}
        footer={() => (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontWeight: "bold",
            }}
          >
            <span>Total</span>
            <span style={{ display: "flex", gap: 40 }}>
              <span>
                {tranchesData.total_percentage}%
                {tranchesData.total_percentage === 100 && (
                  <Tag color="green" style={{ marginLeft: 8 }}>
                    Valid
                  </Tag>
                )}
                {tranchesData.total_percentage !== 100 &&
                  tranchesData.tranches.length > 0 && (
                    <Tag color="red" style={{ marginLeft: 8 }}>
                      Invalid
                    </Tag>
                  )}
              </span>
              <span>${grandTotal.toLocaleString()}</span>
            </span>
          </div>
        )}
      />
    </Card>
  );
};

export default PaymentTranchesView;
