import { equal } from "https://deno.land/std/testing/asserts.ts";
import { ExecutionContext } from '../../engine/executionContext.ts';
import { BaseNode } from '../../models/baseNode.ts';
import { NodeExecutionResult } from '../../models/nodeExecutionResult.ts';
import { HookConnection, Connection } from '../../models/connection.ts';
import { Engine } from '../../engine/engine.ts';

class StartNode extends BaseNode {
  public execute(
    _: ExecutionContext,
  ): NodeExecutionResult {
    return new NodeExecutionResult(true);
  }
}

class StaticNumberNode extends BaseNode {
  public execute(
    _: ExecutionContext,
  ): NodeExecutionResult {
    return new NodeExecutionResult(true);
  }
}

class AddNumbersNode extends BaseNode {
  public execute(
    executionContext: ExecutionContext,
  ): NodeExecutionResult {
    const first = executionContext.getInputDataForHook(this, 'number-1-in');
    const second = executionContext.getInputDataForHook(this, 'number-2-in');
    if (first && second && first.type === 'number' && second.type === 'number') {
      this.setHookDataByIdentifier('number-out', first.value + second.value);
      return new NodeExecutionResult(true);
    }
    return new NodeExecutionResult(false, 'Two numbers are required to add.');
  }
}

Deno.test({
  name: 'Engine should add two numbers via input hooks',
  fn() : void {
    const startNode = new StartNode('start');
    const number1Node = new StaticNumberNode('123', { 'number-out': 5 });
    const number2Node = new StaticNumberNode('456', { 'number-out': 6 });
    const addNumbersNode = new AddNumbersNode('789');
    const logicConnection1 = new Connection(number1Node.id, addNumbersNode.id);
    const logicConnection2 = new Connection(number2Node.id, addNumbersNode.id);
    const logicConnection3 = new Connection(startNode.id, number1Node.id);
    const logicConnection4 = new Connection(startNode.id, number2Node.id);
    const number1ToAddHookConnection = new HookConnection(
      number1Node.id,
      addNumbersNode.id,
      'number-out',
      'number-1-in',
      'number',
    );
    const number2ToAddHookConnection = new HookConnection(
      number2Node.id,
      addNumbersNode.id,
      'number-out',
      'number-2-in',
      'number',
    );
    const engine = new Engine(
      [startNode, number1Node, number2Node, addNumbersNode],
      [logicConnection1, logicConnection2, logicConnection3, logicConnection4],
      [number1ToAddHookConnection, number2ToAddHookConnection],
    );
    engine.start('start');
    const r = addNumbersNode.getHookDataByIdentifier('number-out');
    equal(r, 11);
  },
});
