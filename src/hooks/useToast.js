import { useCallback, useState } from "react";

export const useToast = (limit = 3) => {
  const [toasts, setToasts] = useState([]);

  const pushToast = useCallback((message, kind = "success") => {
    const toast = { id: Date.now() + Math.random(), message, kind };
    setToasts(current => [toast, ...current].slice(0, limit));
    window.setTimeout(() => {
      setToasts(current => current.filter(item => item.id !== toast.id));
    }, 2600);
    return toast.id;
  }, [limit]);

  const removeToast = useCallback(id => {
    setToasts(current => current.filter(item => item.id !== id));
  }, []);

  return { toasts, pushToast, removeToast };
};
