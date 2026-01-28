// src/pages/index.js

// IMPORT STYLES
import "../pages/index.css";
import "../vendor/fonts.css";

// IMPORT HELPERS / MODULES
import { validator } from "../scripts/validation.js";
import { openModal, closeModal } from "../scripts/modal.js";

// IMPORT API CLASS
import Api from "../utils/Api.js";

// IMPORT IMAGES (webpack-safe URLs)
import logoUrl from "../images/Logo.svg";
import avatarFallbackUrl from "../images/AvatarProject9.png";

import pencilUrl from "../images/pencil.svg";
import plusUrl from "../images/plus.svg";
import closeUrl from "../images/x-button2.svg";
import previewCloseUrl from "../images/Hover-X.svg";

// API INSTANCE
const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "dcd11bf2-d570-4463-92c6-86c6fdc192dd",
    "Content-Type": "application/json",
  },
});

// DOM LOOKUPS

// Header / Profile
const headerLogoEl = document.querySelector(".header__logo");
const profileAvatarEl = document.querySelector(".profile__avatar");
const profileNameEl = document.querySelector(".profile__name");
const profileDescriptionEl = document.querySelector(".profile__description");

// Buttons
const editProfileBtn = document.querySelector(".profile__edit-btn");
const newPostBtn = document.querySelector(".profile__add-btn");
const avatarBtn = document.querySelector(".profile__avatar-btn");

// Button icons
const pencilImgEl = document.querySelector(".profile__pencil");
const plusImgEl = document.querySelector(".profile__plus");

// Modals
const editProfileModal = document.querySelector("#edit-profile-modal");
const newPostModal = document.querySelector("#new-post-modal");
const avatarModal = document.querySelector("#edit-avatar-modal");
const previewModal = document.querySelector("#preview-modal");
const deleteCardModal = document.querySelector("#delete-card-modal");

// Close buttons
const editProfileCloseBtn = editProfileModal.querySelector(".modal__close-btn");
const newPostCloseBtn = newPostModal.querySelector(".modal__close-btn");
const avatarCloseBtn = avatarModal.querySelector(".modal__close-btn");
const previewCloseBtn = previewModal.querySelector(
  ".modal__close-btn_type_preview",
);
const deleteCloseBtn = deleteCardModal.querySelector(".modal__close-btn");

// Close icons
editProfileModal.querySelector(".modal__close-icon").src = closeUrl;
newPostModal.querySelector(".modal__close-icon").src = closeUrl;
avatarModal.querySelector(".modal__close-icon").src = closeUrl;
deleteCardModal.querySelector(".modal__close-icon").src = closeUrl;
previewModal.querySelector(".modal__preview-close-icon").src = previewCloseUrl;

// Forms
const editProfileForm = editProfileModal.querySelector(".modal__form");
const newPostForm = newPostModal.querySelector(".modal__form");
const avatarForm = avatarModal.querySelector(".modal__form");
const deleteForm = deleteCardModal.querySelector(".modal__form");

// Inputs
const editProfileNameInput = editProfileModal.querySelector(
  "#profile-name-input",
);
const editProfileDescriptionInput = editProfileModal.querySelector(
  "#profile-description-input",
);

const newPostImageInput = newPostModal.querySelector("#card-image-input");
const newPostTitleInput = newPostModal.querySelector("#card-title-input");

const avatarLinkInput = avatarModal.querySelector("#avatar-link-input");

// Preview modal
const previewImageEl = previewModal.querySelector(".modal__image");
const previewTitleEl = previewModal.querySelector(".modal__titles");

// Cards
const cardsList = document.querySelector(".cards__list");
const cardTemplate = document
  .querySelector("#card-template")
  .content.querySelector(".card");

// GLOBAL STATE
let currentUserId = null;

// Delete confirmation state
let pendingDeleteCardId = null;
let pendingDeleteCardEl = null;

// STATIC ICON SETUP
headerLogoEl.src = logoUrl;
profileAvatarEl.src = avatarFallbackUrl;

pencilImgEl.src = pencilUrl;
plusImgEl.src = plusUrl;

// HELPERS
function setButtonLoading(buttonEl, isLoading, defaultText) {
  if (!buttonEl) return;
  buttonEl.textContent = isLoading ? "Saving..." : defaultText;
}

function openImagePreview(link, title) {
  previewImageEl.src = link;
  previewImageEl.alt = title;
  previewTitleEl.textContent = title;
  openModal(previewModal);
}

function isCardLiked(cardData) {
  if (!currentUserId) return false;
  return (
    Array.isArray(cardData.likes) &&
    cardData.likes.some((u) => u._id === currentUserId)
  );
}

function openDeleteConfirm(cardId, cardEl) {
  pendingDeleteCardId = cardId;
  pendingDeleteCardEl = cardEl;
  openModal(deleteCardModal);
}

function resetDeletePending() {
  pendingDeleteCardId = null;
  pendingDeleteCardEl = null;
}

// CARD CREATION
function createCardElement(cardData) {
  const cardElement = cardTemplate.cloneNode(true);

  const cardImgEl = cardElement.querySelector(".card__image");
  const cardTitleEl = cardElement.querySelector(".card__title");
  const likeBtnEl = cardElement.querySelector(".card__like-btn");
  const deleteBtnEl = cardElement.querySelector(".card__delete-button");

  // Fill content
  cardImgEl.src = cardData.link;
  cardImgEl.alt = cardData.name;
  cardTitleEl.textContent = cardData.name;

  // Preview click
  cardImgEl.addEventListener("click", () =>
    openImagePreview(cardData.link, cardData.name),
  );

  // Initial like state from server (CSS class toggles background image)
  likeBtnEl.classList.toggle("card__like-btn_active", isCardLiked(cardData));

  // Like click -> instant UI + API sync + rollback on fail
  likeBtnEl.addEventListener("click", () => {
    const shouldLike = !isCardLiked(cardData);

    // instant UI feedback
    likeBtnEl.classList.toggle("card__like-btn_active", shouldLike);

    api
      .changeLikeCardStatus(cardData._id, shouldLike)
      .then((updatedCard) => {
        cardData.likes = updatedCard.likes;
      })
      .catch(() => {
        // rollback if API fails
        likeBtnEl.classList.toggle("card__like-btn_active", !shouldLike);
      });
  });

  // Delete button (only owner can delete)
  if (
    cardData.owner &&
    cardData.owner._id &&
    currentUserId &&
    cardData.owner._id !== currentUserId
  ) {
    deleteBtnEl.remove();
  } else {
    deleteBtnEl.addEventListener("click", () => {
      openDeleteConfirm(cardData._id, cardElement);
    });
  }

  return cardElement;
}

function renderCard(cardData, method = "append") {
  const el = createCardElement(cardData);
  if (!el) return;

  if (method === "prepend") cardsList.prepend(el);
  else cardsList.append(el);
}

// FORM HANDLERS

// Edit Profile
function handleEditProfileSubmit(evt) {
  evt.preventDefault();
  const submitBtn = editProfileForm.querySelector(".modal__submit-btn");
  const defaultText = submitBtn.textContent;

  setButtonLoading(submitBtn, true, defaultText);

  api
    .editUserInfo({
      name: editProfileNameInput.value,
      about: editProfileDescriptionInput.value,
    })
    .then((userData) => {
      profileNameEl.textContent = userData.name;
      profileDescriptionEl.textContent = userData.about;
      closeModal(editProfileModal);
    })
    .catch(console.error)
    .finally(() => setButtonLoading(submitBtn, false, defaultText));
}

// New Post
function handleNewPostSubmit(evt) {
  evt.preventDefault();
  const submitBtn = newPostForm.querySelector(".modal__submit-btn");
  const defaultText = submitBtn.textContent;

  setButtonLoading(submitBtn, true, defaultText);

  api
    .addCard({
      name: newPostTitleInput.value,
      link: newPostImageInput.value,
    })
    .then((cardFromServer) => {
      renderCard(cardFromServer, "prepend");
      newPostForm.reset();
      validator.resetFormUI(newPostForm);
      closeModal(newPostModal);
    })
    .catch(console.error)
    .finally(() => setButtonLoading(submitBtn, false, defaultText));
}

// Avatar
function handleAvatarSubmit(evt) {
  evt.preventDefault();
  const submitBtn = avatarForm.querySelector(".modal__submit-btn");
  const defaultText = submitBtn.textContent;

  setButtonLoading(submitBtn, true, defaultText);

  api
    .editAvatarInfo(avatarLinkInput.value)
    .then((userData) => {
      profileAvatarEl.src = userData.avatar || avatarFallbackUrl;
      avatarForm.reset();
      validator.resetFormUI(avatarForm);
      closeModal(avatarModal);
    })
    .catch(console.error)
    .finally(() => setButtonLoading(submitBtn, false, defaultText));
}

// Delete confirm
function handleDeleteConfirm(evt) {
  evt.preventDefault();

  if (!pendingDeleteCardId || !pendingDeleteCardEl) return;

  const btn = deleteForm.querySelector(".modal__submit-btn");
  const defaultText = btn.textContent;
  btn.textContent = "Deleting...";

  api
    .removeCard(pendingDeleteCardId)
    .then(() => {
      pendingDeleteCardEl.remove();
      closeModal(deleteCardModal);
      resetDeletePending();
    })
    .catch(console.error)
    .finally(() => {
      btn.textContent = defaultText;
    });
}

// EVENT LISTENERS

// open modals
editProfileBtn.addEventListener("click", () => {
  editProfileNameInput.value = profileNameEl.textContent;
  editProfileDescriptionInput.value = profileDescriptionEl.textContent;

  validator.clearErrorUI(editProfileForm);
  validator.toggleButtonState(editProfileForm);

  openModal(editProfileModal);
});

newPostBtn.addEventListener("click", () => {
  validator.resetFormUI(newPostForm);
  openModal(newPostModal);
});

avatarBtn.addEventListener("click", () => {
  validator.resetFormUI(avatarForm);
  openModal(avatarModal);
});

// close modals
editProfileCloseBtn.addEventListener("click", () =>
  closeModal(editProfileModal),
);
newPostCloseBtn.addEventListener("click", () => closeModal(newPostModal));
avatarCloseBtn.addEventListener("click", () => closeModal(avatarModal));
previewCloseBtn.addEventListener("click", () => closeModal(previewModal));
deleteCloseBtn.addEventListener("click", () => {
  closeModal(deleteCardModal);
  resetDeletePending();
});

// submit forms
editProfileForm.addEventListener("submit", handleEditProfileSubmit);
newPostForm.addEventListener("submit", handleNewPostSubmit);
avatarForm.addEventListener("submit", handleAvatarSubmit);
deleteForm.addEventListener("submit", handleDeleteConfirm);

// INITIAL LOAD
api
  .getAppInfo()
  .then(({ user, cards }) => {
    currentUserId = user._id;

    profileNameEl.textContent = user.name;
    profileDescriptionEl.textContent = user.about;
    profileAvatarEl.src = user.avatar || avatarFallbackUrl;

    cards.forEach((card) => renderCard(card, "append"));
  })
  .catch(console.error);
