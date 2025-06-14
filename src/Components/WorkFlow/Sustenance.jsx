import React, { useState, useContext, useEffect } from "react";
import { Button, Input, Modal, Select, message } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { apiRequest } from "../../utils/api";
import { AuthContext } from "../../AuthContext";
import { ProjectContext } from "../../Context/ProjectContext";

const { Option } = Select;

const Sustenance = () => {
  const [isCreateProjectModalVisible, setIsCreateProjectModalVisible] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [companies, setCompanies] = useState([]);

  const { projectid } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { projectRole } = useContext(ProjectContext);

  const getCompanies = async () => {
    const res = await apiRequest("GET", "/api/auth/companies/", null, true);
    console.log(res);
    if (res.status == 200) {
      setCompanies(res.data);
    }
    setSelectedCompany(res.data[0]?.id || "");
  };

  const handleCreateProject = async () => {
    const res = await apiRequest(
      "POST",
      "/api/project/create/",
      { name: projectName, company_id: selectedCompany },
      true
    );
    if (res.status == 201) {
      console.log(res.data.message);
      message.success("Project created successfully!");
      setIsCreateProjectModalVisible(false);
      setProjectName("");
      // Optionally navigate to new project or refresh projects list
    } else {
      setIsCreateProjectModalVisible(false);
      message.error("Something went wrong");
      return;
    }
  };

  return (
    <div className="p-6 rounded-md">
      {/* Page Heading */}
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">Sustenance</h2>
        <div className="flex gap-2">
          {/* Request for Sustenance button - only for Consultant Admin */}
          {projectRole === "consultant admin" && (
            <Button
              type="primary"
              className="bg-green-600 hover:bg-green-700 text-white border-green-600"
              onClick={() => message.success("Sustenance request sent successfully!")}
            >
              Request for Sustenance
            </Button>
          )}

          {/* Accept/Reject buttons - only for Company */}
          {projectRole === "company" && (
            <>
              <Button
                type="primary"
                className="bg-green-600 hover:bg-green-700 text-white border-green-600"
                onClick={() => message.success("Sustenance accepted successfully!")}
              >
                Accept
              </Button>
              <Button
                type="primary"
                danger
                className="bg-red-600 hover:bg-red-700 text-white border-red-600"
                onClick={() => message.success("Sustenance rejected successfully!")}
              >
                Reject
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Create New Project Section */}
      <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-md border border-gray-100 p-6 flex flex-col items-center justify-center min-h-[300px]">
        <div className="text-center max-w-md mx-auto">
          {/* Create New Project Section */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-gray-800 mb-3">Ready for a New Project?</h4>
            <p className="text-gray-600 mb-4">
              Once you've completed sustenance, you can start a new compliance project.
            </p>
            {(user?.role === "Super Consultant" || projectRole === "company") && (
              <Button
                onClick={() => {
                  setIsCreateProjectModalVisible(true);
                  getCompanies();
                }}
                type="primary"
                size="large"
                className="bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-200 font-medium h-10 px-6"
              >
                <span className="flex items-center space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  <span>Create New Project</span>
                </span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Create Project Modal */}
      <Modal
        title="Create New Project"
        open={isCreateProjectModalVisible}
        onCancel={() => setIsCreateProjectModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsCreateProjectModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="create" type="primary" onClick={handleCreateProject} className="bg-blue-500">
            Create Project
          </Button>
        ]}
      >
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Project Name</label>
          <Input
            placeholder="Enter project name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Company</label>
          <Select
            style={{ width: "100%" }}
            placeholder="Select company"
            value={selectedCompany}
            onChange={setSelectedCompany}
          >
            {companies.map((company) => (
              <Option key={company.id} value={company.id}>
                {company.name}
              </Option>
            ))}
          </Select>
        </div>
      </Modal>
    </div>
  );
};

export default Sustenance;
