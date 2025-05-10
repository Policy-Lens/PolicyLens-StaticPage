import React, { useEffect, useRef, useState } from 'react';
// Remove the WebViewer import from @pdftron/webviewer
// import WebViewer from '@pdftron/webviewer';
import { FileText, Download, FileSpreadsheet, AlertCircle } from 'lucide-react';

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

const PDFTronViewer = ({ fileUrl, fileType, onLoadingChange }) => {
    const viewerDiv = useRef(null);
    const viewer = useRef(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Propagate loading state to parent component if callback provided
    useEffect(() => {
        if (onLoadingChange) {
            onLoadingChange(loading);
        }
    }, [loading, onLoadingChange]);

    useEffect(() => {
        if (!fileUrl) {
            setError("No file URL provided");
            setLoading(false);
            return;
        }

        const initWebViewer = async () => {
            setLoading(true);
            setError(null);

            try {
                // Load WebViewer script from CDN
                const WebViewer = await loadWebViewerScript();

                // Initialize PDFTron WebViewer
                viewer.current = await WebViewer(
                    {
                        // Use CDN path for library assets
                        path: 'https://cdn.jsdelivr.net/npm/@pdftron/webviewer@11.4.0/public',
                        // Add the license key provided
                        licenseKey: 'demo:1745828072801:611d0a550300000000bd7a20b30087cff7b07798aba974b478971f4722',
                        // Enable necessary features for different file types
                        fullAPI: true,
                        enableFilePicker: false,
                        disabledElements: [
                            'ribbons',
                            'toolsHeader',
                        ],
                        // Add custom CSS inline to override PDFTron's built-in styles
                        css: `
                            .HeaderItems { background-color: #f8fafc; }
                            .DocumentContainer { background-color: #f1f5f9; }
                            .pageText { color: #1e293b; }
                            .Button.active { background-color: #e0f2fe; color: #0284c7; }
                            .Document { height: 100%; }
                            /* Fix for double viewer issue */
                            .DocumentContainer > div:not(:first-child) {
                                display: none !important;
                            }
                            
                            /* Remove the default long text from the toolbar tabs */
                            [data-element^="option.toolbarGroup"] .title::before,
                            [data-element^="option.toolbarGroup"] .title option {
                                display: none !important;
                            }
                            
                            /* Clean up the toolbar appearance */
                            .TabsHeader {
                                border-bottom: 1px solid #e2e8f0;
                                background-color: #f8fafc;
                            }
                            
                            .TabsHeader button {
                                padding: 8px 16px;
                                font-size: 14px;
                                font-weight: 500;
                            }
                            
                            .TabsHeader button.active {
                                border-bottom: 2px solid #3b82f6;
                                color: #3b82f6;
                            }
                        `,
                    },
                    viewerDiv.current
                );

                // Get the UI instance and set theme
                const { UI, Core } = viewer.current;
                UI.setTheme('light');

                // Instead of disabling the default toolbar, we'll update the UI after it loads
                setTimeout(() => {
                    try {
                        // Find all toolbar tab elements and rename them
                        const replaceTabNames = () => {
                            // Map of selectors to their new text
                            const nameMap = {
                                '[data-element="option.toolbarGroup.toolbarGroup-View"]': 'View',
                                '[data-element="option.toolbarGroup.toolbarGroup-Annotate"]': 'Annotate',
                                '[data-element="option.toolbarGroup.toolbarGroup-Shapes"]': 'Shapes',
                                '[data-element="option.toolbarGroup.toolbarGroup-Insert"]': 'Insert',
                                '[data-element="option.toolbarGroup.toolbarGroup-Measure"]': 'Measure',
                                '[data-element="option.toolbarGroup.toolbarGroup-Edit"]': 'Edit',
                                '[data-element="option.toolbarGroup.toolbarGroup-FillAndSign"]': 'Fill and Sign',
                                '[data-element="option.toolbarGroup.toolbarGroup-Forms"]': 'Forms'
                            };

                            // Apply the changes to each element
                            Object.entries(nameMap).forEach(([selector, newText]) => {
                                const element = document.querySelector(selector);
                                if (element) {
                                    const titleElement = element.querySelector('.title');
                                    if (titleElement) {
                                        titleElement.textContent = newText;
                                    }
                                }
                            });
                        };

                        // Run initially and then observe for changes
                        replaceTabNames();

                        // Create a mutation observer to watch for future changes
                        const observer = new MutationObserver((mutations) => {
                            replaceTabNames();
                        });

                        // Start observing the document
                        observer.observe(document.body, {
                            childList: true,
                            subtree: true
                        });

                    } catch (e) {
                        console.warn('Error customizing toolbar:', e);
                    }
                }, 1000); // Wait for UI to be fully loaded

                // Determine file type/extension
                let extension = getFileExtension(fileUrl);
                let loadOptions = {};

                // If a specific file type is passed, use it instead of the extension from URL
                if (fileType) {
                    const normalizedFileType = fileType.toLowerCase().trim();
                    if (normalizedFileType) {
                        extension = normalizedFileType;
                    }
                }

                console.log(`Loading document with extension: ${extension}`);

                // Set appropriate extension for Office documents
                if (extension === 'docx' || extension === 'doc') {
                    loadOptions = { extension: 'docx' };
                } else if (extension === 'xlsx' || extension === 'xls') {
                    loadOptions = { extension: 'xlsx' };
                } else if (extension === 'pdf') {
                    loadOptions = { extension: 'pdf' };
                } else {
                    // Try to load as PDF by default for other types
                    loadOptions = { extension: 'pdf' };
                }

                // Set up document loaded event
                viewer.current.Core.documentViewer.addEventListener('documentLoaded', () => {
                    console.log('Document loaded successfully');

                    // Enable continuous scrolling mode
                    if (viewer.current.UI.LayoutMode) {
                        viewer.current.UI.setLayoutMode(viewer.current.UI.LayoutMode.Continuous);
                    }

                    // Set zoom level to 80%
                    if (viewer.current.Core.documentViewer.getZoomLevel) {
                        try {
                            viewer.current.Core.documentViewer.setZoomLevel(0.8); // 80%
                        } catch (e) {
                            console.warn('Failed to set zoom level:', e);
                        }
                    }

                    setLoading(false);
                });

                // Set up document loading error event
                viewer.current.Core.documentViewer.addEventListener('documentLoadingFailed', (err) => {
                    console.error('Document loading failed:', err);
                    setError(`Failed to load document: ${err.message || 'Unknown error'}`);
                    setLoading(false);
                });

                // Load the document with the specified options
                try {
                    viewer.current.Core.documentViewer.loadDocument(fileUrl, loadOptions);
                } catch (docLoadError) {
                    console.error('Error loading document:', docLoadError);
                    setError(`Error loading document: ${docLoadError.message || 'Unknown error'}`);
                    setLoading(false);
                }
            } catch (error) {
                console.error('Error initializing PDFTron WebViewer:', error);
                setError(`Error initializing document viewer: ${error.message || 'Unknown error'}`);
                setLoading(false);
            }
        };

        initWebViewer();

        // Clean up
        return () => {
            // The proper way to clean up PDFTron instance
            if (viewer.current) {
                try {
                    // Try to close any open documents first
                    if (viewer.current.Core && viewer.current.Core.documentViewer) {
                        try {
                            viewer.current.Core.documentViewer.closeDocument();
                        } catch (e) {
                            console.warn('Error closing document:', e);
                        }
                    }

                    // Dispose UI and Core if available
                    if (viewer.current.UI) {
                        try {
                            viewer.current.UI.dispose();
                        } catch (e) {
                            console.warn('Error disposing UI:', e);
                        }
                    }

                    // Clear the viewer div content
                    if (viewerDiv.current) {
                        try {
                            // Use innerHTML for a clean sweep of the container
                            viewerDiv.current.innerHTML = '';
                        } catch (e) {
                            console.warn('Error cleaning viewer div:', e);
                        }
                    }

                    // Remove any potential leftover WebViewer elements from the document
                    try {
                        const webViewerElements = document.querySelectorAll('.webviewer-outer-container');
                        webViewerElements.forEach(element => {
                            if (element.parentNode && element !== viewerDiv.current) {
                                element.parentNode.removeChild(element);
                            }
                        });
                    } catch (e) {
                        console.warn('Error removing leftover elements:', e);
                    }
                } catch (e) {
                    console.warn('Error during cleanup:', e);
                }
            }
            // Reset our refs
            viewer.current = null;
        };
    }, [fileUrl, fileType]);

    // Helper function to extract file extension from URL
    const getFileExtension = (url) => {
        if (!url) return '';

        // Remove any URL parameters
        const cleanUrl = url.split('?')[0];
        const parts = cleanUrl.split('.');

        if (parts.length <= 1) {
            return ''; // No extension found
        }

        return parts[parts.length - 1].toLowerCase();
    };

    // Render error state
    if (error) {
        // Make sure loading is set to false when there's an error
        if (onLoadingChange) {
            onLoadingChange(false);
        }

        return (
            <div className="h-full w-full flex items-center justify-center bg-gray-50">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md text-center">
                    <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Document Viewer Error</h3>
                    <p className="text-gray-600 mb-6">{error}</p>

                    {fileUrl && (
                        <a
                            href={fileUrl}
                            download
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            <Download size={18} className="mr-2" />
                            Download File Instead
                        </a>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="h-full w-full relative">
            <div ref={viewerDiv} className="h-full w-full"></div>
        </div>
    );
};

export default PDFTronViewer; 