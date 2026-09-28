/* =========================================================
   STORE POS SYSTEM
   - Local Storage Save Data
   - Barcode Search
   - Cart
   - Checkout
   - Inventory
   - Sales
   - Dashboard
   - Camera Barcode Scanner
   ========================================================= */


/* =========================
   STORAGE KEYS
   ========================= */

const PRODUCTS_KEY = "storePOS_products";
const CART_KEY = "storePOS_cart";
const SALES_KEY = "storePOS_sales";


/* =========================
   DEFAULT PRODUCTS
   ========================= */

const defaultProducts = [
    {
        barcode: "480000000001",
        name: "Coca-Cola 1.5L",
        category: "Beverages",
        cost: 60,
        price: 85,
        stock: 24,
        reorder: 5
    },
    {
        barcode: "480000000002",
        name: "Lucky Me Pancit Canton",
        category: "Food",
        cost: 10,
        price: 15,
        stock: 50,
        reorder: 10
    },
    {
        barcode: "480000000003",
        name: "Piattos Cheese",
        category: "Snacks",
        cost: 12,
        price: 18,
        stock: 30,
        reorder: 5
    }
];


/* =========================
   LOAD / SAVE DATA
   ========================= */

function loadData(key, fallback) {
    try {
        const data = localStorage.getItem(key);

        if (!data) {
            return fallback;
        }

        return JSON.parse(data);
    } catch (error) {
        console.error("Error loading data:", error);
        return fallback;
    }
}


function saveData(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error("Error saving data:", error);
    }
}


/* =========================
   APP DATA
   ========================= */

let products = loadData(
    PRODUCTS_KEY,
    JSON.parse(JSON.stringify(defaultProducts))
);

let cart = loadData(CART_KEY, []);

let sales = loadData(SALES_KEY, []);


/* =========================
   ELEMENTS
   ========================= */

const barcodeInput = document.getElementById("barcodeInput");
const scanBtn = document.getElementById("scanBtn");

const productMessage = document.getElementById("productMessage");
const productList = document.getElementById("productList");

const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartSubtotal = document.getElementById("cartSubtotal");
const cartTotal = document.getElementById("cartTotal");
const checkoutBtn = document.getElementById("checkoutBtn");

const inventoryTable = document.getElementById("inventoryTable");
const salesTable = document.getElementById("salesTable");

const todaySales = document.getElementById("todaySales");
const todayProfit = document.getElementById("todayProfit");
const totalProducts = document.getElementById("totalProducts");
const lowStock = document.getElementById("lowStock");

const scannerModal = document.getElementById("scannerModal");
const closeScannerBtn = document.getElementById("closeScannerBtn");
const scannerVideo = document.getElementById("scannerVideo");

const checkoutModal = document.getElementById("checkoutModal");
const closeCheckoutBtn = document.getElementById("closeCheckoutBtn");
const checkoutTotal = document.getElementById("checkoutTotal");
const paymentInput = document.getElementById("paymentInput");


/* =========================
   HELPER FUNCTIONS
   ========================= */

function peso(amount) {
    return "₱" + Number(amount || 0).toFixed(2);
}


function escapeHTML(text) {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function saveAll() {
    saveData(PRODUCTS_KEY, products);
    saveData(CART_KEY, cart);
    saveData(SALES_KEY, sales);
}


/* =========================
   NAVIGATION
   ========================= */

document.querySelectorAll(".nav-btn").forEach(button => {

    button.addEventListener("click", () => {

        const sectionName = button.dataset.section;

        document.querySelectorAll(".nav-btn").forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        document.querySelectorAll(".section").forEach(section => {
            section.classList.remove("active");
        });

        const section = document.getElementById(sectionName);

        if (section) {
            section.classList.add("active");
        }

        refreshUI();
    });

});


/* =========================
   PRODUCT SEARCH
   ========================= */

function searchProduct(barcode) {

    barcode = String(barcode).trim();

    if (!barcode) {
        showMessage("Please enter a barcode.", "error");
        return;
    }

    const product = products.find(
        item => String(item.barcode) === barcode
    );

    if (!product) {
        productList.innerHTML = "";
        showMessage("Product not found.", "error");
        return;
    }

    if (product.stock <= 0) {
        productList.innerHTML = `
            <div class="product-card">
                <h3>${escapeHTML(product.name)}</h3>
                <p>Barcode: ${escapeHTML(product.barcode)}</p>
                <p>Out of stock.</p>
            </div>
        `;

        showMessage("Product is out of stock.", "error");
        return;
    }

    productList.innerHTML = `
        <div class="product-card">

            <h3>${escapeHTML(product.name)}</h3>

            <p>
                Barcode:
                ${escapeHTML(product.barcode)}
            </p>

            <p>
                Category:
                ${escapeHTML(product.category)}
            </p>

            <p>
                Price:
                <strong>${peso(product.price)}</strong>
            </p>

            <p>
                Stock:
                ${product.stock}
            </p>

            <button
                class="primary-btn"
                onclick="addToCart('${escapeHTML(product.barcode)}')"
            >
                Add to Cart
            </button>

        </div>
    `;

    showMessage("Product found.", "success");
}


/* =========================
   SEARCH EVENTS
   ========================= */

if (barcodeInput) {

    barcodeInput.addEventListener("keydown", event => {

        if (event.key === "Enter") {
            searchProduct(barcodeInput.value);
        }

    });

}


function showMessage(message, type = "") {

    if (!productMessage) return;

    productMessage.textContent = message;
    productMessage.className = "message";

    if (type) {
        productMessage.classList.add(type);
    }

}


/* =========================
   ADD TO CART
   ========================= */

function addToCart(barcode) {

    const product = products.find(
        item => String(item.barcode) === String(barcode)
    );

    if (!product) {
        showMessage("Product not found.", "error");
        return;
    }

    if (product.stock <= 0) {
        showMessage("Product is out of stock.", "error");
        return;
    }

    const existing = cart.find(
        item => String(item.barcode) === String(barcode)
    );

    if (existing) {

        if (existing.quantity >= product.stock) {
            showMessage("Not enough stock.", "error");
            return;
        }

        existing.quantity += 1;

    } else {

        cart.push({
            barcode: product.barcode,
            name: product.name,
            price: product.price,
            cost: product.cost,
            quantity: 1
        });

    }

    saveData(CART_KEY, cart);

    renderCart();

    showMessage(
        product.name + " added to cart.",
        "success"
    );
}


/* =========================
   CART
   ========================= */

function renderCart() {

    if (!cartItems) return;

    if (cart.length === 0) {

        cartItems.innerHTML = `
            <div class="empty-cart">
                <p>Your cart is empty.</p>
                <span>Add a product using the barcode.</span>
            </div>
        `;

        updateCartSummary();
        return;
    }

    cartItems.innerHTML = cart.map((item, index) => {

        return `
            <div class="cart-item">

                <div class="cart-item-info">

                    <strong>
                        ${escapeHTML(item.name)}
                    </strong>

                    <span>
                        ${peso(item.price)} each
                    </span>

                </div>

                <div class="quantity-controls">

                    <button
                        onclick="changeQuantity(${index}, -1)"
                    >
                        −
                    </button>

                    <span>
                        ${item.quantity}
                    </span>

                    <button
                        onclick="changeQuantity(${index}, 1)"
                    >
                        +
                    </button>

                </div>

                <div class="cart-item-total">
                    ${peso(item.price * item.quantity)}
                </div>

                <button
                    class="remove-btn"
                    onclick="removeFromCart(${index})"
                >
                    ×
                </button>

            </div>
        `;

    }).join("");

    updateCartSummary();
}


/* =========================
   CHANGE QUANTITY
   ========================= */

function changeQuantity(index, amount) {

    const item = cart[index];

    if (!item) return;

    const product = products.find(
        p => String(p.barcode) === String(item.barcode)
    );

    if (!product) return;

    const newQuantity = item.quantity + amount;

    if (newQuantity <= 0) {
        cart.splice(index, 1);
    } else {

        if (newQuantity > product.stock) {
            showMessage("Not enough stock.", "error");
            return;
        }

        item.quantity = newQuantity;
    }

    saveData(CART_KEY, cart);

    renderCart();
}


/* =========================
   REMOVE CART ITEM
   ========================= */

function removeFromCart(index) {

    if (index < 0 || index >= cart.length) {
        return;
    }

    cart.splice(index, 1);

    saveData(CART_KEY, cart);

    renderCart();
}


/* =========================
   CART TOTAL
   ========================= */

function getCartTotal() {

    return cart.reduce(
        (total, item) =>
            total + Number(item.price) * Number(item.quantity),
        0
    );
}


function updateCartSummary() {

    const total = getCartTotal();

    const count = cart.reduce(
        (total, item) =>
            total + Number(item.quantity),
        0
    );

    if (cartCount) {
        cartCount.textContent =
            count + (count === 1 ? " item" : " items");
    }

    if (cartSubtotal) {
        cartSubtotal.textContent = peso(total);
    }

    if (cartTotal) {
        cartTotal.textContent = peso(total);
    }

}


/* =========================
   CHECKOUT MODAL
   ========================= */

if (checkoutBtn) {

    checkoutBtn.addEventListener("click", () => {

        if (cart.length === 0) {
            alert("Your cart is empty.");
            return;
        }

        const total = getCartTotal();

        if (checkoutTotal) {
            checkoutTotal.textContent = peso(total);
        }

        if (paymentInput) {
            paymentInput.value = "";
        }

        openModal(checkoutModal);

    });

}


function openModal(modal) {

    if (!modal) return;

    modal.classList.add("active");
    modal.style.display = "flex";
}


function closeModal(modal) {

    if (!modal) return;

    modal.classList.remove("active");
    modal.style.display = "none";
}


if (closeCheckoutBtn) {

    closeCheckoutBtn.addEventListener("click", () => {
        closeModal(checkoutModal);
    });

}


/* =========================
   FIND CHECKOUT BUTTON
   ========================= */

function getConfirmCheckoutButton() {

    const possibleButtons = [
        document.getElementById("confirmCheckoutBtn"),
        document.getElementById("confirmPaymentBtn"),
        document.getElementById("completeCheckoutBtn"),
        document.getElementById("payBtn"),
        document.getElementById("confirmBtn")
    ];

    for (const button of possibleButtons) {
        if (button) {
            return button;
        }
    }

    if (checkoutModal) {

        const buttons =
            checkoutModal.querySelectorAll("button");

        for (const button of buttons) {

            if (
                button !== closeCheckoutBtn &&
                !button.classList.contains("close-btn")
            ) {
                return button;
            }

        }

    }

    return null;
}


const confirmCheckoutButton =
    getConfirmCheckoutButton();


/* =========================
   COMPLETE CHECKOUT
   ========================= */

function completeCheckout() {

    if (cart.length === 0) {
        alert("Your cart is empty.");
        return;
    }

    const payment =
        Number(paymentInput ? paymentInput.value : 0);

    const total = getCartTotal();

    if (!payment || payment <= 0) {
        alert("Please enter payment.");
        return;
    }

    if (payment < total) {
        alert(
            "Insufficient payment.\n\n" +
            "Total: " + peso(total) +
            "\nPayment: " + peso(payment)
        );

        return;
    }


    /* CHECK STOCK */

    for (const item of cart) {

        const product = products.find(
            p => String(p.barcode) === String(item.barcode)
        );

        if (!product) {
            alert(
                "Product no longer exists: " +
                item.name
            );

            return;
        }

        if (item.quantity > product.stock) {

            alert(
                "Not enough stock for " +
                item.name
            );

            return;
        }

    }


    /* CALCULATE COST AND PROFIT */

    let totalCost = 0;

    cart.forEach(item => {

        totalCost +=
            Number(item.cost) *
            Number(item.quantity);

    });

    const profit = total - totalCost;

    const now = new Date();

    const sale = {

        id:
            "SALE-" +
            now.getTime(),

        date:
            now.toLocaleDateString(),

        time:
            now.toLocaleTimeString(),

        total:
            total,

        cost:
            totalCost,

        profit:
            profit,

        payment:
            payment,

        change:
            payment - total,

        items:
            JSON.parse(JSON.stringify(cart))

    };


    /* DEDUCT INVENTORY */

    cart.forEach(item => {

        const product = products.find(
            p => String(p.barcode) === String(item.barcode)
        );

        if (product) {
            product.stock -= item.quantity;

            if (product.stock < 0) {
                product.stock = 0;
            }
        }

    });


    /* SAVE SALE */

    sales.unshift(sale);


    /* CLEAR CART */

    cart = [];


    /* SAVE EVERYTHING */

    saveAll();


    /* REFRESH DISPLAY */

    renderCart();
    renderInventory();
    renderSales();
    updateDashboard();


    closeModal(checkoutModal);


    if (barcodeInput) {
        barcodeInput.value = "";
    }

    if (productList) {
        productList.innerHTML = "";
    }

    showMessage(
        "Checkout successful!",
        "success"
    );

    alert(
        "Checkout successful!\n\n" +
        "Total: " + peso(total) +
        "\nPayment: " + peso(payment) +
        "\nChange: " + peso(payment - total)
    );

}


if (confirmCheckoutButton) {

    confirmCheckoutButton.addEventListener(
        "click",
        completeCheckout
    );

}


/* =========================
   INVENTORY
   ========================= */

function renderInventory() {

    if (!inventoryTable) return;

    if (products.length === 0) {

        inventoryTable.innerHTML = `
            <tr>
                <td colspan="7">
                    No products found.
                </td>
            </tr>
        `;

        return;
    }


    inventoryTable.innerHTML =
        products.map(product => {

            let status = "In Stock";

            if (product.stock <= 0) {
                status = "Out of Stock";
            } else if (
                product.stock <= product.reorder
            ) {
                status = "Low Stock";
            }

            return `
                <tr>

                    <td>
                        ${escapeHTML(product.barcode)}
                    </td>

                    <td>
                        ${escapeHTML(product.name)}
                    </td>

                    <td>
                        ${escapeHTML(product.category)}
                    </td>

                    <td>
                        ${peso(product.cost)}
                    </td>

                    <td>
                        ${peso(product.price)}
                    </td>

                    <td>
                        ${product.stock}
                    </td>

                    <td>
                        ${status}
                    </td>

                </tr>
            `;

        }).join("");

}


/* =========================
   SALES
   ========================= */

function renderSales() {

    if (!salesTable) return;

    if (sales.length === 0) {

        salesTable.innerHTML = `
            <tr>
                <td colspan="7">
                    No sales yet.
                </td>
            </tr>
        `;

        return;
    }


    salesTable.innerHTML =
        sales.map(sale => {

            return `
                <tr>

                    <td>
                        ${escapeHTML(sale.id)}
                    </td>

                    <td>
                        ${escapeHTML(sale.date)}
                    </td>

                    <td>
                        ${escapeHTML(sale.time)}
                    </td>

                    <td>
                        ${peso(sale.total)}
                    </td>

                    <td>
                        ${peso(sale.cost)}
                    </td>

                    <td>
                        ${peso(sale.profit)}
                    </td>

                    <td>
                        ${peso(sale.payment)}
                    </td>

                </tr>
            `;

        }).join("");

}


/* =========================
   DASHBOARD
   ========================= */

function updateDashboard() {

    const today =
        new Date().toLocaleDateString();


    const todaySalesData =
        sales.filter(
            sale => sale.date === today
        );


    const salesAmount =
        todaySalesData.reduce(
            (sum, sale) =>
                sum + Number(sale.total),
            0
        );


    const profitAmount =
        todaySalesData.reduce(
            (sum, sale) =>
                sum + Number(sale.profit),
            0
        );


    const lowStockCount =
        products.filter(
            product =>
                product.stock <= product.reorder
        ).length;


    if (todaySales) {
        todaySales.textContent =
            peso(salesAmount);
    }


    if (todayProfit) {
        todayProfit.textContent =
            peso(profitAmount);
    }


    if (totalProducts) {
        totalProducts.textContent =
            products.length;
    }


    if (lowStock) {
        lowStock.textContent =
            lowStockCount;
    }

}


/* =========================
   CAMERA SCANNER
   ========================= */

let scannerStream = null;


if (scanBtn) {

    scanBtn.addEventListener(
        "click",
        startCameraScanner
    );

}


async function startCameraScanner() {

    if (!scannerModal || !scannerVideo) {
        alert("Scanner is not available.");
        return;
    }

    try {

        openModal(scannerModal);

        scannerStream =
            await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: {
                        ideal: "environment"
                    }
                },
                audio: false
            });

        scannerVideo.srcObject =
            scannerStream;

        await scannerVideo.play();

        showScannerMessage(
            "Point your camera at a barcode."
        );

        startBarcodeDetection();

    } catch (error) {

        console.error(
            "Camera error:",
            error
        );

        showScannerMessage(
            "Camera access was blocked or unavailable."
        );

        alert(
            "Please allow camera access for barcode scanning."
        );

    }

}


function showScannerMessage(message) {

    const messageBox =
        scannerModal
            ? scannerModal.querySelector(".scanner-message")
            : null;

    if (messageBox) {
        messageBox.textContent = message;
    }

}


/* =========================
   BARCODE DETECTION
   ========================= */

let barcodeDetector = null;
let detectionRunning = false;


async function startBarcodeDetection() {

    if (
        !("BarcodeDetector" in window) ||
        !scannerVideo
    ) {

        showScannerMessage(
            "Your browser does not support automatic barcode detection. You can still enter the barcode manually."
        );

        return;
    }


    try {

        barcodeDetector =
            new BarcodeDetector({
                formats: [
                    "ean_13",
                    "ean_8",
                    "code_128",
                    "code_39",
                    "upc_a",
                    "upc_e",
                    "qr_code"
                ]
            });

    } catch (error) {

        console.error(error);

        return;
    }


    detectionRunning = true;

    detectBarcode();

}


async function detectBarcode() {

    if (
        !detectionRunning ||
        !scannerVideo ||
        scannerVideo.readyState < 2
    ) {
        if (detectionRunning) {
            requestAnimationFrame(detectBarcode);
        }

        return;
    }


    try {

        const barcodes =
            await barcodeDetector.detect(
                scannerVideo
            );

        if (barcodes.length > 0) {

            const code =
                barcodes[0].rawValue;

            if (code) {

                if (barcodeInput) {
                    barcodeInput.value = code;
                }

                stopCameraScanner();

                searchProduct(code);

                return;
            }

        }

    } catch (error) {

        console.error(
            "Barcode detection error:",
            error
        );

    }


    if (detectionRunning) {
        requestAnimationFrame(
            detectBarcode
        );
    }

}


/* =========================
   STOP CAMERA
   ========================= */

function stopCameraScanner() {

    detectionRunning = false;

    if (scannerStream) {

        scannerStream
            .getTracks()
            .forEach(track => {
                track.stop();
            });

        scannerStream = null;
    }

    if (scannerVideo) {
        scannerVideo.srcObject = null;
    }

    closeModal(scannerModal);

}


if (closeScannerBtn) {

    closeScannerBtn.addEventListener(
        "click",
        stopCameraScanner
    );

}


/* =========================
   CLOSE MODALS WHEN CLICKING OUTSIDE
   ========================= */

window.addEventListener("click", event => {

    if (
        event.target === scannerModal
    ) {
        stopCameraScanner();
    }

    if (
        event.target === checkoutModal
    ) {
        closeModal(checkoutModal);
    }

});


/* =========================
   KEYBOARD SHORTCUT
   ========================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            stopCameraScanner();
            closeModal(checkoutModal);

        }

    }
);


/* =========================
   REFRESH ALL UI
   ========================= */

function refreshUI() {

    renderCart();
    renderInventory();
    renderSales();
    updateDashboard();

}


/* =========================
   INITIALIZE
   ========================= */

refreshUI();


/* =========================
   SAVE BEFORE LEAVING PAGE
   ========================= */

window.addEventListener(
    "beforeunload",
    () => {
        saveAll();
    }
);


/* =========================
   MAKE FUNCTIONS AVAILABLE
   ========================= */

window.searchProduct = searchProduct;
window.addToCart = addToCart;
window.changeQuantity = changeQuantity;
window.removeFromCart = removeFromCart;
window.completeCheckout = completeCheckout;
