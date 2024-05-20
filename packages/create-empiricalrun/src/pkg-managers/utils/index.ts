import util from "util";
import { exec } from "child_process";

export const execPromisified = util.promisify(exec);
