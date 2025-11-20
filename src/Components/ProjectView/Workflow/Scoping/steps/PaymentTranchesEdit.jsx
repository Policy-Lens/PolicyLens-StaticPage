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
  Alert,
  Tag,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import { ScopingContext } from "../../../../../Context/ScopingContext";

const { Title, Text } = Typography;

const PaymentTranchesEdit = ({ projectId, onCancel, onSave }) => {
  const { getPaymentTranches, updatePaymentTranches, getPricingData } =
    useContext(ScopingContext);
  const [loading, setLoading] = useState(true);
  const [tranches, setTranches] = useState([]);
  const [grandTotal, setGrandTotal] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteList, setDeleteList] = useState(new Set());

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load both tranches and pricing
      const [tranchesResponse, pricingResponse] = await Promise.all([
        getPaymentTranches(projectId),
        getPricingData(projectId),
      ]);

      const tranchesData = tranchesResponse?.tranches || [];
      setTranches(tranchesData.map((t) => ({ ...t, key: t.id })));

      // Calculate grand total
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

  const calculateTotalPercentage = () => {
    return tranches.reduce(
      (sum, tranche) =>
        deleteList.has(tranche.key)
          ? sum
          : sum + parseFloat(tranche.percentage_of_total || 0),
      0
    );
  };

  const handleAddTranche = () => {
    const newTranche = {
      key: `new-${Date.now()}`,
      id: null,
      particular: "",
      description: "",
      percentage_of_total: 0,
      payable_amount: 0,
    };
    setTranches([...tranches, newTranche]);
    setHasChanges(true);
  };

  const handleDeleteTranche = (key) => {
    // setTranches(tranches.filter(t => t.key !== key));
    if (key.startsWith("new-")) {
      setTranches(tranches.filter((t) => t.key !== key));
    }
    setDeleteList((prev) => new Set(prev.add(key)));
    setHasChanges(true);
  };

  const handleFieldChange = (key, field, value) => {
    setTranches(
      tranches.map((t) => {
        if (t.key === key) {
          const updated = { ...t, [field]: value };

          // Auto-calculate payable amount when percentage changes
          if (field === "percentage_of_total") {
            updated.payable_amount = Math.round((value / 100) * grandTotal);
          }

          return updated;
        }
        return t;
      })
    );
    setHasChanges(true);
  };

  const handleSave = async () => {
    // Validate
    const totalPercentage = calculateTotalPercentage();
    if (totalPercentage !== 100) {
      message.error(
        `Payment tranches must sum to 100%. Current total: ${totalPercentage}%`
      );
      return;
    }

    for (const tranche of tranches) {
      if (!tranche.particular || !tranche.particular.trim()) {
        message.error("All tranches must have a particular name");
        return;
      }
      if (!tranche.description || !tranche.description.trim()) {
        message.error("All tranches must have a description");
        return;
      }
    }

    try {
      setSaving(true);

      // Prepare data
      const afterDeleteList = tranches.filter((t) => !deleteList.has(t.key));
      const updated_list = afterDeleteList.map((t, index) => ({
        id: t.id,
        particular: t.particular,
        description: t.description,
        percentage_of_total: t.percentage_of_total || 0,
      }));

      // Find deleted tranches - compare with original loaded data
      const delete_list = Array.from(deleteList);
      // Since we need original IDs, we'd need to track them. For simplicity, we're just passing empty array
      // The backend will handle deletion based on what's not in updated_list

      const result = await updatePaymentTranches(projectId, {
        updated_list,
        delete_list,
      });

      if (result.success) {
        message.success("Payment tranches updated successfully");
        setHasChanges(false);
        onSave();
      } else {
        message.error("Failed to update payment tranches");
      }
    } catch (error) {
      message.error(error.data?.error || "Failed to update payment tranches");
    } finally {
      setSaving(false);
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
      width: 180,
      render: (value, record) => (
        <Input
          value={value}
          onChange={(e) =>
            handleFieldChange(record.key, "particular", e.target.value)
          }
          placeholder="e.g., Tranch 1"
        />
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: 300,
      render: (value, record) => (
        <Input
          value={value}
          onChange={(e) =>
            handleFieldChange(record.key, "description", e.target.value)
          }
          placeholder="e.g., On completion of milestone #1"
        />
      ),
    },
    {
      title: "% of Total",
      dataIndex: "percentage_of_total",
      key: "percentage_of_total",
      width: 120,
      render: (value, record) => (
        <InputNumber
          value={value}
          onChange={(val) =>
            handleFieldChange(record.key, "percentage_of_total", val)
          }
          min={0}
          max={100}
          suffix="%"
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "Payable Amount",
      dataIndex: "payable_amount",
      key: "payable_amount",
      width: 150,
      render: (value, record) => (
        <InputNumber
          value={value}
          onChange={(val) =>
            handleFieldChange(record.key, "payable_amount", val)
          }
          min={0}
          prefix="$"
          style={{ width: "100%" }}
          disabled
        />
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 100,
      render: (_, record) =>
        !deleteList || !deleteList.has(record.key) ? (
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteTranche(record.key)}
          >
            Delete
          </Button>
        ) : (
          <Button
            type="link"
            danger
            icon={<UndoOutlined />}
            onClick={() =>
              setDeleteList((prev) => {
                const newSet = new Set(prev);
                newSet.delete(record.key);
                return newSet;
              })
            }
          >
            Restore
          </Button>
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

  const totalPercentage = calculateTotalPercentage();
  const isValidTotal = totalPercentage === 100;

  return (
    <Card
      title="Payment Tranches - Edit Mode"
      extra={
        <Space>
          <Button onClick={onCancel}>Cancel</Button>
          <Button
            type="primary"
            onClick={handleSave}
            disabled={!hasChanges || !isValidTotal}
            loading={saving}
            icon={<SaveOutlined />}
          >
            Save
          </Button>
        </Space>
      }
    >
      {!isValidTotal && tranches.length > 0 && (
        <Alert
          message="Invalid Total"
          description={`Payment tranches must sum to 100%. Current total: ${totalPercentage}%`}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Button
        type="dashed"
        icon={<PlusOutlined />}
        onClick={handleAddTranche}
        style={{ marginBottom: 16 }}
        block
      >
        Add Tranche
      </Button>

      <Table
        columns={columns}
        dataSource={tranches}
        rowKey="key"
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
            <span style={{ display: "flex", gap: 40 }}>
              <span>
                {totalPercentage}%
                {isValidTotal && (
                  <Tag color="green" style={{ marginLeft: 8 }}>
                    Valid
                  </Tag>
                )}
                {!isValidTotal && tranches.length > 0 && (
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

export default PaymentTranchesEdit;
