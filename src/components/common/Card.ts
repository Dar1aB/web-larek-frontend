import { IProductItem } from "../../types";
import { ICard } from "../../types/components/ICard";
import { CDN_URL } from "../../utils/constants";
import { ensureElement } from "../../utils/utils";
import { Component } from "../base/component";

export class Card extends Component<IProductItem & ICard> {
  protected _title: HTMLElement;
  protected _price: HTMLElement;
  protected _button?: HTMLButtonElement | null;
  protected _category?: HTMLElement | null;
  protected _image?: HTMLImageElement | null;
  protected _description?: HTMLElement | null;

  constructor(container: HTMLElement, actions?: {onClick: () => void}) {
    super(container);

    if (actions?.onClick) {
      this.container.addEventListener('click', (event) => {
        if(!(event.target as HTMLElement).closest('.card__button')) {
          actions.onClick();
        }
      })
    }

    this._title = ensureElement<HTMLElement>('.card__title', this.container);
    this._price = ensureElement<HTMLElement>('.card__price', this.container);
    
  
    this._button = this.container.querySelector('.card__button');
    this._category = this.container.querySelector('.card__category');
    this._image = this.container.querySelector('.card__image');
    this._description = this.container.querySelector('.card__text');
    

    if (this._button && actions?.onClick) {
      this._button.addEventListener('click', actions.onClick);
    }
  }

  set title(value: string) {
    this.setText(this._title, value);
  }
  set price(value: number | null) {
    const text = value ? `${value} синапсов` : `Бесценно`;
    this.setText(this._price, text);
    if (this._button) {
      this.setDisable(this._button, false);
    }
  }
  set category(value: string) {
    if (this._category) {
      this.setText(this._category, value);
      const categoryMap: Record<string, string> = {
        'софт-скил': 'soft',
        'другое': 'other',
        'дополнительное': 'additional',
        'кнопка': 'button',
        'хард-скил': 'hard'
      };
      const categoryClass = categoryMap[value.toLowerCase()] || 'other';
      this._category.className = `card__category card__category_${categoryClass}`;
    }
  }

  set image(value: string) {
    if (this._image) {
      this._image.src = CDN_URL + value;
      this._image.alt = this._title.textContent || '';
    }
  }
  set inBasket(value: boolean) {
    if(this._button) {
      this.setText(this._button, value ? 'Удалить из корзины' : 'Купить');
    }
  }

  set description(value: string) {
    if (this._description) {
      this.setText(this._description, value)
    }
  }

  render(data?: Partial<IProductItem & ICard>): HTMLElement {
    if (data) {
      if (data.title) this.title = data.title;
      if (data.price !== undefined) this.price = data.price;
      if (data.category) this.category = data.category;
      if (data.image) this.image = data.image;
      if (data.inBasket !== undefined) this.inBasket = data.inBasket;
      if (data.description) this.description = data.description;
    }
    return this.container;
  }
}