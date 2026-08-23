# Fix Plan: GMB Grid Form Unclickable

## Masalah Saat Ini
Form pada halaman Local Map Rank (`/p/.../gmb-grid`) tidak bisa diklik atau ditgetik pada bagian "Business Name".
Akar masalahnya adalah kolom "Business Name" menggunakan komponen `usePlacesAutocomplete` yang mengharuskan Google Maps JavaScript API di-load pada halaman tersebut. Karena aplikasi SeoTool.im belum memuat library Google Maps (tidak ada script `<script src="https://maps.googleapis.com/..."></script>`), status library selalu `ready = false`, sehingga kode menetapkan `disabled={true}` secara permanen pada input tersebut. 

Hal ini "mengunci" keseluruhan form, karena field lainnya bergantung pada hasil otomatis dari profil yang dicari.

## Solusi
Karena aplikasi ini dibangun agar tidak memerlukan langganan ke banyak layanan eksternal jika bisa (saat ini menggunakan Leaflet open-source untuk petanya), kita perlu melakukan penyesuaian:

1. **Fallback ke Input Manual**: Hapus `disabled={!ready}` di `GmbAutocomplete.tsx`. Biarkan pengguna tetap bisa mengetikkan nama bisnis secara manual jika API Google Places tidak tersedia. Pengguna dapat mengisi secara manual nama bisnis serta koordinat (Latitude/Longitude) di kolom form lainnya yang sudah tersedia.
2. **Perbaikan State Z-Index / Leaflet Map**: Peta (Leaflet) di sebelah kanan dapat "bocor" (z-index tumpang tindih) ke atas form jika ukuran layar (grid) bersempitan. Saya akan memastikan form memiliki `z-index` atau `position: relative` yang aman sehingga selalu dapat diklik.
3. **Mengaktifkan `auto_detect` tanpa Place ID**: Mengatur auto-detect (jika DataForSEO bisa mendeteksi dari string nama) atau memperingatkan jika koordinat manual kurang.

*Pertimbangan untuk masa depan: Jika ingin fitur autocomplete ini berjalan otomatis, Anda harus mendaftarkan Google Maps API Key dan memuatnya secara dinamis.*

## Perubahan Kode
- `src/client/features/gmb-grid/components/GmbAutocomplete.tsx`:
  - Ubah `disabled={!ready}` menjadi `disabled={false}`.
  - Tambahkan state fallback. Ketika user mengetik namun Google Maps tidak merespons (status bukan OK), onChange akan meneruskan nilai `name` ke parent komponen untuk diisi manual pada form `businessName`.
- `src/client/features/gmb-grid/GmbGridView.tsx`:
  - Perbaiki z-index peta & form container (`z-10 relative`).
  - Hapus blokir dari *auto-detect* jika placeId tidak ada, asalkan koordinat dan nama ada.

## Verifikasi
- Tsc + Linter check
- Commit, Push dan Deploy ke VPS.