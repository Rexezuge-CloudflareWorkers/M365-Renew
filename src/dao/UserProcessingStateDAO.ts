import { UserProcessingState, UserProcessingStateInternal } from '../model';

class UserProcessingStateDAO {
  protected readonly database: D1Database;

  constructor(database: D1Database) {
    this.database = database;
  }

  public async getStateByUserId(userId: number): Promise<UserProcessingState | null> {
    const result: UserProcessingStateInternal | null = await this.database
      .prepare(`SELECT * FROM user_processing_state WHERE user_id = ? LIMIT 1`)
      .bind(userId)
      .first<UserProcessingStateInternal>();

    if (!result) {
      return null;
    }

    return {
      userId: result.user_id,
      lastProcessedAt: result.last_processed_at,
      lastProcessStatus: result.last_process_status,
      lastMessage: result.last_message,
      updatedAt: result.updated_at,
    };
  }

  public async upsertState(
    userId: number,
    processStatus: 'success' | 'failure' | 'skipped',
    message?: string,
  ): Promise<void> {
    await this.database
      .prepare(
        `INSERT INTO user_processing_state (user_id, last_processed_at, last_process_status, last_message)
         VALUES (?, datetime('now'), ?, ?)
         ON CONFLICT(user_id) DO UPDATE SET
           last_processed_at = datetime('now'),
           last_process_status = excluded.last_process_status,
           last_message = excluded.last_message,
           updated_at = datetime('now')`,
      )
      .bind(userId, processStatus, message || null)
      .run();
  }
}

export { UserProcessingStateDAO };
