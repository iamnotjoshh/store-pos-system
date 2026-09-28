// ========================================
// STORE POS SYSTEM
// COMPLETE VERSION WITH SAVE DATA
// ========================================

const PRODUCTS_KEY = "storePOS_products";
const CART_KEY = "storePOS_cart";
const SALES_KEY = "storePOS_sales";


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
// STORAGE
// ========================================

function loadData(key, defaultValue) {

    try {

        const saved =
            localStorage.getItem(key);

        if (saved === null) {

            return defaultValue;

        }

        return JSON.parse(saved);

    } catch (error) {

        console.error(error);

        return defaultValue;

    }

}


function saveData(key, data) {

    try {

        localStorage.setItem(
            key,
            JSON.stringify(data)
        );

    } catch (error) {

        console.error(error);

    }

}


let products = loadData(
    PRODUCTS_KEY,
    JSON.parse(
        JSON.stringify(defaultProducts)
    )
);

let cart = loadData(
    CART_KEY,
    []
);

let sales = loadData(
    SALES_KEY,
    []
);


// ========================================
// ELEMENTS
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

const confirmCheckoutBtn =
    document.getElementById(
        "confirmCheckoutBtn"
    );


// ========================================
// CURRENCY
// ========================================

function money(amount) {

    return new Intl.NumberFormat(
        "en-PH",
        {
            style: "currency",
            currency: "PHP"
        }
    ).format(Number(amount) || 0);

}


// ========================================
// SAVE EVERYTHING
// ========================================

function saveEverything() {

    saveData(
        PRODUCTS_KEY,
        products
    );

    saveData(
        CART_KEY,
        cart
    );

    saveData(
        SALES_KEY,
        sales
    );

}


// ========================================
// NAVIGATION
// ========================================

document
    .querySelectorAll(".nav-btn")
    .forEach(button => {

        button.addEventListener(
            "click",
            function() {

                const section =
                    this.dataset.section;

                document
                    .querySelectorAll(".nav-btn")
                    .forEach(btn => {
                        btn.classList.remove(
                            "active"
                        );
                    });

                this.classList.add(
                    "active"
                );

                document
                    .querySelectorAll(".section")
                    .forEach(sec => {
                        sec.classList.remove(
                            "active"
                        );
                    });

                const target =
                    document.getElementById(
                        section
                    );

                if (target) {

                    target.classList.add(
                        "active"
                    );

                }

                refreshAll();

            }
        );

    });


// ========================================
// PRODUCT SEARCH
// ========================================

function searchProduct() {

    const barcode =
        barcodeInput.value.trim();

    if (!barcode) {

        productList.innerHTML = "";

        showMessage("");

        return;

    }

    const product =
        products.find(
            item =>
                String(item.barcode) ===
                String(barcode)
        );

    if (!product) {

        productList.innerHTML = "";

        showMessage(
            "Product not found.",
            "error"
        );

        return;

    }

    if (product.stock <= 0) {

        productList.innerHTML = `
            <div class="product-card">
                <h3>${product.name}</h3>
                <p>Barcode: ${product.barcode}</p>
                <p>Out of stock.</p>
            </div>
        `;

        showMessage(
            "Product is out of stock.",
            "error"
        );

        return;

    }

    productList.innerHTML = `

        <div class="product-card">

            <h3>${product.name}</h3>

            <p>
                Barcode:
                ${product.barcode}
            </p>

            <p>
                Category:
                ${product.category}
            </p>

            <p>
                Price:
                <strong>
                    ${money(product.price)}
                </strong>
            </p>

            <p>
                Stock:
                ${product.stock}
            </p>

            <button
                class="primary-btn"
                id="addProductToCartBtn"
            >
                Add to Cart
            </button>

        </div>

    `;

    const addButton =
        document.getElementById(
            "addProductToCartBtn"
        );

    if (addButton) {

        addButton.onclick =
            function() {

                addToCart(
                    product.barcode
                );

            };

    }

    showMessage(
        "Product found.",
        "success"
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
// MESSAGE
// ========================================

function showMessage(
    message,
    type = ""
) {

    productMessage.textContent =
        message;

    productMessage.className =
        "message";

    if (type) {

        productMessage.classList.add(
            type
        );

    }

}


// ========================================
// ADD TO CART
// ========================================

function addToCart(barcode) {

    const product =
        products.find(
            item =>
                String(item.barcode) ===
                String(barcode)
        );

    if (!product) {

        return;

    }

    if (product.stock <= 0) {

        alert(
            "Product is out of stock."
        );

        return;

    }

    const existing =
        cart.find(
            item =>
                String(item.barcode) ===
                String(barcode)
        );

    if (existing) {

        if (
            existing.quantity >=
            product.stock
        ) {

            alert(
                "Not enough stock."
            );

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

    saveEverything();

    renderCart();

}


// ========================================
// RENDER CART
// ========================================

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
            money(0);

        cartTotal.textContent =
            money(0);

        return;

    }


    let total = 0;

    let count = 0;


    cartItems.innerHTML =
        cart.map(
            (item, index) => {

                const itemTotal =
                    item.price *
                    item.quantity;

                total += itemTotal;

                count +=
                    item.quantity;

                return `

                    <div class="cart-item">

                        <div>

                            <strong>
                                ${item.name}
                            </strong>

                            <br>

                            <span>
                                ${money(item.price)}
                                each
                            </span>

                        </div>

                        <div class="quantity-controls">

                            <button
                                onclick="
                                    decreaseQuantity(
                                        ${index}
                                    )
                                "
                            >
                                −
                            </button>

                            <span>
                                ${item.quantity}
                            </span>

                            <button
                                onclick="
                                    increaseQuantity(
                                        ${index}
                                    )
                                "
                            >
                                +
                            </button>

                        </div>

                        <strong>
                            ${money(itemTotal)}
                        </strong>

                        <button
                            onclick="
                                removeItem(
                                    ${index}
                                )
                            "
                        >
                            ×
                        </button>

                    </div>

                `;

            }
        ).join("");


    cartCount.textContent =
        count +
        (count === 1
            ? " item"
            : " items");

    cartSubtotal.textContent =
        money(total);

    cartTotal.textContent =
        money(total);

}


// ========================================
// QUANTITY
// ========================================

function increaseQuantity(index) {

    const item =
        cart[index];

    if (!item) return;

    const product =
        products.find(
            p =>
                String(p.barcode) ===
                String(item.barcode)
        );

    if (
        item.quantity >=
        product.stock
    ) {

        alert(
            "Not enough stock."
        );

        return;

    }

    item.quantity++;

    saveEverything();

    renderCart();

}


function decreaseQuantity(index) {

    const item =
        cart[index];

    if (!item) return;

    if (item.quantity > 1) {

        item.quantity--;

    } else {

        cart.splice(
            index,
            1
        );

    }

    saveEverything();

    renderCart();

}


function removeItem(index) {

    cart.splice(
        index,
        1
    );

    saveEverything();

    renderCart();

}


// ========================================
// CART TOTAL
// ========================================

function getCartTotal() {

    return cart.reduce(
        (sum, item) =>
            sum +
            item.price *
            item.quantity,
        0
    );

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
            getCartTotal();

        checkoutTotal.textContent =
            money(total);

        paymentInput.value = "";

        changeAmount.textContent =
            money(0);

        checkoutMessage.textContent =
            "";

        checkoutModal.classList.add(
            "active"
        );

        checkoutModal.style.display =
            "flex";

        paymentInput.focus();

    }
);


// ========================================
// PAYMENT / CHANGE
// ========================================

paymentInput.addEventListener(
    "input",
    function() {

        const payment =
            Number(this.value) || 0;

        const total =
            getCartTotal();

        const change =
            payment - total;

        changeAmount.textContent =
            money(
                change > 0
                    ? change
                    : 0
            );

    }
);


// ========================================
// CLOSE CHECKOUT
// ========================================

closeCheckoutBtn.addEventListener(
    "click",
    function() {

        closeCheckout();

    }
);


function closeCheckout() {

    checkoutModal.classList.remove(
        "active"
    );

    checkoutModal.style.display =
        "none";

}


// ========================================
// COMPLETE CHECKOUT
// ========================================

confirmCheckoutBtn.addEventListener(
    "click",
    function() {

        if (cart.length === 0) {

            return;

        }

        const total =
            getCartTotal();

        const payment =
            Number(
                paymentInput.value
            );


        if (!payment || payment <= 0) {

            checkoutMessage.textContent =
                "Please enter payment.";

            return;

        }


        if (payment < total) {

            checkoutMessage.textContent =
                "Insufficient payment.";

            return;

        }


        // Check stock first

        for (const item of cart) {

            const product =
                products.find(
                    p =>
                        String(
                            p.barcode
                        ) ===
                        String(
                            item.barcode
                        )
                );

            if (!product) {

                alert(
                    "Product not found."
                );

                return;

            }

            if (
                item.quantity >
                product.stock
            ) {

                alert(
                    "Not enough stock for " +
                    product.name
                );

                return;

            }

        }


        // Calculate cost

        let totalCost = 0;

        cart.forEach(
            item => {

                totalCost +=
                    item.cost *
                    item.quantity;

            }
        );


        const profit =
            total -
            totalCost;


        const now =
            new Date();


        // Deduct inventory

        cart.forEach(
            item => {

                const product =
                    products.find(
                        p =>
                            String(
                                p.barcode
                            ) ===
                            String(
                                item.barcode
                            )
                    );

                product.stock -=
                    item.quantity;

            }
        );


        // Create sale

        const sale = {

            id:
                "SALE-" +
                now.getTime(),

            date:
                now.toLocaleDateString(
                    "en-PH"
                ),

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


        sales.unshift(
            sale
        );


        // Clear cart

        cart = [];


        // SAVE EVERYTHING

        saveEverything();


        // Update screen

        renderCart();

        renderInventory();

        renderSales();

        updateDashboard();


        closeCheckout();


        barcodeInput.value = "";

        productList.innerHTML = "";

        showMessage(
            "Checkout successful!",
            "success"
        );


        alert(
            "Checkout successful!\n\n" +
            "Total: " +
            money(total) +
            "\nPayment: " +
            money(payment) +
            "\nChange: " +
            money(
                payment - total
            )
        );

    }
);


// ========================================
// INVENTORY
// ========================================

function renderInventory() {

    if (
        !inventoryTable
    ) return;


    inventoryTable.innerHTML =
        products.map(
            product => {

                let status =
                    "In Stock";

                if (
                    product.stock <= 0
                ) {

                    status =
                        "Out of Stock";

                } else if (
                    product.stock <=
                    product.reorderLevel
                ) {

                    status =
                        "Low Stock";

                }


                return `

                    <tr>

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
                            ${money(
                                product.cost
                            )}
                        </td>

                        <td>
                            ${money(
                                product.price
                            )}
                        </td>

                        <td>
                            ${product.stock}
                        </td>

                        <td>
                            ${status}
                        </td>

                    </tr>

                `;

            }
        ).join("");

}


// ========================================
// SALES
// ========================================

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
        sales.map(
            sale => {

                return `

                    <tr>

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
                            ${money(
                                sale.total
                            )}
                        </td>

                        <td>
                            ${money(
                                sale.cost
                            )}
                        </td>

                        <td>
                            ${money(
                                sale.profit
                            )}
                        </td>

                        <td>
                            ${money(
                                sale.payment
                            )}
                        </td>

                    </tr>

                `;

            }
        ).join("");

}


// ========================================
// DASHBOARD
// ========================================

function updateDashboard() {

    const today =
        new Date().toLocaleDateString(
            "en-PH"
        );


    const todayData =
        sales.filter(
            sale =>
                sale.date === today
        );


    const salesTotal =
        todayData.reduce(
            (sum, sale) =>
                sum +
                Number(
                    sale.total
                ),
            0
        );


    const profitTotal =
        todayData.reduce(
            (sum, sale) =>
                sum +
                Number(
                    sale.profit
                ),
            0
        );


    const low =
        products.filter(
            product =>
                product.stock <=
                product.reorderLevel
        ).length;


    todaySales.textContent =
        money(salesTotal);

    todayProfit.textContent =
        money(profitTotal);

    totalProducts.textContent =
        products.length;

    lowStock.textContent =
        low;

}


// ========================================
// CAMERA SCANNER
// ========================================

let html5QrCode = null;


scanBtn.addEventListener(
    "click",
    async function() {

        scannerModal.classList.add(
            "active"
        );

        scannerModal.style.display =
            "flex";


        html5QrCode =
            new Html5Qrcode(
                "scannerVideo"
            );


        try {

            await html5QrCode.start(

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

                    stopScanner();

                    searchProduct();

                },

                function() {}

            );

        } catch (error) {

            console.error(
                error
            );

            alert(
                "Unable to start camera."
            );

            stopScanner();

        }

    }
);


// ========================================
// STOP SCANNER
// ========================================

async function stopScanner() {

    if (html5QrCode) {

        try {

            await html5QrCode.stop();

        } catch (error) {}

        try {

            await html5QrCode.clear();

        } catch (error) {}

        html5QrCode = null;

    }


    scannerModal.classList.remove(
        "active"
    );

    scannerModal.style.display =
        "none";

}


closeScannerBtn.addEventListener(
    "click",
    stopScanner
);


// ========================================
// REFRESH EVERYTHING
// ========================================

function refreshAll() {

    renderCart();

    renderInventory();

    renderSales();

    updateDashboard();

}


// ========================================
// START
// ========================================

refreshAll();

barcodeInput.focus();


// ========================================
// MAKE FUNCTIONS AVAILABLE
// ========================================

window.addToCart =
    addToCart;

window.increaseQuantity =
    increaseQuantity;

window.decreaseQuantity =
    decreaseQuantity;

window.removeItem =
    removeItem;

window.searchProduct =
    searchProduct;
