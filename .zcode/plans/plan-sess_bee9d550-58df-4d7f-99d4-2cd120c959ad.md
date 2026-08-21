# Fix Plan: SERP Volatility UX with Real Data

## Masalah Saat Ini
Jika seorang pengguna baru menjalankan Rank Tracking 1 kali (kurang dari 2 snapshot), fungsi komputasi SERP Volatility secara hening akan mereturn `null` karena kurang data untuk diperbandingkan. UI akan menampilkan toast "SERP volatility computed successfully" namun layar akan tetap dalam state kosong (No Volatility computed yet). Hal ini membingungkan pengguna ("fitur tidak berfungsi dengan real data").

## Solusi
Ubah perlakuan kasus *"insufficient data"* dari *silent null* menjadi Exception terstruktur yang bisa dimengerti UI:

1. Di `src/server/features/serp-volatility/services/SerpVolatilityService.ts`:
   - `if (configs.length === 0)` throw `AppError("VALIDATION_ERROR", "No active rank tracking configurations found for this project.")`
   - `if (runsByConfig.size === 0)` throw `AppError("VALIDATION_ERROR", "Not enough rank tracking history. Volatility calculation requires at least two completed rank checks.")`
   - `if (positionChanges.length === 0)` throw `AppError("VALIDATION_ERROR", "No keyword position data found in recent rank checks.")`

2. Di `src/client/features/serp-volatility/SerpVolatilityView.tsx`:
   - UI akan secara otomatis menampilkan `error` pada mutasi melalui `toast.error(getStandardErrorMessage(error, "Failed to compute SERP volatility"))`. Toast ini akan langsung menampilkan pesan informatif di atas, memberitahu pengguna mengapa datanya masih belum bisa dikomputasi (karena butuh 2 rank checks).

## Verifikasi
1. `npx tsc --noEmit`
2. `npx prettier --write`
3. Commit, Push, dan trigger deploy VPS.