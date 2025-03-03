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

const steps = [
  { title: "Service Requirements", content: <ServiceRequirements /> },
  { title: "Inquiry Section", content: <InquirySection /> },
  { title: "Finalize Contract", content: <FinalizeContract /> },
  { title: "Kickoff Meetings", content: <KickoffMeetings /> },
  { title: "Gap Analysis", content: <GapAnalysis /> },
  { title: "Stakeholder Interviews", content: <StakeholderInterviews /> },
  { title: "Data Analysis", content: <DataAnalysis /> },
  { title: "Report Presentation", content: <ReportPresentation /> },
  { title: "Brainstorm Solution", content: <BrainstormSolution /> },
  { title: "Planning Section", content: <Planning /> },
  { title: "Discussing Policies", content: <DiscussingPolicies /> },
  { title: "Finalize Policies", content: <FinalizePolicies /> },
  { title: "Finalize The Policies", content: <FinalizeThePolicies /> },
  { title: "Discuss Implementation", content: <DiscussImplementation /> },
  { title: "Implement Policies", content: <ImplementPolicies /> },
  { title: "Support Page", content: <Support /> },
  { title: "Ext. Audit Process", content: <ExternalAuditProcess /> },
  { title: "Audit Decision", content: <AuditDecisionPage /> },
  { title: "Accessing Audit Needs", content: <AcessingAuditNeeds /> },
  { title: "Planning Audit", content: <PlanningAudit /> },
  { title: "Execution Section", content: <ExecutionPage /> },
  { title: "Evaluation Section", content: <EvaluationPage /> },
  { title: "Certification Section", content: <CertificationPage /> },
];

const CarouselHorizontalStepper = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 7 });
  const containerRef = useRef(null);
  const [collapsed, setCollapsed] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Group steps into phases for better organization
  const phases = [
    { name: "Initiation", steps: [0, 1, 2, 3] },
    { name: "Analysis", steps: [4, 5, 6, 7, 8] },
    { name: "Planning", steps: [9, 10, 11, 12] },
    { name: "Implementation", steps: [13, 14, 15] },
    { name: "Audit", steps: [16, 17, 18, 19, 20, 21, 22] },
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
    const maxVisible = 17; // Number of visible steps
    let start = Math.max(0, stepIndex - Math.floor(maxVisible / 2));
    let end = Math.min(steps.length - 1, start + maxVisible - 1);

    // Adjust start if end is at maximum
    if (end === steps.length - 1) {
      start = Math.max(0, end - maxVisible + 1);
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
    if (direction === 'left' && visibleRange.start > 0) {
      const newStart = Math.max(0, visibleRange.start - 3);
      const newEnd = newStart + 7 - 1;
      setVisibleRange({ start: newStart, end: newEnd });
    } else if (direction === 'right' && visibleRange.end < steps.length - 1) {
      const newEnd = Math.min(steps.length - 1, visibleRange.end + 3);
      const newStart = Math.max(0, newEnd - 7 + 1);
      setVisibleRange({ start: newStart, end: newEnd });
    }
  };

  const getStepStatus = (index) => {
    if (index === currentStep) return "current";
    if (index < currentStep) return "completed";
    return "upcoming";
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <SideNav collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Content - keeping the exact same width classes as original */}
      <div className={`flex-1 max-w-7xl mx-auto p-2 mr-3 ${collapsed ? "ml-16 max-w-[90rem]" : "ml-60"}`}>
        {/* Progress Bar with Phase Indicator */}
        <div className="mb-4 bg-gray-200 rounded-full h-3 relative">
          <div
            className="bg-blue-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          ></div>
          <div className="absolute top-4 left-0 text-xs font-medium text-gray-600">
            Phase: {phases[getCurrentPhase()]?.name} ({currentStep + 1}/{steps.length})
          </div>
        </div>

        {/* Scrollable Navigation with Arrow Controls */}
        <div className="relative mb-6 mt-8">
          <button
            onClick={() => handleScroll('left')}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-1 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            disabled={visibleRange.start === 0}
          >
            <ChevronLeft size={16} />
          </button>

          <div className="overflow-hidden mx-8">
            <div
              ref={containerRef}
              className="flex items-center space-x-8 px-4 transition-transform duration-300"
            >
              {steps.slice(visibleRange.start, visibleRange.end + 1).map((step, visibleIndex) => {
                const actualIndex = visibleIndex + visibleRange.start;
                const status = getStepStatus(actualIndex);

                return (
                  <div
                    key={actualIndex}
                    className={`flex flex-col items-center cursor-pointer ${status === "current" ? "text-blue-600 font-semibold" : "text-gray-500"
                      }`}
                    onClick={() => handleStepClick(actualIndex)}
                  >
                    <div
                      className={`w-10 h-10 flex items-center justify-center rounded-full ${status === "completed"
                          ? "bg-green-500 text-white"
                          : status === "current"
                            ? "bg-blue-500 text-white"
                            : "bg-gray-300"
                        }`}
                    >
                      {actualIndex + 1}
                    </div>
                    <span className="mt-2 text-sm text-center w-20">{step.title}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => handleScroll('right')}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-1 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            disabled={visibleRange.end >= steps.length - 1}
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Step Content - maintaining original dimensions */}
        <div className="relative overflow-hidden bg-gray-50 rounded-lg shadow-md">
          <div
            className={`flex transition-transform duration-500 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}
            style={{ transform: `translateX(-${currentStep * 100}%)` }}
          >
            {steps.map((step, index) => (
              <div
                key={index}
                className="min-w-full px-12 py-4 flex justify-center"
              >
                <div className="w-full max-w-3xl bg-white rounded-lg shadow-md p-6">
                  {step.content}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Buttons - maintaining original positioning */}
        <div className="flex justify-between items-center mt-2.5">
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
      <Outlet />
    </div>
  );
};

export default CarouselHorizontalStepper;