interface User {
  userId: number;
  encryptedEmailAddress: string;
  encryptedPassword: string;
  encryptedTotpKey: string;
  salt: string;
  status: 'active' | 'disabled' | 'locked';
  createdAt: string;
  updatedAt: string;
}

interface UserInternal {
  user_id: number;
  encrypted_email_address: string;
  encrypted_password: string;
  encrypted_totp_key: string;
  salt: string;
  status: 'active' | 'disabled' | 'locked';
  created_at: string;
  updated_at: string;
}

export type { User, UserInternal };
