# Fix Plan: SERP Volatility Empty State UX & Error Fix

## Masalah Saat Ini
1. Masih terdapat satu kondisi `return null` secara diam-diam di `SerpVolatilityService.ts` pada baris ke-54 (`if (recentRuns.length < 2) return null;`) yang saya terlewat pada perbaikan sebelumnya. Akibatnya, jika user benar-benar baru menjalankan 1 kali (atau 0 kali), fungsi ini gagal tanpa memberi toast error yang dijanjikan.
2. Pengguna masih belum tahu mengapa UI menampilkan "No SERP Volatility computed yet". Hanya menekan "Compute Volatility" untuk mendapatkan pesan error bukanlah UX yang baik.

## Solusi
1. Ganti `return null` yang tersisa di `computeVolatility` dengan `throw new AppError(...)`.
2. Buat fungsi baru `SerpVolatilityService.checkEligibility(projectId)` yang secara efisien memeriksa apakah project ini siap dikomputasi (mempunyai konfigurasi rank tracking dengan minimal 2 kali run).
3. Panggil fungsi ini dalam `getSerpVolatility` dan kembalikan properti `isComputable`.
4. Di `SerpVolatilityView.tsx`, ubah tampilan `!latest` state. Jika `!isComputable`, ubah teks "No SERP Volatility computed yet" menjadi penjelasan yang ramah ("Not enough data... requires at least two completed rank checks"), dan *disable* tombol "Compute Volatility". Jika `isComputable` barulah tombol "Compute Volatility" aktif dengan deskripsi "Ready to compute".

## Perubahan File
1. `src/server/features/serp-volatility/services/SerpVolatilityService.ts`: Hapus `return null` dan lempar `AppError`. Tambahkan fungsi `checkEligibility`.
2. `src/serverFunctions/serp-volatility.ts`: Tambahkan `isComputable` di return value.
3. `src/client/features/serp-volatility/SerpVolatilityView.tsx`: Gunakan flag `isComputable` untuk merubah UI (teks dan disabled state button).

## Verifikasi
1. `npx tsc --noEmit`
2. Prettier
3. Commit, Push, dan trigger deploy VPS.