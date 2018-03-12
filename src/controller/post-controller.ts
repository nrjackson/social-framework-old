import {
  controller, httpGet, httpPost, httpPut, httpDelete
} from 'inversify-express-utils';
import { inject } from 'inversify';
import { Request, Response, NextFunction } from 'express';
import { IPost } from '../model/post';
import { AuthService } from '../service/auth-service';
import { IPostService } from '../service/post-service';
import TYPES from '../constant/types';
import { IComment } from '../model/comment';
import { ILiked } from '../model/social';
// import { IFrontPost, FrontPost } from '../model/decorator/front-post';
import { ICommentService } from '../service/comment-service';
import { IUser } from '../model/user';

@controller('/posts')
export class PostController {

  constructor(
    @inject(TYPES.IPostService) private postService: IPostService,
    @inject(TYPES.ICommentService) private commentService: ICommentService,
    @inject(TYPES.AuthService) private authService: AuthService
  ) { }
/*
  public decoratePost(post: IPost): Promise<IFrontPost> {
    let frontPost = new FrontPost(post);
    this.postService.
    return this.postService.updatePost(request.params.id, request.body);
  }
*/

  @httpGet('/')
  public getPosts(): Promise<IPost[]> {
    return this.postService.getPosts();
  }

  @httpGet('/:id')
  public getPost(request: Request): Promise<IPost> {
    return this.postService.getPost(request.params.id);
  }

  private withUserAndPost(req: Request, res: Response, next: NextFunction, result: (error, user: IUser, post: IPost) => void): void {
    this.authService.authenticate(req, res, next).then((currUser) => {
      if(!currUser) {
        return result('Could not find authenticated user', null, null);
      }
      // console.log('params: %j', req.params);
      console.log('retrieving post with id: ' + req.params.id);
      this.postService.getPost(req.params.id).then((thePost) => {
        if(!thePost) {
          return result('Post not found', null, null);
        }
        return result(null, currUser, thePost);
      });
    });
  }

  @httpPost('/:id/likes/')
  public likePost(req: Request, res: Response, next: NextFunction): Promise<ILiked> {
    return new Promise<ILiked>((resolve, reject) => {
      this.withUserAndPost(req, res, next, (error, currUser: IUser, thePost: IPost) => {
        console.log('retrieved post: %j', thePost);
        this.postService.like(thePost, currUser).then((likedPost) => {
          return resolve(likedPost);
        }).catch((err) => {
          console.log('newPost: Error liking post: ' + err);
          return reject(err);
        });
      });
    });
  }

  @httpDelete('/:id/likes/')
  public unlikePost(req: Request, res: Response, next: NextFunction): Promise<ILiked> {
    return new Promise<ILiked>((resolve, reject) => {
      this.withUserAndPost(req, res, next, (error, currUser: IUser, thePost: IPost) => {
        console.log('retrieved post: %j', thePost);
        this.postService.unlike(thePost, currUser).then((likedPost) => {
          return resolve(likedPost);
        }).catch((err) => {
          console.log('newPost: Error liking post: ' + err);
          return reject(err);
        });
      });
    });
  }

  @httpPost('/:id/comments/')
  public addComment(req: Request, res: Response, next: NextFunction): Promise<IComment> {
    return new Promise<IComment>((resolve, reject) => {
      this.withUserAndPost(req, res, next, (error, currUser: IUser, thePost: IPost) => {
        console.log('retrieved post: %j', thePost);
        this.commentService.addComment(req.body.comment, thePost, currUser).then((newComment:IComment) => {
          newComment.creator = currUser;
          return resolve(newComment);
        }).catch((err) => {
          console.log('addComment: Error commenting post: ' + err);
          return reject(err);
        });
      });
    });
  }

  @httpPost('/')
  public newPost(req: Request, res: Response, next: NextFunction): Promise<IPost> {
    return new Promise<IPost>((resolve, reject) => {
      this.authService.authenticate(req, res, next).then((currUser) => {
        this.postService.newPost(req.body.post, currUser, req.body.tags).then((newPost) => {
          return resolve(newPost);
        }).catch((err) => {
          console.log('newPost: Error adding post: ' + err);
          return reject(err);
        });
      }).catch((err) => {
        console.log('newPost: Error authenticating: ' + err);
        return reject(err);
      });
    });
  }

  @httpPut('/:id')
  public updatePost(request: Request): Promise<IPost> {
    return this.postService.updatePost(request.params.id, request.body);
  }

  @httpDelete('/:id')
  public deletePost(request: Request): Promise<any> {
    return this.postService.deletePost(request.params.id);
  }
}
