import React, { useState, useEffect } from 'react';
import { Modal, Button, Spin, Alert, message } from 'antd';
import { DownloadOutlined, CloseOutlined } from '@ant-design/icons';
import { BASE_URL } from '../../utils/api';

const FileViewerModal = ({ visible, file, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (visible && file) {
      setLoading(true);
      setError(null);
      
      // Simulate loading time for file preparation
      const timer = setTimeout(() => {
        setLoading(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [visible, file]);

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

  // Robust download handler
  const handleDownload = async (fileUrl, fileName) => {
    if (!fileUrl || !fileName) {
      message.error('File information is missing');
      return;
    }

    try {
      console.log('Downloading file from modal:', fileName);
      console.log('Original URL received by modal:', fileUrl);
      
      const fullUrl = getSafeUrl(fileUrl);
      console.log('Full URL for download (after getSafeUrl):', fullUrl);
      
      // Use fetch API to get the file as a blob
      const response = await fetch(fullUrl, { credentials: 'include' });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Create and trigger download link
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
      
      message.success(`Downloading ${fileName}`);
    } catch (error) {
      console.error("Download error:", error);
      message.error(`Failed to download ${fileName}: ${error.message}`);
    }
  };

  const renderFileContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-96">
          <Spin size="large" tip="Loading file..." />
        </div>
      );
    }

    if (error) {
      return (
        <Alert
          message="Error Loading File"
          description={error}
          type="error"
          showIcon
        />
      );
    }

    if (!file) return null;

    // Safely get URL
    console.log('File URL before getSafeUrl:', file.url);
    const url = getSafeUrl(file.url);
    console.log('File URL after getSafeUrl:', url);
    
    // Get extension and convert to lowercase for case-insensitive comparison
    const extension = file.extension ? file.extension.toLowerCase() : '';
    
    // Handle different file types
    switch (extension) {
      case 'pdf':
        return (
          <div className="h-[70vh]">
            <iframe
              src={url}
              className="w-full h-full"
              title={file.name}
              frameBorder="0"
            />
          </div>
        );
      
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'bmp':
      case 'svg':
        return (
          <div className="flex justify-center">
            <img
              src={url}
              alt={file.name}
              className="max-w-full max-h-[70vh] object-contain"
              onError={() => setError("Failed to load image. The file might be corrupted or inaccessible.")}
            />
          </div>
        );
      
      case 'mp4':
      case 'webm':
      case 'ogg':
        return (
          <video
            controls
            className="w-full max-h-[70vh]"
            autoPlay={false}
            onError={() => setError("Failed to load video. The file might be corrupted or in an unsupported format.")}
          >
            <source src={url} type={`video/${extension}`} />
            Your browser does not support the video tag.
          </video>
        );
      
      case 'mp3':
      case 'wav':
        return (
          <audio
            controls
            className="w-full mt-10"
            autoPlay={false}
            onError={() => setError("Failed to load audio. The file might be corrupted or in an unsupported format.")}
          >
            <source src={url} type={`audio/${extension}`} />
            Your browser does not support the audio tag.
          </audio>
        );
      
      case 'xls':
      case 'xlsx':
      case 'csv':
        // For Excel files, direct download is more reliable than viewing
        return (
          <div className="text-center p-10">
            <div className="mb-8">
              <img 
                src="https://img.icons8.com/color/96/000000/microsoft-excel-2019--v1.png" 
                alt="Excel file" 
                className="mx-auto w-24 h-24"
              />
              <p className="text-xl mt-4 font-medium text-gray-700">
                {file.name}
              </p>
            </div>
            <p className="text-lg mb-6">
              Excel files cannot be previewed directly in the browser.
            </p>
            <Button
              type="primary"
              size="large"
              icon={<DownloadOutlined />}
              onClick={() => handleDownload(file.url, file.name)}
            >
              Download to view
            </Button>
          </div>
        );
      
      case 'doc':
      case 'docx':
      case 'ppt':
      case 'pptx':
        // For Office documents, direct download is more reliable
        const iconSrc = extension.includes('doc') 
          ? "https://img.icons8.com/color/96/000000/microsoft-word-2019--v1.png"
          : "https://img.icons8.com/color/96/000000/microsoft-powerpoint-2019--v1.png";
        
        const fileType = extension.includes('doc') ? "Word" : "PowerPoint";
        
        return (
          <div className="text-center p-10">
            <div className="mb-8">
              <img 
                src={iconSrc}
                alt={`${fileType} file`} 
                className="mx-auto w-24 h-24"
              />
              <p className="text-xl mt-4 font-medium text-gray-700">
                {file.name}
              </p>
            </div>
            <p className="text-lg mb-6">
              {fileType} files cannot be previewed directly in the browser.
            </p>
            <Button
              type="primary"
              size="large"
              icon={<DownloadOutlined />}
              onClick={() => handleDownload(file.url, file.name)}
            >
              Download to view
            </Button>
          </div>
        );
      
      case 'txt':
      case 'json':
      case 'xml':
      case 'html':
      case 'css':
      case 'js':
        // For text files, we'll fetch and display the content
        return (
          <div className="bg-gray-100 p-4 rounded-md overflow-auto h-[70vh]">
            <pre className="whitespace-pre-wrap">
              {/* We would normally fetch and display text content here */}
              {`Text preview for ${file.name} is not available in this view. Please download the file to view its contents.`}
            </pre>
          </div>
        );
      
      default:
        return (
          <div className="text-center p-10">
            <p className="text-xl mb-4 font-medium text-gray-700">
              {file.name}
            </p>
            <p className="text-lg mb-6">
              Preview not available for this file type ({extension || 'unknown'})
            </p>
            <Button
              type="primary"
              size="large"
              icon={<DownloadOutlined />}
              onClick={() => handleDownload(file.url, file.name)}
            >
              Download to view
            </Button>
          </div>
        );
    }
  };

  return (
    <Modal
      title={file?.name || 'File Viewer'}
      open={visible}
      onCancel={onClose}
      width="80%"
      centered
      footer={[
        <Button key="download" type="primary" icon={<DownloadOutlined />} onClick={() => handleDownload(file.url, file.name)}>
          Download
        </Button>,
        <Button key="close" icon={<CloseOutlined />} onClick={onClose}>
          Close
        </Button>
      ]}
      bodyStyle={{ padding: '16px', maxHeight: '80vh', overflow: 'auto' }}
    >
      {renderFileContent()}
    </Modal>
  );
};

export default FileViewerModal; 