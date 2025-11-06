import { OpenAPIRoute } from 'chanfana';
import { Context } from 'hono';
import { decryptData } from '../crypto/aes-gcm';
import { Env } from '../interfaces';
import { UserDAO } from '../dao';

export class GetCredentialsRoute extends OpenAPIRoute {
  schema = {
    tags: ['Internal'],
    summary: 'Get User Credentials',
    description: 'Internal route to decrypt and return user credentials',
    parameters: [
      {
        name: 'user_id',
        in: 'path',
        description: 'User ID to retrieve credentials for',
        required: true,
        schema: { type: 'string' },
      },
    ],
    responses: {
      '200': {
        description: 'Credentials retrieved successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                email_address: { type: 'string' },
                password: { type: 'string' },
                totp_key: { type: 'string' },
              },
            },
          },
        },
      },
      '404': {
        description: 'User not found',
      },
    },
  };

  async handle(c: Context<{ Bindings: Env }>) {
    const { user_id } = c.req.param();

    const key = await c.env.AES_ENCRYPTION_KEY_SECRET.get();
    if (!key) {
      return c.json({ error: 'AES key not found. Please generate a key first.' }, 500);
    }

    const userDAO = new UserDAO(c.env.DB);
    const user = await userDAO.getUserById(parseInt(user_id));

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    const email_address = await decryptData(user.encryptedEmailAddress, user.salt, key);
    const password = await decryptData(user.encryptedPassword, user.salt, key);
    const totp_key = await decryptData(user.encryptedTotpKey, user.salt, key);

    return c.json({
      email_address,
      password,
      totp_key,
    });
  }
}
