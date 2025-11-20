import React, { useState, useEffect, useContext } from "react";
import {
  Typography,
  Table,
  Card,
  Spin,
  message,
  Descriptions,
  Tag,
} from "antd";
import { apiRequest } from "../../../../../utils/api";
import { ScopingContext } from "../../../../../Context/ScopingContext";
const { Title, Text } = Typography;

const ScopeOfWork = ({ projectId }) => {
  const [loading, setLoading] = useState(true);
  const [companyData, setCompanyData] = useState(null);
  const { scopingData } = useContext(ScopingContext);

  useEffect(() => {
    fetchCompanyDetails();
  }, [scopingData]);

  const fetchCompanyDetails = async () => {
    try {
      setLoading(true);
      // fetch company details
      const companyResponse = await apiRequest(
        "GET",
        `/api/company/${scopingData.company}/details/`,
        null,
        true
      );

      if (companyResponse.status === 200) {
        setCompanyData(companyResponse.data);
      }
    } catch (error) {
      console.error("Error fetching company details:", error);
      message.error("Failed to load company details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!companyData) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Text type="secondary">No company data available</Text>
      </div>
    );
  }

  // Applicable Requirements columns
  const requirementColumns = [
    {
      title: "Title",
      dataIndex: "name",
      key: "name",
      width: 200,
    },
    {
      title: "Requirements",
      dataIndex: "requirements_count",
      key: "requirements_count",
      width: 150,
      align: "center",
    },
    {
      title: "Controls",
      dataIndex: "controls_count",
      key: "controls_count",
      width: 150,
      align: "center",
    },
    {
      title: "Applicable Locations",
      dataIndex: "applicable_locations",
      key: "applicable_locations",
      render: (locations) => (
        <div>
          {locations && locations.length > 0 ? (
            locations.map((loc, index) => (
              <Tag key={index} color="blue" style={{ marginBottom: 4 }}>
                {loc}
              </Tag>
            ))
          ) : (
            <Text type="secondary">All Locations</Text>
          )}
        </div>
      ),
    },
  ];

  // Location details columns
  const locationColumns = [
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      width: 200,
      render: (category) => <Text strong>{category}</Text>,
    },
    {
      title: "Count",
      dataIndex: "count",
      key: "count",
      width: 150,
      align: "right",
    },
  ];

  return (
    <div>
      <Title level={4}>Scope of Work - Project Summary</Title>
      <Text type="secondary">Overview of project scope and scale</Text>

      {/* Project Summary */}
      <Card title="Project Summary" style={{ marginTop: 24 }}>
        <Table
          dataSource={[
            {
              key: 1,
              type: "Locations",
              count: companyData.locations?.length || 0,
            },
            {
              key: 2,
              type: "IT Assets",
              count: companyData.assets?.length || 0,
            },
            {
              key: 3,
              type: "Headcount",
              count: companyData.num_employees || 0,
            },
          ]}
          columns={[
            {
              title: "Type",
              dataIndex: "type",
              key: "type",
              render: (text) => <Text strong>{text}</Text>,
            },
            {
              title: "Total Count",
              dataIndex: "count",
              key: "count",
              align: "right",
            },
          ]}
          pagination={false}
          size="middle"
        />
      </Card>

      {/* Applicable Requirements */}
      <Card title="Applicable Requirements" style={{ marginTop: 24 }}>
        <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
          Legal, statutory and standards requirements
        </Text>
        <Table
          dataSource={companyData.regulations || []}
          columns={requirementColumns}
          rowKey="id"
          pagination={false}
          size="middle"
        />
      </Card>

      {/* Location Details */}
      {companyData.locations &&
        companyData.locations.map((location, index) => (
          <Card
            key={location.id || index}
            title={`Location ${index + 1}`}
            style={{ marginTop: 24 }}
          >
            <Text
              type="secondary"
              style={{ display: "block", marginBottom: 16 }}
            >
              Location details and infrastructure
            </Text>

            <Descriptions
              bordered
              column={2}
              size="small"
              style={{ marginBottom: 16 }}
            >
              <Descriptions.Item label="Location Name">
                {location.name || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Address">
                {location.address || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="City">
                {location.city || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="State/Province">
                {location.state || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Country">
                {location.country || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Postal Code">
                {location.postal_code || "N/A"}
              </Descriptions.Item>
            </Descriptions>

            <Table
              dataSource={[
                {
                  key: 1,
                  category: "Headcount",
                  count: location.headcount || 0,
                },
                {
                  key: 2,
                  category: "IT Assets",
                  count: location.it_assets || 0,
                },
                {
                  key: 3,
                  category: "Cloud Services",
                  count: location.cloud_services || 0,
                },
                {
                  key: 4,
                  category: "Applications",
                  count: location.applications || 0,
                },
              ]}
              columns={locationColumns}
              pagination={false}
              size="small"
            />
          </Card>
        ))}
    </div>
  );
};

export default ScopeOfWork;
