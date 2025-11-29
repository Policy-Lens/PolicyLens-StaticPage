import { useState, useContext } from "react";
import { Typography, Card, Radio, Space, Table, Alert, message } from "antd";
import { OnboardingContext } from "../../../../../Context/OnboardingContext";

const { Title, Text } = Typography;

const RiskRatingSetup = ({
  projectId,
  canEdit,
  onboardingData,
  riskRatingSetup,
}) => {
  const { updateRiskRatingScale } = useContext(OnboardingContext);
  const [updating, setUpdating] = useState(false);

  const selectedScale = riskRatingSetup?.risk_rating_scale;
  const isReadOnly = onboardingData?.status === "completed";

  const handleScaleChange = async (e) => {
    const scale = e.target.value;
    try {
      setUpdating(true);
      const result = await updateRiskRatingScale(projectId, scale);
      if (result.success) {
        message.success("Risk rating scale updated successfully");
      }
    } catch (error) {
      message.error("Failed to update risk rating scale");
    } finally {
      setUpdating(false);
    }
  };

  // Severity Rank Tables
  const severityData = {
    3: [
      { rank: "Minor", score: 1 },
      { rank: "Moderate", score: 2 },
      { rank: "High", score: 3 },
    ],
    5: [
      { rank: "Negligible", score: 1 },
      { rank: "Minor", score: 2 },
      { rank: "Moderate", score: 3 },
      { rank: "Very High", score: 4 },
      { rank: "Catastrophic", score: 5 },
    ],
    10: [
      { rank: "Negligible", score: 1 },
      { rank: "Minor", score: 2 },
      { rank: "Slight", score: 3 },
      { rank: "Moderate", score: 4 },
      { rank: "Serious", score: 5 },
      { rank: "High", score: 6 },
      { rank: "Very High", score: 7 },
      { rank: "Significant", score: "8-9" },
      { rank: "Catastrophic", score: 10 },
    ],
  };

  // Likelihood Rank Tables
  const likelihoodData = {
    3: [
      { description: "Improbable", value: "NA" },
      { description: "Unlikely", value: 1 },
      { description: "Probable", value: "NA" },
      { description: "Likely", value: 2 },
      { description: "Very likely", value: 3 },
      { description: "Recent", value: "NA" },
      { description: "Recurring", value: "NA" },
    ],
    5: [
      { description: "Improbable", value: 1 },
      { description: "Unlikely", value: 2 },
      { description: "Probable", value: 3 },
      { description: "Likely", value: 3 },
      { description: "Very likely", value: 4 },
      { description: "Recent", value: 5 },
      { description: "Recurring", value: 5 },
    ],
    10: [
      { description: "Improbable", value: 1 },
      { description: "Unlikely", value: 2 },
      { description: "Probable", value: "3-5" },
      { description: "Likely", value: "3-5" },
      { description: "Very likely", value: "6-8" },
      { description: "Recent", value: 9 },
      { description: "Recurring", value: 10 },
    ],
  };

  // Consequence Ranks (static for all scales)
  const consequenceData = [
    { aspect: "Confidentiality", y: 1, n: 0 },
    { aspect: "Integrity", y: 1, n: 0 },
    { aspect: "Availability", y: 1, n: 0 },
    { aspect: "Privacy", y: 1, n: 0 },
  ];

  // Existing Control Strength
  const controlStrengthData = {
    3: [
      { status: "Not defined", value: 3 },
      { status: "Defined", value: "NA" },
      { status: "Documented", value: 2 },
      { status: "Partially Implemented", value: 2 },
      { status: "Fully Implemented", value: 3 },
      { status: "Monitored", value: "NA" },
      { status: "Monitored and governed", value: "NA" },
    ],
    5: [
      { status: "Not defined", value: 5 },
      { status: "Defined", value: 4 },
      { status: "Documented", value: 4 },
      { status: "Partially Implemented", value: 3 },
      { status: "Fully Implemented", value: 2 },
      { status: "Monitored", value: 2 },
      { status: "Monitored and governed", value: 1 },
    ],
    10: [
      { status: "Not defined", value: 10 },
      { status: "Defined", value: 9 },
      { status: "Documented", value: 8 },
      { status: "Partially Implemented", value: 7 },
      { status: "Fully Implemented", value: "6-4" },
      { status: "Monitored", value: "3-2" },
      { status: "Monitored and governed", value: 1 },
    ],
  };

  // Threshold/Color Logic
  const thresholdData = {
    3: {
      significant: 32,
      levels: [
        {
          level: "High",
          color: "Red",
          range: "Score >= 32",
          logic: "Equal to or above the Significant Risk Threshold.",
        },
        {
          level: "Medium",
          color: "Yellow",
          range: "17 <= Score <= 31",
          logic: "Approaching the high risk threshold.",
        },
        {
          level: "Low",
          color: "Green",
          range: "Score <= 16",
          logic: "Acceptable risk level.",
        },
      ],
    },
    5: {
      significant: 108,
      levels: [
        {
          level: "High",
          color: "Red",
          range: "Score >= 108",
          logic: "Equal to or above the Significant Risk Threshold.",
        },
        {
          level: "Medium",
          color: "Yellow",
          range: "55 <= Score <= 107",
          logic: "Approaching the high risk threshold.",
        },
        {
          level: "Low",
          color: "Green",
          range: "Score <= 54",
          logic: "Acceptable risk level.",
        },
      ],
    },
    10: {
      significant: 448,
      levels: [
        {
          level: "High",
          color: "Red",
          range: "Score >= 448",
          logic: "Equal to or above the Significant Risk Threshold.",
        },
        {
          level: "Medium",
          color: "Yellow",
          range: "225 <= Score <= 447",
          logic: "Approaching the high risk threshold.",
        },
        {
          level: "Low",
          color: "Green",
          range: "Score <= 224",
          logic: "Acceptable risk level.",
        },
      ],
    },
  };

  const severityColumns = [
    {
      title: "Descriptive Severity Rank",
      dataIndex: "rank",
      key: "rank",
    },
    {
      title: `${selectedScale}-Pointer Score`,
      dataIndex: "score",
      key: "score",
      align: "center",
    },
  ];

  const likelihoodColumns = [
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: "70%",
    },
    {
      title: "Value",
      dataIndex: "value",
      key: "value",
      align: "center",
    },
  ];

  const consequenceColumns = [
    { title: "", dataIndex: "aspect", key: "aspect" },
    { title: "Y", dataIndex: "y", key: "y", align: "center" },
    { title: "N", dataIndex: "n", key: "n", align: "center" },
  ];

  const controlColumns = [
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: "70%",
    },
    {
      title: "Value",
      dataIndex: "value",
      key: "value",
      align: "center",
    },
  ];

  const thresholdColumns = [
    {
      title: "Risk Level",
      dataIndex: "level",
      key: "level",
      render: (text, record) => (
        <Space>
          <span
            style={{
              display: "inline-block",
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor:
                record.color === "Red"
                  ? "#ff4d4f"
                  : record.color === "Yellow"
                  ? "#faad14"
                  : "#52c41a",
            }}
          />
          {text}
        </Space>
      ),
    },
    { title: "Color Code", dataIndex: "color", key: "color" },
    { title: "Score Range", dataIndex: "range", key: "range" },
    { title: "Logic", dataIndex: "logic", key: "logic" },
  ];

  return (
    <div>
      <Card>
        <Title level={5}>Select Risk Rating Scale</Title>
        {!selectedScale && !isReadOnly && (
          <Alert
            message="Please select a risk rating scale to continue"
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        {canEdit && !isReadOnly ? (
          <Radio.Group
            value={selectedScale}
            onChange={handleScaleChange}
            disabled={updating}
            style={{ marginTop: 16 }}
          >
            <Space direction="horizontal" size="large">
              <Card
                hoverable={!updating}
                style={{
                  border:
                    selectedScale === 3
                      ? "2px solid #1890ff"
                      : "1px solid #d9d9d9",
                  cursor: updating ? "not-allowed" : "pointer",
                }}
                onClick={() =>
                  !updating &&
                  !selectedScale &&
                  handleScaleChange({ target: { value: 3 } })
                }
              >
                <Radio value={3} disabled={updating}>
                  <div>
                    <Text strong>3-Point Scale</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Low, Medium, High
                    </Text>
                  </div>
                </Radio>
              </Card>

              <Card
                hoverable={!updating}
                style={{
                  border:
                    selectedScale === 5
                      ? "2px solid #1890ff"
                      : "1px solid #d9d9d9",
                  cursor: updating ? "not-allowed" : "pointer",
                }}
                onClick={() =>
                  !updating &&
                  !selectedScale &&
                  handleScaleChange({ target: { value: 5 } })
                }
              >
                <Radio value={5} disabled={updating}>
                  <div>
                    <Text strong>5-Point Scale</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Very Low to Very High
                    </Text>
                  </div>
                </Radio>
              </Card>

              <Card
                hoverable={!updating}
                style={{
                  border:
                    selectedScale === 10
                      ? "2px solid #1890ff"
                      : "1px solid #d9d9d9",
                  cursor: updating ? "not-allowed" : "pointer",
                }}
                onClick={() =>
                  !updating &&
                  !selectedScale &&
                  handleScaleChange({ target: { value: 10 } })
                }
              >
                <Radio value={10} disabled={updating}>
                  <div>
                    <Text strong>10-Point Scale</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Numerical scale 1-10
                    </Text>
                  </div>
                </Radio>
              </Card>
            </Space>
          </Radio.Group>
        ) : (
          <div style={{ marginTop: 16 }}>
            {selectedScale ? (
              <Alert
                message={`Selected Scale: ${selectedScale}-Point Scale`}
                type="info"
                showIcon
              />
            ) : (
              <Alert
                message="No risk rating scale selected"
                type="warning"
                showIcon
              />
            )}
          </div>
        )}
      </Card>

      {selectedScale && (
        <Space
          direction="vertical"
          size="large"
          style={{ width: "100%", marginTop: 24 }}
        >
          {/* 1. Severity Rank Table */}
          <Card>
            <Title level={5}>
              1. Severity Rank Table ({selectedScale}-Point Scale)
            </Title>
            <Table
              dataSource={severityData[selectedScale]}
              columns={severityColumns}
              pagination={false}
              size="small"
              rowKey="rank"
            />
          </Card>

          {/* 2. Likelihood Rank Table */}
          <Card>
            <Title level={5}>2. Likelihood Rank</Title>
            <Text
              type="secondary"
              style={{ display: "block", marginBottom: 12 }}
            >
              Last 24 months between Last; Between last 18-12 months; Between
              last 12-6 months; Between last 6 months - last 3 months; In last 3
              months
            </Text>
            <Table
              dataSource={likelihoodData[selectedScale]}
              columns={likelihoodColumns}
              pagination={false}
              size="small"
              rowKey="description"
            />
          </Card>

          {/* 3. Consequence Ranks */}
          <Card>
            <Title level={5}>3. Consequence Ranks</Title>
            <Text
              type="secondary"
              style={{ display: "block", marginBottom: 12 }}
            >
              Overall rank = sum of Confidentiality + Integrity + Availability +
              Privacy value
            </Text>
            <Table
              dataSource={consequenceData}
              columns={consequenceColumns}
              pagination={false}
              size="small"
              rowKey="aspect"
            />
          </Card>

          {/* 4. Existing Control Strength */}
          <Card>
            <Title level={5}>4. Existing Control Strength</Title>
            <Text
              type="secondary"
              style={{ display: "block", marginBottom: 12 }}
            >
              To be calculated using AI
            </Text>
            <Table
              dataSource={controlStrengthData[selectedScale]}
              columns={controlColumns}
              pagination={false}
              size="small"
              rowKey="status"
            />
          </Card>

          {/* 5. Risk Score Formula */}
          <Card>
            <Title level={5}>5. Risk Score Calculation</Title>
            <Alert
              message="Risk Score = Severity Rank × Likelihood Rank × Consequence Rank × Existing Control Rank"
              type="info"
              showIcon
            />
          </Card>

          {/* 6. Threshold/Color Logic */}
          <Card>
            <Title level={5}>
              6. {selectedScale}-Pointer Scale Color Logic
            </Title>
            <Text strong style={{ display: "block", marginBottom: 12 }}>
              The minimum score for a Significant Risk is{" "}
              {thresholdData[selectedScale].significant}.
            </Text>
            <Table
              dataSource={thresholdData[selectedScale].levels}
              columns={thresholdColumns}
              pagination={false}
              size="small"
              rowKey="level"
            />
          </Card>
        </Space>
      )}
    </div>
  );
};

export default RiskRatingSetup;
