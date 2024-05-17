export interface FileLoader {
  type: string;
  getLoader: (file: string, directory: string) => <T>() => Promise<T>;
}
