
export class NodeExecutionResult {
  constructor(
    public readonly success: boolean,
    public readonly error?: string,
  ) {}
}
