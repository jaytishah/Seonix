import { useState, useEffect, useCallback } from "react";

export const useTabSwitch = (onTabSwitch, isEnabled = true) => {
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [isTabVisible, setIsTabVisible] = useState(true);

  const handleVisibilityChange = useCallback(() => {
    const visible = document.visibilityState === "visible";
    setIsTabVisible(visible);

    if (!visible && isEnabled) {
      setTabSwitchCount((prev) => prev + 1);
      if (onTabSwitch) {
        onTabSwitch(tabSwitchCount + 1);
      }
    }
  }, [isEnabled, onTabSwitch, tabSwitchCount]);

  const handleBlur = useCallback(() => {
    if (isEnabled && document.visibilityState === "visible") {
      // Window lost focus but tab is still visible (might be alt-tab)
      setTabSwitchCount((prev) => prev + 1);
      if (onTabSwitch) {
        onTabSwitch(tabSwitchCount + 1);
      }
    }
  }, [isEnabled, onTabSwitch, tabSwitchCount]);

  useEffect(() => {
    if (!isEnabled) return;

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    };
  }, [isEnabled, handleVisibilityChange, handleBlur]);

  const resetCount = useCallback(() => {
    setTabSwitchCount(0);
  }, []);

  return {
    tabSwitchCount,
    isTabVisible,
    resetCount,
  };
};
