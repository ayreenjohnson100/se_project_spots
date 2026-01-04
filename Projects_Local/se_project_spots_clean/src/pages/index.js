// src/pages/index.js

// styles
import "./index.css";
import "../vendor/fonts.css";

// utils / modules
import { validator } from "../scripts/validation.js";
import { openModal, closeModal } from "../scripts/modal.js";
import Api from "../utils/Api.js";

// API instance
const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "168b7195-6901-4f06-b426-3b813a094d79",
    "Content-Type": "application/json",
  },
});

// DOM LOOKUPS

// Cards
const cardsList = document.querySelector(".cards__list");
const cardTemplate = document
  .querySelector("#card-template")
  .content.querySelector(".card");

// Profile display
const profileNameEl = document.querySelector(".profile__name");
const profileDescriptionEl = document.querySelector(".profile__description");
const profileAvatarImg = document.querySelector(".profile__avatar");
let currentUser = null;

// Edit Profile modal
const editProfileBtn = document.querySelector(".profile__edit-btn");
const editProfileModal = document.querySelector("#edit-profile-modal");
const editProfileForm = editProfileModal.querySelector(".modal__form");
const editProfileCloseBtn = editProfileModal.querySelector(".modal__close-btn");
const editProfileNameInput = editProfileModal.querySelector(
  "#profile-name-input"
);
const editProfileDescriptionInput = editProfileModal.querySelector(
  "#profile-description-input"
);
const editProfileSubmitBtn =
  editProfileForm.querySelector(".modal__submit-btn");

// New Post modal
const newPostBtn = document.querySelector(".profile__add-btn");
const newPostModal = document.querySelector("#new-post-modal");
const newPostForm = newPostModal.querySelector(".modal__form");
const newPostCloseBtn = newPostModal.querySelector(".modal__close-btn");
const newPostImageInput = newPostModal.querySelector("#card-image-input");
const newPostTitleInput = newPostModal.querySelector("#card-title-input");
const newPostSubmitBtn = newPostForm.querySelector(".modal__submit-btn");

// Avatar modal
const avatarEditBtn = document.querySelector(".profile__avatar-btn");
const avatarModal = document.querySelector("#edit-avatar-modal");
const avatarForm = avatarModal.querySelector(".modal__form");
const avatarLinkInput = avatarModal.querySelector("#avatar-link-input");
const avatarSubmitBtn = avatarForm.querySelector(".modal__submit-btn");

// Preview modal
const previewModal = document.querySelector("#preview-modal");
const modalImage = previewModal.querySelector(".modal__image");
const modalTitle = previewModal.querySelector(".modal__titles");
const modalCloseBtn = previewModal.querySelector(
  ".modal__close-btn_type_preview"
);

// Delete card modal
const deleteModal = document.querySelector("#delete-card-modal");
const deleteForm = deleteModal.querySelector(".modal__form");
const deleteSubmitBtn = deleteForm.querySelector(".modal__submit-btn");
const deleteCloseBtn = deleteModal.querySelector(".modal__close-btn");

// Track which card will be deleted
let selectedCardElement = null;
let selectedCardId = null;

// HELPERS

// Determine if card is liked by current user (based on likes array)
function isCardLiked(cardData) {
  if (!cardData.likes || !currentUser) return false;
  return cardData.likes.some((user) => user._id === currentUser._id);
}

// Build one card element from card data
function createCard(cardData) {
  const cardElement = cardTemplate.cloneNode(true);

  const cardImageEl = cardElement.querySelector(".card__image");
  const cardTitleEl = cardElement.querySelector(".card__title");
  const likeBtn = cardElement.querySelector(".card__like-btn");
  const deleteBtn = cardElement.querySelector(".card__delete-button");

  cardImageEl.src = cardData.link;
  cardImageEl.alt = cardData.name;
  cardTitleEl.textContent = cardData.name;

  // Hide delete button if card isn't owned by current user
  if (
    currentUser &&
    cardData.owner &&
    cardData.owner._id &&
    cardData.owner._id !== currentUser._id
  ) {
    deleteBtn.style.display = "none";
  }

  // Set initial like state
  if (isCardLiked(cardData)) {
    likeBtn.classList.add("card__like-btn_active");
  }

  // Like / Unlike via API
  likeBtn.addEventListener("click", () => {
    const isLiked = likeBtn.classList.contains("card__like-btn_active");

    api
      .changeLikeCardStatus(cardData._id, !isLiked)
      .then((updatedCard) => {
        cardData.likes = updatedCard.likes;

        if (!isLiked) {
          likeBtn.classList.add("card__like-btn_active");
        } else {
          likeBtn.classList.remove("card__like-btn_active");
        }
      })
      .catch(console.error);
  });
  // Delete: open confirmation modal
  deleteBtn.addEventListener("click", () => {
    selectedCardElement = cardElement;
    selectedCardId = cardData._id;
    openModal(deleteModal);
  });

  // Preview
  cardImageEl.addEventListener("click", () => {
    modalImage.src = cardData.link;
    modalImage.alt = cardData.name;
    modalTitle.textContent = cardData.name;
    openModal(previewModal);
  });

  return cardElement;
}

// FORM HANDLERS

// Edit Profile -> PATCH /users/me
function handleEditProfileSubmit(evt) {
  evt.preventDefault();

  const initialText = editProfileSubmitBtn.textContent;
  editProfileSubmitBtn.textContent = "Saving...";
  editProfileSubmitBtn.disabled = true;

  api
    .updateUserInfo({
      name: editProfileNameInput.value,
      about: editProfileDescriptionInput.value,
    })
    .then((user) => {
      profileNameEl.textContent = user.name;
      profileDescriptionEl.textContent = user.about;
      closeModal(editProfileModal);
    })
    .catch(console.error)
    .finally(() => {
      editProfileSubmitBtn.textContent = initialText;
      editProfileSubmitBtn.disabled = false;
    });
}

// New Post -> POST /cards
function handleNewPostSubmit(evt) {
  evt.preventDefault();

  const cardData = {
    name: newPostTitleInput.value,
    link: newPostImageInput.value,
  };

  const initialText = newPostSubmitBtn.textContent;
  newPostSubmitBtn.textContent = "Saving...";
  newPostSubmitBtn.disabled = true;

  api
    .addCard(cardData)
    .then((cardFromServer) => {
      const cardEl = createCard(cardFromServer);
      cardsList.prepend(cardEl);
      closeModal(newPostModal);
      newPostForm.reset();
      validator.resetFormUI(newPostForm);
    })
    .catch(console.error)
    .finally(() => {
      newPostSubmitBtn.textContent = initialText;
      newPostSubmitBtn.disabled = false;
    });
}

// Avatar -> PATCH /users/me/avatar
function handleAvatarSubmit(evt) {
  evt.preventDefault();

  const avatarUrl = avatarLinkInput.value.trim();
  if (!avatarUrl) return;

  const initialText = avatarSubmitBtn.textContent;
  avatarSubmitBtn.textContent = "Saving...";
  avatarSubmitBtn.disabled = true;

  api
    .updateAvatar(avatarUrl)
    .then((user) => {
      profileAvatarImg.src = user.avatar;
      closeModal(avatarModal);
      avatarForm.reset();
      validator.resetFormUI(avatarForm);
    })
    .catch(console.error)
    .finally(() => {
      avatarSubmitBtn.textContent = initialText;
      avatarSubmitBtn.disabled = false;
    });
}

// Delete confirmation -> DELETE /cards/:cardId
function handleDeleteSubmit(evt) {
  evt.preventDefault();

  if (!selectedCardId || !selectedCardElement) return;

  const initialText = deleteSubmitBtn.textContent;
  deleteSubmitBtn.textContent = "Deleting...";
  deleteSubmitBtn.disabled = true;

  api
    .deleteCard(selectedCardId)
    .then(() => {
      selectedCardElement.remove();
      closeModal(deleteModal);
      selectedCardElement = null;
      selectedCardId = null;
    })
    .catch(console.error)
    .finally(() => {
      deleteSubmitBtn.textContent = initialText;
      deleteSubmitBtn.disabled = false;
    });
}

// EVENT LISTENERS

// Edit Profile open
editProfileBtn.addEventListener("click", () => {
  editProfileNameInput.value = profileNameEl.textContent;
  editProfileDescriptionInput.value = profileDescriptionEl.textContent;
  validator.clearErrorUI(editProfileForm);
  validator.toggleButtonState(editProfileForm);
  openModal(editProfileModal);
});

editProfileCloseBtn.addEventListener("click", () =>
  closeModal(editProfileModal)
);
editProfileForm.addEventListener("submit", handleEditProfileSubmit);

// New Post open
newPostBtn.addEventListener("click", () => {
  validator.resetFormUI(newPostForm);
  openModal(newPostModal);
});

newPostCloseBtn.addEventListener("click", () => {
  validator.resetFormUI(newPostForm);
  closeModal(newPostModal);
});
newPostForm.addEventListener("submit", handleNewPostSubmit);

// Avatar modal open
avatarEditBtn.addEventListener("click", () => {
  validator.resetFormUI(avatarForm);
  avatarLinkInput.value = "";
  openModal(avatarModal);
});
avatarForm.addEventListener("submit", handleAvatarSubmit);

// Delete modal
deleteCloseBtn.addEventListener("click", () => closeModal(deleteModal));
deleteForm.addEventListener("submit", handleDeleteSubmit);

// Preview close
modalCloseBtn.addEventListener("click", () => closeModal(previewModal));

// INITIAL LOAD FROM API
api
  .getAppInfo()
  .then(({ user, cards }) => {
    currentUser = user;

    // set profile info
    profileNameEl.textContent = user.name;
    profileDescriptionEl.textContent = user.about;
    profileAvatarImg.src = user.avatar;

    // render cards from server
    cards.forEach((card) => {
      const cardEl = createCard(card);
      cardsList.append(cardEl);
    });
  })
  .catch(console.error);

// ENABLE VALIDATION
validator.enableValidation();
