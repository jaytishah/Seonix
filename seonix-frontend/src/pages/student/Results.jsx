import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  IoTrophy,
  IoCheckmarkCircle,
  IoClose,
  IoSearch,
} from "react-icons/io5";
import Card from "@components/common/Card";
import Badge from "@components/common/Badge";
import Input from "@components/common/Input";
import Loader from "@components/common/Loader";
import EmptyState from "@components/common/EmptyState";
import { formatDateTime } from "@utils/helpers";
import resultService from "@services/result.service";
import toast from "react-hot-toast";

const Results = () => {
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedResult, setSelectedResult] = useState(null);

  useEffect(() => {
    fetchResults();
  }, []);

  useEffect(() => {
    const filtered = results.filter((result) =>
      result.examId.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredResults(filtered);
  }, [searchQuery, results]);

  const fetchResults = async () => {
    try {
      setIsLoading(true);
      const response = await resultService.getMyResults();
      setResults(response.data);
      setFilteredResults(response.data);
    } catch (error) {
      toast.error("Failed to fetch results");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader size="lg" text="Loading results..." />
      </div>
    );
  }

  const totalExams = results.length;
  const passedExams = results.filter((r) => r.status === "passed").length;
  const averageScore =
    totalExams > 0
      ? Math.round(
          results.reduce((sum, r) => sum + r.percentage, 0) / totalExams
        )
      : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          My Results
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          View your exam results and performance
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <IoTrophy className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Exams
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalExams}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <IoCheckmarkCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Passed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {passedExams}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <IoTrophy className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Average Score
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {averageScore}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <Input
          placeholder="Search results by exam ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          rightIcon={<IoSearch className="w-5 h-5" />}
        />
      </Card>

      {/* Results Table */}
      {filteredResults.length > 0 ? (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-dark-border">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                    Exam ID
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                    Score
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                    Percentage
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                    Time Taken
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                    Submitted At
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((result, index) => (
                  <motion.tr
                    key={result._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-gray-100 dark:border-dark-border/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                    onClick={() => setSelectedResult(result)}
                  >
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-white font-mono">
                      {result.examId.slice(-8)}
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                      {result.obtainedMarks}/{result.totalMarks}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              result.percentage >= 80
                                ? "bg-green-500"
                                : result.percentage >= 60
                                ? "bg-blue-500"
                                : result.percentage >= 40
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${result.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {result.percentage}%
                        </span>
                      </div>
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
                      {result.timeTaken} min
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {formatDateTime(result.submittedAt)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <EmptyState
          icon={<IoTrophy className="w-full h-full" />}
          title="No Results Found"
          description={
            searchQuery
              ? "No results match your search criteria"
              : "You haven't completed any exams yet"
          }
        />
      )}

      {/* Result Detail Modal */}
      {selectedResult && (
        <ResultDetailModal
          result={selectedResult}
          onClose={() => setSelectedResult(null)}
        />
      )}
    </div>
  );
};

// Result Detail Modal Component
const ResultDetailModal = ({ result, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-border">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Result Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <IoClose className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Score Card */}
          <div className="text-center p-6 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl text-white">
            <p className="text-sm font-medium mb-2">Your Score</p>
            <p className="text-5xl font-bold mb-2">{result.percentage}%</p>
            <p className="text-primary-100">
              {result.obtainedMarks} out of {result.totalMarks} marks
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Total Questions
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {result.totalQuestions}
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Attempted
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {result.attemptedQuestions}
              </p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Correct Answers
              </p>
              <p className="text-xl font-bold text-green-600">
                {result.correctAnswers}
              </p>
            </div>
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Wrong Answers
              </p>
              <p className="text-xl font-bold text-red-600">
                {result.wrongAnswers}
              </p>
            </div>
          </div>

          {/* Status */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Status
              </span>
              <Badge
                variant={result.status === "passed" ? "success" : "danger"}
                size="lg"
              >
                {result.status === "passed" ? "Passed ✓" : "Failed ✗"}
              </Badge>
            </div>
          </div>

          {/* Feedback */}
          {result.feedback && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Teacher's Feedback
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {result.feedback}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Results;
