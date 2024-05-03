import { Database } from "duckdb-async";
let localDBInstance: Promise<Database> | null = null;

export async function getLocalDBInstance(): Promise<Database> {
  if (localDBInstance) {
    return await localDBInstance;
  }
  localDBInstance = Database.create(":memory:", {
    access_mode: "READ_WRITE",
    max_memory: "512MB",
    threads: "4",
  });
  return await localDBInstance;
}
