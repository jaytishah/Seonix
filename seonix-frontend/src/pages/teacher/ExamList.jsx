import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  IoDocumentText,
  IoAdd,
  IoSearch,
  IoCreate,
  IoEye,
  IoTrash,
  IoStatsChart,
} from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { fetchExams, deleteExam } from "@store/slices/examSlice";
import Card from "@components/common/Card";
import Badge from "@components/common/Badge";
import Button from "@components/common/Button";
import Input from "@components/common/Input";
import Loader from "@components/common/Loader";
import EmptyState from "@components/common/EmptyState";
import Modal from "@components/common/Modal";
import { formatDateTime } from "@utils/helpers";
import toast from "react-hot-toast";

const ExamList = () => {
  const dispatch = useDispatch();
  const { exams, isLoading } = useSelector((state) => state.exam);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [deleteModal, setDeleteModal] = useState({ show: false, examId: null });

  useEffect(() => {
    dispatch(fetchExams());
  }, [dispatch]);

  const filteredExams = exams.filter((exam) => {
    const matchesSearch =
      exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.description?.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesFilter = true;
    if (filter === "active") {
      matchesFilter = exam.isActive;
    } else if (filter === "inactive") {
      matchesFilter = !exam.isActive;
    }

    return matchesSearch && matchesFilter;
  });

  const handleDelete = async () => {
    try {
      await dispatch(deleteExam(deleteModal.examId)).unwrap();
      toast.success("Exam deleted successfully");
      setDeleteModal({ show: false, examId: null });
    } catch (error) {
      toast.error("Failed to delete exam");
    }
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Exams
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create and manage your examinations
          </p>
        </div>
        <Link to="/teacher/create-exam">
          <Button variant="primary" leftIcon={<IoAdd />}>
            Create New Exam
          </Button>
        </Link>
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
              onClick={() => setFilter("active")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === "active"
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter("inactive")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === "inactive"
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              }`}
            >
              Inactive
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
              <ExamCard
                exam={exam}
                onDelete={(examId) => setDeleteModal({ show: true, examId })}
              />
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
              : "Create your first exam to get started"
          }
          actionLabel="Create Exam"
          onAction={() => (window.location.href = "/teacher/create-exam")}
        />
      )}

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal.show}
        onClose={() => setDeleteModal({ show: false, examId: null })}
        title="Delete Exam"
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to delete this exam? This action cannot be
            undone. All associated questions, results, and proctoring logs will
            be deleted.
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setDeleteModal({ show: false, examId: null })}
            >
              Cancel
            </Button>
            <Button variant="danger" fullWidth onClick={handleDelete}>
              Delete Exam
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// Exam Card Component
const ExamCard = ({ exam, onDelete }) => {
  return (
    <Card hoverable className="h-full flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 flex-1">
          {exam.title}
        </h3>
        <Badge variant={exam.isActive ? "success" : "danger"}>
          {exam.isActive ? "Active" : "Inactive"}
        </Badge>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
        {exam.description || "No description"}
      </p>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Questions:</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {exam.totalQuestions}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Attempts:</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {exam.statistics?.totalAttempts || 0}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Violations:</span>
          <span className="font-semibold text-red-600">
            {exam.statistics?.totalViolations || 0}
          </span>
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-gray-200 dark:border-dark-border space-y-2">
        <div className="grid grid-cols-3 gap-2">
          <Link to={`/teacher/exam/${exam.examId}/questions`}>
            <Button
              variant="outline"
              size="sm"
              fullWidth
              leftIcon={<IoCreate />}
            >
              Edit
            </Button>
          </Link>
          <Link to={`/teacher/exam/${exam.examId}/results`}>
            <Button
              variant="outline"
              size="sm"
              fullWidth
              leftIcon={<IoStatsChart />}
            >
              Results
            </Button>
          </Link>
          <Link to={`/teacher/exam/${exam.examId}/proctoring`}>
            <Button variant="outline" size="sm" fullWidth leftIcon={<IoEye />}>
              Logs
            </Button>
          </Link>
        </div>
        <Button
          variant="danger"
          size="sm"
          fullWidth
          leftIcon={<IoTrash />}
          onClick={() => onDelete(exam.examId)}
        >
          Delete
        </Button>
      </div>
    </Card>
  );
};

export default ExamList;
