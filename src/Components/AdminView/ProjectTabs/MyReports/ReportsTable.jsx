import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Edit, Trash2, Calendar, User, Users, Plus, Upload } from 'lucide-react';
import { apiRequest } from '../../../../utils/api';
import { message } from 'antd';

const ReportsTable = ({ refreshTrigger }) => {
    const { projectid } = useParams();
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [reportToDelete, setReportToDelete] = useState(null);

    // Create Report form states
    const [createReportOpen, setCreateReportOpen] = useState(false);
    const [reportName, setReportName] = useState('');
    const [reportType, setReportType] = useState('Risk Assessment');
    const [uploadedFile, setUploadedFile] = useState(null);
    const fileInputRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Define fetchReports outside useEffect to avoid duplication
    const fetchReports = async () => {
        setLoading(true);
        try {
            // Call the API endpoint to get all sheets for this project
            const response = await apiRequest(
                'GET',
                `/api/rarpt/project/${projectid}/sheets/overview/`,
                null,
                true
            );

            console.log("Reports overview response:", response);

            if (response && response.data) {
                // Process the API response to format the data correctly
                const formattedReports = response.data.map(report => {
                    // Log each report to debug
                    console.log("Processing report:", report);

                    // Determine the appropriate report_tab based on the type
                    let reportTab;
                    switch (report.type) {
                        case 'Risk Assessment':
                            reportTab = 'riskAssessment';
                            break;
                        case 'Risk Treatment':
                            reportTab = 'riskTreatment';
                            break;
                        case 'VAPT':
                            reportTab = 'vapt';
                            break;
                        case 'ASIS':
                            reportTab = 'asisReport';
                            break;
                        default:
                            reportTab = 'riskAssessment';
                    }

                    // Format the created_at date for display
                    const dateObj = new Date(report.created_at);
                    const formattedDate = dateObj.toLocaleDateString();

                    // Extract creator and assignee names
                    // If created_by or assigned_to are objects with name property, use that
                    // Otherwise, use the ID or fallback to a default value
                    const creatorName =
                        typeof report.created_by === 'object' && report.created_by?.name
                            ? report.created_by.name
                            : report.created_by || 'Unknown';

                    const assigneeName =
                        typeof report.assigned_to === 'object' && report.assigned_to?.name
                            ? report.assigned_to.name
                            : report.assigned_to || 'Unassigned';

                    // Return formatted report object
                    return {
                        id: report.id,
                        name: report.name,
                        type: report.type,
                        created_by: creatorName,
                        assigned_to: assigneeName,
                        updated_on: formattedDate,
                        report_tab: reportTab,
                        project_id: report.project
                    };
                });

                setReports(formattedReports);
            } else {
                // Handle empty response
                setReports([]);
                message.info('No reports found for this project');
            }
        } catch (error) {
            console.error('Error fetching reports:', error);
            message.error('Failed to load reports');
            setReports([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch reports data from the API
    useEffect(() => {
        if (projectid) {
            fetchReports();
        }
    }, [projectid]);

    // Refresh data when triggered
    useEffect(() => {
        if (refreshTrigger) {
            fetchReports();
        }
    }, [refreshTrigger, projectid]);

    // Handle navigation to report
    const navigateToReport = (reportId, reportTab) => {
        try {
            // Ensure reportId is correctly passed (as a string)
            console.log(`Navigating to report with ID ${reportId} in tab ${reportTab}`);

            // Important: Check that reportId is a valid value
            if (!reportId) {
                console.error("Invalid report ID for navigation:", reportId);
                message.error("Cannot navigate to report: Invalid report ID");
                return;
            }

            // Make sure we're using the actual report ID from the API, not an index
            navigate(`/project/${projectid}/myreports/${reportTab}?reportId=${reportId}`);
        } catch (error) {
            console.error("Navigation error:", error);
            message.error("Error navigating to report");
        }
    };

    // Handle view report
    const handleView = (e, report) => {
        e.stopPropagation();
        navigateToReport(report.id, report.report_tab);
    };

    // Handle edit report
    const handleEdit = (e, report) => {
        e.stopPropagation();

        // Check if the report type actually supports editing
        const hasEditSupport = report.type === 'Risk Assessment' || report.type === 'Risk Treatment';

        if (!hasEditSupport) {
            // For report types without edit API support, show an informative message
            message.info(`Editing ${report.type} reports is currently view-only`);
        }

        // Navigate to the report regardless - the individual tab components will handle
        // showing appropriate controls based on edit capabilities
        navigateToReport(report.id, report.report_tab);
    };

    // Open delete confirmation
    const handleDeleteClick = (e, report) => {
        e.stopPropagation();
        setReportToDelete(report);
        setDeleteModalOpen(true);
    };

    // Handle delete report - use specific API endpoints based on report type
    const handleDelete = async () => {
        if (!reportToDelete) return;

        try {
            // Use the appropriate API endpoint based on report type
            let deleteEndpoint;
            switch (reportToDelete.type) {
                case 'Risk Assessment':
                    deleteEndpoint = `/api/rarpt/assessment-risks/${reportToDelete.id}/`;
                    break;
                case 'Risk Treatment':
                    deleteEndpoint = `/api/rarpt/assessment-risks/${reportToDelete.id}/`; // Same as Risk Assessment
                    break;
                case 'VAPT':
                    deleteEndpoint = `/api/rarpt/vapt/${reportToDelete.id}/delete/`;
                    break;
                case 'ASIS Report':
                case 'ASIS':
                    deleteEndpoint = `/api/rarpt/asis-reports/${reportToDelete.id}/`;
                    break;
                default:
                    // Fallback to generic sheets endpoint
                    deleteEndpoint = `/api/rarpt/sheets/${reportToDelete.id}/`;
            }

            // Call the API to delete the report
            await apiRequest(
                'DELETE',
                deleteEndpoint,
                null,
                true
            );

            // Update local state after successful delete
            setReports(reports.filter(report => report.id !== reportToDelete.id));
            message.success('Report deleted successfully');
        } catch (error) {
            console.error('Error deleting report:', error);
            message.error('Failed to delete report');
        } finally {
            setDeleteModalOpen(false);
            setReportToDelete(null);
        }
    };

    // Create new report
    const handleCreateReport = async () => {
        if (!reportName.trim()) {
            message.warning('Please enter a report name');
            return;
        }

        // Require file upload only for VAPT type
        if (reportType === 'VAPT' && !uploadedFile) {
            message.warning(`Please upload a file for VAPT reports`);
            return;
        }

        try {
            setIsUploading(true);
            setErrorMessage('');
            let endpoint;
            let payload;
            let formData = null;

            // Use specific endpoints based on report type
            if (reportType === 'Risk Assessment') {
                endpoint = `/api/rarpt/project/${projectid}/assessment-sheets/create/`;
                payload = {
                    name: reportName.trim()
                };

                const response = await apiRequest(
                    'POST',
                    endpoint,
                    payload,
                    true
                );

                if (response && response.data) {
                    message.success('Risk Assessment report created successfully');
                    setCreateReportOpen(false);
                    setReportName('');
                    setUploadedFile(null);
                    if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                    }
                    fetchReports(); // Refresh list
                }
            } else if (reportType === 'Risk Treatment') {
                // Use the Risk Treatment API endpoint
                endpoint = `/api/rarpt/project/${projectid}/treatment-sheets/create/`;
                payload = {
                    name: reportName.trim()
                };

                const response = await apiRequest(
                    'POST',
                    endpoint,
                    payload,
                    true
                );

                if (response && response.data) {
                    message.success('Risk Treatment report created successfully');
                    setCreateReportOpen(false);
                    setReportName('');
                    setUploadedFile(null);
                    if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                    }
                    fetchReports(); // Refresh list
                }
            } else if (reportType === 'VAPT') {
                // Use the VAPT API endpoint
                endpoint = `/api/rarpt/project/${projectid}/vapt/create/`;
                formData = new FormData();
                formData.append('name', reportName.trim());
                formData.append('file', uploadedFile);
                formData.append('project', projectid);

                // We're getting token from Cookies, not localStorage as in the sample

                const response = await apiRequest(
                    'POST',
                    endpoint,
                    formData,
                    true,
                    true // This flag enables multipart/form-data handling
                );

                if (response && response.data) {
                    message.success('VAPT report created successfully');
                    setCreateReportOpen(false);
                    setReportName('');
                    setUploadedFile(null);
                    setIsUploading(false);
                    if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                    }
                    fetchReports(); // Refresh list
                }
            } else if (reportType === 'ASIS') {
                // Use the ASIS Report API endpoint
                endpoint = `/api/rarpt/project/${projectid}/asis-reports/create/`;
                payload = {
                    name: reportName.trim()
                };

                const response = await apiRequest(
                    'POST',
                    endpoint,
                    payload,
                    true
                );

                if (response && response.data) {
                    message.success('ASIS Report created successfully');
                    setCreateReportOpen(false);
                    setReportName('');
                    setUploadedFile(null);
                    if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                    }
                    fetchReports(); // Refresh list
                }
            } else {
                // Use standard endpoint for other report types
                endpoint = `/api/rarpt/project/${projectid}/sheets/`;
                payload = {
                    name: reportName.trim(),
                    type: reportType,
                    project: projectid
                };

                const response = await apiRequest(
                    'POST',
                    endpoint,
                    payload,
                    true
                );

                if (response && response.data) {
                    message.success('Report created successfully');
                    setCreateReportOpen(false);
                    setReportName('');
                    setUploadedFile(null);
                    if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                    }
                    fetchReports(); // Refresh list
                }
            }
        } catch (error) {
            console.error('Error creating report:', error);
            setErrorMessage(error.message || 'Failed to create report');
            message.error('Failed to create report');
            setIsUploading(false);
        }
    };

    // Handle file change
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (reportType === 'VAPT') {
                setUploadedFile(file);

                // Auto-populate name field with file name (without extension) if empty
                if (!reportName) {
                    const fileName = file.name.split('.')[0];
                    setReportName(fileName);
                }
            }
        }
    };

    // Simple delete confirmation modal
    const DeleteConfirmationModal = () => {
        if (!deleteModalOpen) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                    <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
                    <p className="mb-6">Are you sure you want to delete the report "{reportToDelete?.name}"? This action cannot be undone.</p>
                    <div className="flex justify-end space-x-3">
                        <button
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            onClick={() => setDeleteModalOpen(false)}
                        >
                            Cancel
                        </button>
                        <button
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                            onClick={handleDelete}
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Create report modal component
    const CreateReportModal = () => {
        if (!createReportOpen) return null;

        // Use local state for form inputs to prevent focus loss
        const [localReportName, setLocalReportName] = useState(reportName);
        const [localReportType, setLocalReportType] = useState(reportType);
        const [localIsUploading, setLocalIsUploading] = useState(isUploading);

        // Update local state when parent state changes
        useEffect(() => {
            setLocalReportName(reportName);
            setLocalReportType(reportType);
            setLocalIsUploading(isUploading);
        }, [reportName, reportType, isUploading]);

        // Handle local submit that uses the local state values
        const handleLocalSubmit = () => {
            // Update parent state with local values
            setReportName(localReportName);
            setReportType(localReportType);
            // Call the actual submit function
            handleCreateReport();
        };

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                    <h3 className="text-lg font-semibold mb-4">Create New Report</h3>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Report Name</label>
                        <input
                            type="text"
                            value={localReportName}
                            onChange={(e) => setLocalReportName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Enter report name"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                        <select
                            value={localReportType}
                            onChange={(e) => setLocalReportType(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="Risk Assessment">Risk Assessment</option>
                            <option value="Risk Treatment">Risk Treatment</option>
                            <option value="VAPT">VAPT</option>
                            <option value="ASIS">ASIS Report</option>
                        </select>
                    </div>

                    {localReportType === 'VAPT' && (
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Upload File <span className="text-red-500">*</span>
                            </label>
                            <div className="flex items-center justify-center w-full">
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-8 h-8 mb-2 text-gray-500" />
                                        <p className="mb-2 text-sm text-gray-500">
                                            <span className="font-semibold">Click to upload</span> or drag and drop
                                        </p>
                                        <p className="text-xs text-gray-500">Accepted file types: PDF, DOC, DOCX, XLS, XLSX, ZIP, RAR</p>
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        className="hidden"
                                        onChange={handleFileChange}
                                        accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.rar"
                                        required={localReportType === 'VAPT'}
                                    />
                                </label>
                            </div>
                            {uploadedFile && (
                                <div className="mt-2 text-sm text-green-600 flex items-center">
                                    <div className="mr-2">✓</div>
                                    <div>File selected: {uploadedFile.name}</div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex justify-end space-x-3">
                        <button
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            onClick={() => {
                                setCreateReportOpen(false);
                                setUploadedFile(null);
                                setErrorMessage('');
                                if (fileInputRef.current) {
                                    fileInputRef.current.value = '';
                                }
                            }}
                            disabled={localIsUploading}
                        >
                            Cancel
                        </button>
                        <button
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
                            onClick={handleLocalSubmit}
                            disabled={localIsUploading}
                        >
                            {localIsUploading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Uploading...
                                </>
                            ) : 'Create'}
                        </button>
                    </div>

                    {errorMessage && (
                        <div className="mt-4 text-sm text-red-600 p-2 bg-red-50 rounded-md">
                            {errorMessage}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="w-full h-full p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Report List</h2>
                <button
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
                    onClick={() => setCreateReportOpen(true)}
                >
                    <Plus size={18} className="mr-2" />
                    Create Report
                </button>
            </div>

            <div className="overflow-hidden bg-white rounded-lg shadow">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Report Name
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Report Type
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Created By
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Assigned To
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Updated On
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {reports.map((report) => (
                                    <tr
                                        key={report.id}
                                        className="hover:bg-gray-50 cursor-pointer"
                                        onClick={() => navigateToReport(report.id, report.report_tab)}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className="flex justify-center space-x-3">
                                                {/* Remove eye button, clicking on row will navigate to report */}
                                                <button
                                                    className="p-1.5 bg-indigo-50 rounded-full hover:bg-indigo-100 transition-colors focus:outline-none"
                                                    onClick={(e) => handleEdit(e, report)}
                                                    title="Edit"
                                                >
                                                    <Edit size={18} className="text-indigo-600" />
                                                </button>

                                                <button
                                                    className="p-1.5 bg-red-50 rounded-full hover:bg-red-100 transition-colors focus:outline-none"
                                                    onClick={(e) => handleDeleteClick(e, report)}
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} className="text-red-600" />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {report.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${report.type === 'Risk Assessment' ? 'bg-indigo-100 text-indigo-800' :
                                                report.type === 'Risk Treatment' ? 'bg-blue-100 text-blue-800' :
                                                    report.type === 'VAPT' ? 'bg-green-100 text-green-800' :
                                                        'bg-amber-100 text-amber-800'
                                                }`}>
                                                {report.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <User size={16} className="mr-2 text-gray-400" />
                                                <div className="text-sm text-gray-900">{report.created_by}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <Users size={16} className="mr-2 text-gray-400" />
                                                <div className="text-sm text-gray-900">{report.assigned_to}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <Calendar size={16} className="mr-2 text-gray-400" />
                                                <div className="text-sm text-gray-900">{report.updated_on}</div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {reports.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-16 text-center">
                                            <div className="text-gray-500">
                                                <p className="text-xl mb-2">No reports found</p>
                                                <p className="text-sm">Create a new report to get started</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <DeleteConfirmationModal />
            <CreateReportModal />
        </div>
    );
};

export default ReportsTable; 