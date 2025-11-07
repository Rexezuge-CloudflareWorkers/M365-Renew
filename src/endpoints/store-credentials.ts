import { IAPIRoute, IRequest, IResponse, IEnv, APIContext } from './IAPIRoute';
import { encryptData } from '@/crypto/aes-gcm';
import { UserDAO } from '@/dao';
import { InternalServerError } from '@/error';
import { VoidUtil } from '@/utils';

interface StoreCredentialsRequest extends IRequest {
  email_address: string;
  password: string;
  totp_key: string;
}

interface StoreCredentialsResponse extends IResponse {
  success: boolean;
  user_id: number;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface StoreCredentialsEnv extends IEnv {}

export class StoreCredentialsRoute extends IAPIRoute<StoreCredentialsRequest, StoreCredentialsResponse, StoreCredentialsEnv> {
  schema = {
    tags: ['Credentials'],
    summary: 'Store User Credentials',
    description: 'Encrypts and stores user email, password, and TOTP key',
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object' as const,
            properties: {
              email_address: { type: 'string' as const, format: 'email' as const },
              password: { type: 'string' as const },
              totp_key: { type: 'string' as const },
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
              type: 'object' as const,
              properties: {
                success: { type: 'boolean' as const },
                user_id: { type: 'number' as const },
              },
            },
          },
        },
      },
    },
  };

  protected async handleRequest(
    request: StoreCredentialsRequest,
    env: Env,
    cxt: APIContext<StoreCredentialsEnv>,
  ): Promise<StoreCredentialsResponse> {
    VoidUtil.void(cxt);
    const key = await env.AES_ENCRYPTION_KEY_SECRET.get();
    if (!key) {
      throw new InternalServerError('AES key not found. Please generate a key first.');
    }

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ivBase64 = btoa(String.fromCharCode(...iv));

    const encryptedEmail = await encryptData(request.email_address, key, ivBase64);
    const encryptedPassword = await encryptData(request.password, key, ivBase64);
    const encryptedTotpKey = await encryptData(request.totp_key, key, ivBase64);

    const userDAO = new UserDAO(env.DB);
    const userId = await userDAO.createUser(encryptedEmail.encrypted, encryptedPassword.encrypted, encryptedTotpKey.encrypted, ivBase64);

    return {
      success: true,
      user_id: userId,
    };
  }
}
