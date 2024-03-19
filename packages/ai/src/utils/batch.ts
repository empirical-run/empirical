import crypto from "crypto";

type Job = {
  id: string;
  resolve?: (value: unknown) => void;
  reject?: (value: unknown) => void;
  promise?: Promise<unknown>;
};

export class Batch {
  private jobInProgress: string[] = [];
  private jobQueue: Job[] = [];
  private waitForTimeout = false;
  private tickerId: unknown = undefined;
  constructor(
    private size: number,
    private coolingPeriod: number,
  ) {}

  private createJob() {
    const job: Job = {
      id: crypto.randomUUID(),
    };
    const promise = new Promise<unknown>((resolve, reject) => {
      job.resolve = resolve;
      job.reject = reject;
    });
    job.promise = promise;
    return job;
  }

  async waitForTurn(): Promise<{ executionDone: () => void }> {
    const job = this.createJob();
    this.jobQueue.push(job);
    this.startTicker();
    await job.promise;
    this.jobInProgress.push(job.id);
    return {
      executionDone: () => {
        this.jobInProgress = this.jobInProgress.filter((id) => id !== job.id);
        if (this.jobInProgress.length === 0) {
          this.waitForTimeout = true;
          setTimeout(() => (this.waitForTimeout = false), this.coolingPeriod);
        }
      },
    };
  }

  private startTicker() {
    if (!this.tickerId) {
      this.tickerId = setInterval(() => {
        if (this.jobQueue.length === 0) {
          clearInterval(this.tickerId as string);
        } else if (
          this.jobQueue.length > 0 &&
          this.jobInProgress.length === 0 &&
          !this.waitForTimeout
        ) {
          const batch = this.jobQueue.slice(0, this.size);
          batch.forEach((j) => j.resolve?.(""));
          this.jobQueue = this.jobQueue.slice(this.size);
        }
      }, 10);
    }
  }
}
