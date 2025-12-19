import api from "./api";

const examService = {
  // Get all exams
  getAllExams: async () => {
    const response = await api.get("/exams");
    return response.data;
  },

  // Get exam by ID
  getExamById: async (examId) => {
    const response = await api.get(`/exams/${examId}`);
    return response.data;
  },

  // Create new exam (Teacher only)
  createExam: async (examData) => {
    const response = await api.post("/exams", examData);
    return response.data;
  },

  // Update exam (Teacher only)
  updateExam: async (examId, examData) => {
    const response = await api.put(`/exams/${examId}`, examData);
    return response.data;
  },

  // Delete exam (Teacher only)
  deleteExam: async (examId) => {
    const response = await api.delete(`/exams/${examId}`);
    return response.data;
  },

  // Get exam statistics (Teacher only)
  getExamStatistics: async (examId) => {
    const response = await api.get(`/exams/${examId}/statistics`);
    return response.data;
  },

  // Get questions for exam
  getQuestionsByExam: async (examId, shuffle = true) => {
    const response = await api.get(`/questions/exam/${examId}`, {
      params: { shuffle },
    });
    return response.data;
  },

  // Create question (Teacher only)
  createQuestion: async (questionData) => {
    const response = await api.post("/questions", questionData);
    return response.data;
  },

  // Bulk create questions (Teacher only)
  bulkCreateQuestions: async (examId, questions) => {
    const response = await api.post("/questions/bulk", { examId, questions });
    return response.data;
  },

  // Update question (Teacher only)
  updateQuestion: async (questionId, questionData) => {
    const response = await api.put(`/questions/${questionId}`, questionData);
    return response.data;
  },

  // Delete question (Teacher only)
  deleteQuestion: async (questionId) => {
    const response = await api.delete(`/questions/${questionId}`);
    return response.data;
  },
};

export default examService;
