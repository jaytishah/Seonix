export const ROLES = {
  STUDENT: "student",
  TEACHER: "teacher",
  ADMIN: "admin",
};

export const EXAM_STATUS = {
  ACTIVE: "active",
  COMPLETED: "completed",
  ABANDONED: "abandoned",
  TERMINATED: "terminated",
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

export const SEVERITY_LEVELS = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};
