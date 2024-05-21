import { cyan, yellow, green, red } from "picocolors";
export interface Logger {
  log: (message?: string, ...optionalParams: any[]) => void;
  warn: (message?: string, ...optionalParams: any[]) => void;
  error: (message?: string, ...optionalParams: any[]) => void;
  success: (message?: string, ...optionalParams: any[]) => void;
}

export class CustomLogger implements Logger {
  log(message?: string, ...optionalParams: any[]) {
    console.log("🪵 ", cyan(message), ...optionalParams);
  }

  warn(message?: string, ...optionalParams: any[]) {
    console.log("🟡 ", yellow(message), ...optionalParams);
  }

  success(message?: string, ...optionalParams: any[]) {
    console.log("✅", green(message), ...optionalParams);
  }

  error(message?: string, ...optionalParams: any[]) {
    console.log("🚨", red(message), ...optionalParams);
  }
}
