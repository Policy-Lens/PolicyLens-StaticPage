import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { apiRequest } from '../../../../utils/api';
import { message, DatePicker, Select, Input, Button, Card, Tag, Tooltip, Spin, Empty, Modal, Pagination } from 'antd';
import { 
  SearchOutlined, 
  FilterOutlined, 
  ReloadOutlined, 
  EyeOutlined,
  UserOutlined,
  CalendarOutlined,
  FileTextOutlined,
  EditOutlined,
  UploadOutlined,
  CloseOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

const ActivityLogs = () => {
  const { projectid } = useParams();
  
  // State for logs data
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalLogs, setTotalLogs] = useState(0);
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // State for filters
  const [filters, setFilters] = useState({
    activity_type: '',
    content_type: '',
    user_id: '',
    date_range: null,
    search: ''
  });
  
  // State for filter visibility
  const [showFilters, setShowFilters] = useState(false);
  
  // State for detailed log view modal
  const [selectedLog, setSelectedLog] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Refs for drag scrolling
  const tableContainerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  // Constants for options to avoid re-declaration on each render
  const activityTypes = [
    { value: 'create', label: 'Create', color: 'green' },
    { value: 'update', label: 'Update', color: 'blue' },
    { value: 'delete', label: 'Delete', color: 'red' },
    { value: 'upload', label: 'Upload', color: 'orange' },
    { value: 'assign', label: 'Assign', color: 'purple' },
  ];

  const contentTypes = [
    { value: 'RiskAssessment', label: 'Risk Assessment' },
    { value: 'RiskTreatment', label: 'Risk Treatment' },
    { value: 'VAPT', label: 'VAPT' },
    { value: 'ASIS_Report', label: 'ASIS Report' },
    { value: 'RiskAssessmentSheet', label: 'Assessment Sheet' },
    { value: 'RiskTreatmentSheet', label: 'Treatment Sheet' },
  ];

  // Mouse event handlers for drag scrolling - Updated for both horizontal and vertical
  const handleMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setStartX(e.pageX - tableContainerRef.current.offsetLeft);
    setStartY(e.pageY - tableContainerRef.current.offsetTop);
    setScrollLeft(tableContainerRef.current.scrollLeft);
    setScrollTop(tableContainerRef.current.scrollTop);
    tableContainerRef.current.style.cursor = 'grabbing';
    tableContainerRef.current.style.userSelect = 'none';
  };

  const handleMouseLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (tableContainerRef.current) {
      tableContainerRef.current.style.cursor = 'grab';
      tableContainerRef.current.style.userSelect = 'auto';
    }
  };

  const handleMouseUp = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (tableContainerRef.current) {
      tableContainerRef.current.style.cursor = 'grab';
      tableContainerRef.current.style.userSelect = 'auto';
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    e.stopPropagation();
    const x = e.pageX - tableContainerRef.current.offsetLeft;
    const y = e.pageY - tableContainerRef.current.offsetTop;
    const walkX = (x - startX) * 2; // Scroll speed multiplier for horizontal
    const walkY = (y - startY) * 2; // Scroll speed multiplier for vertical
    tableContainerRef.current.scrollLeft = scrollLeft - walkX;
    tableContainerRef.current.scrollTop = scrollTop - walkY;
  };

  // Fetch activity logs from the API
  const fetchLogs = useCallback(async () => {
    if (!projectid) return;
    
    setLoading(true);
    try {
      // Build query parameters dynamically
      const params = new URLSearchParams({
        page: currentPage.toString(),
        page_size: pageSize.toString(),
        // Note: The 'project' parameter is part of the URL path, 
        // but can also be sent as a query param if your backend supports it.
        // project: projectid, 
      });

      // Append filters only if they have a value
      if (filters.activity_type) params.append('activity_type', filters.activity_type);
      if (filters.content_type) params.append('content_type', filters.content_type);
      if (filters.user_id) params.append('user_id', filters.user_id);
      if (filters.search) params.append('search', filters.search);
      if (filters.date_range && filters.date_range.length === 2) {
        params.append('start_date', dayjs(filters.date_range[0]).format('YYYY-MM-DD'));
        params.append('end_date', dayjs(filters.date_range[1]).format('YYYY-MM-DD'));
      }

      const response = await apiRequest(
        'GET',
        `/api/rarpt/project/${projectid}/activities/?${params.toString()}`,
        null,
        true
      );

      // Handle both paginated and non-paginated responses gracefully
      if (response.data) {
        setLogs(response.data.results || (Array.isArray(response.data) ? response.data : []));
        setTotalLogs(response.data.count || response.data.length || 0);
      }
    } catch (err) {
      console.error('Error fetching activity logs:', err);
      message.error(err.message || 'Failed to fetch activity logs');
    } finally {
      setLoading(false);
    }
  }, [projectid, currentPage, pageSize, filters]);

  // Effect to fetch logs on initial mount or when dependencies change
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Handle changes to any filter input
  const handleFilterChange = (key, value) => {
    // When filters change, reset to the first page
    if (currentPage !== 1) {
        setCurrentPage(1);
    }
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Clear all active filters and reset to the first page
  const clearFilters = () => {
    setFilters({
      activity_type: '',
      content_type: '',
      user_id: '',
      date_range: null,
      search: ''
    });
    if (currentPage !== 1) {
        setCurrentPage(1);
    }
  };

  // Get activity type color for tags
  const getActivityColor = (activityType) => {
    const activity = activityTypes.find(a => a.value === activityType);
    return activity?.color || 'default';
  };
  
  // Get an icon based on the content type for better visual distinction
  const getContentTypeIcon = (contentType) => {
    switch (contentType) {
      case 'RiskAssessment': return <FileTextOutlined style={{ color: '#1890ff' }} />;
      case 'RiskTreatment': return <EditOutlined style={{ color: '#52c41a' }} />;
      case 'VAPT': return <UploadOutlined style={{ color: '#fa8c16' }} />;
      case 'ASIS_Report': return <FileTextOutlined style={{ color: '#722ed1' }} />;
      default: return <FileTextOutlined />;
    }
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    return dayjs(timestamp).format('MMM DD, YYYY, hh:mm:ss A');
  };

  // Handle opening the log detail modal
  const handleViewLog = (log) => {
    setSelectedLog(log);
    setIsModalVisible(true);
  };

  // Handle closing the log detail modal
  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedLog(null); // Clear selected log on close
  };

  // Handle pagination changes from Ant Design's component
  const onPaginationChange = (page, size) => {
      setCurrentPage(page);
      setPageSize(size);
  }

  // Export logs to a CSV file
  const exportLogs = async () => {
    message.loading({ content: 'Exporting logs...', key: 'export' });
    try {
      // Construct the export URL with the project ID
      const exportUrl = `/api/rarpt/activity-logs/export/?project=${projectid}`;
      const response = await apiRequest('GET', exportUrl, null, true);

      if (response.data) {
        // Create a Blob from the CSV data and trigger a download
        const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `activity_logs_${dayjs().format('YYYY-MM-DD')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        message.success({ content: 'Logs exported successfully!', key: 'export', duration: 2 });
      }
    } catch (err) {
      console.error('Error exporting logs:', err);
      message.error({ content: 'Failed to export logs', key: 'export', duration: 2 });
    }
  };

  return (
    <div className="flex flex-col font-sans">
      {/* Compact Header Section */}
      <header className="mb-2">
        <div className="flex items-center justify-end">
          <div className="flex gap-2">
            <Button icon={<ReloadOutlined />} onClick={fetchLogs} loading={loading} size="small">
              Refresh
            </Button>
            <Button type="primary" icon={<DownloadOutlined />} onClick={exportLogs} size="small">
              Export CSV
            </Button>
          </div>
        </div>
      </header>

      {/* Filters Section */}
      <Card className="mb-2 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-2 gap-2">
          <Input
            placeholder="Search logs by description..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            style={{ maxWidth: 350 }}
            allowClear
          />
          <div className="flex items-center gap-2">
             {Object.values(filters).some(v => v) && (
                <Button onClick={clearFilters} danger size="small">
                  Clear Filters
                </Button>
              )}
            <Button icon={<FilterOutlined />} onClick={() => setShowFilters(!showFilters)} size="small">
              {showFilters ? 'Hide' : 'Show'} Filters
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 pt-2 border-t border-gray-200">
            <Select
              placeholder="Filter by Activity Type"
              value={filters.activity_type || undefined}
              onChange={(value) => handleFilterChange('activity_type', value)}
              allowClear
            >
              {activityTypes.map(type => (
                <Option key={type.value} value={type.value}>
                  <Tag color={type.color} className="m-0">{type.label}</Tag>
                </Option>
              ))}
            </Select>

            <Select
              placeholder="Filter by Content Type"
              value={filters.content_type || undefined}
              onChange={(value) => handleFilterChange('content_type', value)}
              allowClear
            >
              {contentTypes.map(type => (
                <Option key={type.value} value={type.value}>{type.label}</Option>
              ))}
            </Select>

            <Input
              placeholder="Filter by User ID"
              value={filters.user_id}
              onChange={(e) => handleFilterChange('user_id', e.target.value)}
              allowClear
            />

            <RangePicker
              value={filters.date_range}
              onChange={(dates) => handleFilterChange('date_range', dates)}
            />
          </div>
        )}
      </Card>

      {/* Logs Table Section */}
      <Card className="shadow-sm flex-1 flex flex-col min-h-0">
        <Spin spinning={loading} tip="Loading logs...">
          <div className="flex-1 flex flex-col min-h-0">
            {/* Table Container with Drag Scroll */}
            <div className="flex-1 overflow-hidden min-h-0">
              <div 
                ref={tableContainerRef}
                className="h-full overflow-y-auto overflow-x-auto cursor-grab active:cursor-grabbing select-none"
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                onDragStart={(e) => e.preventDefault()}
                onWheel={(e) => e.stopPropagation()}
              >
                <table className="w-full min-w-[800px] select-none">
                  <thead className="sticky top-0 bg-gray-100 z-10">
                    <tr className="border-b">
                      {['Activity', 'Content Type', 'Description', 'User', 'Timestamp', 'Actions'].map(header => (
                         <th key={header} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider select-none">
                            {header}
                         </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="select-none">
                    {logs.length > 0 ? logs.map((log) => (
                      <tr key={log.id} className="border-b hover:bg-gray-50 transition-colors duration-200 select-none">
                        <td className="px-4 py-3 select-none">
                          <Tag color={getActivityColor(log.activity_type)}>
                            {log.activity_type?.toUpperCase()}
                          </Tag>
                        </td>
                        <td className="px-4 py-3 select-none">
                          <div className="flex items-center gap-2">
                            {getContentTypeIcon(log.content_type)}
                            <span className="text-sm text-gray-700">{log.content_type}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 select-none">
                          <p className="text-sm text-gray-800 truncate max-w-sm" title={log.description}>
                            {log.description}
                          </p>
                        </td>
                        <td className="px-4 py-3 select-none">
                          <div className="flex items-center gap-2">
                            <UserOutlined className="text-gray-400" />
                            <span className="text-sm text-gray-700">
                              {log.user_details?.name || log.user_details?.email || log.user_id || 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 select-none">
                          <div className="flex items-center gap-2">
                            <CalendarOutlined className="text-gray-400" />
                            <span className="text-sm text-gray-700 whitespace-nowrap">
                              {formatTimestamp(log.timestamp)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 select-none">
                          <Tooltip title="View Details">
                            <Button
                              type="text"
                              shape="circle"
                              icon={<EyeOutlined />}
                              onClick={() => handleViewLog(log)}
                            />
                          </Tooltip>
                        </td>
                      </tr>
                    )) : (
                        <tr className="select-none">
                            <td colSpan="6" className="select-none">
                                 <div className="text-center py-12 select-none">
                                    <Empty description="No activity logs found for the selected criteria." />
                                 </div>
                            </td>
                        </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Pagination: Using Ant Design's component for robustness */}
          {totalLogs > 0 && (
            <div className="flex justify-center sm:justify-end items-center mt-6">
               <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={totalLogs}
                    onChange={onPaginationChange}
                    showSizeChanger
                    showQuickJumper
                    showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
                />
            </div>
          )}
        </Spin>
      </Card>

      {/* Log Detail Modal: Using Ant Design's component */}
      <Modal
        title="Activity Log Details"
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={[
          <Button key="close" onClick={handleCloseModal}>
            Close
          </Button>,
        ]}
        width={600}
        styles={{ body: { 
          maxHeight: '70vh', 
          overflowY: 'auto',
          padding: '16px'
        } }}
        style={{ top: 20 }}
      >
        {selectedLog && (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900">Activity Details</h4>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <span className="text-gray-600">Activity Type:</span>
                  <Tag color={getActivityColor(selectedLog.activity_type)} className="ml-2">
                    {selectedLog.activity_type?.toUpperCase()}
                  </Tag>
                </div>
                <div>
                  <span className="text-gray-600">Content Type:</span>
                  <span className="ml-2">{selectedLog.content_type}</span>
                </div>
                <div>
                  <span className="text-gray-600">User:</span>
                  <span className="ml-2">{selectedLog.user_details?.name || selectedLog.user_details?.email || selectedLog.user_id || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Timestamp:</span>
                  <span className="ml-2">{formatTimestamp(selectedLog.timestamp)}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md border border-gray-200 break-words">
                {selectedLog.description}
              </p>
            </div>
            {selectedLog.details && (
              <div>
                <h4 className="font-semibold text-gray-900">Additional Details</h4>
                <pre className="text-sm text-gray-700 bg-gray-50 p-3 rounded overflow-x-auto">
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ActivityLogs;
