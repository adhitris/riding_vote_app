-- Updated SQL schema for trip-based voting system

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (careful in production!)
DROP TABLE IF EXISTS votes CASCADE;
DROP TABLE IF EXISTS destinations CASCADE;
DROP TABLE IF EXISTS riding_dates CASCADE;

-- Create trips table
CREATE TABLE trips (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    passcode VARCHAR(50) NOT NULL DEFAULT '',
    status VARCHAR(20) DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create destinations table (linked to trips)
CREATE TABLE destinations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create riding_dates table (linked to trips)
CREATE TABLE riding_dates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create votes table
CREATE TABLE votes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    voter_name VARCHAR(255) NOT NULL,
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    destination_id UUID REFERENCES destinations(id) ON DELETE SET NULL,
    date_id UUID REFERENCES riding_dates(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT vote_check CHECK (destination_id IS NOT NULL OR date_id IS NOT NULL),
    UNIQUE(voter_name, trip_id, destination_id),
    UNIQUE(voter_name, trip_id, date_id)
);

-- Create indexes for better performance
CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_destinations_trip_id ON destinations(trip_id);
CREATE INDEX idx_riding_dates_trip_id ON riding_dates(trip_id);
CREATE INDEX idx_votes_trip_id ON votes(trip_id);
CREATE INDEX idx_votes_destination_id ON votes(destination_id);
CREATE INDEX idx_votes_date_id ON votes(date_id);

-- Enable Row Level Security (RLS)
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE riding_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Anyone can view trips" ON trips FOR SELECT USING (true);
CREATE POLICY "Anyone can insert trips" ON trips FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update trips" ON trips FOR UPDATE USING (true);

CREATE POLICY "Anyone can view destinations" ON destinations FOR SELECT USING (true);
CREATE POLICY "Anyone can insert destinations" ON destinations FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view riding_dates" ON riding_dates FOR SELECT USING (true);
CREATE POLICY "Anyone can insert riding_dates" ON riding_dates FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view votes" ON votes FOR SELECT USING (true);
CREATE POLICY "Anyone can insert votes" ON votes FOR INSERT WITH CHECK (true);

-- Insert sample data
INSERT INTO trips (title, description, passcode, status) VALUES
    ('Mountain Bike Adventure', 'Epic mountain biking through scenic trails', 'BIKE2025', 'planning'),
    ('Coastal Road Trip', 'Scenic coastal riding adventure', 'COAST123', 'planning');

-- Get trip IDs for reference
DO $$
DECLARE
    mountain_trip_id UUID;
    coastal_trip_id UUID;
BEGIN
    SELECT id INTO mountain_trip_id FROM trips WHERE title = 'Mountain Bike Adventure';
    SELECT id INTO coastal_trip_id FROM trips WHERE title = 'Coastal Road Trip';
    
    -- Insert destinations
    INSERT INTO destinations (trip_id, name, description) VALUES
        (mountain_trip_id, 'Blue Ridge Mountains', 'Beautiful mountain trails with scenic views'),
        (mountain_trip_id, 'Smoky Mountains', 'Challenging trails through misty peaks'),
        (coastal_trip_id, 'Pacific Coast Highway', 'Iconic coastal highway with ocean views'),
        (coastal_trip_id, 'Oregon Coast', 'Rugged coastline with dramatic cliffs');
    
    -- Insert dates
    INSERT INTO riding_dates (trip_id, date, description) VALUES
        (mountain_trip_id, '2025-08-22', 'Perfect weather for mountain riding'),
        (mountain_trip_id, '2025-08-29', 'Alternative weekend option'),
        (coastal_trip_id, '2025-09-10', 'Ideal coastal riding conditions'),
        (coastal_trip_id, '2025-09-17', 'Backup date for coastal trip');
    
    -- Insert some sample votes
    INSERT INTO votes (voter_name, trip_id, destination_id, date_id) 
    SELECT 'Alice', t.id, d.id, rd.id 
    FROM trips t, destinations d, riding_dates rd 
    WHERE t.title = 'Mountain Bike Adventure' 
    AND d.name = 'Blue Ridge Mountains' 
    AND rd.date = '2025-08-22'
    AND d.trip_id = t.id AND rd.trip_id = t.id;
    
    INSERT INTO votes (voter_name, trip_id, destination_id, date_id) 
    SELECT 'Bob', t.id, d.id, rd.id 
    FROM trips t, destinations d, riding_dates rd 
    WHERE t.title = 'Mountain Bike Adventure' 
    AND d.name = 'Blue Ridge Mountains' 
    AND rd.date = '2025-08-22'
    AND d.trip_id = t.id AND rd.trip_id = t.id;
    
    INSERT INTO votes (voter_name, trip_id, destination_id, date_id) 
    SELECT 'Charlie', t.id, d.id, rd.id 
    FROM trips t, destinations d, riding_dates rd 
    WHERE t.title = 'Mountain Bike Adventure' 
    AND d.name = 'Smoky Mountains' 
    AND rd.date = '2025-08-29'
    AND d.trip_id = t.id AND rd.trip_id = t.id;
    
    INSERT INTO votes (voter_name, trip_id, destination_id, date_id) 
    SELECT 'Eve', t.id, d.id, rd.id 
    FROM trips t, destinations d, riding_dates rd 
    WHERE t.title = 'Coastal Road Trip' 
    AND d.name = 'Pacific Coast Highway' 
    AND rd.date = '2025-09-10'
    AND d.trip_id = t.id AND rd.trip_id = t.id;
    
    INSERT INTO votes (voter_name, trip_id, destination_id, date_id) 
    SELECT 'Frank', t.id, d.id, rd.id 
    FROM trips t, destinations d, riding_dates rd 
    WHERE t.title = 'Coastal Road Trip' 
    AND d.name = 'Pacific Coast Highway' 
    AND rd.date = '2025-09-10'
    AND d.trip_id = t.id AND rd.trip_id = t.id;
END $$;
