import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  determineAudioIsLonger,
  isVideoFinished,
  computeVideoVolume,
  computeSeekSyncTarget,
  shouldTransitionOnVideoEnd,
  shouldTransitionOnAudioEnd,
  shouldEmitPauseOnVideoPause,
  AUDIO_LONGER_THRESHOLD_S,
  VIDEO_FINISHED_THRESHOLD_S,
  SEEK_SYNC_THRESHOLD_S,
  BACKGROUND_VOLUME,
} from '../src/components/media_sync';

describe('determineAudioIsLonger', () => {
  it('returns true when audio is significantly longer than video', () => {
    assert.strictEqual(determineAudioIsLonger(10, 5), true);
  });

  it('returns false when video is longer than audio', () => {
    assert.strictEqual(determineAudioIsLonger(5, 10), false);
  });

  it('returns false when audio is exactly threshold longer', () => {
    assert.strictEqual(determineAudioIsLonger(6, 6 - AUDIO_LONGER_THRESHOLD_S), false);
  });

  it('returns true when audio exceeds threshold by small amount', () => {
    assert.strictEqual(determineAudioIsLonger(6.01, 5), true);
  });

  it('returns false when durations are equal', () => {
    assert.strictEqual(determineAudioIsLonger(10, 10), false);
  });

  it('returns false when both durations are zero', () => {
    assert.strictEqual(determineAudioIsLonger(0, 0), false);
  });
});

describe('isVideoFinished', () => {
  it('returns true when video is null', () => {
    assert.strictEqual(isVideoFinished(null), true);
  });

  it('returns true when video.ended is true', () => {
    assert.strictEqual(isVideoFinished({ ended: true, duration: 10, currentTime: 10 }), true);
  });

  it('returns true when currentTime equals duration', () => {
    assert.strictEqual(isVideoFinished({ ended: false, duration: 10, currentTime: 10 }), true);
  });

  it('returns true when currentTime is within threshold of duration', () => {
    const time = 10 - VIDEO_FINISHED_THRESHOLD_S + 0.01;
    assert.strictEqual(isVideoFinished({ ended: false, duration: 10, currentTime: time }), true);
  });

  it('returns true when currentTime is exactly at threshold boundary', () => {
    const time = 10 - VIDEO_FINISHED_THRESHOLD_S;
    assert.strictEqual(isVideoFinished({ ended: false, duration: 10, currentTime: time }), true);
  });

  it('returns false when currentTime is just beyond threshold', () => {
    const time = 10 - VIDEO_FINISHED_THRESHOLD_S - 0.01;
    assert.strictEqual(isVideoFinished({ ended: false, duration: 10, currentTime: time }), false);
  });

  it('returns false when video is at the beginning', () => {
    assert.strictEqual(isVideoFinished({ ended: false, duration: 10, currentTime: 0 }), false);
  });

  it('returns true when duration is zero (empty media)', () => {
    assert.strictEqual(isVideoFinished({ ended: false, duration: 0, currentTime: 0 }), true);
  });

  it('returns true when duration is NaN (metadata not loaded)', () => {
    assert.strictEqual(isVideoFinished({ ended: false, duration: NaN, currentTime: 0 }), true);
  });

  it('returns true when duration is negative (invalid)', () => {
    assert.strictEqual(isVideoFinished({ ended: false, duration: -1, currentTime: 0 }), true);
  });

  it('returns false for very short video at beginning (duration < threshold)', () => {
    // duration 0.3s: adaptive threshold = min(0.5, 0.15) = 0.15
    // currentTime 0 < 0.3 - 0.15 = 0.15 → false (not finished yet)
    assert.strictEqual(isVideoFinished({ ended: false, duration: 0.3, currentTime: 0 }), false);
  });

  it('returns true for very short video near end', () => {
    // duration 0.3s: adaptive threshold = 0.15, currentTime 0.2 >= 0.15 → true
    assert.strictEqual(isVideoFinished({ ended: false, duration: 0.3, currentTime: 0.2 }), true);
  });
});

describe('computeVideoVolume', () => {
  it('returns 1 for sound effect source', () => {
    assert.strictEqual(
      computeVideoVolume({
        soundEffectSource: 'sound.mov',
        videoSource: undefined,
        audioSource: undefined,
        currentLang: undefined,
        defaultLang: undefined,
      }),
      1,
    );
  });

  it('returns 1 for sound effect even with other sources', () => {
    assert.strictEqual(
      computeVideoVolume({
        soundEffectSource: 'sound.mov',
        videoSource: 'video.mp4',
        audioSource: 'audio.mp3',
        currentLang: 'ja',
        defaultLang: 'en',
      }),
      1,
    );
  });

  it('returns 0 for video source without audio', () => {
    assert.strictEqual(
      computeVideoVolume({
        soundEffectSource: undefined,
        videoSource: 'video.mp4',
        audioSource: undefined,
        currentLang: 'en',
        defaultLang: 'en',
      }),
      0,
    );
  });

  it('returns 0 for video source with audio but same language', () => {
    assert.strictEqual(
      computeVideoVolume({
        soundEffectSource: undefined,
        videoSource: 'video.mp4',
        audioSource: 'audio.mp3',
        currentLang: 'en',
        defaultLang: 'en',
      }),
      0,
    );
  });

  it('returns background volume for video source with different language', () => {
    assert.strictEqual(
      computeVideoVolume({
        soundEffectSource: undefined,
        videoSource: 'video.mp4',
        audioSource: 'audio.mp3',
        currentLang: 'ja',
        defaultLang: 'en',
      }),
      BACKGROUND_VOLUME,
    );
  });

  it('returns 0 when currentLang is undefined', () => {
    assert.strictEqual(
      computeVideoVolume({
        soundEffectSource: undefined,
        videoSource: 'video.mp4',
        audioSource: 'audio.mp3',
        currentLang: undefined,
        defaultLang: 'en',
      }),
      0,
    );
  });

  it('returns 0 when defaultLang is undefined', () => {
    assert.strictEqual(
      computeVideoVolume({
        soundEffectSource: undefined,
        videoSource: 'video.mp4',
        audioSource: 'audio.mp3',
        currentLang: 'ja',
        defaultLang: undefined,
      }),
      0,
    );
  });

  it('returns 0 when no sources are set', () => {
    assert.strictEqual(
      computeVideoVolume({
        soundEffectSource: undefined,
        videoSource: undefined,
        audioSource: undefined,
        currentLang: undefined,
        defaultLang: undefined,
      }),
      0,
    );
  });
});

describe('computeSeekSyncTarget', () => {
  it('returns clamped time when delta exceeds threshold', () => {
    assert.strictEqual(computeSeekSyncTarget(5, 2, 10), 5);
  });

  it('returns null when delta is within threshold', () => {
    assert.strictEqual(computeSeekSyncTarget(5.3, 5.0, 10), null);
  });

  it('returns null when delta equals threshold exactly', () => {
    assert.strictEqual(computeSeekSyncTarget(5.5, 5.0, 10), null);
  });

  it('clamps source time to target duration', () => {
    assert.strictEqual(computeSeekSyncTarget(12, 3, 10), 10);
  });

  it('returns target time when source is at 0', () => {
    assert.strictEqual(computeSeekSyncTarget(0, 3, 10), 0);
  });

  it('returns null when both at 0', () => {
    assert.strictEqual(computeSeekSyncTarget(0, 0, 10), null);
  });

  it('handles target ahead of source', () => {
    assert.strictEqual(computeSeekSyncTarget(2, 8, 10), 2);
  });

  it('handles source beyond duration with target near end', () => {
    // source=15, duration=10 → clamped=10, target=9.8, delta=0.2 < 0.5
    assert.strictEqual(computeSeekSyncTarget(15, 9.8, 10), null);
  });

  it('returns null when sourceTime is NaN', () => {
    assert.strictEqual(computeSeekSyncTarget(NaN, 5, 10), null);
  });

  it('returns null when targetTime is NaN', () => {
    assert.strictEqual(computeSeekSyncTarget(5, NaN, 10), null);
  });

  it('returns null when targetDuration is NaN', () => {
    assert.strictEqual(computeSeekSyncTarget(5, 3, NaN), null);
  });
});

describe('shouldTransitionOnVideoEnd', () => {
  it('returns false when already emitted', () => {
    assert.strictEqual(shouldTransitionOnVideoEnd(true, false, true), false);
  });

  it('returns true when no audio exists', () => {
    assert.strictEqual(shouldTransitionOnVideoEnd(false, false, false), true);
  });

  it('returns true when audio exists and ended', () => {
    assert.strictEqual(shouldTransitionOnVideoEnd(false, true, true), true);
  });

  it('returns false when audio exists but not ended', () => {
    assert.strictEqual(shouldTransitionOnVideoEnd(false, false, true), false);
  });
});

describe('shouldTransitionOnAudioEnd', () => {
  it('returns false when already emitted', () => {
    assert.strictEqual(shouldTransitionOnAudioEnd(true, null), false);
  });

  it('returns true when video is null', () => {
    assert.strictEqual(shouldTransitionOnAudioEnd(false, null), true);
  });

  it('returns true when video is ended', () => {
    assert.strictEqual(shouldTransitionOnAudioEnd(false, { ended: true, duration: 10, currentTime: 10 }), true);
  });

  it('returns true when video is near end (within threshold)', () => {
    assert.strictEqual(
      shouldTransitionOnAudioEnd(false, { ended: false, duration: 10, currentTime: 9.8 }),
      true,
    );
  });

  it('returns false when video is still playing mid-way', () => {
    assert.strictEqual(
      shouldTransitionOnAudioEnd(false, { ended: false, duration: 10, currentTime: 5 }),
      false,
    );
  });

  it('returns false when video is at beginning', () => {
    assert.strictEqual(
      shouldTransitionOnAudioEnd(false, { ended: false, duration: 10, currentTime: 0 }),
      false,
    );
  });

  it('handles video paused near end after audio-driven seek', () => {
    // Audio was longer, video paused at its end but ended=false
    assert.strictEqual(
      shouldTransitionOnAudioEnd(false, { ended: false, duration: 5, currentTime: 4.9 }),
      true,
    );
  });

  it('returns true when video duration is NaN (metadata not loaded)', () => {
    // Audio ended but video metadata never loaded — should not block transition
    assert.strictEqual(
      shouldTransitionOnAudioEnd(false, { ended: false, duration: NaN, currentTime: 0 }),
      true,
    );
  });

  it('returns true when video duration is 0 (empty media)', () => {
    assert.strictEqual(
      shouldTransitionOnAudioEnd(false, { ended: false, duration: 0, currentTime: 0 }),
      true,
    );
  });
});

describe('shouldEmitPauseOnVideoPause', () => {
  it('returns false when stopping programmatically', () => {
    assert.strictEqual(
      shouldEmitPauseOnVideoPause({ isStopping: true, videoEnded: false, audioExists: true, audioEnded: false }),
      false,
    );
  });

  it('returns false when video ended but audio still playing', () => {
    assert.strictEqual(
      shouldEmitPauseOnVideoPause({ isStopping: false, videoEnded: true, audioExists: true, audioEnded: false }),
      false,
    );
  });

  it('returns true when video ended and audio also ended', () => {
    assert.strictEqual(
      shouldEmitPauseOnVideoPause({ isStopping: false, videoEnded: true, audioExists: true, audioEnded: true }),
      true,
    );
  });

  it('returns true when video ended and no audio exists', () => {
    assert.strictEqual(
      shouldEmitPauseOnVideoPause({ isStopping: false, videoEnded: true, audioExists: false, audioEnded: false }),
      true,
    );
  });

  it('returns true for normal user pause (video not ended)', () => {
    assert.strictEqual(
      shouldEmitPauseOnVideoPause({ isStopping: false, videoEnded: false, audioExists: true, audioEnded: false }),
      true,
    );
  });
});

describe('constants', () => {
  it('AUDIO_LONGER_THRESHOLD_S is 1 second', () => {
    assert.strictEqual(AUDIO_LONGER_THRESHOLD_S, 1);
  });

  it('VIDEO_FINISHED_THRESHOLD_S is 0.5 seconds', () => {
    assert.strictEqual(VIDEO_FINISHED_THRESHOLD_S, 0.5);
  });

  it('SEEK_SYNC_THRESHOLD_S is 0.5 seconds', () => {
    assert.strictEqual(SEEK_SYNC_THRESHOLD_S, 0.5);
  });

  it('BACKGROUND_VOLUME is 0.2', () => {
    assert.strictEqual(BACKGROUND_VOLUME, 0.2);
  });
});
