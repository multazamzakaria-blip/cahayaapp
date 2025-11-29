// === Fungsi untuk cek apakah wali sudah login ===
export function checkWaliLogin() {
  // Ambil data wali dari localStorage (pakai key global unified)
  const data =
    localStorage.getItem("cahayaCurrentUser") ||
    localStorage.getItem("waliSantri"); // untuk kompatibilitas lama

  if (!data) {
    window.location.href = "../index.html"; // arahkan ke portal utama
    return null;
  }

  const user = JSON.parse(data);

  // Pastikan role-nya wali agar tidak salah akses
  if (user.role !== "wali") {
    window.location.href = "../index.html";
    return null;
  }

  return user;
}

// === Fungsi logout untuk wali ===
export function logoutWali() {
  // Hapus data login wali di semua kemungkinan key
  localStorage.removeItem("cahayaCurrentUser");
  localStorage.removeItem("waliSantri");

  // Arahkan ke portal utama
  window.location.href = "../index.html";
}
