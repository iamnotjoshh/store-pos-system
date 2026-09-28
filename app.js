// ========================================
// STORE POS SYSTEM
// ========================================

document.addEventListener("DOMContentLoaded", function () {

    // ==============================
    // DEFAULT PRODUCTS
    // ==============================

    const defaultProducts = [
        {
            barcode: "480000000001",
            name: "Coca-Cola 1.5L",
            category: "Beverages",
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
            category: "Beverages",
            cost: 18,
            price: 25,
            stock: 15,
            reorderLevel: 5
        },
        {
            barcode: "480000000005",
            name: "Safeguard Soap",
            category: "Personal Care",
            cost: 20,
            price: 28,
            stock: 20,
            reorderLevel: 5
        }
    ];


    // ==============================
    // LOAD SAVED DATA
    // ==============================

    function loadJSON(key, fallback) {

        try {

            const saved =
                localStorage.getItem(key);

            return saved
                ? JSON.parse(saved)
                : fallback;

        } catch (error) {

            console.error(
                "Could not load " + key,
                error
            );

            return fallback;

        }

    }


    let products =
        loadJSON(
            "storePOS_products",
            defaultProducts
        );


    let cart =
        loadJSON(
            "storePOS_cart",
            []
        );


    let sales =
        loadJSON(
            "storePOS_sales",
            []
        );


    const savedDashboard =
        loadJSON(
            "storePOS_dashboard",
            {
                date:
                    new Date().toLocaleDateString(),
                sales: 0,
                profit: 0
            }
        );


    const today =
        new Date().toLocaleDateString();


    let todaySales =
        savedDashboard.date === today
            ? Number(savedDashboard.sales) || 0
            : 0;


    let todayProfit =
        savedDashboard.date === today
            ? Number(savedDashboard.profit) || 0
            : 0;


    // ==============================
    // SAVE DATA
    // ==============================

    function saveData() {

        try {

            localStorage.setItem(
                "storePOS_products",
                JSON.stringify(products)
            );


            localStorage.setItem(
                "storePOS_cart",
                JSON.stringify(cart)
            );


            localStorage.setItem(
                "storePOS_sales",
                JSON.stringify(sales)
            );


            localStorage.setItem(
                "storePOS_dashboard",
                JSON.stringify({
                    date:
                        new Date().toLocaleDateString(),
                    sales:
                        todaySales,
                    profit:
                        todayProfit
                })
            );


        } catch (error) {

            console.error(
                "Could not save POS data",
                error
            );

        }

    }


    // ==============================
    // ELEMENTS
    // ==============================

    const navButtons =
        document.querySelectorAll(
            ".nav-btn"
        );


    const sections =
        document.querySelectorAll(
            ".section"
        );


    const barcodeInput =
        document.getElementById(
            "barcodeInput"
        );


    const scanBtn =
        document.getElementById(
            "scanBtn"
        );


    const cameraScanBtn =
        document.getElementById(
            "cameraScanBtn"
        );


    const stopCameraBtn =
        document.getElementById(
            "stopCameraBtn"
        );


    const cameraScanner =
        document.getElementById(
            "cameraScanner"
        );


    const productMessage =
        document.getElementById(
            "productMessage"
        );


    const productList =
        document.getElementById(
            "productList"
        );


    const cartItems =
        document.getElementById(
            "cartItems"
        );


    const cartCount =
        document.getElementById(
            "cartCount"
        );


    const cartSubtotal =
        document.getElementById(
            "cartSubtotal"
        );


    const cartTotal =
        document.getElementById(
            "cartTotal"
        );


    const checkoutBtn =
        document.getElementById(
            "checkoutBtn"
        );


    const checkoutModal =
        document.getElementById(
            "checkoutModal"
        );


    const closeCheckoutBtn =
        document.getElementById(
            "closeCheckoutBtn"
        );


    const checkoutTotal =
        document.getElementById(
            "checkoutTotal"
        );


    const paymentInput =
        document.getElementById(
            "paymentInput"
        );


    const changeAmount =
        document.getElementById(
            "changeAmount"
        );


    const checkoutMessage =
        document.getElementById(
            "checkoutMessage"
        );


    const confirmCheckoutBtn =
        document.getElementById(
            "confirmCheckoutBtn"
        );


    const inventoryTable =
        document.getElementById(
            "inventoryTable"
        );


    const salesTable =
        document.getElementById(
            "salesTable"
        );


    // Dashboard

    const todaySalesElement =
        document.getElementById(
            "todaySales"
        );


    const todayProfitElement =
        document.getElementById(
            "todayProfit"
        );


    const totalProductsElement =
        document.getElementById(
            "totalProducts"
        );


    const lowStockElement =
        document.getElementById(
            "lowStock"
        );


    // ==============================
    // CAMERA SCANNER
    // ==============================

    let html5QrCode = null;


    // ==============================
    // CURRENCY
    // ==============================

    function peso(amount) {

        return (
            "₱" +
            Number(amount || 0)
                .toFixed(2)
        );

    }


    // ==============================
    // NAVIGATION
    // ==============================

    navButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const sectionName =
                        button.dataset.section;


                    navButtons.forEach(
                        function (btn) {

                            btn.classList.remove(
                                "active"
                            );

                        }
                    );


                    sections.forEach(
                        function (section) {

                            section.classList.remove(
                                "active"
                            );

                        }
                    );


                    button.classList.add(
                        "active"
                    );


                    const selectedSection =
                        document.getElementById(
                            sectionName
                        );


                    if (selectedSection) {

                        selectedSection.classList.add(
                            "active"
                        );

                    }


                    if (
                        sectionName ===
                        "inventory"
                    ) {

                        renderInventory();

                    }


                    if (
                        sectionName ===
                        "sales"
                    ) {

                        renderSales();

                    }

                }
            );

        }
    );


    // ==============================
    // SEARCH PRODUCT
    // ==============================

    function searchProduct() {

        const barcode =
            barcodeInput.value.trim();


        productList.innerHTML = "";


        if (!barcode) {

            productMessage.textContent =
                "Please enter a barcode.";

            return;

        }


        const product =
            products.find(
                function (item) {

                    return (
                        item.barcode ===
                        barcode
                    );

                }
            );


        if (!product) {

            productMessage.textContent =
                "Product not found.";

            return;

        }


        if (product.stock <= 0) {

            productMessage.textContent =
                "This product is out of stock.";

            return;

        }


        productMessage.textContent =
            "Product found.";


        const productCard =
            document.createElement(
                "div"
            );


        productCard.className =
            "product-result";


        productCard.innerHTML = `

            <div class="product-info">

                <h3>
                    ${product.name}
                </h3>

                <p>
                    Barcode:
                    ${product.barcode}
                </p>

                <p>
                    Category:
                    ${product.category}
                </p>

                <p>
                    Stock:
                    ${product.stock}
                </p>

            </div>


            <div class="product-price">

                <span>
                    Selling Price
                </span>

                <strong>
                    ${peso(product.price)}
                </strong>

            </div>


            <button
                class="add-cart-button"
                id="addProductButton"
                type="button"
            >
                Add to Cart
            </button>

        `;


        productList.appendChild(
            productCard
        );


        document
            .getElementById(
                "addProductButton"
            )
            .addEventListener(
                "click",
                function () {

                    addToCart(product);

                }
            );

    }


    scanBtn.addEventListener(
        "click",
        searchProduct
    );


    barcodeInput.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {

                searchProduct();

            }

        }
    );


    // ==============================
    // CAMERA BARCODE SCANNER
    // ==============================

    if (cameraScanBtn) {

        cameraScanBtn.addEventListener(
            "click",
            startCamera
        );

    }


    if (stopCameraBtn) {

        stopCameraBtn.addEventListener(
            "click",
            stopCamera
        );

    }


    function startCamera() {

        if (
            typeof Html5Qrcode ===
            "undefined"
        ) {

            productMessage.textContent =
                "Camera scanner is unavailable. Please check the scanner library.";

            return;

        }


        cameraScanner.style.display =
            "block";


        productMessage.textContent =
            "Starting camera...";


        if (html5QrCode) {

            stopCamera();

        }


        html5QrCode =
            new Html5Qrcode(
                "reader"
            );


        Html5Qrcode.getCameras()
            .then(
                function (devices) {

                    if (
                        !devices ||
                        devices.length === 0
                    ) {

                        productMessage.textContent =
                            "No camera found.";

                        cameraScanner.style.display =
                            "none";

                        html5QrCode = null;

                        return;

                    }


                    // Prefer back camera

                    let cameraId =
                        devices[
                            devices.length - 1
                        ].id;


                    for (
                        let i = 0;
                        i < devices.length;
                        i++
                    ) {

                        const label =
                            (
                                devices[i]
                                    .label || ""
                            ).toLowerCase();


                        if (
                            label.includes(
                                "back"
                            ) ||
                            label.includes(
                                "rear"
                            ) ||
                            label.includes(
                                "environment"
                            )
                        ) {

                            cameraId =
                                devices[i].id;

                            break;

                        }

                    }


                    html5QrCode.start(

                        cameraId,

                        {
                            fps: 10,

                            qrbox: {
                                width: 280,
                                height: 120
                            },

                            aspectRatio:
                                1.777778
                        },


                        function (
                            decodedText
                        ) {

                            barcodeInput.value =
                                decodedText;


                            productMessage.textContent =
                                "Barcode scanned: " +
                                decodedText;


                            stopCamera();


                            searchProduct();

                        },


                        function () {

                            // Keep scanning.

                        }

                    );

                }
            )
            .catch(
                function (error) {

                    console.error(error);


                    productMessage.textContent =
                        "Camera access was denied or unavailable.";


                    cameraScanner.style.display =
                        "none";


                    html5QrCode = null;

                }
            );

    }


    function stopCamera() {

        if (!html5QrCode) {

            if (cameraScanner) {

                cameraScanner.style.display =
                    "none";

            }

            return;

        }


        html5QrCode
            .stop()
            .then(
                function () {

                    html5QrCode.clear();

                    html5QrCode = null;

                    cameraScanner.style.display =
                        "none";

                }
            )
            .catch(
                function (error) {

                    console.error(error);

                    html5QrCode = null;

                    cameraScanner.style.display =
                        "none";

                }
            );

    }


    // ==============================
    // ADD TO CART
    // ==============================

    function addToCart(product) {

        const existing =
            cart.find(
                function (item) {

                    return (
                        item.barcode ===
                        product.barcode
                    );

                }
            );


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


        saveData();


        renderCart();


        productMessage.textContent =
            product.name +
            " added to cart.";

    }


    // ==============================
    // RENDER CART
    // ==============================

    function renderCart() {

        cartItems.innerHTML = "";


        if (cart.length === 0) {

            cartItems.innerHTML = `

                <div class="empty-cart">

                    <strong>
                        Your cart is empty
                    </strong>

                    <p>
                        Add a product using the barcode.
                    </p>

                </div>

            `;


            cartCount.textContent =
                "0 items";


            cartSubtotal.textContent =
                peso(0);


            cartTotal.textContent =
                peso(0);


            checkoutBtn.disabled =
                true;


            return;

        }


        let totalItems = 0;

        let subtotal = 0;


        cart.forEach(
            function (item, index) {

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

                        ${item.name}

                    </div>


                    <div class="cart-item-price">

                        ${peso(item.price)}
                        each

                    </div>


                    <div class="cart-item-bottom">

                        <div class="quantity-controls">

                            <button
                                data-action="minus"
                                data-index="${index}"
                                type="button"
                            >
                                −
                            </button>


                            <strong>
                                ${item.quantity}
                            </strong>


                            <button
                                data-action="plus"
                                data-index="${index}"
                                type="button"
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
                            class="remove-btn"
                            data-action="remove"
                            data-index="${index}"
                            type="button"
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


        checkoutBtn.disabled =
            false;


        cartItems
            .querySelectorAll(
                "button"
            )
            .forEach(
                function (button) {

                    button.addEventListener(
                        "click",
                        function () {

                            updateCart(

                                Number(
                                    button.dataset.index
                                ),

                                button.dataset.action

                            );

                        }
                    );

                }
            );

    }


    // ==============================
    // UPDATE CART
    // ==============================

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
            products.find(
                function (product) {

                    return (
                        product.barcode ===
                        item.barcode
                    );

                }
            );


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


        saveData();

        renderCart();

    }


    // ==============================
    // CHECKOUT OPEN
    // ==============================

    checkoutBtn.addEventListener(
        "click",
        function () {

            if (cart.length === 0) {

                return;

            }


            const total =
                calculateTotal();


            checkoutTotal.textContent =
                peso(total);


            paymentInput.value =
                "";


            changeAmount.textContent =
                peso(0);


            checkoutMessage.textContent =
                "";


            checkoutModal.classList.add(
                "show"
            );


            setTimeout(
                function () {

                    paymentInput.focus();

                },
                100
            );

        }
    );


    // ==============================
    // CLOSE CHECKOUT
    // ==============================

    closeCheckoutBtn.addEventListener(
        "click",
        closeCheckout
    );


    checkoutModal.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                checkoutModal
            ) {

                closeCheckout();

            }

        }
    );


    function closeCheckout() {

        checkoutModal.classList.remove(
            "show"
        );

    }


    // ==============================
    // CALCULATE TOTAL
    // ==============================

    function calculateTotal() {

        return cart.reduce(
            function (
                total,
                item
            ) {

                return (
                    total +
                    item.price *
                    item.quantity
                );

            },
            0
        );

    }


    // ==============================
    // PAYMENT / CHANGE
    // ==============================

    paymentInput.addEventListener(
        "input",
        function () {

            const payment =
                Number(
                    paymentInput.value
                ) || 0;


            const total =
                calculateTotal();


            const change =
                payment - total;


            changeAmount.textContent =
                peso(
                    change > 0
                        ? change
                        : 0
                );

        }
    );


    // ==============================
    // CONFIRM CHECKOUT
    // ==============================

    confirmCheckoutBtn.addEventListener(
        "click",
        function () {

            const total =
                calculateTotal();


            const payment =
                Number(
                    paymentInput.value
                );


            if (
                !payment ||
                payment <= 0
            ) {

                checkoutMessage.textContent =
                    "Please enter payment.";

                return;

            }


            if (
                payment < total
            ) {

                checkoutMessage.textContent =
                    "Payment is not enough.";

                return;

            }


            let costTotal = 0;


            // Update stock

            cart.forEach(
                function (cartItem) {

                    const product =
                        products.find(
                            function (item) {

                                return (
                                    item.barcode ===
                                    cartItem.barcode
                                );

                            }
                        );


                    if (product) {

                        product.stock -=
                            cartItem.quantity;


                        costTotal +=
                            product.cost *
                            cartItem.quantity;

                    }

                }
            );


            const profit =
                total -
                costTotal;


            todaySales +=
                total;


            todayProfit +=
                profit;


            const now =
                new Date();


            const sale = {

                id:
                    "SALE-" +
                    Date.now(),

                date:
                    now.toLocaleDateString(),

                time:
                    now.toLocaleTimeString(),

                total:
                    total,

                cost:
                    costTotal,

                profit:
                    profit,

                payment:
                    payment

            };


            sales.unshift(
                sale
            );


            cart = [];


            // SAVE EVERYTHING

            saveData();


            renderCart();

            renderInventory();

            renderSales();

            updateDashboard();


            checkoutMessage.textContent =
                "Payment successful!";


            setTimeout(
                function () {

                    closeCheckout();


                    barcodeInput.value =
                        "";


                    productList.innerHTML =
                        "";


                    productMessage.textContent =
                        "Transaction completed.";

                },
                700
            );

        }
    );


    // ==============================
    // INVENTORY
    // ==============================

    function renderInventory() {

        inventoryTable.innerHTML =
            "";


        products.forEach(
            function (product) {

                let status = "";

                let statusClass = "";


                if (
                    product.stock <= 0
                ) {

                    status =
                        "Out of Stock";

                    statusClass =
                        "status-out";

                } else if (
                    product.stock <=
                    product.reorderLevel
                ) {

                    status =
                        "Low Stock";

                    statusClass =
                        "status-low";

                } else {

                    status =
                        "In Stock";

                    statusClass =
                        "status-ok";

                }


                const row =
                    document.createElement(
                        "tr"
                    );


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

                        <span
                            class="status ${statusClass}"
                        >
                            ${status}
                        </span>

                    </td>

                `;


                inventoryTable.appendChild(
                    row
                );

            }
        );

    }


    // ==============================
    // SALES
    // ==============================

    function renderSales() {

        salesTable.innerHTML =
            "";


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


        sales.forEach(
            function (sale) {

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


    // ==============================
    // DASHBOARD
    // ==============================

    function updateDashboard() {

        todaySalesElement.textContent =
            peso(todaySales);


        todayProfitElement.textContent =
            peso(todayProfit);


        totalProductsElement.textContent =
            products.length;


        const lowStock =
            products.filter(
                function (product) {

                    return (
                        product.stock <=
                        product.reorderLevel
                    );

                }
            ).length;


        lowStockElement.textContent =
            lowStock;

    }


    // ==============================
    // INITIALIZE
    // ==============================

    renderCart();

    renderInventory();

    renderSales();

    updateDashboard();


    // Save initial/current state

    saveData();

});
