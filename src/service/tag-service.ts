import { inject, injectable } from 'inversify';
import { ITag, Tag } from '../model/tag';
import { IModel } from '../model/model';
import { IGraphModelService, GraphModelService } from './graph-model-service';
import TYPES from '../constant/types';
import { IGraphDBClient } from '../utils/graph-db-client';

export interface ITagService extends IGraphModelService {
  getTags(): Promise<ITag[]>;
  getTag(id: number): Promise<ITag>;
  getTagByName(tagname: string): Promise<ITag>;
  addTag(name: string, taggedModel: IModel): Promise<ITag>;
  addTags<T extends IModel>(tags: string[], taggedModel: T): Promise<T>;
  updateTag(id: string, tag: ITag): Promise<ITag>;
  deleteTag(id: string): Promise<any>;
}

/*
 * Decorator pattern for the model service - exposes methods specific to Tag model
 */
@injectable()
export class TagService extends GraphModelService implements ITagService {
  protected modelName: string;

  constructor(
    @inject(TYPES.IDBClient) dbClient: IGraphDBClient,
  ) {
    super(dbClient);
  }

  public getTags(): Promise<ITag[]> {
    return this.findAll<ITag>(this.modelName);
  }

  public getTag(id: number): Promise<ITag> {
    return this.findById<ITag>(this.modelName, id);
  }

  public getTagByName(name: string): Promise<ITag> {
    return this.findByProperty<ITag>(this.modelName, 'name', name);
  }

  private createOrUseTag(name: string): Promise<ITag> {
    return new Promise<ITag>((resolve, reject) => {
      this.getTagByName(name).then((existingTag) => {
        if(existingTag) {
          console.log('Tag exists: %j' + existingTag);
          return resolve(existingTag);
        } else {
          let tag = new Tag();
          tag.name=name;
          console.log('Creating tag: %j', tag);
          this.create<ITag>(this.modelName, tag).then((newTag) => {
            console.log('Created tag: %j', newTag);
            return resolve(newTag);
          });
        }
      });
    });
  };

  public addTag(name: string, taggedModel: IModel): Promise<ITag> {
    return new Promise<ITag>((resolve, reject) => {
      this.createOrUseTag(name).then((useTag) => {
        console.log('Created or retrieved tag: %j', useTag);
        console.log('Relating tag to model: %j', taggedModel);
        this.relate(taggedModel, 'HAS_TAG', useTag).then(() => {
          console.log('Done relating tag to model');
          return resolve(useTag);
        }).catch((err) => {
          console.log('Error relating tag: ' + err);
          return reject(err);
        });
      }).catch((err) => {
        console.log('Error creating tag: ' + err);
        return reject(err);
      });
    });
  }

  public addTags<T extends IModel>(tags: string[], taggedModel: T): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      let tagPromises:Promise<ITag>[] = [];
      for(let i=0; i<tags.length; i++) {
        tagPromises.push(this.addTag(tags[i], taggedModel))
      }
      console.log('Added tags');
      Promise.all(tagPromises).then((addedTags) => {
        console.log('Resolving promise from adding tags');
        return resolve(taggedModel);
      }).catch((err) => {
        console.log('Error ralating tags: ' + err);
        return reject(err);
      })
    });
  }

  public updateTag(id: string, tag: ITag): Promise<ITag> {
    return this.update<ITag>(this.modelName, id, tag);
  }

  public deleteTag(id: string): Promise<any> {
    return this.delete(this.modelName, id);
  }
}
