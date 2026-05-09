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
    messageEl.textContent = `${name} has been added to the cart.`;
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
    showLoginMessage('Enter your email and password.', false);
    return;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    showLoginMessage('Enter a valid email address.', false);
    return;
  }

  if (password.length < 6) {
    showLoginMessage('Password must be at least 6 characters.', false);
    return;
  }

  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    showLoginMessage('Invalid email or password ,Try to signup.', false);
    return;
  }

  showLoginMessage('Login successful! Redirecting...', true);


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