import { useCallback } from "react";

export const useConfirm = () => {
  return useCallback((message = "Tem certeza que deseja continuar?") => {
    return window.confirm(message);
  }, []);
};
