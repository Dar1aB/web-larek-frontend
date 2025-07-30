import { IProductItem } from "../../types";
import { IBasket } from "../../types/components/IBasket";
import { createElement, ensureElement } from "../../utils/utils";
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

    this._list.addEventListener('click', (evt) => {
      const target = evt.target as HTMLElement;
      const delBtn = target.closest<HTMLButtonElement>('.basket__item-delete');
      if(delBtn?.dataset.id) {
        events.emit('basket:remove', {id: delBtn.dataset.id});
      }
    })
  }

  set items(items: IProductItem[]) {
    if (!items.length) {
      this._list.replaceChildren();
      this.isEmpty = true;
      this.hasOnlyFreeItems = true;
    } else if (items.some(item => item.price === null)) {
      this.hasOnlyFreeItems = true;
    }
    this.isEmpty = false;
    const elements = items.map((item, index) => 
      createElement<HTMLElement>('li', {
        className: 'basket__item card card_compact'
      }, [
        createElement('span', {
          className: 'basket__item-index',
          textContent: (index + 1).toString()
        }),
        createElement('span', {
          className: 'card__title',
          textContent: item.title
        }),
        createElement('span', {
          className: 'card__price',
          textContent: `${item.price || 0} синапсов`
        }),
        createElement('button', {
          className: 'basket__item-delete',
          dataset: {id: item.id},
          ariaLabel: 'удалить'
        })
      ])
    );
    this._list.replaceChildren(...elements);
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