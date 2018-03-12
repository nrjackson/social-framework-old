import { injectable, postConstruct } from 'inversify';
import { IUser } from '../model/user';
import { ISocialModelService, SocialModelService } from './social-model-service';

export interface IUserService extends ISocialModelService<IUser> {
  getUsers(): Promise<IUser[]>;
  getUser(id: number): Promise<IUser>;
  getUserByUsername(username: string): Promise<IUser>;
  newUser(user: IUser): Promise<IUser>;
  updateUser(id: string, user: IUser): Promise<IUser>;
  deleteUser(id: string): Promise<any>;
}

@injectable()
export class UserService extends SocialModelService<IUser> implements IUserService {
  @postConstruct()
  public initialize() {
      this.modelName = 'User';
  }

  public getUsers(): Promise<IUser[]> {
    return this.getAll();
  }

  public getUser(id: number): Promise<IUser> {
    return this.getModel(id);
  }

  public getUserByUsername(username: string): Promise<IUser> {
    return this.getModelByProperty('username', username);
  }

  public newUser(user: IUser): Promise<IUser> {
    return this.createModel(user);
  }

  public updateUser(id: string, user: IUser): Promise<IUser> {
    return this.updateModel(id, user);
  }

  public deleteUser(id: string): Promise<any> {
    return this.deleteModel(id);
  }
}
