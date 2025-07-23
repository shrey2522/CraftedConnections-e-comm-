// Global variables - Updated cart initialization
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let user = null;
let token = localStorage.getItem('token');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    loadUserFromToken();
    // loadProducts();
    loadCartFromStorage();
    updateCartDisplay();
    
    // Mobile menu toggle
    const menuIcon = document.getElementById('menu-icon');
    const navbar = document.querySelector('.navbar');
    
    if (menuIcon) {
        menuIcon.addEventListener('click', () => {
            navbar.classList.toggle('active');
        });
    }
});

// Cart Storage Functions
function loadCartFromStorage() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    } else {
        cart = [];
    }
}

function saveCartToStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Authentication Functions
function loadUserFromToken() {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
        user = null;
        token = null;
        updateAuthUI();
        return;
    }

    token = storedToken;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        fetchUserDetails(payload.userId);
    } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('token');
        token = null;
        user = null;
        updateAuthUI();
    }
}

async function fetchUserDetails(userId) {
    try {
        const response = await fetch('/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            user = await response.json();
            updateAuthUI();
        } else {
            localStorage.removeItem('token');
            token = null;
        }
    } catch (error) {
        console.error('Error fetching user details:', error);
    }
}

function updateAuthUI() {
    const authButtons = document.getElementById('auth-buttons');
    const authActionBtn = document.getElementById('auth-action-btn');
    const heroSignInBtn = document.getElementById('hero-signin-btn');
    const userMenu = document.getElementById('user-menu');
    const usernameDisplay = document.getElementById('username-display');

    if (user && token) {
        // Set navbar button to "Logout"
        if (authActionBtn) {
            authActionBtn.textContent = 'Logout';
            authActionBtn.onclick = logout;
        }

        // Set hero button to "Logout"
        if (heroSignInBtn) {
            heroSignInBtn.textContent = 'Logout';
            heroSignInBtn.onclick = logout;
        }

        if (userMenu) userMenu.style.display = 'block';
        if (usernameDisplay) usernameDisplay.textContent = user.name || 'User';
    } else {
        // Set navbar button to "Sign In"
        if (authActionBtn) {
            authActionBtn.textContent = 'Sign In';
            authActionBtn.onclick = showAuthModal;
        }

        // Set hero button to "Sign In"
        if (heroSignInBtn) {
            heroSignInBtn.textContent = 'Sign In';
            heroSignInBtn.onclick = showAuthModal;
        }

        if (userMenu) userMenu.style.display = 'none';
        if (usernameDisplay) usernameDisplay.textContent = '';
    }
}

function showAuthModal() {
    // Create auth modal
    const modal = document.createElement('div');
    modal.id = 'auth-modal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content auth-modal-content">
            <button class="close" onclick="closeAuthModal()">×</button>
            <div class="auth-tabs">
                <button class="tab-btn active" onclick="showLogin(event)">Login</button>
                <button class="tab-btn" onclick="showRegister(event)">Register</button>
            </div>
            
            <div id="login-form" class="auth-form">
                <h2>Login</h2>
                <form onsubmit="handleLogin(event)">
                    <input type="email" placeholder="Email" required id="login-email">
                    <input type="password" placeholder="Password" required id="login-password">
                    <button type="submit" class="auth-btn">Login</button>
                </form>
            </div>
            
            <div id="register-form" class="auth-form" style="display: none;">
                <h2>Register</h2>
                <form onsubmit="handleRegister(event)">
                    <input type="text" placeholder="Full Name" required id="register-name">
                    <input type="email" placeholder="Email" required id="register-email">
                    <input type="password" placeholder="Password" required id="register-password">
                    <button type="submit" class="auth-btn">Register</button>
                </form>
            </div>
            
            <div id="auth-message" class="auth-message"></div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
}

function closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.remove();
    }
}

function showLogin(event) {
    if (event) event.preventDefault();
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('register-form').style.display = 'none';
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    if (event && event.target) event.target.classList.add('active');
}

function showRegister(event) {
    if (event) event.preventDefault();
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    if (event && event.target) event.target.classList.add('active');
}

async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const messageDiv = document.getElementById('auth-message');
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            token = data.token;
            user = data.user;
            localStorage.setItem('token', token);
            updateAuthUI();
            closeAuthModal();
            showMessage('Login successful!', 'success');
        } else {
            messageDiv.innerHTML = `<p style="color: red;">${data.error}</p>`;
        }
    } catch (error) {
        messageDiv.innerHTML = `<p style="color: red;">Login failed. Please try again.</p>`;
        console.error('Login error:', error);
    }
}

async function handleRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const messageDiv = document.getElementById('auth-message');
    
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            token = data.token;
            user = data.user;
            localStorage.setItem('token', token);
            updateAuthUI();
            closeAuthModal();
            showMessage('Registration successful!', 'success');
        } else {
            messageDiv.innerHTML = `<p style="color: red;">${data.error}</p>`;
        }
    } catch (error) {
        messageDiv.innerHTML = `<p style="color: red;">Registration failed. Please try again.</p>`;
        console.error('Registration error:', error);
    }
}

function logout() {
    user = null;
    token = null;
    cart = [];
    localStorage.removeItem('token');
    localStorage.removeItem('cart'); // Clear cart from localStorage
    updateAuthUI();
    updateCartDisplay();
    showMessage('Logged out successfully!', 'success');
}

// Product Functions
async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        const products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

function displayProducts(products) {
    const shopContainer = document.querySelector('.shop-container');
    if (!shopContainer) return;
    
    // Keep existing static products and add dynamic ones
    const dynamicProducts = products.map(product => `
        <div class="box">
            <div class="box-img">
                <img src="${product.imageUrl}" alt="${product.name}" />
            </div>
            <div class="title-price">
                <h3>${product.name}</h3>
                <div class="stars">
                    ${generateStars(product.rating)}
                </div>
                <span class="price">₹${product.price}</span>
            </div>
            <button onclick="addToCart(${product.id}, '${product.name}', ${product.price})" class="cart-btn">
                <i class='bx bx-cart'></i>
            </button>
        </div>
    `).join('');
    
    // Append to existing products
    shopContainer.innerHTML += dynamicProducts;
}

function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="bx bxs-star"></i>';
    }
    
    if (hasHalfStar) {
        stars += '<i class="bx bxs-star-half"></i>';
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="bx bx-star"></i>';
    }
    
    return stars;
}

// Cart Functions - Updated with localStorage
function addToCart(productId, productName, price) {
    if (!user) {
        showAuthModal();
        return;
    }
    
    const existingItem = cart.find(item => item.productId === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            productId,
            name: productName,
            price,
            quantity: 1
        });
    }
    
    saveCartToStorage(); // Save to localStorage
    updateCartDisplay();
    showMessage('Item added to cart!', 'success');
}

function updateCartDisplay() {
    const cartCount = document.getElementById('cart-count');
    if (!cartCount) return; // Don't run if element not found

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
}

function showCart() {
    if (!user) {
        showAuthModal();
        return;
    }
    
    const modal = document.getElementById('cart-modal');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p>Your cart is empty</p>';
        cartTotal.textContent = 'Total: ₹0';
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <span>${item.name}</span>
                <div class="quantity-controls">
                    <button onclick="updateQuantity(${item.productId}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity(${item.productId}, 1)">+</button>
                </div>
                <span>₹${item.price * item.quantity}</span>
                <button onclick="removeFromCart(${item.productId})" class="remove-btn">×</button>
            </div>
        `).join('');
        
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = `Total: ₹${total}`;
    }
    
    modal.style.display = 'block';
}

function closeCartModal() {
    document.getElementById('cart-modal').style.display = 'none';
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.productId === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCartToStorage(); // Save to localStorage
            showCart(); // Refresh cart display
            updateCartDisplay();
        }
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.productId !== productId);
    saveCartToStorage(); // Save to localStorage
    showCart(); // Refresh cart display
    updateCartDisplay();
}

async function checkout() {
    if (!user || cart.length === 0) return;
    
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                items: cart,
                totalAmount
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            cart = [];
            saveCartToStorage(); // Clear cart from localStorage
            updateCartDisplay();
            closeCartModal();
            showMessage('Order placed successfully!', 'success');
        } else {
            showMessage(data.error || 'Order failed', 'error');
        }
    } catch (error) {
        console.error('Checkout error:', error);
        showMessage('Order failed. Please try again.', 'error');
    }
}

function payNow() {
    // Simple payment simulation
    showMessage('Payment feature coming soon!', 'info');
}

// Orders Function
function showOrders() {
    showMessage('Orders feature coming soon!', 'info');
}

// Utility Functions
function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        z-index: 10000;
        font-weight: bold;
    `;
    
    switch (type) {
        case 'success':
            messageDiv.style.backgroundColor = '#4CAF50';
            break;
        case 'error':
            messageDiv.style.backgroundColor = '#f44336';
            break;
        default:
            messageDiv.style.backgroundColor = '#2196F3';
    }
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// Close modals when clicking outside
window.addEventListener('click', function(event) {
    const authModal = document.getElementById('auth-modal');
    const cartModal = document.getElementById('cart-modal');
    
    if (event.target === authModal) {
        closeAuthModal();
    }
    
    if (event.target === cartModal) {
        closeCartModal();
    }
});