import React from "react";
import { Table, Typography } from "antd";

const { Text } = Typography;

const ResourceRequirementsView = ({ data, selectedPhase }) => {
  const columns = [
    {
      title: "Phase Title",
      dataIndex: "phase",
      key: "phase",
      width: 180,
      render: (phase) => {
        const phaseLabels = {
          project_onboarding: "Project Onboarding",
          gap_analysis: "Gap Analysis",
          organizational_setup: "Organizational Setup",
          risk_analysis: "Risk Analysis",
          control_implementation: "Control Implementation",
          evidence_and_monitoring: "Evidence and Monitoring",
          internal_audit: "Internal Audit",
          document_library: "Document Library",
          sustenance: "Sustenance",
        };
        return <Text>{phaseLabels[phase] || phase}</Text>;
      },
    },
    {
      title: "Task Title",
      dataIndex: "task_title",
      key: "task_title",
      width: 300,
    },
    {
      title: "Est. Effort Required (man days)",
      children: [
        {
          title: "Lead Advisor",
          dataIndex: "la_est_days",
          key: "la_est_days",
          width: 120,
          align: "center",
        },
        {
          title: "Advisor",
          dataIndex: "a_est_days",
          key: "a_est_days",
          width: 120,
          align: "center",
        },
        {
          title: "Associate",
          dataIndex: "aa_est_days",
          key: "aa_est_days",
          width: 120,
          align: "center",
        },
        {
          title: "Technical",
          dataIndex: "ta_est_days",
          key: "ta_est_days",
          width: 120,
          align: "center",
        },
      ],
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={false}
      bordered
      size="small"
      scroll={{ x: 1000 }}
      locale={{
        emptyText:
          selectedPhase === "all"
            ? "No resource requirements defined yet"
            : "No tasks found for this phase",
      }}
    />
  );
};

export default ResourceRequirementsView;
