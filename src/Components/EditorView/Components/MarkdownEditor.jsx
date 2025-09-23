import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Input, 
  Tabs, 
  message, 
  Dropdown, 
  List, 
  Card, 
  Modal, 
  Space,
  Typography,
  Empty,
  Spin
} from 'antd';
import { 
  EditOutlined, 
  EyeOutlined, 
  SaveOutlined, 
  HistoryOutlined, 
  DownloadOutlined, 
  RotateLeftOutlined, 
  DeleteOutlined,
  UserOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';

const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;

const MarkdownEditor = ({ file, onFileUpdate }) => {
  const [content, setContent] = useState(file?.content || file?.file_content || '');
  const [originalContent, setOriginalContent] = useState('');
  const [activeTab, setActiveTab] = useState('edit');
  const [lastSaved, setLastSaved] = useState(null);
  const [versions, setVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Initialize content when file changes
  useEffect(() => {
    if (file) {
      console.log('File selected in editor:', file); // Debug log
      console.log('Available file properties:', Object.keys(file)); // Debug log
      console.log('File type:', file.file_type || file.type); // Debug log
      
      // Handle different possible content property names
      let fileContent = '';
      
      // Check for content in various properties
      if (file.content) {
        fileContent = file.content;
      } else if (file.file_content) {
        fileContent = file.file_content;
      } else if (file.markdown_content) {
        fileContent = file.markdown_content;
      } else if (file.converted_content) {
        fileContent = file.converted_content;
      } else if (file.description) {
        fileContent = file.description;
      } else if (file.text_content) {
        fileContent = file.text_content;
      }
      
      console.log('File content found:', fileContent ? fileContent.substring(0, 100) + '...' : 'No content'); // Debug log
      console.log('File content length:', fileContent.length); // Debug log
      
      setContent(fileContent);
      setOriginalContent(fileContent);
      loadVersions();
    } else {
      console.log('No file selected');
      setContent('');
      setOriginalContent('');
    }
  }, [file?.id]); // Only depend on file.id to avoid infinite re-renders

  // Mock function to simulate loading versions
  const loadVersions = async () => {
    if (!file) return;
    
    setHistoryLoading(true);
    // Simulate API call - replace with your actual API
    setTimeout(() => {
      // Handle different possible content property names for versions too
      const fileContent = file.content || file.file_content || file.markdown_content || file.converted_content || file.description || file.text_content || '';
      
      const mockVersions = [
        {
          id: 1,
          content: fileContent,
          created_at: new Date().toISOString(),
          user_name: 'Current User',
          version_number: 1
        }
      ];
      setVersions(mockVersions);
      setHistoryLoading(false);
    }, 500);
  };

  // Mock save function - replace with your actual save logic
  const saveFile = async () => {
    if (!file) return;
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setOriginalContent(content);
      setLastSaved(new Date());
      
      // Update parent component
      if (onFileUpdate) {
        onFileUpdate({
          ...file,
          content: content,
          updated_at: new Date().toISOString()
        });
      }
      
      message.success('File saved successfully');
    } catch (error) {
      message.error('Failed to save file');
    }
  };

  // Auto-save functionality
  useEffect(() => {
    const hasUnsavedChanges = content !== originalContent;
    if (hasUnsavedChanges && file) {
      const timer = setTimeout(() => {
        saveFile();
      }, 30000); // Auto-save after 30 seconds

      return () => clearTimeout(timer);
    }
  }, [content, originalContent, file]);

  const hasUnsavedChanges = content !== originalContent;

  // Export functions
  const exportFile = async (format) => {
    if (!file) return;
    
    const filename = file.file_name || 'document';
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    message.success(`File exported as ${format.toUpperCase()}`);
  };

  const exportMenuItems = [
    {
      key: 'pdf',
      label: 'Export as PDF',
      icon: <DownloadOutlined />,
      onClick: () => exportFile('pdf')
    },
    {
      key: 'docx',
      label: 'Export as DOCX', 
      icon: <DownloadOutlined />,
      onClick: () => exportFile('docx')
    },
    {
      key: 'txt',
      label: 'Export as TXT',
      icon: <DownloadOutlined />,
      onClick: () => exportFile('txt')
    },
    {
      key: 'md',
      label: 'Export as Markdown',
      icon: <DownloadOutlined />,
      onClick: () => exportFile('md')
    }
  ];

  const restoreVersion = (version) => {
    setContent(version.content);
    setSelectedVersion(null);
    setIsModalVisible(false);
    message.success(`Restored to version from ${new Date(version.created_at).toLocaleString()}`);
  };

  const clearHistory = () => {
    Modal.confirm({
      title: 'Clear History',
      content: `Are you sure you want to clear all ${versions.length} version(s) from history? This action cannot be undone.`,
      okText: 'Clear',
      okType: 'danger',
      onOk: () => {
        setVersions([]);
        message.success('History cleared successfully');
      }
    });
  };

  if (!file) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center">
        <Empty
          image={<EditOutlined style={{ fontSize: 64, color: '#999' }} />}
          description={
            <div>
              <Title level={4}>No file selected</Title>
              <Text type="secondary">
                Select a file from the explorer or create a new one to start editing
              </Text>
            </div>
          }
        />
      </div>
    );
  }

  const tabItems = [
    {
      key: 'edit',
      label: (
        <span className="flex items-center gap-2">
          <EditOutlined />
          <span>Edit</span>
        </span>
      ),
      children: (
        <div className="h-full -mx-4"> {/* Negative margin to counteract parent padding */}
          <TextArea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing your markdown content..."
            className="h-full resize-none border-0"
            style={{
              minHeight: 'calc(100vh - 200px)',
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
              fontSize: '14px',
              lineHeight: '1.6',
              padding: '16px' // Add padding to the textarea
            }}
            bordered={false}
          />
        </div>
      )
    },
    {
      key: 'preview',
      label: (
        <span className="flex items-center gap-2">
          <EyeOutlined />
          <span>Preview</span>
        </span>
      ),
      children: (
        <div 
          className="p-6 h-full overflow-y-auto bg-white -mx-4" // Added negative margin
          style={{ minHeight: 'calc(100vh - 200px)' }}
        >
          <div className="prose max-w-none">
            <ReactMarkdown>
              {content || '*No content to preview*'}
            </ReactMarkdown>
          </div>
        </div>
      )
    },
    {
      key: 'history',
      label: (
        <span className="flex items-center gap-2">
          <HistoryOutlined />
          <span>History</span>
        </span>
      ),
      children: (
        <div className="h-full bg-gray-50 -mx-4"> {/* Added negative margin */}
          <div className="p-4 bg-white border-b flex items-center justify-between">
            <div>
              <Title level={5} className="mb-1">File History</Title>
              <Text type="secondary" className="text-xs">
                {versions.length} version{versions.length !== 1 ? 's' : ''} available
              </Text>
            </div>
            <Space>
              {versions.length > 0 && (
                <Button 
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={clearHistory}
                >
                  Clear History
                </Button>
              )}
            </Space>
          </div>

          <div style={{ minHeight: 'calc(100vh - 250px)' }} className="p-4">
            {historyLoading ? (
              <div className="flex justify-center items-center h-32">
                <Spin size="large" />
              </div>
            ) : versions.length > 0 ? (
              <List
                dataSource={versions}
                renderItem={(version, index) => (
                  <List.Item>
                    <Card
                      size="small"
                      className="w-full"
                      actions={[
                        <Button
                          type="link"
                          size="small"
                          onClick={() => {
                            setSelectedVersion(version);
                            setIsModalVisible(true);
                          }}
                        >
                          View Details
                        </Button>,
                        <Button
                          type="link"
                          size="small"
                          icon={<RotateLeftOutlined />}
                          onClick={() => restoreVersion(version)}
                        >
                          Restore
                        </Button>
                      ]}
                    >
                      <Card.Meta
                        avatar={<UserOutlined />}
                        title={
                          <Space>
                            <span>{version.user_name || 'Unknown'}</span>
                            {index === 0 && (
                              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                                Latest
                              </span>
                            )}
                          </Space>
                        }
                        description={
                          <div className="text-xs space-y-1">
                            <div className="flex items-center space-x-1">
                              <ClockCircleOutlined />
                              <span>{new Date(version.created_at).toLocaleString()}</span>
                            </div>
                            <div>{version.content.length} characters</div>
                          </div>
                        }
                      />
                    </Card>
                  </List.Item>
                )}
              />
            ) : (
              <Empty
                image={<HistoryOutlined style={{ fontSize: 48, color: '#999' }} />}
                description={
                  <div>
                    <Title level={5}>No History Available</Title>
                    <Text type="secondary">
                      No previous versions found for this file.<br />
                      Versions are created automatically when you save changes.
                    </Text>
                  </div>
                }
              />
            )}
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center space-x-4">
          <Title level={4} className="mb-0">
            {file.file_name || file.filename || 'Untitled'}
            {(file.file_type === 'docx' || file.type === 'docx' || (file.file_name && file.file_name.endsWith('.docx'))) && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                DOCX → Markdown
              </span>
            )}
          </Title>
          {hasUnsavedChanges && (
            <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">
              Unsaved changes
            </span>
          )}
          {lastSaved && (
            <Text type="secondary" className="text-xs flex items-center space-x-1">
              <ClockCircleOutlined />
              <span>Saved {lastSaved.toLocaleTimeString()}</span>
            </Text>
          )}
        </div>

        <Space>
          <Dropdown
            menu={{ items: exportMenuItems }}
            placement="bottomRight"
          >
            <Button icon={<DownloadOutlined />}>
              Export
            </Button>
          </Dropdown>

          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={saveFile}
            disabled={!hasUnsavedChanges}
          >
            Save
          </Button>
        </Space>
      </div>

      {/* Editor Tabs */}
      <div className="flex-1 overflow-hidden">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          className="h-full px-4" // Add padding here
          style={{ 
            height: '100%',
          }}
        />
      </div>

      {/* Version Details Modal */}
      <Modal
        title="Version Details"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            Close
          </Button>,
          selectedVersion && (
            <Button
              key="restore"
              type="primary"
              icon={<RotateLeftOutlined />}
              onClick={() => restoreVersion(selectedVersion)}
            >
              Restore Version
            </Button>
          )
        ]}
        width={800}
      >
        {selectedVersion && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-3 rounded">
              <Text strong>Created:</Text> {new Date(selectedVersion.created_at).toLocaleString()}<br />
              <Text strong>Author:</Text> {selectedVersion.user_name}<br />
              <Text strong>Size:</Text> {selectedVersion.content.length} characters
            </div>
            
            <div>
              <Title level={5}>Content Preview:</Title>
              <TextArea
                value={selectedVersion.content || 'Empty file'}
                readOnly
                rows={10}
                style={{ fontFamily: 'monospace' }}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MarkdownEditor;