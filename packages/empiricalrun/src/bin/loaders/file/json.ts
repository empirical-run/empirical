import fs from "fs/promises";

export default {
  type: ".json",
  getLoader(file: string, directory: string) {
    const fileType = this.type;
    return async function loader<T>(): Promise<T> {
      try {
        const data = (
          await fs.readFile(`${directory}/${file}${fileType}`)
        ).toString();
        return JSON.parse(data) as T;
      } catch (e: any) {
        throw Error(`Failed to parse JSON file: ${e.message}`);
      }
    };
  },
};
