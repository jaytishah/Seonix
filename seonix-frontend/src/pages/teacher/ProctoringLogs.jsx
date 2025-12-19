import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { IoArrowBack, IoWarning, IoShield } from "react-icons/io5";
import Card from "@components/common/Card";
import Button from "@components/common/Button";
import Badge from "@components/common/Badge";
import Loader from "@components/common/Loader";
import EmptyState from "@components/common/EmptyState";
import { formatDateTime, getSeverityBadgeClass } from "@utils/helpers";
import { VIOLATION_LABELS } from "@utils/constants";
import proctoringService from "@services/proctoring.service";
import toast from "react-hot-toast";

const ProctoringLogs = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, [examId]);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const response = await proctoringService.getLogsByExam(examId);
      setLogs(response.data);
    } catch (error) {
      toast.error("Failed to fetch proctoring logs");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loader size="lg" text="Loading proctoring logs..." fullScreen />;
  }

  const totalViolations = logs.reduce(
    (sum, log) => sum + log.violations.length,
    0
  );
  const flaggedCount = logs.filter((log) => log.flaggedForReview).length;

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
            Proctoring Logs
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            AI monitoring and violation tracking
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <IoShield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Students
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {logs.length}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <IoWarning className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Violations
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalViolations}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <IoWarning className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Flagged for Review
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {flaggedCount}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Logs Table */}
      {logs.length > 0 ? (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-dark-border">
                  <th className="text-left py-3 px-4 text-sm font-semibold">
                    Student
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">
                    Violations
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">
                    Risk Score
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log._id}
                    className="border-b border-gray-100 dark:border-dark-border/50 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {log.userName}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {log.userEmail}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(log.violationSummary).map(
                          ([key, count]) =>
                            count > 0 ? (
                              <span
                                key={key}
                                className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 rounded"
                              >
                                {key.replace("Count", "")}: {count}
                              </span>
                            ) : null
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              log.riskScore >= 70
                                ? "bg-red-500"
                                : log.riskScore >= 40
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            }`}
                            style={{ width: `${log.riskScore}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold">
                          {log.riskScore}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={log.flaggedForReview ? "danger" : "success"}
                      >
                        {log.flaggedForReview ? "Flagged" : "Normal"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedLog(log)}
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <EmptyState
          icon={<IoShield className="w-full h-full" />}
          title="No Proctoring Logs"
          description="No proctoring data available for this exam"
        />
      )}

      {/* Detail Modal */}
      {selectedLog && (
        <LogDetailModal
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </div>
  );
};

// Log Detail Modal
const LogDetailModal = ({ log, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-border">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {log.userName}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {log.userEmail}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Risk Score */}
          <div className="text-center p-6 bg-gradient-to-r from-red-600 to-red-700 rounded-xl text-white">
            <p className="text-sm font-medium mb-2">Risk Score</p>
            <p className="text-5xl font-bold">{log.riskScore}</p>
            <p className="text-red-100 mt-2">
              {log.flaggedForReview ? "Flagged for Review" : "Normal Activity"}
            </p>
          </div>

          {/* Violation Summary */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
              Violation Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(log.violationSummary).map(([key, count]) => (
                <div
                  key={key}
                  className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                >
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    {key.replace("Count", "").replace(/([A-Z])/g, " $1")}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {count}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Violations */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
              Detailed Violations ({log.violations.length})
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {log.violations.map((violation, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {VIOLATION_LABELS[violation.type] || violation.type}
                    </span>
                    <Badge variant={getSeverityBadgeClass(violation.severity)}>
                      {violation.severity}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    {violation.description}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDateTime(violation.timestamp)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProctoringLogs;
