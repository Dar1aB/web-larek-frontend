import { IOrderForm } from "../../types/components/IOrderForm";
import { ensureElement } from "../../utils/utils";
import { IEvents } from "../base/events";
import { Component } from "../base/component";

export class OrderForm extends Component<IOrderForm> {
  protected _submitBtn: HTMLButtonElement;
  protected _errors: HTMLElement;

  constructor(container: HTMLElement, protected events: IEvents) {
    super(container);
    
    this._submitBtn = ensureElement<HTMLButtonElement>('.button[type="submit"]', this.container);
    this._errors = ensureElement<HTMLElement>('.form__errors', this.container);

    this.container.addEventListener('submit', (event) => {
      event.preventDefault();
      this.onSubmit();
    })
  }

  protected onSubmit(): void {
    return
  };

  set isValid(value: boolean) {
    this.setDisable(this._submitBtn, !value);
  }

  set errors(value: string) {
    this.setText(this._errors, value);
  }

  render(data?: Partial<IOrderForm>): HTMLElement {
    if (data) {
      if (data.isValid !== undefined) this.isValid = data.isValid;
      if (data.errors !== undefined) this.errors = data.errors;
    }
    return this.container;
  }
}