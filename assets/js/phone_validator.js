// Допустимі коди операторів України
var validOperatorCodes = [
  "050",
  "063",
  "066",
  "067",
  "068",
  "073",
  "091",
  "092",
  "093",
  "094",
  "095",
  "096",
  "097",
  "098",
  "099",
];

function getOrderFormContext() {
  var cartForm = document.querySelector(".cart-modal__form");
  var legacyForm = document.querySelector(".order-pop-up");

  if (cartForm) {
    return {
      type: "cart-modal",
      form: cartForm,
      nameInput: cartForm.querySelector('input[name="first_name"], input[type="text"]'),
      phoneInput: cartForm.querySelector('input[name="phone"], input[type="tel"]'),
      submitButton: document.querySelector(".cart-modal__confirm"),
      getItems: function () {
        var selectedPack = document.querySelector("[data-cart-summary-name]");
        var selectedPrice = document.querySelector("[data-cart-summary-total]");

        return [
          {
            product_name: selectedPack ? selectedPack.textContent.trim() : "Обраний пакет",
            price: selectedPrice
              ? parseInt(selectedPrice.textContent.replace(/\D/g, ""), 10) || 0
              : 0,
            qty: 1,
          },
        ];
      },
    };
  }

  if (legacyForm) {
    var legacyInputs = document.querySelectorAll(".order-pop-up__form__label__input");

    return {
      type: "legacy",
      form: legacyForm,
      nameInput: legacyInputs[0] || null,
      phoneInput: legacyInputs[1] || null,
      submitButton: null,
      getItems: function () {
        var items = [];
        var productElements = document.querySelectorAll(".order-pop-up__products .product");

        productElements.forEach(function (el) {
          items.push({
            product_name: el.textContent.trim(),
            price:
              parseInt(
                document
                  .querySelector(".order-pop-up__to-pay .new-price")
                  .textContent.replace(/\D/g, ""),
                10,
              ) || 0,
            qty: 1,
          });
        });

        return items;
      },
    };
  }

  return null;
}

var orderContext = getOrderFormContext();
var orderForm = orderContext ? orderContext.form : null;
var nameInput = orderContext ? orderContext.nameInput : null;
var phoneInput = orderContext ? orderContext.phoneInput : null;
var submitButton = orderContext ? orderContext.submitButton : null;

function ensurePhoneErrorElement() {
  if (!phoneInput || document.getElementById("phoneError")) return;

  var errorDiv = document.createElement("div");
  errorDiv.id = "phoneError";
  errorDiv.style.color = "red";
  errorDiv.style.fontSize = "12px";
  errorDiv.style.display = "none";
  errorDiv.style.marginTop = "5px";
  phoneInput.parentNode.appendChild(errorDiv);
}

ensurePhoneErrorElement();

function normalizePhoneNumber(phone) {
  var digits = phone.replace(/\D/g, "");
  if (digits.startsWith("380")) return digits;
  if (digits.startsWith("0")) return "38" + digits;
  if (digits.length === 9) return "38" + digits;
  return digits;
}

function validatePhoneFull(phone) {
  var digits = phone.replace(/\D/g, "");
  if (digits.length !== 12) {
    return { valid: false, error: "Номер має бути +38 і 10 цифр" };
  }
  var operatorCode = digits.substr(2, 3);
  if (!validOperatorCodes.includes(operatorCode)) {
    return { valid: false, error: "Невірний код оператора: " + operatorCode };
  }
  return { valid: true, error: "" };
}

function showPhoneError(message) {
  var errorEl = document.getElementById("phoneError");
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.style.display = "block";
  }

  if (phoneInput) {
    phoneInput.style.borderColor = "red";
  }
}

function clearPhoneError() {
  var errorEl = document.getElementById("phoneError");
  if (errorEl) errorEl.style.display = "none";
  if (phoneInput) phoneInput.style.borderColor = "";
}

function formatPhoneNumber(input) {
  var cursorPos = input.selectionStart || input.value.length;
  var oldLength = input.value.length;
  var digits = input.value.replace(/\D/g, "");
  if (digits.length > 12) digits = digits.substring(0, 12);

  var newValue = "+" + digits;
  if (newValue === "+" || newValue === "+3" || digits === "") newValue = "+38";

  input.value = newValue;

  var newPos = cursorPos + (newValue.length - oldLength);
  if (newPos < 3) newPos = 3;
  input.setSelectionRange(newPos, newPos);
}

function validateAndShowError(phone) {
  var digits = phone.replace(/\D/g, "");
  if (digits.length >= 5) {
    var operatorCode = digits.substr(2, 3);
    if (!validOperatorCodes.includes(operatorCode)) {
      showPhoneError("Код " + operatorCode + " невірний");
      return;
    }
  }
  clearPhoneError();
}

if (phoneInput) {
  phoneInput.value = "+38";

  phoneInput.addEventListener("input", function () {
    setTimeout(function () {
      formatPhoneNumber(phoneInput);
      validateAndShowError(phoneInput.value);
    }, 1);
  });

  phoneInput.addEventListener("keydown", function (e) {
    if (
      (e.key === "Backspace" || e.key === "Delete") &&
      phoneInput.selectionStart <= 3
    ) {
      e.preventDefault();
    }
  });

  phoneInput.addEventListener("paste", function (e) {
    e.preventDefault();
    var paste = (e.clipboardData || window.clipboardData).getData("text");
    var digits = paste.replace(/\D/g, "");
    phoneInput.value = "+38" + digits.replace(/^38/, "").substring(0, 10);
    formatPhoneNumber(phoneInput);
    validateAndShowError(phoneInput.value);
  });
}

if (submitButton && orderForm) {
  submitButton.addEventListener("click", function () {
    if (submitButton.type !== "submit") {
      orderForm.requestSubmit();
    }
  });
}

if (orderForm) {
  orderForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    var phone = phoneInput ? phoneInput.value : "";
    var name = nameInput ? nameInput.value.trim() : "";
    var normalizedPhone = normalizePhoneNumber(phone);

    var validation = validatePhoneFull("+" + normalizedPhone);
    if (!validation.valid) {
      showPhoneError(validation.error);
      return;
    }

    if (!name) {
      alert("Будь ласка, введіть імʼя");
      return;
    }

    var items = orderContext ? orderContext.getItems() : [];
    var urlParams = new URLSearchParams(window.location.search);

    var payload = {
      first_name: name,
      phone: normalizedPhone,
      main_product: items[0] || { product_name: "Дифузор", price: 0, qty: 1 },
      additional_products: items.slice(1),
      utm_source: urlParams.get("utm_source"),
      utm_medium: urlParams.get("utm_medium"),
      utm_campaign: urlParams.get("utm_campaign"),
      redtrack_clickid:
        urlParams.get("clickid") || urlParams.get("redtrack_clickid"),
    };

    try {
      console.log("Дані замовлення готові до відправки:", payload);
      window.location.href = "/";
    } catch (error) {
      console.error("Виникла помилка:", error);
      alert("Сталася помилка при обробці замовлення.");
    }
  });
}
