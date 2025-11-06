interface UserProcessingState {
  userId: number;
  lastProcessedAt?: string;
  lastProcessStatus?: 'success' | 'failure' | 'skipped';
  lastMessage?: string;
  updatedAt: string;
}

interface UserProcessingStateInternal {
  user_id: number;
  last_processed_at?: string;
  last_process_status?: 'success' | 'failure' | 'skipped';
  last_message?: string;
  updated_at: string;
}

export type { UserProcessingState, UserProcessingStateInternal };
