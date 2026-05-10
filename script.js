const CART_KEY = 'smartshopCart';
const THEME_KEY = 'smartshopTheme';

function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function updateCartCount() {
  const countElement = document.getElementById('cart-count');
  if (!countElement) return;
  const cart = getCart();
  const count = cart.reduce((total, item) => total + (item.quantity || 1), 0);
  countElement.textContent = count;
}

function addToCart(name, priceText, image) {
  const cart = getCart();
  const price = parseInt(priceText.replace(/[^0-9]/g, ''), 10) || 0;
  const existing = cart.find((item) => item.name === name);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ name, price, image, quantity: 1 });
  }
  saveCart(cart);
  updateCartCount();
  const messageEl = document.getElementById('cart-message');
  if (messageEl) {
    messageEl.textContent = `${name} get ready,the item is in your card already.`;
    messageEl.classList.add('show');
    setTimeout(() => messageEl.classList.remove('show'), 2000);
  }
}

function renderCart() {
  const cartItemsContainer = document.querySelector('.cart-items');
  const cartSummary = document.querySelector('.cart-summary');
  if (!cartItemsContainer || !cartSummary) return;

  const cart = getCart();
  cartItemsContainer.innerHTML = '';

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p class="empty-cart">Your cart is empty. Go back to the shop to add items.</p>';
    cartSummary.innerHTML = '';
    return;
  }

  let total = 0;

  cart.forEach((item, index) => {
    const subtotal = item.price * item.quantity;
    total += subtotal;

    const itemEl = document.createElement('div');
    itemEl.className = 'cart-item';
    itemEl.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <div class="item-details">
        <h3>${item.name}</h3>
        <p>Price: ${item.price.toLocaleString()} EGP</p>
        <p>Quantity: ${item.quantity}</p>
        <p>Subtotal: ${subtotal.toLocaleString()} EGP</p>
      </div>
      <button type="button" class="remove-button" data-index="${index}">Remove</button>
    `;
    cartItemsContainer.appendChild(itemEl);
  });

  cartSummary.innerHTML = `
    <div class="summary-box">
      <h2>Order Summary</h2>
      <p>Total items: ${cart.reduce((sum, item) => sum + item.quantity, 0)}</p>
      <p>Total price: ${total.toLocaleString()} EGP</p>
      <button type="button" id="clear-cart-button">Clear Cart</button>
    </div>
  `;

  document.querySelectorAll('.remove-button').forEach((button) => {
    button.addEventListener('click', () => {
      removeCartItem(Number(button.dataset.index));
    });
  });

  const clearCartButton = document.getElementById('clear-cart-button');
  if (clearCartButton) {
    clearCartButton.addEventListener('click', () => {
      saveCart([]);
      renderCart();
      updateCartCount();
    });
  }
}

function removeCartItem(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  renderCart();
  updateCartCount();
}

function applyTheme(theme) {
  const body = document.body;
  const toggleButton = document.getElementById('theme-toggle');
  if (!body || !toggleButton) return;

  if (theme === 'light') {
    body.classList.add('light-mode');
    body.classList.remove('dark-mode');
    toggleButton.textContent = 'Dark Mode';
  } else {
    body.classList.remove('light-mode');
    body.classList.add('dark-mode');
    toggleButton.textContent = 'Light Mode';
  }
  localStorage.setItem(THEME_KEY, theme);
}

function toggleTheme() {
  const currentTheme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
  applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
}

function initTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
  applyTheme(savedTheme);
}

function showLoginMessage(message, success = false) {
  const messageEl = document.getElementById('loginMessage');
  if (!messageEl) return;
  messageEl.textContent = message;
  messageEl.className = `login-message ${success ? 'success' : 'error'}`;
}

function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('username')?.value.trim();
  const password = document.getElementById('password')?.value;

  if (!email || !password) {
    showLoginMessage('you have to enter your email And password', false);
    return;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    showLoginMessage('Enter a valid email address.', false);
    return;
  }

  if (password.length < 6) {
    showLoginMessage('give it a try,must be greater than 6.', false);
    return;
  }

  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    showLoginMessage('invalid email or password , please try again.', false);
    return;
  }

  showLoginMessage('login sucssesfull! Redirecting...', true);


  localStorage.setItem('loggedIn', 'true');
  setTimeout(() => {
    const redirect = localStorage.getItem('redirectAfterLogin');
    if (redirect) {
      localStorage.removeItem('redirectAfterLogin');
      window.location.href = redirect;
    } else {
      window.location.href = 'shop.html';
    }
  }, 800);
}

function handlesignup(event) {
  event.preventDefault();
  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!username || !email || !password) {
    alert('Please fill all fields');
    return;
  }

  if (password.length < 6) {
    alert('Password must be at least 6 characters');
    return;
  }

  const users = JSON.parse(localStorage.getItem('users') || '[]');
  if (users.find(u => u.email === email)) {
    alert('Email already exists');
    return;
  }

  users.push({ username, email, password });
  localStorage.setItem('users', JSON.stringify(users));
  alert('Signup successful! Please login.');
  window.location.href = 'login.html';
}


function logout() {
  localStorage.removeItem('loggedIn');
  window.location.href = 'index.html';
}

window.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  initTheme();

  document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);

  document.querySelectorAll('.add-to-cart-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const isLoggedIn = localStorage.getItem('loggedIn');
      if (!isLoggedIn) {
        localStorage.setItem('redirectAfterLogin', 'shop.html');
        window.location.href = 'login.html';
        return;
      }
      const card = button.closest('.shop-card');
      if (!card) return;
      const name = card.querySelector('h2')?.textContent?.trim() || 'Unknown product';
      const price = card.querySelector('.price')?.textContent?.trim() || '0';
      const image = card.querySelector('img')?.src || '';
      addToCart(name, price, image);
      button.textContent = 'Added';
      setTimeout(() => {
        button.textContent = 'Add to Cart';
      }, 1200);
    });
  });

  if (document.querySelector('.cart-items')) {
    renderCart();
  }
});
document.getElementById('search-input').addEventListener('input', function() {
    const query = this.value.toLowerCase();
    const cards = document.querySelectorAll('.shop-card');
    cards.forEach(card => {
        const title = card.querySelector('h2').textContent.toLowerCase();
        const description = card.querySelector('p').textContent.toLowerCase();
        if (title.includes(query) || description.includes(query)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
});

const allProducts = Array.from(document.querySelectorAll('.shop-card'));
let filteredProducts = [...allProducts];
let currentPage = 1;
const itemsPerPage = 4;
let currentView = 'grid';

const searchInput = document.getElementById('search-input');
const container = document.querySelector('.shop-container');

function filterProducts() {
    const query = searchInput.value.toLowerCase();
    filteredProducts = allProducts.filter(card => {
        const title = card.querySelector('h2').textContent.toLowerCase();
        const description = card.querySelector('p').textContent.toLowerCase();
        return title.includes(query) || description.includes(query);
    });
    currentPage = 1;
    render();
}

function render() {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const toShow = filteredProducts.slice(start, end);

    allProducts.forEach(card => card.style.display = 'none');
    toShow.forEach(card => card.style.display = 'block');

    updatePagination();
}

function updatePagination() {
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const pageNumbers = document.getElementById('page-numbers');
    pageNumbers.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = 'page-btn';
        if (i === currentPage) btn.classList.add('active');
        btn.onclick = () => {
            currentPage = i;
            render();
        };
        pageNumbers.appendChild(btn);
    }

    document.getElementById('prev-page').disabled = currentPage === 1;
    document.getElementById('next-page').disabled = currentPage === totalPages;
}

function setView(view) {
    currentView = view;
    document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(view + '-view').classList.add('active');
    container.className = 'shop-container ' + view + '-view';
}

searchInput.addEventListener('input', filterProducts);

document.getElementById('grid-view').onclick = () => setView('grid');
document.getElementById('list-view').onclick = () => setView('list');
document.getElementById('details-view').onclick = () => setView('details');

document.getElementById('prev-page').onclick = () => {
    if (currentPage > 1) {
        currentPage--;
        render();
    }
};

document.getElementById('next-page').onclick = () => {
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        render();
    }
};

render();
