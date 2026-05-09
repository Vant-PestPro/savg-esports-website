/* ============================================================
   SAVG ESPORTS -- Cart | savgesports.com
   ============================================================ */
'use strict';

/* ── CONFIG (update these when PayPal account is ready) ── */
var PAYPAL_EMAIL = 'PAYPAL_EMAIL_PLACEHOLDER'; // ← replace with SAVG PayPal email
var SITE_URL     = 'https://vant-pestpro.github.io/savg-esports-website'; // ← replace with live domain

/* ── Product catalog ── */
var PRODUCTS = {
  jersey:      { name: 'SΛVG Jersey',        price: 119.00, img: 'assets/merch-jersey.jpg',     hasSize: true  },
  hoodie:      { name: 'SΛVG Hoodie',         price:  89.00, img: 'assets/merch-hoodie.jpg',     hasSize: true  },
  'xl-mousepad': { name: 'SΛVG XL Mouse Pad', price:  49.00, img: 'assets/merch-gaming-pad.jpg', hasSize: false },
  mousepad:    { name: 'SΛVG Mouse Pad',       price:  29.00, img: 'assets/merch-mousepad.jpg',  hasSize: false },
  hat:         { name: 'SΛVG Hat',             price:  29.00, img: 'assets/merch-hat.jpg',        hasSize: false },
  tumbler:     { name: 'SΛVG Tumbler',         price:  29.00, img: 'assets/merch-tumbler.jpg',   hasSize: false },
};

var CART_KEY = 'savg_cart_v1';

/* ── Cart state ── */
function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch(e) { return []; }
}
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}
function cartCount(cart) {
  return cart.reduce(function(s, i) { return s + i.qty; }, 0);
}
function cartTotal(cart) {
  return cart.reduce(function(s, i) { return s + i.price * i.qty; }, 0);
}

/* ── Badge ── */
function updateCartBadge() {
  var badge = document.getElementById('cartBadge');
  if (!badge) return;
  var count = cartCount(getCart());
  badge.textContent = count > 99 ? '99+' : count;
  badge.style.display = count > 0 ? 'flex' : 'none';
}

/* ── Add to cart ── */
function addToCart(productId, size) {
  var product = PRODUCTS[productId];
  if (!product) return;
  var itemId = size ? productId + '-' + size.toUpperCase() : productId;
  var displayName = product.hasSize && size
    ? product.name + ' (Size: ' + size.toUpperCase() + ')'
    : product.name;
  var cart = getCart();
  var existing = null;
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].id === itemId) { existing = cart[i]; break; }
  }
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: itemId, productId: productId, name: displayName, price: product.price, img: product.img, qty: 1, size: size || null });
  }
  saveCart(cart);
  flashAddedFeedback(productId);
}

/* ── Add-to-cart feedback ── */
function flashAddedFeedback(productId) {
  var card = document.querySelector('[data-product="' + productId + '"]');
  if (!card) return;
  var btn = card.querySelector('.add-to-cart-btn');
  if (!btn) return;
  var orig = btn.textContent;
  btn.textContent = '✓ Added to Cart';
  btn.classList.add('atc-added');
  setTimeout(function() {
    btn.textContent = orig;
    btn.classList.remove('atc-added');
  }, 1500);
}

/* ── Wire up Add-to-Cart buttons on merch page ── */
document.querySelectorAll('[data-product]').forEach(function(card) {
  var productId = card.dataset.product;
  var btn = card.querySelector('.add-to-cart-btn');
  if (!btn) return;
  btn.addEventListener('click', function() {
    var product = PRODUCTS[productId];
    if (!product) return;
    if (product.hasSize) {
      var activeSize = card.querySelector('.size-btn.active');
      if (!activeSize) {
        var sizeRow = card.querySelector('.size-selector');
        if (sizeRow) {
          sizeRow.classList.add('size-shake');
          setTimeout(function() { sizeRow.classList.remove('size-shake'); }, 450);
        }
        return;
      }
      addToCart(productId, activeSize.textContent.trim());
    } else {
      addToCart(productId, null);
    }
  });
});

/* ── Cart page ── */
function renderCartPage() {
  var container = document.getElementById('cartContainer');
  if (!container) return;

  var cart = getCart();

  if (!cart.length) {
    container.innerHTML =
      '<div class="cart-empty">' +
        '<div class="cart-empty-icon">🛒</div>' +
        '<h2 class="cart-empty-title">Your cart is empty</h2>' +
        '<p class="cart-empty-sub">Head back to the merch page and gear up.</p>' +
        '<a href="merch.html" class="btn btn-primary">Shop Merch</a>' +
      '</div>';
    return;
  }

  var itemRows = cart.map(function(item) {
    return (
      '<div class="cart-row" data-item-id="' + item.id + '">' +
        '<div class="cart-row-img"><img src="' + item.img + '" alt="' + item.name + '"></div>' +
        '<div class="cart-row-info">' +
          '<div class="cart-row-name">' + item.name + '</div>' +
        '</div>' +
        '<div class="cart-row-price">$' + item.price.toFixed(2) + '</div>' +
        '<div class="cart-qty">' +
          '<button class="cart-qty-btn" data-action="dec" data-item-id="' + item.id + '">−</button>' +
          '<span class="cart-qty-val">' + item.qty + '</span>' +
          '<button class="cart-qty-btn" data-action="inc" data-item-id="' + item.id + '">+</button>' +
        '</div>' +
        '<div class="cart-row-subtotal">$' + (item.price * item.qty).toFixed(2) + '</div>' +
        '<button class="cart-remove-btn" data-item-id="' + item.id + '" aria-label="Remove item">&times;</button>' +
      '</div>'
    );
  }).join('');

  var total = cartTotal(cart);

  container.innerHTML =
    '<div class="cart-layout">' +
      '<div class="cart-items-panel">' +
        '<div class="cart-items-header">' +
          '<span>Item</span><span></span><span>Price</span><span>Qty</span><span>Subtotal</span><span></span>' +
        '</div>' +
        itemRows +
      '</div>' +
      '<div class="cart-summary-panel">' +
        '<div class="cart-summary-title">Order Summary</div>' +
        '<div class="cart-summary-row"><span>Subtotal</span><span>$' + total.toFixed(2) + '</span></div>' +
        '<div class="cart-summary-row"><span>Shipping</span><span class="cart-summary-muted">Calculated at checkout</span></div>' +
        '<div class="cart-summary-divider"></div>' +
        '<div class="cart-summary-row cart-summary-total"><span>Estimated Total</span><span>$' + total.toFixed(2) + '</span></div>' +
        '<button type="button" class="btn btn-primary cart-checkout-btn" id="paypalCheckoutBtn">' +
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="flex-shrink:0"><path d="M7.076 21.337H2.47a.641.641 0 01-.633-.74L4.944 2.79A.859.859 0 015.79 2.1h7.232c2.479 0 4.217.599 5.168 1.78.444.548.73 1.132.847 1.742.12.626.099 1.386-.063 2.256l-.009.057v.499l.235.134c.206.114.39.253.551.415.262.264.44.597.527.99.09.405.081.895-.026 1.46a7.47 7.47 0 01-.436 1.557 3.75 3.75 0 01-.742 1.138c-.31.322-.694.578-1.143.762-.435.18-.942.271-1.507.271H17.2a.858.858 0 00-.846.726l-.022.12-.506 3.207-.023.118a.858.858 0 01-.846.726H7.076z"/></svg>' +
          'Checkout with PayPal' +
        '</button>' +
        '<a href="merch.html" class="btn btn-outline cart-continue-btn">← Continue Shopping</a>' +
        '<div class="cart-secure-note">' +
          '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;margin-top:1px"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>' +
          'Secure checkout via PayPal. We never see or store your payment details.' +
        '</div>' +
      '</div>' +
    '</div>';

  /* Wire qty + remove buttons */
  container.querySelectorAll('.cart-qty-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var id = btn.dataset.itemId;
      var action = btn.dataset.action;
      var c = getCart();
      for (var i = 0; i < c.length; i++) {
        if (c[i].id !== id) continue;
        if (action === 'inc') { c[i].qty += 1; }
        else { c[i].qty -= 1; if (c[i].qty <= 0) { c.splice(i, 1); } }
        break;
      }
      saveCart(c);
      renderCartPage();
    });
  });

  container.querySelectorAll('.cart-remove-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var id = btn.dataset.itemId;
      saveCart(getCart().filter(function(i) { return i.id !== id; }));
      renderCartPage();
    });
  });

  var ppBtn = document.getElementById('paypalCheckoutBtn');
  if (ppBtn) ppBtn.addEventListener('click', checkoutWithPayPal);
}

/* ── PayPal Cart Upload Checkout ── */
function checkoutWithPayPal() {
  var cart = getCart();
  if (!cart.length) return;

  var form = document.createElement('form');
  form.method = 'post';
  form.action = 'https://www.paypal.com/cgi-bin/webscr';
  form.style.display = 'none';

  var fields = {
    cmd:           '_cart',
    upload:        '1',
    business:      PAYPAL_EMAIL,
    currency_code: 'USD',
    'return':      SITE_URL + '/order-confirmed.html',
    cancel_return: SITE_URL + '/cart.html',
    rm:            '1',   /* Return with POST data */
  };

  cart.forEach(function(item, i) {
    var n = i + 1;
    fields['item_name_'  + n] = item.name;
    fields['amount_'     + n] = item.price.toFixed(2);
    fields['quantity_'   + n] = String(item.qty);
  });

  Object.keys(fields).forEach(function(name) {
    var input = document.createElement('input');
    input.type  = 'hidden';
    input.name  = name;
    input.value = fields[name];
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
}

/* ── Init ── */
updateCartBadge();
renderCartPage();
