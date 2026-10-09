export type GuideRole = 'admin' | 'doctor' | 'customer';

/** One stop of the guided tour. A step without a target is shown as a centred card. */
export interface TourStep {
  target?: string;
  title: string;
  body: string;
}

/** One task explained on the guide page. */
export interface GuideTopic {
  id: string;
  title: string;
  summary: string;
  steps: string[];
  tips?: string[];
}

export interface RoleGuide {
  title: string;
  intro: string;
  guideHref: string;
  tour: TourStep[];
  topics: GuideTopic[];
}

/** Event that asks the mounted tour of a role to start from its first step. */
export const GUIDE_START_EVENT = 'nobyderm:start-guide';

export function guideSeenKey(role: GuideRole, userId: number | string): string {
  return `nobyderm-guide:${role}:${userId}`;
}

export const GUIDES: Record<GuideRole, RoleGuide> = {
  admin: {
    title: 'Panduan Admin',
    intro:
      'Back office ini mengurus dua hal: toko online (pesanan, produk, pelanggan) dan klinik (reservasi, layanan, dokter, pasien). Menu ada di sisi kiri, dikelompokkan sesuai itu.',
    guideHref: '/admin/guide',
    tour: [
      {
        title: 'Selamat datang di Back Office',
        body: 'Tur singkat ini menunjukkan menu-menu utama. Kamu bisa melewatinya kapan saja dan mengulanginya lewat tombol "Mulai tur" di bagian Bantuan.',
      },
      {
        target: 'nav:/admin/dashboard',
        title: 'Dashboard Utama',
        body: 'Ringkasan toko dan klinik, plus peringatan yang perlu ditindak: pesanan dibayar yang belum diproses, stok menipis, dan pesanan yang kurirnya belum ditemukan.',
      },
      {
        target: 'nav:/admin/orders',
        title: 'Pesanan',
        body: 'Pusat kerja toko online. Pesanan yang sudah dibayar kamu proses di sini, lalu kurir dipesan otomatis dan status berubah sendiri sampai paket tiba.',
      },
      {
        target: 'nav:/admin/products',
        title: 'Produk & Stok',
        body: 'Tambah dan ubah produk, atur harga dan stok. Produk dengan stok menipis muncul sebagai peringatan di dashboard.',
      },
      {
        target: 'nav:/admin/bookings',
        title: 'Jadwal & Reservasi',
        body: 'Lihat janji pasien dan buat reservasi untuk pasien yang datang langsung atau menelepon.',
      },
      {
        target: 'nav:/admin/services',
        title: 'Layanan Perawatan',
        body: 'Atur treatment yang bisa dipesan: nama, harga, durasi, dan aktif atau tidaknya.',
      },
      {
        target: 'nav:/admin/doctors',
        title: 'Dokter & Terapis',
        body: 'Kelola tenaga klinik dan atur ulang password dokter bila mereka lupa.',
      },
      {
        target: 'nav:/admin/analytics',
        title: 'Penjualan & Analitik',
        body: 'Pantau performa penjualan dan unduh laporan.',
      },
      {
        target: 'guide',
        title: 'Butuh bantuan?',
        body: 'Panduan lengkap berisi langkah tiap tugas, misalnya memproses pesanan dan memesan ulang kurir. Tur ini bisa diulang dari sini kapan saja.',
      },
    ],
    topics: [
      {
        id: 'proses-pesanan',
        title: 'Memproses pesanan toko online',
        summary: 'Dari pesanan dibayar sampai paket diterima pelanggan.',
        steps: [
          'Buka menu Pesanan. Pesanan yang sudah dibayar pelanggan berstatus "Dibayar" (PAID).',
          'Buka detail pesanan, pastikan barang siap, lalu tekan Process. Sistem langsung memesan kurir lewat Biteship, jadi tidak perlu mengisi nomor resi.',
          'Tunggu status berubah sendiri: kurir ditemukan, paket diambil, dikirim, lalu sampai. Pelanggan mendapat notifikasi di setiap langkah dan melihat riwayatnya di halaman pesanan.',
          'Setelah paket sampai, pelanggan menekan "Pesanan Sudah Diterima". Kalau tidak dikonfirmasi, pesanan selesai otomatis 3 hari kemudian. Kamu juga bisa menekan Complete.',
        ],
        tips: [
          'Tekan Process hanya saat barang benar-benar siap. Kurir dipesan saat itu juga, dan Gojek atau Grab langsung berangkat menjemput.',
          'Pesanan yang belum dibayar tidak perlu diapa-apakan. Pesanan kedaluwarsa otomatis setelah 24 jam dan stoknya dikembalikan.',
        ],
      },
      {
        id: 'gojek-grab',
        title: 'Pengiriman Gojek dan Grab',
        summary: 'Statusnya berjalan otomatis dan tidak bisa diubah manual.',
        steps: [
          'Pesanan Gojek atau Grab dikirim lewat Biteship. Tombol kirim manual dan tandai terkirim tidak tersedia, karena statusnya datang dari kurir.',
          'Kalau Biteship tidak menemukan driver, pesanan tetap "Sedang Diproses" dan muncul peringatan di halaman pesanan serta dashboard.',
          'Tekan Pesan Ulang Kurir untuk mencari driver lagi. Pelanggan diberi tahu bahwa kurir sedang dicarikan.',
          'Kalau berulang kali tidak ada driver, batalkan pesanan atau hubungi pelanggan untuk memilih kurir lain.',
        ],
        tips: [
          'Gojek dan Grab hanya muncul untuk alamat yang punya pin di peta. Alamat tanpa pin hanya bisa memakai kurir reguler.',
          'Layanan Same Day Gojek dan Grab hanya bisa dipesan pukul 09.00 sampai 14.00 WIB. Di luar jam itu pelanggan tidak melihat pilihannya, dan tombol Process untuk pesanan Same Day ditolak dengan pesan penjelasan. Layanan Instant tidak dibatasi jam.',
          'Kalau pemesanan kurir ke Biteship gagal, alasannya tampil di detail pesanan. Perbaiki penyebabnya lalu tekan Pesan Ulang Kurir.',
        ],
      },
      {
        id: 'kurir-reguler',
        title: 'Pengiriman kurir reguler',
        summary: 'JNE, SiCepat, dan kurir lain.',
        steps: [
          'Kurir reguler dipesan otomatis saat kamu menekan Process, sama seperti Gojek dan Grab, dan statusnya ikut berubah lewat Biteship.',
          'Kalau pemesanan otomatis bermasalah, kamu bisa mengisi pengiriman sendiri lewat Dispatch Shipment dengan nomor resi, lalu menandai Deliver setelah paket sampai.',
        ],
      },
      {
        id: 'batal-refund',
        title: 'Pembatalan dan refund',
        summary: 'Mengembalikan stok dan dana pelanggan.',
        steps: [
          'Pelanggan hanya bisa membatalkan pesanan yang belum dibayar. Pesanan yang sudah dibayar dibatalkan oleh admin lewat tombol Cancel di detail pesanan.',
          'Membatalkan pesanan mengembalikan stok produk secara otomatis.',
          'Untuk mengembalikan dana, gunakan tombol Refund di detail pesanan. Isi alasan dan nominalnya.',
        ],
        tips: [
          'Refund lewat sistem belum tentu didukung untuk semua metode bayar, misalnya transfer bank atau virtual account. Kalau ditolak, proses pengembalian dana lewat dashboard Midtrans atau secara manual.',
          'Pesanan bertanda "perlu diperiksa" biasanya berarti ada pembayaran terlambat atau pengiriman yang dibatalkan kurir. Periksa riwayat pesanan sebelum bertindak.',
        ],
      },
      {
        id: 'produk-stok',
        title: 'Mengelola produk dan stok',
        summary: 'Katalog yang dilihat pelanggan.',
        steps: [
          'Buka Produk & Stok untuk menambah atau mengubah produk: nama, harga, berat, gambar, dan stok.',
          'Isi berat dengan benar. Ongkir dihitung dari berat paket.',
          'Kelompokkan produk lewat Kategori Produk.',
          'Nonaktifkan produk yang tidak dijual supaya tidak tampil di toko.',
        ],
        tips: ['Stok berkurang saat pesanan dibuat dan kembali bila pesanan dibatalkan atau kedaluwarsa.'],
      },
      {
        id: 'reservasi',
        title: 'Reservasi klinik dan pasien walk-in',
        summary: 'Mengatur janji pasien.',
        steps: [
          'Buka Jadwal & Reservasi untuk melihat janji pasien.',
          'Untuk pasien yang datang langsung atau menelepon, buat reservasi baru: pilih layanan, dokter, tanggal, dan jam yang masih kosong.',
          'Pilih pasien yang sudah terdaftar, atau isi nama dan nomor telepon untuk pasien baru. Kalau nomor sudah terdaftar atas nama pasien lain, pilih pasien itu dari daftar.',
        ],
      },
      {
        id: 'layanan',
        title: 'Layanan perawatan',
        summary: 'Treatment yang bisa dipesan pasien.',
        steps: [
          'Buka Layanan Perawatan lalu tambah layanan baru. Kode dibuat otomatis.',
          'Ubah harga, durasi, dan deskripsi kapan saja.',
          'Nonaktifkan layanan agar tidak bisa dipesan lagi tanpa menghapus riwayatnya.',
        ],
        tips: ['Layanan yang pernah dipesan tidak bisa dihapus. Nonaktifkan saja.'],
      },
      {
        id: 'dokter-pasien',
        title: 'Dokter, terapis, dan data pasien',
        summary: 'Tenaga klinik dan rekam pasien.',
        steps: [
          'Buka Dokter & Terapis untuk mengelola tenaga klinik, termasuk status aktif atau tidaknya.',
          'Kalau dokter lupa password, atur ulang dari halaman dokter itu.',
          'Buka Data Pasien untuk melihat profil kesehatan dan rekam medis pasien.',
        ],
        tips: ['Data pasien bersifat rahasia. Buka hanya bila diperlukan.'],
      },
      {
        id: 'laporan',
        title: 'Laporan penjualan',
        summary: 'Melihat performa toko.',
        steps: ['Buka Penjualan & Analitik untuk melihat ringkasan dan grafik.', 'Gunakan tombol unduh untuk mengambil laporan.'],
      },
    ],
  },

  doctor: {
    title: 'Panduan Dokter',
    intro: 'Portal ini membantu kamu melihat antrean pasien, memperbarui status janji, dan mengisi catatan medis.',
    guideHref: '/doctor/guide',
    tour: [
      {
        title: 'Selamat datang di Portal Dokter',
        body: 'Tur singkat ini menunjukkan tiga menu utama. Kamu bisa melewatinya dan mengulanginya lewat tombol "Mulai tur" di bagian Bantuan.',
      },
      {
        target: 'nav:/doctor/dashboard',
        title: 'Ringkasan Hari Ini',
        body: 'Antrean, jadwal, dan pasien hari ini dalam satu layar. Mulai hari kerja dari sini.',
      },
      {
        target: 'nav:/doctor/appointments',
        title: 'Jadwal & Antrean',
        body: 'Cari janji pasien, buka detailnya, perbarui status, dan isi catatan konsultasi.',
      },
      {
        target: 'nav:/doctor/patients',
        title: 'Data & Rekam Medis',
        body: 'Cari pasien dan lihat profil kesehatan serta catatan sebelumnya. Cek alergi sebelum melakukan tindakan.',
      },
      {
        target: 'guide',
        title: 'Butuh bantuan?',
        body: 'Panduan lengkap menjelaskan langkah tiap tugas. Tur ini bisa diulang dari sini kapan saja.',
      },
    ],
    topics: [
      {
        id: 'hari-kerja',
        title: 'Memulai hari kerja',
        summary: 'Melihat antrean dan jadwal hari ini.',
        steps: [
          'Buka Ringkasan Hari Ini untuk melihat janji yang menunggu dan pasien yang terjadwal.',
          'Buka Jadwal & Antrean untuk mencari janji pasien lainnya.',
        ],
      },
      {
        id: 'status-janji',
        title: 'Memperbarui status janji',
        summary: 'Mengikuti perjalanan pasien dari datang sampai selesai.',
        steps: [
          'Buka janji dari Jadwal & Antrean.',
          'Di kolom "Status Saat Ini", ubah status mengikuti alur: Terkonfirmasi, Check-in Pasien (pasien sudah tiba), Sedang Berjalan (konsultasi dimulai), lalu Konsultasi Selesai.',
          'Pilih Dibatalkan hanya bila janji memang batal. Setiap perubahan tercatat di riwayat status.',
        ],
        tips: ['Janji yang dibatalkan membebaskan jamnya sehingga bisa dipesan pasien lain.'],
      },
      {
        id: 'catatan-medis',
        title: 'Mengisi catatan konsultasi',
        summary: 'Rekam medis dan tindakan dokter.',
        steps: [
          'Di detail janji, isi bagian "Rekam Medis & Tindakan Dokter": temuan, diagnosis, dan tindakan atau resep.',
          'Tekan simpan. Pesan konfirmasi muncul setelah tersimpan.',
          'Setelah status janji diubah ke Konsultasi Selesai, diagnosis, catatan, rencana perawatan, dan resep dapat dilihat pasien di menu Rekam medis pada akun mereka.',
        ],
        tips: [
          'Selesaikan status janji setelah catatan terisi. Sebelum itu pasien belum bisa melihat hasilnya.',
          'Tulis dengan jelas dan sopan, karena catatan ini bisa dibaca pasien.',
        ],
      },
      {
        id: 'konsultasi-online',
        title: 'Konsultasi online',
        summary: 'Janji yang dilakukan jarak jauh.',
        steps: [
          'Janji konsultasi online ditandai dengan banner khusus di detail janji.',
          'Hubungi pasien lewat cara yang tertera di banner itu pada jam yang dipesan.',
        ],
      },
      {
        id: 'data-pasien',
        title: 'Melihat data dan rekam medis pasien',
        summary: 'Profil kesehatan dan riwayat.',
        steps: [
          'Buka Data & Rekam Medis lalu cari nama atau nomor telepon pasien.',
          'Periksa alergi dan riwayat medis, yang diisi pasien sendiri di profil kesehatannya.',
          'Perbarui catatan medis pasien bila ada informasi baru dari konsultasi.',
        ],
        tips: ['Data pasien bersifat rahasia. Jangan dibagikan di luar kebutuhan perawatan.'],
      },
    ],
  },

  customer: {
    title: 'Panduan Pelanggan',
    intro: 'Panduan singkat untuk berbelanja, melacak paket, dan membuat janji di klinik NOBYDERM.',
    guideHref: '/account/guide',
    tour: [
      {
        title: 'Selamat datang di NOBYDERM',
        body: 'Tur singkat ini menunjukkan di mana kamu bisa mengecek notifikasi, keranjang, pesanan, dan reservasi. Bisa dilewati dan diulang lewat menu akun.',
      },
      {
        target: 'notifications',
        title: 'Notifikasi',
        body: 'Kabar pembayaran dan pengiriman pesananmu muncul di lonceng ini. Klik untuk membuka pesanan terkait.',
      },
      {
        target: 'cart',
        title: 'Keranjang belanja',
        body: 'Produk yang kamu pilih terkumpul di sini. Dari keranjang kamu lanjut ke checkout untuk memilih alamat dan kurir.',
      },
      {
        target: 'nav-booking',
        title: 'Reservasi klinik',
        body: 'Pilih layanan perawatan, dokter, tanggal, dan jam untuk membuat janji di klinik.',
      },
      {
        target: 'user-menu',
        title: 'Menu akun',
        body: 'Di sini ada alamat pengiriman, pesananmu, jadwal konsultasi, rekam medis, profil, dan Panduan ini.',
      },
    ],
    topics: [
      {
        id: 'belanja',
        title: 'Cara berbelanja',
        summary: 'Dari memilih produk sampai membayar.',
        steps: [
          'Pilih produk lalu tambahkan ke keranjang.',
          'Buka keranjang dan lanjut ke checkout.',
          'Pilih atau tambah alamat pengiriman, lalu pilih kurir dan layanan yang tersedia.',
          'Buat pesanan, lalu tekan "Bayar Sekarang" di halaman pesanan dan selesaikan pembayaran di popup Midtrans.',
        ],
        tips: ['Pesanan yang belum dibayar kedaluwarsa dalam 24 jam, dan kamu bisa membatalkannya sendiri sebelum dibayar.'],
      },
      {
        id: 'alamat-pin',
        title: 'Alamat dan pin lokasi',
        summary: 'Agar ongkir benar dan Gojek atau Grab bisa dipilih.',
        steps: [
          'Isi alamat jalan, kecamatan, dan kota. Peta akan menaruh pin otomatis di lokasi itu.',
          'Geser pin atau ketuk peta bila posisinya kurang tepat. Kamu juga bisa memakai "Gunakan lokasi saya".',
          'Pilih kecamatan dari kolom pencarian supaya ongkir lebih akurat.',
        ],
        tips: ['Tanpa pin, hanya kurir reguler yang bisa dipilih. Gojek dan Grab membutuhkan pin yang tepat di rumahmu.'],
      },
      {
        id: 'lacak',
        title: 'Melacak pesanan',
        summary: 'Mengetahui posisi paketmu.',
        steps: [
          'Buka Akun, lalu My Orders, dan pilih pesananmu.',
          'Lihat Riwayat Pengiriman untuk langkah-langkah terbaru: kurir ditemukan, menuju toko, diambil, menuju alamatmu, sampai.',
          'Perhatikan lonceng di bagian atas. Setiap perubahan status mengirim notifikasi.',
        ],
        tips: ['Kalau kurir instan belum menemukan driver, kami mencarikan kurir baru dan memberi tahumu di riwayat pengiriman.'],
      },
      {
        id: 'diterima',
        title: 'Mengonfirmasi pesanan diterima',
        summary: 'Menyelesaikan pesananmu.',
        steps: [
          'Setelah paket sampai, buka detail pesanan.',
          'Tekan "Pesanan Sudah Diterima" bila paket sesuai.',
          'Kalau ada masalah dengan paketmu, hubungi toko sebelum mengonfirmasi.',
        ],
        tips: ['Tanpa konfirmasi, pesanan selesai otomatis beberapa hari setelah paket tiba.'],
      },
      {
        id: 'reservasi',
        title: 'Membuat janji di klinik',
        summary: 'Reservasi perawatan.',
        steps: [
          'Buka Booking, lalu pilih layanan perawatan.',
          'Pilih dokter, tanggal, dan jam yang masih tersedia, lalu isi data dan keluhanmu.',
          'Lihat dan batalkan janji di menu Jadwal konsultasi bila perlu.',
        ],
        tips: ['Pembatalan hanya bisa dilakukan sebelum check-in.'],
      },
      {
        id: 'profil-kesehatan',
        title: 'Profil kesehatan',
        summary: 'Informasi medis untuk dokter.',
        steps: [
          'Buka Profil saya lalu tekan Edit di kartu Profil kesehatan.',
          'Isi tanggal lahir, alergi, riwayat medis, dan kontak darurat.',
          'Simpan. Dokter dapat melihat informasi ini untuk menyiapkan perawatan yang aman.',
        ],
      },
    ],
  },
};
