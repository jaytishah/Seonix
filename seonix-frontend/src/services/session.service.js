import api from "./api";

const sessionService = {
  // Start exam session
  startSession: async (examId) => {
    const response = await api.post("/sessions/start", { examId });
    return response.data;
  },

  // Update session activity
  updateActivity: async (sessionId, activityData) => {
    const response = await api.put(
      `/sessions/${sessionId}/activity`,
      activityData
    );
    return response.data;
  },

  // End session
  endSession: async (sessionId, status = "completed") => {
    const response = await api.put(`/sessions/${sessionId}/end`, { status });
    return response.data;
  },

  // Get session by ID
  getSessionById: async (sessionId) => {
    const response = await api.get(`/sessions/${sessionId}`);
    return response.data;
  },

  // Get sessions by exam (Teacher only)
  getSessionsByExam: async (examId) => {
    const response = await api.get(`/sessions/exam/${examId}`);
    return response.data;
  },
};

export default sessionService;
