import {
  controller, httpGet, httpPost, httpPut, httpDelete
} from 'inversify-express-utils';
import { inject } from 'inversify';
import { Request, Response, NextFunction } from 'express';
import { IComment } from '../model/comment';
import { AuthService } from '../service/auth-service';
import { ICommentService } from '../service/comment-service';
import TYPES from '../constant/types';
import { ILiked } from '../model/social';
import { IUser } from '../model/user';

@controller('/comments')
export class CommentController {

  constructor(
    @inject(TYPES.ICommentService) private commentService: ICommentService,
    @inject(TYPES.AuthService) private authService: AuthService
  ) { }

  @httpGet('/')
  public getComments(): Promise<IComment[]> {
    return this.commentService.getComments();
  }

  @httpGet('/:id')
  public getComment(request: Request): Promise<IComment> {
    return this.commentService.getComment(request.params.id);
  }

  private withUserAndComment(req: Request, res: Response, next: NextFunction, result: (error, user: IUser, comment: IComment) => void): void {
    this.authService.authenticate(req, res, next).then((currUser) => {
      if(!currUser) {
        return result('Could not find authenticated user', null, null);
      }
      // console.log('params: %j', req.params);
      console.log('retrieving comment with id: ' + req.params.id);
      this.commentService.getComment(req.params.id).then((theComment) => {
        if(!theComment) {
          return result('Post not found', null, null);
        }
        return result(null, currUser, theComment);
      });
    });
  }

  @httpPost('/:id/likes/')
  public likeComment(req: Request, res: Response, next: NextFunction): Promise<ILiked> {
    return new Promise<ILiked>((resolve, reject) => {
      this.withUserAndComment(req, res, next, (error, currUser: IUser, theComment: IComment) => {
        console.log('retrieved comment: %j', theComment);
        this.commentService.like(theComment, currUser).then((likedComment) => {
          return resolve(likedComment);
        }).catch((err) => {
          console.log('newComment: Error liking comment: ' + err);
          return reject(err);
        });
      });
    });
  }

  @httpDelete('/:id/likes/')
  public unlikeComment(req: Request, res: Response, next: NextFunction): Promise<ILiked> {
    return new Promise<ILiked>((resolve, reject) => {
      this.withUserAndComment(req, res, next, (error, currUser: IUser, theComment: IComment) => {
        console.log('retrieved comment: %j', theComment);
        this.commentService.unlike(theComment, currUser).then((unlikedComment) => {
          return resolve(unlikedComment);
        }).catch((err) => {
          console.log('newComment: Error liking comment: ' + err);
          return reject(err);
        });
      });
    });
  }

  @httpPost('/:id/comments/')
  public addComment(req: Request, res: Response, next: NextFunction): Promise<IComment> {
    return new Promise<IComment>((resolve, reject) => {
      this.withUserAndComment(req, res, next, (error, currUser: IUser, theComment: IComment) => {
        console.log('retrieved comment: %j', theComment);
        this.commentService.addComment(req.body.comment, theComment, currUser).then((likedComment) => {
          return resolve(likedComment);
        }).catch((err) => {
          console.log('newComment: Error adding comment: ' + err);
          return reject(err);
        });
      });
    });
  }

  @httpPut('/:id')
  public updateComment(request: Request): Promise<IComment> {
    return this.commentService.updateComment(request.params.id, request.body);
  }

  @httpDelete('/:id')
  public deleteComment(request: Request): Promise<any> {
    return this.commentService.deleteComment(request.params.id);
  }
}
