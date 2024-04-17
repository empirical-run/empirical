import { describe, test } from "vitest";
import { fetchWithRetry } from "./index";
import { vi } from "vitest";
import { expect } from "vitest";
import { beforeEach } from "vitest";
import { afterEach } from "vitest";

const originalFetch = global.fetch;

describe("test retries of fetch package", () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockRejectedValue("");
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });
  test("check for 3 retries if fetch throws error", async () => {
    let isErrorResp = false;
    try {
      await fetchWithRetry("", { retries: 3 });
    } catch (e) {
      isErrorResp = true;
    }
    expect(isErrorResp).toBe(true);
    expect(global.fetch).toBeCalledTimes(3);
  });
});

describe("test timeout of fetch package", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });
  test("check for 3 retries if fetch throws error", async () => {
    let isErrorResp = false;
    try {
      await fetchWithRetry("", { retries: 3 });
    } catch (e) {
      isErrorResp = true;
    }
    expect(isErrorResp).toBe(true);
    expect(global.fetch).toBeCalledTimes(3);
  });
});
