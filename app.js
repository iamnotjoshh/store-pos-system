// ========================================
// STORE POS SYSTEM
// APP.JS
// ========================================


// ========================================
// SAMPLE PRODUCTS
// ========================================

const products = [
    {
        barcode: "480000000001",
        name: "Coca-Cola 1.5L",
        category: "Drinks",
        cost: 60,
        price: 85,
        stock: 24,
        reorderLevel: 5
    },
    {
        barcode: "480000000002",
        name: "Lucky Me Pancit Canton",
        category: "Food",
        cost: 10,
        price: 15,
        stock: 50,
        reorderLevel: 10
    },
    {
        barcode: "480000000003",
        name: "Piattos Cheese",
        category: "Snacks",
        cost: 12,
        price: 18,
        stock: 30,
        reorderLevel: 5
    }
];


// ========================================
// CART
// ========================================

let cart = [];


// ========================================
// SELECT HTML ELEMENTS
// ========================================

const barcodeInput = document.getElementById("barcodeInput");
const scanBtn = document.getElementById("scanBtn");

const productMessage = document.getElementById("productMessage");
const productList = document.getElementById("productList");

const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");

const cartSubtotal = document.getElementById("cartSubtotal");
const cartTotal = document.getElementById("cartTotal");

const checkoutBtn = document.getElementById("checkoutBtn");

const scannerModal = document.getElementById("scannerModal");
const closeScannerBtn = document.getElementById("closeScannerBtn");

const inventoryTable = document.getElementById("inventoryTable");
const salesTable = document.getElementById("salesTable");

const todaySales = document.getElementById("todaySales");
const todayProfit = document.getElementById("todayProfit");
const totalProducts = document.getElementById("totalProducts");
const lowStock = document.getElementById("lowStock");


// ========================================
// NAVIGATION
// ========================================

const navButtons = document.querySelectorAll(".nav-btn");
const sections = document.querySelectorAll(".section");

navButtons.forEach(button => {

    button.addEventListener("click", function () {

        const sectionId = this.dataset.section;

        navButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        this.classList.add("active");

        sections.forEach(section => {
            section.classList.remove("active");
        });

        const selectedSection = document.getElementById(sectionId);

        if (selectedSection) {
            selectedSection.classList.add("active");
        }

    });

});


// ========================================
// FORMAT CURRENCY
// ========================================

function formatCurrency(amount) {

    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP"
    }).format(amount);

}


// ========================================
// DASHBOARD
// ========================================

function updateDashboard() {

    totalProducts.textContent = products.length;

    const lowStockProducts = products.filter(product => {
        return product.stock <= product.reorderLevel;
    });

    lowStock.textContent = lowStockProducts.length;

}


// ========================================
// DISPLAY PRODUCTS
// ========================================

function displayProducts() {

    productList.innerHTML = "";

    products.forEach(product => {

        const card = document.createElement("div");

        card.className = "product-result hidden";

        card.innerHTML = `
            <div class="product-info">

                <h3>${product.name}</h3>

                <p>
                    Barcode:
                    <strong>${product.barcode}</strong>
                </p>

                <p>
                    Category:
                    <strong>${product.category}</strong>
                </p>

                <p>
                    Stock:
                    <strong>${product.stock}</strong>
                </p>

            </div>

            <div class="product-price">

                <span>Selling Price</span>

                <strong>
                    ${formatCurrency(product.price)}
                </strong>

            </div>

            <button
                class="add-cart-button"
                onclick="addToCart('${product.barcode}')"
            >
                Add to Cart
            </button>
        `;

        productList.appendChild(card);

    });

}


// ========================================
// SEARCH PRODUCT
// ========================================

function searchProduct() {

    const barcode = barcodeInput.value.trim();

    if (barcode === "") {

        productMessage.textContent =
            "Please enter a barcode.";

        productMessage.classList.remove("hidden");

        productList.innerHTML = "";

        return;
    }

    const product = products.find(
        item => item.barcode === barcode
    );

    if (!product) {

        productMessage.textContent =
            "Product not found.";

        productMessage.classList.remove("hidden");

        productList.innerHTML = "";

        return;
    }


    // Clear message

    productMessage.textContent = "";

    productMessage.classList.add("hidden");


    // Display searched product

    productList.innerHTML = "";

    const card = document.createElement("div");

    card.className = "product-result";

    card.innerHTML = `
        <div class="product-info">

            <h3>${product.name}</h3>

            <p>
                Barcode:
                <strong>${product.barcode}</strong>
            </p>

            <p>
                Category:
                <strong>${product.category}</strong>
            </p>

            <p>
                Stock:
                <strong>${product.stock}</strong>
            </p>

        </div>

        <div class="product-price">

            <span>Selling Price</span>

            <strong>
                ${formatCurrency(product.price)}
            </strong>

        </div>

        <button
            class="add-cart-button"
            onclick="addToCart('${product.barcode}')"
        >
            Add to Cart
        </button>
    `;

    productList.appendChild(card);

}


// ========================================
// BARCODE ENTER
// ========================================

barcodeInput.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {

        event.preventDefault();

        searchProduct();

    }

});


// ========================================
// SCAN BUTTON
// ========================================

scanBtn.addEventListener("click", function() {

    scannerModal.classList.remove("hidden");

});


// ========================================
// CLOSE SCANNER
// ========================================

closeScannerBtn.addEventListener("click", function() {

    scannerModal.classList.add("hidden");

});


// ========================================
// ADD TO CART
// ========================================

function addToCart(barcode) {

    const product = products.find(
        item => item.barcode === barcode
    );

    if (!product) {
        return;
    }

    if (product.stock <= 0) {

        alert("This product is out of stock.");

        return;
    }


    const existingItem = cart.find(
        item => item.barcode === barcode
    );


    if (existingItem) {

        if (existingItem.quantity >= product.stock) {

            alert("Not enough stock.");

            return;
        }

        existingItem.quantity++;

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


// ========================================
// DISPLAY CART
// ========================================

function renderCart() {

    cartItems.innerHTML = "";

    if (cart.length === 0) {

        cartItems.innerHTML = `
            <div class="empty-cart">

                <p>Your cart is empty.</p>

                <span>
                    Add a product using the barcode.
                </span>

            </div>
        `;

        cartCount.textContent = "0 items";

        cartSubtotal.textContent =
            formatCurrency(0);

        cartTotal.textContent =
            formatCurrency(0);

        return;
    }


    let total = 0;
    let itemCount = 0;


    cart.forEach((item, index) => {

        const itemTotal =
            item.price * item.quantity;

        total += itemTotal;

        itemCount += item.quantity;


        const row = document.createElement("div");

        row.className = "cart-item";

        row.innerHTML = `

            <div class="cart-item-info">

                <strong>
                    ${item.name}
                </strong>

                <span>
                    ${formatCurrency(item.price)}
                </span>

            </div>

            <div class="cart-item-actions">

                <button
                    onclick="decreaseQuantity(${index})"
                >
                    −
                </button>

                <span>
                    ${item.quantity}
                </span>

                <button
                    onclick="increaseQuantity(${index})"
                >
                    +
                </button>

                <button
                    onclick="removeItem(${index})"
                >
                    🗑️
                </button>

            </div>

            <strong>
                ${formatCurrency(itemTotal)}
            </strong>

        `;

        cartItems.appendChild(row);

    });


    cartCount.textContent =
        itemCount + " items";

    cartSubtotal.textContent =
        formatCurrency(total);

    cartTotal.textContent =
        formatCurrency(total);

}


// ========================================
// INCREASE QUANTITY
// ========================================

function increaseQuantity(index) {

    const item = cart[index];

    const product = products.find(
        product =>
            product.barcode === item.barcode
    );

    if (!product) {
        return;
    }

    if (item.quantity >= product.stock) {

        alert("Not enough stock.");

        return;
    }

    item.quantity++;

    renderCart();

}


// ========================================
// DECREASE QUANTITY
// ========================================

function decreaseQuantity(index) {

    const item = cart[index];

    if (item.quantity > 1) {

        item.quantity--;

    } else {

        cart.splice(index, 1);

    }

    renderCart();

}


// ========================================
// REMOVE ITEM
// ========================================

function removeItem(index) {

    cart.splice(index, 1);

    renderCart();

}


// ========================================
// CHECKOUT
// ========================================

checkoutBtn.addEventListener("click", function() {

    if (cart.length === 0) {

        alert("Your cart is empty.");

        return;
    }


    let total = 0;

    let profit = 0;


    cart.forEach(item => {

        total +=
            item.price * item.quantity;

        profit +=
            (item.price - item.cost) *
            item.quantity;

    });


    // Update dashboard

    todaySales.textContent =
        formatCurrency(total);

    todayProfit.textContent =
        formatCurrency(profit);


    // Reduce stock

    cart.forEach(item => {

        const product = products.find(
            product =>
                product.barcode === item.barcode
        );

        if (product) {

            product.stock -=
                item.quantity;

        }

    });


    alert(
        "Checkout successful!\n\n" +
        "Total: " +
        formatCurrency(total)
    );


    cart = [];

    renderCart();

    updateDashboard();

    renderInventory();

    barcodeInput.value = "";

    productList.innerHTML = "";

    barcodeInput.focus();

});


// ========================================
// INVENTORY
// ========================================

function renderInventory() {

    inventoryTable.innerHTML = "";

    products.forEach(product => {

        const row =
            document.createElement("tr");

        let status = "In Stock";

        if (product.stock <= 0) {

            status = "Out of Stock";

        } else if (
            product.stock <= product.reorderLevel
        ) {

            status = "Low Stock";

        }


        row.innerHTML = `

            <td>
                ${product.barcode}
            </td>

            <td>
                ${product.name}
            </td>

            <td>
                ${product.category}
            </td>

            <td>
                ${formatCurrency(product.cost)}
            </td>

            <td>
                ${formatCurrency(product.price)}
            </td>

            <td>
                ${product.stock}
            </td>

            <td>
                ${status}
            </td>

        `;

        inventoryTable.appendChild(row);

    });

}


// ========================================
// INITIALIZE
// ========================================

updateDashboard();

renderInventory();

renderCart();

barcodeInput.focus();
