// Static Admin Data
const STATIC_ADMIN = {
    email: 'admin@ecommerce.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'Admin'
};

// Initialize app - check if logged in
document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Auto-login check for index.html (if we add it later)
    checkAuth();
});

// Navigation helpers
const navigateTo = (page) => {
    window.location.href = page;
};

// --- Registration Logic ---
function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const phone = document.getElementById('reg-phone').value;
    const address = document.getElementById('reg-address').value;
    const password = document.getElementById('reg-password').value;

    // Basic Validation
    if (!name || !email || !phone || !address || !password) {
        alert('Please fill all fields.');
        return;
    }

    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.some(user => user.email === email) || email === STATIC_ADMIN.email) {
        alert('User already exists with this email.');
        return;
    }

    // Modern styled alert/feedback could be added here
    const newUser = {
        name,
        email,
        phone,
        address,
        password,
        role: 'Customer' // Default role
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    alert('Registration successful! You can now login.');
    navigateTo('login.html');
}

// --- Login Logic ---
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();

    if (!email || !password) {
        alert('Please fill all login fields.');
        return;
    }

    // Static Admin Check
    if (email === STATIC_ADMIN.email && password === STATIC_ADMIN.password) {
        sessionStorage.setItem('currentUser', JSON.stringify(STATIC_ADMIN));
        alert('Logged in as Admin!');
        navigateTo('index.html');
        return;
    }

    // Regular User Check
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        alert('Login successful! Welcome, ' + user.name);
        navigateTo('index.html');
    } else {
        alert('Invalid email or password.');
    }
}

// Check Authentication Status
function checkAuth() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const isLoginPage = window.location.pathname.includes('login.html');
    const isRegisterPage = window.location.pathname.includes('register.html');
    const isIndexPath = window.location.pathname.endsWith('/') || window.location.pathname.includes('index.html');

    if (isLoginPage || isRegisterPage) {
        if (currentUser) {
            navigateTo('index.html');
        }
    }

    if (isIndexPath) {
        if (!currentUser) {
            navigateTo('login.html');
        } else {
            // Already logged in, display welcome
            const welcomeMsg = document.getElementById('welcome-message');
            if (welcomeMsg) {
                welcomeMsg.innerText = `Welcome, ${currentUser.name}!`;
            }
            const roleBadge = document.getElementById('role-badge');
            if (roleBadge) {
                roleBadge.innerText = currentUser.role;
            }
        }
    }
}

// Admin Permission Check
function checkAdmin() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'Admin') {
        alert('Access Denied: Admin role required.');
        navigateTo('index.html');
        window.stop(); // Stop potential subsequent JS
        return false;
    }
    return true;
}

// Logout Logic
function logout() {
    sessionStorage.removeItem('currentUser');
    navigateTo('login.html');
}

// --- Cart Logic ---
function getCart() {
    const userEmail = JSON.parse(sessionStorage.getItem('currentUser'))?.email || 'guest';
    return JSON.parse(localStorage.getItem(`cart_${userEmail}`) || '[]');
}

function saveCart(cart) {
    const userEmail = JSON.parse(sessionStorage.getItem('currentUser'))?.email || 'guest';
    localStorage.setItem(`cart_${userEmail}`, JSON.stringify(cart));
}

function addToCart(productId, quantity) {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const product = products.find(p => p.id == productId);
    
    if (!product) return;

    let cart = getCart();
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty < 1) {
        alert('Please enter a valid quantity.');
        return;
    }

    const existing = cart.find(item => item.id == productId);
    
    if (existing) {
        existing.quantity += qty;
    } else {
        cart.push({ ...product, quantity: qty });
    }
    
    saveCart(cart);
    alert(`Added ${quantity} x ${product.name} to cart!`);
    
    // Update cart count if UI exists
    updateCartIcon();
}

function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id != productId);
    saveCart(cart);
    updateCartIcon();
}

function updateCartIcon() {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById('cart-count');
    if (badge) {
        badge.innerText = count;
        // Check if style exists before setting display
        if (badge.tagName === 'SPAN') {
            badge.style.display = count > 0 ? 'block' : 'none';
        }
    }
}

// --- Order Logic ---
function getOrders() {
    const userEmail = JSON.parse(sessionStorage.getItem('currentUser'))?.email || 'guest';
    return JSON.parse(localStorage.getItem(`orders_${userEmail}`) || '[]');
}

function placeOrder(customerDetails, paymentDetails) {
    const userEmail = JSON.parse(sessionStorage.getItem('currentUser'))?.email || 'guest';
    const cart = getCart();
    if (cart.length === 0) return { success: false, message: 'Cart is empty.' };

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const newOrder = {
        id: 'ORD-' + Date.now(),
        date: new Date().toLocaleString(),
        items: cart,
        total: total,
        status: 'Processing',
        customer: customerDetails,
        payment: { method: paymentDetails.method, last4: '****' } // Masked payment
    };

    const orders = JSON.parse(localStorage.getItem(`orders_${userEmail}`) || '[]');
    orders.unshift(newOrder); // Newest first
    localStorage.setItem(`orders_${userEmail}`, JSON.stringify(orders));
    
    // Clear cart after order
    localStorage.removeItem(`cart_${userEmail}`);
    updateCartIcon();
    
    return { success: true, orderId: newOrder.id };
}
