import { inject, injectable } from 'inversify';
import TYPES from '../constant/types';
import { IUser } from '../model/user';
import { IGraphModelService } from './graph-model-service';
import { IModel } from '../model/model';
import { Config } from '../constant/config';
import { ITag } from '../model/tag';

export interface ISocialService<ModelType extends IModel> {
  getTags(tagged: ModelType): Promise<string[]>;
  countLikes(liked: ModelType, liker: IUser): Promise<number>;
  like(liked: ModelType, liker: IUser): Promise<ModelType>;
  unlike(unliked: ModelType, liker: IUser): Promise<ModelType>;
  follow(followed: ModelType, follower: IUser): Promise<ModelType>;
  unfollow(unfollowed: ModelType, follower: IUser): Promise<ModelType>;
}

/*
 * Decorator pattern for the model service - exposes methods specific to Liked model
 */
@injectable()
export class SocialService<ModelType extends IModel> implements ISocialService<ModelType> {
  protected modelService: IGraphModelService;

  constructor(
    @inject(TYPES.IModelService) modelService: IGraphModelService
  ) {
    this.modelService = modelService;
  }

  public getTags(tagged: ModelType): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
      this.modelService.findRelatedFrom<ITag>(tagged, Config.RELATION_TAG).then((tags:ITag[]) => {

      });
    });
  }

  public countLikes(liked: ModelType, liker: IUser): Promise<number> {
    return this.modelService.countRelatedTo(liked, Config.RELATION_LIKE);
  }

  public like(liked: ModelType, liker: IUser): Promise<ModelType> {
    console.log('like liked...');
    return new Promise<ModelType>((resolve, reject) => {
      this.modelService.relate(liker, Config.RELATION_LIKE, liked).then(() => {
        return resolve(liked);
      }).catch((err) => {
        console.log('Error liking: ' + err);
        return reject(err);
      });
    });
  }

  public unlike(unliked: ModelType, liker: IUser): Promise<ModelType> {
    console.log('unlike unliked...');
    return new Promise<ModelType>((resolve, reject) => {
      this.modelService.unrelate(liker, Config.RELATION_LIKE, unliked).then(() => {
        return resolve(unliked);
      }).catch((err) => {
        console.log('Error unliking: ' + err);
        return reject(err);
      });
    });
  }

  public follow(followed: ModelType, follower: IUser): Promise<ModelType> {
    // console.log('like liked...');
    return new Promise<ModelType>((resolve, reject) => {
      this.modelService.relate(follower, Config.RELATION_FOLLOW, followed).then(() => {
        return resolve(followed);
      }).catch((err) => {
        console.log('Error unfollowing: ' + err);
        return reject(err);
      });
    });
  }

  public unfollow(unfollowed: ModelType, follower: IUser): Promise<ModelType> {
    // console.log('like liked...');
    return new Promise<ModelType>((resolve, reject) => {
      this.modelService.relate(follower, Config.RELATION_FOLLOW, unfollowed).then(() => {
        return resolve(unfollowed);
      }).catch((err) => {
        console.log('Error unfollowing: ' + err);
        return reject(err);
      });
    });
  }
}
