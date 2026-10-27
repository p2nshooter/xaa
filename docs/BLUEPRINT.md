# Blueprint proyek xaa.es — PT AXTO DIGITAL GLOBAL

Dokumen ini adalah catatan induk proyek: semua permintaan, apa yang sudah
dikerjakan, apa yang belum, dan apa yang belum diuji. **Setiap permintaan baru
atau perubahan wajib dicatat di sini dulu** (bagian 3 dan 8), lalu statusnya
diperbarui setelah diuji.

Terakhir diperbarui: 20 Oktober 2026.

Arti tanda:

- ✅ selesai dan lulus uji
- 🟡 selesai tetapi belum diuji penuh di produksi, atau butuh tindakan manual
- ❌ belum dikerjakan
- ⏸️ ditunda atas permintaan pemilik

---

## 1. Gambaran sistem

| Bagian | Isi |
|---|---|
| Situs | https://xaa.es: studio pengembangan web (EN/ES/ID), katalog paket, template SaaS, profil perusahaan, arsip artikel sepak bola |
| Teknologi | Next.js 15 (App Router) di Cloudflare Workers via `@opennextjs/cloudflare` |
| Database | Cloudflare D1 (paket gratis, ada batas baca harian) |
| Penyimpanan file | R2 **belum aktif** di akun Cloudflare. Unggahan file dan bundle template belum bisa disimpan |
| Deploy | GitHub Actions `Deploy to Cloudflare` jalan otomatis setiap push ke `main`, lalu menjalankan smoke test produksi |
| Sesi login | Cookie bertanda tangan HMAC-SHA256 (`src/server/session.ts`); tidak butuh D1 atau R2 |
| Admin | Di-seed langsung (email di `src/server/auth.ts`, hash PBKDF2). Pendaftar pertama **tidak** otomatis menjadi admin |
| Rahasia | `SESSION_SECRET` dibuat sekali oleh workflow; password admin tidak pernah di-commit (tes membacanya dari env `ADMIN_PASS`) |

---

## 2. Aturan tetap (jangan dilanggar)

1. Repo **sairan** tidak boleh disentuh.
2. Data warga asli tidak pernah dipublikasikan; demo hanya pakai data simulasi.
3. Tautan `workers.dev` diverifikasi dulu sebelum dikirim.
4. NIK, NPWP, tanggal lahir, dan alamat rumah dari dokumen PT tidak boleh tampil di situs; dokumen legal yang tampil sudah disensor.
5. Asisten AI di chat hanya menjawab informasi publik situs. Ia tidak boleh membocorkan rahasia perusahaan, kunci API, alamat dompet, atau nomor rekening.
6. SEO hanya untuk **xaa.es**; SEO situs lain ⏸️ ditunda.
7. Password admin tidak pernah masuk ke repo, log, atau konteks AI.

---

## 3. Log permintaan (dari awal sampai sekarang)

| # | Permintaan | Status | Bukti / catatan |
|---|---|---|---|
| 1 | Artikel sepak bola diperluas menjadi 1.800+ kata, iklan Adsterra | ✅ | commit Juli–Agustus 2026 |
| 2 | Rebrand xaa.es menjadi studio web: layanan, proses, perawatan, pembayaran | ✅ | `d9b0650`, `3f2cea6` |
| 3 | Portal klien: daftar, pesan, bayar, unggah, lacak, serah terima | 🟡 | Alur berjalan dan lulus E2E. Unggah file butuh R2 (belum aktif) |
| 4 | Admin: kendali uang dan rahasia, invoice, kotak lead, demo sipil | ✅ | `7a3c5a3` |
| 5 | Admin di-seed, login tersembunyi, transfer BNI, tombol reveal | ✅ | `f7f0c9c` |
| 6 | Tiga bahasa (EN/ES/ID) di seluruh situs publik | ✅ | `3a24aa2`, `94b5a34` |
| 7 | Ganti SLA 24/7 dengan backup dan pemulihan AI; harga AXTO per aplikasi | ✅ | `499167d`, `c557301` |
| 8 | Toko template SaaS | 🟡 | Lihat bagian 5: katalog dan pembayaran jalan, tetapi produknya belum dibangun |
| 9 | Login admin gagal (D1 over quota, R2 tidak ada) | ✅ | `3601bfc`: sesi pindah ke cookie bertanda tangan. Produksi `signInReady: true` |
| 10 | Tampilkan/sembunyikan password dan simpan kredensial di browser | ✅ | `711ef4c` |
| 11 | Profil perusahaan: foto CEO/CTO, logo, sertifikat kemitraan tajam, pernyataan PT | ✅ | `37a2ebd`, halaman `/company` |
| 12 | SEO sesuai checklist (21 bagian), fokus xaa.es | ✅ 93% | `2203b2d`. Sisanya ada di bagian 6 |
| 13 | Alat audit SEO dan pelacak di admin | ✅ | `75f1fc7`: `/portal/admin/seo`, workflow mingguan |
| 14 | `/portal` admin error "This page could not load" | ✅ | `7fbb829`: penanda skema hanya ditulis bila semua migrasi sukses; `/api/portal/diagnose` menunjukkan loader yang gagal |
| 15 | Pengaturan pembayaran dari admin, terenkripsi | ✅ | Tujuan pembayaran dienkripsi AES-GCM di D1. R2 belum aktif, jadi datanya tidak di R2 |
| 16 | Metode bayar: crypto + rekening BNI dari repo ulyah.com | ✅ | Tombol "Import company accounts (crypto + BNI)": 5 crypto + 13 akun BNI, tanpa duplikat |
| 17 | Chat live dengan admin; AI ulyah.com menjawab bila admin tidak aktif | ✅ | Widget di semua halaman publik; desk admin `/portal/admin/support` |
| 18 | AI tidak boleh membocorkan rahasia | ✅ | Konteks AI hanya paket pengetahuan publik; balasan disaring (kunci, alamat, rekening → `[removed]`) |
| 19 | Email/kontak support lokal masuk ke chat support admin | ✅ | Form `/contact` otomatis membuka percakapan di desk Support |
| 20 | Dropdown pertanyaan: penawaran, nego harga, crypto, transfer bank, template, proyek, lainnya | ✅ | Pilihan topik di widget chat |
| 21 | Blueprint dari awal sampai akhir | ✅ | Dokumen ini |
| 22 | Judul halaman paket unik per bahasa (temuan audit SEO) | ✅ | ES: "…: precio y plazos", ID: "Jasa …" |
| 24 | Portal masih error karena kuota baca D1 harian habis (5 juta baris/hari, dipakai bersama semua situs di akun Cloudflare) | ✅ | Semua halaman portal tetap tampil dengan pemberitahuan kuning; diuji lokal dengan D1 dipaksa error kuota: 6/6 lulus. Solusi permanen: upgrade Workers Paid $5/bulan |
| 25 | (14 Okt 2026) "Masukin pembayaran ini, pastikan langsung bisa digunakan untuk pembayaran, termasuk pembayaran manual bank BNI rekening USD & Euro" — kunci PayPal Live xaa.es + kunci Sandbox | ✅ kode, 🟡 kunci | PayPal Checkout otomatis (bagian 7 "PayPal Checkout"); rekening BNI EUR + USD otomatis tersedia di database baru; kunci PayPal diisi pemilik di Admin → Settings → PayPal Checkout (terenkripsi), tidak pernah di repo |
| 26 | (14 Okt 2026) Penawaran modal gabungan axto.io + xaa.es US$2.000.000, bagi hasil 30 % dari setiap transaksi kedua situs, portal pemodal hanya untuk yang sudah terverifikasi | ↪️ diganti #39 | Pemilik 19 Okt: „masing2 web nyari investornya, bukan gabungan". Feed pendapatan bertoken `GET /api/revenue` ke axto.io dihapus; xaa.es punya penawaran pemodalnya sendiri (#39) |
| 27 | (14 Okt 2026 malam) "Sudah ada PayPal sandbox, PayPal tiruan hapus saja" | ⏳ | Hapus `tools/e2e/paypal-mock.mjs` + override `PAYPAL_SANDBOX_API`; uji PayPal memakai Sandbox asli bila kuncinya ada |
| 28 | (14 Okt 2026 malam) "Pakai nomer WhatsApp ini untuk konfirmasi manual di situs xaa.es & axto.io & ubah semua nomer WA yang lama: +62 856-9287-9465" | ↪️ diganti #36 | Pemilik mengganti nomornya lagi pada 18 Okt (permintaan 36) |
| 29 | (14 Okt 2026 malam) "Harga akuisisi xaa.es $10jt & ada tombol jika ingin menawar, bikin yg elegan profesional, dan jelaskan keuntungannya" (menggantikan harga pembuka $2 juta di permintaan 26) | ✅ (19 Okt) | `/acquire` EN/ES/ID: harga US$10.000.000, keuntungan, isi paket, langkah pembeli, checkout, tombol "Ajukan penawaran" → formulir tersimpan + pemberitahuan pemilik |
| 30 | (14 Okt 2026 malam) Pemilik memberikan login admin xaa.es di chat | ⚠️ | Tidak pernah ditulis ke file mana pun |
| 31 | (14 Okt 2026 malam) "Buatkan penghitung pengunjung harian, mingguan, bulanan, tahunan & total … pengunjung harian tampil di index, sisanya di portal admin" | ⏳ | Satu baris per hari di D1, pengunjung unik lewat cookie harian tanpa data pribadi |
| 32 | (14 Okt 2026 malam) "Pastikan semua pembayaran sudah live … isi semua" | ⏳ | PayPal Live (kunci xaa.es) + Sandbox tersimpan, mode Live; BNI EUR + USD aktif; tidak ada metode bertanda TEST di halaman pembayaran publik |
| 33 | (14 Okt 2026 malam) AdSense xaa.es → `google.com, pub-6908951782430508, DIRECT, f08c47fec0942fa0` (bersama axto.io, rough.es, ulyah.com, 1fr.fr) | ✅ kode (tayang setelah deploy) | Loader `adsbygoogle.js?client=ca-pub-6908951782430508`, `public/ads.txt`, tag meta `google-adsense-account` |
| 34 | (14 Okt 2026 malam) "Sempurnakan seluruh aplikasinya … berkelas dunia, mudah digunakan, full fitur high class, super premium & super enterprise" dan "SEO seluruh website … agar menjadi nomor 1" | 🔄 | Aturan tetap untuk setiap perubahan; daftar terbuka di bagian 6 |
| 35 | (18 Okt 2026) "Buatkan menu husus di xaa.es untuk menjual lepas xaa.es dengan bahasa profesional, elegan dan berkelas dengan harga $10jt seperti axto.io, dan pastikan pembayaran full seluruhnya 100% live, ubah dari portal admin" | ✅ halaman, 🟡 kunci | `/acquire` EN/ES/ID (menu khusus "Acquire xaa.es" di header + footer, sitemap, JSON-LD Product/Offer + FAQ): harga US$10.000.000, 8 keunggulan, isi paket, 5 langkah pembelian, cara bayar (SWIFT BNI, escrow, USDT, PayPal untuk uang muka), formulir "Ajukan penawaran" / "Beli di harga yang diminta" → Admin → Leads (lencana "xaa.es acquisition") + Support (topik negotiate). Status/harga/WhatsApp diubah di Admin → Settings → **Sale of xaa.es**. PayPal memakai Live secara bawaan (`paypal_mode` kosong = live); kunci Live diisi pemilik sendiri di Admin → Settings → PayPal Checkout — kunci tidak pernah ditulis ke repo |
| 36 | (18 Okt 2026) "Ubah seluruh nomer HP yg ada di axto.io & xaa.es menjadi +6285691234561, ini adalah nomer kirim bukti transaksi manual fast respon" | ✅ | xaa.es: `SALE_DEFAULT_WHATSAPP` (`src/server/sale.ts`), tampil di /acquire dan di balasan formulir; tidak ada nomor lain di kode xaa.es. axto.io sudah memakai nomor ini (`lib/acquisition.ts`) |
| 37 | (18 Okt 2026) Promosikan axto.io & xaa.es di setiap situs pemilik dengan menu khusus premium, bahasa masing-masing situs, kalimat berbeda di setiap situs | ✅ (20 Okt) | Di xaa.es: tautan "✦ AXTO" berpendar di footer (EN/ES/ID, `footer.axto` di `src/lib/i18n.ts`, UTM `utm_source=xaa.es`, animasi mati bila `prefers-reduced-motion`). axto.io menautkan balik ke xaa.es di footernya (10 bahasa). Situs lain: `ulyah.com/docs/ADSENSE-BLUEPRINT.md` §13.5 |
| 38 | (18 Okt 2026) Blueprint template xaa.es yang belum dibuat, fitur kelas tinggi, tangkapan layar animasi setiap menu & dashboard, link demo untuk klien | 🔄 logika ✅ (20 Okt) · produk 0/18 | **`docs/TEMPLATES-BLUEPRINT.md`**: keadaan sebenarnya (0 dari 18 template punya produk/demo), kode sumber di repo privat `xaa-templates` (repo xaa publik), satu kode jalan di Workers + D1 / Docker + SQLite / browser (demo), inti bersama, jalur gambar animasi per menu, syarat siap produksi, logika 18 template, urutan kerja |
| 39 | (19 Okt 2026) Tangkapan layar xaa.es/acquire „Prefer a stake to the whole? A joint offering for AXTO and XAA…" — „ini maksudnya apa? Maksudnya masing2 web nyari investornya, bukan gabungan" | ✅ | `/invest` khusus xaa.es (EN/ES/ID): ketentuan dari Admin → Settings → Investor offering (bawaan = syarat 14 Okt untuk xaa.es saja: target US$2 jt, minimum US$50 rb, pool 30 % pendapatan xaa.es, bulanan, sampai akuisisi penuh → modal kembali 100 %), contoh bagi hasil dihitung otomatis, pemberitahuan risiko, formulir pengajuan → Studio desk → Investors + Leads + Support. Admin memverifikasi modal, mencatat pembayaran bulanan; pemodal melihat laporan di `/portal/investor`. Bawaan noindex & di luar sitemap (bisa diubah di admin). `/acquire` dan footer menunjuk ke `/invest`. Uji: `tools/e2e/invest.mjs` (33 cek) |
| 40 | (19 Okt 2026) „Selesaikan seluruh tugas sampai bersih, tidak merge+PR manual, semua anda kerjakan" | 🔄 | Claude membuat PR, menunggu CI, merge sendiri, lalu memeriksa deploy |
| 41 | (20 Okt 2026) „Promosikan axto.io dan xaa.es d semua situs, tp kerjakan dulu apa belum d kerjakan di ke duanya" | 🔄 aturan prioritas | Yang belum dibuat di xaa.es (template SaaS, bagian 5 dan `docs/TEMPLATES-BLUEPRINT.md`) didahulukan |
| 42 | (20 Okt 2026) „Axto.io & xaa.es bikin SEO nya boom, niche kuat, pastiin trafik organiknya meledak, bagaimanapun caranya" | 🔄 | Niche xaa.es: template SaaS dengan demo hidup + studio pembuatan web; alat gratis (kalkulator biaya website); hanya cara yang sesuai kebijakan Google. Rencana di repo guardian-ai `docs/BLUEPRINT-V4.md` §23 B |
| 43 | (20 Okt 2026) „Xaa.es & axto.io bikinin app nya biar bisa di install di HP, taro paling atas, kasih tanda icon HP buat install nya, biar bisa langsung d buka tanpa browser, klo sudah ada di HP, hapus icon HP nya" | ✅ (20 Okt) | Manifest (`src/app/manifest.ts`), ikon `public/pwa/*`, service worker `public/sw.js` (halaman portal/login tidak pernah disimpan), halaman `public/offline.html`, skrip awal `src/lib/pwa-early.ts`, bilah pasang ikon HP paling atas `src/components/InstallBar.tsx` (EN/ES/ID): dialog pasang bawaan atau langkah iPhone/Android; hilang bila terpasang (mode aplikasi, `appinstalled`, `getInstalledRelatedApps`); × = sembunyi 14 hari. Playwright 8 skenario lulus |
| 44 | (20 Okt 2026) „Apakah xaa.es SaaS template nya sudah d buatkan semuanya? Sudah ada link demo nya? Berikan username dan password demo nya di portal member, pastikan semuanya pantas dengan harga nya dan berkualitas tinggi juga mudah d gunakan. Kerjakan" | 🔄 | Dijawab jujur: belum (0/18). **Waitlist & Landing selesai** (repo privat `xaa-templates`): kode, 50 tes API/unit, E2E + axe di desktop & HP, diuji di `wrangler dev` + D1 lokal dan `docker compose`, dokumen, 15 klip animasi. Demo di `/demos/waitlist/`, galeri „Every menu and dashboard" di `/templates/waitlist`, akun demo (email + kata sandi) di portal member bagian „Live demos". 17 template lainnya menyusul |
| 45 | (20 Okt 2026) „Database semuanya ke R2 ya, jgn ada yg ke d1... Manfaatin R2, penuhin disana, baik xaa.es maupun axto.io.. Hemat D1 maximalin R2, sy siap bayar 100-1000GB buat xaa.es & axto.io" | 🔄 | Rancangan lengkap di **`docs/R2-DATA-BLUEPRINT.md`**: R2 Store (dokumen JSON, tulis bersyarat atomik If-None-Match/If-Match, penjaga keunikan, index lewat `list` + customMetadata, rekonsiliasi, backup harian), peta 19 tabel, migrasi D1 → R2 tanpa kehilangan data/pembayaran, lalu D1 dilepas |
| 46 | (20 Okt 2026) „Blue print setiap logika di axto & xaa wajib kuat, kumplit, komplex mudah di gunakan, termasuk animasi panduan untuk customer, jika bluprint sudah sangat kuat dan sudah 100% siap produksi bukan sampah langsung kerjakan dengan live payment, jgn ada sampah app" | 🔄 | Aturan tetap: blueprint dulu, lalu dibangun dan diuji. Animasi panduan pelanggan (10 alur + 6 admin, EN/ES/ID): `docs/R2-DATA-BLUEPRINT.md` bagian 5 dan 8. Pembayaran tetap Live dari Admin → Pembayaran (bagian 6) |
| 47 | (20 Okt 2026) „Catat ya baik di axto.io maupun di xaa.es, ulyah.com  xad.es 1fr.fr tilawa.de dan semua yg membutuhkan penyimpanan, wajib ke R2, jgn pernah ke D1" | ✅ dicatat | Aturan tetap di `CLAUDE.md` repo ini dan di setiap repo pemilik (guardian-ai, ulyah.com, Quantum, dan lainnya); cakupan per situs di guardian-ai `docs/R2-DATA-BLUEPRINT.md` §10 |
| 48 | (20 Okt 2026) „Setelah xaa.es selesai skrg pindah ke axto.io pastikan 100% siap produksi, docker sudah di cek dan sudah siap produksi, jgn ada aplikasi sampah, pastikan pembayaran semua sudah live" | 🔄 urutan | xaa.es dulu (data ke R2 tayang), lalu axto.io (guardian-ai `docs/BLUEPRINT-V4.md` §25) |
| 49 | (20 Okt 2026) „SaaS template di xaa.es sudah d buat belum? Dari harga termurah sampai termahal dan buatkan link demonya" + „Kerjakan ke duanya, 1 dulu baru lanjut" | 🔄 | Jawaban jujur: baru Waitlist & Landing (€390) yang jadi + demo; 17 lainnya baru blueprint. Urutan: data xaa.es ke R2 tayang dulu (✅), lalu template dibangun berurutan dari termurah (Link-in-Bio €490 → … → Global Enterprise Ecosystem €500.000), masing-masing dengan demo hidup, akun demo di portal dan klip animasi (`docs/TEMPLATES-BLUEPRINT.md`). **20 Okt:** kit + Waitlist pindah ke R2 (89 tes, E2E 7/7, menu Backups), demo `/demos/waitlist/` diperbarui; berikutnya Link-in-Bio |
| 50 | (26 Okt 2026, urgent) „Untuk 5 domain ini kode adsense nya ulyah.com 1fr.fr Tilawa.de axto.io xaa.es google.com, pub-8991272269211824, DIRECT, f08c47fec0942fa0“ — ads.txt, tag meta dan cuplikan; „Hati2 jgn sampe ads.txt hilang2an“ | ✅ kode (tayang setelah deploy) | `src/lib/site.ts` (`adClient` → loader + tag meta di HTML), `public/ads.txt` |
| 51 | (26 Okt 2026) „Kita berhenti dulu aplikasi xaa.es dan axto.io … focus isi minimal 45 artikel di seluruh situs“ (termasuk xaa.es); „jgn pernah mengerjakan aplikasi sebelum di perintahkan atau anda harus minta izin dulu“ | 🔄 aturan tetap: kode AdSense → DNS → situs baru → artikel → blueprint; aplikasi hanya dengan izin | §6 |
| 52 | (26 Okt 2026) Penawaran investor (hingga 30 %) default tersembunyi di index dan portal member, tombol tampil/sembunyi di portal admin | ✅ diganti oleh permintaan 54 (default tampil); tombol tampil/sembunyi dibangun 27 Okt | §6 |
| 54 | (27 Okt 2026) „Investor defoultnya ganti jadi show" (bersama perintah lelang axto.io, guardian-ai REQUESTS 94) | ✅ 27 Okt: setelan `invest_visible` (bawaan **tampil**) di Settings → Investor offering dan tombol „Hide/Show the investor offering" di Studio desk → Investors; saat disembunyikan: `/invest` 404 + noindex, tautan footer hilang, keluar dari sitemap, pengajuan ditolak; pemodal terverifikasi tetap melihat laporannya. Setiap perubahan setelan kini masuk log audit append-only `l/audit-settings/…` (nilai rahasia tidak pernah dicatat) | §6 |
| 55 | (27 Okt 2026) „klo di xaa.es nanti ada lelang website + domainya names nya, mulai dari web artikel, web SaaS, web ecomerce baju, jam dll tolong bikinin karegorinya" · „Di xaa.es itu ga ada licensi, jd jgn ada lelang licensi, tp lelang website jadi, lelang web / script nya aja, dan lelang website + domainya... Harga di tentuin di portal admin" · „Coba kembangin dulu biar dapet blueprint yg luar biasa" | 📝 blueprint §10 (lelang website/script/domain, kategori, harga dari admin); dibangun setelah perbaikan SEO (permintaan 57) | §10 |
| 56 | (27 Okt 2026) „Untuk email axto.io & xaa.es kirimnya ke hello@axto.io karena ini satu management" | 📝 semua notifikasi xaa.es (pesanan, dukungan, penawaran investor, lelang, kontak) dikirim ke hello@axto.io; alamat balas ke klien tetap hello@xaa.es | §10.9 |
| 57 | (27 Okt 2026) „Tolong perbaiki dulu seluruh SEO websitenya, perkata, link xmlsitemap dan file2 lain yg d butuhkan dll, backlink yg tidak melanggar adsense d seluruh situs … setelah itu baru lanjutkan pekerjaan pembuatan auction xaa.es dan axto.io … rapikan blueprint nya menjadi HTML yg bisa d download" | 🔄 SEO dulu (semua situs, termasuk xaa.es: audit live `scripts/seo-audit.mjs` untuk semua domain), lalu lelang; blueprint HTML induk di repo ulyah.com `docs/BLUEPRINT.html` | ulyah.com ADSENSE-BLUEPRINT §15 |
| 58 | (27 Okt 2026) „Jgn lupa lanjut lelang script web, website + domain dan domain saja di xaa.es" | 🔄 jenis lot keempat: **domain saja** (nama domain tanpa website); dibangun bersama lelang website setelah perbaikan SEO | §10.1, §10.3 |
| 59 | (27 Okt 2026) „Untuk semua lelang di xaa.es juga berakhir selama 2 minggu di mulain saat lelang di jalankan, untuk produk milik xaa.es itu otomatis, start di harga 35%, dan kenaikan 5% berakhir di hari jumat jam 7. Client bisa ikut auction jual domain saja, selama 2 minggu dan harus verifikasi dns dulu … template husus auction seperti sedo.com yg menampilkan lelang domainya, milik xaa.es … domain saja client/member bisa ikut jual lelang dengan fee 30%, bisa yati lelang lg jika 2 minggu tidak laku, dan admin jg bisa jual, dan untuk website + domain, hanya admin yg bisa jual … Domain yang akan berakhir naik ke atas dan bisa di filter seperti situs2 lelang domain yg lain“ · „Tolong catat ini, rapihin dan kembangin lagi blueprint nya“ | 📝 §10 ditulis ulang: setiap lot 14 hari sejak dijalankan; produk xaa.es otomatis (Jumat 07.00 WIB → Jumat 07.00 WIB, buka 35 %, tiap tawaran +5 % dari harga buka); anggota menjual **domain saja** setelah verifikasi DNS (TXT), **komisi penjualan 30 %** (permintaan 63), bisa dilelang ulang; admin menjual semua jenis, **website + domain hanya admin**; halaman penjual ala Sedo; daftar „segera berakhir“ di atas + filter domain | §10 |
| 60 | (27 Okt 2026) „Menu company di xaa.es tolong di Hiden dan bisa di show dr portal admin“ | ✅ 27 Okt: setelan `company_visible` (bawaan **tersembunyi**) + tombol „Show/Hide the Company menu“ di Studio desk (log audit); saat tersembunyi tidak ada tautan di menu/footer, `/company` 404 + noindex, keluar dari sitemap dan llms.txt. Uji: `tests/e2e/company.e2e.mjs` 7/7, seo-verify, portal 41/41 | §11 |
| 61 | (27 Okt 2026) „Baik axto.io dan xaa.es tolong ambil rek pembayaranya dari https://ulyah.com/donasi / dari repo termasuk jaringannya barcode nya … Pastikan konversi mata uang sesuai dengan rekening BNI untuk manual, dan pandu customer untuk pembayaran manual sampai sukses“ | 📝 13 rekening BNI wondr (per mata uang) + 5 dompet kripto (dengan jaringan & QR) dari sumber ulyah.com/donasi, disimpan terenkripsi, tampil hanya di checkout pembeli yang masuk; jumlah dikonversi ke mata uang rekening yang dipilih (kurs harian); panduan bayar manual langkah demi langkah sampai lunas. axto.io: guardian-ai REQUESTS 104 | §12 |
| 62 | (27 Okt 2026) „buatkan juga menu husus penjualan domain + website article husus pengajuan adsense dengan keterangan 40-100 article min 1500 kata per artikel berkualitas tinggi, hanya admin yg bisa ngisi, dengan berbagai macam bahasa untuk custom … tp ada yg sudah jadi tinggal pakai, start $350 untuk 40 article dan $500 untuk 100 article dengan SEO niche berkualitas“ · „tolong jual website2 saya yg ada, untuk 1fr.fr tilawa.de xad.es dawa.im harganya $30rb dengan puluhan ribu kitab, kasih tau jg bahasa yg d gunakan setiap websitenya, yg jgn d jual ulyah.com xaa.es dan axto.io … Tolong hitung ada berapa article, klo bisa penuhin semuanya biar total setiap website 45 artikel“ | 📝 menu **AdSense sites**: siap pakai (diisi admin), pesanan custom US$350 / 40 artikel dan US$500 / 100 artikel (≥ 1.500 kata, banyak bahasa), situs mapan 1fr.fr (Prancis), tilawa.de (Jerman), xad.es (Inggris), dawa.im (Spanyol) masing-masing US$30.000; ulyah.com, xaa.es, axto.io diblokir dari daftar jual. Hitungan 27 Okt: 0 artikel blog di keempat situs (isinya kisah, hadis, kitab) → bagian artikel baru + 45 artikel per situs | §13 |
| 63 | (27 Okt 2026) „Bukan biaya 30%, tp komisi penjualan dari lelang domain sebesar 30%“ | ✅ dicatat: 30 % adalah **komisi penjualan** dari harga akhir domain anggota yang **terjual** (penjual menerima 70 %). Tidak ada biaya pasang, biaya verifikasi DNS, biaya lelang ulang, atau biaya apa pun bila domain tidak laku | §10.6 |
| 53 | (26 Okt 2026) Pelajari situs dan aplikasi dunia yang sejenis, kembangkan „1000 kali lebih canggih“; kemungkinan xaa.es satu akun Cloudflare dengan axto.io (dibahas dulu) | 📝 dicatat; dikerjakan setelah izin | §6 |
| 23 | Uji berulang sampai 100%, termasuk template SaaS | 🟡 | Tes otomatis ada di `tests/e2e/` (bagian 4). Template "super" belum punya produk untuk diuji |

---

## 4. Pengujian

Semua tes ada di `tests/e2e/` dan dijalankan terhadap Worker lokal
(`npm run cf:preview`, port 8799) atau produksi.

```bash
cd tests/e2e && npm ci
ADMIN_PASS='…' node portal.e2e.mjs  http://localhost:8799   # semua menu portal admin + member
ADMIN_PASS='…' node r2.e2e.mjs      http://localhost:8799   # data R2: pindah dari D1, klien lama login, faktur, email ganda, backup/restore
node mock-ai.mjs &                                            # AI tiruan di :8899 (SUPPORT_AI_URL di .dev.vars)
ADMIN_PASS='…' node support.e2e.mjs http://localhost:8799   # chat, AI, pembayaran, diagnosis
node seo-verify.mjs http://localhost:8799                     # 41 cek SEO
```

| Rangkaian | Hasil terakhir | Tanggal |
|---|---|---|
| Portal (admin + member, semua menu) | 41/41 lulus | 27 Sep 2026 |
| Login saat D1 over quota | lulus | 27 Sep 2026 |
| SEO (head metadata untuk browser/Googlebot/WhatsApp/ClaudeBot, hreflang, redirect, header keamanan) | 41/41 lulus | 27 Sep 2026 |
| Chat support + import pembayaran + diagnosis portal | 26/26 lulus | 27 Sep 2026 |
| Smoke test produksi setelah deploy | lulus (#125, #126) | 27 Sep 2026 |
| Audit SEO produksi (xaa.es) | 93% | 27 Sep 2026 |

---

## 5. Template SaaS: status sebenarnya

| Tier | Template | Harga | Katalog dan halaman | Pembayaran | Produk (source code) | Demo |
|---|---|---|---|---|---|---|
| Starter | **waitlist** | €390 | ✅ | ✅ | ✅ selesai, data di R2 (repo privat `xaa-templates`) | ✅ `/demos/waitlist/` + 15 klip animasi |
| Starter | linkinbio, formbuilder | €490–€690 | ✅ | ✅ | ❌ belum dibangun | ❌ |
| Business | CRM, invoicing, booking, e-commerce, helpdesk, project management, LMS, restaurant, subscription box | €1.190–€1.990 | ✅ | ✅ | ❌ belum dibangun | ❌ |
| Enterprise/Super | multi-tenant SaaS kit, marketplace, ERP suite, AI SaaS platform, fintech core, global ecosystem | €40.000–€1.200.000 | ✅ | ✅ | ❌ belum dibangun | ❌ |

Setelah bayar, pembeli melihat status "bundle sedang disiapkan" sampai studio
melampirkan file zip (Studio desk → template → unggah bundle; R2 `xaa-uploads` sudah aktif). Zip Waitlist dibuat
`node tools/bundle.mjs waitlist --check` di repo privat (instal bersih + typecheck + tes + build). Template lain
**belum** bisa disebut "100% berfungsi": produknya harus dibangun satu per satu.
Template harga super perlu proyek tersendiri beserta demo yang benar-benar hidup.

Rencana lengkap per template (logika, menu, dashboard, demo, gambar animasi, status): **`docs/TEMPLATES-BLUEPRINT.md`**.

---

## 6. Belum dikerjakan / tindakan berikutnya

> **Serah terima 14 Okt 2026 (malam) — urutan untuk AI berikutnya.** Perintah lengkap pemilik (axto.io + xaa.es)
> ada di repo guardian-ai `docs/BLUEPRINT-V4.md` §22. Untuk xaa.es: (1) AdSense pub-6908951782430508 (permintaan
> 33, paling dulu); (2) pembayaran live (32); (3) WhatsApp +6285692879465 (28); (4) `/acquire` US$10 juta + tombol
> tawar (29); (5) penghitung pengunjung (31); (6) feed pendapatan untuk portal pemodal tayang (26); (7) hapus PayPal
> tiruan (27); (8) hydration React #418 yang sesekali muncul di Admin → Leads; (9) template SaaS "super" (bagian 5);
> (10) SEO & penyempurnaan berkelas dunia (34).

| Prioritas | Pekerjaan | Siapa | Catatan |
|---|---|---|---|
| Tinggi | Upgrade akun Cloudflare ke Workers Paid ($5/bulan) supaya kuota D1 tidak habis tiap hari | Pemilik | Kuota gratis dipakai bersama semua situs di akun |
| Tinggi | Aktifkan R2 di dashboard Cloudflare (R2 → Purchase/Enable, paket gratis 10 GB) | Pemilik | Setelah aktif, deploy berikutnya otomatis memasang binding `UPLOADS`; unggah file dan bundle template langsung jalan |
| Tinggi | Tekan "Import company accounts (crypto + BNI)" sekali di `/portal/admin/payments` | Pemilik | Tanpa ini klien belum melihat tujuan pembayaran perusahaan |
| Tinggi | Bangun produk template SaaS (mulai dari yang paling laku), lengkap dengan demo | Studio | Lihat bagian 5 |
| Sedang | Performa mobile: skor 47, LCP 4,9 dtk, TBT 3,7 dtk (lab) | Studio | Kurangi JavaScript di halaman depan; muat widget chat secara malas (lazy) |
| Sedang | Font: preload / `font-display: swap` | Studio | Temuan audit ⚠️ |
| Sedang | Waktu respons server 1,36 dtk dari runner GitHub | Studio | Cache halaman statis di edge |
| Rendah | Verifikasi Bing Webmaster Tools | Pemilik | Impor dari Google Search Console |
| Rendah | Sertifikat kemitraan: cek tanggal "Friday, 14 October 2026" dan ejaan "XAIA.ES" | Pemilik | Ditandai dan belum diubah; perlu konfirmasi |
| ⏸️ | SEO situs lain (ulyah.com, axto.us, dll.) | — | Ditunda atas permintaan pemilik |

---

## 7. Rincian fitur terbaru

### Chat support (permintaan 17–20)

- **Pengunjung:** tombol "💬 Chat with us" di semua halaman publik (EN/ES/ID), pilihan topik, nama, email, pesan.
- **Keamanan percakapan:** percakapan terikat cookie `xaa_support` (httpOnly, secure, 90 hari), jadi browser lain tidak bisa membacanya.
- **Admin online:** selama halaman `/portal/admin/support` terbuka, admin dianggap online (heartbeat 20 detik, jendela 90 detik) dan AI diam.
- **Admin offline:** AI ulyah.com (`https://api.ulyah.com/ai/reader`, bisa diganti lewat env `SUPPORT_AI_URL`) menjawab dari paket pengetahuan publik (`src/server/support-kb.ts`).
- **Batas:** maksimal 25 balasan AI per percakapan, 40 pesan per jam, dan honeypot anti-bot.
- **Penyaring:** kunci API, alamat 0x/BTC/TRX/DOGE/SOL, rangkaian hex panjang, dan angka 10+ digit diganti `[removed]`. Alamat pembayaran hanya muncul di invoice portal klien.
- **Form kontak:** masuk sebagai percakapan bersumber "contact form".

### Pembayaran (permintaan 15–16)

- **Sumber data:** `src/content/company-payments.ts`, diambil dari repo publik ulyah.com (alamat penerima saja, tidak bisa dipakai menarik dana).
- **Crypto:** USDT TRC20, USDT/BNB BEP20, BTC, SOL, DOGE.
- **BNI wondr:** 6 akun aktif (EUR, USD, IDR, GBP, AUD, SGD) dan 7 nonaktif (CNY, HKD, JPY, MYR, SAR, KRW, THB).
- **Penyimpanan:** tersimpan terenkripsi AES-GCM di D1 dan tampil tersamar di daftar admin (tombol reveal).

### PayPal Checkout + BNI EUR/USD (permintaan 25)

- **PayPal otomatis** (`src/server/paypal.ts`, Orders v2): klien menekan "Pay with PayPal", menyetujui di
  paypal.com, kembali ke portal, dan server langsung menagih (capture) lalu mencatat pembayaran sebagai
  *confirmed* — termin proyek maupun pesanan template terbuka saat itu juga, tanpa admin.
- **Jumlah selalu dari catatan kita**, bukan dari browser; capture hanya diterima bila COMPLETED, EUR, jumlah
  persis dan membawa id checkout kita. Semua langkah idempoten (kembali dari PayPal, webhook, refresh).
- **Dua set kunci** di Admin → Settings → PayPal Checkout: Live dan Sandbox, plus pilihan mode. Tombol
  "Test Live/Sandbox credentials" memeriksa kunci ke PayPal. Kunci rahasia dienkripsi (AES-GCM) dan tidak
  pernah dikirim balik ke browser.
- **Tanpa webhook pun aman**: capture yang ditahan PayPal atau pembeli yang menutup tab dikonfirmasi saat
  halaman proyek/pesanan dibuka lagi. Payload webhook tidak pernah dipercaya — pesanan selalu dibaca ulang
  dari PayPal.
- **Webhook dibuat situs sendiri** (permintaan pemilik 14 Okt: "langsung saja dari situsnya"): menyimpan atau
  menguji kunci Live/Sandbox memeriksa kunci ke PayPal lalu membuat (atau memperbarui) webhook
  `https://xaa.es/api/paypal/webhook` dengan event Checkout order approved + Payment capture
  completed/pending/denied/refunded/reversed, dan mengisi Webhook ID otomatis. Tidak ada duplikat.
- **BNI EUR + USD**: pada database yang belum punya tujuan pembayaran, dua rekening ini dipasang otomatis
  (sekali saja per database; yang dihapus/dimatikan admin tidak dipasang lagi). Rekening USD menampilkan
  jumlah dalam dolar (kurs acuan `USD_PER_EUR`, dibulatkan ke atas).
- **Admin → Payments** menampilkan status PayPal dan 15 checkout terakhir.
- **Uji**: `tools/e2e/paypal.mjs` + `tools/e2e/paypal-mock.mjs` (PayPal tiruan, tanpa kunci asli).

### Diagnosis portal (permintaan 14)

- `/api/portal/diagnose` (khusus admin) menjalankan setiap loader portal.
- Bila `/portal` gagal, kotak merah di halaman error menampilkan langkah mana yang gagal beserta pesannya.

---

## 8. Di luar repo: CV dan lamaran kerja (Yusron Efendi)

| Pekerjaan | Status | Catatan |
|---|---|---|
| CV PDF ramah ATS (2 halaman) | ✅ | Jujur soal pengembangan dibantu AI (Claude Code); Docker/CI/Cloudflare disetel dan diuji sendiri |
| Cover letter | ✅ | Komitmen belajar bahasa negara tujuan; status: paspor saja, belum punya izin kerja |
| Portofolio PDF (semua situs di GitHub) | ✅ | 13 domain, 4 sistem klien, sekitar 380 ribu baris |
| Paket lamaran (surat + CV + ijazah asli + terjemahan tersumpah) | ✅ | Tanpa screenshot, sesuai permintaan |
| Teks profil Indeed siap tempel | ✅ | File `Indeed_Profile_ID.md` |
| Daftar lowongan yang menerima pelamar dari Indonesia | ✅ | File `Job_Tracker.md` |
| Melamar via Indeed | 🟡 | Konektor Indeed hanya bisa mencari; tidak ada fungsi melamar atau mengubah profil. Pemilik menekan tombol Apply sendiri |
| Melamar via email (lowongan yang minta CV lewat email) | 🟡 | Gmail tersambung di akun tetapi dimatikan untuk chat ini; draf email sudah disiapkan |

---

### Penawaran pemodal xaa.es (permintaan 39, menggantikan 26)

- **Mengapa**: pemilik 19 Okt — setiap situs mencari pemodalnya sendiri, bukan penghimpunan gabungan AXTO & XAA.
  Feed `GET /api/revenue` (pendapatan xaa.es untuk portal pemodal di axto.io) dihapus beserta token & form-nya;
  hash token lama dihapus dari `app_secrets` oleh migrasi skema `2026-10-19.1`.
- **Halaman `/invest`** (EN/ES/ID, `src/app/invest/page.tsx`): ketentuan putaran, rumus bagi hasil + contoh yang
  dihitung dari pengaturan, apa yang dihitung sebagai pendapatan, yang sudah ada vs untuk apa modal (jujur: produk
  template SaaS belum dibangun — bagian 5), 7 langkah, pemberitahuan risiko, FAQ (FAQPage JSON-LD), formulir.
  Bawaan **noindex dan tidak di sitemap**; pemilik bisa mengaktifkan di Settings → Investor offering.
- **Ketentuan** (`src/server/invest.ts`, Settings → Investor offering): status open/paused/closed, target, minimum,
  pool %, indeks. Bawaan = syarat 14 Okt untuk xaa.es saja: US$2.000.000, minimum US$50.000, 30 % pendapatan,
  bagian pemodal = pool × modal ÷ target (US$50.000 = 0,75 %).
- **Alur**: pengajuan → tabel `investors` + Leads (badge "xaa.es investor") + Support → admin memverifikasi modal
  yang diterima (transfer bank USD/EUR atau PayPal) di Studio desk → Investors → laporan bulanan dihitung otomatis
  sejak tanggal verifikasi (definisi pendapatan sama: termin terkonfirmasi + template lunas, tanpa Sandbox & refund)
  → admin mencatat pembayaran (`investor_payouts`) → saldo terbuka. Pemodal melihat laporannya di `/portal/investor`
  (dicocokkan lewat email pengajuan; hanya total per bulan, tanpa data klien). "Mark capital returned" saat akuisisi.
- **Uji**: `tools/e2e/invest.mjs` — 33 cek lulus di build lokal (wrangler dev): halaman 3 bahasa, noindex & sitemap,
  tidak ada tawaran gabungan, `/api/revenue` 404, minimum ditolak (isian tetap), pengajuan masuk admin & Leads,
  verifikasi 0,75 %, saldo = 0,75 % pendapatan sebenarnya (Sandbox, refund, dan pendapatan sebelum verifikasi tidak
  dihitung), payout mengurangi saldo, portal pemodal sama dengan admin, akun lain tidak melihat apa pun, pengaturan
  index/paused bekerja, tanpa error halaman. `tools/e2e/crawl.mjs`: tidak ada tautan rusak.

## 9. Changelog blueprint

- **27 Okt 2026 (4)**: permintaan 63 — 30 % untuk domain anggota adalah komisi penjualan, hanya dari domain yang terjual (bukan biaya); §10.6 dan §10.14 diperbaiki.

- **27 Okt 2026 (3)**: permintaan 59–62 dicatat; §10 ditulis ulang (14 hari per lot, produk xaa.es otomatis 35 % / +5 % Jumat 07.00 WIB, domain anggota dengan verifikasi DNS, komisi penjualan 30 %, lelang ulang, website + domain hanya admin, toko penjual ala Sedo, urutan segera berakhir + filter); §11 menu Company tersembunyi; §12 rekening ulyah.com/donasi + konversi + panduan bayar manual; §13 menu situs AdSense dan penjualan 1fr.fr, tilawa.de, xad.es, dawa.im.

- **26 Okt 2026 (2)**: Next.js 15 habis masa dukungan (2 tahun sejak 21 Okt 2024); OpenNext menolak membangunnya, jadi deploy permintaan 50 gagal. xaa.es naik ke **Next.js 16.4.3** + `@opennextjs/cloudflare` 1.20.13 + wrangler 4.152.0 (versi yang didukung, bukan flag pengecualian). Diuji lokal: typecheck, 28 unit test, build OpenNext, crawl tanpa tautan rusak, portal e2e 41/41, desktop + ponsel tanpa error konsol.

- **26 Okt 2026**: permintaan 50–53 dicatat; AdSense xaa.es → ca-pub-8991272269211824 (sebelumnya 6908951782430508), sama dengan axto.io, ulyah.com, 1fr.fr dan tilawa.de.

- **20 Okt 2026 (4)**: permintaan 45–46 dicatat; `docs/R2-DATA-BLUEPRINT.md` (semua data pindah dari D1 ke R2,
  animasi panduan pelanggan, pembayaran Live). Template Waitlist selesai: demo `/demos/waitlist/`, galeri klip di
  `/templates/waitlist`, akun demo di portal member, katalog diperbarui sesuai produk sebenarnya.

- **20 Okt 2026 (3)**: permintaan 41–44 dicatat; aplikasi HP (PWA) xaa.es dibangun (permintaan 43).
- **20 Okt 2026 (2)**: permintaan 38 — `docs/TEMPLATES-BLUEPRINT.md` (logika 18 template, repo privat, demo & gambar animasi, syarat siap produksi).
- **20 Okt 2026**: permintaan 37 — footer xaa.es menautkan axto.io (EN/ES/ID); axto.io menautkan xaa.es.
- **19 Okt 2026 (2)**: permintaan 39 — xaa.es punya penawaran pemodalnya sendiri (`/invest`, Studio desk → Investors, `/portal/investor`); feed pendapatan gabungan ke axto.io dihapus; permintaan 26 ditandai diganti; permintaan 40 dicatat.
- **19 Okt 2026**: permintaan 35–36 — `/acquire` (xaa.es dijual US$10 juta, penawaran & pembelian, pengaturan Sale of xaa.es di admin), WhatsApp pembeli +6285691234561; permintaan 37–38 dicatat.

- **14 Okt 2026**: permintaan 26 — feed pendapatan bertoken untuk portal pemodal AXTO & XAA (axto.io), tautan footer ke axto.io/invest.
- **14 Okt 2026**: permintaan 25 — PayPal Checkout otomatis (Live + Sandbox) dan rekening BNI EUR/USD siap pakai; webhook PayPal dibuat otomatis oleh situs.

- **27 Sep 2026**: blueprint dibuat. Tercatat: chat support, pembayaran, diagnosis portal, judul SEO unik per bahasa, tes E2E masuk repo, status CV/Indeed.

## 10. Lelang website, script dan domain (permintaan 55, 58, 59)

xaa.es **tidak menjual lisensi**, jadi tidak ada lelang lisensi seperti axto.io. Yang dilelang: hasil karya studio
(website jadi, script/kode, website + domain) dan **nama domain** — domain milik xaa.es maupun milik anggota.
Pembangunan dimulai setelah perbaikan SEO seluruh situs (permintaan 57).

### 10.1 Empat jenis lot dan siapa yang boleh menjual (permintaan 59)

| Jenis | Penjual | Yang diterima pemenang | Serah terima |
|---|---|---|---|
| **Web / script** (produk milik xaa.es) | **otomatis** oleh sistem; admin bisa menambah | kode sumber lengkap + dokumentasi + hak pakai/ubah, tanpa domain dan tanpa isi pribadi | arsip kode bertanda tangan (SHA-256) terbuka otomatis setelah lunas |
| **Website jadi** | admin | situs yang berjalan di hosting pembeli: kode, isi (artikel/produk), desain, akun pendukung yang disebut di lot | arsip kode + data terbuka otomatis setelah lunas; panduan pindah hosting; bantuan 14 hari |
| **Website + domain** | **hanya admin** | semua di atas + nama domainnya | kode otomatis; domain dipindah lewat kode EPP/push registrar (langkah manual karena registrar memerlukannya) |
| **Domain saja** (permintaan 58) | **anggota** (setelah verifikasi DNS, 10.5) **dan admin** | nama domain saja | kode EPP/push registrar dari penjual; pemenang mengonfirmasi domain masuk ke akunnya → lot selesai |

Anggota hanya boleh menjual **domain saja**. Formulir jual di portal anggota tidak menampilkan jenis lain, dan server
menolaknya (bukan hanya disembunyikan di tampilan).

### 10.2 Waktu lelang (permintaan 59)

- **Setiap lot berjalan 14 hari sejak dijalankan.** Lot domain anggota dan lot admin berakhir tepat 14 × 24 jam setelah
  mulai (jam dan menit yang sama), sehingga setiap lot punya waktu berakhirnya sendiri — seperti GoDaddy Auctions,
  Sedo dan Dynadot.
- **Produk milik xaa.es (web/script) berjalan otomatis**: siklus 2 minggu yang dibuka dan ditutup **Jumat 07.00 WIB**
  (00.00 UTC; jangkar 6 Nov 2026). Saat siklus ditutup, siklus berikutnya langsung dibuka untuk setiap produk yang
  aktif di katalog — tanpa admin.
- **Anti-snipe 5 menit** untuk semua lot: tawaran di 5 menit terakhir memperpanjang lot itu sampai 5 menit setelah
  tawaran tersebut (sama dengan axto.io). Lot lain dan siklus berikutnya tidak ikut bergeser.
- Penutupan terjadi otomatis (cron + penutupan malas saat halaman dibuka), idempoten: lot yang sudah ditutup tidak
  ditutup dua kali.

### 10.3 Harga (permintaan 59)

| | Produk milik xaa.es | Lot admin | Domain anggota |
|---|---|---|---|
| Harga acuan | harga normal katalog | diisi admin | **harga minta** penjual (wajib) |
| Harga buka | **35 %** dari harga acuan (tetap) | bawaan 35 %, bisa diubah | bawaan 35 %, penjual boleh memilih 10–100 % |
| Kenaikan per tawaran | **+5 % dari harga buka** (tetap) | bawaan +5 % dari harga buka | +5 % dari harga buka (tetap) |
| Harga cadangan (tidak diumumkan) | tidak ada | opsional | opsional, ≤ harga acuan |
| Beli langsung | tidak ada | opsional | opsional (= harga acuan) |

Contoh: harga normal €1.000 → buka €350 → setiap tawaran +€17,50 (dibulatkan ke atas €18): €350, €368, €386 …
Tafsiran „kenaikan 5 %“ mengikuti perintah axto.io („kenaikan 10% dari harga awal 25%“, REQUESTS 95): persen dari
harga buka. Bila pemilik menghendaki +5 % dari harga normal, cukup ubah satu angka di Settings → Auction.

### 10.4 Siapa yang menawar

- Anggota yang masuk menjadi penawar begitu memilih nama tampilan (otomatis, tanpa kode e-mail — sama dengan
  axto.io permintaan 101); nama disaring dari kata kasar, merek orang lain dan data kontak.
- Admin tidak menawar. Penjual tidak bisa menawar lotnya sendiri (diperiksa di server, juga lewat akun yang sama
  e-mail/perangkat).
- Batas: tawaran paling tinggi = harga acuan (setelah tercapai tidak ada tawaran lagi), 30 tawaran per jam per akun,
  setiap tawaran tepat di harga minimum berikutnya (harga buka, lalu tertinggi + satu kenaikan).

### 10.5 Verifikasi DNS untuk domain anggota (permintaan 59)

1. Anggota mengetik domain (dibersihkan: huruf kecil, punycode untuk IDN, tanpa `www`, TLD harus ada di daftar
   Public Suffix). Domain yang sedang dilelang, milik xaa.es/axto.io/ulyah.com, atau memuat merek terkenal ditolak.
2. Sistem membuat token acak (32 hex, berlaku 7 hari) dan menampilkan satu catatan:
   `TXT  _xaa-verify.<domain>  "xaa-verify=<token>"` — dengan panduan bergambar untuk Cloudflare, Namecheap,
   GoDaddy, Spaceship, Hostinger, Niagahoster/Rumahweb dan registrar lain.
3. Tombol **„Periksa sekarang“**: Worker bertanya ke dua resolver DNS-over-HTTPS (Cloudflare `1.1.1.1` dan Google
   `dns.google`) dan lulus bila keduanya melihat token. Pemeriksaan otomatis diulang tiap 10 menit selama 48 jam.
4. Lulus → domain tercatat **terverifikasi** untuk akun itu (dokumen `auction_domains/<domain>`, ditulis
   create-once supaya dua akun tidak bisa mengklaim domain yang sama). Catatan TXT boleh dihapus setelah lot selesai.
5. Diperiksa ulang **saat lot dimulai, saat dilelang ulang, dan sebelum dana dibayarkan ke penjual**. Bila token
   hilang sebelum lot selesai, lot dihentikan dan penawar diberi tahu.
6. Penjual juga mengisi registrar, tanggal kedaluwarsa (minimal 30 hari setelah lot berakhir) dan pernyataan bahwa
   domain tidak terkunci sengketa. Admin melihat semua data ini di Studio desk.

### 10.6 Komisi penjualan, pembayaran ke penjual, dan lelang ulang (permintaan 59, 63)

- **Komisi penjualan 30 %** dari harga akhir, **hanya bila domain anggota terjual** (lunas dan sudah diterima
  pembeli); penjual menerima 70 %. Contoh: terjual €1.000 → komisi xaa.es €300, penjual €700.
- **Tanpa biaya lain**: mendaftarkan domain, verifikasi DNS, menjalankan lelang, dan lelang ulang gratis; domain yang
  tidak laku tidak dikenai apa pun. Komisi dan contoh hitungannya tampil di formulir jual, di halaman lot (untuk
  penjual) dan di laporan penjual. Lot milik xaa.es dan admin tanpa komisi.
- Alur dana (escrow): pemenang membayar ke xaa.es → penjual mengirim kode EPP/push → pemenang mengonfirmasi domain
  sudah masuk (atau otomatis 5 hari setelah WHOIS/RDAP menunjukkan registrar/pemilik baru) → saldo penjual terbuka →
  admin mengirim 70 % lewat metode yang dipilih penjual (transfer bank, PayPal, USDT) dan mencatatnya; setiap langkah
  masuk log audit append-only.
- Pemenang tidak membayar dalam 3 hari → lot „belum membayar“; penjual boleh menawarkannya ke penawar kedua atau
  melelang ulang.
- **Lelang ulang**: bila 14 hari berlalu tanpa tawaran atau harga cadangan tidak tercapai, tombol **„Lelang ulang 14
  hari lagi“** muncul untuk penjual (dan admin). DNS diperiksa ulang; harga boleh diturunkan. Tidak ada batas jumlah
  lelang ulang, tetapi riwayatnya tampil di halaman lot.

### 10.7 Halaman penjual ala Sedo (permintaan 59, opsional untuk anggota)

- **Toko penjual** `xaa.es/auction/seller/<nama>`: profil penjual (nama tampilan, negara, bergabung sejak, jumlah
  domain terjual), semua lot domainnya yang berjalan dan yang sudah terjual, dengan filter yang sama seperti 10.8.
  Merek dan tampilan tetap milik xaa.es.
- **Halaman „domain ini sedang dilelang“** untuk domain penjual sendiri: (a) templat HTML siap unggah (unduh dari
  portal) dan (b) widget sematan `xaa.es/embed/lot/<id>` — menampilkan tawaran tertinggi, sisa waktu dan tombol
  „Tawar di xaa.es“. Tahap berikutnya: halaman yang di-host xaa.es langsung lewat CNAME (Cloudflare for SaaS).
- Anggota mengaktifkan atau mematikan toko dan halaman ini sendiri; admin bisa menonaktifkannya.

### 10.8 Daftar lelang: segera berakhir di atas, filter (permintaan 59)

- Urutan bawaan **„Segera berakhir“** (waktu berakhir paling dekat di atas); pilihan lain: terbaru, harga terendah/
  tertinggi, tawaran terbanyak, abjad, domain terpendek.
- Filter: jenis lot, kategori, penjual (xaa.es / anggota), TLD (.com, .es, .de, .io …), panjang nama, kata kunci
  (memuat / diawali / diakhiri), tanpa tanda hubung, tanpa angka, rentang harga, jumlah tawaran, berakhir dalam (1 jam /
  24 jam / 7 hari), ada beli langsung, tanpa harga cadangan, bahasa, usia domain.
- Filter tersimpan di URL (bisa dibagikan, ramah SEO hanya untuk halaman kategori; kombinasi filter `noindex`).
- Setiap baris: nama, harga sekarang, jumlah tawaran, hitung mundur langsung, lencana (xaa.es, terverifikasi DNS,
  beli langsung, cadangan tercapai).

### 10.9 Kategori (bisa ditambah/diubah di admin)

- **Website artikel / blog / AdSense**: teknologi, kesehatan, keuangan, wisata, kuliner, parenting, sains, gaya hidup,
  otomotif, olahraga, pendidikan, berita/portal.
- **SaaS**: booking & reservasi, invoice & akuntansi, CRM, link-in-bio, waitlist, LMS/kursus, HR & absensi, POS,
  helpdesk, form & survei, sistem pemilu/organisasi.
- **E-commerce**: fashion/baju (pria, wanita, anak, muslim), jam tangan, sepatu & tas, kosmetik & skincare, elektronik
  & gadget, perabot rumah, makanan & minuman, buku, mainan & hobi, perhiasan, produk digital.
- **Marketplace & direktori**, **company profile & landing page**, **portal komunitas/forum**, **portofolio kreatif**,
  **properti**, **restoran & katering**, **template xaa.es** (dari katalog `/templates`), **domain premium**.
- Setiap lot punya satu kategori utama, subkategori, bahasa, dan tag (stack, niche, negara).

### 10.10 Isi setiap lot

Judul, kategori/subkategori, jenis lot, ringkasan, deskripsi, URL demo, tangkapan layar (R2 `UPLOADS`), stack,
jumlah halaman/artikel/produk, usia situs; **domain** (nama, TLD, usia, registrar, tanggal kedaluwarsa, status DNS);
**trafik/pendapatan hanya bila terverifikasi** (tangkapan Search Console/Analytics, tanda „terverifikasi admin“;
tanpa bukti: „belum ada data“) — tidak ada janji penghasilan; daftar serah terima; harga (10.3).

### 10.11 Bayar dan serah terima

Pemenang membayar lewat checkout xaa.es (PayPal otomatis, kripto, transfer bank — §12). **Transfer bank wajib
bukti bayar dan disetujui admin**. Aset baru terbuka setelah lunas; sebelum itu pemenang tampil dengan keterangan
**„belum membayar“**. Perjanjian jual-beli aset (PDF) dibuat otomatis: daftar aset, jaminan hak, larangan klaim merek
orang lain, kebijakan pengembalian. Domain: „kode EPP dikirim“ → „domain diterima pembeli“ → lot selesai.

### 10.12 Tampilan

`/auction` (EN), `/es/subasta`, `/id/lelang` (10.8); halaman kategori `/auction/<kategori>` (JSON-LD `Product`/
`Offer`, breadcrumb, FAQ, sitemap, hreflang 3 bahasa); halaman lot: galeri, demo, aset, riwayat tawaran (nama
disamarkan), hitung mundur. **Portal anggota**: tawaran saya, kemenangan, bayar, unduh aset, serah terima domain;
**Jual domain**: verifikasi DNS, lot saya, lelang ulang, saldo & pembayaran, toko penjual. **Studio desk**: kategori,
buat/ubah lot (semua jenis), produk otomatis (nyala/mati per produk), moderasi lot anggota (hentikan dengan alasan),
tawaran (nama & e-mail), persetujuan bayar manual, serah terima, pembayaran ke penjual, log audit. Pemenang tampil di
beranda, portal anggota dan Studio desk.

### 10.13 Penyimpanan (R2 saja)

Koleksi di `src/server/r2/schema.ts`: `auctionCategories`, `auctionLots` (ringkasan di indeks: status, berakhir,
penjual, jenis, TLD, harga), `auctionBids` (create-once `<lot>.<seq>`, CAS pada lot), `auctionBidders`,
`auctionDomains` (klaim domain create-once + status DNS), `auctionPayouts` (saldo & pembayaran penjual), log
`l/auction/…` append-only; berkas di `UPLOADS`. Pesanan pembayaran memakai `templateOrders` (`auc-<lot>`). Tidak ada D1.

### 10.14 Kejujuran & hukum

Tidak menjual situs/domain dengan merek orang lain; data trafik dan pendapatan hanya yang terverifikasi; konten bebas
hak cipta pihak ketiga; komisi penjualan 30 % (hanya bila terjual) dan escrow dijelaskan sebelum anggota mendaftarkan domain; pajak/faktur sesuai
Settings → Invoicing.

### 10.15 Satu kotak surat

Semua notifikasi xaa.es (lelang, pesanan, dukungan, investor, kontak) dikirim ke **hello@axto.io** (permintaan 56).
Alamat yang dilihat klien dan alamat balas tetap hello@xaa.es.

### 10.16 Urutan kerja

1. SEO seluruh situs (permintaan 57) → 2. aturan & penyimpanan (10.2, 10.3, 10.13) → 3. Studio desk: kategori, lot,
produk otomatis → 4. halaman publik dengan urutan & filter (10.8) + portal anggota → 5. verifikasi DNS + jual domain
anggota + komisi penjualan + lelang ulang → 6. pembayaran (§12), aset otomatis, serah terima, pembayaran ke penjual → 7. toko
penjual & widget → 8. uji unit + E2E + browser desktop & HP.

## 11. Menu Company tersembunyi (permintaan 60) — ✅ dibangun 27 Okt

- Setelan `company_visible` di Settings → Site, **bawaan tersembunyi**; tombol „Show/Hide the Company menu“ di Studio
  desk (sama seperti tombol investor, permintaan 54). Setiap perubahan masuk log audit setelan.
- Saat tersembunyi: tautan Company hilang dari menu atas dan footer, `/company` (dan `/es/…`, `/id/…`) menjawab 404 +
  `noindex`, keluar dari sitemap dan `llms.txt`; tautan „PT AXTO DIGITAL GLOBAL“ di `/acquire` dan `/invest` menjadi
  teks biasa. Nama badan hukum tetap tercetak di invoice dan halaman hukum (wajib).
- Saat ditampilkan: kembali seperti sekarang.

## 12. Rekening pembayaran dari ulyah.com/donasi + panduan bayar manual (permintaan 61)

Berlaku untuk xaa.es dan axto.io (axto.io: guardian-ai REQUESTS 104, BLUEPRINT-V4 §28).

### 12.1 Sumber dan penyimpanan

- Sumber: halaman publik ulyah.com/donasi (repo ulyah.com `apps/web/src/components/CryptoDonationSection.tsx` dan
  QR di `apps/web/public/donate/`): **13 rekening wondr by BNI** — IDR, USD, SGD, AUD, GBP, CNY, EUR, HKD, JPY, MYR,
  SAR, KRW, THB — SWIFT **BNINIDJA**, kode bank **009**, nama penerima sesuai rekening; **5 dompet kripto** dengan
  jaringannya — BTC (Bitcoin), USDT (TRC20), BNB/USDT (BEP20), SOL (Solana), DOGE (Dogecoin).
- xaa.es sudah memuat data ini di `src/content/company-payments.ts` (6 rekening aktif, 7 nonaktif) dan tombol
  „Import company accounts“. Perubahan: **semua 13 rekening aktif**, QR untuk setiap dompet, dan tombol „Sinkronkan
  dari ulyah.com/donasi“ yang membandingkan data dan menampilkan perbedaan sebelum disimpan.
- Disimpan terenkripsi (AES-GCM) di R2; **tampil hanya di dalam checkout pembeli yang sudah masuk**, tidak di halaman
  publik, tidak di log, tidak di prompt AI. QR dibuat dari alamat yang tersimpan (bukan gambar luar), dengan nama
  jaringan tercetak besar di atasnya.

### 12.2 Konversi mata uang sesuai rekening BNI

- Harga xaa.es dalam EUR (axto.io dalam USD). Pembeli memilih mata uang pembayaran; sistem menampilkan rekening BNI
  **untuk mata uang itu** dan jumlah **dalam mata uang itu**.
- Kurs acuan harian dari ECB (frankfurter.app) untuk 12 mata uang; SAR lewat patokan resmi 3,75 SAR = 1 USD. Satu
  dokumen per hari `fx/<tanggal>.json` di R2 (tidak ada hot key); bila sumber gagal, kurs kemarin dipakai dan admin
  diberi tahu. Admin bisa menimpa kurs dan menambah margin (bawaan 0 %).
- Pembulatan ke atas sesuai satuan mata uang (JPY, KRW, IDR tanpa desimal; lainnya 2 desimal). **IDR mendapat kode
  unik** 3 digit di belakang (mis. Rp 6.125.437) agar transfer mudah dicocokkan.
- Jumlah, kurs dan waktunya terkunci di invoice selama 72 jam; setelah itu dihitung ulang. Selisih kecil karena biaya
  bank (≤ 2 %) diterima dan dicatat, tidak ditolak.

### 12.3 Panduan bayar manual sampai sukses

1. **Pilih cara**: transfer bank (mata uang) atau kripto (koin + jaringan). Peringatan jaringan: „Kirim hanya USDT
   lewat TRC20 ke alamat ini“ dst.
2. **Kirim jumlah persis**: tombol salin untuk nomor rekening, nama penerima, SWIFT, kode bank, jumlah dan kode
   referensi pesanan; QR untuk kripto.
3. **Cara mentransfer** sesuai asal dana (animasi singkat, mengikuti `prefers-reduced-motion`): bank Indonesia
   (BI-FAST/SKN ke BNI 009), bank luar negeri (SWIFT BNINIDJA), Wise/Revolut, dompet kripto (pilih jaringan yang sama).
4. **Unggah bukti** (gambar/PDF ke R2 privat) + hash transaksi untuk kripto.
5. **Pelacak status** di portal: „Menunggu pemeriksaan“ → „Disetujui“ (pesanan aktif otomatis) atau „Perlu
   perhatian“ dengan alasan dan langkah berikutnya (mis. jumlah kurang → transfer selisih). Pengingat bila bukti
   belum diunggah 24 jam; tombol chat dukungan di setiap langkah.
6. Admin menyetujui di Studio desk → Payments (satu klik, dengan bukti di samping jumlah yang diharapkan). Kripto:
   tahap berikutnya pengecekan hash otomatis lewat penjelajah publik (TronGrid, BscScan, mempool.space).

## 13. Menu situs AdSense: domain + website artikel (permintaan 62)

### 13.1 Menu dan isi

- Menu **AdSense sites** (`/adsense-sites`, `/es/sitios-adsense`, `/id/situs-adsense`), terhubung dari menu atas,
  footer dan halaman lelang.
- **Siap pakai**: domain + website artikel yang sudah jadi; **hanya admin yang mengisi** (Studio desk → AdSense
  sites): bahasa, niche, jumlah artikel, jumlah kata per artikel (dihitung otomatis), demo, tangkapan layar, harga,
  status (tersedia / dipesan / terjual). Dibeli dengan harga tetap lewat checkout.
- **Pesanan custom**: mulai **US$350 untuk 40 artikel** dan **US$500 untuk 100 artikel**; setiap artikel **minimal
  1.500 kata**, orisinal, riset niche & kata kunci, struktur H2/H3, FAQ, sumber, gambar dengan alt, tautan internal.
  Banyak bahasa (EN, ES, ID, FR, DE, PT, IT, NL, AR …). Klien memilih bahasa, niche dan domain (miliknya sendiri, atau
  didaftarkan untuknya dengan harga registrar). Situs selalu memuat About, Contact, Privacy, Terms, Disclaimer,
  persetujuan cookie (CMP untuk EEA/UK), `ads.txt`, sitemap, panduan Search Console. Kemajuan (artikel x/40) tampil
  di portal klien.
- **Situs mapan** (contoh penjualan dari pemilik), masing-masing **US$30.000**:

| Situs | Bahasa | Isi (database 27 Okt 2026) |
|---|---|---|
| 1fr.fr | Prancis | sama untuk keempatnya — Al-Qur'an 604 halaman mushaf dengan tajwid berwarna, **38.492 hadis** dari 12 kitab hadis, **4.967 judul kitab klasik** dalam 38 kategori, 32 kitab pesantren (1.280 bab), 108 e-book, 6.255 kisah (970 Inggris, 5.285 Indonesia; bahasa lain diterjemahkan otomatis), siaran langsung Makkah/Madinah, portal admin & donatur |
| tilawa.de | Jerman | (sama) |
| xad.es | Inggris | (sama) |
| dawa.im | Spanyol | (sama) |

- **Tidak dijual**: ulyah.com, xaa.es, axto.io — diblokir di formulir admin dan di server.
- Kejujuran: „AdSense-ready“ berarti dibangun sesuai kebijakan penayang Google; **persetujuan AdSense adalah
  keputusan Google** dan tidak dijamin; tidak ada janji trafik atau penghasilan. Salinan publik menulis „puluhan ribu
  hadis dan hampir 5.000 kitab“, bukan „puluhan ribu kitab“ (angka sebenarnya di tabel).

### 13.2 Hitungan artikel dan rencana 45 artikel

- Hitungan 27 Okt 2026: **0 artikel blog** di 1fr.fr, tilawa.de, xad.es dan dawa.im — situs ini berisi kisah, hadis,
  kitab dan Al-Qur'an, bukan blog. Kisah (6.255) bukan artikel ≥ 1.500 kata dalam bahasa situs.
- Rencana: bagian artikel baru di platform ulyah.com untuk keempat situs (`/articles` 1fr.fr, `/artikel` tilawa.de,
  `/articles` xad.es, `/articulos` dawa.im) dan **45 artikel ≥ 1.500 kata per situs** dalam bahasa situs (total 180),
  topik ibadah & pengetahuan Islam yang abadi (salat, puasa, zakat, haji/umrah, doa, adab, sejarah), dengan rujukan ke
  ayat dan hadis yang ada di situs itu sendiri. Isi disimpan sebagai berkas konten di repo (bukan D1), masuk sitemap,
  JSON-LD `Article`, dan lolos gerbang SEO.

### 13.3 Serah terima situs mapan

Keempat situs berjalan di platform bersama ulyah.com (satu Worker, data bersama). Standar penjualan: **salinan
mandiri** — kode + isi situs itu dipasang di akun Cloudflare pembeli, domain dipindah, e-mail dan akun iklan diganti ke
milik pembeli; bantuan 30 hari. Pilihan lain (bila pembeli mau): domain pindah, situs tetap di-host oleh kami dengan
perjanjian layanan. Halaman `/acquisition` yang sudah ada di 1fr.fr (tawaran minimum US$20.000) diperbarui ke
US$30.000 dan diarahkan ke daftar di xaa.es; tilawa.de, xad.es dan dawa.im mendapat halaman yang sama.

### 13.4 Penyimpanan (R2 saja)

`adsenseListings` (ringkasan di indeks: bahasa, niche, harga, status), pesanan lewat `templateOrders` (jenis
`adsense`), kemajuan pesanan custom sebagai log append-only; gambar di `UPLOADS`.

### 13.5 Urutan kerja

1. Menu + halaman 3 bahasa + SEO → 2. Studio desk: daftar siap pakai & situs mapan → 3. pesanan custom + checkout →
4. empat daftar situs mapan → 5. bagian artikel di platform ulyah.com + 45 artikel per situs → 6. uji.
