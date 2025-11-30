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

    try {
    const [
      assesGuruSnap,
      assesNaqibSnap,
      absNaqibSnap,
      absKbmSnap,
      ujianSnap,
      tahfizSnap,
      pelanggaranSnap
    ] = await Promise.all([
      get(child(ref(db), "cahaya_app/assesment_cahaya_santri")),
      get(child(ref(db), "cahaya_app/assesment_cahaya_naqib")),
      get(child(ref(db), "cahaya_app/absensi_program_harian")),
      get(child(ref(db), "cahaya_app/absensi_pembelajaran")),
      get(child(ref(db), "cahaya_app/nilai_ujian")),
      get(child(ref(db), "cahaya_app/setoran_tahfiz")),
      get(child(ref(db), "cahaya_app/pelanggaran_santri"))
    ]);

    const assesmentGuru = assesGuruSnap.exists() ? Object.values(assesGuruSnap.val()) : [];
    const assesmentNaqib = assesNaqibSnap.exists() ? Object.values(assesNaqibSnap.val()) : [];
    const absensiNaqib = absNaqibSnap.exists() ? Object.values(absNaqibSnap.val()) : [];
    const absensiKbm = absKbmSnap.exists() ? Object.values(absKbmSnap.val()) : [];
    const ujian = ujianSnap.exists() ? Object.values(ujianSnap.val()) : [];
    const tahfiz = tahfizSnap.exists() ? Object.values(tahfizSnap.val()) : [];
    const pelanggaranAll = pelanggaranSnap.exists() ? Object.values(pelanggaranSnap.val()) : [];

    // === ASESMENT GURU & NAQIB ===
    const asesGuru =
      assesmentGuru.filter(a =>
        a.namaSantri === namaSantri &&
        isSameMonthYear(a.tgl || a.tanggal, bulanIdx, tahun)
      ).at(-1) || {};

    const asesNaqib =
      assesmentNaqib.filter(a =>
        a.namaSantri === namaSantri &&
        isSameMonthYear(a.tgl || a.tanggal || a.tanggalAsesmen, bulanIdx, tahun)
      ).at(-1) || {};

    const narasiSpiritual = asesGuru.narasiSpiritual || asesGuru.catatanSpiritual ||
      "Belum ada catatan asesmen Cinta Allah (Spiritual) bulan ini.";
    const narasiIntellectual = asesGuru.narasiIntellectual || asesGuru.catatanAkal ||
      "Belum ada catatan asesmen Akal Cerdas (Intellectual) bulan ini.";
    const narasiRel = asesNaqib.narasiRelational || asesNaqib.catatanRelasi ||
      "Belum ada catatan Akhlak Mulia (Relational) bulan ini.";
    const narasiEmo = asesNaqib.narasiEmotional || asesNaqib.catatanHati ||
      "Belum ada catatan Hati Bersih (Emotional) bulan ini.";
    const narasiFis = asesNaqib.narasiPhysical || asesNaqib.catatanFisik ||
      "Belum ada catatan Fisik Berdaya (Physical) bulan ini.";
    const namaNaqib = asesNaqib.naqibName || asesNaqib.namaNaqib || "-";

    // === REKAP KEHADIRAN ===
    const hadirArr = hitungKehadiranGabungan(namaUpper, bulanIdx, tahun, absensiNaqib, absensiKbm);
    const htmlKehadiran = hadirArr.length ? `
      <table style="width:100%;border-collapse:collapse;margin-top:6px;font-size:0.8rem;">
        <thead><tr style="background:#f3f4f6;">
          <th>No</th><th>Program</th><th>Hadir</th><th>Izin</th><th>Sakit</th><th>Alfa</th>
        </tr></thead>
        <tbody>${hadirArr.map(r=>`
          <tr>
            <td>${r.no}</td><td>${r.program}</td>
            <td style="color:#16a34a;">${r.hadir}%</td>
            <td style="color:#0ea5e9;">${r.izin}%</td>
            <td style="color:#eab308;">${r.sakit}%</td>
            <td style="color:#dc2626;">${r.alfa}%</td>
          </tr>`).join("")}
        </tbody>
      </table>` :
      `<p style="opacity:0.8;">Belum ada data kehadiran bulan ini.</p>`;

    // === NILAI UJIAN ===
    const nilaiUjian = ujian.filter(u =>
      (u.santri || "").trim() === namaSantri &&
      isSameMonthYear(u.tanggal, bulanIdx, tahun)
    );
    const rataUjian = nilaiUjian.length ?
      Math.round(nilaiUjian.reduce((s, u) => s + (+u.nilai || 0), 0) / nilaiUjian.length) : 0;

    const htmlUjian = nilaiUjian.length ? `
      <table style="width:100%;border-collapse:collapse;margin-top:6px;font-size:0.8rem;">
        <thead><tr style="background:#f3f4f6;">
          <th>No</th><th>Mata Pelajaran</th><th>Materi</th><th>Nilai</th><th>Keterangan</th>
        </tr></thead>
        <tbody>
          ${nilaiUjian.map((u,i)=>`
            <tr>
              <td>${i+1}</td><td>${u.mapel||"-"}</td><td>${u.materi||"-"}</td>
              <td>${u.nilai||"-"}</td>
              <td>${u.nilai>=75?"✅ Tuntas":"❌ Belum Tuntas"}</td>
            </tr>`).join("")}
          <tr style="background:#f9fafb;font-weight:600;">
            <td colspan="3">Rata-rata</td><td colspan="2">${rataUjian}</td>
          </tr>
        </tbody>
      </table>` :
      `<p style="opacity:0.8;">Belum ada data nilai ujian bulan ini.</p>`;

    // === TAHFIZ ===
    const dataTahfiz = tahfiz.filter(t=>isSameMonthYear(t.tanggal,bulanIdx,tahun))
      .flatMap(t=>t.data||[]).filter(d=>(d.nama||"").trim()===namaSantri);
    const htmlTahfiz = dataTahfiz.length ? `
      <table style="width:100%;border-collapse:collapse;margin-top:6px;font-size:0.8rem;">
        <thead><tr style="background:#f3f4f6;">
          <th>No</th><th>Setoran</th><th>Jumlah/Kesalahan</th><th>Nilai</th><th>Keterangan</th>
        </tr></thead>
        <tbody>${dataTahfiz.map((d,i)=>`
          <tr>
            <td>${i+1}</td>
            <td>${d.surat||d.setoran||"-"}</td>
            <td>${(d.ayat?d.ayat+" ayat; ":"")+(d.kesalahan||"-")}</td>
            <td>${d.nilai||"-"}</td>
            <td>${d.keterangan||"-"}</td>
          </tr>`).join("")}
        </tbody>
      </table>` :
      `<p style="opacity:0.8;">Belum ada setoran tahfiz bulan ini.</p>`;

    // === PELANGGARAN ===
    const pelanggaran = pelanggaranAll.filter(p =>
      (p.santri || "").trim() === namaSantri &&
      isSameMonthYear(p.tanggal, bulanIdx, tahun)
    );
    const htmlPelanggaran = pelanggaran.length ? `
      <table style="width:100%;border-collapse:collapse;margin-top:6px;font-size:0.8rem;">
        <thead><tr style="background:#f3f4f6;">
          <th>No</th><th>Tanggal</th><th>Nama Pelanggaran</th>
          <th>Kategori</th><th>Keterangan</th><th>Tindak Lanjut</th><th>Konsekuensi</th>
        </tr></thead>
        <tbody>${pelanggaran.map((p,i)=>`
          <tr>
            <td>${i+1}</td>
            <td>${p.tanggal||"-"}</td>
            <td>${p.namaPelanggaran||"-"}</td>
            <td>${p.kategori||"-"}</td>
            <td>${p.keterangan||"-"}</td>
            <td>${p.tindakLanjut||"-"}</td>
            <td>${p.konsekuensi||"-"}</td>
          </tr>`).join("")}
        </tbody>
      </table>` :
      `<p style="opacity:0.8;">Tidak ada pelanggaran bulan ini.</p>`;

    // === SUSUN SEMUA KE DALAM BODY ===
    const bodyDiv = document.getElementById("laporanBulananBody");
    bodyDiv.innerHTML = `
      <section>
        <h4 style="color:#0f766e;">🌈 Dimensi CAHAYA</h4>
        <p><b>🕋 Cinta Allah (Spiritual):</b><br>${narasiSpiritual}</p>
        <p><b>🤝 Akhlak Mulia (Relational):</b><br>${narasiRel}</p>
        <p><b>💓 Hati Bersih (Emotional):</b><br>${narasiEmo}</p>
        <p><b>🧠 Akal Cerdas (Intellectual):</b><br>${narasiIntellectual}</p>
        <p><b>🏃‍♂️ Fisik Berdaya (Physical):</b><br>${narasiFis}</p>
        <p style="opacity:0.8;">Catatan Naqib: <b>${namaNaqib}</b></p>
      </section>

      <section><h4 style="color:#0f766e;">🗓️ Rekap Kehadiran Bulanan</h4>${htmlKehadiran}</section>
      <section><h4 style="color:#0f766e;">🧾 Rekap Nilai Ujian</h4>${htmlUjian}</section>
      <section><h4 style="color:#0f766e;">📖 Rekap Setoran Tahfiz</h4>${htmlTahfiz}</section>
      <section><h4 style="color:#0f766e;">⚠️ Rekap Pelanggaran</h4>${htmlPelanggaran}</section>
    `;

    // === EXPORT PDF ===
    const btnExport = document.getElementById("btnExportPdf");
    btnExport.onclick = async () => {
      const card = document.getElementById("laporanBulananCard");
      if (!card) return;
      const canvas = await window.html2canvas(card, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new window.jspdf.jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
      const cleanName = namaUpper.replace(/\s+/g, "_");
      pdf.save(`Laporan_${cleanName}_${namaBulan}_${tahun}.pdf`);
    };

  } catch (err) {
    document.getElementById("laporanBulananBody").innerHTML =
      `<p style="color:#b91c1c;">❌ Gagal memuat laporan: ${err.message}</p>`;
  }


// ==========================================================
// 🔹 GLOBAL
// ==========================================================
window.scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
window.logoutWali = logoutWali;
