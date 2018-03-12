import { hashSync, genSaltSync, compareSync } from 'bcrypt-nodejs';
import * as jwt from 'jsonwebtoken';
import { Config } from '../constant/config';
import { IUser } from '../model/user';

export class Utils {
  // generating a hash
  public static generateHash = function(password) {
    return hashSync(password, genSaltSync(8));
  };

  // checking if password is valid
  public static validPassword = function(password, pass) {
    return compareSync(password, pass);
  };

  public static generateJWT(user: IUser): string {
    const today = new Date();
    let exp = new Date(today);
    exp.setDate(today.getDate() + 60);
    return jwt.sign({
      exp: exp.getTime() / 1000,
      id: user.id,
      username: user.username,
    }, Config.secret);
  }
}
