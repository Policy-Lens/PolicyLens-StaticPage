import React, { useState, useEffect, useContext, useRef } from "react";
import { 
  message, 
  Button, 
  Input, 
  Modal, 
  Select, 
  Tabs, 
  Card, 
  Avatar, 
  Upload, 
  Progress, 
  Spin, 
  Dropdown, 
  Popconfirm 
} from "antd";
import { useParams } from "react-router-dom";
import { apiRequest } from "../../utils/api";
import { AuthContext } from "../../AuthContext";
import { ProjectContext } from "../../Context/ProjectContext";
import {
  getWorkspaces as apiGetWorkspaces,
  createWorkspace as apiCreateWorkspace,
  deleteWorkspace as apiDeleteWorkspace,
  deleteFile as apiDeleteFile,
  createFile as apiCreateFile,
  getFiles as apiGetFiles,
  getFileDetail as apiGetFileDetail,
  updateFile as apiUpdateFile,
  getFileVersions as apiGetFileVersions
} from "../../utils/aiWorkshopApi";
import ReactMarkdown from "react-markdown";
import { 
  FolderPlus, 
  FileText, 
  Plus, 
  Search, 
  MoreVertical, 
  Edit, 
  Trash, 
  Users, 
  Upload as UploadIcon, 
  Download,
  Save,
  Eye,
  History,
  Settings,
  Bot,
  Send,
  X,
  Share,
  Clock,
  GitBranch,
  GripVertical,
  RotateCcw
} from "lucide-react";

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

// Helper functions
const generateTemplateMarkdown = async (template) => {
  console.log('Generating markdown for template:', template);
  
  // Check if this is a DOCX file that needs conversion
  if (template.file_type && ['docx', 'doc'].includes(template.file_type.toLowerCase())) {
    try {
      console.log('Converting DOCX file to markdown:', template.file_name, 'ID:', template.id);
      // Add timestamp to force fresh content
      const response = await apiRequest('GET', `/api/controlfiles/convert-docx/${template.id}/?t=${Date.now()}`, null, true);
      console.log('Conversion response:', response);
      if (response && response.data && response.data.markdown_content) {
        console.log('Successfully converted DOCX to markdown, content length:', response.data.markdown_content.length);
        return response.data.markdown_content;
      } else {
        console.log('No markdown content in response:', response);
      }
    } catch (error) {
      console.error('Error converting DOCX file:', error);
      // Fall back to basic template info if conversion fails
    }
  }
  
  // For non-DOCX files or if conversion fails, generate basic markdown
  const markdown = `# ${template.regulation_clause_name || template.control_name || template.file_name || 'Untitled Template'}

${template.content || template.file_content || 'No content available.'}`;
  
  console.log('Generated markdown:', markdown);
  return markdown;
};

const getFileTypeFromName = (filename) => {
  if (!filename) return 'markdown';
  const ext = filename.split('.').pop()?.toLowerCase();
  const typeMap = {
    'md': 'markdown',
    'txt': 'text',
    'docx': 'document',
    'pdf': 'document',
    'doc': 'document'
  };
  return typeMap[ext] || 'markdown';
};

// Manage recent files with 3-file limit
const manageRecentFiles = (file, workspaceId) => {
  const recentKey = `recent_files_${workspaceId}`;
  const recentFiles = JSON.parse(localStorage.getItem(recentKey) || "[]");
  
  // Remove if already exists
  const filtered = recentFiles.filter(f => f.id !== file.id);
  
  // Add to beginning
  const updated = [{ ...file, lastAccessed: new Date().toISOString() }, ...filtered];
  
  // Keep only 3 most recent
  const limited = updated.slice(0, 3);
  
  localStorage.setItem(recentKey, JSON.stringify(limited));
  return limited;
};

// Enhanced File Explorer with workspace management
const FileExplorer = ({ 
  selectedWorkspace, 
  onWorkspaceSelect, 
  onFileSelect, 
  selectedFile, 
  templatesData,
  onRefresh 
}) => {
  const [workspaces, setWorkspaces] = useState([]);
  const [files, setFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [newFileName, setNewFileName] = useState("");
  const [showNewWorkspace, setShowNewWorkspace] = useState(false);
  const [showNewFile, setShowNewFile] = useState(false);
  const [showWorkspaceManagement, setShowWorkspaceManagement] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(true);
  const [managedWorkspace, setManagedWorkspace] = useState(null);
  const [collaborators, setCollaborators] = useState([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const { projectid } = useParams();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    syncWorkspaces();
  }, [projectid, user]);

  const syncWorkspaces = async () => {
    setIsLoadingWorkspaces(true);
    const systemWorkspace = {
      id: "policy-templates",
      name: "Policy Templates",
      description: "PolicyLense templates library",
      owner_id: "system",
      created_at: new Date().toISOString(),
      type: "system"
    };

    try {
      // 1. Fetch workspaces from the backend
      const response = await apiGetWorkspaces();
      let backendWorkspaces = response.data.results || [];

      // 2. Get workspaces from localStorage
      const localWorkspaces = JSON.parse(localStorage.getItem(`workspaces_${projectid}`) || "[]");

      // 3. Sync local workspaces to the backend if they don't exist
      const backendWorkspaceNames = new Set(backendWorkspaces.map(ws => ws.name));
      const workspacesToCreate = localWorkspaces.filter(localWs => !backendWorkspaceNames.has(localWs.name));

      if (workspacesToCreate.length > 0) {
        message.info(`Syncing ${workspacesToCreate.length} local workspace(s) with the server...`);
        const creationPromises = workspacesToCreate.map(ws =>
          apiCreateWorkspace({ name: ws.name, description: ws.description })
        );
        const newWorkspacesResponses = await Promise.all(creationPromises);
        const newWorkspaces = newWorkspacesResponses.map(res => res.data);
        backendWorkspaces = [...backendWorkspaces, ...newWorkspaces];
      }

      // 4. Combine and set state
      const allWorkspaces = [systemWorkspace, ...backendWorkspaces];
      setWorkspaces(allWorkspaces);
      saveWorkspacesToStorage(allWorkspaces);

      // 5. Auto-select the first workspace if none is selected
      if (!selectedWorkspace) {
        onWorkspaceSelect(systemWorkspace);
      }
    } catch (error) {
      console.error("Failed to sync workspaces:", error);
      message.error("Could not load workspaces. Using local data as fallback.");
      // Fallback to local storage on API error
      const localWorkspaces = JSON.parse(localStorage.getItem(`workspaces_${projectid}`) || "[]");
      setWorkspaces([systemWorkspace, ...localWorkspaces]);
    } finally {
      setIsLoadingWorkspaces(false);
    }
  };

  const checkIfAnyFileNotSavedFromLocalStorage = () => {
    const localFiles = JSON.parse(localStorage.getItem(`lsfiles`) || "{}");
    const backendFiles = templatesData.map(template => template.id);
    const notSavedFiles = localFiles.filter(file => !backendFiles.includes(file.id));
    return notSavedFiles;
  };

  const saveWorkspacesToStorage = (workspacesList) => {
    const userWorkspaces = workspacesList.filter(ws => ws.type !== "system");
    localStorage.setItem(`workspaces_${projectid}`, JSON.stringify(userWorkspaces));
  };

  useEffect(() => {
    // if (checkIfAnyFileNotSavedFromLocalStorage()) {
    //   message.warning("Some files are not saved. Please save them before leaving.");
    // }
    if (selectedWorkspace) {
      loadWorkspaceFiles();
    }
  }, [selectedWorkspace, templatesData]);

  const loadWorkspaceFiles = async () => {
    if (!selectedWorkspace) return;

    if (selectedWorkspace.id === "policy-templates" && templatesData) {
      setIsLoadingFiles(true);
      try {
        // Convert PolicyLense templates to docpilot file format
        const docpilotFiles = await Promise.all(
          templatesData.map(async (template) => {
            const content = await generateTemplateMarkdown(template);
            console.log(`File ${template.file_name} content length:`, content.length);
            
            // Store content in localStorage for AI access
            const fileKey = `file_content_${template.id}`;
            localStorage.setItem(fileKey, content);
            
            return {
              id: template.id,
              filename: template.file_name || template.control_name || `template-${template.id}.md`,
              content: content,
              file_type: getFileTypeFromName(template.file_name || template.control_name),
              workspace_id: selectedWorkspace.id,
              created_at: template.created_at,
              updated_at: template.updated_at,
              source: "policylense",
              template_data: template
            };
          })
        );
        console.log('All files loaded:', docpilotFiles.length);
        setFiles(docpilotFiles);
      } catch (error) {
        console.error('Error loading workspace files:', error);
        message.error('Error loading files. Please try again.');
      } finally {
        setIsLoadingFiles(false);
      }
    } else {
      // Load user workspace files and sync with backend
      setIsLoadingFiles(true);
      try {
        // Get files from backend
        const response = await apiGetFiles(selectedWorkspace.id);
        const backendFiles = response.data.results || response.data || [];
        
        // Process backend files - handle original_file vs file distinction
        const processedFiles = await Promise.all(
          backendFiles.map(async (fileData) => {
            // Use the .md file content, not the original uploaded file
            const fileToUse = fileData.file;
            
            // Check for unsaved changes in local storage
            const unsavedContent = localStorage.getItem(`unsaved_${fileData.id}`);
            let content = unsavedContent || '';
            
            // If no unsaved content, load from file URL
            if (!content && fileToUse) {
              try {
                const contentResponse = await fetch(fileToUse);
                content = await contentResponse.text();
              } catch (error) {
                console.error(`Error loading content for file ${fileData.filename}:`, error);
              }
            }
            
            return {
              id: fileData.id,
              filename: fileData.filename,
              content: content,
              file_type: fileData.file_type || 'markdown',
              workspace_id: selectedWorkspace.id,
              created_at: fileData.created_at,
              updated_at: fileData.updated_at,
              file_url: fileToUse,
              original_file: fileData.original_file,
              hasUnsavedChanges: !!unsavedContent
            };
          })
        );

        setFiles(processedFiles);
        
        // Save to local storage
        localStorage.setItem(`files_${selectedWorkspace.id}`, JSON.stringify(processedFiles));
        
      } catch (error) {
        console.error('Error loading workspace files:', error);
        message.error('Error loading files. Please try again.');
        
        // Fallback to local storage
        const savedFiles = JSON.parse(localStorage.getItem(`files_${selectedWorkspace.id}`) || "[]");
        setFiles(savedFiles);
      } finally {
        setIsLoadingFiles(false);
      }
    }
  };


  const createWorkspace = async () => {
    if (!newWorkspaceName.trim()) {
      return message.error("Please enter a workspace name");
    }

    try {
      const response = await apiCreateWorkspace({
        name: newWorkspaceName,
        description: `Workspace created on ${new Date().toLocaleDateString()}`,
      });
      const newWorkspace = response.data;

      const updatedWorkspaces = [...workspaces, newWorkspace];
      setWorkspaces(updatedWorkspaces);
      saveWorkspacesToStorage(updatedWorkspaces);

      setNewWorkspaceName("");
      setShowNewWorkspace(false);
      onWorkspaceSelect(newWorkspace);
      message.success(`Workspace "${newWorkspaceName}" created successfully`);
    } catch (error) {
      console.error("Failed to create workspace:", error);
      message.error("Failed to create workspace. Please try again.");
    }
  };

  const deleteWorkspace = async (workspaceId) => {
    if (workspaceId === "policy-templates") {
      return message.error("Cannot delete system workspace");
    }

    try {
      await apiDeleteWorkspace(workspaceId);

      const updatedWorkspaces = workspaces.filter(ws => ws.id !== workspaceId);
      setWorkspaces(updatedWorkspaces);
      saveWorkspacesToStorage(updatedWorkspaces);

      // Clear workspace files from local storage
      localStorage.removeItem(`files_${workspaceId}`);

      if (selectedWorkspace?.id === workspaceId) {
        onWorkspaceSelect(workspaces.find(ws => ws.type === 'system'));
      }

      message.success("Workspace deleted successfully");
    } catch (error) {
      console.error("Failed to delete workspace:", error);
      message.error("Failed to delete workspace. Please try again.");
    }
  };

  const createFile = async () => {
    if (!newFileName.trim()) {
      message.error("Please enter a file name");
      return;
    }

    if (!selectedWorkspace) {
      message.error("Please select a workspace first");
      return;
    }

    if (selectedWorkspace.type === "system") {
      message.error("Cannot create files in system workspace");
      return;
    }

    const filename = newFileName.includes('.') ? newFileName : `${newFileName}.md`;
    const fileData = {
      filename,
      content: `# ${newFileName.replace(/\.md$/, '')}\n\nStart writing your document here.`,
      file_type: getFileTypeFromName(filename),
    };

    try {
      const response = await apiCreateFile(selectedWorkspace.id, fileData);
      const newFile = response.data;

      const updatedFiles = [...files, newFile];
      setFiles(updatedFiles);
      localStorage.setItem(`files_${selectedWorkspace.id}`, JSON.stringify(updatedFiles));
      
      setNewFileName("");
      setShowNewFile(false);
      onFileSelect(newFile);
      message.success(`File "${filename}" created successfully`);
    } catch (error) {
      console.error("Failed to create file:", error);
      const errorMessage = error.data?.filename?.[0] || "Failed to create file. Please try again.";
      message.error(errorMessage);
    }
  };

  const deleteFile = async (fileId) => {
    if (selectedWorkspace?.type === "system") {
      message.error("Cannot delete files from system workspace");
      return;
    }

    try {
      await apiDeleteFile(fileId);

      const updatedFiles = files.filter(f => f.id !== fileId);
      setFiles(updatedFiles);
      localStorage.setItem(`files_${selectedWorkspace.id}`, JSON.stringify(updatedFiles));
      
      if (selectedFile?.id === fileId) {
        onFileSelect(null);
      }

      message.success("File deleted successfully");
    } catch (error) {
      console.error("Failed to delete file:", error);
      message.error("Failed to delete file. Please try again.");
    }
  };

  const handleFileUpload = async ({ file, onSuccess, onError, onProgress }) => {
    if (!selectedWorkspace) {
      message.error("Please select a workspace first");
      onError(new Error("No workspace selected"));
      return;
    }

    if (selectedWorkspace.type === "system") {
      message.error("Cannot upload files to system workspace");
      onError(new Error("Cannot upload to system workspace"));
      return;
    }

    setIsUploading(true);

    const data = new FormData();

    data.append('file', file);
    data.append('filename', file.name);
    console.log(selectedWorkspace)
    const response = await apiCreateFile(selectedWorkspace.id,data)
    if(response.status !== 201){
      message.error("Failed to upload file. Please try again.");
      onError(new Error("Failed to upload file"));
      return;
    }
    const currfile = response.data
    const content = await fetch(currfile.file).then(res => res.text());
    console.log(currfile)
    // Simulate file upload with progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      onProgress({ percent: progress });
      
      if (progress >= 100) {
        clearInterval(interval);
        
        // Create file from upload
        const reader = new FileReader();
        reader.onload = (e) => {
          // loading content from file url received in response
          const newFile = {
            id: currfile.id,
            filename: currfile.filename,
            content: typeof content === 'string' ? content : "Uploaded file content",
            file_type: getFileTypeFromName(currfile.file_type),
            workspace_id: selectedWorkspace.id,
            created_at: new Date(currfile.created_at).toISOString(),
            updated_at: new Date(currfile.updated_at).toISOString(),
            created_by: user?.id || 'default'
          };

          const updatedFiles = [...files, newFile];
          setFiles(updatedFiles);
          localStorage.setItem(`files_${selectedWorkspace.id}`, JSON.stringify(updatedFiles));
          
          setIsUploading(false);
          setUploadProgress(0);
          onSuccess();
          message.success(`File "${file.name}" uploaded successfully`);
        };
        
        reader.readAsText(file);
      }
    }, 200);
  };

  const filteredFiles = files.filter(file =>
    file.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const workspaceMenuItems = (workspace) => {
    const items = [
      {
      key: 'manage',
      icon: <Settings size={16} />,
      label: 'Manage Workspace',
      onClick: () => {
        setManagedWorkspace(workspace);
        setShowWorkspaceManagement(true);
      },
    }];

    if (workspace.type !== 'system') {
      items.push({
        key: 'delete',
        icon: <Trash size={16} />,
        danger: true,
        label: <Popconfirm title={`Delete "${workspace.name}"?`} description="This action cannot be undone." onConfirm={() => deleteWorkspace(workspace.id)} okText="Yes" cancelText="No">Delete</Popconfirm>,
      });
    }

    return items;
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg ">AI Document Workshop</h2>
          <Button 
            type="primary" 
            icon={<Plus size={16} />}
            onClick={() => setShowNewWorkspace(true)}
            size="small"
          >
            New Workspace
          </Button>
        </div>

        {/* Workspace Selection */}
        <Select
          className="w-full mb-4"
          placeholder="Select a Workspace"
          value={selectedWorkspace?.id || undefined}
          onChange={(value) => {
            const workspace = workspaces.find(ws => ws.id === value);
            onWorkspaceSelect(workspace || null);
          }}
          loading={isLoadingWorkspaces}
          dropdownRender={(menu) => (
            <div>
              {menu}
              <div className="border-t mt-2 pt-2">
                <Button 
                  type="text" 
                  icon={<Plus size={16} />}
                  onClick={() => setShowNewWorkspace(true)}
                  className="w-full text-left"
                >
                  Create New Workspace
                </Button>
              </div>
            </div>
          )}
        >
          {workspaces.map((ws) => (
            <Option key={ws.id} value={ws.id}>
              <div className="flex items-center justify-between">
                <span>{ws.name}</span>
                {ws.type !== "system" && (
                  <Dropdown 
                    menu={{ items: workspaceMenuItems(ws) }}
                    trigger={['click']}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical size={14} className="text-gray-400 hover:text-gray-600" />
                  </Dropdown>
                )}
              </div>
            </Option>
          ))}
        </Select>

        {/* Search */}
        <Input
          placeholder="Search files and content..."
          prefix={<Search size={16} />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4"
        />

        {/* File Operations */}
        {selectedWorkspace && (
          <div className="space-y-2">
            {selectedWorkspace.type !== "system" && (
              <>
                <Button
                  className="w-full"
                  icon={<FileText size={16} />}
                  onClick={() => setShowNewFile(true)}
                >
                  New File
                </Button>
                
                <Upload
                  customRequest={handleFileUpload}
                  showUploadList={false}
                  accept=".md,.txt,.doc,.docx"
                >
                  <Button 
                    className="w-full"
                    icon={<UploadIcon size={16} />}
                    loading={isUploading}
                  >
                    Upload File
                  </Button>
                </Upload>
                
                {isUploading && (
                  <Progress percent={uploadProgress} size="small" />
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Files List */}
      <div className="flex-1 overflow-y-auto p-4" style={{ minHeight: '300px' }}>
        {selectedWorkspace && (
          <>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-sm text-gray-600">
                Files in {selectedWorkspace.name}
              </h3>
              <span className="text-xs text-gray-400">
                {filteredFiles.length} files
              </span>
            </div>
            
            {isLoadingFiles ? (
              <div className="flex items-center justify-center py-8">
                <Spin size="large" />
                <span className="ml-2 text-gray-500">Loading documents...</span>
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? "No files match your search" : "No files found"}
                {selectedWorkspace.type !== "system" && !searchTerm && (
                  <div className="mt-2">
                    <Button 
                      type="link" 
                      icon={<Plus size={16} />}
                      onClick={() => setShowNewFile(true)}
                    >
                      Create your first file
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2 overflow-y-auto pr-2">
                {filteredFiles.map((file) => (
                  <div
                    key={file.id}
                    onClick={() => {
                      manageRecentFiles(file, selectedWorkspace.id);
                      onFileSelect(file);
                    }}
                    className={`p-3 rounded-lg cursor-pointer border transition-all hover:shadow-sm ${
                      selectedFile?.id === file.id 
                        ? 'bg-blue-50 border-blue-200 shadow-sm'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <FileText size={16} className="flex-shrink-0 text-gray-400" />
                          <span className="font-medium text-sm truncate ">
                            {file.filename}
                          </span>
                        </div>
                        <div className="text-xs mt-1 text-gray-500">
                          {new Date(file.updated_at).toLocaleDateString()}
                        </div>
                      </div>
                      
                      {selectedWorkspace.type !== "system" && (
                        <Dropdown 
                          menu={{
                            items: [
                              {
                                key: 'delete',
                                icon: <Trash size={14} />,
                                label: 'Delete',
                                danger: true,
                                onClick: (e) => {
                                  e.domEvent.stopPropagation();
                                  Popconfirm.confirm({
                                    title: `Delete "${file.filename}"?`,
                                    content: "This action cannot be undone.",
                                    onConfirm: () => deleteFile(file.id),
                                  });
                                }
                              }
                            ]
                          }}
                          trigger={['click']}
                        >
                          <MoreVertical 
                            size={14} 
                            className="text-gray-400 hover:text-gray-600"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </Dropdown>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <Modal
        title="Create New Workspace"
        open={showNewWorkspace}
        onOk={createWorkspace}
        onCancel={() => {
          setShowNewWorkspace(false);
          setNewWorkspaceName("");
        }}
        okText="Create"
      >
        <Input
          placeholder="Workspace name"
          value={newWorkspaceName}
          onChange={(e) => setNewWorkspaceName(e.target.value)}
          onPressEnter={createWorkspace}
        />
      </Modal>

      <Modal
        title="Create New File"
        open={showNewFile}
        onOk={createFile}
        onCancel={() => {
          setShowNewFile(false);
          setNewFileName("");
        }}
        okText="Create"
      >
        <Input
          placeholder="File name (e.g., document.md)"
          value={newFileName}
          onChange={(e) => setNewFileName(e.target.value)}
          onPressEnter={createFile}
        />
      </Modal>

      <Modal
        title={`Manage Workspace: ${managedWorkspace?.name}`}
        open={showWorkspaceManagement}
        onCancel={() => {
          setShowWorkspaceManagement(false);
          setManagedWorkspace(null);
        }}
        footer={null}
        width={600}
      >
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Workspace Details</h4>
            <p><strong>Created:</strong> {managedWorkspace && new Date(managedWorkspace.created_at).toLocaleDateString()}</p>
            <p><strong>Type:</strong> {managedWorkspace?.type}</p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Collaborators</h4>
            <p className="text-gray-500">Collaboration features coming soon...</p>
          </div>
        </div>
      </Modal>
    </div>
  )
};

// Enhanced Markdown Editor with version history and collaboration
const MarkdownEditor = ({ file, onFileUpdate, selectedWorkspace }) => {
  const [content, setContent] = useState("");
  const [originalContent, setOriginalContent] = useState("");
  const [activeTab, setActiveTab] = useState("edit");
  const [lastSaved, setLastSaved] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [fileVersions, setFileVersions] = useState([]);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState(null);
  const [showVersionPreview, setShowVersionPreview] = useState(false);
  const [versionPreviewContent, setVersionPreviewContent] = useState("");
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);
  const { user } = useContext(AuthContext);

  const loadVersionHistory = async () => {
    if (!file?.id) return;
    
    setIsLoadingVersions(true);
    try {
      const response = await apiGetFileVersions(file.id);
      console.log(response)
      const versions = response.data.results || [];
      
      // Sort by version_number descending (latest first)
      // const sortedVersions = versions.sort((a, b) => b.version_number - a.version_number);
      
      setFileVersions(versions);
      setShowVersionHistory(true);
    } catch (error) {
      console.error('Error loading version history:', error);
      message.error('Failed to load version history');
      setFileVersions([]);
    } finally {
      setIsLoadingVersions(false);
    }
  };

  useEffect(() => {
    if (file) {
      console.log('MarkdownEditor received file:', file.filename, 'content length:', file.content?.length || 0);
      
      // Check for unsaved changes in local storage
      const unsavedContent = localStorage.getItem(`unsaved_${file.id}`);
      
      // If there's unsaved content, compare it with the actual file content
      if (unsavedContent) {
        if (unsavedContent === file.content) {
          // Unsaved content is the same as saved content, remove it
          console.log('Unsaved content matches saved content, removing from local storage');
          localStorage.removeItem(`unsaved_${file.id}`);
          
          // Also update the file in workspace storage to remove unsaved flag
          if (selectedWorkspace) {
            const savedFiles = JSON.parse(localStorage.getItem(`files_${selectedWorkspace.id}`) || "[]");
            const updatedFiles = savedFiles.map(f => 
              f.id === file.id 
                ? { ...f, hasUnsavedChanges: false }
                : f
            );
            localStorage.setItem(`files_${selectedWorkspace.id}`, JSON.stringify(updatedFiles));
          }
          
          setContent(file.content || "");
          setOriginalContent(file.content || "");
          setHasUnsavedChanges(false);
        } else {
          // Unsaved content is different, use it
          console.log('Loaded unsaved changes from local storage');
          setContent(unsavedContent);
          setOriginalContent(file.content || "");
          setHasUnsavedChanges(true);
        }
      } else {
        // No unsaved content, use file content
        setContent(file.content || "");
        setOriginalContent(file.content || "");
        setHasUnsavedChanges(false);
      }
      
      loadFileVersions();
    }
  }, [file, selectedWorkspace]);

  const loadFileVersions = () => {
    if (!file) return;
    
    const versions = JSON.parse(localStorage.getItem(`versions_${file.id}`) || "[]");
    setFileVersions(versions);
  };

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    setHasUnsavedChanges(newContent !== originalContent);

    // Clear existing timeout
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    // Auto-save to local storage only (not to database)
    const timeout = setTimeout(() => {
      autoSaveToLocalStorage(newContent);
    }, 3000); // Auto-save every 3 seconds to local storage
    
    setAutoSaveTimeout(timeout);
  };

  const autoSaveToLocalStorage = (contentToSave) => {
    if (!file || !selectedWorkspace) return;

    // Check if content is different from original (saved) content
    const isActuallyUnsaved = contentToSave !== originalContent;

    // Update file in local workspace storage
    const savedFiles = JSON.parse(localStorage.getItem(`files_${selectedWorkspace.id}`) || "[]");
    const updatedFiles = savedFiles.map(f => 
      f.id === file.id 
        ? { ...f, content: contentToSave, hasUnsavedChanges: isActuallyUnsaved, lastAutoSaved: new Date().toISOString() }
        : f
    );
    localStorage.setItem(`files_${selectedWorkspace.id}`, JSON.stringify(updatedFiles));

    // Save or remove unsaved content based on whether it differs from original
    if (isActuallyUnsaved) {
      localStorage.setItem(`unsaved_${file.id}`, contentToSave);
    } else {
      localStorage.removeItem(`unsaved_${file.id}`);
    }

    setLastSaved(new Date());
    console.log('Auto-saved to local storage');
  };

  const createNewVersion = (newContent) => {
    const newVersion = {
      id: Date.now(),
      version_number: `1.${fileVersions.length + 1}`,
      created_at: new Date().toISOString(),
      author: user?.username || 'Current User',
      changes: 'Auto-saved changes',
      content: newContent
    };
    
    const updatedVersions = [newVersion, ...fileVersions];
    setFileVersions(updatedVersions);
    
    // Save to localStorage
    if (file?.id) {
      localStorage.setItem(`versions_${file.id}`, JSON.stringify(updatedVersions));
    }
  };

  const saveFile = async (contentToSave = content) => {
    if (!file || !selectedWorkspace) return;

    // Clear auto-save timeout
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
      setAutoSaveTimeout(null);
    }

    // Don't save system files to database
    if (selectedWorkspace.type === "system") {
      message.info("System files cannot be saved to database");
      return;
    }

    try {
      // Create version if content has changed significantly
      if (contentToSave !== originalContent) {
        createVersion(originalContent);
      }

      //Convert content to .md file and send the data as formdata with file Update file in database via API 
      const updateData = {
        content: contentToSave,
        filename: file.filename
      };

      const formdata = new FormData()
      formdata.append('file', new Blob([contentToSave], { type: 'text/markdown' }))
      const response = await apiUpdateFile(file.id, formdata)
      
      if (response.status === 200) {
        const updatedFile = {
          ...file,
          content: contentToSave,
          updated_at: new Date().toISOString(),
          hasUnsavedChanges: false
        };

        // Update file in local workspace storage
        const savedFiles = JSON.parse(localStorage.getItem(`files_${selectedWorkspace.id}`) || "[]");
        const updatedFiles = savedFiles.map(f => f.id === file.id ? updatedFile : f);
        localStorage.setItem(`files_${selectedWorkspace.id}`, JSON.stringify(updatedFiles));

        // Clear unsaved changes from local storage
        localStorage.removeItem(`unsaved_${file.id}`);

        setOriginalContent(contentToSave);
        setHasUnsavedChanges(false);
        setLastSaved(new Date());
        onFileUpdate(updatedFile);
        
        message.success("File saved to database successfully");
      } else {
        throw new Error('Failed to save file');
      }
    } catch (error) {
      console.error('Error saving file:', error);
      message.error("Failed to save file to database. Changes saved locally.");
      
      // Fallback: save to local storage only
      const updatedFile = {
        ...file,
        content: contentToSave,
        updated_at: new Date().toISOString(),
        hasUnsavedChanges: true
      };

      const savedFiles = JSON.parse(localStorage.getItem(`files_${selectedWorkspace.id}`) || "[]");
      const updatedFiles = savedFiles.map(f => f.id === file.id ? updatedFile : f);
      localStorage.setItem(`files_${selectedWorkspace.id}`, JSON.stringify(updatedFiles));
      
      localStorage.setItem(`unsaved_${file.id}`, contentToSave);
      onFileUpdate(updatedFile);
    }
  };

  const createVersion = (previousContent) => {
    if (!file || !previousContent) return;

    const versions = JSON.parse(localStorage.getItem(`versions_${file.id}`) || "[]");
    const newVersion = {
      id: `version-${Date.now()}`,
      content: previousContent,
      created_at: new Date().toISOString(),
      created_by: user?.id || 'default',
      version_number: versions.length + 1
    };

    const updatedVersions = [newVersion, ...versions].slice(0, 10); // Keep last 10 versions
    localStorage.setItem(`versions_${file.id}`, JSON.stringify(updatedVersions));
    setFileVersions(updatedVersions);
  };

  const viewVersionContent = async (version) => {
    if (!version || !version.version_file) return;
    
    try {
      // Fetch the version file content
      const response = await fetch(version.version_file);
      const content = await response.text();
      
      setVersionPreviewContent(content);
      setSelectedVersion(version);
      setShowVersionPreview(true);
    } catch (error) {
      console.error('Error loading version content:', error);
      message.error('Failed to load version content');
    }
  };

  const revertToVersion = async (version) => {
    if (!version || !version.version_file) return;
    
    try {
      // Fetch the version file content
      const response = await fetch(version.version_file);
      const versionContent = await response.text();
      
      // Simply set the content - this will be compared with originalContent
      setContent(versionContent);
      
      // Check if this version matches the saved content (originalContent)
      const isUnsaved = versionContent !== originalContent;
      setHasUnsavedChanges(isUnsaved);
      
      // Update local storage
      if (selectedWorkspace) {
        const savedFiles = JSON.parse(localStorage.getItem(`files_${selectedWorkspace.id}`) || "[]");
        const updatedFiles = savedFiles.map(f => 
          f.id === file.id 
            ? { ...f, content: versionContent, hasUnsavedChanges: isUnsaved, lastAutoSaved: isUnsaved ? new Date().toISOString() : undefined }
            : f
        );
        localStorage.setItem(`files_${selectedWorkspace.id}`, JSON.stringify(updatedFiles));
        
        // Handle unsaved content in local storage
        if (isUnsaved) {
          localStorage.setItem(`unsaved_${file.id}`, versionContent);
        } else {
          localStorage.removeItem(`unsaved_${file.id}`);
        }
      }
      
      // Close all modals
      setShowVersionPreview(false);
      setShowVersionHistory(false);
      setSelectedVersion(null);
      setVersionPreviewContent("");
      
      // Show appropriate message
      if (isUnsaved) {
        message.success({
          content: `File content reverted to version ${version.version_number}. Don't forget to save!`,
          duration: 5
        });
      } else {
        message.success({
          content: `File content reverted to version ${version.version_number} (current saved version)`,
          duration: 3
        });
      }
      
    } catch (error) {
      console.error('Error reverting to version:', error);
      message.error('Failed to revert to this version');
    }
  };

  const restoreVersion = (version) => {
    if (!version) return;
    
    setContent(version.content);
    setSelectedVersion(null);
    setShowVersionHistory(false);
    message.success(`Restored to version ${version.version_number}`);
  };

  const exportFile = (format) => {
    if (!file || !content) return;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    message.success(`File exported as ${format}`);
  };

  if (!file) {
    return (
      <div className="h-full flex items-center justify-center border-r bg-gray-50 border-gray-200">
        <div className="text-center text-gray-500">
          <FileText size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium ">No file selected</p>
          <p className="">Select a file from the explorer to start editing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col border-r bg-white border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-semibold text-lg ">{file.filename}</h2>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>Last updated: {new Date(file.updated_at).toLocaleString()}</span>
              {lastSaved && (
                <span>Saved: {lastSaved.toLocaleTimeString()}</span>
              )}
              {hasUnsavedChanges && (
                <span className="text-amber-600">• Unsaved changes</span>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              icon={<History size={16} />}
              onClick={() => loadVersionHistory()}
              title="Version History"
              loading={isLoadingVersions}
            >
              History
            </Button>
            <Button
              icon={<Download size={16} />}
              onClick={() => exportFile('md')}
              title="Export File"
            >
              Export
            </Button>
            <Button
              type="primary"
              icon={<Save size={16} />}
              onClick={() => saveFile()}
              disabled={!hasUnsavedChanges}
            >
              Save
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab={<span><Edit size={16} className="mr-1" />Edit</span>} key="edit" />
          <TabPane tab={<span><Eye size={16} className="mr-1" />Preview</span>} key="preview" />
          <TabPane tab={<span><GitBranch size={16} className="mr-1" />Split</span>} key="split" />
        </Tabs>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
        {activeTab === "edit" && (
          <TextArea
            value={content}
            onChange={handleContentChange}
            placeholder="Start writing your markdown here..."
            className="h-full resize-none border-0 rounded-none"
            style={{ 
              fontSize: '14px', 
              fontFamily: 'Monaco, Menlo, monospace',
              lineHeight: '1.6',
              minHeight: '600px'
            }}
          />
        )}
        
        {activeTab === "preview" && (
          <div className="h-full overflow-y-auto p-6 prose prose-sm max-w-none" style={{ height: 'calc(100vh - 200px)' }}>
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )}
        
        {activeTab === "split" && (
          <div className="h-full flex" style={{ height: 'calc(100vh - 200px)' }}>
            <div className="w-1/2 border-r">
              <TextArea
                value={content}
                onChange={handleContentChange}
                placeholder="Start writing your markdown here..."
                className="h-full resize-none border-0 rounded-none"
                style={{ 
                  fontSize: '14px', 
                  fontFamily: 'Monaco, Menlo, monospace',
                  lineHeight: '1.6',
                  minHeight: '800px'
                }}
              />
            </div>
            <div className="w-1/2 overflow-y-auto p-6 prose prose-sm max-w-none">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>

      {/* Version History Modal */}
      <Modal
        title={
          <div className="flex items-center justify-between">
            <span>Version History</span>
            {isLoadingVersions && <Spin size="small" />}
          </div>
        }
        open={showVersionHistory}
        onCancel={() => {
          setShowVersionHistory(false);
          setSelectedVersion(null);
        }}
        width={900}
        footer={null}
      >
        <div className="max-h-96 overflow-y-auto">
          {isLoadingVersions ? (
            <div className="flex items-center justify-center py-8">
              <Spin size="large" />
            </div>
          ) : fileVersions.length === 0 ? (
            <div className="text-center py-8">
              <History size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No version history available</p>
            </div>
          ) : (
            <div className="space-y-2">
              {fileVersions.map((version) => (
                <Card
                  key={version.id}
                  size="small"
                  className="cursor-pointer hover:shadow-md transition-shadow border-gray-200"
                  onClick={() => viewVersionContent(version)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                        <span className="text-blue-600 font-bold text-lg">
                          v{version.version_number}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">
                          Version {version.version_number}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center space-x-2">
                          <Clock size={12} />
                          <span>{new Date(version.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        type="text"
                        icon={<RotateCcw size={16} />}
                        className="text-blue-600 hover:text-blue-700"
                        title="Revert to this version"
                        onClick={(e) => {
                          e.stopPropagation();
                          revertToVersion(version);
                        }}
                      />
                      <Button
                        type="primary"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          viewVersionContent(version);
                        }}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Version Preview Modal */}
      <Modal
        title={`Version ${selectedVersion?.version_number} Preview`}
        open={showVersionPreview}
        onCancel={() => {
          setShowVersionPreview(false);
          setVersionPreviewContent("");
          setSelectedVersion(null);
        }}
        width={1000}
        style={{top:50}}
        footer={
          <div className="flex justify-between">
            <Button onClick={() => {
              setShowVersionPreview(false);
              setVersionPreviewContent("");
              setSelectedVersion(null);
            }}>
              Close
            </Button>
            <div className="space-x-2">
              <Button
                icon={<RotateCcw size={16} />}
                title="Revert to this version"
                onClick={() => {
                  revertToVersion(selectedVersion);
                }}
              >
                Revert to This Version
              </Button>
              <Button
                type="primary"
                icon={<Download size={16} />}
                onClick={() => {
                  const blob = new Blob([versionPreviewContent], { type: 'text/markdown' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `v${selectedVersion?.version_number}_${file.filename}.md`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                  message.success('Version downloaded');
                }}
              >
                Download
              </Button>
            </div>
          </div>
        }
      >
        <div className="rounded-lg overflow-hidden">
          <Tabs defaultActiveKey="preview">
            <TabPane tab={<span className="flex items-center"><Eye size={16} className="mr-1" />Preview</span>} key="preview">
              <div className="p-6 prose prose-sm max-w-none bg-white" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                <ReactMarkdown>{versionPreviewContent}</ReactMarkdown>
              </div>
            </TabPane>
            <TabPane tab={<span className="flex items-center"><FileText size={16} className="mr-1" />Raw</span>} key="raw">
              <div className="p-4 bg-gray-50" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                <pre className="text-sm font-mono whitespace-pre-wrap">{versionPreviewContent}</pre>
              </div>
            </TabPane>
          </Tabs>
          
        </div>
      </Modal>
    </div>
  );
};

// Enhanced AI Chat Sidebar with multiple models and workspace context
const ChatSidebar = ({ workspaceId, activeFile, selectedWorkspace, onDocumentEdit }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedModel, setSelectedModel] = useState("gpt-4o-mini");
  const [isLoading, setIsLoading] = useState(false);
  const [chatMode, setChatMode] = useState("workspace"); // workspace, file, general
  const messagesEndRef = useRef(null);

  const aiModels = [
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini', category: 'OpenAI' },
    { value: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B (Versatile)', category: 'Llama' },
    { value: 'llama-3.1-70b-versatile', label: 'Llama 3.1 70B (Versatile)', category: 'Llama' },
    { value: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B (Instant)', category: 'Llama' },
    { value: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B', category: 'Mixtral' },
    { value: 'gemma2-9b-it', label: 'Gemma 2 9B (Instruct)', category: 'Gemma' }
  ];

  useEffect(() => {
    loadChatHistory();
  }, [workspaceId, chatMode]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatHistory = () => {
    if (!workspaceId) return;
    
    const chatKey = `chat_${workspaceId}_${chatMode}`;
    const savedMessages = JSON.parse(localStorage.getItem(chatKey) || "[]");
    setMessages(savedMessages);
  };

  const saveChatHistory = (newMessages) => {
    if (!workspaceId) return;
    
    const chatKey = `chat_${workspaceId}_${chatMode}`;
    localStorage.setItem(chatKey, JSON.stringify(newMessages));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || isLoading) return;

    const messageToSend = newMessage.trim();
    // Debug logging (can be removed in production)
    console.log('Sending message:', messageToSend);

    const userMessage = {
      id: `msg-${Date.now()}`,
      content: messageToSend,
      is_ai: false,
      created_at: new Date().toISOString(),
      sender: "User"
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setNewMessage("");
    setIsLoading(true);

    try {
      // Call the real AI API
      const context = getContextForAI();
      // Debug logging (can be removed in production)
      console.log('About to call AI API with message:', messageToSend);
      const aiResponse = await callRealAIAPI(messageToSend, context);
      
      // Check if the AI response contains edit commands
      const editResult = await processAIEditCommands(aiResponse, messageToSend);
      
      const aiMessage = {
        id: `msg-${Date.now() + 1}`,
        content: editResult.response,
        is_ai: true,
        created_at: new Date().toISOString(),
        sender: selectedModel,
        model: selectedModel,
        hasEditActions: editResult.hasEditActions,
        editActions: editResult.editActions
      };

      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);
      saveChatHistory(finalMessages);
      
    } catch (error) {
      message.error("Failed to get AI response");
      console.error("AI response error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const processAIEditCommands = async (aiResponse, userMessage) => {
    // Check if the user is asking for document edits
    const editKeywords = ['edit', 'change', 'modify', 'update', 'replace', 'add', 'remove', 'delete', 'insert', 'title', 'heading'];
    const isEditRequest = editKeywords.some(keyword => 
      userMessage.toLowerCase().includes(keyword)
    );

    if (!isEditRequest || !activeFile) {
      return {
        response: aiResponse,
        hasEditActions: false,
        editActions: []
      };
    }

    // Parse the AI response for edit suggestions
    const editActions = parseEditSuggestions(aiResponse, userMessage);
    
    if (editActions.length > 0) {
      // Apply the edits to the document
      const updatedContent = await applyEditsToDocument(activeFile.content, editActions);
      
      // Call the document edit callback
      if (onDocumentEdit && updatedContent !== activeFile.content) {
        onDocumentEdit(updatedContent);
        message.success(`Document updated with ${editActions.length} change(s)`);
      }

      return {
        response: aiResponse + "\n\n✅ **Document has been updated with your requested changes!**",
        hasEditActions: true,
        editActions: editActions
      };
    }

    return {
      response: aiResponse,
      hasEditActions: false,
      editActions: []
    };
  };

  const parseEditSuggestions = (aiResponse, userMessage) => {
    const editActions = [];
    
    // Simple pattern matching for common edit requests
    if (userMessage.toLowerCase().includes('title')) {
      // Extract suggested title from AI response
      const titleMatch = aiResponse.match(/(?:title|heading)[:\s]*["']?([^"'\n]+)["']?/i);
      if (titleMatch) {
        editActions.push({
          type: 'replace_title',
          newTitle: titleMatch[1].trim(),
          description: `Update document title to: ${titleMatch[1].trim()}`
        });
      }
    }

    if (userMessage.toLowerCase().includes('add') || userMessage.toLowerCase().includes('insert')) {
      // Look for content to add
      const addMatch = aiResponse.match(/(?:add|insert)[:\s]*["']?([^"'\n]+)["']?/i);
      if (addMatch) {
        editActions.push({
          type: 'add_content',
          content: addMatch[1].trim(),
          description: `Add content: ${addMatch[1].trim()}`
        });
      }
    }

    if (userMessage.toLowerCase().includes('remove') || userMessage.toLowerCase().includes('delete')) {
      // Look for content to remove
      const removeMatch = aiResponse.match(/(?:remove|delete)[:\s]*["']?([^"'\n]+)["']?/i);
      if (removeMatch) {
        editActions.push({
          type: 'remove_content',
          content: removeMatch[1].trim(),
          description: `Remove content: ${removeMatch[1].trim()}`
        });
      }
    }

    return editActions;
  };

  const applyEditsToDocument = async (currentContent, editActions) => {
    let updatedContent = currentContent;
    
    for (const action of editActions) {
      switch (action.type) {
        case 'replace_title':
          // Replace the first heading (# title) in the document
          updatedContent = updatedContent.replace(/^#\s*.*$/m, `# ${action.newTitle}`);
          break;
          
        case 'add_content':
          // Add content at the end of the document
          updatedContent += `\n\n${action.content}`;
          break;
          
        case 'remove_content':
          // Remove specified content
          updatedContent = updatedContent.replace(new RegExp(action.content, 'gi'), '');
          break;
          
        default:
          break;
      }
    }
    
    return updatedContent;
  };

  const getContextForAI = () => {
    let context = `Workspace: ${selectedWorkspace?.name || 'Unknown'}\n`;
    context += `Workspace Type: ${selectedWorkspace?.workspace_type || 'Unknown'}\n`;
    
    if (chatMode === "file" && activeFile) {
      context += `Current File: ${activeFile.filename}\n`;
      context += `File Type: ${activeFile.file_type || 'Unknown'}\n`;
      
      // Add template metadata if available
      if (activeFile.template_data) {
        const template = activeFile.template_data;
        context += `Template Information:\n`;
        context += `- Control Name: ${template.control_name || 'N/A'}\n`;
        context += `- Regulation Standard: ${template.regulation_standard || 'N/A'}\n`;
        context += `- Regulation Clause: ${template.regulation_clause_no || 'N/A'}\n`;
        context += `- Template ID: ${template.template_id || template.id || 'N/A'}\n`;
      }
      
      // Try to get content from activeFile first
      if (activeFile.content) {
        context += `\nFile Content:\n${activeFile.content.substring(0, 2000)}${activeFile.content.length > 2000 ? '...' : ''}\n`;
      } else {
        // For template files, try to get content from localStorage
        const fileKey = `file_content_${activeFile.id}`;
        const storedContent = localStorage.getItem(fileKey);
        if (storedContent) {
          context += `\nFile Content:\n${storedContent.substring(0, 2000)}${storedContent.length > 2000 ? '...' : ''}\n`;
        } else {
          context += `\nFile Content: Content not available for this template file.\n`;
        }
      }
    } else if (chatMode === "workspace" && workspaceId) {
      const files = JSON.parse(localStorage.getItem(`files_${workspaceId}`) || "[]");
      context += `Workspace Files: ${files.map(f => f.filename).join(', ')}\n`;
    }
    
    return context;
  };

  const callRealAIAPI = async (message, context) => {
    try {
      const requestData = {
        message: message,
        workspace_id: workspaceId,
        file_id: activeFile?.id,
        model: selectedModel,
        conversation_type: chatMode,
        context: context
      };
      
      // Debug logging (can be removed in production)
      console.log('AI API Request Data:', requestData);
      
      const response = await apiRequest('POST', '/api/ai-workshop/chat/', requestData, true);
      
      if (response.data && response.data.success && response.data.data.ai_response) {
        return response.data.data.ai_response.content;
      } else {
        throw new Error('Invalid response from AI API');
      }
    } catch (error) {
      console.error('AI API call failed:', error);
      // Fallback to a helpful message
      return "I apologize, but I'm experiencing technical difficulties. Please try again in a moment.";
    }
  };

  const clearChat = () => {
    setMessages([]);
    if (workspaceId) {
      const chatKey = `chat_${workspaceId}_${chatMode}`;
      localStorage.removeItem(chatKey);
    }
    message.success("Chat history cleared");
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 border-l border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-lg ">AI Assistant</h2>
          <Button 
            size="small" 
            icon={<Trash size={16} />}
            onClick={clearChat}
            title="Clear Chat"
          />
        </div>
        
        {/* Context Info */}
        <div className="mb-3 p-3 rounded text-sm bg-blue-50">
          <div className="mb-1 "><strong>Workspace:</strong> {selectedWorkspace?.name || "None"}</div>
          {activeFile && chatMode === "file" && (
            <div className=""><strong>Active File:</strong> {activeFile.filename}</div>
          )}
        </div>

        {/* Chat Mode */}
        <Select
          className="w-full mb-3"
          value={chatMode}
          onChange={setChatMode}
        >
          <Option value="workspace">Workspace Context</Option>
          <Option value="file" disabled={!activeFile}>Current File Context</Option>
          <Option value="general">General Chat</Option>
        </Select>

        {/* AI Model Selection */}
        <Select
          className="w-full"
          value={selectedModel}
          onChange={setSelectedModel}
          placeholder="Select AI Model"
          optionLabelProp="label"
        >
          {aiModels.map((model) => (
            <Option 
              key={model.value} 
              value={model.value}
              label={model.label}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-medium">{model.label}</span>
                <span className="text-xs text-gray-500 ml-2">{model.category}</span>
              </div>
            </Option>
          ))}
        </Select>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8 text-gray-500">
            <Bot size={48} className="mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2 ">AI Assistant Ready</p>
            <p className="text-sm ">Ask me anything about your documents or workspace!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.is_ai ? "justify-start" : "justify-end"}`}>
              <div className={`max-w-[85%] ${msg.is_ai ? "order-2" : "order-1"}`}>
                <div
                  className={`p-3 rounded-lg ${
                    msg.is_ai
                      ? "bg-white border border-gray-200 text-gray-800"
                      : "bg-blue-500 text-white"
                  }`}
                >
                  <div className="mb-1">
                    <span className="font-medium text-sm">
                      {msg.is_ai ? `AI (${msg.model || msg.sender})` : msg.sender}
                    </span>
                    <span className="text-xs opacity-75 ml-2">
                      {new Date(msg.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
              {msg.is_ai && (
                <Avatar 
                  className="order-1 mr-2 flex-shrink-0"
                  icon={<Bot size={16} />}
                  size="small"
                />
              )}
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <Spin size="small" /> <span className="ml-2">AI is thinking...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onPressEnter={sendMessage}
            placeholder="Ask AI about your documents..."
            disabled={isLoading}
          />
          <Button
            type="primary"
            icon={<Send size={16} />}
            onClick={sendMessage}
            disabled={!newMessage.trim() || isLoading}
          />
        </div>
        <div className="text-xs mt-2 text-center text-gray-500">
          Press Enter to send • Using {selectedModel}
        </div>
      </div>
    </div>
  );
};

// Main AI Document Workshop Component
const AIDocumentWorkshop = ({ templatesData }) => {
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [documentVersions, setDocumentVersions] = useState([]);
  
  // Panel width states with localStorage persistence
  const [leftPanelWidth, setLeftPanelWidth] = useState(() => {
    const saved = localStorage.getItem('ai-workshop-left-panel-width');
    return saved ? parseInt(saved) : 300;
  });
  const [rightPanelWidth, setRightPanelWidth] = useState(() => {
    const saved = localStorage.getItem('ai-workshop-right-panel-width');
    return saved ? parseInt(saved) : 300;
  });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeType, setResizeType] = useState(null);
  
  const { projectid } = useParams();
  const { projectRole } = useContext(ProjectContext);
  const { user } = useContext(AuthContext);

  // Auto-select first file if templates are loaded and no file is selected
  useEffect(() => {
    const autoSelectFirstFile = async () => {
      if (templatesData && templatesData.length > 0 && !selectedFile && selectedWorkspace?.id === "policy-templates") {
        console.log('Auto-selecting first file:', templatesData[0].file_name);
        const content = await generateTemplateMarkdown(templatesData[0]);
        console.log('Auto-selection content length:', content.length);
        
        // Store content in localStorage for AI access
        const fileKey = `file_content_${templatesData[0].id}`;
        localStorage.setItem(fileKey, content);
        
        const firstFile = {
          id: templatesData[0].id,
          filename: templatesData[0].file_name || templatesData[0].control_name || `template-${templatesData[0].id}.md`,
          content: content,
          file_type: getFileTypeFromName(templatesData[0].file_name || templatesData[0].control_name),
          workspace_id: "policy-templates",
          created_at: templatesData[0].created_at,
          updated_at: templatesData[0].updated_at,
          source: "policylense",
          template_data: templatesData[0]
        };
        console.log('Setting selected file:', firstFile);
        setSelectedFile(firstFile);
      }
    };
    
    autoSelectFirstFile();
  }, [templatesData, selectedFile, selectedWorkspace]);

  const handleFileUpdate = (updatedFile) => {
    setSelectedFile(updatedFile);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleDocumentEdit = (newContent) => {
    if (selectedFile) {
      const updatedFile = {
        ...selectedFile,
        content: newContent,
        updated_at: new Date().toISOString()
      };
      handleFileUpdate(updatedFile);
    }
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const resetPanelSizes = () => {
    setLeftPanelWidth(300);
    setRightPanelWidth(300);
    localStorage.setItem('ai-workshop-left-panel-width', '300');
    localStorage.setItem('ai-workshop-right-panel-width', '300');
    message.success('Panel sizes reset to default');
  };

  const clearContentCache = () => {
    // Clear all cached file content
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('file_content_')) {
        localStorage.removeItem(key);
      }
    });
    message.success('Content cache cleared. Refreshing files...');
    // Reload the current workspace files
    if (selectedWorkspace) {
      loadWorkspaceFiles(selectedWorkspace);
    }
  };

  const loadVersionHistory = async (fileId) => {
    try {
      // For now, we'll create mock version history
      // In a real implementation, this would fetch from a backend API
      const versions = [
        {
          id: 1,
          version: '1.0',
          timestamp: new Date().toISOString(),
          author: 'System',
          changes: 'Initial version',
          content: selectedFile?.content || ''
        },
        {
          id: 2,
          version: '1.1',
          timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          author: 'AI Assistant',
          changes: 'Updated by AI Assistant',
          content: selectedFile?.content || ''
        }
      ];
      
      setDocumentVersions(versions);
      setShowVersionHistory(true);
    } catch (error) {
      console.error('Error loading version history:', error);
      message.error('Failed to load version history');
    }
  };

  const restoreVersion = (version) => {
    if (selectedFile) {
      const updatedFile = {
        ...selectedFile,
        content: version.content,
        updated_at: new Date().toISOString()
      };
      setSelectedFile(updatedFile);
      handleFileUpdate(updatedFile);
      message.success(`Restored to version ${version.version}`);
      setShowVersionHistory(false);
    }
  };

  // Resize handlers
  const handleMouseDown = (type) => (e) => {
    setIsResizing(true);
    setResizeType(type);
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isResizing) return;
    
    const containerWidth = window.innerWidth - 200; // Account for sidebar
    const mouseX = e.clientX;
    
    if (resizeType === 'left') {
      const newWidth = Math.max(200, Math.min(600, mouseX - 200));
      setLeftPanelWidth(newWidth);
      localStorage.setItem('ai-workshop-left-panel-width', newWidth.toString());
    } else if (resizeType === 'right') {
      const newWidth = Math.max(200, Math.min(600, containerWidth - mouseX));
      setRightPanelWidth(newWidth);
      localStorage.setItem('ai-workshop-right-panel-width', newWidth.toString());
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
    setResizeType(null);
  };

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, resizeType]);

  return (
    <div className="h-full w-full flex flex-col bg-white">
      {/* Panel Controls */}
      <div className="flex items-center justify-between p-2 border-b bg-gray-50 border-gray-200">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Panel Layout:</span>
          <span className="text-xs text-gray-500">
            Left: {leftPanelWidth}px | Right: {rightPanelWidth}px
          </span>
        </div>
        <Button 
          size="small" 
          onClick={resetPanelSizes}
          title="Reset panel sizes to default"
        >
          Reset Layout
        </Button>
        <Button 
          size="small" 
          onClick={clearContentCache}
          title="Clear content cache and refresh files"
          style={{ marginLeft: '8px' }}
        >
          Clear Cache
        </Button>
      </div>
      
      <div className="flex-1 flex" style={{ height: 'calc(100vh - 160px)' }}>
        {/* File Explorer - Left Panel */}
        <div 
          className="border-r flex-shrink-0 border-gray-200"
          style={{ width: `${leftPanelWidth}px` }}
        >
          <FileExplorer
            selectedWorkspace={selectedWorkspace}
            onWorkspaceSelect={setSelectedWorkspace}
            selectedFile={selectedFile}
            onFileSelect={setSelectedFile}
            templatesData={templatesData}
            onRefresh={handleRefresh}
          />
        </div>
        
        {/* Left Resize Handle */}
        <div
          className="w-2 bg-gray-200 hover:bg-blue-400 cursor-col-resize flex-shrink-0 flex items-center justify-center group transition-colors"
          onMouseDown={handleMouseDown('left')}
          style={{ 
            background: isResizing && resizeType === 'left' ? '#3b82f6' : undefined 
          }}
        >
          <GripVertical size={16} className="text-gray-400 group-hover:text-white" />
        </div>
        
        {/* Markdown Editor - Center Panel */}
        <div className="flex-1 border-r border-gray-200 min-w-0">
          <MarkdownEditor 
            file={selectedFile} 
            onFileUpdate={handleFileUpdate}
            selectedWorkspace={selectedWorkspace}
          />
        </div>
        
        {/* Right Resize Handle */}
        <div
          className="w-2 bg-gray-200 hover:bg-blue-400 cursor-col-resize flex-shrink-0 flex items-center justify-center group transition-colors"
          onMouseDown={handleMouseDown('right')}
          style={{ 
            background: isResizing && resizeType === 'right' ? '#3b82f6' : undefined 
          }}
        >
          <GripVertical size={16} className="text-gray-400 group-hover:text-white" />
        </div>
        
        {/* AI Chat Sidebar - Right Panel */}
        <div 
          className="flex-shrink-0"
          style={{ width: `${rightPanelWidth}px` }}
        >
          <ChatSidebar 
            workspaceId={selectedWorkspace?.id || null} 
            activeFile={selectedFile}
            selectedWorkspace={selectedWorkspace}
            onDocumentEdit={handleDocumentEdit}
          />
        </div>
      </div>
    </div>
  );
};

export default AIDocumentWorkshop;