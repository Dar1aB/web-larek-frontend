import { IPage } from "../types/components/IPage";
import { ensureElement } from "../utils/utils";
import { Component } from "./base/component";
import { IEvents } from "./base/events";
import { Modal } from "./Modal";

export class Page extends Component<IPage> {
  protected _gallery: HTMLElement;
  protected _counter: HTMLElement;
  protected _modal: Modal;
  protected _wrapper: HTMLElement;

  constructor(container: HTMLElement, protected events: IEvents) {
    super(container);

    this._gallery = ensureElement<HTMLElement>('.gallery', this.container);
    this._counter = ensureElement<HTMLElement>('.header__basket-counter', this.container);
    this._wrapper = ensureElement<HTMLElement>('.page__wrapper', this.container);

    const modalContainer = ensureElement<HTMLElement>('#modal-container', this.container);
    this._modal = new Modal(modalContainer, events);

    ensureElement<HTMLElement>('.header__basket', this.container).addEventListener('click', () => {
      events.emit('basket:open');
    })
  }

  set catalog(items: HTMLElement[]) {
    this._gallery.replaceChildren(...items);
  }

  set counter(value: number) {
    this.setText(this._counter, String(value));
  }

  set locked(value: boolean) {
    this.toggleClassName(this._wrapper, 'page__wrapper_locked', value);
  }

  renderModalOpen(content: HTMLElement): void {
    this._modal.render({content});
    this._modal.open();
  }

  modalClose(): void {
    this._modal.close();
  }

  render(): HTMLElement {
    return this.container;
  }
}