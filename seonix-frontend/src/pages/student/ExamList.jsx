import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  IoDocumentText,
  IoTime,
  IoCalendar,
  IoSearch,
  IoFilter,
} from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { fetchExams } from "@store/slices/examSlice";
import Card from "@components/common/Card";
import Badge from "@components/common/Badge";
import Button from "@components/common/Button";
import Input from "@components/common/Input";
import Loader from "@components/common/Loader";
import EmptyState from "@components/common/EmptyState";
import {
  formatDateTime,
  isExamLive,
  isExamUpcoming,
  isExamExpired,
} from "@utils/helpers";

const ExamList = () => {
  const dispatch = useDispatch();
  const { exams, isLoading } = useSelector((state) => state.exam);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all"); // all, live, upcoming, expired

  useEffect(() => {
    dispatch(fetchExams());
  }, [dispatch]);

  const filteredExams = exams.filter((exam) => {
    // Search filter
    const matchesSearch =
      exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.description?.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    let matchesFilter = true;
    if (filter === "live") {
      matchesFilter = isExamLive(exam.startDate, exam.endDate);
    } else if (filter === "upcoming") {
      matchesFilter = isExamUpcoming(exam.startDate);
    } else if (filter === "expired") {
      matchesFilter = isExamExpired(exam.endDate);
    }

    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader size="lg" text="Loading exams..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Available Exams
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Browse and take available exams
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search exams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              rightIcon={<IoSearch className="w-5 h-5" />}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === "all"
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("live")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === "live"
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              }`}
            >
              Live
            </button>
            <button
              onClick={() => setFilter("upcoming")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === "upcoming"
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              }`}
            >
              Upcoming
            </button>
          </div>
        </div>
      </Card>

      {/* Exams Grid */}
      {filteredExams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.map((exam, index) => (
            <motion.div
              key={exam.examId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <ExamCard exam={exam} />
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<IoDocumentText className="w-full h-full" />}
          title="No Exams Found"
          description={
            searchQuery
              ? "No exams match your search criteria"
              : "There are no exams available at the moment"
          }
        />
      )}
    </div>
  );
};

// Exam Card Component
const ExamCard = ({ exam }) => {
  const getStatus = () => {
    if (isExamLive(exam.startDate, exam.endDate)) {
      return {
        badge: <Badge variant="success">Live Now</Badge>,
        canTake: true,
      };
    }
    if (isExamUpcoming(exam.startDate)) {
      return {
        badge: <Badge variant="warning">Upcoming</Badge>,
        canTake: false,
      };
    }
    return { badge: <Badge variant="info">Ended</Badge>, canTake: false };
  };

  const { badge, canTake } = getStatus();

  return (
    <Card hoverable className="h-full flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 flex-1">
          {exam.title}
        </h3>
        {badge}
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
        {exam.description || "No description provided"}
      </p>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <IoTime className="w-4 h-4 flex-shrink-0" />
          <span>Duration: {exam.duration} minutes</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <IoDocumentText className="w-4 h-4 flex-shrink-0" />
          <span>
            {exam.totalQuestions} Questions • {exam.totalMarks} Marks
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <IoCalendar className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{formatDateTime(exam.startDate)}</span>
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-gray-200 dark:border-dark-border">
        {canTake ? (
          <Link to={`/student/take-exam/${exam.examId}`}>
            <Button variant="primary" fullWidth>
              Start Exam
            </Button>
          </Link>
        ) : (
          <Button variant="secondary" fullWidth disabled>
            {isExamUpcoming(exam.startDate) ? "Not Started" : "Exam Ended"}
          </Button>
        )}
      </div>
    </Card>
  );
};

export default ExamList;
