import { useState, useRef, useCallback } from "react";

export const useWebcam = () => {
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState(null);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);

  const startWebcam = useCallback(async (constraints = {}) => {
    try {
      const defaultConstraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
        audio: false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        ...defaultConstraints,
        ...constraints,
      });

      setStream(mediaStream);
      setIsActive(true);
      setError(null);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      return mediaStream;
    } catch (err) {
      console.error("Error accessing webcam:", err);
      setError(err.message);
      setIsActive(false);
      return null;
    }
  }, []);

  const stopWebcam = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setIsActive(false);

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  }, [stream]);

  const captureImage = useCallback(() => {
    if (!videoRef.current) return null;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0);

    return canvas.toDataURL("image/jpeg", 0.8);
  }, []);

  return {
    videoRef,
    isActive,
    error,
    stream,
    startWebcam,
    stopWebcam,
    captureImage,
  };
};
