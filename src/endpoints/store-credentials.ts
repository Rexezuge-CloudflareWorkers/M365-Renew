import { OpenAPIRoute } from 'chanfana';
import { Context } from 'hono';
import { encryptData } from '../crypto/aes-gcm';
import { Env } from '../interfaces';
import { UserDAO } from '../dao';

export class StoreCredentialsRoute extends OpenAPIRoute {
  schema = {
    tags: ['Credentials'],
    summary: 'Store User Credentials',
    description: 'Encrypts and stores user email, password, and TOTP key',
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              email_address: { type: 'string', format: 'email' },
              password: { type: 'string' },
              totp_key: { type: 'string' },
            },
            required: ['email_address', 'password', 'totp_key'],
          },
        },
      },
    },
    responses: {
      '200': {
        description: 'Credentials stored successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean' },
                user_id: { type: 'number' },
              },
            },
          },
        },
      },
    },
  };

  async handle(c: Context<{ Bindings: Env }>) {
    const { email_address, password, totp_key } = await c.req.json();

    const key = await c.env.AES_ENCRYPTION_KEY_SECRET.get();
    if (!key) {
      return c.json({ error: 'AES key not found. Please generate a key first.' }, 500);
    }

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ivBase64 = btoa(String.fromCharCode(...iv));

    const encryptedEmail = await encryptData(email_address, key, ivBase64);
    const encryptedPassword = await encryptData(password, key, ivBase64);
    const encryptedTotpKey = await encryptData(totp_key, key, ivBase64);

    const userDAO = new UserDAO(c.env.DB);
    const userId = await userDAO.createUser(encryptedEmail.encrypted, encryptedPassword.encrypted, encryptedTotpKey.encrypted, ivBase64);

    return c.json({
      success: true,
      user_id: userId,
    });
  }
}
