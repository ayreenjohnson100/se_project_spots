// scripts/modal.js

function handleEscClose(evt) {
  if (evt.key === "Escape" || evt.key === "Esc") {
    const opened = document.querySelector(".modal.modal_is-opened");
    if (opened) closeModal(opened);
  }
}

function handleOverlayClick(evt) {
  if (evt.target === evt.currentTarget) {
    closeModal(evt.currentTarget);
  }
}

export function openModal(modal) {
  modal.classList.add("modal_is-opened");
  document.addEventListener("keydown", handleEscClose);
  modal.addEventListener("mousedown", handleOverlayClick);
}

export function closeModal(modal) {
  modal.classList.remove("modal_is-opened");
  document.removeEventListener("keydown", handleEscClose);
  modal.removeEventListener("mousedown", handleOverlayClick);
}
