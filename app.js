javascript
/* =========================================
   STORE POS - APP.JS
========================================= */


/* =========================================
   TEMPORARY PRODUCT DATABASE

   For now, we are using sample products.
   Later, these will come from Google Sheets.
========================================= */

const products = [
    {
        barcode: "480000000001",
        name: "Coca-Cola 1.5L",
        category: "Drinks",
        cost: 60,
        price: 85,
        stock: 24
    },

    {
        barcode: "480000000002",
        name: "Lucky Me Pancit Canton",
        category: "Food",
        cost: 10,
        price: 15,
        stock: 50
    },

    {
        barcode: "480000000003",
        name: "Piattos Cheese",
        category: "Snacks",
        cost: 12,
        price: 18,
        stock: 30
    }
];


/* =========================================
   CART
========================================= */

let cart = [];


/* =========================================
   GET HTML ELEMENTS
========================================= */

const barcodeInput =
    document.getElementById("barcodeInput");

const productResult =
    document.getElementById("productResult");

const productName =
    document.getElementById("productName");

const productBarcode =
    document.getElementById("productBarcode");

const productStock =
    document.getElementById("productStock");

const productPrice =
    document.getElementById("productPrice");

const addCartButton =
    document.getElementById("addCartButton");

const cartItems =
    document.getElementById("cartItems");

const cartTotal =
    document.getElementById("cartTotal");

const cartCount =
    document.getElementById("cartCount");

const checkoutButton =
    document.getElementById("checkoutButton");

const scanButton =
    document.getElementById("scanButton");

const scannerModal =
    document.getElementById("scannerModal");

const closeScanner =
    document.getElementById("closeScanner");

const currentDate =
    document.getElementById("currentDate");


/* =========================================
   CURRENT DATE
========================================= */

function showCurrentDate() {

    const today = new Date();

    const options = {
        year: "numeric",
        month: "long",
        day: "numeric"
    };

    currentDate.textContent =
        today.toLocaleDateString(
            "en-US",
            options
        );
}

showCurrentDate();


/* =========================================
   SEARCH PRODUCT BY BARCODE
========================================= */

function searchProduct() {

    const barcode =
        barcodeInput.value.trim();

    if (barcode === "") {
        productResult.classList.add("hidden");
        return;
    }


    const product =
        products.find(
            item => item.barcode === barcode
        );


    if (!product) {

        productResult.classList.add("hidden");

        alert(
            "Product not found."
        );

        return;
    }


    /* Display product */

    productName.textContent =
        product.name;

    productBarcode.textContent =
        product.barcode;

    productStock.textContent =
        product.stock;

    productPrice.textContent =
        formatCurrency(product.price);


    /* Store selected product */

    addCartButton.dataset.barcode =
        product.barcode;


    productResult.classList.remove(
        "hidden"
    );
}


/* =========================================
   BARCODE INPUT
========================================= */

barcodeInput.addEventListener(
    "keydown",
    function(event) {

        /*
         Many barcode scanners automatically
         press ENTER after scanning.
        */

        if (event.key === "Enter") {

            event.preventDefault();

            searchProduct();
        }

    }
);


/* =========================================
   ADD PRODUCT TO CART
========================================= */

addCartButton.addEventListener(
    "click",
    function() {

        const barcode =
            this.dataset.barcode;

        const product =
            products.find(
                item => item.barcode === barcode
            );


        if (!product) {
            return;
        }


        /*
         Check if product is already
         inside the cart.
        */

        const existingItem =
            cart.find(
                item =>
                    item.barcode === barcode
            );


        if (existingItem) {

            if (
                existingItem.quantity
                >= product.stock
            ) {

                alert(
                    "Not enough stock."
                );

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
);


/* =========================================
   DISPLAY CART
========================================= */

function renderCart() {

    cartItems.innerHTML = "";


    if (cart.length === 0) {

        cartItems.innerHTML = `
            <tr class="empty-cart">
                <td colspan="5">
                    Your cart is empty.
                </td>
            </tr>
        `;

        cartCount.textContent =
            "0 items";

        cartTotal.textContent =
            formatCurrency(0);

        return;
    }


    let total = 0;

    let totalItems = 0;


    cart.forEach(
        (item, index) => {

            const itemTotal =
                item.price *
                item.quantity;


            total += itemTotal;

            totalItems +=
                item.quantity;


            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${item.name}
                </td>

                <td>
                    ${formatCurrency(
                        item.price
                    )}
                </td>

                <td>

                    <button
                        onclick="decreaseQuantity(${index})"
                    >
                        −
                    </button>

                    ${item.quantity}

                    <button
                        onclick="increaseQuantity(${index})"
                    >
                        +
                    </button>

                </td>

                <td>
                    ${formatCurrency(
                        itemTotal
                    )}
                </td>

                <td>

                    <button
                        onclick="removeItem(${index})"
                    >
                        🗑️
                    </button>

                </td>

            `;


            cartItems.appendChild(row);

        }
    );


    cartCount.textContent =
        `${totalItems} items`;


    cartTotal.textContent =
        formatCurrency(total);
}


/* =========================================
   INCREASE QUANTITY
========================================= */

function increaseQuantity(index) {

    const item = cart[index];


    const product =
        products.find(
            product =>
                product.barcode ===
                item.barcode
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

    renderCart();
}


/* =========================================
   DECREASE QUANTITY
========================================= */

function decreaseQuantity(index) {

    const item = cart[index];


    if (item.quantity > 1) {

        item.quantity--;

    } else {

        cart.splice(index, 1);

    }


    renderCart();
}


/* =========================================
   REMOVE ITEM
========================================= */

function removeItem(index) {

    cart.splice(index, 1);

    renderCart();
}


/* =========================================
   FORMAT CURRENCY
========================================= */

function formatCurrency(amount) {

    return new Intl.NumberFormat(
        "en-PH",
        {
            style: "currency",
            currency: "PHP"
        }
    ).format(amount);

}


/* =========================================
   CHECKOUT
========================================= */

checkoutButton.addEventListener(
    "click",
    function() {

        if (cart.length === 0) {

            alert(
                "Your cart is empty."
            );

            return;
        }


        let total = 0;


        cart.forEach(
            item => {

                total +=
                    item.price *
                    item.quantity;

            }
        );


        alert(
            "Checkout successful!\n\n" +
            "Total: " +
            formatCurrency(total)
        );


        /*
         * Later:
         *
         * This section will send the
         * transaction to Google Sheets.
         */


        cart = [];

        renderCart();

        barcodeInput.value = "";

        productResult.classList.add(
            "hidden"
        );

    }
);


/* =========================================
   BARCODE SCANNER MODAL
========================================= */

scanButton.addEventListener(
    "click",
    function() {

        scannerModal.classList.remove(
            "hidden"
        );

    }
);


closeScanner.addEventListener(
    "click",
    function() {

        scannerModal.classList.add(
            "hidden"
        );

    }
);


/* =========================================
   INITIALIZE
========================================= */

renderCart();

barcodeInput.focus();
```
