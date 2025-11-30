// === CEK LOGIN WALI ===
export function checkWaliLogin() {
  // Ambil data wali dari localStorage (support format lama & baru)
  const data =
    localStorage.getItem("cahayaCurrentUser") ||
    localStorage.getItem("waliSantri");

  if (!data) {
    window.location.href = "../index.html"; // kalau belum login, kembalikan ke portal
    return null;
  }

  let user;
  try {
    user = JSON.parse(data);
  } catch (e) {
    console.error("Data login wali rusak:", e);
    localStorage.removeItem("cahayaCurrentUser");
    localStorage.removeItem("waliSantri");
    window.location.href = "../index.html";
    return null;
  }

  // Pastikan role-nya benar-benar wali
  if (user.role !== "wali") {
    window.location.href = "../index.html";
    return null;
  }

  // Pastikan ada nama anak (karena laporan bulanan bergantung padanya)
  if (!user.namaAnak || user.namaAnak.trim() === "") {
    alert("Data nama santri tidak ditemukan. Silakan login ulang.");
    logoutWali();
    return null;
  }

  return user;
}

// === LOGOUT WALI ===
export function logoutWali() {
  localStorage.removeItem("cahayaCurrentUser");
  localStorage.removeItem("waliSantri");
  window.location.href = "../index.html";
}
