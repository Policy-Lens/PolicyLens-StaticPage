import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  MapPin,
  Calendar,
  Grid,
  Plus,
  Link,
  Unlink,
  RefreshCw,
  X,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  initializeGoogleAPI,
  signInGoogle,
  signOutGoogle,
  isUserSignedIn,
  fetchGoogleCalendarEvents,
  convertGoogleEventToMeeting,
  createGoogleCalendarEvent,
} from "../../../utils/googleCalendarApi";

const MeetingCalendar = () => {
  // Updated meeting data with your specified events in order
  const meetings = [
    {
      id: 1,
      title: "Kickoff meetings",
      date: "2025-03-12",
      startTime: "09:00",
      endTime: "10:30",
      attendees: ["Project Team", "Stakeholders"],
      location: "Conference Room A",
    },
    {
      id: 2,
      title: "Gap Analysis",
      date: "2025-03-14",
      startTime: "11:00",
      endTime: "13:00",
      attendees: ["Analysis Team", "Business Representatives"],
      location: "Meeting Room B",
    },
    {
      id: 3,
      title: "Stakeholder interviews",
      date: "2025-03-17",
      startTime: "14:00",
      endTime: "16:00",
      attendees: ["Project Manager", "Key Stakeholders"],
      location: "Executive Suite",
    },
    {
      id: 4,
      title: "Discuss Implementation",
      date: "2025-03-19",
      startTime: "10:00",
      endTime: "12:00",
      attendees: ["Development Team", "Operations"],
      location: "Tech Hub",
    },
    {
      id: 5,
      title: "Kickoff meetings",
      date: "2025-03-20",
      startTime: "13:00",
      endTime: "14:30",
      attendees: ["Marketing Team", "Sales Team"],
      location: "Main Conference Hall",
    },
    {
      id: 6,
      title: "Gap Analysis",
      date: "2025-03-22",
      startTime: "15:00",
      endTime: "16:30",
      attendees: ["Business Analysts", "Department Heads"],
      location: "Strategy Room",
    },
    {
      id: 7,
      title: "Stakeholder interviews",
      date: "2025-03-24",
      startTime: "09:30",
      endTime: "11:30",
      attendees: ["Project Sponsors", "Executive Committee"],
      location: "Board Room",
    },
    {
      id: 8,
      title: "Discuss Implementation",
      date: "2025-03-26",
      startTime: "14:00",
      endTime: "16:00",
      attendees: ["Technical Team", "Quality Assurance"],
      location: "Innovation Lab",
    },
    {
      id: 9,
      title: "Kickoff meetings",
      date: "2025-03-28",
      startTime: "11:00",
      endTime: "12:30",
      attendees: ["New Project Team", "Client Representatives"],
      location: "Client Meeting Room",
    },
  ];

  // State for current month and year
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("month"); // 'month' or 'week'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Google Calendar integration state
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [googleEvents, setGoogleEvents] = useState([]);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [allMeetings, setAllMeetings] = useState(meetings); // Combined meetings

  // Meeting creation modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreatingMeeting, setIsCreatingMeeting] = useState(false);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    eventType: "all", // all, local, google
    dateRange: "all", // all, today, thisWeek, thisMonth, custom
    customStartDate: "",
    customEndDate: "",
    attendeeFilter: "",
    locationFilter: "",
    timeFilter: "all", // all, morning, afternoon, evening
    durationFilter: "all", // all, short, medium, long
  });
  const [filteredMeetings, setFilteredMeetings] = useState([]);

  // Initialize Google API on component mount
  useEffect(() => {
    const initGoogle = async () => {
      try {
        console.log('📅 Initializing Google API and checking for stored token...');
        await initializeGoogleAPI();

        // Small delay to ensure token restoration has completed
        setTimeout(() => {
          const signedIn = isUserSignedIn();
          console.log('📅 Google sign-in status after init:', signedIn);
          setIsGoogleConnected(signedIn);
          if (signedIn) {
            console.log('📅 Token found, loading Google events...');
            loadGoogleEvents();
          }
        }, 100);
      } catch (error) {
        console.error('Failed to initialize Google API:', error);
      }
    };

    initGoogle();
  }, []);

  // Combine local meetings with Google events
  useEffect(() => {
    const combinedMeetings = [...meetings, ...googleEvents];
    setAllMeetings(combinedMeetings);
  }, [googleEvents]);

  // Initialize filtered meetings on first load
  useEffect(() => {
    if (filteredMeetings.length === 0 && allMeetings.length > 0) {
      setFilteredMeetings(allMeetings);
    }
  }, [allMeetings]);

  // Google Calendar functions
  const handleGoogleSignIn = async () => {
    console.log('📅 Calendar: Starting Google sign in process...');
    setIsLoadingGoogle(true);
    try {
      const result = await signInGoogle();
      console.log('📅 Calendar: Sign in result:', result);
      if (result.isSignedIn) {
        console.log('📅 Calendar: Setting connected state and loading events...');
        setIsGoogleConnected(true);
        await loadGoogleEvents();
      } else {
        console.log('📅 Calendar: Sign in failed:', result.error);
      }
    } catch (error) {
      console.error('📅 Calendar: Sign in failed:', error);
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  const handleGoogleSignOut = async () => {
    setIsLoadingGoogle(true);
    try {
      await signOutGoogle();
      setIsGoogleConnected(false);
      setGoogleEvents([]);
    } catch (error) {
      console.error('Sign out failed:', error);
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  const loadGoogleEvents = async () => {
    if (!isUserSignedIn()) return;

    setIsLoadingGoogle(true);
    try {
      // Get events for current month and next month
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfNextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 0);

      const events = await fetchGoogleCalendarEvents(
        startOfMonth.toISOString(),
        endOfNextMonth.toISOString()
      );

      const convertedEvents = events.map(convertGoogleEventToMeeting);
      setGoogleEvents(convertedEvents);
    } catch (error) {
      console.error('Failed to load Google events:', error);
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  const refreshGoogleEvents = async () => {
    if (isGoogleConnected) {
      await loadGoogleEvents();
    }
  };

  // Meeting creation function
  const handleCreateMeeting = async (meetingData) => {
    console.log('📅 Creating meeting:', meetingData);
    setIsCreatingMeeting(true);

    try {
      if (isGoogleConnected) {
        // Create in Google Calendar
        const result = await createGoogleCalendarEvent(meetingData);
        if (result.success) {
          console.log('✅ Meeting created in Google Calendar');
          // Refresh events to show the new meeting
          await loadGoogleEvents();
        } else {
          throw new Error(result.error);
        }
      } else {
        // Create local meeting (add to existing meetings array)
        const newMeeting = {
          id: Date.now(),
          title: meetingData.title,
          date: meetingData.date,
          startTime: meetingData.startTime,
          endTime: meetingData.endTime,
          attendees: meetingData.attendees.length > 0 ? meetingData.attendees : ['No attendees'],
          location: meetingData.location || 'No location specified',
          description: meetingData.description || '',
          source: 'local'
        };

        // Add to allMeetings
        setAllMeetings(prev => [...prev, newMeeting]);
        console.log('✅ Meeting created locally');
      }

      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('❌ Error creating meeting:', error);
      alert('Failed to create meeting: ' + error.message);
    } finally {
      setIsCreatingMeeting(false);
    }
  };

  const handleAddMeetingClick = () => {
    setIsCreateModalOpen(true);
  };

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // Generate days for the calendar
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);

    // Day of week for the first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = firstDay.getDay();
    // Total number of days in the month
    const daysInMonth = lastDay.getDate();

    // Calendar rows need to accommodate first day offset and all days of the month
    const totalCalendarCells =
      Math.ceil((firstDayOfWeek + daysInMonth) / 7) * 7;

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    // Add empty cells for days after the last day of the month
    while (days.length < totalCalendarCells) {
      days.push(null);
    }

    return days;
  };

  // Get meetings for a specific date (now includes Google Calendar events and applies filters)
  const getMeetingsForDate = (date) => {
    if (!date) return [];

    // Use local date instead of UTC to match our IST meeting dates
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;

    console.log(`📅 Looking for meetings on: ${dateString}`);
    const foundMeetings = filteredMeetings.filter((meeting) => meeting.date === dateString);
    console.log(`📅 Found ${foundMeetings.length} meetings:`, foundMeetings.map(m => m.title));

    return foundMeetings;
  };

  // Format date for header display
  const formatMonth = () => {
    return currentDate.toLocaleString("default", {
      month: "long",
      year: "numeric",
    });
  };

  // Check if a date is today
  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Check if a date is selected
  const isSelected = (date) => {
    if (!date) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  // Check if a date has meetings
  const hasMeetings = (date) => {
    return getMeetingsForDate(date).length > 0;
  };

  // Format time for display
  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(":");
    return `${hours}:${minutes}`;
  };

  // Get time difference in minutes
  const getTimeDiff = (start, end) => {
    const [startHours, startMinutes] = start.split(":").map(Number);
    const [endHours, endMinutes] = end.split(":").map(Number);
    return endHours * 60 + endMinutes - (startHours * 60 + startMinutes);
  };

  // Search and filter functions
  const applySearchAndFilters = (meetings) => {
    let filtered = [...meetings];

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(meeting =>
        meeting.title.toLowerCase().includes(query) ||
        meeting.location.toLowerCase().includes(query) ||
        (meeting.description && meeting.description.toLowerCase().includes(query)) ||
        meeting.attendees.some(attendee => attendee.toLowerCase().includes(query))
      );
    }

    // Apply event type filter
    if (activeFilters.eventType !== "all") {
      filtered = filtered.filter(meeting => {
        if (activeFilters.eventType === "google") {
          return meeting.source === "google";
        } else if (activeFilters.eventType === "local") {
          return meeting.source !== "google";
        }
        return true;
      });
    }

    // Apply date range filter
    if (activeFilters.dateRange !== "all") {
      const today = new Date();
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

      filtered = filtered.filter(meeting => {
        const meetingDate = new Date(meeting.date);

        switch (activeFilters.dateRange) {
          case "today":
            return meetingDate.toDateString() === today.toDateString();
          case "thisWeek":
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay());
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            return meetingDate >= startOfWeek && meetingDate <= endOfWeek;
          case "thisMonth":
            return meetingDate.getMonth() === today.getMonth() &&
              meetingDate.getFullYear() === today.getFullYear();
          case "custom":
            if (activeFilters.customStartDate && activeFilters.customEndDate) {
              const startDate = new Date(activeFilters.customStartDate);
              const endDate = new Date(activeFilters.customEndDate);
              return meetingDate >= startDate && meetingDate <= endDate;
            }
            return true;
          default:
            return true;
        }
      });
    }

    // Apply attendee filter
    if (activeFilters.attendeeFilter.trim()) {
      const attendeeQuery = activeFilters.attendeeFilter.toLowerCase();
      filtered = filtered.filter(meeting =>
        meeting.attendees.some(attendee => attendee.toLowerCase().includes(attendeeQuery))
      );
    }

    // Apply location filter
    if (activeFilters.locationFilter.trim()) {
      const locationQuery = activeFilters.locationFilter.toLowerCase();
      filtered = filtered.filter(meeting =>
        meeting.location.toLowerCase().includes(locationQuery)
      );
    }

    // Apply time filter
    if (activeFilters.timeFilter !== "all") {
      filtered = filtered.filter(meeting => {
        const [hours] = meeting.startTime.split(":").map(Number);
        switch (activeFilters.timeFilter) {
          case "morning":
            return hours >= 6 && hours < 12;
          case "afternoon":
            return hours >= 12 && hours < 17;
          case "evening":
            return hours >= 17 && hours < 24;
          default:
            return true;
        }
      });
    }

    // Apply duration filter
    if (activeFilters.durationFilter !== "all") {
      filtered = filtered.filter(meeting => {
        const duration = getTimeDiff(meeting.startTime, meeting.endTime);
        switch (activeFilters.durationFilter) {
          case "short":
            return duration <= 60; // 1 hour or less
          case "medium":
            return duration > 60 && duration <= 180; // 1-3 hours
          case "long":
            return duration > 180; // more than 3 hours
          default:
            return true;
        }
      });
    }

    return filtered;
  };

  // Update filtered meetings when search/filters change
  useEffect(() => {
    const filtered = applySearchAndFilters(allMeetings);
    setFilteredMeetings(filtered);
  }, [allMeetings, searchQuery, activeFilters]);

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery("");
    setActiveFilters({
      eventType: "all",
      dateRange: "all",
      customStartDate: "",
      customEndDate: "",
      attendeeFilter: "",
      locationFilter: "",
      timeFilter: "all",
      durationFilter: "all",
    });
  };

  // Get count of active filters
  const getActiveFilterCount = () => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (activeFilters.eventType !== "all") count++;
    if (activeFilters.dateRange !== "all") count++;
    if (activeFilters.attendeeFilter.trim()) count++;
    if (activeFilters.locationFilter.trim()) count++;
    if (activeFilters.timeFilter !== "all") count++;
    if (activeFilters.durationFilter !== "all") count++;
    return count;
  };

  // Calendar days
  const calendarDays = generateCalendarDays();

  // Get days of week for header
  const weekDays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const weekDaysShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Get selected day meetings
  const selectedDayMeetings = getMeetingsForDate(selectedDate);

  return (
    <div className="flex flex-col h-screen w-full bg-gray-50">
      {/* Calendar Header */}
      <div className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-500 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Calendar className="h-6 w-6 mr-2" />
            <h2 className="text-xl font-bold">{formatMonth()}</h2>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex bg-white bg-opacity-10 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode("month")}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${viewMode === "month"
                  ? "bg-white text-indigo-700"
                  : "text-white hover:bg-white hover:bg-opacity-10"
                  }`}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode("week")}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${viewMode === "week"
                  ? "bg-white text-indigo-700"
                  : "text-white hover:bg-white hover:bg-opacity-10"
                  }`}
              >
                Week
              </button>
            </div>
            <button
              onClick={goToToday}
              className="px-3 py-1.5 text-sm bg-white bg-opacity-20 rounded-md hover:bg-opacity-30 focus:outline-none transition-colors"
            >
              Today
            </button>
            <div className="flex space-x-1">
              <button
                onClick={goToPreviousMonth}
                className="p-1.5 rounded-full hover:bg-white hover:bg-opacity-20 focus:outline-none transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={goToNextMonth}
                className="p-1.5 rounded-full hover:bg-white hover:bg-opacity-20 focus:outline-none transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            {/* Google Calendar Integration Controls */}
            <div className="flex items-center space-x-2">
              {isGoogleConnected ? (
                <>
                  <button
                    onClick={refreshGoogleEvents}
                    disabled={isLoadingGoogle}
                    className="flex items-center px-3 py-1.5 text-sm bg-white bg-opacity-20 rounded-md hover:bg-opacity-30 transition-colors"
                  >
                    <RefreshCw className={`w-4 h-4 mr-1 ${isLoadingGoogle ? 'animate-spin' : ''}`} />
                    {isLoadingGoogle ? 'Loading...' : 'Refresh'}
                  </button>
                  <button
                    onClick={handleGoogleSignOut}
                    disabled={isLoadingGoogle}
                    className="flex items-center px-3 py-1.5 text-sm bg-white bg-opacity-20 rounded-md hover:bg-opacity-30 transition-colors"
                  >
                    <Unlink className="w-4 h-4 mr-1" />
                    Disconnect Google
                  </button>
                </>
              ) : (
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isLoadingGoogle}
                  className="flex items-center px-3 py-1.5 text-sm bg-white bg-opacity-20 rounded-md hover:bg-opacity-30 transition-colors"
                >
                  <Link className="w-4 h-4 mr-1" />
                  {isLoadingGoogle ? 'Connecting...' : 'Connect Google Calendar'}
                </button>
              )}
            </div>

            <button
              onClick={handleAddMeetingClick}
              className="flex items-center px-3 py-1.5 text-sm bg-white text-indigo-700 rounded-md hover:bg-opacity-90 transition-colors"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Meeting
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        {/* Search Bar */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search meetings by title, location, attendees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${showFilters || getActiveFilterCount() > 0
              ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {getActiveFilterCount() > 0 && (
              <span className="ml-2 bg-indigo-600 text-white text-xs px-2 py-1 rounded-full">
                {getActiveFilterCount()}
              </span>
            )}
            {showFilters ? (
              <ChevronUp className="h-4 w-4 ml-2" />
            ) : (
              <ChevronDown className="h-4 w-4 ml-2" />
            )}
          </button>

          {getActiveFilterCount() > 0 && (
            <button
              onClick={clearAllFilters}
              className="px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            {/* Event Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Type
              </label>
              <select
                value={activeFilters.eventType}
                onChange={(e) =>
                  setActiveFilters({ ...activeFilters, eventType: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Events</option>
                <option value="local">Local Events</option>
                <option value="google">Google Calendar</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <select
                value={activeFilters.dateRange}
                onChange={(e) =>
                  setActiveFilters({ ...activeFilters, dateRange: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="thisWeek">This Week</option>
                <option value="thisMonth">This Month</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {/* Time Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time of Day
              </label>
              <select
                value={activeFilters.timeFilter}
                onChange={(e) =>
                  setActiveFilters({ ...activeFilters, timeFilter: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Times</option>
                <option value="morning">Morning (6AM-12PM)</option>
                <option value="afternoon">Afternoon (12PM-5PM)</option>
                <option value="evening">Evening (5PM-12AM)</option>
              </select>
            </div>

            {/* Duration Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration
              </label>
              <select
                value={activeFilters.durationFilter}
                onChange={(e) =>
                  setActiveFilters({ ...activeFilters, durationFilter: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Durations</option>
                <option value="short">Short (≤1 hour)</option>
                <option value="medium">Medium (1-3 hours)</option>
                <option value="long">Long (&gt;3 hours)</option>
              </select>
            </div>

            {/* Custom Date Range */}
            {activeFilters.dateRange === "custom" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={activeFilters.customStartDate}
                    onChange={(e) =>
                      setActiveFilters({ ...activeFilters, customStartDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={activeFilters.customEndDate}
                    onChange={(e) =>
                      setActiveFilters({ ...activeFilters, customEndDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </>
            )}

            {/* Attendee Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attendee
              </label>
              <input
                type="text"
                placeholder="Filter by attendee name..."
                value={activeFilters.attendeeFilter}
                onChange={(e) =>
                  setActiveFilters({ ...activeFilters, attendeeFilter: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Location Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                placeholder="Filter by location..."
                value={activeFilters.locationFilter}
                onChange={(e) =>
                  setActiveFilters({ ...activeFilters, locationFilter: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Active Filters Summary */}
        {(searchQuery || getActiveFilterCount() > 0) && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-blue-700">
                Showing {filteredMeetings.length} of {allMeetings.length} meetings
              </span>
              {searchQuery && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Search: "{searchQuery}"
                  <button
                    onClick={() => setSearchQuery("")}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {activeFilters.eventType !== "all" && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Type: {activeFilters.eventType}
                </span>
              )}
              {activeFilters.dateRange !== "all" && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Range: {activeFilters.dateRange}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Calendar Grid */}
        <div className="flex-1 overflow-auto p-4">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 mb-2">
            {weekDays.map((day, index) => (
              <div
                key={index}
                className="py-2 text-sm font-medium text-center text-gray-500 border-b border-gray-200"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div
            className="grid grid-cols-7 gap-1 h-full"
            style={{ gridAutoRows: "minmax(100px, 1fr)" }}
          >
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`
                  p-2 border relative transition-all duration-200
                  ${!day
                    ? "bg-gray-50 border-gray-100"
                    : "border-gray-200 hover:border-gray-300 cursor-pointer"
                  }
                  ${isToday(day) ? "bg-blue-50 border-blue-200" : ""}
                  ${isSelected(day) ? "ring-2 ring-indigo-500" : ""}
                `}
                onClick={() => day && setSelectedDate(day)}
              >
                {day && (
                  <>
                    <div className="flex justify-between items-center">
                      <span
                        className={`
                        inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium
                        ${isToday(day)
                            ? "bg-blue-600 text-white"
                            : "text-gray-700"
                          }
                      `}
                      >
                        {day.getDate()}
                      </span>

                      {/* Meeting indicator */}
                      {hasMeetings(day) && (
                        <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                          {getMeetingsForDate(day).length}
                        </span>
                      )}
                    </div>

                    {/* Meeting events */}
                    <div
                      className="mt-2 space-y-1 overflow-y-auto"
                      style={{ maxHeight: "calc(100% - 30px)" }}
                    >
                      {getMeetingsForDate(day).map((meeting, i) => (
                        <div
                          key={meeting.id || i}
                          className={`px-2 py-1 text-xs rounded-md truncate hover:shadow-sm transition-shadow ${meeting.source === 'google'
                            ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-l-2 border-green-500'
                            : 'bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-800 border-l-2 border-indigo-500'
                            }`}
                        >
                          <div className="font-medium truncate flex items-center">
                            {meeting.title}
                            {meeting.source === 'google' && (
                              <span className="ml-1 text-green-600 text-xs">●</span>
                            )}
                          </div>
                          <div className={`flex items-center ${meeting.source === 'google' ? 'text-green-600' : 'text-indigo-600'
                            }`}>
                            <Clock className="w-3 h-3 mr-1" />
                            {formatTime(meeting.startTime)} -{" "}
                            {formatTime(meeting.endTime)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Meeting Details Sidebar */}
        <div
          className={`${sidebarCollapsed ? "w-0" : "w-80"
            } border-l border-gray-200 bg-white transition-all duration-300 overflow-hidden`}
        >
          <div className="p-4">
            <div className="bg-indigo-50 rounded-lg p-4 mb-4">
              <h3 className="font-bold text-lg text-indigo-800">
                {selectedDate.toLocaleDateString("en-IN", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </h3>
              <p className="text-sm text-indigo-600 mt-1">
                {selectedDayMeetings.length}{" "}
                {selectedDayMeetings.length === 1 ? "meeting" : "meetings"}{" "}
                scheduled
              </p>
              {isGoogleConnected && (
                <div className="mt-2 flex items-center text-xs text-green-600">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Google Calendar connected
                </div>
              )}
            </div>

            <div className="mb-4">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="w-full py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Meeting for This Day
              </button>
            </div>

            {selectedDayMeetings.length > 0 ? (
              <div className="space-y-4 pb-4">
                {selectedDayMeetings.map((meeting) => (
                  <div
                    key={meeting.id}
                    className={`p-4 rounded-lg bg-white border shadow-sm hover:shadow-md transition-shadow ${meeting.source === 'google'
                      ? 'border-green-200'
                      : 'border-gray-200'
                      }`}
                  >
                    <div className="flex items-start justify-between">
                      <h4 className={`font-bold ${meeting.source === 'google' ? 'text-green-700' : 'text-indigo-700'
                        }`}>
                        {meeting.title}
                      </h4>
                      {meeting.source === 'google' && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          Google Calendar
                        </span>
                      )}
                    </div>

                    <div className="mt-3 space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className={`mr-2 h-4 w-4 mt-0.5 flex-shrink-0 ${meeting.source === 'google' ? 'text-green-500' : 'text-indigo-500'
                          }`} />
                        <span>
                          {formatTime(meeting.startTime)} -{" "}
                          {formatTime(meeting.endTime)}
                        </span>
                        <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${meeting.source === 'google'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-indigo-100 text-indigo-800'
                          }`}>
                          {Math.floor(
                            getTimeDiff(meeting.startTime, meeting.endTime) / 60
                          )}
                          h
                          {getTimeDiff(meeting.startTime, meeting.endTime) %
                            60 !==
                            0 &&
                            ` ${getTimeDiff(meeting.startTime, meeting.endTime) %
                            60
                            }m`}
                        </span>
                      </div>

                      <div className="flex items-start text-sm text-gray-600">
                        <MapPin className={`mr-2 h-4 w-4 mt-0.5 flex-shrink-0 ${meeting.source === 'google' ? 'text-green-500' : 'text-indigo-500'
                          }`} />
                        <span>{meeting.location}</span>
                      </div>

                      <div className="flex items-start text-sm text-gray-600">
                        <User className={`mr-2 h-4 w-4 mt-0.5 flex-shrink-0 ${meeting.source === 'google' ? 'text-green-500' : 'text-indigo-500'
                          }`} />
                        <div>
                          {meeting.attendees.map((attendee, index) => (
                            <div key={index} className="leading-relaxed">
                              {attendee}
                            </div>
                          ))}
                        </div>
                      </div>

                      {meeting.description && meeting.source === 'google' && (
                        <div className="flex items-start text-sm text-gray-600">
                          <div className="mr-2 h-4 w-4 mt-0.5 flex-shrink-0" />
                          <div className="text-gray-500 italic">
                            {meeting.description.substring(0, 100)}
                            {meeting.description.length > 100 && '...'}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex justify-end space-x-2">
                      {meeting.source !== 'google' && (
                        <button className="text-xs font-medium px-2.5 py-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                          Edit
                        </button>
                      )}
                      <button className={`text-xs font-medium px-2.5 py-1.5 rounded-md transition-colors ${meeting.source === 'google'
                        ? 'bg-green-50 text-green-700 hover:bg-green-100'
                        : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                        }`}>
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500 mb-2">
                  No meetings scheduled for this day.
                </p>
                <p className="text-sm text-gray-400 mb-4">
                  Click the button above to schedule a new meeting.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar toggle button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white p-1 border border-gray-200 rounded-l-md shadow-sm"
        >
          <ChevronRight
            className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${sidebarCollapsed ? "rotate-180" : ""
              }`}
          />
        </button>
      </div>

      {/* Create Meeting Modal */}
      {isCreateModalOpen && (
        <CreateMeetingModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreateMeeting={handleCreateMeeting}
          selectedDate={selectedDate}
          isLoading={isCreatingMeeting}
        />
      )}
    </div>
  );
};

// Simple inline Create Meeting Modal
const CreateMeetingModal = ({ isOpen, onClose, onCreateMeeting, selectedDate, isLoading }) => {
  const [formData, setFormData] = React.useState({
    title: '',
    description: '',
    location: '',
    date: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
    startTime: '',
    endTime: '',
    attendees: []
  });
  const [newAttendeeEmail, setNewAttendeeEmail] = React.useState('');

  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        title: '',
        description: '',
        location: '',
        date: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
        startTime: '',
        endTime: '',
        attendees: []
      });
      setNewAttendeeEmail('');
    }
  }, [isOpen, selectedDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.date || !formData.startTime || !formData.endTime) {
      alert('Please fill in all required fields');
      return;
    }
    await onCreateMeeting(formData);
  };

  const addAttendee = () => {
    const email = newAttendeeEmail.trim();
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      if (!formData.attendees.includes(email)) {
        setFormData(prev => ({
          ...prev,
          attendees: [...prev.attendees, email]
        }));
        setNewAttendeeEmail('');
      }
    }
  };

  const removeAttendee = (emailToRemove) => {
    setFormData(prev => ({
      ...prev,
      attendees: prev.attendees.filter(email => email !== emailToRemove)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-indigo-600" />
            Create Meeting
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter meeting title"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time *</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Meeting location (optional)"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Meeting description (optional)"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Attendees</label>
            <div className="flex gap-2 mb-2">
              <input
                type="email"
                value={newAttendeeEmail}
                onChange={(e) => setNewAttendeeEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAttendee())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter email address"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={addAttendee}
                className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                disabled={isLoading}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {formData.attendees.length > 0 && (
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {formData.attendees.map((email, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded text-sm">
                    <span>{email}</span>
                    <button
                      type="button"
                      onClick={() => removeAttendee(email)}
                      className="text-red-500 hover:text-red-700"
                      disabled={isLoading}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Meeting'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MeetingCalendar;
