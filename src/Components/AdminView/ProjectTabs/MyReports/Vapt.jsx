import React, { useState } from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';

// Import styles
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

const Vapt = () => {
    // PDF viewer state
    const [pdfFile, setPdfFile] = useState('/VAPTSummary.pdf');
    const [loading, setLoading] = useState(false);

    // Create default layout plugin instance
    const defaultLayoutPluginInstance = defaultLayoutPlugin({
        sidebarTabs: (defaultTabs) => [
            // Displays thumbnails of pages
            defaultTabs[0],
        ],
    });

    // Handle document selection
    const handleDocumentChange = (document) => {
        setLoading(true);
        setPdfFile(document);
        setTimeout(() => setLoading(false), 500);
    };

    return (
        <div className="w-full h-full flex flex-col overflow-hidden">
            {/* Document selection */}
            <div className="flex items-center justify-between p-4 bg-white">
                <h2 className="text-2xl font-bold text-slate-800">Document Viewer</h2>
                <div className="flex space-x-3">
                    <button
                        onClick={() => handleDocumentChange('/Document1.pdf')}
                        className={`px-4 py-2 rounded-md transition-all duration-200 ${pdfFile === '/Document1.pdf'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        Document 1
                    </button>
                    <button
                        onClick={() => handleDocumentChange('/VAPTSummary.pdf')}
                        className={`px-4 py-2 rounded-md transition-all duration-200 ${pdfFile === '/VAPTSummary.pdf'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        VAPT Summary
                    </button>
                </div>
            </div>

            {/* PDF Viewer with react-pdf-viewer */}
            <div className="flex-1 overflow-hidden border-t border-gray-200">
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
                        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : null}

                <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
                    <div
                        style={{
                            height: 'calc(100vh - 80px)',
                            width: '100%'
                        }}
                    >
                        <Viewer
                            fileUrl={pdfFile}
                            plugins={[defaultLayoutPluginInstance]}
                            defaultScale={1}
                            onDocumentLoad={() => setLoading(false)}
                        />
                    </div>
                </Worker>
            </div>
        </div>
    );
};

export default Vapt;