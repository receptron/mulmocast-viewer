import { test, expect } from '@playwright/test';

// Helper: hover the group container to trigger group-hover CSS
const hoverMedia = async (page: import('@playwright/test').Page) => {
  const group = page.locator('.group').first();
  await group.hover({ position: { x: 10, y: 10 } });
};

test.describe('Play/Pause overlay', () => {
  test.describe('soundEffectSource + videoSource', () => {
    test('shows play button on hover, switches to pause on click', async ({ page }) => {
      await page.goto('/contents/test_sound_effect/0');

      const overlay = page.locator('.play-overlay').first();
      const button = overlay.locator('button');

      // Hover group container to trigger overlay
      await hoverMedia(page);
      await expect(overlay).toHaveCSS('opacity', '1');

      // Play icon is visible
      await expect(button.locator('svg')).toBeVisible();

      // Click play
      await button.click();
      await page.waitForTimeout(200);

      // Should switch to pause icon
      await hoverMedia(page);
      await expect(button.locator('svg')).toBeVisible();

      // Video should be playing
      const video = page.locator('video').first();
      const paused = await video.evaluate((v: HTMLVideoElement) => v.paused);
      expect(paused).toBe(false);
    });

    test('video is not muted (volume = 1)', async ({ page }) => {
      await page.goto('/contents/test_sound_effect/0');

      const button = page.locator('.play-overlay button').first();
      await hoverMedia(page);
      await button.click();
      await page.waitForTimeout(200);

      const video = page.locator('video').first();
      const volume = await video.evaluate((v: HTMLVideoElement) => v.volume);
      expect(volume).toBe(1);
    });
  });

  test.describe('audioSource + imageSource', () => {
    test('shows play button on hover over image, plays audio on click', async ({ page }) => {
      await page.goto('/contents/test_media/0');

      const overlay = page.locator('.play-overlay').first();
      const button = overlay.locator('button');

      // Hover shows overlay
      await hoverMedia(page);
      await expect(overlay).toHaveCSS('opacity', '1');

      // Click play
      await button.click();
      await page.waitForTimeout(200);

      // Audio should be playing
      const audio = page.locator('audio').first();
      const paused = await audio.evaluate((a: HTMLAudioElement) => a.paused);
      expect(paused).toBe(false);
    });
  });

  test.describe('videoWithAudioSource', () => {
    test('shows play button on hover, plays video on click', async ({ page }) => {
      await page.goto('/contents/test_lipsync/0');

      const overlay = page.locator('.play-overlay').first();
      const button = overlay.locator('button');

      // Hover shows overlay
      await hoverMedia(page);
      await expect(overlay).toHaveCSS('opacity', '1');

      // Click play
      await button.click();
      await page.waitForTimeout(200);

      // Video should be playing
      const video = page.locator('video').first();
      const paused = await video.evaluate((v: HTMLVideoElement) => v.paused);
      expect(paused).toBe(false);
    });
  });

  test.describe('pause functionality', () => {
    test('clicking pause button stops playback', async ({ page }) => {
      await page.goto('/contents/test_sound_effect/0');

      const button = page.locator('.play-overlay button').first();

      // Play
      await hoverMedia(page);
      await button.click();
      await page.waitForTimeout(200);

      // Verify playing
      const video = page.locator('video').first();
      const playingBefore = await video.evaluate((v: HTMLVideoElement) => !v.paused);
      expect(playingBefore).toBe(true);

      // Click pause
      await hoverMedia(page);
      await button.click();
      await page.waitForTimeout(200);

      // Verify paused
      const pausedAfter = await video.evaluate((v: HTMLVideoElement) => v.paused);
      expect(pausedAfter).toBe(true);
    });
  });
});
