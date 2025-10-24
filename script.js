/* SwapCart — Multi-Page Edition
   Functions for Login, Register, Products, Cart, Seller, and Barter
   Works across multiple HTML pages using localStorage only.
*/

/* STORAGE KEYS */
const STORAGE = {
  USERS: 'users',
  CURRENT_USER: 'currentUser',
  PRODUCTS: 'products',
  CART: 'cart',
  BARTER_ITEMS: 'barterItems',
  BARTER_PROPOSALS: 'barterProposals',
  FAVORITES: 'favorites',


};

/* STATE */
let users = JSON.parse(localStorage.getItem(STORAGE.USERS)) || [];
let currentUser = JSON.parse(localStorage.getItem(STORAGE.CURRENT_USER)) || null;
let products = JSON.parse(localStorage.getItem(STORAGE.PRODUCTS)) || [];
let cart = JSON.parse(localStorage.getItem(STORAGE.CART)) || [];
let barterItems = JSON.parse(localStorage.getItem(STORAGE.BARTER_ITEMS)) || [];
let barterProposals = JSON.parse(localStorage.getItem(STORAGE.BARTER_PROPOSALS)) || [];
let favorites = JSON.parse(localStorage.getItem(STORAGE.FAVORITES)) || [];



/* Default sample products (for first load) */


/* Initialize depending on page */
document.addEventListener('DOMContentLoaded', () => {
  const page = location.pathname.split('/').pop();
  





  // Login
  if (page === 'login.html' && document.getElementById('login-form')) {
    document.getElementById('login-form').addEventListener('submit', handleLogin);
  }

  // Register
  if (page === 'register.html' && document.getElementById('register-form')) {
    document.getElementById('register-form').addEventListener('submit', handleRegister);
  }
    // Forgot Password
  if (page === 'forgot.html' && document.getElementById('forgot-form')) {
    document.getElementById('forgot-form').addEventListener('submit', handleForgotPassword);
  }

  // Home / Index
  if (page === 'index.html' || page === '' || page === 'index.html') {
    loadProducts();
    document.getElementById('search-btn').addEventListener('click', handleSearch);
    document.getElementById('search-input').addEventListener('keydown', e => { if (e.key === 'Enter') handleSearch(); });
  }

  // Cart
  if (page === 'cart.html') {
    updateCartDisplay();
    const gcash = document.getElementById('gcash');
    const cod = document.getElementById('cod');
    if (gcash && cod) {
      gcash.addEventListener('change', toggleGcashDetails);
      cod.addEventListener('change', toggleGcashDetails);
    }
    document.getElementById('checkout-form').addEventListener('submit', handleCheckout);
  }

  // Barter
  if (page === 'barter.html') {
    document.getElementById('barter-form').addEventListener('submit', handleBarterSubmit);
    loadBarterItems();
  }

  // Seller
  if (page === 'seller.html') {
    document.getElementById('seller-form').addEventListener('submit', handleAddProduct);
    loadSellerProducts();
  }
  // Favorites page
if (page === 'favorites.html') {
  loadFavorites();
}
if (page === 'barter-dashboard.html') {
  loadMyBarterDashboard();
}


});

/* ---------------- AUTH ---------------- */
function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('register-name').value.trim();
  const email = document.getElementById('register-email').value.trim().toLowerCase();
  const pass = document.getElementById('register-password').value;
  const confirm = document.getElementById('register-confirm-password').value;
  const alertBox = document.getElementById('register-alert');
  alertBox.innerHTML = '';

  if (!name || !email || !pass) return alertBox.innerHTML = `<div class="alert alert-error">Please fill all fields</div>`;
  if (pass !== confirm) return alertBox.innerHTML = `<div class="alert alert-error">Passwords do not match</div>`;
  if (users.find(u => u.email === email)) return alertBox.innerHTML = `<div class="alert alert-error">Email already registered</div>`;

  const newUser = { id: Date.now(), name, email, password: pass };
  users.push(newUser);
  localStorage.setItem(STORAGE.USERS, JSON.stringify(users));
  alertBox.innerHTML = `<div class="alert alert-success">Registered successfully! Redirecting to login...</div>`;
  setTimeout(() => (window.location.href = 'login.html'), 1000);
}

function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const pass = document.getElementById('login-password').value;
  const alertBox = document.getElementById('login-alert');
  alertBox.innerHTML = '';

  const user = users.find(u => u.email === email && u.password === pass);
  if (!user) return alertBox.innerHTML = `<div class="alert alert-error">Invalid email or password</div>`;

  currentUser = user;
  localStorage.setItem(STORAGE.CURRENT_USER, JSON.stringify(user));
  alertBox.innerHTML = `<div class="alert alert-success">Login successful!</div>`;
  setTimeout(() => (window.location.href = 'index.html'), 800);

}
function handleForgotPassword(e) {
  e.preventDefault();
  const email = document.getElementById('forgot-email').value.trim().toLowerCase();
  const newPass = document.getElementById('forgot-new-password').value.trim();
  const alertBox = document.getElementById('forgot-alert');
  alertBox.innerHTML = '';

  if (!email || !newPass) return alertBox.innerHTML = `<div class="alert alert-error">Please fill all fields.</div>`;

  const user = users.find(u => u.email === email);
  if (!user) return alertBox.innerHTML = `<div class="alert alert-error">No account found with that email.</div>`;

  user.password = newPass;
  localStorage.setItem(STORAGE.USERS, JSON.stringify(users));
  alertBox.innerHTML = `<div class="alert alert-success">Password reset successful! Redirecting to login...</div>`;
  setTimeout(() => (window.location.href = 'login.html'), 1500);
}


/* ---------------- PRODUCTS ---------------- */
let searchQuery = '';

function handleSearch() {
  searchQuery = document.getElementById('search-input').value.trim().toLowerCase();
  loadProducts();
}

function loadProducts() {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  grid.innerHTML = '';
  let list = products.filter(p => !searchQuery || p.name.toLowerCase().includes(searchQuery));

  if (list.length === 0) {
    grid.innerHTML = '<div class="card">No products found.</div>';
    return;
  }

  list.forEach(p => {
    const div = document.createElement('div');
    div.className = 'product-card';
    div.innerHTML = `
      <div class="product-media" onclick="viewProduct(${p.id})" style="cursor:pointer;">
           ${p.image ? `<img src="${p.image}" alt="${escapeHtml(p.name)}">` : `<div>${escapeHtml(initials(p.name))}</div>`}
     </div>
       <div class="product-body" onclick="viewProduct(${p.id})" style="cursor:pointer;">
         <div class="product-title">${escapeHtml(p.name)}</div>
         <div class="product-price">₱${Number(p.price).toFixed(2)}</div>
        <div class="product-meta">Seller: ${escapeHtml(p.sellerName || 'SwapCart')} • Stock: ${p.quantity}</div>
      </div>
      <div class="product-actions">
      <button class="add-to-cart" onclick="event.stopPropagation(); addToCart(${p.id});">Add to Cart</button>
       <button class="favorite-btn" onclick="event.stopPropagation(); toggleFavorite(${p.id});">
       ${favorites.some(f => f.userId === currentUser?.id && f.productId === p.id) ? '❤️' : '🤍'}
       <button class="icon-btn orange" onclick="event.stopPropagation(); viewSeller(${p.sellerId});">View Seller</button>
       </button>
      </div>`;

    grid.appendChild(div);
  });
}

/* ---------------- CART ---------------- */
function addToCart(productId) {
  if (!currentUser) return alert('Please login first.');

  const p = products.find(x => x.id === productId);
  if (!p) return alert('Product not found.');
  if (p.quantity < 1) return alert('Out of stock.');

  const existing = cart.find(c => c.productId === productId && c.userId === currentUser.id);
  if (existing) existing.quantity += 1;
  else cart.push({ id: Date.now(), productId: p.id, userId: currentUser.id, quantity: 1, name: p.name, price: p.price });

  localStorage.setItem(STORAGE.CART, JSON.stringify(cart));
  alert('Added to cart!');
}

function updateCartDisplay() {
  const cont = document.getElementById('cart-items');
  if (!cont) return;
  cont.innerHTML = '';
  if (!currentUser) return cont.innerHTML = '<div class="card">Please login to view your cart.</div>';

  const myCart = cart.filter(i => i.userId === currentUser.id);
  if (myCart.length === 0) return cont.innerHTML = '<div class="card">Your cart is empty.</div>';

  let total = 0;
  myCart.forEach(item => {
    total += item.price * item.quantity;
    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `
      <div style="display:flex;gap:10px;align-items:center;">
        <div>${escapeHtml(item.name)}</div>
      </div>
      <div>
        <span>₱${item.price}</span> × ${item.quantity}
        <button class="icon-btn" onclick="removeFromCart(${item.id})">Remove</button>
      </div>`;
    cont.appendChild(row);
  });

  const totalEl = document.getElementById('cart-total');
  if (totalEl) totalEl.textContent = `Total: ₱${total.toFixed(2)}`;
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  localStorage.setItem(STORAGE.CART, JSON.stringify(cart));
  updateCartDisplay();
}

function toggleGcashDetails() {
  const gcashDiv = document.getElementById('gcash-details');
  if (document.getElementById('gcash').checked) gcashDiv.style.display = 'block';
  else gcashDiv.style.display = 'none';
}

function handleCheckout(e) {
  e.preventDefault();
  if (!currentUser) return alert('Please login to checkout.');

  const userCart = cart.filter(i => i.userId === currentUser.id);
  if (userCart.length === 0) return alert('Cart empty.');

  userCart.forEach(it => {
    const p = products.find(pr => pr.id === it.productId);
    if (p) p.quantity -= it.quantity;
  });

  products = products.filter(p => p.quantity > 0);
  cart = cart.filter(i => i.userId !== currentUser.id);
  localStorage.setItem(STORAGE.PRODUCTS, JSON.stringify(products));
  localStorage.setItem(STORAGE.CART, JSON.stringify(cart));
  alert('Checkout successful!');
  window.location.href = 'index.html';
}
function toggleFavorite(productId) {
  if (!currentUser) return alert('Please login first.');

  const index = favorites.findIndex(f => f.userId === currentUser.id && f.productId === productId);
  if (index > -1) {
    // remove from favorites
    favorites.splice(index, 1);
  } else {
    // add to favorites
    favorites.push({ userId: currentUser.id, productId });
  }

  localStorage.setItem(STORAGE.FAVORITES, JSON.stringify(favorites));

  // refresh the correct page
  const page = location.pathname.split('/').pop();
  if (page === 'favorites.html') {
    loadFavorites(); // ✅ instantly update favorites page (remove disappeared)
  } else if (page === 'index.html' || page === '') {
    loadProducts(); // refresh product hearts on home page
  }
}


/* ---------------- BARTER ---------------- */
/* Updated script.js — category removed from barter features */

function handleBarterSubmit(e) {
  e.preventDefault();
  if (!currentUser) return alert('Please login first.');

  const title = document.getElementById('barter-title').value.trim();
  const desc = document.getElementById('barter-description').value.trim();
  const file = document.getElementById('barter-photo').files[0];

  if (!title || !desc) {
    return alert('Please fill in all required fields.');
  }

  const create = (img = null) => {
    const newItem = {
  id: Date.now(),
  userId: currentUser.id,
  userName: currentUser.name,
  title,
  description: desc,
  image: img,
  status: "available" // 🟢 default
};


    barterItems.unshift(newItem);
    localStorage.setItem(STORAGE.BARTER_ITEMS, JSON.stringify(barterItems));

    document.getElementById('barter-form').reset();
    alert('Your barter item has been posted successfully!');
    window.location.href = 'barter-dashboard.html';
  };

  if (file) {
    const reader = new FileReader();
    reader.onload = e => create(e.target.result);
    reader.readAsDataURL(file);
  } else {
    create();
  }
}

function loadBarterItems() {
  const list = document.getElementById('barter-items-list');
  if (!list) return;
  list.innerHTML = '';
  if (barterItems.length === 0) return list.innerHTML = '<div class="card">No barter items yet.</div>';

  barterItems.slice().reverse().forEach(b => {
    const el = document.createElement('div');
    el.className = 'barter-item';
    el.innerHTML = `
      <div><strong>${escapeHtml(b.title)}</strong> — ${escapeHtml(b.description)}</div>
      <small>${b.userName}</small>`;
    list.appendChild(el);
  });
}

function loadMyBarterDashboard() {
  const list = document.getElementById('my-barter-list');
  if (!list) return;

  if (!currentUser) {
    list.innerHTML = '<div class="card">Please login to view your barters.</div>';
    return;
  }

  const myBarters = barterItems.filter(b => b.userId === currentUser.id);

  if (myBarters.length === 0) {
    list.innerHTML = '<div class="card">You have not posted any barter items yet.</div>';
    return;
  }

  list.innerHTML = '';
  myBarters.forEach(b => {
    const el = document.createElement('div');
    el.className = 'card';
    el.innerHTML = `
  <div style="display:flex;gap:10px;align-items:center;">
    ${b.image ? `<img src="${b.image}" style="width:60px;height:60px;object-fit:cover;border-radius:8px;">` : ''}
    <div style="flex:1;">
      <strong>${escapeHtml(b.title)}</strong><br>
      <small>${escapeHtml(b.userName)}</small>
      <p>${escapeHtml(b.description)}</p>
      <p>Status: <span style="font-weight:bold;color:${b.status === 'sold' ? 'red' : 'green'};">${b.status.toUpperCase()}</span></p>
      <div style="display:flex;gap:6px;flex-wrap:wrap;">
        <button class="btn small" onclick="openCommentModal(${b.id})">💬 Comments</button>
        <button class="btn small orange" onclick="startPrivateChat(${b.userId})">✉️ Message Seller</button>
        <button class="btn small" onclick="toggleBarterStatus(${b.id})">🔁 Mark as ${b.status === 'sold' ? 'Available' : 'Sold'}</button>
      </div>
    </div>
  </div>
`;

    list.appendChild(el);
  });
}



function loadBarterItems() {
  const list = document.getElementById('barter-items-list');
  if (!list) return;
  list.innerHTML = '';
  if (barterItems.length === 0) return list.innerHTML = '<div class="card">No barter items yet.</div>';

  barterItems.slice().reverse().forEach(b => {
    const el = document.createElement('div');
    el.className = 'barter-item';
    el.innerHTML = `
      <div><strong>${escapeHtml(b.title)}</strong> — ${escapeHtml(b.description)}</div>
      <small>${b.userName} • ${b.category}</small>`;
    list.appendChild(el);
  });
}
function toggleBarterStatus(barterId) {
  const item = barterItems.find(b => b.id === barterId && b.userId === currentUser.id);
  if (!item) return alert("Item not found or not yours.");

  item.status = item.status === "sold" ? "available" : "sold";
  localStorage.setItem(STORAGE.BARTER_ITEMS, JSON.stringify(barterItems));
  loadMyBarterDashboard();
  alert(`Item marked as ${item.status.toUpperCase()}`);
}

/* ---------------- BARTER COMMENTS ---------------- */
if (!STORAGE.BARTER_COMMENTS) STORAGE.BARTER_COMMENTS = 'barterComments';
let barterComments = JSON.parse(localStorage.getItem(STORAGE.BARTER_COMMENTS)) || [];
let activeBarterId = null;

function loadMyBarterDashboard() {
  const list = document.getElementById('my-barter-list');
  if (!list) return;

  if (!currentUser) {
    list.innerHTML = '<div class="card">Please login to view your barters.</div>';
    return;
  }

  const myBarters = barterItems.filter(b => b.userId === currentUser.id);

  if (myBarters.length === 0) {
    list.innerHTML = '<div class="card">You have not posted any barter items yet.</div>';
    return;
  }

  list.innerHTML = '';
  myBarters.forEach(b => {
    const el = document.createElement('div');
    el.className = 'card';
    el.innerHTML = `
  <div style="display:flex;gap:10px;align-items:center;">
    ${b.image ? `<img src="${b.image}" style="width:60px;height:60px;object-fit:cover;border-radius:8px;">` : ''}
    <div style="flex:1;">
      <strong>${escapeHtml(b.title)}</strong><br>
      <small>${escapeHtml(b.userName)} • ${escapeHtml(b.category)}</small>
      <p>${escapeHtml(b.description)}</p>
      <button class="btn small" onclick="openCommentModal(${b.id})">💬 Comments</button>
      <button class="btn small orange" onclick="startPrivateChat(${b.userId})">✉️ Message Seller</button>
    </div>
  </div>
`;
    list.appendChild(el);
  });
}

function openCommentModal(barterId) {
  if (!currentUser) return alert('Please login first.');
  activeBarterId = barterId;

  const modal = document.getElementById('comment-modal');
  const list = document.getElementById('comment-list');
  modal.style.display = 'block';

  // Load all comments for this barter
  const comments = barterComments.filter(c => c.barterId === barterId && !c.parentId);

  list.innerHTML = comments.length
    ? comments.map(c => renderComment(c)).join('')
    : '<div class="card">No comments yet.</div>';

  document.getElementById('post-comment-btn').onclick = () => {
    const text = document.getElementById('new-comment-text').value.trim();
    if (!text) return alert('Enter a comment.');
    postBarterComment(barterId, text);
    document.getElementById('new-comment-text').value = '';
  };
}

function renderComment(comment) {
  const replies = barterComments.filter(r => r.parentId === comment.id);
  return `
    <div class="comment-card" style="border:1px solid #ddd;padding:8px;margin:6px 0;border-radius:6px;">
      <strong>${escapeHtml(comment.userName)}</strong>
      <p>${escapeHtml(comment.text)}</p>
      <small>${comment.date}</small><br>
      <button class="btn small" onclick="replyToComment(${comment.id})">Reply</button>
      ${replies.map(r => `
        <div style="margin-left:20px;border-left:2px solid #ccc;padding-left:8px;">
          <strong>${escapeHtml(r.userName)}</strong>
          <p>${escapeHtml(r.text)}</p>
          <small>${r.date}</small>
        </div>
      `).join('')}
    </div>
  `;
}

function postBarterComment(barterId, text, parentId = null) {
  const newComment = {
    id: Date.now(),
    barterId,
    userId: currentUser.id,
    userName: currentUser.name,
    text,
    parentId,
    date: new Date().toLocaleString()
  };
  barterComments.push(newComment);
  localStorage.setItem(STORAGE.BARTER_COMMENTS, JSON.stringify(barterComments));

  // 🔔 Notify barter owner (if not the commenter)
  const barter = barterItems.find(b => b.id === barterId);
  if (barter && barter.userId !== currentUser.id) {
    pushNotification(
      barter.userId,
      `${currentUser.name} commented on your barter "${barter.title}"`,
      'comment'
    );
  }

  openCommentModal(barterId);
}


function replyToComment(commentId) {
  const text = prompt('Write your reply:');
  if (!text) return;
  const parent = barterComments.find(c => c.id === commentId);
  if (!parent) return;
  postBarterComment(parent.barterId, text, parent.id);
}

function closeCommentModal() {
  document.getElementById('comment-modal').style.display = 'none';
  activeBarterId = null;
}
/* ---------------- PRIVATE CHAT ---------------- */
if (!STORAGE.MESSAGES) STORAGE.MESSAGES = 'messages';
let messages = JSON.parse(localStorage.getItem(STORAGE.MESSAGES)) || [];
let activeChatUser = null;

function startPrivateChat(receiverId) {
  if (!currentUser) return alert('Please login first.');
  if (receiverId === currentUser.id) return alert('You cannot chat with yourself.');

  activeChatUser = receiverId;
  const receiver = users.find(u => u.id === receiverId);
  const modal = document.getElementById('chat-modal');
  const chatWithName = document.getElementById('chat-with-name');
  chatWithName.textContent = `Chat with ${receiver ? receiver.name : 'User'}`;
  modal.style.display = 'block';

  loadChatMessages();

  document.getElementById('send-chat-btn').onclick = () => {
    const text = document.getElementById('chat-input').value.trim();
    if (!text) return;
    sendChatMessage(receiverId, text);
    document.getElementById('chat-input').value = '';
    loadChatMessages();
  };
}

function loadChatMessages() {
  const chatBox = document.getElementById('chat-messages');
  const chatHistory = messages.filter(
    m =>
      (m.senderId === currentUser.id && m.receiverId === activeChatUser) ||
      (m.receiverId === currentUser.id && m.senderId === activeChatUser)
  );

  chatBox.innerHTML = chatHistory
    .map(m => `
      <div style="text-align:${m.senderId === currentUser.id ? 'right' : 'left'};margin:5px 0;">
        <span style="display:inline-block;padding:6px 10px;border-radius:10px;background:${m.senderId === currentUser.id ? '#ffb36b' : '#eee'};">
          ${escapeHtml(m.text)}
        </span><br>
        <small>${new Date(m.timestamp).toLocaleTimeString()}</small>
      </div>
    `)
    .join('');
  chatBox.scrollTop = chatBox.scrollHeight;
}

function sendChatMessage(receiverId, text) {
  const receiver = users.find(u => u.id === receiverId);
  if (!receiver) return alert('User not found.');

  const message = {
    id: Date.now(),
    senderId: currentUser.id,
    receiverId: receiver.id,
    senderName: currentUser.name,
    receiverName: receiver.name,
    text,
    timestamp: new Date().toISOString()
  };

  messages.push(message);
  localStorage.setItem(STORAGE.MESSAGES, JSON.stringify(messages));

  // 🔔 Notify receiver of new message
  pushNotification(receiver.id, `New message from ${currentUser.name}`, 'chat');
}




/* ---------------- SELLER ---------------- */
function handleAddProduct(e) {
  e.preventDefault();
  if (!currentUser) return alert('Please login first.');

  const name = document.getElementById('seller-product-name').value.trim();
  const description = document.getElementById('seller-product-description').value.trim();
  const price = parseFloat(document.getElementById('seller-product-price').value);
  const qty = parseInt(document.getElementById('seller-product-quantity').value);
  const file = document.getElementById('seller-product-photo').files[0];

  if (!name || !description || isNaN(price) || isNaN(qty)) {
    return alert('Please fill in all product fields.');
  }

  const save = (img = null) => {
    const newP = { 
  id: Date.now(), 
  name, 
  description, 
  price, 
  quantity: qty, 
  image: img, 
  sellerId: currentUser.id, 
  sellerName: currentUser.name,
  status: "available" // 🟢 default status
};

    products.push(newP);
    localStorage.setItem(STORAGE.PRODUCTS, JSON.stringify(products));
    document.getElementById('seller-form').reset();
    loadSellerProducts();
    alert('Product added!');
  };

  if (file) {
    const reader = new FileReader();
    reader.onload = e => save(e.target.result);
    reader.readAsDataURL(file);
  } else save();
}

function loadSellerProducts() {
  const list = document.getElementById('seller-products-list');
  if (!list) return;
  list.innerHTML = '';
  const mine = products.filter(p => p.sellerId === (currentUser?.id));
  if (mine.length === 0) return list.innerHTML = '<div class="card">No products yet.</div>';

  mine.forEach(p => {
    const div = document.createElement('div');
    div.className = 'card';
    div.style.marginBottom = '8px';
    div.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div>${escapeHtml(p.name)} - ₱${p.price}</div>
        <button class="icon-btn" onclick="deleteProduct(${p.id})">Delete</button>
      </div>`;
    list.appendChild(div);
  });
}

function deleteProduct(id) {
  products = products.filter(p => p.id !== id);
  localStorage.setItem(STORAGE.PRODUCTS, JSON.stringify(products));
  loadSellerProducts();
}

/* ---------------- UTIL ---------------- */
function escapeHtml(str = '') { return str.replace(/[&<>"']/g, s => `&#${s.charCodeAt(0)};`); }
function initials(text = '') { return (text.split(' ').slice(0,2).map(w=>w[0]).join('')).toUpperCase(); }

/* ---------------- MESSAGING ---------------- */
function sendPrivateMessage(receiverId, text) {
  if (!currentUser) return alert('Please login first.');
  const receiver = users.find(u => u.id === receiverId);
  if (!receiver) return alert('User not found.');

  const message = {
    id: Date.now(),
    senderId: currentUser.id,
    receiverId: receiver.id,
    senderName: currentUser.name,
    receiverName: receiver.name,
    text: text.trim(),
    timestamp: new Date().toISOString()
  };

  messages.push(message);
  localStorage.setItem(STORAGE.MESSAGES, JSON.stringify(messages));
}
function viewProduct(id) {
  window.location.href = `product.html?id=${id}`;
}
function loadFavorites() {
  const grid = document.getElementById('favorites-grid');
  if (!grid) return;

  if (!currentUser) {
    grid.innerHTML = '<div class="card">Please login to view favorites.</div>';
    return;
  }

  const myFavs = favorites.filter(f => f.userId === currentUser.id);
  if (myFavs.length === 0) {
    grid.innerHTML = '<div class="card">You have no favorite items yet.</div>';
    return;
  }

  const favProducts = products.filter(p => myFavs.some(f => f.productId === p.id));
  grid.innerHTML = '';

  favProducts.forEach(p => {
    const div = document.createElement('div');
    div.className = 'product-card';
    div.innerHTML = `
      <div class="product-media" onclick="viewProduct(${p.id})" style="cursor:pointer;">
        ${p.image ? `<img src="${p.image}" alt="${escapeHtml(p.name)}">` : `<div>${escapeHtml(initials(p.name))}</div>`}
      </div>
      <div class="product-body" onclick="viewProduct(${p.id})" style="cursor:pointer;">
        <div class="product-title">${escapeHtml(p.name)}</div>
        <div class="product-price">₱${Number(p.price).toFixed(2)}</div>
        <div class="product-meta">Seller: ${escapeHtml(p.sellerName || 'SwapCart')}</div>
      </div>
      <div class="product-actions">
        <button class="add-to-cart" onclick="event.stopPropagation(); addToCart(${p.id});">Add to Cart</button>
        <button class="favorite-btn" onclick="event.stopPropagation(); toggleFavorite(${p.id});">
          ${favorites.some(f => f.userId === currentUser?.id && f.productId === p.id) ? '❤️' : '🤍'}
        </button>
      </div>`;
    grid.appendChild(div);
  });
}
/* ---------------- REVIEWS & COMMENTS ---------------- */
if (!STORAGE.REVIEWS) STORAGE.REVIEWS = 'reviews';
let reviews = JSON.parse(localStorage.getItem(STORAGE.REVIEWS)) || [];

function loadProductDetails(productId) {
  const product = products.find(p => p.id === productId);
  const container = document.getElementById('product-details');
  if (!container) return;

  if (!product) {
    container.innerHTML = '<div class="card">Product not found.</div>';
    return;
  }

  const isFav = favorites.some(f => f.userId === currentUser?.id && f.productId === product.id);
  const heart = isFav ? '❤️' : '🤍';

  container.innerHTML = `
    <div class="product-img">
      ${product.image ? `<img src="${product.image}" alt="${escapeHtml(product.name)}">` : `<div>${escapeHtml(product.name)}</div>`}
    </div>
    <div class="product-info">
      <h2>${escapeHtml(product.name)}</h2>
      <div class="product-price">₱${Number(product.price).toFixed(2)}</div>
      <div class="product-meta">Seller: ${escapeHtml(product.sellerName || 'SwapCart')}</div>
      <p>Description: ${escapeHtml(product.description || 'No description provided.')}</p>

      <div style="margin-top:10px;">
        <button class="buy-btn" onclick="buyNow(${product.id})">Buy Now</button>
        <button class="cart-btn" onclick="addToCart(${product.id})">Add to Cart</button>
        <button id="fav-btn" class="icon-btn orange" onclick="toggleFavorite(${product.id}); updateFavoriteIcon(${product.id});">
          ${heart} Favorite
        </button>
      </div>
    </div>
  `;
}
function updateFavoriteIcon(productId) {
  const btn = document.getElementById('fav-btn');
  if (!btn) return;
  const isFav = favorites.some(f => f.userId === currentUser?.id && f.productId === productId);
  btn.innerHTML = `${isFav ? '❤️' : '🤍'} Favorite`;
}


function submitReview() {
  const params = new URLSearchParams(window.location.search);
  const productId = parseInt(params.get('id'));
  if (!currentUser) return alert('Please login first.');

  const text = document.getElementById('review-text').value.trim();
  const rating = parseInt(document.getElementById('review-rating').value);

  if (!text) return alert('Please write a comment.');

  const newReview = {
    id: Date.now(),
    productId,
    userId: currentUser.id,
    userName: currentUser.name,
    rating,
    text,
    date: new Date().toLocaleString()
  };

  reviews.push(newReview);
  localStorage.setItem(STORAGE.REVIEWS, JSON.stringify(reviews));
  document.getElementById('review-text').value = '';
  loadReviews(productId);
}

function loadReviews(productId) {
  const list = document.getElementById('reviews-list');
  if (!list) return;

  const productReviews = reviews.filter(r => r.productId === productId);
  if (productReviews.length === 0) {
    list.innerHTML = '<div class="card">No reviews yet. Be the first to comment!</div>';
    return;
  }

  list.innerHTML = productReviews
    .slice()
    .reverse()
    .map(r => `
      <div style="border-bottom:1px solid #ddd;padding:10px 0;">
        <strong>${escapeHtml(r.userName)}</strong> — ${'⭐'.repeat(r.rating)}
        <p>${escapeHtml(r.text)}</p>
        <small>${r.date}</small>
      </div>
    `)
    .join('');
}

function buyNow(id) {
  addToCart(id);
  window.location.href = 'cart.html';
}
function viewSeller(sellerId) {
  if (!sellerId) return alert('Seller info unavailable.');
  window.location.href = `view-seller.html?id=${sellerId}`;
}
/* ---------------- NOTIFICATIONS COUNTERS ---------------- */
function updateBadges() {
  const cartBadge = document.getElementById('cart-count');
  const favBadge = document.getElementById('fav-count');
  const barterBadge = document.getElementById('barter-count');

  if (currentUser) {
    const cartCount = cart.filter(i => i.userId === currentUser.id).length;
    const favCount = favorites.filter(f => f.userId === currentUser.id).length;
    const barterCount = barterItems.filter(b => b.userId === currentUser.id).length;

    if (cartBadge) cartBadge.textContent = cartCount;
    if (favBadge) favBadge.textContent = favCount;
    if (barterBadge) barterBadge.textContent = barterCount;
  } else {
    if (cartBadge) cartBadge.textContent = 0;
    if (favBadge) favBadge.textContent = 0;
    if (barterBadge) barterBadge.textContent = 0;
  }
}

// Automatically update badges on every page load
document.addEventListener('DOMContentLoaded', updateBadges);

// Also re-update after actions that change counts
function refreshAfterAction() {
  updateBadges();
  localStorage.setItem(STORAGE.CART, JSON.stringify(cart));
  localStorage.setItem(STORAGE.FAVORITES, JSON.stringify(favorites));
  localStorage.setItem(STORAGE.BARTER_ITEMS, JSON.stringify(barterItems));
}

// Modify these existing functions slightly to include it:
const oldAddToCart = addToCart;
addToCart = function(productId) {
  oldAddToCart(productId);
  refreshAfterAction();
};

const oldToggleFavorite = toggleFavorite;
toggleFavorite = function(productId) {
  oldToggleFavorite(productId);
  refreshAfterAction();
};

const oldHandleBarterSubmit = handleBarterSubmit;
handleBarterSubmit = function(e) {
  oldHandleBarterSubmit(e);
  setTimeout(refreshAfterAction, 500);
};
/* -------------------------------------------------
   🔔 Notification System (Comments + Private Chat)
   ------------------------------------------------- */
if (!STORAGE.NOTIFICATIONS) STORAGE.NOTIFICATIONS = 'notifications';
let notifications = JSON.parse(localStorage.getItem(STORAGE.NOTIFICATIONS)) || [];

/* Utility to trigger a popup and save notification */
function showNotification(message, type = 'info') {
  const cont = document.getElementById('notification-container');
  if (!cont) return;

  const el = document.createElement('div');
  el.textContent = message;
  el.style.cssText = `
    padding:12px 16px;
    border-radius:12px;
    color:white;
    font-weight:700;
    animation: fadeInOut 4s ease forwards;
    background:${type === 'chat' ? '#5b6ef6' : type === 'comment' ? '#0fb2a6' : '#333'};
    box-shadow:0 10px 30px rgba(0,0,0,0.15);
  `;
  cont.appendChild(el);
  setTimeout(() => el.remove(), 4000);
}

/* Save and display notification */
function pushNotification(targetUserId, message, type) {
  const note = {
    id: Date.now(),
    targetUserId,
    message,
    type,
    date: new Date().toLocaleString(),
    read: false,
  };
  notifications.push(note);
  localStorage.setItem(STORAGE.NOTIFICATIONS, JSON.stringify(notifications));

  // If current user is the recipient, show immediately
  if (currentUser && targetUserId === currentUser.id) {
    showNotification(message, type);
  }
}

/* Show unread notifications on dashboard load */
document.addEventListener('DOMContentLoaded', () => {
  if (!currentUser) return;
  const unread = notifications.filter(n => n.targetUserId === currentUser.id && !n.read);
  unread.forEach(n => showNotification(n.message, n.type));
  // Mark as read
  notifications = notifications.map(n =>
    n.targetUserId === currentUser.id ? { ...n, read: true } : n
  );
  localStorage.setItem(STORAGE.NOTIFICATIONS, JSON.stringify(notifications));
});