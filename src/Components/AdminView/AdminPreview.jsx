import React, { useState, useEffect } from "react";
import {
  List,
  Tag,
  Typography,
  Space,
  Button,
  Spin,
  Collapse,
  Empty,
  message,
} from "antd";
import {
  CheckCircleOutlined,
  DownloadOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useParams } from "react-router-dom";
import { apiRequest } from "../../utils/api";
import { BASE_URL } from "../../utils/api";
const { Text } = Typography;
const { Panel } = Collapse;

const PreviewPage = () => {
  const { projectid } = useParams();
  const [listData, setListData] = useState([]);
  const [jsonData, setJsonData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("");
  const [rawViewType, setRawViewType] = useState("latest"); // To toggle between latest and full data in raw view

  useEffect(() => {
    if (view === "list") {
      fetchListData();
    } else if (view === "json") {
      fetchJsonData();
    } else if (view === "raw") {
      if (rawViewType === "latest") {
        fetchListData();
      } else {
        fetchJsonData();
      }
    }
  }, [view, projectid, rawViewType]);

  const fetchListData = async () => {
    setLoading(true);
    try {
      const response = await apiRequest(
        "GET",
        `/api/plc/plc-data/all-steps/${projectid}/latest/`,
        null,
        true
      );
      if (response.status === 200) {
        console.log(response.data);
        setListData(response.data);
      }
    } catch (error) {
      console.error("Error fetching list data:", error);
      message.error(error.message || "Failed to load latest step data");
    } finally {
      setLoading(false);
    }
  };

  const fetchJsonData = async () => {
    setLoading(true);
    try {
      const response = await apiRequest(
        "GET",
        `/api/plc/plc-data/all-steps/${projectid}/`,
        null,
        true
      );
      setJsonData(response.data);
    } catch (error) {
      console.error("Error fetching JSON data:", error);
      message.error(error.message || "Failed to load complete step data");
    } finally {
      setLoading(false);
    }
  };

  // Extract filename from file path
  const getFileName = (filePath) => {
    if (!filePath) return "";
    return filePath.split("/").pop();
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const renderListView = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center min-h-[60vh]">
          <Spin size="large" />
        </div>
      );
    }

    if (!listData || listData.length === 0) {
      return <Empty description="No step data available" className="my-10" />;
    }

    return (
      <div className="bg-white rounded-lg shadow-md p-6 overflow-hidden">
        <div className="max-h-[70vh] overflow-y-auto pr-2">
          <List
            bordered={false}
            itemLayout="horizontal"
            dataSource={listData}
            renderItem={(item) => (
              <List.Item className="bg-white mb-2 rounded-lg shadow-sm p-5 border border-gray-200">
                <Space size="large" className="flex items-start">
                  <CheckCircleOutlined className="text-2xl text-green-500 mt-1" />
                  <div>
                    <Text className="text-lg font-medium">
                      {item.field_name}
                    </Text>
                    <div className="text-sm text-gray-600 mt-1">
                      {item.text_data}
                    </div>
                    {item.documents && item.documents.length > 0 && (
                      <div className="mt-2">
                        <Text className="text-sm font-medium">Documents:</Text>
                        <div className="space-y-1 mt-1">
                          {item.documents.map((doc) => (
                            <div key={doc.id} className="flex items-center">
                              <FileTextOutlined className="text-blue-500 mr-2" />
                              <a
                                href={`${BASE_URL}${doc.file}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:text-blue-700"
                              >
                                {getFileName(doc.file)}
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="text-xs text-gray-500 mt-2">
                      <b>Step:</b> {item.step_no} | <b>Saved by:</b>{" "}
                      {item.saved_by} | <b>Timestamp:</b>{" "}
                      {formatDate(item.saved_at)}
                    </div>
                  </div>
                </Space>
                <Tag className="text-sm px-3 py-1 rounded-full bg-green-100 text-green-600">
                  {item.status || "Completed"}
                </Tag>
              </List.Item>
            )}
          />
        </div>
      </div>
    );
  };

  const renderJsonView = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center min-h-[60vh]">
          <Spin size="large" />
        </div>
      );
    }

    if (!jsonData || jsonData.length === 0) {
      return <Empty description="No step data available" className="my-10" />;
    }

    return (
      <div className="bg-white rounded-lg shadow-md p-6 overflow-hidden">
        <div className="max-h-[70vh] overflow-y-auto pr-2">
          <Collapse className="bg-white">
            {jsonData.map((item, index) => (
              <Panel
                header={
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-lg">
                      {item.field_name}
                    </span>
                    <span className="text-sm text-gray-500">
                      {item.data.length} entries
                    </span>
                  </div>
                }
                key={index}
              >
                {item.data.map((entry, entryIndex) => (
                  <div
                    key={entryIndex}
                    className="mb-6 pb-2 bg-gray-50 rounded-lg p-4 border border-gray-200 shadow-sm"
                  >
                    <div className="flex justify-between mb-3 pb-2 border-b border-gray-200">
                      <Text strong className="text-base">
                        Entry #{entryIndex + 1}
                      </Text>
                      <Text type="secondary">{formatDate(entry.saved_at)}</Text>
                    </div>

                    <div className="flex flex-wrap gap-x-8 gap-y-2 mb-4">
                      <div className="flex items-center">
                        <Text type="secondary" className="font-medium mr-2">
                          Step Number:
                        </Text>
                        <Text>{entry.step_no}</Text>
                      </div>
                      <div className="flex items-center">
                        <Text type="secondary" className="font-medium mr-2">
                          Sequence Number:
                        </Text>
                        <Text>{entry.sequence_no}</Text>
                      </div>
                    </div>

                    <div className="mb-4">
                      <Text type="secondary" className="font-medium">
                        Description:
                      </Text>
                      <div className="p-3 bg-white rounded mt-1 border border-gray-100">
                        {entry.text_data}
                      </div>
                    </div>

                    {entry.documents && entry.documents.length > 0 && (
                      <div className="mb-4">
                        <Text type="secondary" className="font-medium">
                          Documents:
                        </Text>
                        <div className="space-y-2 mt-1">
                          {entry.documents.map((doc) => (
                            <div
                              key={doc.id}
                              className="flex items-center justify-between bg-white p-3 rounded border border-gray-100"
                            >
                              <div className="flex items-center">
                                <FileTextOutlined className="text-blue-500 mr-2" />
                                <span>{getFileName(doc.file)}</span>
                              </div>
                              <a
                                href={`${BASE_URL}${doc.file}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:text-blue-700"
                              >
                                View
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-gray-500">
                      <b>Saved by:</b> {entry.saved_by}
                    </div>
                  </div>
                ))}

                <div className="mt-4 pt-2 border-t border-gray-200">
                  <Button
                    size="small"
                    type="text"
                    icon={<DownloadOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      const dataStr = JSON.stringify(item.data, null, 2);
                      const blob = new Blob([dataStr], {
                        type: "application/json",
                      });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `${item.field_name.replace(
                        /\s+/g,
                        "_"
                      )}_data.json`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                    }}
                  >
                    Download JSON
                  </Button>
                </div>
              </Panel>
            ))}
          </Collapse>
        </div>
      </div>
    );
  };

  const renderRawJsonView = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center min-h-[60vh]">
          <Spin size="large" />
        </div>
      );
    }

    const data = rawViewType === "latest" ? listData : jsonData;

    if (!data || data.length === 0) {
      return <Empty description="No data available" className="my-10" />;
    }

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-4 flex justify-between items-center">
          <div>
            <Button
              type={rawViewType === "latest" ? "primary" : "default"}
              onClick={() => setRawViewType("latest")}
              size="small"
              className="mr-2"
            >
              Latest Data
            </Button>
            <Button
              type={rawViewType === "full" ? "primary" : "default"}
              onClick={() => setRawViewType("full")}
              size="small"
            >
              Full Data
            </Button>
          </div>
          <Button
            icon={<DownloadOutlined />}
            onClick={() => {
              const dataStr = JSON.stringify(data, null, 2);
              const blob = new Blob([dataStr], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `project_${projectid}_${rawViewType}.json`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            }}
          >
            Download JSON
          </Button>
        </div>
        <div className="relative">
          <Button
            className="absolute right-2 top-2 z-10"
            size="small"
            onClick={() => {
              const dataStr = JSON.stringify(data, null, 2);
              navigator.clipboard.writeText(dataStr);
              message.success("JSON copied to clipboard");
            }}
          >
            Copy
          </Button>
          <pre className="bg-gray-100 p-5 rounded-lg text-left overflow-x-auto max-h-[70vh] overflow-y-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Main Content */}
      <div className="flex-1 p-6 flex flex-col h-screen">
        <div className="flex-none">
          <h1 className="text-2xl font-bold text-center mb-8">
            Project Data Preview
          </h1>
          <div className="text-center mb-5">
            <Button
              type={view === "list" ? "primary" : "default"}
              onClick={() => setView("list")}
              className="mr-2"
            >
              Latest Data View
            </Button>
            <Button
              type={view === "json" ? "primary" : "default"}
              onClick={() => setView("json")}
              className="mr-2"
            >
              Complete Data View
            </Button>
            <Button
              type={view === "raw" ? "primary" : "default"}
              onClick={() => setView("raw")}
            >
              Raw JSON
            </Button>
          </div>
        </div>
        <div className="flex-grow overflow-hidden">
          {view === "list" && renderListView()}
          {view === "json" && renderJsonView()}
          {view === "raw" && renderRawJsonView()}
          {view === "" && (
            <div className="text-center bg-white p-10 rounded-lg shadow-md">
              <h3 className="text-xl mb-4">Welcome to Project Data Preview</h3>
              <p className="text-gray-600 mb-6">
                Please select a view to display the project data:
              </p>
              <ul className="text-left inline-block mb-6">
                <li className="mb-2">
                  <strong>Latest Data View:</strong> Shows the most recent data
                  for each step
                </li>
                <li className="mb-2">
                  <strong>Complete Data View:</strong> Shows all historical data
                  organized by field
                </li>
                <li>
                  <strong>Raw JSON:</strong> Displays the raw JSON data for
                  technical inspection
                </li>
              </ul>
              <div className="flex justify-center space-x-4">
                <Button
                  type="primary"
                  onClick={() => setView("list")}
                  size="large"
                >
                  Latest Data View
                </Button>
                <Button
                  onClick={() => setView("json")}
                  size="large"
                  className="mx-2"
                >
                  Complete Data View
                </Button>
                <Button onClick={() => setView("raw")} size="large">
                  Raw JSON
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreviewPage;
