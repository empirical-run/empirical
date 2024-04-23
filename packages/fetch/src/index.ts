interface FetchInitOptions extends RequestInit {
  /**
   * total number of retries before each throwing error
   * @type {number} default 3
   * @memberof FetchInitOptions
   */
  maxRetries?: number;
  /**
   * request timeout in ms
   * @type {number}
   * @memberof FetchInitOptions
   */
  timeout?: number;
  /**
   * function to check if retry is needed
   * @memberof FetchInitOptions
   */
  shouldRetry?: (
    resp: Response | Error,
    retryCount: number,
  ) => Promise<boolean>;
  /**
   * exponential backoff multiplier
   * @type {number} default 1.5
   * @memberof FetchInitOptions
   */
  backoffMultiple?: number;
}

const backoffDelay = (multiple: number = 1.5, retryCount: number) => {
  const delay = Math.pow(multiple, retryCount) * 1000;
  const randomMs = Math.random() * 1000;
  return delay + randomMs;
};

export const fetchWithRetry = async (
  url: string,
  options?: FetchInitOptions,
): Promise<Response> => {
  const controller = new AbortController();
  const reqOptions = options || {};
  const timer = reqOptions?.timeout
    ? setTimeout(
        () => controller.abort("Request timed out"),
        reqOptions?.timeout,
      )
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
    } catch (error: any) {
      retryCount++;
      if (retryCount >= maxRetries) {
        clearTimeout(timer);
        throw error;
      }
      let retry = true;
      if (options?.shouldRetry) {
        let errorForRetry = error;
        if (errorForRetry instanceof Response) {
          errorForRetry = (error as Response).clone();
        }
        retry = await options?.shouldRetry?.(errorForRetry, retryCount);
      }
      if (!retry) {
        clearTimeout(timer);
        throw error;
      }
      const delay = backoffDelay(options?.backoffMultiple, retryCount);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw "Failed to fetch response";
};
