import React, { useState, useEffect, useContext } from "react";
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
  Alert,
  Select,
  Segmented,
  Tooltip,
} from "antd";
import {
  LeftOutlined,
  RightOutlined,
  FileTextOutlined,
  TeamOutlined,
  CalendarOutlined,
  ApartmentOutlined,
  DollarOutlined,
  FileProtectOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  UserOutlined,
  ColumnHeightOutlined,
  ColumnWidthOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { ScopingContext } from "../../../../Context/ScopingContext";
import { ProjectContext } from "../../../../Context/ProjectContext";
import Unauthorized from "../../../Common/Unauthorized";
import { getStatusConfig } from "../../../../utils/statusConfig.jsx";

const { Title, Text } = Typography;

// Lazy load step components
import ScopeOfWork from "./steps/ScopeOfWork";
import ResourceRequirements from "./steps/ResourceRequirements";
import MilestoneMap from "./steps/MilestoneMap";
import RACIMatrix from "./steps/RACIMatrix";
import PriceTable from "./steps/PriceTable";
import Contract from "./steps/Contract";

const Scoping = () => {
  const { projectid } = useParams();
  const navigate = useNavigate();
  const { projectRole, getMembers } = useContext(ProjectContext);
  const {
    getScopingData,
    scopingData,
    setScopingData,
    sendForApproval,
    approveRejectScoping,
    assignReviewer,
    isLoading,
  } = useContext(ScopingContext);

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [signModalVisible, setSignModalVisible] = useState(false);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [feedbackViewModalVisible, setFeedbackViewModalVisible] =
    useState(false);
  const [signatureImage, setSignatureImage] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [actionType, setActionType] = useState(null);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [reviewers, setReviewers] = useState([]);
  const [selectedAssignee, setSelectedAssignee] = useState(null);
  const [layoutDirection, setLayoutDirection] = useState("horizontal");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const displayStatus = getStatusConfig(scopingData?.status);

  useEffect(() => {
    loadScopingData();
  }, [projectid]);

  const loadScopingData = async () => {
    try {
      setLoading(true);
      const data = await getScopingData(projectid);
      if (data) {
        setScopingData(data);
        if (data.status === "completed") {
          setCurrentStep(5);
        }
      }
    } catch (error) {
      if (error.status === 403) {
        setUnauthorized(true);
      } else {
        message.error("Failed to load scoping data");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAssignmentModal = async () => {
    setAssignModalVisible(true);
    const members = await getMembers(projectid);
    if (members) {
      const company_representatives = members.filter(
        (member) => member.project_role === "company representative"
      );
      setReviewers(company_representatives);
    }
  };

  const handleAssignReviewer = async () => {
    try {
      setAssigning(true);
      const res = await assignReviewer(projectid, selectedAssignee);
      if (res.success) {
        setScopingData(res.data);
      }
    } catch (error) {
      if (error.status === 403) {
        setUnauthorized(true);
      } else {
        message.error("Failed to assign reviewer");
      }
    } finally {
      setAssigning(false);
      setAssignModalVisible(false);
    }
  };

  const canEdit = () => {
    return (
      projectRole === "consultant admin" &&
      scopingData?.status === "in_progress"
    );
  };

  const canAssignReviewer = () => {
    return (
      projectRole === "company admin" &&
      scopingData?.status === "awaiting_approval" &&
      scopingData?.reviewer === null
    );
  };

  const canSendForApproval = () => {
    return (
      projectRole === "consultant admin" &&
      scopingData?.status === "in_progress"
    );
  };

  const canReviewerApproveReject = () => {
    return (
      projectRole === "company representative" &&
      scopingData?.status === "awaiting_approval" &&
      scopingData?.latest_feedback?.status !== "approved"
    );
  };

  const canCompanyAdminReject = () => {
    return (
      projectRole === "company admin" &&
      scopingData?.status === "awaiting_approval" &&
      scopingData?.latest_feedback?.status !== "approved"
    );
  };

  const canCompanyAdminApprove = () => {
    return (
      projectRole === "company admin" &&
      scopingData?.status === "awaiting_approval"
    );
  };

  const steps = [
    {
      title: "Scope of Work",
      icon: <FileTextOutlined />,
      component: ScopeOfWork,
    },
    {
      title: "Resource Requirement",
      icon: <TeamOutlined />,
      component: ResourceRequirements,
    },
    {
      title: "Milestone Map",
      icon: <CalendarOutlined />,
      component: MilestoneMap,
    },
    {
      title: "RACI Matrix",
      icon: <ApartmentOutlined />,
      component: RACIMatrix,
    },
    {
      title: "Price Table",
      icon: <DollarOutlined />,
      component: PriceTable,
    },
    {
      title: "Contract",
      icon: <FileProtectOutlined />,
      component: Contract,
    },
  ];

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

  const handleSendForApproval = () => {
    setSignModalVisible(true);
    setActionType("approve");
  };

  const handleSignatureSubmit = async () => {
    if (!signatureImage) {
      message.warning("Please provide a signature");
      return;
    }
    const formData = new FormData();
    formData.append("signature", signatureImage);
    try {
      const result = await sendForApproval(projectid, formData);
      if (result.success) {
        message.success("Sent for approval successfully");
        setScopingData(result.data);
        setSignModalVisible(false);
        setSignatureImage(null);
      } else {
        message.error("Failed to send for approval");
      }
    } catch (error) {
      if (error.data && error.data.details) {
        Modal.error({
          title: "Validation Failed",
          content: (
            <ul>
              {error.data.details.map((detail, index) => (
                <li key={index}>{detail}</li>
              ))}
            </ul>
          ),
        });
      } else {
        message.error(error.data?.error || "Failed to send for approval");
      }
    }
  };

  const handleApproveReject = (action) => {
    setActionType(action);
    if (action === "reject" || projectRole === "company representative") {
      setFeedbackModalVisible(true);
    } else {
      setSignModalVisible(true);
    }
  };

  const handleFeedbackSubmit = async () => {
    if (actionType === "reject") {
      if (!feedbackText.trim()) {
        message.warning("Please provide feedback");
        return;
      }
    }

    try {
      const result = await approveRejectScoping(
        projectid,
        actionType,
        feedbackText
      );
      if (result.success) {
        message.success(
          `Scoping ${
            actionType === "approve" ? "approved" : "rejected"
          } successfully`
        );
        setScopingData(result.data);
        setFeedbackModalVisible(false);
        setFeedbackText("");
        if (actionType === "reject") {
          loadScopingData();
        }
      } else {
        message.error(`Failed to ${actionType} scoping`);
      }
    } catch (error) {
      message.error(error.data?.error || `Failed to ${actionType} scoping`);
    }
  };

  const handleCompanyApproval = async () => {
    if (!signatureImage) {
      message.warning("Please provide a signature");
      return;
    }
    try {
      const result = await approveRejectScoping(
        projectid,
        "approve",
        null,
        signatureImage
      );
      if (result.success) {
        message.success("Scoping approved and completed successfully");
        setScopingData(result.data);
        setSignModalVisible(false);
        setSignatureImage(null);
      } else {
        message.error("Failed to approve scoping");
      }
    } catch (error) {
      message.error(error.data?.error || "Failed to approve scoping");
    }
  };

  const handleFeedbackViewModalVisible = () => {
    setFeedbackViewModalVisible(!feedbackViewModalVisible);
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
        height: "calc(100vh - 68px)", // Subtract navbar height
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
        bodyStyle={{ padding: "10px 16px" }}
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
              style={{ marginTop: 4,borderRadius:20 }}
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
                Project Scoping Wizard
                <Tag style={{ marginLeft: "10px" }} color={displayStatus.color}>
                  {displayStatus.text}
                </Tag>
              </Title>
              <Text type="secondary">
                Define your project scope, resources, timeline, and pricing
              </Text>
              {scopingData?.reviewer && (
                <div style={{ marginTop: 4 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Reviewer: {scopingData.reviewer_details?.name || "Assigned"}
                  </Text>
                </div>
              )}
            </div>
            {scopingData?.latest_feedback &&
              (scopingData?.status === "in_progress" ||
                scopingData?.status === "awaiting_approval") &&
              !(
                scopingData?.latest_feedback.status === "approved" &&
                projectRole === "consultant admin"
              ) && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    position: "relative",
                  }}
                  onMouseEnter={() => setFeedbackViewModalVisible(true)}
                  onMouseLeave={() => setFeedbackViewModalVisible(false)}
                >
                  <InfoCircleOutlined
                    style={{ marginRight: "8px", fontSize: "18px" }}
                  />
                  <Tag
                    color={
                      scopingData.latest_feedback.status === "approved"
                        ? "green"
                        : "red"
                    }
                    icon={
                      scopingData.latest_feedback.status === "approved" ? (
                        <CheckCircleOutlined />
                      ) : (
                        <CloseCircleOutlined />
                      )
                    }
                  >
                    {scopingData.latest_feedback.status === "approved"
                      ? `Approved by ${scopingData.reviewer_details.name}`
                      : "Rejected"}
                  </Tag>
                  {feedbackViewModalVisible && (
                    <Card
                      style={{
                        position: "absolute",
                        top: 40,
                        left: 0,
                        zIndex: 1000,
                        width: 250,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                      }}
                      size="small"
                    >
                      <Title level={5} style={{ marginBottom: 8 }}>
                        Feedback:
                      </Title>
                      <Text>
                        {scopingData.latest_feedback.status === "approved"
                          ? "Now Company SPOC can sign and approve"
                          : scopingData.latest_feedback.feedback}
                      </Text>
                    </Card>
                  )}
                </div>
              )}
          </div>
          <Space>
            {canSendForApproval() && (
              <Button type="primary" onClick={handleSendForApproval}>
                Sign and Send for Approval
              </Button>
            )}
            {canReviewerApproveReject() && (
              <>
                <Button danger onClick={() => handleApproveReject("reject")}>
                  Reject
                </Button>
                <Button
                  type="primary"
                  onClick={() => handleApproveReject("approve")}
                >
                  Approve
                </Button>
              </>
            )}
            {canAssignReviewer() && (
              <Button onClick={() => handleAssignmentModal()}>
                Assign Reviewer
              </Button>
            )}
            {canCompanyAdminReject() && (
              <Button danger onClick={() => handleApproveReject("reject")}>
                Reject
              </Button>
            )}
            {canCompanyAdminApprove() && (
              <Button type="primary" onClick={handleSendForApproval}>
                Sign and Approve
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
          bodyStyle={{
            padding: 0,
            height: "100%",
            display: "flex",
            flexDirection: "column",
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
          <Card
            style={{
              minHeight: "100%",
            }}
            bodyStyle={{
              padding: 24,
            }}
          >
            <CurrentStepComponent
              projectId={projectid}
              canEdit={canEdit()}
              scopingData={scopingData}
              reloadData={loadScopingData}
            />
          </Card>
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
        bodyStyle={{ padding: "8px 16px" }}
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
        title="Signature Required"
        open={signModalVisible}
        onOk={
          actionType === "approve" && projectRole === "company admin"
            ? handleCompanyApproval
            : handleSignatureSubmit
        }
        onCancel={() => {
          setSignModalVisible(false);
          setSignatureImage(null);
          setActionType(null);
        }}
        okText="Submit"
      >
        <div>
          <Text>Please upload your signature:</Text>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setSignatureImage(e.target.files[0])}
            style={{ display: "block", marginTop: 16, marginBottom: 16 }}
          />
        </div>
      </Modal>

      <Modal
        title={
          actionType === "approve" ? "Approval Feedback" : "Rejection Feedback"
        }
        open={feedbackModalVisible}
        onOk={handleFeedbackSubmit}
        onCancel={() => {
          setFeedbackModalVisible(false);
          setFeedbackText("");
          setActionType(null);
        }}
        okButtonProps={{ disabled: !feedbackText && actionType !== "approve" }}
        okText="Submit"
      >
        <div>
          <Text>Write a feedback:</Text>
          <textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            rows={4}
            style={{ width: "100%", marginTop: 16, padding: 8 }}
            placeholder={
              actionType === "approve"
                ? "Enter approval comments..."
                : "Enter rejection reason..."
            }
          />
        </div>
      </Modal>

      <Modal
        title="Assign Reviewer"
        open={assignModalVisible}
        onOk={handleAssignReviewer}
        onCancel={() => {
          setAssignModalVisible(false);
          setAssigning(false);
        }}
        okButtonProps={{ disabled: !selectedAssignee }}
        okText="Submit"
      >
        <div>
          <Text strong>Assign To:</Text>
          <Select
            style={{ width: "100%", marginTop: 8 }}
            placeholder="Select a company representative"
            value={selectedAssignee}
            onChange={setSelectedAssignee}
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
                <UserOutlined size="large" />
                <Text type="secondary">
                  No company representatives in your team
                </Text>
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
            {reviewers.map((member) => (
              <Select.Option key={member.id} value={member.id}>
                {member.name} ({member.email})
              </Select.Option>
            ))}
          </Select>
        </div>
      </Modal>
    </div>
  );
};

export default Scoping;
