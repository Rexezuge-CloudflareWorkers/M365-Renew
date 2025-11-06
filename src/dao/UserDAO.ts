import { User, UserInternal } from '../model';

class UserDAO {
  protected readonly database: D1Database;

  constructor(database: D1Database) {
    this.database = database;
  }

  public async getUserById(userId: number): Promise<User | null> {
    const result: UserInternal | null = await this.database
      .prepare(`SELECT * FROM users WHERE user_id = ? LIMIT 1`)
      .bind(userId)
      .first<UserInternal>();

    if (!result) {
      return null;
    }

    return {
      userId: result.user_id,
      encryptedEmailAddress: result.encrypted_email_address,
      encryptedPassword: result.encrypted_password,
      encryptedTotpKey: result.encrypted_totp_key,
      salt: result.salt,
      status: result.status,
      createdAt: result.created_at,
      updatedAt: result.updated_at,
    };
  }

  public async createUser(
    encryptedEmailAddress: string,
    encryptedPassword: string,
    encryptedTotpKey: string,
    salt: string,
  ): Promise<number> {
    const result = await this.database
      .prepare(
        `INSERT INTO users (encrypted_email_address, encrypted_password, encrypted_totp_key, salt)
         VALUES (?, ?, ?, ?)`,
      )
      .bind(encryptedEmailAddress, encryptedPassword, encryptedTotpKey, salt)
      .run();

    return result.meta.last_row_id as number;
  }

  public async updateUserStatus(userId: number, status: 'active' | 'disabled' | 'locked'): Promise<void> {
    await this.database
      .prepare(`UPDATE users SET status = ?, updated_at = datetime('now') WHERE user_id = ?`)
      .bind(status, userId)
      .run();
  }
}

export { UserDAO };
