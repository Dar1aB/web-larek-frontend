export interface IComponent<T = object> {
  readonly container: HTMLElement;
  render(data?: Partial<T>): HTMLElement;
}