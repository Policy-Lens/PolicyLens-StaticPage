import { useState, useRef, useEffect, createContext, useContext } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import ServiceRequirements from "./ServiceRequirements";
import GapAnalysis from "./GapAnalysis";
import StakeholderInterviews from "./StakeholderInterviews";
import DataAnalysis from "./DataAnalysis";
import RART from "./RART";
import InquirySection from "./InquirySection";
import FinalizeContract from "./FinalizeContract";
import Planning from "./Planning";
import DiscussingPolicies from "./DiscussingPolicies";
import DiscussImplementation from "./DiscussImplementation";
import ImplementPolicies from "./ImplementPolicies";
import InternalAuditProcess from "./InternalAuditProcess";
import AuditDecision from "./AuditDecision";
import Sustenance from "./Sustenance";
import { ChevronLeft, ChevronRight, List, LayoutGrid } from "lucide-react";
import {
  Calendar,
  HelpCircle,
  FileText,
  Shield,
  CheckCircle,
  Database,
} from "lucide-react";
import { Button, Spin, Tooltip, Typography } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { ProjectContext } from "../../Context/ProjectContext";
import InteractiveIsoClause from "../Common/InteractiveIsoClause";
import React from "react"; // Added missing import for React

const { Title } = Typography;
// Create a context for loading state
export const LoadingContext = createContext({
  isLoading: false,
  setIsLoading: () => {},
});

// Create a context for workflow data
export const WorkflowDataContext = createContext({
  workflowData: {},
  setWorkflowData: () => {},
});

const antIcon = <LoadingOutlined style={{ fontSize: 40 }} spin />;

// Loading component
const LoadingIndicator = () => (
  <div className="flex justify-center items-center h-full w-full bg-white bg-opacity-80 absolute top-0 left-0 z-10">
    <div className="text-center">
      <Spin indicator={antIcon} />
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
);

const CarouselHorizontalStepper = () => {
  const { projectid } = useParams();
  const { getWorkflowStepsOverview, getProjectPlcOverview } =
    useContext(ProjectContext);
  const [currentStep, setCurrentStep] = useState(() => {
    // Load from project-step mapping in localStorage
    try {
      const projectSteps = JSON.parse(
        localStorage.getItem("workflow-steps") || "{}"
      );
      return projectid && projectSteps[projectid]
        ? parseInt(projectSteps[projectid], 10)
        : 0;
    } catch (e) {
      console.error("Error loading saved step:", e);
      return 0;
    }
  });
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 7 });
  const containerRef = useRef(null);
  const [collapsed, setCollapsed] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [activeTab, setActiveTab] = useState("Workflow");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState("carousel"); // "carousel" or "table"
  const [workflowStepsData, setWorkflowStepsData] = useState({}); // Store all workflow step data
  const [projectPlcData, setProjectPlcData] = useState(null); // Store complete PLC data

  // Save current step to localStorage whenever it changes or projectid changes
  useEffect(() => {
    if (!projectid) return;

    try {
      const projectSteps = JSON.parse(
        localStorage.getItem("workflow-steps") || "{}"
      );
      projectSteps[projectid] = currentStep;
      localStorage.setItem("workflow-steps", JSON.stringify(projectSteps));
    } catch (e) {
      console.error("Error saving step:", e);
    }
  }, [currentStep, projectid]);

  // Update current step when project changes
  useEffect(() => {
    if (!projectid) return;

    try {
      const projectSteps = JSON.parse(
        localStorage.getItem("workflow-steps") || "{}"
      );
      if (projectSteps[projectid] !== undefined) {
        setCurrentStep(parseInt(projectSteps[projectid], 10));
      }
    } catch (e) {
      console.error("Error loading step on project change:", e);
    }
  }, [projectid]);

  // Single bulk data fetch - eliminates N+1 pattern
  const fetchAllProjectData = async () => {
    if (!projectid || !getWorkflowStepsOverview || !getProjectPlcOverview)
      return;

    try {
      setIsLoading(true);

      // Fetch both workflow overview and complete PLC data in parallel
      const [workflowResponse, plcResponse] = await Promise.all([
        getWorkflowStepsOverview(projectid),
        getProjectPlcOverview(projectid),
      ]);

      if (workflowResponse) {
        console.log("Bulk workflow data:", workflowResponse);

        // Transform the workflow data to match the expected format
        const stepDataMap = {};
        const stepApiMapping = {
          0: 1, // Service Requirements
          1: 2, // Inquiry Section
          2: 3, // Finalize Contract
          3: 4, // Gap Analysis
          4: 5, // Data Analysis
          5: 6, // RART
          6: 7, // Planning and Discussing Policies
          7: 8, // Implementation of Policies
          8: 9, // Internal Audit Process
          9: 10, // Audit Decision
          10: 11, // Sustenance
        };

        // Create reverse mapping from API step_no to component index
        const reverseMapping = {};
        Object.entries(stepApiMapping).forEach(
          ([componentIndex, apiStepNo]) => {
            reverseMapping[apiStepNo] = parseInt(componentIndex);
          }
        );

        // Map the API response to component indices
        workflowResponse.workflow_steps.forEach((step) => {
          const componentIndex = reverseMapping[step.step_no];
          if (componentIndex !== undefined) {
            stepDataMap[componentIndex] = {
              process: step.process || "core",
              associatedIsoClause: step.associated_iso_clause,
              status: step.status || "pending",
              step_id: step.step_id,
              review_status: step.review_status,
              review_comment: step.review_comment,
            };
          }
        });

        setWorkflowStepsData(stepDataMap);
      }

      if (plcResponse) {
        console.log("Complete PLC data:", plcResponse);
        setProjectPlcData(plcResponse);
      }
    } catch (error) {
      console.error("Error fetching project data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load all data when component mounts or project changes
  useEffect(() => {
    fetchAllProjectData();
  }, [projectid]);

  // Function to refresh data from child components
  const refreshProjectData = () => {
    fetchAllProjectData();
  };

  useEffect(() => {
    scrollToStep(currentStep);
    adjustVisibleRange(currentStep);
  }, [currentStep]);

  // const getCurrentPhase = () => {
  //   return phases.findIndex((phase) => phase.steps.includes(currentStep));
  // };

  const adjustVisibleRange = (stepIndex) => {
    const maxStepsToShow = 12; // Increased visible steps
    let start = Math.max(0, stepIndex - Math.floor(maxStepsToShow / 2));
    let end = Math.min(steps.length - 1, start + maxStepsToShow - 1);

    // Adjust start if end is at maximum
    if (end === steps.length - 1) {
      start = Math.max(0, end - maxStepsToShow + 1);
    }

    setVisibleRange({ start, end });
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1 && !isTransitioning) {
      setIsTransitioning(true);
      setCurrentStep((prev) => prev + 1);
      setTimeout(() => setIsTransitioning(false), 500);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0 && !isTransitioning) {
      setIsTransitioning(true);
      setCurrentStep((prev) => prev - 1);
      setTimeout(() => setIsTransitioning(false), 500);
    }
  };

  const scrollToStep = (stepIndex) => {
    const container = containerRef.current;
    if (!container) return;

    const stepElement = container.children[stepIndex - visibleRange.start];
    if (stepElement) {
      stepElement.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  };

  const handleStepClick = (index) => {
    if (!isTransitioning && canNavigateToStep(index)) {
      setIsTransitioning(true);
      setCurrentStep(index);
      setTimeout(() => setIsTransitioning(false), 500);
    }
  };

  const handleScroll = (direction) => {
    const maxStepsToShow = 12; // Increased visible steps
    if (direction === "left" && visibleRange.start > 0) {
      const newStart = Math.max(0, visibleRange.start - 3);
      const newEnd = Math.min(steps.length - 1, newStart + maxStepsToShow - 1);
      setVisibleRange({ start: newStart, end: newEnd });
    } else if (direction === "right" && visibleRange.end < steps.length - 1) {
      const newEnd = Math.min(steps.length - 1, visibleRange.end + 3);
      const newStart = Math.max(0, newEnd - maxStepsToShow + 1);
      setVisibleRange({ start: newStart, end: newEnd });
    }
  };

  const getStepStatus = (index) => {
    if (index === currentStep) return "current";
    if (index < currentStep) return "completed";
    return "upcoming";
  };

  // Check if user can navigate to a specific step
  const canNavigateToStep = (targetStep) => {
    // Can always navigate to current step or previous steps (going backwards)
    if (targetStep <= currentStep) return true;

    // For future steps: all previous steps must be completed
    // and target step must be in progress or completed
    for (let i = 0; i < targetStep; i++) {
      if (getStepStatus(i) !== "completed") {
        return false;
      }
    }

    // Target step must be in progress or completed
    const targetStatus = getStepStatus(targetStep);
    return targetStatus === "current" || targetStatus === "completed";
  };

  // Modern Toggle Component
  const ViewToggle = () => (
    <div className="flex items-center space-x-3 bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => setViewMode("carousel")}
        className={`flex items-center space-x-2 px-4 py-1 rounded-md transition-all duration-200 ${
          viewMode === "carousel"
            ? "bg-white text-blue-600 shadow-sm"
            : "text-gray-600 hover:text-gray-800"
        }`}
      >
        <LayoutGrid size={18} />
        <span className="font-medium">Carousel</span>
      </button>
      <button
        onClick={() => setViewMode("table")}
        className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 ${
          viewMode === "table"
            ? "bg-white text-blue-600 shadow-sm"
            : "text-gray-600 hover:text-gray-800"
        }`}
      >
        <List size={18} />
        <span className="font-medium">Table</span>
      </button>
    </div>
  );

  // Table View Component
  const TableView = () => (
    <div className="flex-grow overflow-hidden bg-white rounded-lg shadow-md">
      <div className="h-full overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Workflow Steps
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">
                    Step
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">
                    Title
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">
                    Process
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">
                    Standard
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">
                    ISO Clause
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">
                    Progress
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {steps.map((step, index) => {
                  const status = getStepStatus(index);
                  const isAccessible = canNavigateToStep(index);
                  const currentStepData = workflowStepsData[index] || {};
                  const process = currentStepData.process || "core";
                  const associatedIsoClause =
                    currentStepData.associatedIsoClause;

                  return (
                    <tr
                      key={index}
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        index === currentStep ? "bg-blue-50" : ""
                      } ${!isAccessible ? "opacity-60" : ""}`}
                    >
                      <td className="py-4 px-6">
                        <div
                          className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium ${
                            status === "completed"
                              ? "bg-green-500 text-white"
                              : status === "current"
                              ? "bg-blue-500 text-white"
                              : "bg-gray-300 text-gray-600"
                          }`}
                        >
                          {index + 1}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-medium text-gray-800">
                          {step.title}
                        </span>
                        {!isAccessible && (
                          <span className="ml-2 text-xs text-gray-500">
                            (Locked)
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            status === "completed"
                              ? "bg-green-100 text-green-800"
                              : status === "current"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {status === "completed"
                            ? "Completed"
                            : status === "current"
                            ? "In Progress"
                            : "Pending"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            process === "core"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-orange-100 text-orange-800"
                          }`}
                        >
                          {process === "core" ? "Core" : "Non Core"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          ISO27001
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          ISO:&nbsp;
                          <InteractiveIsoClause
                            isoClause={associatedIsoClause}
                          />
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              status === "completed"
                                ? "bg-green-500"
                                : status === "current"
                                ? "bg-blue-500"
                                : "bg-gray-300"
                            }`}
                            style={{
                              width:
                                status === "completed"
                                  ? "100%"
                                  : status === "current"
                                  ? "50%"
                                  : "0%",
                            }}
                          ></div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => {
                            if (isAccessible) {
                              setCurrentStep(index);
                              setViewMode("carousel");
                            }
                          }}
                          disabled={!isAccessible}
                          className={`font-medium text-sm transition-colors ${
                            isAccessible
                              ? "text-blue-600 hover:text-blue-800 cursor-pointer"
                              : "text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          {index === currentStep
                            ? "Current"
                            : isAccessible
                            ? "Go to Step"
                            : "Locked"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  // Create dynamic steps array with bulk data passed to components
  const createStepsWithData = () => {
    const stepComponents = [
      { component: ServiceRequirements, stepNo: 1 },
      { component: InquirySection, stepNo: 2 },
      { component: FinalizeContract, stepNo: 3 },
      { component: GapAnalysis, stepNo: 4 },
      { component: DataAnalysis, stepNo: 5 },
      { component: RART, stepNo: 6 },
      { component: Planning, stepNo: 7 },
      { component: DiscussingPolicies, stepNo: 8 },
      { component: InternalAuditProcess, stepNo: 9 },
      { component: AuditDecision, stepNo: 10 },
      { component: Sustenance, stepNo: 11 },
    ];

    const stepTitles = [
      "Service Requirements",
      "Inquiry Section",
      "Finalize Contract",
      "Gap Analysis",
      "Data Analysis",
      "RART",
      "Planning and Discussing Policies",
      "Implementation of Policies",
      "Internal Audit Process",
      "Audit Decision",
      "Sustenance",
    ];

    return stepComponents.map((stepInfo, index) => {
      const stepData = workflowStepsData[index] || {};
      const plcStepData = projectPlcData?.steps?.find(
        (s) => s.step_no === stepInfo.stepNo
      );

      return {
        title: stepTitles[index],
        content: React.createElement(stepInfo.component, {
          key: index,
          stepData: stepData,
          plcStepData: plcStepData,
          projectPlcData: projectPlcData,
          projectId: projectid,
          refreshProjectData: refreshProjectData,
        }),
      };
    });
  };

  const steps = createStepsWithData();

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
      <WorkflowDataContext.Provider
        value={{
          workflowData: workflowStepsData,
          setWorkflowData: setWorkflowStepsData,
          projectPlcData: projectPlcData,
          setProjectPlcData: setProjectPlcData,
        }}
      >
        <div className="flex h-[calc(100vh-65px)] overflow-hidden">
          {/* Main Content */}
          <div className="flex-1 w-full px-3 pb-2 flex flex-col overflow-hidden">
            {/* Header with Toggle */}
            <div className="flex justify-between items-center mb-1 flex-shrink-0 ">
              <div></div> {/* Empty div for spacing */}
              <ViewToggle />
            </div>

            {/* Conditional Rendering based on viewMode */}
            {viewMode === "carousel" ? (
              <>
                {/* Scrollable Navigation with Arrow Controls */}
                <div className="relative flex-shrink-0 overflow-x-auto">
                  {/* <button
                    onClick={() => handleScroll("left")}
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-2 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                    disabled={visibleRange.start === 0}
                  >
                    <ChevronLeft size={20} />
                  </button> */}

                  <div className=" mb-2">
                    <div ref={containerRef} className="flex flex-col pt-[2px]">
                      <div className="flex items-center justify-between space-x-2 mx-2 transition-transform duration-300">
                        {steps
                          .slice(visibleRange.start, visibleRange.end + 1)
                          .map((step, visibleIndex) => {
                            const actualIndex =
                              visibleIndex + visibleRange.start;
                            const status = getStepStatus(actualIndex);
                            const isAccessible = canNavigateToStep(actualIndex);

                            return (
                              <Tooltip placement="top" title={step.title} key={actualIndex}>
                                <div
                                  key={actualIndex}
                                  className={`flex flex-col items-center relative group ${
                                  status === "current"
                                    ? "text-blue-600 font-semibold"
                                    : "text-gray-500"
                                } ${
                                  isAccessible
                                    ? "cursor-pointer"
                                    : "cursor-not-allowed opacity-50"
                                }`}
                                onClick={() => handleStepClick(actualIndex)}
                              >
                                <div
                                  className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 
                              ${
                                status === "completed"
                                  ? "bg-green-500 text-white"
                                  : status === "current"
                                  ? "bg-blue-500 text-white transform scale-110 translate-y-[1px]"
                                  : "bg-gray-300"
                              } 
                                  ${
                                    isAccessible
                                      ? "group-hover:scale-110 group-hover:shadow-md"
                                      : ""
                                  }`}
                                >
                                  {actualIndex + 1}
                                </div>
                                <span className=" text-sm text-center w-20 truncate">
                                  {step.title}
                                </span>
                              </div>
                              </Tooltip>
                            );
                          })}
                      </div>

                      {/* Progress Bar */}
                      <div className="h-1 bg-gray-200 rounded-full mt-2">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-in-out"
                          style={{
                            width: `${
                              ((currentStep + 1) / steps.length) * 100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* <button
                    onClick={() => handleScroll("right")}
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-2 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                    disabled={visibleRange.end >= steps.length - 1}
                  >
                    <ChevronRight size={20} />
                  </button> */}
                </div>

                {/* Step Content - Dynamic Sizing */}
                <div className="flex-grow relative overflow-hidden bg-white rounded-lg shadow-md">
                  {/* Previous button - gray background */}
                  {/* <button
                    onClick={handlePrev}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-gray-200 rounded-full shadow-md p-3 text-blue-600 hover:bg-gray-300 disabled:opacity-40 flex items-center justify-center transition-colors"
                    disabled={currentStep === 0 || isTransitioning}
                    aria-label="Previous step"
                  >
                    <ChevronLeft size={24} strokeWidth={2.5} />
                  </button> */}

                  {/* Next button - gray background */}
                  {/* <button
                    onClick={handleNext}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-gray-200 rounded-full shadow-md p-3 text-blue-600 hover:bg-gray-300 disabled:opacity-40 flex items-center justify-center transition-colors"
                    disabled={
                      currentStep === steps.length - 1 || isTransitioning
                    }
                    aria-label="Next step"
                  >
                    <ChevronRight size={24} strokeWidth={2.5} />
                  </button> */}

                  <div
                    className={`flex transition-transform duration-500 h-full ${
                      isTransitioning ? "opacity-50" : "opacity-100"
                    }`}
                    style={{ transform: `translateX(-${currentStep * 100}%)` }}
                  >
                    {steps.map((step, index) => (
                      <div
                        key={index}
                        className="min-w-full h-full overflow-y-auto"
                      >
                        <div className="flex justify-between items-center px-6 py-2">
                          {/* Button at right for prev and next */}
                          <div>
                            <Title level={3}>{step.title}</Title>
                          </div>
                          <div>
                            <Button disabled={currentStep === 0 || isTransitioning} onClick={handlePrev} className="mr-2">Previous</Button>
                            <Button disabled={currentStep === steps.length - 1 || isTransitioning} color="primary" variant="solid" onClick={handleNext}>
                              Next
                            </Button>
                          </div>
                        </div>
                        <div className="px-2 max-w-5xl">{step.content}</div>
                      </div>
                    ))}
                  </div>

                  {/* Step indicator at bottom comes up when page changed and goes down after 1 second*/}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-80 px-4 py-1.5 rounded-full shadow-sm text-sm text-gray-600 flex items-center">
                    <span className="font-medium text-blue-600">
                      {currentStep + 1}
                    </span>
                    <span>&nbsp;of&nbsp;</span>
                    <span>{steps.length}</span>
                  </div>
                </div>
              </>
            ) : (
              <TableView />
            )}

            {/* Add keyboard event listener effect */}
            <div style={{ display: "none" }}>
              {useEffect(() => {
                const handleKeyDown = (event) => {
                  if (event.key === "ArrowLeft") {
                    handlePrev();
                  } else if (event.key === "ArrowRight") {
                    handleNext();
                  }
                };

                window.addEventListener("keydown", handleKeyDown);

                // Clean up event listener on component unmount
                return () => {
                  window.removeEventListener("keydown", handleKeyDown);
                };
              }, [currentStep, isTransitioning])}
            </div>
          </div>
        </div>
      </WorkflowDataContext.Provider>
    </LoadingContext.Provider>
  );
};

export default CarouselHorizontalStepper;
