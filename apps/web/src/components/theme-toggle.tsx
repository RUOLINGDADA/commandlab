"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@commandlab/ui";

/** 在深色与浅色主题间切换，并将用户选择保存在本地。 */
export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("commandlab-theme");
    const nextDark = stored ? stored === "dark" : false;
    const frame = window.requestAnimationFrame(() => {
      setDark(nextDark);
      document.documentElement.dataset.theme = nextDark ? "dark" : "light";
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function toggle() {
    const nextDark = !dark;
    setDark(nextDark);
    document.documentElement.dataset.theme = nextDark ? "dark" : "light";
    window.localStorage.setItem("commandlab-theme", nextDark ? "dark" : "light");
  }

  return (
    <Button variant="ghost" className="icon-button" onClick={toggle} aria-label="切换明暗主题">
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </Button>
  );
}
