// src/app/lib/session.js
'use client';

export function clearSession() {
  window.localStorage.removeItem('accessToken');
  window.localStorage.removeItem('memberName');
  window.localStorage.removeItem('memberRole');
}