import api from "./api";

const resultService = {
  // Submit exam
  submitExam: async (examId, sessionId, answers) => {
    const response = await api.post("/results/submit", {
      examId,
      sessionId,
      answers,
    });
    return response.data;
  },

  // Get my results (Student only)
  getMyResults: async () => {
    const response = await api.get("/results/student/me");
    return response.data;
  },

  // Get result by ID
  getResultById: async (resultId) => {
    const response = await api.get(`/results/${resultId}`);
    return response.data;
  },

  // Get results by exam (Teacher only)
  getResultsByExam: async (examId) => {
    const response = await api.get(`/results/exam/${examId}`);
    return response.data;
  },

  // Toggle result visibility (Teacher only)
  toggleVisibility: async (resultId, showToStudent) => {
    const response = await api.put(`/results/${resultId}/publish`, {
      showToStudent,
    });
    return response.data;
  },

  // Add feedback (Teacher only)
  addFeedback: async (resultId, feedback) => {
    const response = await api.put(`/results/${resultId}/feedback`, {
      feedback,
    });
    return response.data;
  },
};

export default resultService;
