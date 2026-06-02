import { useCallback, useEffect } from "react";
import { useAsync } from "./useAsync.js";

export const useSupabaseQuery = (queryFn, deps = [], options = {}) => {
  const asyncState = useAsync(options.initialData ?? null);

  const refetch = useCallback(() => asyncState.execute(queryFn), [asyncState.execute, queryFn]);

  useEffect(() => {
    if (options.enabled === false) return undefined;
    refetch();
    return undefined;
  }, deps);

  return { ...asyncState, refetch };
};
