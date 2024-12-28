import React, { useState, useRef, useEffect } from "react";
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
import SideNav from "./SideNav"; // Import the SideNav component
import { Outlet } from "react-router-dom";
import KickoffMeetings from "./KickoffMeetings";


const steps = [
  { title: "Service Requirements", content: <ServiceRequirements /> },
  { title: "Inquiry Section", content: <InquirySection /> },
  { title: "Finalize Contract", content: <FinalizeContract /> },
  { title: "Kickoff Meetings", content: <KickoffMeetings /> },
  { title: "Gap Analysis. ", content: <GapAnalysis /> },
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
  { title: "Certification section", content: <CertificationPage /> },
];

const CarouselHorizontalStepper = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    scrollToStep(currentStep);
  }, [currentStep]);

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const scrollToStep = (stepIndex) => {
    const container = containerRef.current;
    const stepElement = container.children[stepIndex];
    if (stepElement) {
      stepElement.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  };

  return (
    <div className="flex h-screen ">
      {/* Sidebar */}
      <SideNav />

      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto p-2 ">

        {/* Scrollable Navigation with Consistent Alignment */}
        <div
          ref={containerRef}
          className="flex items-center mb-6 overflow-x-auto space-x-8 px-4 " 
        >
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex flex-col items-center ${
                index === currentStep
                  ? "text-blue-600 font-semibold"
                  : "text-gray-500"
              }`}
            >
              {/* Step Circle */}
              <div
                className={`w-10 h-10 flex items-center justify-center rounded-full ${
                  index <= currentStep ? "bg-blue-500 text-white" : "bg-gray-300"
                }`}
              >
                {index + 1}
              </div>
              {/* Step Title */}
              <span className="mt-2 text-sm text-center w-20">
                {step.title}
              </span>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="relative overflow-hidden bg-gray-50 rounded-lg shadow-md">
          <div
            className="flex transition-transform duration-500"
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

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-2.5">
          <button
            onClick={handlePrev}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50"
            disabled={currentStep === 0}
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            disabled={currentStep === steps.length - 1}
          >
            Next
          </button>
        </div>
      </div>
      <Outlet/>
    </div>
  );
};

export default CarouselHorizontalStepper;
