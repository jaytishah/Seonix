import { useState, useEffect, useRef, useCallback } from "react";

export const useTimer = (initialTime, onTimeUp) => {
  const [timeRemaining, setTimeRemaining] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);

  const start = useCallback(() => {
    setIsRunning(true);
    setIsPaused(false);
  }, []);

  const pause = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    setIsPaused(false);
  }, []);

  const stop = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  const reset = useCallback(
    (newTime) => {
      setTimeRemaining(newTime || initialTime);
      setIsRunning(false);
      setIsPaused(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    },
    [initialTime]
  );

  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            if (onTimeUp) onTimeUp();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, onTimeUp]);

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const percentage = ((initialTime - timeRemaining) / initialTime) * 100;

  return {
    timeRemaining,
    minutes,
    seconds,
    percentage,
    isRunning,
    isPaused,
    start,
    pause,
    resume,
    stop,
    reset,
  };
};
