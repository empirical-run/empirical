import { expect, test, vi } from "vitest";
import { loadDataset } from "./index";

test("can load dataset without any ids", async () => {
  const dataset = await loadDataset({
    samples: [
      {
        inputs: {},
      },
    ],
  });
  expect(dataset?.id).toBe("0d41a81e415558e36aef80cbbaf9a61a");
  const sample = dataset?.samples[0];
  expect(sample?.id).toBe("1");
});

test("can load dataset sample which has an id", async () => {
  const dataset = await loadDataset({
    samples: [
      {
        id: "test-sample-id",
        inputs: {},
      },
    ],
  });
  expect(dataset?.id).toBe("e66638e3d1cb0b830c5ecced806f2d38");
  const sample = dataset?.samples[0];
  expect(sample?.id).toBe("test-sample-id");
});

test("can load dataset from jsonl with ids", async () => {
  vi.mock("node:fs", async () => {
    const mockedData = { key1: "value1", key2: "value2" };
    return {
      ...(await vi.importActual<typeof import("node:fs")>("node:fs")),
      promises: {
        readFile: vi.fn().mockReturnValue(`${JSON.stringify(mockedData)}\n`),
      },
    };
  });
  const dataset = await loadDataset({
    path: `test.jsonl`,
  });
  expect(dataset?.id).toBe("608d158ebd6d2dc2ccf2b4140e95406f");
  const sample = dataset?.samples[0];
  expect(sample?.id).toBe("1");
  expect(sample?.inputs.key1).toBe("value1");
});

test("can load dataset from google sheet", async () => {
  const dataset = await loadDataset({
    path: "https://docs.google.com/spreadsheets/d/1AsMekKCG74m1PbBZQN_sEJgaW0b9Xarg4ms4mhG3i5k/edit#gid=0",
  });
  expect(dataset.id).toBeDefined();
  expect(dataset.samples?.[0]?.id).toBeDefined();
  expect(dataset.samples?.[0]?.inputs).toBeDefined();
});
