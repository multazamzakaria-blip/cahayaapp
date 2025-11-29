// wali-script.js
export function checkWaliLogin() {
  const user = JSON.parse(localStorage.getItem('cahayaWaliUser') || 'null');
  if (!user) {
    alert('Silakan login sebagai Wali Santri terlebih dahulu.');
    window.location.href = 'login.html';
    return null;
  }
  return user;
}

export function logoutWali() {
  localStorage.removeItem('cahayaWaliUser');
  window.location.href = 'login.html';
}
