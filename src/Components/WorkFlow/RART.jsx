import React from "react";
import { Button } from "antd";
import { useNavigate, useParams } from "react-router-dom";

const RART = () => {
  const navigate = useNavigate();
  const { projectid } = useParams();

  const handleRedirectToReports = () => {
    navigate(`/project/${projectid}/myreports`);
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Risk Assessment and Risk Treatment (RART)
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Treatment Overview
          </h2>
          <p className="text-gray-600 mb-6">
            Access and manage your risk assessments and treatments through the
            My Reports section. Here you can view, generate, and analyze reports
            based on the project data.
          </p>

          <Button
            type="primary"
            size="large"
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleRedirectToReports}
          >
            Go to My Reports
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RART;
