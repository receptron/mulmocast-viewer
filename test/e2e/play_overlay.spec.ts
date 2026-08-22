import { test, expect } from '@playwright/test';

// Helper: hover the group container to trigger group-hover CSS
const hoverMedia = async (page: import('@playwright/test').Page) => {
  const group = page.locator('.group').first();
  await group.hover({ position: { x: 10, y: 10 } });
};

// The button's accessible name is the only thing that tells the two icons apart — both are
// an <svg>, so asserting one is visible passes whether or not the state changed. Reading
// `paused` goes through expect.poll rather than a bare evaluate: a one-shot read needs a
// fixed wait in front of it, and a fixed wait is what hides the state it is waiting for.
const expectPaused = (page: import('@playwright/test').Page, selector: 'video' | 'audio', paused: boolean) =>
  expect
    .poll(() => page.locator(selector).first().evaluate((el: HTMLMediaElement) => el.paused))
    .toBe(paused);

test.describe('Play/Pause overlay', () => {
  test.describe('soundEffectSource + videoSource', () => {
    test('shows play button on hover, switches to pause on click', async ({ page }) => {
      await page.goto('/contents/test_sound_effect/0');

      const overlay = page.locator('.play-overlay').first();
      const button = overlay.locator('button');

      await hoverMedia(page);
      await expect(overlay).toHaveCSS('opacity', '1');
      await expect(button).toHaveAttribute('aria-label', 'Play');

      await button.click();

      await hoverMedia(page);
      await expect(button).toHaveAttribute('aria-label', 'Pause');
      await expectPaused(page, 'video', false);
    });

    test('video is not muted (volume = 1)', async ({ page }) => {
      await page.goto('/contents/test_sound_effect/0');

      const button = page.locator('.play-overlay button').first();
      await hoverMedia(page);
      await button.click();
      await expectPaused(page, 'video', false);

      const volume = await page.locator('video').first().evaluate((v: HTMLVideoElement) => v.volume);
      expect(volume).toBe(1);
    });
  });

  test.describe('audioSource + imageSource', () => {
    test('shows play button on hover over image, plays audio on click', async ({ page }) => {
      await page.goto('/contents/test_media/0');

      const overlay = page.locator('.play-overlay').first();
      const button = overlay.locator('button');

      await hoverMedia(page);
      await expect(overlay).toHaveCSS('opacity', '1');
      await expect(button).toHaveAttribute('aria-label', 'Play');

      await button.click();
      await expectPaused(page, 'audio', false);
    });
  });

  test.describe('videoWithAudioSource', () => {
    test('shows play button on hover, plays video on click', async ({ page }) => {
      await page.goto('/contents/test_lipsync/0');

      const overlay = page.locator('.play-overlay').first();
      const button = overlay.locator('button');

      await hoverMedia(page);
      await expect(overlay).toHaveCSS('opacity', '1');
      await expect(button).toHaveAttribute('aria-label', 'Play');

      await button.click();
      await expectPaused(page, 'video', false);
    });
  });

  test.describe('pause functionality', () => {
    test('clicking pause button stops playback', async ({ page }) => {
      await page.goto('/contents/test_sound_effect/0');

      const button = page.locator('.play-overlay button').first();

      await hoverMedia(page);
      await button.click();
      await expect(button).toHaveAttribute('aria-label', 'Pause');
      await expectPaused(page, 'video', false);

      await hoverMedia(page);
      await button.click();
      await expect(button).toHaveAttribute('aria-label', 'Play');
      await expectPaused(page, 'video', true);
    });
  });
});
