import { describe, it } from 'node:test';
import assert from 'node:assert';
import { isValidAspectRatio, resolveAspectRatio } from '../src/components/utils';

describe('isValidAspectRatio', () => {
  it('accepts integer ratio like 16/9', () => {
    assert.strictEqual(isValidAspectRatio('16/9'), true);
  });

  it('accepts ratio with spaces like 16 / 9', () => {
    assert.strictEqual(isValidAspectRatio('16 / 9'), true);
  });

  it('accepts decimal ratio like 2.35/1', () => {
    assert.strictEqual(isValidAspectRatio('2.35/1'), true);
  });

  it('accepts 1/1', () => {
    assert.strictEqual(isValidAspectRatio('1/1'), true);
  });

  it('rejects zero numerator 0/9', () => {
    assert.strictEqual(isValidAspectRatio('0/9'), false);
  });

  it('rejects zero denominator 16/0', () => {
    assert.strictEqual(isValidAspectRatio('16/0'), false);
  });

  it('rejects both zero 0/0', () => {
    assert.strictEqual(isValidAspectRatio('0/0'), false);
  });

  it('rejects plain word like movie', () => {
    assert.strictEqual(isValidAspectRatio('movie'), false);
  });

  it('rejects empty string', () => {
    assert.strictEqual(isValidAspectRatio(''), false);
  });

  it('rejects single number', () => {
    assert.strictEqual(isValidAspectRatio('16'), false);
  });

  it('rejects negative values', () => {
    assert.strictEqual(isValidAspectRatio('-16/9'), false);
  });
});

describe('resolveAspectRatio', () => {
  it('maps "video" to "16/9"', () => {
    assert.strictEqual(resolveAspectRatio('video'), '16/9');
  });

  it('maps "square" to "1/1"', () => {
    assert.strictEqual(resolveAspectRatio('square'), '1/1');
  });

  it('passes through valid ratio "4/3"', () => {
    assert.strictEqual(resolveAspectRatio('4/3'), '4/3');
  });

  it('passes through valid ratio "21/9"', () => {
    assert.strictEqual(resolveAspectRatio('21/9'), '21/9');
  });

  it('returns undefined for invalid value "movie"', () => {
    assert.strictEqual(resolveAspectRatio('movie'), undefined);
  });

  it('returns undefined for "16/0"', () => {
    assert.strictEqual(resolveAspectRatio('16/0'), undefined);
  });

  it('returns undefined for undefined', () => {
    assert.strictEqual(resolveAspectRatio(undefined), undefined);
  });

  it('returns undefined for empty string', () => {
    assert.strictEqual(resolveAspectRatio(''), undefined);
  });
});
