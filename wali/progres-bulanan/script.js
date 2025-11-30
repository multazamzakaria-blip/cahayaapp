// ==========================================================
// PROGRES BULANAN SANTRI - TEMPLATE DASAR
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
  const waliNama = localStorage.getItem("waliNama") || "Wali Santri";
  document.getElementById("waliNama").textContent = waliNama;

  const tabelData = document.getElementById("tabelData");
  const filterBtn = document.getElementById("filterBtn");
  const bulanInput = document.getElementById("bulan");

  // Tombol kembali ke dashboard
  document.getElementById("backBtn").addEventListener("click", () => {
    window.location.href = "../dashboard/";
  });

  // Simulasi ambil data bulanan (nanti diganti Firebase)
  filterBtn.addEventListener("click", () => {
    const bulan = bulanInput.value;
    if (!bulan) {
      alert("Silakan pilih bulan terlebih dahulu.");
      return;
    }

    // Contoh data simulasi bulanan
    const dataBulanan = [
      { minggu: "1", disiplin: "Baik", akademik: "A", tahfiz: "30 Ayat", akhlak: "Sopan", catatan: "Mulai rajin tahajjud" },
      { minggu: "2", disiplin: "Sangat Baik", akademik: "A", tahfiz: "40 Ayat", akhlak: "Santun", catatan: "Membantu teman" },
      { minggu: "3", disiplin: "Baik", akademik: "B+", tahfiz: "45 Ayat", akhlak: "Baik", catatan: "Perlu fokus belajar" },
      { minggu: "4", disiplin: "Sangat Baik", akademik: "A", tahfiz: "50 Ayat", akhlak: "Teladan", catatan: "Stabil dan disiplin" },
    ];

    tabelData.innerHTML = dataBulanan.map(d => `
      <tr>
        <td>${d.minggu}</td>
        <td>${d.disiplin}</td>
        <td>${d.akademik}</td>
        <td>${d.tahfiz}</td>
        <td>${d.akhlak}</td>
        <td>${d.catatan}</td>
      </tr>
    `).join("");
  });
});
