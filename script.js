document.addEventListener("DOMContentLoaded", () => {
  // DOM elements
  const cartContainer = document.getElementById("cart-items");
  const subtotalElement = document.getElementById("cart-subtotal");
  const totalElement = document.getElementById("cart-total");
  const loadingIndicator = document.getElementById("loader");
  const checkoutButton = document.getElementById("checkout-btn");
  const confirmationModal = document.getElementById("removeModal");
  const confirmButton = document.getElementById("confirmRemove");
  const cancelButton = document.getElementById("cancelRemove");

  // State variables
  let cartData = [];
  let productIdToRemove = null;

  /** Helper Functions */

  // Fetch cart data from API
  const fetchCartData = async () => {
    try {
      loadingIndicator.style.display = "block";
      const response = await fetch(
        "https://cdn.shopify.com/s/files/1/0883/2188/4479/files/apiCartData.json?v=1728384889"
      );
      const data = await response.json();
      // Map the fetched data to the required format
      cartData = data.items.map((product) => ({
        id: product.id,
        title: product.title,
        price: product.presentment_price / 100,
        quantity: product.quantity,
        image: product.featured_image.url,
      }));
      updateCart();
    } catch (error) {
      console.error("Failed to fetch cart data:", error);
    } finally {
      loadingIndicator.style.display = "none";
    }
  };

  // Save the cart data to localStorage
  const saveCartData = () => {
    localStorage.setItem("cart", JSON.stringify(cartData));
  };

  // Calculate and update subtotal and total values
  const calculateTotals = () => {
    const subtotal = cartData.reduce((total, item) => total + item.price * item.quantity, 0);
    subtotalElement.textContent = `Rs. ${subtotal.toFixed(2)}`;
    totalElement.textContent = `Rs. ${subtotal.toFixed(2)}`;
  };

  // Render cart items in the DOM
  const renderCartItems = () => {
    // Clear the cart container and populate it with updated cart items
    cartContainer.innerHTML = cartData
      .map(
        (product) => `
        <table class="product-table">
          <thead>
            <tr>
              <th></th>
              <th>Product</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Subtotal</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr class="cart-item">
              <td><img src="${product.image}" alt="${product.title}" class="product-image"></td>
              <td><p class="product-title">${product.title}</p></td>
              <td class="product-price">Rs. ${product.price}</td>
              <td>
                <input type="number" value="${product.quantity}" min="1" data-id="${product.id}" class="item-quantity">
              </td>
              <td class="product-subtotal">Rs. ${(product.price * product.quantity).toFixed(2)}</td>
              <td>
                <button class="remove-item" data-id="${product.id}">
                  <img src="./Public/Main/Delete.png" alt="Remove" class="remove-icon">
                </button>
              </td>
            </tr>
          </tbody>
        </table>`
      )
      .join("");
  };

  // Update the cart by rendering items and recalculating totals
  const updateCart = () => {
    renderCartItems();
    calculateTotals();
    saveCartData();
  };

  /** Event Listeners */

  // Use event delegation for cart item events
  cartContainer.addEventListener("click", (e) => {
    // Handle remove item button click
    if (e.target.closest(".remove-item")) {
      productIdToRemove = parseInt(e.target.closest(".remove-item").dataset.id);
      confirmationModal.style.display = "flex";
    }
  });

  // Listener for quantity change
  cartContainer.addEventListener("change", (e) => {
    if (e.target.classList.contains("item-quantity")) {
      const productId = parseInt(e.target.dataset.id);
      const newQuantity = Math.max(1, parseInt(e.target.value));
      updateItemQuantity(productId, newQuantity);
    }
  });

  // Update the quantity of a specific item
  const updateItemQuantity = (productId, quantity) => {
    cartData = cartData.map((item) =>
      item.id === productId ? { ...item, quantity } : item
    );
    updateCart();
  };

  // Remove an item from the cart
  const removeItem = (productId) => {
    cartData = cartData.filter((item) => item.id !== productId);
    updateCart();
  };

  // Confirm item removal from the cart
  confirmButton.addEventListener("click", () => {
    if (productIdToRemove !== null) {
      removeItem(productIdToRemove);
      productIdToRemove = null;
    }
    confirmationModal.style.display = "none";
  });

  // Cancel item removal
  cancelButton.addEventListener("click", () => {
    confirmationModal.style.display = "none";
  });

  // Listener for the checkout button
  checkoutButton.addEventListener("click", () => {
    // Create and display a custom alert
    const alertBox = document.createElement("div");
    alertBox.className = "custom-alert";
    alertBox.innerText = "Thank you! Your order has been placed successfully."; 
    document.body.appendChild(alertBox);

    // Remove the alert after a few seconds
    setTimeout(() => {
      alertBox.remove();
    }, 3000);

    // Clear the cart
    localStorage.removeItem("cart");
    cartData = [];
    updateCart();
  });

  /** Initialization */

  // Initialize the cart by loading from localStorage or fetching from API
  const initializeCart = () => {
    const savedCart = localStorage.getItem("cart");
    cartData = savedCart ? JSON.parse(savedCart) : [];
    if (cartData.length > 0) {
      updateCart();
    } else {
      fetchCartData();
    }
  };

  initializeCart();
});
