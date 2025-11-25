import React, { useState, useEffect } from "react";
import { Form, Table, Button, Input, InputNumber } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";

const EditableTable = ({ table, form, name }) => {
  const [columns, setColumns] = useState([]);

  useEffect(() => {
    // Initialize columns from table structure
    if (table?.columns) {
      const cols = table.columns.map((col, index) => ({
        title: col.name || `Column ${index + 1}`,
        dataIndex: `col_${index}`,
        key: `col_${index}`,
        width: 150,
        render: (text, record, rowIndex) => {
          const fieldName = [name, rowIndex, `col_${index}`];
          return (
            <Form.Item
              name={fieldName}
              style={{ margin: 0 }}
              rules={col.validation || []}
            >
              {col.type === "number" ? (
                <InputNumber style={{ width: "100%" }} />
              ) : (
                <Input placeholder={`Enter ${col.name}`} />
              )}
            </Form.Item>
          );
        },
      }));
      setColumns(cols);
    } else if (table?.headers) {
      // Fallback to headers if columns not available
      const cols = table.headers.map((header, index) => ({
        title: header || `Column ${index + 1}`,
        dataIndex: `col_${index}`,
        key: `col_${index}`,
        width: 150,
        render: (text, record, rowIndex) => {
          const fieldName = [name, rowIndex, `col_${index}`];
          return (
            <Form.Item name={fieldName} style={{ margin: 0 }}>
              <Input placeholder={`Enter ${header}`} />
            </Form.Item>
          );
        },
      }));
      setColumns(cols);
    }
  }, [table, name]);

  // Initialize form values with empty rows
  useEffect(() => {
    if (table?.num_rows && table.num_rows > 0) {
      const initialData = Array.from({ length: table.num_rows }, (_, index) =>
        Object.fromEntries(
          (table.columns || table.headers || []).map((col, colIndex) => [
            `col_${colIndex}`,
            "",
          ])
        )
      );
      form.setFieldsValue({ [name]: initialData });
    }
  }, [table, name, form]);

  const handleAddRow = () => {
    const currentData = form.getFieldValue(name) || [];
    const newRow = Object.fromEntries(
      columns.map((col, index) => [`col_${index}`, ""])
    );
    form.setFieldsValue({ [name]: [...currentData, newRow] });
  };

  const handleDeleteRow = (rowIndex) => {
    const currentData = form.getFieldValue(name) || [];
    const newData = currentData.filter((_, index) => index !== rowIndex);
    form.setFieldsValue({ [name]: newData });
  };

  const dataSource = form.getFieldValue(name) || [];

  const columnsWithActions = [
    ...columns,
    {
      title: "Actions",
      key: "actions",
      width: 100,
      render: (text, record, rowIndex) => (
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteRow(rowIndex)}
        >
          Delete
        </Button>
      ),
    },
  ];

  return (
    <div style={{ marginBottom: "24px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <h4>{table?.name || "Table"}</h4>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddRow}
          size="small"
        >
          Add Row
        </Button>
      </div>
      <Form.List name={name}>
        {(fields, { add, remove }) => (
          <Table
            dataSource={dataSource.map((row, index) => ({ ...row, key: index }))}
            columns={columnsWithActions}
            pagination={false}
            bordered
            size="small"
            rowKey={(record, index) => index}
          />
        )}
      </Form.List>
    </div>
  );
};

export default EditableTable;

