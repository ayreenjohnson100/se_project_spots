// src/utils/Api.js

class Api {
  constructor({ baseUrl, headers }) {
    this._baseUrl = baseUrl;
    this._headers = headers;
  }

  // private helper
  // arrow function keeps `this` bound correctly
  _checkResponse = (res) => {
    if (res.ok) {
      return res.json();
    }
    return Promise.reject(`Error: ${res.status}`);
  };

  // USERS

  // GET /users/me
  getUserInfo() {
    return fetch(`${this._baseUrl}/users/me`, {
      headers: this._headers,
    }).then(this._checkResponse);
  }

  // PATCH /users/me
  updateUserInfo({ name, about }) {
    return fetch(`${this._baseUrl}/users/me`, {
      method: "PATCH",
      headers: this._headers,
      body: JSON.stringify({ name, about }),
    }).then(this._checkResponse);
  }

  // PATCH /users/me/avatar
  updateAvatar(avatarUrl) {
    return fetch(`${this._baseUrl}/users/me/avatar`, {
      method: "PATCH",
      headers: this._headers,
      body: JSON.stringify({ avatar: avatarUrl }),
    }).then(this._checkResponse);
  }

  // CARDS

  // GET /cards
  getInitialCards() {
    return fetch(`${this._baseUrl}/cards`, {
      headers: this._headers,
    }).then(this._checkResponse);
  }

  // POST /cards
  addCard({ name, link }) {
    return fetch(`${this._baseUrl}/cards`, {
      method: "POST",
      headers: this._headers,
      body: JSON.stringify({ name, link }),
    }).then(this._checkResponse);
  }

  // DELETE /cards/:cardId
  deleteCard(cardId) {
    return fetch(`${this._baseUrl}/cards/${cardId}`, {
      method: "DELETE",
      headers: this._headers,
    }).then(this._checkResponse);
  }

  // PUT or DELETE /cards/:cardId/likes
  changeLikeCardStatus(cardId, shouldLike) {
    return fetch(`${this._baseUrl}/cards/${cardId}/likes`, {
      method: shouldLike ? "PUT" : "DELETE",
      headers: this._headers,
    }).then(this._checkResponse);
  }

  // COMBINED STARTUP DATA
  // returns { user, cards }
  getAppInfo() {
    return Promise.all([this.getUserInfo(), this.getInitialCards()]).then(
      ([user, cards]) => ({ user, cards })
    );
  }
}

export default Api;
