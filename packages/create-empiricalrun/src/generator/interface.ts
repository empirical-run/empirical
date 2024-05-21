export interface Generator {
  format: string;
  generate(): Promise<void>;
}
