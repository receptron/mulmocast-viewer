import { describe, it } from 'node:test';
import assert from 'node:assert';
import { cancellableSleep } from '../src/components/utils';

describe('cancellableSleep', () => {
  it('resolves after specified duration', async () => {
    const start = Date.now();
    const controller = new AbortController();
    await cancellableSleep(50, controller.signal);
    const elapsed = Date.now() - start;
    assert.ok(elapsed >= 40, `Expected >= 40ms, got ${elapsed}ms`);
  });

  it('rejects when aborted during sleep', async () => {
    const controller = new AbortController();
    const promise = cancellableSleep(5000, controller.signal);
    setTimeout(() => controller.abort(), 20);
    await assert.rejects(promise);
  });

  it('rejects immediately when signal is already aborted', async () => {
    const controller = new AbortController();
    controller.abort();
    await assert.rejects(cancellableSleep(5000, controller.signal));
  });

  it('resolves with 0ms duration', async () => {
    const controller = new AbortController();
    await cancellableSleep(0, controller.signal);
  });
});
