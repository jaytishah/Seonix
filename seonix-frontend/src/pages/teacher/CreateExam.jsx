import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { IoSave, IoArrowBack } from "react-icons/io5";
import { createExam } from "@store/slices/examSlice";
import Card from "@components/common/Card";
import Button from "@components/common/Button";
import Input from "@components/common/Input";
import toast from "react-hot-toast";

const CreateExam = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: 60,
    startDate: "",
    endDate: "",
    passingMarks: 40,
    proctoringSettings: {
      enableFullscreen: true,
      enableTabSwitch: true,
      enableWebcam: true,
      maxTabSwitches: 3,
      strictMode: false,
    },
    configuration: {
      shuffleQuestions: true,
      shuffleOptions: true,
      showResultImmediately: false,
      allowReview: false,
    },
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === "checkbox" ? checked : value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title || formData.title.trim().length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    }

    if (!formData.duration || formData.duration < 5) {
      newErrors.duration = "Duration must be at least 5 minutes";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }

    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
    }

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.endDate) <= new Date(formData.startDate)) {
        newErrors.endDate = "End date must be after start date";
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await dispatch(createExam(formData)).unwrap();
      toast.success("Exam created successfully!");
      navigate(`/teacher/exam/${result.examId}/questions`);
    } catch (error) {
      toast.error(error || "Failed to create exam");
    } finally {
      setIsSubmitting(false);
    }
  };

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
            Create New Exam
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Set up a new examination with custom settings
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Basic Information
          </h2>
          <div className="space-y-4">
            <Input
              label="Exam Title"
              name="title"
              placeholder="Enter exam title"
              value={formData.title}
              onChange={handleChange}
              error={errors.title}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                placeholder="Enter exam description (optional)"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="input"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Duration (minutes)"
                name="duration"
                type="number"
                min="5"
                placeholder="60"
                value={formData.duration}
                onChange={handleChange}
                error={errors.duration}
                required
              />

              <Input
                label="Passing Marks (%)"
                name="passingMarks"
                type="number"
                min="0"
                max="100"
                placeholder="40"
                value={formData.passingMarks}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Start Date & Time"
                name="startDate"
                type="datetime-local"
                value={formData.startDate}
                onChange={handleChange}
                error={errors.startDate}
                required
              />

              <Input
                label="End Date & Time"
                name="endDate"
                type="datetime-local"
                value={formData.endDate}
                onChange={handleChange}
                error={errors.endDate}
                required
              />
            </div>
          </div>
        </Card>

        {/* Proctoring Settings */}
        <Card>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            AI Proctoring Settings
          </h2>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="proctoringSettings.enableWebcam"
                checked={formData.proctoringSettings.enableWebcam}
                onChange={handleChange}
                className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Enable Webcam Monitoring
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Monitor students via webcam during the exam
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="proctoringSettings.enableFullscreen"
                checked={formData.proctoringSettings.enableFullscreen}
                onChange={handleChange}
                className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Enforce Fullscreen Mode
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Students must stay in fullscreen during exam
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="proctoringSettings.enableTabSwitch"
                checked={formData.proctoringSettings.enableTabSwitch}
                onChange={handleChange}
                className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Detect Tab Switching
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Log when students switch tabs or windows
                </p>
              </div>
            </label>

            {formData.proctoringSettings.enableTabSwitch && (
              <Input
                label="Maximum Tab Switches"
                name="proctoringSettings.maxTabSwitches"
                type="number"
                min="1"
                value={formData.proctoringSettings.maxTabSwitches}
                onChange={handleChange}
                helperText="Auto-submit exam after exceeding this limit"
              />
            )}

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="proctoringSettings.strictMode"
                checked={formData.proctoringSettings.strictMode}
                onChange={handleChange}
                className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Strict Mode
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Auto-terminate exam on critical violations
                </p>
              </div>
            </label>
          </div>
        </Card>

        {/* Exam Configuration */}
        <Card>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Exam Configuration
          </h2>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="configuration.shuffleQuestions"
                checked={formData.configuration.shuffleQuestions}
                onChange={handleChange}
                className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Shuffle Questions
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Randomize question order for each student
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="configuration.shuffleOptions"
                checked={formData.configuration.shuffleOptions}
                onChange={handleChange}
                className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Shuffle Options
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Randomize answer options order
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="configuration.showResultImmediately"
                checked={formData.configuration.showResultImmediately}
                onChange={handleChange}
                className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Show Result Immediately
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Display results right after submission
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="configuration.allowReview"
                checked={formData.configuration.allowReview}
                onChange={handleChange}
                className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Allow Review
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Let students review answers before submitting
                </p>
              </div>
            </label>
          </div>
        </Card>

        {/* Actions */}
        <Card>
          <div className="flex gap-4">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => navigate("/teacher/exams")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              leftIcon={<IoSave />}
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              Create Exam & Add Questions
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default CreateExam;
