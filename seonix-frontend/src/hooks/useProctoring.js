import { useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  logViolation,
  addLocalViolation,
  setWebcamActive,
} from "@store/slices/proctoringSlice";
import { VIOLATION_TYPES, PROCTORING_CONFIG } from "@utils/constants";
import { toast } from "react-toastify"; // ✅ ADD THIS IMPORT

// Dynamic imports for TensorFlow
let cocoSsd = null;
let tf = null;

const loadTensorFlow = async () => {
  if (!tf) {
    tf = await import("@tensorflow/tfjs");
    await tf.ready();
    console.log("✅ TensorFlow.js loaded");
  }
  if (!cocoSsd) {
    const cocoModule = await import("@tensorflow-models/coco-ssd");
    cocoSsd = cocoModule;
    console.log("✅ COCO-SSD module loaded");
  }
};

export const useProctoring = (examId, sessionId, isEnabled = true) => {
  const dispatch = useDispatch();
  const { isMonitoring } = useSelector((state) => state.proctoring);
  const modelRef = useRef(null);
  const detectionIntervalRef = useRef(null);
  const lastDetectionRef = useRef({});
  const monitoringStartedRef = useRef(false);
  const lastToastRef = useRef({}); // ✅ ADD THIS: Track last toast time

  // ✅ FIX: Store current values in refs
  const examIdRef = useRef(examId);
  const sessionIdRef = useRef(sessionId);

  // Update refs when props change
  useEffect(() => {
    examIdRef.current = examId;
    sessionIdRef.current = sessionId;
    console.log("📝 Updated proctoring context:", { examId, sessionId });
  }, [examId, sessionId]);

  // ✅ ADD THIS: Show toast with cooldown to prevent spam
  const showToastWithCooldown = useCallback((type, message) => {
    const now = Date.now();
    const TOAST_COOLDOWN = 3000; // 3 seconds

    if (
      !lastToastRef.current[type] ||
      now - lastToastRef.current[type] > TOAST_COOLDOWN
    ) {
      toast.warning(message, {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
      });
      lastToastRef.current[type] = now;
    }
  }, []);

  // ✅ FIX: Use refs for current values
  const handleViolation = useCallback(
    (type, severity, description) => {
      const currentExamId = examIdRef.current;
      const currentSessionId = sessionIdRef.current;

      console.log("🔍 Checking violation:", {
        examId: currentExamId,
        sessionId: currentSessionId,
        type,
      });

      if (!currentExamId || !currentSessionId) {
        console.log("⏭️ Skipping violation - no examId/sessionId");
        return;
      }

      // Throttle violations
      const now = Date.now();
      if (
        lastDetectionRef.current[type] &&
        now - lastDetectionRef.current[type] < 3000
      ) {
        return;
      }
      lastDetectionRef.current[type] = now;

      console.log("⚠️ Violation detected:", { type, severity, description });

      // ✅ ADD THIS: Show toast notification based on violation type
      switch (type) {
        case VIOLATION_TYPES.NO_FACE:
          showToastWithCooldown(type, "⚠️ No Face Detected");
          break;
        case VIOLATION_TYPES.MULTIPLE_FACES:
          showToastWithCooldown(type, "⚠️ Multiple Faces Detected");
          break;
        case VIOLATION_TYPES.CELL_PHONE:
          showToastWithCooldown(type, "⚠️ Cell Phone Detected");
          break;
        case VIOLATION_TYPES.PROHIBITED_OBJECT:
          showToastWithCooldown(type, "⚠️ Prohibited Object Detected");
          break;
        default:
          break;
      }

      const violationData = {
        examId: currentExamId,
        sessionId: currentSessionId,
        type,
        severity,
        description,
        timestamp: new Date().toISOString(),
      };

      dispatch(addLocalViolation(violationData));
      dispatch(logViolation(violationData));
    },
    [dispatch, showToastWithCooldown] // ✅ ADD showToastWithCooldown to dependencies
  );

  // Load TensorFlow model
  const loadModel = useCallback(async () => {
    try {
      if (modelRef.current) {
        console.log("✅ Model already loaded");
        return modelRef.current;
      }

      console.log("🔄 Loading AI model...");
      await loadTensorFlow();
      modelRef.current = await cocoSsd.load();
      console.log("✅ AI Model loaded successfully");

      return modelRef.current;
    } catch (error) {
      console.error("❌ Error loading AI model:", error);
      return null;
    }
  }, []);

  // Detect objects in video frame
  const detectObjects = useCallback(
    async (videoElement) => {
      if (!modelRef.current || !videoElement) {
        return;
      }

      if (videoElement.readyState !== 4) {
        return;
      }

      try {
        const predictions = await modelRef.current.detect(videoElement);
        console.log("🔍 Detected objects:", predictions.length);

        let faceCount = 0;
        let hasPhone = false;
        let hasBook = false;

        predictions.forEach((prediction) => {
          const { class: className, score } = prediction;
          console.log(`   - ${className}: ${Math.round(score * 100)}%`);

          if (className === "person" && score > 0.5) {
            faceCount++;
          }

          if (className === "cell phone" && score > 0.4) {
            hasPhone = true;
          }

          if (className === "book" && score > 0.4) {
            hasBook = true;
          }

          if (className === "laptop" && score > 0.4) {
            handleViolation(
              VIOLATION_TYPES.PROHIBITED_OBJECT,
              "high",
              "Laptop detected in frame"
            );
          }
        });

        // Log violations
        if (faceCount === 0) {
          handleViolation(
            VIOLATION_TYPES.NO_FACE,
            "medium",
            "No face detected in frame"
          );
        } else if (faceCount > 1) {
          handleViolation(
            VIOLATION_TYPES.MULTIPLE_FACES,
            "high",
            `${faceCount} faces detected in frame`
          );
        }

        if (hasPhone) {
          handleViolation(
            VIOLATION_TYPES.CELL_PHONE,
            "critical",
            "Cell phone detected in frame"
          );
        }

        if (hasBook) {
          handleViolation(
            VIOLATION_TYPES.PROHIBITED_OBJECT,
            "medium",
            "Book detected in frame"
          );
        }
      } catch (error) {
        console.error("❌ Error during object detection:", error);
      }
    },
    [handleViolation]
  );

  // Start monitoring - ACCEPT sessionId as parameter
  const startMonitoring = useCallback(
    async (videoElement, overrideSessionId = null) => {
      if (monitoringStartedRef.current) {
        console.log("⏭️ Monitoring already started");
        return;
      }

      if (!isEnabled || !videoElement) {
        console.log("⏭️ Skipping monitoring start");
        return;
      }

      // ✅ Use override sessionId if provided
      if (overrideSessionId) {
        console.log("🔧 Using override sessionId:", overrideSessionId);
        sessionIdRef.current = overrideSessionId;
        examIdRef.current = examId; // Also update examId ref
      }

      console.log("🎬 Starting AI proctoring...");
      console.log("📝 Context:", {
        examId: examIdRef.current,
        sessionId: sessionIdRef.current,
      });

      monitoringStartedRef.current = true;

      const model = await loadModel();
      if (!model) {
        console.error("❌ Failed to load model");
        monitoringStartedRef.current = false;
        return;
      }

      if (videoElement.readyState !== 4) {
        await new Promise((resolve) => {
          const checkReady = () => {
            if (videoElement.readyState === 4) {
              console.log("✅ Video ready");
              resolve();
            } else {
              setTimeout(checkReady, 100);
            }
          };
          checkReady();
        });
      }

      console.log("✅ Starting detection loop");

      detectionIntervalRef.current = setInterval(() => {
        console.log("🔄 Running detection cycle...");
        detectObjects(videoElement);
      }, PROCTORING_CONFIG.DETECTION_INTERVAL || 5000);

      dispatch(setWebcamActive(true));
      console.log("✅ AI Proctoring started");
    },
    [isEnabled, examId, loadModel, detectObjects, dispatch]
  );

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    if (!monitoringStartedRef.current) {
      return;
    }

    console.log("⏹️ Stopping AI proctoring...");

    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }

    monitoringStartedRef.current = false;
    dispatch(setWebcamActive(false));
    console.log("✅ AI Proctoring stopped");
  }, [dispatch]);

  useEffect(() => {
    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }
      monitoringStartedRef.current = false;
    };
  }, []);

  return {
    startMonitoring,
    stopMonitoring,
    handleViolation,
    isMonitoring,
  };
};

// import { useEffect, useCallback, useRef } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   logViolation,
//   addLocalViolation,
//   setWebcamActive,
// } from "@store/slices/proctoringSlice";
// import { VIOLATION_TYPES, PROCTORING_CONFIG } from "@utils/constants";

// // Dynamic imports for TensorFlow
// let cocoSsd = null;
// let tf = null;

// const loadTensorFlow = async () => {
//   if (!tf) {
//     tf = await import("@tensorflow/tfjs");
//     await tf.ready();
//     console.log("✅ TensorFlow.js loaded");
//   }
//   if (!cocoSsd) {
//     const cocoModule = await import("@tensorflow-models/coco-ssd");
//     cocoSsd = cocoModule;
//     console.log("✅ COCO-SSD module loaded");
//   }
// };

// export const useProctoring = (examId, sessionId, isEnabled = true) => {
//   const dispatch = useDispatch();
//   const { isMonitoring } = useSelector((state) => state.proctoring);
//   const modelRef = useRef(null);
//   const detectionIntervalRef = useRef(null);
//   const lastDetectionRef = useRef({});
//   const monitoringStartedRef = useRef(false);

//   // ✅ FIX: Store current values in refs
//   const examIdRef = useRef(examId);
//   const sessionIdRef = useRef(sessionId);

//   // Update refs when props change
//   useEffect(() => {
//     examIdRef.current = examId;
//     sessionIdRef.current = sessionId;
//     console.log("📝 Updated proctoring context:", { examId, sessionId });
//   }, [examId, sessionId]);

//   // ✅ FIX: Use refs for current values
//   const handleViolation = useCallback(
//     (type, severity, description) => {
//       const currentExamId = examIdRef.current;
//       const currentSessionId = sessionIdRef.current;

//       console.log("🔍 Checking violation:", {
//         examId: currentExamId,
//         sessionId: currentSessionId,
//         type,
//       });

//       if (!currentExamId || !currentSessionId) {
//         console.log("⏭️ Skipping violation - no examId/sessionId");
//         return;
//       }

//       // Throttle violations
//       const now = Date.now();
//       if (
//         lastDetectionRef.current[type] &&
//         now - lastDetectionRef.current[type] < 3000
//       ) {
//         return;
//       }
//       lastDetectionRef.current[type] = now;

//       console.log("⚠️ Violation detected:", { type, severity, description });

//       const violationData = {
//         examId: currentExamId,
//         sessionId: currentSessionId,
//         type,
//         severity,
//         description,
//         timestamp: new Date().toISOString(),
//       };

//       dispatch(addLocalViolation(violationData));
//       dispatch(logViolation(violationData));
//     },
//     [dispatch]
//   );

//   // Load TensorFlow model
//   const loadModel = useCallback(async () => {
//     try {
//       if (modelRef.current) {
//         console.log("✅ Model already loaded");
//         return modelRef.current;
//       }

//       console.log("🔄 Loading AI model...");
//       await loadTensorFlow();
//       modelRef.current = await cocoSsd.load();
//       console.log("✅ AI Model loaded successfully");

//       return modelRef.current;
//     } catch (error) {
//       console.error("❌ Error loading AI model:", error);
//       return null;
//     }
//   }, []);

//   // Detect objects in video frame
//   const detectObjects = useCallback(
//     async (videoElement) => {
//       if (!modelRef.current || !videoElement) {
//         return;
//       }

//       if (videoElement.readyState !== 4) {
//         return;
//       }

//       try {
//         const predictions = await modelRef.current.detect(videoElement);
//         console.log("🔍 Detected objects:", predictions.length);

//         let faceCount = 0;
//         let hasPhone = false;
//         let hasBook = false;

//         predictions.forEach((prediction) => {
//           const { class: className, score } = prediction;
//           console.log(`   - ${className}: ${Math.round(score * 100)}%`);

//           if (className === "person" && score > 0.5) {
//             faceCount++;
//           }

//           if (className === "cell phone" && score > 0.4) {
//             hasPhone = true;
//           }

//           if (className === "book" && score > 0.4) {
//             hasBook = true;
//           }

//           if (className === "laptop" && score > 0.4) {
//             handleViolation(
//               VIOLATION_TYPES.PROHIBITED_OBJECT,
//               "high",
//               "Laptop detected in frame"
//             );
//           }
//         });

//         // Log violations
//         if (faceCount === 0) {
//           handleViolation(
//             VIOLATION_TYPES.NO_FACE,
//             "medium",
//             "No face detected in frame"
//           );
//         } else if (faceCount > 1) {
//           handleViolation(
//             VIOLATION_TYPES.MULTIPLE_FACES,
//             "high",
//             `${faceCount} faces detected in frame`
//           );
//         }

//         if (hasPhone) {
//           handleViolation(
//             VIOLATION_TYPES.CELL_PHONE,
//             "critical",
//             "Cell phone detected in frame"
//           );
//         }

//         if (hasBook) {
//           handleViolation(
//             VIOLATION_TYPES.PROHIBITED_OBJECT,
//             "medium",
//             "Book detected in frame"
//           );
//         }
//       } catch (error) {
//         console.error("❌ Error during object detection:", error);
//       }
//     },
//     [handleViolation]
//   );

//   // Start monitoring - ACCEPT sessionId as parameter
//   const startMonitoring = useCallback(
//     async (videoElement, overrideSessionId = null) => {
//       if (monitoringStartedRef.current) {
//         console.log("⏭️ Monitoring already started");
//         return;
//       }

//       if (!isEnabled || !videoElement) {
//         console.log("⏭️ Skipping monitoring start");
//         return;
//       }

//       // ✅ Use override sessionId if provided
//       if (overrideSessionId) {
//         console.log("🔧 Using override sessionId:", overrideSessionId);
//         sessionIdRef.current = overrideSessionId;
//         examIdRef.current = examId; // Also update examId ref
//       }

//       console.log("🎬 Starting AI proctoring...");
//       console.log("📝 Context:", {
//         examId: examIdRef.current,
//         sessionId: sessionIdRef.current,
//       });

//       monitoringStartedRef.current = true;

//       const model = await loadModel();
//       if (!model) {
//         console.error("❌ Failed to load model");
//         monitoringStartedRef.current = false;
//         return;
//       }

//       if (videoElement.readyState !== 4) {
//         await new Promise((resolve) => {
//           const checkReady = () => {
//             if (videoElement.readyState === 4) {
//               console.log("✅ Video ready");
//               resolve();
//             } else {
//               setTimeout(checkReady, 100);
//             }
//           };
//           checkReady();
//         });
//       }

//       console.log("✅ Starting detection loop");

//       detectionIntervalRef.current = setInterval(() => {
//         console.log("🔄 Running detection cycle...");
//         detectObjects(videoElement);
//       }, PROCTORING_CONFIG.DETECTION_INTERVAL || 5000);

//       dispatch(setWebcamActive(true));
//       console.log("✅ AI Proctoring started");
//     },
//     [isEnabled, examId, loadModel, detectObjects, dispatch]
//   );

//   // Stop monitoring
//   const stopMonitoring = useCallback(() => {
//     if (!monitoringStartedRef.current) {
//       return;
//     }

//     console.log("⏹️ Stopping AI proctoring...");

//     if (detectionIntervalRef.current) {
//       clearInterval(detectionIntervalRef.current);
//       detectionIntervalRef.current = null;
//     }

//     monitoringStartedRef.current = false;
//     dispatch(setWebcamActive(false));
//     console.log("✅ AI Proctoring stopped");
//   }, [dispatch]);

//   useEffect(() => {
//     return () => {
//       if (detectionIntervalRef.current) {
//         clearInterval(detectionIntervalRef.current);
//         detectionIntervalRef.current = null;
//       }
//       monitoringStartedRef.current = false;
//     };
//   }, []);

//   return {
//     startMonitoring,
//     stopMonitoring,
//     handleViolation,
//     isMonitoring,
//   };
// };

// ##########################################################################################

// import { useEffect, useCallback, useRef } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import * as cocoSsd from "@tensorflow-models/coco-ssd";
// import "@tensorflow/tfjs";
// import {
//   logViolation,
//   addLocalViolation,
//   setWebcamActive,
// } from "@store/slices/proctoringSlice";
// import { VIOLATION_TYPES, PROCTORING_CONFIG } from "@utils/constants";

// export const useProctoring = (examId, sessionId, isEnabled = true) => {
//   const dispatch = useDispatch();
//   const { isMonitoring } = useSelector((state) => state.proctoring);
//   const modelRef = useRef(null);
//   const detectionIntervalRef = useRef(null);

//   // Handle violation logging - now stable
//   const handleViolation = useCallback(
//     (type, severity, description) => {
//       if (!examId || !sessionId) return;

//       const violationData = {
//         examId,
//         sessionId,
//         type,
//         severity,
//         description,
//         timestamp: new Date().toISOString(),
//       };

//       // Add to local state
//       dispatch(addLocalViolation(violationData));

//       // Send to server
//       dispatch(logViolation(violationData));
//     },
//     [examId, sessionId, dispatch]
//   );

//   // Load TensorFlow model
//   const loadModel = useCallback(async () => {
//     try {
//       if (!modelRef.current) {
//         modelRef.current = await cocoSsd.load();
//         console.log("✅ AI Model loaded successfully");
//       }
//       return modelRef.current;
//     } catch (error) {
//       console.error("❌ Error loading AI model:", error);
//       return null;
//     }
//   }, []);

//   // Detect objects in video frame
//   const detectObjects = useCallback(
//     async (videoElement) => {
//       if (!modelRef.current || !videoElement || !isMonitoring) return;

//       try {
//         const predictions = await modelRef.current.detect(videoElement);

//         // Check for violations
//         let faceCount = 0;
//         let hasPhone = false;
//         let hasProhibitedObject = false;

//         predictions.forEach((prediction) => {
//           const { class: className, score } = prediction;

//           // Face detection (person detection as proxy)
//           if (className === "person" && score > 0.6) {
//             faceCount++;
//           }

//           // Cell phone detection
//           if (className === "cell phone" && score > 0.5) {
//             hasPhone = true;
//           }

//           // Prohibited objects
//           const prohibitedObjects = ["book", "laptop", "tablet"];
//           if (prohibitedObjects.includes(className) && score > 0.5) {
//             hasProhibitedObject = true;
//           }
//         });

//         // Log violations
//         if (faceCount === 0) {
//           handleViolation(
//             VIOLATION_TYPES.NO_FACE,
//             "medium",
//             "No face detected in frame"
//           );
//         } else if (faceCount > 1) {
//           handleViolation(
//             VIOLATION_TYPES.MULTIPLE_FACES,
//             "high",
//             `${faceCount} faces detected`
//           );
//         }

//         if (hasPhone) {
//           handleViolation(
//             VIOLATION_TYPES.CELL_PHONE,
//             "critical",
//             "Cell phone detected"
//           );
//         }

//         if (hasProhibitedObject) {
//           handleViolation(
//             VIOLATION_TYPES.PROHIBITED_OBJECT,
//             "high",
//             "Prohibited object detected"
//           );
//         }
//       } catch (error) {
//         console.error("Error during object detection:", error);
//       }
//     },
//     [isMonitoring, handleViolation]
//   );

//   // Start monitoring
//   const startMonitoring = useCallback(
//     async (videoElement) => {
//       if (!isEnabled || isMonitoring || !videoElement) return;

//       // Load AI model
//       await loadModel();

//       // Start periodic detection
//       detectionIntervalRef.current = setInterval(() => {
//         detectObjects(videoElement);
//       }, PROCTORING_CONFIG.DETECTION_INTERVAL);

//       dispatch(setWebcamActive(true));
//     },
//     [isEnabled, isMonitoring, loadModel, detectObjects, dispatch]
//   );

//   // Stop monitoring
//   const stopMonitoring = useCallback(() => {
//     if (detectionIntervalRef.current) {
//       clearInterval(detectionIntervalRef.current);
//       detectionIntervalRef.current = null;
//     }
//     dispatch(setWebcamActive(false));
//   }, [dispatch]);

//   // Cleanup on unmount
//   useEffect(() => {
//     return () => {
//       stopMonitoring();
//     };
//   }, [stopMonitoring]);

//   return {
//     startMonitoring,
//     stopMonitoring,
//     handleViolation,
//     isMonitoring,
//   };
// };

// import { useEffect, useCallback, useRef } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import * as cocoSsd from "@tensorflow-models/coco-ssd";
// import "@tensorflow/tfjs";
// import {
//   logViolation,
//   addLocalViolation,
//   setWebcamActive,
// } from "@store/slices/proctoringSlice";
// import { VIOLATION_TYPES, PROCTORING_CONFIG } from "@utils/constants";

// export const useProctoring = (examId, sessionId, isEnabled = true) => {
//   const dispatch = useDispatch();
//   const { isMonitoring } = useSelector((state) => state.proctoring);
//   const modelRef = useRef(null);
//   const detectionIntervalRef = useRef(null);

//   // Load TensorFlow model
//   const loadModel = useCallback(async () => {
//     try {
//       if (!modelRef.current) {
//         modelRef.current = await cocoSsd.load();
//         console.log("✅ AI Model loaded successfully");
//       }
//       return modelRef.current;
//     } catch (error) {
//       console.error("❌ Error loading AI model:", error);
//       return null;
//     }
//   }, []);

//   // Detect objects in video frame
//   const detectObjects = useCallback(
//     async (videoElement) => {
//       if (!modelRef.current || !videoElement || !isMonitoring) return;

//       try {
//         const predictions = await modelRef.current.detect(videoElement);

//         // Check for violations
//         let faceCount = 0;
//         let hasPhone = false;
//         let hasProhibitedObject = false;

//         predictions.forEach((prediction) => {
//           const { class: className, score } = prediction;

//           // Face detection (person detection as proxy)
//           if (className === "person" && score > 0.6) {
//             faceCount++;
//           }

//           // Cell phone detection
//           if (className === "cell phone" && score > 0.5) {
//             hasPhone = true;
//           }

//           // Prohibited objects
//           const prohibitedObjects = ["book", "laptop", "tablet"];
//           if (prohibitedObjects.includes(className) && score > 0.5) {
//             hasProhibitedObject = true;
//           }
//         });

//         // Log violations
//         if (faceCount === 0) {
//           handleViolation(
//             VIOLATION_TYPES.NO_FACE,
//             "medium",
//             "No face detected in frame"
//           );
//         } else if (faceCount > 1) {
//           handleViolation(
//             VIOLATION_TYPES.MULTIPLE_FACES,
//             "high",
//             `${faceCount} faces detected`
//           );
//         }

//         if (hasPhone) {
//           handleViolation(
//             VIOLATION_TYPES.CELL_PHONE,
//             "critical",
//             "Cell phone detected"
//           );
//         }

//         if (hasProhibitedObject) {
//           handleViolation(
//             VIOLATION_TYPES.PROHIBITED_OBJECT,
//             "high",
//             "Prohibited object detected"
//           );
//         }
//       } catch (error) {
//         console.error("Error during object detection:", error);
//       }
//     },
//     [isMonitoring]
//   );

//   // Handle violation logging
//   const handleViolation = useCallback(
//     (type, severity, description) => {
//       const violationData = {
//         examId,
//         sessionId,
//         type,
//         severity,
//         description,
//         timestamp: new Date().toISOString(),
//       };

//       // Add to local state
//       dispatch(addLocalViolation(violationData));

//       // Send to server
//       dispatch(logViolation(violationData));
//     },
//     [examId, sessionId, dispatch]
//   );

//   // Start monitoring
//   const startMonitoring = useCallback(
//     async (videoElement) => {
//       if (!isEnabled || isMonitoring) return;

//       // Load AI model
//       await loadModel();

//       // Start periodic detection
//       detectionIntervalRef.current = setInterval(() => {
//         detectObjects(videoElement);
//       }, PROCTORING_CONFIG.DETECTION_INTERVAL);

//       dispatch(setWebcamActive(true));
//     },
//     [isEnabled, isMonitoring, loadModel, detectObjects, dispatch]
//   );

//   // Stop monitoring
//   const stopMonitoring = useCallback(() => {
//     if (detectionIntervalRef.current) {
//       clearInterval(detectionIntervalRef.current);
//       detectionIntervalRef.current = null;
//     }
//     dispatch(setWebcamActive(false));
//   }, [dispatch]);

//   // Cleanup on unmount
//   useEffect(() => {
//     return () => {
//       stopMonitoring();
//     };
//   }, [stopMonitoring]);

//   return {
//     startMonitoring,
//     stopMonitoring,
//     handleViolation,
//     isMonitoring,
//   };
// };
