import tsx from "tsx/cjs/api";

export default {
  type: ".ts",
  getLoader(file: string, directory: string = "") {
    return async function loader<T>(): Promise<T> {
      const loaded = await tsx.require(file, `${directory}/${file}`);
      return loaded.default as T;
    };
  },
};
