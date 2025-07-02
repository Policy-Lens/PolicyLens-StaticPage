import React, { useState, useEffect } from 'react';
import { Modal, Button, Spin, Alert, message } from 'antd';
import { DownloadOutlined, CloseOutlined } from '@ant-design/icons';
import { BASE_URL } from '../../utils/api';
import PDFTronViewer from './PDFTronViewer';

const FileViewerModal = ({ visible, file, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (visible && file) {
      setLoading(true);
      setError(null);

      // For PDFTron-supported files, let PDFTronViewer handle loading
      const extension = file.extension ? file.extension.toLowerCase() : '';
      const isPDFTronSupported = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension);

      if (!isPDFTronSupported) {
        // For simple file types, simulate loading time
        const timer = setTimeout(() => {
          setLoading(false);
        }, 500);

        return () => clearTimeout(timer);
      }
      // For PDFTron files, loading state will be handled by PDFTronViewer
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

  // Callback for PDFTronViewer loading state
  const handlePDFTronLoadingChange = (isLoading) => {
    setLoading(isLoading);
  };

  const renderFileContent = () => {
    if (!file) return null;

    // Safely get URL
    console.log('File URL before getSafeUrl:', file.url);
    const url = getSafeUrl(file.url);
    console.log('File URL after getSafeUrl:', url);

    // Get extension and convert to lowercase for case-insensitive comparison
    const extension = file.extension ? file.extension.toLowerCase() : '';

    // Use PDFTronViewer for supported document types
    if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension)) {
      return (
        <div className="h-[70vh]">
          <PDFTronViewer
            fileUrl={url}
            fileType={extension}
            onLoadingChange={handlePDFTronLoadingChange}
          />
        </div>
      );
    }

    // Loading state for simple file types
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

    // Handle other file types with basic HTML elements
    switch (extension) {
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

      case 'csv':
        // For CSV files, show download option
        return (
          <div className="text-center p-10">
            <div className="mb-8">
              <img
                src="https://img.icons8.com/color/96/000000/csv.png"
                alt="CSV file"
                className="mx-auto w-24 h-24"
              />
              <p className="text-xl mt-4 font-medium text-gray-700">
                {file.name}
              </p>
            </div>
            <p className="text-lg mb-6">
              CSV files cannot be previewed directly in the browser.
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
      width="75%"
      centered
      footer={[
        <Button key="download" type="primary" icon={<DownloadOutlined />} onClick={() => handleDownload(file?.url, file?.name)}>
          Download
        </Button>,
        <Button key="close" icon={<CloseOutlined />} onClick={onClose}>
          Close
        </Button>
      ]}
      bodyStyle={{ padding: '16px', maxHeight: '85vh', overflow: 'auto' }}
      style={{ top: 20 }}
    >
      {renderFileContent()}
    </Modal>
  );
};

export default FileViewerModal; 