import React, { useState, useContext, useEffect } from "react";
import { Button, Dropdown, message } from "antd";
import { ProjectContext } from "../../Context/ProjectContext";
import { useParams } from "react-router-dom";
import { LoadingContext } from "./VertStepper";
import { apiRequest } from "../../utils/api";

const InternalAuditProcess = () => {
  const [stepStatus, setStepStatus] = useState("pending");
  const [stepId, setStepId] = useState(null);
  const [isAssignedUser, setIsAssignedUser] = useState(false);

  const { projectid } = useParams();
  const { getStepId, checkStepAuth, projectRole } = useContext(ProjectContext);
  const { setIsLoading } = useContext(LoadingContext);

  const get_step_id = async () => {
    setIsLoading(true);
    try {
      const response = await getStepId(projectid, 9);
      if (response) {
        setStepId(response.plc_step_id);
        setStepStatus(response.status);
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800">
            Internal Audit Process
          </h1>
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium
                            ${
                              stepStatus === "completed"
                                ? "bg-green-100 text-green-800"
                                : stepStatus === "in_progress"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
            >
              {stepStatus.charAt(0).toUpperCase() +
                stepStatus.slice(1).replace("_", " ")}
            </span>

            {(projectRole.includes("consultant admin") || isAssignedUser) && (
              <Dropdown
                menu={{
                  items: [
                    {
                      key: "pending",
                      label: "Pending",
                      onClick: () => updateStepStatus("pending"),
                    },
                    {
                      key: "in_progress",
                      label: "In Progress",
                      onClick: () => updateStepStatus("in_progress"),
                    },
                    {
                      key: "completed",
                      label: "Completed",
                      onClick: () => updateStepStatus("completed"),
                    },
                  ],
                }}
              >
                <Button
                  size="small"
                  className="flex items-center gap-1"
                  icon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  }
                />
              </Dropdown>
            )}
          </div>
        </div>
      </div>

      <p className="text-gray-600 mb-6">
        Streamline the internal audit process by creating profiles and
        templates. Choose one of the options below to proceed:
      </p>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Project Overview
        </h2>
        <ul className="list-disc pl-5 text-gray-600">
          <li>Project Name: Compliance Audit 2025</li>
          <li>Project Manager: Arjun Mehta</li>
          <li>Start Date: January 15, 2025</li>
          <li>End Date: December 15, 2025</li>
          <li>Status: In Progress</li>
        </ul>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Audit Team</h2>
        <ul className="list-disc pl-5 text-gray-600">
          <li>Lead Auditor: Neha Gupta</li>
          <li>Senior Consultant: Anand Sharma</li>
          <li>Compliance Specialist: Ravi Singh</li>
          <li>Quality Assurance: Deepika Patel</li>
        </ul>
      </div>

      <Button type="primary" className="bg-blue-600 hover:bg-blue-700">
        Assign Task
      </Button>
    </div>
  );
};

export default InternalAuditProcess;
