import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  IoDocumentText,
  IoPersonAdd,
  IoShield,
  IoStatsChart,
  IoArrowForward,
  IoWarning,
} from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { fetchExams } from "@store/slices/examSlice";
import Card from "@components/common/Card";
import Badge from "@components/common/Badge";
import Button from "@components/common/Button";
import Loader from "@components/common/Loader";
import EmptyState from "@components/common/EmptyState";
import { formatDateTime } from "@utils/helpers";
import proctoringService from "@services/proctoring.service";
// import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

// ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { exams, isLoading } = useSelector((state) => state.exam);
  const [stats, setStats] = useState({
    totalExams: 0,
    activeExams: 0,
    totalAttempts: 0,
    totalViolations: 0,
  });
  const [flaggedLogs, setFlaggedLogs] = useState([]);

  useEffect(() => {
    dispatch(fetchExams());
    fetchFlaggedLogs();
  }, [dispatch]);

  useEffect(() => {
    if (exams.length > 0) {
      calculateStats();
    }
  }, [exams]);

  const calculateStats = () => {
    const activeExams = exams.filter((exam) => exam.isActive);
    const totalAttempts = exams.reduce(
      (sum, exam) => sum + (exam.statistics?.totalAttempts || 0),
      0
    );
    const totalViolations = exams.reduce(
      (sum, exam) => sum + (exam.statistics?.totalViolations || 0),
      0
    );

    setStats({
      totalExams: exams.length,
      activeExams: activeExams.length,
      totalAttempts,
      totalViolations,
    });
  };

  const fetchFlaggedLogs = async () => {
    try {
      const response = await proctoringService.getFlaggedLogs();
      setFlaggedLogs(response.data.slice(0, 5));
    } catch (error) {
      console.error("Error fetching flagged logs:", error);
    }
  };

  const StatCard = ({ icon, label, value, color, link }) => (
    <Link to={link}>
      <Card hoverable className="h-full">
        <div className="flex items-center gap-4">
          <div
            className={`w-14 h-14 rounded-xl flex items-center justify-center ${color}`}
          >
            {icon}
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {value}
            </p>
          </div>
        </div>
      </Card>
    </Link>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-8 text-white"
      >
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-primary-100">
          Manage your exams and monitor student activities from your dashboard.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<IoDocumentText className="w-8 h-8 text-blue-600" />}
          label="Total Exams"
          value={stats.totalExams}
          color="bg-blue-100 dark:bg-blue-900/30"
          link="/teacher/exams"
        />
        <StatCard
          icon={<IoStatsChart className="w-8 h-8 text-green-600" />}
          label="Active Exams"
          value={stats.activeExams}
          color="bg-green-100 dark:bg-green-900/30"
          link="/teacher/exams"
        />
        <StatCard
          icon={<IoPersonAdd className="w-8 h-8 text-purple-600" />}
          label="Total Attempts"
          value={stats.totalAttempts}
          color="bg-purple-100 dark:bg-purple-900/30"
          link="/teacher/exams"
        />
        <StatCard
          icon={<IoShield className="w-8 h-8 text-red-600" />}
          label="Violations"
          value={stats.totalViolations}
          color="bg-red-100 dark:bg-red-900/30"
          link="/teacher/exams"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/teacher/create-exam">
            <Card hoverable>
              <div className="text-center py-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-2xl flex items-center justify-center">
                  <IoDocumentText className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  Create New Exam
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Set up a new examination
                </p>
              </div>
            </Card>
          </Link>

          <Link to="/teacher/exams">
            <Card hoverable>
              <div className="text-center py-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center">
                  <IoStatsChart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  View All Exams
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage existing exams
                </p>
              </div>
            </Card>
          </Link>

          <Link to="/teacher/exams">
            <Card hoverable>
              <div className="text-center py-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center">
                  <IoShield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  Proctoring Logs
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Review violations
                </p>
              </div>
            </Card>
          </Link>
        </div>
      </div>

      {/* Recent Exams */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Recent Exams
          </h2>
          <Link to="/teacher/exams">
            <Button variant="outline" size="sm" rightIcon={<IoArrowForward />}>
              View All
            </Button>
          </Link>
        </div>

        {exams.length > 0 ? (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-dark-border">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                      Exam Title
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                      Questions
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                      Attempts
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {exams.slice(0, 5).map((exam) => (
                    <tr
                      key={exam.examId}
                      className="border-b border-gray-100 dark:border-dark-border/50 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="py-3 px-4">
                        <Link
                          to={`/teacher/exam/${exam.examId}/questions`}
                          className="text-sm font-medium text-primary-600 hover:text-primary-700"
                        >
                          {exam.title}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                        {exam.totalQuestions}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                        {exam.statistics?.totalAttempts || 0}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={exam.isActive ? "success" : "danger"}>
                          {exam.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                        {formatDateTime(exam.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <EmptyState
            icon={<IoDocumentText className="w-full h-full" />}
            title="No Exams Yet"
            description="Create your first exam to get started"
            actionLabel="Create Exam"
            onAction={() => (window.location.href = "/teacher/create-exam")}
          />
        )}
      </div>

      {/* Flagged Violations */}
      {flaggedLogs.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <IoWarning className="w-6 h-6 text-red-600" />
              Flagged for Review
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {flaggedLogs.map((log) => (
              <Card key={log._id} className="border-l-4 border-red-600">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {log.userName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {log.userEmail}
                    </p>
                  </div>
                  <Badge variant="danger">Risk: {log.riskScore}</Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Total Violations: {log.violations.length}
                </p>
                <Link to={`/teacher/exam/${log.examId}/proctoring`}>
                  <Button variant="outline" size="sm" fullWidth>
                    Review
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
