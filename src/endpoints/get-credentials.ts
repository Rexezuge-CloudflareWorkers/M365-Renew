import { IAPIRoute, IRequest, IResponse, IEnv, APIContext } from './IAPIRoute';
import { decryptData } from '@/crypto/aes-gcm';
import { UserDAO } from '@/dao';
import { InternalServerError, BadRequestError } from '@/error';
import { VoidUtil } from '@/utils';

interface GetCredentialsRequest extends IRequest {
  user_id: string;
}

interface GetCredentialsResponse extends IResponse {
  email_address: string;
  password: string;
  totp_key: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface GetCredentialsEnv extends IEnv {}

export class GetCredentialsRoute extends IAPIRoute<GetCredentialsRequest, GetCredentialsResponse, GetCredentialsEnv> {
  schema = {
    tags: ['Internal'],
    summary: 'Get User Credentials',
    description: 'Internal route to decrypt and return user credentials',
    parameters: [
      {
        name: 'user_id',
        in: 'path' as const,
        description: 'User ID to retrieve credentials for',
        required: true,
        schema: { type: 'string' as const },
      },
    ],
    responses: {
      '200': {
        description: 'Credentials retrieved successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object' as const,
              properties: {
                email_address: { type: 'string' as const },
                password: { type: 'string' as const },
                totp_key: { type: 'string' as const },
              },
            },
          },
        },
      },
    },
  };

  async handle(c: APIContext<GetCredentialsEnv>) {
    const user_id = c.req.param('user_id');
    const request: GetCredentialsRequest = { user_id };

    try {
      const response = await this.handleRequest(request, c.env as Env, c);
      return c.json(response);
    } catch (error: unknown) {
      if (error instanceof BadRequestError && error.message.includes('User not found')) {
        return c.json({ Exception: { Type: 'NotFound', Message: 'User not found' } }, 404);
      }
      throw error;
    }
  }

  protected async handleRequest(
    request: GetCredentialsRequest,
    env: Env,
    cxt: APIContext<GetCredentialsEnv>,
  ): Promise<GetCredentialsResponse> {
    VoidUtil.void(cxt);
    const key = await env.AES_ENCRYPTION_KEY_SECRET.get();
    if (!key) {
      throw new InternalServerError('AES key not found. Please generate a key first.');
    }

    const userDAO = new UserDAO(env.DB);
    const user = await userDAO.getUserById(parseInt(request.user_id));

    if (!user) {
      throw new BadRequestError('User not found');
    }

    const email_address = await decryptData(user.encryptedEmailAddress, user.salt, key);
    const password = await decryptData(user.encryptedPassword, user.salt, key);
    const totp_key = await decryptData(user.encryptedTotpKey, user.salt, key);

    return {
      email_address,
      password,
      totp_key,
    };
  }
}
