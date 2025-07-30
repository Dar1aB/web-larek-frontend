import { IAppStatus, IProductItem, IOrder} from "../types";
import { IEvents } from "./base/events";

export class AppStatus implements IAppStatus {
  private _catalog: IProductItem[] = [];
  private _basket: IProductItem[] = [];
  private _order: IOrder = {
    payment: 'card',
    email: '',
    phone: '',
    address: '',
    items: [],
    total: 0
  };

  constructor(protected events: IEvents) {}

  getCatalog(): IProductItem[] {
    return [...this._catalog]
  }

  getBasket(): IProductItem[] {
    return [...this._basket]
  }

  getOrder(): IOrder {
    this.prepareOrder();
    return {...this._order}
  }

  setCatalog(items: IProductItem[]) {
    this._catalog = items;
    this.events.emit('catalog:changed', this._catalog);
  }

  prepareOrder(): IOrder {
    if (this.hasOnlyFreeItems()) {
      console.log('Ошибка: в корзине сейчас только бесценный товар');
    }
    this._updateOrderData();
    return this._order;
  };

  hasNoItems(): boolean {
    return this._basket.length === 0;
  }

  hasOnlyFreeItems(): boolean {
    return this._basket.every(item => item.price === null);
  }

  setOrderFormField<K extends keyof IOrder>(field: K, value: IOrder[K]): void {
    this._order[field] = value;
    this.events.emit('order:changed', {field, value})
  };
  addToBasket(item: IProductItem): void {
    const catalogElement = this._catalog.find(i => i.id === item.id);
    if (!catalogElement) return;
    if (!this._basket.some(i => i.id === item.id)) {
      this._basket.push({...catalogElement});
      this._order.total = this.getTotal();
      this.events.emit('basket:changed')
    }
  };
  delFromBasket(id: string): void {
    this._basket = this._basket.filter(item => item.id !== id);
    this.events.emit('basket:changed');
    this._order.total = this.getTotal();
  };
  clearBasket(): void {
    this._basket = [];
    this._order.total = this.getTotal();
    this.events.emit('basket:changed')
  };

  getTotal(): number {
    if (this.hasOnlyFreeItems()) {
      return 0;
    }
    return this._basket.filter(item => item.price !== null).reduce((sum, item) => sum + (item.price || 0), 0);
  };

  private _updateOrderData(): void {
    this._order.items = this.hasOnlyFreeItems() ? [] : this._basket.filter(item => item.price !== null).map(item => item.id);
    this._order.total = this.getTotal();
  }
}