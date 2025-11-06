interface UserProcessingLog {
  logId: number;
  userId: number;
  processedAt: string;
  processStatus: 'success' | 'failure' | 'skipped';
  message?: string;
  updatedAt: string;
}

interface UserProcessingLogInternal {
  log_id: number;
  user_id: number;
  processed_at: string;
  process_status: 'success' | 'failure' | 'skipped';
  message?: string;
  updated_at: string;
}

export type { UserProcessingLog, UserProcessingLogInternal };
