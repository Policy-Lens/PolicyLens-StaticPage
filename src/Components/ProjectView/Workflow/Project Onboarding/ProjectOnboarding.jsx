import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Steps,
  Button,
  Card,
  Typography,
  Space,
  Spin,
  message,
  Modal,
  Tag,
  Select,
  Segmented,
  Tooltip,
} from "antd";
import {
  UserOutlined,
  CheckCircleOutlined,
  LeftOutlined,
  RightOutlined,
  FileTextOutlined,
  SafetyOutlined,
  FileProtectOutlined,
  FolderOpenOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { OnboardingContext } from "../../../../Context/OnboardingContext";
import { ProjectContext } from "../../../../Context/ProjectContext";
import Unauthorized from "../../../Common/Unauthorized";
import { getStatusConfig } from "../../../../utils/statusConfig.jsx";

// Lazy load step components
import Questionnaire from "./steps/Questionnaire";
import RiskRatingSetup from "./steps/RiskRatingSetup";
import DocumentProtocols from "./steps/DocumentProtocols";
import ArtifactTemplateIndex from "./steps/ArtifactTemplateIndex";

const { Title, Text } = Typography;

const ProjectOnboarding = () => {
  const { projectid } = useParams();
  const navigate = useNavigate();
  const { projectRole, getMembers } = useContext(ProjectContext);
  const {
    getOnboardingDetails,
    onboardingData,
    setOnboardingData,
    assignAdvisor,
    removeAdvisor,
    updateOnboardingStatus,
    getQuestionsByDomain,
    getIssuesByCategory,
    getRiskRatingSetup,
    riskRatingSetup,
  } = useContext(OnboardingContext);

  const [questionsData, setQuestionsData] = useState({
    organization: [],
    it: [],
    people: [],
    physical: [],
  });

  const [issuesData, setIssuesData] = useState({
    internal: [],
    external: [],
    risk: [],
    opportunity: [],
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [removeModalVisible, setRemoveModalVisible] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [advisors, setAdvisors] = useState([]);
  const [selectedAdvisor, setSelectedAdvisor] = useState(null);
  const [selectedRemoveAdvisor, setSelectedRemoveAdvisor] = useState(null);
  const [layoutDirection, setLayoutDirection] = useState("horizontal");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const displayStatus = getStatusConfig(onboardingData?.status);

  const steps = [
    {
      title: "Questionnaire",
      icon: <FileTextOutlined />,
      component: Questionnaire,
    },
    {
      title: "Risk Rating Setup",
      icon: <SafetyOutlined />,
      component: RiskRatingSetup,
    },
    {
      title: "Document Protocols",
      icon: <FileProtectOutlined />,
      component: DocumentProtocols,
    },
    {
      title: "Artifact Template Index",
      icon: <FolderOpenOutlined />,
      component: ArtifactTemplateIndex,
    },
  ];

  useEffect(() => {
    loadOnboardingData();
  }, [projectid]);

  const loadOnboardingData = async () => {
    try {
      setLoading(true);
      const data = await getOnboardingDetails(projectid);
      if (data) {
        setOnboardingData(data);
        // Load questions, issues, and risk rating setup
        await Promise.all([
          loadAllQuestions(),
          loadAllIssues(),
          getRiskRatingSetup(projectid),
        ]);
      }
    } catch (error) {
      if (error.status === 403) {
        setUnauthorized(true);
      } else if (error.status === 404) {
        message.error("Onboarding data not found");
      } else {
        message.error("Failed to load onboarding data");
      }
    } finally {
      setLoading(false);
    }
  };

  const loadAllQuestions = async () => {
    try {
      const [orgQuestions, itQuestions, peopleQuestions, physicalQuestions] =
        await Promise.all([
          getQuestionsByDomain(projectid, "organization"),
          getQuestionsByDomain(projectid, "it"),
          getQuestionsByDomain(projectid, "people"),
          getQuestionsByDomain(projectid, "physical"),
        ]);

      setQuestionsData({
        organization: orgQuestions,
        it: itQuestions,
        people: peopleQuestions,
        physical: physicalQuestions,
      });
    } catch (error) {
      console.error("Error loading questions:", error);
      message.error("Failed to load questions");
    }
  };

  const loadAllIssues = async () => {
    try {
      const [internalIssues, externalIssues, riskIssues, opportunityIssues] =
        await Promise.all([
          getIssuesByCategory(projectid, "internal"),
          getIssuesByCategory(projectid, "external"),
          getIssuesByCategory(projectid, "risk"),
          getIssuesByCategory(projectid, "opportunity"),
        ]);

      setIssuesData({
        internal: internalIssues,
        external: externalIssues,
        risk: riskIssues,
        opportunity: opportunityIssues,
      });
    } catch (error) {
      console.error("Error loading issues:", error);
      message.error("Failed to load issues");
    }
  };

  const handleAssignmentModal = async () => {
    setAssignModalVisible(true);
    const members = await getMembers(projectid);
    if (members) {
      const consultants = members.filter(
        (member) => member.project_role === "consultant"
      );
      setAdvisors(consultants);
    }
  };

  const handleAssignAdvisor = async () => {
    if (!selectedAdvisor) {
      message.warning("Please select an advisor");
      return;
    }

    try {
      setAssigning(true);
      const res = await assignAdvisor(projectid, selectedAdvisor);
      if (res.success) {
        message.success("Advisor assigned successfully");
        setOnboardingData(res.data);
        setAssignModalVisible(false);
        setSelectedAdvisor(null);
      }
    } catch (error) {
      if (error.status === 403) {
        setUnauthorized(true);
      } else {
        message.error(error.data?.error || "Failed to assign advisor");
      }
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveAdvisor = async () => {
    if (!selectedRemoveAdvisor) {
      message.warning("Please select an advisor to remove");
      return;
    }

    try {
      setAssigning(true);
      const res = await removeAdvisor(projectid, selectedRemoveAdvisor);
      if (res.success) {
        message.success("Advisor removed successfully");
        setOnboardingData(res.data);
        setRemoveModalVisible(false);
        setSelectedRemoveAdvisor(null);
      }
    } catch (error) {
      if (error.status === 403) {
        setUnauthorized(true);
      } else {
        message.error(error.data?.error || "Failed to remove advisor");
      }
    } finally {
      setAssigning(false);
    }
  };

  const handleCompleteSetup = async () => {
    Modal.confirm({
      title: "Complete Setup",
      content: "Are you sure you want to mark the onboarding as completed?",
      okText: "Yes, Complete",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const res = await updateOnboardingStatus(projectid, "completed");
          if (res.success) {
            message.success("Onboarding completed successfully");
            setOnboardingData(res.data);
            loadOnboardingData();
          }
        } catch (error) {
          if (error.status === 403) {
            setUnauthorized(true);
          } else {
            message.error(error.data?.error || "Failed to complete onboarding");
          }
        }
      },
    });
  };

  const canManageAdvisors = () => {
    return projectRole === "consultant admin";
  };

  const canEdit = () => {
    return projectRole === "consultant admin" || projectRole === "consultant";
  };

  const canCompleteSetup = () => {
    return (
      projectRole === "consultant admin" &&
      onboardingData?.status === "in_progress"
    );
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (unauthorized) {
    return <Unauthorized />;
  }

  return (
    <div
      style={{
        height: "calc(100vh - 68px)",
        display: "flex",
        flexDirection: "column",
        background: "#f0f2f5",
        overflow: "hidden",
      }}
    >
      {/* Sticky Header */}
      <Card
        size="small"
        style={{
          borderRadius: 0,
          borderBottom: "1px solid #e8e8e8",
          flexShrink: 0,
        }}
        styles={{ body: { padding: "10px 16px" } }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "start",
          }}
        >
          <div style={{ display: "flex", alignItems: "start", gap: 10 }}>
            <Button
              style={{ marginTop: 4, borderRadius: 20 }}
              icon={<LeftOutlined />}
              onClick={() => navigate(-1)}
            ></Button>
            <Segmented
              value={layoutDirection}
              onChange={setLayoutDirection}
              vertical
              options={[
                {
                  value: "horizontal",
                  icon: (
                    <svg
                      width="20"
                      height="28"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect
                        x="4"
                        y="3"
                        width="12"
                        height="4"
                        rx="1"
                        stroke="black"
                      />
                      <rect
                        x="4"
                        y="9"
                        width="12"
                        height="8"
                        rx="1"
                        stroke="black"
                      />
                    </svg>
                  ),
                },
                {
                  value: "vertical",
                  icon: (
                    <svg
                      width="20"
                      height="23"
                      viewBox="0 0 20 25"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect
                        x="3"
                        y="21"
                        width="12"
                        height="4"
                        rx="1"
                        transform="rotate(-90 3 21)"
                        stroke="black"
                      />
                      <rect
                        x="9"
                        y="21"
                        width="12"
                        height="8"
                        rx="1"
                        transform="rotate(-90 9 21)"
                        stroke="black"
                      />
                    </svg>
                  ),
                },
              ]}
              style={{ marginTop: 4 }}
            />
            <div>
              <Title level={4} style={{ margin: 0, marginBottom: 4 }}>
                Project Onboarding
                <Tag style={{ marginLeft: "10px" }} color={displayStatus.color}>
                  {displayStatus.text}
                </Tag>
              </Title>
              <Text type="secondary">
                Configure project settings and complete onboarding setup
              </Text>
              {onboardingData?.assigned_advisors &&
                onboardingData.assigned_advisors.length > 0 && (
                  <div style={{ marginTop: 4 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Advisors:{" "}
                      {Array.isArray(onboardingData.assigned_advisors)
                        ? onboardingData.assigned_advisors
                            .map((advisor) =>
                              typeof advisor === "string"
                                ? advisor
                                : advisor.name || advisor.email
                            )
                            .join(", ")
                        : "None"}
                    </Text>
                  </div>
                )}
            </div>
          </div>
          <Space>
            {canManageAdvisors() && (
              <>
                <Button
                  icon={<UserOutlined />}
                  onClick={() => handleAssignmentModal()}
                >
                  Assign Advisor
                </Button>
                {onboardingData?.assigned_advisors &&
                  onboardingData.assigned_advisors.length > 0 && (
                    <Button danger onClick={() => setRemoveModalVisible(true)}>
                      Remove Advisor
                    </Button>
                  )}
              </>
            )}
            {canCompleteSetup() && (
              <Button
                variant="outlined"
                color="green"
                icon={<CheckCircleOutlined />}
                onClick={handleCompleteSetup}
              >
                Finish Setup
              </Button>
            )}
          </Space>
        </div>
      </Card>

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: layoutDirection === "vertical" ? "row" : "column",
          overflow: "hidden",
        }}
      >
        {/* Stepper Section */}
        <Card
          size="small"
          style={{
            flexShrink: 0,
            borderRadius: 0,
            ...(layoutDirection === "vertical"
              ? {
                  width: sidebarCollapsed ? 70 : 280,
                  height: "100%",
                  borderRight: "1px solid #e8e8e8",
                }
              : {
                  width: "100%",
                  borderBottom: "1px solid #e8e8e8",
                }),
          }}
          styles={{
            body: {
              padding: 0,
              height: "100%",
              display: "flex",
              flexDirection: "column",
            },
          }}
        >
          {layoutDirection === "vertical" && (
            <div
              style={{
                display: "flex",
                justifyContent: sidebarCollapsed ? "center" : "flex-end",
                padding: 10,
                borderBottom: "1px solid #f0f0f0",
              }}
            >
              <Button
                type="text"
                icon={
                  sidebarCollapsed ? (
                    <MenuUnfoldOutlined />
                  ) : (
                    <MenuFoldOutlined />
                  )
                }
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                size="small"
              />
            </div>
          )}

          <div
            style={{
              flex: 1,
              overflow: "auto",
              alignItems: "center",
              padding: layoutDirection === "vertical" ? "20px" : "16px 20px",
              height: "100%",
            }}
          >
            <Steps
              current={currentStep}
              onChange={setCurrentStep}
              direction={layoutDirection}
              items={steps.map((step) =>
                layoutDirection === "vertical" && sidebarCollapsed
                  ? {
                      icon: (
                        <Tooltip title={step.title} placement="right">
                          <span>{step.icon}</span>
                        </Tooltip>
                      ),
                    }
                  : {
                      title: step.title,
                      icon: step.icon,
                    }
              )}
              style={{ height: "100%" }}
            />
          </div>
        </Card>

        {/* Content Section */}
        <div
          style={{
            flex: 1,
            overflow: "auto",
            padding: 16,
            background: "#f0f2f5",
          }}
        >
          <div
            style={{
              minHeight: "100%",
            }}
          >
            <CurrentStepComponent
              projectId={projectid}
              canEdit={canEdit()}
              onboardingData={onboardingData}
              reloadData={loadOnboardingData}
              questionsData={questionsData}
              loadAllQuestions={loadAllQuestions}
              issuesData={issuesData}
              loadAllIssues={loadAllIssues}
              riskRatingSetup={riskRatingSetup}
            />
          </div>
        </div>
      </div>

      {/* Sticky Footer */}
      <Card
        size="small"
        style={{
          borderRadius: 0,
          borderTop: "1px solid #e8e8e8",
          flexShrink: 0,
        }}
        styles={{ body: { padding: "8px 16px" } }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Button
            icon={<LeftOutlined />}
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            Previous
          </Button>

          <Text type="secondary">
            Step {currentStep + 1} of {steps.length}
          </Text>

          <Button
            type="primary"
            icon={<RightOutlined />}
            onClick={handleNext}
            disabled={currentStep === steps.length - 1}
          >
            Next
          </Button>
        </div>
      </Card>

      {/* Modals */}
      <Modal
        title="Assign Advisor"
        open={assignModalVisible}
        onOk={handleAssignAdvisor}
        onCancel={() => {
          setAssignModalVisible(false);
          setSelectedAdvisor(null);
        }}
        confirmLoading={assigning}
        okButtonProps={{ disabled: !selectedAdvisor }}
        okText="Assign"
      >
        <div>
          <Text strong>Select Advisor:</Text>
          <Select
            style={{ width: "100%", marginTop: 8 }}
            placeholder="Select a consultant"
            value={selectedAdvisor}
            onChange={setSelectedAdvisor}
            notFoundContent={
              <Space
                style={{
                  flexDirection: "column",
                  alignItems: "center",
                  margin: "auto",
                  width: "100%",
                  padding: "8px",
                }}
              >
                <UserOutlined style={{ fontSize: 24 }} />
                <Text type="secondary">No consultants in your team</Text>
                <Button
                  onClick={() => {
                    navigate(`/project/${projectid}/projectteam`);
                  }}
                  type="link"
                >
                  Manage Team
                </Button>
              </Space>
            }
          >
            {advisors.map((member) => (
              <Select.Option key={member.id} value={member.id}>
                {member.name} ({member.email})
              </Select.Option>
            ))}
          </Select>
        </div>
      </Modal>

      <Modal
        title="Remove Advisor"
        open={removeModalVisible}
        onOk={handleRemoveAdvisor}
        onCancel={() => {
          setRemoveModalVisible(false);
          setSelectedRemoveAdvisor(null);
        }}
        confirmLoading={assigning}
        okButtonProps={{ disabled: !selectedRemoveAdvisor, danger: true }}
        okText="Remove"
      >
        <div>
          <Text strong>Select Advisor to Remove:</Text>
          <Select
            style={{ width: "100%", marginTop: 8 }}
            placeholder="Select an advisor to remove"
            value={selectedRemoveAdvisor}
            onChange={setSelectedRemoveAdvisor}
          >
            {onboardingData?.assigned_advisors?.map((advisor, index) => (
              <Select.Option
                key={typeof advisor === "string" ? index : advisor.id}
                value={typeof advisor === "string" ? advisor : advisor.id}
              >
                {typeof advisor === "string"
                  ? advisor
                  : `${advisor.name} (${advisor.email})`}
              </Select.Option>
            ))}
          </Select>
        </div>
      </Modal>
    </div>
  );
};

export default ProjectOnboarding;
