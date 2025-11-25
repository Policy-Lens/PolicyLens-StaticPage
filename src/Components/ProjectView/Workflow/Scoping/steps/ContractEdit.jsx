import { useState } from "react";
import { Card, Button, Collapse, Tag, Space } from "antd";
import { CloseOutlined, SaveOutlined } from "@ant-design/icons";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const { Panel } = Collapse;

const ContractEdit = ({
  clauses,
  originalClauses,
  onClauseChange,
  onClose,
  onSave,
  saving,
  hasChanges,
}) => {
  const [activeKey, setActiveKey] = useState(null); // Single active key for accordion

  const clauseLabels = [
    { key: "c1_services", label: "Clause 1. SERVICES" },
    { key: "c2_payment_terms", label: "Clause 2. PAYMENT TERMS" },
    { key: "c3_agreement_duration", label: "Clause 3. DURATION OF AGREEMENT" },
    { key: "c4_invoices", label: "Clause 4. INVOICES AND PAYMENTS" },
    { key: "c5_indemnification", label: "Clause 5. INDEMNIFICATION" },
    {
      key: "c6_proprietary_information",
      label: "Clause 6. PROPRIETARY INFORMATION",
    },
    { key: "c7_confidentiality", label: "Clause 7. CONFIDENTIALITY" },
    {
      key: "c8_non_disclosure",
      label: "Clause 8. NON-DISCLOSURE OF PROPRIETARY INFORMATION",
    },
    { key: "c9_return_of_documents", label: "Clause 9. RETURN OF DOCUMENTS" },
    { key: "c10_communication", label: "Clause 10. COMMUNICATIONS" },
    {
      key: "c11_use_of_work_product",
      label: "Clause 11. USE OF WORK PRODUCT AND RELIANCE",
    },
    {
      key: "c12_limitation_of_liability",
      label: "Clause 12. LIMITATION OF LIABILITY",
    },
    {
      key: "c13_limit_on_onligations",
      label: "Clause 13. LIMIT ON OBLIGATIONS",
    },
    { key: "c14_termination", label: "Clause 14. TERMINATION OF AGREEMENT" },
    { key: "c15_waiver", label: "Clause 15. WAIVER" },
    { key: "c16_entire_agreement", label: "Clause 16. ENTIRE AGREEMENT" },
    { key: "c17_assignment", label: "Clause 17. ASSIGNMENT" },
    { key: "c18_severability", label: "Clause 18. SEVERABILITY" },
    { key: "c19_notices", label: "Clause 19. NOTICES" },
    { key: "c20_dispute_resolution", label: "Clause 20. DISPUTE RESOLUTION" },
    { key: "c21_governing_law", label: "Clause 21. GOVERNING LAW" },
  ];

  const modules = {
    toolbar: [
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ align: [] }],
      ["clean"],
    ],
  };

  const formats = [
    "bold",
    "italic",
    "underline",
    "list",
    "bullet",
    "indent",
    "align",
  ];

  // Check if a specific clause has changes
  const hasClauseChanged = (key) => {
    return clauses[key] !== originalClauses[key];
  };

  // Count characters in HTML (strip tags for accurate count)
  const getCharCount = (html) => {
    const text = html.replace(/<[^>]*>/g, "");
    return text.length;
  };

  return (
    <Card
      style={{
        border: "2px solid #d9d9d9",
        background: "#fff",
        maxHeight: "calc(100vh - 350px)",
        display: "flex",
        flexDirection: "column",
      }}
      bodyStyle={{
        padding: 0,
        overflow: "auto",
        flex: 1,
      }}
      title={
        <div style={{ fontSize: 14, fontWeight: 600 }}>
          Edit Contract Clauses
        </div>
      }
      extra={
        <Space>
          {hasChanges && (
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={onSave}
              loading={saving}
              size="small"
            >
              Save
            </Button>
          )}
          <Button
            icon={<CloseOutlined />}
            onClick={onClose}
            type="text"
            size="small"
          />
        </Space>
      }
    >
      <Collapse
        activeKey={activeKey}
        onChange={setActiveKey}
        accordion={true}
        style={{ border: "none" }}
      >
        {clauseLabels.map(({ key, label }) => (
          <Panel
            key={key}
            header={
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <span style={{ fontSize: 12, fontWeight: 500 }}>{label}</span>
                {hasClauseChanged(key) && (
                  <Tag color="success" style={{ marginLeft: 8, fontSize: 10 }}>
                    Modified
                  </Tag>
                )}
              </div>
            }
            style={{
              borderBottom: "1px solid #f0f0f0",
              background: "#fff",
            }}
          >
            <div style={{ padding: "0 0 10px 0" }}>
              <ReactQuill
                theme="snow"
                value={clauses[key] || ""}
                onChange={(value) => onClauseChange(key, value)}
                modules={modules}
                formats={formats}
                style={{
                  background: "white",
                  borderRadius: 4,
                  minHeight: 150,
                }}
              />
              <div
                style={{
                  marginTop: 8,
                  fontSize: 11,
                  color: "#999",
                  textAlign: "right",
                }}
              >
                {getCharCount(clauses[key] || "")} characters
              </div>
            </div>
          </Panel>
        ))}
      </Collapse>
    </Card>
  );
};

export default ContractEdit;
