import React, { useState } from 'react';
import FileExplorer from './Components/FileExplorer';
import MarkdownEditor from './Components/MarkdownEditor';
import ChatSidebar from './Components/ChatSidebar';

const EditorView = () => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileSelect = (file) => {
    setSelectedFile(file);
  };

  const handleFileEdit = (file) => {
    // When edit button is clicked, select the file and open it in editor
    setSelectedFile(file);
  };

  const handleFileUpdate = (updatedFile) => {
    // Update the selected file when it's saved
    setSelectedFile(updatedFile);
    console.log('File updated:', updatedFile);
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Left Sidebar - File Explorer */}
      <FileExplorer 
        onFileSelect={handleFileSelect}
        onFileEdit={handleFileEdit}
      />
      
      {/* Main Content - Markdown Editor */}
      <div className="flex-1">
        <MarkdownEditor 
          file={selectedFile} 
          onFileUpdate={handleFileUpdate}
        />
      </div>
      
      {/* Right Sidebar - Chat */}
      <ChatSidebar />
    </div>
  );
};

export default EditorView;