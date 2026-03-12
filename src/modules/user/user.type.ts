import { User } from '../../generated/prisma/client';

export type PublicUser = Omit<User, 'password'>;

export type AuthUser = Pick<User, 'id' | 'email' | 'password'>;
