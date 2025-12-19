import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { IoAdd, IoTrash, IoArrowBack, IoSave } from "react-icons/io5";
import Card from "@components/common/Card";
import Button from "@components/common/Button";
import Input from "@components/common/Input";
import Modal from "@components/common/Modal";
import Loader from "@components/common/Loader";
import EmptyState from "@components/common/EmptyState";
import examService from "@services/exam.service";
import toast from "react-hot-toast";

const ManageQuestions = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, [examId]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [examRes, questionsRes] = await Promise.all([
        examService.getExamById(examId),
        examService.getQuestionsByExam(examId, false),
      ]);
      setExam(examRes.data);
      setQuestions(questionsRes.data);
    } catch (error) {
      toast.error("Failed to load exam data");
      navigate("/teacher/exams");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    try {
      await examService.deleteQuestion(questionId);
      toast.success("Question deleted successfully");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete question");
    }
  };

  if (isLoading) {
    return <Loader size="lg" text="Loading questions..." fullScreen />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
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
              {exam?.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage exam questions ({questions.length} questions)
            </p>
          </div>
        </div>
        <Button
          variant="primary"
          leftIcon={<IoAdd />}
          onClick={() => setShowAddModal(true)}
        >
          Add Question
        </Button>
      </div>

      {/* Questions List */}
      {questions.length > 0 ? (
        <div className="space-y-4">
          {questions.map((question, index) => (
            <QuestionCard
              key={question._id}
              question={question}
              index={index}
              onDelete={handleDeleteQuestion}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Questions Yet"
          description="Add your first question to get started"
          actionLabel="Add Question"
          onAction={() => setShowAddModal(true)}
        />
      )}

      {/* Add Question Modal */}
      <AddQuestionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        examId={examId}
        onSuccess={fetchData}
      />
    </div>
  );
};

// Question Card Component
const QuestionCard = ({ question, index, onDelete }) => {
  return (
    <Card>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          <span className="px-3 py-1 bg-primary-600 text-white rounded-lg text-sm font-semibold">
            Q{index + 1}
          </span>
          <div className="flex-1">
            <p className="text-gray-900 dark:text-white font-medium mb-2">
              {question.questionText}
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span>Marks: {question.marks}</span>
              <span className="capitalize">
                Difficulty: {question.difficulty}
              </span>
            </div>
          </div>
        </div>
        <Button
          variant="danger"
          size="sm"
          leftIcon={<IoTrash />}
          onClick={() => onDelete(question._id)}
        >
          Delete
        </Button>
      </div>

      <div className="space-y-2">
        {question.options.map((option, idx) => (
          <div
            key={option._id}
            className={`p-3 rounded-lg border-2 ${
              option.isCorrect
                ? "border-green-600 bg-green-50 dark:bg-green-900/20"
                : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900 dark:text-white">
                {String.fromCharCode(65 + idx)}.
              </span>
              <span className="text-gray-900 dark:text-white">
                {option.text}
              </span>
              {option.isCorrect && (
                <span className="ml-auto text-xs font-semibold text-green-600">
                  ✓ Correct
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

// Add Question Modal
const AddQuestionModal = ({ isOpen, onClose, examId, onSuccess }) => {
  const [formData, setFormData] = useState({
    questionText: "",
    options: [
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ],
    marks: 1,
    difficulty: "medium",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index].text = value;
    setFormData({ ...formData, options: newOptions });
  };

  const handleCorrectChange = (index) => {
    const newOptions = formData.options.map((opt, idx) => ({
      ...opt,
      isCorrect: idx === index,
    }));
    setFormData({ ...formData, options: newOptions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.questionText.trim()) {
      toast.error("Please enter a question");
      return;
    }

    const hasCorrect = formData.options.some((opt) => opt.isCorrect);
    if (!hasCorrect) {
      toast.error("Please select a correct answer");
      return;
    }

    const allFilled = formData.options.every((opt) => opt.text.trim());
    if (!allFilled) {
      toast.error("Please fill all options");
      return;
    }

    setIsSubmitting(true);
    try {
      await examService.createQuestion({
        examId,
        ...formData,
      });
      toast.success("Question added successfully");
      onSuccess();
      onClose();
      // Reset form
      setFormData({
        questionText: "",
        options: [
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
        ],
        marks: 1,
        difficulty: "medium",
      });
    } catch (error) {
      toast.error("Failed to add question");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Question" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Question
          </label>
          <textarea
            value={formData.questionText}
            onChange={(e) =>
              setFormData({ ...formData, questionText: e.target.value })
            }
            rows={3}
            className="input"
            placeholder="Enter your question here..."
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Marks"
            type="number"
            min="1"
            value={formData.marks}
            onChange={(e) =>
              setFormData({ ...formData, marks: parseInt(e.target.value) })
            }
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Difficulty
            </label>
            <select
              value={formData.difficulty}
              onChange={(e) =>
                setFormData({ ...formData, difficulty: e.target.value })
              }
              className="input"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Options (Select the correct answer)
          </label>
          <div className="space-y-3">
            {formData.options.map((option, index) => (
              <div key={index} className="flex items-center gap-3">
                <input
                  type="radio"
                  name="correctAnswer"
                  checked={option.isCorrect}
                  onChange={() => handleCorrectChange(index)}
                  className="w-5 h-5 text-primary-600"
                />
                <Input
                  placeholder={`Option ${index + 1}`}
                  value={option.text}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  required
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="secondary" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            fullWidth
            leftIcon={<IoSave />}
            loading={isSubmitting}
          >
            Add Question
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ManageQuestions;
