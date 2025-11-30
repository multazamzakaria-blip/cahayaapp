// ==========================================================
// DASHBOARD WALI - CAHAYA APP (Final Integration Version)
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
  // === 1️⃣ Proteksi halaman: hanya wali yang bisa masuk ===
  const currentUser = JSON.parse(localStorage.getItem("cahayaCurrentUser") || "null");
  if (!currentUser || currentUser.role !== "wali") {
    window.location.href = "../../index.html";
    return;
  }

  // === 2️⃣ Splash Screen ===
  const splash = document.querySelector(".splash");
  if (splash) {
    setTimeout(() => splash.classList.add("hide"), 1500);
  }

  // === 3️⃣ Tampilkan nama wali di dashboard ===
  const waliLabel = currentUser.label || "Wali Santri";
  document.getElementById("waliNama").textContent = waliLabel;

  // === 4️⃣ Tombol logout ===
  const logoutBtn = document.getElementById("logoutBtn");
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("cahayaCurrentUser");
    window.location.href = "../../index.html";
  });

  // === 5️⃣ (Opsional) Tombol tambahan jika kamu mau menambahkan fitur lain ===
  // Contoh: reload data santri dari Firebase di sini nanti
});
