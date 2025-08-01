import { Component } from "./base/component";
import { ensureElement } from "../utils/utils";
import { IEvents } from "./base/events";

export class Modal extends Component {
  protected _content: HTMLElement;
  protected _closeBtn: HTMLButtonElement;

  constructor(container: HTMLElement, protected events: IEvents) {
    super(container);

    this._content = ensureElement<HTMLElement>('.modal__content', this.container);
    this._closeBtn = ensureElement<HTMLButtonElement>('.modal__close', this.container);

    this._closeBtn.addEventListener('click', () => this.events.emit('modal:close'));
    this.container.addEventListener('click', (event: MouseEvent) => {
      if (event.target === this.container) {
        this.events.emit('modal:close');
      }
    })
  }

  set content(value: HTMLElement) {
    this._content.replaceChildren(value);
  }

  open(): void {
    this.container.classList.add('modal_active');
  }

  close(): void {
    this.container.classList.remove('modal_active');
  }

  render(data?: {content?: HTMLElement}): HTMLElement {
    if (data?.content) {
      this.content = data.content;
    }
    return this.container;
  }
}