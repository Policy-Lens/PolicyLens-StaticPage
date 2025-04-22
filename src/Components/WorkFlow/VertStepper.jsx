import { useState, useRef, useEffect, createContext } from "react";
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
  { title: "Gap Analysis", content: <GapAnalysis /> },
  { title: "Data Analysis", content: <DataAnalysis /> },
  { title: "RART", content: <RART /> },
  { title: "Planning and Discussing Policies", content: <Planning /> },
  { title: "Implementation of Policies", content: <DiscussImplementation /> },
  { title: "Internal Audit Process", content: <InternalAuditProcess /> },
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
                        title={step.title}
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
          <div className="flex-grow relative overflow-hidden bg-white rounded-lg shadow-md">
            {/* Removed loading indicator from here */}

            {/* Previous button - gray background */}
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-gray-200 rounded-full shadow-md p-3 text-blue-600 hover:bg-gray-300 disabled:opacity-40 flex items-center justify-center transition-colors"
              disabled={currentStep === 0 || isTransitioning}
              aria-label="Previous step"
            >
              <ChevronLeft size={24} strokeWidth={2.5} />
            </button>

            {/* Next button - gray background */}
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-gray-200 rounded-full shadow-md p-3 text-blue-600 hover:bg-gray-300 disabled:opacity-40 flex items-center justify-center transition-colors"
              disabled={currentStep === steps.length - 1 || isTransitioning}
              aria-label="Next step"
            >
              <ChevronRight size={24} strokeWidth={2.5} />
            </button>

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

            {/* Step indicator at bottom */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-80 px-4 py-1.5 rounded-full shadow-sm text-sm text-gray-600 flex items-center">
              <span className="font-medium text-blue-600">{currentStep + 1}</span>
              <span>&nbsp;of&nbsp;</span>
              <span>{steps.length}</span>
            </div>
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
            }, [currentStep, isTransitioning])}
          </div>
        </div>
      </div>
    </LoadingContext.Provider>
  );
};

export default CarouselHorizontalStepper;