import { injectable } from 'inversify';

import { IUser, User } from './user';

export interface ILocalUser extends IUser {
  localEmail: string;
  localPassword: string;
}

@injectable()
export class LocalUser extends User implements ILocalUser {
  public localEmail: string;
  public localPassword: string;
}
