import { injectable } from 'inversify';

import { IModel, Model } from './model';
import { IUser } from './user';

export interface IConvo extends IModel {
  title: string;
  body: string;
  creator: IUser;
}

@injectable()
export class Convo extends Model implements IConvo {
  public title: string;
  public body: string;
  public creator: IUser;

  constructor(
  ) {
    super();
  }
}
