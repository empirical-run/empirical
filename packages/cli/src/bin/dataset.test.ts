import { expect, test } from "vitest";
import { loadDataset } from "./dataset";

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
