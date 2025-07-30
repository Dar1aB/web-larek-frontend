import { IPage } from "../types/components/IPage";
import { ensureAllElements, ensureElement } from "../utils/utils";
import { Component } from "./base/component";
import { IEvents } from "./base/events";

export class Page extends Component<IPage> {
  protected _gallery: HTMLElement;
  protected _counter: HTMLElement;
  protected _modals: HTMLElement[];
  protected _wrapper: HTMLElement;
  protected _activeModal: HTMLElement | null = null;

  constructor(container: HTMLElement, protected events: IEvents) {
    super(container);

    this._gallery = ensureElement<HTMLElement>('.gallery', this.container);
    this._counter = ensureElement<HTMLElement>('.header__basket-counter', this.container);
    this._modals = ensureAllElements<HTMLElement>('.modal', this.container);
    this._wrapper = ensureElement<HTMLElement>('.page__wrapper', this.container);
    this._modals.forEach(modal => modal.classList.remove('modal_active'));

    this.container.addEventListener('click', (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest('.modal__close') || target.classList.contains('modal_active')) {
        this.modalClose();
      }
    })

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
    this.modalClose();
    const currentModal = this._modals.find(modal => !modal.classList.contains('modal_active'));
    if (currentModal) {
      const modalContent = ensureElement<HTMLElement>('.modal__content', currentModal);
      modalContent.replaceChildren(content);
      currentModal.classList.add('modal_active');
      this._activeModal = currentModal;
      this.locked = true;
    }
  }

  modalClose(): void {
    if(this._activeModal) {
      this._activeModal.classList.remove('modal_active');
      this._activeModal = null;
      this.locked = false;
    }
  }

  render(): HTMLElement {
    return this.container;
  }
}