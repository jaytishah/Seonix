import api from "./api";

const proctoringService = {
  // Create or update proctoring log
  createOrUpdateLog: async (examId, sessionId) => {
    const response = await api.post("/proctoring/log", { examId, sessionId });
    return response.data;
  },

  // Log violation
  logViolation: async (violationData) => {
    const response = await api.post("/proctoring/violation", violationData);
    return response.data;
  },

  // Get proctoring log by session
  getLogBySession: async (sessionId) => {
    const response = await api.get(`/proctoring/session/${sessionId}`);
    return response.data;
  },

  // Get proctoring logs by exam (Teacher only)
  getLogsByExam: async (examId) => {
    const response = await api.get(`/proctoring/exam/${examId}`);
    return response.data;
  },

  // Get flagged logs (Teacher only)
  getFlaggedLogs: async () => {
    const response = await api.get("/proctoring/flagged");
    return response.data;
  },

  // Update review status (Teacher only)
  updateReview: async (logId, reviewData) => {
    const response = await api.put(`/proctoring/${logId}/review`, reviewData);
    return response.data;
  },
};

export default proctoringService;
