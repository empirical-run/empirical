import { promises as fs } from "fs";
import zlib from "zlib";

const fileName = "HumanEval.jsonl";
const fileDownloadPath = `https://raw.githubusercontent.com/openai/human-eval/master/data/${fileName}.gz`;

const resp = await fetch(fileDownloadPath);
const buffer = await resp.arrayBuffer();
zlib.gunzip(buffer, async (err, unzipped) => {
  if (err) {
    console.error("Error unzipping the file:", err);
    return;
  }
  await fs.writeFile(fileName, unzipped);
});
