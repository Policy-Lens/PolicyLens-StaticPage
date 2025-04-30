import React, { useState, useRef, useEffect } from 'react';
// Remove the WebViewer import from @pdftron/webviewer
// import WebViewer from '@pdftron/webviewer';

// Add a script loader function to dynamically load WebViewer from CDN
const loadWebViewerScript = () => {
    return new Promise((resolve, reject) => {
        // Check if script is already loaded
        if (window.WebViewer) {
            resolve(window.WebViewer);
            return;
        }

        const script = document.createElement('script');
        script.type = 'text/javascript';
        // Use the CDN URL for the latest version
        script.src = 'https://cdn.jsdelivr.net/npm/@pdftron/webviewer@11.4.0/webviewer.min.js';
        script.async = true;
        script.onload = () => resolve(window.WebViewer);
        script.onerror = (error) => reject(new Error(`Failed to load WebViewer script: ${error}`));
        document.head.appendChild(script);
    });
};

const Vapt = () => {
    // PDF viewer state
    const [loading, setLoading] = useState(true);
    const pdfFile = '/VAPTSummary.pdf'; // Fixed file path

    const viewerDiv = useRef(null);
    const instance = useRef(null);

    // Initialize PDFTron WebViewer
    useEffect(() => {
        if (!viewerDiv.current) return;

        const initWebViewer = async () => {
            setLoading(true);

            try {
                // Load WebViewer script from CDN
                const WebViewer = await loadWebViewerScript();

                // Initialize PDFTron WebViewer
                instance.current = await WebViewer(
                    {
                        // Use CDN path for library assets
                        path: 'https://cdn.jsdelivr.net/npm/@pdftron/webviewer@11.4.0/public',
                        licenseKey: 'demo:1745828072801:611d0a550300000000bd7a20b30087cff7b07798aba974b478971f4722',
                        fullAPI: true,
                        enableFilePicker: false,
                        disabledElements: [
                            'ribbons',
                            'toolsHeader',
                        ],
                        css: `
                            .HeaderItems { background-color: #f8fafc; }
                            .DocumentContainer { background-color: #f1f5f9; }
                            .pageText { color: #1e293b; }
                            .Button.active { background-color: #e0f2fe; color: #0284c7; }
                            .Document { height: 100%; }
                        `,
                    },
                    viewerDiv.current
                );

                // Get the UI instance and set theme
                const { UI, Core } = instance.current;
                UI.setTheme('light');

                // Set up document loaded event
                Core.documentViewer.addEventListener('documentLoaded', () => {
                    console.log('Document loaded successfully');
                    setLoading(false);
                });

                // Load the default document
                Core.documentViewer.loadDocument(pdfFile);
            } catch (error) {
                console.error('Error initializing PDFTron WebViewer:', error);
                setLoading(false);
            }
        };

        initWebViewer();

        // Clean up
        return () => {
            if (instance.current) {
                try {
                    // Try to close any open documents first
                    if (instance.current.Core && instance.current.Core.documentViewer) {
                        try {
                            instance.current.Core.documentViewer.closeDocument();
                        } catch (e) {
                            console.warn('Error closing document:', e);
                        }
                    }

                    // Clear the viewer div content
                    if (viewerDiv.current) {
                        try {
                            while (viewerDiv.current.firstChild) {
                                viewerDiv.current.removeChild(viewerDiv.current.firstChild);
                            }
                        } catch (e) {
                            console.warn('Error cleaning viewer div:', e);
                        }
                    }
                } catch (e) {
                    console.warn('Error during cleanup:', e);
                }
            }
        };
    }, []);

    return (
        <div className="w-full h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-white">
                <h2 className="text-2xl font-bold text-slate-800">VAPT Summary</h2>
            </div>

            {/* PDFTron WebViewer */}
            <div className="flex-1 overflow-hidden border-t border-gray-200 relative">
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
                        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}

                <div
                    ref={viewerDiv}
                    className="h-full w-full"
                    style={{ height: 'calc(100vh - 80px)' }}
                ></div>
            </div>
        </div>
    );
};

export default Vapt;