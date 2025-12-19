import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  IoDocumentText,
  IoTrophy,
  IoTime,
  IoCheckmarkCircle,
  IoArrowForward,
} from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { fetchExams } from "@store/slices/examSlice";
import Card from "@components/common/Card";
import Badge from "@components/common/Badge";
import Button from "@components/common/Button";
import Loader from "@components/common/Loader";
import EmptyState from "@components/common/EmptyState";
import { formatDateTime, isExamLive, isExamUpcoming } from "@utils/helpers";
import resultService from "@services/result.service";
import toast from "react-hot-toast";

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { exams, isLoading } = useSelector((state) => state.exam);
  const [stats, setStats] = useState({
    totalExams: 0,
    completedExams: 0,
    upcomingExams: 0,
    averageScore: 0,
  });
  const [recentResults, setRecentResults] = useState([]);

  useEffect(() => {
    dispatch(fetchExams());
    fetchResults();
  }, [dispatch]);

  useEffect(() => {
    if (exams.length > 0) {
      calculateStats();
    }
  }, [exams]);

  const fetchResults = async () => {
    try {
      const response = await resultService.getMyResults();
      setRecentResults(response.data.slice(0, 5));
    } catch (error) {
      console.error("Error fetching results:", error);
    }
  };

  const calculateStats = () => {
    const liveExams = exams.filter((exam) =>
      isExamLive(exam.startDate, exam.endDate)
    );
    const upcoming = exams.filter((exam) => isExamUpcoming(exam.startDate));

    setStats({
      totalExams: exams.length,
      completedExams: recentResults.length,
      upcomingExams: upcoming.length,
      averageScore:
        recentResults.length > 0
          ? Math.round(
              recentResults.reduce((sum, r) => sum + r.percentage, 0) /
                recentResults.length
            )
          : 0,
    });
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
          Ready to take your next exam? Check out available exams below.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<IoDocumentText className="w-8 h-8 text-blue-600" />}
          label="Available Exams"
          value={stats.totalExams}
          color="bg-blue-100 dark:bg-blue-900/30"
          link="/student/exams"
        />
        <StatCard
          icon={<IoCheckmarkCircle className="w-8 h-8 text-green-600" />}
          label="Completed"
          value={stats.completedExams}
          color="bg-green-100 dark:bg-green-900/30"
          link="/student/results"
        />
        <StatCard
          icon={<IoTime className="w-8 h-8 text-orange-600" />}
          label="Upcoming"
          value={stats.upcomingExams}
          color="bg-orange-100 dark:bg-orange-900/30"
          link="/student/exams"
        />
        <StatCard
          icon={<IoTrophy className="w-8 h-8 text-purple-600" />}
          label="Average Score"
          value={`${stats.averageScore}%`}
          color="bg-purple-100 dark:bg-purple-900/30"
          link="/student/results"
        />
      </div>

      {/* Live Exams */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Live Exams
          </h2>
          <Link to="/student/exams">
            <Button variant="outline" size="sm" rightIcon={<IoArrowForward />}>
              View All
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams
            .filter((exam) => isExamLive(exam.startDate, exam.endDate))
            .slice(0, 3)
            .map((exam) => (
              <ExamCard key={exam.examId} exam={exam} />
            ))}

          {exams.filter((exam) => isExamLive(exam.startDate, exam.endDate))
            .length === 0 && (
            <div className="col-span-full">
              <EmptyState
                icon={<IoDocumentText className="w-full h-full" />}
                title="No Live Exams"
                description="There are no exams available right now. Check back later!"
              />
            </div>
          )}
        </div>
      </div>

      {/* Recent Results */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Recent Results
          </h2>
          <Link to="/student/results">
            <Button variant="outline" size="sm" rightIcon={<IoArrowForward />}>
              View All
            </Button>
          </Link>
        </div>

        {recentResults.length > 0 ? (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-dark-border">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                      Exam
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                      Score
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentResults.map((result) => (
                    <tr
                      key={result._id}
                      className="border-b border-gray-100 dark:border-dark-border/50 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                        Exam #{result.examId.slice(-6)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {result.obtainedMarks}/{result.totalMarks} (
                          {result.percentage}%)
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            result.status === "passed" ? "success" : "danger"
                          }
                        >
                          {result.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                        {formatDateTime(result.submittedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <EmptyState
            icon={<IoTrophy className="w-full h-full" />}
            title="No Results Yet"
            description="You haven't completed any exams yet. Start taking exams to see your results here!"
            actionLabel="View Exams"
            onAction={() => (window.location.href = "/student/exams")}
          />
        )}
      </div>
    </div>
  );
};

// Exam Card Component
const ExamCard = ({ exam }) => {
  const getLiveStatus = () => {
    if (isExamLive(exam.startDate, exam.endDate)) {
      return <Badge variant="success">Live Now</Badge>;
    }
    if (isExamUpcoming(exam.startDate)) {
      return <Badge variant="warning">Upcoming</Badge>;
    }
    return <Badge variant="info">Ended</Badge>;
  };

  return (
    <Card hoverable>
      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2">
            {exam.title}
          </h3>
          {getLiveStatus()}
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
          {exam.description || "No description available"}
        </p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <IoTime className="w-4 h-4" />
            <span>Duration: {exam.duration} minutes</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <IoDocumentText className="w-4 h-4" />
            <span>Questions: {exam.totalQuestions}</span>
          </div>
        </div>

        <div className="mt-auto">
          <Link to={`/student/take-exam/${exam.examId}`}>
            <Button variant="primary" fullWidth>
              Start Exam
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};

export default Dashboard;
