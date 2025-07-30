export interface ICard {
  title: string;
  price: number | null;
  category: string | null;
  image: string | null;
  description: string | null;
  inBasket: boolean;
}