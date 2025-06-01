/**
 * Formats a date string or Date object to a readable date and time format
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date and time string (e.g., "Jan 1, 2024 - 2:30 PM")
 */
export const formatToDateTime = (date) => {
    const dateObj = new Date(date);
    return `${dateObj.toDateString()} - ${dateObj.toLocaleTimeString()}`;
};

/**
 * Formats a date string or Date object to a readable date format
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date string (e.g., "Jan 1, 2024")
 */
export const formatToDate = (date) => {
    const dateObj = new Date(date);
    return dateObj.toDateString();
};

/**
 * Formats a date string or Date object to a readable time format
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted time string (e.g., "2:30 PM")
 */
export const formatToTime = (date) => {
    const dateObj = new Date(date);
    return dateObj.toLocaleTimeString();
}; 