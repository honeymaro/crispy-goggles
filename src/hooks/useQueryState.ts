import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const useQueryState = <T extends object>(
  key: string,
  defaultValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const isMountedRef = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [value, setValue] = useState<T>(() => {
    const params = new URLSearchParams(location.search);
    const valueFromParams = params.get(key);
    return valueFromParams
      ? JSON.parse(window.atob(valueFromParams || "") || "{}")
      : defaultValue;
  });

  useEffect(() => {
    if (isMountedRef.current) {
      const newParams = new URLSearchParams(location.search);
      newParams.set(key, window.btoa(JSON.stringify(value)));
      navigate(
        { ...location, search: newParams.toString() },
        { replace: true }
      );
    }
    isMountedRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return useMemo(() => [value as T, setValue], [setValue, value]);
};

export default useQueryState;
