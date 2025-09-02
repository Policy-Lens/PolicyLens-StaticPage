import { useEffect, useRef, useState } from "react";
import { apiRequest } from "../utils/api";

const POLL_INTERVAL_MS = 2000;
const TIMEOUT_MS = 60000;

export default function useTaskPoller() {
  const [isPolling, setIsPolling] = useState(false);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  const stop = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    intervalRef.current = null;
    timeoutRef.current = null;
    setIsPolling(false);
  };

  const startPolling = (taskId, onComplete, onError) => {
    if (!taskId) return;
    setIsPolling(true);

    timeoutRef.current = setTimeout(() => {
      stop();
      onError?.(new Error("Polling timed out"));
    }, TIMEOUT_MS);

    intervalRef.current = setInterval(async () => {
      try {
        const res = await apiRequest("GET", `/api/plc/task-status/${taskId}/`, null, true);
        if (res.status === 200) {
          const { status, data } = res.data || {};
          if (status === "SUCCESS") {
            stop();
            onComplete?.(data);
          } else if (status === "FAILURE") {
            stop();
            onError?.(new Error("Task failed"));
          }
        }
      } catch (e) {
        stop();
        onError?.(e);
      }
    }, POLL_INTERVAL_MS);
  };

  useEffect(() => () => stop(), []);

  return { isPolling, startPolling, stop };
}


