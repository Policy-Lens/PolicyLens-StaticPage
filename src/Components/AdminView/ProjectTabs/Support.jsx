import React, { useState, useEffect, useContext } from "react";
import { message } from "antd";
import {
  Search,
  Plus,
  MessageCircle,
  MessagesSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  MoreHorizontal,
  ChevronDown,
  MessageSquare,
  X,
  Mail,
  PhoneCall,
  Upload,
  BookOpen,
  Video,
  FileText,
  ChevronLeft,
  ChevronRight,
  Trash2,
  ExternalLink,
  Eye,
  ClipboardEdit,
  Edit3,
  Edit2,
  Edit,
} from "lucide-react";
import { apiRequest, BASE_URL, BASE_URL_WS } from "../../../utils/api";
import { ProjectContext } from "../../../Context/ProjectContext";
import { useParams } from "react-router-dom";
import { AuthContext } from "../../../AuthContext";
import Cookies from "js-cookie";
import ChatRoom from "./ChatRoom";

const Support = () => {
  const { projectid } = useParams();
  const [activeTab, setActiveTab] = useState("all-tickets");
  const [showChatbot, setShowChatbot] = useState(false);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [newTicketOpen, setNewTicketOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: "",
    description: "",
    priority: "medium",
    files: [],
    isRelatedToStep: false,
    step: "",
    assignToMembers: false,
    assigned_to: [],
  });
  const [projectMembers, setProjectMembers] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [statusConfirmation, setStatusConfirmation] = useState({
    visible: false,
    ticketId: null,
    currentStatus: null,
    newStatus: null,
  });
  const [technicalConfirmation, setTechnicalConfirmation] = useState({
    visible: false,
    ticketId: null,
  });
  const [editTicketModal, setEditTicketModal] = useState({
    visible: false,
    ticket: null,
  });
  const [editTicketForm, setEditTicketForm] = useState({
    subject: "",
    description: "",
    priority: "",
  });
  const [tickets, setTickets] = useState([]);
  const [myTickets, setMyTickets] = useState([]);
  const [allTickets, setAllTickets] = useState([]);
  const [assignedTickets, setAssignedTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketDetailOpen, setTicketDetailOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    status: ["open", "in_progress", "closed"],
    priority: ["high", "medium", "low"],
  });
  const { project, getMembers, projectRole } = useContext(ProjectContext);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useContext(AuthContext);
  const [onlineStatus, setOnlineStatus] = useState({});

  const handleEditTicket = (ticket) => {
    setEditTicketForm({
      subject: ticket.subject,
      description: ticket.description,
      priority: ticket.priority,
    });
    setEditTicketModal({
      visible: true,
      ticket,
    });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditTicketForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateTicket = async (e) => {
    e.preventDefault();
    try {
      const response = await apiRequest(
        "PATCH",
        `/api/support/ticket/${editTicketModal.ticket.id}/update/`,
        editTicketForm,
        true
      );

      if (response.status === 200) {
        // Refresh the tickets
        if (activeTab === "my-tickets") fetchMyTickets();
        if (activeTab === "all-tickets") fetchAllTickets();
        if (activeTab === "assigned-tickets") fetchAssignedTickets();

        if (selectedTicket && selectedTicket.id === editTicketModal.ticket.id) {
          setSelectedTicket({
            ...selectedTicket,
            ...editTicketForm,
          });
        }

        message.success("Ticket updated successfully");
        setEditTicketModal({ visible: false, ticket: null });
      }
    } catch (error) {
      console.error("Error updating ticket:", error);
      message.error("Failed to update ticket");
    }
  };
  // Fetch tickets data based on active tab
  useEffect(() => {
    if (project && projectid) {
      if (activeTab === "my-tickets") {
        fetchMyTickets();
      } else if (activeTab === "all-tickets") {
        fetchAllTickets();
      } else if (activeTab === "assigned-tickets") {
        fetchAssignedTickets();
      }
    }
  }, [activeTab, project]);

  // Apply filters to the ticket data
  useEffect(() => {
    let filteredTickets = [];

    if (activeTab === "my-tickets") {
      filteredTickets = myTickets;
    } else if (activeTab === "all-tickets") {
      filteredTickets = allTickets;
    } else if (activeTab === "assigned-tickets") {
      filteredTickets = assignedTickets;
    }

    // Filter by status and priority
    filteredTickets = filteredTickets.filter(
      (ticket) =>
        activeFilters.status.includes(ticket.status) &&
        activeFilters.priority.includes(ticket.priority)
    );

    setTickets(filteredTickets);
  }, [activeTab, myTickets, allTickets, assignedTickets, activeFilters]);

  // Get project members
  const fetchProjectMembers = async () => {
    try {
      const members = await getMembers(projectid);
      setProjectMembers(
        members.filter((member) => member.id !== user.id) || []
      );
    } catch (error) {
      console.error("Error fetching project members:", error);
    }
  };

  // Fetch my tickets
  const fetchMyTickets = async () => {
    try {
      setIsLoading(true);
      const response = await apiRequest(
        "GET",
        `/api/support/project/${projectid}/my_ticket/`,
        null,
        true
      );

      if (response.status === 200) {
        setMyTickets(response.data);
      }
    } catch (error) {
      console.error("Error fetching my tickets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all tickets
  const fetchAllTickets = async () => {
    try {
      setIsLoading(true);
      const response = await apiRequest(
        "GET",
        `/api/support/project/${projectid}/ticket/`,
        null,
        true
      );

      if (response.status === 200) {
        setAllTickets(response.data);
      }
    } catch (error) {
      console.error("Error fetching all tickets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch assigned tickets
  const fetchAssignedTickets = async () => {
    try {
      setIsLoading(true);
      const response = await apiRequest(
        "GET",
        `/api/support/project/${projectid}/assigned_tickets/`,
        null,
        true
      );

      if (response.status === 200) {
        setAssignedTickets(response.data);
      }
    } catch (error) {
      console.error("Error fetching assigned tickets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get status icon and color
  const getStatusInfo = (status) => {
    switch (status) {
      case "open":
        return {
          icon: <AlertCircle size={16} />,
          color: "text-amber-500",
          bg: "bg-amber-50",
        };
      case "in_progress":
        return {
          icon: <Clock size={16} />,
          color: "text-blue-500",
          bg: "bg-blue-50",
        };
      case "closed":
        return {
          icon: <CheckCircle size={16} />,
          color: "text-green-500",
          bg: "bg-green-50",
        };
      default:
        return {
          icon: <HelpCircle size={16} />,
          color: "text-slate-500",
          bg: "bg-slate-50",
        };
    }
  };

  // Get priority badge
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "high":
        return { color: "text-red-700", bg: "bg-red-50", label: "High" };
      case "medium":
        return { color: "text-amber-700", bg: "bg-amber-50", label: "Medium" };
      case "low":
        return { color: "text-green-700", bg: "bg-green-50", label: "Low" };
      default:
        return { color: "text-slate-700", bg: "bg-slate-50", label: "Normal" };
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format date with time
  const formatDateTime = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Toggle new ticket form
  const toggleNewTicket = () => {
    setNewTicketOpen(!newTicketOpen);
    if (!newTicketOpen && newTicket.assignToMembers) {
      fetchProjectMembers();
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "checkbox") {
      setNewTicket({
        ...newTicket,
        [name]: checked,
      });

      // If we're checking the "assign to members" box, fetch members
      if (name === "assignToMembers" && checked) {
        fetchProjectMembers();
      }
    } else if (type === "file") {
      setNewTicket({
        ...newTicket,
        files: Array.from(files),
      });
    } else if (name === "assigned_to") {
      // Handle multi-select for assigned_to
      const options = e.target.options;
      const selectedValues = [];
      for (let i = 0; i < options.length; i++) {
        if (options[i].selected) {
          selectedValues.push(parseInt(options[i].value));
        }
      }
      setNewTicket({
        ...newTicket,
        assigned_to: selectedValues,
      });
    } else {
      setNewTicket({
        ...newTicket,
        [name]: value,
      });
    }
  };

  // Submit new ticket
  const handleSubmitTicket = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("subject", newTicket.subject);
      formData.append("description", newTicket.description);
      formData.append("priority", newTicket.priority);

      // Only append step if related to step is checked
      if (newTicket.isRelatedToStep && newTicket.step) {
        formData.append("step", newTicket.step);
      }

      // Only append assigned_to if assign to members is checked
      if (newTicket.assignToMembers && newTicket.assigned_to.length > 0) {
        newTicket.assigned_to.forEach((userId) => {
          formData.append("assigned_to", userId);
        });
      }

      // Append files if any
      if (newTicket.files.length > 0) {
        newTicket.files.forEach((file) => {
          formData.append("files", file);
        });
      }

      // Make API call
      const response = await apiRequest(
        "POST",
        `/api/support/project/${projectid}/ticket/create/`,
        formData,
        true
      );

      if (response.status === 201) {
        // Reset form and close modal
        setNewTicket({
          subject: "",
          description: "",
          priority: "medium",
          files: [],
          isRelatedToStep: false,
          step: "",
          assignToMembers: false,
          assigned_to: [],
        });
        setNewTicketOpen(false);

        // Refresh tickets
        fetchMyTickets();
        if (activeTab === "all-tickets") fetchAllTickets();
        if (activeTab === "assigned-tickets") fetchAssignedTickets();

        message.success("Ticket submitted successfully!");
      }
    } catch (error) {
      console.error("Error submitting ticket:", error);
      message.error("Failed to submit ticket. Please try again.");
    }
  };

  // View ticket details
  const viewTicketDetails = (ticket) => {
    setSelectedTicket(ticket);
    setTicketDetailOpen(true);
  };

  // Handle ticket deletion
  const handleDeleteTicket = async (ticketId) => {
    if (!confirm("Are you sure you want to delete this ticket?")) {
      return;
    }

    try {
      const response = await apiRequest(
        "DELETE",
        `/api/support/ticket/${ticketId}/delete/`,
        null,
        true
      );

      if (response.status === 204) {
        // Refresh the tickets list
        fetchMyTickets();
        message.success("Ticket deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting ticket:", error);
      message.error("Failed to delete ticket");
    }

    setActiveDropdown(null);
  };

  // Check if user can update status
  const canUpdateStatus = (ticket) => {
    return (
      projectRole === "consultant admin" || activeTab === "assigned-tickets"
    );
  };
  // Status update components display check
  const canShowStatusUpdate = (ticket) => {
    return canUpdateStatus(ticket);
  };

  const confirmStatusUpdate = async () => {
    try {
      const { ticketId, newStatus } = statusConfirmation;
      const response = await apiRequest(
        "PATCH",
        `/api/support/ticket/${ticketId}/status/update/`,
        { status: newStatus },
        true
      );

      if (response.status === 200) {
        // Refresh the tickets
        if (activeTab === "my-tickets") fetchMyTickets();
        if (activeTab === "all-tickets") fetchAllTickets();
        if (activeTab === "assigned-tickets") fetchAssignedTickets();

        if (selectedTicket && selectedTicket.id === ticketId) {
          setSelectedTicket({
            ...selectedTicket,
            status: newStatus,
          });
        }

        message.success("Ticket status updated successfully");
        setActiveDropdown(null);
      }
    } catch (error) {
      console.error("Error updating ticket status:", error);
      message.error("Failed to update ticket status");
    } finally {
      setStatusConfirmation({
        visible: false,
        ticketId: null,
        newStatus: null,
      });
    }
  };

  // Handle marking ticket as technical issue with confirmation
  const handleMarkTechnicalIssue = async (ticketId) => {
    setTechnicalConfirmation({ visible: true, ticketId });
  };

  const confirmMarkTechnical = async () => {
    try {
      const { ticketId } = technicalConfirmation;
      const response = await apiRequest(
        "POST",
        `/api/support/ticket/${ticketId}/mark-technical-issue/`,
        null,
        true
      );

      if (response.status === 200) {
        // Refresh the tickets list
        if (activeTab === "my-tickets") fetchMyTickets();
        if (activeTab === "all-tickets") fetchAllTickets();
        if (activeTab === "assigned-tickets") fetchAssignedTickets();
        if (selectedTicket && selectedTicket.id === ticketId) {
          setSelectedTicket({
            ...selectedTicket,
            is_technical: true,
          });
        }
        message.success("Ticket marked as technical issue successfully");
        setActiveDropdown(null);
      }
    } catch (error) {
      console.error("Error marking ticket as technical issue:", error);
      message.error("Failed to mark ticket as technical issue");
    } finally {
      setTechnicalConfirmation({ visible: false, ticketId: null });
    }
  };

  // Handle filter changes
  const handleFilterChange = (type, value, isChecked) => {
    setActiveFilters((prev) => {
      const newFilters = { ...prev };

      if (isChecked) {
        // Add to filter if not already included
        if (!newFilters[type].includes(value)) {
          newFilters[type] = [...newFilters[type], value];
        }
      } else {
        // Remove from filter
        newFilters[type] = newFilters[type].filter((item) => item !== value);
      }

      return newFilters;
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setActiveFilters({
      status: ["open", "in_progress", "closed"],
      priority: ["high", "medium", "low"],
    });
  };

  // WebSocket for ticket online status
  useEffect(() => {
    if (!projectid) return;
    let ws;
    const token = Cookies.get("accessToken");
    if (!token) return;
    ws = new WebSocket(
      `${BASE_URL_WS}/ws/presence/support/${projectid}/?token=${token}`
    );

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "initial_presence" && data.presence) {
          setOnlineStatus(data.presence);
        } else if (data.type === "presence_state" && data.ticket) {
          setOnlineStatus((prev) => ({
            ...prev,
            [data.ticket]: data.onlinestatus,
          }));
        }
      } catch (e) {
        // ignore
      }
    };
    ws.onerror = () => {};
    ws.onclose = () => {};
    return () => {
      ws && ws.close();
    };
  }, [projectid]);

  // Handle ChatModal
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [ticketId, setTicketId] = useState(null);
  const handleChatModalOpen = (ticket) => {
    setTicketId(ticket.id);
    setIsChatModalOpen(true);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 relative">
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden border-b border-slate-200 bg-white">
        <div className="flex flex-col w-full">
          {/* Tabs - Enhanced Design */}
          <div className="flex border-b border-slate-200 px-6 bg-gradient-to-r from-indigo-50 to-white">
            <button
              className={`py-5 px-6 font-medium transition-colors relative ${
                activeTab === "my-tickets"
                  ? "text-indigo-600 font-semibold"
                  : "text-slate-600 hover:text-slate-800"
              }`}
              onClick={() => setActiveTab("my-tickets")}
            >
              My Tickets
              {activeTab === "my-tickets" && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600"></span>
              )}
            </button>
            {projectRole !== "company" && (
              <button
                className={`py-5 px-6 font-medium transition-colors relative ${
                  activeTab === "assigned-tickets"
                    ? "text-indigo-600 font-semibold"
                    : "text-slate-600 hover:text-slate-800"
                }`}
                onClick={() => setActiveTab("assigned-tickets")}
              >
                Assigned to Me
                {activeTab === "assigned-tickets" && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600"></span>
                )}
              </button>
            )}
            <button
              className={`py-5 px-6 font-medium transition-colors relative ${
                activeTab === "all-tickets"
                  ? "text-indigo-600 font-semibold"
                  : "text-slate-600 hover:text-slate-800"
              }`}
              onClick={() => setActiveTab("all-tickets")}
            >
              All Tickets
              {activeTab === "all-tickets" && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600"></span>
              )}
            </button>
            <button
              className={`py-5 px-6 font-medium transition-colors relative ${
                activeTab === "faqs"
                  ? "text-indigo-600 font-semibold"
                  : "text-slate-600 hover:text-slate-800"
              }`}
              onClick={() => setActiveTab("faqs")}
            >
              FAQs & Help
              {activeTab === "faqs" && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600"></span>
              )}
            </button>
          </div>

          {/* Header - Modernized */}
          <div className="flex items-center justify-between border-b border-slate-200 p-6 bg-white sticky top-0 z-10">
            <div className="flex items-center">
              <h2 className="text-xl font-semibold text-slate-800">
                {activeTab === "my-tickets"
                  ? "My Support Tickets"
                  : activeTab === "assigned-tickets"
                  ? "Tickets Assigned to Me"
                  : activeTab === "all-tickets"
                  ? "All Support Tickets"
                  : "Help Center"}
              </h2>
              {activeTab !== "faqs" && !isLoading && (
                <div className="ml-3 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">
                  {tickets.length} {tickets.length === 1 ? "ticket" : "tickets"}
                </div>
              )}
            </div>
            <div className="flex gap-3">
              {activeTab !== "faqs" && (
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
                      <ChevronDown
                        size={16}
                        className={`ml-2 transition-transform duration-200 ${
                          filterDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {filterDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-lg shadow-2xl z-20 overflow-hidden animate-fade-in">
                        <div className="p-4">
                          <div className="text-sm font-medium text-slate-700 mb-3">
                            Status
                          </div>
                          <div className="flex flex-col gap-2.5">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                className="form-checkbox h-4 w-4 text-indigo-600 rounded border-slate-300 mr-2"
                                checked={activeFilters.status.includes("open")}
                                onChange={(e) =>
                                  handleFilterChange(
                                    "status",
                                    "open",
                                    e.target.checked
                                  )
                                }
                              />
                              <span className="text-slate-700">Open</span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                className="form-checkbox h-4 w-4 text-indigo-600 rounded border-slate-300 mr-2"
                                checked={activeFilters.status.includes(
                                  "in_progress"
                                )}
                                onChange={(e) =>
                                  handleFilterChange(
                                    "status",
                                    "in_progress",
                                    e.target.checked
                                  )
                                }
                              />
                              <span className="text-slate-700">
                                In Progress
                              </span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                className="form-checkbox h-4 w-4 text-indigo-600 rounded border-slate-300 mr-2"
                                checked={activeFilters.status.includes(
                                  "closed"
                                )}
                                onChange={(e) =>
                                  handleFilterChange(
                                    "status",
                                    "closed",
                                    e.target.checked
                                  )
                                }
                              />
                              <span className="text-slate-700">Closed</span>
                            </label>
                          </div>
                          <div className="text-sm font-medium text-slate-700 mt-5 mb-3">
                            Priority
                          </div>
                          <div className="flex flex-col gap-2.5">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                className="form-checkbox h-4 w-4 text-indigo-600 rounded border-slate-300 mr-2"
                                checked={activeFilters.priority.includes(
                                  "high"
                                )}
                                onChange={(e) =>
                                  handleFilterChange(
                                    "priority",
                                    "high",
                                    e.target.checked
                                  )
                                }
                              />
                              <span className="text-slate-700">High</span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                className="form-checkbox h-4 w-4 text-indigo-600 rounded border-slate-300 mr-2"
                                checked={activeFilters.priority.includes(
                                  "medium"
                                )}
                                onChange={(e) =>
                                  handleFilterChange(
                                    "priority",
                                    "medium",
                                    e.target.checked
                                  )
                                }
                              />
                              <span className="text-slate-700">Medium</span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                className="form-checkbox h-4 w-4 text-indigo-600 rounded border-slate-300 mr-2"
                                checked={activeFilters.priority.includes("low")}
                                onChange={(e) =>
                                  handleFilterChange(
                                    "priority",
                                    "low",
                                    e.target.checked
                                  )
                                }
                              />
                              <span className="text-slate-700">Low</span>
                            </label>
                          </div>
                        </div>
                        <div className="flex p-4 border-t border-slate-200 bg-slate-50 gap-2">
                          <button
                            className="flex-1 py-2.5 text-center bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm font-medium"
                            onClick={clearFilters}
                          >
                            Clear
                          </button>
                          <button
                            className="flex-1 py-2.5 text-center bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium"
                            onClick={() => setFilterDropdownOpen(false)}
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
              {activeTab !== "faqs" && (
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

          {/* Tickets List */}
          {(activeTab === "my-tickets" ||
            activeTab === "all-tickets" ||
            activeTab === "assigned-tickets") && (
            <div className="flex-1 overflow-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-3 text-slate-600">Loading tickets...</p>
                  </div>
                </div>
              ) : tickets.length > 0 ? (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="w-44 p-4 text-left font-semibold text-slate-600">
                        Ticket ID
                      </th>
                      <th className="p-4 text-left font-semibold text-slate-600">
                        Subject
                      </th>
                      <th className="w-32 p-4 text-left font-semibold text-slate-600">
                        Status
                      </th>
                      <th className="w-32 p-4 text-left font-semibold text-slate-600">
                        Priority
                      </th>
                      <th className="w-32 p-4 text-left font-semibold text-slate-600">
                        Technical Issue
                      </th>
                      <th className="w-40 p-4 text-left font-semibold text-slate-600">
                        Created
                      </th>
                      <th className="w-40 p-4 text-left font-semibold text-slate-600">
                        Updated
                      </th>
                      <th className="w-44 p-4 text-left font-semibold text-slate-600">
                        Created By
                      </th>
                      <th className="w-28 p-4 text-center font-semibold text-slate-600">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map((ticket) => {
                      const statusInfo = getStatusInfo(ticket.status);
                      const priorityBadge = getPriorityBadge(ticket.priority);

                      return (
                        <tr
                          key={ticket.id}
                          className="hover:bg-slate-50 border-b border-slate-100 transition-colors group"
                        >
                          <td className="p-4">
                            <span className="text-indigo-600 font-semibold">
                              TKT-{ticket.id}
                            </span>
                          </td>
                          <td className="p-4 text-slate-700 font-medium">
                            <div className="flex items-center">
                              <span
                                className="truncate max-w-[250px] group-hover:text-indigo-600 transition-colors"
                                title={ticket.subject}
                              >
                                {ticket.subject}
                              </span>
                              {ticket.attachments &&
                                ticket.attachments.length > 0 && (
                                  <div className="ml-2 bg-indigo-100 text-indigo-700 text-xs px-2.5 py-1 rounded-full">
                                    {ticket.attachments.length} files
                                  </div>
                                )}
                            </div>
                          </td>
                          <td className="p-4">
                            <div
                              className={`flex items-center ${statusInfo.color} gap-1.5 ${statusInfo.bg} py-1.5 px-3 rounded-full text-xs font-medium w-fit capitalize`}
                            >
                              {statusInfo.icon}
                              <span>
                                {ticket.status
                                  .replace("-", " ")
                                  .replace("_", " ")}
                              </span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div
                              className={`${priorityBadge.bg} ${priorityBadge.color} py-1.5 px-3 rounded-full text-xs font-medium w-fit`}
                            >
                              {priorityBadge.label}
                            </div>
                          </td>
                          <td className="p-4">
                            <div
                              className={`${
                                ticket.is_technical
                                  ? "text-red-600"
                                  : "text-slate-600"
                              } font-medium`}
                            >
                              {ticket.is_technical ? "Yes" : "No"}
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
                                {ticket.created_by_details.name
                                  .split(" ")
                                  .map((name) => name[0])
                                  .join("")}
                              </div>
                              <span className="truncate max-w-[120px]">
                                {ticket.created_by_details.name}
                              </span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-center space-x-2">
                              {/* Chat icon - only for consultant admin, assigned-tickets, or my-tickets */}
                              {(projectRole === "consultant admin" ||
                                activeTab === "assigned-tickets" ||
                                activeTab === "my-tickets") && (
                                <button
                                  className="relative p-2 text-slate-600 hover:text-indigo-600 transition-colors rounded-lg hover:bg-indigo-50"
                                  title="Open Chat"
                                  onClick={() => handleChatModalOpen(ticket)}
                                >
                                  <MessagesSquare size={18} />
                                  {onlineStatus[`${ticket.id}`] ? (
                                    <span className="absolute top-1 right-3 block w-2 h-2 bg-green-500 rounded-full border border-white"></span>
                                  ) : (
                                    <span className="absolute top-1 right-3 block w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                                  )}
                                </button>
                              )}
                              {/* Remove Eye icon, keep More actions */}
                              <div className="relative">
                                <button
                                  className="p-2 text-slate-400 hover:text-indigo-600 transition-colors rounded-lg hover:bg-indigo-50"
                                  title="More options"
                                  onClick={() =>
                                    setActiveDropdown(
                                      activeDropdown === ticket.id
                                        ? null
                                        : ticket.id
                                    )
                                  }
                                >
                                  <MoreHorizontal size={18} />
                                </button>
                                {activeDropdown === ticket.id && (
                                  <div className="absolute right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-20 w-44 p-1 overflow-hidden">
                                    <button
                                      className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 flex items-center"
                                      onClick={() => viewTicketDetails(ticket)}
                                    >
                                      <ExternalLink
                                        size={14}
                                        className="mr-2"
                                      />
                                      View Details
                                    </button>

                                    {/* Edit button - only show in "my-tickets" tab */}
                                    {activeTab === "my-tickets" && (
                                      <button
                                        className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-blue-100 flex items-center gap-2"
                                        onClick={() => handleEditTicket(ticket)}
                                      >
                                        <Edit size={14} className="mr-2" />
                                        Edit Ticket
                                      </button>
                                    )}

                                    {/* Status update dropdown - only show if user has permission */}
                                    {canShowStatusUpdate(ticket) && (
                                      <button
                                        className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-blue-100 flex items-center gap-2 "
                                        onClick={() =>
                                          setStatusConfirmation({
                                            visible: true,
                                            ticketId: ticket.id,
                                            currentStatus: ticket.status,
                                            newStatus: ticket.status,
                                          })
                                        }
                                      >
                                        <Edit3
                                          size={14}
                                          className="text-black-400"
                                        />
                                        Change Status
                                      </button>
                                    )}

                                    {/* Mark as Technical Issue - only show for admin and non-closed tickets */}
                                    {projectRole === "consultant admin" &&
                                      !ticket.is_technical &&
                                      ticket.status !== "closed" && (
                                        <button
                                          className="w-full px-4 py-2 text-left text-sm text-red-600
                                          hover:bg-red-100 flex items-center border-t border-slate-100"
                                          onClick={() =>
                                            handleMarkTechnicalIssue(ticket.id)
                                          }
                                        >
                                          <AlertCircle
                                            size={14}
                                            className="mr-2"
                                          />
                                          Mark as Technical Issue
                                        </button>
                                      )}

                                    {/* Delete button - only show in "my-tickets" tab */}
                                    {activeTab === "my-tickets" && (
                                      <button
                                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-slate-50 flex items-center border-t border-slate-100"
                                        onClick={() =>
                                          handleDeleteTicket(ticket.id)
                                        }
                                      >
                                        <Trash2 size={14} className="mr-2" />
                                        Delete
                                      </button>
                                    )}
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
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center max-w-md">
                    <div className="mx-auto w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
                      <MessageCircle size={28} />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">
                      No tickets found
                    </h3>
                    <p className="text-slate-500 mb-6">
                      {activeTab === "my-tickets"
                        ? "You haven't created any support tickets yet."
                        : activeTab === "assigned-tickets"
                        ? "No tickets have been assigned to you."
                        : "No tickets have been created for this project."}
                    </p>
                    {activeTab === "my-tickets" &&
                      projectRole === "company" && (
                        <button
                          className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg flex items-center mx-auto hover:bg-indigo-700 transition-colors shadow-sm font-medium"
                          onClick={toggleNewTicket}
                        >
                          <Plus size={18} className="mr-2" />
                          <span>Create New Ticket</span>
                        </button>
                      )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* FAQs Section - Enhanced Design */}
          {activeTab === "faqs" && (
            <div className="flex-1 overflow-auto p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto">
                <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 hover:shadow-lg transition-shadow">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                    <HelpCircle size={20} className="text-indigo-500 mr-2" />
                    Frequently Asked Questions
                  </h3>
                  <div className="space-y-5">
                    {/* FAQ items */}
                    <div className="border-b border-slate-100 pb-5 last:border-0 last:pb-0">
                      <div className="font-medium text-slate-700 mb-2">
                        How do I reset my password?
                      </div>
                      <div className="text-slate-600 text-sm">
                        You can reset your password by clicking on the "Forgot
                        Password" link on the login page.
                      </div>
                    </div>
                    <div className="border-b border-slate-100 pb-5 last:border-0 last:pb-0">
                      <div className="font-medium text-slate-700 mb-2">
                        How can I share evidence with my team?
                      </div>
                      <div className="text-slate-600 text-sm">
                        Use the "Share" button in the Evidence Data tab to share
                        specific files with team members.
                      </div>
                    </div>
                    <div className="border-b border-slate-100 pb-5 last:border-0 last:pb-0">
                      <div className="font-medium text-slate-700 mb-2">
                        What file formats are supported for evidence upload?
                      </div>
                      <div className="text-slate-600 text-sm">
                        We support PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, PNG,
                        JPG, and JPEG file formats.
                      </div>
                    </div>
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
                        <div className="font-medium text-slate-700">
                          Chat Support
                        </div>
                        <div className="text-slate-600 text-sm mt-1">
                          Available 24/7 for all your queries. Click the chat
                          icon to start a conversation.
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start bg-slate-50 p-4 rounded-lg">
                      <div className="min-w-10 text-indigo-500">
                        <Mail size={20} />
                      </div>
                      <div>
                        <div className="font-medium text-slate-700">
                          Email Support
                        </div>
                        <div className="text-slate-600 text-sm mt-1">
                          Reach out to our support team at{" "}
                          <a
                            href="mailto:support@policylens.com"
                            className="text-indigo-600 hover:text-indigo-800 hover:underline"
                          >
                            support@policylens.com
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start bg-indigo-50 p-4 rounded-lg">
                      <div className="min-w-10 text-indigo-500">
                        <PhoneCall size={20} />
                      </div>
                      <div>
                        <div className="font-medium text-slate-700">
                          Phone Support
                        </div>
                        <div className="text-slate-600 text-sm mt-1">
                          Call us at{" "}
                          <a
                            href="tel:+918001234567"
                            className="text-indigo-600 hover:text-indigo-800 hover:underline"
                          >
                            +91 800 123 4567
                          </a>{" "}
                          (Mon-Fri, 9AM-6PM IST)
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
                      <div className="font-medium text-slate-700 group-hover:text-indigo-600 transition-colors">
                        User Guide
                      </div>
                      <div className="text-slate-600 text-sm mt-1.5">
                        Comprehensive guide to using Policy Lens
                      </div>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg p-5 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group">
                      <div className="text-indigo-500 mb-3 group-hover:text-indigo-600 transition-colors">
                        <Video size={24} />
                      </div>
                      <div className="font-medium text-slate-700 group-hover:text-indigo-600 transition-colors">
                        Video Tutorials
                      </div>
                      <div className="text-slate-600 text-sm mt-1.5">
                        Step-by-step video walkthroughs
                      </div>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg p-5 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group">
                      <div className="text-indigo-500 mb-3 group-hover:text-indigo-600 transition-colors">
                        <FileText size={24} />
                      </div>
                      <div className="font-medium text-slate-700 group-hover:text-indigo-600 transition-colors">
                        Knowledge Base
                      </div>
                      <div className="text-slate-600 text-sm mt-1.5">
                        Articles and how-to guides
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer with Pagination */}
          {(activeTab === "my-tickets" ||
            activeTab === "all-tickets" ||
            activeTab === "assigned-tickets") && (
            <div className="border-t border-slate-200 p-4 bg-white flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Showing <span className="font-medium">{tickets.length}</span>{" "}
                {tickets.length === 1 ? "ticket" : "tickets"}
              </div>
              {/* Simple pagination - can be enhanced to support multiple pages if needed */}
              <div className="flex items-center space-x-2">
                <button
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  disabled
                >
                  <ChevronLeft size={16} className="mr-1" /> Previous
                </button>
                <button className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg font-medium">
                  1
                </button>
                <button
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  disabled
                >
                  Next <ChevronRight size={16} className="ml-1" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chatbot Button */}
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
                <p>
                  👋 Hello! I'm your Policy Lens assistant. How can I help you
                  today?
                </p>
              </div>
            </div>

            <div className="flex justify-end mb-4">
              <div className="bg-slate-100 rounded-lg p-3 max-w-[80%] text-slate-700 text-sm">
                <p>I need help with uploading evidence files.</p>
              </div>
            </div>

            <div className="flex mb-4">
              <div className="bg-indigo-100 rounded-lg p-3 max-w-[80%] text-slate-700 text-sm">
                <p>
                  I'd be happy to help with that! To upload evidence files, go
                  to the Evidence Data tab and click the "Upload Evidence"
                  button in the top right corner. You can then select files from
                  your computer to upload.
                </p>
                <p className="mt-2">
                  Is there anything specific about the upload process that you
                  need help with?
                </p>
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Detail Modal */}
      {ticketDetailOpen && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 animate-scale-in max-h-[90vh] flex flex-col">
            <div className="border-b border-slate-200 p-5 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-white rounded-t-xl">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                <MessageCircle size={18} className="text-indigo-600 mr-2" />
                Ticket Details
              </h3>
              <button
                className="text-slate-400 hover:text-slate-600 transition-colors"
                onClick={() => setTicketDetailOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    {selectedTicket.subject}
                  </h2>
                  <div className="text-sm text-slate-500 mt-1">
                    Ticket ID: TKT-{selectedTicket.id} • Created{" "}
                    {formatDateTime(selectedTicket.created_at)}
                  </div>
                </div>
                <div className="flex gap-3">
                  {/* Technical Issue badge */}
                  <div
                    className={`py-1.5 px-3 rounded-full text-xs font-medium uppercase flex items-center gap-1.5 ${
                      selectedTicket.is_technical
                        ? "bg-red-50 text-red-600"
                        : "bg-slate-50 text-slate-600"
                    }`}
                  >
                    <AlertCircle size={14} />
                    <span>
                      {selectedTicket.is_technical
                        ? "Technical Issue"
                        : "Non-Technical"}
                    </span>
                  </div>
                  {/* Status badge */}
                  <div
                    className={`${getStatusInfo(selectedTicket.status).bg} ${
                      getStatusInfo(selectedTicket.status).color
                    } py-1.5 px-3 rounded-full text-xs font-medium uppercase flex items-center gap-1.5`}
                  >
                    {getStatusInfo(selectedTicket.status).icon}
                    <span>
                      {selectedTicket.status
                        .replace("-", " ")
                        .replace("_", " ")}
                    </span>
                  </div>

                  {/* Priority badge */}
                  <div
                    className={`${
                      getPriorityBadge(selectedTicket.priority).bg
                    } ${
                      getPriorityBadge(selectedTicket.priority).color
                    } py-1.5 px-3 rounded-full text-xs font-medium uppercase`}
                  >
                    {getPriorityBadge(selectedTicket.priority).label} Priority
                  </div>
                </div>
              </div>

              {/* Mark as Technical button */}
              {!selectedTicket.is_technical &&
                projectRole === "consultant admin" &&
                selectedTicket !== "closed" && (
                  <button
                    onClick={() => handleMarkTechnicalIssue(selectedTicket.id)}
                    className="mb-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <AlertCircle size={16} className="mr-2" />
                    Mark as Technical Issue
                  </button>
                )}

              <div className="prose prose-slate max-w-none">
                {/* Ticket details in sections */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {/* Creator info */}
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-slate-500 mb-3">
                      Created By
                    </h4>
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center mr-3 font-medium">
                        {selectedTicket.created_by_details.name
                          .split(" ")
                          .map((name) => name[0])
                          .join("")}
                      </div>
                      <div>
                        <div className="font-medium text-slate-700">
                          {selectedTicket.created_by_details.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {selectedTicket.created_by_details.email}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Assigned to info */}
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-slate-500 mb-3">
                      Assigned To
                    </h4>
                    {selectedTicket.assigned_to_details &&
                    selectedTicket.assigned_to_details.length > 0 ? (
                      <div className="flex flex-col gap-3 max-h-[150px] overflow-y-auto">
                        {selectedTicket.assigned_to_details.map((member) => (
                          <div key={member.id} className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center mr-2 font-medium text-xs">
                              {member.name
                                .split(" ")
                                .map((name) => name[0])
                                .join("")}
                            </div>
                            <div>
                              <div className="font-medium text-slate-700">
                                {member.name}
                              </div>
                              <div className="text-xs text-slate-500">
                                {member.email}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-slate-500 text-sm">No assignees</div>
                    )}
                  </div>

                  {/* Step info */}
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-slate-500 mb-3">
                      Related Step
                    </h4>
                    {selectedTicket.step_details ? (
                      <div className="font-medium text-slate-700">
                        Step {selectedTicket.step_details.step_no}
                      </div>
                    ) : (
                      <div className="text-slate-500 text-sm">
                        Not related to any specific step
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-slate-500 mb-3">
                    Description
                  </h4>
                  <div className="bg-slate-50 p-4 rounded-lg text-slate-700 whitespace-pre-line">
                    {selectedTicket.description}
                  </div>
                </div>

                {/* Attachments */}
                {selectedTicket.attachments &&
                  selectedTicket.attachments.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-500 mb-3">
                        Attachments
                      </h4>
                      <div className="bg-slate-50 p-4 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {selectedTicket.attachments.map((attachment) => {
                            const fileName = attachment.file.split("/").pop();
                            const fileExtension = fileName
                              .split(".")
                              .pop()
                              .toLowerCase();
                            const isImage = [
                              "jpg",
                              "jpeg",
                              "png",
                              "gif",
                            ].includes(fileExtension);
                            const isPdf = fileExtension === "pdf";
                            const isDoc = ["doc", "docx"].includes(
                              fileExtension
                            );

                            return (
                              <a
                                key={attachment.id}
                                href={`${BASE_URL}${attachment.file}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center p-3 border border-slate-200 rounded-lg hover:border-indigo-300 hover:shadow-sm transition-all group bg-white"
                              >
                                <div className="w-10 h-10 flex items-center justify-center bg-slate-100 rounded-lg mr-3 text-slate-500 group-hover:text-indigo-600 transition-colors">
                                  {isImage ? (
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="20"
                                      height="20"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <rect
                                        x="3"
                                        y="3"
                                        width="18"
                                        height="18"
                                        rx="2"
                                        ry="2"
                                      ></rect>
                                      <circle
                                        cx="8.5"
                                        cy="8.5"
                                        r="1.5"
                                      ></circle>
                                      <polyline points="21 15 16 10 5 21"></polyline>
                                    </svg>
                                  ) : isPdf ? (
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="20"
                                      height="20"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                      <polyline points="14 2 14 8 20 8"></polyline>
                                      <line
                                        x1="16"
                                        y1="13"
                                        x2="8"
                                        y2="13"
                                      ></line>
                                      <line
                                        x1="16"
                                        y1="17"
                                        x2="8"
                                        y2="17"
                                      ></line>
                                      <polyline points="10 9 9 9 8 9"></polyline>
                                    </svg>
                                  ) : isDoc ? (
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="20"
                                      height="20"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                      <polyline points="14 2 14 8 20 8"></polyline>
                                      <line
                                        x1="16"
                                        y1="13"
                                        x2="8"
                                        y2="13"
                                      ></line>
                                      <line
                                        x1="16"
                                        y1="17"
                                        x2="8"
                                        y2="17"
                                      ></line>
                                      <polyline points="10 9 9 9 8 9"></polyline>
                                    </svg>
                                  ) : (
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="20"
                                      height="20"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                                      <polyline points="13 2 13 9 20 9"></polyline>
                                    </svg>
                                  )}
                                </div>
                                <div className="overflow-hidden">
                                  <div className="text-sm font-medium text-slate-700 truncate group-hover:text-indigo-600 transition-colors">
                                    {fileName}
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    {new Date(
                                      attachment.uploaded_at
                                    ).toLocaleDateString()}
                                  </div>
                                </div>
                                <div className="ml-auto">
                                  <ExternalLink
                                    size={16}
                                    className="text-slate-400 group-hover:text-indigo-500"
                                  />
                                </div>
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            </div>

            <div className="border-t border-slate-200 p-5 flex justify-end space-x-3 bg-slate-50 rounded-b-xl">
              {canShowStatusUpdate(selectedTicket) && (
                <div className="mr-auto">
                  <button
                    className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2"
                    onClick={() =>
                      setStatusConfirmation({
                        visible: true,
                        ticketId: selectedTicket.id,
                        currentStatus: selectedTicket.status,
                        newStatus: "open",
                      })
                    }
                  >
                    <ClipboardEdit size={16} />
                    Change Status
                  </button>
                </div>
              )}
              <button
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                onClick={() => setTicketDetailOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Status Change Modal */}
      {statusConfirmation.visible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">
                Update Status
              </h3>
              <button
                onClick={() =>
                  setStatusConfirmation({
                    visible: false,
                    ticketId: null,
                    currentStatus: null,
                    newStatus: null,
                  })
                }
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* Current Status Display */}
            <div className="mb-6 p-4 bg-slate-50 rounded-lg">
              <div className="text-sm font-medium text-slate-600 mb-2">
                Current Status
              </div>
              <div className="flex items-center">
                <div
                  className={`${
                    getStatusInfo(statusConfirmation.currentStatus).color
                  } ${
                    getStatusInfo(statusConfirmation.currentStatus).bg
                  } py-1.5 px-3 rounded-full text-sm font-medium flex items-center gap-1.5`}
                >
                  {getStatusInfo(statusConfirmation.currentStatus).icon}
                  {statusConfirmation.currentStatus}
                </div>
              </div>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center">
                <div className="px-2 bg-white text-sm text-slate-500">
                  Change to
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <label
                disabled={statusConfirmation.oldStatus === "open"}
                className="flex items-center p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                <input
                  type="radio"
                  name="status"
                  value="open"
                  checked={statusConfirmation.newStatus === "open"}
                  onChange={() =>
                    setStatusConfirmation((prev) => ({
                      ...prev,
                      newStatus: "open",
                    }))
                  }
                  className="h-4 w-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                />
                <div className="ml-3">
                  <div className="font-medium text-slate-900">Open</div>
                  <div className="text-sm text-slate-500">
                    Ticket needs attention
                  </div>
                </div>
              </label>

              <label className="flex items-center p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="in_progress"
                  checked={statusConfirmation.newStatus === "in_progress"}
                  onChange={() =>
                    setStatusConfirmation((prev) => ({
                      ...prev,
                      newStatus: "in_progress",
                    }))
                  }
                  className="h-4 w-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                />
                <div className="ml-3">
                  <div className="font-medium text-slate-900">In Progress</div>
                  <div className="text-sm text-slate-500">
                    Currently being worked on
                  </div>
                </div>
              </label>

              <label className="flex items-center p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="closed"
                  checked={statusConfirmation.newStatus === "closed"}
                  onChange={() =>
                    setStatusConfirmation((prev) => ({
                      ...prev,
                      newStatus: "closed",
                    }))
                  }
                  className="h-4 w-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                />
                <div className="ml-3">
                  <div className="font-medium text-slate-900">Closed</div>
                  <div className="text-sm text-slate-500">
                    Issue has been resolved
                  </div>
                </div>
              </label>
            </div>

            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
                onClick={() =>
                  setStatusConfirmation({
                    visible: false,
                    ticketId: null,
                    currentStatus: null,
                    newStatus: null,
                  })
                }
              >
                Cancel
              </button>
              <button
                disabled={
                  statusConfirmation.currentStatus ===
                  statusConfirmation.newStatus
                }
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors
    ${
      statusConfirmation.currentStatus === statusConfirmation.newStatus
        ? "bg-slate-300 text-slate-500 cursor-not-allowed hover:bg-slate-300"
        : "bg-indigo-600 text-white hover:bg-indigo-700"
    }`}
                onClick={confirmStatusUpdate}
              >
                Update Status
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
              <button
                className="text-slate-400 hover:text-slate-600 transition-colors"
                onClick={toggleNewTicket}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmitTicket}>
              <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                <div>
                  <label
                    className="block text-sm font-medium text-slate-700 mb-1.5"
                    htmlFor="subject"
                  >
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
                  <label
                    className="block text-sm font-medium text-slate-700 mb-1.5"
                    htmlFor="description"
                  >
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
                  <label
                    className="block text-sm font-medium text-slate-700 mb-1.5"
                    htmlFor="priority"
                  >
                    Priority
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    value={newTicket.priority}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 bg-slate-50 hover:bg-white appearance-none transition-all"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 1rem center",
                      backgroundSize: "1.5em",
                    }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                {/* Step-related checkbox */}
                <div className="border-t border-slate-100 pt-4">
                  <label className="flex items-center text-sm font-medium text-slate-700 mb-2">
                    <input
                      type="checkbox"
                      name="isRelatedToStep"
                      checked={newTicket.isRelatedToStep}
                      onChange={handleInputChange}
                      className="form-checkbox h-4 w-4 text-indigo-600 rounded border-slate-300 mr-2"
                    />
                    Is this issue related to a specific step?
                  </label>

                  {newTicket.isRelatedToStep && (
                    <div className="mt-3 ml-6">
                      <label
                        className="block text-sm font-medium text-slate-700 mb-1.5"
                        htmlFor="step"
                      >
                        Select Step
                      </label>
                      <select
                        id="step"
                        name="step"
                        value={newTicket.step}
                        onChange={handleInputChange}
                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 bg-slate-50 hover:bg-white appearance-none transition-all"
                        required={newTicket.isRelatedToStep}
                      >
                        <option value="">Select a step</option>
                        {[...Array(9)].map((_, i) => (
                          <option key={i + 1} value={i + 1}>
                            Step {i + 1}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Assign to members checkbox */}
                <div className="border-t border-slate-100 pt-4">
                  <label className="flex items-center text-sm font-medium text-slate-700 mb-2">
                    <input
                      type="checkbox"
                      name="assignToMembers"
                      checked={newTicket.assignToMembers}
                      onChange={handleInputChange}
                      className="form-checkbox h-4 w-4 text-indigo-600 rounded border-slate-300 mr-2"
                    />
                    Assign this ticket to specific team members
                  </label>

                  {newTicket.assignToMembers && (
                    <div className="mt-3 ml-6">
                      <label
                        className="block text-sm font-medium text-slate-700 mb-1.5"
                        htmlFor="assigned_to"
                      >
                        Select Members (hold Ctrl/Cmd to select multiple)
                      </label>
                      <select
                        id="assigned_to"
                        name="assigned_to"
                        multiple
                        value={newTicket.assigned_to}
                        onChange={handleInputChange}
                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 bg-slate-50 hover:bg-white transition-all min-h-[120px]"
                        required={newTicket.assignToMembers}
                      >
                        {projectMembers.map((member) => (
                          <option key={member.id} value={member.id}>
                            {member.name} ({member.role})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* File attachment area */}
                <div>
                  <label
                    className="block text-sm font-medium text-slate-700 mb-1.5"
                    htmlFor="files"
                  >
                    Attachments (Optional)
                  </label>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-5 text-center bg-slate-50 hover:bg-white transition-colors">
                    <input
                      type="file"
                      id="files"
                      name="files"
                      multiple
                      className="hidden"
                      onChange={handleInputChange}
                    />
                    <label
                      htmlFor="files"
                      className="cursor-pointer text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                      <div className="flex flex-col items-center">
                        <Upload size={28} className="mb-3 text-indigo-500" />
                        <span className="font-medium">
                          Click to upload or drag and drop
                        </span>
                        <span className="text-xs text-slate-500 mt-1.5">
                          PDF, DOC, PNG, JPG up to 10MB
                        </span>
                        {newTicket.files.length > 0 && (
                          <div className="mt-3 text-sm text-indigo-700">
                            {newTicket.files.length} file(s) selected
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                  {/* Show selected file names */}
                  {newTicket.files.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {newTicket.files.map((file, index) => (
                        <div
                          key={index}
                          className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs flex items-center"
                        >
                          <span className="truncate max-w-[150px]">
                            {file.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
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

      {/* The single Status Change Modal with radio buttons */}

      {/* Technical Issue Confirmation Modal */}
      {technicalConfirmation.visible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 animate-scale-in">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Mark as Technical Issue
            </h3>
            <p className="text-slate-600 mb-2">
              Are you sure you want to mark this ticket as a technical issue?
            </p>
            <p className="text-red-600 text-sm mb-6">
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
                onClick={() =>
                  setTechnicalConfirmation({ visible: false, ticketId: null })
                }
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                onClick={confirmMarkTechnical}
              >
                Mark as Technical Issue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Ticket Modal */}
      {editTicketModal.visible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 animate-scale-in">
            <div className="border-b border-slate-200 p-5 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-white rounded-t-xl">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                <ClipboardEdit size={18} className="text-indigo-600 mr-2" />
                Edit Ticket
              </h3>
              <button
                className="text-slate-400 hover:text-slate-600 transition-colors"
                onClick={() =>
                  setEditTicketModal({ visible: false, ticket: null })
                }
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdateTicket}>
              <div className="p-6 space-y-5">
                <div>
                  <label
                    className="block text-sm font-medium text-slate-700 mb-1.5"
                    htmlFor="subject"
                  >
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={editTicketForm.subject}
                    onChange={handleEditInputChange}
                    className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all bg-slate-50 hover:bg-white"
                    required
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium text-slate-700 mb-1.5"
                    htmlFor="description"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={editTicketForm.description}
                    onChange={handleEditInputChange}
                    className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 min-h-[150px] transition-all bg-slate-50 hover:bg-white"
                    required
                  ></textarea>
                </div>
                <div>
                  <label
                    className="block text-sm font-medium text-slate-700 mb-1.5"
                    htmlFor="priority"
                  >
                    Priority
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    value={editTicketForm.priority}
                    onChange={handleEditInputChange}
                    className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 bg-slate-50 hover:bg-white appearance-none transition-all"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="border-t border-slate-200 p-5 flex justify-end space-x-3 bg-slate-50 rounded-b-xl">
                <button
                  type="button"
                  className="px-5 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors font-medium"
                  onClick={() =>
                    setEditTicketModal({ visible: false, ticket: null })
                  }
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Handle Chat modal */}
      {isChatModalOpen && (
        <ChatRoom ticket_id={ticketId} onClose={() => setIsChatModalOpen(false)} />
      )}
    </div>
  );
};

export default Support;
