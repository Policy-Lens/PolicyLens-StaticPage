import { useState, useRef, useEffect, createContext } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import ServiceRequirements from "./ServiceRequirements";
import GapAnalysis from "./GapAnalysis";
import StakeholderInterviews from "./StakeholderInterviews";
import DataAnalysis from "./DataAnalysis";
import InquirySection from "./InquirySection";
import FinalizeContract from "./FinalizeContract";
import Planning from "./Planning";
import DiscussingPolicies from "./DiscussingPolicies";
import DiscussImplementation from "./DiscussImplementation";
import ImplementPolicies from "./ImplementPolicies";
import ExternalAuditProcess from "./ExternalAuditProcess";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Calendar, HelpCircle, FileText, Shield, CheckCircle, Database } from "lucide-react";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

// Create a context for loading state
export const LoadingContext = createContext({
  isLoading: false,
  setIsLoading: () => { },
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

const steps = [
  { title: "Service Requirements", content: <ServiceRequirements /> },
  { title: "Inquiry Section", content: <InquirySection /> },
  { title: "Finalize Contract", content: <FinalizeContract /> },
  // { title: "Kickoff Meetings", content: <KickoffMeetings /> },
  { title: "Gap Analysis", content: <GapAnalysis /> },
  { title: "Stakeholder Interviews", content: <StakeholderInterviews /> },
  { title: "Data Analysis", content: <DataAnalysis /> },
  // { title: "Report Presentation", content: <ReportPresentation /> },
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
  const navigate = useNavigate();
  const { projectid } = useParams();
  const [isLoading, setIsLoading] = useState(false);


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


    // For other tabs, keep the existing carousel behavior
    const phase = phases.find(p => p.name === tab);
    if (phase && phase.steps.length > 0) {
      setCurrentStep(phase.steps[0]);
    }
  };


  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
      <div className="flex h-screen">
        <div className="flex-1 w-full px-6 pt-6 pb-4 flex flex-col">

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
                          {isLoading && status === "current" ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            actualIndex + 1
                          )}
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
          <div className="flex-grow relative overflow-hidden bg-white rounded-lg shadow-md">
            {isLoading && <LoadingIndicator />}
            <div
              className={`flex transition-transform duration-500 h-full ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}
              style={{ transform: `translateX(-${currentStep * 100}%)` }}
            >
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="min-w-full h-full overflow-auto"
                >
                  <div className="px-6 py-4 mx-auto max-w-5xl h-full">
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
              disabled={currentStep === 0 || isTransitioning || isLoading}
            >
              <ChevronLeft size={16} className="mr-1" /> Previous
            </button>

            <button
              onClick={handleNext}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center"
              disabled={currentStep === steps.length - 1 || isTransitioning || isLoading}
            >
              Next <ChevronRight size={16} className="ml-1" />
            </button>
          </div>

          {/* Add keyboard event listener effect */}
          <div style={{ display: 'none' }}>
            {useEffect(() => {
              const handleKeyDown = (event) => {
                if (event.key === 'ArrowLeft') {
                  handlePrev();
                } else if (event.key === 'ArrowRight') {
                  handleNext();
                }
              };

              window.addEventListener('keydown', handleKeyDown);

              // Clean up event listener on component unmount
              return () => {
                window.removeEventListener('keydown', handleKeyDown);
              };
            }, [currentStep, isTransitioning, isLoading])}
          </div>
        </div>
      </div>
    </LoadingContext.Provider>
  );
};

export default CarouselHorizontalStepper;