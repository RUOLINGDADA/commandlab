"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

const THEME_CHANGE_EVENT = "commandlab-theme-change";

function subscribe(onStoreChange: () => void) {
  window.addEventListener(THEME_CHANGE_EVENT, onStoreChange);
  return () => window.removeEventListener(THEME_CHANGE_EVENT, onStoreChange);
}

function getSnapshot() {
  return document.documentElement.dataset.theme !== "light";
}

function getServerSnapshot() {
  return true;
}

/** 在深色与浅色主题间切换，并将用户选择保存在本地。 */
export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function toggle() {
    const nextDark = !dark;
    document.documentElement.dataset.theme = nextDark ? "dark" : "light";
    window.localStorage.setItem("commandlab-theme", nextDark ? "dark" : "light");
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }

  return (
    <button
      type="button"
      className="ide-titlebar-button"
      onClick={toggle}
      aria-label={dark ? "切换到浅色主题" : "切换到深色主题"}
      title={dark ? "切换到浅色主题" : "切换到深色主题"}
    >
      {dark ? <Sun size={14} /> : <Moon size={14} />}
    </button>
  );
}
