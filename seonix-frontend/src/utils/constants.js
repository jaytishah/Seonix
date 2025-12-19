export const APP_NAME =
  import.meta.env.VITE_APP_NAME || "AI Proctored Exam System";
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || "2.0.0";

export const ROLES = {
  STUDENT: "student",
  TEACHER: "teacher",
  ADMIN: "admin",
};

export const VIOLATION_TYPES = {
  NO_FACE: "no_face",
  MULTIPLE_FACES: "multiple_faces",
  CELL_PHONE: "cell_phone",
  PROHIBITED_OBJECT: "prohibited_object",
  TAB_SWITCH: "tab_switch",
  FULLSCREEN_EXIT: "fullscreen_exit",
  COPY_PASTE: "copy_paste",
  SUSPICIOUS_ACTIVITY: "suspicious_activity",
};

export const VIOLATION_LABELS = {
  [VIOLATION_TYPES.NO_FACE]: "No Face Detected",
  [VIOLATION_TYPES.MULTIPLE_FACES]: "Multiple Faces Detected",
  [VIOLATION_TYPES.CELL_PHONE]: "Cell Phone Detected",
  [VIOLATION_TYPES.PROHIBITED_OBJECT]: "Prohibited Object Detected",
  [VIOLATION_TYPES.TAB_SWITCH]: "Tab Switched",
  [VIOLATION_TYPES.FULLSCREEN_EXIT]: "Exited Fullscreen",
  [VIOLATION_TYPES.COPY_PASTE]: "Copy/Paste Attempted",
  [VIOLATION_TYPES.SUSPICIOUS_ACTIVITY]: "Suspicious Activity",
};

export const SEVERITY_LEVELS = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
};

export const EXAM_STATUS = {
  ACTIVE: "active",
  COMPLETED: "completed",
  ABANDONED: "abandoned",
  TERMINATED: "terminated",
};

export const RESULT_STATUS = {
  PASSED: "passed",
  FAILED: "failed",
  UNDER_REVIEW: "under_review",
};

export const LOCALSTORAGE_KEYS = {
  EXAM_SETTINGS: "exam-settings",
  TOKEN: "auth_token",
  USER: "user_data",
  THEME: "app_theme",
};

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",

  // Student Routes
  STUDENT_DASHBOARD: "/student/dashboard",
  STUDENT_EXAMS: "/student/exams",
  STUDENT_EXAM_DETAIL: "/student/exam/:examId",
  STUDENT_TAKE_EXAM: "/student/take-exam/:examId",
  STUDENT_RESULTS: "/student/results",
  STUDENT_RESULT_DETAIL: "/student/result/:resultId",

  // Teacher Routes
  TEACHER_DASHBOARD: "/teacher/dashboard",
  TEACHER_EXAMS: "/teacher/exams",
  TEACHER_CREATE_EXAM: "/teacher/create-exam",
  TEACHER_EDIT_EXAM: "/teacher/edit-exam/:examId",
  TEACHER_EXAM_DETAIL: "/teacher/exam/:examId",
  TEACHER_QUESTIONS: "/teacher/exam/:examId/questions",
  TEACHER_RESULTS: "/teacher/exam/:examId/results",
  TEACHER_PROCTORING: "/teacher/exam/:examId/proctoring",

  // Profile
  PROFILE: "/profile",
  SETTINGS: "/settings",
};

export const PROCTORING_CONFIG = {
  DETECTION_INTERVAL: 3000, // 3 seconds
  VIOLATION_THRESHOLD: {
    NO_FACE: 3,
    MULTIPLE_FACES: 2,
    CELL_PHONE: 1,
    TAB_SWITCH: 3,
    FULLSCREEN_EXIT: 3,
  },
  WEBCAM_CONSTRAINTS: {
    width: 640,
    height: 480,
    facingMode: "user",
  },
};

export const MESSAGES = {
  SUCCESS: {
    LOGIN: "Login successful!",
    REGISTER: "Registration successful!",
    EXAM_CREATED: "Exam created successfully!",
    EXAM_UPDATED: "Exam updated successfully!",
    EXAM_DELETED: "Exam deleted successfully!",
    QUESTION_ADDED: "Question added successfully!",
    EXAM_SUBMITTED: "Exam submitted successfully!",
    PROFILE_UPDATED: "Profile updated successfully!",
  },
  ERROR: {
    GENERIC: "Something went wrong. Please try again.",
    NETWORK: "Network error. Please check your connection.",
    UNAUTHORIZED: "You are not authorized to access this resource.",
    SESSION_EXPIRED: "Your session has expired. Please login again.",
  },
  WARNING: {
    VIOLATION: "Suspicious activity detected!",
    TAB_SWITCH: "Tab switching is not allowed during the exam!",
    FULLSCREEN_EXIT: "Please stay in fullscreen mode!",
    NO_FACE:
      "Your face is not visible. Please ensure you are in front of the camera.",
  },
};
