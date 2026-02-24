const ASPECT_RATIO_MAP: Record<string, string> = {
  video: '16/9',
  square: '1/1',
};

const ASPECT_RATIO_RE = /^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/;

export const isValidAspectRatio = (value: string): boolean => {
  const match = ASPECT_RATIO_RE.exec(value);
  if (!match) return false;
  return Number(match[1]) > 0 && Number(match[2]) > 0;
};

export const resolveAspectRatio = (value: string | undefined): string | undefined => {
  if (!value) return undefined;
  const mapped = ASPECT_RATIO_MAP[value];
  if (mapped) return mapped;
  if (isValidAspectRatio(value)) return value;
  return undefined;
};

export const sleep = async (milliseconds: number) => {
  return await new Promise((resolve) => setTimeout(resolve, milliseconds));
};

export const cancellableSleep = (milliseconds: number, signal: AbortSignal): Promise<void> => {
  const toError = (reason: unknown): Error => (reason instanceof Error ? reason : new Error('Aborted'));
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(toError(signal.reason));
      return;
    }
    const onAbort = () => {
      clearTimeout(timer);
      reject(toError(signal.reason));
    };
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', onAbort);
      resolve();
    }, milliseconds);
    signal.addEventListener('abort', onAbort, { once: true });
  });
};
