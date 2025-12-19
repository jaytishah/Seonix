import { useState, useEffect, useCallback, useRef } from "react";

export const useFullscreen = (onFullscreenChange, isExamActive = false) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isExamActiveRef = useRef(isExamActive);
  const isReenteringRef = useRef(false);
  const lastFullscreenStateRef = useRef(false);
  const isExamCompletedRef = useRef(false); // ✅ ADD THIS

  // Update ref when exam status changes
  useEffect(() => {
    isExamActiveRef.current = isExamActive;
  }, [isExamActive]);

  // ✅ ADD THIS: Function to mark exam as completed
  const markExamAsCompleted = useCallback(() => {
    isExamCompletedRef.current = true;
    console.log("🏁 Exam marked as completed - fullscreen violations disabled");
  }, []);

  // Check fullscreen status
  const checkFullscreen = useCallback(() => {
    const fullscreenElement =
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement;

    const fullscreenStatus = !!fullscreenElement;
    setIsFullscreen(fullscreenStatus);

    // ✅ UPDATE THIS: Only call callback if exam is NOT completed
    if (
      onFullscreenChange &&
      lastFullscreenStateRef.current !== fullscreenStatus &&
      !isReenteringRef.current &&
      !isExamCompletedRef.current // ✅ ADD THIS CHECK
    ) {
      lastFullscreenStateRef.current = fullscreenStatus;
      onFullscreenChange(fullscreenStatus);
    }

    return fullscreenStatus;
  }, [onFullscreenChange]);

  // Enter fullscreen
  const enterFullscreen = useCallback(async () => {
    try {
      const element = document.documentElement;

      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        await element.webkitRequestFullscreen();
      } else if (element.mozRequestFullScreen) {
        await element.mozRequestFullScreen();
      } else if (element.msRequestFullscreen) {
        await element.msRequestFullscreen();
      }

      return true;
    } catch (error) {
      console.error("Error entering fullscreen:", error);
      return false;
    }
  }, []);

  // Exit fullscreen
  const exitFullscreen = useCallback(async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        await document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        await document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        await document.msExitFullscreen();
      }

      return true;
    } catch (error) {
      console.error("Error exiting fullscreen:", error);
      return false;
    }
  }, []);

  // Auto re-enter fullscreen on click - ONLY during exam
  const handleClick = useCallback(
    async (e) => {
      // ✅ UPDATE THIS: Don't re-enter if exam is completed
      if (!isExamActiveRef.current || isExamCompletedRef.current) {
        return;
      }

      const currentFullscreenStatus = checkFullscreen();

      if (!currentFullscreenStatus && !isReenteringRef.current) {
        console.log("🔄 Re-entering fullscreen on click...");

        isReenteringRef.current = true;

        await enterFullscreen();

        setTimeout(() => {
          isReenteringRef.current = false;
        }, 500);
      }
    },
    [checkFullscreen, enterFullscreen]
  );

  useEffect(() => {
    // Listen for fullscreen changes
    const handleFullscreenChange = () => {
      checkFullscreen();
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    document.addEventListener("click", handleClick, true);

    checkFullscreen();

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "MSFullscreenChange",
        handleFullscreenChange
      );
      document.removeEventListener("click", handleClick, true);
    };
  }, [checkFullscreen, handleClick]);

  return {
    isFullscreen,
    enterFullscreen,
    exitFullscreen,
    markExamAsCompleted, // ✅ EXPORT THIS
  };
};

// import { useState, useEffect, useCallback } from "react";

// export const useFullscreen = (onFullscreenChange) => {
//   const [isFullscreen, setIsFullscreen] = useState(false);

//   const enterFullscreen = useCallback(async () => {
//     try {
//       const element = document.documentElement;

//       if (element.requestFullscreen) {
//         await element.requestFullscreen();
//       } else if (element.mozRequestFullScreen) {
//         await element.mozRequestFullScreen();
//       } else if (element.webkitRequestFullscreen) {
//         await element.webkitRequestFullscreen();
//       } else if (element.msRequestFullscreen) {
//         await element.msRequestFullscreen();
//       }

//       return true;
//     } catch (error) {
//       console.error("Error entering fullscreen:", error);
//       return false;
//     }
//   }, []);

//   const exitFullscreen = useCallback(async () => {
//     try {
//       if (document.exitFullscreen) {
//         await document.exitFullscreen();
//       } else if (document.mozCancelFullScreen) {
//         await document.mozCancelFullScreen();
//       } else if (document.webkitExitFullscreen) {
//         await document.webkitExitFullscreen();
//       } else if (document.msExitFullscreen) {
//         await document.msExitFullscreen();
//       }

//       return true;
//     } catch (error) {
//       console.error("Error exiting fullscreen:", error);
//       return false;
//     }
//   }, []);

//   const toggleFullscreen = useCallback(async () => {
//     if (isFullscreen) {
//       await exitFullscreen();
//     } else {
//       await enterFullscreen();
//     }
//   }, [isFullscreen, enterFullscreen, exitFullscreen]);

//   useEffect(() => {
//     const handleFullscreenChange = () => {
//       const fullscreenElement =
//         document.fullscreenElement ||
//         document.mozFullScreenElement ||
//         document.webkitFullscreenElement ||
//         document.msFullscreenElement;

//       const newFullscreenState = !!fullscreenElement;
//       setIsFullscreen(newFullscreenState);

//       if (onFullscreenChange) {
//         onFullscreenChange(newFullscreenState);
//       }
//     };

//     document.addEventListener("fullscreenchange", handleFullscreenChange);
//     document.addEventListener("mozfullscreenchange", handleFullscreenChange);
//     document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
//     document.addEventListener("msfullscreenchange", handleFullscreenChange);

//     return () => {
//       document.removeEventListener("fullscreenchange", handleFullscreenChange);
//       document.removeEventListener(
//         "mozfullscreenchange",
//         handleFullscreenChange
//       );
//       document.removeEventListener(
//         "webkitfullscreenchange",
//         handleFullscreenChange
//       );
//       document.removeEventListener(
//         "msfullscreenchange",
//         handleFullscreenChange
//       );
//     };
//   }, [onFullscreenChange]);

//   return {
//     isFullscreen,
//     enterFullscreen,
//     exitFullscreen,
//     toggleFullscreen,
//   };
// };
