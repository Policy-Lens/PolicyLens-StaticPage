import React, { useState, useRef } from 'react';
import { X, Upload, Download } from 'lucide-react';
import { message } from 'antd';
import { apiRequest } from '../../../../utils/api';

const UnifiedUploadModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isSubmitting, 
  title, 
  reportName, 
  fileType = "excel", // "excel" or "pdf"
  showDownloadTemplate = false,
  reportType = null, // "risk_assessment", "risk_treatment", "asis", "vapt"
  onDownloadTemplate = null,
  reportId = null, // ID of the current report/sheet
  projectId = null // ID of the current project
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  // Template configurations for different report types
  const templateConfigs = {
    risk_assessment: {
      fileName: "risk_assessment_template.xlsx",
      description: "Download the Risk Assessment template before uploading your data."
    },
    risk_treatment: {
      fileName: "risk_treatment_template.xlsx",
      description: "Download the Risk Treatment template before uploading your data."
    },
    asis: {
      fileName: "ASIS Report.xlsx", 
      description: "Download the ASIS template before uploading your data."
    },
    vapt: {
      fileName: "vapt_template.pdf",
      description: "Download the VAPT template before uploading your data."
    }
  };

  // Get template config based on report type
  const templateConfig = reportType ? templateConfigs[reportType] : null;

  // Reset state when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [isOpen]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = fileType === "excel" 
        ? [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel'
          ]
        : ['application/pdf'];
      
      if (allowedTypes.includes(file.type)) {
        setSelectedFile(file);
      } else {
        message.error(`Please select a valid ${fileType === "excel" ? "Excel" : "PDF"} file`);
        e.target.value = '';
        setSelectedFile(null);
      }
    }
  };

  const handleSubmit = () => {
    if (!selectedFile) {
      message.error(`Please select a ${fileType === "excel" ? "Excel" : "PDF"} file`);
      return;
    }
    onSubmit(selectedFile);
  };

  const handleDownloadTemplate = async () => {
    if (onDownloadTemplate) {
      onDownloadTemplate();
      return;
    }

    if (!reportType) {
      message.error("Report type not available");
      return;
    }

    try {
      let templateUrl = '';
      let filename = '';

      switch (reportType) {
        case 'asis':
          templateUrl = '/Risk Templates/ASIS Report.xlsx';
          filename = `ASIS_Template_${reportName?.replace(' ', '_') || 'Report'}.xlsx`;
          break;
        case 'risk_assessment':
          templateUrl = '/Risk Templates/risk_assessment_template.xlsx';
          filename = `Risk_Assessment_Template_${reportName?.replace(' ', '_') || 'Sheet'}.xlsx`;
          break;
        case 'risk_treatment':
          templateUrl = '/Risk Templates/risk_treatment_template.xlsx';
          filename = `Risk_Treatment_Template_${reportName?.replace(' ', '_') || 'Sheet'}.xlsx`;
          break;
        default:
          message.error("Unsupported report type");
          return;
      }

      // Create a link element to trigger download
      const link = document.createElement('a');
      link.href = templateUrl;
      link.download = filename;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      
      message.success("Template downloaded successfully!");
    } catch (error) {
      console.error("Error downloading template:", error);
      message.error("Failed to download template");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {reportName && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">Upload {fileType === "excel" ? "Excel" : "PDF"} file for: <span className="font-medium">{reportName}</span></p>
          </div>
        )}

        {/* Download Template Section */}
        {showDownloadTemplate && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-blue-800">Download Template</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Download the {reportType === 'asis' ? 'ASIS' : reportType === 'risk_assessment' ? 'Risk Assessment' : reportType === 'risk_treatment' ? 'Risk Treatment' : 'template'} before uploading your data.
                </p>
                <button
                  onClick={handleDownloadTemplate}
                  className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <Download size={14} className="mr-1" />
                  Download Template
                </button>
              </div>
            </div>
          </div>
        )}

        {/* File Upload Section */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select {fileType === "excel" ? "Excel" : "PDF"} File
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                >
                  <span>Click to upload</span>
                  <input
                    id="file-upload"
                    ref={fileInputRef}
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    accept={fileType === "excel" ? ".xlsx,.xls" : ".pdf"}
                    onChange={handleFileChange}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">
                {fileType === "excel" ? "Excel files only (.xlsx, .xls)" : "PDF files only (.pdf)"}
              </p>
            </div>
          </div>
          {selectedFile && (
            <p className="mt-2 text-sm text-green-600 font-medium">
              Selected: {selectedFile.name}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedFile || isSubmitting}
            className={`px-4 py-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
              selectedFile && !isSubmitting
                ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? 'Uploading...' : `Upload ${fileType === "excel" ? "Excel" : "PDF"}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnifiedUploadModal; 