// Import Reference for Dashboard Components
// This file serves as a reference for correct import patterns

// ✅ CORRECT: Ant Design Icons (for UI elements)
import { 
  PlusOutlined, 
  EyeOutlined, 
  BarChartOutlined, 
  LineChartOutlined,
  PieChartOutlined,
  TableOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  RobotOutlined,
  SaveOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  FullscreenOutlined,
  SearchOutlined,
  FilterOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  ThunderboltOutlined,
  BulbOutlined
} from '@ant-design/icons';

// ✅ CORRECT: Lucide React Icons (for modern UI elements)
import { 
  BarChart3, 
  Grid3X3, 
  Sparkles, 
  LayoutTemplate,
  Plus,
  Eye,
  Edit,
  Trash2,
  Upload,
  Download,
  FileText,
  Calendar,
  User,
  Users,
  AlertCircle,
  X,
  Info
} from 'lucide-react';

// ✅ CORRECT: Ant Design Components
import { 
  Card, 
  Button, 
  Space, 
  Typography, 
  Row, 
  Col,
  Tabs,
  Modal,
  Input,
  Select,
  Progress,
  Badge,
  Alert,
  Spin,
  Tooltip,
  Dropdown,
  Menu,
  Switch,
  Slider,
  ColorPicker,
  Divider
} from 'antd';

// ❌ WRONG: Don't mix icon libraries
// import { PlusOutlined } from 'lucide-react'; // This will cause errors
// import { BarChart3 } from '@ant-design/icons'; // This will cause errors

export const ICON_LIBRARIES = {
  antd: '@ant-design/icons',
  lucide: 'lucide-react'
};

export const COMMON_ANTD_ICONS = [
  'PlusOutlined',
  'EyeOutlined', 
  'BarChartOutlined',
  'LineChartOutlined',
  'PieChartOutlined',
  'TableOutlined',
  'DashboardOutlined',
  'DatabaseOutlined',
  'RobotOutlined',
  'SaveOutlined',
  'EditOutlined',
  'DeleteOutlined',
  'ReloadOutlined',
  'FullscreenOutlined',
  'SearchOutlined',
  'FilterOutlined',
  'SettingOutlined',
  'CheckCircleOutlined',
  'InfoCircleOutlined',
  'ThunderboltOutlined',
  'BulbOutlined'
];

export const COMMON_LUCIDE_ICONS = [
  'BarChart3',
  'Grid3X3', 
  'Sparkles',
  'LayoutTemplate',
  'Plus',
  'Eye',
  'Edit',
  'Trash2',
  'Upload',
  'Download',
  'FileText',
  'Calendar',
  'User',
  'Users',
  'AlertCircle',
  'X',
  'Info'
];

export default {
  ICON_LIBRARIES,
  COMMON_ANTD_ICONS,
  COMMON_LUCIDE_ICONS
};
