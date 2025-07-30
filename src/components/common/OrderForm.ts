import { IOrder } from "../../types";
import { IOrderForm } from "../../types/components/IOrderForm";
import { ensureAllElements, ensureElement } from "../../utils/utils";
import { IEvents } from "../base/events";
import { Component } from "../base/component";

export class OrderForm extends Component<IOrder & IOrderForm> {
  protected _paymentBtns: HTMLButtonElement[];
  protected _addressInput: HTMLInputElement;
  protected _emailInput: HTMLInputElement;
  protected _phoneInput: HTMLInputElement;
  protected _submitBtn: HTMLButtonElement;
  protected _errors: HTMLElement;

  constructor(container: HTMLElement, protected events: IEvents, protected formType: 'payment' | 'contacts' = 'payment') {
    super(container);
    
    if (this.formType === 'payment') {
      this._addressInput = ensureElement<HTMLInputElement>('.form__input[name="address"]', this.container);
      this._paymentBtns = ensureAllElements<HTMLButtonElement>('.button_alt', this.container);
      this._submitBtn = ensureElement<HTMLButtonElement>('.order__button[type="submit"]', this.container);

    } else if (this.formType === 'contacts') {
      this._emailInput = ensureElement<HTMLInputElement>('.form__input[name="email"]', this.container);
      this._phoneInput = ensureElement<HTMLInputElement>('.form__input[name="phone"]', this.container);
      this._submitBtn = ensureElement<HTMLButtonElement>('.button[type="submit"]', this.container);
    }

    this._errors = ensureElement<HTMLElement>('.form__errors', this.container);
  }

  set payment(value: 'card' | 'cash') {
    if (!this._paymentBtns) return;
    this._paymentBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.payment = btn.name as 'card' | 'cash';
      });
      this.toggleClassName(btn, 'button_alt-active', btn.name === value);
    })
  }
  set address(value: string) {
    if (this._addressInput) this._addressInput.value = value ?? '';
  }
  set email(value: string) {
    if (this._emailInput) this._emailInput.value = value ?? '';
  }
  set phone(value: string) {
    if (this._phoneInput) this._phoneInput.value = value ?? '';
  }
  set isValid(value: boolean) {
    this.setDisable(this._submitBtn, !value);
  }
  set errors(value: string) {
    this.setText(this._errors, value);
  }

  render(data?: Partial<IOrder & IOrderForm>): HTMLElement {
    if (data) {
      if (data.payment !== undefined) this.payment = data.payment;
      if (data.address) this.address = data.address;
      if (data.email) this.email = data.email;
      if (data.phone) this.phone = data.phone;
      if (data.isValid !== undefined) this.isValid = data.isValid;
      if (data.errors) this.errors = data.errors;
    }
    return this.container;
  }
}