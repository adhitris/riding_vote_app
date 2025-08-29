# 🏍️ Riding Trip Voting App

Aplikasi voting untuk menentukan destinasi dan tanggal riding trip menggunakan Next.js 15 dan Supabase. Interface yang elegan dan modern dengan dark theme.

## Fitur

- ✅ Buat trip baru dengan multiple destinasi dan tanggal
- ✅ Vote untuk destinasi dan tanggal dalam setiap trip  
- ✅ Lihat hasil voting real-time dengan detail voter
- ✅ Interface responsif dengan dark theme yang modern
- ✅ Database real-time dengan Supabase
- ✅ Modular trip system - setiap trip terpisah
- ✅ Participant tracking per trip

## Screenshots

![Main Dashboard](docs/dashboard.png)
![Vote Modal](docs/vote-modal.png)
![Results Modal](docs/results-modal.png)
![Create Trip](docs/create-trip.png)

## Setup

### 1. Clone dan Install Dependencies

```bash
git clone <repository-url>
cd riding-vote-app
npm install
```

### 2. Setup Supabase

1. Buat akun di [Supabase](https://supabase.com)
2. Buat project baru
3. Di SQL Editor, jalankan script dari file `supabase-setup-v2.sql`
4. Copy URL dan Anon Key dari Settings > API

### 3. Environment Variables

Buat file `.env.local` dan isi dengan:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 4. Jalankan Development Server

```bash
npm run dev
```

Aplikasi akan berjalan di [http://localhost:3000](http://localhost:3000)

## Struktur Database

### Tables

1. **trips**
   - `id` (UUID) - Primary key
   - `title` (VARCHAR) - Nama trip
   - `description` (TEXT) - Deskripsi trip
   - `status` (VARCHAR) - Status: planning, active, completed
   - `created_at` (TIMESTAMP) - Waktu dibuat

2. **destinations**
   - `id` (UUID) - Primary key
   - `trip_id` (UUID) - FK ke trips
   - `name` (VARCHAR) - Nama destinasi
   - `description` (TEXT) - Deskripsi destinasi
   - `created_at` (TIMESTAMP) - Waktu dibuat

3. **riding_dates**
   - `id` (UUID) - Primary key
   - `trip_id` (UUID) - FK ke trips
   - `date` (DATE) - Tanggal riding
   - `description` (TEXT) - Deskripsi tanggal
   - `created_at` (TIMESTAMP) - Waktu dibuat

4. **votes**
   - `id` (UUID) - Primary key
   - `voter_name` (VARCHAR) - Nama voter
   - `trip_id` (UUID) - FK ke trips
   - `destination_id` (UUID) - FK ke destinations (nullable)
   - `date_id` (UUID) - FK ke riding_dates (nullable)
   - `created_at` (TIMESTAMP) - Waktu vote

## Cara Menggunakan

### 1. Membuat Trip Baru
- Klik "Create New Trip" di header
- Isi title dan description trip
- Tambahkan opsi tanggal (bisa multiple)
- Tambahkan opsi destinasi (bisa multiple)
- Klik "Create Trip"

### 2. Voting
- Pilih trip yang ingin di-vote
- Klik tombol "Vote" pada trip card
- Masukkan nama Anda
- Pilih tanggal dan/atau destinasi favorit
- Klik "Submit Vote"

### 3. Melihat Hasil
- Klik tombol "Results" pada trip card
- Lihat ranking voting dengan detail voter
- Results menampilkan nama-nama yang vote untuk setiap opsi

## Komponen Utama

- **TripCard**: Menampilkan informasi trip dan tombol aksi
- **VoteModal**: Modal untuk melakukan voting
- **ResultsModal**: Modal untuk melihat hasil voting
- **CreateTripModal**: Modal untuk membuat trip baru

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS dengan dark theme
- **Database**: Supabase (PostgreSQL)
- **Real-time**: Supabase Realtime
- **Icons**: Heroicons (SVG)

## Database Schema Migration

Jika Anda sudah memiliki data dari versi sebelumnya, jalankan script `supabase-setup-v2.sql` yang akan:
- Drop table lama dan buat schema baru
- Membuat sample data dengan 2 trip
- Setup Row Level Security policies

**⚠️ Warning**: Script ini akan menghapus semua data existing!

## Deployment

### Vercel

1. Push ke GitHub
2. Connect repository ke Vercel
3. Tambahkan environment variables di Vercel dashboard
4. Deploy

### Environment Variables for Production

```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key
```

## Features Roadmap

- [ ] Authentication dengan Supabase Auth
- [ ] Trip ownership dan permissions
- [ ] Email notifications untuk voting
- [ ] Export results ke PDF/Excel
- [ ] Multiple voting rounds
- [ ] Comment system per trip
- [ ] Trip templates
- [ ] Mobile app (React Native)

## Contributing

1. Fork repository
2. Buat feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -m 'Add new feature'`)
4. Push ke branch (`git push origin feature/new-feature`)
5. Buat Pull Request

## Sample Data

Script SQL sudah termasuk sample data:
- **Mountain Bike Adventure**: Trip dengan Blue Ridge Mountains & Smoky Mountains
- **Coastal Road Trip**: Trip dengan Pacific Coast Highway & Oregon Coast

## License

MIT License
