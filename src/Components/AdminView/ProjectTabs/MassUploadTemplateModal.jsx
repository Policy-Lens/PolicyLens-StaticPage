import React, { useState, useRef } from 'react';
import { X, Upload, Download, FileText, Trash2, Plus, AlertCircle } from 'lucide-react';
import { message, Alert, Button, Progress, Spin } from 'antd';
import Cookies from 'js-cookie';

// Import the base URL from api configuration
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const MassUploadTemplateModal = ({ isOpen, onClose, onSubmit }) => {
  const [selectedExcelFile, setSelectedExcelFile] = useState(null);
  const [attachmentFiles, setAttachmentFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewData, setPreviewData] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  
  const excelInputRef = useRef(null);
  const attachmentInputRef = useRef(null);

  // Reset state when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setSelectedExcelFile(null);
      setAttachmentFiles([]);
      setPreviewData([]);
      setShowPreview(false);
      setUploadProgress(0);
      if (excelInputRef.current) excelInputRef.current.value = '';
      if (attachmentInputRef.current) attachmentInputRef.current.value = '';
    }
  }, [isOpen]);

  const handleExcelFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ];
      
      if (allowedTypes.includes(file.type)) {
        setSelectedExcelFile(file);
        // Parse Excel file to show preview
        await parseExcelPreview(file);
      } else {
        message.error('Please select a valid Excel file (.xlsx or .xls)');
        event.target.value = '';
        setSelectedExcelFile(null);
      }
    }
  };

  const handleAttachmentFilesChange = (event) => {
    const files = Array.from(event.target.files);
    setAttachmentFiles(prev => [...prev, ...files]);
    // Reset the input to allow selecting the same file again
    event.target.value = '';
  };

  const removeAttachmentFile = (index) => {
    setAttachmentFiles(prev => prev.filter((_, i) => i !== index));
  };

  const parseExcelPreview = async (file) => {
    try {
      // Create FormData to send the Excel file for preview
      const formData = new FormData();
      formData.append('excel_file', file);
      
      // Send to backend for parsing
      const response = await fetch(`${BASE_URL}/api/controlfiles/preview-excel/`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${Cookies.get('accessToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPreviewData(data.preview || []);
        setShowPreview(true);
      } else {
        throw new Error('Failed to parse Excel file');
      }
    } catch (error) {
      console.error('Error parsing Excel:', error);
      message.warning('Could not preview Excel file. You can still upload it.');
      setShowPreview(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedExcelFile) {
      message.error('Please select an Excel file to upload');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Create FormData with Excel file and all attachments
      const formData = new FormData();
      formData.append('excel_file', selectedExcelFile);
      
      // Add all attachment files
      attachmentFiles.forEach((file, index) => {
        formData.append(`attachment_${index}`, file);
      });
      
      // Add file names mapping for backend processing
      const fileNamesMapping = {};
      attachmentFiles.forEach((file, index) => {
        fileNamesMapping[`attachment_${index}`] = file.name;
      });
      formData.append('file_names_mapping', JSON.stringify(fileNamesMapping));

      // Progress simulation (since FormData upload doesn't provide real progress)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      await onSubmit(formData);
      
      // Complete progress
      setUploadProgress(100);
      clearInterval(progressInterval);
      
      message.success('Templates uploaded successfully!');
      
      // Reset state
      setSelectedExcelFile(null);
      setAttachmentFiles([]);
      setPreviewData([]);
      setShowPreview(false);
      if (excelInputRef.current) excelInputRef.current.value = '';
      if (attachmentInputRef.current) attachmentInputRef.current.value = '';
      
      onClose();
    } catch (error) {
      console.error('Error uploading templates:', error);
      message.error(error.message || 'Failed to upload templates');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleCancel = () => {
    setSelectedExcelFile(null);
    setAttachmentFiles([]);
    setPreviewData([]);
    setShowPreview(false);
    if (excelInputRef.current) excelInputRef.current.value = '';
    if (attachmentInputRef.current) attachmentInputRef.current.value = '';
    onClose();
  };

  const downloadTemplate = async () => {
    try {
      // Download the Excel template from the backend API
      const response = await fetch(`${BASE_URL}/api/controlfiles/download-template/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${Cookies.get('accessToken')}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'template_mass_upload.xlsx';
        link.click();
        window.URL.revokeObjectURL(url);
      } else {
        throw new Error('Failed to download template');
      }
    } catch (error) {
      console.error('Error downloading template:', error);
      message.error('Failed to download template. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl p-6 shadow-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Mass Upload Templates</h3>
          <button
            onClick={handleCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* Instructions */}
        <Alert
          message="Mass Upload Instructions"
          description={
            <div className="mt-2">
              <p className="mb-2">1. Download the Excel template and fill in your template information</p>
              <p className="mb-2">2. Upload the completed Excel file</p>
              <p className="mb-2">3. Attach all template files referenced in the Excel file</p>
              <p>4. The system will match files to rows based on the 'file_name' column</p>
            </div>
          }
          type="info"
          icon={<AlertCircle />}
          className="mb-6"
          showIcon
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Excel Upload */}
          <div>
            <h4 className="text-lg font-medium mb-4">1. Excel File with Template Data</h4>
            
            {/* Download Template Button */}
            <div className="mb-4">
              <Button
                onClick={downloadTemplate}
                icon={<Download size={16} />}
                className="mb-3"
              >
                Download Excel Template
              </Button>
            </div>

            {/* Excel File Upload */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Excel File *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                <input
                  ref={excelInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleExcelFileChange}
                  className="hidden"
                />
                <button
                  onClick={() => excelInputRef.current?.click()}
                  className="flex flex-col items-center justify-center w-full"
                >
                  <FileText size={32} className="text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">
                    Click to select Excel file or drag and drop
                  </span>
                </button>
              </div>
              {selectedExcelFile && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                  <p className="text-sm text-green-800">
                    Selected: {selectedExcelFile.name}
                  </p>
                </div>
              )}
            </div>

            {/* Preview Data */}
            {showPreview && previewData.length > 0 && (
              <div className="mb-4">
                <h5 className="text-sm font-medium mb-2">Excel Preview ({previewData.length} rows)</h5>
                <div className="max-h-40 overflow-y-auto border border-gray-200 rounded">
                  <table className="min-w-full text-xs">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-2 py-1 text-left">Template ID</th>
                        <th className="px-2 py-1 text-left">Category</th>
                        <th className="px-2 py-1 text-left">File Name</th>
                        <th className="px-2 py-1 text-left">Clause No.</th>
                        <th className="px-2 py-1 text-left">Parent Clause</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.slice(0, 5).map((row, index) => (
                        <tr key={index} className="border-t">
                          <td className="px-2 py-1">{row.template_id}</td>
                          <td className="px-2 py-1">{row.category}</td>
                          <td className="px-2 py-1">{row.file_name}</td>
                          <td className="px-2 py-1">{row.regulation_clause_no}</td>
                          <td className="px-2 py-1">{row.parent_clause_name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {previewData.length > 5 && (
                    <p className="text-xs text-gray-500 p-2">... and {previewData.length - 5} more rows</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - File Attachments */}
          <div>
            <h4 className="text-lg font-medium mb-4">2. Template File Attachments</h4>
            
            {/* File Upload Area */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Template Files
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                <input
                  ref={attachmentInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt,.xlsx,.xls"
                  onChange={handleAttachmentFilesChange}
                  className="hidden"
                />
                <button
                  onClick={() => attachmentInputRef.current?.click()}
                  className="flex flex-col items-center justify-center w-full"
                >
                  <Upload size={32} className="text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">
                    Click to select files or drag and drop
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    PDF, Word, Excel, Text files
                  </span>
                </button>
              </div>
            </div>

            {/* Attachment Files List */}
            {attachmentFiles.length > 0 && (
              <div>
                <h5 className="text-sm font-medium mb-2">
                  Attached Files ({attachmentFiles.length})
                </h5>
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded">
                  {attachmentFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 border-b last:border-b-0 hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-2">
                        <FileText size={16} className="text-blue-500" />
                        <span className="text-sm text-gray-700 truncate">
                          {file.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <button
                        onClick={() => removeAttachmentFile(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Remove file"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add More Files Button */}
            <button
              onClick={() => attachmentInputRef.current?.click()}
              className="mt-3 flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm"
            >
              <Plus size={16} />
              <span>Add More Files</span>
            </button>
          </div>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Uploading...</span>
              <span className="text-sm text-gray-600">{uploadProgress}%</span>
            </div>
            <Progress percent={uploadProgress} status="active" />
          </div>
        )}

        {/* Validation Messages */}
        {selectedExcelFile && attachmentFiles.length === 0 && (
          <Alert
            message="No attachment files selected"
            description="You can upload the Excel file without attachments, but template files won't be available for download."
            type="warning"
            className="mb-4"
            showIcon
          />
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            onClick={handleCancel}
            disabled={isUploading}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedExcelFile || isUploading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isUploading ? (
              <>
                <Spin size="small" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload size={16} />
                <span>Upload Templates</span>
              </>
            )}
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <h5 className="text-sm font-medium mb-2">Expected Excel Columns (in order):</h5>
          <div className="text-xs text-gray-600 grid grid-cols-2 gap-2">
            <div>• template_id</div>
            <div>• category</div>
            <div>• sub_category</div>
            <div>• file_name (must match uploaded files)</div>
            <div>• file_type</div>
            <div>• regulation_standard</div>
            <div>• regulation_clause_no</div>
            <div>• regulation_clause_name</div>
            <div>• parent_clause_name</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MassUploadTemplateModal;
