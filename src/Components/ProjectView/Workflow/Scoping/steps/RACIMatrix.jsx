import React, { useState, useEffect, useContext } from "react";
import { Typography, Spin, message, Card, Select, Tag, Alert } from "antd";
import { ScopingContext } from "../../../../../Context/ScopingContext";
import { div } from "framer-motion/client";

const { Title, Text } = Typography;

const RACIMatrix = ({ projectId, canEdit }) => {
  const { getResourceRequirements, updateRACIMatrix } =
    useContext(ScopingContext);
  const [loading, setLoading] = useState(true);
  const [rrList, setRrList] = useState([]);
  const [updating, setUpdating] = useState({});

  // RACI role options
  const raciRoles = [
    { value: "lead advisor", label: "Lead Advisor", color: "blue" },
    { value: "advisor", label: "Advisor", color: "green" },
    { value: "associate advisor", label: "Associate Advisor", color: "orange" },
    { value: "technical advisor", label: "Technical Advisor", color: "purple" },
  ];

  useEffect(() => {
    loadResourceRequirements();
  }, [projectId]);

  const loadResourceRequirements = async () => {
    try {
      setLoading(true);
      const data = await getResourceRequirements(projectId);
      setRrList(data || []);
    } catch (error) {
      console.error("Error loading resource requirements:", error);
      message.error("Failed to load resource requirements");
    } finally {
      setLoading(false);
    }
  };

  const handleRACIChange = async (rrId, field, value) => {
    try {
      setUpdating({ ...updating, [`${rrId}-${field}`]: true });

      const result = await updateRACIMatrix(rrId, { [field]: value });

      if (result.success) {
        // Update local state
        setRrList(
          rrList.map((item) =>
            item.id === rrId ? { ...item, [field]: value } : item
          )
        );
        message.success("RACI assignment updated");
      } else {
        message.error("Failed to update RACI assignment");
      }
    } catch (error) {
      message.error(error.data?.error || "Failed to update RACI assignment");
    } finally {
      setUpdating({ ...updating, [`${rrId}-${field}`]: false });
    }
  };

  const getRoleColor = (role) => {
    const roleConfig = raciRoles.find((r) => r.value === role);
    return roleConfig?.color || "default";
  };

  const getRoleLabel = (role) => {
    const roleConfig = raciRoles.find((r) => r.value === role);
    return roleConfig?.label || role;
  };

  const getPhaseLabel = (phase) => {
    const phaseLabels = {
      project_onboarding: "Project Onboarding",
      gap_analysis: "Gap Analysis",
      organizational_setup: "Organizational Setup",
      risk_assessment: "Risk Assessment",
      planning_discussing_policies: "Planning & Discussing Policies",
      implementation_policies: "Implementation of Policies",
      data_analysis: "Data Analysis",
      internal_audit_process: "Internal Audit Process",
      audit_decision: "Audit Decision",
      sustenance: "Sustenance",
    };
    return phaseLabels[phase] || phase;
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      {/* RACI Legend */}
      <Card
        style={{ border: "1px solid gray", background: "#fafafa" }}
        size="small"
      >
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Text strong style={{ marginRight: 16 }}>
            {" "}
            RACI Legend
          </Text>
        </div>
        <div style={{ marginLeft: 16, marginTop: 8 }}>
          <div>
            <Text strong>R - Responsible:</Text>{" "}
            <Text type="secondary">The person who performs the task</Text>
          </div>
          <div>
            <Text strong>A - Accountable:</Text>{" "}
            <Text type="secondary">
              The person ultimately answerable for the task
            </Text>
          </div>
          <div>
            <Text strong>C - Consulted:</Text>{" "}
            <Text type="secondary">Person whose input is sought</Text>
          </div>
          <div>
            <Text strong>I - Informed:</Text>{" "}
            <Text type="secondary">
              Person who is kept up-to-date on progress
            </Text>
          </div>
        </div>
      </Card>

      {/* RACI Matrix Table */}
      <Card
        title={
          <div>
            <Title level={4} style={{ marginTop: 8 }}>
              RACI Matrix
            </Title>
            <Text
              type="secondary"
              style={{ display: "block", marginBottom: 16 }}
            >
              Responsibility assignment based on effort allocation
            </Text>
          </div>
        }
        size="small"
        style={{ marginTop: 24 }}
      >
        {rrList.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Text type="secondary">
              No resource requirements defined. Please add tasks in the Resource
              Requirements step first.
            </Text>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 1000,
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: "2px solid #e8e8e8",
                    background: "#fafafa",
                  }}
                >
                  <th
                    style={{
                      padding: "12px 8px",
                      textAlign: "left",
                      width: 180,
                    }}
                  >
                    <Text strong>Phase Title</Text>
                  </th>
                  <th
                    style={{
                      padding: "12px 8px",
                      textAlign: "left",
                      width: 250,
                    }}
                  >
                    <Text strong>Task Title</Text>
                  </th>
                  <th
                    style={{
                      padding: "12px 8px",
                      textAlign: "center",
                      width: 150,
                    }}
                  >
                    <Text strong>Responsible</Text>
                  </th>
                  <th
                    style={{
                      padding: "12px 8px",
                      textAlign: "center",
                      width: 150,
                    }}
                  >
                    <Text strong>Accountable</Text>
                  </th>
                  <th
                    style={{
                      padding: "12px 8px",
                      textAlign: "center",
                      width: 150,
                    }}
                  >
                    <Text strong>Consulted</Text>
                  </th>
                  <th
                    style={{
                      padding: "12px 8px",
                      textAlign: "center",
                      width: 150,
                    }}
                  >
                    <Text strong>Informed</Text>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rrList.map((item, index) => (
                  <tr
                    key={item.id}
                    style={{ borderBottom: "1px solid #f0f0f0" }}
                  >
                    <td style={{ padding: "12px 8px" }}>
                      <Text>{getPhaseLabel(item.phase)}</Text>
                    </td>
                    <td style={{ padding: "12px 8px" }}>
                      <Text>{item.task_title}</Text>
                    </td>
                    <td style={{ padding: "12px 8px", textAlign: "center" }}>
                      {canEdit ? (
                        <Select
                          value={item.responsible}
                          onChange={(value) =>
                            handleRACIChange(item.id, "responsible", value)
                          }
                          options={raciRoles}
                          style={{ width: "100%" }}
                          placeholder="Select role"
                          loading={updating[`${item.id}-responsible`]}
                          allowClear
                        />
                      ) : item.responsible ? (
                        <Tag color={getRoleColor(item.responsible)}>
                          {getRoleLabel(item.responsible)}
                        </Tag>
                      ) : (
                        <Text type="secondary">-</Text>
                      )}
                    </td>
                    <td style={{ padding: "12px 8px", textAlign: "center" }}>
                      {canEdit ? (
                        <Select
                          value={item.accountable}
                          onChange={(value) =>
                            handleRACIChange(item.id, "accountable", value)
                          }
                          options={raciRoles}
                          style={{ width: "100%" }}
                          placeholder="Select role"
                          loading={updating[`${item.id}-accountable`]}
                          allowClear
                        />
                      ) : item.accountable ? (
                        <Tag color={getRoleColor(item.accountable)}>
                          {getRoleLabel(item.accountable)}
                        </Tag>
                      ) : (
                        <Text type="secondary">-</Text>
                      )}
                    </td>
                    <td style={{ padding: "12px 8px", textAlign: "center" }}>
                      {canEdit ? (
                        <Select
                          value={item.consulted}
                          onChange={(value) =>
                            handleRACIChange(item.id, "consulted", value)
                          }
                          options={raciRoles}
                          style={{ width: "100%" }}
                          placeholder="Select role"
                          loading={updating[`${item.id}-consulted`]}
                          allowClear
                        />
                      ) : item.consulted ? (
                        <Tag color={getRoleColor(item.consulted)}>
                          {getRoleLabel(item.consulted)}
                        </Tag>
                      ) : (
                        <Text type="secondary">-</Text>
                      )}
                    </td>
                    <td style={{ padding: "12px 8px", textAlign: "center" }}>
                      {canEdit ? (
                        <Select
                          value={item.informed}
                          onChange={(value) =>
                            handleRACIChange(item.id, "informed", value)
                          }
                          options={raciRoles}
                          style={{ width: "100%" }}
                          placeholder="Select role"
                          loading={updating[`${item.id}-informed`]}
                          allowClear
                        />
                      ) : item.informed ? (
                        <Tag color={getRoleColor(item.informed)}>
                          {getRoleLabel(item.informed)}
                        </Tag>
                      ) : (
                        <Text type="secondary">-</Text>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
};

export default RACIMatrix;
