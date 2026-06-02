import { useCallback, useState } from "react";

export const useAsync = initialData => {
  const [state, setState] = useState({
    data: initialData ?? null,
    loading: false,
    error: null
  });

  const execute = useCallback(async fn => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await fn();
      setState({ data, loading: false, error: null });
      return data;
    } catch (err) {
      const error = err instanceof Error ? err.message : "Erro desconhecido";
      setState({ data: null, loading: false, error });
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: initialData ?? null, loading: false, error: null });
  }, [initialData]);

  return { ...state, execute, reset };
};
