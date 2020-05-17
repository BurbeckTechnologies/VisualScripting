import { BaseNode } from "../models/baseNode.ts";
import { ExecutionContext } from "./executionContext.ts";
import { Connection, HookConnection } from "../models/connection.ts";

export class Engine {
  constructor(
    private readonly nodes: BaseNode[],
    private readonly logicConnections: Connection[],
    private readonly hookConnections: HookConnection[],
  ) {}

  public async start(startId: string): Promise<ExecutionContext> {
    const executionContext = new ExecutionContext(this.nodes, this.hookConnections);
    const startNode = this.findNodeById(startId);
    if (!startNode) {
      throw new Error('Unable to find start node by startId.');
    }
    const startNodeResult = await startNode.execute(executionContext);
    startNode.successful = startNodeResult.success;

    let nodesToExecute = this.getNextLogicNodes(startNode);
    let executableNodes = this.filterExecutableNodes(nodesToExecute);

    while (executableNodes.length > 0) {
      // Check if nodes have already executed
      const secondExecutionNodes = executableNodes.filter((node) => node.hasRun);
      if (secondExecutionNodes.length > 0) {
        throw new Error('Multiple execution of the same nodes is currently prohibited.');
      }

      // Execute nodes
      await this.executePhase(executionContext, executableNodes);

      executableNodes.forEach((node) => {
        // Remove Nodes whcih have executed
        const index = nodesToExecute.indexOf(node);
        nodesToExecute.splice(index, 1);

        // Get next logical nodes
        const nextNodes = this.getNextLogicNodes(node);
        nextNodes.forEach((nextNode) => {
          if (nodesToExecute.indexOf(nextNode) === -1) {
            nodesToExecute.push(nextNode);
          }
        });
      });

      // Calculate new executable nodes
      executableNodes = this.filterExecutableNodes(nodesToExecute);
    }

    return executionContext;
  }

  private async executePhase(executionContext: ExecutionContext, nodes: BaseNode[]): Promise<void> {
    executionContext.increasePhaseCounter();
    for (let i = 0; i < nodes.length; i++) {
      const r = await nodes[i].execute(executionContext);
      nodes[i].successful = r.success;
      nodes[i].error = r.error;
    }
  }

  private filterExecutableNodes(nodes: BaseNode[]): BaseNode[] {
    const canExecuteList: BaseNode[] = [];
    nodes.forEach((node) => {
      const previousNodes = this.getPreviousLogicNodes(node)
      const allExecuted = previousNodes.every((previousNode) => previousNode.hasRun);

      if (allExecuted) {
        canExecuteList.push(node);
      }
    });
    return canExecuteList;
  }

  private findNodeById(id: string): BaseNode {
    const node = this.nodes.find((node) => node.id === id);

    if (!node) {
      throw new Error('Unable to find node by Id');
    }

    return node;
  }

  private getNextLogicNodes(node: BaseNode): BaseNode[] {
    const ids = this.logicConnections.filter((connection) => connection.fromId === node.id);
    const r = ids.map((connection) => this.nodes.find((n) => n.id === connection.toId));

    if (r.indexOf(undefined) > -1) {
      throw new Error('Unable to find one or more nodes by Id');
    }

    return r as BaseNode[];
  }

  private getPreviousLogicNodes(node: BaseNode): BaseNode[] {
    const ids = this.logicConnections.filter((connection) => connection.toId === node.id);
    const r = ids.map((connection) => this.nodes.find((n) => n.id === connection.fromId));

    if (r.indexOf(undefined) > -1) {
      throw new Error('Unable to find one or more nodes by Id');
    }

    return r as BaseNode[];
  }
}
