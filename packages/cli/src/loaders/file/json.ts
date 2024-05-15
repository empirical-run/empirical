import fs from "fs/promises";
export default {
  type: ".json",
  getLoader(file: string, directory: string) {
    return async function loader<T>(): Promise<T> {
      try {
        const data = (await fs.readFile(`${directory}/${file}`)).toString();
        return data as T;
      } catch (e: any) {
        throw Error(`Failed to parse JSON file: ${e.message}`);
      }
    };
  },
};
