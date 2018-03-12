import { IModel } from '../model/model';

export interface IDBClient {
  find<T extends IModel>(collection: string, filter: Object, result: (error, data: T[]) => void): void;
  findOneByProperty<T extends IModel>(collection: string, field: string, value: any, result: (error, data: T) => void): void;
  findOneById<T extends IModel>(collection: string, objectId: number, result: (error, data: T) => void): void;
  insert<T extends IModel>(collection: string, model: T, result: (error, data: T) => void): void;
  update<T extends IModel>(collection: string, objectId: string, model: T, result: (error, data: T) => void): void;
  remove<T extends IModel>(collection: string, objectId: string, result: (error, data: T) => void): void;
}
