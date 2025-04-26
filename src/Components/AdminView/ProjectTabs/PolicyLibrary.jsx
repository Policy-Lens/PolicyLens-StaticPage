import React, { useState } from 'react';
import {
    Eye,
    Download,
    Filter,
    Search,
    UploadCloud,
    Users,
    ChevronDown,
    Clock
} from 'lucide-react';
import FileViewerModal from '../../FileViewer/FileViewerModal';

const PolicyLibrary = () => {
    const [activeTab, setActiveTab] = useState('myFiles');
    const [viewerModal, setViewerModal] = useState({
        isOpen: false,
        fileUrl: '',
        fileType: '',
        fileName: ''
    });

    // Mock data for tables with Indian names and file URLs
    // Using actual files that exist in the public/samples folder
    const templatesData = [
        {
            id: 1,
            fileName: 'ISO 27001 Security Policy',
            fileType: 'PDF',
            fileUrl: '/samples/VAPTSummary.pdf', // Using actual VAPT PDF file
            regulationStandard: 'ISO 27001',
            controlNo: 'A.5.1.1',
            controlName: 'Information Security Policy',
            dateModified: '2023-08-15',
            assignedBy: 'Rajesh Kumar',
            editedBy: 'Priya Sharma',
            assignedTo: 'Development Team',
            status: 'Assigned'
        },
        {
            id: 2,
            fileName: 'GDPR Data Processing Guidelines',
            fileType: 'DOCX',
            fileUrl: '/samples/word.docx', // Using actual Word document
            regulationStandard: 'GDPR',
            controlNo: 'Art.28',
            controlName: 'Data Processing Agreement',
            dateModified: '2023-09-22',
            assignedBy: 'Vikram Singh',
            editedBy: 'Ananya Patel',
            assignedTo: 'Legal Team',
            status: 'Not Assigned'
        }
    ];

    const myFilesData = [
        ...templatesData,
        {
            id: 3,
            fileName: 'Quarterly Security Metrics',
            fileType: 'XLSX',
            fileUrl: '/samples/excel.xlsx', // Using actual Excel file
            regulationStandard: 'ISO 27001',
            controlNo: 'A.18.2.3',
            controlName: 'Technical Compliance Review',
            dateModified: '2023-10-05',
            assignedBy: 'Amit Shah',
            editedBy: 'Deepika Patel',
            assignedTo: 'Security Team',
            status: 'Assigned'
        }
    ];

    // Column headers configuration
    const columns = [
        { key: 'id', label: 'No.' },
        { key: 'fileName', label: 'File Name' },
        { key: 'fileType', label: 'File Type' },
        { key: 'regulationStandard', label: 'Regulation Standard' },
        { key: 'controlNo', label: 'Regulation Control No.' },
        { key: 'controlName', label: 'Regulation Control Name' },
        { key: 'dateModified', label: 'Date Modified' },
        { key: 'assignedBy', label: 'Assigned By' },
        { key: 'editedBy', label: 'Edited By' },
        { key: 'assignedTo', label: 'Assigned To' },
        { key: 'status', label: 'Status' }
    ];

    // Templates tab columns (without assignment and status columns)
    const templateColumns = [
        { key: 'id', label: 'No.' },
        { key: 'fileName', label: 'File Name' },
        { key: 'fileType', label: 'File Type' },
        { key: 'regulationStandard', label: 'Regulation Standard' },
        { key: 'controlNo', label: 'Regulation Control No.' },
        { key: 'controlName', label: 'Regulation Control Name' },
        { key: 'dateModified', label: 'Date Modified' }
    ];

    // Get status badge style
    const getStatusBadgeStyle = (status) => {
        switch (status) {
            case 'Assigned':
                return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
            case 'Not Assigned':
                return 'bg-gray-100 text-gray-700 border border-gray-200';
            default:
                return 'bg-gray-100 text-gray-700 border border-gray-200';
        }
    };

    // Open file viewer modal
    const openFileViewer = (file) => {
        setViewerModal({
            isOpen: true,
            fileUrl: file.fileUrl,
            fileType: file.fileType.toLowerCase(),
            fileName: file.fileName
        });
    };

    // Close file viewer modal
    const closeFileViewer = () => {
        setViewerModal({
            ...viewerModal,
            isOpen: false
        });
    };

    // Handle file download
    const handleDownload = (file) => {
        // In a real application, this would trigger a download
        // For now, we'll just open the file in a new tab
        window.open(file.fileUrl, '_blank');
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4 text-gray-800">Policy Library</h1>

            {/* Tabs */}
            <div className="flex border-b mb-4 bg-gradient-to-r from-indigo-50 to-white rounded-t-lg">
                <button
                    className={`py-3 px-6 font-medium relative transition-all ${activeTab === 'myFiles' ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-gray-800'}`}
                    onClick={() => setActiveTab('myFiles')}
                >
                    My Files
                    {activeTab === 'myFiles' && (
                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></span>
                    )}
                </button>
                <button
                    className={`py-3 px-6 font-medium relative transition-all ${activeTab === 'templates' ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-gray-800'}`}
                    onClick={() => setActiveTab('templates')}
                >
                    Templates
                    {activeTab === 'templates' && (
                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></span>
                    )}
                </button>
            </div>

            {/* Templates Tab Content */}
            {activeTab === 'templates' && (
                <div>
                    <div className="flex justify-between mb-4">
                        <div className="flex space-x-4">
                            {/* Search input */}
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search policies..."
                                    className="pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-72"
                                />
                                <div className="absolute left-3 top-2.5 text-gray-400">
                                    <Search size={16} />
                                </div>
                            </div>

                            {/* Filter button */}
                            <button className="flex items-center space-x-2 px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors">
                                <Filter size={16} />
                                <span>Filter</span>
                                <ChevronDown size={14} />
                            </button>
                        </div>

                        {/* Action buttons */}
                        <div className="flex space-x-3">
                            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm">
                                <UploadCloud size={16} />
                                <span>Upload</span>
                            </button>
                            <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors shadow-sm">
                                <Users size={16} />
                                <span>Assign Templates</span>
                            </button>
                        </div>
                    </div>

                    {/* Templates Table */}
                    <div className="rounded-lg border border-gray-200 shadow-lg">
                        <table className="min-w-full bg-white divide-y divide-gray-200">
                            <thead>
                                <tr className="bg-gray-50">
                                    {templateColumns.map((column) => (
                                        <th
                                            key={column.key}
                                            className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b"
                                        >
                                            <div className="flex items-center">
                                                <span>{column.label}</span>
                                            </div>
                                        </th>
                                    ))}
                                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {templatesData.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-3 py-2.5 text-sm text-gray-900">{item.id}</td>
                                        <td className="px-3 py-2.5 text-sm font-medium text-blue-600">{item.fileName}</td>
                                        <td className="px-3 py-2.5 text-sm text-gray-900">
                                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                {item.fileType}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2.5 text-sm text-gray-900">{item.regulationStandard}</td>
                                        <td className="px-3 py-2.5 text-sm text-gray-900">{item.controlNo}</td>
                                        <td className="px-3 py-2.5 text-sm text-gray-900">{item.controlName}</td>
                                        <td className="px-3 py-2.5 text-sm text-gray-900">
                                            <div className="flex items-center">
                                                <Clock size={14} className="text-gray-400 mr-1.5" />
                                                {item.dateModified}
                                            </div>
                                        </td>
                                        <td className="px-3 py-2.5 text-sm text-gray-900">
                                            <div className="flex space-x-2">
                                                <button
                                                    className="p-1 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
                                                    title="Open File"
                                                    onClick={() => openFileViewer(item)}
                                                >
                                                    <Eye size={16} className="text-blue-600" />
                                                </button>
                                                <button
                                                    className="p-1 bg-green-100 rounded-md hover:bg-green-200 transition-colors"
                                                    title="Download File"
                                                    onClick={() => handleDownload(item)}
                                                >
                                                    <Download size={16} className="text-green-600" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* My Files Tab Content */}
            {activeTab === 'myFiles' && (
                <div>
                    <div className="flex justify-between mb-4">
                        <div className="flex space-x-4">
                            {/* Search input */}
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search my files..."
                                    className="pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-72"
                                />
                                <div className="absolute left-3 top-2.5 text-gray-400">
                                    <Search size={16} />
                                </div>
                            </div>

                            {/* Filter button */}
                            <button className="flex items-center space-x-2 px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors">
                                <Filter size={16} />
                                <span>Filter</span>
                                <ChevronDown size={14} />
                            </button>
                        </div>
                    </div>

                    {/* My Files Table */}
                    <div className="rounded-lg border border-gray-200 shadow-lg">
                        <table className="min-w-full bg-white divide-y divide-gray-200">
                            <thead>
                                <tr className="bg-gray-50">
                                    {columns.map((column) => (
                                        <th
                                            key={column.key}
                                            className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b"
                                        >
                                            <div className="flex items-center">
                                                <span>{column.label}</span>
                                            </div>
                                        </th>
                                    ))}
                                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {myFilesData.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-3 py-2.5 text-sm text-gray-900">{item.id}</td>
                                        <td className="px-3 py-2.5 text-sm font-medium text-blue-600">{item.fileName}</td>
                                        <td className="px-3 py-2.5 text-sm text-gray-900">
                                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                {item.fileType}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2.5 text-sm text-gray-900">{item.regulationStandard}</td>
                                        <td className="px-3 py-2.5 text-sm text-gray-900">{item.controlNo}</td>
                                        <td className="px-3 py-2.5 text-sm text-gray-900">{item.controlName}</td>
                                        <td className="px-3 py-2.5 text-sm text-gray-900">
                                            <div className="flex items-center">
                                                <Clock size={14} className="text-gray-400 mr-1.5" />
                                                {item.dateModified}
                                            </div>
                                        </td>
                                        <td className="px-3 py-2.5 text-sm text-gray-900">{item.assignedBy}</td>
                                        <td className="px-3 py-2.5 text-sm text-gray-900">{item.editedBy}</td>
                                        <td className="px-3 py-2.5 text-sm text-gray-900">{item.assignedTo}</td>
                                        <td className="px-3 py-2.5 text-sm text-gray-900">
                                            <span className={`px-3 py-1 rounded-md text-xs font-medium inline-block min-w-[90px] text-center ${getStatusBadgeStyle(item.status)}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2.5 text-sm text-gray-900">
                                            <div className="flex space-x-2">
                                                <button
                                                    className="p-1 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
                                                    title="Open File"
                                                    onClick={() => openFileViewer(item)}
                                                >
                                                    <Eye size={16} className="text-blue-600" />
                                                </button>
                                                <button
                                                    className="p-1 bg-green-100 rounded-md hover:bg-green-200 transition-colors"
                                                    title="Download File"
                                                    onClick={() => handleDownload(item)}
                                                >
                                                    <Download size={16} className="text-green-600" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* File Viewer Modal */}
            <FileViewerModal
                isOpen={viewerModal.isOpen}
                onClose={closeFileViewer}
                fileUrl={viewerModal.fileUrl}
                fileType={viewerModal.fileType}
                fileName={viewerModal.fileName}
            />
        </div>
    );
};

export default PolicyLibrary;
