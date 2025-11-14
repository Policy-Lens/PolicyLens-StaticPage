import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, FileText, Filter, Loader2 } from "lucide-react";
import { message, Card, Input, Select, Spin } from "antd";
import { apiRequest } from "../../utils/api";

const { Search: AntSearch } = Input;
const { Option } = Select;

const PolicyTemplateList = ({ onSelectTemplate, projectId, companyId }) => {
  const [templates, setTemplates] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [templateTypeFilter, setTemplateTypeFilter] = useState("");

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [templates, searchTerm, templateTypeFilter]);

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest(
        "GET",
        "/api/plc_workflow/templates/?active=true",
        null,
        true
      );
      
      if (response.data && response.data.results) {
        setTemplates(response.data.results);
      } else {
        setTemplates([]);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
      message.error("Failed to fetch templates");
      setTemplates([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterTemplates = () => {
    let filtered = [...templates];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (template) =>
          template.template_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          template.template_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by template type
    if (templateTypeFilter) {
      filtered = filtered.filter(
        (template) => template.template_type === templateTypeFilter
      );
    }

    setFilteredTemplates(filtered);
  };

  const handleSelectTemplate = async (template) => {
    try {
      // Create policy from template
      const createData = {
        template_id: template.template_id || template.id,
      };
      
      if (companyId) {
        createData.company_id = companyId;
      }
      
      if (projectId) {
        createData.project_id = projectId;
      }

      const response = await apiRequest(
        "POST",
        "/api/plc_workflow/policies/create/",
        createData,
        true
      );

      if (response.data && response.data.data) {
        message.success("Policy created successfully");
        if (onSelectTemplate) {
          onSelectTemplate(response.data.data);
        }
      }
    } catch (error) {
      console.error("Error creating policy:", error);
      message.error(error.data?.error || "Failed to create policy");
    }
  };

  // Get unique template types
  const templateTypes = [
    ...new Set(templates.map((t) => t.template_type).filter(Boolean)),
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Select a Policy Template
        </h2>
        <p className="text-gray-600">
          Choose a template to create a new policy document
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1">
          <AntSearch
            placeholder="Search templates..."
            allowClear
            size="large"
            prefix={<Search className="w-4 h-4 text-gray-400" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select
          placeholder="Filter by type"
          allowClear
          size="large"
          style={{ width: 200 }}
          value={templateTypeFilter}
          onChange={setTemplateTypeFilter}
        >
          {templateTypes.map((type) => (
            <Option key={type} value={type}>
              {type}
            </Option>
          ))}
        </Select>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            {searchTerm || templateTypeFilter
              ? "No templates found matching your criteria"
              : "No templates available"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <Card
              key={template.id || template.template_id}
              hoverable
              className="cursor-pointer transition-shadow"
              onClick={() => handleSelectTemplate(template)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    {template.template_name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">
                    {template.template_id}
                  </p>
                </div>
                {template.template_type && (
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                    {template.template_type}
                  </span>
                )}
              </div>
              
              <div className="text-sm text-gray-600">
                <p className="mb-1">
                  Created: {new Date(template.created_date).toLocaleDateString()}
                </p>
                {template.template_data?.metadata && (
                  <p className="text-xs text-gray-500">
                    {Object.keys(template.template_data.metadata).length} metadata fields
                  </p>
                )}
              </div>

              <div className="mt-4 pt-4 border-t">
                <button
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectTemplate(template);
                  }}
                >
                  Use Template
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PolicyTemplateList;

