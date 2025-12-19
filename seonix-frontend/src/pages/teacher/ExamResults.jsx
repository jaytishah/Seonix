import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { IoArrowBack, IoDownload, IoEye } from "react-icons/io5";
import Card from "@components/common/Card";
import Button from "@components/common/Button";
import Badge from "@components/common/Badge";
import Loader from "@components/common/Loader";
import EmptyState from "@components/common/EmptyState";
import { formatDateTime } from "@utils/helpers";
import resultService from "@services/result.service";
import toast from "react-hot-toast";

const ExamResults = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchResults();
  }, [examId]);

  const fetchResults = async () => {
    try {
      setIsLoading(true);
      const response = await resultService.getResultsByExam(examId);
      setResults(response.data);
      calculateStats(response.data);
    } catch (error) {
      toast.error("Failed to fetch results");
      console.error("Fetch results error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (data) => {
    if (data.length === 0) {
      setStats({});
      return;
    }

    const totalAttempts = data.length;
    const passedCount = data.filter((r) => r.status === "passed").length;
    const averageScore = Math.round(
      data.reduce((sum, r) => sum + r.percentage, 0) / totalAttempts
    );
    const highestScore = Math.max(...data.map((r) => r.percentage));
    const lowestScore = Math.min(...data.map((r) => r.percentage));

    setStats({
      totalAttempts,
      passedCount,
      failedCount: totalAttempts - passedCount,
      averageScore,
      highestScore,
      lowestScore,
      passRate: Math.round((passedCount / totalAttempts) * 100),
    });
  };

  const handleToggleVisibility = async (resultId, currentVisibility) => {
    
    try {
       const newVisibility = !currentVisibility;
       console.log("Toggling visibility:", {
         resultId,
         currentVisibility,
         newVisibility,
       });
      await resultService.toggleVisibility(resultId, newVisibility);
      toast.success(
        `Result ${
          !currentVisibility ? "published" : "unpublished"
        } successfully`
      );
      fetchResults();
    } catch (error) {
      console.error("Toggle visibility error:", error);
      const errorMessage = error.response?.data?.message || "Failed to update result visibility";
      toast.error(errorMessage);
    }
  };

  if (isLoading) {
    return <Loader size="lg" text="Loading results..." fullScreen />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<IoArrowBack />}
          onClick={() => navigate("/teacher/exams")}
        >
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Exam Results
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage student results
          </p>
        </div>
      </div>

      {/* Statistics */}
      {results.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Total Attempts
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.totalAttempts}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Passed
            </p>
            <p className="text-2xl font-bold text-green-600">
              {stats.passedCount}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Failed
            </p>
            <p className="text-2xl font-bold text-red-600">
              {stats.failedCount}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Pass Rate
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.passRate}%
            </p>
          </Card>
          <Card>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Average
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.averageScore}%
            </p>
          </Card>
          <Card>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              High/Low
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.highestScore}/{stats.lowestScore}
            </p>
          </Card>
        </div>
      )}

      {/* Results Table */}
      {results.length > 0 ? (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-dark-border">
                  <th className="text-left py-3 px-4 text-sm font-semibold">
                    Student
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">
                    Score
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">
                    Percentage
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">
                    Time Taken
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">
                    Submitted
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">
                    Visibility
                  </th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => (
                  <tr
                    key={result._id}
                    className="border-b border-gray-100 dark:border-dark-border/50 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {result.userId?.name || "Unknown"}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {result.userId?.email}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold">
                      {result.obtainedMarks}/{result.totalMarks}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
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
                        <span className="text-sm font-semibold">
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
                    <td className="py-3 px-4">
                      <button
                        onClick={() =>
                          handleToggleVisibility(
                            result._id,
                            result.showToStudent
                          )
                        }
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors hover:cursor-pointer ${
                          result.showToStudent
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                      >
                        {result.showToStudent ? "Visible" : "Hidden"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <EmptyState
          title="No Results Yet"
          description="No students have completed this exam yet"
        />
      )}
    </div>
  );
};

export default ExamResults;
