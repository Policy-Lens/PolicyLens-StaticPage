import React, { useState } from 'react';
import { Search, Plus, MessageCircle, Clock, CheckCircle, AlertCircle, HelpCircle, MoreHorizontal, ChevronDown, MessageSquare, X, Mail, PhoneCall, Upload, BookOpen, Video, FileText, ChevronLeft, ChevronRight, Trash2, ExternalLink } from 'lucide-react';

const Support = () => {
    const [activeTab, setActiveTab] = useState('my-tickets');
    const [showChatbot, setShowChatbot] = useState(false);
    const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
    const [newTicketOpen, setNewTicketOpen] = useState(false);
    const [newTicket, setNewTicket] = useState({
        subject: '',
        description: '',
        priority: 'medium',
        file: null
    });
    const [activeDropdown, setActiveDropdown] = useState(null);

    // Sample ticket data
    const tickets = [
        {
            id: 'TKT-2023-001',
            subject: 'Cannot access evidence repository',
            description: 'I am trying to access the evidence repository but getting an error message saying "Access Denied".',
            status: 'open',
            priority: 'high',
            created_at: '2025-04-20T10:15:30Z',
            updated_at: '2025-04-20T14:22:15Z',
            assignee: 'Support Team',
            messages: 3
        },
        {
            id: 'TKT-2023-002',
            subject: 'Need clarification on questionnaire section',
            description: 'I need help understanding how to complete section 3 of the questionnaire about data retention policies.',
            status: 'in-progress',
            priority: 'medium',
            created_at: '2025-04-18T09:30:45Z',
            updated_at: '2025-04-19T11:12:00Z',
            assignee: 'Neha Joshi',
            messages: 5
        },
        {
            id: 'TKT-2023-003',
            subject: 'Calendar integration not working',
            description: 'The calendar is not syncing with my Outlook calendar despite following the setup instructions.',
            status: 'closed',
            priority: 'medium',
            created_at: '2025-04-15T16:45:20Z',
            updated_at: '2025-04-17T08:32:10Z',
            assignee: 'Vikram Sharma',
            messages: 8
        },
        {
            id: 'TKT-2023-004',
            subject: 'File upload error in evidence data',
            description: 'When trying to upload evidence files larger than 5MB, I get a timeout error.',
            status: 'open',
            priority: 'high',
            created_at: '2025-04-19T14:20:00Z',
            updated_at: '2025-04-19T14:20:00Z',
            assignee: 'Unassigned',
            messages: 1
        },
        {
            id: 'TKT-2023-005',
            subject: 'Feature request: Export to PDF',
            description: 'It would be helpful if we could export the completed questionnaire as a PDF file.',
            status: 'in-progress',
            priority: 'low',
            created_at: '2025-04-16T11:05:30Z',
            updated_at: '2025-04-18T15:45:22Z',
            assignee: 'Product Team',
            messages: 4
        }
    ];

    // FAQ data
    const faqItems = [
        {
            question: 'How do I reset my password?',
            answer: 'You can reset your password by clicking on the "Forgot Password" link on the login page.'
        },
        {
            question: 'How can I share evidence with my team?',
            answer: 'Use the "Share" button in the Evidence Data tab to share specific files with team members.'
        },
        {
            question: 'What file formats are supported for evidence upload?',
            answer: 'We support PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, PNG, JPG, and JPEG file formats.'
        }
    ];

    // Get status icon and color
    const getStatusInfo = (status) => {
        switch (status) {
            case 'open':
                return { icon: <AlertCircle size={16} />, color: 'text-amber-500', bg: 'bg-amber-50' };
            case 'in-progress':
                return { icon: <Clock size={16} />, color: 'text-blue-500', bg: 'bg-blue-50' };
            case 'closed':
                return { icon: <CheckCircle size={16} />, color: 'text-green-500', bg: 'bg-green-50' };
            default:
                return { icon: <HelpCircle size={16} />, color: 'text-slate-500', bg: 'bg-slate-50' };
        }
    };

    // Get priority badge
    const getPriorityBadge = (priority) => {
        switch (priority) {
            case 'high':
                return { color: 'text-red-700', bg: 'bg-red-50', label: 'High' };
            case 'medium':
                return { color: 'text-amber-700', bg: 'bg-amber-50', label: 'Medium' };
            case 'low':
                return { color: 'text-green-700', bg: 'bg-green-50', label: 'Low' };
            default:
                return { color: 'text-slate-700', bg: 'bg-slate-50', label: 'Normal' };
        }
    };

    // Format date
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Toggle new ticket form
    const toggleNewTicket = () => {
        setNewTicketOpen(!newTicketOpen);
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewTicket({
            ...newTicket,
            [name]: value
        });
    };

    // Submit new ticket
    const handleSubmitTicket = (e) => {
        e.preventDefault();
        // Here you would normally send the ticket data to your backend
        console.log('Submitting ticket:', newTicket);

        // Reset form and close modal
        setNewTicket({
            subject: '',
            description: '',
            priority: 'medium',
            file: null
        });
        setNewTicketOpen(false);

        // Show success message (in a real app)
        alert('Ticket submitted successfully!');
    };

    // Handle ticket deletion
    const handleDeleteTicket = (ticketId) => {
        // In a real application, you would call an API to delete the ticket
        console.log(`Deleting ticket: ${ticketId}`);
        alert(`Ticket ${ticketId} would be deleted in a real application`);
        setActiveDropdown(null);
    };

    return (
        <div className="flex flex-col h-screen bg-slate-50 relative">
            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden border-b border-slate-200 bg-white">
                <div className="flex flex-col w-full">
                    {/* Tabs - Enhanced Design */}
                    <div className="flex border-b border-slate-200 px-6 bg-gradient-to-r from-indigo-50 to-white">
                        <button
                            className={`py-5 px-6 font-medium transition-colors relative ${activeTab === 'my-tickets'
                                ? 'text-indigo-600 font-semibold'
                                : 'text-slate-600 hover:text-slate-800'}`}
                            onClick={() => setActiveTab('my-tickets')}
                        >
                            My Tickets
                            {activeTab === 'my-tickets' && (
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600"></span>
                            )}
                        </button>
                        <button
                            className={`py-5 px-6 font-medium transition-colors relative ${activeTab === 'all-tickets'
                                ? 'text-indigo-600 font-semibold'
                                : 'text-slate-600 hover:text-slate-800'}`}
                            onClick={() => setActiveTab('all-tickets')}
                        >
                            All Tickets
                            {activeTab === 'all-tickets' && (
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600"></span>
                            )}
                        </button>
                        <button
                            className={`py-5 px-6 font-medium transition-colors relative ${activeTab === 'faqs'
                                ? 'text-indigo-600 font-semibold'
                                : 'text-slate-600 hover:text-slate-800'}`}
                            onClick={() => setActiveTab('faqs')}
                        >
                            FAQs & Help
                            {activeTab === 'faqs' && (
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600"></span>
                            )}
                        </button>
                    </div>

                    {/* Header - Modernized */}
                    <div className="flex items-center justify-between border-b border-slate-200 p-6 bg-white sticky top-0 z-10">
                        <div className="flex items-center">
                            <h2 className="text-xl font-semibold text-slate-800">
                                {activeTab === 'my-tickets' ? 'My Support Tickets' :
                                    activeTab === 'all-tickets' ? 'All Support Tickets' : 'Help Center'}
                            </h2>
                            {activeTab !== 'faqs' && (
                                <div className="ml-3 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">
                                    {tickets.filter(ticket => activeTab === 'all-tickets' || ticket.status !== 'closed').length} tickets
                                </div>
                            )}
                        </div>
                        <div className="flex gap-3">
                            {activeTab !== 'faqs' && (
                                <>
                                    <div className="relative">
                                        <Search className="absolute left-4 top-3 h-4 w-4 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Search tickets..."
                                            className="pl-12 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all w-72 placeholder-slate-400 bg-slate-50 hover:bg-white"
                                        />
                                    </div>
                                    <div className="relative">
                                        <button
                                            className="px-4 py-3 border border-slate-200 rounded-lg flex items-center text-slate-700 hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-300 shadow-sm bg-white"
                                            onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                                        >
                                            <span>Filter</span>
                                            <ChevronDown size={16} className={`ml-2 transition-transform duration-200 ${filterDropdownOpen ? 'rotate-180' : ''}`} />
                                        </button>
                                        {filterDropdownOpen && (
                                            <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-lg shadow-2xl z-20 overflow-hidden animate-fade-in">
                                                <div className="p-4">
                                                    <div className="text-sm font-medium text-slate-700 mb-3">Status</div>
                                                    <div className="flex flex-col gap-2.5">
                                                        <label className="flex items-center">
                                                            <input type="checkbox" className="form-checkbox h-4 w-4 text-indigo-600 rounded border-slate-300 mr-2" defaultChecked />
                                                            <span className="text-slate-700">Open</span>
                                                        </label>
                                                        <label className="flex items-center">
                                                            <input type="checkbox" className="form-checkbox h-4 w-4 text-indigo-600 rounded border-slate-300 mr-2" defaultChecked />
                                                            <span className="text-slate-700">In Progress</span>
                                                        </label>
                                                        <label className="flex items-center">
                                                            <input type="checkbox" className="form-checkbox h-4 w-4 text-indigo-600 rounded border-slate-300 mr-2" />
                                                            <span className="text-slate-700">Closed</span>
                                                        </label>
                                                    </div>
                                                    <div className="text-sm font-medium text-slate-700 mt-5 mb-3">Priority</div>
                                                    <div className="flex flex-col gap-2.5">
                                                        <label className="flex items-center">
                                                            <input type="checkbox" className="form-checkbox h-4 w-4 text-indigo-600 rounded border-slate-300 mr-2" defaultChecked />
                                                            <span className="text-slate-700">High</span>
                                                        </label>
                                                        <label className="flex items-center">
                                                            <input type="checkbox" className="form-checkbox h-4 w-4 text-indigo-600 rounded border-slate-300 mr-2" defaultChecked />
                                                            <span className="text-slate-700">Medium</span>
                                                        </label>
                                                        <label className="flex items-center">
                                                            <input type="checkbox" className="form-checkbox h-4 w-4 text-indigo-600 rounded border-slate-300 mr-2" defaultChecked />
                                                            <span className="text-slate-700">Low</span>
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="flex p-4 border-t border-slate-200 bg-slate-50 gap-2">
                                                    <button className="flex-1 py-2.5 text-center bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm font-medium">
                                                        Clear
                                                    </button>
                                                    <button className="flex-1 py-2.5 text-center bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium">
                                                        Apply
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                            {activeTab !== 'faqs' && (
                                <button
                                    className="px-5 py-3 bg-indigo-600 text-white rounded-lg flex items-center hover:bg-indigo-700 transition-colors shadow-sm font-medium"
                                    onClick={toggleNewTicket}
                                >
                                    <Plus size={18} className="mr-2" />
                                    <span>New Ticket</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Tickets List - Enhanced Design */}
                    {(activeTab === 'my-tickets' || activeTab === 'all-tickets') && (
                        <div className="flex-1 overflow-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="w-44 p-4 text-left font-semibold text-slate-600">Ticket ID</th>
                                        <th className="p-4 text-left font-semibold text-slate-600">Subject</th>
                                        <th className="w-32 p-4 text-left font-semibold text-slate-600">Status</th>
                                        <th className="w-32 p-4 text-left font-semibold text-slate-600">Priority</th>
                                        <th className="w-40 p-4 text-left font-semibold text-slate-600">Created</th>
                                        <th className="w-40 p-4 text-left font-semibold text-slate-600">Updated</th>
                                        <th className="w-44 p-4 text-left font-semibold text-slate-600">Assignee</th>
                                        <th className="w-28 p-4 text-center font-semibold text-slate-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tickets
                                        .filter(ticket => activeTab === 'all-tickets' || ticket.status !== 'closed')
                                        .map(ticket => {
                                            const statusInfo = getStatusInfo(ticket.status);
                                            const priorityBadge = getPriorityBadge(ticket.priority);

                                            return (
                                                <tr key={ticket.id} className="hover:bg-slate-50 border-b border-slate-100 transition-colors group">
                                                    <td className="p-4">
                                                        <span className="text-indigo-600 font-semibold">{ticket.id}</span>
                                                    </td>
                                                    <td className="p-4 text-slate-700 font-medium">
                                                        <div className="flex items-center">
                                                            <span className="truncate max-w-[250px] group-hover:text-indigo-600 transition-colors" title={ticket.subject}>
                                                                {ticket.subject}
                                                            </span>
                                                            {ticket.messages > 0 && (
                                                                <div className="ml-2 bg-indigo-100 text-indigo-700 text-xs px-2.5 py-1 rounded-full">
                                                                    {ticket.messages}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className={`flex items-center ${statusInfo.color} gap-1.5 ${statusInfo.bg} py-1.5 px-3 rounded-full text-xs font-medium w-fit capitalize`}>
                                                            {statusInfo.icon}
                                                            <span>{ticket.status.replace('-', ' ')}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className={`${priorityBadge.bg} ${priorityBadge.color} py-1.5 px-3 rounded-full text-xs font-medium w-fit`}>
                                                            {priorityBadge.label}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-slate-600">
                                                        {formatDate(ticket.created_at)}
                                                    </td>
                                                    <td className="p-4 text-slate-600">
                                                        {formatDate(ticket.updated_at)}
                                                    </td>
                                                    <td className="p-4 text-slate-600">
                                                        <div className="flex items-center">
                                                            <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center mr-2 font-medium text-xs">
                                                                {ticket.assignee !== 'Unassigned' && ticket.assignee !== 'Support Team' && ticket.assignee !== 'Product Team'
                                                                    ? ticket.assignee.split(' ').map(name => name[0]).join('')
                                                                    : ticket.assignee === 'Unassigned' ? 'UA' : ticket.assignee === 'Support Team' ? 'ST' : 'PT'
                                                                }
                                                            </div>
                                                            <span className="truncate max-w-[120px]">{ticket.assignee}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center justify-center space-x-2">
                                                            <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors rounded-lg hover:bg-indigo-50" title="View ticket">
                                                                <MessageCircle size={18} />
                                                            </button>
                                                            <div className="relative">
                                                                <button
                                                                    className="p-2 text-slate-400 hover:text-indigo-600 transition-colors rounded-lg hover:bg-indigo-50"
                                                                    title="More options"
                                                                    onClick={() => setActiveDropdown(activeDropdown === ticket.id ? null : ticket.id)}
                                                                >
                                                                    <MoreHorizontal size={18} />
                                                                </button>
                                                                {activeDropdown === ticket.id && (
                                                                    <div className="absolute right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-20 w-36 py-1 overflow-hidden">
                                                                        <button
                                                                            className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center"
                                                                            onClick={() => alert(`View details of ticket ${ticket.id}`)}
                                                                        >
                                                                            <ExternalLink size={14} className="mr-2" />
                                                                            View Details
                                                                        </button>
                                                                        <button
                                                                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-slate-50 flex items-center"
                                                                            onClick={() => handleDeleteTicket(ticket.id)}
                                                                        >
                                                                            <Trash2 size={14} className="mr-2" />
                                                                            Delete
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* FAQs Section - Enhanced Design */}
                    {activeTab === 'faqs' && (
                        <div className="flex-1 overflow-auto p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto">
                                <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 hover:shadow-lg transition-shadow">
                                    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                                        <HelpCircle size={20} className="text-indigo-500 mr-2" />
                                        Frequently Asked Questions
                                    </h3>
                                    <div className="space-y-5">
                                        {faqItems.map((faq, index) => (
                                            <div key={index} className="border-b border-slate-100 pb-5 last:border-0 last:pb-0">
                                                <div className="font-medium text-slate-700 mb-2">{faq.question}</div>
                                                <div className="text-slate-600 text-sm">{faq.answer}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 hover:shadow-lg transition-shadow">
                                    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                                        <MessageCircle size={20} className="text-indigo-500 mr-2" />
                                        Contact Us
                                    </h3>
                                    <div className="space-y-5">
                                        <div className="flex items-start bg-indigo-50 p-4 rounded-lg">
                                            <div className="min-w-10 text-indigo-500">
                                                <MessageCircle size={20} />
                                            </div>
                                            <div>
                                                <div className="font-medium text-slate-700">Chat Support</div>
                                                <div className="text-slate-600 text-sm mt-1">
                                                    Available 24/7 for all your queries. Click the chat icon to start a conversation.
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-start bg-slate-50 p-4 rounded-lg">
                                            <div className="min-w-10 text-indigo-500">
                                                <Mail size={20} />
                                            </div>
                                            <div>
                                                <div className="font-medium text-slate-700">Email Support</div>
                                                <div className="text-slate-600 text-sm mt-1">
                                                    Reach out to our support team at <a href="mailto:support@policylens.com" className="text-indigo-600 hover:text-indigo-800 hover:underline">support@policylens.com</a>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-start bg-indigo-50 p-4 rounded-lg">
                                            <div className="min-w-10 text-indigo-500">
                                                <PhoneCall size={20} />
                                            </div>
                                            <div>
                                                <div className="font-medium text-slate-700">Phone Support</div>
                                                <div className="text-slate-600 text-sm mt-1">
                                                    Call us at <a href="tel:+918001234567" className="text-indigo-600 hover:text-indigo-800 hover:underline">+91 800 123 4567</a> (Mon-Fri, 9AM-6PM IST)
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-r from-indigo-50 to-white rounded-xl shadow-md border border-slate-200 p-6 md:col-span-2">
                                    <h3 className="text-lg font-semibold text-slate-800 mb-5 flex items-center">
                                        <BookOpen size={20} className="text-indigo-500 mr-2" />
                                        Help Resources
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                        <div className="bg-white border border-slate-200 rounded-lg p-5 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group">
                                            <div className="text-indigo-500 mb-3 group-hover:text-indigo-600 transition-colors">
                                                <BookOpen size={24} />
                                            </div>
                                            <div className="font-medium text-slate-700 group-hover:text-indigo-600 transition-colors">User Guide</div>
                                            <div className="text-slate-600 text-sm mt-1.5">
                                                Comprehensive guide to using Policy Lens
                                            </div>
                                        </div>
                                        <div className="bg-white border border-slate-200 rounded-lg p-5 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group">
                                            <div className="text-indigo-500 mb-3 group-hover:text-indigo-600 transition-colors">
                                                <Video size={24} />
                                            </div>
                                            <div className="font-medium text-slate-700 group-hover:text-indigo-600 transition-colors">Video Tutorials</div>
                                            <div className="text-slate-600 text-sm mt-1.5">
                                                Step-by-step video walkthroughs
                                            </div>
                                        </div>
                                        <div className="bg-white border border-slate-200 rounded-lg p-5 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group">
                                            <div className="text-indigo-500 mb-3 group-hover:text-indigo-600 transition-colors">
                                                <FileText size={24} />
                                            </div>
                                            <div className="font-medium text-slate-700 group-hover:text-indigo-600 transition-colors">Knowledge Base</div>
                                            <div className="text-slate-600 text-sm mt-1.5">
                                                Articles and how-to guides
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Footer with Pagination - Enhanced */}
                    {activeTab !== 'faqs' && (
                        <div className="border-t border-slate-200 p-4 bg-white flex items-center justify-between">
                            <div className="text-sm text-slate-600">
                                Showing <span className="font-medium">
                                    {tickets.filter(ticket => activeTab === 'all-tickets' || ticket.status !== 'closed').length}
                                </span> of <span className="font-medium">
                                    {tickets.length}
                                </span> tickets
                            </div>
                            <div className="flex items-center space-x-2">
                                <button className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center" disabled>
                                    <ChevronLeft size={16} className="mr-1" /> Previous
                                </button>
                                <button className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg font-medium">
                                    1
                                </button>
                                <button className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center" disabled>
                                    Next <ChevronRight size={16} className="ml-1" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Keep chatbot design unchanged */}
            <button
                className="fixed bottom-6 right-6 bg-indigo-600 text-white rounded-full p-4 shadow-lg hover:bg-indigo-700 transition-colors z-50"
                onClick={() => setShowChatbot(!showChatbot)}
                title="Chat Support"
            >
                {showChatbot ? <X size={24} /> : <MessageSquare size={24} />}
            </button>

            {/* Chatbot Panel */}
            {showChatbot && (
                <div className="fixed bottom-24 right-6 w-80 bg-white rounded-lg shadow-2xl border border-slate-200 overflow-hidden z-50 flex flex-col h-96">
                    <div className="bg-indigo-600 text-white p-4 flex items-center justify-between">
                        <div className="flex items-center">
                            <MessageSquare size={20} className="mr-2" />
                            <span className="font-medium">Policy Lens Support</span>
                        </div>
                        <button onClick={() => setShowChatbot(false)}>
                            <X size={18} />
                        </button>
                    </div>
                    <div className="flex-1 p-4 overflow-auto">
                        <div className="text-center text-slate-500 text-sm mb-4">Today</div>

                        <div className="flex mb-4">
                            <div className="bg-indigo-100 rounded-lg p-3 max-w-[80%] text-slate-700 text-sm">
                                <p>👋 Hello! I'm your Policy Lens assistant. How can I help you today?</p>
                            </div>
                        </div>

                        <div className="flex justify-end mb-4">
                            <div className="bg-slate-100 rounded-lg p-3 max-w-[80%] text-slate-700 text-sm">
                                <p>I need help with uploading evidence files.</p>
                            </div>
                        </div>

                        <div className="flex mb-4">
                            <div className="bg-indigo-100 rounded-lg p-3 max-w-[80%] text-slate-700 text-sm">
                                <p>I'd be happy to help with that! To upload evidence files, go to the Evidence Data tab and click the "Upload Evidence" button in the top right corner. You can then select files from your computer to upload.</p>
                                <p className="mt-2">Is there anything specific about the upload process that you need help with?</p>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-slate-200 p-3">
                        <div className="flex items-center">
                            <input
                                type="text"
                                placeholder="Type a message..."
                                className="flex-1 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300"
                            />
                            <button className="ml-2 bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="22" y1="2" x2="11" y2="13"></line>
                                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* New Ticket Modal - Enhanced */}
            {newTicketOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 animate-scale-in">
                        <div className="border-b border-slate-200 p-5 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-white rounded-t-xl">
                            <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                                <Plus size={18} className="text-indigo-600 mr-2" />
                                Create New Support Ticket
                            </h3>
                            <button className="text-slate-400 hover:text-slate-600 transition-colors" onClick={toggleNewTicket}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmitTicket}>
                            <div className="p-6 space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="subject">
                                        Subject
                                    </label>
                                    <input
                                        type="text"
                                        id="subject"
                                        name="subject"
                                        value={newTicket.subject}
                                        onChange={handleInputChange}
                                        className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all bg-slate-50 hover:bg-white"
                                        placeholder="Brief description of the issue"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="description">
                                        Description
                                    </label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={newTicket.description}
                                        onChange={handleInputChange}
                                        className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 min-h-[150px] transition-all bg-slate-50 hover:bg-white"
                                        placeholder="Please provide detailed information about your issue"
                                        required
                                    ></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="priority">
                                        Priority
                                    </label>
                                    <select
                                        id="priority"
                                        name="priority"
                                        value={newTicket.priority}
                                        onChange={handleInputChange}
                                        className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 bg-slate-50 hover:bg-white appearance-none transition-all"
                                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.5em' }}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="file">
                                        Attachments (Optional)
                                    </label>
                                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-5 text-center bg-slate-50 hover:bg-white transition-colors">
                                        <input
                                            type="file"
                                            id="file"
                                            className="hidden"
                                            onChange={(e) => setNewTicket({ ...newTicket, file: e.target.files[0] })}
                                        />
                                        <label htmlFor="file" className="cursor-pointer text-indigo-600 hover:text-indigo-800 transition-colors">
                                            <div className="flex flex-col items-center">
                                                <Upload size={28} className="mb-3 text-indigo-500" />
                                                <span className="font-medium">Click to upload or drag and drop</span>
                                                <span className="text-xs text-slate-500 mt-1.5">PDF, DOC, PNG, JPG up to 10MB</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="border-t border-slate-200 p-5 flex justify-end space-x-3 bg-slate-50 rounded-b-xl">
                                <button
                                    type="button"
                                    className="px-5 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors font-medium"
                                    onClick={toggleNewTicket}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium"
                                >
                                    Submit Ticket
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Support;
