import React, { useState, useContext } from "react";
import {
  Card,
  Typography,
  Descriptions,
  Tag,
  Button,
  Space,
  Modal,
  Select,
  Input,
  DatePicker,
  message,
  Alert,
  Tooltip,
  Divider,
  Flex
} from 'antd';
import {
  UserOutlined,
  UserAddOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  ExclamationCircleFilled,
  DashOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  CalendarOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined
} from "@ant-design/icons";
import { WorkflowContext } from "../../../Context/WorkflowContext";
import { ProjectContext } from "../../../Context/ProjectContext";
import {AuthContext} from "../../../AuthContext"
import dayjs from 'dayjs';
import { useNavigate } from "react-router-dom";

const { Option } = Select;
const { TextArea } = Input;
const { Text, Title } = Typography;

const StepDetails = ({ 
  stepDetails, 
  setStepDetails, 
  stepId, 
  permissions, 
  refreshData, 
  projectRole, 
  projectId, 
  stepSpecificData 
}) => {
  const {
    assignTask,
    deleteTaskAssignment,
    updateStepStatus,
    assignReviewer,
    deleteReviewerAssignment,
    isLoading,
    canAssignTask,
    canManageReviewer,
    canSeeReviewer,
    canSendForReview,
    canApproveReject,
    hasAllRequiredFields
  } = useContext(WorkflowContext);
  
  const { getMembers } = useContext(ProjectContext);
  const {user} = useContext(AuthContext);
  const navigate = useNavigate();

  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [reviewerModalVisible, setReviewerModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [members, setMembers] = useState([]);
  const [selectedAssignee, setSelectedAssignee] = useState(null);
  const [selectedReviewer, setSelectedReviewer] = useState(null);
  const [taskDescription, setTaskDescription] = useState('');
  const [deadline, setDeadline] = useState(null);
  const [references, setReferences] = useState('');
  const [rejectionComment, setRejectionComment] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);
  const [reviewerLoading, setReviewerLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  // Get status color and icon
  const getStatusDisplay = (status) => {
    switch (status) {
      case 'completed':
        return { color: 'green', icon: <CheckCircleOutlined />, text: 'Completed' };
      case 'in_progress':
        return { color: 'blue', icon: <SyncOutlined spin />, text: 'In Progress' };
      case 'not_started':
        return { color: 'orange', icon: <DashOutlined />, text: 'Not Started' };
      case 'awaiting_approval':
        return { color: 'purple', icon: <ClockCircleOutlined />, text: 'Awaiting Approval' };
      default:
        return { color: 'default', icon: null, text: status || 'Unknown' };
    }
  };

  // Get process color
  const getProcessColor = (process) => {
    return process === 'core' ? 'purple' : 'cyan';
  };

  // Load members for assignment - filter based on assignment type
  const loadMembers = async (assignmentType = 'task') => {
    try {
      const membersList = await getMembers(projectId);
      if (membersList) {
        if (assignmentType === 'task') {
          // For task assignment, only show consultants
          const consultants = membersList.filter(member => 
            (member.project_role === 'consultant' || member.project_role === 'consultant admin') && user.id !== member.id
          );
          setMembers(consultants);
        } else {
          // For reviewer assignment, show all members
          setMembers(membersList);
        }
      }
    } catch (error) {
      message.error('Failed to load project members');
    }
  };

  // Handle task assignment
  const handleAssignTask = async () => {
    if (!selectedAssignee || !stepId) return;

    try {
      setAssignLoading(true);
      const taskData = {
        assigned_to: selectedAssignee,
        description: taskDescription || undefined,
        references: references || undefined,
        deadline: deadline ? deadline.format('YYYY-MM-DD') : undefined
      };

      const result = await assignTask(stepId, taskData);
      if (result.success) {
        message.success(result.message || 'Task assigned successfully');
        setAssignModalVisible(false);
        refreshData();
        resetAssignModal();
      } else {
        message.error(result.error || 'Failed to assign task');
      }
    } catch (error) {
      message.error('Error assigning task');
    } finally {
      setAssignLoading(false);
    }
  };

  // Handle removing task assignment
  const handleRemoveAssignment = async () => {
    if (!stepId) return;

    Modal.confirm({
      title: 'Remove Task Assignment',
      content: 'Are you sure you want to remove this task assignment?',
      onOk: async () => {
        try {
          const result = await deleteTaskAssignment(stepId);
          if (result.success) {
            message.success('Task assignment removed');
            refreshData();
          } else {
            message.error(result.error || 'Failed to remove task assignment');
          }
        } catch (error) {
          message.error('Error removing task assignment');
        }
      }
    });
  };

  // Handle reviewer assignment
  const handleAssignReviewer = async () => {
    if (!selectedReviewer || !stepId) return;

    try {
      setReviewerLoading(true);
      const reviewerData = {
        assigned_to: selectedReviewer
      };

      const result = await assignReviewer(stepId, reviewerData);
      if (result.success) {
        message.success('Reviewer assigned successfully');
        setReviewerModalVisible(false);
        refreshData();
        resetReviewerModal();
      } else {
        message.error(result.error || 'Failed to assign reviewer');
      }
    } catch (error) {
      message.error('Error assigning reviewer');
    } finally {
      setReviewerLoading(false);
    }
  };

  // Handle removing reviewer
  const handleRemoveReviewer = async () => {
    if (!stepId) return;

    Modal.confirm({
      title: 'Remove Reviewer',
      content: 'Are you sure you want to remove this reviewer?',
      onOk: async () => {
        try {
          const result = await deleteReviewerAssignment(stepId);
          if (result.success) {
            message.success('Reviewer removed');
            refreshData();
          } else {
            message.error(result.error || 'Failed to remove reviewer');
          }
        } catch (error) {
          message.error('Error removing reviewer');
        }
      }
    });
  };

  // Handle sending for review
  const handleSendForReview = async () => {
    if (!stepId) return;

    try {
      const statusData = { status: 'awaiting_approval' };
      const result = await updateStepStatus(stepId, statusData);
      if (result.success) {
        message.success('Sent for review successfully');
        refreshData();
      } else {
        message.error(result.error || 'Failed to send for review');
      }
    } catch (error) {
      message.error('Error sending for review');
    }
  };

  // Handle approve
  const handleApprove = async () => {
    if (!stepId) return;

    try {
      setStatusLoading(true);
      const statusData = { status: 'completed' };
      const result = await updateStepStatus(stepId, statusData);
      if (result.success) {
        message.success('Step approved successfully');
        refreshData();
      } else {
        message.error(result.error || 'Failed to approve');
      }
    } catch (error) {
      message.error('Error approving step');
    } finally {
      setStatusLoading(false);
    }
  };

  // Handle reject
  const handleReject = async () => {
    if (!rejectionComment.trim()) {
      message.error('Please provide a rejection comment');
      return;
    }

    try {
      setStatusLoading(true);
      const statusData = { 
        status: 'in_progress', 
        comment: rejectionComment 
      };
      const result = await updateStepStatus(stepId, statusData);
      if (result.success) {
        message.success('Step rejected successfully');
        setRejectionComment('');
        setStatusModalVisible(false);
        refreshData();
      } else {
        message.error(result.error || 'Failed to reject');
      }
    } catch (error) {
      message.error('Error rejecting step');
    } finally {
      setStatusLoading(false);
    }
  };

  // Reset modal states
  const resetAssignModal = () => {
    setSelectedAssignee(null);
    setTaskDescription('');
    setDeadline(null);
    setReferences('');
  };

  const resetReviewerModal = () => {
    setSelectedReviewer(null);
  };

  // Show assign modal
  const showAssignModal = async () => {
    await loadMembers('task');
    setAssignModalVisible(true);
  };

  // Show reviewer modal
  const showReviewerModal = async () => {
    await loadMembers('reviewer');
    setReviewerModalVisible(true);
  };

  // Check if all required fields are filled
  const hasRequiredData = hasAllRequiredFields(stepSpecificData);

  const statusDisplay = getStatusDisplay(stepDetails.status);

  return (
    <Card title="Step Details" style={{border: "1px solid #E0E0E0", borderRadius: "8px" }}>

      
      <Card size="small" style={{ marginBottom: 16 }}>
        <Descriptions column={1} size="small">
          <Descriptions.Item label="Status">
            <Space direction="vertical" size="small" >
              <Tag color={statusDisplay.color} icon={statusDisplay.icon} style={{ display: "flex", alignItems: "center" }}>
                {statusDisplay.text}
              </Tag>
            </Space>
          </Descriptions.Item>
          
          <Descriptions.Item label="Process">
            <Tag color={getProcessColor(stepDetails.process)}>
              {stepDetails.process === 'core' ? 'Core' : 'Non Core'}
            </Tag>
          </Descriptions.Item>
          
          {stepDetails.associated_iso_clause && (
            <Descriptions.Item label="ISO Clause">
              <Text code>{stepDetails.associated_iso_clause}</Text>
            </Descriptions.Item>
          )}
          
        </Descriptions>
        {/* Send for Review Button */}
              {canSendForReview(projectRole, stepDetails.status, hasRequiredData) && (
                <Button 
                  // type="primary"
                  onClick={handleSendForReview}
                  loading={statusLoading}
                  style={{ width: "100%", marginTop: "16px",backgroundColor: "black", color: "white" }}
                >
                  Send for Review
                </Button>
              )}
              
              {/* Approve/Reject Buttons */}
              {canApproveReject(projectRole, stepDetails.status, permissions) && (
                <Flex justify="space-between" style={{marginTop: "16px"}}>
                  <Button 
                    variant="contained"
                    icon={<CheckOutlined />}
                    onClick={handleApprove}
                    loading={statusLoading}
                    style={{ width: "100%", backgroundColor: "#00b35a", color: "white" }}
                  >
                    Approve
                  </Button>
                  <Button 
                    icon={<CloseOutlined />}
                    onClick={() => setStatusModalVisible(true)}
                    loading={statusLoading}
                    style={{ width:"100%",  backgroundColor: "#ff0000", color: "white" }}
                  >
                    Reject
                  </Button>
                </Flex>
              )}
      </Card>

      {/* Rejection Comment - Only show if status is in_progress */}
      {stepDetails.last_rejection_comment && stepDetails.status === 'in_progress' && (
        <div style={{ 
          backgroundColor: '#fff7e6', 
          border: '1px solid #ffd591', 
          borderRadius: '6px', 
          padding: '4px 16px', 
          marginBottom: '16px' 
        }}>
          <div>
            <div>
              <WarningOutlined style={{ color: '#fa8c16',marginRight: '8px' }} />
              <Text strong style={{ color: '#fa8c16' }}>Rejected</Text>
            </div>
            <Text type="secondary" style={{ fontSize: '10px' }}>
              By {stepDetails.last_rejection_comment.created_by} on{' '}
              {new Date(stepDetails.last_rejection_comment.created_at).toLocaleDateString()}
            </Text>
            <Divider style={{ margin: '4px 0' }} />
            <Text style={{ fontSize: '12px' }}>{stepDetails.last_rejection_comment.comment}</Text>
          </div>
        </div>
      )}

      {/* Task Assignment Section - Only show to consultant admin or if task is assigned */}
      {(projectRole === 'consultant admin' || stepDetails.task_details) && (
        <Card 
          title={
            <Space>
              <UserOutlined />
              <span>Task Assignment</span>
            </Space>
          }
          size="small" 
          style={{ marginBottom: 16 }}
          extra={
            stepDetails.status !== 'completed' && canAssignTask(projectRole, stepDetails.status) && !stepDetails?.task_details &&(
              <Button 
                size="small" 
                type="primary" 
                icon={<UserAddOutlined />}
                onClick={showAssignModal}
              >
                Assign Task
              </Button>
            )
          }
        >
          {stepDetails.task_details ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Individual Task Card */}
              <div style={{
                border: '1px solid #d9d9d9',
                borderRadius: '6px',
                padding: '12px',
                backgroundColor: '#fafafa',
                position: 'relative'
              }}>
                {/* Remove button for individual task */}
                {projectRole === 'consultant admin' && stepDetails.status !== 'completed' && (
                  <Button
                    size="small"
                    danger
                    type="text"
                    icon={<DeleteOutlined />}
                    onClick={handleRemoveAssignment}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      padding: '4px 8px',
                      height: 'auto',
                      fontSize: '12px'
                    }}
                  >
                    Remove
                  </Button>
                )}
                
                <div style={{ paddingRight: '70px' }}>
                  {/* Assignee Info */}
                  <div style={{ marginBottom: '8px' }}>
                    <Text strong style={{ color: '#1890ff', fontSize: '14px' }}>
                      {stepDetails.task_details.assigned_to_details?.name}
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {stepDetails.task_details.assigned_to_details?.email}
                    </Text>
                  </div>

                  {/* Task Details Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                    {stepDetails.task_details.deadline && (
                      <div>
                        <Text type="secondary">Deadline:</Text>
                        <br />
                        <Space size="small">
                          <CalendarOutlined style={{ color: '#fa8c16' }} />
                          <Text style={{ fontSize: '12px' }}>
                            {new Date(stepDetails.task_details.deadline).toLocaleDateString()}
                          </Text>
                        </Space>
                      </div>
                    )}
                    
                    <div>
                      <Text type="secondary">Assigned:</Text>
                      <br />
                      <Text style={{ fontSize: '12px' }}>
                        {new Date(stepDetails.task_details.assigned_at).toLocaleDateString()}
                      </Text>
                    </div>
                  </div>

                  {/* Description */}
                  {stepDetails.task_details.description && (
                    <div style={{ marginTop: '8px' }}>
                      <Text type="secondary" style={{ fontSize: '12px' }}>Description:</Text>
                      <div style={{
                        marginTop: '4px',
                        padding: '6px 8px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #e8e8e8',
                        borderRadius: '4px',
                        fontSize: '12px',
                        lineHeight: '1.4'
                      }}>
                        {stepDetails.task_details.description}
                      </div>
                    </div>
                  )}

                  {/* References */}
                  {stepDetails.task_details.references && (
                    <div style={{ marginTop: '8px' }}>
                      <Text type="secondary" style={{ fontSize: '12px' }}>References:</Text>
                      <div style={{
                        marginTop: '4px',
                        padding: '6px 8px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #e8e8e8',
                        borderRadius: '4px',
                        fontSize: '12px',
                        lineHeight: '1.4'
                      }}>
                        {stepDetails.task_details.references}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              {stepDetails.status === 'completed' ? (
                <Text type="secondary">Cannot assign task - step completed</Text>
              ) : projectRole === 'consultant admin' ? (
                <Text type="secondary">No tasks assigned yet</Text>
              ) : (
                <Text type="secondary">No task assigned to this step</Text>
              )}
            </div>
          )}
        </Card>
      )}

      {/* Reviewer Section - Show if reviewer exists or user can manage reviewers */}
      {(stepDetails.reviewer_details || canSeeReviewer(permissions, projectRole)) && (
        <Card 
          title="Reviewer"
          size="small" 
          style={{ marginBottom: 16 }}
          extra={
            canManageReviewer(projectRole, stepDetails.status, permissions) && (
              stepDetails.reviewer_details ? (
                <Button 
                  size="small" 
                  danger 
                  type="text" 
                  icon={<DeleteOutlined />}
                  onClick={handleRemoveReviewer}
                  loading={reviewerLoading}
                >
                  Remove
                </Button>
              ) : (
                <Button 
                  size="small" 
                  type="primary" 
                  icon={<UserAddOutlined />}
                  onClick={showReviewerModal}
                  loading={reviewerLoading}
                >
                  Assign Reviewer
                </Button>
              )
            )
          }
        >
          {stepDetails.reviewer_details ? (
            <>
              {/* Reviewer Info */}
              <div style={{ marginBottom: '8px' }}>
                <Text strong style={{ fontSize: '14px' }}>
                  {stepDetails.reviewer_details.assigned_to_details?.name}
                </Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {stepDetails.reviewer_details.assigned_to_details?.email}
                </Text>
              </div>

              
            </>

          ) : (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              {projectRole === 'company' ? (
                <Text type="secondary">No reviewer assigned</Text>
              ) : (
                <Text type="secondary">Reviewer will be assigned by company</Text>
              )}
            </div>
          )}
        </Card>
      )}

      {/* Assignment Modal */}
      <Modal
        title="Assign Task"
        open={assignModalVisible}
        onOk={handleAssignTask}
        onCancel={() => {
          setAssignModalVisible(false);
          resetAssignModal();
        }}
        confirmLoading={assignLoading}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>Assign To:</Text>
            <Select
              style={{ width: '100%', marginTop: 8 }}
              placeholder="Select a team member"
              value={selectedAssignee}
              onChange={setSelectedAssignee}
              notFoundContent={
                <Space style={{flexDirection:"column", alignItems:"center",margin:"auto",width:"100%",padding:"8px"}}>
                  <UserOutlined size="large"/>
                  <Text type="secondary">No consultants in your team</Text>
                  <Button onClick={()=>{navigate('projectteam')}} type="link">Manage Team</Button>
                </Space>
              }
            >
              {members.map(member => (
                <Option key={member.id} value={member.id}>
                  {member.name} ({member.email})
                </Option>
              ))}
            </Select>
          </div>
          
          <div>
            <Text strong>Description (Optional):</Text>
            <TextArea
              style={{ marginTop: 8 }}
              rows={3}
              placeholder="Task description..."
              value={taskDescription}
              onChange={e => setTaskDescription(e.target.value)}
            />
          </div>
          
          <div>
            <Text strong>References (Optional):</Text>
            <TextArea
              style={{ marginTop: 8 }}
              rows={2}
              placeholder="Reference documents or links..."
              value={references}
              onChange={e => setReferences(e.target.value)}
            />
          </div>
          
          <div>
            <Text strong>Deadline (Optional):</Text>
            <DatePicker
              style={{ width: '100%', marginTop: 8 }}
              value={deadline}
              onChange={setDeadline}
              disabledDate={current => current && current < dayjs().startOf('day')}
            />
          </div>
        </Space>
      </Modal>

      {/* Reviewer Modal */}
      <Modal
        title="Assign Reviewer"
        open={reviewerModalVisible}
        onOk={handleAssignReviewer}
        onCancel={() => {
          setReviewerModalVisible(false);
          resetReviewerModal();
        }}
        confirmLoading={reviewerLoading}
      >
        <div>
          <Text strong>Assign Reviewer:</Text>
          <Select
            style={{ width: '100%', marginTop: 8 }}
            placeholder="Select a reviewer"
            value={selectedReviewer}
            onChange={setSelectedReviewer}
          >
            {members.map(member => (
              <Option key={member.id} value={member.id}>
                {member.name} ({member.email})
              </Option>
            ))}
          </Select>
        </div>
      </Modal>

      {/* Rejection Modal */}
      <Modal
        title="Reject Step"
        open={statusModalVisible}
        onOk={handleReject}
        onCancel={() => {
          setStatusModalVisible(false);
          setRejectionComment('');
        }}
        confirmLoading={statusLoading}
      >
        <div>
          <Text strong>Rejection Comment:</Text>
          <TextArea
            style={{ marginTop: 8 }}
            rows={4}
            placeholder="Please provide a reason for rejection..."
            value={rejectionComment}
            onChange={e => setRejectionComment(e.target.value)}
          />
        </div>
      </Modal>
    </Card>
  );
};

export default StepDetails;
