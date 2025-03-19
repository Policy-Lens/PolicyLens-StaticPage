import React, { useState } from 'react';
import { Search, Filter, MoreHorizontal, Download, Eye, Trash2, X, FileText, Plus } from 'lucide-react';

const EvidenceData = () => {
    const [selectedEvidences, setSelectedEvidences] = useState([]);
    const [selectedControls, setSelectedControls] = useState([]);
    const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
    const [sortOption, setSortOption] = useState('recent');
    const [activeTab, setActiveTab] = useState('evidence'); // 'evidence' or 'plc'
    const [selectedPLCItems, setSelectedPLCItems] = useState([]);

    // Toggle the filter dropdown
    const toggleFilterDropdown = () => {
        setFilterDropdownOpen(!filterDropdownOpen);
    };

    // Toggle selection of a control and all its files
    const toggleControlSelection = (controlId) => {
        if (selectedControls.includes(controlId)) {
            // Remove control from selected controls
            setSelectedControls(selectedControls.filter(id => id !== controlId));

            // Remove all files of this control from selectedEvidences
            const control = evidenceData.find(c => c.id === controlId);
            const controlFileIds = control.files.map(file => file.id);
            setSelectedEvidences(selectedEvidences.filter(id => !controlFileIds.includes(id)));
        } else {
            // Add control to selected controls
            setSelectedControls([...selectedControls, controlId]);

            // Add all files of this control to selectedEvidences
            const control = evidenceData.find(c => c.id === controlId);
            const controlFileIds = control.files.map(file => file.id);
            const newSelectedEvidences = [...selectedEvidences];

            controlFileIds.forEach(fileId => {
                if (!newSelectedEvidences.includes(fileId)) {
                    newSelectedEvidences.push(fileId);
                }
            });

            setSelectedEvidences(newSelectedEvidences);
        }
    };

    // Toggle selection of a PLC item
    const togglePLCItemSelection = (itemId) => {
        if (selectedPLCItems.includes(itemId)) {
            setSelectedPLCItems(selectedPLCItems.filter(id => id !== itemId));
        } else {
            setSelectedPLCItems([...selectedPLCItems, itemId]);
        }
    };

    // Toggle select all evidences
    const toggleSelectAll = () => {
        if (activeTab === 'evidence') {
            // If all controls are selected, clear selection
            if (selectedControls.length === evidenceData.length) {
                setSelectedControls([]);
                setSelectedEvidences([]);
            } else {
                // Select all controls and all files
                setSelectedControls(evidenceData.map(control => control.id));

                const allFileIds = evidenceData.flatMap(control =>
                    control.files.map(file => file.id)
                );
                setSelectedEvidences(allFileIds);
            }
        } else {
            // Get all document IDs from PLC data
            const allDocIds = plcData.flatMap(item => item.documents.map(doc => doc.id));
            if (selectedPLCItems.length === allDocIds.length) {
                setSelectedPLCItems([]);
            } else {
                setSelectedPLCItems(allDocIds);
            }
        }
    };

    // Check if all files of a control are selected
    const isControlFullySelected = (controlId) => {
        const control = evidenceData.find(c => c.id === controlId);
        const controlFileIds = control.files.map(file => file.id);
        return controlFileIds.every(fileId => selectedEvidences.includes(fileId));
    };

    // Check if some but not all files of a control are selected
    const isControlPartiallySelected = (controlId) => {
        const control = evidenceData.find(c => c.id === controlId);
        const controlFileIds = control.files.map(file => file.id);
        const selectedCount = controlFileIds.filter(fileId => selectedEvidences.includes(fileId)).length;
        return selectedCount > 0 && selectedCount < controlFileIds.length;
    };

    // Format date for display
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Get filename from path
    const getFileName = (filePath) => {
        if (!filePath) return '';
        return filePath.split('/').pop();
    };

    // Get file extension
    const getFileExtension = (fileName) => {
        return fileName.split('.').pop().toLowerCase();
    };

    // Get file icon based on extension
    const getFileIcon = (fileName) => {
        const extension = getFileExtension(fileName);
        switch (extension) {
            case 'pdf':
                return 'pdf-icon';
            case 'doc':
            case 'docx':
                return 'word-icon';
            case 'xls':
            case 'xlsx':
                return 'excel-icon';
            case 'png':
            case 'jpg':
            case 'jpeg':
                return 'image-icon';
            default:
                return 'file-icon';
        }
    };

    // Filter options for the dropdown
    const filterOptions = [
        { id: 'control-number', label: 'Control Number' },
        { id: 'control-name', label: 'Control Name' },
        { id: 'file-type', label: 'File Type' },
        { id: 'upload-date', label: 'Upload Date' },
    ];

    // Sample evidence data - restructured to group by control
    const evidenceData = [
        {
            id: 1,
            control_number: "5.1",
            control_name: "Policies for Information Security",
            files: [
                {
                    id: 101,
                    file: "/media/questionnaire/19/5.1/information_security_policy.pdf",
                    description: "Information Security Policy Document",
                    uploaded_at: "2025-03-15T22:37:51.981718Z",
                    uploaded_by: "Vikram Sharma"
                },
                {
                    id: 102,
                    file: "/media/questionnaire/19/5.1/security_management_overview.docx",
                    description: "Security Management Overview",
                    uploaded_at: "2025-03-14T18:22:30.123456Z",
                    uploaded_by: "Priya Patel"
                }
            ]
        },
        {
            id: 2,
            control_number: "5.2",
            control_name: "Information Security Roles and Responsibilities",
            files: [
                {
                    id: 201,
                    file: "/media/questionnaire/19/5.2/roles_and_responsibilities.xlsx",
                    description: "Security Roles Matrix",
                    uploaded_at: "2025-03-12T14:15:40.987654Z",
                    uploaded_by: "Rajesh Kumar"
                },
                {
                    id: 202,
                    file: "/media/questionnaire/19/5.2/security_org_chart.png",
                    description: "Security Organization Chart",
                    uploaded_at: "2025-03-10T09:45:22.456789Z",
                    uploaded_by: "Anika Reddy"
                }
            ]
        },
        {
            id: 3,
            control_number: "5.3",
            control_name: "Segregation of Duties",
            files: [
                {
                    id: 301,
                    file: "/media/questionnaire/19/5.3/duty_segregation_guidelines.pdf",
                    description: "Duty Segregation Guidelines",
                    uploaded_at: "2025-03-09T11:33:18.789012Z",
                    uploaded_by: "Sanjay Gupta"
                },
                {
                    id: 302,
                    file: "/media/questionnaire/19/5.3/conflict_matrix.xlsx",
                    description: "Conflict of Interest Matrix",
                    uploaded_at: "2025-03-08T16:20:05.345678Z",
                    uploaded_by: "Meera Iyer"
                }
            ]
        },
        {
            id: 4,
            control_number: "6.1",
            control_name: "Access Control Policy",
            files: [
                {
                    id: 401,
                    file: "/media/questionnaire/19/6.1/access_control_policy.pdf",
                    description: "Access Control Policy Document",
                    uploaded_at: "2025-03-07T13:10:50.901234Z",
                    uploaded_by: "Arjun Singh"
                }
            ]
        },
        {
            id: 5,
            control_number: "6.2",
            control_name: "Access Management",
            files: [
                {
                    id: 501,
                    file: "/media/questionnaire/19/6.2/access_management_procedures.docx",
                    description: "Access Management Procedures",
                    uploaded_at: "2025-03-05T10:05:33.567890Z",
                    uploaded_by: "Neha Joshi"
                }
            ]
        }
    ];

    // PLC data
    const plcData = [
        {
            "filed_name": "Service Requirements",
            "documents": [
                {
                    "id": 259,
                    "file": "/media/plc/19/step_1/gaurav_btech.pdf",
                    "tag": "",
                    "created_at": "2025-03-16T19:00:17.085954Z"
                }
            ]
        },
        {
            "filed_name": "Draft Proposal",
            "documents": [
                {
                    "id": 261,
                    "file": "/media/plc/19/step_2/Invoice_2076063565.pdf",
                    "tag": "",
                    "created_at": "2025-03-16T19:04:25.488176Z"
                }
            ]
        },
        {
            "filed_name": "Scope",
            "documents": [
                {
                    "id": 260,
                    "file": "/media/plc/19/step_2/PLITS_Backend_API_document.pdf",
                    "tag": "",
                    "created_at": "2025-03-16T19:04:09.559352Z"
                }
            ]
        },
        {
            "filed_name": "Finalize Contract",
            "documents": [
                {
                    "id": 264,
                    "file": "/media/plc/19/step_3/Solution_Challenge__Project_Submission.pptx",
                    "tag": "",
                    "created_at": "2025-03-16T19:05:59.767159Z"
                }
            ]
        },
        {
            "filed_name": "Gap Analysis",
            "documents": [
                {
                    "id": 263,
                    "file": "/media/plc/19/step_4/Copy_of_Business_cycle_mapping_file-_Internal.xlsx",
                    "tag": "",
                    "created_at": "2025-03-16T19:05:21.786044Z"
                }
            ]
        },
        {
            "filed_name": "Stakeholder Interview Details",
            "documents": [
                {
                    "id": 265,
                    "file": "/media/plc/19/step_5/Invoice_2076063565.pdf",
                    "tag": "",
                    "created_at": "2025-03-16T20:21:53.112213Z"
                },
                {
                    "id": 266,
                    "file": "/media/plc/19/step_5/PLITS_Backend_API_document.pdf",
                    "tag": "",
                    "created_at": "2025-03-16T20:21:53.119206Z"
                }
            ]
        }
    ];

    // Get total documents count from PLC data
    const plcDocumentsCount = plcData.reduce((total, item) => total + item.documents.length, 0);

    // Get total files count from evidence data
    const totalEvidenceFiles = evidenceData.reduce((total, control) => total + control.files.length, 0);

    return (
        <div className="flex flex-col h-screen bg-slate-50">
            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden shadow-xl rounded-lg m-6">
                <div className="flex flex-col w-full bg-white">
                    {/* Tabs */}
                    <div className="flex border-b border-slate-200 px-4 bg-white">
                        <button
                            className={`py-4 px-6 font-medium transition-colors ${activeTab === 'evidence' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-600 hover:text-slate-800'}`}
                            onClick={() => setActiveTab('evidence')}
                        >
                            Evidence Data
                        </button>
                        <button
                            className={`py-4 px-6 font-medium transition-colors ${activeTab === 'plc' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-600 hover:text-slate-800'}`}
                            onClick={() => setActiveTab('plc')}
                        >
                            PLC Data
                        </button>
                    </div>

                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-200 p-4 bg-white sticky top-0 z-10">
                        <div className="flex items-center">
                            <h2 className="text-lg font-semibold text-slate-800">
                                {activeTab === 'evidence' ? 'Evidence Repository' : 'PLC Documents Repository'}
                            </h2>
                            <div className="ml-3 text-slate-600 font-medium">
                                ({activeTab === 'evidence' ? totalEvidenceFiles : plcDocumentsCount} files)
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <div className="relative">
                                <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder={`Search ${activeTab === 'evidence' ? 'evidences' : 'documents'}...`}
                                    className="pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all w-64 placeholder-slate-400"
                                />
                            </div>
                            <div className="relative">
                                <button
                                    className="px-4 py-2.5 border border-slate-200 rounded-lg flex items-center text-slate-700 hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-300 shadow-sm"
                                    onClick={toggleFilterDropdown}
                                >
                                    <Filter size={16} className="mr-2 text-indigo-500" />
                                    <span>Filter</span>
                                </button>
                                {filterDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-lg shadow-xl z-20">
                                        <div className="p-3 border-b border-slate-200 bg-slate-50 font-medium text-slate-700">
                                            Filter Options
                                        </div>
                                        {filterOptions.map(option => (
                                            <div key={option.id} className="p-2.5 hover:bg-slate-50 flex items-center justify-between cursor-pointer transition-colors">
                                                <span className="text-slate-700">{option.label}</span>
                                                <div className="h-6 w-6 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors">
                                                    <X size={12} />
                                                </div>
                                            </div>
                                        ))}
                                        <div className="flex p-3 border-t border-slate-200 bg-slate-50 gap-2">
                                            <button className="flex-1 py-2 text-center bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
                                                Clear
                                            </button>
                                            <button className="flex-1 py-2 text-center bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                                                Apply Filter
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <select
                                className="px-4 py-2.5 border border-slate-200 rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-300 shadow-sm cursor-pointer"
                                value={sortOption}
                                onChange={(e) => setSortOption(e.target.value)}
                            >
                                <option value="recent">Most Recent</option>
                                <option value="oldest">Oldest First</option>
                                <option value="name">Name (A-Z)</option>
                                <option value="size">Size</option>
                            </select>
                            <button className="p-2.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                                <MoreHorizontal size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Evidence Data Table */}
                    {activeTab === 'evidence' && (
                        <div className="flex-1 overflow-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="w-12 p-4 text-left">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                checked={selectedControls.length === evidenceData.length}
                                                onChange={toggleSelectAll}
                                            />
                                        </th>
                                        <th className="w-24 p-4 text-left font-semibold text-slate-600">Control #</th>
                                        <th className="w-48 p-4 text-left font-semibold text-slate-600">Control Name</th>
                                        <th className="w-64 p-4 text-left font-semibold text-slate-600">Files</th>
                                        <th className="p-4 text-left font-semibold text-slate-600">Description</th>
                                        <th className="w-40 p-4 text-left font-semibold text-slate-600">Uploaded By</th>
                                        <th className="w-40 p-4 text-left font-semibold text-slate-600">Date Uploaded</th>
                                        <th className="w-32 p-4 text-left font-semibold text-slate-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {evidenceData.flatMap((control) =>
                                        control.files.map((file, fileIndex) => (
                                            <tr
                                                key={file.id}
                                                className={`hover:bg-slate-50 border-b border-slate-100 transition-colors ${fileIndex > 0 && fileIndex < control.files.length ? 'bg-slate-50/30' : ''}`}
                                            >
                                                {fileIndex === 0 ? (
                                                    <td className="p-4" rowSpan={control.files.length}>
                                                        <div className="relative">
                                                            <input
                                                                type="checkbox"
                                                                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                                checked={isControlFullySelected(control.id)}
                                                                ref={el => {
                                                                    if (el) {
                                                                        if (isControlPartiallySelected(control.id)) {
                                                                            el.indeterminate = true;
                                                                        } else {
                                                                            el.indeterminate = false;
                                                                        }
                                                                    }
                                                                }}
                                                                onChange={() => toggleControlSelection(control.id)}
                                                            />
                                                        </div>
                                                    </td>
                                                ) : null}
                                                {fileIndex === 0 ? (
                                                    <td className="p-4" rowSpan={control.files.length}>
                                                        <span className="text-indigo-600 font-semibold">{control.control_number}</span>
                                                    </td>
                                                ) : null}
                                                {fileIndex === 0 ? (
                                                    <td className="p-4 text-slate-700 font-medium" rowSpan={control.files.length}>
                                                        {control.control_name}
                                                    </td>
                                                ) : null}
                                                <td className="p-4 text-slate-600">
                                                    <div className="flex items-center">
                                                        <div className={`mr-3 text-indigo-500`}>
                                                            <FileText size={20} />
                                                        </div>
                                                        <span className="text-slate-700 truncate max-w-[180px]" title={getFileName(file.file)}>
                                                            {getFileName(file.file)}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-slate-600 truncate max-w-[200px]" title={file.description}>
                                                    {file.description}
                                                </td>
                                                <td className="p-4 text-slate-600">
                                                    {file.uploaded_by}
                                                </td>
                                                <td className="p-4 text-slate-600">
                                                    {formatDate(file.uploaded_at)}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center space-x-2">
                                                        <button className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors rounded-lg hover:bg-slate-100">
                                                            <Eye size={18} />
                                                        </button>
                                                        <button className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors rounded-lg hover:bg-slate-100">
                                                            <Download size={18} />
                                                        </button>
                                                        <button className="p-1.5 text-slate-400 hover:text-red-600 transition-colors rounded-lg hover:bg-slate-100">
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* PLC Data Table */}
                    {activeTab === 'plc' && (
                        <div className="flex-1 overflow-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="w-12 p-4 text-left">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                checked={selectedPLCItems.length === plcDocumentsCount}
                                                onChange={toggleSelectAll}
                                            />
                                        </th>
                                        <th className="w-24 p-4 text-left font-semibold text-slate-600">Step #</th>
                                        <th className="w-48 p-4 text-left font-semibold text-slate-600">Phase Name</th>
                                        <th className="w-64 p-4 text-left font-semibold text-slate-600">File</th>
                                        <th className="p-4 text-left font-semibold text-slate-600">Description</th>
                                        <th className="w-40 p-4 text-left font-semibold text-slate-600">Tag</th>
                                        <th className="w-40 p-4 text-left font-semibold text-slate-600">Date Uploaded</th>
                                        <th className="w-32 p-4 text-left font-semibold text-slate-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {plcData.flatMap((item, index) =>
                                        item.documents.map(doc => (
                                            <tr
                                                key={doc.id}
                                                className="hover:bg-slate-50 border-b border-slate-100 transition-colors"
                                            >
                                                <td className="p-4">
                                                    <input
                                                        type="checkbox"
                                                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                        checked={selectedPLCItems.includes(doc.id)}
                                                        onChange={() => togglePLCItemSelection(doc.id)}
                                                    />
                                                </td>
                                                <td className="p-4">
                                                    <span className="text-indigo-600 font-semibold">{`Step ${index + 1}`}</span>
                                                </td>
                                                <td className="p-4 text-slate-700 font-medium">
                                                    {item.filed_name}
                                                </td>
                                                <td className="p-4 text-slate-600">
                                                    <div className="flex items-center">
                                                        <div className={`mr-3 text-indigo-500`}>
                                                            <FileText size={20} />
                                                        </div>
                                                        <span className="text-slate-700 truncate max-w-[180px]" title={getFileName(doc.file)}>
                                                            {getFileName(doc.file)}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-slate-600 truncate max-w-[200px]" title={item.filed_name}>
                                                    {`${item.filed_name} Document`}
                                                </td>
                                                <td className="p-4 text-slate-600">
                                                    {doc.tag || 'No Tag'}
                                                </td>
                                                <td className="p-4 text-slate-600">
                                                    {formatDate(doc.created_at)}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center space-x-2">
                                                        <button className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors rounded-lg hover:bg-slate-100">
                                                            <Eye size={18} />
                                                        </button>
                                                        <button className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors rounded-lg hover:bg-slate-100">
                                                            <Download size={18} />
                                                        </button>
                                                        <button className="p-1.5 text-slate-400 hover:text-red-600 transition-colors rounded-lg hover:bg-slate-100">
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Footer with Pagination */}
                    <div className="border-t border-slate-200 p-4 bg-white flex items-center justify-between">
                        <div className="text-sm text-slate-600">
                            Showing <span className="font-medium">
                                {activeTab === 'evidence' ? totalEvidenceFiles : plcDocumentsCount}
                            </span> of <span className="font-medium">
                                {activeTab === 'evidence' ? totalEvidenceFiles : plcDocumentsCount}
                            </span> {activeTab === 'evidence' ? 'evidences' : 'documents'}
                        </div>
                        <div className="flex items-center space-x-2">
                            <button className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                                Previous
                            </button>
                            <button className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg font-medium">
                                1
                            </button>
                            <button className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EvidenceData;
