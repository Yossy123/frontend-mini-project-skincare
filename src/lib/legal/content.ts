import { LEGAL, contactLines, legalName } from './config';

export type LegalBlock = string | { list: string[] };

export interface LegalSection {
  id: string;
  title: string;
  body: LegalBlock[];
}

export interface LegalDocument {
  title: string;
  summary: string;
  sections: LegalSection[];
}

export type LegalDocumentKey = 'privacy' | 'terms' | 'refund';

export const LEGAL_PATHS: Record<LegalDocumentKey, string> = {
  privacy: '/kebijakan-privasi',
  terms: '/syarat-ketentuan',
  refund: '/kebijakan-refund',
};

const contactSection = (): LegalSection => ({
  id: 'kontak',
  title: 'Kontak',
  body: [`Pertanyaan atau permintaan terkait dokumen ini dapat disampaikan ke ${legalName()}:`, { list: contactLines() }],
});

export const LEGAL_DOCUMENTS: Record<LegalDocumentKey, LegalDocument> = {
  privacy: {
    title: 'Kebijakan Privasi',
    summary: `Penjelasan tentang data pribadi yang dikumpulkan ${LEGAL.brand}, untuk apa dipakai, dengan siapa dibagikan, dan hak kamu atas data tersebut.`,
    sections: [
      {
        id: 'ruang-lingkup',
        title: 'Ruang lingkup',
        body: [
          `Kebijakan ini berlaku untuk situs dan layanan ${LEGAL.brand} yang dikelola ${legalName()}: toko online produk perawatan kulit dan reservasi layanan klinik. Dengan membuat akun atau menggunakan layanan kami, kamu menyetujui pengolahan data seperti yang dijelaskan di sini.`,
        ],
      },
      {
        id: 'data-yang-dikumpulkan',
        title: 'Data yang kami kumpulkan',
        body: [
          {
            list: [
              'Data akun: nama, alamat email, nomor telepon, dan kata sandi (disimpan dalam bentuk terenkripsi, bukan teks asli).',
              'Alamat pengiriman: nama penerima, nomor telepon, alamat lengkap, dan titik lokasi pada peta bila kamu memasangnya.',
              'Pesanan dan pembayaran: produk yang dibeli, jumlah, total, ongkos kirim, status, metode pembayaran, dan nomor transaksi. Kami tidak menyimpan nomor kartu lengkap atau PIN kamu; pembayaran diproses oleh penyedia pembayaran.',
              'Reservasi klinik: layanan, dokter, tanggal dan jam, keluhan, serta foto yang kamu unggah (bila ada).',
              'Profil kesehatan dan rekam medis: tanggal lahir, jenis kelamin, alamat, alergi, riwayat medis, kontak darurat, serta catatan, diagnosis, rencana perawatan, dan resep dari dokter. Ini adalah data kesehatan yang bersifat sensitif.',
              'Data teknis: alamat IP, jenis perangkat dan peramban, serta catatan aktivitas server untuk keamanan dan perbaikan masalah.',
              'Penyimpanan di peramban: token masuk, isi keranjang, dan penanda bahwa kamu sudah melihat panduan. Kami tidak memakai pelacak iklan.',
            ],
          },
        ],
      },
      {
        id: 'penggunaan-data',
        title: 'Cara kami menggunakan data',
        body: [
          {
            list: [
              'Memproses pesanan, menagih pembayaran, dan mengirim paket.',
              'Mengatur reservasi dan memberikan layanan klinik, termasuk persiapan perawatan yang aman.',
              'Mengirim pemberitahuan tentang pesanan kamu (di dalam aplikasi) dan email penting seperti atur ulang kata sandi.',
              'Menjaga keamanan akun dan mencegah penyalahgunaan atau penipuan.',
              'Memenuhi kewajiban hukum dan menanggapi permintaan pihak berwenang yang sah.',
              'Memperbaiki layanan, misalnya mencari tahu bagian yang sering menimbulkan kesalahan.',
            ],
          },
          'Kami tidak menjual data pribadi kamu.',
        ],
      },
      {
        id: 'pihak-ketiga',
        title: 'Dengan siapa kami membagikan data',
        body: [
          'Kami hanya membagikan data yang diperlukan agar layanan berjalan:',
          {
            list: [
              'Midtrans (penyedia pembayaran): nama, email, daftar produk, dan total untuk memproses pembayaran.',
              'Biteship dan perusahaan kurir (termasuk Gojek, Grab, dan kurir reguler): nama, nomor telepon, alamat, dan titik lokasi penerima agar paket sampai. Kurir instan memakai titik lokasi untuk menemukan alamat kamu.',
              'Penyedia layanan email: alamat email dan isi email transaksi seperti atur ulang kata sandi.',
              'OpenStreetMap: peta dimuat dari server OpenStreetMap, dan teks alamat yang kamu ketik dikirim ke layanan pencarian lokasinya (Nominatim) untuk menaruh pin otomatis.',
              'WhatsApp: tombol konsultasi online membuka WhatsApp dengan pesan yang sudah terisi; pesan itu baru dikirim bila kamu menekan kirim.',
              'Penyedia hosting dan infrastruktur yang menyimpan dan menjalankan situs kami.',
              'Dokter dan staf klinik yang menangani kamu, terbatas pada data yang mereka perlukan.',
              'Pihak berwenang, bila diwajibkan oleh hukum.',
            ],
          },
        ],
      },
      {
        id: 'data-kesehatan',
        title: 'Data kesehatan dan foto',
        body: [
          'Profil kesehatan dan rekam medis hanya dapat dilihat oleh kamu dan tenaga klinik yang menangani perawatanmu. Foto yang kamu unggah disimpan di penyimpanan privat dan hanya dapat dibuka lewat tautan sementara.',
          'Hasil konsultasi seperti diagnosis, catatan dokter, rencana perawatan, dan resep baru dapat kamu lihat di akunmu setelah konsultasi ditandai selesai.',
        ],
      },
      {
        id: 'penyimpanan-keamanan',
        title: 'Penyimpanan dan keamanan',
        body: [
          'Koneksi ke situs kami memakai HTTPS. Akses ke data dibatasi berdasarkan peran (pelanggan, dokter, admin), dan kata sandi disimpan dalam bentuk terenkripsi. Kami membuat cadangan data berkala yang disimpan terbatas, lalu dihapus bergilir.',
          'Kami menyimpan data selama akunmu aktif dan selama diperlukan untuk tujuan di atas atau untuk memenuhi kewajiban hukum, termasuk ketentuan penyimpanan rekam medis. Tidak ada sistem yang sepenuhnya aman; jika terjadi kebocoran yang berdampak pada data kamu, kami akan memberi tahu sesuai ketentuan yang berlaku.',
        ],
      },
      {
        id: 'hak-kamu',
        title: 'Hak kamu',
        body: [
          'Sesuai Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi, kamu berhak:',
          {
            list: [
              'mengetahui dan meminta salinan data pribadimu,',
              'memperbaiki data yang tidak akurat (nama, telepon, dan alamat dapat kamu ubah sendiri di akun; profil kesehatan dapat kamu ubah di halaman Profil saya),',
              'meminta penghapusan data atau penutupan akun, sepanjang tidak bertentangan dengan kewajiban hukum seperti penyimpanan rekam medis,',
              'menarik persetujuan dan mengajukan keberatan atas pengolahan data tertentu.',
            ],
          },
          'Untuk menggunakan hak ini, hubungi kami lewat kontak di bawah. Kami akan menanggapi dalam waktu yang wajar.',
        ],
      },
      {
        id: 'pengguna-di-bawah-umur',
        title: 'Pengguna di bawah umur',
        body: ['Layanan kami ditujukan bagi pengguna yang cakap hukum. Pengguna di bawah umur harus didampingi orang tua atau wali, terutama untuk layanan klinik.'],
      },
      {
        id: 'perubahan',
        title: 'Perubahan kebijakan',
        body: [`Kami dapat memperbarui kebijakan ini. Perubahan penting akan diumumkan di situs, dan tanggal pembaruan terakhir tertera di bagian atas halaman (${LEGAL.lastUpdated}).`],
      },
      contactSection(),
    ],
  },

  terms: {
    title: 'Syarat dan Ketentuan',
    summary: `Aturan menggunakan situs ${LEGAL.brand}: membuat akun, berbelanja, membayar, pengiriman, dan reservasi klinik.`,
    sections: [
      {
        id: 'penerimaan',
        title: 'Penerimaan syarat',
        body: [`Dengan mengakses situs, membuat akun, atau melakukan pemesanan di ${LEGAL.brand}, kamu menyetujui syarat ini dan Kebijakan Privasi. Jika tidak setuju, mohon jangan menggunakan layanan kami.`],
      },
      {
        id: 'akun',
        title: 'Akun',
        body: [
          {
            list: [
              'Berikan data yang benar dan perbarui bila berubah.',
              'Jaga kerahasiaan kata sandi. Aktivitas di akunmu menjadi tanggung jawabmu.',
              'Beri tahu kami segera bila akunmu digunakan tanpa izin.',
              'Kami dapat menangguhkan akun yang melanggar syarat atau dipakai untuk penipuan.',
            ],
          },
        ],
      },
      {
        id: 'produk-pesanan',
        title: 'Produk, harga, dan pesanan',
        body: [
          {
            list: [
              'Harga ditampilkan dalam Rupiah. Total pesanan, termasuk ongkos kirim, dihitung oleh sistem kami saat checkout.',
              'Stok dipesankan untuk kamu saat pesanan dibuat. Kami dapat membatalkan pesanan bila terjadi kesalahan harga atau stok yang jelas, dan dana yang sudah dibayar dikembalikan penuh.',
              'Warna dan tampilan produk di layar dapat sedikit berbeda dari aslinya.',
            ],
          },
        ],
      },
      {
        id: 'pembayaran',
        title: 'Pembayaran',
        body: [
          `Pembayaran diproses melalui Midtrans dengan metode yang tersedia di halaman pembayaran. Pesanan yang belum dibayar dalam ${LEGAL.paymentWindowHours} jam kedaluwarsa otomatis dan stoknya dikembalikan. Kamu juga dapat membatalkannya sendiri sebelum dibayar.`,
          'Pesanan dianggap dibayar setelah pembayaran terkonfirmasi oleh penyedia pembayaran.',
        ],
      },
      {
        id: 'pengiriman',
        title: 'Pengiriman',
        body: [
          {
            list: [
              'Pengiriman memakai layanan kurir melalui Biteship. Estimasi waktu bersifat perkiraan dan dapat berubah akibat kondisi kurir atau cuaca.',
              'Pastikan alamat, nomor telepon, dan titik lokasi benar. Kesalahan alamat yang berasal dari pemesan dapat menyebabkan keterlambatan atau kegagalan pengiriman.',
              'Kurir instan (Gojek dan Grab) memerlukan titik lokasi pada peta. Bila belum ada driver yang tersedia, kami akan mencarikan kurir lain; bila tetap tidak ditemukan, pesanan dapat dibatalkan dan dana dikembalikan.',
              `Setelah paket tiba, kamu dapat mengonfirmasi bahwa pesanan diterima. Tanpa konfirmasi, pesanan selesai otomatis ${LEGAL.autoCompleteDays} hari setelah paket tiba.`,
            ],
          },
        ],
      },
      {
        id: 'pembatalan-refund',
        title: 'Pembatalan dan refund',
        body: ['Ketentuan pembatalan, pengembalian barang, dan refund diatur dalam Kebijakan Refund dan merupakan bagian dari syarat ini.'],
      },
      {
        id: 'reservasi-klinik',
        title: 'Reservasi klinik',
        body: [
          {
            list: [
              'Reservasi dibuat untuk dokter, tanggal, dan jam yang masih tersedia. Reservasi langsung berstatus terkonfirmasi.',
              'Mohon datang tepat waktu. Keterlambatan dapat memperpendek waktu perawatan atau membuat jadwal dibatalkan.',
              'Kamu dapat membatalkan reservasi dari akunmu sebelum check-in. Pasien yang tidak hadir dicatat sebagai tidak hadir.',
              'Biaya layanan klinik dibayar di klinik, bukan melalui situs ini.',
              'Isi profil kesehatan dengan jujur, terutama alergi dan riwayat penyakit, agar perawatan aman. Hasil perawatan dapat berbeda pada tiap orang.',
            ],
          },
        ],
      },
      {
        id: 'informasi-kesehatan',
        title: 'Informasi kesehatan',
        body: ['Konten di situs ini bersifat informasi umum dan tidak menggantikan pemeriksaan serta nasihat dokter. Hentikan penggunaan produk dan hubungi dokter bila timbul reaksi yang tidak diinginkan.'],
      },
      {
        id: 'larangan',
        title: 'Penggunaan yang dilarang',
        body: [
          {
            list: [
              'Memakai situs untuk tujuan melanggar hukum atau menipu.',
              'Mengakses akun atau data orang lain tanpa izin.',
              'Mengganggu keamanan atau kinerja situs, termasuk mencoba mengubah harga atau data pesanan.',
              'Menyalin atau memakai ulang konten kami untuk tujuan komersial tanpa izin.',
            ],
          },
        ],
      },
      {
        id: 'kekayaan-intelektual',
        title: 'Hak kekayaan intelektual',
        body: [`Nama ${LEGAL.brand}, logo, teks, foto, dan desain di situs ini dilindungi hak cipta dan merek. Kamu tidak boleh menggunakannya tanpa izin tertulis.`],
      },
      {
        id: 'tanggung-jawab',
        title: 'Batasan tanggung jawab',
        body: [`Sejauh diizinkan hukum, tanggung jawab ${legalName()} terbatas pada nilai pesanan yang bersangkutan. Kami tidak bertanggung jawab atas keterlambatan di luar kendali kami, seperti gangguan kurir, bencana, atau gangguan jaringan.`],
      },
      {
        id: 'perubahan',
        title: 'Perubahan syarat',
        body: [`Kami dapat memperbarui syarat ini. Penggunaan layanan setelah perubahan berarti kamu menyetujuinya. Pembaruan terakhir: ${LEGAL.lastUpdated}.`],
      },
      {
        id: 'hukum',
        title: 'Hukum yang berlaku',
        body: ['Syarat ini tunduk pada hukum Republik Indonesia. Sengketa diupayakan diselesaikan secara musyawarah terlebih dahulu; bila tidak tercapai, diselesaikan melalui pengadilan yang berwenang.'],
      },
      contactSection(),
    ],
  },

  refund: {
    title: 'Kebijakan Refund dan Pengembalian',
    summary: 'Kapan pesanan bisa dibatalkan, kapan barang bisa dikembalikan, dan bagaimana dana dikembalikan.',
    sections: [
      {
        id: 'belum-dibayar',
        title: 'Pesanan yang belum dibayar',
        body: [
          `Kamu dapat membatalkan sendiri pesanan yang belum dibayar dari halaman pesanan. Tidak ada biaya, dan stok dikembalikan. Pesanan yang tidak dibayar dalam ${LEGAL.paymentWindowHours} jam kedaluwarsa otomatis.`,
        ],
      },
      {
        id: 'sudah-dibayar',
        title: 'Pembatalan setelah dibayar',
        body: [
          'Hubungi kami secepatnya lewat kontak di bawah. Pesanan yang belum diproses dapat dibatalkan dan dananya dikembalikan. Pesanan yang sudah diserahkan ke kurir tidak dapat dibatalkan; kamu dapat mengajukan pengembalian sesuai ketentuan di bawah.',
        ],
      },
      {
        id: 'barang-bermasalah',
        title: 'Barang rusak, salah, atau tidak sesuai',
        body: [
          `Laporkan dalam ${LEGAL.reportWindowHours} jam setelah paket diterima, dan lampirkan foto serta, bila ada, video saat membuka paket. Kami akan memeriksa laporan dan menawarkan penggantian barang atau refund.`,
          'Mohon simpan kemasan dan produk sampai laporan selesai diproses. Mengonfirmasi bahwa pesanan sudah diterima sebaiknya dilakukan setelah kamu memeriksa isi paket.',
        ],
      },
      {
        id: 'syarat-pengembalian',
        title: 'Syarat pengembalian',
        body: [
          {
            list: [
              'Produk perawatan kulit, kosmetik, dan perawatan tubuh yang sudah dibuka atau dipakai tidak dapat dikembalikan karena alasan kebersihan dan keamanan, kecuali produk cacat atau salah kirim.',
              'Produk yang dikembalikan harus dalam kondisi dan kemasan seperti saat diterima, kecuali cacat atau salah kirim.',
              'Pengembalian karena berubah pikiran tidak tersedia untuk produk yang segelnya sudah terbuka.',
            ],
          },
        ],
      },
      {
        id: 'proses-refund',
        title: 'Proses refund',
        body: [
          `Refund yang disetujui dikembalikan ke metode pembayaran asal bila memungkinkan. Bila metode asal tidak mendukung refund otomatis (misalnya transfer bank), dana dikirim lewat transfer ke rekening atas nama pemesan. Proses memerlukan sekitar ${LEGAL.refundProcessTime} sejak disetujui.`,
          'Ongkos kirim dikembalikan bila pembatalan atau pengembalian disebabkan kesalahan dari pihak kami atau kegagalan pengiriman.',
        ],
      },
      {
        id: 'pengiriman-gagal',
        title: 'Pengiriman gagal',
        body: [
          'Bila kurir instan tidak menemukan driver, kami mencarikan kurir lain. Bila pengiriman tetap tidak dapat dilakukan, pesanan dibatalkan dan dana dikembalikan penuh, termasuk ongkos kirim. Hal yang sama berlaku bila kurir membatalkan pengiriman atau paket dikembalikan ke toko.',
        ],
      },
      {
        id: 'layanan-klinik',
        title: 'Layanan klinik',
        body: ['Layanan klinik dibayar di klinik, sehingga tidak ada pembayaran online yang perlu di-refund. Reservasi dapat dibatalkan tanpa biaya dari akunmu sebelum check-in.'],
      },
      contactSection(),
    ],
  },
};
