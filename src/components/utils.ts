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
    const timer = setTimeout(resolve, milliseconds);
    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(toError(signal.reason));
      },
      { once: true }
    );
  });
};
