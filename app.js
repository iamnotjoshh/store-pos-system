// ========================================
// STORE POS SYSTEM
// COMPLETE APP.JS
// WITH LOCAL STORAGE SAVE
// ========================================


// ========================================
// STORAGE KEYS
// ========================================

const PRODUCTS_KEY = "storePOS_products";
const CART_KEY = "storePOS_cart";
const SALES_KEY = "storePOS_sales";
const DASHBOARD_KEY = "storePOS_dashboard";


// ========================================
// DEFAULT PRODUCTS
// ========================================

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
    }
];


// ========================================
// LOAD DATA
// ========================================

function loadData(key, defaultValue) {

    try {

        const saved = localStorage.getItem(key);

        if (saved !== null) {
            return JSON.parse(saved);
        }

    } catch (error) {

        console.error(
            "Error loading data:",
            error
        );

    }

    return defaultValue;
}


// ========================================
// SAVE DATA
// ========================================

function saveData(key, data) {

    try {

        localStorage.setItem(
            key,
            JSON.stringify(data)
        );

        return true;

    } catch (error) {

        console.error(
            "Error saving data:",
            error
        );

        alert(
            "Unable to save data in this browser."
        );

        return false;
    }
}


// ========================================
// PRODUCTS
// ========================================

let products = loadData(
    PRODUCTS_KEY,
    defaultProducts
);


// ========================================
// CART
// ========================================

let cart = loadData(
    CART_KEY,
    []
);


// ========================================
// SALES
// ========================================

let sales = loadData(
    SALES_KEY,
    []
);


// ========================================
// DASHBOARD DATA
// ========================================

let dashboardData = loadData(
    DASHBOARD_KEY,
    {
        date: "",
        sales: 0,
        profit: 0
    }
);


// ========================================
// HTML ELEMENTS
// ========================================

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

const scannerVideo =
    document.getElementById("scannerVideo");

const checkoutModal =
    document.getElementById("checkoutModal");

const closeCheckoutBtn =
    document.getElementById("closeCheckoutBtn");

const checkoutTotal =
    document.getElementById("checkoutTotal");

const paymentInput =
    document.getElementById("paymentInput");

const changeAmount =
    document.getElementById("changeAmount");

const checkoutMessage =
    document.getElementById("checkoutMessage");


// ========================================
// FORMAT CURRENCY
// ========================================

function peso(amount) {

    return new Intl.NumberFormat(
        "en-PH",
        {
            style: "currency",
            currency: "PHP"
        }
    ).format(amount || 0);

}


// ========================================
// GET TODAY
// ========================================

function getToday() {

    const date = new Date();

    return date.toISOString().split("T")[0];

}


// ========================================
// RESET DAILY DASHBOARD IF NEW DAY
// ========================================

function checkDashboardDate() {

    const today = getToday();

    if (dashboardData.date !== today) {

        dashboardData = {
            date: today,
            sales: 0,
            profit: 0
        };

        saveData(
            DASHBOARD_KEY,
            dashboardData
        );
    }

}


// ========================================
// NAVIGATION
// ========================================

document
    .querySelectorAll(".nav-btn")
    .forEach(function(button) {

        button.addEventListener(
            "click",
            function() {

                const sectionName =
                    button.dataset.section;

                document
                    .querySelectorAll(".nav-btn")
                    .forEach(function(btn) {

                        btn.classList.remove(
                            "active"
                        );

                    });

                document
                    .querySelectorAll(".section")
                    .forEach(function(section) {

                        section.classList.remove(
                            "active"
                        );

                    });

                button.classList.add(
                    "active"
                );

                const section =
                    document.getElementById(
                        sectionName
                    );

                if (section) {

                    section.classList.add(
                        "active"
                    );

                }

            }
        );

    });


// ========================================
// SEARCH PRODUCT
// ========================================

function searchProduct() {

    const barcode =
        barcodeInput.value.trim();

    if (barcode === "") {

        productMessage.textContent =
            "Please enter a barcode.";

        productList.innerHTML = "";

        return;
    }


    const product =
        products.find(function(item) {

            return item.barcode === barcode;

        });


    if (!product) {

        productMessage.textContent =
            "Product not found.";

        productList.innerHTML = "";

        return;
    }


    if (product.stock <= 0) {

        productMessage.textContent =
            product.name +
            " is out of stock.";

        productList.innerHTML = "";

        return;
    }


    productMessage.textContent =
        product.name +
        " found.";


    productList.innerHTML = `

        <div class="product-card">

            <h3>${product.name}</h3>

            <p>
                Barcode:
                ${product.barcode}
            </p>

            <p>
                Price:
                ${peso(product.price)}
            </p>

            <p>
                Stock:
                ${product.stock}
            </p>

            <button
                id="addProductBtn"
                class="primary-btn"
                type="button"
            >
                Add to Cart
            </button>

        </div>

    `;


    const addProductBtn =
        document.getElementById(
            "addProductBtn"
        );


    addProductBtn.addEventListener(
        "click",
        function() {

            addToCart(product);

        }
    );

}


// ========================================
// BARCODE ENTER
// ========================================

barcodeInput.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Enter") {

            event.preventDefault();

            searchProduct();

        }

    }
);


// ========================================
// ADD TO CART
// ========================================

function addToCart(product) {

    const existing =
        cart.find(function(item) {

            return item.barcode ===
                product.barcode;

        });


    if (existing) {

        if (
            existing.quantity >=
            product.stock
        ) {

            productMessage.textContent =
                "You cannot add more than available stock.";

            return;
        }


        existing.quantity++;

    } else {

        cart.push({

            barcode:
                product.barcode,

            name:
                product.name,

            price:
                product.price,

            cost:
                product.cost,

            quantity: 1

        });

    }


    saveData(
        CART_KEY,
        cart
    );


    renderCart();


    productMessage.textContent =
        product.name +
        " added to cart.";

}


// ========================================
// RENDER CART
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


        cartCount.textContent =
            "0 items";

        cartSubtotal.textContent =
            peso(0);

        cartTotal.textContent =
            peso(0);

        checkoutBtn.disabled = true;

        saveData(
            CART_KEY,
            cart
        );

        return;
    }


    let totalItems = 0;

    let subtotal = 0;


    cart.forEach(
        function(item, index) {

            totalItems +=
                item.quantity;

            subtotal +=
                item.price *
                item.quantity;


            const itemElement =
                document.createElement(
                    "div"
                );


            itemElement.className =
                "cart-item";


            itemElement.innerHTML = `

                <div class="cart-item-name">

                    <strong>
                        ${item.name}
                    </strong>

                </div>

                <div class="cart-item-price">

                    ${peso(item.price)}
                    each

                </div>

                <div class="cart-item-bottom">

                    <div class="quantity-controls">

                        <button
                            type="button"
                            data-action="minus"
                            data-index="${index}"
                        >
                            −
                        </button>

                        <strong>
                            ${item.quantity}
                        </strong>

                        <button
                            type="button"
                            data-action="plus"
                            data-index="${index}"
                        >
                            +
                        </button>

                    </div>

                    <strong>
                        ${peso(
                            item.price *
                            item.quantity
                        )}
                    </strong>

                    <button
                        type="button"
                        class="remove-btn"
                        data-action="remove"
                        data-index="${index}"
                    >
                        Remove
                    </button>

                </div>

            `;


            cartItems.appendChild(
                itemElement
            );

        }
    );


    cartCount.textContent =
        totalItems +
        (
            totalItems === 1
                ? " item"
                : " items"
        );


    cartSubtotal.textContent =
        peso(subtotal);


    cartTotal.textContent =
        peso(subtotal);


    checkoutBtn.disabled = false;


    cartItems
        .querySelectorAll("button")
        .forEach(function(button) {

            button.addEventListener(
                "click",
                function() {

                    const index =
                        Number(
                            button.dataset.index
                        );

                    const action =
                        button.dataset.action;

                    updateCart(
                        index,
                        action
                    );

                }
            );

        });


    saveData(
        CART_KEY,
        cart
    );

}


// ========================================
// UPDATE CART
// ========================================

function updateCart(
    index,
    action
) {

    const item =
        cart[index];


    if (!item) {
        return;
    }


    const product =
        products.find(function(product) {

            return product.barcode ===
                item.barcode;

        });


    if (!product) {
        return;
    }


    if (action === "plus") {

        if (
            item.quantity <
            product.stock
        ) {

            item.quantity++;

        } else {

            alert(
                "No more stock available."
            );

        }

    }


    if (action === "minus") {

        item.quantity--;

        if (
            item.quantity <= 0
        ) {

            cart.splice(
                index,
                1
            );

        }

    }


    if (action === "remove") {

        cart.splice(
            index,
            1
        );

    }


    saveData(
        CART_KEY,
        cart
    );


    renderCart();

}


// ========================================
// CALCULATE TOTAL
// ========================================

function calculateTotal() {

    let total = 0;


    cart.forEach(function(item) {

        total +=
            item.price *
            item.quantity;

    });


    return total;

}


// ========================================
// OPEN CHECKOUT
// ========================================

checkoutBtn.addEventListener(
    "click",
    function() {

        if (cart.length === 0) {

            alert(
                "Your cart is empty."
            );

            return;
        }


        const total =
            calculateTotal();


        checkoutTotal.textContent =
            peso(total);


        paymentInput.value =
            "";


        if (changeAmount) {

            changeAmount.textContent =
                peso(0);

        }


        if (checkoutMessage) {

            checkoutMessage.textContent =
                "";

        }


        checkoutModal.classList.add(
            "show"
        );


        checkoutModal.classList.remove(
            "hidden"
        );


        setTimeout(
            function() {

                paymentInput.focus();

            },
            100
        );

    }
);


// ========================================
// CLOSE CHECKOUT
// ========================================

if (closeCheckoutBtn) {

    closeCheckoutBtn.addEventListener(
        "click",
        function() {

            checkoutModal.classList.remove(
                "show"
            );

            checkoutModal.classList.add(
                "hidden"
            );

        }
    );

}


// ========================================
// PAYMENT INPUT
// ========================================

if (paymentInput) {

    paymentInput.addEventListener(
        "input",
        function() {

            const total =
                calculateTotal();

            const payment =
                Number(
                    paymentInput.value
                );


            if (
                !payment ||
                payment < total
            ) {

                if (changeAmount) {

                    changeAmount.textContent =
                        peso(0);

                }

                if (checkoutMessage) {

                    checkoutMessage.textContent =
                        "Payment is not enough.";

                }

                return;
            }


            const change =
                payment - total;


            if (changeAmount) {

                changeAmount.textContent =
                    peso(change);

            }


            if (checkoutMessage) {

                checkoutMessage.textContent =
                    "Payment accepted.";

            }

        }
    );

}


// ========================================
// CONFIRM CHECKOUT
// ========================================

function confirmCheckout() {

    if (cart.length === 0) {

        return;
    }


    const total =
        calculateTotal();


    const payment =
        Number(
            paymentInput.value
        );


    if (!payment) {

        alert(
            "Please enter payment."
        );

        return;
    }


    if (payment < total) {

        alert(
            "Payment is not enough."
        );

        return;
    }


    // Check stock before completing
    for (
        let i = 0;
        i < cart.length;
        i++
    ) {

        const item =
            cart[i];


        const product =
            products.find(
                function(product) {

                    return product.barcode ===
                        item.barcode;

                }
            );


        if (
            !product ||
            product.stock <
            item.quantity
        ) {

            alert(
                "Not enough stock for " +
                item.name
            );

            return;
        }

    }


    // Calculate cost and profit
    let totalCost = 0;


    cart.forEach(function(item) {

        totalCost +=
            item.cost *
            item.quantity;

    });


    const profit =
        total -
        totalCost;


    const now =
        new Date();


    const sale = {

        id:
            "SALE-" +
            Date.now(),

        date:
            now.toISOString()
                .split("T")[0],

        time:
            now.toLocaleTimeString(
                "en-PH"
            ),

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
            JSON.parse(
                JSON.stringify(cart)
            )

    };


    // Deduct stock
    cart.forEach(function(item) {

        const product =
            products.find(
                function(product) {

                    return product.barcode ===
                        item.barcode;

                }
            );


        if (product) {

            product.stock -=
                item.quantity;

        }

    });


    // Save sale
    sales.push(
        sale
    );


    // Update today's dashboard
    checkDashboardDate();


    dashboardData.sales +=
        total;


    dashboardData.profit +=
        profit;


    // Save EVERYTHING
    saveData(
        PRODUCTS_KEY,
        products
    );


    saveData(
        SALES_KEY,
        sales
    );


    saveData(
        DASHBOARD_KEY,
        dashboardData
    );


    // Clear cart
    cart = [];


    saveData(
        CART_KEY,
        cart
    );


    // Refresh display
    renderCart();

    renderInventory();

    renderSales();

    updateDashboard();


    // Close modal
    checkoutModal.classList.remove(
        "show"
    );

    checkoutModal.classList.add(
        "hidden"
    );


    barcodeInput.value = "";

    productList.innerHTML = "";

    productMessage.textContent =
        "Sale completed successfully.";


    alert(
        "Checkout successful!\n\n" +
        "Total: " +
        peso(total) +
        "\nPayment: " +
        peso(payment) +
        "\nChange: " +
        peso(payment - total)
    );


    barcodeInput.focus();

}


// ========================================
// FIND CONFIRM CHECKOUT BUTTON
// ========================================

function setupCheckoutButton() {

    const possibleButtons = [

        document.getElementById(
            "confirmCheckoutBtn"
        ),

        document.getElementById(
            "confirmPaymentBtn"
        ),

        document.getElementById(
            "completeCheckoutBtn"
        ),

        document.querySelector(
            "#checkoutModal button[type='submit']"
        )

    ];


    possibleButtons.forEach(
        function(button) {

            if (!button) {
                return;
            }


            button.addEventListener(
                "click",
                function(event) {

                    event.preventDefault();

                    confirmCheckout();

                }
            );

        }
    );

}


setupCheckoutButton();


// ========================================
// INVENTORY
// ========================================

function renderInventory() {

    if (!inventoryTable) {
        return;
    }


    inventoryTable.innerHTML = "";


    products.forEach(
        function(product) {

            const row =
                document.createElement(
                    "tr"
                );


            let status = "In Stock";


            if (
                product.stock <= 0
            ) {

                status =
                    "Out of Stock";

            }

            else if (
                product.stock <=
                product.reorderLevel
            ) {

                status =
                    "Low Stock";

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

            `;


            inventoryTable.appendChild(
                row
            );

        }
    );

}


// ========================================
// SALES TABLE
// ========================================

function renderSales() {

    if (!salesTable) {
        return;
    }


    salesTable.innerHTML = "";


    if (sales.length === 0) {

        salesTable.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    style="text-align:center;"
                >
                    No sales yet.
                </td>

            </tr>

        `;

        return;
    }


    // Newest sale first
    const salesToDisplay =
        [...sales].reverse();


    salesToDisplay.forEach(
        function(sale) {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${sale.id}
                </td>

                <td>
                    ${sale.date}
                </td>

                <td>
                    ${sale.time}
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

            `;


            salesTable.appendChild(
                row
            );

        }
    );

}


// ========================================
// DASHBOARD
// ========================================

function updateDashboard() {

    checkDashboardDate();


    if (todaySales) {

        todaySales.textContent =
            peso(
                dashboardData.sales
            );

    }


    if (todayProfit) {

        todayProfit.textContent =
            peso(
                dashboardData.profit
            );

    }


    if (totalProducts) {

        totalProducts.textContent =
            products.length;

    }


    if (lowStock) {

        const lowStockCount =
            products.filter(
                function(product) {

                    return (
                        product.stock <=
                        product.reorderLevel
                    );

                }
            ).length;


        lowStock.textContent =
            lowStockCount;

    }

}


// ========================================
// CAMERA SCANNER
// ========================================

let cameraStream = null;


// ========================================
// LOAD HTML5 QR CODE
// ========================================

function loadScannerLibrary(callback) {

    if (
        typeof Html5Qrcode !==
        "undefined"
    ) {

        callback();

        return;
    }


    const script =
        document.createElement(
            "script"
        );


    script.src =
        "https://unpkg.com/html5-qrcode";


    script.onload =
        function() {

            callback();

        };


    script.onerror =
        function() {

            alert(
                "Unable to load the barcode scanner."
            );

        };


    document.head.appendChild(
        script
    );

}


// ========================================
// START CAMERA
// ========================================

function startCamera() {

    if (!scannerModal) {
        return;
    }


    scannerModal.classList.add(
        "show"
    );

    scannerModal.classList.remove(
        "hidden"
    );


    loadScannerLibrary(
        function() {

            const reader =
                document.createElement(
                    "div"
                );


            reader.id =
                "barcodeReader";


            reader.style.width =
                "100%";


            const container =
                scannerModal.querySelector(
                    ".scanner-container"
                );


            if (!container) {
                return;
            }


            if (
                document.getElementById(
                    "barcodeReader"
                )
            ) {

                document.getElementById(
                    "barcodeReader"
                ).remove();

            }


            if (scannerVideo) {

                scannerVideo.style.display =
                    "none";

            }


            container.prepend(
                reader
            );


            const scanner =
                new Html5Qrcode(
                    "barcodeReader"
                );


            window.storePOSScanner =
                scanner;


            scanner.start(

                {
                    facingMode:
                        "environment"
                },

                {
                    fps: 10,

                    qrbox: {
                        width: 250,
                        height: 150
                    }

                },

                function(decodedText) {

                    barcodeInput.value =
                        decodedText;


                    stopCamera();


                    searchProduct();

                },

                function(errorMessage) {

                    // Ignore scanning errors

                }

            ).catch(
                function(error) {

                    console.error(
                        error
                    );

                    alert(
                        "Camera could not be started. Please allow camera access."
                    );

                }
            );

        }
    );

}


// ========================================
// STOP CAMERA
// ========================================

function stopCamera() {

    const scanner =
        window.storePOSScanner;


    if (scanner) {

        scanner.stop()
            .then(
                function() {

                    scanner.clear();

                }
            )
            .catch(
                function(error) {

                    console.error(
                        error
                    );

                }
            );


        window.storePOSScanner =
            null;

    }


    if (scannerModal) {

        scannerModal.classList.remove(
            "show"
        );

        scannerModal.classList.add(
            "hidden"
        );

    }


    if (scannerVideo) {

        scannerVideo.style.display =
            "block";

    }

}


// ========================================
// SCAN BUTTON
// ========================================

if (scanBtn) {

    scanBtn.addEventListener(
        "click",
        function() {

            startCamera();

        }
    );

}


// ========================================
// CLOSE SCANNER
// ========================================

if (closeScannerBtn) {

    closeScannerBtn.addEventListener(
        "click",
        function() {

            stopCamera();

        }
    );

}


// ========================================
// CLOSE MODALS WHEN CLICKING OUTSIDE
// ========================================

window.addEventListener(
    "click",
    function(event) {

        if (
            event.target ===
            scannerModal
        ) {

            stopCamera();

        }


        if (
            event.target ===
            checkoutModal
        ) {

            checkoutModal.classList.remove(
                "show"
            );

            checkoutModal.classList.add(
                "hidden"
            );

        }

    }
);


// ========================================
// INITIALIZE
// ========================================

checkDashboardDate();

renderCart();

renderInventory();

renderSales();

updateDashboard();


// ========================================
// INITIAL FOCUS
// ========================================

if (barcodeInput) {

    barcodeInput.focus();

}


// ========================================
// DEBUG / TEST
// ========================================

console.log(
    "Store POS loaded."
);

console.log(
    "Products:",
    products
);

console.log(
    "Cart:",
    cart
);

console.log(
    "Sales:",
    sales
);

console.log(
    "Local Storage persistence: ENABLED"
);
