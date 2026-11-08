// общий js для всех страниц
const $ = (selector, root = document) => root.querySelector(selector);
const esc = (value) => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = (value) => Math.round(value).toLocaleString('ru-RU') + ' ₽';

// настройки магазина
const DELIVERY_PRICE = 500;          // стоимость доставки
const FREE_DELIVERY_FROM = 10000;    // бесплатная доставка от этой суммы
const PICKUP_POINTS = ['Склад «Северный», ул. Промышленная, 14', 'Пункт выдачи «Центр», пр-т Строителей, 7'];
const STATUSES = { new: 'Новый', work: 'В работе', done: 'Выполнен', cancelled: 'Отменён' };
const CATEGORIES = [
  { id: 'dry', name: 'Цемент и сухие смеси' },
  { id: 'brick', name: 'Кирпич и блоки' },
  { id: 'wood', name: 'Пиломатериалы и плиты' },
  { id: 'paint', name: 'Краски и грунтовки' },
  { id: 'tools', name: 'Инструмент' },
];

// данные товаров
const SEED_PRODUCTS = [
  { id: 1, cat: 'dry', brand: 'Евроцемент', name: 'Цемент М500 Д0, 50 кг', price: 520, unit: 'мешок', stock: 340 },
  { id: 2, cat: 'dry', brand: 'Knauf', name: 'Штукатурка гипсовая Ротбанд, 30 кг', price: 790, unit: 'мешок', stock: 210 },
  { id: 3, cat: 'dry', brand: 'Ceresit', name: 'Плиточный клей CM 11 Plus, 25 кг', price: 560, unit: 'мешок', stock: 180 },
  { id: 4, cat: 'dry', brand: 'Основит', name: 'Наливной пол Скоростной, 25 кг', price: 690, unit: 'мешок', stock: 95 },
  { id: 5, cat: 'brick', brand: 'Керамика', name: 'Кирпич керамический одинарный М-150', price: 9240, unit: 'шт', stock: 12000 },
  { id: 6, cat: 'brick', brand: 'Литос', name: 'Кирпич облицовочный красный', price: 15960, unit: 'шт', stock: 400 },
  { id: 7, cat: 'brick', brand: 'Bonolit', name: 'Газобетонный блок D500 600×200×300', price: 13680, unit: 'шт', stock: 150 },
  { id: 8, cat: 'brick', brand: 'Волма', name: 'Пазогребневая плита гипсовая 667×500×80', price: 300, unit: 'шт', stock: 800 },
  { id: 9, cat: 'wood', brand: 'Лесной двор', name: 'Доска обрезная сосна 50×150×6000', price: 890, unit: 'шт', stock: 260 },
  { id: 10, cat: 'wood', brand: 'Swiss Krono', name: 'Плита OSB-3, 9 мм, 1250×2500', price: 790, unit: 'лист', stock: 120 },
  { id: 11, cat: 'wood', brand: 'Свеза', name: 'Фанера ФК берёзовая, 12 мм', price: 4560, unit: 'шт', stock: 70 },
  { id: 12, cat: 'paint', brand: 'Снежка', name: 'Краска акриловая для стен и потолков, 14 кг', price: 3290, unit: 'ведро', stock: 60 },
  { id: 13, cat: 'paint', brand: 'Ceresit', name: 'Грунтовка глубокого проникновения, 10 л', price: 890, unit: 'канистра', stock: 0 },
  { id: 14, cat: 'tools', brand: 'Bosch', name: 'Перфоратор SDS-plus, 800 Вт', price: 7990, unit: 'шт', stock: 14 },
  { id: 15, cat: 'tools', brand: 'DeWalt', name: 'Шуруповёрт аккумуляторный 18 В', price: 6490, unit: 'шт', stock: 25 },
  { id: 16, cat: 'tools', brand: 'Stayer', name: 'Уровень строительный 1000 мм', price: 1190, unit: 'шт', stock: 40 },
];

// данные пользователей (для теста)
const SEED_USERS = [
  { id: 1, role: 'admin', name: 'Администратор', email: 'admin@stroymarket.ru', phone: '+7 (900) 111-22-33', address: '', password: 'Admin123', blocked: false },
  { id: 2, role: 'customer', name: 'Иван Петров', email: 'ivan@example.com', phone: '+7 (912) 345-67-89', address: 'ул. Садовая, 15, кв. 24', password: 'User12345', blocked: false },
];

const daysAgo = (n) => new Date(Date.now() - n * 864e5).toISOString();
const SEED_ORDERS = () => [
  {
    id: 1001, userId: 2, date: daysAgo(6), items: [{ id: 1, name: SEED_PRODUCTS[0].name, price: 520, qty: 10 }], name: 'Иван Петров', phone: '+7 (912) 345-67-89',
    delivery: { type: 'delivery', address: 'ул. Садовая, 15, кв. 24' }, deliveryCost: 0, total: 5200, status: 'done'
  },
  {
    id: 1002, userId: 2, date: daysAgo(2), items: [{ id: 14, name: SEED_PRODUCTS[13].name, price: 7990, qty: 1 }], name: 'Иван Петров', phone: '+7 (912) 345-67-89',
    delivery: { type: 'pickup', point: PICKUP_POINTS[0] }, deliveryCost: 0, total: 7990, status: 'work'
  },
];

// localstorage 
const memory = {};
const DB = {
  get(key, seed) {
    try { const text = localStorage.getItem('sm_' + key); if (text) return JSON.parse(text); } catch (e) { if (memory[key]) return memory[key]; }
    const data = typeof seed === 'function' ? seed() : seed;
    DB.set(key, data);
    return data;
  },
  set(key, value) { memory[key] = value; try { localStorage.setItem('sm_' + key, JSON.stringify(value)); } catch (e) { } },
  remove(key) { delete memory[key]; try { localStorage.removeItem('sm_' + key); } catch (e) { } },
  products: () => DB.get('products', SEED_PRODUCTS),
  users: () => DB.get('users', SEED_USERS),    // пароли
  orders: () => DB.get('orders', SEED_ORDERS),
  nextId: (list) => list.reduce((max, row) => Math.max(max, row.id), 0) + 1,
};

// Вход
const currentUser = () => {
  const id = DB.get('session', null);
  const user = id && DB.users().find((u) => u.id === id);
  return user && !user.blocked ? user : null;
};
const homeFor = (user) => (user.role === 'admin' ? 'admin.html' : 'account.html');
function logout() { DB.remove('session'); location.href = 'index.html'; }

// защита для страницы личного кабинета
function requireRole(role) {
  const user = currentUser();
  if (!user) { location.replace('login.html?next=' + location.pathname.split('/').pop()); return null; }
  if (user.role !== role) { location.replace(homeFor(user)); return null; }
  return user;
}

// Корзина
const getCart = () => DB.get('cart', []);
const saveCart = (cart) => { DB.set('cart', cart); updateCartCount(); };
function addToCart(id) {
  const product = DB.products().find((p) => p.id === id);
  const cart = getCart();
  const line = cart.find((l) => l.id === id);
  if (line) line.qty = Math.min(line.qty + 1, product.stock); else cart.push({ id, qty: 1 });
  saveCart(cart);
}
function updateCartCount() { $('#cartCount').textContent = getCart().reduce((sum, l) => sum + l.qty, 0); }

// Проверка форм
const rule = {
  required: (msg) => (v) => (v ? '' : msg),
  email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'Введите email в формате name@example.ru'),
  phone: (v) => (v.replace(/\D/g, '').length >= 10 ? '' : 'Введите телефон, например +7 900 123-45-67'),
  min: (n, msg) => (v) => (v.length >= n ? '' : msg),
};

function validate(form, rules) {
  let first = null;
  Object.entries(rules).forEach(([name, check]) => {
    const input = form.elements[name];
    const message = [].concat(check).map((fn) => fn(input.value.trim(), form)).find(Boolean) || '';
    input.classList.toggle('invalid', Boolean(message));
    $('.error', input.closest('.field')).textContent = message;
    if (message && !first) first = input;
  });
  if (first) first.focus();
  return !first;
}

// Фото для карточек товара (заглушки + фото)
const photo = (p, cls = '') => `<div class="ph ${cls}"><span>Фото</span><img src="${esc(p.img || 'images/' + p.id + '.webp')}" alt="" onerror="if(this.dataset.f){this.remove()}else{this.dataset.f=1;this.src='images/cat-${p.cat}.svg'}"></div>`;
function productCard(p) {
  return `<article class="card">${photo(p)}
    <div class="card__body">
      <div class="card__brand">${esc(p.brand)}</div>
      <div class="card__name">${esc(p.name)}</div>
      <div class="card__price">${money(p.price)} <small>за ${esc(p.unit)}</small></div>
      <div class="stock ${p.stock ? '' : 'stock--out'}">${p.stock ? 'В наличии' : 'Нет в наличии'}</div>
      <button class="btn btn--accent" data-add="${p.id}" ${p.stock ? '' : 'disabled'}>В корзину</button>
    </div></article>`;
}
document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-add]');
  if (!button) return;
  addToCart(Number(button.dataset.add));
  button.textContent = 'Добавлено ✓';
  setTimeout(() => { button.textContent = 'В корзину'; }, 1200);
});

// Шапка (пользователь + счетчик корзины)
(function initHeader() {
  const user = currentUser();
  $('#userBox').innerHTML = user
    ? `<a href="${homeFor(user)}">${esc(user.name)}</a><a href="#" id="logoutLink">Выйти</a>`
    : '<a href="login.html">Войти</a><a href="register.html">Регистрация</a>';
  if (user) $('#logoutLink').addEventListener('click', (e) => { e.preventDefault(); logout(); });
  updateCartCount();
})();

// Код для каждой страницы
const pages = {};

// Главная
pages.index = function () {
  $('#cats').innerHTML = CATEGORIES.map((c) => `<a href="catalog.html?cat=${c.id}">${esc(c.name)}</a>`).join('');
  $('#popular').innerHTML = DB.products().slice(0, 8).map(productCard).join('');
};

// Каталог
pages.catalog = function () {
  const params = new URLSearchParams(location.search);
  let category = params.get('cat') || '';
  $('#fQuery').value = params.get('q') || '';

  function renderCats() {
    const all = [{ id: '', name: 'Все категории' }, ...CATEGORIES];
    $('#fCats').innerHTML = all.map((c) =>
      `<label class="check"><input type="radio" name="cat" value="${c.id}" ${c.id === category ? 'checked' : ''}> ${esc(c.name)}</label>`).join('');
  }

  function render() {
    const words = $('#fQuery').value.toLowerCase().split(/\s+/).filter(Boolean);
    const min = Number($('#fMin').value) || 0;
    const max = Number($('#fMax').value) || Infinity;
    let list = DB.products().filter((p) => {
      const text = (p.name + ' ' + p.brand).toLowerCase();
      return words.every((w) => text.includes(w)) && (!category || p.cat === category)
        && p.price >= min && p.price <= max && (!$('#fStock').checked || p.stock > 0);
    });
    const sort = $('#fSort').value;
    if (sort === 'asc') list.sort((a, b) => a.price - b.price);
    if (sort === 'desc') list.sort((a, b) => b.price - a.price);
    if (sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
    $('#count').textContent = 'Найдено товаров: ' + list.length;
    $('#list').innerHTML = list.length ? list.map(productCard).join('')
      : '<div class="box" style="grid-column:1/-1">Ничего не найдено. Измените запрос или сбросьте фильтры.</div>';
  }

  $('#fCats').addEventListener('change', (e) => { category = e.target.value; render(); });
  ['fQuery', 'fMin', 'fMax'].forEach((id) => $('#' + id).addEventListener('input', render));
  ['fStock', 'fSort'].forEach((id) => $('#' + id).addEventListener('change', render));
  $('#fReset').addEventListener('click', () => {
    category = '';['fQuery', 'fMin', 'fMax'].forEach((id) => { $('#' + id).value = ''; });
    $('#fStock').checked = false; $('#fSort').value = ''; renderCats(); render();
  });
  renderCats();
  render();
};

// Корзина
pages.cart = function () {
  const form = $('#orderForm');
  const user = currentUser();
  if (user) { form.elements.name.value = user.name; form.phone.value = user.phone; form.address.value = user.address || ''; }
  $('#point').innerHTML = PICKUP_POINTS.map((p) => `<option>${esc(p)}</option>`).join('');

  const mode = () => form.mode.value;
  const cartLines = () => getCart().map((l) => ({ ...l, product: DB.products().find((p) => p.id === l.id) })).filter((l) => l.product);
  const itemsSum = () => cartLines().reduce((s, l) => s + l.product.price * l.qty, 0);
  const deliveryCost = () => (mode() === 'pickup' || itemsSum() >= FREE_DELIVERY_FROM || !itemsSum() ? 0 : DELIVERY_PRICE);

  function render() {
    const lines = cartLines();
    if (!lines.length) {
      $('#lines').innerHTML = '<div class="box">Корзина пуста. <a href="catalog.html">Перейти в каталог</a></div>';
      form.hidden = true;
      return;
    }
    form.hidden = false;
    $('#lines').innerHTML = `<div class="table-wrap"><table><tbody>${lines.map((l) => `<tr>
      <td><div class="item">${photo(l.product, 'ph--small')}<div>${esc(l.product.name)}<div class="muted">${money(l.product.price)} за ${esc(l.product.unit)}</div></div></div></td>
      <td><div class="qty"><button data-dec="${l.id}" aria-label="Меньше">−</button>${l.qty}<button data-inc="${l.id}" aria-label="Больше">+</button></div></td>
      <td class="num"><b>${money(l.product.price * l.qty)}</b></td>
      <td><button class="btn btn--light btn--small" data-del="${l.id}">Удалить</button></td></tr>`).join('')}</tbody></table></div>`;
    $('#sumItems').textContent = money(itemsSum());
    $('#sumDelivery').textContent = mode() === 'pickup' ? 'Самовывоз — бесплатно' : (deliveryCost() ? money(deliveryCost()) : 'Бесплатно');
    $('#sumTotal').textContent = money(itemsSum() + deliveryCost());
    $('#addressField').hidden = mode() === 'pickup';
    $('#pointField').hidden = mode() !== 'pickup';
  }

  $('#lines').addEventListener('click', (e) => {
    const cart = getCart();
    const id = Number((e.target.dataset.inc || e.target.dataset.dec || e.target.dataset.del));
    const line = cart.find((l) => l.id === id);
    if (!line) return;
    const stock = DB.products().find((p) => p.id === id).stock;
    if (e.target.dataset.inc) line.qty = Math.min(line.qty + 1, stock);
    if (e.target.dataset.dec) line.qty = Math.max(line.qty - 1, 1);
    saveCart(e.target.dataset.del ? cart.filter((l) => l.id !== id) : cart);
    render();
  });
  form.addEventListener('change', render);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const rules = { name: rule.required('Введите имя'), phone: [rule.required('Введите телефон'), rule.phone] };
    if (mode() === 'delivery') rules.address = [rule.required('Введите адрес доставки'), rule.min(8, 'Укажите улицу, дом и квартиру')];
    if (!validate(form, rules)) return;
    if (!user) { location.href = 'login.html?next=cart.html'; return; }

    const products = DB.products();
    const lines = cartLines();
    const lack = lines.find((l) => l.qty > l.product.stock);
    if (lack) { alert('Товара «' + lack.product.name + '» осталось ' + lack.product.stock + ' ' + lack.product.unit); return; }

    const orders = DB.orders();
    const order = {
      id: DB.nextId(orders), userId: user.id, date: new Date().toISOString(),
      items: lines.map((l) => ({ id: l.id, name: l.product.name, price: l.product.price, qty: l.qty })),
      name: form.elements.name.value.trim(), phone: form.phone.value.trim(),
      delivery: mode() === 'pickup' ? { type: 'pickup', point: form.point.value } : { type: 'delivery', address: form.address.value.trim() },
      deliveryCost: deliveryCost(), total: itemsSum() + deliveryCost(), status: 'new',
    };
    orders.push(order);
    DB.set('orders', orders);
    lines.forEach((l) => { products.find((p) => p.id === l.id).stock -= l.qty; });
    DB.set('products', products);
    saveCart([]);
    $('#cartBox').hidden = true;
    $('#done').innerHTML = `<div class="notice notice--ok"><b>Заказ №${order.id} оформлен.</b> Сумма ${money(order.total)}. Следить за статусом можно в <a href="account.html">личном кабинете</a>.</div>`;
  });
  render();
};

// Вход
pages.login = function () {
  const box = $('#box');
  const params = new URLSearchParams(location.search);
  const next = /^[a-z]+\.html$/.test(params.get('next') || '') && !/^(login|register)/.test(params.get('next')) ? params.get('next') : '';
  const user = currentUser();

  if (user) {
    // Нельзя входить повторно
    box.innerHTML = `<div class="box"><h1>Вы уже вошли</h1><p>Вы авторизованы как <b>${esc(user.name)}</b>.</p>
      <p><a class="btn btn--primary" href="${homeFor(user)}">Перейти в кабинет</a> <button class="btn btn--light" id="out">Выйти</button></p></div>`;
    $('#out').addEventListener('click', logout);
  } else {
    box.innerHTML = `<form class="box" id="form" novalidate><h1>Вход</h1>
      ${params.get('next') ? '<div class="notice">Войдите, чтобы продолжить.</div>' : ''}
      <div class="notice notice--error" id="formError" hidden></div>
      <div class="field"><label for="email">Email</label><input id="email" name="email" type="email" autocomplete="username"><div class="error"></div></div>
      <div class="field"><label for="password">Пароль</label><input id="password" name="password" type="password" autocomplete="current-password"><div class="error"></div></div>
      <button class="btn btn--primary btn--block" type="submit">Войти</button>
      <p style="margin:16px 0 0;text-align:center">Нет аккаунта? <a href="register.html">Зарегистрироваться</a></p></form>`;
    const form = $('#form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      $('#formError').hidden = true;
      if (!validate(form, { email: [rule.required('Введите email'), rule.email], password: rule.required('Введите пароль') })) return;
      const found = DB.users().find((u) => u.email.toLowerCase() === form.email.value.trim().toLowerCase());
      const fail = (field, message) => {
        const input = form.elements[field];
        input.classList.add('invalid'); $('.error', input.closest('.field')).textContent = message; input.focus();
      };
      if (!found) return fail('email', 'Пользователь с таким email не найден');
      if (found.password !== form.password.value) return fail('password', 'Неверный пароль');
      if (found.blocked) { $('#formError').textContent = 'Учётная запись заблокирована. Обратитесь в магазин.'; $('#formError').hidden = false; return; }
      DB.set('session', found.id);
      location.href = found.role === 'admin' ? 'admin.html' : (next || 'account.html');
    });
  }
};

// Регистрация
pages.register = function () {
  const box = $('#box');
  const user = currentUser();
  if (user) {
    box.innerHTML = `<div class="box"><h1>Вы уже вошли</h1><p>Чтобы создать новый аккаунт, сначала выйдите.</p>
      <p><a class="btn btn--primary" href="${homeFor(user)}">Перейти в кабинет</a> <button class="btn btn--light" id="out">Выйти</button></p></div>`;
    $('#out').addEventListener('click', logout);
  } else {
    box.innerHTML = `<form class="box" id="form" novalidate><h1>Регистрация</h1>
      <div class="field"><label for="name">Имя и фамилия</label><input id="name" name="name" autocomplete="name"><div class="error"></div></div>
      <div class="field"><label for="email">Email</label><input id="email" name="email" type="email" autocomplete="email"><div class="error"></div></div>
      <div class="field"><label for="phone">Телефон</label><input id="phone" name="phone" type="tel" placeholder="+7 900 123-45-67"><div class="error"></div></div>
      <div class="field"><label for="password">Пароль</label><input id="password" name="password" type="password" autocomplete="new-password" placeholder="Не короче 8 символов"><div class="error"></div></div>
      <div class="field"><label for="confirm">Повторите пароль</label><input id="confirm" name="confirm" type="password" autocomplete="new-password"><div class="error"></div></div>
      <button class="btn btn--primary btn--block" type="submit">Зарегистрироваться</button>
      <p style="margin:16px 0 0;text-align:center">Уже есть аккаунт? <a href="login.html">Войти</a></p></form>`;
    const form = $('#form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const ok = validate(form, {
        name: [rule.required('Введите имя и фамилию'), rule.min(2, 'Имя слишком короткое'), (v) => (/^[A-Za-zА-Яа-яЁё\s'-]+$/.test(v) ? '' : 'В имени допустимы только буквы')],
        email: [rule.required('Введите email'), rule.email],
        phone: [rule.required('Введите телефон'), rule.phone],
        password: [rule.required('Придумайте пароль'), rule.min(8, 'Пароль должен быть не короче 8 символов'),
        (v) => (/\d/.test(v) && /[A-Za-zА-Яа-яЁё]/.test(v) ? '' : 'Добавьте в пароль буквы и цифры')],
        confirm: [rule.required('Повторите пароль'), (v, f) => (v === f.password.value ? '' : 'Пароли не совпадают')],
      });
      if (!ok) return;
      const users = DB.users();
      const email = form.email.value.trim().toLowerCase();
      if (users.some((u) => u.email.toLowerCase() === email)) {
        form.email.classList.add('invalid'); $('.error', form.email.closest('.field')).textContent = 'Этот email уже зарегистрирован'; form.email.focus();
        return;
      }
      const created = {
        id: DB.nextId(users), role: 'customer', name: form.elements.name.value.trim(), email, phone: form.phone.value.trim(),
        address: '', password: form.password.value, blocked: false
      };
      users.push(created);
      DB.set('users', users);
      DB.set('session', created.id);
      location.href = 'account.html';
    });
  }
};

// Личный кабинет
pages.account = function () {
  const user = requireRole('customer');
  if (user) {
    const form = $('#profile');
    form.elements.name.value = user.name;
    form.email.value = user.email;
    form.phone.value = user.phone;
    form.address.value = user.address || '';
    $('#out').addEventListener('click', logout);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validate(form, { name: [rule.required('Введите имя'), rule.min(2, 'Имя слишком короткое')], phone: [rule.required('Введите телефон'), rule.phone] })) return;
      const users = DB.users();
      Object.assign(users.find((u) => u.id === user.id), { name: form.elements.name.value.trim(), phone: form.phone.value.trim(), address: form.address.value.trim() });
      DB.set('users', users);
      $('#saved').innerHTML = '<div class="notice notice--ok">Данные сохранены</div>';
      setTimeout(() => { $('#saved').innerHTML = ''; }, 2500);
    });

    function renderOrders() {
      const orders = DB.orders().filter((o) => o.userId === user.id).sort((a, b) => b.id - a.id);
      $('#orders').innerHTML = orders.length ? orders.map((o) => `<div class="order">
        <div class="order__head"><b>Заказ №${o.id} от ${new Date(o.date).toLocaleDateString('ru-RU')}</b><span class="status status--${o.status}">${STATUSES[o.status]}</span></div>
        <div>${o.items.map((i) => esc(i.name) + ' × ' + i.qty).join('<br>')}</div>
        <p class="muted" style="margin:8px 0">${o.delivery.type === 'pickup' ? 'Самовывоз: ' + esc(o.delivery.point) : 'Доставка: ' + esc(o.delivery.address)}</p>
        <b>${money(o.total)}</b>
        ${o.status === 'new' ? ` <button class="btn btn--danger btn--small" data-cancel="${o.id}" style="margin-left:12px">Отменить</button>` : ''}
      </div>`).join('') : '<div class="box">Заказов пока нет. <a href="catalog.html">Перейти в каталог</a></div>';
    }
    $('#orders').addEventListener('click', (e) => {
      const id = Number(e.target.dataset.cancel);
      if (!id || !confirm('Отменить заказ №' + id + '?')) return;
      const orders = DB.orders();
      const order = orders.find((o) => o.id === id);
      order.status = 'cancelled';
      DB.set('orders', orders);
      const products = DB.products();
      order.items.forEach((i) => { const p = products.find((x) => x.id === i.id); if (p) p.stock += i.qty; });
      DB.set('products', products);
      renderOrders();
    });
    renderOrders();
  }
};

// Админ-панель
pages.admin = function () {
  const admin = requireRole('admin');
  if (admin) {
    let tab = 'orders';
    let editId = null;
    const view = $('#view');

    function renderStats() {
      const orders = DB.orders();
      const revenue = orders.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0);
      $('#stats').innerHTML = [
        ['Заказов', orders.length], ['Выручка', money(revenue)], ['Товаров', DB.products().length],
        ['Покупателей', DB.users().filter((u) => u.role === 'customer').length],
      ].map(([label, value]) => `<div class="stat"><span class="muted">${label}</span><b>${value}</b></div>`).join('');
    }

    function renderOrders() {
      const orders = [...DB.orders()].sort((a, b) => b.id - a.id);
      view.innerHTML = `<div class="table-wrap"><table><thead><tr><th>№</th><th>Дата</th><th>Клиент</th><th>Состав</th><th>Получение</th><th class="num">Сумма</th><th>Статус</th></tr></thead><tbody>
        ${orders.map((o) => `<tr><td>${o.id}</td><td>${new Date(o.date).toLocaleDateString('ru-RU')}</td><td>${esc(o.name)}<br><span class="muted">${esc(o.phone)}</span></td>
          <td>${o.items.map((i) => esc(i.name) + ' × ' + i.qty).join('<br>')}</td>
          <td>${o.delivery.type === 'pickup' ? 'Самовывоз: ' + esc(o.delivery.point) : 'Доставка: ' + esc(o.delivery.address)}</td>
          <td class="num">${money(o.total)}</td>
          <td><select data-status="${o.id}">${Object.entries(STATUSES).map(([k, v]) => `<option value="${k}" ${k === o.status ? 'selected' : ''}>${v}</option>`).join('')}</select></td></tr>`).join('')}
        </tbody></table></div>`;
    }

    function productForm() {
      const p = DB.products().find((x) => x.id === editId) || { name: '', brand: '', cat: CATEGORIES[0].id, price: '', stock: '', unit: 'шт', img: '' };
      return `<form class="box" id="productForm" novalidate style="margin-bottom:16px"><h2>${editId ? 'Редактирование товара' : 'Новый товар'}</h2>
        <div class="two-cols">
          <div class="field"><label for="pName">Название</label><input id="pName" name="name" value="${esc(p.name)}"><div class="error"></div></div>
          <div class="field"><label for="pBrand">Бренд</label><input id="pBrand" name="brand" value="${esc(p.brand)}"><div class="error"></div></div>
          <div class="field"><label for="pCat">Категория</label><select id="pCat" name="cat">${CATEGORIES.map((c) => `<option value="${c.id}" ${c.id === p.cat ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select><div class="error"></div></div>
          <div class="field"><label for="pUnit">Единица (шт, мешок, лист)</label><input id="pUnit" name="unit" value="${esc(p.unit)}"><div class="error"></div></div>
          <div class="field"><label for="pPrice">Цена, ₽</label><input id="pPrice" name="price" type="number" min="1" value="${p.price}"><div class="error"></div></div>
          <div class="field"><label for="pStock">Остаток</label><input id="pStock" name="stock" type="number" min="0" value="${p.stock}"><div class="error"></div></div>
        </div>
        <div class="field"><label for="pImg">Ссылка на фото (необязательно)</label><input id="pImg" name="img" value="${esc(p.img || '')}" placeholder="Или положите файл images/номер.jpg"><div class="error"></div></div>
        <button class="btn btn--primary" type="submit">${editId ? 'Сохранить' : 'Добавить'}</button>
        ${editId ? '<button class="btn btn--light" type="button" id="cancelEdit">Отмена</button>' : ''}</form>`;
    }

    function renderProducts() {
      view.innerHTML = productForm() + `<div class="table-wrap"><table><thead><tr><th>Товар</th><th>Категория</th><th class="num">Цена</th><th class="num">Остаток</th><th></th></tr></thead><tbody>
        ${DB.products().map((p) => `<tr><td><div class="item">${photo(p, 'ph--small')}<div>${esc(p.name)}<div class="muted">${esc(p.brand)} · №${p.id}</div></div></div></td>
          <td>${esc(CATEGORIES.find((c) => c.id === p.cat).name)}</td><td class="num">${money(p.price)}</td><td class="num">${p.stock} ${esc(p.unit)}</td>
          <td><div class="row-actions"><button class="btn btn--light btn--small" data-edit="${p.id}">Изменить</button><button class="btn btn--danger btn--small" data-del="${p.id}">Удалить</button></div></td></tr>`).join('')}
        </tbody></table></div>`;
      const form = $('#productForm');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const ok = validate(form, {
          name: [rule.required('Введите название'), rule.min(3, 'Название слишком короткое')], brand: rule.required('Введите бренд'), unit: rule.required('Введите единицу'),
          price: [rule.required('Введите цену'), (v) => (Number(v) > 0 ? '' : 'Цена должна быть больше нуля')],
          stock: [rule.required('Введите остаток'), (v) => (Number.isInteger(Number(v)) && Number(v) >= 0 ? '' : 'Остаток — целое число от 0')],
        });
        if (!ok) return;
        const products = DB.products();
        const data = {
          name: form.elements.name.value.trim(), brand: form.brand.value.trim(), cat: form.cat.value, unit: form.unit.value.trim(),
          price: Number(form.price.value), stock: Number(form.stock.value), img: form.img.value.trim()
        };
        if (editId) Object.assign(products.find((p) => p.id === editId), data);
        else products.push({ id: DB.nextId(products), ...data });
        DB.set('products', products);
        editId = null;
        renderStats(); renderProducts();
      });
      if (editId) $('#cancelEdit').addEventListener('click', () => { editId = null; renderProducts(); });
    }

    function renderUsers() {
      view.innerHTML = `<div class="table-wrap"><table><thead><tr><th>Имя</th><th>Email</th><th>Телефон</th><th>Роль</th><th></th></tr></thead><tbody>
        ${DB.users().map((u) => `<tr><td>${esc(u.name)}</td><td>${esc(u.email)}</td><td>${esc(u.phone)}</td><td>${u.role === 'admin' ? 'Администратор' : 'Покупатель'}</td>
          <td>${u.id === admin.id ? '' : `<button class="btn btn--small ${u.blocked ? 'btn--light' : 'btn--danger'}" data-block="${u.id}">${u.blocked ? 'Разблокировать' : 'Заблокировать'}</button>`}</td></tr>`).join('')}
        </tbody></table></div>`;
    }

    const views = { orders: renderOrders, products: renderProducts, users: renderUsers };
    function show() {
      document.querySelectorAll('#tabs button').forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));
      views[tab]();
    }

    $('#tabs').addEventListener('click', (e) => { if (e.target.dataset.tab) { tab = e.target.dataset.tab; editId = null; show(); } });
    view.addEventListener('change', (e) => {
      if (!e.target.dataset.status) return;
      const orders = DB.orders();
      const order = orders.find((o) => o.id === Number(e.target.dataset.status));
      const was = order.status;
      order.status = e.target.value;
      DB.set('orders', orders);

      // Отмена и возврат товаров (счетчик на складе)
      if ((was === 'cancelled') !== (order.status === 'cancelled')) {
        const products = DB.products();
        order.items.forEach((i) => { const p = products.find((x) => x.id === i.id); if (p) p.stock += order.status === 'cancelled' ? i.qty : -i.qty; });
        DB.set('products', products);
      }
      renderStats();
    });
    
    view.addEventListener('click', (e) => {
      const t = e.target;
      if (t.dataset.edit) { editId = Number(t.dataset.edit); renderProducts(); window.scrollTo(0, 0); }
      if (t.dataset.del && confirm('Удалить товар?')) { DB.set('products', DB.products().filter((p) => p.id !== Number(t.dataset.del))); renderStats(); renderProducts(); }
      if (t.dataset.block) {
        const users = DB.users();
        const target = users.find((u) => u.id === Number(t.dataset.block));
        target.blocked = !target.blocked;
        DB.set('users', users);
        renderUsers();
      }
    });
    renderStats();
    show();
  }
};

const currentPage = document.body.dataset.page;
if (pages[currentPage]) pages[currentPage]();
