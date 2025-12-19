import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import duration from "dayjs/plugin/duration";

dayjs.extend(relativeTime);
dayjs.extend(duration);

// Format date
export const formatDate = (date, format = "MMM DD, YYYY") => {
  return dayjs(date).format(format);
};

// Format date and time
export const formatDateTime = (date, format = "MMM DD, YYYY hh:mm A") => {
  return dayjs(date).format(format);
};

// Get relative time (e.g., "2 hours ago")
export const getRelativeTime = (date) => {
  return dayjs(date).fromNow();
};

// Format duration in minutes
export const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
};

// Format time remaining
// export const formatTimeRemaining = (seconds) => {
//   const hours = Math.floor(seconds / 3600);
//   const minutes = Math.floor((seconds % 3600) / 60);
//   const secs = seconds % 60;

//   if (hours > 0) {
//     return `${hours}:${String(minutes).padStart(2, "0")}:${String(
//       secs
//     ).padStart(2, "0")}`;
//   }
//   return `${minutes}:${String(secs).padStart(2, "0")}`;
// };

export const formatTimeRemaining = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

// Check if exam is live
export const isExamLive = (startDate, endDate) => {
  const now = dayjs();
  return now.isAfter(startDate) && now.isBefore(endDate);
};

// Check if exam is upcoming
export const isExamUpcoming = (startDate) => {
  return dayjs().isBefore(startDate);
};

// Check if exam is expired
export const isExamExpired = (endDate) => {
  return dayjs().isAfter(endDate);
};

// Calculate percentage
export const calculatePercentage = (obtained, total) => {
  if (total === 0) return 0;
  return Math.round((obtained / total) * 100);
};

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

// Get initials from name
export const getInitials = (name) => {
  if (!name) return "U";
  const parts = name.split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

// Shuffle array
export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Get badge color based on status
export const getStatusBadgeClass = (status) => {
  const statusMap = {
    passed: "badge-success",
    failed: "badge-danger",
    under_review: "badge-warning",
    active: "badge-success",
    completed: "badge-info",
    abandoned: "badge-warning",
    terminated: "badge-danger",
  };
  return statusMap[status] || "badge-info";
};

// Get severity badge class
export const getSeverityBadgeClass = (severity) => {
  const severityMap = {
    low: "badge-info",
    medium: "badge-warning",
    high: "badge-danger",
    critical: "badge-danger",
  };
  return severityMap[severity] || "badge-info";
};

// Validate email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password strength
export const getPasswordStrength = (password) => {
  if (!password) return { strength: "none", score: 0 };

  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  const strengthMap = {
    0: "very-weak",
    1: "weak",
    2: "fair",
    3: "good",
    4: "strong",
    5: "very-strong",
    6: "excellent",
  };

  return {
    strength: strengthMap[score],
    score,
  };
};

// Copy to clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Failed to copy:", error);
    return false;
  }
};

// Download as JSON
export const downloadJSON = (data, filename = "data.json") => {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

// Get error message from API response
export const getErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return "An unexpected error occurred";
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function
export const throttle = (func, limit) => {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};
