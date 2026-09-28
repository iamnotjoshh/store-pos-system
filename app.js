document.addEventListener("DOMContentLoaded", function () {

  const STORAGE_PRODUCTS = "storePOS_products_v1";
  const STORAGE_SALES = "storePOS_sales_v1";


  /* PRODUCTS */

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


  let products = loadData(
    STORAGE_PRODUCTS,
    defaultProducts
  );

  let sales = loadData(
    STORAGE_SALES,
    []
  );

  let cart = [];

  let html5QrCode = null;


  /* ELEMENTS */

  const $ = id =>
    document.getElementById(id);


  const navButtons =
    document.querySelectorAll(".nav-btn");

  const sections =
    document.querySelectorAll(".section");


  const barcodeInput =
    $("barcodeInput");

  const scanBtn =
    $("scanBtn");

  const cameraScanBtn =
    $("cameraScanBtn");

  const stopCameraBtn =
    $("stopCameraBtn");

  const cameraScanner =
    $("cameraScanner");

  const productMessage =
    $("productMessage");

  const productList =
    $("productList");


  const cartItems =
    $("cartItems");

  const cartCount =
    $("cartCount");

  const cartSubtotal =
    $("cartSubtotal");

  const cartTotal =
    $("cartTotal");

  const checkoutBtn =
    $("checkoutBtn");


  const checkoutModal =
    $("checkoutModal");

  const closeCheckoutBtn =
    $("closeCheckoutBtn");

  const checkoutTotal =
    $("checkoutTotal");

  const paymentInput =
    $("paymentInput");

  const changeAmount =
    $("changeAmount");

  const checkoutMessage =
    $("checkoutMessage");

  const confirmCheckoutBtn =
    $("confirmCheckoutBtn");


  const inventoryTable =
    $("inventoryTable");

  const salesTable =
    $("salesTable");


  /* LOCAL STORAGE */

  function loadData(key, fallback) {

    try {

      const saved =
        localStorage.getItem(key);

      if (!saved) {

        return JSON.parse(
          JSON.stringify(fallback)
        );

      }

      const parsed =
        JSON.parse(saved);

      return Array.isArray(parsed)
        ? parsed
        : JSON.parse(
            JSON.stringify(fallback)
          );

    }

    catch (error) {

      console.error(
        "Local Storage read error:",
        error
      );

      return JSON.parse(
        JSON.stringify(fallback)
      );

    }

  }


  function saveData() {

    try {

      localStorage.setItem(
        STORAGE_PRODUCTS,
        JSON.stringify(products)
      );

      localStorage.setItem(
        STORAGE_SALES,
        JSON.stringify(sales)
      );

      return true;

    }

    catch (error) {

      console.error(
        "Local Storage save error:",
        error
      );

      alert(
        "Hindi ma-save ang data sa browser."
      );

      return false;

    }

  }


  /* CURRENCY */

  function peso(amount) {

    return new Intl.NumberFormat(
      "en-PH",
      {
        style: "currency",
        currency: "PHP"
      }
    ).format(
      Number(amount) || 0
    );

  }


  /* DATE */

  function updateDate() {

    $("currentDate").textContent =
      new Date().toLocaleDateString(
        "en-PH",
        {
          year: "numeric",
          month: "long",
          day: "numeric"
        }
      );

  }


  /* DASHBOARD */

  function updateDashboard() {

    const today =
      new Date().toLocaleDateString(
        "en-PH"
      );


    const todaySales =
      sales
        .filter(
          sale =>
            sale.date === today
        )
        .reduce(
          (sum, sale) =>
            sum + Number(sale.total),
          0
        );


    const todayProfit =
      sales
        .filter(
          sale =>
            sale.date === today
        )
        .reduce(
          (sum, sale) =>
            sum + Number(sale.profit),
          0
        );


    $("todaySales").textContent =
      peso(todaySales);

    $("todayProfit").textContent =
      peso(todayProfit);


    $("totalProducts").textContent =
      products.length;


    $("lowStock").textContent =
      products.filter(
        product =>
          Number(product.stock) <=
          Number(product.reorderLevel)
      ).length;

  }


  /* NAVIGATION */

  navButtons.forEach(
    function (button) {

      button.addEventListener(
        "click",
        function () {

          navButtons.forEach(
            b =>
              b.classList.remove(
                "active"
              )
          );


          sections.forEach(
            section =>
              section.classList.remove(
                "active"
              )
          );


          button.classList.add(
            "active"
          );


          const section =
            $(
              button.dataset.section
            );


          if (section) {

            section.classList.add(
              "active"
            );

          }


          if (
            button.dataset.section ===
            "inventory"
          ) {

            renderInventory();

          }


          if (
            button.dataset.section ===
            "sales"
          ) {

            renderSales();

          }


          if (
            button.dataset.section ===
            "dashboard"
          ) {

            updateDashboard();

          }

        }
      );

    }
  );


  /* SEARCH PRODUCT */

  function searchProduct() {

    const barcode =
      barcodeInput.value.trim();


    productList.innerHTML =
      "";

    productMessage.textContent =
      "";


    if (!barcode) {

      productMessage.textContent =
        "Please enter a barcode.";

      return;

    }


    const product =
      products.find(
        p =>
          String(p.barcode) ===
          barcode
      );


    if (!product) {

      productMessage.textContent =
        "Product not found.";

      return;

    }


    if (
      Number(product.stock) <= 0
    ) {

      productMessage.textContent =
        "This product is out of stock.";

      return;

    }


    productMessage.textContent =
      "Product found.";


    const card =
      document.createElement("div");


    card.className =
      "product-result";


    card.innerHTML = `

      <div class="product-info">

        <h3>
          ${escapeHtml(product.name)}
        </h3>

        <p>
          Barcode:
          ${escapeHtml(product.barcode)}
        </p>

        <p>
          Category:
          ${escapeHtml(product.category)}
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
        type="button"
      >
        Add to Cart
      </button>

    `;


    productList.appendChild(
      card
    );


    card
      .querySelector(
        ".add-cart-button"
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

      if (
        event.key ===
        "Enter"
      ) {

        event.preventDefault();

        searchProduct();

      }

    }
  );


  /* ADD TO CART */

  function addToCart(product) {

    const existing =
      cart.find(
        item =>
          item.barcode ===
          product.barcode
      );


    if (existing) {

      if (
        existing.quantity >=
        Number(product.stock)
      ) {

        productMessage.textContent =
          "Hindi na puwedeng dagdagan; maximum stock na.";

        return;

      }


      existing.quantity++;

    }

    else {

      cart.push({

        barcode:
          product.barcode,

        name:
          product.name,

        price:
          Number(product.price),

        cost:
          Number(product.cost),

        quantity:
          1

      });

    }


    renderCart();


    productMessage.textContent =
      product.name +
      " added to cart.";

  }


  /* CART */

  function renderCart() {

    cartItems.innerHTML =
      "";


    if (
      cart.length === 0
    ) {

      cartItems.innerHTML = `

        <div class="empty-cart">

          <strong>
            Your cart is empty
          </strong>

          <p>
            Add a product using
            the barcode.
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


    let count = 0;

    let total = 0;


    cart.forEach(
      function (item, index) {

        count +=
          item.quantity;


        total +=
          item.price *
          item.quantity;


        const element =
          document.createElement(
            "div"
          );


        element.className =
          "cart-item";


        element.innerHTML = `

          <div class="cart-item-name">

            ${escapeHtml(
              item.name
            )}

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
              class="remove-btn"
              type="button"
              data-action="remove"
              data-index="${index}"
            >
              Remove
            </button>

          </div>

        `;


        cartItems.appendChild(
          element
        );

      }
    );


    cartCount.textContent =
      count +
      (
        count === 1
          ? " item"
          : " items"
      );


    cartSubtotal.textContent =
      peso(total);


    cartTotal.textContent =
      peso(total);


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
        p =>
          p.barcode ===
          item.barcode
      );


    if (!product) {

      return;

    }


    if (
      action ===
      "plus"
    ) {

      if (
        item.quantity >=
        Number(product.stock)
      ) {

        alert(
          "No more stock available."
        );

        return;

      }


      item.quantity++;

    }


    else if (
      action ===
      "minus"
    ) {

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


    else if (
      action ===
      "remove"
    ) {

      cart.splice(
        index,
        1
      );

    }


    renderCart();

  }


  /* CHECKOUT */

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


  checkoutBtn.addEventListener(
    "click",
    function () {

      if (
        !cart.length
      ) {

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


      checkoutMessage.style.color =
        "";


      confirmCheckoutBtn.disabled =
        false;


      checkoutModal.classList.remove(
        "hidden"
      );


      setTimeout(
        function () {

          paymentInput.focus();

        },
        100
      );

    }
  );


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

    checkoutModal.classList.add(
      "hidden"
    );

  }


  /* PAYMENT */

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
        payment -
        total;


      changeAmount.textContent =
        peso(
          change > 0
            ? change
            : 0
        );


      if (
        payment > 0 &&
        payment < total
      ) {

        checkoutMessage.textContent =
          "Kulang ang payment.";

      }

      else {

        checkoutMessage.textContent =
          "";

      }

    }
  );


  confirmCheckoutBtn.addEventListener(
    "click",
    completeCheckout
  );


  function completeCheckout() {

    if (
      !cart.length
    ) {

      return;

    }


    const total =
      calculateTotal();


    const payment =
      Number(
        paymentInput.value
      );


    if (
      !Number.isFinite(payment) ||
      payment < total
    ) {

      checkoutMessage.textContent =
        "Kulang ang payment.";

      checkoutMessage.style.color =
        "#dc2626";

      return;

    }


    for (
      const item of cart
    ) {

      const product =
        products.find(
          p =>
            p.barcode ===
            item.barcode
        );


      if (
        !product ||
        Number(product.stock) <
        item.quantity
      ) {

        checkoutMessage.textContent =
          "May product na kulang ang stock. Hindi natuloy ang checkout.";

        checkoutMessage.style.color =
          "#dc2626";

        return;

      }

    }


    let costTotal =
      0;


    cart.forEach(
      function (item) {

        const product =
          products.find(
            p =>
              p.barcode ===
              item.barcode
          );


        product.stock =
          Number(
            product.stock
          ) -
          Number(
            item.quantity
          );


        costTotal +=
          Number(item.cost) *
          Number(item.quantity);

      }
    );


    const profit =
      total -
      costTotal;


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
        Number(
          total.toFixed(2)
        ),

      cost:
        Number(
          costTotal.toFixed(2)
        ),

      profit:
        Number(
          profit.toFixed(2)
        ),

      payment:
        Number(
          payment.toFixed(2)
        ),

      change:
        Number(
          (
            payment -
            total
          ).toFixed(2)
        ),

      items:
        cart.map(
          item => ({
            ...item
          })
        )

    };


    sales.unshift(
      sale
    );


    if (
      !saveData()
    ) {

      return;

    }


    cart = [];


    renderCart();

    renderInventory();

    renderSales();

    updateDashboard();


    checkoutMessage.textContent =
      "Payment successful! Data saved.";

    checkoutMessage.style.color =
      "#16a34a";


    changeAmount.textContent =
      peso(
        sale.change
      );


    setTimeout(
      function () {

        closeCheckout();


        barcodeInput.value =
          "";


        productList.innerHTML =
          "";


        productMessage.textContent =
          "Transaction completed.";


        barcodeInput.focus();

      },
      900
    );

  }


  /* INVENTORY */

  function renderInventory() {

    inventoryTable.innerHTML =
      "";


    products.forEach(
      function (product) {

        const stock =
          Number(
            product.stock
          );


        let status =
          "In Stock";


        let className =
          "status-ok";


        if (
          stock <= 0
        ) {

          status =
            "Out of Stock";

          className =
            "status-out";

        }

        else if (
          stock <=
          Number(
            product.reorderLevel
          )
        ) {

          status =
            "Low Stock";

          className =
            "status-low";

        }


        const row =
          document.createElement(
            "tr"
          );


        row.innerHTML = `

          <td>
            ${escapeHtml(
              product.barcode
            )}
          </td>

          <td>
            ${escapeHtml(
              product.name
            )}
          </td>

          <td>
            ${escapeHtml(
              product.category
            )}
          </td>

          <td>
            ${peso(
              product.cost
            )}
          </td>

          <td>
            ${peso(
              product.price
            )}
          </td>

          <td>
            ${stock}
          </td>

          <td>

            <span
              class="status ${className}"
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


  /* SALES */

  function renderSales() {

    salesTable.innerHTML =
      "";


    if (
      !sales.length
    ) {

      salesTable.innerHTML = `

        <tr>

          <td
            colspan="8"
            style="
              text-align:center;
              color:#6b7280;
            "
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
            ${escapeHtml(
              sale.id
            )}
          </td>

          <td>
            ${escapeHtml(
              sale.date
            )}
          </td>

          <td>
            ${escapeHtml(
              sale.time
            )}
          </td>

          <td>
            ${peso(
              sale.total
            )}
          </td>

          <td>
            ${peso(
              sale.cost
            )}
          </td>

          <td>
            ${peso(
              sale.profit
            )}
          </td>

          <td>
            ${peso(
              sale.payment
            )}
          </td>

          <td>
            ${peso(
              sale.change
            )}
          </td>

        `;


        salesTable.appendChild(
          row
        );

      }
    );

  }


  /* CAMERA SCANNER */

  cameraScanBtn.addEventListener(
    "click",
    startCamera
  );


  stopCameraBtn.addEventListener(
    "click",
    stopCamera
  );


  function startCamera() {

    if (
      typeof Html5Qrcode ===
      "undefined"
    ) {

      productMessage.textContent =
        "Hindi available ang camera scanner. Check internet connection.";

      return;

    }


    cameraScanner.classList.remove(
      "hidden"
    );


    productMessage.textContent =
      "Starting camera...";


    if (
      html5QrCode
    ) {

      stopCamera();

    }


    html5QrCode =
      new Html5Qrcode(
        "reader"
      );


    Html5Qrcode
      .getCameras()
      .then(
        function (devices) {

          if (
            !devices ||
            !devices.length
          ) {

            throw new Error(
              "No camera"
            );

          }


          let cameraId =
            devices[
              devices.length - 1
            ].id;


          for (
            const device of devices
          ) {

            const label =
              (
                device.label ||
                ""
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
                device.id;

              break;

            }

          }


          return html5QrCode.start(

            cameraId,

            {
              fps: 10,

              qrbox: {
                width: 280,
                height: 120
              }

            },

            function (
              decodedText
            ) {

              barcodeInput.value =
                decodedText;


              stopCamera();


              searchProduct();

            },

            function () {

              // continue scanning

            }

          );

        }
      )
      .catch(
        function (error) {

          console.error(
            error
          );


          productMessage.textContent =
            "Camera access was denied or unavailable.";


          cameraScanner.classList.add(
            "hidden"
          );


          html5QrCode =
            null;

        }
      );

  }


  function stopCamera() {

    if (
      !html5QrCode
    ) {

      cameraScanner.classList.add(
        "hidden"
      );

      return;

    }


    html5QrCode
      .stop()
      .then(
        function () {

          html5QrCode.clear();

          html5QrCode =
            null;

          cameraScanner.classList.add(
            "hidden"
          );

        }
      )
      .catch(
        function () {

          html5QrCode =
            null;

          cameraScanner.classList.add(
            "hidden"
          );

        }
      );

  }


  /* SECURITY FOR PRODUCT TEXT */

  function escapeHtml(
    value
  ) {

    return String(value)
      .replace(
        /[&<>"']/g,
        function (char) {

          return {

            "&":
              "&amp;",

            "<":
              "&lt;",

            ">":
              "&gt;",

            '"':
              "&quot;",

            "'":
              "&#039;"

          }[char];

        }
      );

  }


  /* START */

  updateDate();

  updateDashboard();

  renderInventory();

  renderSales();

  renderCart();

});
