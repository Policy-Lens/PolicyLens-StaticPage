import React, { useState, useEffect, useContext, lazy, Suspense } from "react";
import { Button, Select, Typography, Spin, Space } from "antd";
import { ScopingContext } from "../../../../../Context/ScopingContext";

const { Title, Text } = Typography;

// Lazy load view and edit components
import ResourceRequirementsView from "./ResourceRequirementsView";
const ResourceRequirementsEdit = lazy(() =>
  import("./ResourceRequirementsEdit")
);

const ResourceRequirements = ({ projectId, canEdit, reloadData }) => {
  const { getResourceRequirements } = useContext(ScopingContext);
  const [isEditMode, setIsEditMode] = useState(false);
  const [rrList, setRrList] = useState([]);
  const [filteredRrList, setFilteredRrList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhase, setSelectedPhase] = useState("all");

  // Available phases
  const phases = [
    { value: "all", label: "All Phases" },
    { value: "project_onboarding", label: "Project Onboarding" },
    { value: "gap_analysis", label: "Gap Analysis" },
    { value: "organizational_setup", label: "Organizational Setup" },
    { value: "risk_assessment", label: "Risk Assessment" },
    {
      value: "planning_discussing_policies",
      label: "Planning & Discussing Policies",
    },
    { value: "implementation_policies", label: "Implementation of Policies" },
    { value: "data_analysis", label: "Data Analysis" },
    { value: "internal_audit_process", label: "Internal Audit Process" },
    { value: "audit_decision", label: "Audit Decision" },
    { value: "sustenance", label: "Sustenance" },
  ];

  useEffect(() => {
    loadResourceRequirements();
  }, [projectId]);

  useEffect(() => {
    filterByPhase();
  }, [selectedPhase, rrList]);

  const loadResourceRequirements = async () => {
    try {
      setLoading(true);
      const data = await getResourceRequirements(projectId);
      setRrList(data || []);
    } catch (error) {
      console.error("Error loading resource requirements:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterByPhase = () => {
    if (selectedPhase === "all") {
      setFilteredRrList(rrList);
    } else {
      setFilteredRrList(rrList.filter((item) => item.phase === selectedPhase));
    }
  };

  const handleEditToggle = () => {
    if (isEditMode) {
      // Reload data when exiting edit mode
      loadResourceRequirements();
    }
    setIsEditMode(!isEditMode);
  };

  const handleDataUpdated = async () => {
    await loadResourceRequirements();
    await reloadData(); // Reload all scoping data to update pricing
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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div>
          <Title level={4}>Resource Requirements</Title>
          <Text type="secondary">
            Manage task effort allocation for advisory roles
          </Text>
        </div>
        {canEdit && (
          <Button
            type={isEditMode ? "default" : "primary"}
            onClick={handleEditToggle}
          >
            {isEditMode ? "Cancel Edit" : "Edit"}
          </Button>
        )}
      </div>

      {!isEditMode && (
        <Space style={{ marginBottom: 16 }}>
          <Text>Filter by Phase:</Text>
          <Select
            value={selectedPhase}
            onChange={setSelectedPhase}
            options={phases}
            style={{ width: 250 }}
          />
        </Space>
      )}

      {isEditMode ? (
        <Suspense
          fallback={
            <div style={{ textAlign: "center", padding: "50px" }}>
              <Spin size="large" />
            </div>
          }
        >
          <ResourceRequirementsEdit
            projectId={projectId}
            initialData={rrList}
            onCancel={handleEditToggle}
            onSave={handleDataUpdated}
          />
        </Suspense>
      ) : (
        <ResourceRequirementsView
          data={filteredRrList}
          selectedPhase={selectedPhase}
        />
      )}
    </div>
  );
};

export default ResourceRequirements;
