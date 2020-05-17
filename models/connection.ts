
export class Connection {
  constructor(
    public readonly fromId: string,
    public readonly toId: string,
  ) {}
}

export class HookConnection extends Connection {
  constructor(
    public readonly fromId: string,
    public readonly toId: string,
    public readonly fromHookId?: string,
    public readonly toHookId?: string,
    public readonly hookDataType?: string,
    public readonly fromHookIndex?: number,
    public readonly toHookIndex?: number,
  ) {
    super(fromId, toId);
  }
}
