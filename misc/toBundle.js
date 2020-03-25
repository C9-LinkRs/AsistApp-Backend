"use-strict";

let qrCode = require("qrcode");

document.addEventListener("load", () => {

  let urlParams = new URLSearchParams(location.search);

  if (urlParams.has("classToken")) {
    let classToken = urlParams.get("classToken");

    setTimeout(function caller() {
      fetch("/attendance/generateQr", {
        method: "GET",
        headers: { "Authorization": classToken }
      }).then(response => {
        let responseJson = response.json();
        if (responseJson.statusCode == 200 && responseJson.dataUrl) {
          paintDataUrl(responseJson.dataUrl);
          setTimeout(caller, 15000);
        } else {
          document.getElementById("message").innerHTML = "Terminado";
        }
      }).catch(error => console.error(error));
    }, 15000);
  } else {
    document.getElementById("message").innerHTML = "No se ha encontrado la token de la clase";
  }

});

function paintDataUrl(dataUrl) {
  let canvas = document.getElementById("canvas");

  qrCode.toCanvas(canvas, dataUrl, (error) => {
    if (error) console.error("error on painting qr code on canvas", error);
    else console.log("qr code painted successful");
  });
}