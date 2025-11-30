// ==========================================================
// WALI DASHBOARD SCRIPT - TEMPLATE DASAR
// ==========================================================

// Simulasi login wali
document.addEventListener("DOMContentLoaded", () => {
  const splash = document.querySelector(".splash");
  setTimeout(() => splash.classList.add("hide"), 1500);

  // Ambil data wali dari localStorage (jika ada)
  const waliNama = localStorage.getItem("waliNama") || "Wali Santri";
  document.getElementById("waliNama").textContent = waliNama;

  // Tombol logout
  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("waliNama");
    window.location.href = "../../login.html"; // arahkan ke login
  });
});
