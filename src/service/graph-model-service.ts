import { injectable } from 'inversify';
import { IModel } from '../model/model';
import { IModelService, ModelService } from './model-service';
import { IGraphDBClient } from '../utils/graph-db-client';

export interface IGraphModelService extends IModelService {
  countRelatedFrom(fromModel: IModel, relation: string): Promise<number>;
  findRelatedFrom<T extends IModel>(fromModel: IModel, relation: string): Promise<T[]>;
  countRelatedTo(toModel: IModel, relation: string): Promise<number>;
  findRelatedTo<T extends IModel>(toModel: IModel, relation: string): Promise<T[]>;
  // findRelated(fromModel: IModel, relation: string, toModel: IModel, whichNodes: string, distinct: boolean): Promise<T[]>;
  relate(fromModel: IModel, relation: string, toModel: IModel): Promise<any>;
  unrelate(fromModel: IModel, relation: string, toModel: IModel): Promise<any>;
  // relateAll(fromModel: IModel, relation: string, toModels: IModel[]): Promise<T[]>;
}

@injectable()
export class GraphModelService extends ModelService<IGraphDBClient> implements IGraphModelService {
  public countRelatedFrom(fromModel: IModel, relation: string): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      this.dbClient.countRelatedFrom(fromModel, relation, (error, result:number) => {
        if(error) {
          reject(error);
        }
        return resolve(result);
      });
    });
  }

  public findRelatedFrom<T extends IModel>(fromModel: IModel, relation: string): Promise<T[]> {
    return new Promise<T[]>((resolve, reject) => {
      this.dbClient.findRelatedFrom(fromModel, relation, (error, results:T[]) => {
        if(error) {
          reject(error);
        }
        return resolve(results);
      });
    });
  }

  public countRelatedTo(toModel: IModel, relation: string): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      this.dbClient.countRelatedTo(toModel, relation, (error, result:number) => {
        if(error) {
          reject(error);
        }
        return resolve(result);
      });
    });
  }

  public findRelatedTo<T extends IModel>(toModel: IModel, relation: string): Promise<T[]> {
    return new Promise<T[]>((resolve, reject) => {
      this.dbClient.findRelatedTo(toModel, relation, (error, results:T[]) => {
        if(error) {
          reject(error);
        }
        return resolve(results);
      });
    });
  }

  public relate(fromModel: IModel, relation: string, toModel: IModel): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.dbClient.relate(fromModel, relation, toModel, (error) => {
        if(error) {
          reject(error);
        }
        return resolve(null);
      });
    });
  }

  public unrelate(fromModel: IModel, relation: string, toModel: IModel): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.dbClient.unrelate(fromModel, relation, toModel, (error) => {
        if(error) {
          reject(error);
        }
        return resolve(null);
      });
    });
  }
/*
  public relateAll(fromModel: IModel, relation: string, toModels: IModel[]): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      for(let i = 0; i < toModels.length; i++) {
        this.dbClient.relate(fromModel, relation, toModels[i], (error:Error) => {})
        .catch((err) => {
          return reject(err);
        });
      }
      return resolve(null);
    });
  }
*/
}
