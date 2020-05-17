import { equal, assertThrows } from "https://deno.land/std/testing/asserts.ts";
import { BaseNode } from '../../models/baseNode.ts';
import { NodeExecutionResult } from '../../models/nodeExecutionResult.ts';
import { ExecutionContext } from '../../engine/executionContext.ts';

class TestNode extends BaseNode {
  public execute(
    _: ExecutionContext,
  ): NodeExecutionResult {
    return new NodeExecutionResult(false, 'Not Implemented.');
  }
}

Deno.test({
  name: 'Base Node should return has not run when success flag is not set',
  fn(): void {
    const testNode = new TestNode('123-456');
    equal(testNode.hasRun, false);
  },
});

Deno.test({
  name: 'Base Node should return null when hook data identifier is not set',
  fn(): void {
    const testNode = new TestNode('123-456');
    equal(testNode.getHookDataByIdentifier('not-present'), null);
  },
});

Deno.test({
  name: 'Base Node should return data when hook data identifier is set',
  fn(): void {
    const testNode = new TestNode('123-456');
    testNode.setHookDataByIdentifier('present', 123);
    equal(testNode.getHookDataByIdentifier('not-present'), 123);
  },
});

Deno.test({
  name: 'Base Node should throw error when hook data identifier is accessed by index when data is not an array',
  fn(): void {
    const testNode = new TestNode('123-456');
    testNode.setHookDataByIdentifier('present', 123);
    
    assertThrows(() => testNode.getHookDataByIdentifier('present', 1), undefined, 'An index was provided but the data is not an array.');
  },
});
