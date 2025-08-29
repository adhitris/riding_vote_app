# Database Setup Instructions

## Langkah-langkah Setup Supabase

### 1. Buat Project Supabase
1. Kunjungi [supabase.com](https://supabase.com)
2. Sign up atau login
3. Klik "New project"
4. Pilih organization
5. Isi nama project (misal: "riding-vote-app")
6. Isi password database yang kuat
7. Pilih region terdekat
8. Klik "Create new project"

### 2. Setup Database Schema
1. Tunggu project selesai dibuat (biasanya 1-2 menit)
2. Di dashboard Supabase, buka menu **"SQL Editor"**
3. Klik **"New query"**
4. Copy dan paste seluruh isi file `supabase-setup-v2.sql` ke SQL editor
5. Klik **"Run"** untuk menjalankan script

### 3. Ambil API Credentials
1. Di dashboard Supabase, buka menu **"Settings"**
2. Pilih **"API"**
3. Di bagian "Project API keys", copy:
   - **Project URL** (contoh: https://abc123def.supabase.co)
   - **anon public** key (key yang panjang)

### 4. Setup Environment Variables
1. Di project Next.js, buat file `.env.local`
2. Isi dengan:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Verifikasi Setup
1. Jalankan `npm run dev`
2. Buka [http://localhost:3000](http://localhost:3000)
3. Seharusnya terlihat 2 sample trips:
   - Mountain Bike Adventure
   - Coastal Road Trip

## Schema yang Dibuat

Script akan membuat 4 table:

1. **trips** - Menyimpan informasi trip
2. **destinations** - Opsi destinasi per trip
3. **riding_dates** - Opsi tanggal per trip  
4. **votes** - Vote dari user

## Sample Data

Script juga akan mengisi sample data:
- 2 trips dengan status "planning"
- 4 destinations (2 per trip)
- 4 dates (2 per trip)
- Beberapa sample votes dari user Alice, Bob, Charlie, Eve, Frank

## Troubleshooting

**Problem**: Error "relation does not exist"
- **Solution**: Pastikan script SQL sudah dijalankan dengan benar

**Problem**: Cannot connect to Supabase
- **Solution**: Periksa URL dan API key di `.env.local`

**Problem**: No data muncul
- **Solution**: Cek di Supabase dashboard > Table editor apakah data sudah ada

**Problem**: RLS (Row Level Security) error
- **Solution**: Script sudah termasuk policy yang membolehkan akses public untuk demo

## Security Notes

Untuk production:
1. Ubah RLS policies sesuai kebutuhan
2. Implementasi authentication
3. Batasi akses berdasarkan user role
4. Gunakan environment variables yang aman
