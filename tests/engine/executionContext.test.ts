import { assert, equal } from "https://deno.land/std/testing/asserts.ts";
import { ExecutionContext } from '../../engine/executionContext.ts';
import { Variable } from '../../engine/variable.ts';
import { BaseNode } from '../../models/baseNode.ts';
import { NodeExecutionResult } from '../../models/nodeExecutionResult.ts';
import { HookConnection } from '../../models/connection.ts';

class TestNode extends BaseNode {
  public async execute(
    _: ExecutionContext,
  ): Promise<NodeExecutionResult> {
    return new NodeExecutionResult(false, 'Not Implemented.');
  }
}

Deno.test({
  name: 'Execution Context should return null when no global variable is found',
  fn(): void {
    const testExecutionContext = new ExecutionContext([], []);

    equal(testExecutionContext.getGlobalVariable('not-present'), null);
  },
});

Deno.test({
  name: 'Execution Context should not return null when global variable is found',
  fn(): void {
    const testExecutionContext = new ExecutionContext([], []);
    testExecutionContext.setGlobalVariable(new Variable('present', 'number', 123));
    const returned = testExecutionContext.getGlobalVariable('present') as Variable;

    assert(returned !== null);
    equal(returned.name, 'present');
    equal(returned.type, 'number');
    equal(returned.value, 123);
  },
});

Deno.test({
  name: 'Execution Context should return null when hook input hook is not found',
  fn(): void {
    const testNode = new TestNode('123-456');
    const testExecutionContext = new ExecutionContext([], []);

    equal(testExecutionContext.getInputDataForHook(testNode, 'not-present-hook'), null);
  },
});

Deno.test({
  name: 'Execution Context should return data when hook input hook is found',
  fn(): void {
    const startNode = new TestNode('123-456');
    const endNode = new TestNode('456-789');
    startNode.setHookDataByIdentifier('some-number-output', 123);
    const hookConnection = new HookConnection(
      startNode.id,
      endNode.id,
      'some-number-output',
      'some-number-input',
      'number',
    );
    const testExecutionContext = new ExecutionContext(
      [startNode, endNode],
      [hookConnection],
    );

    const result = testExecutionContext.getInputDataForHook(endNode, 'some-number-input') as Variable;

    assert(result !== null);
    equal(result.name, 'some-number-input');
    equal(result.type, 'number');
    equal(result.value, 123);
  },
});
