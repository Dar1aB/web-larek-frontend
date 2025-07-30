import { IProductItem } from "..";

export interface IBasket {
  items: IProductItem[];
  total: number;
  isEmpty: boolean;
  hasOnlyFreeItems: boolean;
}