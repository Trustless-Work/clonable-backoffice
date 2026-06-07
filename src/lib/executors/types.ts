export interface ExecutionResult {
  hash: string;
  status: "SUCCESS" | "ERROR";
  explorerLink?: string;
  error?: string;
}

export interface ExecutionMetadata {
  contractId?: string;
}

export interface TransactionExecutor {
  execute(unsignedXdr: string, metadata?: ExecutionMetadata): Promise<ExecutionResult>;
}
