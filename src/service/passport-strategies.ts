import { inject, injectable } from 'inversify';
import { IUserService } from './user-service';
import { ILocalUser, LocalUser } from '../model/user-local';
import { FacebookUser } from '../model/user-facebook';
import { Config } from '../constant/config';
import TYPES from '../constant/types';
import { Utils } from '../utils/utils';
import { FacebookAuth } from '../constant/fb-auth';
import * as passportJWT from 'passport-jwt';
import * as passportJSON from 'passport-json';
import * as FacebookTokenStrategy from 'passport-facebook-token';

const extractJwt = passportJWT.ExtractJwt;

const jwtOptions = {
  jwtFromRequest : extractJwt.fromAuthHeader(),
  secretOrKey : Config.secret
};

@injectable()
export class PassportStrategies {
  public localLoginStrategy: passportJSON.Strategy;
  public localSignupStrategy: passportJSON.Strategy;
  public jwtStrategy: passportJWT.Strategy;
  public facebookTokenStrategy: FacebookTokenStrategy.StrategyInstance;

  private userService: IUserService;

  constructor(
    @inject(TYPES.IUserService) userService: IUserService
  ) {
    this.userService = userService;

    this.jwtStrategy = new passportJWT.Strategy(
      jwtOptions,
      (jwtPayload, next) => {
      console.log('payload received', jwtPayload);

      this.userService.getUserByUsername(jwtPayload.username).then(function(user){
        if (user) {
          console.log('jwt: user found');
          next(null, user);
        } else {
          console.log('jwt: user not found');
          next('No user not found', false);
        }
      });
    });

    this.localLoginStrategy = new passportJSON.Strategy(
      {
        // by default, local strategy uses username and password, we will override with email
        passReqToCallback : true, // allows us to pass in the req from our route (lets us check if a user is logged in or not)
        passwordProp : 'user.password',
        usernameProp : 'user.email',
      },
      (req, email, password, done) => {
        console.log('local-login: email=' + email + ', password=' + password);
        this.userService.getUserByUsername(email).then((user:ILocalUser) => {
          // if no user is found, return the message
          if (!user) {
            console.log('No user found');
            return done('No user found.', false);
          }
          if (!Utils.validPassword(password, user.localPassword)) {
            console.log('Invalid password');
            return done('Oops! Wrong password.', false);
          } else { // all is well, return user
            console.log('Login successful!');
            return done(null, user);
          }
        }).catch((err) => {
          console.log('Error: ', err);
          return done(err, false);
        });
      }
    );

    this.localSignupStrategy = new passportJSON.Strategy(
      {
        // by default, local strategy uses username and password, we will override with email
        passReqToCallback : true, // allows us to pass in the req from our route (lets us check if a user is logged in or not)
        passwordProp : 'user.password',
        usernameProp : 'user.email',
      },
      (req, email, password, done) => {
        // asynchronous
        // process.nextTick(function() {
          /*  Whether we're signing up or connecting an account, we'll need
             to know if the email address is in use. */
          console.log('local-signup: email=' + email + ', password=' + password);
          this.userService.getUserByUsername(email).then((existingUser) => {
            // check to see if there's already a user with that email
            if (existingUser) {
              console.log('That email is already in use.');
              return done('That email is already in use.', false);
            }
            //  if we're logged in, we're connecting a new local account.
            if (req.user) {
              /*
              let update = {};
                update.id = req.user._id;
                update.props = {};
                update.props.localEmail = email;
                update.props.localPassword = User.generateHash(password);
                this.userService. User.update(update, function(err, user) {
                // if (err)
                //  throw err;
                // return done(null, user);
              // });
               */
            } else {
              //  we're not logged in, so we're creating a brand new user.
              // create the user
              const reqUser = req.body.user;
              let newUser = new LocalUser();
              newUser.username = email;
              newUser.localEmail = email;
              newUser.email = email;
              newUser.localPassword = Utils.generateHash(password);
              console.log('reqUser = %j', reqUser);
              newUser.name = reqUser.name;
              this.userService.newUser(newUser).then((savedUser) => {
                console.log('passport-json login: created user: ');
                return done(null, savedUser);
              }).catch((err) => {
                console.log('Error creating user: ' + err);
                return done(err, false);
              });
            }
          }).catch((err) => {
            console.log('Error retrieving existing user: ' + err);
            return done(err, false);
          });
        // });
      }
    );

    this.facebookTokenStrategy = new FacebookTokenStrategy(
    {
      clientID: FacebookAuth.clientID,
      clientSecret: FacebookAuth.clientSecret
    },
    (accessToken, refreshToken, profile, done) => {
      console.log('facebook-token: profile.id=' + profile.id);
      this.userService.getUserByUsername(profile.id).then((existingUser) => {
        // check to see if there's already a user with that email
        if (existingUser) {
          return done(null, existingUser);
        } else {
          // create the user
          let newUser = new FacebookUser();
          newUser.facebookId = profile.id;
          newUser.facebookEmail = profile.emails[0].value;
          newUser.facebookName = profile.displayName;
          newUser.facebookToken = accessToken;
          newUser.username = newUser.facebookId;
          newUser.email = newUser.facebookEmail;
          newUser.name = newUser.facebookName;
          this.userService.newUser(newUser).then((savedUser) => {
            console.log('passport-json login: created user: ');
            return done(null, savedUser);
          }).catch((err) => {
            console.log('Error creating user: ' + err);
            return done(err, false);
          });
        }
      }).catch((err) => {
        console.log('Error retrieving existing user: ' + err);
        return done(err, false);
      });
    });
  }
}
