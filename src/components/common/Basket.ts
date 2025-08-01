import { IBasket } from "../../types/components/IBasket";
import { ensureElement } from "../../utils/utils";
import { Component } from "../base/component";
import { IEvents } from "../base/events";

export class Basket extends Component<IBasket> {
  protected _list: HTMLElement;
  protected _total: HTMLElement;
  protected _button: HTMLButtonElement;
  protected _empty: HTMLElement;

  constructor(container: HTMLElement, protected events: IEvents) {
    super(container);

    this._list = ensureElement<HTMLElement>('.basket__list', this.container);
    this._total = ensureElement<HTMLElement>('.basket__price', this.container);
    this._button = ensureElement<HTMLButtonElement>('.basket__button', this.container);
    this._empty = ensureElement<HTMLElement>('.basket__empty', this.container);
    
    this._button.addEventListener('click', () => {
      events.emit('order:open', {});
    });
  }

  set items(items: HTMLElement[]) {
    this._list.replaceChildren(...items);
    this.isEmpty = items.length === 0;
  }

  set total(total: number) {
    this.setText(this._total, `${total} синапсов`);
  }

  set isEmpty(value: boolean) {
    this.setDisable(this._button, value);
    this._empty.style.display = value ? 'block' : 'none';
  }

  set hasOnlyFreeItems(value: boolean) {
    this.setDisable(this._button, value);
  }

  render(data?: Partial<IBasket>): HTMLElement {
    if (data) {
      if (data.items) this.items = data.items;
      if (data.total) this.total = data.total;
      if (data.isEmpty !== undefined) this.isEmpty = data.isEmpty;
      if (data.hasOnlyFreeItems !== undefined) this.hasOnlyFreeItems = data.hasOnlyFreeItems;
    }
    return this.container;
  }
}