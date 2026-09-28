const PRODUCTS_KEY = "storePOS_products_v1";
const SALES_KEY = "storePOS_sales_v1";

const defaultProducts = [
  {
    barcode: "480000000001",
    name: "Coca-Cola 1.5L",
    cost: 60,
    price: 85,
    stock: 24,
    reorderLevel: 5
  },
  {
    barcode: "480000000002",
    name: "Lucky Me Pancit Canton",
    cost: 10,
    price: 15,
    stock: 50,
    reorderLevel: 10
  },
  {
    barcode: "480000000003",
    name: "Piattos Cheese",
    cost: 12,
    price: 18,
    stock: 30,
    reorderLevel: 5
  },
  {
    barcode: "480000000004",
    name: "Bear Brand Milk",
    cost: 15,
    price: 22,
    stock: 20,
    reorderLevel: 5
  },
  {
    barcode: "480000000005",
    name: "Safeguard Soap",
    cost: 25,
    price: 35,
    stock: 15,
    reorderLevel: 5
  }
];

let products = JSON.parse(localStorage.getItem(PRODUCTS_KEY));

if (!Array.isArray(products)) {
  products = defaultProducts;
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

let sales = JSON.parse(localStorage.getItem(SALES_KEY));

if (!Array.isArray(sales)) {
  sales = [];
  localStorage.setItem(SALES_KEY, JSON.stringify(sales));
}

let cart = [];
let scanner = null;


// =========================
// SAVE DATA
// =========================

function saveData() {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  localStorage.setItem(SALES_KEY, JSON.stringify(sales));
}


// =========================
// NAVIGATION
// =========================

function showSection(sectionId) {

  document.querySelectorAll(".section").forEach(section => {
    section.classList.remove("active");
  });

  const section = document.getElementById(sectionId);

  if (section) {
    section.classList.add("active");
  }

  if (sectionId === "dashboard") {
    renderDashboard();
  }

  if (sectionId === "inventory") {
    renderInventory();
  }

  if (sectionId === "history") {
    renderHistory();
  }
}


// =========================
// DASHBOARD
// =========================

function renderDashboard() {

  const today = new Date().toLocaleDateString("en-PH");

  let todaySales = 0;
  let todayProfit = 0;

  sales.forEach(sale => {

    if (sale.date === today) {
      todaySales += Number(sale.total) || 0;
      todayProfit += Number(sale.profit) || 0;
    }

  });

  const lowStock = products.filter(
    product => product.stock <= product.reorderLevel
  ).length;

  document.getElementById("todaySales").textContent =
    money(todaySales);

  document.getElementById("todayProfit").textContent =
    money(todayProfit);

  document.getElementById("totalProducts").textContent =
    products.length;

  document.getElementById("lowStock").textContent =
    lowStock;
}


// =========================
// PRODUCT SEARCH
// =========================

document.getElementById("scanBtn").addEventListener("click", searchProduct);

document.getElementById("barcodeInput").addEventListener("keydown", event => {

  if (event.key === "Enter") {
    searchProduct();
  }

});


function searchProduct() {

  const barcode = document
    .getElementById("barcodeInput")
    .value
    .trim();

  const message = document.getElementById("productMessage");
  const productList = document.getElementById("productList");

  productList.innerHTML = "";

  if (!barcode) {
    message.textContent = "Enter a barcode.";
    return;
  }

  const product = products.find(
    item => item.barcode === barcode
  );

  if (!product) {
    message.textContent = "Product not found.";
    return;
  }

  if (product.stock <= 0) {
    message.textContent = "Product is out of stock.";
    return;
  }

  message.textContent = "";

  productList.innerHTML = `
    <div class="product-result">

      <div>
        <strong>${escapeHtml(product.name)}</strong>
        <br>
        Barcode: ${escapeHtml(product.barcode)}
        <br>
        Price: ${money(product.price)}
        <br>
        Stock: ${product.stock}
      </div>

      <button onclick="addToCart('${product.barcode}')">
        Add to Cart
      </button>

    </div>
  `;
}


// =========================
// CART
// =========================

function addToCart(barcode) {

  const product = products.find(
    item => item.barcode === barcode
  );

  if (!product) return;

  const existing = cart.find(
    item => item.barcode === barcode
  );

  if (existing) {

    if (existing.quantity >= product.stock) {
      alert("Not enough stock.");
      return;
    }

    existing.quantity++;

  } else {

    cart.push({
      barcode: product.barcode,
      name: product.name,
      price: product.price,
      cost: product.cost,
      quantity: 1
    });

  }

  renderCart();
}


function changeQuantity(index, amount) {

  const item = cart[index];

  if (!item) return;

  const product = products.find(
    product => product.barcode === item.barcode
  );

  if (!product) return;

  const newQuantity = item.quantity + amount;

  if (newQuantity <= 0) {
    cart.splice(index, 1);
  } else if (newQuantity > product.stock) {
    alert("Not enough stock.");
    return;
  } else {
    item.quantity = newQuantity;
  }

  renderCart();
}


function removeFromCart(index) {

  cart.splice(index, 1);

  renderCart();
}


function renderCart() {

  const container = document.getElementById("cartItems");

  container.innerHTML = "";

  let totalQuantity = 0;
  let subtotal = 0;

  cart.forEach((item, index) => {

    const lineTotal = item.price * item.quantity;

    totalQuantity += item.quantity;
    subtotal += lineTotal;

    container.innerHTML += `
      <div class="cart-item">

        <div>
          <strong>${escapeHtml(item.name)}</strong>
          <br>
          ${money(item.price)} × ${item.quantity}
          <br>
          <strong>${money(lineTotal)}</strong>
        </div>

        <div class="cart-controls">

          <button onclick="changeQuantity(${index}, -1)">
            −
          </button>

          <strong>${item.quantity}</strong>

          <button onclick="changeQuantity(${index}, 1)">
            +
          </button>

          <button
            class="remove-btn"
            onclick="removeFromCart(${index})"
          >
            Remove
          </button>

        </div>

      </div>
    `;
  });

  if (cart.length === 0) {
    container.innerHTML =
      "<p>Your cart is empty.</p>";
  }

  document.getElementById("cartCount").textContent =
    totalQuantity;

  document.getElementById("cartSubtotal").textContent =
    money(subtotal);

  document.getElementById("cartTotal").textContent =
    money(subtotal);
}


// =========================
// CHECKOUT
// =========================

document.getElementById("checkoutBtn").addEventListener("click", openCheckout);

function openCheckout() {

  if (cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }

  const total = getCartTotal();

  document.getElementById("checkoutTotal").textContent =
    money(total);

  document.getElementById("paymentInput").value = "";

  document.getElementById("changeAmount").textContent =
    money(0);

  document.getElementById("checkoutMessage").textContent = "";

  document.getElementById("checkoutModal")
    .classList.add("show");
}


document.getElementById("closeCheckoutBtn")
  .addEventListener("click", () => {

    document.getElementById("checkoutModal")
      .classList.remove("show");

  });


document.getElementById("paymentInput")
  .addEventListener("input", updateChange);


function updateChange() {

  const payment =
    Number(document.getElementById("paymentInput").value) || 0;

  const total = getCartTotal();

  const change = payment - total;

  document.getElementById("changeAmount").textContent =
    money(change > 0 ? change : 0);
}


document.getElementById("confirmCheckoutBtn")
  .addEventListener("click", completeCheckout);


function completeCheckout() {

  if (cart.length === 0) return;

  const total = getCartTotal();

  const payment =
    Number(document.getElementById("paymentInput").value);

  const message =
    document.getElementById("checkoutMessage");

  if (!payment || payment < total) {
    message.textContent =
      "Payment is not enough.";
    message.style.color = "#dc2626";
    return;
  }

  for (const item of cart) {

    const product = products.find(
      product => product.barcode === item.barcode
    );

    if (!product || product.stock < item.quantity) {
      message.textContent =
        `${item.name} does not have enough stock.`;

      message.style.color = "#dc2626";
      return;
    }
  }

  let totalCost = 0;

  cart.forEach(item => {

    const product = products.find(
      product => product.barcode === item.barcode
    );

    product.stock -= item.quantity;

    totalCost +=
      product.cost * item.quantity;
  });

  const profit = total - totalCost;

  const now = new Date();

  const sale = {
    id: "SALE-" + Date.now(),

    date: now.toLocaleDateString("en-PH"),

    time: now.toLocaleTimeString("en-PH"),

    total: total,

    cost: totalCost,

    profit: profit,

    payment: payment,

    change: payment - total,

    items: cart.map(item => ({
      barcode: item.barcode,
      name: item.name,
      price: item.price,
      cost: item.cost,
      quantity: item.quantity,
      lineTotal: item.price * item.quantity
    }))
  };

  sales.unshift(sale);

  saveData();

  cart = [];

  renderCart();
  renderDashboard();
  renderInventory();
  renderHistory();

  document.getElementById("checkoutModal")
    .classList.remove("show");

  document.getElementById("barcodeInput").value = "";
  document.getElementById("productList").innerHTML = "";
  document.getElementById("productMessage").textContent = "";

  alert(
    "Checkout successful!\n\n" +
    "Sale ID: " + sale.id +
    "\nTotal: " + money(sale.total)
  );
}


function getCartTotal() {

  return cart.reduce(
    (total, item) =>
      total + (item.price * item.quantity),
    0
  );

}


// =========================
// INVENTORY
// =========================

function renderInventory() {

  const table =
    document.getElementById("inventoryTable");

  table.innerHTML = "";

  products.forEach(product => {

    const low =
      product.stock <= product.reorderLevel;

    table.innerHTML += `
      <tr>

        <td>${escapeHtml(product.barcode)}</td>

        <td>${escapeHtml(product.name)}</td>

        <td>${money(product.cost)}</td>

        <td>${money(product.price)}</td>

        <td>${product.stock}</td>

        <td class="${low ? "status-low" : "status-ok"}">
          ${low ? "Low Stock" : "OK"}
        </td>

      </tr>
    `;
  });
}


// =========================
// HISTORY
// =========================

function renderHistory() {

  const table =
    document.getElementById("historyTable");

  table.innerHTML = "";

  if (sales.length === 0) {

    table.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center;">
          No transaction history yet.
        </td>
      </tr>
    `;

    return;
  }

  sales.forEach((sale, index) => {

    const itemCount = sale.items
      ? sale.items.reduce(
          (sum, item) => sum + Number(item.quantity),
          0
        )
      : 0;

    table.innerHTML += `
      <tr>

        <td>${escapeHtml(sale.id)}</td>

        <td>${escapeHtml(sale.date)}</td>

        <td>${escapeHtml(sale.time)}</td>

        <td>${itemCount}</td>

        <td>${money(sale.total)}</td>

        <td>${money(sale.payment)}</td>

        <td>${money(sale.change)}</td>

        <td>
          <button
            class="view-btn"
            onclick="viewHistory(${index})"
          >
            View
          </button>
        </td>

      </tr>
    `;
  });
}


// =========================
// VIEW TRANSACTION
// =========================

function viewHistory(index) {

  const sale = sales[index];

  if (!sale) return;

  let itemsHTML = "";

  if (Array.isArray(sale.items) && sale.items.length > 0) {

    sale.items.forEach(item => {

      itemsHTML += `
        <div class="receipt-item">

          <span>
            ${escapeHtml(item.name)}
          </span>

          <span>
            ${item.quantity} × ${money(item.price)}
          </span>

          <strong>
            ${money(item.lineTotal)}
          </strong>

        </div>
      `;

    });

  } else {

    itemsHTML = `
      <p>No item details were saved for this transaction.</p>
    `;
  }

  document.getElementById("historyDetails").innerHTML = `

    <div class="receipt-header">

      <strong>${escapeHtml(sale.id)}</strong>

      <div>
        ${escapeHtml(sale.date)}
        — ${escapeHtml(sale.time)}
      </div>

    </div>

    <h3>Items Purchased</h3>

    ${itemsHTML}

    <div class="receipt-total">

      <div class="receipt-row">
        <span>Total</span>
        <strong>${money(sale.total)}</strong>
      </div>

      <div class="receipt-row">
        <span>Payment</span>
        <strong>${money(sale.payment)}</strong>
      </div>

      <div class="receipt-row">
        <span>Change</span>
        <strong>${money(sale.change)}</strong>
      </div>

      <div class="receipt-row">
        <span>Profit</span>
        <strong>${money(sale.profit)}</strong>
      </div>

    </div>
  `;

  document.getElementById("historyModal")
    .classList.add("show");
}


document.getElementById("closeHistoryBtn")
  .addEventListener("click", () => {

    document.getElementById("historyModal")
      .classList.remove("show");

  });


// =========================
// CLEAR HISTORY
// =========================

function clearHistory() {

  if (sales.length === 0) {
    alert("There is no history to clear.");
    return;
  }

  const confirmed = confirm(
    "Are you sure you want to delete all sales history?"
  );

  if (!confirmed) return;

  sales = [];

  saveData();

  renderHistory();
  renderDashboard();

}


// =========================
// CAMERA SCANNER
// =========================

document.getElementById("cameraBtn")
  .addEventListener("click", startCamera);


document.getElementById("closeCameraBtn")
  .addEventListener("click", stopCamera);


async function startCamera() {

  document.getElementById("cameraModal")
    .classList.add("show");

  document.getElementById("scannerMessage").textContent =
    "Starting camera...";

  try {

    scanner = new Html5Qrcode("reader");

    const cameras =
      await Html5Qrcode.getCameras();

    if (!cameras || cameras.length === 0) {
      throw new Error("No camera found.");
    }

    let cameraId = cameras[0].id;

    const rearCamera = cameras.find(camera =>
      /back|rear|environment/i.test(camera.label)
    );

    if (rearCamera) {
      cameraId = rearCamera.id;
    }

    await scanner.start(
      cameraId,
      {
        fps: 10,
        qrbox: {
          width: 250,
          height: 150
        }
      },
      decodedText => {

        document.getElementById("barcodeInput").value =
          decodedText;

        stopCamera();

        searchProduct();

      },
      () => {}
    );

    document.getElementById("scannerMessage").textContent =
      "Point the camera at the barcode.";

  } catch (error) {

    console.error(error);

    document.getElementById("scannerMessage").textContent =
      "Camera could not be started.";

  }
}


async function stopCamera() {

  if (scanner) {

    try {
      await scanner.stop();
    } catch (error) {
      console.log(error);
    }

    scanner.clear();
    scanner = null;
  }

  document.getElementById("cameraModal")
    .classList.remove("show");
}


// =========================
// HELPERS
// =========================

function money(value) {

  return "₱" + Number(value || 0)
    .toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

}


function escapeHtml(value) {

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


// =========================
// INITIALIZE
// =========================

renderDashboard();
renderInventory();
renderCart();
renderHistory();
