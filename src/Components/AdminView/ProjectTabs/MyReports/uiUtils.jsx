// Shared UI utility functions for report components

export const toggleGroup = (expandedGroups, setExpandedGroups, group) => {
  setExpandedGroups(prev => ({
    ...prev,
    [group]: !prev[group]
  }));
};

export const renderExpandIcon = (isExpanded) => (
  <svg
    className={`w-4 h-4 transition-transform duration-200 ${
      isExpanded ? 'rotate-180' : ''
    }`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 9l-7 7-7-7"
    />
  </svg>
); 