/**
 * Pure functions for media synchronization logic.
 * Extracted from mulmo_player.vue for testability.
 */

/** Threshold (seconds) for determining if audio is longer than video */
export const AUDIO_LONGER_THRESHOLD_S = 1;

/** Threshold (seconds) for considering video "finished" near its end */
export const VIDEO_FINISHED_THRESHOLD_S = 0.5;

/** Threshold (seconds) for triggering a seek sync between media elements */
export const SEEK_SYNC_THRESHOLD_S = 0.5;

/** Volume for video background audio when narration language differs */
export const BACKGROUND_VOLUME = 0.2;

export type MediaState = {
  currentTime: number;
  duration: number;
  ended: boolean;
};

/**
 * Determines whether audio playback duration exceeds video duration
 * enough to warrant showing audio controls separately.
 */
export const determineAudioIsLonger = (audioDuration: number, videoDuration: number): boolean => {
  return audioDuration > videoDuration + AUDIO_LONGER_THRESHOLD_S;
};

/**
 * Determines whether a video element has effectively finished playing.
 * Accounts for cases where video may be paused near its end without
 * the browser firing the 'ended' event.
 *
 * Returns true for: null video, ended flag, NaN/0 duration (broken/empty media),
 * or currentTime within threshold of duration end.
 */
export const isVideoFinished = (video: MediaState | null): boolean => {
  if (!video) return true;
  if (video.ended) return true;
  // NaN or 0 duration means metadata failed to load or media is empty
  if (isNaN(video.duration) || video.duration <= 0) return true;
  // For very short videos, require currentTime > 0 to avoid false positives at start
  const threshold = Math.min(VIDEO_FINISHED_THRESHOLD_S, video.duration / 2);
  if (video.currentTime >= video.duration - threshold) return true;
  return false;
};

/**
 * Computes the appropriate video volume based on media configuration.
 * - Sound effect videos play at full volume
 * - When narration language differs from default, video plays softly as background
 * - Otherwise video is muted (narration comes from audio element)
 */
export const computeVideoVolume = (params: {
  soundEffectSource: string | undefined;
  videoSource: string | undefined;
  audioSource: string | undefined;
  currentLang: string | undefined;
  defaultLang: string | undefined;
}): number => {
  if (params.soundEffectSource) return 1;
  if (params.videoSource) {
    if (params.audioSource && params.currentLang && params.defaultLang && params.currentLang !== params.defaultLang) {
      return BACKGROUND_VOLUME;
    }
    return 0;
  }
  return 0;
};

/**
 * Computes the target seek time for syncing one media element to another.
 * Returns the clamped time if sync is needed, or null if elements are already close enough.
 */
export const computeSeekSyncTarget = (
  sourceTime: number,
  targetTime: number,
  targetDuration: number
): number | null => {
  // Guard against NaN values from unloaded metadata
  if (isNaN(sourceTime) || isNaN(targetTime) || isNaN(targetDuration)) return null;
  const clampedTime = Math.min(sourceTime, targetDuration);
  if (Math.abs(targetTime - clampedTime) > SEEK_SYNC_THRESHOLD_S) {
    return clampedTime;
  }
  return null;
};

/**
 * Decides whether to transition to the next beat when video ends.
 * Only transitions if both video and audio are done (or audio doesn't exist).
 */
export const shouldTransitionOnVideoEnd = (
  endedEmitted: boolean,
  audioEnded: boolean,
  audioExists: boolean
): boolean => {
  if (endedEmitted) return false;
  if (!audioExists) return true;
  return audioEnded;
};

/**
 * Decides whether to transition to the next beat when audio ends.
 * Only transitions if video is also finished.
 */
export const shouldTransitionOnAudioEnd = (endedEmitted: boolean, video: MediaState | null): boolean => {
  if (endedEmitted) return false;
  return isVideoFinished(video);
};

/**
 * Decides whether a video pause event should be emitted as a user-facing pause.
 * Suppresses pause during programmatic stop or when video ended but audio is still playing.
 */
export const shouldEmitPauseOnVideoPause = (params: {
  isStopping: boolean;
  videoEnded: boolean;
  audioExists: boolean;
  audioEnded: boolean;
}): boolean => {
  if (params.isStopping) return false;
  if (params.videoEnded && params.audioExists && !params.audioEnded) return false;
  return true;
};
