import './scss/styles.scss';
import { Api } from './components/base/api';
import { EventEmitter } from './components/base/events';
import { AppStatus } from './components/AppStatus';
import { Basket } from './components/common/Basket';
import { Card } from './components/common/Card';
import { OrderForm } from './components/common/OrderForm';
import { Page } from './components/Page';
import { ensureElement, cloneTemplate, ensureAllElements } from './utils/utils';
import { API_URL} from './utils/constants';
import { IProductItem, IOrder } from './types';

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
    basket.items = basketItems;
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
    events.emit('modal:close');
  });

  events.on('basket:open', () => {
    events.emit('modal:open', basket.container);
  })
}

// ПРЕЗЕНТЕР ЗАКАЗА 

const orderPresenter = () => {
  let currentForm: OrderForm;
  let paymentForm: OrderForm;
  let contactsForm: OrderForm;
  
  events.on('order:open', () => {
    if (!paymentForm) {
      const paymentElement = cloneTemplate(orderTemplate);
      paymentForm = new OrderForm(paymentElement, events, 'payment');
    }
    const orderData = appData.getOrder();
    currentForm = paymentForm;
    currentForm.payment = 'card';
    currentForm.address = orderData.address || '';
    currentForm.isValid = false;
    currentForm.errors = '';

    currentForm.container.addEventListener('submit', (evt) => {
      evt.preventDefault();
      events.emit('paymentForm:submit');
    });

    paymentForm.container.addEventListener('input', (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (target.name === 'address') {
        events.emit('order.address:change', {
          field: 'address',
          value: target.value
        });
      }
    });
  
    const paymentBtn = ensureAllElements<HTMLButtonElement>('.button_alt', paymentForm.container);
    paymentBtn.forEach(btn => {
      btn.addEventListener('click', (event: MouseEvent) => {
        const target = event.target as HTMLButtonElement;
        if (target.name === 'card' || target.name === 'cash') {
          events.emit('order.payment:changed', {
            field: 'payment', 
            value: target.name as 'card' || 'cash' 
          });
        }  
      });
    });

    validOrder();
    events.emit('modal:open', currentForm.container);
  });

  events.on('paymentForm:submit', () => {
    const contactsElement = cloneTemplate(contactsTemplate);
    contactsForm = new OrderForm(contactsElement, events, 'contacts');
    const orderData = appData.getOrder();
    currentForm = contactsForm;
    currentForm.email = orderData.email || '';
    currentForm.phone = orderData.phone || '';
    currentForm.isValid = false;
    currentForm.errors = '';

    currentForm.container.addEventListener('submit', (evt) => {
      evt.preventDefault();
      events.emit('order:submit');
    });

    contactsForm.container.addEventListener('input', (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (target.name === 'email') {
        events.emit('order.email:change', {
          field: 'email',
          value: target.value
        });
      } else if (target.name === 'phone') {
        events.emit('order.phone:change', {
          field: 'phone', 
          value: target.value
        });
      }
    });

    validOrder();
    events.emit('modal:open', currentForm.container);
  })

  events.on('order:submit', () => {
    const total = appData.getOrder().total;
    currentForm = contactsForm;
    api.post('/order', appData.getOrder())
      .then(() => {
        appData.clearBasket();
        const successContent = cloneTemplate(successTemplate);
        const description = ensureElement<HTMLElement>('.order-success__description', successContent);
        const returnBtn = ensureElement<HTMLButtonElement>('.order-success__close', successContent);

        description.textContent = `Списано ${total} синапсов`;

        returnBtn.addEventListener('click', () => {
          events.emit('modal:close');
        });
            
        events.emit('modal:open', successContent);
      })
      .catch(error => {
        currentForm.errors = error.message;
      });
  });


  const validOrder = () => {
    if (currentForm === paymentForm) {
      const addressValid = Boolean(appData.getOrder().address);
      currentForm.isValid =  addressValid;
      if (!addressValid) {
        currentForm.errors = 'Необходимо указать адрес';
      } else {
        currentForm.errors = '';
      }
    } else {
      const emailValid = Boolean(appData.getOrder().email);
      const phoneValid = Boolean(appData.getOrder().phone);
      currentForm.isValid = emailValid && phoneValid;
      if (!emailValid && !phoneValid) {
        currentForm.errors = 'Необходимо указать email и телефон';
      } else if (!emailValid) {
        currentForm.errors = 'Необходимо указать email';
      } else if (!phoneValid) {
        currentForm.errors = 'Необходимо указать телефон';
      } else {
        currentForm.errors = '';
      }
    }
  }

  events.on(/^order\..*change/, (data: {field: keyof IOrder, value: string}) => {
    appData.setOrderFormField(data.field, data.value);
    validOrder();
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
      events.emit('catalog:changed', data.items);
    })
    .catch(error => {
      console.error('Ошибка: не удалось загрузить каталог', error)
    });
}

// ЗАПУСК ПРИЛОЖЕНИЯ

initApp();

