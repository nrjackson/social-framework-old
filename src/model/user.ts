import { injectable } from 'inversify';

import { IModel, Model } from './model';

export interface IUser extends IModel {
  email: string;
  name: string;
  username: string;
  registeredAt: string;
  token: string;
}

@injectable()
export class User extends Model implements IUser {
  public email: string;
  public name: string;
  public username: string;
  public registeredAt: string;
  public token: string;
}
