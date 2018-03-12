import { inject, injectable } from 'inversify';
import { IDBClient } from '../utils/db-client';
import { IConvo, Convo } from '../model/convo';
import TYPES from '../constant/types';

@injectable()
export class ConvoService {
  private dbClient: IDBClient;

  constructor(
    @inject(TYPES.IDBClient) dbClient: IDBClient
  ) {
    this.dbClient = dbClient;
  }

  public getConvos(): Promise<IConvo[]> {
    return new Promise<IConvo[]>((resolve, reject) => {
      this.dbClient.find('Convo', {}, (error, data: IConvo[]) => {
        return resolve(data);
      });
    });
  }

  public getConvo(id: number): Promise<IConvo> {
    return new Promise<IConvo>((resolve, reject) => {
      this.dbClient.findOneById('Convo', id, (error, data: IConvo) => {
        return resolve(data);
      });
    });
  }

  public newConvo(convo: IConvo): Promise<IConvo> {
    let toInsert: IConvo = new Convo();
    toInsert.createdAt = new Date();
    toInsert.title = convo.title;
    toInsert.body = convo.body;

    return new Promise<IConvo>((resolve, reject) => {
      this.dbClient.insert('Convo', toInsert, (error, data: IConvo) => {
        console.log('newConvo: created');
        return resolve(data);
      });
    });
  }

  public updateConvo(id: string, convo: IConvo): Promise<IConvo> {
    return new Promise<IConvo>((resolve, reject) => {
      this.dbClient.update('Convo', id, convo, (error, data: IConvo) => {
        return resolve(data);
      });
    });
  }

  public deleteConvo(id: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.dbClient.remove('Convo', id, (error, data: any) => {
        return resolve(data);
      });
    });
  }
}
