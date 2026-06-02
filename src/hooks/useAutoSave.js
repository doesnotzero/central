import { useEffect, useRef, useState } from "react";

export const useAutoSave = (data, saveFn, delay = 2000) => {
  const [status, setStatus] = useState("idle");
  const [savedAt, setSavedAt] = useState(null);
  const firstRun = useRef(true);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return undefined;
    }
    if (!saveFn) return undefined;

    setStatus("dirty");
    const timer = window.setTimeout(async () => {
      setStatus("saving");
      try {
        await saveFn(data);
        setSavedAt(new Date());
        setStatus("saved");
      } catch {
        setStatus("error");
      }
    }, delay);

    return () => window.clearTimeout(timer);
  }, [data, delay, saveFn]);

  return { status, savedAt };
};
