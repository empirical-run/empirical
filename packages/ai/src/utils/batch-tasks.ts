import crypto from "crypto";

type Task = {
  id: string;
  resolve?: (value: unknown) => void;
  reject?: (value: unknown) => void;
  promise?: Promise<unknown>;
};

export class BatchTaskManager {
  private tasksInProgress: string[] = [];
  private tasksInQueue: Task[] = [];
  private isCoolOffPeriod = false;
  private tickerId: unknown = undefined;
  /**
   * Creates an instance of BatchTaskManager.
   * @param {number} size size of batch allowed to execute at a time
   * @param {number} [coolingPeriod=1000] cooling period time (in ms) after one batch is done executing
   * @memberof BatchTaskManager
   */
  constructor(
    private size: number,
    private coolingPeriod: number = 1000,
  ) {}

  get hasQueuedTasks(): boolean {
    return this.tasksInQueue.length > 0;
  }

  get hasInProgressTasks(): boolean {
    return this.tasksInProgress.length > 0;
  }

  private createTask() {
    const task: Task = {
      id: crypto.randomUUID(),
    };
    const promise = new Promise<unknown>((resolve, reject) => {
      task.resolve = resolve;
      task.reject = reject;
    });
    task.promise = promise;
    return task;
  }

  async waitForTurn(): Promise<{ executionDone: () => void }> {
    const task = this.createTask();
    this.tasksInQueue.push(task);
    this.startTicker();
    await task.promise;
    this.tasksInProgress.push(task.id);
    return {
      executionDone: () => {
        this.tasksInProgress = this.tasksInProgress.filter(
          (id) => id !== task.id,
        );
        if (!this.hasInProgressTasks) {
          this.isCoolOffPeriod = true;
          setTimeout(() => (this.isCoolOffPeriod = false), this.coolingPeriod);
        }
      },
    };
  }

  private startTicker() {
    if (!this.tickerId) {
      this.tickerId = setInterval(() => {
        if (!this.hasQueuedTasks) {
          clearInterval(this.tickerId as string);
          this.tickerId = undefined;
        } else if (
          this.hasQueuedTasks &&
          !this.hasInProgressTasks &&
          !this.isCoolOffPeriod
        ) {
          const batch = this.tasksInQueue.slice(0, this.size);
          batch.forEach((j) => j.resolve?.(""));
          this.tasksInQueue = this.tasksInQueue.slice(this.size);
        }
      }, 10);
    }
  }
}
