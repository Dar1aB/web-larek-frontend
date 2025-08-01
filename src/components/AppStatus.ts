import { IAppStatus, IProductItem, IOrder} from "../types";
import { IEvents } from "./base/events";

export class AppStatus implements IAppStatus {
  private _catalog: IProductItem[] = [];
  private _basket: IProductItem[] = [];
  private _order: IOrder = {
    payment: 'card',
    email: '',
    phone: '',
    address: ''
  };

  constructor(protected events: IEvents) {}

  getCatalog(): IProductItem[] {
    return [...this._catalog]
  }

  getBasket(): IProductItem[] {
    return [...this._basket]
  }

  getOrder(): IOrder {
    return {...this._order};
  }

  getPaidItems(): IProductItem[] {
    return this._basket.filter(item => item.price !== null);
  }

  hasOnlyFreeItems(): boolean {
    return this._basket.every(item => item.price === null);
  }

  setCatalog(items: IProductItem[]) {
    this._catalog = items;
    this.events.emit('catalog:changed', this._catalog);
  }

  hasNoItems(): boolean {
    return this._basket.length === 0;
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
      this.events.emit('basket:changed')
    }
  };
  delFromBasket(id: string): void {
    this._basket = this._basket.filter(item => item.id !== id);
    this.events.emit('basket:changed');
  };
  clearBasket(): void {
    this._basket = [];
    this.events.emit('basket:changed')
  };

  getTotal(): number {
    return this._basket.filter(item => item.price !== null).reduce((sum, item) => sum + (item.price || 0), 0);
  };

  validateOrder(form: 'payment' | 'contacts'): {isValid: boolean, errors: string} {
    const data = this.getOrder();
    if (form === 'payment') {
      const isValid = Boolean(data.address);
      return {
        isValid,
        errors: isValid ? '': 'Необходимо указать адрес'
      }
    }
    if (form === 'contacts') {
      const emailValid = Boolean(data.email);
      const phoneValid = Boolean(data.phone);
      if (!emailValid && !phoneValid) {
        return {
          isValid: false,
          errors: 'Необходимо указать email и телефон'
        }
      }
      if (!emailValid) {
        return {
          isValid: false,
          errors: 'Необходимо указать email'
        }
      }
      if (!phoneValid) {
        return {
          isValid: false,
          errors: 'Необходимо указать телефон'
        }
      }
      return {isValid: true, errors: ''}
    }
    return {isValid: false, errors: ''}
  }
}