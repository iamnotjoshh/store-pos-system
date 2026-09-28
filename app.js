// =====================================================
// STORE POS SYSTEM
// COMPLETE APP.JS
// =====================================================


// =====================================================
// GOOGLE SHEETS WEB APP URL
// =====================================================

const GOOGLE_SHEETS_URL =
    "https://script.google.com/macros/s/AKfycbw-8QO1nhx6JMeT9xZXSU86Ss2K4kFpY3DjqyRPaMCOsu9SSNCWl9OMnp0so41N3JXV3w/exec";


// =====================================================
// LOCAL STORAGE KEYS
// =====================================================

const PRODUCTS_KEY = "storePOS_products_v1";
const SALES_KEY = "storePOS_sales_v1";


// =====================================================
// DEFAULT PRODUCTS
// =====================================================

const defaultProducts = [

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
    },

    {
        barcode: "480000000004",
        name: "Bear Brand Milk",
        category: "Drinks",
        cost: 15,
        price: 22,
        stock: 20,
        reorderLevel: 5
    },

    {
        barcode: "480000000005",
        name: "Safeguard Soap",
        category: "Personal Care",
        cost: 18,
        price: 25,
        stock: 15,
        reorderLevel: 5
    }

];


// =====================================================
// LOAD DATA
// =====================================================

let products = loadProducts();
let sales = loadSales();

let cart = [];


// =====================================================
// LOAD PRODUCTS
// =====================================================

function loadProducts() {

    try {

        const saved =
            localStorage.getItem(PRODUCTS_KEY);

        if (saved) {
            return JSON.parse(saved);
        }

    } catch (error) {

        console.error(
            "Error loading products:",
            error
        );

    }

    const copy =
        JSON.parse(
            JSON.stringify(defaultProducts)
        );

    localStorage.setItem(
        PRODUCTS_KEY,
        JSON.stringify(copy)
    );

    return copy;
}


// =====================================================
// LOAD SALES
// =====================================================

function loadSales() {

    try {

        const saved =
            localStorage.getItem(SALES_KEY);

        if (saved) {
            return JSON.parse(saved);
        }

    } catch (error) {

        console.error(
            "Error loading sales:",
            error
        );

    }

    return [];
}


// =====================================================
// SAVE LOCAL DATA
// =====================================================

function saveData() {

    localStorage.setItem(
        PRODUCTS_KEY,
        JSON.stringify(products)
    );

    localStorage.setItem(
        SALES_KEY,
        JSON.stringify(sales)
    );

}


// =====================================================
// HTML ELEMENTS
// =====================================================

const navButtons =
    document.querySelectorAll(".nav-btn");

const sections =
    document.querySelectorAll(".section");

const barcodeInput =
    document.getElementById("barcodeInput");

const scanBtn =
    document.getElementById("scanBtn");

const productMessage =
    document.getElementById("productMessage");

const productList =
    document.getElementById("productList");

const cartItems =
    document.getElementById("cartItems");

const cartCount =
    document.getElementById("cartCount");

const cartSubtotal =
    document.getElementById("cartSubtotal");

const cartTotal =
    document.getElementById("cartTotal");

const checkoutBtn =
    document.getElementById("checkoutBtn");

const inventoryTable =
    document.getElementById("inventoryTable");

const salesTable =
    document.getElementById("salesTable");

const todaySales =
    document.getElementById("todaySales");

const todayProfit =
    document.getElementById("todayProfit");

const totalProducts =
    document.getElementById("totalProducts");

const lowStock =
    document.getElementById("lowStock");

const scannerModal =
    document.getElementById("scannerModal");

const closeScannerBtn =
    document.getElementById("closeScannerBtn");

const printAllSalesBtn =
    document.getElementById("printAllSalesBtn");


// =====================================================
// FORMAT CURRENCY
// =====================================================

function formatCurrency(amount) {

    return new Intl.NumberFormat(
        "en-PH",
        {
            style: "currency",
            currency: "PHP"
        }
    ).format(Number(amount) || 0);

}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHtml(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// =====================================================
// NAVIGATION
// =====================================================

navButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            const sectionId =
                button.dataset.section;

            navButtons.forEach(btn => {
                btn.classList.remove("active");
            });

            sections.forEach(section => {
                section.classList.remove("active");
            });

            button.classList.add("active");

            const target =
                document.getElementById(sectionId);

            if (target) {
                target.classList.add("active");
            }

            if (sectionId === "sales") {
                renderSales();
            }

            if (sectionId === "inventory") {
                renderInventory();
            }

        }
    );

});


// =====================================================
// SEARCH PRODUCT
// =====================================================

function searchProduct() {

    const barcode =
        barcodeInput.value.trim();

    if (!barcode) {

        productMessage.textContent =
            "Please enter or scan a barcode.";

        productMessage.className =
            "message error";

        productList.innerHTML = "";

        return;

    }

    const product =
        products.find(
            item => item.barcode === barcode
        );

    if (!product) {

        productMessage.textContent =
            "Product not found.";

        productMessage.className =
            "message error";

        productList.innerHTML = "";

        return;

    }

    if (product.stock <= 0) {

        productMessage.textContent =
            "Product is out of stock.";

        productMessage.className =
            "message error";

        productList.innerHTML = "";

        return;

    }

    productMessage.textContent =
        "Product found.";

    productMessage.className =
        "message success";

    productList.innerHTML = `

        <div class="product-card">

            <div>
                <h3>
                    ${escapeHtml(product.name)}
                </h3>

                <p>
                    Barcode:
                    ${escapeHtml(product.barcode)}
                </p>

                <p>
                    Stock:
                    ${product.stock}
                </p>

                <strong>
                    ${formatCurrency(product.price)}
                </strong>
            </div>

            <button
                class="primary-btn"
                onclick="addToCart('${product.barcode}')"
            >
                Add to Cart
            </button>

        </div>

    `;

}


// =====================================================
// BARCODE ENTER
// =====================================================

barcodeInput.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {

            event.preventDefault();

            searchProduct();

        }

    }
);


// =====================================================
// ADD TO CART
// =====================================================

window.addToCart = function(barcode) {

    const product =
        products.find(
            item => item.barcode === barcode
        );

    if (!product) {
        return;
    }

    const existing =
        cart.find(
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
            category: product.category,
            cost: Number(product.cost),
            price: Number(product.price),
            quantity: 1

        });

    }

    renderCart();

    productMessage.textContent =
        product.name + " added to cart.";

    productMessage.className =
        "message success";

};


// =====================================================
// RENDER CART
// =====================================================

function renderCart() {

    if (cart.length === 0) {

        cartItems.innerHTML = `

            <div class="empty-cart">

                <p>Your cart is empty.</p>

                <span>
                    Add a product using the barcode.
                </span>

            </div>

        `;

        cartCount.textContent =
            "0 items";

        cartSubtotal.textContent =
            formatCurrency(0);

        cartTotal.textContent =
            formatCurrency(0);

        return;

    }


    let total = 0;
    let itemCount = 0;

    cartItems.innerHTML = "";


    cart.forEach(
        (item, index) => {

            const itemTotal =
                item.price * item.quantity;

            total += itemTotal;

            itemCount +=
                item.quantity;


            const row =
                document.createElement("div");

            row.className =
                "cart-item";


            row.innerHTML = `

                <div class="cart-item-info">

                    <strong>
                        ${escapeHtml(item.name)}
                    </strong>

                    <span>
                        ${formatCurrency(item.price)}
                        each
                    </span>

                </div>

                <div class="quantity-controls">

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
                        class="remove-btn"
                    >
                        ×
                    </button>

                </div>

                <strong>
                    ${formatCurrency(itemTotal)}
                </strong>

            `;

            cartItems.appendChild(row);

        }
    );


    cartCount.textContent =
        itemCount + " items";

    cartSubtotal.textContent =
        formatCurrency(total);

    cartTotal.textContent =
        formatCurrency(total);

}


// =====================================================
// INCREASE QUANTITY
// =====================================================

window.increaseQuantity = function(index) {

    const item =
        cart[index];

    if (!item) {
        return;
    }

    const product =
        products.find(
            p => p.barcode === item.barcode
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

};


// =====================================================
// DECREASE QUANTITY
// =====================================================

window.decreaseQuantity = function(index) {

    const item =
        cart[index];

    if (!item) {
        return;
    }

    if (item.quantity > 1) {

        item.quantity--;

    } else {

        cart.splice(index, 1);

    }

    renderCart();

};


// =====================================================
// REMOVE ITEM
// =====================================================

window.removeItem = function(index) {

    cart.splice(index, 1);

    renderCart();

};


// =====================================================
// GET CART TOTAL
// =====================================================

function getCartTotal() {

    return cart.reduce(
        (total, item) =>
            total +
            (item.price * item.quantity),
        0
    );

}


// =====================================================
// CHECKOUT
// =====================================================

checkoutBtn.addEventListener(
    "click",
    checkout
);


function checkout() {

    if (cart.length === 0) {

        alert(
            "Your cart is empty."
        );

        return;

    }


    const total =
        getCartTotal();


    const paymentInput =
        prompt(
            "Total Amount: " +
            formatCurrency(total) +
            "\n\nEnter customer payment:"
        );


    if (
        paymentInput === null ||
        paymentInput.trim() === ""
    ) {

        return;

    }


    const payment =
        Number(paymentInput);


    if (
        !Number.isFinite(payment) ||
        payment < total
    ) {

        alert(
            "Insufficient payment."
        );

        return;

    }


    // Check stock again
    for (const item of cart) {

        const product =
            products.find(
                p => p.barcode === item.barcode
            );

        if (
            !product ||
            product.stock < item.quantity
        ) {

            alert(
                "Not enough stock for " +
                item.name
            );

            return;

        }

    }


    // Calculate cost
    let totalCost = 0;

    cart.forEach(item => {

        totalCost +=
            item.cost * item.quantity;

    });


    const profit =
        total - totalCost;


    const change =
        payment - total;


    const now =
        new Date();


    const sale = {

        id:
            "SALE-" +
            Date.now(),

        date:
            now.toLocaleDateString(
                "en-PH"
            ),

        time:
            now.toLocaleTimeString(
                "en-PH"
            ),

        total:
            Number(total.toFixed(2)),

        cost:
            Number(totalCost.toFixed(2)),

        profit:
            Number(profit.toFixed(2)),

        payment:
            Number(payment.toFixed(2)),

        change:
            Number(change.toFixed(2)),

        items:
            cart.map(item => ({

                barcode: item.barcode,

                name: item.name,

                quantity: item.quantity,

                price: item.price,

                cost: item.cost,

                lineTotal:
                    Number(
                        (
                            item.price *
                            item.quantity
                        ).toFixed(2)
                    )

            }))

    };


    // Deduct inventory
    cart.forEach(item => {

        const product =
            products.find(
                p => p.barcode === item.barcode
            );

        if (product) {

            product.stock -=
                item.quantity;

        }

    });


    // Save transaction
    sales.unshift(sale);


    // Save locally
    saveData();


    // Send to Google Sheets
    saveSaleToGoogleSheets(sale);


    // Refresh screen
    cart = [];

    renderCart();
    renderInventory();
    renderSales();
    updateDashboard();


    barcodeInput.value = "";
    productList.innerHTML = "";

    productMessage.textContent =
        "Transaction completed.";

    productMessage.className =
        "message success";


    alert(

        "TRANSACTION COMPLETED\n\n" +

        "Total: " +
        formatCurrency(total) +

        "\nPayment: " +
        formatCurrency(payment) +

        "\nChange: " +
        formatCurrency(change) +

        "\n\nSale ID: " +
        sale.id

    );


    barcodeInput.focus();

}


// =====================================================
// GOOGLE SHEETS
// =====================================================

function saveSaleToGoogleSheets(sale) {

    try {

        fetch(
            GOOGLE_SHEETS_URL,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "text/plain;charset=utf-8"
                },

                body:
                    JSON.stringify({

                        action:
                            "saveSale",

                        sale:
                            sale

                    }),

                mode:
                    "no-cors"

            }
        )
        .then(() => {

            console.log(
                "Sale sent to Google Sheets."
            );

        })
        .catch(error => {

            console.error(
                "Google Sheets error:",
                error
            );

        });

    } catch (error) {

        console.error(
            "Google Sheets error:",
            error
        );

    }

}


// =====================================================
// INVENTORY
// =====================================================

function renderInventory() {

    inventoryTable.innerHTML = "";


    products.forEach(product => {

        const row =
            document.createElement("tr");


        let status =
            "In Stock";


        if (
            product.stock <=
            product.reorderLevel
        ) {

            status =
                "Low Stock";

        }


        if (product.stock <= 0) {

            status =
                "Out of Stock";

        }


        row.innerHTML = `

            <td>
                ${escapeHtml(product.barcode)}
            </td>

            <td>
                ${escapeHtml(product.name)}
            </td>

            <td>
                ${escapeHtml(product.category)}
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


// =====================================================
// SALES HISTORY
// =====================================================

function renderSales() {

    salesTable.innerHTML = "";


    if (sales.length === 0) {

        salesTable.innerHTML = `

            <tr>

                <td
                    colspan="9"
                    style="text-align:center;"
                >
                    No transactions yet.
                </td>

            </tr>

        `;

        return;

    }


    sales.forEach(
        (sale, index) => {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${escapeHtml(sale.id)}
                </td>

                <td>
                    ${escapeHtml(sale.date)}
                </td>

                <td>
                    ${escapeHtml(sale.time)}
                </td>

                <td>
                    ${formatCurrency(sale.total)}
                </td>

                <td>
                    ${formatCurrency(sale.cost)}
                </td>

                <td>
                    ${formatCurrency(sale.profit)}
                </td>

                <td>
                    ${formatCurrency(sale.payment)}
                </td>

                <td>
                    ${formatCurrency(sale.change)}
                </td>

                <td>

                    <button
                        class="primary-btn"
                        onclick="viewSale(${index})"
                    >
                        View
                    </button>

                    <button
                        class="primary-btn"
                        onclick="printSale(${index})"
                    >
                        Print
                    </button>

                </td>

            `;


            salesTable.appendChild(row);

        }
    );

}


// =====================================================
// VIEW TRANSACTION
// =====================================================

window.viewSale = function(index) {

    const sale =
        sales[index];

    if (!sale) {
        return;
    }


    let message =
        "SALE RECEIPT\n\n";

    message +=
        "Sale ID: " +
        sale.id +
        "\n";

    message +=
        "Date: " +
        sale.date +
        "\n";

    message +=
        "Time: " +
        sale.time +
        "\n\n";


    sale.items.forEach(item => {

        message +=
            item.name +
            " x" +
            item.quantity +
            " = " +
            formatCurrency(
                item.lineTotal
            ) +
            "\n";

    });


    message +=
        "\nTotal: " +
        formatCurrency(
            sale.total
        );

    message +=
        "\nPayment: " +
        formatCurrency(
            sale.payment
        );

    message +=
        "\nChange: " +
        formatCurrency(
            sale.change
        );


    alert(message);

};


// =====================================================
// PRINT SINGLE SALE
// =====================================================

window.printSale = function(index) {

    const sale =
        sales[index];

    if (!sale) {
        return;
    }

    printReceipt(sale);

};


// =====================================================
// PRINT RECEIPT
// =====================================================

function printReceipt(sale) {

    let itemsHtml = "";


    sale.items.forEach(item => {

        itemsHtml += `

            <tr>

                <td>
                    ${escapeHtml(item.name)}
                </td>

                <td>
                    ${item.quantity}
                </td>

                <td>
                    ${formatCurrency(item.price)}
                </td>

                <td>
                    ${formatCurrency(item.lineTotal)}
                </td>

            </tr>

        `;

    });


    const receiptWindow =
        window.open(
            "",
            "_blank",
            "width=500,height=700"
        );


    if (!receiptWindow) {

        alert(
            "Please allow pop-ups to print the receipt."
        );

        return;

    }


    receiptWindow.document.write(`

        <!DOCTYPE html>

        <html>

        <head>

            <title>
                ${escapeHtml(sale.id)}
            </title>

            <style>

                body {
                    font-family: Arial, sans-serif;
                    padding: 20px;
                    max-width: 450px;
                    margin: auto;
                }

                h1 {
                    text-align: center;
                    margin-bottom: 5px;
                }

                .center {
                    text-align: center;
                }

                .line {
                    border-top: 1px dashed #000;
                    margin: 15px 0;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 13px;
                }

                th,
                td {
                    padding: 6px 2px;
                    border-bottom: 1px solid #ddd;
                    text-align: left;
                }

                .total {
                    margin-top: 15px;
                    font-size: 16px;
                }

                .right {
                    text-align: right;
                }

                @media print {

                    body {
                        padding: 5px;
                    }

                }

            </style>

        </head>

        <body>

            <h1>STORE POS</h1>

            <div class="center">
                Point of Sale Receipt
            </div>

            <div class="line"></div>

            <div>
                <strong>Sale ID:</strong>
                ${escapeHtml(sale.id)}
            </div>

            <div>
                <strong>Date:</strong>
                ${escapeHtml(sale.date)}
            </div>

            <div>
                <strong>Time:</strong>
                ${escapeHtml(sale.time)}
            </div>

            <div class="line"></div>

            <table>

                <thead>

                    <tr>
                        <th>Product</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Total</th>
                    </tr>

                </thead>

                <tbody>

                    ${itemsHtml}

                </tbody>

            </table>

            <div class="line"></div>

            <div class="total">
                <strong>Total:</strong>
                <span class="right">
                    ${formatCurrency(sale.total)}
                </span>
            </div>

            <div>
                Payment:
                ${formatCurrency(sale.payment)}
            </div>

            <div>
                Change:
                ${formatCurrency(sale.change)}
            </div>

            <div class="line"></div>

            <div class="center">
                Thank you!
            </div>

        </body>

        </html>

    `);


    receiptWindow.document.close();

    receiptWindow.focus();


    setTimeout(
        () => {

            receiptWindow.print();

        },
        500
    );

}


// =====================================================
// PRINT ALL HISTORY
// =====================================================

printAllSalesBtn.addEventListener(
    "click",
    printAllSales
);


function printAllSales() {

    if (sales.length === 0) {

        alert(
            "No transaction history to print."
        );

        return;

    }


    let rows = "";


    sales.forEach(sale => {

        rows += `

            <tr>

                <td>
                    ${escapeHtml(sale.id)}
                </td>

                <td>
                    ${escapeHtml(sale.date)}
                </td>

                <td>
                    ${escapeHtml(sale.time)}
                </td>

                <td>
                    ${formatCurrency(sale.total)}
                </td>

                <td>
                    ${formatCurrency(sale.cost)}
                </td>

                <td>
                    ${formatCurrency(sale.profit)}
                </td>

                <td>
                    ${formatCurrency(sale.payment)}
                </td>

                <td>
                    ${formatCurrency(sale.change)}
                </td>

            </tr>

        `;

    });


    const printWindow =
        window.open(
            "",
            "_blank"
        );


    if (!printWindow) {

        alert(
            "Please allow pop-ups to print."
        );

        return;

    }


    printWindow.document.write(`

        <!DOCTYPE html>

        <html>

        <head>

            <title>
                Store POS Transaction History
            </title>

            <style>

                body {
                    font-family: Arial, sans-serif;
                    padding: 20px;
                }

                h1 {
                    text-align: center;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                }

                th,
                td {
                    border: 1px solid #000;
                    padding: 8px;
                    text-align: left;
                }

                th {
                    background: #eee;
                }

            </style>

        </head>

        <body>

            <h1>
                Store POS Transaction History
            </h1>

            <p>
                Printed:
                ${new Date().toLocaleString("en-PH")}
            </p>

            <table>

                <thead>

                    <tr>

                        <th>Sale ID</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Total</th>
                        <th>Cost</th>
                        <th>Profit</th>
                        <th>Payment</th>
                        <th>Change</th>

                    </tr>

                </thead>

                <tbody>

                    ${rows}

                </tbody>

            </table>

        </body>

        </html>

    `);


    printWindow.document.close();

    printWindow.focus();


    setTimeout(
        () => {
            printWindow.print();
        },
        500
    );

}


// =====================================================
// DASHBOARD
// =====================================================

function updateDashboard() {

    totalProducts.textContent =
        products.length;


    const low =
        products.filter(
            product =>
                product.stock <=
                product.reorderLevel
        ).length;


    lowStock.textContent =
        low;


    const today =
        new Date().toLocaleDateString(
            "en-PH"
        );


    let salesToday = 0;
    let profitToday = 0;


    sales.forEach(sale => {

        if (sale.date === today) {

            salesToday +=
                Number(sale.total);

            profitToday +=
                Number(sale.profit);

        }

    });


    todaySales.textContent =
        formatCurrency(
            salesToday
        );


    todayProfit.textContent =
        formatCurrency(
            profitToday
        );

}


// =====================================================
// CAMERA SCANNER
// =====================================================

let html5QrCode = null;


scanBtn.addEventListener(
    "click",
    startScanner
);


closeScannerBtn.addEventListener(
    "click",
    stopScanner
);


async function loadScannerLibrary() {

    if (
        typeof Html5Qrcode !==
        "undefined"
    ) {

        return true;

    }


    return new Promise(resolve => {

        const script =
            document.createElement("script");

        script.src =
            "https://unpkg.com/html5-qrcode";

        script.onload =
            () => resolve(true);

        script.onerror =
            () => resolve(false);

        document.head.appendChild(script);

    });

}


async function startScanner() {

    scannerModal.classList.add("active");

    const loaded =
        await loadScannerLibrary();


    if (!loaded) {

        alert(
            "Camera scanner library could not load. You can still enter the barcode manually."
        );

        scannerModal.classList.remove("active");

        return;

    }


    try {

        html5QrCode =
            new Html5Qrcode("reader");


        const cameras =
            await Html5Qrcode.getCameras();


        if (
            !cameras ||
            cameras.length === 0
        ) {

            throw new Error(
                "No camera found."
            );

        }


        let cameraId =
            cameras[0].id;


        const rearCamera =
            cameras.find(
                camera => {

                    const label =
                        (
                            camera.label ||
                            ""
                        ).toLowerCase();

                    return (
                        label.includes("back") ||
                        label.includes("rear") ||
                        label.includes("environment")
                    );

                }
            );


        if (rearCamera) {

            cameraId =
                rearCamera.id;

        } else if (cameras.length > 1) {

            cameraId =
                cameras[
                    cameras.length - 1
                ].id;

        }


        await html5QrCode.start(

            cameraId,

            {
                fps: 10,
                qrbox: {
                    width: 280,
                    height: 160
                }
            },

            decodedText => {

                barcodeInput.value =
                    decodedText;

                searchProduct();

                stopScanner();

            },

            errorMessage => {
                // Ignore scanning errors
            }

        );

    } catch (error) {

        console.error(
            "Scanner error:",
            error
        );

        alert(
            "Unable to open camera. Please allow camera permission."
        );

        stopScanner();

    }

}


// =====================================================
// STOP SCANNER
// =====================================================

async function stopScanner() {

    scannerModal.classList.remove("active");


    if (html5QrCode) {

        try {

            if (
                html5QrCode.isScanning
            ) {

                await html5QrCode.stop();

            }

            html5QrCode.clear();

        } catch (error) {

            console.log(
                "Scanner already stopped."
            );

        }

        html5QrCode = null;

    }

}


// =====================================================
// INITIALIZE
// =====================================================

function initialize() {

    renderCart();

    renderInventory();

    renderSales();

    updateDashboard();

    barcodeInput.focus();

}


initialize();
