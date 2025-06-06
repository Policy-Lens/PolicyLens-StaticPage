import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Edit, Trash2, Calendar, User, Users, Plus, Upload, Eye } from 'lucide-react';
import { apiRequest } from '../../../../utils/api';
import { message } from 'antd';

const ReportsTable = ({ refreshTrigger, onReportOpen }) => {
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

    // New state for Risk Assessment upload modal
    const [riskAssessmentUploadOpen, setRiskAssessmentUploadOpen] = useState(false);
    const [selectedRiskReport, setSelectedRiskReport] = useState(null);
    const [excelFile, setExcelFile] = useState(null);
    const [isUploadingExcel, setIsUploadingExcel] = useState(false);

    // New state for Risk Treatment upload modal
    const [riskTreatmentUploadOpen, setRiskTreatmentUploadOpen] = useState(false);
    const [selectedTreatmentReport, setSelectedTreatmentReport] = useState(null);
    const [treatmentExcelFile, setTreatmentExcelFile] = useState(null);
    const [isUploadingTreatmentExcel, setIsUploadingTreatmentExcel] = useState(false);

    // New state for VAPT upload modal
    const [vaptUploadOpen, setVaptUploadOpen] = useState(false);
    const [selectedVaptReport, setSelectedVaptReport] = useState(null);
    const [vaptExcelFile, setVaptExcelFile] = useState(null);
    const [isUploadingVaptExcel, setIsUploadingVaptExcel] = useState(false);

    // New state for ASIS upload modal
    const [asisUploadOpen, setAsisUploadOpen] = useState(false);
    const [selectedAsisReport, setSelectedAsisReport] = useState(null);
    const [asisExcelFile, setAsisExcelFile] = useState(null);
    const [isUploadingAsisExcel, setIsUploadingAsisExcel] = useState(false);

    const excelFileInputRef = useRef(null);
    const treatmentExcelFileInputRef = useRef(null);
    const vaptExcelFileInputRef = useRef(null);
    const asisExcelFileInputRef = useRef(null);

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
    const navigateToReport = (reportId, reportTab, reportName) => {
        try {
            // Ensure reportId is correctly passed
            console.log(`Opening report with ID ${reportId} in tab ${reportTab}`);

            // Important: Check that reportId is a valid value
            if (!reportId) {
                console.error("Invalid report ID for navigation:", reportId);
                message.error("Cannot open report: Invalid report ID");
                return;
            }

            // If onReportOpen prop is provided, use it for multi-tab functionality
            if (onReportOpen) {
                onReportOpen({
                    id: reportId,
                    type: reportTab,
                    name: reportName,
                    report_tab: reportTab
                });
            } else {
                // Fallback to direct navigation for backward compatibility
                navigate(`/project/${projectid}/myreports/${reportTab}?reportId=${reportId}`);
            }
        } catch (error) {
            console.error("Navigation error:", error);
            message.error("Error opening report");
        }
    };

    // Handle view report
    const handleView = (e, report) => {
        e.stopPropagation();
        navigateToReport(report.id, report.report_tab, report.name);
    };

    // Handle edit report
    const handleEdit = (e, report) => {
        e.stopPropagation();
        console.log('Edit report:', report);
        // Implement edit functionality here
    };

    // Handle delete button click
    const handleDeleteClick = (e, report) => {
        e.stopPropagation();
        setReportToDelete(report);
        setDeleteModalOpen(true);
    };

    // Handle Risk Assessment Excel upload
    const handleRiskAssessmentUpload = (e, report) => {
        e.stopPropagation();
        setSelectedRiskReport(report);
        setRiskAssessmentUploadOpen(true);
        setExcelFile(null);
    };

    // Handle Excel file selection for Risk Assessment
    const handleExcelFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const allowedTypes = [
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-excel'
            ];
            if (allowedTypes.includes(file.type)) {
                setExcelFile(file);
            } else {
                message.error('Please select a valid Excel file (.xlsx or .xls)');
                e.target.value = '';
            }
        }
    };

    // Submit Risk Assessment Excel upload
    const handleRiskAssessmentExcelSubmit = async () => {
        if (!excelFile) {
            message.error('Please select an Excel file');
            return;
        }

        if (!selectedRiskReport) {
            message.error('No report selected');
            return;
        }

        setIsUploadingExcel(true);

        try {
            const formData = new FormData();
            formData.append('file', excelFile);

            const response = await apiRequest(
                'POST',
                `/api/rarpt/assessment-sheets/${selectedRiskReport.id}/risks/create/`,
                formData,
                true
            );

            if (response.status === 200 || response.status === 201) {
                message.success('Risk Assessment Excel file uploaded successfully');
                setRiskAssessmentUploadOpen(false);
                setExcelFile(null);
                if (excelFileInputRef.current) {
                    excelFileInputRef.current.value = '';
                }
                fetchReports(); // Refresh the reports list
            }
        } catch (error) {
            console.error('Error uploading Risk Assessment Excel:', error);
            message.error('Failed to upload Excel file');
        } finally {
            setIsUploadingExcel(false);
        }
    };

    // Handle Risk Treatment Excel upload
    const handleRiskTreatmentUpload = (e, report) => {
        e.stopPropagation();
        setSelectedTreatmentReport(report);
        setRiskTreatmentUploadOpen(true);
        setTreatmentExcelFile(null);
    };

    // Handle Excel file selection for Risk Treatment
    const handleTreatmentExcelFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const allowedTypes = [
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-excel'
            ];
            if (allowedTypes.includes(file.type)) {
                setTreatmentExcelFile(file);
            } else {
                message.error('Please select a valid Excel file (.xlsx or .xls)');
                e.target.value = '';
            }
        }
    };

    // Submit Risk Treatment Excel upload
    const handleRiskTreatmentExcelSubmit = async () => {
        if (!treatmentExcelFile) {
            message.error('Please select an Excel file');
            return;
        }

        if (!selectedTreatmentReport) {
            message.error('No report selected');
            return;
        }

        setIsUploadingTreatmentExcel(true);

        try {
            const formData = new FormData();
            formData.append('file', treatmentExcelFile);

            const response = await apiRequest(
                'POST',
                `/api/rarpt/treatment-sheets/${selectedTreatmentReport.id}/risks/create/`,
                formData,
                true
            );

            if (response.status === 200 || response.status === 201) {
                message.success('Risk Treatment Excel file uploaded successfully');
                setRiskTreatmentUploadOpen(false);
                setTreatmentExcelFile(null);
                if (treatmentExcelFileInputRef.current) {
                    treatmentExcelFileInputRef.current.value = '';
                }
                fetchReports(); // Refresh the reports list
            }
        } catch (error) {
            console.error('Error uploading Risk Treatment Excel:', error);
            message.error('Failed to upload Excel file');
        } finally {
            setIsUploadingTreatmentExcel(false);
        }
    };

    // Handle VAPT Excel upload
    const handleVaptUpload = (e, report) => {
        e.stopPropagation();
        setSelectedVaptReport(report);
        setVaptUploadOpen(true);
        setVaptExcelFile(null);
    };

    // Handle Excel file selection for VAPT
    const handleVaptExcelFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const allowedTypes = [
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-excel'
            ];
            if (allowedTypes.includes(file.type)) {
                setVaptExcelFile(file);
            } else {
                message.error('Please select a valid Excel file (.xlsx or .xls)');
                e.target.value = '';
            }
        }
    };

    // Submit VAPT Excel upload
    const handleVaptExcelSubmit = async () => {
        if (!vaptExcelFile) {
            message.error('Please select an Excel file');
            return;
        }

        if (!selectedVaptReport) {
            message.error('No report selected');
            return;
        }

        setIsUploadingVaptExcel(true);

        try {
            const formData = new FormData();
            formData.append('file', vaptExcelFile);

            const response = await apiRequest(
                'POST',
                `/api/rarpt/vapt/${selectedVaptReport.id}/risks/create/`,
                formData,
                true
            );

            if (response.status === 200 || response.status === 201) {
                message.success('VAPT Excel file uploaded successfully');
                setVaptUploadOpen(false);
                setVaptExcelFile(null);
                if (vaptExcelFileInputRef.current) {
                    vaptExcelFileInputRef.current.value = '';
                }
                fetchReports(); // Refresh the reports list
            }
        } catch (error) {
            console.error('Error uploading VAPT Excel:', error);
            message.error('Failed to upload Excel file');
        } finally {
            setIsUploadingVaptExcel(false);
        }
    };

    // Handle ASIS Excel upload
    const handleAsisUpload = (e, report) => {
        e.stopPropagation();
        setSelectedAsisReport(report);
        setAsisUploadOpen(true);
        setAsisExcelFile(null);
    };

    // Handle Excel file selection for ASIS
    const handleAsisExcelFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const allowedTypes = [
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-excel'
            ];
            if (allowedTypes.includes(file.type)) {
                setAsisExcelFile(file);
            } else {
                message.error('Please select a valid Excel file (.xlsx or .xls)');
                e.target.value = '';
            }
        }
    };

    // Submit ASIS Excel upload
    const handleAsisExcelSubmit = async () => {
        if (!asisExcelFile) {
            message.error('Please select an Excel file');
            return;
        }

        if (!selectedAsisReport) {
            message.error('No report selected');
            return;
        }

        setIsUploadingAsisExcel(true);

        try {
            const formData = new FormData();
            formData.append('file', asisExcelFile);

            const response = await apiRequest(
                'POST',
                `/api/rarpt/asis-reports/${selectedAsisReport.id}/risks/create/`,
                formData,
                true
            );

            if (response.status === 200 || response.status === 201) {
                message.success('ASIS Report Excel file uploaded successfully');
                setAsisUploadOpen(false);
                setAsisExcelFile(null);
                if (asisExcelFileInputRef.current) {
                    asisExcelFileInputRef.current.value = '';
                }
                fetchReports(); // Refresh the reports list
            }
        } catch (error) {
            console.error('Error uploading ASIS Excel:', error);
            message.error('Failed to upload Excel file');
        } finally {
            setIsUploadingAsisExcel(false);
        }
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

    // Risk Assessment Excel Upload Modal
    const RiskAssessmentUploadModal = () => {
        if (!riskAssessmentUploadOpen) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">
                            Upload Risk Assessment Excel
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Upload Excel file for: <span className="font-medium">{selectedRiskReport?.name}</span>
                        </p>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {/* Template Download Section */}
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h4 className="text-sm font-medium text-blue-800">Download Template</h4>
                                        <p className="mt-1 text-sm text-blue-600">
                                            Download the Risk Assessment template before uploading your data.
                                        </p>
                                        <div className="mt-2">
                                            <a
                                                href="/risk_assessment_template.xlsx"
                                                download="risk_assessment_template.xlsx"
                                                className="inline-flex items-center px-3 py-1 border border-blue-300 text-xs font-medium rounded text-blue-700 bg-white hover:bg-blue-50"
                                            >
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                Download Template
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* File Upload Section */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Excel File
                                </label>
                                <div className="flex items-center justify-center w-full">
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Upload className="w-8 h-8 mb-2 text-gray-500" />
                                            <p className="mb-2 text-sm text-gray-500">
                                                <span className="font-semibold">Click to upload</span> or drag and drop
                                            </p>
                                            <p className="text-xs text-gray-500">Excel files only (.xlsx, .xls)</p>
                                        </div>
                                        <input
                                            ref={excelFileInputRef}
                                            type="file"
                                            className="hidden"
                                            onChange={handleExcelFileChange}
                                            accept=".xlsx,.xls"
                                        />
                                    </label>
                                </div>
                                {excelFile && (
                                    <div className="mt-2 text-sm text-green-600 flex items-center">
                                        <div className="mr-2">✓</div>
                                        <div>File selected: {excelFile.name}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                        <button
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            onClick={() => {
                                setRiskAssessmentUploadOpen(false);
                                setExcelFile(null);
                                if (excelFileInputRef.current) {
                                    excelFileInputRef.current.value = '';
                                }
                            }}
                            disabled={isUploadingExcel}
                        >
                            Cancel
                        </button>
                        <button
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                            onClick={handleRiskAssessmentExcelSubmit}
                            disabled={!excelFile || isUploadingExcel}
                        >
                            {isUploadingExcel ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Uploading...
                                </>
                            ) : 'Upload Excel'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Risk Treatment Excel Upload Modal
    const RiskTreatmentUploadModal = () => {
        if (!riskTreatmentUploadOpen) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">
                            Upload Risk Treatment Excel
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Upload Excel file for: <span className="font-medium">{selectedTreatmentReport?.name}</span>
                        </p>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {/* Template Download Section */}
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h4 className="text-sm font-medium text-blue-800">Download Template</h4>
                                        <p className="mt-1 text-sm text-blue-600">
                                            Download the Risk Treatment template before uploading your data.
                                        </p>
                                        <div className="mt-2">
                                            <a
                                                href="/risk_treatment_template.xlsx"
                                                download="risk_treatment_template.xlsx"
                                                className="inline-flex items-center px-3 py-1 border border-blue-300 text-xs font-medium rounded text-blue-700 bg-white hover:bg-blue-50"
                                            >
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                Download Template
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* File Upload Section */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Excel File
                                </label>
                                <div className="flex items-center justify-center w-full">
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Upload className="w-8 h-8 mb-2 text-gray-500" />
                                            <p className="mb-2 text-sm text-gray-500">
                                                <span className="font-semibold">Click to upload</span> or drag and drop
                                            </p>
                                            <p className="text-xs text-gray-500">Excel files only (.xlsx, .xls)</p>
                                        </div>
                                        <input
                                            ref={treatmentExcelFileInputRef}
                                            type="file"
                                            className="hidden"
                                            onChange={handleTreatmentExcelFileChange}
                                            accept=".xlsx,.xls"
                                        />
                                    </label>
                                </div>
                                {treatmentExcelFile && (
                                    <div className="mt-2 text-sm text-green-600 flex items-center">
                                        <div className="mr-2">✓</div>
                                        <div>File selected: {treatmentExcelFile.name}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                        <button
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            onClick={() => {
                                setRiskTreatmentUploadOpen(false);
                                setTreatmentExcelFile(null);
                                if (treatmentExcelFileInputRef.current) {
                                    treatmentExcelFileInputRef.current.value = '';
                                }
                            }}
                            disabled={isUploadingTreatmentExcel}
                        >
                            Cancel
                        </button>
                        <button
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                            onClick={handleRiskTreatmentExcelSubmit}
                            disabled={!treatmentExcelFile || isUploadingTreatmentExcel}
                        >
                            {isUploadingTreatmentExcel ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Uploading...
                                </>
                            ) : 'Upload Excel'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // VAPT Excel Upload Modal
    const VaptUploadModal = () => {
        if (!vaptUploadOpen) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">
                            Upload VAPT Excel
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Upload Excel file for: <span className="font-medium">{selectedVaptReport?.name}</span>
                        </p>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {/* File Upload Section - No template for VAPT */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Excel File
                                </label>
                                <div className="flex items-center justify-center w-full">
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Upload className="w-8 h-8 mb-2 text-gray-500" />
                                            <p className="mb-2 text-sm text-gray-500">
                                                <span className="font-semibold">Click to upload</span> or drag and drop
                                            </p>
                                            <p className="text-xs text-gray-500">Excel files only (.xlsx, .xls)</p>
                                        </div>
                                        <input
                                            ref={vaptExcelFileInputRef}
                                            type="file"
                                            className="hidden"
                                            onChange={handleVaptExcelFileChange}
                                            accept=".xlsx,.xls"
                                        />
                                    </label>
                                </div>
                                {vaptExcelFile && (
                                    <div className="mt-2 text-sm text-green-600 flex items-center">
                                        <div className="mr-2">✓</div>
                                        <div>File selected: {vaptExcelFile.name}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                        <button
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            onClick={() => {
                                setVaptUploadOpen(false);
                                setVaptExcelFile(null);
                                if (vaptExcelFileInputRef.current) {
                                    vaptExcelFileInputRef.current.value = '';
                                }
                            }}
                            disabled={isUploadingVaptExcel}
                        >
                            Cancel
                        </button>
                        <button
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                            onClick={handleVaptExcelSubmit}
                            disabled={!vaptExcelFile || isUploadingVaptExcel}
                        >
                            {isUploadingVaptExcel ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Uploading...
                                </>
                            ) : 'Upload Excel'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // ASIS Excel Upload Modal
    const AsisUploadModal = () => {
        if (!asisUploadOpen) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">
                            Upload ASIS Report Excel
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Upload Excel file for: <span className="font-medium">{selectedAsisReport?.name}</span>
                        </p>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {/* Template Download Section */}
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h4 className="text-sm font-medium text-blue-800">Download Template</h4>
                                        <p className="mt-1 text-sm text-blue-600">
                                            Download the ASIS Report template before uploading your data.
                                        </p>
                                        <div className="mt-2">
                                            <a
                                                href="/asis_report_template.xlsx"
                                                download="asis_report_template.xlsx"
                                                className="inline-flex items-center px-3 py-1 border border-blue-300 text-xs font-medium rounded text-blue-700 bg-white hover:bg-blue-50"
                                            >
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                Download Template
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* File Upload Section */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Excel File
                                </label>
                                <div className="flex items-center justify-center w-full">
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Upload className="w-8 h-8 mb-2 text-gray-500" />
                                            <p className="mb-2 text-sm text-gray-500">
                                                <span className="font-semibold">Click to upload</span> or drag and drop
                                            </p>
                                            <p className="text-xs text-gray-500">Excel files only (.xlsx, .xls)</p>
                                        </div>
                                        <input
                                            ref={asisExcelFileInputRef}
                                            type="file"
                                            className="hidden"
                                            onChange={handleAsisExcelFileChange}
                                            accept=".xlsx,.xls"
                                        />
                                    </label>
                                </div>
                                {asisExcelFile && (
                                    <div className="mt-2 text-sm text-green-600 flex items-center">
                                        <div className="mr-2">✓</div>
                                        <div>File selected: {asisExcelFile.name}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                        <button
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            onClick={() => {
                                setAsisUploadOpen(false);
                                setAsisExcelFile(null);
                                if (asisExcelFileInputRef.current) {
                                    asisExcelFileInputRef.current.value = '';
                                }
                            }}
                            disabled={isUploadingAsisExcel}
                        >
                            Cancel
                        </button>
                        <button
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                            onClick={handleAsisExcelSubmit}
                            disabled={!asisExcelFile || isUploadingAsisExcel}
                        >
                            {isUploadingAsisExcel ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Uploading...
                                </>
                            ) : 'Upload Excel'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full h-full p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Reports Table</h2>
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
                                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {reports.map((report) => (
                                    <tr
                                        key={report.id}
                                        className="hover:bg-gray-50 cursor-pointer"
                                        onClick={() => navigateToReport(report.id, report.report_tab, report.name)}
                                    >
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
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className="flex justify-center space-x-3">
                                                <button
                                                    className="p-1.5 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors focus:outline-none"
                                                    onClick={(e) => handleView(e, report)}
                                                    title="View"
                                                >
                                                    <Eye size={18} className="text-blue-600" />
                                                </button>
                                                <button
                                                    className="p-1.5 bg-indigo-50 rounded-full hover:bg-indigo-100 transition-colors focus:outline-none"
                                                    onClick={(e) => handleEdit(e, report)}
                                                    title="Edit"
                                                >
                                                    <Edit size={18} className="text-indigo-600" />
                                                </button>

                                                {/* Risk Assessment Upload Button */}
                                                {report.type === 'Risk Assessment' && (
                                                    <button
                                                        className="p-1.5 bg-green-50 rounded-full hover:bg-green-100 transition-colors focus:outline-none"
                                                        onClick={(e) => handleRiskAssessmentUpload(e, report)}
                                                        title="Upload Excel"
                                                    >
                                                        <Upload size={18} className="text-green-600" />
                                                    </button>
                                                )}

                                                {/* Risk Treatment Upload Button */}
                                                {report.type === 'Risk Treatment' && (
                                                    <button
                                                        className="p-1.5 bg-green-50 rounded-full hover:bg-green-100 transition-colors focus:outline-none"
                                                        onClick={(e) => handleRiskTreatmentUpload(e, report)}
                                                        title="Upload Excel"
                                                    >
                                                        <Upload size={18} className="text-green-600" />
                                                    </button>
                                                )}

                                                {/* VAPT Upload Button */}
                                                {report.type === 'VAPT' && (
                                                    <button
                                                        className="p-1.5 bg-green-50 rounded-full hover:bg-green-100 transition-colors focus:outline-none"
                                                        onClick={(e) => handleVaptUpload(e, report)}
                                                        title="Upload Excel"
                                                    >
                                                        <Upload size={18} className="text-green-600" />
                                                    </button>
                                                )}

                                                {/* ASIS Upload Button */}
                                                {report.type === 'ASIS' && (
                                                    <button
                                                        className="p-1.5 bg-green-50 rounded-full hover:bg-green-100 transition-colors focus:outline-none"
                                                        onClick={(e) => handleAsisUpload(e, report)}
                                                        title="Upload Excel"
                                                    >
                                                        <Upload size={18} className="text-green-600" />
                                                    </button>
                                                )}

                                                <button
                                                    className="p-1.5 bg-red-50 rounded-full hover:bg-red-100 transition-colors focus:outline-none"
                                                    onClick={(e) => handleDeleteClick(e, report)}
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} className="text-red-600" />
                                                </button>
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
            <RiskAssessmentUploadModal />
            <RiskTreatmentUploadModal />
            <VaptUploadModal />
            <AsisUploadModal />
        </div>
    );
};

export default ReportsTable; 