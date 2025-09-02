import React, { useState, useContext, useEffect } from "react";
import {
  Button,
  Input,
  Form,
  Row,
  Col,
  Card,
  Divider,
  Space,
  Typography,
  Tooltip,
  Collapse,
  message,
  Modal,
  Dropdown,
  Select,
  DatePicker,
  Upload,
} from "antd";
import { PaperClipOutlined, FileTextOutlined, LoadingOutlined } from "@ant-design/icons";
import { ProjectContext } from "../../Context/ProjectContext";
import { useParams } from "react-router-dom";
import { BASE_URL, apiRequest } from "../../utils/api";
import InteractiveIsoClause from "../Common/InteractiveIsoClause";

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

function FinalizeContract() {
  const [form] = Form.useForm();
  const [contractData, setContractData] = useState(null);
  const [stepId, setStepId] = useState(null);
  const [isAssignedUser, setIsAssignedUser] = useState(false);
  const [stepStatus, setStepStatus] = useState("pending");
  const [reviewStatus, setReviewStatus] = useState("not_submitted");
  const [reviewComment, setReviewComment] = useState("");
  const [isAssignTaskVisible, setIsAssignTaskVisible] = useState(false);
  const [taskAssignment, setTaskAssignment] = useState(null);
  const [members, setMembers] = useState([]);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDeadline, setTaskDeadline] = useState(null);
  const [taskReferences, setTaskReferences] = useState("");
  const [associatedIsoClause, setAssociatedIsoClause] = useState(null);
  const [process, setProcess] = useState("core");
  const [isNeedsMoreInfoModalVisible, setIsNeedsMoreInfoModalVisible] = useState(false);
  const [isAcceptModalVisible, setIsAcceptModalVisible] = useState(false);
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [moreInfoComment, setMoreInfoComment] = useState("");
  const [acceptComment, setAcceptComment] = useState("");
  const [rejectComment, setRejectComment] = useState("");
  const [moreInfoFileList, setMoreInfoFileList] = useState([]);
  const [acceptFileList, setAcceptFileList] = useState([]);
  const [rejectFileList, setRejectFileList] = useState([]);
  const [reviewOldFilesNeeded, setReviewOldFilesNeeded] = useState([]);
  const [reviewRemovedOldFiles, setReviewRemovedOldFiles] = useState([]);
  const [downloadingFiles, setDownloadingFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const { projectid } = useParams();
  const {
    getStepId,
    checkStepAuth,
    projectRole,
    assignStep,
    getStepAssignment,
    getMembers,
    getProjectRole,
  } = useContext(ProjectContext);

  const checkAssignedUser = async (step_id) => {
    const isAuthorized = await checkStepAuth(step_id);
    setIsAssignedUser(isAuthorized);
  };

  const fetchContractData = async (step_id) => {
    try {
      console.log("🔍 Fetching contract data for step:", step_id);
      const response = await apiRequest(
        "GET",
        `/api/plc/contract-data/${step_id}/`,
        null,
        true
      );
      if (response.status === 200) {
        console.log("✅ Contract data fetched successfully:", response.data);
        setContractData(response.data);
        form.setFieldsValue(response.data);
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error("❌ Error fetching contract data:", error);
        console.error("Error response:", error.response?.data);
      } else {
        console.log("ℹ️ No contract data found (404) - will use defaults");
        // Set default values when no data exists
        const defaultValues = {
          document_classification: "Confidential",
          document_title: "STATEMENT of WORK - CONFIDENTIALITY & NON-DISCLOSURE AGREEMENT (SOW – NDA)",
          main_section: "This Agreement for rendering Services (\"Agreement\") is made and executed on <Day and Date> (Hereafter \"effective date\") between: \n<Consultant Legal Name>\n(PAN: <12345678> / GSTN: <1234567890> ) \n(Hereafter \"XYZ\" or \"Service Provider\" ) \n\nand \n\n<Company Legal Name> \n(PAN : <12345678> / GSTN: <1234567890> ) \n(Hereafter \"ABC\" or \"Client\"). \n\nIn consideration of the mutual promises set for the herein, Client and Service provider agree as follows:",
          clause_1_services: "A) Service provider shall perform the professional services (\"Services\") as described in Exhibit A - Scope of Service attached hereto and by this reference incorporated herein. \nB) Service provider shall at all times comply with all applicable laws, regulations, rules, relevant applicable to Service provider's provision of the Services. \nC) Client shall ensure that Service provider has provided necessary resources for effectively discharge services.",
          clause_2_payment_terms: "Service provider will be paid <Rs. XXXXXX/-> (<XXX>  only) + taxes per month for services rendered as per Exhibit A from effective date. \nThe terms and conditions are as follows: \nA. Taxes \n1. Any service and other tax or local levy applicable at the client's site or location, on the services offered, shall be borne by <ABC>. \n\nB. Exclusion \n1. This proposed cost excludes any cost due towards the certifying body (Third Party) \n2. Any out of pocket expense, borne by <XYZ> shall be reimbursed by <ABC> subject reasonable and satisfactory justification by Arunima \n\nC. Payment terms \n1. Invoice shall be raised on last business day of every month \n2. Credit period will be 10 calendar days \n\nD. Project performance is dependent upon \n1.Commitment from the client organization \n2. Availability of required resources from the client \n3. Strict adherence by the client to the project plan as specified by Consultant",
          clause_3_duration_agreement: "This Agreement is valid for a period of <days> days from the effective date. The duration can be further extended upon mutual agreement between both the parties.",
          clause_4_invoices_payments: "Service provider shall invoice Client for its fees as per the Clause 2 above. \nIf the Client objects to all or any portion of any invoice, Client shall so notify Service provider within 7 days from receipt, give reasons for the objection, and pay that portion of the invoice not in dispute within 7 days of receipt of the invoice. Unless otherwise directed in writing, all invoices shall be submitted for payment to the following address: <Bill to details>",
          clause_5_indemnification: "A. Service provider shall indemnify, defend and hold Client harmless from any and all claims demands causes of actions, losses , damages , fines,  penalties, liabilities, costs and expenses, including reasonable attorney's fees and court costs, sustained or incurred by or asserted against Client by reason of or arising out of Service provider's breach of this Agreement or Management Consultant's gross negligence or willful misconduct with respect to Management Consultant's duties and activities within the scope of this Agreement.\nB. Except for Service providers breach of this Agreement or gross negligence or willful misconduct, Client shall indemnify, defend and hold Service provider harmless from and against any and all claims, demands, causes of action, losses, damages, fines, penalties, liabilities, costs and expenses incurred in the capacity of a defendant or a witness, and all other costs and expenses (including without limitation attorneys' fees and court costs) to which Service provider may become liable or subject by reason of or arising out of the performance or non­performance of Service provider's duties and activities within the scope of this Agreement.\nC. Client shall indemnify, defend and hold Service provider harmless from any and all claims, demands, causes of action, losses, damages, fines, penalties, liabilities, costs and expenses, including reasonable attorney's fees and court cost sustained or incurred by or asserted against the Service provider by reason of or arising out of the Client's negligence, willful misconduct with respect to the Client's duties and activities including but not limited to any information provided by the Client to the Service provider upon which the Service provider shall rely in providing the Services.\nD. For the purposes of the above clauses, the Client agrees that any / all the claims (if any) against the Service provider shall be taken care by the Client or its representative and the Client shall ensure that Service provider is not called upon to be present in any Court Authority of law and / or any legal platform anywhere in the world with respect to the assignment. Further, in case the Service provider is required to be present for such matters / claims, the Client agrees to bear all the cost for and on behalf of the Service provider including but not limited to travelling, boarding, lodging, etc. and / or any other cost for the purposes of the same.",
          clause_6_proprietary_information: "As used in this Agreement, the term 'Proprietary Information' shall mean all trade secrets or confidential or Proprietary Information designated as such in writing by the Disclosing Party, whether by letter or by the use of an appropriate prominently placed Proprietary stamp or legend, prior to or at the time such trade secret or confidential or Proprietary Information is disclosed by the Disclosing Party to the Recipient. \nNotwithstanding the forgoing, information which is orally or visually disclosed to the recipient by the Disclosing Party or is disclosed in writing unaccompanied by a covering letter, proprietary stamp or legend, shall constitute proprietary information if the disclosing party, within 10 (ten) days after such disclosure, delivers to the Recipient a written document or documents describing such Proprietary Information and referencing the place and duties and who are bound to protect the confidentiality of such Proprietary Information, date of such oral, visual or written disclosure and the names of the employees or officers of the Recipient to whom such disclosure was made.",
          clause_7_confidentiality: "A. Each party shall keep secret and treat In strictest confidence all confidential information it has received about the other party or its customers and will not use the confidential information otherwise than for the purpose of performing its obligations under this Agreement in accordance with its terms and so far as may be required for the proper exercise of the Parties' respective rights under this Agreement. \nB. The term 'confidential information' shall include all written or oral information (including information received from third parties that the 'Disclosing Party' is obligated to treat as confidential) :\na. that is clearly identified in writing at the time of disclosure as confidential and in case of oral or visual disclosure, or \nb. that a reasonable person at the time of disclosure reasonably would assume, under the circumstances, to be confidential. \nC. Confidential information shall also include, without limitation, software programs, technical data, methodologies, know-how, processes, Designs, new products, developmental work, marketing requirements, marketing plans, customer names, prospective customer names, customer information and business information of the 'Disclosing Party'.",
          clause_8_non_disclosure: "For the period during the Agreement or its renewal, the Recipient will: \nA. Use such Proprietary Information only for the purpose for which it was disclosed and without prior written authorization of the Disclosing Party shall not use or exploit such Proprietary Information for its own benefit or the benefit of others. \nB. Protect the Proprietary Information against disclosure to third parties in the same manner and with the reasonable degree of care, with which it protects its confidential information of similar importance: and \nC. Limit disclosure of Proprietary Information received under this Agreement to persons within its organization and to those 3rd party contractors performing tasks that would otherwise customarily or outlinely be performed by its employees, who have a need to know such Proprietary Information in the course of performance of their duties",
          clause_9_return_documents: "The Recipient shall, upon the request of the Disclosing Party, in writing, return to the Disclosing Party all drawings, documents and other tangible manifestations of Proprietary Information received by the Recipient pursuant to this Agreement (and all copies and reproductions thereof) within a reasonable period. Each party agrees that in the event it is not inclined to proceed further with the engagement, business discussions and negotiations, or in the event of termination of this Agreement, the Recipient party will promptly return to the other party or with the consent of the other party, destroy the Proprietary Information of the other party.",
          clause_10_communications: "Written communications requesting or transferring Proprietary Information under this Agreement shall be addressed only to the respective designees as follows (or to such designees as the parties hereto may from time to time designate in writing)",
          clause_11_work_product_reliance: "Any deliverables, draft reports or final reports prepared by Service provider under this Agreement shall be used solely for the internal purposes of Client and Client agrees that it shall not use any such reports in connection with any public documents without consent of the Service provider.\nFurther, Service provider shall not be referred to in any public documents prior written consent, which may be given in its sole discretion.\n\nA. The Client can share the deliverable with other interested parties (for potential transaction). However, the Service provider shall not be liable to any such parties. Also, Service provider is not required to present / discuss the deliverables with any such parties.\nB. The data, documentation, and assumptions used to prepare any analysis or reports hereunder will be derived from information supplied by Client, published information, prepared by Service provider in the regular course of its business, and other industry sources. All such information will not be independently verified by Service provider for purposes of this Agreement. Service provider will not be responsible for the accuracy of such data and information, and for any assumptions derived therefrom. However, Service provider's performance will be based on Service provider's professional evaluation of all such available sources of information. Client acknowledges and agrees that there may be differences between projected and actual results because events and circumstances frequently do not occur as predicted, and those differences may be material and hereby releases Service provider from any claims or liability arising from these differences.\nC. Client is responsible for representations made to Service provider about its plans and expectations and for disclosure of significant information that might affect the ultimate realization of the conclusions and recommendations made by Service provider. The final decision to implement the recommendations made by Service provider rests with Client. Service provider's findings will constitute only part of the factors that Client should consider in its decision-making process.\nD. The parties understand and agree that neither Service provider's fees nor the payment thereof by Client is contingent upon the results, finding, conclusions or recommendations provided by Service provider",
          clause_12_limitation_liability: "Notwithstanding any other provision of this Agreement, neither party shall be liable to the other party for any indirect, consequential, incidental or special losses or damages of any kind or nature, and any claim by either party in any way related to, or arising out of, this Agreement or any Services provided hereunder shall be limited to such party's actual, direct damages.",
          clause_13_limit_obligations: "The obligations of the Recipient specified in clause 3 above shall not apply and the Recipient shall have no further obligations, with respect to any Proprietary Information to the extent that such Proprietary Information: \nA. is generally known to the public at the time of disclosure or becomes generally known without any wrongful act on the part of the Recipient, \nB. is in the Recipient's possession at the time of disclosure otherwise than as a result of the Recipient's breach of a legal obligation \nC. becomes known to the Recipient through disclosure by any other source, other than the Disclosing Party, having the legal right to disclose such Proprietary Information. \nD. Is independently developed by the Recipient without reference to or reliance upon the Proprietary Information; or \nE. Is required to be disclosed by the Recipient to comply with applicable laws or governmental regulation, provided that the recipient provides prior written notice of such disclosure to the Disclosing Party and takes reasonable and lawful actions to avoid and/or minimize the extent of such disclosure. \nF. Service provider involved in this assignment shall not deal with the securities of Client as per the SEBI (Prohibition of Insider Trading Regulations), 2015, read with any amendment thereto from time to time, during the term of this Agreement and for a period of one year after completion of this assignment",
          clause_14_termination_agreement: "This Agreement shall remain in full force and effect from the date of its execution until the earliest to occur of:\nA. Service provider's completion of the Services or\nB. Duration of the agreement as per clause 3 or\nC. Termination of the Agreement by either party with or without cause, upon (30) days advance written notice to the other party.\n\nShould the assignment be aborted or withdrawn for reasons beyond the control of Service provider any point in time during the course of the project, Service provider reserve the right to the complete services fee as per the contract",
          clause_15_waiver: "A waiver on the part of the Client or Service provider of any term, provision or condition of this Agreement shall not constitute a precedent or bind either Party to a waiver of any succeeding breach of the same or any other them, provision or condition of the Agreement.",
          clause_16_entire_agreement: "This Agreement, including any Exhibits and any addenda thereto, constitutes the entire Agreement between Service provider and Client. It supersedes all prior or contemporaneous communications, representations or agreements, whether oral or written, relating to the Services set forth in this Agreement.\nThe captions in this Agreement are for the convenience in identification of the several provisions and shall not constitute a part of this Agreement nor be considered interpretative thereof.",
          clause_17_assignment: "This Agreement shall be binding upon the successors or assigns of the parties hereto. This Agreement shall not be assigned by either party without first obtaining the written consent of the other.",
          clause_18_severability: "Every paragraph, part, term or provision of this Agreement is severable from the others. If any paragraph, part, term or provision of this Agreement is construed or held to be void, invalid or unenforceable by order, decree or judgment of a court of competent jurisdiction, the remaining paragraphs, parts, terms and provisions of the Agreement shall not be affected thereby but shall remain in full force and effect.",
          clause_19_notices: "Any information or notices required to be given in writing under this Agreement shall be deemed to have been sufficiently given if delivered either personally or by certified mail (return receipt requested, postage prepaid), telex or wire to the address of the respective party set forth below, or to such other address for either party as that party may designate by written notice.",
          clause_20_dispute_resolution: "Both parties agree to co-operate and to conduct in good faith such discussions and negotiations as may be necessary to amicably resolve any dispute which may arise between them. All disputes claims or proceedings between the Parties hereto relating to the validity, construction or performance of this Agreement shall be subject to the jurisdiction of the Courts at Pune, Maharashtra, India. The Parties irrevocably submits the jurisdiction of such courts.",
          clause_21_governing_law: "This Agreement shall be governed and interpreted pursuant to the laws of India",
          clause_21_governing_law_1: "IN WITNESS WHEREOF, Client and Service provider have caused this Agreement to be executed by their duly authorised representatives, as follows:",
          signature_box_1: "For <ABC>",
          signature_box_2: "For <XYZ>",
          exhibit_a_scope_service: "Consulting service for <>",
          exhibit_a_scope_service_2: "Location(s) under scope: <>",
          exhibit_a_scope_service_3: "Client's service under scope: <>",
          exhibit_a_scope_service_4: "Employees under scope: <>",
          exhibit_a_scope_service_5: "Resource Deployment Plan:",
          exhibit_a_scope_service_6: "Project Plan and Deliverables:"
        };
        form.setFieldsValue(defaultValues);
      }
    }
  };

  const handleFormSubmit = async (values) => {
    setLoading(true);
    try {
      const method = contractData ? "PUT" : "POST";
      const response = await apiRequest(
        method,
        `/api/plc/contract-data/${stepId}/`,
        values,
        true
      );
      
      if (response.status === 200 || response.status === 201) {
        message.success(
          contractData 
            ? "Contract data updated successfully!" 
            : "Contract data saved successfully!"
        );
        setContractData(response.data);
      } else {
        message.error("Failed to save contract data.");
      }
    } catch (error) {
      console.error("Error saving contract data:", error);
      message.error("Failed to save contract data.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendForReview = async () => {
    try {
      const response = await apiRequest(
        "PUT",
        `/api/plc/plc_step/${stepId}/update-status/`,
        { status: "completed" },
        true
      );
      if (response.status === 200) {
        message.success("Step sent for review successfully!");
        setStepStatus("completed");
        setReviewStatus("under_review");
        await get_step_id();
      } else {
        message.error("Failed to send step for review.");
      }
    } catch (error) {
      console.error("Error sending for review:", error);
      message.error("Failed to send step for review.");
    }
  };

  const handleReviewAction = async (action) => {
    let comment = "";
    let fileList = [];
    let modalVisible = false;

    // Get comment and file list based on action
    if (action === "accept") {
      comment = acceptComment;
      fileList = acceptFileList;
      modalVisible = setIsAcceptModalVisible;
    } else if (action === "reject") {
      comment = rejectComment;
      fileList = rejectFileList;
      modalVisible = setIsRejectModalVisible;
      // Require comment for reject action
      if (!comment.trim()) {
        message.warning("Please provide a comment explaining the rejection.");
        return;
      }
    } else if (action === "needs_info") {
      comment = moreInfoComment;
      fileList = moreInfoFileList;
      modalVisible = setIsNeedsMoreInfoModalVisible;
      // Require comment for needs_info action
      if (!comment.trim()) {
        message.warning("Please provide a comment for your review.");
        return;
      }
    }

    try {
      let requestData;
      let isMultipart = false;

      if (fileList.length > 0 || reviewOldFilesNeeded.length > 0) {
        // Use FormData when files are involved
        const formData = new FormData();
        formData.append("review_status", action === "accept" ? "accepted" : action === "reject" ? "rejected" : "needs_info");
        formData.append("review_comment", comment);
        formData.append("old_files", JSON.stringify(reviewOldFilesNeeded));
        fileList.forEach((file) => {
          formData.append("files", file.originFileObj);
        });
        requestData = formData;
        isMultipart = true;
      } else {
        // Use JSON for actions without files
        requestData = {
          review_status: action === "accept" ? "accepted" : action === "reject" ? "rejected" : "needs_info",
          review_comment: comment
        };
        isMultipart = false;
      }

      const response = await apiRequest(
        "POST",
        `/api/plc/plc_step/${stepId}/submit-review/`,
        requestData,
        true,
        isMultipart
      );
      
      if (response.status === 200) {
        message.success(`Review ${action} submitted successfully!`);
        setReviewStatus(response.data.review_status);
        setReviewComment(response.data.review_comment || "");
        setReviewOldFilesNeeded(response.data.documents?.map((doc) => doc.file) || []);
        
        // Close modal and clear state based on action
        if (action === "accept") {
          setIsAcceptModalVisible(false);
          setAcceptComment("");
          setAcceptFileList([]);
        } else if (action === "reject") {
          setIsRejectModalVisible(false);
          setRejectComment("");
          setRejectFileList([]);
        } else if (action === "needs_info") {
          setIsNeedsMoreInfoModalVisible(false);
          setMoreInfoComment("");
          setMoreInfoFileList([]);
        }
        
        await get_step_id();
      } else {
        message.error(`Failed to submit ${action} review.`);
      }
    } catch (error) {
      console.error(`Error submitting ${action} review:`, error);
      message.error(error.response?.data?.message || `Failed to submit ${action} review.`);
    }
  };

  const getFileName = (filePath) => {
    return filePath.split("/").pop();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getViewerUrl = (filePath) => {
    const extension = filePath.split(".").pop().toLowerCase();
    if (extension === "pdf") {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(
        `${BASE_URL}${filePath}`
      )}&embedded=true`;
    }
    if (["jpg", "jpeg", "png", "gif", "bmp", "svg"].includes(extension)) {
      return `${BASE_URL}${filePath}`;
    }
    return `https://docs.google.com/viewer?url=${encodeURIComponent(
      `${BASE_URL}${filePath}`
    )}&embedded=true`;
  };

  const get_step_id = async () => {
    try {
      const response = await getStepId(projectid, 3);
      if (response) {
        setStepId(response.plc_step_id);
        setStepStatus(response.status);
        setReviewStatus(response.review_status || "not_submitted");
        setReviewComment(response.review_comment || "");
        setAssociatedIsoClause(response.associated_iso_clause);
        setProcess(response.process || "core");
        
        // Debug logging
        console.log("Step Status:", response.status);
        console.log("Review Status:", response.review_status);
        console.log("Project Role:", projectRole);
        
        await fetchContractData(response.plc_step_id);
        await checkAssignedUser(response.plc_step_id);
        await getTaskAssignment(response.plc_step_id);
        const reviewData = await apiRequest(
          "GET",
          `/api/plc/plc_step/${response.plc_step_id}/review-files/`,
          null,
          true
        );
        if (reviewData.status === 200 && reviewData.data.documents) {
          setReviewOldFilesNeeded(reviewData.data.documents.map((doc) => doc.file));
        }
      }
    } catch (error) {
      console.error("Error fetching step ID:", error);
      message.error("Failed to load contract data.");
    }
  };

  const getTaskAssignment = async (step_id) => {
    try {
      const assignmentData = await getStepAssignment(step_id);
      if (assignmentData.status === 200 && assignmentData.data.length > 0) {
        setTaskAssignment(assignmentData.data[0]);
      } else {
        setTaskAssignment(null);
      }
    } catch (error) {
      console.error("Error fetching task assignment:", error);
      setTaskAssignment(null);
    }
  };

  const get_members = async () => {
    const res = await getMembers(projectid);
    setMembers(res);
  };

  const handleAssignTask = () => {
    get_members();
    setIsAssignTaskVisible(true);
  };

  const handleAssignTaskClose = () => {
    setIsAssignTaskVisible(false);
    setSelectedTeamMembers([]);
    setTaskDescription("");
    setTaskDeadline(null);
    setTaskReferences("");
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
        setSelectedTeamMembers([]);
        setTaskDescription("");
        setTaskDeadline(null);
        setTaskReferences("");
        await get_step_id();
      } else {
        message.error("Failed to assign task.");
      }
    } catch (error) {
      message.error("Failed to assign task.");
      console.error(error);
    }
  };

  const handleNeedsMoreInfoClose = () => {
    setIsNeedsMoreInfoModalVisible(false);
    setMoreInfoComment("");
    setMoreInfoFileList([]);
  };

  const handleAcceptModalClose = () => {
    setIsAcceptModalVisible(false);
    setAcceptComment("");
    setAcceptFileList([]);
  };

  const handleRejectModalClose = () => {
    setIsRejectModalVisible(false);
    setRejectComment("");
    setRejectFileList([]);
  };

  const handleFileDownload = async (fileUrl, fileName) => {
    setDownloadingFiles((prev) => [...prev, fileUrl]);
    try {
      const fullUrl = fileUrl.startsWith('http') ? fileUrl : `${BASE_URL}${fileUrl}`;
      const response = await fetch(fullUrl, { credentials: 'include' });
      if (!response.ok) throw new Error('Network response was not ok');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      message.error('Failed to download file');
    } finally {
      setDownloadingFiles((prev) => prev.filter((f) => f !== fileUrl));
    }
  };

  useEffect(() => {
    get_step_id();
    getProjectRole(projectid);
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
        await get_step_id();
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
        await get_step_id();
      }
    } catch (error) {
      console.error("Error updating process:", error);
      message.error("Failed to update process");
    }
  };

  return (
    <div className="min-h-full p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Finalize Contract</h2>
          <div className="flex space-x-3">
            {projectRole.includes("consultant admin") && reviewStatus !== "under_review" && reviewStatus !== "accepted" && (
              <Button
                type="default"
                onClick={handleSendForReview}
                className="bg-green-600 hover:bg-green-700 text-white border-green-600"
              >
                Send for Review
              </Button>
            )}
            {projectRole === "company" && reviewStatus === "under_review" && (
              <>
                <Button
                  type="default"
                  onClick={() => setIsAcceptModalVisible(true)}
                  className="bg-green-600 hover:bg-green-700 text-white border-green-600"
                >
                  Accept
                </Button>
                <Button
                  type="default"
                  onClick={() => setIsRejectModalVisible(true)}
                  className="bg-red-600 hover:bg-red-700 text-white border-red-600"
                >
                  Reject
                </Button>
                <Button
                  type="default"
                  onClick={() => setIsNeedsMoreInfoModalVisible(true)}
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
              className={`px-3 py-1 rounded-full text-sm font-medium
                ${reviewStatus === "accepted"
                  ? "bg-green-100 text-green-800"
                  : reviewStatus === "rejected"
                    ? "bg-red-100 text-red-800"
                    : reviewStatus === "needs_info"
                      ? "bg-orange-100 text-orange-800"
                      : reviewStatus === "under_review"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-yellow-100 text-yellow-800"
                }`}
            >
              {reviewStatus === "accepted"
                ? "Accepted"
                : reviewStatus === "rejected"
                  ? "Rejected"
                  : reviewStatus === "needs_info"
                    ? "Needs More Info"
                    : reviewStatus === "under_review"
                      ? "Under Review"
                      : "Not Submitted"}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              ISO:&nbsp;<InteractiveIsoClause isoClause={associatedIsoClause} />
            </span>
          </div>
          <div className="flex space-x-3">
            {projectRole.includes("consultant admin") && (
              <Button
                type="default"
                onClick={handleAssignTask}
                className="bg-white hover:bg-gray-50 border border-gray-300 shadow-sm"
              >
                Assign Task
              </Button>
            )}
            {projectRole.includes("consultant admin") && (
              <Select
                value={process}
                onChange={updateProcess}
                style={{ width: 120 }}
              >
                <Option value="core">Core</Option>
                <Option value="non core">Non Core</Option>
              </Select>
            )}
            {(projectRole.includes("consultant admin") || isAssignedUser) && (
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

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <div className="mb-6">
            <Title level={3} className="text-gray-800 mb-2">
              Contract Information
            </Title>
            <Text type="secondary">
              Complete the form below to define contract details and terms.
            </Text>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleFormSubmit}
            initialValues={{
              document_classification: "Confidential",
              document_title: "STATEMENT of WORK - CONFIDENTIALITY & NON-DISCLOSURE AGREEMENT (SOW – NDA)",
              main_section: "This Agreement for rendering Services (\"Agreement\") is made and executed on <Day and Date> (Hereafter \"effective date\") between: \n<Consultant Legal Name>\n(PAN: <12345678> / GSTN: <1234567890> ) \n(Hereafter \"XYZ\" or \"Service Provider\" ) \n\nand \n\n<Company Legal Name> \n(PAN : <12345678> / GSTN: <1234567890> ) \n(Hereafter \"ABC\" or \"Client\"). \n\nIn consideration of the mutual promises set for the herein, Client and Service provider agree as follows:",
              clause_1_services: "A) Service provider shall perform the professional services (\"Services\") as described in Exhibit A - Scope of Service attached hereto and by this reference incorporated herein. \nB) Service provider shall at all times comply with all applicable laws, regulations, rules, relevant applicable to Service provider's provision of the Services. \nC) Client shall ensure that Service provider has provided necessary resources for effectively discharge services.",
              clause_2_payment_terms: "Service provider will be paid <Rs. XXXXXX/-> (<XXX>  only) + taxes per month for services rendered as per Exhibit A from effective date. \nThe terms and conditions are as follows: \nA. Taxes \n1. Any service and other tax or local levy applicable at the client's site or location, on the services offered, shall be borne by <ABC>. \n\nB. Exclusion \n1. This proposed cost excludes any cost due towards the certifying body (Third Party) \n2. Any out of pocket expense, borne by <XYZ> shall be reimbursed by <ABC> subject reasonable and satisfactory justification by Arunima \n\nC. Payment terms \n1. Invoice shall be raised on last business day of every month \n2. Credit period will be 10 calendar days \n\nD. Project performance is dependent upon \n1.Commitment from the client organization \n2. Availability of required resources from the client \n3. Strict adherence by the client to the project plan as specified by Consultant",
              clause_3_duration_agreement: "This Agreement is valid for a period of <days> days from the effective date. The duration can be further extended upon mutual agreement between both the parties.",
              clause_4_invoices_payments: "Service provider shall invoice Client for its fees as per the Clause 2 above. \nIf the Client objects to all or any portion of any invoice, Client shall so notify Service provider within 7 days from receipt, give reasons for the objection, and pay that portion of the invoice not in dispute within 7 days of receipt of the invoice. Unless otherwise directed in writing, all invoices shall be submitted for payment to the following address: <Bill to details>",
              clause_5_indemnification: "A. Service provider shall indemnify, defend and hold Client harmless from any and all claims demands causes of actions, losses , damages , fines,  penalties, liabilities, costs and expenses, including reasonable attorney's fees and court costs, sustained or incurred by or asserted against Client by reason of or arising out of Service provider's breach of this Agreement or Management Consultant's gross negligence or willful misconduct with respect to Management Consultant's duties and activities within the scope of this Agreement.\nB. Except for Service providers breach of this Agreement or gross negligence or willful misconduct, Client shall indemnify, defend and hold Service provider harmless from and against any and all claims, demands, causes of action, losses, damages, fines, penalties, liabilities, costs and expenses incurred in the capacity of a defendant or a witness, and all other costs and expenses (including without limitation attorneys' fees and court costs) to which Service provider may become liable or subject by reason of or arising out of the performance or non­performance of Service provider's duties and activities within the scope of this Agreement.\nC. Client shall indemnify, defend and hold Service provider harmless from any and all claims, demands, causes of action, losses, damages, fines, penalties, liabilities, costs and expenses, including reasonable attorney's fees and court cost sustained or incurred by or asserted against the Service provider by reason of or arising out of the Client's negligence, willful misconduct with respect to the Client's duties and activities including but not limited to any information provided by the Client to the Service provider upon which the Service provider shall rely in providing the Services.\nD. For the purposes of the above clauses, the Client agrees that any / all the claims (if any) against the Service provider shall be taken care by the Client or its representative and the Client shall ensure that Service provider is not called upon to be present in any Court Authority of law and / or any legal platform anywhere in the world with respect to the assignment. Further, in case the Service provider is required to be present for such matters / claims, the Client agrees to bear all the cost for and on behalf of the Service provider including but not limited to travelling, boarding, lodging, etc. and / or any other cost for the purposes of the same.",
              clause_6_proprietary_information: "As used in this Agreement, the term 'Proprietary Information' shall mean all trade secrets or confidential or Proprietary Information designated as such in writing by the Disclosing Party, whether by letter or by the use of an appropriate prominently placed Proprietary stamp or legend, prior to or at the time such trade secret or confidential or Proprietary Information is disclosed by the Disclosing Party to the Recipient. \nNotwithstanding the forgoing, information which is orally or visually disclosed to the recipient by the Disclosing Party or is disclosed in writing unaccompanied by a covering letter, proprietary stamp or legend, shall constitute proprietary information if the disclosing party, within 10 (ten) days after such disclosure, delivers to the Recipient a written document or documents describing such Proprietary Information and referencing the place and duties and who are bound to protect the confidentiality of such Proprietary Information, date of such oral, visual or written disclosure and the names of the employees or officers of the Recipient to whom such disclosure was made.",
              clause_7_confidentiality: "A. Each party shall keep secret and treat In strictest confidence all confidential information it has received about the other party or its customers and will not use the confidential information otherwise than for the purpose of performing its obligations under this Agreement in accordance with its terms and so far as may be required for the proper exercise of the Parties' respective rights under this Agreement. \nB. The term 'confidential information' shall include all written or oral information (including information received from third parties that the 'Disclosing Party' is obligated to treat as confidential) :\na. that is clearly identified in writing at the time of disclosure as confidential and in case of oral or visual disclosure, or \nb. that a reasonable person at the time of disclosure reasonably would assume, under the circumstances, to be confidential. \nC. Confidential information shall also include, without limitation, software programs, technical data, methodologies, know-how, processes, Designs, new products, developmental work, marketing requirements, marketing plans, customer names, prospective customer names, customer information and business information of the 'Disclosing Party'.",
              clause_8_non_disclosure: "For the period during the Agreement or its renewal, the Recipient will: \nA. Use such Proprietary Information only for the purpose for which it was disclosed and without prior written authorization of the Disclosing Party shall not use or exploit such Proprietary Information for its own benefit or the benefit of others. \nB. Protect the Proprietary Information against disclosure to third parties in the same manner and with the reasonable degree of care, with which it protects its confidential information of similar importance: and \nC. Limit disclosure of Proprietary Information received under this Agreement to persons within its organization and to those 3rd party contractors performing tasks that would otherwise customarily or outlinely be performed by its employees, who have a need to know such Proprietary Information in the course of performance of their duties",
              clause_9_return_documents: "The Recipient shall, upon the request of the Disclosing Party, in writing, return to the Disclosing Party all drawings, documents and other tangible manifestations of Proprietary Information received by the Recipient pursuant to this Agreement (and all copies and reproductions thereof) within a reasonable period. Each party agrees that in the event it is not inclined to proceed further with the engagement, business discussions and negotiations, or in the event of termination of this Agreement, the Recipient party will promptly return to the other party or with the consent of the other party, destroy the Proprietary Information of the other party.",
              clause_10_communications: "Written communications requesting or transferring Proprietary Information under this Agreement shall be addressed only to the respective designees as follows (or to such designees as the parties hereto may from time to time designate in writing)",
              clause_11_work_product_reliance: "Any deliverables, draft reports or final reports prepared by Service provider under this Agreement shall be used solely for the internal purposes of Client and Client agrees that it shall not use any such reports in connection with any public documents without consent of the Service provider.\nFurther, Service provider shall not be referred to in any public documents prior written consent, which may be given in its sole discretion.\n\nA. The Client can share the deliverable with other interested parties (for potential transaction). However, the Service provider shall not be liable to any such parties. Also, Service provider is not required to present / discuss the deliverables with any such parties.\nB. The data, documentation, and assumptions used to prepare any analysis or reports hereunder will be derived from information supplied by Client, published information, prepared by Service provider in the regular course of its business, and other industry sources. All such information will not be independently verified by Service provider for purposes of this Agreement. Service provider will not be responsible for the accuracy of such data and information, and for any assumptions derived therefrom. However, Service provider's performance will be based on Service provider's professional evaluation of all such available sources of information. Client acknowledges and agrees that there may be differences between projected and actual results because events and circumstances frequently do not occur as predicted, and those differences may be material and hereby releases Service provider from any claims or liability arising from these differences.\nC. Client is responsible for representations made to Service provider about its plans and expectations and for disclosure of significant information that might affect the ultimate realization of the conclusions and recommendations made by Service provider. The final decision to implement the recommendations made by Service provider rests with Client. Service provider's findings will constitute only part of the factors that Client should consider in its decision-making process.\nD. The parties understand and agree that neither Service provider's fees nor the payment thereof by Client is contingent upon the results, finding, conclusions or recommendations provided by Service provider",
              clause_12_limitation_liability: "Notwithstanding any other provision of this Agreement, neither party shall be liable to the other party for any indirect, consequential, incidental or special losses or damages of any kind or nature, and any claim by either party in any way related to, or arising out of, this Agreement or any Services provided hereunder shall be limited to such party's actual, direct damages.",
              clause_13_limit_obligations: "The obligations of the Recipient specified in clause 3 above shall not apply and the Recipient shall have no further obligations, with respect to any Proprietary Information to the extent that such Proprietary Information: \nA. is generally known to the public at the time of disclosure or becomes generally known without any wrongful act on the part of the Recipient, \nB. is in the Recipient's possession at the time of disclosure otherwise than as a result of the Recipient's breach of a legal obligation \nC. becomes known to the Recipient through disclosure by any other source, other than the Disclosing Party, having the legal right to disclose such Proprietary Information. \nD. Is independently developed by the Recipient without reference to or reliance upon the Proprietary Information; or \nE. Is required to be disclosed by the Recipient to comply with applicable laws or governmental regulation, provided that the recipient provides prior written notice of such disclosure to the Disclosing Party and takes reasonable and lawful actions to avoid and/or minimize the extent of such disclosure. \nF. Service provider involved in this assignment shall not deal with the securities of Client as per the SEBI (Prohibition of Insider Trading Regulations), 2015, read with any amendment thereto from time to time, during the term of this Agreement and for a period of one year after completion of this assignment",
              clause_14_termination_agreement: "This Agreement shall remain in full force and effect from the date of its execution until the earliest to occur of:\nA. Service provider's completion of the Services or\nB. Duration of the agreement as per clause 3 or\nC. Termination of the Agreement by either party with or without cause, upon (30) days advance written notice to the other party.\n\nShould the assignment be aborted or withdrawn for reasons beyond the control of Service provider any point in time during the course of the project, Service provider reserve the right to the complete services fee as per the contract",
              clause_15_waiver: "A waiver on the part of the Client or Service provider of any term, provision or condition of this Agreement shall not constitute a precedent or bind either Party to a waiver of any succeeding breach of the same or any other them, provision or condition of the Agreement.",
              clause_16_entire_agreement: "This Agreement, including any Exhibits and any addenda thereto, constitutes the entire Agreement between Service provider and Client. It supersedes all prior or contemporaneous communications, representations or agreements, whether oral or written, relating to the Services set forth in this Agreement.\nThe captions in this Agreement are for the convenience in identification of the several provisions and shall not constitute a part of this Agreement nor be considered interpretative thereof.",
              clause_17_assignment: "This Agreement shall be binding upon the successors or assigns of the parties hereto. This Agreement shall not be assigned by either party without first obtaining the written consent of the other.",
              clause_18_severability: "Every paragraph, part, term or provision of this Agreement is severable from the others. If any paragraph, part, term or provision of this Agreement is construed or held to be void, invalid or unenforceable by order, decree or judgment of a court of competent jurisdiction, the remaining paragraphs, parts, terms and provisions of the Agreement shall not be affected thereby but shall remain in full force and effect.",
              clause_19_notices: "Any information or notices required to be given in writing under this Agreement shall be deemed to have been sufficiently given if delivered either personally or by certified mail (return receipt requested, postage prepaid), telex or wire to the address of the respective party set forth below, or to such other address for either party as that party may designate by written notice.",
              clause_20_dispute_resolution: "Both parties agree to co-operate and to conduct in good faith such discussions and negotiations as may be necessary to amicably resolve any dispute which may arise between them. All disputes claims or proceedings between the Parties hereto relating to the validity, construction or performance of this Agreement shall be subject to the jurisdiction of the Courts at Pune, Maharashtra, India. The Parties irrevocably submits the jurisdiction of such courts.",
              clause_21_governing_law: "This Agreement shall be governed and interpreted pursuant to the laws of India",
              clause_21_governing_law_1: "IN WITNESS WHEREOF, Client and Service provider have caused this Agreement to be executed by their duly authorised representatives, as follows:",
              signature_box_1: "For <ABC>",
              signature_box_2: "For <XYZ>",
              exhibit_a_scope_service: "Consulting service for <>",
              exhibit_a_scope_service_2: "Location(s) under scope: <>",
              exhibit_a_scope_service_3: "Client's service under scope: <>",
              exhibit_a_scope_service_4: "Employees under scope: <>",
              exhibit_a_scope_service_5: "Resource Deployment Plan:",
              exhibit_a_scope_service_6: "Project Plan and Deliverables:",
              ...contractData
            }}
          >
            <Collapse
              defaultActiveKey={['1']}
              expandIconPosition="end"
              className="mb-6"
              items={[
                {
                  key: '1',
                  label: (
                    <div className="flex items-center">
                      <span className="text-lg font-semibold text-gray-800">Basic Information</span>
                      <span className="ml-2 text-sm text-gray-500">(Document details and logos)</span>
                    </div>
                  ),
                  children: (
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="company_logo"
                          label="Company Logo URL"
                          rules={[{ type: 'url', message: 'Please enter a valid URL' }]}
                        >
                          <Input placeholder="Enter company logo URL" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="consultant_logo"
                          label="Consultant Logo URL"
                          rules={[{ type: 'url', message: 'Please enter a valid URL' }]}
                        >
                          <Input placeholder="Enter consultant logo URL" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="document_classification"
                          label="Document Classification"
                        >
                          <Input placeholder="Enter document classification" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="document_title"
                          label="Document Title"
                        >
                          <Input placeholder="Enter document title" />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item
                          name="main_section"
                          label="Main Section"
                        >
                          <TextArea rows={4} placeholder="Enter main section content" />
                        </Form.Item>
                      </Col>
                    </Row>
                  ),
                },
                {
                  key: '2',
                  label: (
                    <div className="flex items-center">
                      <span className="text-lg font-semibold text-gray-800">Contract Clauses (1-10)</span>
                      <span className="ml-2 text-sm text-gray-500">(Core contract terms)</span>
                    </div>
                  ),
                  children: (
                    <Row gutter={16}>
                      <Col span={24}>
                        <Form.Item
                          name="clause_1_services"
                          label="Clause 1: SERVICES"
                        >
                          <TextArea rows={3} placeholder="Enter services clause content" />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item
                          name="clause_2_payment_terms"
                          label="Clause 2: PAYMENT TERMS"
                        >
                          <TextArea rows={3} placeholder="Enter payment terms clause content" />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item
                          name="clause_3_duration_agreement"
                          label="Clause 3: DURATION OF AGREEMENT"
                        >
                          <TextArea rows={3} placeholder="Enter duration clause content" />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item
                          name="clause_4_invoices_payments"
                          label="Clause 4: INVOICES AND PAYMENTS"
                        >
                          <TextArea rows={3} placeholder="Enter invoices and payments clause content" />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item
                          name="clause_5_indemnification"
                          label="Clause 5: INDEMNIFICATION"
                        >
                          <TextArea rows={3} placeholder="Enter indemnification clause content" />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item
                          name="clause_6_proprietary_information"
                          label="Clause 6: PROPRIETARY INFORMATION"
                        >
                          <TextArea rows={3} placeholder="Enter proprietary information clause content" />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item
                          name="clause_7_confidentiality"
                          label="Clause 7: CONFIDENTIALITY"
                        >
                          <TextArea rows={3} placeholder="Enter confidentiality clause content" />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item
                          name="clause_8_non_disclosure"
                          label="Clause 8: NON-DISCLOSURE OF PROPRIETARY INFORMATION"
                        >
                          <TextArea rows={3} placeholder="Enter non-disclosure clause content" />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item
                          name="clause_9_return_documents"
                          label="Clause 9: RETURN OF DOCUMENTS"
                        >
                          <TextArea rows={3} placeholder="Enter return of documents clause content" />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item
                          name="clause_10_communications"
                          label="Clause 10: COMMUNICATIONS"
                        >
                          <TextArea rows={3} placeholder="Enter communications clause content" />
                        </Form.Item>
                      </Col>
                    </Row>
                  ),
                },
                {
                  key: '3',
                  label: (
                    <div className="flex items-center">
                      <span className="text-lg font-semibold text-gray-800">Contract Clauses (11-21)</span>
                      <span className="ml-2 text-sm text-gray-500">(Additional contract terms)</span>
                    </div>
                  ),
                  children: (
                    <Row gutter={16}>
                      <Col span={24}>
                        <Form.Item
                          name="clause_11_work_product_reliance"
                          label="Clause 11: USE OF WORK PRODUCT AND RELIANCE"
                        >
                          <TextArea rows={3} placeholder="Enter work product and reliance clause content" />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item
                          name="clause_12_limitation_liability"
                          label="Clause 12: LIMITATION OF LIABILITY"
                        >
                          <TextArea rows={3} placeholder="Enter limitation of liability clause content" />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item
                          name="clause_13_limit_obligations"
                          label="Clause 13: LIMIT ON OBLIGATIONS"
                        >
                          <TextArea rows={3} placeholder="Enter limit on obligations clause content" />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item
                          name="clause_14_termination_agreement"
                          label="Clause 14: TERMINATION OF AGREEMENT"
                        >
                          <TextArea rows={3} placeholder="Enter termination clause content" />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item
                          name="clause_15_waiver"
                          label="Clause 15: WAIVER"
                        >
                          <TextArea rows={3} placeholder="Enter waiver clause content" />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item
                          name="clause_16_entire_agreement"
                          label="Clause 16: ENTIRE AGREEMENT"
                        >
                          <TextArea rows={3} placeholder="Enter entire agreement clause content" />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item
                          name="clause_17_assignment"
                          label="Clause 17: ASSIGNMENT"
                        >
                          <TextArea rows={3} placeholder="Enter assignment clause content" />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item
                          name="clause_18_severability"
                          label="Clause 18: SEVERABILITY"
                        >
                          <TextArea rows={3} placeholder="Enter severability clause content" />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item
                          name="clause_19_notices"
                          label="Clause 19: NOTICES"
                        >
                          <TextArea rows={3} placeholder="Enter notices clause content" />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item
                          name="clause_20_dispute_resolution"
                          label="Clause 20: DISPUTE RESOLUTION"
                        >
                          <TextArea rows={3} placeholder="Enter dispute resolution clause content" />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item
                          name="clause_21_governing_law"
                          label="Clause 21: GOVERNING LAW"
                        >
                          <TextArea rows={3} placeholder="Enter governing law clause content" />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item
                          name="clause_21_governing_law_1"
                          label="Clause 21: GOVERNING LAW (Additional)"
                        >
                          <TextArea rows={3} placeholder="Enter additional governing law clause content" />
                        </Form.Item>
                      </Col>
                    </Row>
                  ),
                },
                {
                  key: '4',
                  label: (
                    <div className="flex items-center">
                      <span className="text-lg font-semibold text-gray-800">Signatures & Exhibits</span>
                      <span className="ml-2 text-sm text-gray-500">(Signatures and scope of service)</span>
                    </div>
                  ),
                  children: (
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="signature_box_1"
                          label="Signature Box 1"
                        >
                          <TextArea rows={4} placeholder="Enter signature box 1 content" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="signature_box_2"
                          label="Signature Box 2"
                        >
                          <TextArea rows={4} placeholder="Enter signature box 2 content" />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item
                          name="column_30"
                          label="Column 30"
                        >
                          <TextArea rows={3} placeholder="Enter column 30 content" />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item
                          name="exhibit_a_scope_service"
                          label="Exhibit A: Scope of Service"
                        >
                          <TextArea rows={4} placeholder="Enter Exhibit A scope of service content" />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item
                          name="exhibit_a_scope_service_2"
                          label="Exhibit A: Scope of Service (Section 2)"
                        >
                          <TextArea rows={4} placeholder="Enter Exhibit A section 2 content" />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item
                          name="exhibit_a_scope_service_3"
                          label="Exhibit A: Scope of Service (Section 3)"
                        >
                          <TextArea rows={4} placeholder="Enter Exhibit A section 3 content" />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item
                          name="exhibit_a_scope_service_4"
                          label="Exhibit A: Scope of Service (Section 4)"
                        >
                          <TextArea rows={4} placeholder="Enter Exhibit A section 4 content" />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item
                          name="exhibit_a_scope_service_5"
                          label="Exhibit A: Scope of Service (Section 5)"
                        >
                          <TextArea rows={4} placeholder="Enter Exhibit A section 5 content" />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item
                          name="exhibit_a_scope_service_6"
                          label="Exhibit A: Scope of Service (Section 6)"
                        >
                          <TextArea rows={4} placeholder="Enter Exhibit A section 6 content" />
                        </Form.Item>
                      </Col>
                    </Row>
                  ),
                },
              ]}
            />
            
            <div className="flex justify-end space-x-4">
              <Button 
                type="default" 
                onClick={() => form.resetFields()} 
                className="border-gray-300 text-gray-700"
              >
                Reset Form
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                className="bg-blue-600 hover:bg-blue-700" 
                loading={loading}
              >
                {contractData ? "Update Contract" : "Save Contract"}
              </Button>
            </div>
          </Form>
        </div>
      </div>

      {/* Review Comment Display */}
      {reviewComment && (
        <div className="mt-6 p-6 bg-white rounded-xl shadow-md">
          <h3 className="text-sm uppercase tracking-wider text-gray-500 font-semibold mb-3">
            Review Comment
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-orange-500">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{reviewComment}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Files Display */}
      {reviewOldFilesNeeded && reviewOldFilesNeeded.length > 0 && (
        <div className="mt-6 p-6 bg-white rounded-xl shadow-md">
          <h3 className="text-sm uppercase tracking-wider text-gray-500 font-semibold mb-3">
            Additional Files Requested
          </h3>
          <div className="space-y-3">
            {reviewOldFilesNeeded.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  <span className="text-sm text-gray-700">{getFileName(file)}</span>
                </div>
                <Button
                  type="link"
                  size="small"
                  onClick={() => handleFileDownload(file, getFileName(file))}
                  className="text-blue-600 hover:text-blue-800 p-0 h-auto"
                >
                  Download
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {taskAssignment && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Task Assignment
          </h3>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="mb-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium text-gray-700">
                  Assignment Details
                </h4>
                <p className="text-xs text-gray-500">
                  {formatDate(taskAssignment.assigned_at)}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Assigned To:
                  </p>
                  <ul className="list-disc list-inside mt-2">
                    {(taskAssignment.assigned_to || []).map((user) => (
                      <li key={user.id} className="text-sm text-gray-600">
                        {user.name} - {user.email}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Deadline:</p>
                  <p className="text-sm text-gray-600 mt-2">
                    {formatDate(taskAssignment.deadline)}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700">
                  Description:
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  {taskAssignment.description}
                </p>
              </div>
              {taskAssignment.references && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700">
                    References:
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    {taskAssignment.references}
                  </p>
                </div>
              )}
            </div>
            <div className="text-xs text-gray-500 mt-2">
              <p>
                <b>Status:</b> {taskAssignment.status}
              </p>
            </div>
          </div>
        </div>
      )}

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
            onClick={() => handleReviewAction("needs_info")}
            className="bg-orange-600 hover:bg-orange-700"
          >
            Submit Request
          </Button>,
        ]}
        width={600}
      >
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-blue-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Download Review Template
                </h3>
                <div className="mt-2 text-sm text-blue-600">
                  <p>
                    Please download and fill in the review template to guide your
                    review process.
                  </p>
                </div>
                <div className="mt-3">
                  <a
                    href="/templates/Review_template.xlsx"
                    download="review_template.xlsx"
                    className="inline-flex items-center px-4 py-2 border border-blue-300 shadow-sm text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg
                      className="-ml-1 mr-2 h-5 w-5 text-blue-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Download Review Template
                  </a>
                </div>
              </div>
            </div>
          </div>
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
          {reviewOldFilesNeeded.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Existing Review Files
              </h4>
              <div className="space-y-3">
                {reviewOldFilesNeeded.map((fileUrl) => (
                  <div
                    key={fileUrl}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 shadow-sm"
                  >
                    <div className="flex items-center overflow-hidden">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                        <FileTextOutlined className="text-blue-600" />
                      </div>
                      <button
                        onClick={() => handleFileDownload(fileUrl, getFileName(fileUrl))}
                        className="text-sm text-blue-700 truncate hover:underline flex items-center gap-2 disabled:opacity-60"
                        title={getFileName(fileUrl)}
                        disabled={downloadingFiles.includes(fileUrl)}
                        style={{ background: 'none', border: 'none', padding: 0, margin: 0, cursor: 'pointer' }}
                      >
                        {getFileName(fileUrl)}
                        {downloadingFiles.includes(fileUrl) && (
                          <LoadingOutlined spin style={{ fontSize: 16, marginLeft: 6 }} />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attach Files (Optional)
            </label>
            <Upload
              fileList={moreInfoFileList}
              onChange={({ fileList: newFileList }) => setMoreInfoFileList(newFileList)}
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

      {/* Accept Review Modal */}
      <Modal
        title="Accept Review"
        open={isAcceptModalVisible}
        onCancel={handleAcceptModalClose}
        footer={[
          <Button key="cancel" onClick={handleAcceptModalClose}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() => handleReviewAction("accept")}
            className="bg-green-600 hover:bg-green-700"
          >
            Accept Review
          </Button>,
        ]}
        width={600}
      >
        <div className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-green-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Accept Review
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>
                    You are about to accept this review. You can optionally provide a comment to explain your decision.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comment (Optional)
            </label>
            <TextArea
              rows={4}
              placeholder="Please provide any additional comments about your acceptance decision..."
              value={acceptComment}
              onChange={(e) => setAcceptComment(e.target.value)}
              className="w-full"
            />
          </div>
          {reviewOldFilesNeeded.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Existing Review Files
              </h4>
              <div className="space-y-3">
                {reviewOldFilesNeeded.map((fileUrl) => (
                  <div
                    key={fileUrl}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 shadow-sm"
                  >
                    <div className="flex items-center overflow-hidden">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                        <FileTextOutlined className="text-blue-600" />
                      </div>
                      <button
                        onClick={() => handleFileDownload(fileUrl, getFileName(fileUrl))}
                        className="text-sm text-blue-700 truncate hover:underline flex items-center gap-2 disabled:opacity-60"
                        title={getFileName(fileUrl)}
                        disabled={downloadingFiles.includes(fileUrl)}
                        style={{ background: 'none', border: 'none', padding: 0, margin: 0, cursor: 'pointer' }}
                      >
                        {getFileName(fileUrl)}
                        {downloadingFiles.includes(fileUrl) && (
                          <LoadingOutlined spin style={{ fontSize: 16, marginLeft: 6 }} />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attach Files (Optional)
            </label>
            <Upload
              fileList={acceptFileList}
              onChange={({ fileList: newFileList }) => setAcceptFileList(newFileList)}
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

      {/* Reject Review Modal */}
      <Modal
        title="Reject Review"
        open={isRejectModalVisible}
        onCancel={handleRejectModalClose}
        footer={[
          <Button key="cancel" onClick={handleRejectModalClose}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() => handleReviewAction("reject")}
            className="bg-red-600 hover:bg-red-700"
          >
            Reject Review
          </Button>,
        ]}
        width={600}
      >
        <div className="space-y-4">
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-red-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Reject Review
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>
                    You are about to reject this review. Please provide a comment explaining the reasons for rejection.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comment <span className="text-red-500">*</span>
            </label>
            <TextArea
              rows={4}
              placeholder="Please provide details about why this review is being rejected..."
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              className="w-full"
            />
          </div>
          {reviewOldFilesNeeded.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Existing Review Files
              </h4>
              <div className="space-y-3">
                {reviewOldFilesNeeded.map((fileUrl) => (
                  <div
                    key={fileUrl}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 shadow-sm"
                  >
                    <div className="flex items-center overflow-hidden">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                        <FileTextOutlined className="text-blue-600" />
                      </div>
                      <button
                        onClick={() => handleFileDownload(fileUrl, getFileName(fileUrl))}
                        className="text-sm text-blue-700 truncate hover:underline flex items-center gap-2 disabled:opacity-60"
                        title={getFileName(fileUrl)}
                        disabled={downloadingFiles.includes(fileUrl)}
                        style={{ background: 'none', border: 'none', padding: 0, margin: 0, cursor: 'pointer' }}
                      >
                        {getFileName(fileUrl)}
                        {downloadingFiles.includes(fileUrl) && (
                          <LoadingOutlined spin style={{ fontSize: 16, marginLeft: 6 }} />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attach Files (Optional)
            </label>
            <Upload
              fileList={rejectFileList}
              onChange={({ fileList: newFileList }) => setRejectFileList(newFileList)}
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
    </div>
  );
}

export default FinalizeContract;