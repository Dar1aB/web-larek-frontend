import { ensureElement } from "../../utils/utils";
import { Component } from "../base/component";
import { IEvents } from "../base/events";

interface ISuccess {
  total: number;
}

export class Success extends Component<ISuccess> {
  protected _description: HTMLElement;
  protected _closeBtn: HTMLButtonElement;

  constructor(container: HTMLElement, protected events:IEvents) {
    super(container);

    this._description = ensureElement<HTMLElement>('.order-success__description', this.container);
    this._closeBtn = ensureElement<HTMLButtonElement>('.order-success__close', this.container);

    this._closeBtn.addEventListener('click', () => {
      this.events.emit('modal:close');
    })
  }

  set total(value: number) {
    this._description.textContent = `Списано ${value} синапсов`;
  }

  render(data?: Partial<ISuccess>): HTMLElement {
    if (data?.total !== undefined) {
      this.total = data.total;
    }
    return this.container;
  }
}