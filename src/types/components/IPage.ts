export interface IPage  {
  counter: number;
  locked: boolean;
  renderModalOpen(content: HTMLElement): void;
  modalClose(): void;
}