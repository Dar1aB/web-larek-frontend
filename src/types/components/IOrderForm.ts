export interface IOrderForm {
  payment: 'card' | 'cash';
  address: string;
  email: string;
  phone: string;
  isValid: boolean;
  errors: string;
}