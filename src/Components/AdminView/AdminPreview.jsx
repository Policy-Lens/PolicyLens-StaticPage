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
  Tooltip,
  Modal,
} from "antd";
import {
  CheckCircleOutlined,
  DownloadOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useParams } from "react-router-dom";
import { apiRequest } from "../../utils/api";
import { BASE_URL } from "../../utils/api";
import FileViewerModal from "../FileViewer/FileViewerModal";
const { Text } = Typography;
const { Panel } = Collapse;

const PreviewPage = () => {
  const { projectid } = useParams();
  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("list"); // Set default view to "list"
  const [rawViewType, setRawViewType] = useState("latest"); // To toggle between latest and full data in raw view
  const [fileViewerVisible, setFileViewerVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // Single bulk data fetch - eliminates N+1 pattern
  const fetchProjectData = async () => {
    setLoading(true);
    try {
      const response = await apiRequest(
        "GET",
        `/api/plc/project/${projectid}/plc-overview/`,
        null,
        true
      );
      
      if (response.status === 200) {
        console.log("Bulk project data:", response.data);
        setProjectData(response.data);
      } else if (response.status === 404) {
        setProjectData(null);
        message.error("No data found for this project.");
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setProjectData(null);
        message.error("No data found for this project.");
      } else {
        console.error("Error fetching project data:", error);
        message.error(error.message || "Failed to load project data");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectid) {
      fetchProjectData();
    }
  }, [projectid]);

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
  
  // Get file extension
  const getFileExtension = (fileName) => {
    if (!fileName) return "";
    return fileName.split('.').pop() || "";
  };

  // Handle file download
  const handleFileDownload = async (fileUrl, fileName) => {
    try {
      const fullUrl = fileUrl.startsWith('http') ? fileUrl : `${BASE_URL}${fileUrl}`;
      const response = await fetch(fullUrl, { credentials: 'include' });
      if (!response.ok) throw new Error('Network response was not ok');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || 'download');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      message.success(`Downloading ${fileName}`);
    } catch (error) {
      console.error("Download error:", error);
      message.error(`Failed to download ${fileName}`);
    }
  };

  // Safely construct URL without double prefixing
  const getSafeUrl = (url) => {
    if (!url) return '';
    // Check if URL is already absolute (starts with http:// or https://)
    if (url.match(/^https?:\/\//i)) {
      return url;
    }
    // If it's a relative URL, prepend BASE_URL
    return `${BASE_URL}${url}`;
  };

  // Handle file view
  const handleFileView = (fileUrl, fileName) => {
    const extension = getFileExtension(fileName);
    
    // Don't prepend BASE_URL here, let FileViewerModal handle it
    setSelectedFile({
      url: fileUrl, // Pass the raw URL without BASE_URL
      name: fileName,
      extension: extension
    });
    
    console.log('Viewing file:', fileName);
    console.log('URL passed to modal:', fileUrl);
    
    setFileViewerVisible(true);
  };

  const renderListView = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center min-h-[60vh]">
          <Spin size="large" />
        </div>
      );
    }

    if (!projectData || !projectData.steps || projectData.steps.length === 0) {
      return <Empty description="No step data available" className="my-10" />;
    }

    return (
      <div className="bg-white rounded-lg shadow-md p-6 overflow-hidden">
        <div className="max-h-[70vh] overflow-y-auto pr-2">
          {projectData.steps.map((step) => (
            <div key={step.step_no} className="mb-8 border-b pb-6 border-gray-200">
              <div className="mb-2 flex items-center gap-4">
                <Text className="text-xl font-bold">Step {step.step_no}</Text>
                <Tag color="blue">{step.status}</Tag>
                <Tag color="purple">{step.process}</Tag>
                {step.associated_iso_clause && (
                  <Tag color="geekblue">ISO: {step.associated_iso_clause}</Tag>
                )}
              </div>
              <div className="mb-2">
                <b>Review Status:</b> {step.review_status || "-"} <b>Review Comment:</b> {step.review_comment || "-"}
              </div>
              {step.assignments && step.assignments.length > 0 && (
                <div className="mb-2">
                  <b>Assignments:</b>
                  <ul className="ml-4 list-disc">
                    {step.assignments.map((a) => (
                      <li key={a.id}>
                        <span><b>Description:</b> {a.description || "-"} </span>
                        <span><b>References:</b> {a.references || "-"} </span>
                        <span><b>Deadline:</b> {a.deadline || "-"} </span>
                        <span><b>Assigned to:</b> {a.assigned_to_names?.join(", ") || "-"}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <List
                bordered={false}
                itemLayout="horizontal"
                dataSource={step.latest_data}
                renderItem={(item) => (
                  <List.Item className="bg-white mb-2 rounded-lg shadow-sm p-5 border border-gray-200">
                    <Space size="large" className="flex items-start">
                      <CheckCircleOutlined className="text-2xl text-green-500 mt-1" />
                      <div>
                        <Text className="text-lg font-medium">{item.field_name}</Text>
                        <div className="text-sm text-gray-600 mt-1">{item.text_data}</div>
                        {item.documents && item.documents.length > 0 && (
                          <div className="mt-2">
                            <Text className="text-sm font-medium">Documents:</Text>
                            <div className="space-y-1 mt-1">
                              {item.documents.map((doc) => (
                                <div key={doc.id} className="flex items-center">
                                  <FileTextOutlined className="text-blue-500 mr-2" />
                                  <span 
                                    className="text-blue-500 cursor-pointer hover:underline"
                                    onClick={() => handleFileDownload(doc.file, getFileName(doc.file))}
                                  >
                                    {getFileName(doc.file)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-2">
                          <b>Sequence:</b> {item.sequence_no} | <b>Saved by:</b> {item.saved_by} | <b>Timestamp:</b> {formatDate(item.saved_at)}
                        </div>
                      </div>
                    </Space>
                    <Tag className="text-sm px-3 py-1 rounded-full bg-green-100 text-green-600">
                      {step.status || "Completed"}
                    </Tag>
                  </List.Item>
                )}
              />
            </div>
          ))}
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

    if (!projectData || !projectData.steps || projectData.steps.length === 0) {
      return <Empty description="No step data available" className="my-10" />;
    }

    // Transform data for JSON view format
    const jsonViewData = projectData.steps.map(step => ({
      step_no: step.step_no,
      status: step.status,
      process: step.process,
      associated_iso_clause: step.associated_iso_clause,
      review_status: step.review_status,
      review_comment: step.review_comment,
      assignments: step.assignments,
      data: step.latest_data
    }));

    return (
      <div className="bg-white rounded-lg shadow-md p-6 overflow-hidden">
        <div className="max-h-[70vh] overflow-y-auto pr-2">
          <Collapse className="bg-white">
            {jsonViewData.map((step) => (
              <Panel
                header={
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-lg">Step {step.step_no}</span>
                    <span>
                      <Tag color="blue">{step.status}</Tag>
                      <Tag color="purple">{step.process}</Tag>
                      {step.associated_iso_clause && (
                        <Tag color="geekblue">ISO: {step.associated_iso_clause}</Tag>
                      )}
                    </span>
                    <span>
                      <b>Review Status:</b> {step.review_status || "-"} <b>Review Comment:</b> {step.review_comment || "-"}
                    </span>
                    {step.assignments && step.assignments.length > 0 && (
                      <span>
                        <b>Assignments:</b>
                        <ul className="ml-4 list-disc">
                          {step.assignments.map((a) => (
                            <li key={a.id}>
                              <span><b>Description:</b> {a.description || "-"} </span>
                              <span><b>References:</b> {a.references || "-"} </span>
                              <span><b>Deadline:</b> {a.deadline || "-"} </span>
                              <span><b>Assigned to:</b> {a.assigned_to_names?.join(", ") || "-"}</span>
                            </li>
                          ))}
                        </ul>
                      </span>
                    )}
                  </div>
                }
                key={step.step_no}
              >
                {step.data.map((entry, entryIndex) => (
                  <div
                    key={entryIndex}
                    className="mb-6 pb-2 bg-gray-50 rounded-lg p-4 border border-gray-200 shadow-sm"
                  >
                    <div className="flex justify-between mb-3 pb-2 border-b border-gray-200">
                      <Text strong className="text-base">
                        {entry.field_name} (Entry #{entryIndex + 1})
                      </Text>
                      <Text type="secondary">{formatDate(entry.saved_at)}</Text>
                    </div>
                    <div className="flex flex-wrap gap-x-8 gap-y-2 mb-4">
                      <div className="flex items-center">
                        <Text type="secondary" className="font-medium mr-2">
                          Step Number:
                        </Text>
                        <Text>{step.step_no}</Text>
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
                        Value:
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
                              className="flex items-center bg-white p-3 rounded border border-gray-100"
                            >
                              <div className="flex items-center cursor-pointer" onClick={() => handleFileDownload(doc.file, getFileName(doc.file))}>
                                <FileTextOutlined className="text-blue-500 mr-2" />
                                <span className="text-blue-500 hover:underline">{getFileName(doc.file)}</span>
                              </div>
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

    const data = projectData;

    if (!data || !data.steps || data.steps.length === 0) {
      return <Empty description="No data available" className="my-10" />;
    }

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-4 flex justify-between items-center">
          <div>
            <Tooltip title="Show only the most recent data entries">
              <Button
                type={rawViewType === "latest" ? "primary" : "default"}
                onClick={() => setRawViewType("latest")}
                size="small"
                className="mr-2"
              >
                Latest Data
              </Button>
            </Tooltip>
            <Tooltip title="Show all historical data entries">
              <Button
                type={rawViewType === "full" ? "primary" : "default"}
                onClick={() => setRawViewType("full")}
                size="small"
              >
                Full Data
              </Button>
            </Tooltip>
          </div>
          <Tooltip title="Download the JSON data as a file">
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
          </Tooltip>
        </div>
        <div className="relative">
          <Tooltip title="Copy the JSON data to clipboard">
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
          </Tooltip>
          <pre className="bg-gray-100 p-5 rounded-lg text-left overflow-x-auto max-h-[70vh] overflow-y-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </div>
    );
  };

  // Tooltip descriptions for each view
  const tooltipDescriptions = {
    list: "This view shows the most recent data entry for each step in your project, organized chronologically. Use this view to quickly assess the current state of your project.",
    json: "This view displays all historical data organized by field and step, showing changes over time. Use this view to track progress and review the complete history of your project.",
    raw: "This view displays the raw JSON data for technical inspection and debugging purposes. You can toggle between latest and full data sets, and download the JSON for further analysis."
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
            <div className="inline-block">
              <Tooltip title={tooltipDescriptions.list} placement="bottom" mouseEnterDelay={0.1}>
                <Button
                  type={view === "list" ? "primary" : "default"}
                  onClick={() => setView("list")}
                  className="mr-2"
                >
                  Latest Data View
                </Button>
              </Tooltip>
            </div>
            <div className="inline-block">
              <Tooltip title={tooltipDescriptions.json} placement="bottom" mouseEnterDelay={0.1}>
                <Button
                  type={view === "json" ? "primary" : "default"}
                  onClick={() => setView("json")}
                  className="mr-2"
                >
                  Complete Data View
                </Button>
              </Tooltip>
            </div>
            <div className="inline-block">
              <Tooltip title={tooltipDescriptions.raw} placement="bottom" mouseEnterDelay={0.1}>
                <Button
                  type={view === "raw" ? "primary" : "default"}
                  onClick={() => setView("raw")}
                >
                  Raw JSON
                </Button>
              </Tooltip>
            </div>
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
      
      {/* File Viewer Modal */}
      {fileViewerVisible && selectedFile && (
        <FileViewerModal
          visible={fileViewerVisible}
          file={selectedFile}
          onClose={() => {
            setFileViewerVisible(false);
            setSelectedFile(null);
          }}
        />
      )}
    </div>
  );
};

export default PreviewPage;