import { injectable } from 'inversify';

export interface IModel {
  id: string;
  createdAt: Date;
}

@injectable()
export class Model implements IModel {
  public id: string;
  public createdAt: Date;
/*
  constructor(literal) {
      if (literal) {
          this.id = literal.id;
      }
  }
*/
/*
  public asObject(result: (model: Model) => void): void {
      let obj = new Model();
      _.keys(this).forEach((key) => {
          if (_.startsWith(key, '_')) {
              let newKey = _.trimStart(key, '_');
              let value = this[newKey];
              obj[newKey] = value;
              if (value && _.isFunction(value.asObject)) {
                  obj[newKey] = value.asObject();
              } else if (value && _.isArray(value)) {
                  obj[newKey] = value.map((object) => {
                      if (object && _.isFunction(object.asObject)) {
                          return object.asObject();
                      } else if (_.isDate(object)) {
                          return object.toISOString();
                      } else {
                          return object;
                      }
                  });
              } else if (_.isDate(value)) {
                  obj[newKey] = value.toISOString();
              }
          }
      });
      return result(obj);
  }
*/
}
