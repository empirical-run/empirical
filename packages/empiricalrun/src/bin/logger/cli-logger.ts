import cliProgress from "cli-progress";
import { cyan, yellow, red, green } from "picocolors";

const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;

export const buildSuccessLog = (str: string) => `${green("[SUCCESS]")} ${str}`;
export const buildWarningLog = (str: string) => `${yellow("[WARN]")} ${str}`;
export const buildErrorLog = (str: string) => `${red("[ERROR]")} ${str}`;
export const buildLog = (str: string) => `${cyan("[LOG]")} ${str}`;

function enableLoggerWithProgressbar(pb: cliProgress.MultiBar) {
  global.console.log = (str: string) => {
    pb.log(`${buildLog(str)}\n`);
    pb.update();
  };

  global.console.warn = (str: string) => {
    pb.log(`${buildWarningLog(str)}\n`);
    pb.update();
  };

  global.console.error = (str: string) => {
    pb.log(`${buildErrorLog(str)}\n`);
    pb.update();
  };
}

function disableLoggerWithProgressbar() {
  global.console.log = originalLog;
  global.console.warn = originalWarn;
  global.console.error = originalError;
}

export function getCliProgressLoggerInstance(): cliProgress.MultiBar {
  const instance = new cliProgress.MultiBar(
    {
      clearOnComplete: true,
      hideCursor: true,
      forceRedraw: true,
      format: "{name} {bar} {percentage}% | {value}/{total} | ETA: {eta}s",
      barCompleteChar: "\u2588",
      barIncompleteChar: "\u2591",
      stopOnComplete: true,
    },
    cliProgress.Presets.shades_grey,
  );
  enableLoggerWithProgressbar(instance);
  const originalStopMethod = instance.stop;
  instance.stop = () => {
    disableLoggerWithProgressbar();
    return originalStopMethod.call(instance);
  };
  return instance;
}

export type ProgressBar = cliProgress.SingleBar;
