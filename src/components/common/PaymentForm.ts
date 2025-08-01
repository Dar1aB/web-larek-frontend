import { IOrderForm } from "../../types/components/IOrderForm";
import { ensureAllElements, ensureElement } from "../../utils/utils";
import { IEvents } from "../base/events";
import { OrderForm } from "./OrderForm";

interface IPaymentForm extends IOrderForm {
  payment: 'card' | 'cash';
  address: string;
}

export class PaymentForm extends OrderForm {
  protected _addressInput: HTMLInputElement;
  protected _paymentBtns: HTMLButtonElement[];

  constructor(container: HTMLElement, events: IEvents) {
    super(container, events);

    this._addressInput = ensureElement<HTMLInputElement>('input[name="address"]', this.container);
    this._paymentBtns = ensureAllElements<HTMLButtonElement>('.button_alt', this.container);

    this._addressInput.addEventListener('input', () => {
      this.events.emit('order.address:change', {
        field: 'address',
        value: this._addressInput.value
      })
    })

    this._paymentBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.events.emit('order.payment:change', {
          field: 'payment',
          value: btn.name as 'card' | 'cash'
        })
      })
    })
  }

  set payment(value: 'card' | 'cash') {
    this._paymentBtns.forEach(btn => {
      this.toggleClassName(btn, 'button_alt-active', btn.name === value);
    })
  }

  set address(value: string) {
    if (this._addressInput) this._addressInput.value = value ?? '';
  }

  protected onSubmit(): void {
    this.events.emit('paymentForm:submit');
  }

  render(data?: Partial<IPaymentForm>): HTMLElement {
    if (data) {
      if (data.payment) this.payment = data.payment;
      if (data.address) this.address = data.address;
      if (data.isValid !== undefined) this.isValid = data.isValid;
      if (data.errors !== undefined) this.errors = data.errors;
    }
    return this.container;
  }
}