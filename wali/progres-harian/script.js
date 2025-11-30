// ==========================================================
// PROGRES HARIAN SANTRI - TEMPLATE DASAR
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
  const waliNama = localStorage.getItem("waliNama") || "Wali Santri";
  document.getElementById("waliNama").textContent = waliNama;

  const tabelData = document.getElementById("tabelData");
  const filterBtn = document.getElementById("filterBtn");
  const tanggalInput = document.getElementById("tanggal");

  // Tombol kembali ke dashboard
  document.getElementById("backBtn").addEventListener("click", () => {
    window.location.href = "../dashboard/";
  });

  // Simulasi ambil data harian (nanti bisa ganti dari Firebase)
  filterBtn.addEventListener("click", () => {
    const tgl = tanggalInput.value;
    if (!tgl) {
      alert("Silakan pilih tanggal terlebih dahulu.");
      return;
    }

    // Contoh data simulasi
    const dataHarian = [
      { waktu: "04.00", kegiatan: "Tahajjud", ket: "Hadir" },
      { waktu: "05.00", kegiatan: "Shalat Subuh", ket: "Hadir" },
      { waktu: "07.00", kegiatan: "Belajar Pagi", ket: "Hadir" },
      { waktu: "09.00", kegiatan: "Tahfiz Qur'an", ket: "Izin" },
      { waktu: "12.00", kegiatan: "Shalat Dzuhur", ket: "Hadir" },
    ];

    // Tampilkan ke tabel
    tabelData.innerHTML = dataHarian
      .map(d => `
        <tr>
          <td>${d.waktu}</td>
          <td>${d.kegiatan}</td>
          <td>${d.ket}</td>
        </tr>
      `)
      .join("");
  });
});
