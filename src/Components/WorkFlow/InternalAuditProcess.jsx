import React, { useState, useContext, useEffect } from "react";
import { Button, Dropdown, message, Checkbox, Avatar, Input, List, Form, Modal, Select, DatePicker } from "antd";
import { ProjectContext } from "../../Context/ProjectContext";
import { useParams } from "react-router-dom";
import { LoadingContext } from "./VertStepper";
import { apiRequest } from "../../utils/api";
import { UserOutlined, SendOutlined } from "@ant-design/icons";
import InteractiveIsoClause from "../Common/InteractiveIsoClause";

const { TextArea } = Input;
const { Option } = Select;

// Custom Comment component to replace antd Comment
const CustomComment = ({ author, avatar, content, datetime, children }) => {
  return (
    <div className="comment-wrapper border-l-4 border-blue-100 pl-4 mb-4">
      <div className="flex items-start mb-2">
        <div className="mr-3">{avatar}</div>
        <div className="flex-1">
          <div className="font-semibold text-blue-700">{author}</div>
          <div className="text-gray-700 mt-1 bg-gray-50 p-3 rounded-md">{content}</div>
          <div className="text-gray-500 text-xs mt-1">{datetime}</div>
        </div>
      </div>
      {children && <div className="ml-10 mt-2">{children}</div>}
    </div>
  );
};

const InternalAuditProcess = () => {
  const [stepStatus, setStepStatus] = useState("pending");
  const [stepId, setStepId] = useState(null);
  const [isAssignedUser, setIsAssignedUser] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [isAssignTaskVisible, setIsAssignTaskVisible] = useState(false);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDeadline, setTaskDeadline] = useState(null);
  const [taskReferences, setTaskReferences] = useState("");
  const [members, setMembers] = useState([]);
  const [expandedSteps, setExpandedSteps] = useState([]);
  const [stepComments, setStepComments] = useState({});
  const [newStepComment, setNewStepComment] = useState("");
  const [associatedIsoClause, setAssociatedIsoClause] = useState(null);
  const [process, setProcess] = useState("core");

  const { projectid } = useParams();
  const { getStepId, checkStepAuth, projectRole, getMembers, assignStep } = useContext(ProjectContext);
  const { setIsLoading } = useContext(LoadingContext);

  // Demo workflow steps with comments
  const [workflowSteps, setWorkflowSteps] = useState([
    { id: 1, name: "Service Requirements", checked: true, comments: [] },
    { id: 2, name: "Inquiry Section", checked: true, comments: [] },
    { id: 3, name: "Finalize Contract", checked: true, comments: [] },
    { id: 4, name: "Gap Analysis", checked: true, comments: [] },
    { id: 5, name: "Data Analysis", checked: false, comments: [] },
    { id: 6, name: "RART", checked: false, comments: [] },
    { id: 7, name: "Planning and Implementation", checked: false, comments: [] },
    { id: 8, name: "Implementation of Policies", checked: false, comments: [] },
    { id: 9, name: "Internal Audit Process", checked: false, comments: [] },
  ]);

  // Demo comments
  const [comments, setComments] = useState([
    {
      id: 1,
      author: "Neha Gupta",
      avatar: null,
      content: "Risk assessment completed. We identified 3 high-risk areas that need immediate attention.",
      datetime: "2023-06-10 14:30",
      replies: [
        {
          id: 101,
          author: "Arjun Mehta",
          avatar: null,
          content: "Thanks for the update. Let's discuss the high-risk areas in tomorrow's meeting.",
          datetime: "2023-06-10 15:45",
        }
      ]
    },
    {
      id: 2,
      author: "Ravi Singh",
      avatar: null,
      content: "Gap analysis data collection is completed. Moving on to the findings section now.",
      datetime: "2023-06-12 09:15",
      replies: []
    }
  ]);

  const get_step_id = async () => {
    setIsLoading(true);
    try {
      const response = await getStepId(projectid, 9);
      if (response) {
        console.log("API Response (InternalAuditProcess):", response);
        console.log("Associated ISO Clause (InternalAuditProcess):", response.associated_iso_clause);

        setStepId(response.plc_step_id);
        setStepStatus(response.status);
        setAssociatedIsoClause(response.associated_iso_clause);
        setProcess(response.process || "core");
        const isAuthorized = await checkStepAuth(response.plc_step_id);
        setIsAssignedUser(isAuthorized);
      }
    } catch (error) {
      console.error("Error fetching step ID:", error);
      message.error("Failed to load internal audit data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    get_step_id();
  }, []);

  const updateStepStatus = async (newStatus) => {
    try {
      const response = await apiRequest(
        "PUT",
        `/api/plc/plc_step/${stepId}/update-status/`,
        {
          status: newStatus,
        },
        true
      );

      if (response.status === 200) {
        setStepStatus(newStatus);
        message.success("Status updated successfully");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      message.error("Failed to update status");
    }
  };

  const updateProcess = async (newProcess) => {
    try {
      const response = await apiRequest(
        "PATCH",
        `/api/plc/plc_step/${stepId}/update/`,
        {
          core_or_noncore: newProcess,
        },
        true
      );

      if (response.status === 200) {
        setProcess(newProcess);
        message.success("Process updated successfully");
      }
    } catch (error) {
      console.error("Error updating process:", error);
      message.error("Failed to update process");
    }
  };

  const handleStepChange = (id) => {
    setWorkflowSteps(
      workflowSteps.map(step =>
        step.id === id ? { ...step, checked: !step.checked } : step
      )
    );
  };

  const handleCommentSubmit = () => {
    if (!commentText.trim()) return;

    const newComment = {
      id: comments.length + 1,
      author: "Current User",
      avatar: null,
      content: commentText,
      datetime: new Date().toLocaleString(),
      replies: []
    };

    setComments([...comments, newComment]);
    setCommentText("");
  };

  const handleReplySubmit = (commentId) => {
    if (!replyText.trim()) return;

    const newReply = {
      id: Math.floor(Math.random() * 1000),
      author: "Current User",
      avatar: null,
      content: replyText,
      datetime: new Date().toLocaleString(),
    };

    setComments(
      comments.map(comment =>
        comment.id === commentId
          ? { ...comment, replies: [...comment.replies, newReply] }
          : comment
      )
    );

    setReplyText("");
    setReplyingTo(null);
  };

  const progress = (workflowSteps.filter(step => step.checked).length / workflowSteps.length) * 100;

  const get_members = async () => {
    const res = await getMembers(projectid);
    setMembers(res);
  };

  const handleAssignTask = async () => {
    await get_members();
    setIsAssignTaskVisible(true);
  };

  const handleAssignTaskClose = () => {
    setIsAssignTaskVisible(false);
  };

  const handleSubmitAssignment = async () => {
    if (selectedTeamMembers.length === 0) {
      message.warning("Please select at least one team member.");
      return;
    }

    if (!taskDescription.trim()) {
      message.warning("Please provide a task description.");
      return;
    }

    if (!taskDeadline) {
      message.warning("Please select a deadline.");
      return;
    }

    const assignmentData = {
      assigned_to: selectedTeamMembers,
      description: taskDescription,
      deadline: taskDeadline.format("YYYY-MM-DD"),
      references: taskReferences,
    };

    try {
      const result = await assignStep(stepId, assignmentData);

      if (result) {
        message.success("Task assigned successfully!");
        setIsAssignTaskVisible(false);

        // Reset form fields
        setSelectedTeamMembers([]);
        setTaskDescription("");
        setTaskDeadline(null);
        setTaskReferences("");
      } else {
        message.error("Failed to assign task.");
      }
    } catch (error) {
      message.error("Failed to assign task.");
      console.error(error);
    }
  };

  // Toggle step comment section
  const toggleStepComment = (stepId) => {
    setExpandedSteps(prev =>
      prev.includes(stepId)
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId]
    );
  };

  // Add comment to a step
  const addStepComment = (stepId) => {
    if (!newStepComment.trim()) return;

    const comment = {
      id: Date.now(),
      author: "Current User",
      content: newStepComment,
      datetime: new Date().toLocaleString(),
    };

    setWorkflowSteps(prev =>
      prev.map(step =>
        step.id === stepId
          ? { ...step, comments: [...step.comments, comment] }
          : step
      )
    );

    setNewStepComment("");
  };

  return (
    <div className="p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Internal Audit Process
        </h1>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium
                ${stepStatus === "completed"
                  ? "bg-green-100 text-green-800"
                  : stepStatus === "in_progress"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
            >
              {stepStatus.charAt(0).toUpperCase() +
                stepStatus.slice(1).replace("_", " ")}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              ISO: <InteractiveIsoClause isoClause={associatedIsoClause} />
            </span>
          </div>
          <div className="flex space-x-3">
            {projectRole?.includes("consultant admin") && (
              <Button
                type="default"
                onClick={handleAssignTask}
                className="bg-white hover:bg-gray-50 border border-gray-300 shadow-sm"
              >
                Assign Task
              </Button>
            )}
            {projectRole?.includes("consultant admin") && (
              <Select
                value={process}
                onChange={updateProcess}
                style={{ width: 120 }}
              >
                <Option value="core">Core</Option>
                <Option value="non core">Non Core</Option>
              </Select>
            )}
            {(projectRole?.includes("consultant admin") || isAssignedUser) && (
              <Select
                value={stepStatus}
                onChange={updateStepStatus}
                style={{ width: 140 }}
              >
                <Option value="pending">Pending</Option>
                <Option value="in_progress">In Progress</Option>
                <Option value="completed">Completed</Option>
              </Select>
            )}
            <Button type="primary" className="bg-blue-600 hover:bg-blue-700">
              Add Comment
            </Button>
          </div>
        </div>
      </div>

      {/* Checklist and Progress Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-700 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Workflow Checklist
          </h2>
          <div className="text-right">
            <p className="text-sm text-gray-500 mb-1">Completion Status</p>
            <div className="w-48 bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500 ease-in-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm font-medium text-blue-600 mt-1">{Math.round(progress)}% Complete</p>
          </div>
        </div>

        <div className="space-y-4">
          {workflowSteps.map((step) => (
            <div key={step.id} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
              <div
                className={`flex items-center justify-between p-4 cursor-pointer 
                  ${step.checked
                    ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
                    : "bg-white hover:bg-gray-50"}`}
                onClick={() => toggleStepComment(step.id)}
              >
                <div className="flex items-center">
                  <div
                    className={`relative mr-4 w-6 h-6 rounded-md border-2 flex items-center justify-center
                    ${step.checked
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-300 bg-white"}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStepChange(step.id);
                    }}
                  >
                    {step.checked && (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    )}
                  </div>
                  <div>
                    <span className={`text-gray-700 font-medium ${step.checked ? "line-through text-gray-500" : ""}`}>
                      {step.name}
                    </span>
                    {step.checked && (
                      <span className="ml-2 text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">Completed</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center">
                  {step.comments.length > 0 && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full mr-2 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                      {step.comments.length}
                    </span>
                  )}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 text-gray-500 transition-transform duration-300 ${expandedSteps.includes(step.id) ? 'transform rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
              </div>

              {/* Collapsible Comment Section */}
              {expandedSteps.includes(step.id) && (
                <div className="bg-gradient-to-r from-gray-50 to-white p-5 border-t border-gray-200 transition-all duration-300">
                  {/* Existing comments */}
                  {step.comments.length > 0 ? (
                    <div className="mb-5 space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {step.comments.map(comment => (
                        <div key={comment.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
                          <div className="flex items-center mb-2">
                            <Avatar
                              icon={<UserOutlined />}
                              size="small"
                              className="mr-2"
                              style={{ backgroundColor: '#1877F2' }}
                            />
                            <span className="font-medium text-sm text-gray-800">{comment.author}</span>
                            <span className="ml-auto text-xs text-gray-500 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {comment.datetime}
                            </span>
                          </div>
                          <p className="text-gray-700 text-sm pl-1 mb-2">{comment.content}</p>

                          {/* Reply button */}
                          <div className="mt-2 flex justify-end">
                            <Button
                              type="text"
                              size="small"
                              className="text-blue-600 hover:text-blue-800 flex items-center"
                              onClick={(e) => {
                                e.stopPropagation();
                                setReplyingTo(comment.id === replyingTo ? null : comment.id);
                              }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                              </svg>
                              Reply
                            </Button>
                          </div>

                          {/* Reply input field */}
                          {replyingTo === comment.id && (
                            <div className="mt-3 pl-4 border-l-2 border-blue-200 bg-blue-50 p-3 rounded-md transition-all duration-300">
                              <div className="flex items-start">
                                <Avatar size="small" icon={<UserOutlined />} className="mr-2 mt-1" style={{ backgroundColor: '#1877F2' }} />
                                <div className="flex-1">
                                  <TextArea
                                    rows={2}
                                    placeholder="Write your reply..."
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    className="w-full border-gray-300 focus:border-blue-400 focus:ring focus:ring-blue-200 focus:ring-opacity-50 bg-white"
                                  />
                                  <div className="mt-2 flex justify-end gap-2">
                                    <Button
                                      size="small"
                                      onClick={() => setReplyingTo(null)}
                                      className="border-gray-300 text-gray-600"
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      size="small"
                                      type="primary"
                                      onClick={() => {
                                        if (replyText.trim()) {
                                          // Add reply to the comment
                                          const newReply = {
                                            id: Date.now(),
                                            author: "Current User",
                                            content: replyText,
                                            datetime: new Date().toLocaleString(),
                                          };

                                          setWorkflowSteps(prev =>
                                            prev.map(s =>
                                              s.id === step.id
                                                ? {
                                                  ...s,
                                                  comments: s.comments.map(c =>
                                                    c.id === comment.id
                                                      ? { ...c, replies: [...(c.replies || []), newReply] }
                                                      : c
                                                  )
                                                }
                                                : s
                                            )
                                          );
                                          setReplyText("");
                                          setReplyingTo(null);
                                        }
                                      }}
                                      className="bg-blue-600 hover:bg-blue-700"
                                    >
                                      Submit
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Display replies if any */}
                          {comment.replies && comment.replies.length > 0 && (
                            <div className="mt-3 pl-4 border-l-2 border-gray-200 space-y-3">
                              {comment.replies.map(reply => (
                                <div key={reply.id} className="bg-gray-50 p-3 rounded-md">
                                  <div className="flex items-center mb-1">
                                    <Avatar
                                      icon={<UserOutlined />}
                                      size="small"
                                      className="mr-2"
                                      style={{ backgroundColor: '#6366F1' }}
                                    />
                                    <span className="font-medium text-xs text-gray-800">{reply.author}</span>
                                    <span className="ml-auto text-xs text-gray-500">
                                      {reply.datetime}
                                    </span>
                                  </div>
                                  <p className="text-gray-700 text-xs pl-6">{reply.content}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 bg-gray-50 rounded-lg mb-4 text-gray-500 text-sm flex flex-col items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                      <p className="font-medium">No comments yet for this step</p>
                      <p className="text-xs mt-1 text-gray-400">Be the first to add a comment</p>
                    </div>
                  )}

                  {/* Add new comment */}
                  <div className="flex items-start bg-white p-3 rounded-lg border border-gray-200 focus-within:border-blue-300 focus-within:ring-1 focus-within:ring-blue-200 transition-all duration-200 shadow-sm">
                    <Avatar icon={<UserOutlined />} size="small" className="mr-3 mt-1" style={{ backgroundColor: '#1877F2' }} />
                    <TextArea
                      rows={2}
                      placeholder={`Add a comment about "${step.name}"...`}
                      value={newStepComment}
                      onChange={e => setNewStepComment(e.target.value)}
                      className="flex-1 mr-2 border-0 focus:shadow-none focus:ring-0 resize-none"
                    />
                    <Button
                      type="primary"
                      onClick={() => addStepComment(step.id)}
                      className="bg-blue-600 hover:bg-blue-700 self-end flex items-center"
                      icon={<SendOutlined />}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Assign Task Modal */}
      <Modal
        title="Assign Task"
        open={isAssignTaskVisible}
        onCancel={handleAssignTaskClose}
        footer={[
          <Button
            key="assign"
            type="primary"
            onClick={handleSubmitAssignment}
            className="bg-blue-500"
          >
            Assign
          </Button>,
        ]}
      >
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Team Members</label>
          <Select
            mode="multiple"
            placeholder="Select team members"
            value={selectedTeamMembers}
            onChange={setSelectedTeamMembers}
            style={{ width: "100%" }}
          >
            {members &&
              members.map((member) => (
                <Option key={member.id} value={member.id}>
                  {member.name}
                </Option>
              ))}
          </Select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Team Deadline
          </label>
          <DatePicker
            style={{ width: "100%" }}
            value={taskDeadline}
            onChange={setTaskDeadline}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Task Description
          </label>
          <Input
            placeholder="Enter task description"
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Task References
          </label>
          <Input
            placeholder="Add reference URLs"
            value={taskReferences}
            onChange={(e) => setTaskReferences(e.target.value)}
          />
        </div>
      </Modal>

      {/* CSS for custom scrollbar */}
      <style jsx="true">{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default InternalAuditProcess;
