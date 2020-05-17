import { Variable } from "./variable.ts";
import { BaseNode } from "../models/baseNode.ts";
import { HookConnection } from "../models/connection.ts";

export class ExecutionContext {
  // Name, Type, Value
  private globalVariables: Array<[string, string, any]> = [];

  private phaseCounter = 0;

  constructor(
    private readonly nodes: BaseNode[],
    private readonly hookConnections: HookConnection[],
  ) {}

  public get phasesRun(): number {
    return this.phaseCounter;
  }

  public getGlobalVariable(name: string): Variable | null {
    const variable = this.globalVariables.find((variable) => variable[0] === name);

    if (variable) {
      return new Variable(variable[0], variable[1], variable[2]);
    }

    return null;
  }

  public setGlobalVariable(variable: Variable): void {
    const existing = this.globalVariables.find((v) => v[0] === variable.name);

    if (existing) {
      existing[1] = variable.type;
      existing[2] = variable.value;
    } else {
      this.globalVariables.push([
        variable.name,
        variable.type,
        variable.value,
      ]);
    }
  }

  public getInputDataForHook(node: BaseNode, hookIdentifier: string): Variable | null {
    // Get hook by name
    const hookConnection = this.hookConnections.find((connection) =>
      connection.toHookId === hookIdentifier
      && connection.toId === node.id);
    if (!hookConnection) {
      return null;
    }

    // Get hooks start node via connection
    const previousNodeHook = this.nodes.find((n) => n.id === hookConnection.fromId);
    if (!previousNodeHook) {
      return null;
    }

    // Get data from previous node
    //    - Consider indexed values, etc
    return new Variable(
      hookIdentifier,
      hookConnection.hookDataType as string,
      previousNodeHook.getHookDataByIdentifier(hookConnection.fromHookId as string),
    );
  }

  public increasePhaseCounter(): void {
    this.phaseCounter += 1;
  }
}
