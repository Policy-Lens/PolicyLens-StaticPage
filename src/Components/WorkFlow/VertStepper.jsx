import { useState, useRef, useEffect, createContext, useContext } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import ServiceRequirements from "./ServiceRequirements/SRbody";
import InquirySection from "./InquirySection/ISbody";
import FinalizeContract from "./FinalizeContract/FCbody";
import GapAnalysis from "./GapAnalysis/GAbody";
import DataAnalysis from "./DataAnalysis/DAbody";
import RART from "./RART/RARTbody";
import PlanningAndDiscussingPolicies from "./PlanningAndDiscussingPolicies/PDPbody";
import ImplementationOfPolicies from "./ImplementationOfPolicies/IPbody";
import InternalAuditProcess from "./InternalAuditProcess/IAPbody";
import AuditDecision from "./AuditDecision/ADbody";
import Sustenance from "./Sustenance/Sbody";
import Tableview from "./Tableview";
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
import { WorkflowContext } from "../../Context/WorkflowContext";
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
  const { getAllProjectSteps } = useContext(WorkflowContext);
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
  const [showStepIndicator, setShowStepIndicator] = useState(false); // Control step indicator animation

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

  // Fetch workflow data for the stepper view
  const fetchWorkflowData = async () => {
    if (!projectid || !getAllProjectSteps) return;

    try {
      setIsLoading(true);
      const response = await getAllProjectSteps(projectid);
      
      if (response && response.steps) {
        // Transform the workflow data to match the expected format
        const stepDataMap = {};
        
        response.steps.forEach((step) => {
          // Convert step_no to 0-based index for component mapping
          const componentIndex = step.step_no - 1;
          stepDataMap[componentIndex] = {
            process: step.process || "non core",
            associatedIsoClause: null, // Will be populated later if needed
            status: step.status || "not_started",
            step_id: step.step_id,
            has_data: step.has_data,
            assigned_to: step.assigned_to,
            reviewer: step.reviewer
          };
        });

        setWorkflowStepsData(stepDataMap);
      }
    } catch (error) {
      console.error("Error fetching workflow data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load all data when component mounts or project changes
  useEffect(() => {
    fetchWorkflowData();
  }, [projectid]);

  // Function to refresh data from child components
  const refreshProjectData = () => {
    fetchWorkflowData();
  };

  useEffect(() => {
    scrollToStep(currentStep);
    adjustVisibleRange(currentStep);
  }, [currentStep]);

  // Trigger step indicator animation on step change
  useEffect(() => {
    setShowStepIndicator(true);
    const timer = setTimeout(() => {
      setShowStepIndicator(false);
    }, 2500);
    return () => clearTimeout(timer);
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

  // Handle step click from table view
  const handleTableStepClick = (stepIndex) => {
    if (!isTransitioning && canNavigateToStep(stepIndex)) {
      setIsTransitioning(true);
      setCurrentStep(stepIndex);
      setViewMode("carousel");
      setTimeout(() => setIsTransitioning(false), 500);
    }
  };

  // Create dynamic steps array with bulk data passed to components
  const createStepsWithData = () => {
    const stepComponents = [
      { component: ServiceRequirements, stepNo: 1 },
      { component: InquirySection, stepNo: 2 },
      { component: FinalizeContract, stepNo: 3 },
      { component: GapAnalysis, stepNo: 4 },
      { component: DataAnalysis, stepNo: 5 },
      { component: RART, stepNo: 6 },
      { component: PlanningAndDiscussingPolicies, stepNo: 7 },
      { component: ImplementationOfPolicies, stepNo: 8 },
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

      return {
        title: stepTitles[index],
        content: React.createElement(stepInfo.component, {
          key: index,
          stepData: stepData,
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
                      <div className="flex items-start justify-between transition-transform duration-300">
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
                                  ref={visibleIndex}
                                  className={`flex flex-col items-center  relative group ${
                                  status === "current"
                                    ? "text-blue-600"
                                    : "text-gray-500"
                                } ${
                                  isAccessible
                                    ? "cursor-pointer"
                                    : "cursor-not-allowed opacity-50"
                                }`}
                                style={{height:"80px"}}
                                onClick={() => handleStepClick(actualIndex)}
                              >
                                <div
                                  className={`w-8 h-8 min-h-8 flex items-center justify-center rounded-full transition-all duration-300 
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
                                <span className=" text-sm text-center text-ellipsis" style={{ width: "115px" }}>
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
                            <Button disabled={currentStep === 0} onClick={handlePrev} className="mr-2">Previous</Button>
                            <Button disabled={currentStep === steps.length - 1} color="primary" variant="solid" onClick={handleNext}>
                              Next
                            </Button>
                          </div>
                        </div>
                        <div className="px-2">{step.content}</div>
                      </div>
                    ))}
                  </div>

                  {/* Step indicator at bottom comes up when page changed and goes down after 1 second*/}
                  <div 
                    className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-90 px-4 py-1.5 rounded-full shadow-lg text-sm text-gray-600 flex items-center transition-all duration-300 ease-in-out"
                    style={{
                      transform: showStepIndicator 
                        ? 'translateX(-50%) translateY(0)' 
                        : 'translateX(-50%) translateY(100px)',
                      opacity: showStepIndicator ? 1 : 0,
                    }}
                  >
                    <span className="font-medium text-blue-600">
                      {currentStep + 1}
                    </span>
                    <span>&nbsp;of&nbsp;</span>
                    <span>{steps.length}</span>
                  </div>
                </div>
              </>
            ) : (
              <Tableview 
                projectId={projectid} 
                onStepClick={handleTableStepClick}
              />
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
