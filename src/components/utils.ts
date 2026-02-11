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
