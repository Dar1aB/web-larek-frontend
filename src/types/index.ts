export interface IProductItem {
  id: string;
  title: string;
  price: number | null;
  category: string;
  image: string;
  description?: string;
  inBasket?: boolean;
}

export interface IOrder {
  payment: 'card' | 'cash';
  email: string;
  phone: string;
  address: string;
  items: string[];
  total: number;
}

export interface IAppStatus {
  getCatalog(): IProductItem[];
  getBasket(): IProductItem[];
  getOrder(): IOrder;

  setCatalog(items: IProductItem[]): void;
  prepareOrder(): IOrder;
  hasNoItems(): boolean;
  hasOnlyFreeItems(): boolean;
  setOrderFormField<K extends keyof IOrder>(field: K, value: IOrder[K]): void;
  addToBasket(item: IProductItem): void;
  delFromBasket(id: string): void;
  clearBasket(): void;
  getTotal(): number;
}