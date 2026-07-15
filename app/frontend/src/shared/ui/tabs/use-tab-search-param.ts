import { useCallback } from "react";
import { useSearchParams } from "react-router";

export function useTabSearchParam(
  param: string,
  defaultValue: string,
): [string, (value: string) => void] {
  const [searchParams, setSearchParams] = useSearchParams();
  const value = searchParams.get(param) ?? defaultValue;

  const setValue = useCallback(
    (next: string) => {
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev);
          if (next === defaultValue) {
            params.delete(param);
          } else {
            params.set(param, next);
          }
          return params;
        },
        { replace: true },
      );
    },
    [param, defaultValue, setSearchParams],
  );

  return [value, setValue];
}
