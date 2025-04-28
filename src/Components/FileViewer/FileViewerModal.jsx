import React from 'react';
import { X } from 'lucide-react';
import PDFTronViewer from './PDFTronViewer';

const FileViewerModal = ({ isOpen, onClose, fileUrl, fileType, fileName }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full h-[90vh] flex flex-col">
                {/* Modal Header */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
                    <h2 className="text-xl font-semibold text-gray-800 truncate">
                        {fileName || 'Document Viewer'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                        aria-label="Close"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Modal Body - File Viewer */}
                <div className="flex-1 h-full">
                    <PDFTronViewer
                        fileUrl={fileUrl}
                        fileType={fileType}
                    />
                </div>
            </div>
        </div>
    );
};

export default FileViewerModal; 