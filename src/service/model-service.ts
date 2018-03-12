import { inject, injectable } from 'inversify';
import { IDBClient } from '../utils/db-client';
import { IModel } from '../model/model';
import TYPES from '../constant/types';

export interface IModelService {
  findAll<T extends IModel>(modelName: string): Promise<T[]>;
  findById<T extends IModel>(modelName: string, id: number): Promise<T>;
  findByProperty<T extends IModel>(modelName: string, propName: string, propValue: string): Promise<T>;
  create<T extends IModel>(modelName: string, model: T): Promise<T>;
  update<T extends IModel>(modelName: string, id: string, model: T): Promise<T>;
  delete(modelName: string, id: string): Promise<any>;
}


@injectable()
export class ModelService<DBClientType extends IDBClient> implements IModelService {
  constructor(
    @inject(TYPES.IDBClient) private dbClient: DBClientType
  ) {}

  public findAll<T extends IModel>(modelName: string): Promise<T[]> {
    return new Promise<T[]>((resolve, reject) => {
      this.dbClient.find(modelName, {}, (error, data: T[]) => {
        return resolve(data);
      });
    });
  }

  public findById<T extends IModel>(modelName: string, id: number): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.dbClient.findOneById(modelName, id, (error, data: T) => {
        return resolve(data);
      });
    });
  }

  public findByProperty<T extends IModel>(modelName: string, propName: string, propValue: string): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.dbClient.findOneByProperty(modelName, propName, propValue, (error, data: T) => {
        return resolve(data);
      });
    });
  }

  public create<T extends IModel>(modelName: string, model: T): Promise<T> {
    model.createdAt = new Date();
    return new Promise<T>((resolve, reject) => {
      console.log('newModel being created: ', modelName);
      console.log('Model: %j', model);
      this.dbClient.insert(modelName, model, (error, data: T) => {
        console.log('newModel created: %j', data);
        return resolve(data);
      });
    });
  }

  public update<T extends IModel>(modelName: string, id: string, model: T): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.dbClient.update(modelName, id, model, (error, data: T) => {
        return resolve(data);
      });
    });
  }

  public delete(modelName: string, id: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.dbClient.remove(modelName, id, (error, data: any) => {
        return resolve(data);
      });
    });
  }
}
