import type { ButtonHTMLAttributes, HTMLAttributes, PropsWithChildren } from "react";
import { clsx } from "clsx";

/** CommandLab 的基础卡片容器，统一边框、背景和悬浮层级。 */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("ui-card", className)} {...props} />;
}

/** 支持主次样式的通用按钮。 */
export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" }) {
  return <button className={clsx("ui-button", `ui-button--${variant}`, className)} {...props} />;
}

/** 用于课程等级、状态和工具标签的统一徽标。 */
export function Badge({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <span className={clsx("ui-badge", className)}>{children}</span>;
}
