import { IOrderForm } from "../../types/components/IOrderForm";
import { ensureElement } from "../../utils/utils";
import { IEvents } from "../base/events";
import { OrderForm } from "./OrderForm";

interface IContactsForm extends IOrderForm {
  email: string;
  phone: string;
}

export class ContactsForm extends OrderForm {
  protected _emailInput: HTMLInputElement;
  protected _phoneInput: HTMLInputElement;

  constructor(container: HTMLElement, events: IEvents) {
    super(container, events);

    this._emailInput = ensureElement<HTMLInputElement>('input[name="email"]', this.container);
    this._phoneInput = ensureElement<HTMLInputElement>('input[name="phone"]', this.container);

    this._emailInput.addEventListener('input', () => {
      this.events.emit('order.email:change', {
        field: 'email',
        value: this._emailInput.value
      })
    })

    this._phoneInput.addEventListener('input', () => {
      this.events.emit('order.phone:change', {
        field: 'phone',
        value: this._phoneInput.value
      })
    })
  }

  set email(value: string) {
    if (this._emailInput) this._emailInput.value = value ?? '';
  }

  set phone(value: string) {
    if (this._phoneInput) this._phoneInput.value = value ?? '';
  }

  protected onSubmit(): void {
    this.events.emit('order:submit');
  }

  render(data?: Partial<IContactsForm>): HTMLElement {
    if (data) {
      if (data.email) this.email = data.email;
      if (data.phone) this.phone = data.phone;
      if (data.isValid !== undefined) this.isValid = data.isValid;
      if (data.errors !== undefined) this.errors = data.errors;
    }
    return this.container;
  }
}