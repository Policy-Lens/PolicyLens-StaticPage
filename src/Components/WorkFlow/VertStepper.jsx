import { useState, useRef, useEffect } from "react";
import SideNav from "./SideNav";
import { Outlet } from "react-router-dom";
import ServiceRequirements from "./ServiceRequirements";
import GapAnalysis from "./GapAnalysis";
import StakeholderInterviews from "./StakeholderInterviews";
import DataAnalysis from "./DataAnalysis";
import ReportPresentation from "./ReportPresentation";
import BrainstormSolution from "./BrainstormSolution";
import InquirySection from "./InquirySection";
import FinalizeContract from "./FinalizeContract";
import Planning from "./Planning";
import DiscussingPolicies from "./DiscussingPolicies";
import FinalizePolicies from "./FinalizePolicies";
import FinalizeThePolicies from "./FinalizeThePolicies";
import DiscussImplementation from "./DiscussImplementation";
import ImplementPolicies from "./ImplementPolicies";
import Support from "./Support";
import ExternalAuditProcess from "./ExternalAuditProcess";
import AuditDecisionPage from "./AuditDecisionPage";
import AcessingAuditNeeds from "./AcessingAuditNeeds";
import PlanningAudit from "./PlanningAudit";
import ExecutionPage from "./ExecutionPage";
import EvaluationPage from "./EvaluationPage";
import CertificationPage from "./Certification";
import KickoffMeetings from "./KickoffMeetings";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Calendar, HelpCircle, FileText, Shield, CheckCircle } from "lucide-react";

const steps = [
  { title: "Service Requirements", content: <ServiceRequirements /> },
  { title: "Inquiry Section", content: <InquirySection /> },
  { title: "Finalize Contract", content: <FinalizeContract /> },
  { title: "Kickoff Meetings", content: <KickoffMeetings /> },
  { title: "Gap Analysis", content: <GapAnalysis /> },
  { title: "Stakeholder Interviews", content: <StakeholderInterviews /> },
  { title: "Data Analysis", content: <DataAnalysis /> },
  { title: "Report Presentation", content: <ReportPresentation /> },
  { title: "Planning Section", content: <Planning /> },
  { title: "Discussing Policies", content: <DiscussingPolicies /> },
  { title: "Discuss Implementation", content: <DiscussImplementation /> },
  { title: "Implement Policies", content: <ImplementPolicies /> },
  { title: "Ext. Audit Process", content: <ExternalAuditProcess /> },
];

const CarouselHorizontalStepper = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 7 });
  const containerRef = useRef(null);
  const [collapsed, setCollapsed] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [activeTab, setActiveTab] = useState("Workflow");

 
  const tabIcons = {
    Workflow: <CheckCircle size={16} />,
    Calendar: <Calendar size={16} />,
    Support: <HelpCircle size={16} />,
    Questionnaire: <FileText size={16} />,
    Policies: <Shield size={16} />,
  };

  // New tabs replacing phases
  const tabs = [
    "Workflow",
    "Calendar",
    "Support",
    "Questionnaire",
    "Evidence Data",
    "VAPT",
    "Policies"
  ];

  // Group steps into phases for better organization
  const phases = [
    { name: "Workflow", steps: [0, 1, 2, 3] },
    { name: "Calendar", steps: [4, 5, 6, 7, 8] },
    { name: "Support", steps: [9, 10, 11, 12] },
    { name: "Questionnaire", steps: [13, 14, 15] },
    { name: "Evidence Data", steps: [16, 17, 18, 19] },
    { name: "VAPT", steps: [20, 21] },
    { name: "Policies", steps: [22] },
  ];

  const getCurrentPhase = () => {
    return phases.findIndex(phase =>
      phase.steps.includes(currentStep)
    );
  };

  useEffect(() => {
    scrollToStep(currentStep);
    adjustVisibleRange(currentStep);
  }, [currentStep]);

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
    if (!isTransitioning) {
      setIsTransitioning(true);
      setCurrentStep(index);
      setTimeout(() => setIsTransitioning(false), 500);
    }
  };

  const handleScroll = (direction) => {
    const maxStepsToShow = 12; // Increased visible steps
    if (direction === 'left' && visibleRange.start > 0) {
      const newStart = Math.max(0, visibleRange.start - 3);
      const newEnd = Math.min(steps.length - 1, newStart + maxStepsToShow - 1);
      setVisibleRange({ start: newStart, end: newEnd });
    } else if (direction === 'right' && visibleRange.end < steps.length - 1) {
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

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    // Find the first step in the selected phase
    const phase = phases.find(p => p.name === tab);
    if (phase && phase.steps.length > 0) {
      setCurrentStep(phase.steps[0]);
    }
  };

  return (
    <div className="flex h-screen">
      <div className="flex-1 w-full px-6 pt-6 pb-4 flex flex-col">
        {/* New Navigation Tabs */}
        <div className="flex justify-start mb-4 space-x-4">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabClick(tab)}
              className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 
        ${activeTab === tab ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              {tabIcons[tab] || null}
              <span>{tab}</span>
            </button>
          ))}
        </div>

        {/* Scrollable Navigation with Arrow Controls */}
        <div className="relative mb-4">
          <button
            onClick={() => handleScroll('left')}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-2 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            disabled={visibleRange.start === 0}
          >
            <ChevronLeft size={20} />
          </button>

          <div className="overflow-hidden mx-12">
            <div
              ref={containerRef}
              className="flex flex-col items-center"
            >
              <div className="flex items-center justify-between space-x-4 px-4 transition-transform duration-300">
                {steps.slice(visibleRange.start, visibleRange.end + 1).map((step, visibleIndex) => {
                  const actualIndex = visibleIndex + visibleRange.start;
                  const status = getStepStatus(actualIndex);

                  return (
                    <div
                      key={actualIndex}
                      className={`flex flex-col items-center cursor-pointer relative group ${status === "current" ? "text-blue-600 font-semibold" : "text-gray-500"}`}
                      onClick={() => handleStepClick(actualIndex)}
                    >
                      <div
                        className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 
                          ${status === "completed"
                            ? "bg-green-500 text-white"
                            : status === "current"
                              ? "bg-blue-500 text-white scale-110"
                              : "bg-gray-300"
                          } 
                          group-hover:scale-110 group-hover:shadow-md`}
                      >
                        {actualIndex + 1}
                      </div>
                      <span className="mt-2 text-sm text-center w-20 truncate">
                        {step.title}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-gray-200 rounded-full mt-4">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-in-out"
                  style={{
                    width: `${((currentStep + 1) / steps.length) * 100}%`
                  }}
                ></div>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleScroll('right')}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-2 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            disabled={visibleRange.end >= steps.length - 1}
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Step Content - Dynamic Sizing */}
        <div className="flex-grow relative overflow-hidden bg-gray-50 rounded-lg shadow-md">
          <div
            className={`flex transition-transform duration-500 h-full ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}
            style={{ transform: `translateX(-${currentStep * 100}%)` }}
          >
            {steps.map((step, index) => (
              <div
                key={index}
                className="min-w-full px-8 py-6 flex justify-center items-center h-full"
              >
                <div className="w-full h-3/4 max-w-4xl bg-white rounded-lg shadow-md p-8 overflow-auto">
                  {step.content}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={handlePrev}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50 flex items-center"
            disabled={currentStep === 0 || isTransitioning}
          >
            <ChevronLeft size={16} className="mr-1" /> Previous
          </button>

          <button
            onClick={handleNext}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center"
            disabled={currentStep === steps.length - 1 || isTransitioning}
          >
            Next <ChevronRight size={16} className="ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarouselHorizontalStepper;