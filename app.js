const GOOGLE_SHEETS_URL =
  "https://script.google.com/macros/s/AKfycbw-8QO1nhx6JMeT9xZXSU86Ss2K4kFpY3DjqyRPaMCOsu9SSNCWl9OMnp0so41N3JXV3w/exec";


function saveSaleToGoogleSheets(sale) {

  return fetch(GOOGLE_SHEETS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify({
      action: "saveSale",
      sale: sale
    }),
    mode: "no-cors"
  });

}
