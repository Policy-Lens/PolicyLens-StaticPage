import React, { useState, useEffect, useContext, lazy, Suspense } from "react";
import { Typography, Spin, Divider } from "antd";

const { Title, Text } = Typography;

// Lazy load view and edit components
// const CostBreakdownView = lazy(() => import('./CostBreakdownView'));
import CostBreakdownView from "./CostBreakdownView";
const CostBreakdownEdit = lazy(() => import("./CostBreakdownEdit"));
// const PaymentTranchesView = lazy(() => import('./PaymentTranchesView'));
import PaymentTranchesView from "./PaymentTranchesView";
const PaymentTranchesEdit = lazy(() => import("./PaymentTranchesEdit"));

const PriceTable = ({ projectId, canEdit, reloadData }) => {
  const [isCostEditMode, setIsCostEditMode] = useState(false);
  const [isTranchEditMode, setIsTranchEditMode] = useState(false);

  const handleCostDataUpdated = async () => {
    setIsCostEditMode(false);
    await reloadData();
  };

  const handleTranchDataUpdated = async () => {
    setIsTranchEditMode(false);
    await reloadData();
  };

  return (
    <div>
      <Title level={4}>Price Table</Title>
      <Text type="secondary">Project cost breakdown and payment schedule</Text>

      {/* Cost Breakdown Section */}
      <div style={{ marginTop: 24 }}>
        {isCostEditMode ? (
          <Suspense
            fallback={
              <div style={{ textAlign: "center", padding: "50px" }}>
                <Spin size="large" />
              </div>
            }
          >
            <CostBreakdownEdit
              projectId={projectId}
              onCancel={() => setIsCostEditMode(false)}
              onSave={handleCostDataUpdated}
            />
          </Suspense>
        ) : (
          <CostBreakdownView
            projectId={projectId}
            canEdit={canEdit}
            onEdit={() => setIsCostEditMode(true)}
          />
        )}
      </div>

      <Divider />

      {/* Payment Tranches Section */}
      <div style={{ marginTop: 24 }}>
        {isTranchEditMode ? (
          <Suspense
            fallback={
              <div style={{ textAlign: "center", padding: "50px" }}>
                <Spin size="large" />
              </div>
            }
          >
            <PaymentTranchesEdit
              projectId={projectId}
              onCancel={() => setIsTranchEditMode(false)}
              onSave={handleTranchDataUpdated}
            />
          </Suspense>
        ) : (
          <PaymentTranchesView
            projectId={projectId}
            canEdit={canEdit}
            onEdit={() => setIsTranchEditMode(true)}
          />
        )}
      </div>
    </div>
  );
};

export default PriceTable;
