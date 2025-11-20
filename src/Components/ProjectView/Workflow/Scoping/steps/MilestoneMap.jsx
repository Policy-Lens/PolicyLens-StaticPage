import React, { useState, useEffect, useContext } from "react";
import { Typography, Spin, message, Card } from "antd";
import { ScopingContext } from "../../../../../Context/ScopingContext";

const { Title, Text } = Typography;

const MilestoneMap = ({ projectId }) => {
  const { getMilestoneData } = useContext(ScopingContext);
  const [loading, setLoading] = useState(true);
  const [milestoneData, setMilestoneData] = useState([]);

  useEffect(() => {
    loadMilestoneData();
  }, [projectId]);

  const loadMilestoneData = async () => {
    try {
      setLoading(true);
      const data = await getMilestoneData(projectId);
      setMilestoneData(data || []);
    } catch (error) {
      console.error("Error loading milestone data:", error);
      message.error("Failed to load milestone data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  // Get max week from timeline data
  const maxWeek = Math.max(
    ...milestoneData.flatMap((item) => item.timeline_weeks || []),
    12
  );

  return (
    <div>
      <Title level={4}>Milestone Map</Title>
      <Text type="secondary">
        Project timeline and task schedule visualization
      </Text>

      <Card style={{ marginTop: 24, overflowX: "auto" }}>
        <table
          style={{ width: "100%", borderCollapse: "collapse", minWidth: 1200 }}
        >
          <thead>
            <tr style={{ borderBottom: "2px solid #e8e8e8" }}>
              <th
                style={{
                  padding: "12px 8px",
                  textAlign: "left",
                  width: 180,
                  borderRight: "1px solid #e8e8e8",
                }}
              >
                <Text strong>Task Title</Text>
              </th>
              <th
                style={{
                  padding: "12px 8px",
                  textAlign: "center",
                  width: 80,
                  borderRight: "1px solid #e8e8e8",
                }}
              >
                <Text strong>Start</Text>
              </th>
              <th
                style={{
                  padding: "12px 8px",
                  textAlign: "center",
                  width: 80,
                  borderRight: "1px solid #e8e8e8",
                }}
              >
                <Text strong>End</Text>
              </th>
              <th
                style={{
                  padding: "12px 8px",
                  textAlign: "center",
                  width: 60,
                  borderRight: "1px solid #e8e8e8",
                }}
              >
                <Text strong>Days</Text>
              </th>
              <th
                style={{
                  padding: "12px 8px",
                  textAlign: "left",
                  width: 200,
                  borderRight: "1px solid #e8e8e8",
                }}
              >
                <Text strong>Key Deliverable(s)</Text>
              </th>
              <th style={{ padding: "12px 8px", textAlign: "center" }}>
                <Text strong>Timeline (12 Weeks)</Text>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: 8,
                  }}
                >
                  {Array.from({ length: maxWeek }, (_, i) => (
                    <div
                      key={i}
                      style={{ flex: 1, textAlign: "center", fontSize: 11 }}
                    >
                      W{i + 1}
                    </div>
                  ))}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {milestoneData.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  style={{ padding: "40px", textAlign: "center" }}
                >
                  <Text type="secondary">
                    No milestone data available. Please add resource
                    requirements first.
                  </Text>
                </td>
              </tr>
            ) : (
              milestoneData.map((item, index) => (
                <tr key={index} style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <td
                    style={{
                      padding: "12px 8px",
                      borderRight: "1px solid #f0f0f0",
                    }}
                  >
                    <Text>{item.task_title}</Text>
                  </td>
                  <td
                    style={{
                      padding: "12px 8px",
                      textAlign: "center",
                      borderRight: "1px solid #f0f0f0",
                    }}
                  >
                    <Text>{item.start_week}</Text>
                  </td>
                  <td
                    style={{
                      padding: "12px 8px",
                      textAlign: "center",
                      borderRight: "1px solid #f0f0f0",
                    }}
                  >
                    <Text>{item.end_week}</Text>
                  </td>
                  <td
                    style={{
                      padding: "12px 8px",
                      textAlign: "center",
                      borderRight: "1px solid #f0f0f0",
                    }}
                  >
                    <Text>{item.duration_days}d</Text>
                  </td>
                  <td
                    style={{
                      padding: "12px 8px",
                      borderRight: "1px solid #f0f0f0",
                    }}
                  >
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {item.deliverable}
                    </Text>
                  </td>
                  <td style={{ padding: "12px 8px" }}>
                    <div
                      style={{
                        display: "flex",
                        position: "relative",
                        height: 32,
                        alignItems: "center",
                      }}
                    >
                      {Array.from({ length: maxWeek }, (_, weekIndex) => {
                        const isInRange = item.timeline_weeks?.includes(
                          weekIndex + 1
                        );
                        return (
                          <div
                            key={weekIndex}
                            style={{
                              flex: 1,
                              height: isInRange ? 24 : 4,
                              backgroundColor: isInRange
                                ? "#1890ff"
                                : "#f0f0f0",
                              borderRadius: isInRange ? 4 : 0,
                              margin: "0 2px",
                            }}
                          />
                        );
                      })}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export default MilestoneMap;
