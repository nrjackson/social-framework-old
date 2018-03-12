import {
  controller, httpGet, httpPost, httpPut, httpDelete
} from 'inversify-express-utils';
import { inject } from 'inversify';
import { Request, Response, NextFunction } from 'express';
import { IUser } from '../model/user';
import { IUserService } from '../service/user-service';
import TYPES from '../constant/types';
import { AuthService } from '../service/auth-service';

@controller('/user')
export class UserController {

  constructor(
    @inject(TYPES.IUserService) private userService: IUserService,
    @inject(TYPES.AuthService) private authService: AuthService
  ) { }

  @httpGet('/')
  public getUsers(): Promise<IUser[]> {
    return this.userService.getUsers();
  }

  @httpGet('/:id')
  public getUser(request: Request): Promise<IUser> {
    return this.userService.getUser(request.params.id);
  }

  private withCurrentUserAndUser(req: Request, res: Response, next: NextFunction, result: (error, currUser: IUser, user: IUser) => void): void {
    this.authService.authenticate(req, res, next).then((currUser) => {
      if(!currUser) {
        return result('Could not find authenticated user', null, null);
      }
      // console.log('params: %j', req.params);
      console.log('retrieving user with id: ' + req.params.id);
      this.userService.getUser(req.params.id).then((theUser) => {
        if(!theUser) {
          return result('User not found', null, null);
        }
        return result(null, currUser, theUser);
      });
    });
  }

  @httpPost('/')
  public newUser(request: Request): Promise<IUser> {
    return this.userService.newUser(request.body);
  }

  @httpPut('/:id')
  public updateUser(request: Request): Promise<IUser> {
    return this.userService.updateUser(request.params.id, request.body);
  }

  @httpDelete('/:id')
  public deleteUser(request: Request): Promise<any> {
    return this.userService.deleteUser(request.params.id);
  }

  @httpPost('/:id/followers/')
  public followUser(req: Request, res: Response, next: NextFunction): Promise<IUser> {
    return new Promise<IUser>((resolve, reject) => {
      this.withCurrentUserAndUser(req, res, next, (error, currUser: IUser, theUser: IUser) => {
        console.log('retrieved user: %j', theUser);
        this.userService.follow(theUser, currUser).then((followedUser) => {
          return resolve(followedUser);
        }).catch((err) => {
          console.log('followUser: Error following user: ' + err);
          return reject(err);
        });
      });
    });
  }

  @httpDelete('/:id/followers/')
  public unfollowUser(req: Request, res: Response, next: NextFunction): Promise<IUser> {
    return new Promise<IUser>((resolve, reject) => {
      this.withCurrentUserAndUser(req, res, next, (error, currUser: IUser, theUser: IUser) => {
        console.log('retrieved user: %j', theUser);
        this.userService.unfollow(theUser, currUser).then((unfollowedUser) => {
          return resolve(unfollowedUser);
        }).catch((err) => {
          console.log('followUser: Error unfollowing user: ' + err);
          return reject(err);
        });
      });
    });
  }
}
