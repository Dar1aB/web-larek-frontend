import './scss/styles.scss';
import { Api } from './components/base/api';
import { EventEmitter } from './components/base/events';
import { AppStatus } from './components/AppStatus';
import { Basket } from './components/common/Basket';
import { Card } from './components/common/Card';
import { Page } from './components/Page';
import { ensureElement, cloneTemplate} from './utils/utils';
import { API_URL} from './utils/constants';
import { IProductItem, IOrder } from './types';
import { IOrderSubmit } from './types';
import { BasketItem } from './components/common/BasketItem';
import { Success } from './components/common/Success';
import { PaymentForm } from './components/common/PaymentForm';
import { ContactsForm } from './components/common/ContactsForm';
import { OrderForm } from './components/common/OrderForm';

const catalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts')
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

const events = new EventEmitter();
const api = new Api(API_URL);
const appData = new AppStatus(events);

const page = new Page(document.body, events);
const basket = new Basket(cloneTemplate(basketTemplate), events);
const success = new Success(cloneTemplate(successTemplate), events);
const paymentForm = new PaymentForm(cloneTemplate(orderTemplate), events);
const contactsForm = new ContactsForm(cloneTemplate(contactsTemplate), events);

//               !!!!!!!ПРЕЗЕНТЕРЫ!!!!!!!
// ПРЕЗЕНТЕР КАТАЛОГА
const catalogPresenter = () => {
  events.on('catalog:changed', (items: IProductItem[]) => {
    const cards = items.map(item => {
      const card = new Card(cloneTemplate(catalogTemplate), {
        onClick: () => events.emit('card:select', item)
      });
      const element = card.render({
        title: item.title,
        image: item.image,
        price: item.price,
        category: item.category,
      });
      element.dataset.id = item.id;
      return element;
    });
    page.catalog = cards;
  });

  events.on('card:select', (item: IProductItem) => {
    const inBasketBoolean = appData.getBasket().some(element => element.id === item.id);
    const cardPreview = new Card(cloneTemplate(cardTemplate), {
      onClick: () => {
        if (inBasketBoolean) {
          events.emit('basket:remove', {id: item.id});
          events.emit('modal:close');
        } else {
        events.emit('basket:add', item);
        }
      }
    });
    const element = cardPreview.render({
      title: item.title,
      image: item.image,
      price: item.price,
      category: item.category,
      description: item.description,
      inBasket: inBasketBoolean
    });
    events.emit('modal:open', element);
  })
}

// ПРЕЗЕНТЕР КОРЗИНЫ

const basketPresenter = () => {
  events.on('basket:changed', () => {
    const basketItems = appData.getBasket();
    const items = basketItems.map((item, index) => {
      const basketItem = new BasketItem(cloneTemplate('#card-basket'), events);
      return basketItem.render({
        index: index + 1,
        title: item.title,
        price: item.price,
        id: item.id
      })
    });
    basket.items = items;
    basket.total = appData.getTotal();
    basket.isEmpty = appData.hasNoItems();
    basket.hasOnlyFreeItems = appData.hasOnlyFreeItems();

    page.counter = basketItems.length;
  });

  events.on('basket:add', (item: IProductItem) => {
    appData.addToBasket(item);
    events.emit('modal:close');
  });

  events.on('basket:remove', (data: {id: string}) => {
    appData.delFromBasket(data.id);
  });

  events.on('basket:open', () => {
    events.emit('modal:open', basket.container);
  })
}

// ПРЕЗЕНТЕР ЗАКАЗА 

const orderPresenter = () => {
  let currentForm: OrderForm = paymentForm;
  events.on('order:open', () => {
    const orderData = appData.getOrder();
    const validation = appData.validateOrder('payment');
    currentForm = paymentForm;
    paymentForm.render({
      payment: orderData.payment || 'card',
      address: orderData.address || '',
      isValid: validation.isValid,
      errors: validation.errors
    })
    events.emit('modal:open', paymentForm.container);
  });

  events.on('paymentForm:submit', () => {
    const orderData = appData.getOrder();
    const validation = appData.validateOrder('contacts');
    currentForm = contactsForm;
    contactsForm.render({
      email: orderData.email || '',
      phone: orderData.phone || '',
      isValid: validation.isValid,
      errors: validation.errors
    })
    events.emit('modal:open', contactsForm.container);
  })

  events.on('order:submit', () => {
    const readyOrder: IOrderSubmit = {
      ...appData.getOrder(),
      items: appData.getPaidItems().map(item => item.id),
      total: appData.getTotal()
    };
    api.post('/order', readyOrder)
      .then((res) => {
        appData.clearBasket();
        success.total = (res as {total: number}).total;
            
        events.emit('modal:open', success.container);
      })
      .catch(error => {
        contactsForm.errors = error.message;
      });
  });

  events.on(/^order\..*change/, (data: {field: keyof IOrder, value: string}) => {
    appData.setOrderFormField(data.field, data.value);
    const orderData = appData.getOrder();
    if (currentForm === paymentForm) {
      const validation = appData.validateOrder('payment');
      paymentForm.render({
        payment: orderData.payment,
        address: orderData.address,
        isValid: validation.isValid,
        errors: validation.errors
      })
    } else if (currentForm === contactsForm) {
      const validation = appData.validateOrder('contacts');
      contactsForm.render({
        email: orderData.email,
        phone: orderData.phone,
        isValid: validation.isValid,
        errors: validation.errors
      })
    }
  });
}

// ПРЕЗЕНТЕР МОДАЛОК

const modalPresenter = () => {
  events.on('modal:open', (content?: HTMLElement) => {
    if (content) {
      page.renderModalOpen(content);
      page.locked = true;
    }  
  });
  events.on('modal:close', () => {
    page.modalClose();
    page.locked = false;
  });
}

// ИНИЦИАЛИЗАЦИЯ ВСЕГО ПРИЛОЖЕНИЯ

const initApp = () => {
  modalPresenter();
  catalogPresenter();
  basketPresenter();
  orderPresenter();

  api.get('/product')
    .then((data: {items: IProductItem[]}) => {
      appData.setCatalog(data.items);
    })
    .catch(error => {
      console.error('Ошибка: не удалось загрузить каталог', error)
    });
}

// ЗАПУСК ПРИЛОЖЕНИЯ

initApp();

