# AI Document Workshop API Endpoints

This document outlines the RESTful API endpoints for the AI Document Workshop feature. The base URL for all these endpoints is `/api/workshop/`.

## Authentication

All endpoints require a valid JWT token to be included in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

---

## Workspaces

A workspace is a container for files, chat messages, and collaborators.

### `GET /api/workshop/workspaces/`
- **Description**: List all workspaces accessible to the authenticated user.
- **Success Response**: `200 OK` with a list of workspace objects.

### `POST /api/workshop/workspaces/`
- **Description**: Create a new workspace.
- **Body**: `{ "name": "My New Workspace" }`
- **Success Response**: `201 Created` with the new workspace object.

### `GET /api/workshop/workspaces/{workspace_id}/`
- **Description**: Retrieve a specific workspace by its ID.
- **Success Response**: `200 OK` with the workspace object.

### `PUT / PATCH /api/workshop/workspaces/{workspace_id}/`
- **Description**: Update a workspace's details (e.g., rename it).
- **Body**: `{ "name": "Updated Workspace Name" }`
- **Success Response**: `200 OK` with the updated workspace object.

### `DELETE /api/workshop/workspaces/{workspace_id}/`
- **Description**: Delete a workspace and all its associated content.
- **Success Response**: `204 No Content`.

---

## Files

Files are stored within a workspace. The primary way to interact with them is through the nested workspace routes.

### `GET /api/workshop/workspaces/{workspace_id}/files/`
- **Description**: List all files within a specific workspace.
- **Success Response**: `200 OK` with a list of file metadata objects.

### `POST /api/workshop/workspaces/{workspace_id}/files/`
- **Description**: Upload a new file to a workspace. This should be a `multipart/form-data` request.
- **Body**: `file` (the file blob), `filename` (the name of the file).
- **Success Response**: `201 Created` with the new file object.

### `GET /api/workshop/files/{file_id}/`
- **Description**: Retrieve a specific file's metadata and a URL to its content.
- **Success Response**: `200 OK` with the file object.

### `DELETE /api/workshop/files/{file_id}/`
- **Description**: Delete a file.
- **Success Response**: `204 No Content`.

---

## File Versions

Each file can have multiple versions, creating a history of changes.

### `GET /api/workshop/files/{file_id}/versions/`
- **Description**: List all versions for a specific file.
- **Success Response**: `200 OK` with a list of file version objects.

### `GET /api/workshop/file-versions/{version_id}/`
- **Description**: Retrieve a specific version of a file, including a URL to its content.
- **Success Response**: `200 OK` with the file version object.

---

## Chat Messages

### `GET /api/workshop/workspaces/{workspace_id}/chat/`
- **Description**: List all chat messages for a workspace.
- **Success Response**: `200 OK` with a list of chat message objects.

### `POST /api/workshop/workspaces/{workspace_id}/chat/`
- **Description**: Post a new message to the workspace chat.
- **Body**: `{ "message": "This is a new message." }`
- **Success Response**: `201 Created` with the new message object.

---

## Collaborators

### `GET /api/workshop/workspaces/{workspace_id}/collaborators/`
- **Description**: List all collaborators for a workspace.
- **Success Response**: `200 OK` with a list of collaborator objects.

### `POST /api/workshop/workspaces/{workspace_id}/collaborators/`
- **Description**: Add a collaborator to a workspace.
- **Body**: `{ "user": <user_id>, "role": "editor" }`
- **Success Response**: `201 Created` with the new collaborator object.

### `DELETE /api/workshop/collaborators/{collaborator_id}/`
- **Description**: Remove a collaborator from a workspace.
- **Success Response**: `204 No Content`.