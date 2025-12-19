import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  IoWarning,
  IoCheckmarkCircle,
  IoClose,
  IoCamera,
  IoExpand,
  IoTime,
} from "react-icons/io5";
import Webcam from "react-webcam";
import {
  fetchExamById,
  fetchQuestions,
  setAnswer,
} from "@store/slices/examSlice";
import { useTimer } from "@hooks/useTimer";
import { useFullscreen } from "@hooks/useFullscreen";
import { useTabSwitch } from "@hooks/useTabSwitch";
import { useWebcam } from "@hooks/useWebcam";
import { useProctoring } from "@hooks/useProctoring";
import { usePreventCheating } from "@hooks/usePreventCheating";
import Button from "@components/common/Button";
import Loader from "@components/common/Loader";
import Modal from "@components/common/Modal";
import sessionService from "@services/session.service";
import resultService from "@services/result.service";
import toast from "react-hot-toast";
import { VIOLATION_TYPES, PROCTORING_CONFIG, MESSAGES } from "@utils/constants";
import { formatTimeRemaining } from "@utils/helpers";
import { getErrorMessage } from "@utils/errorHandler";


const TakeExam = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const webcamRef = useRef(null);

  const { currentExam, questions, answers } = useSelector(
    (state) => state.exam
  );
  const { user } = useSelector((state) => state.auth);

  const [isLoading, setIsLoading] = useState(true);
  const [sessionId, setSessionId] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [violations, setViolations] = useState([]);
  const [webcamReady, setWebcamReady] = useState(false);

  const fullscreenViolationLoggedRef = useRef(false);

  // Initialize exam
  useEffect(() => {
    initializeExam();
  }, [examId]);

  const initializeExam = async () => {
    try {
      setIsLoading(true);

      // Fetch exam details
      await dispatch(fetchExamById(examId)).unwrap();

      // Fetch questions
      await dispatch(fetchQuestions({ examId, shuffle: true })).unwrap();

      setIsLoading(false);
    } catch (error) {
      toast.error("Failed to load exam");
      navigate("/student/exams");
    }
  };

  // AI Proctoring
  const {
    startMonitoring,
    stopMonitoring,
    handleViolation: logViolation,
  } = useProctoring(examId, sessionId, true);

  // Timer
  const {
    timeRemaining,
    minutes,
    seconds,
    start: startTimer,
  } = useTimer(currentExam?.duration * 60 || 3600, handleTimeUp);

  // Fullscreen
  // const { isFullscreen, enterFullscreen, exitFullscreen } = useFullscreen(
  //   (isFullscreen) => {
  //     if (!isFullscreen && sessionId && !showInstructions) {
  //       handleViolation(
  //         VIOLATION_TYPES.FULLSCREEN_EXIT,
  //         "high",
  //         "Exited fullscreen mode"
  //       );
  //       toast.error(MESSAGES.WARNING.FULLSCREEN_EXIT);
  //     }
  //   }
  // );

  // Fullscreen - Pass exam active status
  const { isFullscreen, enterFullscreen, exitFullscreen, markExamAsCompleted } =
    useFullscreen((isFullscreen) => {
      if (
        !isFullscreen &&
        sessionId &&
        !showInstructions &&
        !fullscreenViolationLoggedRef.current
      ) {
        fullscreenViolationLoggedRef.current = true;

        handleViolation(
          VIOLATION_TYPES.FULLSCREEN_EXIT,
          "high",
          "Exited fullscreen mode"
        );
        toast.error(MESSAGES.WARNING.FULLSCREEN_EXIT);

        setTimeout(() => {
          fullscreenViolationLoggedRef.current = false;
        }, 3000);
      }
    }, !showInstructions && !!sessionId);

  // Tab Switch Detection
  const { tabSwitchCount } = useTabSwitch((count) => {
    if (sessionId && !showInstructions) {
      handleViolation(
        VIOLATION_TYPES.TAB_SWITCH,
        "medium",
        `Tab switched ${count} times`
      );
      toast.error(MESSAGES.WARNING.TAB_SWITCH);

      // Auto-submit if threshold exceeded
      if (count >= PROCTORING_CONFIG.VIOLATION_THRESHOLD.TAB_SWITCH) {
        toast.error("Too many tab switches! Exam will be auto-submitted.");
        setTimeout(() => handleSubmit(true), 3000);
      }
    }
  }, !showInstructions && sessionId);

  // Webcam
  const {
    videoRef,
    isActive: webcamActive,
    startWebcam,
    stopWebcam,
  } = useWebcam();

  // Prevent Cheating
  usePreventCheating(examId, sessionId, true);

  // Start exam session
  // const startExam = async () => {
  //   try {
  //     // Start exam session - THIS CREATES THE SESSION ID
  //     const response = await sessionService.startSession(examId);
  //     const newSessionId = response.data.sessionId;
  //     setSessionId(newSessionId); // ✅ Set sessionId first

  //     console.log("✅ Session created:", newSessionId);

  //     // Request fullscreen
  //     const fullscreenSuccess = await enterFullscreen();
  //     if (!fullscreenSuccess) {
  //       toast.error("Fullscreen is required to take the exam");
  //       return;
  //     }

  //     // Start webcam
  //     await startWebcam();

  //     // Start timer
  //     startTimer();

  //     setShowInstructions(false);

  //     // ✅ Start proctoring AFTER sessionId is set
  //     setTimeout(() => {
  //       const waitForWebcam = () => {
  //         if (
  //           webcamRef.current?.video &&
  //           webcamRef.current.video.readyState === 4
  //         ) {
  //           console.log("🎥 Starting proctoring with video");
  //           console.log("📝 Session ID:", newSessionId); // Should not be null
  //           startMonitoring(webcamRef.current.video);
  //         } else {
  //           console.log("⏳ Waiting for webcam to be ready...");
  //           setTimeout(waitForWebcam, 500);
  //         }
  //       };
  //       waitForWebcam();
  //     }, 2000);

  //     toast.success("Exam started. Good luck!");
  //   } catch (error) {
  //     toast.error("Failed to start exam");
  //     console.error(error);
  //   }
  // };

  const startExam = async () => {
    try {
      console.log("🚀 Starting exam...");

      // Start exam session
      
      const response = await sessionService.startSession(examId);
      const newSessionId = response.data.sessionId;

      console.log("✅ Session created:", newSessionId);

      setSessionId(newSessionId);

      // Request fullscreen
      const fullscreenSuccess = await enterFullscreen();
      if (!fullscreenSuccess) {
        toast.error("Fullscreen is required to take the exam");
        return;
      }

      // Start webcam
      await startWebcam();

      // Start timer
      startTimer();

      // ✅ Start proctoring with explicit sessionId
      setTimeout(() => {
        const waitForWebcam = () => {
          if (
            webcamRef.current?.video &&
            webcamRef.current.video.readyState === 4
          ) {
            console.log("🎥 Starting proctoring with video");
            console.log("📝 Passing sessionId:", newSessionId);

            // ✅ Pass sessionId explicitly
            startMonitoring(webcamRef.current.video, newSessionId);
          } else {
            console.log("⏳ Waiting for webcam to be ready...");
            setTimeout(waitForWebcam, 500);
          }
        };
        waitForWebcam();
      }, 2000);

      setShowInstructions(false);
      toast.success("Exam started. Good luck!");
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
      console.error("Exam start error:", error);

      // Navigate back if exam already completed
      if (error.response?.status === 403) {
        setTimeout(() => navigate("/student/exams"), 2000);
      }
    }
  };

  // Handle violation
  const handleViolation = (type, severity, description) => {
    setViolations((prev) => [
      ...prev,
      { type, severity, description, timestamp: new Date() },
    ]);
    logViolation(type, severity, description);
  };

  // Handle time up
  function handleTimeUp() {
    toast.error("Time is up! Submitting exam...");
    handleSubmit(true);
  }

  // Handle answer selection
  const handleAnswerSelect = (questionId, optionId) => {
    dispatch(setAnswer({ questionId, answer: optionId }));
  };

  // Navigate questions
  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Submit exam
  const handleSubmit = async (autoSubmit = false) => {
    if (!autoSubmit) {
      setShowSubmitModal(true);
      return;
    }

    try {
      setIsSubmitting(true);

      // End session
      // await sessionService.endSession(sessionId, "completed");
      // ✅ MARK EXAM AS COMPLETED FIRST - This prevents fullscreen violations
      markExamAsCompleted();
      // Stop proctoring
      stopMonitoring();
      stopWebcam();

      // Submit answers
      await resultService.submitExam(examId, sessionId, answers);

      toast.success("Exam submitted successfully!");

      // Exit fullscreen
      if (isFullscreen) {
        await exitFullscreen();
      }

      // Navigate to results
      navigate("/student/results");
    } catch (error) {
      toast.error("Failed to submit exam");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg">
        <Loader size="lg" text="Loading exam..." fullScreen />
      </div>
    );
  }

  // Instructions Screen
  if (showInstructions) {
    return (
      <InstructionsScreen
        exam={currentExam}
        onStart={startExam}
        onCancel={() => navigate("/student/exams")}
      />
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-dark-bg text-white no-select">
      {/* Header */}
      <div className="bg-dark-card border-b border-dark-border p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Title */}
          <div>
            <h1 className="text-xl font-bold">{currentExam.title}</h1>
            <p className="text-sm text-gray-400">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
          </div>

          {/* Timer */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-red-600/20 border border-red-600 rounded-lg">
              <IoTime className="w-5 h-5 text-red-500" />
              <span className="text-lg font-mono font-bold">
                {formatTimeRemaining(timeRemaining)}
              </span>
            </div>

            {/* Webcam Status */}
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                webcamActive
                  ? "bg-green-600/20 border-green-600"
                  : "bg-red-600/20 border-red-600"
              }`}
            >
              <IoCamera
                className={`w-5 h-5 ${
                  webcamActive ? "text-green-500" : "text-red-500"
                }`}
              />
              <span className="text-sm">
                {webcamActive ? "Monitoring" : "Webcam Off"}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="max-w-7xl mx-auto mt-4">
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-600 to-secondary-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Panel */}
          <div className="lg:col-span-3">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-dark-card rounded-xl p-6 border border-dark-border"
            >
              {/* Question */}
              <div className="mb-6">
                <div className="flex items-start gap-3 mb-4">
                  <span className="px-3 py-1 bg-primary-600 rounded-lg text-sm font-semibold">
                    Q{currentQuestionIndex + 1}
                  </span>
                  <span className="text-sm text-gray-400">
                    {currentQuestion.marks}{" "}
                    {currentQuestion.marks === 1 ? "Mark" : "Marks"}
                  </span>
                </div>
                <p className="text-lg leading-relaxed">
                  {currentQuestion.questionText}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => {
                  const isSelected =
                    answers[currentQuestion._id] === option._id;

                  return (
                    <button
                      key={option._id}
                      onClick={() =>
                        handleAnswerSelect(currentQuestion._id, option._id)
                      }
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                        isSelected
                          ? "border-primary-600 bg-primary-600/20"
                          : "border-gray-700 hover:border-gray-600 bg-gray-800/50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            isSelected
                              ? "border-primary-600 bg-primary-600"
                              : "border-gray-600"
                          }`}
                        >
                          {isSelected && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                        <span className="flex-1">{option.text}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-700">
                <Button
                  variant="secondary"
                  onClick={goToPreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                >
                  Previous
                </Button>

                <div className="flex gap-3">
                  {currentQuestionIndex === questions.length - 1 ? (
                    <Button
                      variant="success"
                      onClick={() => setShowSubmitModal(true)}
                    >
                      Submit Exam
                    </Button>
                  ) : (
                    <Button variant="primary" onClick={goToNextQuestion}>
                      Next Question
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Webcam Monitor */}
            <div className="bg-dark-card rounded-xl p-4 border border-dark-border">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <IoCamera className="w-4 h-4" />
                AI Proctoring
              </h3>
              <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  className="w-full h-full object-cover"
                  onUserMedia={() => setWebcamReady(true)}
                />
                {webcamActive && (
                  <div className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                )}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Your exam is being monitored for academic integrity
              </p>
            </div>

            {/* Question Navigator */}
            <div className="bg-dark-card rounded-xl p-4 border border-dark-border">
              <h3 className="text-sm font-semibold mb-3">Questions</h3>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, index) => {
                  const isAnswered = !!answers[q._id];
                  const isCurrent = index === currentQuestionIndex;

                  return (
                    <button
                      key={q._id}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`aspect-square rounded-lg text-sm font-semibold transition-all ${
                        isCurrent
                          ? "bg-primary-600 text-white"
                          : isAnswered
                          ? "bg-green-600/30 text-green-400 border border-green-600"
                          : "bg-gray-800 text-gray-400 border border-gray-700"
                      }`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-600/30 border border-green-600 rounded" />
                  <span className="text-gray-400">Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-800 border border-gray-700 rounded" />
                  <span className="text-gray-400">Not Answered</span>
                </div>
              </div>
            </div>

            {/* Violations */}
            {violations.length > 0 && (
              <div className="bg-red-900/20 border border-red-600 rounded-xl p-4">
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2 text-red-400">
                  <IoWarning className="w-4 h-4" />
                  Violations: {violations.length}
                </h3>
                <p className="text-xs text-gray-400">
                  Suspicious activities have been detected and logged
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Submit Modal */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Submit Exam"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <IoWarning className="w-6 h-6 text-yellow-600" />
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Are you sure you want to submit? You cannot change your answers
              after submission.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {Object.keys(answers).length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Answered
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {questions.length - Object.keys(answers).length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Unanswered
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            variant="secondary"
            fullWidth
            onClick={() => setShowSubmitModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="success"
            fullWidth
            onClick={() => handleSubmit(true)}
            loading={isSubmitting}
          >
            Submit Exam
          </Button>
        </div>
      </Modal>
    </div>
  );
};

// Instructions Screen Component
const InstructionsScreen = ({ exam, onStart, onCancel }) => {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">{exam.title}</h1>
          <p className="text-primary-100">
            Read instructions carefully before starting
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Exam Details */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <p className="text-2xl font-bold text-primary-600">
                {exam.duration}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Minutes
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <p className="text-2xl font-bold text-primary-600">
                {exam.totalQuestions}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Questions
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <p className="text-2xl font-bold text-primary-600">
                {exam.totalMarks}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Marks
              </p>
            </div>
          </div>

          {/* Instructions */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
              Important Instructions
            </h3>
            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <div className="flex items-start gap-2">
                <IoCheckmarkCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p>
                  The exam will be conducted in <strong>fullscreen mode</strong>
                  . Do not exit fullscreen.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <IoCheckmarkCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p>
                  Your webcam will be <strong>active throughout</strong> the
                  exam for proctoring.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <IoCheckmarkCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Tab switching</strong> is not allowed and will be
                  logged as a violation.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <IoCheckmarkCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Copy-paste</strong> and right-click are disabled
                  during the exam.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <IoCheckmarkCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p>
                  The exam will <strong>auto-submit</strong> when time is up.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <IoCheckmarkCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p>
                  Ensure you have a <strong>stable internet connection</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* AI Proctoring Warning */}
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start gap-3">
              <IoWarning className="w-6 h-6 text-red-600 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-red-900 dark:text-red-300 mb-1">
                  AI Proctoring Active
                </h4>
                <p className="text-sm text-red-800 dark:text-red-400">
                  This exam uses AI-powered proctoring. Any suspicious activity
                  (multiple faces, no face, cell phone, prohibited objects) will
                  be detected and logged.
                </p>
              </div>
            </div>
          </div>

          {/* Agreement */}
          <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <p className="text-sm text-gray-700 dark:text-gray-300">
              I have read and understood all the instructions. I agree to follow
              the exam rules and acknowledge that any violation will be
              recorded.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={onCancel}>
              Cancel
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={onStart}
              disabled={!agreed}
            >
              Start Exam
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TakeExam;
