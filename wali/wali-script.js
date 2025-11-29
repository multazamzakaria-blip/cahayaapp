// wali-script.js
export function checkWaliLogin() {
  const data = localStorage.getItem("waliSantri");
  if (!data) return null;
  return JSON.parse(data);
}

export function logoutWali() {
  localStorage.removeItem("waliSantri");
  window.location.href = "wali-login.html";
}
