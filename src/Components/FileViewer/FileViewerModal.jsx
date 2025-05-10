import React, { useEffect, useState } from 'react';
import { X, FileText } from 'lucide-react';
import PDFTronViewer from './PDFTronViewer';

const FileViewerModal = ({ isOpen, onClose, fileUrl, fileType, fileName }) => {
    // Add state to control viewer mounting/unmounting
    const [showViewer, setShowViewer] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Manage viewer mounting after modal opens
    useEffect(() => {
        if (isOpen) {
            // Small delay to ensure modal is fully rendered before mounting viewer
            const timer = setTimeout(() => {
                setShowViewer(true);
            }, 100);
            return () => clearTimeout(timer);
        } else {
            setShowViewer(false);
        }
    }, [isOpen]);

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
                        onClick={() => {
                            // Ensure viewer is unmounted before closing modal
                            setShowViewer(false);
                            setTimeout(() => onClose(), 50);
                        }}
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                        aria-label="Close"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Modal Body - File Viewer */}
                <div className="flex-1 h-full relative" id="viewer-container">
                    {/* Initial loading indicator shown immediately */}
                    {isLoading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-10">
                            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <div className="flex items-center text-gray-600">
                                <FileText className="mr-2" size={20} />
                                <span>Loading document...</span>
                            </div>
                        </div>
                    )}

                    {showViewer && (
                        <PDFTronViewer
                            key={`viewer-${fileUrl}`} // Force remount on file change
                            fileUrl={fileUrl}
                            fileType={fileType}
                            onLoadingChange={setIsLoading} // Pass loading state callback
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default FileViewerModal; 