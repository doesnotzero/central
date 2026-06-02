import { useCallback, useState } from "react";

export const useClipboard = (timeout = 1800) => {
  const [status, setStatus] = useState("idle");

  const copy = useCallback(async text => {
    if (!text) return false;
    try {
      await navigator.clipboard.writeText(text);
      setStatus("success");
      window.setTimeout(() => setStatus("idle"), timeout);
      return true;
    } catch {
      setStatus("error");
      window.setTimeout(() => setStatus("idle"), timeout);
      return false;
    }
  }, [timeout]);

  return { copy, status };
};
