import { describe, test } from "vitest";
import { fetchWithRetry } from "./index";
import { vi } from "vitest";
import { expect } from "vitest";
import { beforeEach } from "vitest";
import { afterEach } from "vitest";

const originalFetch = global.fetch;

describe("fetch: retry tests", () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockRejectedValue("");
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });
  test("check for 2 retries if fetch throws error", async () => {
    let isErrorResp = false;
    try {
      await fetchWithRetry("", { maxRetries: 2 });
    } catch (e) {
      isErrorResp = true;
    }
    expect(isErrorResp).toBe(true);
    expect(global.fetch).toBeCalledTimes(2);
  });

  test("shouldRetry method should override maxRetries", async () => {
    let isErrorResp = false;
    try {
      await fetchWithRetry("", {
        maxRetries: 2,
        shouldRetry: async () => false,
      });
    } catch (e) {
      isErrorResp = true;
    }
    expect(isErrorResp).toBe(true);
    expect(global.fetch).toBeCalledTimes(1);
  });

  test("shouldRetry method override maxRetries", async () => {
    let isErrorResp = false;
    try {
      await fetchWithRetry("", {
        maxRetries: 2,
        shouldRetry: async () => false,
      });
    } catch (e) {
      isErrorResp = true;
    }
    expect(isErrorResp).toBe(true);
    expect(global.fetch).toBeCalledTimes(1);
  });
});

describe("fetch: timeout tests", () => {
  test("should retry if there is a timeout", async () => {
    let isErrorResp = false;
    // let errorResp: any;
    const shouldRetry = vi.fn().mockResolvedValue(true);
    try {
      await fetchWithRetry("https://www.empirical.run", {
        shouldRetry,
        timeout: 5,
        maxRetries: 2,
      });
    } catch (e: any) {
      console.log(e);
      isErrorResp = true;
      // errorResp = e;
    }
    expect(isErrorResp).toBe(true);
    // expect(errorResp).toBe("Request timed out");
    expect(shouldRetry).toBeCalledTimes(1);
  });
});

test("fetch should be able to get data using url", async () => {
  const resp = await fetchWithRetry("https://www.empirical.run");
  const text = await resp?.text();
  expect(text).toBeTruthy();
});
