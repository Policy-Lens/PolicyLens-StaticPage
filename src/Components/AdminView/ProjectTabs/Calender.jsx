import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, User, MapPin, Calendar, Grid, Plus } from 'lucide-react';

const MeetingCalendar = () => {
    // Updated meeting data with your specified events in order
    const meetings = [
        { id: 1, title: 'Kickoff meetings', date: '2025-03-12', startTime: '09:00', endTime: '10:30', attendees: ['Project Team', 'Stakeholders'], location: 'Conference Room A' },
        { id: 2, title: 'Gap Analysis', date: '2025-03-14', startTime: '11:00', endTime: '13:00', attendees: ['Analysis Team', 'Business Representatives'], location: 'Meeting Room B' },
        { id: 3, title: 'Stakeholder interviews', date: '2025-03-17', startTime: '14:00', endTime: '16:00', attendees: ['Project Manager', 'Key Stakeholders'], location: 'Executive Suite' },
        { id: 4, title: 'Discuss Implementation', date: '2025-03-19', startTime: '10:00', endTime: '12:00', attendees: ['Development Team', 'Operations'], location: 'Tech Hub' },
        { id: 5, title: 'Kickoff meetings', date: '2025-03-20', startTime: '13:00', endTime: '14:30', attendees: ['Marketing Team', 'Sales Team'], location: 'Main Conference Hall' },
        { id: 6, title: 'Gap Analysis', date: '2025-03-22', startTime: '15:00', endTime: '16:30', attendees: ['Business Analysts', 'Department Heads'], location: 'Strategy Room' },
        { id: 7, title: 'Stakeholder interviews', date: '2025-03-24', startTime: '09:30', endTime: '11:30', attendees: ['Project Sponsors', 'Executive Committee'], location: 'Board Room' },
        { id: 8, title: 'Discuss Implementation', date: '2025-03-26', startTime: '14:00', endTime: '16:00', attendees: ['Technical Team', 'Quality Assurance'], location: 'Innovation Lab' },
        { id: 9, title: 'Kickoff meetings', date: '2025-03-28', startTime: '11:00', endTime: '12:30', attendees: ['New Project Team', 'Client Representatives'], location: 'Client Meeting Room' },
    ];

    // State for current month and year
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('month'); // 'month' or 'week'
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
        const totalCalendarCells = Math.ceil((firstDayOfWeek + daysInMonth) / 7) * 7;

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

    // Get meetings for a specific date
    const getMeetingsForDate = (date) => {
        if (!date) return [];

        const dateString = date.toISOString().split('T')[0];
        return meetings.filter(meeting => meeting.date === dateString);
    };

    // Format date for header display
    const formatMonth = () => {
        return currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    };

    // Check if a date is today
    const isToday = (date) => {
        if (!date) return false;
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    // Check if a date is selected
    const isSelected = (date) => {
        if (!date) return false;
        return date.getDate() === selectedDate.getDate() &&
            date.getMonth() === selectedDate.getMonth() &&
            date.getFullYear() === selectedDate.getFullYear();
    };

    // Check if a date has meetings
    const hasMeetings = (date) => {
        return getMeetingsForDate(date).length > 0;
    };

    // Format time for display
    const formatTime = (timeString) => {
        const [hours, minutes] = timeString.split(':');
        return `${hours}:${minutes}`;
    };

    // Get time difference in minutes
    const getTimeDiff = (start, end) => {
        const [startHours, startMinutes] = start.split(':').map(Number);
        const [endHours, endMinutes] = end.split(':').map(Number);
        return (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
    };

    // Calendar days
    const calendarDays = generateCalendarDays();

    // Get days of week for header
    const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const weekDaysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
                                onClick={() => setViewMode('month')}
                                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${viewMode === 'month' ? 'bg-white text-indigo-700' : 'text-white hover:bg-white hover:bg-opacity-10'}`}
                            >
                                Month
                            </button>
                            <button
                                onClick={() => setViewMode('week')}
                                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${viewMode === 'week' ? 'bg-white text-indigo-700' : 'text-white hover:bg-white hover:bg-opacity-10'}`}
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
                        <button className="flex items-center px-3 py-1.5 text-sm bg-white text-indigo-700 rounded-md hover:bg-opacity-90 transition-colors">
                            <Plus className="w-4 h-4 mr-1" />
                            Add Meeting
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Calendar Grid */}
                <div className="flex-1 overflow-auto p-4">
                    {/* Weekday Headers */}
                    <div className="grid grid-cols-7 mb-2">
                        {weekDays.map((day, index) => (
                            <div key={index} className="py-2 text-sm font-medium text-center text-gray-500 border-b border-gray-200">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Days */}
                    <div className="grid grid-cols-7 gap-1 h-full" style={{ gridAutoRows: "minmax(100px, 1fr)" }}>
                        {calendarDays.map((day, index) => (
                            <div
                                key={index}
                                className={`
                  p-2 border relative transition-all duration-200
                  ${!day ? 'bg-gray-50 border-gray-100' : 'border-gray-200 hover:border-gray-300 cursor-pointer'}
                  ${isToday(day) ? 'bg-blue-50 border-blue-200' : ''}
                  ${isSelected(day) ? 'ring-2 ring-indigo-500' : ''}
                `}
                                onClick={() => day && setSelectedDate(day)}
                            >
                                {day && (
                                    <>
                                        <div className="flex justify-between items-center">
                                            <span className={`
                        inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium
                        ${isToday(day) ? 'bg-blue-600 text-white' : 'text-gray-700'}
                      `}>
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
                                        <div className="mt-2 space-y-1 overflow-y-auto" style={{ maxHeight: "calc(100% - 30px)" }}>
                                            {getMeetingsForDate(day).map((meeting, i) => (
                                                <div
                                                    key={i}
                                                    className="px-2 py-1 text-xs rounded-md bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-800 border-l-2 border-indigo-500 truncate hover:shadow-sm transition-shadow"
                                                >
                                                    <div className="font-medium truncate">{meeting.title}</div>
                                                    <div className="text-indigo-600 flex items-center">
                                                        <Clock className="w-3 h-3 mr-1" />
                                                        {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
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
                <div className={`${sidebarCollapsed ? 'w-0' : 'w-80'} border-l border-gray-200 bg-white transition-all duration-300 overflow-hidden`}>
                    <div className="p-4">
                        <div className="bg-indigo-50 rounded-lg p-4 mb-4">
                            <h3 className="font-bold text-lg text-indigo-800">
                                {selectedDate.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </h3>
                            <p className="text-sm text-indigo-600 mt-1">
                                {selectedDayMeetings.length} {selectedDayMeetings.length === 1 ? 'meeting' : 'meetings'} scheduled
                            </p>
                        </div>

                        <div className="mb-4">
                            <button className="w-full py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center">
                                <Plus className="w-4 h-4 mr-1" />
                                Add Meeting for This Day
                            </button>
                        </div>

                        {selectedDayMeetings.length > 0 ? (
                            <div className="space-y-4 pb-4">
                                {selectedDayMeetings.map(meeting => (
                                    <div
                                        key={meeting.id}
                                        className="p-4 rounded-lg bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                                    >
                                        <h4 className="font-bold text-indigo-700">{meeting.title}</h4>

                                        <div className="mt-3 space-y-3">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Clock className="mr-2 h-4 w-4 text-indigo-500" />
                                                <span>{formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}</span>
                                                <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-indigo-100 text-indigo-800">
                                                    {Math.floor(getTimeDiff(meeting.startTime, meeting.endTime) / 60)}h
                                                    {getTimeDiff(meeting.startTime, meeting.endTime) % 60 !== 0 &&
                                                        ` ${getTimeDiff(meeting.startTime, meeting.endTime) % 60}m`}
                                                </span>
                                            </div>

                                            <div className="flex items-start text-sm text-gray-600">
                                                <MapPin className="mr-2 h-4 w-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                                                <span>{meeting.location}</span>
                                            </div>

                                            <div className="flex items-start text-sm text-gray-600">
                                                <User className="mr-2 h-4 w-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    {meeting.attendees.map((attendee, index) => (
                                                        <div key={index} className="leading-relaxed">{attendee}</div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex justify-end space-x-2">
                                            <button className="text-xs font-medium px-2.5 py-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                                                Edit
                                            </button>
                                            <button className="text-xs font-medium px-2.5 py-1.5 rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors">
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
                                <p className="text-gray-500 mb-2">No meetings scheduled for this day.</p>
                                <p className="text-sm text-gray-400 mb-4">Click the button above to schedule a new meeting.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar toggle button */}
                <button
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white p-1 border border-gray-200 rounded-l-md shadow-sm"
                >
                    <ChevronRight className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`} />
                </button>
            </div>
        </div>
    );
};

export default MeetingCalendar;