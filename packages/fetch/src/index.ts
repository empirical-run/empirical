interface FetchInitOptions extends RequestInit {
  retries?: number;
  timeout?: number;
  shouldRetry?: (resp: Response) => boolean;
}

const backoffDelay = (retryCount: number) => {
  const delay = Math.pow(2, retryCount) * 100;
  const randomMs = Math.random() * 100;
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
  const retries = reqOptions?.retries || 3;
  while (retryCount < retries) {
    try {
      reqOptions.signal = controller.signal;
      const response = await fetch(url, reqOptions);
      clearTimeout(timer);
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      return response;
    } catch (error) {
      retryCount++;
      if (retryCount >= retries) {
        clearTimeout(timer);
        throw error;
      }
      const delay = backoffDelay(retryCount);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};
