import { IModel } from "./model";

export interface ILiked extends IModel {
  numLikes: number;
}

export interface ICommented {
  numComments: number;
}
