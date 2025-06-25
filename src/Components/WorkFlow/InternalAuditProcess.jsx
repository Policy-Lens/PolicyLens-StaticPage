import React, { useState, useContext, useEffect } from "react";
import { Button, message, Select, Modal, Input, Upload } from "antd";
import { ProjectContext } from "../../Context/ProjectContext";
import { useParams } from "react-router-dom";
import { LoadingContext } from "./VertStepper";
import { apiRequest } from "../../utils/api";
import { PaperClipOutlined } from "@ant-design/icons";
import InteractiveIsoClause from "../Common/InteractiveIsoClause";

const { TextArea } = Input;
const { Option } = Select;

const InternalAuditProcess = () => {
  const [stepStatus, setStepStatus] = useState("pending");
  const [stepId, setStepId] = useState(null);
  const [isAssignedUser, setIsAssignedUser] = useState(false);
  const [associatedIsoClause, setAssociatedIsoClause] = useState(null);
  const [process, setProcess] = useState("core");
  const [questionResponses, setQuestionResponses] = useState({});
  const [isNeedsMoreInfoModalVisible, setIsNeedsMoreInfoModalVisible] = useState(false);
  const [moreInfoComment, setMoreInfoComment] = useState("");
  const [moreInfoFileList, setMoreInfoFileList] = useState([]);

  const { projectid } = useParams();
  const { getStepId, checkStepAuth, projectRole } = useContext(ProjectContext);
  const { setIsLoading } = useContext(LoadingContext);

  // Audit questions data structure based on the image
  const auditQuestions = [
    {
      id: "A1",
      text: "Has management established and authorized a comprehensive risk governance framework that outlines Enterprise Risk Management program specifications?",
      followUp: null
    },
    {
      id: "B",
      text: "Nth Party Management",
      isSection: true
    },
    {
      id: "B1",
      text: "Can external service providers (such as backup services, contractors, equipment maintenance, software support, disaster recovery, cloud hosting, etc.) access systems and data within scope or related processing environments?",
      followUp: {
        condition: "Yes",
        questions: [
          {
            id: "B11",
            text: "Has management established and endorsed a comprehensive vendor risk management framework?",
            followUp: {
              condition: "Yes",
              questions: [
                {
                  id: "B111",
                  text: "Have formal vendor risk management policies and procedures been established for evaluating, monitoring, and managing external service providers within the scope of services?",
                  followUp: null
                },
                {
                  id: "B112",
                  text: "Do contractual agreements with all external organizations (including sub-vendors, contractors, and fourth parties) include provisions that enforce compliance obligations?",
                  followUp: null
                }
              ]
            }
          }
        ]
      }
    },
    {
      id: "C1",
      text: "Has an information security framework been established, authorized by management, documented, and distributed to relevant stakeholders?",
      followUp: null
    },
    {
      id: "D",
      text: "Asset and Info Management",
      isSection: true
    },
    {
      id: "D1",
      text: "Has management established an asset management framework with designated ownership for maintaining, evaluating, and overseeing asset security controls?",
      followUp: null
    },
    {
      id: "E",
      text: "Human Resources Security",
      isSection: true
    },
    {
      id: "E1",
      text: "Have Human Resources policies and procedures been authorized by management, distributed to stakeholders, and assigned to a responsible party for ongoing maintenance and evaluation?",
      followUp: null
    },
    {
      id: "F",
      text: "Physical and Environmental Security",
      isSection: true
    },
    {
      id: "F1",
      text: "Has a physical security framework been established with management approval, stakeholder communication, and designated ownership for ongoing maintenance and evaluation?",
      followUp: null
    },
    {
      id: "G",
      text: "IT Operations Management",
      isSection: true
    },
    {
      id: "G1",
      text: "Does senior management ensure that IT Operations policies and procedures are developed and properly aligned with organizational objectives?",
      followUp: null
    },
    {
      id: "H",
      text: "Access Control",
      isSection: true
    },
    {
      id: "H1",
      text: "Has an access management framework been established with management authorization, stakeholder communication, and assigned ownership for ongoing maintenance and evaluation?",
      followUp: null
    },
    {
      id: "I",
      text: "Application Security",
      isSection: true
    },
    {
      id: "I1",
      text: "Do software applications handle, transfer, or store data that falls within the audit scope?",
      followUp: null
    }
  ];

  const get_step_id = async () => {
    setIsLoading(true);
    try {
      const response = await getStepId(projectid, 9);
      if (response) {
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
        { status: newStatus },
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
        { core_or_noncore: newProcess },
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

  const handleQuestionResponse = (questionId, response) => {
    setQuestionResponses(prev => ({
      ...prev,
      [questionId]: response
    }));
  };

  const shouldShowFollowUp = (question) => {
    if (!question.followUp) return false;
    return questionResponses[question.id] === question.followUp.condition;
  };

  const getResponseButtonClass = (questionId, responseType) => {
    const isSelected = questionResponses[questionId] === responseType;
    const baseClass = "px-3 py-1 h-auto text-xs font-medium border transition-all duration-200";

    if (responseType === "Yes") {
      return isSelected
        ? `${baseClass} bg-green-600 border-green-600 text-white hover:bg-green-700`
        : `${baseClass} border-green-300 text-green-600 hover:border-green-500 hover:text-green-700 hover:bg-green-50`;
    } else if (responseType === "No") {
      return isSelected
        ? `${baseClass} bg-red-600 border-red-600 text-white hover:bg-red-700`
        : `${baseClass} border-red-300 text-red-600 hover:border-red-500 hover:text-red-700 hover:bg-red-50`;
    } else { // N/A
      return isSelected
        ? `${baseClass} bg-gray-600 border-gray-600 text-white hover:bg-gray-700`
        : `${baseClass} border-gray-300 text-gray-600 hover:border-gray-500 hover:text-gray-700 hover:bg-gray-50`;
    }
  };

  const renderQuestion = (question, level = 0) => {
    if (question.isSection) {
      return (
        <div key={question.id} className={`mb-4 ${level > 0 ? 'ml-6' : ''}`}>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-3 rounded-lg">
            <h3 className="text-base font-semibold text-blue-800">
              {question.id}. {question.text}
            </h3>
          </div>
        </div>
      );
    }

    const currentResponse = questionResponses[question.id];

    return (
      <div key={question.id} className={`mb-4 ${level > 0 ? 'ml-6 border-l-2 border-blue-200 pl-4' : ''}`}>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-300">
          <div className="mb-4">
            <div className="flex items-start mb-3">
              <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold mr-3 min-w-fit">
                {question.id}
              </span>
              <h4 className="text-sm font-medium text-gray-800 leading-relaxed">
                {question.text}
              </h4>
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <Button
              type={currentResponse === "Yes" ? "primary" : "default"}
              onClick={() => handleQuestionResponse(question.id, "Yes")}
              className={getResponseButtonClass(question.id, "Yes")}
              size="small"
            >
              Yes
            </Button>
            <Button
              type={currentResponse === "No" ? "primary" : "default"}
              onClick={() => handleQuestionResponse(question.id, "No")}
              className={getResponseButtonClass(question.id, "No")}
              size="small"
            >
              No
            </Button>
            <Button
              type={currentResponse === "N/A" ? "primary" : "default"}
              onClick={() => handleQuestionResponse(question.id, "N/A")}
              className={getResponseButtonClass(question.id, "N/A")}
              size="small"
            >
              N/A
            </Button>
          </div>

          {currentResponse && (
            <div className={`p-2 rounded border-l-2 ${currentResponse === "Yes" ? "bg-green-50 border-green-400" :
              currentResponse === "No" ? "bg-red-50 border-red-400" : "bg-gray-50 border-gray-400"
              }`}>
              <div className="flex items-center">
                <span className="text-xs text-gray-600 mr-2">Response:</span>
                <span className={`font-medium text-xs ${currentResponse === "Yes" ? "text-green-700" :
                  currentResponse === "No" ? "text-red-700" : "text-gray-700"
                  }`}>
                  {currentResponse}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Render follow-up questions */}
        {shouldShowFollowUp(question) && (
          <div className="mt-3 animate-fadeIn">
            <div className="mb-2">
              <div className="flex items-center">
                <div className="flex-1 border-t border-blue-300"></div>
                <span className="px-2 text-xs font-medium text-blue-600 bg-blue-50 rounded border border-blue-200">
                  Follow-up Questions
                </span>
                <div className="flex-1 border-t border-blue-300"></div>
              </div>
            </div>
            {question.followUp.questions.map(followUpQuestion =>
              renderQuestion(followUpQuestion, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  const handleNeedsMoreInfoSubmit = async () => {
    if (!moreInfoComment.trim()) {
      message.warning("Please provide a comment.");
      return;
    }
    try {
      message.success("More information request submitted successfully!");
      setIsNeedsMoreInfoModalVisible(false);
      setMoreInfoComment("");
      setMoreInfoFileList([]);
    } catch (error) {
      message.error("Failed to submit more information request.");
      console.error(error);
    }
  };

  const handleMoreInfoFileChange = ({ fileList: newFileList }) => {
    setMoreInfoFileList(newFileList);
  };

  const handleNeedsMoreInfoClose = () => {
    setIsNeedsMoreInfoModalVisible(false);
    setMoreInfoComment("");
    setMoreInfoFileList([]);
  };



  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header Section */}
      <div className="mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold text-gray-800">
              Internal Audit Process
            </h1>
            <div className="flex space-x-3">
              {projectRole?.includes("consultant admin") && (
                <Button
                  type="default"
                  onClick={() => {
                    message.success("Step sent for review successfully!");
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white border-green-600"
                >
                  Send for Review
                </Button>
              )}

              {projectRole === "company" && (
                <>
                  <Button
                    type="default"
                    onClick={() => {
                      message.success("Step accepted successfully!");
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white border-green-600"
                  >
                    Accept
                  </Button>
                  <Button
                    type="default"
                    onClick={() => {
                      message.success("Step rejected successfully!");
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white border-red-600"
                  >
                    Reject
                  </Button>
                  <Button
                    type="default"
                    onClick={() => {
                      setIsNeedsMoreInfoModalVisible(true);
                    }}
                    className="bg-orange-600 hover:bg-orange-700 text-white border-orange-600"
                  >
                    Needs More Info
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium
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
              {/* ISO Clause Badge with space after colon */}
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                ISO:&nbsp;<InteractiveIsoClause isoClause={associatedIsoClause} />
              </span>
            </div>
            <div className="flex space-x-3">
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
            </div>
          </div>
        </div>
      </div>



      {/* Questions Section */}
      <div className="space-y-4">
        {auditQuestions.map(question => renderQuestion(question))}
      </div>

      {/* Save Progress Button */}
      <div className="mt-6 flex justify-end">
        <Button
          type="primary"
          onClick={() => {
            console.log("Saving responses:", questionResponses);
            message.success("Progress saved successfully!");
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Save Progress
        </Button>
      </div>

      {/* Needs More Info Modal */}
      <Modal
        title="Request More Information"
        open={isNeedsMoreInfoModalVisible}
        onCancel={handleNeedsMoreInfoClose}
        footer={[
          <Button key="cancel" onClick={handleNeedsMoreInfoClose}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleNeedsMoreInfoSubmit}
            className="bg-orange-600 hover:bg-orange-700"
          >
            Submit Request
          </Button>,
        ]}
        width={600}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comment <span className="text-red-500">*</span>
            </label>
            <TextArea
              rows={4}
              placeholder="Please provide details about what additional information is needed..."
              value={moreInfoComment}
              onChange={(e) => setMoreInfoComment(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attach Files (Optional)
            </label>
            <Upload
              fileList={moreInfoFileList}
              onChange={handleMoreInfoFileChange}
              beforeUpload={() => false}
              multiple
              showUploadList={true}
            >
              <Button icon={<PaperClipOutlined />}>
                Attach Files
              </Button>
            </Upload>
          </div>
        </div>
      </Modal>

      {/* Custom CSS */}
      <style jsx="true">{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default InternalAuditProcess;
