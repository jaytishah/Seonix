// src/utils/errorHandler.js

export const getErrorMessage = (error) => {
  // Check if it's an Axios error with response
  if (error.response) {
    // Server responded with error status
    const message =
      error.response.data?.message ||
      error.response.data?.error ||
      error.response.statusText;
    return message;
  } else if (error.request) {
    // Request made but no response received
    return "No response from server. Please check your connection.";
  } else {
    // Error in request setup
    return error.message || "An unexpected error occurred";
  }
};
