import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/context/ThemeContext";
import { store } from "@store/store";
import { useAuth } from "@hooks/useAuth";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Layouts
import DashboardLayout from "@components/layout/DashboardLayout";

// Auth Pages
import Login from "@pages/auth/Login";
import Register from "@pages/auth/Register";

// Student Pages
import StudentDashboard from "@pages/student/Dashboard";
import StudentExams from "@pages/student/ExamList";
import TakeExam from "@pages/student/TakeExam";
import StudentResults from "@pages/student/Results";

// Teacher Pages
import TeacherDashboard from "@pages/teacher/Dashboard";
import TeacherExams from "@pages/teacher/ExamList";
import CreateExam from "./pages/teacher/CreateExam";
import ManageQuestions from "./pages/teacher/ManageQuestions";
import ExamResults from "./pages/teacher/ExamResults";
import ProctoringLogs from "./pages/teacher/ProctoringLogs";

// Common Pages
import Profile from "./pages/Profile";
import NotFound from "@pages/NotFound";

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Public Route Component (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  console.log('PublicRoute check:', { isAuthenticated, isLoading, user: user?.role });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (isAuthenticated && user) {
    console.log('✅ Redirecting to dashboard:', user.role);
    const dashboardPath =
      user?.role === "student" ? "/student/dashboard" : "/teacher/dashboard";
    return <Navigate to={dashboardPath} replace />;
  }

  return children;
};


function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Student Routes */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="exams" element={<StudentExams />} />
        <Route path="results" element={<StudentResults />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Student Exam Taking (Fullscreen) */}
      <Route
        path="/student/take-exam/:examId"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <TakeExam />
          </ProtectedRoute>
        }
      />

      {/* Teacher Routes */}
      <Route
        path="/teacher"
        element={
          <ProtectedRoute allowedRoles={["teacher"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<TeacherDashboard />} />
        <Route path="exams" element={<TeacherExams />} />
        <Route path="create-exam" element={<CreateExam />} />
        <Route path="exam/:examId/questions" element={<ManageQuestions />} />
        <Route path="exam/:examId/results" element={<ExamResults />} />
        <Route path="exam/:examId/proctoring" element={<ProctoringLogs />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <Router>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "var(--color-dark-card)",
                color: "var(--color-light-bg)",
              },
              success: {
                iconTheme: {
                  primary: "#10b981",
                  secondary: "#fff",
                },
              },
              error: {
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "#fff",
                },
              },
            }}
          />
          <ToastContainer />
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
