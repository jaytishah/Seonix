import { useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { logViolation, addLocalViolation } from "@store/slices/proctoringSlice";
import { VIOLATION_TYPES } from "@utils/constants";
import toast from "react-hot-toast";

export const usePreventCheating = (examId, sessionId, isEnabled = true) => {
  const dispatch = useDispatch();

  const handleViolation = useCallback(
    (type, severity, description) => {
      const violationData = {
        examId,
        sessionId,
        type,
        severity,
        description,
      };

      dispatch(addLocalViolation(violationData));
      dispatch(logViolation(violationData));

      // Show warning to user
      if (type === VIOLATION_TYPES.COPY_PASTE) {
        toast.error("Copy-paste is disabled during the exam!");
      } else if (type === VIOLATION_TYPES.TAB_SWITCH) {
        toast.error("Tab switching is not allowed!");
      } else if (type === VIOLATION_TYPES.FULLSCREEN_EXIT) {
        toast.error("Please stay in fullscreen mode!");
      }
    },
    [examId, sessionId, dispatch]
  );

  // Prevent right-click
  useEffect(() => {
    if (!isEnabled) return;

    const preventContextMenu = (e) => {
      e.preventDefault();
      handleViolation(
        VIOLATION_TYPES.SUSPICIOUS_ACTIVITY,
        "low",
        "Right-click attempted"
      );
      return false;
    };

    document.addEventListener("contextmenu", preventContextMenu);

    return () => {
      document.removeEventListener("contextmenu", preventContextMenu);
    };
  }, [isEnabled, handleViolation]);

  // Prevent copy-paste
  useEffect(() => {
    if (!isEnabled) return;

    const preventCopy = (e) => {
      e.preventDefault();
      handleViolation(VIOLATION_TYPES.COPY_PASTE, "medium", "Copy attempted");
      return false;
    };

    const preventPaste = (e) => {
      e.preventDefault();
      handleViolation(VIOLATION_TYPES.COPY_PASTE, "medium", "Paste attempted");
      return false;
    };

    const preventCut = (e) => {
      e.preventDefault();
      handleViolation(VIOLATION_TYPES.COPY_PASTE, "medium", "Cut attempted");
      return false;
    };

    document.addEventListener("copy", preventCopy);
    document.addEventListener("paste", preventPaste);
    document.addEventListener("cut", preventCut);

    return () => {
      document.removeEventListener("copy", preventCopy);
      document.removeEventListener("paste", preventPaste);
      document.removeEventListener("cut", preventCut);
    };
  }, [isEnabled, handleViolation]);

  // Prevent keyboard shortcuts
  useEffect(() => {
    if (!isEnabled) return;

    const preventShortcuts = (e) => {
      // Prevent F12 (DevTools)
      if (e.key === "F12") {
        e.preventDefault();
        handleViolation(
          VIOLATION_TYPES.SUSPICIOUS_ACTIVITY,
          "high",
          "DevTools access attempted"
        );
        return false;
      }

      // Prevent Ctrl+Shift+I (DevTools)
      if (e.ctrlKey && e.shiftKey && e.key === "I") {
        e.preventDefault();
        handleViolation(
          VIOLATION_TYPES.SUSPICIOUS_ACTIVITY,
          "high",
          "DevTools access attempted"
        );
        return false;
      }

      // Prevent Ctrl+Shift+C (Inspect element)
      if (e.ctrlKey && e.shiftKey && e.key === "C") {
        e.preventDefault();
        handleViolation(
          VIOLATION_TYPES.SUSPICIOUS_ACTIVITY,
          "high",
          "Inspect element attempted"
        );
        return false;
      }

      // Prevent Ctrl+U (View source)
      if (e.ctrlKey && e.key === "u") {
        e.preventDefault();
        handleViolation(
          VIOLATION_TYPES.SUSPICIOUS_ACTIVITY,
          "medium",
          "View source attempted"
        );
        return false;
      }

      // Prevent Ctrl+S (Save page)
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        handleViolation(
          VIOLATION_TYPES.SUSPICIOUS_ACTIVITY,
          "medium",
          "Save page attempted"
        );
        return false;
      }

      // Prevent PrintScreen
      if (e.key === "PrintScreen") {
        e.preventDefault();
        handleViolation(
          VIOLATION_TYPES.SUSPICIOUS_ACTIVITY,
          "high",
          "Screenshot attempted"
        );
        return false;
      }
    };

    document.addEventListener("keydown", preventShortcuts);

    return () => {
      document.removeEventListener("keydown", preventShortcuts);
    };
  }, [isEnabled, handleViolation]);

  // Add exam-mode class to body
  useEffect(() => {
    if (isEnabled) {
      document.body.classList.add("exam-mode");
    }

    return () => {
      document.body.classList.remove("exam-mode");
    };
  }, [isEnabled]);

  return {
    handleViolation,
  };
};
