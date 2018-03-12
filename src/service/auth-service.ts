import { inject, injectable } from 'inversify';
import { Request, Response, NextFunction } from 'express';
import { IUser } from '../model/user';
import { ILocalUser } from '../model/user-local';
import { IFacebookUser } from '../model/user-facebook';
import TYPES from '../constant/types';
import { Utils } from '../utils/utils';

import * as passport from 'passport';
// import { IVerifyOptions } from "passport-local";
import { PassportStrategies } from './passport-strategies';

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

@injectable()
export class AuthService {
  constructor(
    @inject(TYPES.PassportStrategies) strategies: PassportStrategies
  ) {
    passport.use('auth-jwt', strategies.jwtStrategy);
    passport.use('local-login', strategies.localLoginStrategy);
    passport.use('local-signup', strategies.localSignupStrategy);
    passport.use('facebook-token', strategies.facebookTokenStrategy);
  }

    public localLogin(req: Request, res: Response, next: NextFunction): Promise<IUser> {
      console.log('using local-login...');
      return new Promise<IUser>((resolve, reject) => {
        return passport.authenticate('local-login', (err: Error, user: ILocalUser, info) => {
          if (err) { return reject(err); }
          if (!user) {
            return reject('User not found:' + err);
          } else {
            user.token = Utils.generateJWT(user);
            console.log('auth-service: created user');
            return resolve(user);
          }
        })(req, res, next);
     });
    };

    public localSignup(req: Request, res: Response, next: NextFunction): Promise<IUser> {
      console.log('using local-signup...');
      // return passport.authenticate('local-signup', callback);
      return new Promise<IUser>((resolve, reject) => {
        return passport.authenticate('local-signup', (err: Error, user: ILocalUser, info) => {
            if (err) { return reject(err); }
            if (!user) {
              return reject('User not created:' + err);
            } else {
              user.token = Utils.generateJWT(user);
              console.log('auth-service: created user');
              return resolve(user);
            }
          })(req, res, next);
       });
    }

    public facebookTokenLogin(req: Request, res: Response, next: NextFunction): Promise<IUser> {
      console.log('using facebook-token...');
      // return passport.authenticate('local-signup', callback);
      return new Promise<IUser>((resolve, reject) => {
        console.log('facebook-token Promise...');
        return passport.authenticate('facebook-token', (err: Error, user: IFacebookUser, info) => {
            if (err) { return reject(err); }
            if (!user) {
              return reject('User cannot be logged in or created:' + err);
            } else {
              user.token = Utils.generateJWT(user);
              console.log('auth-service: got facebook user');
              return resolve(user);
            }
          })(req, res, next);
       });
    }

    public authenticate = function(req: Request, res: Response, next: NextFunction): Promise<IUser> {
      return new Promise<IUser>((resolve, reject) => {
        return passport.authenticate('auth-jwt', (err: Error, user: IUser, info) => {
            if (err) { return reject(err); }
            if (!user) {
              return reject('Auth user not found:' + err);
            } else {
              // console.log('Auth user: %j', user);
              return resolve(user);
            }
          })(req, res, next);
      });
    };
}
