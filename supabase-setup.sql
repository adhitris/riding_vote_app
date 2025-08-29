-- SQL untuk setup database Supabase
-- Jalankan script ini di Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create destinations table
CREATE TABLE destinations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create riding_dates table
CREATE TABLE riding_dates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    date DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create votes table
CREATE TABLE votes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    voter_name VARCHAR(255) NOT NULL,
    destination_id UUID REFERENCES destinations(id) ON DELETE SET NULL,
    date_id UUID REFERENCES riding_dates(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT vote_check CHECK (destination_id IS NOT NULL OR date_id IS NOT NULL)
);

-- Create indexes for better performance
CREATE INDEX idx_votes_destination_id ON votes(destination_id);
CREATE INDEX idx_votes_date_id ON votes(date_id);
CREATE INDEX idx_votes_created_at ON votes(created_at);
CREATE INDEX idx_destinations_created_at ON destinations(created_at);
CREATE INDEX idx_riding_dates_date ON riding_dates(date);

-- Enable Row Level Security (RLS)
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE riding_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (read-only for destinations and dates, read-write for votes)
-- Anyone can read destinations
CREATE POLICY "Anyone can view destinations" ON destinations
    FOR SELECT USING (true);

-- Anyone can insert destinations (untuk demo, bisa diubah sesuai kebutuhan)
CREATE POLICY "Anyone can insert destinations" ON destinations
    FOR INSERT WITH CHECK (true);

-- Anyone can read riding dates
CREATE POLICY "Anyone can view riding_dates" ON riding_dates
    FOR SELECT USING (true);

-- Anyone can insert riding dates (untuk demo, bisa diubah sesuai kebutuhan)
CREATE POLICY "Anyone can insert riding_dates" ON riding_dates
    FOR INSERT WITH CHECK (true);

-- Anyone can read votes
CREATE POLICY "Anyone can view votes" ON votes
    FOR SELECT USING (true);

-- Anyone can insert votes
CREATE POLICY "Anyone can insert votes" ON votes
    FOR INSERT WITH CHECK (true);

-- Insert some sample data
INSERT INTO destinations (name, description) VALUES
    ('Bandung', 'Kota kembang dengan cuaca sejuk dan pemandangan indah'),
    ('Yogyakarta', 'Kota budaya dengan banyak tempat wisata sejarah'),
    ('Malang', 'Kota apel dengan udara segar dan destinasi alam'),
    ('Bogor', 'Kota hujan dengan kebun raya dan wisata alam'),
    ('Bromo', 'Gunung berapi aktif dengan pemandangan sunrise yang spektakuler');

INSERT INTO riding_dates (date, description) VALUES
    ('2025-09-15', 'Weekend riding - cuaca biasanya cerah'),
    ('2025-09-22', 'Weekend riding - hindari macet'),
    ('2025-09-29', 'Weekend riding - awal musim kemarau'),
    ('2025-10-06', 'Long weekend - Independence Day'),
    ('2025-10-13', 'Weekend riding - cuaca optimal');

-- Create a view for vote summary (optional)
CREATE OR REPLACE VIEW vote_summary AS
SELECT 
    'destination' as vote_type,
    d.id,
    d.name,
    d.description,
    COUNT(v.id) as vote_count
FROM destinations d
LEFT JOIN votes v ON d.id = v.destination_id
GROUP BY d.id, d.name, d.description
UNION ALL
SELECT 
    'date' as vote_type,
    rd.id,
    rd.date::text as name,
    rd.description,
    COUNT(v.id) as vote_count
FROM riding_dates rd
LEFT JOIN votes v ON rd.id = v.date_id
GROUP BY rd.id, rd.date, rd.description
ORDER BY vote_count DESC;
