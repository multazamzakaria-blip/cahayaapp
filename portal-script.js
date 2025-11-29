// === Ambil Data Petugas (Admin, Guru, Naqib) ===
const petugas = [
  // === GURU ===
  { username: "multazam", password: "guru123", role: "guru", label: "Abah Multazam Zakaria" },
  { username: "alvin", password: "guru123", role: "guru", label: "Mu'allim Alvin Dwianto" },
  { username: "alzam", password: "guru123", role: "guru", label: "Mu'alim Alzam Abdullah" },
  { username: "haidar", password: "guru123", role: "guru", label: "Mu'allim Haidar" },
  { username: "faiq", password: "guru123", role: "guru", label: "Mu'allim Faiq" },
  { username: "shafwan", password: "guru123", role: "guru", label: "Mu'allim Shafwan" },
  { username: "favian", password: "guru123", role: "guru", label: "Mu'allim Favian" },
  { username: "khaizuran", password: "guru123", role: "guru", label: "Mu'allim Khaizuran" },
  { username: "mulia", password: "guru123", role: "guru", label: "Mu'allim Mulia" },
  { username: "fahmi", password: "guru123", role: "guru", label: "Mu'allim Fahmi" },
  { username: "meilisa", password: "guru123", role: "guru", label: "Mu'allimah Meilisa" },
  { username: "fatimah", password: "guru123", role: "guru", label: "Mu'allimah Fatimah" },
  { username: "kamal", password: "guru123", role: "guru", label: "Mu'allim Kamal" },
  { username: "evita", password: "guru123", role: "guru", label: "Mrs Evita" },

  // === NAQIB & NAQIBAH ===
  { username: "dimas", password: "dimas123", role: "naqib", label: "Naqib Dimas Bayu Aditya", naqibName: "Dimas" },
  { username: "regen", password: "regen123", role: "naqib", label: "Naqib Regen Prayitno", naqibName: "Regen" },
  { username: "favian", password: "favian123", role: "naqib", label: "Naqib Favian", naqibName: "Favian" },
  { username: "shafwan", password: "shafwan123", role: "naqib", label: "Naqib Shafwan", naqibName: "Shafwan" },
  { username: "kamal", password: "kamal123", role: "naqib", label: "Naqib Kamal", naqibName: "Kamal" },
  { username: "evita", password: "evita123", role: "naqib", label: "Naqibah Evita", naqibName: "Evita" },
  { username: "fatimah", password: "fatimah123", role: "naqib", label: "Naqibah Fatimah", naqibName: "Fatimah" },

  // === ADMIN ===
  { username: "admin", password: "cahaya2026", role: "admin", label: "Admin Pesantren" }
];

// === Ambil Data Wali Santri ===
const waliList = [
  {nama:"Ahmad Maulana",username:"ahmad312",password:"Cahaya@8723"},
  {nama:"Juanda Nur Ilham",username:"juanda491",password:"Cahaya@1049"},
  {nama:"Najmihadi Syauqii Tamaam",username:"najmi827",password:"Cahaya@7721"},
  // ... dst (semua 123 wali tetap bisa disimpan di file eksternal jika terlalu panjang)
];

// === Gabungkan Semua ===
const allUsers = [
  ...petugas,
  ...waliList.map(w => ({
    username: w.username,
    password: w.password,
    role: "wali",
    namaAnak: w.nama
  }))
];

// === Auto Login jika sudah pernah login ===
const current = JSON.parse(localStorage.getItem("cahayaCurrentUser"));
if (current) redirectUser(current.role);

// === Fungsi Login ===
function login() {
  const u = document.getElementById("username").value.trim().toLowerCase();
  const p = document.getElementById("password").value.trim();

  const found = allUsers.find(a => a.username.toLowerCase() === u && a.password === p);
  if (!found) {
    alert("❌ Username atau password salah.");
    return;
  }

  localStorage.setItem("cahayaCurrentUser", JSON.stringify(found));
  redirectUser(found.role);
}

// === Redirect ke Dashboard Sesuai Role ===
function redirectUser(role) {
  switch (role) {
    case "admin":
      location.href = "admin/index.html";
      break;
    case "guru":
      location.href = "guru/fitur.html";
      break;
    case "naqib":
      location.href = "naqib/dashboard.html";
      break;
    case "wali":
      location.href = "wali/wali-dashboard.html";
      break;
    default:
      alert("Peran tidak dikenali.");
  }
}
