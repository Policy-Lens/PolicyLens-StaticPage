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
} from "@ant-design/icons";
import { ScopingContext } from "../../../../Context/ScopingContext";
import { ProjectContext } from "../../../../Context/ProjectContext";
import Unauthorized from "../../../Common/Unauthorized";
import { getStatusConfig } from "../WorkflowOverview";

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
  const [actionType, setActionType] = useState(null); // 'approve' or 'reject'
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [reviewers, setReviewers] = useState([]);
  const [selectedAssignee, setSelectedAssignee] = useState(null);
  const displayStatus = getStatusConfig(scopingData?.status);

  // Load scoping data once
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
      console.log(members);
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

  // Check permissions for updates
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

  // Step definitions
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

  // Navigation handlers
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

  // Approval workflow handlers
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
      // Company admin approval with signature
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
          loadScopingData(); // Reload to get updated status
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

  //   // Handle signature image upload
  //   const handleSignatureChange = (e) => {
  //     const file = e.target.files;
  //     setSignatureImage(file);
  //   };

  // Handle feedback modal visibility
  const handleFeedbackViewModalVisible = () => {
    setFeedbackViewModalVisible(!feedbackViewModalVisible);
  };

  // Render step component
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
        height: "91dvh",
        display: "flex",
        flexDirection: "column",
        background: "#f0f2f5",
      }}
    >
      {/* Sticky Header */}
      <Card
        size="small"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1,
          borderRadius: 0,
          borderBottom: "1px solid #e8e8e8",
          backgroundColor: "primary",
        }}
        bodyStyle={{ padding: "10px 0" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            alignItems: "start",
            padding: "0 10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "start" }}>
            <div>
              <Title level={4} style={{ margin: 0 }}>
                Project Scoping Wizard
                <Tag style={{ marginLeft: "10px" }} color={displayStatus.color}>
                  {displayStatus.text}
                </Tag>
              </Title>
              <Text type="secondary">
                Define your project scope, resources, timeline, and pricing
              </Text>
              {scopingData?.reviewer && (
                <div style={{ marginLeft: "20px" }}>
                  <Text>
                    Reviewer: {scopingData.reviewer_details?.name || "Assigned"}
                  </Text>
                </div>
              )}
            </div>
            <div style={{ marginLeft: "20px" }}>
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
                    }}
                    onMouseOver={() => setFeedbackViewModalVisible(true)}
                    onMouseOut={() => setFeedbackViewModalVisible(false)}
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
                          display: "flex",
                          position: "absolute",
                          top: 40,
                          left: "410px",
                          zIndex: 40,
                          width: "250px",
                        }}
                        size="small"
                      >
                        <Title level={5}>Feedback: </Title>
                        <Text
                          color={
                            scopingData.latest_feedback.status === "approved"
                              ? "green"
                              : "red"
                          }
                        >
                          {scopingData.latest_feedback.status === "approved"
                            ? `Now Company SPOC can sign and approve`
                            : scopingData.latest_feedback.feedback}
                        </Text>
                      </Card>
                    )}
                  </div>
                )}
            </div>
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
        <div
          style={{
            height: "3px",
            background: "#F0F2F5",
            margin: "10px 0",
          }}
        />
        {/* Stepper */}
        <div style={{ marginTop: 12, padding: "0 20px" }}>
          <Steps
            current={currentStep}
            onChange={setCurrentStep}
            items={steps.map((step, index) => ({
              title: step.title,
              icon: step.icon,
            }))}
          />
        </div>
      </Card>

      {/* Body - Scrollable */}
      <div style={{ flex: 1, overflow: "auto", padding: "20px" }}>
        <Card>
          <CurrentStepComponent
            projectId={projectid}
            canEdit={canEdit()}
            scopingData={scopingData}
            reloadData={loadScopingData}
          />
        </Card>
      </div>

      {/*Sticky Footer */}
      <Card
        size="small"
        style={{
          position: "sticky",
          bottom: 0,
          zIndex: 1,
          borderRadius: 0,
          borderTop: "1px solid #e8e8e8",
        }}
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

      {/* Signature Modal */}
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
          {/* {signatureImage && (
            <img 
              src={signatureImage} 
              alt="Signature preview" 
              style={{ maxWidth: '100%', maxHeight: 200, marginTop: 16 }}
            />
          )} */}
        </div>
      </Modal>

      {/* Feedback Modal */}
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
      {/* Reviewer Assignment Modal */}
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
              <Option key={member.id} value={member.id}>
                {member.name} ({member.email})
              </Option>
            ))}
          </Select>
        </div>
      </Modal>
    </div>
  );
};

export default Scoping;
