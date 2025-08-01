# Проектная работа "Веб-ларек"

🚀 **Опубликованный проект:** [Веб-ларек на GitHub Pages](https://dar1ab.github.io/web-larek-frontend/)  
💻 **Исходный код:** [Репозиторий web-larek-frontend](https://github.com/Dar1aB/web-larek-frontend.git)

## Описание
Интерактивный интернет-магазин с товарами для веб-разработчиков, с возможностью посмотреть каталог товаров, добавить товары в корзину и сделать заказ.

Проект реализован по парадигме MVP (Model-View-Presenter) с использованием событийно-ориентированного подхода.

Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом
- src/components/common/ — папка с основными компонентами

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с главными типами
- src/types/components — папка с типами дальнейших компонентов
- src/index.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```
## Сборка

```
npm run build
```

или

```
yarn build
```

## СЛОЙ MODEL
Модели описаны в src/types/index.ts

Модели данных  
- `IProductItem` — описывает формат данных, приходящих с сервера  
Cодержит поля: id, title, price, category, image + опциональные description и inBasket  

- `IOrder` — описывает формат данных заказа
Содержит поля: payment, email, phone, address  

- `IOrderSubmit` — описывает формат данных заказа, отправляющихся на сервер, расширяет IOrder  
Содержит поля: items[], total + поля IOrder  

- `IAppStatus` — основной интерфейс состояния приложения. Отвечает за хранение данных каталога, корзины и заказа и управляет состоянием приложения.  
  Содержит исключительно методы:  

  - методы получения данных  
  getCatalog(): IProductItem[];  
  getBasket(): IProductItem[];  
  getOrder(): IOrder;  
  getPaidItems(): IProductItem[]; - оставляет исключительно платные товары  

  - методы изменения состояния  
  setCatalog(items: IProductItem[]): void;  
  setOrderFormField<K extends keyof IOrder>(field: K, value: IOrder[K]): void;   

  - проверка состояния корзины  
  hasNoItems(): boolean;  
  hasOnlyFreeItems(): boolean;  

  - методы работы с корзиной  
  addToBasket(item: IProductItem): void;  
  delFromBasket(id: string): void;  
  clearBasket(): void;  
  getTotal(): number;  

- метод валидации полей форм    
  validateOrder(form: 'payment' | 'contacts'): {isValid: boolean, errors: string};     

### ОСНОВНЫЕ ИНТЕРФЕЙСЫ ДАННЫХ

- `IComponent <T = object>` — базовый интерфейс-дженерик любого компонента  
  readonly container: HTMLElement - корневой DOM-элемент компонент  
  render(data?: Partial<T>): HTMLElement - метод рендеринга компонента  

- `IEvents` — интерфейс для брокера событий  
  on<T extends object>(event: EventName, callback: (data: T) => void): void - подписаться на событие  
  emit<T extends object>(event: string, data?: T): void - инициировать событие  
  trigger<T extends object>(event: string, context?: Partial<T>): (data: T) => void - создать триггер события  

- `IPage` — интерфейс состояния страницы  
  counter: number - счетчик товаров в корзине  
  locked: boolean - флаг блокировки прокрутки страницы при открытых модалках  

  методы:  
  renderModalOpen(content: HTMLElement): void - открытие модального окна вместе с его содержимым (content)  
  modalClose(): void - закрытие модального окна   

- `ICard` — интерфейс для данных отображения карточки товара  
  title: string - название товара  
  price: number | null - цена товара(может быть бесценным, то есть null)  
  category: string | null - категория товара (может отсутствовать)  
  image: string | null - изображение товара (может отсутствовать)  
  description: string | null - описание товара (может отсутствовать)  
  inBasket: boolean - флаг наличия товара в корзине  

- `IOrderForm` — главный интерфейс для состояния форм заказа  
  isValid: boolean - флаг валидности формы  
  errors: string - текст ошибок валидации  

- `IPaymentForm` — интерфейс для состояния формы с выбором оплаты заказа, расширяет IOrderForm   
  payment: 'card' | 'cash' - способ оплаты  
  address: string - значение адреса  

- `IContactsForm` — интерфейс для состояния формы с указанием контактов, расширяет IOrderForm  
  email: string - значение емейл  
  phone: string - значение телефона   

- `ISuccess` — интерфейс для состояния модалки успешного заказа  
  total: number - итоговая сумма списания  

- `IBasket` — интерфейс состояния корзины  
  items: HTMLElement[] - массив с товарами в корзине  
  total: number - итоговая сумма заказа  
  isEmpty: boolean - флаг пустой корзины  
  hasOnlyFreeItems: boolean - флаг наличия только бесценных товаров в корзине  

- `IBasketItem` — интерфейс для каждого элемента в списке корзины  
  index: number - порядковый номер элемента корзины  
  title: string - название элемента корзины  
  price: number | null - цена элемента корзины  
  id: string - id элемента корзины  


## СЛОЙ VIEW  
### БАЗОВНЫЕ КЛАССЫ  

- `Component <T = object>` — абстрактный базовый класс-дженерик для компонентов интерфейса. Имплементирует IComponent<T>  
  constructor (public readonly container: HTMLElement) {} - конструктор принимает DOM-элемент компонента  

  защищенные методы  
  protected setText - устанавливает текст элемента  
  protected toggleClassName - переключает класс элемента  
  protected setDisable - переключает у элемента состояние disabled  

  abstract render(data?: Partial<T>): HTMLElement - абстрактный метод рендеринга, обязательно должен быть реализован в дочерних классах!  

- `Api` — базовый класс для работы с API  
  readonly baseUrl: string - базовый URL API  
  protected options: RequestInit - настройки для API  

  методы  
  protected handleResponse - обрабатывает ответ от сервера  
  get(uri: string) - выполняет гет-запрос на сервер  
  post(uri: string, data: object, method: ApiPostMethods = 'POST') - выполняет пост,пут или дэлит-запросы на сервер  

### КЛАССЫ ОСНОВНЫХ КОМПОНЕНТОВ  
- `AppStatus` — основной класс модели приложения. Имплементирует интерфейс IAppStatus  
  private _catalog: IProductItem[] = [] - массив с товароми каталога, каждый из которых типа IProductItem  
  private _basket: IProductItem[] = [] - массив с товарами в корзине, каждый из которых типа IProductItem  
  private _order: IOrder = {  
    payment: 'card',  
    email: '',  
    phone: '',  
    address: ''  
  } - данные текущего заказа  

  методы получения данных  
  getCatalog(): IProductItem[] - копии каталога  
  getBasket(): IProductItem[] - копии корзины  
  getOrder(): IOrder - копии данных текущего заказа  
  getPaidItems(): IProductItem[] - только платных заказов  

  методы установки значений  
  setCatalog(items: IProductItem[]) - каталога товаров  
  setOrderFormField<K extends keyof IOrder>(field: K, value: IOrder[K]): void - поля заказа  

  методы проерки корзины на пустоту и только бесценные товары  
  hasNoItems(): boolean   
  hasOnlyFreeItems(): boolean   

  методы для работы с корзиной  
  addToBasket(item: IProductItem): void - добавляет товар в корзину  
  delFromBasket(id: string): void - удаляет товар из корзины  
  clearBasket(): void - очищает корзину  
  getTotal(): number - получает итоговую сумму из только платных товаров  

  метод валидации полей форм    
  validateOrder(form: 'payment' | 'contacts'): {isValid: boolean, errors: string}; - проверяет поля формы на заполненность и возвращает статус валидности и ошибки  

- `Page` — класс главной страницы. Имплементирует интерфейс IPage  
  protected _gallery: HTMLElement - контейнер для каталога карточек  
  protected _counter: HTMLElement - счетчик корзины  
  protected _modal: Modal - модальное окно  
  protected _wrapper: HTMLElement - контейнер-обертка для страницы  

  constructor(container: HTMLElement, protected events: IEvents) {  
    super(container); - вызывает родительский контейнер с переданным в конструктор класса document.body, а в последующих компонентах подготовленными шаблонами  
    ...  
    инициализация модального окна  
    const modalContainer = ensureElement<HTMLElement>('#modal-container',   this.container) - содержимое модалки  
    this._modal = new Modal(modalContainer, events) - новый экземпляр модалки с конкретным содержимым  
  }  
  
  сеттеры, устанавливающие каталог, счетчик корзины и флаг блокировки прокрутки страницы  
  set catalog(items: HTMLElement[])  
  set counter(value: number)  
  set locked(value: boolean)  

  методы  
  renderModalOpen(content: HTMLElement): void - ренедерит модалку с переданным контентом, и открывает ее    
  modalClose(): void - закрывает модалку   

  render(): HTMLElement {  
    return this.container - реализация абстрактного метода родителя, рендерит страницу   
  }  

- `Modal` — класс для модалок. На основе этого компонента контролируется состояние модалок и изменение их контента  
  protected _content: HTMLElement - контент модалки  
  protected _closeBtn: HTMLButtonElement - кнопкка закрытия модалки  

  сеттер для установки значения контента модалки  
  set content(value: HTMLElement)  

  методы открытия/закрытия модалки    
  open(): void   
  close(): void   

  render(data?: {content?: HTMLElement}): HTMLElement {  
    if (data?.content) {  
      this.content = data.content;  
    }  
    return this.container;  
  } - рендеринг модалки  

- `Card` — класс карточки товара. Имплементирует интерфейсы IProductItem и ICard. На основе этого компонента создаются карточки для каталога и карточки-превью  
  protected _title: HTMLElement - элемент названия товара  
  protected _price: HTMLElement - элемент цены товара  

  опциональные свойства  
  protected _button?: HTMLButtonElement | null - кнопка купить/удалить из корзины у карточки-превью   
  protected _category?: HTMLElement | null - категория товара  
  protected _image?: HTMLImageElement | null - изображение товара  
  protected _description?: HTMLElement | null - описание товара  

  сеттеры для всех свойств товара  
  set title(value: string)  
  set price(value: number | null)   
  set category(value: string)  
  set image(value: string)  
  set inBasket(value: boolean)  
  set description(value: string)   

  render(data?: Partial<IProductItem & ICard>): HTMLElement {  
    if (data) {  
      if (data.title) this.title = data.title;  
      if (data.price !== undefined) this.price = data.price;  
      if (data.category) this.category = data.category;  
      if (data.image) this.image = data.image;  
      if (data.inBasket !== undefined) this.inBasket = data.inBasket;  
      if (data.description) this.description = data.description;  
    }  
    return this.container;  
  } - рендеринг карточки   

- `OrderForm` — главный класс для форм заказа. Имплементирует интерфейс IOrderForm. На основе этого класса создаются классы для адресной и контактной формы с соответствующими свойствами    
  protected _submitBtn: HTMLButtonElement - кнопка перехода на следующую форму/ отправки заказа на сервер  
  protected _errors: HTMLElement - элемент отображения ошибок валидации формы  

  сеттеры для состояния валидности формы и ошибок  
  set isValid(value: boolean)  
  set errors(value: string)  

  защищенный метод, подготовлен для последующей различной реализации в дочерних классах форм  
  protected onSubmit(): void  

  render(data?: Partial<IOrderForm>): HTMLElement {  
    if (data) {   
      if (data.isValid !== undefined) this.isValid = data.isValid;  
      if (data.errors !== undefined) this.errors = data.errors;  
    }  
    return this.container;  
  } - рендеринг состояния и ошибок форм  

- `PaymentForm` — класс для формы с оплатой и адресом заказа. Расширяет класс OrderForm.  
  protected _addressInput: HTMLInputElement - поле с адресом  
  protected _paymentBtns: HTMLButtonElement[] - кнопки с выбором оплаты  

  сеттеры способа оплаты и адреса  
  set payment(value: 'card' | 'cash')  
  set address(value: string)  

  защищенный метод родителя, с инициализацией события перехода на контактную форму   
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
  } - рендеринг формы с оплатой  

- `ContactsForm` — класс для формы контактными данными заказа. Расширяет класс OrderForm.  
  protected _emailInput: HTMLInputElement - поле с емейл  
  protected _phoneInput: HTMLInputElement - поле с телефоном  

  сеттеры емейл и телефона  
  set email(value: string)  
  set phone(value: string)  

  защищенный метод родителя, с инициализацией события отправки готового заказа на сервер  
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
  } - рендеринг формы с контактами  

- `Success` — класс для модалки успешного состояния после оформления и отаправки заказа. Имплементирует интерфейс ISuccess.  
  protected _description: HTMLElement - описание с суммой итогового списания  
  protected _closeBtn: HTMLButtonElement - кнопка закрытия модалки  

  сеттер для установки описания с итоговой суммой заказа  
  set total(value: number) {  
    this._description.textContent = `Списано ${value} синапсов`;  
  }  

  render(data?: Partial<ISuccess>): HTMLElement {  
    if (data?.total !== undefined) {  
      this.total = data.total;  
    }  
    return this.container;  
  } - рендеринг описания   

- `Basket` — класс для корзины товаров. Имплементирует интерфейс IBasket.  
  protected _list: HTMLElement - список товаров корзины  
  protected _total: HTMLElement - итоговая сумма заказа  
  protected _button: HTMLButtonElement - кнопка оформить, которая перебрасывает в адресную форму  
  protected _empty: HTMLElement - элемент пустой корзины  

  сеттеры для установки  
  set items(items: HTMLElement[]) - товаров типа HTMLElement в корзине   
  set total(total: number) - итоговой суммы  
  set isEmpty(value: boolean) - состояния пустой корзины  
  set hasOnlyFreeItems(value: boolean) - наличия только бесценных товаров в корзине  

  render(data?: Partial<IBasket>): HTMLElement {  
    if (data) {  
      if (data.items) this.items = data.items;  
      if (data.total) this.total = data.total;  
      if (data.isEmpty !== undefined) this.isEmpty = data.isEmpty;  
      if (data.hasOnlyFreeItems !== undefined) this.hasOnlyFreeItems = data.hasOnlyFreeItems;  
    }  
    return this.container;  
  } рендеринг корзины  

- `BasketItem` — класс для каждого элемента корзины. Имплементирует интерфейс IBasketItem.  
  protected _index: HTMLElement - индекс товара в корзине   
  protected _title: HTMLElement - название товара в корзине   
  protected _price: HTMLElement - цена товара в корзине  
  protected _delBtn: HTMLButtonElement - кнопка-корзинка для удаления товара из корзины  

  сеттеры для свойств класса  
  set index(value: number)  
  set title(value: string)  
  set price(value: number | null)  

  render(data?: Partial<IBasketItem>): HTMLElement {  
      if (data) {  
        if (data.index !== undefined) this.index = data.index;  
        if (data.title) this.title = data.title;  
        if (data.price !== undefined) this.price = data.price;  
        if (data.id) this._delBtn.dataset.id = data.id;  
      }  
      return this.container;  
  } - рендеринг товара в корзине  

### БРОКЕР СОБЫТИЙ  
- `EventEmitter` — базовый класс для работы с событиями. Имплементирует интерфейс IEvents.  
   _events: Map<EventName, Set<Subscriber>> - коллекция событий  

    constructor() {  
        this._events = new Map<EventName, Set<Subscriber>>();  
    }  

  подписывается на событие  
    on<T extends object>(eventName: EventName, callback: (event: T) => void)  

  отписывается от события  
    off(eventName: EventName, callback: Subscriber)   

  инициирует событие  
    emit<T extends object>(eventName: string, data?: T)  

  подписывается на все события  
    onAll(callback: (event: EmitterEvent) => void)  

  отписвается от всех событий  
    offAll()   

  создает триггер для всех событий  
    trigger<T extends object>(eventName: string, context?: Partial<T>)   

## СЛОЙ PRESENTER   
код презентера не выделен в отдельный класс, а размещен в основном файле приложения src/index.ts  

- `modalPresenter` — обрабатывает состояние модалок.  
'modal:open' - открывает модалку и запрещает прокрутку страницы  
'modal:close' - закрывает модалку и разрешает прокрутку страницы  

- `catalogPresenter` — обрабатывает события каталога товаров и карточки-превью.  
'catalog:changed' - обновляет отображение каталога  
'card:select' - открывает модалку с превью-карточкой  

- `basketPresenter` — обрабатывает события корзины.  
'basket:changed' - обновляет состояние корзины  
'basket:add' - добавляет товар в корзину  
'basket:remove' - удаляет товар из корзины  
'basket:open' - открывает модалку корзины  

- `orderPresenter` — обрабатывает события заказа.  
'order:open' - открывает модалку адресной формы  
'paymentForm:submit' - открывает модалку контактной формы  
'order:submit' - отправляет пост-запрос с подготовленным заказом типа IOrderSubmit на сервер  
'/^order\..*change/' - обновляет состояние полей форм   

### СОБЫТИЙНАЯ МОДЕЛЬ  
пример взаимодействия в приложении:  
- `1.` Пользователь нажимает на кнопку "купить" в карточке-превью (класс Card)  
- `2.` Класс Card инициирует событие добавления в корзину 'basket:add' с данными из карточки  
- `3.` Презентер basketPresenter обрабатывает это событие и вызывает appData.addToBasket(item: IProductItem)  
- `4.` AppStatus добавляет конкретный товар в корзину и инициирует событие 'basket:changed'  
- `5.` basketPresenter обрабатывает это событие, создает экзепляры BasketItem для каждого товара и обновляет вью класс Basket и счетчик в Page   
