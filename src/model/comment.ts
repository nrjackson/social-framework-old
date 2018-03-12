import { injectable } from 'inversify';

import { IModel, Model } from './model';
import { IUser } from './user';
import { ILiked } from './social';

export interface IComment extends IModel, ILiked {
  title: string;
  body: string;
  creator: IUser;
}

@injectable()
export class Comment extends Model implements IComment {
  public title: string;
  public body: string;
  public numLikes: number;
  public creator: IUser;
}
