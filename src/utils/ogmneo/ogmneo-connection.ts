import { injectable } from 'inversify';
import * as ogmneo from 'ogmneo';

const url: string = 'localhost';

@injectable()
export class OgmNeoDBConnection {
  private isConnected: boolean = false;
  private node: ogmneo.Node;
  private relation: ogmneo.Relation;

  public getConnection(result: (node, relation) => void) {
    console.log('getConnection...');
    if (this.isConnected) {
      return result(this.node, this.relation);
    } else {
      console.log('getConnection: connecting...');
      this.connect();
      console.log('getConnection: connected...');
      this.node = ogmneo.Node;
      this.relation = ogmneo.Relation;
      return result(this.node, this.relation);
    }
  }

  private connect() {
    console.log('connection: connecting...');
    ogmneo.Connection.connect('jybe', 'password', url);
    console.log('connection: connected...');
    this.isConnected = true;
  }
}
