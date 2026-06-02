import { useEffect } from "react";

const normalizeKey = event => {
  const parts = [];
  if (event.metaKey || event.ctrlKey) parts.push("cmd");
  if (event.shiftKey) parts.push("shift");
  if (event.altKey) parts.push("alt");
  parts.push(event.key.toLowerCase());
  return parts.join("+");
};

export const useKeyboard = (shortcuts, enabled = true) => {
  useEffect(() => {
    if (!enabled) return undefined;
    const onKeyDown = event => {
      const handler = shortcuts?.[normalizeKey(event)];
      if (!handler) return;
      event.preventDefault();
      handler(event);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled, shortcuts]);
};
