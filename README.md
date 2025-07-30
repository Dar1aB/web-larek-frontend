# Проектная работа "Веб-ларек"

🚀 **Опубликованный проект:** [Веб-ларек на GitHub Pages]()  
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

- `IOrder` — описывает формат данных, уходящих на сервер при оформлении заказа
Содержит поля: payment, email, phone, address, items и total

- `IAppStatus` — основной интерфейс состояния приложения. Отвечает за хранение данных каталога, корзины и заказа и управляет состоянием приложения.
  Содержит исключительно методы:

  - методы получения данных
  getCatalog(): IProductItem[];
  getBasket(): IProductItem[];
  getOrder(): IOrder;

  - методы изменения состояния
  setCatalog(items: IProductItem[]): void;
  setOrderFormField<K extends keyof IOrder>(field: K, value: IOrder[K]): void;

  - подготовка заказа к отправки
  prepareOrder(): IOrder;

  - проверка состояния корзины
  hasNoItems(): boolean;
  hasOnlyFreeItems(): boolean;

  - методы работы с корзиной
  addToBasket(item: IProductItem): void;
  delFromBasket(id: string): void;
  clearBasket(): void;
  getTotal(): number;

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

- `IOrderForm` — интерфейс для данных в формах заказа
  payment: 'card' | 'cash' - выбранный способ оплаты
  address: string - введенный адрес
  email: string - введенный емэйл
  phone: string - введенный номер телефона
  isValid: boolean - флаг валидности формы
  errors: string - текст ошибок валидации

- `IBasket` — интерфейс состояния корзины
  items: IProductItem[] - массив с товарами в корзине
  total: number - итоговая сумма заказа
  isEmpty: boolean - флаг пустой корзины
  hasOnlyFreeItems: boolean - флаг наличия только бесценных товаров в корзине

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
    address: '',
    items: [],
    total: 0
  } - данные текущего заказа

  методы получения данных
  getCatalog(): IProductItem[] - копии каталога
  getBasket(): IProductItem[] - копии корзины
  getOrder(): IOrder {
    this.prepareOrder();
    return {...this._order}
  } - копии данных заказа, который будет отправляться на сервер, подготовленного перед этим методом prepareOrder()

  методы установки значений
  setCatalog(items: IProductItem[]) - каталога товаров
  setOrderFormField<K extends keyof IOrder>(field: K, value: IOrder[K]): void - поля заказа

  методы проерки корзины на пустоту и только бесценные товары
  hasNoItems(): boolean 
  hasOnlyFreeItems(): boolean 

  метод подготовки заказа к отправки на сервер (в формате IOrder) + проверка и вывод в консоль ошибки при наличии только бесценного товара
  prepareOrder(): IOrder {
    if (this.hasOnlyFreeItems()) {
      console.log('Ошибка: в корзине сейчас только бесценный товар');
    }
    this._updateOrderData();
    return this._order;
  };

  методы для работы с корзиной
  addToBasket(item: IProductItem): void - добавляет товар в корзину
  delFromBasket(id: string): void - удаляет товар из корзины
  clearBasket(): void - очищает корзину
  getTotal(): number - получает итоговую сумму

  приватный метод класса, используется для обновления заказа и итоговой суммы
  private _updateOrderData(): void {
    this._order.items = this.hasOnlyFreeItems() ? [] : this._basket.filter(item => item.price !== null).map(item => item.id);
    this._order.total = this.getTotal();
  }

- `Page` — класс главной страницы. Имплементирует интерфейс IPage
  protected _gallery: HTMLElement - контейнер для каталога карточек
  protected _counter: HTMLElement - счетчик корзины
  protected _modals: HTMLElement[] - массив модалок
  protected _wrapper: HTMLElement - контейнер-обертка для страницы
  protected _activeModal: HTMLElement | null = null - текущее активная модалка (может и отсутствовать)

  constructor(container: HTMLElement, protected events: IEvents) {
    super(container); - вызывает родительский контейнер с переданным в конструктор класса document.body, а в последующих компонентах подготовленными шаблонами
    ...
  }
  
  сеттеры, устанавливающие каталог, счетчик корзины и флаг блокировки прокрутки страницы
  set catalog(items: HTMLElement[])
  set counter(value: number)
  set locked(value: boolean)

  методы
  renderModalOpen(element: HTMLElement): void - открывает модалку с содержимым, принимает контент модалки
  modalClose(): void - закрывает модалку

  render(): HTMLElement {
    return this.container - реализация абстрактного метода родителя, рендерит страницу 
  }

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

- `OrderForm` — класс для форм товара. Имплементирует интерфейсы IOrder и IOrderForm. На основе этого компонента создаются адресная и контактная формы с соответствующими свойствами
  protected _paymentBtns: HTMLButtonElement[] - кнопки выбора способа облаты
  protected _addressInput: HTMLInputElement - поле ввода адреса
  protected _emailInput: HTMLInputElement - поле ввода емэйл
  protected _phoneInput: HTMLInputElement - поле ввода телефона
  protected _submitBtn: HTMLButtonElement - кнопка перехода на следующую форму/ отправки заказа на сервер
  protected _errors: HTMLElement - элемент отображения ошибок валидации формы

  constructor(container: HTMLElement, protected events: IEvents, protected formType: 'payment' | 'contacts' = 'payment') {...} - в контейнер также передается флаг типа формы: адресной или контактной

  сеттеры для всех свойств формы
  set payment(value: 'card' | 'cash')
  set address(value: string) 
  set email(value: string) 
  set phone(value: string) 
  set isValid(value: boolean)
  set errors(value: string)

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
  } - рендеринг формы

- `Basket` — класс для корзины товаров. Имплементирует интерфейс IBasket.
  protected _list: HTMLElement - список товаров корзины
  protected _total: HTMLElement - итоговая сумма заказа
  protected _button: HTMLButtonElement - кнопка оформить, которая перебрасывает в адресную форму
  protected _empty: HTMLElement - элемент пустой корзины

  сеттеры для установки
  set items(items: IProductItem[]) - товаров типа IProductItem в корзине
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
'order:submit' - отправляет пост-запрос с подготовленным заказом на сервер
'/^order\..*change/' - обновляет состояние полей форм

- `modalPresenter` — обрабатывает состояние модалок.
'modal:open' - открывает модалку и запрещает прокрутку страницы
'modal:close' - закрывает модалку и разрешает прокрутку страницы

### СОБЫТИЙНАЯ МОДЕЛЬ
пример взаимодействия в приложении:
- `1.` Пользователь нажимает на кнопку "купить" в карточке-превью (класс Card)
- `2.` Класс Card инициирует событие добавления в корзину 'basket:add' с данными из карточки
- `3.` Презентер basketPresenter обрабатывает это событие и вызывает appData.addToBasket(item: IProductItem)
- `4.` AppStatus добавляет конкретный товар в корзину и инициирует событие 'basket:changed'
- `5.` basketPresenter обрабатывает это событие и получает обновленную корзину с помощью appData.getBasket(), а также обновляет вью класс Basket
- `6.` Класс Basket рендерится с новыми данными