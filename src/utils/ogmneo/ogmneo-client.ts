import { inject, injectable } from 'inversify';
import * as ogmneo from 'ogmneo';
import { OgmNeoDBConnection } from './ogmneo-connection';
import { IGraphDBClient } from '../graph-db-client';
import { IModel } from '../../model/model';
import TYPES from '../../constant/types';

const _ = require('lodash');

@injectable()
export class OgmNeoDBClient implements IGraphDBClient {
  public node: ogmneo.Node;
  public relation: ogmneo.Relation;

  constructor(
    @inject(TYPES.OgmNeoDBConnection) connection: OgmNeoDBConnection
  ) {
    console.log('Initializing ogmneo db connection...');
    connection.getConnection((node, relation) => {
      // console.log('Initialized ogmneo db connection: dbConn = ' + dbconn);
      this.node = node;
      this.relation = relation;
    });
  }

  public find<T extends IModel>(collection: string, filter: Object, result: (error, data: T[]) => void): void {
    let query = ogmneo.Query.create(collection).where(filter);
    this.node.find(query).toArray((error, find: T[]) => {
      return result(error, find);
    });
  }

  public countRelatedFrom(fromModel: IModel, relation: string, result: (error, data: number) => void): void {
    this.countRelated(fromModel,relation,null,(error,results:number) => {
      return result(error,results);
    });
  }

  public findRelatedFrom<T extends IModel>(fromModel: IModel, relation: string, result: (error, data: T[]) => void): void {
    this.findRelated(fromModel,relation,null,'start',true,(error,results:T[]) => {
      return result(error,results);
    });
  }

  public countRelatedTo(toModel: IModel, relation: string, result: (error, data: number) => void): void {
    this.countRelated(null,relation,toModel,(error,results:number) => {
      return result(error,results);
    });
  }

  public findRelatedTo<T extends IModel>(toModel: IModel, relation: string, result: (error, data: T[]) => void): void {
    this.findRelated(null,relation,toModel,'end',true,(error,results:T[]) => {
      return result(error,results);
    });
  }

  public countRelated(fromModel: IModel, relation: string, toModel: IModel, result: (error, result: number) => void): void {
    let query = ogmneo.RelationQuery
      .create(relation);
    if(fromModel) {
      query = query.startNode(fromModel.id);
    }
    if(toModel) {
      query = query.endNode(toModel.id);
    }
    console.log('countRelated query: %j', query)
    let operation = this.relation.countOperation(query);
    ogmneo.OGMNeoOperationExecuter.execute(operation).then((data) => {
      console.log('countRelated count: ' + data);
      return result(null, data);
    }).catch((error) => {
      return result(error, null);
    });
  }

  public findRelated<T extends IModel>(fromModel: IModel, relation: string, toModel: IModel, whichNodes: string, distinct: boolean, result: (error, data: T[]) => void): void {
    let query = ogmneo.RelationQuery
      .create(relation);
    if(fromModel) {
      query = query.startNode(fromModel.id);
    }
    if(toModel) {
      query = query.endNode(toModel.id);
    }
    this.relation.findNodes(query,whichNodes,distinct).toArray((error, find: T[]) => {
      return result(error, find);
    }).catch((error) => {
      return result(error, null);
    });
  }

  public findOneByProperty<T extends IModel>(collection: string, field: string, value: any, result: (error, data: T) => void): void {
    // console.log('findOneByProperty: db = ' + this.node);
    let query = ogmneo.Query.create(collection)
        .where(new ogmneo.Where(field, { $eq: value }));
    this.node.find(query).then((nodes: T[]) => {
      if (nodes[0]) {
          return result(null, nodes[0]);
      }else {
          return result(null, null);
      }
    }).catch((error) => {
      return result(error, null);
    });
  }

  private recordToNode(record, variable) {
      if (record) {
          let node = record.get(variable);
          let obj = node.properties || {};
          obj.id = node.identity.low;
          return obj;
      }
      return null;
  }

  private parseRecordNode(record, variable) {
      if (record) {
          if (_.includes(record.keys, variable)) {
              return this.recordToNode(record, variable);
          } else {
              return this.propertiesFromVariable(record, variable);
          }
      }
      return null;
  }

  private propertiesFromVariable(record, variable) {
      let obj = {id:null};
      record.keys.forEach((key) => {
          let value = record.get(key);
          if (_.startsWith(key, `${variable}.`)) {
              obj[key.substring(variable.length + 1)] = value;
          } else if (key === `ID(${variable})`) {
              obj.id = value;
          }
      });
      return obj;
  }

  public findOneById<T extends IModel>(collection: string, objectId: number, result: (error, data: T) => void): void {
    console.log('Finding ' + collection + ' by id: ' + objectId);
    //if (_.isInteger(objectId)) {
        let cypher = `MATCH (n:${collection}) WHERE ID(n)=${objectId} RETURN n`;

        try {
        let operation = ogmneo.OperationBuilder.create()
            .cypher(cypher)
            .type(ogmneo.Operation.READ)

            .then((result) => {
                console.log('Found ' + collection + ' : %j', result);
                let record = _.first(result.records);
                return this.parseRecordNode(record, 'n');
            }).build();

            ogmneo.OperationExecuter.execute(operation).then((data:T) => {
              return result(null, data);
            });
        } catch (error) {
            return result(error, null);
        }
    // } else {
    //     throw new Error('You must provide an non-null integer id property to find the node');
    // }
/*
    let query = 'MATCH (n:' + collection + ') WHERE ID(n)=' + objectId + ' RETURN n';
    console.log('Finding ' + collection + ' by id: ' + objectId);
    ogmneo.Cypher.transactionalRead(query).then((found: IModel) => {
      console.log('Found ' + collection + ' : %j', found);
      return result(null, found);
    }).catch((error) => {
      return result(error, null);
    });
*/
  }

  public insert<T extends IModel>(collection: string, model: IModel, result: (error, data: T) => void): void {
    this.node.create(model, collection).then((node: T) => {
      return result(null, node);
    }).catch((error) => {
      return result(error, null);
    });
  }

  public update<T extends IModel>(collection: string, objectId: string, model: IModel, result: (error, data: T) => void): void {
    this.node.collection(collection).updateOne({ _id: objectId }, model, (error, update: T) => {
      return result(error, update);
    });
  }

  public remove<T extends IModel>(collection: string, objectId: string, result: (error, data: T) => void): void {
    this.node.collection(collection).deleteOne({ _id: objectId }, (error, remove) => {
      return result(error, remove);
    });
  }

  public relate(fromModel: IModel, relation: string, toModel: IModel, result: (error) => void): void {
    console.log('Relating Model: %j to Model: %j', fromModel, toModel);
    this.relation.relate(fromModel.id, relation, toModel.id).then(() => {
      console.log('Relation made');
      return result(null);
    }).catch((error) => {
      console.log('Error making relation: ' + error);
      return result(error);
    });
  }

  public unrelate(fromModel: IModel, relation: string, toModel: IModel, result: (error) => void): void {
    console.log('Unrelating Model: %j from Model: %j', fromModel, toModel);
    let query = ogmneo.RelationQuery
      .create(relation);
    if(fromModel) {
      query = query.startNode(fromModel.id);
    }
    if(toModel) {
      query = query.endNode(toModel.id);
    }
    this.relation.deleteMany(query).then(() => {
      console.log('Relation deleted');
      return result(null);
    }).catch((error) => {
      console.log('Error making relation: ' + error);
      return result(error);
    });
  }
}
