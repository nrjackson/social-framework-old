import { injectable } from 'inversify';

import { IUser, User } from './user';

export interface IFacebookUser extends IUser {
  facebookId: string;
  facebookToken: string;
  facebookEmail: string;
  facebookName: string;
}

@injectable()
export class FacebookUser extends User implements IFacebookUser {
  public facebookId: string;
  public facebookToken: string;
  public facebookEmail: string;
  public facebookName: string;
}
