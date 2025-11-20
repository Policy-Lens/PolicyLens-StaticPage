import { useState, useEffect, useContext, lazy, Suspense } from "react";
import { Typography, Spin, message, Button, Space, Tooltip, Modal } from "antd";
import {
  FileProtectOutlined,
  EditOutlined,
  DownloadOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import ContractPreview from "./ContractPreview";
// import ContractEdit from './ContractEdit';
const ContractEdit = lazy(() => import("./ContractEdit"));
import html2pdf from "html2pdf.js";
import { motion, AnimatePresence } from "framer-motion";
import { ScopingContext } from "../../../../../Context/ScopingContext";
import { ProjectContext } from "../../../../../Context/ProjectContext";

const { Title, Text } = Typography;

const Contract = ({ projectId }) => {
  const { getContractClauses, updateContractClauses, getScopingData } =
    useContext(ScopingContext);

  const { projectRole } = useContext(ProjectContext);

  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [saving, setSaving] = useState(false);

  // Clause state
  const [clauses, setClauses] = useState({
    c1_services: "",
    c2_payment_terms: "",
    c3_agreement_duration: "",
    c4_invoices: "",
    c5_indemnification: "",
    c6_proprietary_information: "",
    c7_confidentiality: "",
    c8_non_disclosure: "",
    c9_return_of_documents: "",
    c10_communication: "",
    c11_use_of_work_product: "",
    c12_limitation_of_liability: "",
    c13_limit_on_onligations: "",
    c14_termination: "",
    c15_waiver: "",
    c16_entire_agreement: "",
    c17_assignment: "",
    c18_severability: "",
    c19_notices: "",
    c20_dispute_resolution: "",
    c21_governing_law: "",
  });

  // Original clauses for change tracking
  const [originalClauses, setOriginalClauses] = useState({});

  // Additional data for preview
  const [totalPrice, setTotalPrice] = useState(0);
  const [tranches, setTranches] = useState([]);
  const [companyDetails, setCompanyDetails] = useState({});
  const [consultantDetails, setConsultantDetails] = useState({});
  const [estimatedDays, setEstimatedDays] = useState({});
  const [signatures, setSignatures] = useState({});
  const [scopeStatus, setScopeStatus] = useState("completed");

  useEffect(() => {
    loadAllData();
  }, [projectId]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      // Load contract data - single API call
      const contractData = await getContractClauses(projectId);
      if (contractData) {
        // Extract clauses
        const clauseData = {
          c1_services: contractData.contract?.c1_services || "",
          c2_payment_terms: contractData.contract?.c2_payment_terms || "",
          c3_agreement_duration:
            contractData.contract?.c3_agreement_duration || "",
          c4_invoices: contractData.contract?.c4_invoices || "",
          c5_indemnification: contractData.contract?.c5_indemnification || "",
          c6_proprietary_information:
            contractData.contract?.c6_proprietary_information || "",
          c7_confidentiality: contractData.contract?.c7_confidentiality || "",
          c8_non_disclosure: contractData.contract?.c8_non_disclosure || "",
          c9_return_of_documents:
            contractData.contract?.c9_return_of_documents || "",
          c10_communication: contractData.contract?.c10_communication || "",
          c11_use_of_work_product:
            contractData.contract?.c11_use_of_work_product || "",
          c12_limitation_of_liability:
            contractData.contract?.c12_limitation_of_liability || "",
          c13_limit_on_onligations:
            contractData.contract?.c13_limit_on_onligations || "",
          c14_termination: contractData.contract?.c14_termination || "",
          c15_waiver: contractData.contract?.c15_waiver || "",
          c16_entire_agreement:
            contractData.contract?.c16_entire_agreement || "",
          c17_assignment: contractData.contract?.c17_assignment || "",
          c18_severability: contractData.contract?.c18_severability || "",
          c19_notices: contractData.contract?.c19_notices || "",
          c20_dispute_resolution:
            contractData.contract?.c20_dispute_resolution || "",
          c21_governing_law: contractData.contract?.c21_governing_law || "",
        };

        setClauses(clauseData);
        setOriginalClauses(clauseData);
        setScopeStatus(contractData.scope_status);

        // Set other data
        setTotalPrice(contractData.total_price || 0);
        setTranches(contractData.payment_tranches || []);
        setCompanyDetails(contractData.company_details || {});
        setConsultantDetails(contractData.consultant_details || {});
        setEstimatedDays(contractData.estimated_days_summary || {});
        setSignatures(contractData.signatures || {});
      }
    } catch (error) {
      console.error("Error loading contract data:", error);
      message.error("Failed to load contract data");
    } finally {
      setLoading(false);
    }
  };

  const handleClauseChange = (key, value) => {
    setClauses((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Check if there are any changes
  const hasChanges = () => {
    return Object.keys(clauses).some(
      (key) => clauses[key] !== originalClauses[key]
    );
  };

  // Check if user can edit (consultant admin only)
  const canEdit =
    projectRole === "consultant admin" && scopeStatus === "in_progress";

  const handleSave = async () => {
    try {
      setSaving(true);

      // Only send changed clauses
      const changedClauses = {};
      Object.keys(clauses).forEach((key) => {
        if (clauses[key] !== originalClauses[key]) {
          changedClauses[key] = clauses[key];
        }
      });

      if (Object.keys(changedClauses).length === 0) {
        message.info("No changes to save");
        return;
      }

      const result = await updateContractClauses(projectId, changedClauses);

      if (result.success) {
        message.success("Contract clauses saved successfully");
        setOriginalClauses(clauses); // Update original after successful save
      } else {
        message.error("Failed to save contract clauses");
      }
    } catch (error) {
      console.error("Error saving contract:", error);
      message.error("Failed to save contract clauses");
    } finally {
      setSaving(false);
    }
  };

  const handleCloseEdit = () => {
    if (hasChanges()) {
      Modal.confirm({
        title: "Unsaved Changes",
        icon: <ExclamationCircleOutlined />,
        content:
          "Closing this edit panel will revert all changes back to before. You will lose all the edited data.",
        okText: "Continue Editing",
        cancelText: "Yes, Close",
        onCancel: () => {
          setClauses(originalClauses); // Revert changes
          setIsEdit(false);
        },
      });
    } else {
      setIsEdit(false);
    }
  };

  const downloadPDF = () => {
    const element = document.getElementById("contract-preview");
    const opt = {
      margin: 10,
      filename: "contract.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };
    html2pdf().set(opt).from(element).save();
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Title
        level={4}
        style={{ display: "flex", justifyContent: "space-between" }}
      >
        <div>
          <FileProtectOutlined /> Contract
        </div>
        <Space>
          <Tooltip
            title={hasChanges() ? "Please save changes before downloading" : ""}
          >
            <Button
              onClick={downloadPDF}
              type="dashed"
              icon={<DownloadOutlined />}
              disabled={hasChanges()}
            >
              Download PDF
            </Button>
          </Tooltip>
        </Space>
      </Title>
      <Text type="secondary">
        Master Services Agreement and Non-Disclosure Agreement
      </Text>

      {/* Contract Layout */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          marginTop: 20,
          gap: 10,
        }}
      >
        {canEdit && (
          <AnimatePresence mode="wait">
            {isEdit ? (
              <Suspense
                fallback={
                  <div style={{ textAlign: "center", padding: "50px" }}>
                    <Spin size="large" />
                  </div>
                }
              >
                <motion.div
                  key="edit-panel"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 450, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    overflow: "hidden",
                    position: "sticky",
                    top: 0,
                    alignSelf: "flex-start",
                    maxHeight: "calc(100vh - 100px)",
                  }}
                >
                  <ContractEdit
                    clauses={clauses}
                    originalClauses={originalClauses}
                    onClauseChange={handleClauseChange}
                    onClose={handleCloseEdit}
                    onSave={handleSave}
                    saving={saving}
                    hasChanges={hasChanges()}
                  />
                </motion.div>
              </Suspense>
            ) : (
              <motion.div key="edit-button">
                <Button
                  style={{ margin: 10, borderRadius: "20px" }}
                  onClick={() => setIsEdit(true)}
                  icon={<EditOutlined />}
                />
              </motion.div>
            )}
          </AnimatePresence>
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          <ContractPreview
            clauses={clauses}
            totalPrice={totalPrice}
            tranches={tranches}
            companyDetails={companyDetails}
            consultantDetails={consultantDetails}
            estimatedDays={estimatedDays}
            signatures={signatures}
          />
        </div>
      </div>
    </div>
  );
};

export default Contract;
