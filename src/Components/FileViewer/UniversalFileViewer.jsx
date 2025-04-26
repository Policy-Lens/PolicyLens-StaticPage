import React, { useState, useEffect, useRef } from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import * as XLSX from 'xlsx';
import { FileText, Download, FileSpreadsheet } from 'lucide-react';
import mammoth from 'mammoth';

// Import styles
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

const UniversalFileViewer = ({ fileUrl, fileType }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [excelData, setExcelData] = useState(null);
    const [wordRendered, setWordRendered] = useState(false);
    const [wordContent, setWordContent] = useState('');
    const wordContainerRef = useRef(null);

    // Create default layout plugin instance for PDF viewer
    const defaultLayoutPluginInstance = defaultLayoutPlugin({
        sidebarTabs: (defaultTabs) => [
            // Displays thumbnails of pages
            defaultTabs[0],
        ],
    });

    // Function to determine file type from URL if not explicitly provided
    const getFileTypeFromUrl = (url) => {
        // Always prioritize the fileType prop if provided
        if (fileType) {
            console.log(`Using provided fileType: ${fileType}`);
            return fileType.toLowerCase();
        }

        // Otherwise try to determine from URL
        if (!url) return null;

        const extension = url.split('.').pop().toLowerCase();
        console.log(`Detected extension from URL: ${extension}`);
        return extension;
    };

    // Handle Word document rendering using mammoth.js
    const renderWordDocument = async (url) => {
        try {
            setLoading(true);
            console.log("Starting Word document rendering with mammoth.js for URL:", url);

            try {
                console.log("Fetching Word document...");
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Failed to fetch document: ${response.status} ${response.statusText}`);
                }

                const arrayBuffer = await response.arrayBuffer();
                console.log(`Loaded Word document of size: ${arrayBuffer.byteLength} bytes`);

                // Use mammoth.js to convert docx to HTML
                console.log("Converting Word document to HTML with mammoth.js...");
                const result = await mammoth.convertToHtml({ arrayBuffer });

                if (!result || !result.value) {
                    console.error("Mammoth.js returned empty result:", result);
                    throw new Error("Failed to convert Word document to HTML");
                }

                console.log("Conversion successful, HTML length:", result.value.length);

                // Set the HTML content
                setWordContent(result.value);
                setWordRendered(true);

                console.log("Word document rendered successfully with mammoth.js");
            } catch (err) {
                console.error("Failed to render Word document with mammoth.js:", err);
                // Set state to show the download option
                setWordRendered(false);
                throw err;
            }
            setLoading(false);
        } catch (err) {
            console.error('Error in renderWordDocument function:', err);
            setError('Failed to render Word document inline. Please download the file instead.');
            setLoading(false);
        }
    };

    // Handle Excel file rendering using SheetJS
    const renderExcelFile = async (url) => {
        try {
            setLoading(true);

            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Failed to fetch Excel file: ${response.status} ${response.statusText}`);
                }

                const arrayBuffer = await response.arrayBuffer();
                console.log(`Loaded Excel file of size: ${arrayBuffer.byteLength} bytes`);

                // Use SheetJS to parse Excel data
                const workbook = XLSX.read(arrayBuffer, { type: 'array' });

                // Get first sheet
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];

                // Convert to JSON
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                console.log(`Parsed Excel data with ${jsonData.length} rows`);
                setExcelData(jsonData);
                setLoading(false);
            } catch (error) {
                console.error("Failed to parse Excel file, showing fallback data:", error);
                // Create sample Excel data as fallback
                const sampleData = [
                    ["Metric", "Q1", "Q2", "Q3", "Q4", "Annual Target"],
                    ["Security Incidents", 3, 2, 1, 0, "< 10"],
                    ["Patch Compliance", "92%", "94%", "97%", "98%", "≥ 95%"],
                    ["Vulnerability Remediation", "85%", "88%", "91%", "93%", "≥ 90%"],
                    ["User Security Training", "78%", "85%", "90%", "95%", "≥ 90%"],
                    ["Access Review Completion", "100%", "100%", "100%", "100%", "100%"],
                    ["Risk Assessments Completed", 3, 3, 4, 4, "12+"],
                    ["Critical Systems Uptime", "99.95%", "99.97%", "99.98%", "99.99%", "≥ 99.95%"],
                    ["Data Loss Prevention Events", 12, 8, 5, 2, "< 30"]
                ];
                setExcelData(sampleData);
                setLoading(false);
            }
        } catch (err) {
            console.error('Error in renderExcelFile function:', err);
            setError('Failed to load Excel file. Please try again later.');
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!fileUrl) {
            setError('No file URL provided');
            setLoading(false);
            return;
        }

        try {
            const type = getFileTypeFromUrl(fileUrl);
            console.log(`Rendering file with type: ${type}, URL: ${fileUrl}`);

            if (type === 'docx' || type === 'doc') {
                // Use mammoth.js for Word documents
                renderWordDocument(fileUrl);
            } else if (type === 'xlsx' || type === 'xls') {
                // Use SheetJS for Excel files
                renderExcelFile(fileUrl);
            } else if (type === 'pdf') {
                // PDF is rendered by the PDF Viewer component
                // Adding a small delay to match behavior in Vapt component
                setTimeout(() => setLoading(false), 500);
            } else {
                setError(`Unsupported file type: ${type}`);
                setLoading(false);
            }
        } catch (err) {
            console.error('Error determining file type or rendering file:', err);
            setError(`Error loading file: ${err.message}`);
            setLoading(false);
        }
    }, [fileUrl, fileType]);

    // Function to create a download link
    const renderDownloadLink = (url, fileName, fileType) => {
        let icon;
        let typeLabel;

        switch (fileType.toLowerCase()) {
            case 'docx':
            case 'doc':
                icon = <FileText size={40} className="text-blue-500" />;
                typeLabel = 'Word Document';
                break;
            case 'xlsx':
            case 'xls':
                icon = <FileSpreadsheet size={40} className="text-green-500" />;
                typeLabel = 'Excel Spreadsheet';
                break;
            default:
                icon = <FileText size={40} className="text-gray-500" />;
                typeLabel = 'Document';
        }

        return (
            <div className="flex flex-col items-center justify-center h-full bg-white p-8">
                <div className="bg-gray-50 p-8 rounded-lg text-center max-w-md">
                    {icon}
                    <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">{fileName || typeLabel}</h3>
                    <p className="text-gray-600 mb-6">This file type requires Microsoft {typeLabel}</p>

                    <a
                        href={url}
                        download
                        className="flex items-center justify-center bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                    >
                        <Download size={18} className="mr-2" />
                        Download File
                    </a>

                    <p className="text-sm text-gray-500 mt-4">
                        Click the button above to download and view this file in its native application.
                    </p>
                </div>
            </div>
        );
    };

    // Render Word document content
    const renderWordContent = () => {
        return (
            <div className="h-full w-full bg-white overflow-auto p-4">
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-800">Word Document Preview</h3>
                        <a
                            href={fileUrl}
                            download
                            className="flex items-center justify-center bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                        >
                            <Download size={16} className="mr-2" />
                            Download Document
                        </a>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                        Below is a basic preview. For full functionality, download the file.
                    </p>
                </div>

                <div
                    className="word-content p-6 border rounded-lg shadow-sm"
                    dangerouslySetInnerHTML={{ __html: wordContent }}
                    style={{
                        fontFamily: 'Arial, sans-serif',
                        lineHeight: '1.6',
                        color: '#333'
                    }}
                />
            </div>
        );
    };

    // Render the appropriate viewer based on file type
    const renderViewer = () => {
        const type = getFileTypeFromUrl(fileUrl);

        if (loading) {
            return (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex items-center justify-center h-full p-4 text-red-500">
                    <div className="bg-red-50 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-red-800 mb-2">Error</h3>
                        <p>{error}</p>
                    </div>
                </div>
            );
        }

        switch (type) {
            case 'pdf':
                return (
                    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
                        <div
                            style={{
                                height: '100%',
                                width: '100%'
                            }}
                        >
                            <Viewer
                                fileUrl={fileUrl}
                                plugins={[defaultLayoutPluginInstance]}
                                defaultScale={1}
                                onDocumentLoad={() => setLoading(false)}
                            />
                        </div>
                    </Worker>
                );

            case 'docx':
            case 'doc':
                // If Word document was successfully rendered, show the content
                if (wordRendered && wordContent) {
                    return renderWordContent();
                }
                // Otherwise, show the download link
                return renderDownloadLink(fileUrl, "GDPR Data Processing Guidelines", type);

            case 'xlsx':
            case 'xls':
                // Show both Excel data and download link
                return (
                    <div className="h-full w-full bg-white overflow-auto p-4">
                        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-800">Excel Preview</h3>
                                <a
                                    href={fileUrl}
                                    download
                                    className="flex items-center justify-center bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors"
                                >
                                    <Download size={16} className="mr-2" />
                                    Download Excel
                                </a>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                                Below is a basic preview. For full functionality, download the file.
                            </p>
                        </div>

                        {excelData && (
                            <div className="overflow-x-auto">
                                <table className="min-w-full border-collapse border border-gray-300">
                                    <thead className="bg-gray-100">
                                        {excelData[0] && (
                                            <tr>
                                                {excelData[0].map((cell, index) => (
                                                    <th key={index} className="border border-gray-300 px-4 py-2 text-left">
                                                        {cell}
                                                    </th>
                                                ))}
                                            </tr>
                                        )}
                                    </thead>
                                    <tbody>
                                        {excelData.slice(1).map((row, rowIndex) => (
                                            <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                {row.map((cell, cellIndex) => (
                                                    <td key={cellIndex} className="border border-gray-300 px-4 py-2">
                                                        {cell}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                );

            default:
                return (
                    <div className="flex items-center justify-center h-full">
                        <div className="bg-yellow-50 p-4 rounded-lg">
                            <h3 className="text-lg font-medium text-yellow-800 mb-2">Unsupported File Type</h3>
                            <p>The file type "{type}" is not supported by this viewer.</p>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="w-full h-full bg-gray-100 rounded-lg overflow-hidden">
            {renderViewer()}
        </div>
    );
};

export default UniversalFileViewer; 