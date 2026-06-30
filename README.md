# NXS Fullstack Platform

Project ini mengubah HTML landing page, web beranda, login admin, dan admin beranda menjadi aplikasi fullstack modern:

- Frontend Framework: Next.js App Router
- Bahasa: TypeScript
- Styling: Tailwind CSS
- UI: shadcn/ui style components
- Animasi: Framer Motion
- Backend: Next.js Route Handlers + Supabase
- Database: PostgreSQL
- ORM: Prisma
- State Management: Zustand
- Form Validation: React Hook Form + Zod
- Table/Data Grid: TanStack Table
- Chart Dashboard: Recharts

## Bagian Sistem

1. **Server**
   - Next.js API Route Handlers di `src/app/api/**`
   - Prisma untuk akses database PostgreSQL/Supabase
   - Validasi request dengan Zod
   - Supabase Auth client disiapkan di `src/lib/supabase/**`

2. **Back Office / Admin Panel**
   - `/admin/login`
   - `/admin`
   - `/admin/players`
   - `/admin/transactions/new`
   - `/admin/transactions/manual`
   - `/admin/transactions/history`
   - `/admin/settings/banks`
   - `/admin/settings/branding`
   - `/admin/settings/domain`
   - `/admin/settings/template`
   - `/admin/change-password`

3. **Frontend Website**
   - `/` untuk landing page
   - `/home` untuk beranda setelah login
   - Data logo, banner, bank/e-wallet, domain, template, dan setting website dibaca dari API sehingga bisa diatur dari Admin Panel.

## Cara Menjalankan

```bash
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Buka:

- Website: `http://localhost:3000`
- Home user: `http://localhost:3000/home`
- Admin login: `http://localhost:3000/admin/login`
- Admin panel: `http://localhost:3000/admin`

## Catatan Integrasi Supabase

Isi `.env` dengan URL Supabase, anon key, service role key, dan database URL. Prisma memakai PostgreSQL milik Supabase, sementara Supabase Auth bisa digunakan untuk session/auth.

## Catatan Produksi

- Endpoint auth/admin di project ini disiapkan sebagai fondasi. Untuk production, aktifkan session Supabase, middleware role-based access, rate limit, audit log, dan proteksi upload file.
- Upload logo/banner bisa diarahkan ke Supabase Storage.
- Semua route admin sebaiknya diproteksi middleware sebelum deploy.
