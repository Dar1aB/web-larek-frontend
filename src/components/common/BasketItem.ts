import { IBasketItem } from "../../types/components/IBasketItem";
import { ensureElement } from "../../utils/utils";
import { Component } from "../base/component";
import { IEvents } from "../base/events";

export class BasketItem extends Component<IBasketItem> {
  protected _index: HTMLElement;
  protected _title: HTMLElement;
  protected _price: HTMLElement;
  protected _delBtn: HTMLButtonElement;

  constructor(container: HTMLElement, protected events: IEvents) {
    super(container);

    this._index = ensureElement<HTMLElement>('.basket__item-index', this.container);
    this._title = ensureElement<HTMLElement>('.card__title', this.container);
    this._price = ensureElement<HTMLElement>('.card__price', this.container);
    this._delBtn = ensureElement<HTMLButtonElement>('.basket__item-delete', this.container);

    this._delBtn.addEventListener('click', () => {
      events.emit('basket:remove', {id: this._delBtn.dataset.id || ''})
    })
  }

  set index(value: number) {
    this.setText(this._index, value.toString());
  }

  set title(value: string) {
    this.setText(this._title, value);
  }

  set price(value: number | null) {
    this.setText(this._price, value ? `${value} синапсов` : 'Бесценно');
  }

  render(data?: Partial<IBasketItem>): HTMLElement {
      if (data) {
        if (data.index !== undefined) this.index = data.index;
        if (data.title) this.title = data.title;
        if (data.price !== undefined) this.price = data.price;
        if (data.id) this._delBtn.dataset.id = data.id;
      }
      return this.container;
  }
}