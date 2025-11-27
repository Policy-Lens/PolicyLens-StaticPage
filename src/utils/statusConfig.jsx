import {
  CheckCircleOutlined,
  SyncOutlined,
  CloseCircleOutlined,
  DashOutlined,
  ExclamationCircleFilled,
} from "@ant-design/icons";

export const getStatusConfig = (status) => {
  const statusMap = {
    in_progress: {
      text: "In Progress",
      color: "blue",
      icon: <SyncOutlined spin />,
    },
    awaiting_approval: {
      text: "Awaiting Approval",
      color: "purple",
      icon: <ExclamationCircleFilled />,
    },
    completed: {
      text: "Completed",
      color: "green",
      icon: <CheckCircleOutlined />,
    },
    rejected: {
      text: "Rejected",
      color: "red",
      icon: <CloseCircleOutlined />,
    },
    not_started: {
      text: "Not Started",
      color: "default",
      icon: <DashOutlined />,
    },
  };

  return statusMap[status] || { text: status, color: "default", icon: null };
};
