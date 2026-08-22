# Rencana Penggantian Nama AI (Sam -> Jet)

Sesuai dengan pilihan "UI, URL, & Teks Saja", saya akan membatasi perubahan hanya pada hal-hal yang terlihat oleh pengguna, tanpa mengubah nama file internal atau skema database untuk meminimalisasi risiko _breakage_.

## Langkah-langkah:

1. **Ubah Rute (URL)**:
   - Ganti nama file `src/routes/_project/p/$projectId/sam.tsx` menjadi `src/routes/_project/p/$projectId/jet.tsx`.
   - Jalankan `tsr generate` agar TanStack Router mengupdate `routeTree.gen.ts`.
2. **Ubah Navigasi & Label Teks**:
   - `src/client/navigation/items.ts`: Ubah link navigasi sidebar dari `/sam` ke `/jet` dan ubah label menu menjadi "Jet".
   - `src/shared/billing-credit-features.ts`: Ubah label tag penggunaan dari "SAM Agent" menjadi "Jet".
3. **Ubah Copywriting di Halaman Web & Paywall**:
   - Edit teks pemasaran di `tierHighlights.ts` dan `pricing.tsx` (dari "SAM AI agent" menjadi "Jet AI agent").
   - Edit halaman panduan `/ai` di `src/routes/_app/ai.tsx`.
   - Edit teks sambutan (empty state & setup gate) di dalam komponen `SamConversation.tsx`, `SamChat.tsx`, dan `SamSetupGate.tsx`.
   - Edit juga pesan di chat onboarding (`OnboardingChatParts.tsx`).

4. **Ubah Kepribadian AI (System Prompt)**:
   - Modifikasi `samSystemPrompt.ts` dan instruksi awal di `SamChatAgent.ts` & `OnboardingChatAgent.ts` agar AI mengenali dirinya sebagai "Jet, the AI SEO strategist" bukan lagi "Sam".
5. **Pengujian & Deployment**:
   - Jalankan verifikasi _Type Checking_ (`npx tsc`).
   - Format kode menggunakan Prettier.
   - Commit & Push ke repository.
   - Lakukan manual deployment ke VPS agar URL `https://seotool.im/p/.../jet` langsung aktif.
