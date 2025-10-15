// Commonly Available Ant Design Icons for Dashboard Components
// This file serves as a reference for available icons

export const CHART_ICONS = {
  // Basic Charts
  bar: 'BarChartOutlined',
  line: 'LineChartOutlined', 
  pie: 'PieChartOutlined',
  table: 'TableOutlined',
  
  // Advanced Charts
  gauge: 'DashboardFilled',
  heatmap: 'AppstoreOutlined',
  scatter: 'DotChartOutlined',
  radar: 'FundOutlined',
  treemap: 'ClusterOutlined',
  
  // Data & Analytics
  database: 'DatabaseOutlined',
  analytics: 'BarChartOutlined',
  statistics: 'FundOutlined',
  trends: 'LineChartOutlined',
  
  // Dashboard & UI
  dashboard: 'DashboardOutlined',
  grid: 'AppstoreOutlined',
  layout: 'LayoutOutlined',
  fullscreen: 'FullscreenOutlined',
  
  // Actions
  add: 'PlusOutlined',
  edit: 'EditOutlined',
  delete: 'DeleteOutlined',
  save: 'SaveOutlined',
  refresh: 'ReloadOutlined',
  download: 'DownloadOutlined',
  upload: 'UploadOutlined',
  
  // Navigation
  back: 'ArrowLeftOutlined',
  forward: 'ArrowRightOutlined',
  up: 'ArrowUpOutlined',
  down: 'ArrowDownOutlined',
  
  // Status
  success: 'CheckCircleOutlined',
  error: 'CloseCircleOutlined',
  warning: 'ExclamationCircleOutlined',
  info: 'InfoCircleOutlined',
  
  // AI & Smart Features
  robot: 'RobotOutlined',
  thunderbolt: 'ThunderboltOutlined',
  bulb: 'BulbOutlined',
  sparkles: 'StarOutlined',
  
  // Data Sources
  file: 'FileOutlined',
  folder: 'FolderOutlined',
  cloud: 'CloudOutlined',
  server: 'ServerOutlined',
  
  // Filters & Search
  filter: 'FilterOutlined',
  search: 'SearchOutlined',
  setting: 'SettingOutlined',
  tool: 'ToolOutlined'
};

// Icon mapping for easy reference
export const getChartIcon = (chartType) => {
  const iconMap = {
    bar: 'BarChartOutlined',
    line: 'LineChartOutlined',
    pie: 'PieChartOutlined',
    table: 'TableOutlined',
    gauge: 'DashboardFilled',
    heatmap: 'AppstoreOutlined',
    scatter: 'DotChartOutlined',
    radar: 'FundOutlined',
    treemap: 'ClusterOutlined'
  };
  return iconMap[chartType] || 'BarChartOutlined';
};

export default CHART_ICONS;






