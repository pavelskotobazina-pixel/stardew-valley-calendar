import { useEffect, useMemo, useState } from "react";

export function useChecklist(storageKey: string) {
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || "{}") as Record<string, boolean>;
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(checked));
  }, [checked, storageKey]);

  const count = useMemo(() => Object.values(checked).filter(Boolean).length, [checked]);

  function toggle(id: string) {
    setChecked((current) => ({ ...current, [id]: !current[id] }));
  }

  function replace(next: Record<string, boolean>) {
    setChecked(next);
  }

  return { checked, toggle, replace, count };
}
