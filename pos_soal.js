"use strict";

/**
 * KODAMART POS — JavaScript Fundamentals Challenge
 * Jalankan: node pos.js
 *
 * Bagian yang sudah jadi: katalog, tambah/lihat keranjang,
 * checkout tunai, pengurangan stok, dan struk.
 *
 * Bagian bertanda TODO adalah tugas untuk talent.
 * Tidak memerlukan HTML, CSS, database, atau npm install.
 */

const readline = require("node:readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// ==================== DATA AWAL ====================

const daftarProduk = [
  {
    id: "P001",
    nama: "Air Mineral",
    kategori: "Minuman",
    harga: 4000,
    stok: 20,
  },
  {
    id: "P002",
    nama: "Roti Cokelat",
    kategori: "Makanan",
    harga: 7500,
    stok: 15,
  },
  { id: "P003", nama: "Susu UHT", kategori: "Minuman", harga: 9000, stok: 10 },
  { id: "P004", nama: "Mi Instan", kategori: "Makanan", harga: 3500, stok: 30 },
  {
    id: "P005",
    nama: "Kopi Sachet",
    kategori: "Minuman",
    harga: 2500,
    stok: 25,
  },
  {
    id: "P006",
    nama: "Sabun Mandi",
    kategori: "Kebutuhan",
    harga: 6500,
    stok: 12,
  },
];

let keranjang = []; // Contoh: [{ idProduk: "P001", qty: 2 }]
const riwayatTransaksi = [];
let kodeVoucher = null;

// ==================== HELPER ====================

function tanya(pertanyaan) {
  // rl.question menggunakan callback, lalu kita bungkus menjadi Promise
  // supaya bisa digunakan dengan await.
  return new Promise((resolve) => {
    rl.question(pertanyaan, (jawaban) => resolve(jawaban.trim()));
  });
}

function rupiah(angka) {
  return `Rp${angka.toLocaleString("id-ID")}`;
}

function cariProdukById(id) {
  return daftarProduk.find((produk) => produk.id === id.toUpperCase());
}

function hitungSubtotal() {
  return keranjang.reduce((jumlah, item) => {
    const produk = cariProdukById(item.idProduk);
    return jumlah + produk.harga * item.qty;
  }, 0);
}

// ==================== FITUR YANG SUDAH JADI ====================

function tampilkanKatalog() {
  console.log("\n=== KATALOG KODAMART ===");

  for (const produk of daftarProduk) {
    const { id, nama, kategori, harga, stok } = produk; // Destructuring object
    console.log(
      `${id} | ${nama} (${kategori}) | ${rupiah(harga)} | Stok: ${stok}`,
    );
  }
}

async function tambahKeKeranjang() {
  tampilkanKatalog();

  const id = (await tanya("\nMasukkan ID produk: ")).toUpperCase();
  const produk = cariProdukById(id);

  if (!produk) {
    console.log("Produk tidak ditemukan.");
    return;
  }

  const qty = Number(await tanya("Masukkan jumlah: "));
  if (!Number.isInteger(qty) || qty <= 0) {
    console.log("Jumlah harus berupa bilangan bulat lebih dari 0.");
    return;
  }

  const itemAda = keranjang.find((item) => item.idProduk === id);
  const qtyDalamKeranjang = itemAda ? itemAda.qty : 0;

  if (qtyDalamKeranjang + qty > produk.stok) {
    console.log(
      `Stok tidak cukup. Maksimal yang masih bisa ditambah: ${produk.stok - qtyDalamKeranjang}.`,
    );
    return;
  }

  if (itemAda) {
    itemAda.qty += qty;
  } else {
    keranjang.push({ idProduk: id, qty });
  }

  console.log(`${qty} x ${produk.nama} berhasil ditambahkan.`);
}

function tampilkanKeranjang() {
  console.log("\n=== KERANJANG BELANJA ===");

  if (keranjang.length === 0) {
    console.log("Keranjang masih kosong.");
    return;
  }

  keranjang.forEach((item, index) => {
    const produk = cariProdukById(item.idProduk);
    const totalItem = produk.harga * item.qty;
    console.log(
      `${index + 1}. ${produk.nama} | ${item.qty} x ${rupiah(produk.harga)} = ${rupiah(totalItem)}`,
    );
  });

  console.log(`Subtotal: ${rupiah(hitungSubtotal())}`);
}

function hitungDiskon(subtotal) {
  // TODO 3: Jika voucher HEMAT10 aktif, diskon 10% dari subtotal.
  // Gunakan Math.floor agar hasilnya bilangan bulat.
  // Untuk sementara tidak ada diskon sehingga checkout tetap berjalan.
  return 0;
}

function simpanTransaksi({ subtotal, diskon, total, dibayar, metode }) {
  // Map + destructuring + spread operator: menyimpan snapshot barang yang dibeli.
  const items = keranjang.map(({ idProduk, qty }) => {
    const { id, nama, harga } = cariProdukById(idProduk);
    return { id, nama, harga, qty, totalItem: harga * qty };
  });

  const transaksi = {
    nomor: `TRX${String(riwayatTransaksi.length + 1).padStart(3, "0")}`,
    tanggal: new Date().toLocaleString("id-ID"),
    items: items.map((item) => ({ ...item })),
    subtotal,
    diskon,
    total,
    dibayar,
    kembalian: dibayar - total,
    metode,
  };

  for (const item of keranjang) {
    const produk = cariProdukById(item.idProduk);
    produk.stok -= item.qty;
  }

  riwayatTransaksi.push(transaksi);
  keranjang = [];
  kodeVoucher = null;
  return transaksi;
}

function cetakStruk(transaksi) {
  console.log("\n========== STRUK KODAMART ==========");
  console.log(`Nomor   : ${transaksi.nomor}`);
  console.log(`Tanggal : ${transaksi.tanggal}`);

  for (const item of transaksi.items) {
    console.log(
      `${item.nama} - ${item.qty} x ${rupiah(item.harga)} = ${rupiah(item.totalItem)}`,
    );
  }

  console.log("------------------------------------");
  console.log(`Subtotal : ${rupiah(transaksi.subtotal)}`);
  console.log(`Diskon   : ${rupiah(transaksi.diskon)}`);
  console.log(`Total    : ${rupiah(transaksi.total)}`);
  console.log(`Metode   : ${transaksi.metode}`);
  console.log(`Bayar    : ${rupiah(transaksi.dibayar)}`);
  console.log(`Kembali  : ${rupiah(transaksi.kembalian)}`);
  console.log("====================================");
}

function jalankanCallbackTransaksi(transaksi, callback) {
  // Contoh callback sinkron: function dikirim sebagai argumen.
  callback(transaksi);
}

async function checkoutTunai() {
  if (keranjang.length === 0) {
    console.log("Keranjang kosong. Tambahkan produk lebih dahulu.");
    return;
  }

  tampilkanKeranjang();
  const subtotal = hitungSubtotal();
  const diskon = hitungDiskon(subtotal);
  const total = subtotal - diskon;
  console.log(`Total pembayaran: ${rupiah(total)}`);

  const dibayar = Number(await tanya("Uang tunai yang diterima: "));
  if (!Number.isInteger(dibayar) || dibayar < total) {
    console.log("Pembayaran gagal: jumlah uang tidak valid atau kurang.");
    return;
  }

  const transaksi = simpanTransaksi({
    subtotal,
    diskon,
    total,
    dibayar,
    metode: "Tunai",
  });

  jalankanCallbackTransaksi(transaksi, cetakStruk);
  // TODO 4: Tambahkan callback lain untuk menampilkan pesan terima kasih.
}

// ==================== FITUR YANG HARUS DIKERJAKAN ====================

async function cariProdukByNama() {
  // TODO 1 (filter/includes/toLowerCase):
  // Minta kata kunci, lalu tampilkan semua produk yang namanya cocok.
  console.log("[TODO 1] Fitur cari produk belum dibuat.");
}

async function hapusDariKeranjang() {
  // TODO 2 (findIndex/splice):
  // Minta ID produk, hapus produknya dari keranjang jika ada.
  console.log("[TODO 2] Fitur hapus dari keranjang belum dibuat.");
}

async function pasangVoucher() {
  // TODO 3 (if/else + function):
  // Minta kode voucher. Hanya HEMAT10 yang valid.
  // Jika valid, simpan pada variabel kodeVoucher.
  // Lengkapi juga function hitungDiskon() di atas.
  console.log("[TODO 3] Fitur voucher belum dibuat.");
}

async function checkoutDigital() {
  // TODO 5 (Promise + async/await + try/catch):
  // Simulasikan pembayaran digital menggunakan Promise dan setTimeout.
  // Jika berhasil, panggil simpanTransaksi() dan cetakStruk().
  // Jika gagal, keranjang dan stok tidak boleh berubah.
  console.log("[TODO 5] Fitur pembayaran digital belum dibuat.");
}

async function tampilkanPelangganOnline() {
  // TODO 6 (fetch + async/await):
  // Ambil daftar user dari https://jsonplaceholder.typicode.com/users
  // Tampilkan id, name, dan email. Gunakan try/catch.
  console.log("[TODO 6] Fitur Fetch API belum dibuat.");
}

function laporanPenjualan() {
  // TODO 7 (reduce + array/object):
  // Tampilkan jumlah transaksi, total omzet, dan total produk terjual.
  // Sumber datanya: riwayatTransaksi.
  console.log("[TODO 7] Fitur laporan penjualan belum dibuat.");
}

// ==================== PROGRAM UTAMA ====================

function tampilkanMenu() {
  console.log("\n========= KODAMART POS =========");
  console.log("1. Lihat katalog produk");
  console.log("2. Tambah produk ke keranjang");
  console.log("3. Lihat keranjang");
  console.log("4. Checkout tunai");
  console.log("5. Cari produk [TODO 1]");
  console.log("6. Hapus produk dari keranjang [TODO 2]");
  console.log("7. Pasang voucher [TODO 3]");
  console.log("8. Checkout digital [TODO 5]");
  console.log("9. Ambil pelanggan via Fetch API [TODO 6]");
  console.log("10. Laporan penjualan [TODO 7]");
  console.log("0. Keluar");
}

async function main() {
  console.log("Selamat datang di KodaMart POS!");

  let berjalan = true;
  while (berjalan) {
    tampilkanMenu();
    const pilihan = await tanya("Pilih menu: ");

    switch (pilihan) {
      case "1":
        tampilkanKatalog();
        break;
      case "2":
        await tambahKeKeranjang();
        break;
      case "3":
        tampilkanKeranjang();
        break;
      case "4":
        await checkoutTunai();
        break;
      case "5":
        await cariProdukByNama();
        break;
      case "6":
        await hapusDariKeranjang();
        break;
      case "7":
        await pasangVoucher();
        break;
      case "8":
        await checkoutDigital();
        break;
      case "9":
        await tampilkanPelangganOnline();
        break;
      case "10":
        laporanPenjualan();
        break;
      case "0":
        berjalan = false;
        console.log("Terima kasih sudah menggunakan KodaMart POS!");
        break;
      default:
        console.log("Menu tidak tersedia. Coba lagi.");
    }
  }

  rl.close();
}

main().catch((error) => {
  console.error("Terjadi kesalahan:", error.message);
  rl.close();
  process.exitCode = 1;
});
