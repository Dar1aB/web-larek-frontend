import { IComponent } from "../../types/components/IComponent";

export abstract class Component<T = object> implements IComponent<T> {
  constructor (public readonly container: HTMLElement) {}

  protected setText(element: HTMLElement, text: string): void {
    if (element) element.textContent = text;
  }

  protected toggleClassName(element: HTMLElement, className: string, state?: boolean): void {
    element.classList.toggle(className, state);
  }  

  protected setDisable(element: HTMLElement, state: boolean): void {
    element.toggleAttribute('disabled', state);
  }

  abstract render(data?: Partial<T>): HTMLElement;
}