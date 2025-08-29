// 1) central config (single source of truth)
const settings = {
  formSelector: ".modal__form",
  inputSelector: ".modal__input",
  submitButtonSelector: ".modal__submit-btn",
  inactiveButtonClass: "modal__submit-btn_disabled",
  inputErrorClass: "modal__input_type_error",
  // errorClass: "modal__error_visible", // add if you style visible errors
};

// 2) factory: creates a validator bound to this config
function createValidator(config) {
  // ---- internal helpers (config-aware) ----
  const getInputs = (formEl) =>
    Array.from(formEl.querySelectorAll(config.inputSelector));

  const getSubmitButton = (formEl) =>
    formEl.querySelector(config.submitButtonSelector);

  const hasInvalidInput = (inputs) =>
    inputs.some((input) => !input.validity.valid);

  const showInputError = (formEl, inputEl, message) => {
    const errorEl = formEl.querySelector(`#${inputEl.id}-error`);
    if (errorEl) errorEl.textContent = message;
    inputEl.classList.add(config.inputErrorClass);
    // if (errorEl && config.errorClass) errorEl.classList.add(config.errorClass);
  };

  const hideInputError = (formEl, inputEl) => {
    const errorEl = formEl.querySelector(`#${inputEl.id}-error`);
    if (errorEl) errorEl.textContent = "";
    inputEl.classList.remove(config.inputErrorClass);
    // if (errorEl && config.errorClass) errorEl.classList.remove(config.errorClass);
  };

  // ---- public: used by both validation wiring and index.js ----
  function toggleButtonState(formEl) {
    const inputs = getInputs(formEl);
    const btn = getSubmitButton(formEl);
    if (!btn) return;
    const shouldDisable = hasInvalidInput(inputs);
    btn.disabled = shouldDisable;
    if (config.inactiveButtonClass) {
      btn.classList.toggle(config.inactiveButtonClass, shouldDisable);
    }
  }

  function setEventListeners(formEl) {
    const inputs = getInputs(formEl);

    // initial state before typing
    toggleButtonState(formEl);

    inputs.forEach((inputEl) => {
      inputEl.addEventListener("input", () => {
        if (!inputEl.validity.valid) {
          showInputError(formEl, inputEl, inputEl.validationMessage);
        } else {
          hideInputError(formEl, inputEl);
        }
        toggleButtonState(formEl);
      });
    });
  }

  function enableValidation() {
    const formList = document.querySelectorAll(config.formSelector);
    formList.forEach(setEventListeners);
  }

  function clearErrorUI(formEl) {
    const inputs = getInputs(formEl);
    inputs.forEach((inputEl) => {
      inputEl.setCustomValidity("");
      hideInputError(formEl, inputEl);
    });
    toggleButtonState(formEl);
  }

  function resetFormUI(formEl) {
    formEl.reset();
    clearErrorUI(formEl);
    toggleButtonState(formEl);
  }

  // expose the module API
  return { enableValidation, toggleButtonState, clearErrorUI, resetFormUI };
}

// 3) create one shared validator and initialize
const validator = createValidator(settings);
validator.enableValidation();

// 4) make it available to index.js
window.validator = validator;
