import { ExecutionContext } from "../engine/executionContext.ts";
import { NodeExecutionResult } from "./nodeExecutionResult.ts";

export abstract class BaseNode {

  private mSuccessful: boolean | undefined = undefined;

  private mError: string | undefined = undefined;

  constructor(
    public readonly id: string,
    private readonly hookData: any = {},
  ) {}

  public get hasRun(): boolean {
    return this.mSuccessful !== undefined;
  }

  public get successful(): boolean {
    if (this.mSuccessful === undefined) {
      return false;
    }
    return this.mSuccessful;
  }

  public set successful(success: boolean) {
    this.mSuccessful = success;
  }

  public set error(err: string | undefined) {
    this.mError = err;
  }

  public get error(): string | undefined {
    return this.mError;
  }

  public abstract async execute(
    executionContext: ExecutionContext,
  ): Promise<NodeExecutionResult>;

  public getHookDataByIdentifier(identifier: string, index?: number): any | null {
    const data = this.hookData[identifier];
    if (!data) {
      return null;
    }
    if (index !== undefined && !Array.isArray(data)) {
      throw new Error('An index was provided but the data is not an array.');
    }
    return index ? data[index] : data;
  }

  public setHookDataByIdentifier(identifier: string, data: any, index?: number): void {
    if (index) {
      this.hookData[identifier][index] = data;
    } else {
      this.hookData[identifier] = data;
    }
  }

}
