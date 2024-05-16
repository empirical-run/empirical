import fs from "fs/promises";
import path from "path";
import json from "./json";
import js from "./js";
import { FileLoader } from "./interface";
import ts from "./ts";

const loaders: FileLoader[] = [json, js, ts];

export async function getFileLoaderForFileName(
  name: string,
  directory: string,
) {
  let matchingLoader: FileLoader | undefined;
  for (const loader of loaders) {
    try {
      const fullPath = path.join(directory, `${name}${loader.type}`);
      await fs.access(fullPath, fs.constants.F_OK);
      matchingLoader = loader;
      break;
    } catch (e) {
      //
    }
  }
  if (!matchingLoader) {
    throw new Error(`No loader found for file ${name}`);
  }
  return matchingLoader.getLoader(name, directory);
}
