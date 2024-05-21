import tsx from "tsx/cjs/api";

export default {
  type: ".js",
  getLoader(file: string, directory: string = "") {
    return async function loader<T>(): Promise<T> {
      const loaded = await tsx.require(file, `${directory}/${file}`);
      // support for ESM modules
      if (loaded.default) {
        return loaded.default as T;
      } else {
        // support for commonjs modules
        return loaded as T;
      }
    };
  },
};
