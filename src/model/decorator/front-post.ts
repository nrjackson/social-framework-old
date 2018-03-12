import { injectable } from 'inversify';

import { IUser } from '../user';
import { IPost, Post } from '../post';

export interface IFrontPost extends IPost {
  numLikes: number;
  tags: string[];
  creator: IUser;
}

@injectable()
export class FrontPost extends Post {
  public tags: string[];
  public numLikes: number;
  public creator: IUser;

  constructor (post: IPost) {
    super();
    this.id = post.id;
    this.title = post.title;
    this.body = post.body;
    this.createdAt = post.createdAt;
  }
}
