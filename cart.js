let cart = [];

function addToCart(product) {
  if (!product) return cart;

  const item = {
    name: product.nombre,
    price: product.precio,
    image: product.imagenes[0],
    quantity: 1,
    sku: product.sku
  };

  const existingItem = cart.find(p => p.sku === item.sku);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push(item);
  }

  return cart;
}

function removeFromCart(index) {
  const item = cart[index];
  if (!item) return cart;
  cart.splice(index, 1);
  if (typeof document !== 'undefined') updateCart();
  return cart;
}

function updateCart() {
  if (typeof document === 'undefined') {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return { count, total, cart };
  }

  const cartItems = document.getElementById('cart-items');
  const cartCount = document.getElementById('cart-count');
  const cartTotal = document.getElementById('cart-total');

  cartItems.innerHTML = '';

  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="text-gray-500">Tu carrito está vacío</p>';
    cartCount.textContent = '0';
    cartTotal.textContent = '$0';
    return;
  }

  let total = 0;

  cart.forEach((item, index) => {
    total += item.price * item.quantity;

    const itemElement = document.createElement('div');
    itemElement.className = 'cart-item';
    itemElement.innerHTML = `
                    <img src="${item.image}" alt="${item.name}" loading="lazy" class="rounded">
                    <div class="flex-1">
                        <h4 class="font-medium">${item.name}</h4>
                        <p class="text-sm text-gray-600">$${item.price.toLocaleString('es-AR')} x ${item.quantity}</p>
                        <p class="text-sm font-bold">$${(item.price * item.quantity).toLocaleString('es-AR')}</p>
                    </div>
                    <button onclick="removeFromCart(${index})" class="text-red-500 hover:text-red-700">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                `;
    cartItems.appendChild(itemElement);
  });

  cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartTotal.textContent = `$${total.toLocaleString('es-AR')}`;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { cart, addToCart, removeFromCart, updateCart };
} else {
  window.cart = cart;
  window.addToCart = addToCart;
  window.removeFromCart = removeFromCart;
  window.updateCart = updateCart;
}
