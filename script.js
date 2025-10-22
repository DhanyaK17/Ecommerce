// --- PRODUCT DATA ---
const products = [
    {
        id: 1,
        name: "Laptop",
        price: 999.99,
        image: 'img/Laptop.jpg',
        category: 'electronics'
    },
    {
        id: 2,
        name: "Iphone",
        price: 699.99,
        image: 'img/iphone.jpg',
        category: 'electronics'
    },
    {
        id: 3,
        name: "Wireless Headphones",
        price: 199.99,
        image: 'img/wireless headphone.jpg',
        category: 'electronics'
    },
    {
        id: 4,
        name: "Smart Watch",
        price: 299.99,
        image: 'img/Smart watch.jpg',
        category: 'electronics'
    },
    {
        id: 5,
        name: "Washing Machine",
        price: 599.99,
        image: 'img/washing machine.jpg',
        category: 'appliances'
    },
    {
        id: 6,
        name: "Microwave Oven",
        price: 399.99,
        image: 'img/oven.jpg',
        category: 'appliances'
    }
];

// --- CART MANAGEMENT ---
// Function to get cart from localStorage
function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

// Function to save cart to localStorage
function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

// Function to add a product to the cart
function addToCart(productId) {
    const cart = getCart();
    const product = products.find(p => p.id === productId);

    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveCart(cart);
    alert(`${product.name} has been added to your cart.`);
}

// Function to update cart item quantity
function updateQuantity(productId, newQuantity) {
    let cart = getCart();
    const item = cart.find(item => item.id === productId);

    if (item) {
        item.quantity = newQuantity;
    }

    if (item.quantity <= 0) {
        cart = cart.filter(cartItem => cartItem.id !== productId);
    }
    
    saveCart(cart);
    // Re-render cart if on cart page
    if (document.getElementById('cart-items')) {
        renderCartItems();
    }
}


// Function to remove an item from the cart
function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
    // Re-render cart if on cart page
    if (document.getElementById('cart-items')) {
        renderCartItems();
    }
}


// Function to update the cart count in the header
function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElement = document.querySelector('.cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = count;
    }
}

// --- DYNAMIC PAGE RENDERING ---

// Function to render products on the home page
let currentCategoryFilter = 'all';
let currentSearchQuery = '';

function renderProducts(filter = 'all', searchQuery = '') {
    const productGrid = document.getElementById('product-grid');
    if (!productGrid) return;

    productGrid.innerHTML = ''; // Clear existing products

    const q = (searchQuery || '').trim().toLowerCase();
    const filteredProducts = products.filter(p => {
        const matchesCategory = filter === 'all' || p.category === filter;
        const matchesQuery = !q || p.name.toLowerCase().includes(q);
        return matchesCategory && matchesQuery;
    });

    if (filteredProducts.length === 0) {
        productGrid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#666">No products found.</p>';
        return;
    }

    filteredProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" onclick="openProductModal(${product.id})" style="cursor:pointer">
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="price">$${product.price.toFixed(2)}</p>
                <button class="add-to-cart" onclick="addToCart(${product.id})">Add to Cart</button>
            </div>
        `;
        productGrid.appendChild(productCard);
    });
}

// Function to filter products by category
function filterProducts(category) {
    currentCategoryFilter = category;
    renderProducts(currentCategoryFilter, currentSearchQuery);
}

// Function to render items in the cart page
function renderCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const checkoutLink = document.getElementById('checkout-link');

    const cart = getCart();

    if (!cartItemsContainer) return;

    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
        emptyCartMessage.style.display = 'block';
        checkoutLink.style.display = 'none';
        cartTotalElement.style.display = 'none';
    } else {
        emptyCartMessage.style.display = 'none';
        checkoutLink.style.display = 'block';
        cartTotalElement.style.display = 'block';

        let total = 0;
        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="item-details">
                    <h3>${item.name}</h3>
                    <p>Price: $${item.price.toFixed(2)}</p>
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                    </div>
                    <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
                </div>
                <p class="item-total">$${(item.price * item.quantity).toFixed(2)}</p>
            `;
            cartItemsContainer.appendChild(cartItem);
            total += item.price * item.quantity;
        });
        cartTotalElement.textContent = `Total: $${total.toFixed(2)}`;
    }
}

// Function to display order summary on checkout page
function renderCheckoutSummary() {
    const orderSummaryContainer = document.getElementById('order-summary');
    const cart = getCart();
    let total = 0;

    if (!orderSummaryContainer) return;

    orderSummaryContainer.innerHTML = '<h3>Order Summary</h3>';
    cart.forEach(item => {
        const summaryItem = document.createElement('div');
        summaryItem.className = 'summary-item';
        summaryItem.innerHTML = `<p>${item.name} (x${item.quantity}) <span>$${(item.price * item.quantity).toFixed(2)}</span></p>`;
        orderSummaryContainer.appendChild(summaryItem);
        total += item.price * item.quantity;
    });

    const totalElement = document.createElement('h4');
    totalElement.innerHTML = `Total: <span>$${total.toFixed(2)}</span>`;
    orderSummaryContainer.appendChild(totalElement);
}


// --- INITIALIZATION ---
// This code runs when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Render products on the home page
    if (document.getElementById('product-grid')) {
        renderProducts();
    }
    // Render items on the cart page
    if (document.getElementById('cart-items')) {
        renderCartItems();
    }
    // Render summary on the checkout page
    if (document.getElementById('order-summary')) {
        renderCheckoutSummary();
    }
    // Update cart count on all pages
    updateCartCount();
    // Back button: go to previous page if possible, otherwise fallback to cart.html
    const backBtn = document.getElementById('back-button');
    if (backBtn) {
        backBtn.addEventListener('click', (e) => {
            // If there's a navigation history, go back
            try {
                if (window.history && history.length > 1) {
                    history.back();
                    // In case user opened the checkout directly and back() doesn't navigate,
                    // fallback to cart.html after a short delay
                    setTimeout(() => {
                        const path = (location.pathname || '').toLowerCase();
                        if (path.endsWith('cheakout.html') || path.endsWith('/cheakout') || path.endsWith('/cheakout/')) {
                            window.location.href = 'cart.html';
                        }
                    }, 300);
                } else {
                    // No history - go to cart
                    window.location.href = 'cart.html';
                }
            } catch (err) {
                // Fallback on any error
                window.location.href = 'cart.html';
            }
        });
    }
    // Mobile nav behavior removed (toggle button not present in markup)
    // If a mobile menu is desired later we can reintroduce a small isolated toggle.

    // --- Centered search bar handling (category + query) ---
    const centerSearchInput = document.querySelector('.search-bar .search-input');
    const centerSearchCategory = document.querySelector('.search-bar .search-category');
    const centerSearchBtn = document.querySelector('.search-bar .search-btn');

    function debounce(fn, delay = 250) {
        let t;
        return function (...args) {
            clearTimeout(t);
            t = setTimeout(() => fn.apply(this, args), delay);
        };
    }

    function applySearch(query) {
        currentSearchQuery = query || '';
        renderProducts(currentCategoryFilter, currentSearchQuery);
    }

    if (centerSearchInput) {
        const debounced = debounce((e) => applySearch(e.target.value), 300);
        centerSearchInput.addEventListener('input', debounced);
    }

    if (centerSearchCategory) {
        centerSearchCategory.addEventListener('change', (e) => {
            currentCategoryFilter = e.target.value || 'all';
            renderProducts(currentCategoryFilter, currentSearchQuery);
        });
    }

    if (centerSearchBtn && centerSearchInput) {
        centerSearchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            applySearch(centerSearchInput.value);
        });
    }

    // Click-outside handler for mobile menu removed (no mobile menu in markup)

    // Handle checkout form submission
    const checkoutForm = document.getElementById('checkout-form');
    if(checkoutForm){
        // Payment method panels
        const pmRadios = checkoutForm.querySelectorAll('input[name="payment"]');
    const panelCard = document.getElementById('payment-card');
    const panelGpay = document.getElementById('payment-gpay');
    const panelQr = document.getElementById('payment-qr');
    const panelUpi = document.getElementById('payment-upi');

        function showPanel(mode){
            if(panelCard) panelCard.style.display = mode === 'card' ? '' : 'none';
            if(panelGpay) panelGpay.style.display = mode === 'gpay' ? '' : 'none';
            if(panelUpi) panelUpi.style.display = mode === 'upi' ? '' : 'none';
            if(panelQr) panelQr.style.display = mode === 'qr' ? '' : 'none';
        }

        pmRadios.forEach(r => r.addEventListener('change', (e) => showPanel(e.target.value)));

        // GPay demo button
        const gpayBtn = document.getElementById('gpay-btn');
        if (gpayBtn) {
            gpayBtn.addEventListener('click', () => {
                alert('GPay demo: Payment flow started (simulated).');
            });
        }

        // UPI demo button
        const upiBtn = document.getElementById('upi-btn');
        if (upiBtn) {
            upiBtn.addEventListener('click', () => {
                const upi = document.getElementById('upi-id');
                if (!upi) return;
                const val = (upi.value || '').trim();
                // basic UPI id check: alnum/special @ alnum
                if (!/^[\w.\-]+@[\w]+$/.test(val)) {
                    alert('Please enter a valid UPI ID like name@bank');
                    upi.focus();
                    return;
                }
                alert('UPI demo: Payment initiated (simulated).');
            });
        }

        // QR scanner wiring (html5-qrcode)
        const qrStart = document.getElementById('qr-start');
        const qrStop = document.getElementById('qr-stop');
        const qrReaderEl = document.getElementById('qr-reader');
        const qrScannerWrapper = document.getElementById('qr-scanner');
        let html5QrScanner = null;

        function onScanSuccess(decodedText, decodedResult) {
            // Stop scanner and simulate payment
            if (html5QrScanner) {
                try { html5QrScanner.stop().then(() => { html5QrScanner.clear(); }); } catch (e){}
            }
            if (qrScannerWrapper) qrScannerWrapper.style.display = 'none';
            alert('QR code scanned: ' + decodedText + '\nProcessing payment...');
            // trigger the same confirmation flow
            simulatePaymentAndShowConfirmation();
        }

        if (qrStart && qrStop && qrReaderEl) {
            qrStart.addEventListener('click', async () => {
                if (!window.Html5Qrcode) {
                    alert('QR library not loaded');
                    return;
                }
                qrScannerWrapper.style.display = '';
                html5QrScanner = new Html5Qrcode('qr-reader');
                try {
                    await html5QrScanner.start({ facingMode: 'environment' }, { fps: 10, qrbox: 250 }, onScanSuccess);
                } catch (err) {
                    alert('Unable to start camera: ' + err);
                }
            });

            qrStop.addEventListener('click', async () => {
                if (html5QrScanner) {
                    try { await html5QrScanner.stop(); html5QrScanner.clear(); } catch (e){}
                    html5QrScanner = null;
                }
                if (qrScannerWrapper) qrScannerWrapper.style.display = 'none';
            });
        }

        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // simple validation depending on payment method
            const selected = checkoutForm.querySelector('input[name="payment"]:checked');
            const mode = selected ? selected.value : 'card';

            if (mode === 'card') {
                const number = document.getElementById('card-number');
                const exp = document.getElementById('card-exp');
                const cvc = document.getElementById('card-cvc');
                if (!number || !exp || !cvc) return;
                const numVal = (number.value || '').replace(/\s+/g, '');
                if (numVal.length < 12 || !/^[0-9]+$/.test(numVal)) {
                    alert('Please enter a valid card number.');
                    number.focus();
                    return;
                }
                if (!/^(0[1-9]|1[0-2])\/(\d{2})$/.test((exp.value||'').trim())) {
                    alert('Please enter expiry in MM/YY format.');
                    exp.focus();
                    return;
                }
                if (!/^[0-9]{3,4}$/.test((cvc.value||'').trim())) {
                    alert('Please enter a valid CVC.');
                    cvc.focus();
                    return;
                }
            }

            // Simulate payment processing using a mock provider
            const processingModal = document.getElementById('processing-modal');
            const confirmModal = document.getElementById('order-confirm-modal');

            function showModal(el){ if(!el) return; el.classList.add('show'); el.setAttribute('aria-hidden','false'); }
            function hideModal(el){ if(!el) return; el.classList.remove('show'); el.setAttribute('aria-hidden','true'); }

            // Reusable function: build confirmation UI and wire actions
            function simulatePaymentAndShowConfirmation(){
                const cart = getCart();
                let total = 0;
                const lines = cart.map(item => {
                    total += item.price * item.quantity;
                    return `${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`;
                });

                const orderId = `ORD-${Date.now()}`;
                const orderHtml = `
                    <p>Order ID: <strong>${orderId}</strong></p>
                    <p>Items:</p>
                    <ul>${lines.map(l => `<li>${l}</li>`).join('')}</ul>
                    <p><strong>Total: $${total.toFixed(2)}</strong></p>
                `;

                const body = document.getElementById('order-confirm-body');
                if (body) body.innerHTML = orderHtml;

                showModal(confirmModal);

                // Wire PDF download - keep simple fallback
                const downloadBtn = document.getElementById('download-pdf');
                if (downloadBtn) {
                    downloadBtn.onclick = () => {
                        try {
                            const jsPDF = window.jspdf && window.jspdf.jsPDF;
                            if (!jsPDF) { alert('PDF library not loaded.'); return; }
                            const doc = new jsPDF('p', 'pt', 'a4');
                            const margin = 40; let y = 40;
                            doc.setFontSize(18); doc.text('Skm Cart', margin, y);
                            doc.setFontSize(11); doc.text(`Order ID: ${orderId}`, 440, y); y += 18;
                            doc.text(`Date: ${new Date().toLocaleString()}`, 440, y); y += 14;
                            doc.setDrawColor(200); doc.setLineWidth(0.5); doc.line(margin, y, 595 - margin, y); y += 18;
                            doc.setFontSize(12); doc.text('Billed To:', margin, y); doc.setFontSize(10);
                            const nameVal = document.getElementById('name')?.value || '';
                            const emailVal = document.getElementById('email')?.value || '';
                            const addressVal = document.getElementById('address')?.value || '';
                            doc.text(nameVal, margin, y + 14); doc.text(emailVal, margin, y + 28);
                            const addressLines = doc.splitTextToSize(addressVal, 260);
                            doc.text(addressLines, margin, y + 42);
                            const tableX = 340; let itemsY = y;
                            doc.setFontSize(11); doc.text('Item', tableX, itemsY); doc.text('Qty', tableX + 160, itemsY); doc.text('Amount', tableX + 220, itemsY);
                            itemsY += 12; doc.setLineWidth(0.5); doc.line(tableX, itemsY, 595 - margin, itemsY); itemsY += 10;
                            doc.setFontSize(10);
                            lines.forEach((line, idx) => {
                                const parts = line.split(' - $');
                                const titleQty = parts[0] || '';
                                const amount = parts[1] ? `$${parts[1]}` : '';
                                const qtyMatch = titleQty.match(/x(\d+)$/);
                                const qty = qtyMatch ? qtyMatch[1] : '';
                                const title = titleQty.replace(/\s*x\d+$/, '').trim();
                                const rowY = itemsY + idx * 14;
                                doc.text(title, tableX, rowY); doc.text(String(qty), tableX + 160, rowY); doc.text(amount, tableX + 220, rowY);
                            });
                            const finalY = itemsY + lines.length * 14 + 18;
                            doc.setFontSize(12); doc.text(`Total: $${total.toFixed(2)}`, tableX + 120, finalY);
                            doc.setFontSize(9); doc.setTextColor('#666'); doc.text('Thank you for shopping with Skm Cart!', margin, finalY + 30);
                            doc.save(`skm-order-${Date.now()}.pdf`);
                        } catch (err) { alert('PDF generation failed: ' + err.message); }
                    };
                }

                // Wire email (mock)
                const emailBtn = document.getElementById('email-order');
                if (emailBtn) { emailBtn.onclick = () => { alert('Email sent with order details (simulated).'); }; }

                const closeBtn = document.getElementById('close-confirm');
                if (closeBtn) { closeBtn.onclick = () => { hideModal(confirmModal); localStorage.removeItem('cart'); window.location.href = 'index.html'; }; }
            }

            showModal(processingModal);

            // Simulated async payment (1.2s)
            setTimeout(() => {
                hideModal(processingModal);
                simulatePaymentAndShowConfirmation();
            }, 1200);
        });
    }
})