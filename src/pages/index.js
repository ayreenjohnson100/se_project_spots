// ===== IMPORT STYLES =====
import "./index.css";
import "../vendor/fonts.css";

// ===== IMPORT HELPERS / MODULES =====
import { validator } from "../scripts/validation.js";
import { openModal, closeModal } from "../scripts/modal.js";

// ===== IMPORT API CLASS =====
import Api from "../utils/Api.js";

// ===== IMPORT IMAGES (Webpack gives us URLs) =====
import logoUrl from "../images/Logo.svg";
import avatarFallbackUrl from "../images/AvatarProject9.png";
// NOTE: pencil.svg and plus.svg are already set via <%= require(...) %> in HTML
// so we don't have to import them here unless we want to overwrite them later.

// ===== DOM LOOKUPS =====

// profile / header
const headerLogoEl = document.querySelector(".header__logo");
const profileAvatarEl = document.querySelector(".profile__avatar");
const profileNameEl = document.querySelector(".profile__name");
const profileDescriptionEl = document.querySelector(".profile__description");

// profile buttons
const editProfileBtn = document.querySelector(".profile__edit-btn");
const newPostBtn = document.querySelector(".profile__add-btn");
const avatarBtn = document.querySelector(".profile__avatar-btn");

// modals
const editProfileModal = document.querySelector("#edit-profile-modal");
const newPostModal = document.querySelector("#new-post-modal");
const avatarModal = document.querySelector("#edit-avatar-modal");
const previewModal = document.querySelector("#preview-modal");

// close buttons (inside each modal)
const editProfileCloseBtn = editProfileModal.querySelector(".modal__close-btn");
const newPostCloseBtn = newPostModal.querySelector(".modal__close-btn");
const avatarCloseBtn = avatarModal.querySelector(".modal__close-btn");
const previewCloseBtn = previewModal.querySelector(
  ".modal__close-btn_type_preview"
);

// forms
const editProfileForm = editProfileModal.querySelector(".modal__form");
const newPostForm = newPostModal.querySelector(".modal__form");
const avatarForm = avatarModal.querySelector(".modal__form");

// form inputs
const editProfileNameInput = editProfileModal.querySelector(
  "#profile-name-input"
);
const editProfileDescriptionInput = editProfileModal.querySelector(
  "#profile-description-input"
);
const newPostImageInput = newPostModal.querySelector("#card-image-input");
const newPostTitleInput = newPostModal.querySelector("#card-title-input");
const avatarLinkInput = avatarModal.querySelector("#avatar-link-input");

// preview modal elements
const previewImageEl = previewModal.querySelector(".modal__image");
const previewTitleEl = previewModal.querySelector(".modal__titles");

// cards section
const cardsList = document.querySelector(".cards__list");
const cardTemplate = document
  .querySelector("#card-template")
  .content.querySelector(".card");

// ===== INITIAL STATIC SETUP =====

// set logo + default avatar if not set yet
if (headerLogoEl) {
  headerLogoEl.src = logoUrl;
}
if (profileAvatarEl) {
  profileAvatarEl.src = avatarFallbackUrl;
}

// ===== API INSTANCE =====
// NOTE: replace YOUR_TOKEN_HERE with your actual personal token
const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "dcd11bf2-d570-4463-92c6-86c6fdc192dd",
    "Content-Type": "application/json",
  },
});

// ===== CARD CREATION =====

function createCardElement(cardData) {
  // cardData should have { name, link, _id? }
  const cardElement = cardTemplate.cloneNode(true);

  const cardImgEl = cardElement.querySelector(".card__image");
  const cardTitleEl = cardElement.querySelector(".card__title");
  const likeBtnEl = cardElement.querySelector(".card__like-btn");
  const deleteBtnEl = cardElement.querySelector(".card__delete-button");

  // fill content
  cardImgEl.src = cardData.link;
  cardImgEl.alt = cardData.name;
  cardTitleEl.textContent = cardData.name;

  // open preview when clicking image
  cardImgEl.addEventListener("click", () => {
    openImagePreview(cardData.link, cardData.name);
  });

  // like toggle (UI only for now - server hook comes later)
  likeBtnEl.addEventListener("click", () => {
    likeBtnEl.classList.toggle("card__like-btn_active");
  });

  // delete card (server delete will come later)
  deleteBtnEl.addEventListener("click", () => {
    cardElement.remove();
  });

  return cardElement;
}

function prependCard(cardData) {
  const newCard = createCardElement(cardData);
  cardsList.prepend(newCard);
}

// ===== PREVIEW MODAL LOGIC =====

function openImagePreview(link, title) {
  previewImageEl.src = link;
  previewImageEl.alt = title;
  previewTitleEl.textContent = title;
  openModal(previewModal);
}

// ===== FORM HANDLERS =====

// 1. Edit Profile form
function handleEditProfileSubmit(evt) {
  evt.preventDefault();

  const newName = editProfileNameInput.value;
  const newAbout = editProfileDescriptionInput.value;

  // show loading text
  const submitBtn = editProfileForm.querySelector(".modal__submit-btn");
  const originalBtnText = submitBtn.textContent;
  submitBtn.textContent = "Saving...";

  api
    .editUserInfo({ name: newName, about: newAbout })
    .then((userData) => {
      // update UI based on what server says, not just inputs
      profileNameEl.textContent = userData.name;
      profileDescriptionEl.textContent = userData.about;
      closeModal(editProfileModal);
    })
    .catch(console.error)
    .finally(() => {
      submitBtn.textContent = originalBtnText;
    });
}

// 2. New Post form
function handleNewPostSubmit(evt) {
  evt.preventDefault();

  const name = newPostTitleInput.value;
  const link = newPostImageInput.value;

  const submitBtn = newPostForm.querySelector(".modal__submit-btn");
  const originalBtnText = submitBtn.textContent;
  submitBtn.textContent = "Saving...";

  api
    .addCard({ name, link })
    .then((cardFromServer) => {
      // cardFromServer will have _id etc
      prependCard(cardFromServer);
      newPostForm.reset();
      closeModal(newPostModal);
      validator.resetFormUI(newPostForm);
    })
    .catch(console.error)
    .finally(() => {
      submitBtn.textContent = originalBtnText;
    });
}

// 3. Avatar form
function handleAvatarSubmit(evt) {
  evt.preventDefault();

  const avatarLink = avatarLinkInput.value;

  const submitBtn = avatarForm.querySelector(".modal__submit-btn");
  const originalBtnText = submitBtn.textContent;
  submitBtn.textContent = "Saving...";

  api
    .editAvatarInfo(avatarLink)
    .then((userData) => {
      // update avatar on page with what server returns
      profileAvatarEl.src = userData.avatar;
      avatarForm.reset();
      closeModal(avatarModal);
      validator.resetFormUI(avatarForm);
    })
    .catch(console.error)
    .finally(() => {
      submitBtn.textContent = originalBtnText;
    });
}

// ===== OPEN/CLOSE MODALS =====

// open edit profile
editProfileBtn.addEventListener("click", () => {
  // preload current values into form
  editProfileNameInput.value = profileNameEl.textContent;
  editProfileDescriptionInput.value = profileDescriptionEl.textContent;

  validator.clearErrorUI(editProfileForm);
  validator.toggleButtonState(editProfileForm);

  openModal(editProfileModal);
});

// open new post
newPostBtn.addEventListener("click", () => {
  validator.resetFormUI(newPostForm);
  openModal(newPostModal);
});

// open avatar edit
avatarBtn.addEventListener("click", () => {
  validator.resetFormUI(avatarForm);
  openModal(avatarModal);
});

// close buttons
editProfileCloseBtn.addEventListener("click", () =>
  closeModal(editProfileModal)
);
newPostCloseBtn.addEventListener("click", () => closeModal(newPostModal));
avatarCloseBtn.addEventListener("click", () => closeModal(avatarModal));
previewCloseBtn.addEventListener("click", () => closeModal(previewModal));

// submit listeners
editProfileForm.addEventListener("submit", handleEditProfileSubmit);
newPostForm.addEventListener("submit", handleNewPostSubmit);
avatarForm.addEventListener("submit", handleAvatarSubmit);

// ===== ESC / OVERLAY CLOSE (optional if modal.js already handles it) =====
// if your modal.js already wires up Escape / overlay close globally,
// you don't need to repeat it here.

// ===== INITIAL LOAD FROM API =====
//
// We want:
// - user info (name, about, avatar)
// - card list
//
// Your Api class will return Promise.all([user, cards]) in something like getAppInfo().
// We'll expect it to give { user, cards } so we can use both.

api
  .getAppInfo()
  .then(({ user, cards }) => {
    // 1. set profile info
    profileNameEl.textContent = user.name;
    profileDescriptionEl.textContent = user.about;
    profileAvatarEl.src = user.avatar || avatarFallbackUrl;

    // 2. render cards
    cards.forEach((card) => {
      const cardEl = createCardElement({
        name: card.name,
        link: card.link,
        _id: card._id,
      });
      cardsList.append(cardEl);
    });
  })
  .catch(console.error);
