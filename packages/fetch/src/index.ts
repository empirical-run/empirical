interface FetchInitOptions extends RequestInit {
  maxRetries?: number;
  timeout?: number;
  shouldRetry?: (resp: any) => Promise<boolean>;
  backoffMultiple?: number;
}

const backoffDelay = (multiple: number = 2, retryCount: number) => {
  const delay = Math.pow(multiple, retryCount) * 1000;
  const randomMs = Math.random() * 1000;
  return delay + randomMs;
};

export const fetchWithRetry = async (
  url: string,
  options?: FetchInitOptions,
) => {
  const controller = new AbortController();
  const reqOptions = options || {};
  const timer = reqOptions?.timeout
    ? setTimeout(() => controller.abort(), reqOptions?.timeout)
    : undefined;

  let retryCount = 0;
  const maxRetries = reqOptions?.maxRetries || 3;
  while (retryCount < maxRetries) {
    try {
      reqOptions.signal = controller.signal;
      const response = await fetch(url, reqOptions);
      clearTimeout(timer);
      if (!response.ok) {
        throw response;
      }
      return response;
    } catch (error: Response | any) {
      retryCount++;
      if (retryCount === maxRetries) {
        clearTimeout(timer);
        throw error;
      }
      let retry = true;
      if (options?.shouldRetry) {
        retry = await options?.shouldRetry?.(error);
      }
      if (!retry) {
        clearTimeout(timer);
        throw error;
      }
      const delay = backoffDelay(options?.backoffMultiple, retryCount);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};
