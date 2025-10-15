import { apiRequest, BASE_URL } from "../utils/api";

const AI_WORKSHOP_BASE_URL = `${BASE_URL}/api/ai-workshop`;

// --- Workspace API ---
export const getWorkspaces = async () => {
  return apiRequest('GET', `${AI_WORKSHOP_BASE_URL}/workspaces/`, null, true);
};

export const createWorkspace = async (data) => {
  return apiRequest('POST', `${AI_WORKSHOP_BASE_URL}/workspaces/`, data, true);
};

export const getWorkspaceDetail = async (workspaceId) => {
  return apiRequest('GET', `${AI_WORKSHOP_BASE_URL}/workspaces/${workspaceId}/`, null, true);
};

export const updateWorkspace = async (workspaceId, data) => {
  return apiRequest('PUT', `${AI_WORKSHOP_BASE_URL}/workspaces/${workspaceId}/`, data, true);
};

export const deleteWorkspace = async (workspaceId) => {
  return apiRequest('DELETE', `${AI_WORKSHOP_BASE_URL}/workspaces/${workspaceId}/`, null, true);
};

// --- File API ---
export const getFiles = async (workspaceId) => {
  return apiRequest('GET', `${AI_WORKSHOP_BASE_URL}/workspaces/${workspaceId}/files/`, null, true);
};

export const createFile = async (workspaceId, data) => {
  return apiRequest('POST', `${AI_WORKSHOP_BASE_URL}/workspaces/${workspaceId}/files/`, data, true);
};

export const getFileDetail = async (fileId) => {
  return apiRequest('GET', `${AI_WORKSHOP_BASE_URL}/files/${fileId}/`, null, true);
};

export const updateFile = async (fileId, data) => {
  return apiRequest('PUT', `${AI_WORKSHOP_BASE_URL}/files/${fileId}/`, data, true);
};

export const deleteFile = async (fileId) => {
  return apiRequest('DELETE', `${AI_WORKSHOP_BASE_URL}/files/${fileId}/`, null, true);
};

export const uploadFile = async (workspaceId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return apiRequest('POST', `${AI_WORKSHOP_BASE_URL}/workspaces/${workspaceId}/upload/`, formData, true, true);
};

// --- File Version API ---
export const getFileVersions = async (fileId) => {
  return apiRequest('GET', `${AI_WORKSHOP_BASE_URL}/files/${fileId}/versions/`, null, true);
};

export const createFileVersion = async (fileId, data) => {
  return apiRequest('POST', `${AI_WORKSHOP_BASE_URL}/files/${fileId}/versions/`, data, true);
};

export const getFileVersionDetail = async (versionId) => {
  return apiRequest('GET', `${AI_WORKSHOP_BASE_URL}/file-versions/${versionId}/`, null, true);
};

export const restoreFileVersion = async (versionId) => {
  // This might be handled by updating the main file content
  // For now, assuming the backend handles restoration via file update
  return apiRequest('POST', `${AI_WORKSHOP_BASE_URL}/file-versions/${versionId}/restore/`, null, true);
};

// --- Chat Message API ---
export const getChatMessages = async (workspaceId) => {
  return apiRequest('GET', `${AI_WORKSHOP_BASE_URL}/workspaces/${workspaceId}/chat/`, null, true);
};

export const createChatMessage = async (workspaceId, data) => {
  return apiRequest('POST', `${AI_WORKSHOP_BASE_URL}/workspaces/${workspaceId}/chat/`, data, true);
};

export const getChatMessageDetail = async (messageId) => {
  return apiRequest('GET', `${AI_WORKSHOP_BASE_URL}/chat-messages/${messageId}/`, null, true);
};

export const deleteChatMessage = async (messageId) => {
  return apiRequest('DELETE', `${AI_WORKSHOP_BASE_URL}/chat-messages/${messageId}/`, null, true);
};

// --- Collaborator API ---
export const getCollaborators = async (workspaceId) => {
  return apiRequest('GET', `${AI_WORKSHOP_BASE_URL}/workspaces/${workspaceId}/collaborators/`, null, true);
};

export const addCollaborator = async (workspaceId, data) => {
  return apiRequest('POST', `${AI_WORKSHOP_BASE_URL}/workspaces/${workspaceId}/collaborators/`, data, true);
};

export const updateCollaborator = async (collaboratorId, data) => {
  return apiRequest('PUT', `${AI_WORKSHOP_BASE_URL}/collaborators/${collaboratorId}/`, data, true);
};

export const removeCollaborator = async (collaboratorId) => {
  return apiRequest('DELETE', `${AI_WORKSHOP_BASE_URL}/collaborators/${collaboratorId}/`, null, true);
};

// --- AI Chat API ---
export const aiChatWithWorkspace = async (workspaceId, data) => {
  return apiRequest('POST', `${AI_WORKSHOP_BASE_URL}/workspaces/${workspaceId}/ai-chat/`, data, true);
};

export const getAiWorkspaceStatus = async (workspaceId) => {
  return apiRequest('GET', `${AI_WORKSHOP_BASE_URL}/workspaces/${workspaceId}/ai-status/`, null, true);
};