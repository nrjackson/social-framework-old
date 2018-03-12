import { injectable } from 'inversify';

import { IModel, Model } from './model';

export interface ITag extends IModel {
  name: string;
}

@injectable()
export class Tag extends Model implements ITag {
  public name: string;
}
