export const calculatePercentage = (obtained, total) => {
  if (total === 0) return 0;
  return Math.round((obtained / total) * 100);
};

export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const parseUserAgent = (userAgentString) => {
  const ua = userAgentString || "";

  // Simple parsing (you can use a library like 'ua-parser-js' for better results)
  let browser = "Unknown";
  let os = "Unknown";
  let device = "Desktop";

  // Browser detection
  if (ua.includes("Chrome")) browser = "Chrome";
  else if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Safari")) browser = "Safari";
  else if (ua.includes("Edge")) browser = "Edge";

  // OS detection
  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac")) os = "MacOS";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iOS")) os = "iOS";

  // Device detection
  if (ua.includes("Mobile") || ua.includes("Android")) device = "Mobile";
  else if (ua.includes("Tablet") || ua.includes("iPad")) device = "Tablet";

  return { browser, os, device };
};

export const sanitizeInput = (input) => {
  if (typeof input !== "string") return input;
  return input.trim().replace(/[<>]/g, "");
};

export const calculateTimeDifference = (startDate, endDate) => {
  const diff = new Date(endDate) - new Date(startDate);
  const minutes = Math.floor(diff / (1000 * 60));
  return minutes;
};
