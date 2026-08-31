import type {
  TeachingEvent,
  TeachingFrame,
  TeachingGitState,
  TeachingScene,
  TeachingState,
} from "@commandlab/content-schema";

export type GitCommand = {
  name: string;
  args: string[];
  flags: Record<string, string[]>;
};

export type ApplyResult = {
  state: TeachingGitState;
  events: TeachingEvent[];
  output: string[];
  error?: string;
};

export type TeachingTimeline = {
  scene: TeachingScene;
  frames: TeachingFrame[];
};

export type { TeachingEvent, TeachingFrame, TeachingGitState, TeachingScene, TeachingState };
