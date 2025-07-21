import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Edit, Trash2, Calendar, User, Users, Plus, Upload, Eye, UserPlus, X, FileText } from 'lucide-react';
import { apiRequest } from '../../../../utils/api';
import { message } from 'antd';
import PropTypes from 'prop-types';
import PDFTronViewer from '../../../FileViewer/PDFTronViewer';
import ActivityLogs from './ActivityLogs';
import { AuthContext } from '../../../../AuthContext';
import { ProjectContext } from '../../../../Context/ProjectContext';
import UnifiedUploadModal from './UnifiedUploadModal';
import ConfirmationModal from './ConfirmationModal';




// ConfirmationModal component is now imported from shared component

const ReportsTable = ({ refreshTrigger, onRowClick, onReportDelete }) => {
    const { projectid } = useParams();
    const navigate = useNavigate();
    const { reportType: urlReportType, reportId: urlReportId } = useParams();
    const location = useLocation();
    
    // Context hooks - must be at the top level
    const { user } = useContext(AuthContext);
    const { projectRole } = useContext(ProjectContext);
    
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [reportToDelete, setReportToDelete] = useState(null);

    // Create Report form states
    const [createReportOpen, setCreateReportOpen] = useState(false);
    const [reportName, setReportName] = useState('');
    const [reportType, setReportType] = useState('');
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
    const [vaptPdfFile, setVaptPdfFile] = useState(null);
    const [isUploadingVaptPdf, setIsUploadingVaptPdf] = useState(false);

    // New state for VAPT PDF viewer modal
    const [vaptPdfViewerOpen, setVaptPdfViewerOpen] = useState(false);
    const [selectedVaptPdfUrl, setSelectedVaptPdfUrl] = useState(null);
    const [selectedVaptPdfName, setSelectedVaptPdfName] = useState(null);

    // New refs for VAPT upload
    const vaptPdfFileInputRef = useRef(null);

    // New state for ASIS upload modal
    const [asisUploadOpen, setAsisUploadOpen] = useState(false);
    const [selectedAsisReport, setSelectedAsisReport] = useState(null);
    const [asisExcelFile, setAsisExcelFile] = useState(null);
    const [isUploadingAsisExcel, setIsUploadingAsisExcel] = useState(false);

    const excelFileInputRef = useRef(null);
    const treatmentExcelFileInputRef = useRef(null);
    const asisExcelFileInputRef = useRef(null);

    // Assign Report Modal state
    const [isAssignReportModalOpen, setIsAssignReportModalOpen] = useState(false);
    const [assignmentMethod, setAssignmentMethod] = useState("specific"); // specific, random, sequential
    const [companyRepresentatives, setCompanyRepresentatives] = useState([]);
    const [selectedRepresentative, setSelectedRepresentative] = useState(null);
    const [selectedReports, setSelectedReports] = useState([]);
    const [isAssigning, setIsAssigning] = useState(false);

    // 1. Add edit modal state
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editReport, setEditReport] = useState(null);
    const [editName, setEditName] = useState("");
    const [editFile, setEditFile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editError, setEditError] = useState("");

    // Activity Logs state
    const [showLogs, setShowLogs] = useState(false);

    // State for detailed log view modal
    const [selectedLog, setSelectedLog] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    // Add state for unassign confirmation modal
    const [unassignModalOpen, setUnassignModalOpen] = useState(false);
    const [reportToUnassign, setReportToUnassign] = useState(null);

    // Refs for drag scrolling
    const tableContainerRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    // Add state for extracted data modal at the top of the component
    // const [extractedData, setExtractedData] = useState([]);
    // const [extractedType, setExtractedType] = useState("");
    // const [extractedErrors, setExtractedErrors] = useState([]);

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

            if (response && response.data) {
                // Process the API response to format the data correctly
                const formattedReports = response.data.map(report => {

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

                    // Extract creator and assignee names using *_details if available
                    const creatorName =
                        report.created_by_details && report.created_by_details.name
                            ? report.created_by_details.name
                            : (typeof report.created_by === 'object' && report.created_by?.name)
                                ? report.created_by.name
                                : report.created_by || 'Unknown';

                    const assigneeName =
                        report.assigned_to_details && report.assigned_to_details.name
                            ? report.assigned_to_details.name
                            : (typeof report.assigned_to === 'object' && report.assigned_to?.name)
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
                        project_id: report.project,
                        // Preserve original data for filtering
                        assigned_to_details: report.assigned_to_details,
                        created_by_details: report.created_by_details
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

    useEffect(() => {
        // If URL contains a report ID, auto-open that report
        if (urlReportId && urlReportType && reports.length > 0) {
            const report = reports.find(r => r.id.toString() === urlReportId && r.type.replace(/\s/g, '').toLowerCase() === urlReportType.toLowerCase());
            if (report) {
                handleView({ stopPropagation: () => {} }, report, true);
            }
        }
    }, [urlReportId, urlReportType, reports]);

    // Handle navigation to report
    const navigateToReport = (reportId, reportTab, reportName) => {
        try {
            // Important: Check that reportId is a valid value
            if (!reportId) {
                console.error("Invalid report ID for navigation:", reportId);
                message.error("Cannot open report: Invalid report ID");
                return;
            }

            // If onRowClick prop is provided, use it for multi-tab functionality
            if (onRowClick) {
                onRowClick({
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
        e.stopPropagation && e.stopPropagation();
        if (onRowClick) {
            onRowClick(report);
        } else {
            // Fallback to navigation if onRowClick is not provided
            const typeSlug = report.type.replace(/\s/g, '').toLowerCase();
            navigate(`/project/${projectid}/myreports/${typeSlug}/${report.id}/extracted`);
        }
    };

    // Handle edit report
    const handleEdit = (e, report) => {
        e.stopPropagation();
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
    const handleRiskAssessmentExcelSubmit = async (file) => {
        if (!file) {
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
            formData.append('file', file);

            const response = await apiRequest(
                'POST',
                `/api/rarpt/assessment-sheets/${selectedRiskReport.id}/risks/create/`,
                formData,
                true
            );

            if (response.status === 200 || response.status === 201) {
                message.success('Risk Assessment Excel file uploaded successfully');
                setRiskAssessmentUploadOpen(false);
                fetchReports(); // Refresh the reports list
                // After successful Excel upload in handleRiskAssessmentExcelSubmit, handleRiskTreatmentExcelSubmit, handleAsisExcelSubmit:
                // setExtractedData(response.data.risks || response.data.controls || []);
                // setExtractedType('Risk Assessment'/'Risk Treatment'/'ASIS');
                // setExtractedErrors(response.data.errors || []);
                // setExtractedModalOpen(true);
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
    const handleRiskTreatmentExcelSubmit = async (file) => {
        if (!file) {
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
            formData.append('file', file);

            const response = await apiRequest(
                'POST',
                `/api/rarpt/treatment-sheets/${selectedTreatmentReport.id}/risks/create/`,
                formData,
                true
            );

            if (response.status === 200 || response.status === 201) {
                message.success('Risk Treatment Excel file uploaded successfully');
                setRiskTreatmentUploadOpen(false);
                fetchReports(); // Refresh the reports list
                // After successful Excel upload in handleRiskAssessmentExcelSubmit, handleRiskTreatmentExcelSubmit, handleAsisExcelSubmit:
                // setExtractedData(response.data.risks || response.data.controls || []);
                // setExtractedType('Risk Assessment'/'Risk Treatment'/'ASIS');
                // setExtractedErrors(response.data.errors || []);
                // setExtractedModalOpen(true);
            }
        } catch (error) {
            console.error('Error uploading Risk Treatment Excel:', error);
            message.error('Failed to upload Excel file');
        } finally {
            setIsUploadingTreatmentExcel(false);
        }
    };

    // Handle VAPT PDF upload
    const handleVaptUpload = (e, report) => {
        e.stopPropagation();
        setSelectedVaptReport(report);
        setVaptUploadOpen(true);
        setVaptPdfFile(null);
    };

    // Handle PDF file selection for VAPT
    const handleVaptPdfFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const allowedTypes = [
                'application/pdf'
            ];
            if (allowedTypes.includes(file.type)) {
                setVaptPdfFile(file);
            } else {
                message.error('Please select a valid PDF file (.pdf)');
                e.target.value = '';
            }
        }
    };

    // Submit VAPT PDF upload
    const handleVaptPdfSubmit = async (file) => {
        if (!file) {
            message.error('Please select a PDF file');
            return;
        }

        if (!selectedVaptReport) {
            message.error('No report selected');
            return;
        }

        setIsUploadingVaptPdf(true);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await apiRequest(
                'PATCH',
                `/api/rarpt/vapt/${selectedVaptReport.id}/update/`,
                formData,
                true,
                true // Enable multipart/form-data
            );

            if (response.status === 200) {
                message.success('VAPT PDF file uploaded successfully');
                setVaptUploadOpen(false);
                fetchReports(); // Refresh the reports list
            }
        } catch (error) {
            console.error('Error uploading VAPT PDF:', error);
            message.error('Failed to upload PDF file');
        } finally {
            setIsUploadingVaptPdf(false);
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
    const handleAsisExcelSubmit = async (file) => {
        if (!file) {
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
            formData.append('file', file);

            const response = await apiRequest(
                'POST',
                `/api/rarpt/asis-reports/${selectedAsisReport.id}/controls/create/`,
                formData,
                true
            );

            if (response.status === 200 || response.status === 201) {
                message.success('ASIS Report Excel file uploaded successfully');
                setAsisUploadOpen(false);
                fetchReports(); // Refresh the reports list
                // After successful Excel upload in handleRiskAssessmentExcelSubmit, handleRiskTreatmentExcelSubmit, handleAsisExcelSubmit:
                // setExtractedData(response.data.risks || response.data.controls || []);
                // setExtractedType('Risk Assessment'/'Risk Treatment'/'ASIS');
                // setExtractedErrors(response.data.errors || []);
                // setExtractedModalOpen(true);
            }
        } catch (error) {
            console.error('Error uploading ASIS Excel:', error);
            message.error('Failed to upload Excel file');
        } finally {
            setIsUploadingAsisExcel(false);
        }
    };

    // 2. Fix delete logic
    const handleDelete = async () => {
        if (!reportToDelete) return;
        try {
            let deleteEndpoint;
            switch (reportToDelete.type) {
                case 'Risk Assessment':
                    deleteEndpoint = `/api/rarpt/assessment-sheets/${reportToDelete.id}/`;
                    break;
                case 'Risk Treatment':
                    deleteEndpoint = `/api/rarpt/treatment-sheets/${reportToDelete.id}/`;
                    break;
                case 'VAPT':
                    deleteEndpoint = `/api/rarpt/vapt/${reportToDelete.id}/delete/`;
                    break;
                case 'ASIS':
                    deleteEndpoint = `/api/rarpt/asis-reports/${reportToDelete.id}/`;
                    break;
                default:
                    deleteEndpoint = `/api/rarpt/sheets/${reportToDelete.id}/`;
            }
            await apiRequest('DELETE', deleteEndpoint, null, true);
            setReports(reports.filter(r => r.id !== reportToDelete.id));
            message.success('Report deleted successfully');
            
            // Close the corresponding tab if it's open
            if (onReportDelete) {
                onReportDelete(reportToDelete);
            }
        } catch (error) {
            message.error('Failed to delete report');
        } finally {
            setDeleteModalOpen(false);
            setReportToDelete(null);
        }
    };

    // Create new report
    const handleCreateReport = async (name, type, file) => {
        if (!name.trim()) {
            message.warning('Please enter a report name');
            return;
        }

        // Require file upload only for VAPT type
        if (type === 'VAPT' && !file) {
            message.warning(`Please upload a file for VAPT reports`);
            return;
        }

            setIsUploading(true);
            setErrorMessage('');
        try {
            let endpoint;
            let payload;
            let formData = null;

            // Use specific endpoints based on report type
            if (type === 'Risk Assessment') {
                endpoint = `/api/rarpt/project/${projectid}/assessment-sheets/create/`;
                payload = {
                    name: name.trim()
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
            } else if (type === 'Risk Treatment') {
                // Use the Risk Treatment API endpoint
                endpoint = `/api/rarpt/project/${projectid}/treatment-sheets/create/`;
                payload = {
                    name: name.trim()
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
            } else if (type === 'VAPT') {
                // Use the VAPT API endpoint
                endpoint = `/api/rarpt/project/${projectid}/vapt/create/`;
                formData = new FormData();
                formData.append('name', name.trim());
                formData.append('file', file);
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
            } else if (type === 'ASIS' || type === 'ASIS Report') {
                // Use the ASIS Report API endpoint
                endpoint = `/api/rarpt/project/${projectid}/asis-reports/create/`;
                payload = {
                    name: name.trim()
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
                    name: name.trim(),
                    type: type,
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
        } finally {
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

    // Function to open the assign report modal
    const openAssignReportModal = async () => {
        setIsAssignReportModalOpen(true);
        // No need to call fetchCompanyRepresentatives - project team is already loaded via useEffect
    };

    // Handle assign reports
    const handleAssignReports = async () => {
        if (assignmentMethod === "specific") {
            if (!selectedRepresentative) {
                message.warning("Please select a representative");
                return;
            }
            if (selectedReports.length === 0) {
                message.warning("Please select at least one report");
                return;
            }
        }

        setIsAssigning(true);
        try {
            // Make real API calls for each selected report
            const assignPromises = selectedReports.map(async (reportId) => {
                const report = reports.find((r) => r.id === reportId);
                if (!report) return;

                let endpoint;
                switch (report.type) {
                    case 'Risk Assessment':
                        endpoint = `/api/rarpt/assessment-sheets/${reportId}/assign/`;
                        break;
                    case 'Risk Treatment':
                        endpoint = `/api/rarpt/treatment-sheets/${reportId}/assign/`;
                        break;
                    case 'VAPT':
                        endpoint = `/api/rarpt/vapt/${reportId}/assign/`;
                        break;
                    case 'ASIS':
                    case 'ASIS Report':
                        endpoint = `/api/rarpt/asis-reports/${reportId}/assign/`;
                        break;
                    default:
                        return;
                }

                const payload = { assigned_to: selectedRepresentative };
                const response = await apiRequest('POST', endpoint, payload, true);
                if (response.status !== 200 && response.status !== 201) {
                    throw new Error(`Failed to assign report ${reportId}: ${response.statusText}`);
                }
                return response;
            });

            const results = await Promise.all(assignPromises);
            if (results.every(r => r && (r.status === 200 || r.status === 201))) {
                message.success('Reports assigned successfully');
                setIsAssignReportModalOpen(false);
                setSelectedReports([]);
                setSelectedRepresentative(null);
                fetchReports(); // Refresh to reflect assignment
            } else {
                throw new Error('One or more assignments failed');
            }
        } catch (error) {
            console.error("Error assigning reports:", error);
            message.error("Failed to assign reports");
        } finally {
            setIsAssigning(false);
        }
    };

    // Get unassigned reports for the modal
    const getUnassignedReports = () => {
        return reports.filter(report => report.assigned_to === 'Unassigned');
    };

    // 3. Edit modal logic
    const openEditModal = (report) => {
        setEditReport(report);
        setEditName(report.name);
        setEditFile(null);
        setEditError("");
        setEditModalOpen(true);
    };
    const closeEditModal = () => {
        setEditModalOpen(false);
        setEditReport(null);
        setEditName("");
        setEditFile(null);
        setEditError("");
    };
    const handleEditFileChange = (e) => {
        const file = e.target.files[0];
        if (file) setEditFile(file);
    };
    const handleEditSubmit = async (name, file) => {
        if (!editReport) return;
        setIsEditing(true);
        setEditError("");
        try {
            let endpoint, payload, method = 'PUT', isVapt = false;
            switch (editReport.type) {
                case 'Risk Assessment':
                    endpoint = `/api/rarpt/assessment-sheets/${editReport.id}/`;
                    payload = { name };
                    break;
                case 'Risk Treatment':
                    endpoint = `/api/rarpt/treatment-sheets/${editReport.id}/`;
                    payload = { name };
                    break;
                case 'VAPT':
                    endpoint = `/api/rarpt/vapt/${editReport.id}/update/`;
                    method = 'PATCH';
                    isVapt = true;
                    break;
                case 'ASIS':
                    endpoint = `/api/rarpt/asis-reports/${editReport.id}/`;
                    payload = { name };
                    break;
                default:
                    endpoint = `/api/rarpt/sheets/${editReport.id}/`;
                    payload = { name };
            }
            let response;
            if (isVapt) {
                const formData = new FormData();
                formData.append('name', name);
                if (file) formData.append('file', file);
                response = await apiRequest(method, endpoint, formData, true, true);
            } else {
                response = await apiRequest(method, endpoint, payload, true);
            }
            if (response && response.data) {
                setReports(reports.map(r => r.id === editReport.id ? { ...r, name } : r));
                message.success('Report updated successfully');
                closeEditModal();
                fetchReports();
            } else {
                setEditError('Failed to update report');
            }
        } catch (error) {
            setEditError('Failed to update report');
        } finally {
            setIsEditing(false);
        }
    };

    // 4. Add Edit button to table


    // Add openCreateReportModal
    const openCreateReportModal = () => {
        setCreateReportOpen(true);
        setIsUploading(false);
        setErrorMessage('');
        setUploadedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Add the new ExtractedDataModal component at the bottom of the file, before return:
    const riskAssessmentFields = [
      { key: 'risk_id', label: 'Risk ID', group: 'gray' },
      { key: 'vulnerability_type', label: 'Vulnerability Type', group: 'gray' },
      { key: 'threat_description', label: 'Threat Description', group: 'gray' },
      { key: 'context', label: 'Context', group: 'gray' },
      { key: 'applicable_activity', label: 'Applicable Activity', group: 'gray' },
      { key: 'impact_confidentiality', label: 'Impact on Confidentiality (Y/N)', group: 'blue' },
      { key: 'impact_integrity', label: 'Impact on Integrity (Y/N)', group: 'blue' },
      { key: 'impact_availability', label: 'Impact on Availability (Y/N)', group: 'blue' },
      { key: 'breach_legal', label: 'Breach of legal obligation (Y/N)', group: 'blue' },
      { key: 'impact_customer', label: 'On customer', group: 'blue' },
      { key: 'impact_operating', label: 'On operating capability', group: 'blue' },
      { key: 'impact_financial', label: 'Financial damage', group: 'blue' },
      { key: 'impact_severity', label: 'Severity / Magnitude', group: 'blue' },
      { key: 'consequence_rating', label: 'Consequence rating', group: 'orange' },
      { key: 'likelihood_rating', label: 'Likelihood rating', group: 'orange' },
      { key: 'existing_control_desc', label: 'Description', group: 'yellow' },
      { key: 'existing_control_rating', label: 'Rating', group: 'yellow' },
      { key: 'risk_rating', label: 'Risk Rating', group: 'black' },
      { key: 'risk_category', label: 'Risk Category', group: 'black' },
      { key: 'department', label: 'Department', group: 'black' },
      { key: 'risk_owner', label: 'Risk Owner', group: 'black' },
      { key: 'risk_mitigation_strategy', label: 'Risk Mitigation Strategy', group: 'black' },
      { key: 'applicable_saf_control', label: 'Applicable Saf Control', group: 'blue2' },
      { key: 'saf_control_desc', label: 'Saf Control Description', group: 'blue2' },
      { key: 'meets_legal', label: 'Meets all relevant controls meet legal/other requirements? (Y/N)', group: 'blue2' },
      { key: 'revised_control_rating', label: 'Revised control rating', group: 'blue2' },
      { key: 'residual_risk_acceptable', label: 'Residual risk Acceptable to risk owner? (Y/N)', group: 'blue2' },
      { key: 'further_planned_action', label: 'Further Planned action', group: 'green' },
      { key: 'task_id', label: 'Task ID', group: 'green' },
      { key: 'task_description', label: 'Task Description', group: 'green' },
      { key: 'task_owner', label: 'Task Owner', group: 'green' },
      { key: 'ongoing_task', label: 'Ongoing task? (Y/N)', group: 'green' },
      { key: 'planned_completion_date', label: 'If not ongoing, planned completion date', group: 'green' },
      { key: 'recurrent_task', label: 'Recurrent task? (Y/N)', group: 'green' },
      { key: 'recurrent_frequency', label: 'If yes, frequency', group: 'green' },
    ];

    const groupColors = {
      gray: 'bg-gray-200 text-gray-800',
      blue: 'bg-blue-100 text-blue-800',
      blue2: 'bg-blue-300 text-blue-900',
      orange: 'bg-orange-100 text-orange-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      green: 'bg-green-100 text-green-800',
      black: 'bg-black text-white',
    };

    // Remove ExtractedDataModal, DetailedViewModal, and all usages for extracted data
    // Ensure only navigation to /extracted is used for viewing extracted data

    // Add this handler function
    // const handleRowView = async (report) => {
    //     try {
    //         // For VAPT reports, show PDF viewer if file exists
    //         if (report.type === 'VAPT') {
    //             const response = await apiRequest(
    //                 'GET',
    //                 `/api/rarpt/vapt/${report.id}/`,
    //                 null,
    //                 true
    //             );

    //             if (response && response.data && response.data.file) {
    //                 setSelectedVaptPdfUrl(response.data.file);
    //                 setSelectedVaptPdfName(response.data.name);
    //                 setVaptPdfViewerOpen(true);
    //             } else {
    //                 message.warning('No PDF file available for this VAPT report');
    //             }
    //             return;
    //         }

    //         // For other report types, fetch extracted data and show modal
    //         let endpoint;
    //         switch (report.type) {
    //             case 'Risk Assessment':
    //                 endpoint = `/api/rarpt/assessment-sheets/${report.id}/risks/`;
    //                 break;
    //             case 'Risk Treatment':
    //                 endpoint = `/api/rarpt/treatment-sheets/${report.id}/risks/`;
    //                 break;
    //             case 'ASIS':
    //                 endpoint = `/api/rarpt/asis-reports/${report.id}/controls/`;
    //                 break;
    //             default:
    //                 endpoint = `/api/rarpt/sheets/${report.id}/data/`;
    //         }

    //         const response = await apiRequest('GET', endpoint, null, true);

    //         if (response && response.data) {
    //             setExtractedData(response.data.risks || response.data.controls || response.data || []);
    //             setExtractedType(report.type);
    //             setExtractedErrors(response.data.errors || []);
    //             // setExtractedModalOpen(true); // This line is removed
    //         } else {
    //             message.info('No data available for this report');
    //         }
    //     } catch (error) {
    //         console.error('Error fetching report data:', error);
    //         message.error('Failed to load report data');
    //     }
    // };

    // Add Create Report Modal Component
    const CreateReportModal = ({ isOpen, onClose, onSubmit, isSubmitting, error }) => {
      const [localReportName, setLocalReportName] = useState('');
      const [localReportType, setLocalReportType] = useState('');
      const [localUploadedFile, setLocalUploadedFile] = useState(null);

        useEffect(() => {
        if (isOpen) {
          setLocalReportName('');
          setLocalReportType('');
          setLocalUploadedFile(null);
        }
      }, [isOpen]);

      const handleLocalFileChange = (e) => {
        const file = e.target.files[0];
        if (file) setLocalUploadedFile(file);
      };

        const handleLocalSubmit = () => {
        if (!localReportType) {
          // Show error or prevent submission
          return;
        }
        onSubmit(localReportName, localReportType, localUploadedFile);
      };

      if (!isOpen) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                    <h3 className="text-lg font-semibold mb-4">Create New Report</h3>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Report Name</label>
                        <input
                            type="text"
                            value={localReportName}
                onChange={e => setLocalReportName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isSubmitting}
                            placeholder="Enter report name"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                        <select
                            value={localReportType}
                onChange={e => setLocalReportType(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isSubmitting}
                        >
                            <option value="">Select report type</option>
                            <option value="Risk Assessment">Risk Assessment</option>
                            <option value="Risk Treatment">Risk Treatment</option>
                            <option value="VAPT">VAPT</option>
                <option value="ASIS">ASIS</option>
                        </select>
                    </div>
                    {localReportType === 'VAPT' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload File (optional)</label>
                                    <input
                                        type="file"
                  onChange={handleLocalFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  accept=".pdf,.doc,.docx"
                />
                                </div>
                            )}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}
                    <div className="flex justify-end space-x-3">
                        <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleLocalSubmit}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isSubmitting || !localReportName.trim() || !localReportType}
              >
                {isSubmitting ? 'Creating...' : 'Create Report'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    CreateReportModal.propTypes = {
      isOpen: PropTypes.bool.isRequired,
      onClose: PropTypes.func.isRequired,
      onSubmit: PropTypes.func.isRequired,
      isSubmitting: PropTypes.bool.isRequired,
      error: PropTypes.string,
    };

    // UploadModal component removed - using UnifiedUploadModal instead

    // Fix the EditReportModal to be a proper component
    const EditReportModal = ({ isOpen, onClose, report, onSubmit, isSubmitting, error }) => {
      const [localEditName, setLocalEditName] = useState('');
      const [localEditFile, setLocalEditFile] = useState(null);

      useEffect(() => {
        if (report) {
          setLocalEditName(report.name);
          setLocalEditFile(null);
        }
      }, [report]);

      const handleLocalEditFileChange = (e) => {
        const file = e.target.files[0];
        if (file) setLocalEditFile(file);
      };

      const handleLocalEditSubmit = () => {
        onSubmit(localEditName, localEditFile);
      };

      if (!isOpen || !report) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Edit Report</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Report Name</label>
                                        <input
                type="text"
                value={localEditName}
                onChange={e => setLocalEditName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isSubmitting}
              />
                                </div>
            {report.type === 'VAPT' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Replace File (optional)</label>
                                                        <input
                  type="file"
                  onChange={handleLocalEditFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  accept=".pdf,.doc,.docx"
                />
                                        </div>
                                    )}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}
            <div className="flex justify-end space-x-3">
                        <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                onClick={handleLocalEditSubmit}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    EditReportModal.propTypes = {
      isOpen: PropTypes.bool.isRequired,
      onClose: PropTypes.func.isRequired,
      report: PropTypes.object,
      onSubmit: PropTypes.func.isRequired,
      isSubmitting: PropTypes.bool.isRequired,
      error: PropTypes.string,
    };

    // Helper: check role (use actual roles)
    const isSuperConsultant = user?.role === 'Super Consultant' || projectRole === 'super consultant';
    const isConsultantAdmin = user?.role === 'consultant admin' || projectRole === 'consultant admin';
    const isCompanyAdmin = user?.role === 'company' || projectRole === 'company';
    const isCompanyRep = user?.role === 'company_representative' || projectRole === 'company_representative';
    const isConsultant = user?.role === 'consultant' || projectRole === 'consultant';
    const isAuditor = user?.role === 'auditor' || projectRole === 'auditor';
    const isInternalAuditor = user?.role === 'internal_auditor' || projectRole === 'internal_auditor';
    const isAssignedUser = isCompanyRep || isConsultant || isAuditor || isInternalAuditor;
    const isNormalUser = !isSuperConsultant && !isConsultantAdmin && !isCompanyAdmin && !isAssignedUser;

    // Filter reports based on role
    let visibleReports = reports;
    if (isAssignedUser) {
        // For assigned users, show only reports assigned to them
        visibleReports = reports.filter(r => {
            return r.assigned_to_details && r.assigned_to_details.id === user?.id;
        });
    } else if (isNormalUser) {
        visibleReports = [];
    }

    // Permissions
    const canCreate = isSuperConsultant || isConsultantAdmin || isCompanyAdmin;
    const canEdit = (isSuperConsultant || isConsultantAdmin || isCompanyAdmin) || isAssignedUser;
    const canDelete = isSuperConsultant || isConsultantAdmin;
    const canAssign = isSuperConsultant || isConsultantAdmin || isCompanyAdmin;
    const canViewLogs = isSuperConsultant || isConsultantAdmin || isCompanyAdmin;

    // Fetch project team for assignment (only project members, no duplicates, show role)
    useEffect(() => {
        const fetchTeam = async () => {
            if (!projectid) return;
            try {
                const res = await apiRequest('GET', `/api/project/${projectid}/members/`, null, true);
                if (res.status === 200 && Array.isArray(res.data.members)) {
                    // Only allow assignment to project members (no duplicates)
                    const uniqueMembers = [];
                    const seen = new Set();
                    for (const m of res.data.members) {
                        if (!seen.has(m.id)) {
                            seen.add(m.id);
                            uniqueMembers.push(m);
                        }
                    }
                    setCompanyRepresentatives(uniqueMembers);
                }
            } catch (err) {
                setCompanyRepresentatives([]);
            }
        };
        fetchTeam();
    }, [projectid]);

    // Hide table for normal users with no assigned reports
    if (isNormalUser || (isAssignedUser && visibleReports.length === 0)) {
        return (
            <div className="w-full h-full p-6 flex items-center justify-center text-gray-400 text-lg">
                No reports assigned to you yet.
            </div>
        );
    }

    // Unassign handler
    const handleUnassign = async (report) => {
        if (!report) return;
        let endpoint;
        switch (report.type) {
            case 'Risk Assessment':
                endpoint = `/api/rarpt/assessment-sheets/${report.id}/assign/`;
                break;
            case 'Risk Treatment':
                endpoint = `/api/rarpt/treatment-sheets/${report.id}/assign/`;
                break;
            case 'VAPT':
                endpoint = `/api/rarpt/vapt/${report.id}/assign/`;
                break;
            case 'ASIS':
            case 'ASIS Report':
                endpoint = `/api/rarpt/asis-reports/${report.id}/assign/`;
                break;
            default:
                return;
        }
        try {
            await apiRequest('POST', endpoint, { assigned_to: null }, true);
            message.success('Access revoked successfully');
            setUnassignModalOpen(false);
            setReportToUnassign(null);
            fetchReports();
        } catch (err) {
            message.error('Failed to revoke access');
        }
    };

    // Handle unassign button click - opens confirmation modal
    const handleUnassignClick = (e, report) => {
        e.stopPropagation();
        setReportToUnassign(report);
        setUnassignModalOpen(true);
    };

    return (
        <div className="w-full h-full p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Reports Table</h2>
                <div className="flex gap-3">
                    {canViewLogs && (
                        <button
                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md font-medium flex items-center"
                            onClick={() => setShowLogs(true)}
                        >
                            <span className="mr-2"><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7"/><path d="M16 3v4"/><path d="M8 3v4"/><path d="M4 11h16"/></svg></span>
                            Activity Logs
                        </button>
                    )}
                    {canAssign && (
                        <button
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium flex items-center"
                            onClick={openAssignReportModal}
                        >
                            <UserPlus className="mr-2" size={18} /> Assign Reports
                        </button>
                    )}
                    {canCreate && (
                        <button
                            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-md font-medium flex items-center"
                            onClick={openCreateReportModal}
                        >
                            <Plus className="mr-2" size={18} /> Create Report
                        </button>
                    )}
                </div>
            </div>
            {showLogs && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-6"
                    onWheel={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    <div 
                        className="bg-white rounded-lg shadow-lg w-full max-w-4xl h-[90vh] flex flex-col"
                        onWheel={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-semibold text-gray-800">Activity Logs</span>
                            </div>
                            <button
                                className="text-gray-500 hover:text-gray-700 transition-colors"
                                onClick={() => setShowLogs(false)}
                            >
                                <span className="text-2xl">&times;</span>
                            </button>
                        </div>
                        <div 
                            className="flex-1 overflow-hidden p-4"
                            onWheel={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            <div 
                                className="h-full overflow-y-auto"
                                onWheel={(e) => e.stopPropagation()}
                                onMouseDown={(e) => e.stopPropagation()}
                            >
                                <ActivityLogs />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="overflow-hidden bg-white rounded-lg shadow border border-gray-200">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 table-fixed">
                            <thead className="bg-gray-50 sticky top-0 z-10">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                                        Report Name
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                                        Report Type
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                                        Created By
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                                        Assigned To
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                                        Updated On
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {visibleReports.map((report) => (
                                    <tr
                                        key={report.id}
                                        className="hover:bg-gray-50 cursor-pointer"
                                        onClick={(e) => handleView(e, report)}
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
                                                {canEdit && (
                                                    <button
                                                        className="p-1.5 bg-indigo-50 rounded-full hover:bg-indigo-100 transition-colors focus:outline-none"
                                                        onClick={e => { e.stopPropagation(); openEditModal(report); }}
                                                        title="Edit"
                                                    >
                                                        <Edit size={18} className="text-indigo-600" />
                                                    </button>
                                                )}
                                                {report.type === 'VAPT' && (
                                                    <button
                                                        className="p-1.5 bg-green-50 rounded-full hover:bg-green-100 transition-colors focus:outline-none"
                                                        onClick={e => { e.stopPropagation(); handleVaptUpload(e, report); }}
                                                        title="Upload PDF"
                                                    >
                                                        <Upload size={18} className="text-green-600" />
                                                    </button>
                                                )}
                                                {report.type === 'Risk Assessment' && (
                                                    <button
                                                        className="p-1.5 bg-green-50 rounded-full hover:bg-green-100 transition-colors focus:outline-none"
                                                        onClick={e => { e.stopPropagation(); handleRiskAssessmentUpload(e, report); }}
                                                        title="Upload Excel"
                                                    >
                                                        <Upload size={18} className="text-green-600" />
                                                    </button>
                                                )}
                                                {report.type === 'Risk Treatment' && (
                                                    <button
                                                        className="p-1.5 bg-green-50 rounded-full hover:bg-green-100 transition-colors focus:outline-none"
                                                        onClick={e => { e.stopPropagation(); handleRiskTreatmentUpload(e, report); }}
                                                        title="Upload Excel"
                                                    >
                                                        <Upload size={18} className="text-green-600" />
                                                    </button>
                                                )}
                                                {report.type === 'ASIS' && (
                                                    <button
                                                        className="p-1.5 bg-green-50 rounded-full hover:bg-green-100 transition-colors focus:outline-none"
                                                        onClick={e => { e.stopPropagation(); handleAsisUpload(e, report); }}
                                                        title="Upload Excel"
                                                    >
                                                        <Upload size={18} className="text-green-600" />
                                                    </button>
                                                )}
                                                {canDelete && (
                                                    <button
                                                        className="p-1.5 bg-red-50 rounded-full hover:bg-red-100 transition-colors focus:outline-none"
                                                        onClick={e => { e.stopPropagation(); handleDeleteClick(e, report); }}
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={18} className="text-red-600" />
                                                    </button>
                                                )}
                                                {isSuperConsultant && (
                                                    <button
                                                        className={`p-1.5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-200 ${
                                                            report.assigned_to !== 'Unassigned' 
                                                                ? 'bg-red-50 hover:bg-red-100 cursor-pointer' 
                                                                : 'bg-gray-50 cursor-not-allowed opacity-50'
                                                        }`}
                                                        onClick={e => report.assigned_to !== 'Unassigned' ? handleUnassignClick(e, report) : null}
                                                        title={report.assigned_to !== 'Unassigned' 
                                                            ? `Revoke access from ${report.assigned_to}` 
                                                            : 'No assignment to revoke'
                                                        }
                                                        disabled={report.assigned_to === 'Unassigned'}
                                                    >
                                                        <Users 
                                                            size={16}
                                                            className={`${
                                                                report.assigned_to !== 'Unassigned' ? 'text-red-600' : 'text-gray-400'
                                                            }`}
                                                        />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {visibleReports.length === 0 && (
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

            {/* Modals */}
            <ConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Report"
                message="Are you sure you want to delete this report? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
            />

            <CreateReportModal
                isOpen={createReportOpen}
                onClose={() => setCreateReportOpen(false)}
                onSubmit={handleCreateReport}
                isSubmitting={isUploading}
                error={errorMessage}
            />

            <EditReportModal
                isOpen={editModalOpen}
                onClose={closeEditModal}
                report={editReport}
                onSubmit={handleEditSubmit}
                isSubmitting={isEditing}
                error={editError}
            />

            <UnifiedUploadModal
                isOpen={riskAssessmentUploadOpen}
                onClose={() => setRiskAssessmentUploadOpen(false)}
                onSubmit={handleRiskAssessmentExcelSubmit}
                isSubmitting={isUploadingExcel}
                title="Upload Risk Assessment Excel"
                reportName={selectedRiskReport?.name}
                fileType="excel"
                showDownloadTemplate={true}
                reportType="risk_assessment"
            />

            <UnifiedUploadModal
                isOpen={riskTreatmentUploadOpen}
                onClose={() => setRiskTreatmentUploadOpen(false)}
                onSubmit={handleRiskTreatmentExcelSubmit}
                isSubmitting={isUploadingTreatmentExcel}
                title="Upload Risk Treatment Excel"
                reportName={selectedTreatmentReport?.name}
                fileType="excel"
                showDownloadTemplate={true}
                reportType="risk_treatment"
            />

            <UnifiedUploadModal
                isOpen={asisUploadOpen}
                onClose={() => setAsisUploadOpen(false)}
                onSubmit={handleAsisExcelSubmit}
                isSubmitting={isUploadingAsisExcel}
                title="Upload ASIS Excel"
                reportName={selectedAsisReport?.name}
                fileType="excel"
                showDownloadTemplate={true}
                reportType="asis"
            />

            <UnifiedUploadModal
                isOpen={vaptUploadOpen}
                onClose={() => setVaptUploadOpen(false)}
                onSubmit={handleVaptPdfSubmit}
                isSubmitting={isUploadingVaptPdf}
                title="Upload VAPT PDF"
                reportName={selectedVaptReport?.name}
                fileType="pdf"
                showDownloadTemplate={true}
                reportType="vapt"
            />

            {/* VAPT PDF Viewer Modal */}
            {vaptPdfViewerOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full h-5/6 flex flex-col">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-lg font-semibold">
                                VAPT PDF Viewer - {selectedVaptPdfName}
                            </h3>
                            <button
                                onClick={() => setVaptPdfViewerOpen(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="flex-1 p-4">
                            {selectedVaptPdfUrl ? (
                                <PDFTronViewer fileUrl={selectedVaptPdfUrl} fileType="pdf" />
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-gray-500">No PDF file available</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Extracted Data Modal - This modal is now only for navigation */}
            {/* This modal is now only for navigation */}

            {/* Assign Reports Modal */}
            {isAssignReportModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
                        <h3 className="text-lg font-semibold mb-4">Assign Reports</h3>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Select Representative</label>
                            <select
                                className="w-full border border-gray-300 rounded px-3 py-2"
                                value={selectedRepresentative || ""}
                                onChange={e => setSelectedRepresentative(Number(e.target.value))}
                            >
                                <option value="">Select...</option>
                                {companyRepresentatives.map(rep => (
                                    <option key={rep.id} value={rep.id}>
                                        {rep.name} ({rep.email}){rep.project_role ? ` [${rep.project_role}]` : ""}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Select Reports</label>
                            <div className="max-h-40 overflow-y-auto border rounded p-2">
                                {getUnassignedReports().map(report => (
                                    <label key={report.id} className="flex items-center space-x-2 mb-1">
                                        <input
                                            type="checkbox"
                                            checked={selectedReports.includes(report.id)}
                                            onChange={e => {
                                                if (e.target.checked) {
                                                    setSelectedReports([...selectedReports, report.id]);
                                                } else {
                                                    setSelectedReports(selectedReports.filter(id => id !== report.id));
                                                }
                                            }}
                                        />
                                        <span>{report.name} ({report.type})</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setIsAssignReportModalOpen(false)}
                                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                                disabled={isAssigning}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAssignReports}
                                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                                disabled={isAssigning}
                            >
                                {isAssigning ? "Assigning..." : "Assign"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Unassign Confirmation Modal */}
            {unassignModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
                        <div className="flex items-center mb-4">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-lg font-semibold text-gray-900">Revoke Access</h3>
                            </div>
                        </div>
                        
                        <div className="mb-6">
                            <p className="text-sm text-gray-700 mb-3">
                                Are you sure you want to revoke access to this report?
                            </p>
                            <div className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Report:</span>
                                    <span className="font-medium text-gray-900">{reportToUnassign?.name}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm mt-1">
                                    <span className="text-gray-600">Type:</span>
                                    <span className="font-medium text-gray-900">{reportToUnassign?.type}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm mt-1">
                                    <span className="text-gray-600">Currently Assigned To:</span>
                                    <span className="font-medium text-red-600">{reportToUnassign?.assigned_to}</span>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-3">
                                This action will remove the user's access to view and edit this report.
                            </p>
                        </div>
                        
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setUnassignModalOpen(false);
                                    setReportToUnassign(null);
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleUnassign(reportToUnassign)}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-200 transition-colors"
                            >
                                Revoke Access
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportsTable; 