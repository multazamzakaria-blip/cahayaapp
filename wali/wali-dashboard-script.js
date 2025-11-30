// ==========================================================
// WALI DASHBOARD SCRIPT - FINAL STABLE VERSION
// ==========================================================

import { checkWaliLogin, logoutWali } from './wali-script.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const app = initializeApp({
  apiKey: "AIzaSyB0Ez2a85ZwQLR28U-yHpVmM3o8NMxZoLI",
  authDomain: "absensi-santri-fajrul-islam.firebaseapp.com",
  databaseURL: "https://absensi-santri-fajrul-islam-default-rtdb.firebaseio.com",
  projectId: "absensi-santri-fajrul-islam",
  storageBucket: "absensi-santri-fajrul-islam.appspot.com",
  messagingSenderId: "739928369926",
  appId: "1:739928369926:web:7e95375c3ddba0f584cdd07"
});

const db = getDatabase(app);
const user = checkWaliLogin();
if (!user) window.location.href = "../index.html";

document.getElementById("greeting").innerHTML = 
  `👋 Assalamu’alaikum Walisantri <b>${user.namaAnak}</b>`;

const content = document.getElementById("content");
const toolbar = document.getElementById("filterToolbar");

// ==========================================================
// 🔹 MENU PROGRES HARIAN
// ==========================================================
document.getElementById("btnHarian").addEventListener("click", () => {
  toolbar.style.display = "flex";
  toolbar.innerHTML = `
    <input type="date" id="tanggal" value="${new Date().toISOString().split("T")[0]}" />
    <button id="lihatProgres">Lihat Progres</button>
  `;
  document.getElementById("lihatProgres").onclick = () => {
    const tgl = document.getElementById("tanggal").value;
    if (!tgl) return alert("Pilih tanggal terlebih dahulu.");
    loadProgresHarian(tgl);
  };
  content.innerHTML = `<p style="text-align:center;">Silakan pilih tanggal, lalu klik "Lihat Progres".</p>`;
});

async function loadProgresHarian(tanggal) {
  const nama = user.namaAnak.toUpperCase().trim();
  content.innerHTML = `
    <div class="card green"><h2>📋 Absensi Program Harian</h2><div id="prog">Memuat...</div></div>
    <div class="card blue"><h2>📘 Absensi Pembelajaran</h2><div id="pemb">Memuat...</div></div>
    <div class="card purple"><h2>📖 Setoran Tahfiz</h2><div id="tahfiz">Memuat...</div></div>
    <div class="card red"><h2>⚠️ Pelanggaran</h2><div id="pelanggaran">Memuat...</div></div>
  `;

  await loadData("cahaya_app/absensi_program_harian", tanggal, nama, "prog", "program", "status");
  await loadData("cahaya_app/absensi_pembelajaran", tanggal, nama, "pemb", "mapel", "status");
  await loadData("cahaya_app/setoran_tahfiz", tanggal, nama, "tahfiz", "setoran", "nilai");
  await loadPelanggaran(tanggal, nama);
}

async function loadPelanggaran(tanggal, nama) {
  const target = document.getElementById("pelanggaran");
  try {
    const snap = await get(child(ref(db), "cahaya_app/pelanggaran_santri"));
    if (!snap.exists()) return target.textContent = "Belum ada data pelanggaran.";
    let html = `<table><tr>
      <th>Pelanggaran</th><th>Kategori</th><th>Keterangan</th>
      <th>Tindak Lanjut</th><th>Konsekuensi</th></tr>`;
    let ditemukan = false;
    Object.values(snap.val()).forEach(p => {
      if (p.tanggal === tanggal && p.santri?.trim().toUpperCase() === nama) {
        ditemukan = true;
        html += `
          <tr>
            <td>${p.namaPelanggaran || "-"}</td>
            <td>${p.kategori || "-"}</td>
            <td>${p.keterangan || "-"}</td>
            <td>${p.tindakLanjut || "-"}</td>
            <td>${p.konsekuensi || "-"}</td>
          </tr>`;
      }
    });
    html += "</table>";
    target.innerHTML = ditemukan ? html : "Tidak ada pelanggaran hari ini.";
  } catch (err) {
    target.textContent = "❌ Gagal memuat pelanggaran: " + err.message;
  }
}

async function loadData(path, tanggal, nama, targetId, col1, col2) {
  const target = document.getElementById(targetId);
  try {
    const snap = await get(child(ref(db), path));
    let html = `<table><tr><th>${capitalize(col1)}</th><th>${capitalize(col2)}</th></tr>`;
    if (snap.exists()) {
      Object.values(snap.val()).forEach(d => {
        if (d.tanggal === tanggal && d.data) {
          d.data.forEach(s => {
            if (s.nama?.trim().toUpperCase() === nama) {
              const val = (s[col2] || d[col2] || "-").toLowerCase();
              const statusClass = val.includes("hadir") ? "hadir" :
                                  val.includes("izin") ? "izin" :
                                  val.includes("sakit") ? "sakit" :
                                  val.includes("alfa") ? "alfa" : "";
              html += `<tr><td>${s[col1] || d[col1] || "-"}</td>
                       <td><span class="status-box ${statusClass}">${s[col2]}</span></td></tr>`;
            }
          });
        }
      });
    }
    html += "</table>";
    target.innerHTML = html.includes("<tr><td") ? html : "Belum ada data.";
  } catch (e) {
    target.textContent = "❌ Gagal memuat data: " + e.message;
  }
}

// ==========================================================
// 🔹 MENU PROGRES BULANAN
// ==========================================================
document.getElementById("btnBulanan").addEventListener("click", () => {
  toolbar.style.display = "flex";
  toolbar.innerHTML = `
    <input type="month" id="bulan" value="${new Date().toISOString().slice(0,7)}" />
    <button id="lihatProgresBulanan">Lihat Progres</button>
  `;
  document.getElementById("lihatProgresBulanan").onclick = () => {
    const bln = document.getElementById("bulan").value;
    if (!bln) return alert("Pilih bulan terlebih dahulu.");
    loadProgresBulanan(bln);
  };
  content.innerHTML = `<p style="text-align:center;">Silakan pilih bulan, lalu klik "Lihat Progres".</p>`;
});

// ==========================================================
// 🔹 FUNGSI BANTU UMUM
// ==========================================================
function parseDate(s) {
  if (!s) return null;
  const p = s.split("-");
  return new Date(+p[0], +p[1] - 1, +p[2]);
}
function isSameMonthYear(tgl, b, t) {
  const d = parseDate(tgl);
  return d && d.getMonth() === b && d.getFullYear() === t;
}
function capitalize(str) { return str.charAt(0).toUpperCase() + str.slice(1); }

// ==========================================================
// 🔹 PROGRES BULANAN
// ==========================================================
async function loadProgresBulanan(bulan) {
  const namaSantri = user.namaAnak.trim();
  const namaUpper = namaSantri.toUpperCase();
  const [tahunStr, bulanStr] = bulan.split("-");
  const tahun = parseInt(tahunStr, 10);
  const bulanIdx = parseInt(bulanStr, 10) - 1;
  const namaBulan = [
    "Januari","Februari","Maret","April","Mei","Juni",
    "Juli","Agustus","September","Oktober","November","Desember"
  ][bulanIdx] || bulanStr;

  content.innerHTML = `
    <div class="card blue" id="laporanBulananCard"
         style="background:#fff;color:#111827;">
      <h2 style="text-align:center;margin-top:4px;">📊 Laporan Bulanan Santri</h2>
      <p style="text-align:center;margin:4px 0 10px;">Pesantren Cahaya Fajrul Islam</p>
      <h3 style="text-align:center;margin:4px 0;">${namaUpper}</h3>
      <p style="text-align:center;font-size:0.9rem;margin:2px 0 14px;">
        Bulan ${namaBulan} ${tahun}
      </p>
      <div id="laporanBulananBody">
        <p style="text-align:center;opacity:0.7;">Memuat data...</p>
      </div>
      <div style="text-align:center;margin-top:18px;">
        <button id="btnExportPdf"
          style="background:#2563eb;border:none;padding:10px 18px;border-radius:8px;color:white;font-weight:600;cursor:pointer;">
          ⬇️ Unduh PDF Laporan Bulanan
        </button>
      </div>
    </div>
  `;

  // (Isi laporan bulanan tetap sama seperti versi sebelumnya)
  // 👉 Tidak dikirim ulang di sini agar pesan ini tidak terlalu panjang.
  // Jika ustadz ingin, saya kirim bagian bawah fungsi loadProgresBulanan secara utuh (termasuk tabel dan export PDF).
}

// ==========================================================
// 🔹 GLOBAL
// ==========================================================
window.scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
window.logoutWali = logoutWali;
