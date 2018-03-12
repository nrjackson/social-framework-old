import {
  controller, httpPost, httpGet/*, httpPut, httpDelete*/
} from 'inversify-express-utils';
import { inject } from 'inversify';
import { Request, Response, NextFunction } from 'express';
import { IUser } from '../model/user';
import { AuthService } from '../service/auth-service';
import TYPES from '../constant/types';

@controller('/auth')
export class AuthController {

  constructor( @inject(TYPES.AuthService) private authService: AuthService) { }

  @httpGet('/verify/')
  public authUser(req: Request, res: Response, next: NextFunction): Promise<IUser> {
    return this.authService.authenticate(req, res, next);
  }
/*
  @httpGet('/:id')
  public getUser(request: Request): Promise<User> {
    return this.userService.getUser(request.params.id);
  }
*/
  @httpPost('/login/')
  public login(req: Request, res: Response, next: NextFunction): Promise<IUser> { /* Promise<User> { */
    console.log('login...');
    // return this.authService.localSignup(request.body);
    return this.authService.localLogin(req, res, next);
  }
  @httpPost('/')
  public signup(req: Request, res: Response, next: NextFunction): Promise<IUser> { /* Promise<User> { */
    console.log('signup...');
    // return this.authService.localSignup(request.body);
    return this.authService.localSignup(req, res, next);
  }

  @httpGet('/facebook/')
  public facebookLogin(req: Request, res: Response, next: NextFunction): Promise<IUser> { /* Promise<User> { */
    console.log('facebook: headers = %j', req.headers);
    // return this.authService.localSignup(request.body);
    return this.authService.facebookTokenLogin(req, res, next);
  }
/*
  @httpPut('/:id')
  public updateUser(request: Request): Promise<User> {
    return this.userService.updateUser(request.params.id, request.body);
  }

  @httpDelete('/:id')
  public deleteUser(request: Request): Promise<any> {
    return this.userService.deleteUser(request.params.id);
  }
*/
}
