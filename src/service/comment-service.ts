import { injectable, postConstruct } from 'inversify';
import { Config } from '../constant/config';
import { IComment } from '../model/comment';
import { IModel } from '../model/model';
import { IUser } from '../model/user';
import { ISocialModelService, SocialModelService } from './social-model-service';

export interface ICommentService extends ISocialModelService<IComment> {
  addComment(comment: IComment, commentedModel: IModel, commenter: IUser): Promise<IComment>;
  getComments(): Promise<IComment[]>;
  getComment(id: number): Promise<IComment>;
  updateComment(id: string, comment: IComment): Promise<IComment>;
  deleteComment(id: string): Promise<any>;
}

/*
 * Decorator pattern for the model service - exposes methods specific to Comment model
 */
@injectable()
export class CommentService extends SocialModelService<IComment> implements ICommentService {
  @postConstruct()
  public initialize() {
      this.modelName = 'Comment';
  }

  public addComment(comment: IComment, commentedModel: IModel, commenter: IUser): Promise<IComment> {
    return new Promise<IComment>((resolve, reject) => {
      this.createModelWithCreator(comment, commenter).then((newComment) => {
        console.log('Created comment: %j', newComment);
        console.log('Relating comment to model: %j', commentedModel);
        this.relate(commentedModel, Config.RELATION_COMMENT, newComment).then(() => {
          console.log('Done relating comment to model');
          return resolve(newComment);
        }).catch((err) => {
          console.log('Error relating comment: ' + err);
          return reject(err);
        });
      }).catch((err) => {
        console.log('Error creating comment: ' + err);
        return reject(err);
      });
    });
  }

  public getComments(): Promise<IComment[]> {
    return this.getAll();
  }

  public getComment(id: number): Promise<IComment> {
    return this.getModel(id);
  }

  public updateComment(id: string, comment: IComment): Promise<IComment> {
    return this.updateModel(id, comment);
  }

  public deleteComment(id: string): Promise<any> {
    return this.deleteModel(id);
  }
}
