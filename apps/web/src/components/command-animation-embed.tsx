"use client";

import Link from "next/link";
import { ChevronRight, Play } from "lucide-react";
import type { TeachingScene } from "@commandlab/content-schema";
import { CommandAnimation } from "./command-animation";

type CommandAnimationEmbedProps = {
  scene: TeachingScene;
  tool: string;
  slug: string;
  label?: string;
};

/** 课程页内嵌的真实教学动画，复用完整动画播放器的状态机与时间轴。 */
export function CommandAnimationEmbed({ scene, tool, slug, label }: CommandAnimationEmbedProps) {
  return (
    <div className="animation-embed" data-testid="animation-embed">
      <div className="animation-embed-heading">
        {label ? (
          <span className="animation-embed-label">{label}</span>
        ) : (
          <Link
            href={`/reference/${tool}/${slug}/animation/`}
            className="animation-embed-label animation-embed-link"
          >
            {tool}/{slug} <ChevronRight size={12} />
          </Link>
        )}
        <Link
          href={`/reference/${tool}/${slug}/animation/`}
          className="ui-button ui-button--ghost animation-embed-full-link"
        >
          <Play size={12} /> 完整动画
        </Link>
        <span className="animation-embed-observation">先看命令，再点播放</span>
      </div>
      <CommandAnimation scene={scene} embedded />
    </div>
  );
}
