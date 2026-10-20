export const SUPABASE_PHASE_1_SQL = `-- =========================================================================
-- BUS BOOKING SYSTEM (REDBUS / ABHIBUS ARCHITECTURE)
-- PHASE 1: DEDICATED DATABASE & SCHEMA SETUP SCRIPT (REPLACES 'public')
-- =========================================================================

-- =========================================================================
-- OPTIONAL DATABASE INITIALIZATION:
-- If executing in local PostgreSQL, Docker, or pgAdmin CLI, you can create
-- and connect to the dedicated database:
--
-- CREATE DATABASE redbus_db;
-- \\c redbus_db;
-- =========================================================================

-- 1. CREATE DEDICATED SCHEMA (INSTEAD OF DEFAULT 'public')
CREATE SCHEMA IF NOT EXISTS redbus_db;

-- 2. SET ACTIVE SEARCH PATH FOR THIS SESSION
SET search_path TO redbus_db, public;

-- 3. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 4. ENUM TYPES (Created safely in redbus_db schema)
DO $$ BEGIN
    CREATE TYPE redbus_db.bus_type AS ENUM (
        'sleeper',
        'seater',
        'semi_sleeper',
        'ac_sleeper',
        'volvo_multi_axle'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE redbus_db.seat_type AS ENUM (
        'seater',
        'sleeper'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE redbus_db.deck_type AS ENUM (
        'lower',
        'upper'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE redbus_db.booking_status AS ENUM (
        'pending',
        'confirmed',
        'cancelled',
        'expired'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE redbus_db.payment_status AS ENUM (
        'pending',
        'completed',
        'failed',
        'refunded'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE redbus_db.seat_gender_preference AS ENUM (
        'any',
        'female_only',
        'male_only'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =========================================================================
-- 5. CORE TABLES (IN redbus_db SCHEMA)
-- =========================================================================

-- 5.1 CITIES TABLE
CREATE TABLE IF NOT EXISTS redbus_db.cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    code VARCHAR(10) NOT NULL UNIQUE,
    popular_terminals JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5.2 BUSES TABLE
CREATE TABLE IF NOT EXISTS redbus_db.buses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_name VARCHAR(150) NOT NULL,
    bus_number VARCHAR(30) NOT NULL UNIQUE,
    bus_type redbus_db.bus_type NOT NULL DEFAULT 'ac_sleeper',
    total_seats INT NOT NULL DEFAULT 36,
    amenities TEXT[] DEFAULT ARRAY['Wifi', 'Charging Point', 'Blanket', 'Water Bottle', 'Live Tracking'],
    rating NUMERIC(2, 1) DEFAULT 4.5 CHECK (rating >= 1.0 AND rating <= 5.0),
    total_reviews INT DEFAULT 120,
    has_ac BOOLEAN DEFAULT TRUE,
    is_live_tracking BOOLEAN DEFAULT TRUE,
    is_primo BOOLEAN DEFAULT FALSE,
    is_eco_friendly BOOLEAN DEFAULT TRUE,
    is_best_price BOOLEAN DEFAULT FALSE,
    has_ladies_seats BOOLEAN DEFAULT TRUE,
    offer_tag VARCHAR(120) DEFAULT 'FLAT ₹150 OFF • CODE: FIRSTBUS',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5.3 TRIPS TABLE (Routes, Schedules & Pricing)
CREATE TABLE IF NOT EXISTS redbus_db.trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bus_id UUID NOT NULL REFERENCES redbus_db.buses(id) ON DELETE CASCADE,
    source_city_id UUID NOT NULL REFERENCES redbus_db.cities(id) ON DELETE RESTRICT,
    destination_city_id UUID NOT NULL REFERENCES redbus_db.cities(id) ON DELETE RESTRICT,
    departure_time TIMESTAMPTZ NOT NULL,
    arrival_time TIMESTAMPTZ NOT NULL,
    base_fare NUMERIC(10, 2) NOT NULL CHECK (base_fare > 0),
    boarding_points JSONB NOT NULL DEFAULT '[]'::jsonb,
    dropping_points JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT check_trip_cities_distinct CHECK (source_city_id <> destination_city_id),
    CONSTRAINT check_trip_arrival_after_departure CHECK (arrival_time > departure_time)
);

-- 5.4 SEATS TABLE (Bus Layout Configuration)
CREATE TABLE IF NOT EXISTS redbus_db.seats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bus_id UUID NOT NULL REFERENCES redbus_db.buses(id) ON DELETE CASCADE,
    seat_number VARCHAR(10) NOT NULL,
    deck redbus_db.deck_type NOT NULL DEFAULT 'lower',
    row_index INT NOT NULL CHECK (row_index >= 0),
    col_index INT NOT NULL CHECK (col_index >= 0 AND col_index <= 5),
    seat_type redbus_db.seat_type NOT NULL DEFAULT 'sleeper',
    fare_multiplier NUMERIC(3, 2) NOT NULL DEFAULT 1.00,
    is_ladies_reserved BOOLEAN DEFAULT FALSE,
    gender_preference redbus_db.seat_gender_preference DEFAULT 'any',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_seat_per_bus UNIQUE (bus_id, deck, seat_number),
    CONSTRAINT unique_seat_grid_pos UNIQUE (bus_id, deck, row_index, col_index)
);

-- 5.5 SEAT HOLDS TABLE (Temporary 5-Minute Concurrency Lock)
CREATE TABLE IF NOT EXISTS redbus_db.seat_holds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES redbus_db.trips(id) ON DELETE CASCADE,
    seat_id UUID NOT NULL REFERENCES redbus_db.seats(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    hold_token VARCHAR(64) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_active_seat_hold UNIQUE (trip_id, seat_id)
);

-- 5.6 SHARED CAR / SAWARI TRIPS TABLE
CREATE TABLE IF NOT EXISTS redbus_db.shared_car_trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_name VARCHAR(150) NOT NULL,
    vehicle_name VARCHAR(120) NOT NULL,
    vehicle_model VARCHAR(40) NOT NULL,
    vehicle_number VARCHAR(30) NOT NULL,
    driver_name VARCHAR(120) NOT NULL,
    driver_phone VARCHAR(30) NOT NULL,
    source_city_id UUID NOT NULL REFERENCES redbus_db.cities(id) ON DELETE RESTRICT,
    destination_city_id UUID NOT NULL REFERENCES redbus_db.cities(id) ON DELETE RESTRICT,
    departure_time VARCHAR(30) NOT NULL,
    arrival_time VARCHAR(30) NOT NULL,
    duration VARCHAR(30) NOT NULL,
    base_fare NUMERIC(10, 2) NOT NULL,
    has_ac BOOLEAN DEFAULT TRUE,
    fuel_type VARCHAR(20) DEFAULT 'Diesel',
    total_seats INT NOT NULL DEFAULT 7,
    available_seats_count INT NOT NULL DEFAULT 5,
    rating NUMERIC(3, 2) DEFAULT 4.80,
    total_reviews INT DEFAULT 420,
    frequency VARCHAR(60) DEFAULT 'Every 30 Mins',
    features TEXT[] DEFAULT ARRAY['Chilled AC', 'Fastag Express Corridor', 'Roof Luggage Carrier'],
    has_captain_seats BOOLEAN DEFAULT FALSE,
    offer_tag VARCHAR(120),
    boarding_points JSONB NOT NULL DEFAULT '[]'::jsonb,
    dropping_points JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5.7 SHARED CAR SEATS TABLE
CREATE TABLE IF NOT EXISTS redbus_db.shared_car_seats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shared_car_trip_id UUID NOT NULL REFERENCES redbus_db.shared_car_trips(id) ON DELETE CASCADE,
    seat_number VARCHAR(10) NOT NULL,
    label VARCHAR(80) NOT NULL,
    row_type VARCHAR(20) NOT NULL CHECK (row_type IN ('front', 'middle', 'rear', 'jump')),
    position_type VARCHAR(30) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'available',
    booked_by_gender VARCHAR(10),
    passenger_name VARCHAR(120),
    CONSTRAINT unique_car_seat_per_trip UNIQUE (shared_car_trip_id, seat_number)
);

-- 5.8 DESTINATION HOTELS & TRANSIT STAYS TABLE
CREATE TABLE IF NOT EXISTS redbus_db.hotels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city_id UUID NOT NULL REFERENCES redbus_db.cities(id) ON DELETE CASCADE,
    city_name VARCHAR(100) NOT NULL,
    name VARCHAR(180) NOT NULL,
    location VARCHAR(255) NOT NULL,
    terminal_distance VARCHAR(100) NOT NULL,
    rating NUMERIC(3, 2) DEFAULT 4.70,
    total_reviews INT DEFAULT 500,
    original_price NUMERIC(10, 2) NOT NULL,
    discounted_price NUMERIC(10, 2) NOT NULL,
    discount_percent INT DEFAULT 70,
    image_url TEXT NOT NULL,
    amenities TEXT[] DEFAULT ARRAY['Free High-Speed WiFi', 'AC Room', 'Early 6 AM Check-In'],
    tag VARCHAR(100) DEFAULT 'redBus Exclusive Deal',
    available_rooms INT DEFAULT 8,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5.9 COUPONS & PROMOTIONAL OFFERS TABLE
CREATE TABLE IF NOT EXISTS redbus_db.coupons (
    code VARCHAR(30) PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    badge VARCHAR(50) NOT NULL,
    discount NUMERIC(10, 2) NOT NULL,
    min_fare NUMERIC(10, 2) NOT NULL DEFAULT 300.00,
    category VARCHAR(20) NOT NULL DEFAULT 'all',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5.10 BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS redbus_db.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_code VARCHAR(20) NOT NULL UNIQUE,
    booking_type VARCHAR(30) NOT NULL DEFAULT 'bus',
    user_id UUID NOT NULL,
    trip_id UUID NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    tax_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    coupon_code VARCHAR(30),
    booking_status redbus_db.booking_status NOT NULL DEFAULT 'pending',
    payment_status redbus_db.payment_status NOT NULL DEFAULT 'pending',
    payment_reference VARCHAR(100),
    payment_method VARCHAR(50),
    selected_boarding_point JSONB NOT NULL,
    selected_dropping_point JSONB NOT NULL,
    passenger_details JSONB NOT NULL,
    seat_numbers TEXT[] NOT NULL,
    booked_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5.11 BOOKING ITEMS TABLE (Granular seat allocation per booking)
CREATE TABLE IF NOT EXISTS redbus_db.booking_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES redbus_db.bookings(id) ON DELETE CASCADE,
    seat_id UUID NOT NULL REFERENCES redbus_db.seats(id) ON DELETE RESTRICT,
    passenger_name VARCHAR(120) NOT NULL,
    passenger_age INT NOT NULL CHECK (passenger_age > 0 AND passenger_age <= 120),
    passenger_gender VARCHAR(10) NOT NULL CHECK (passenger_gender IN ('male', 'female', 'other')),
    fare NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_booking_seat UNIQUE (booking_id, seat_id)
);

-- 5.12 USER PROFILES TABLE
CREATE TABLE IF NOT EXISTS redbus_db.user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(150),
    phone VARCHAR(20),
    email VARCHAR(255) UNIQUE,
    wallet_balance NUMERIC(10, 2) DEFAULT 100.00,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =========================================================================
-- 6. PERFORMANCE INDEXES
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_trips_search 
    ON redbus_db.trips (source_city_id, destination_city_id, departure_time);

CREATE INDEX IF NOT EXISTS idx_seats_bus 
    ON redbus_db.seats (bus_id, deck);

CREATE INDEX IF NOT EXISTS idx_seat_holds_lookup 
    ON redbus_db.seat_holds (trip_id, expires_at);

CREATE INDEX IF NOT EXISTS idx_bookings_user 
    ON redbus_db.bookings (user_id, booked_at DESC);

CREATE INDEX IF NOT EXISTS idx_booking_items_seat 
    ON redbus_db.booking_items (seat_id);

-- =========================================================================
-- 7. CONCURRENCY LOGIC & STORED PROCEDURES (5-MINUTE SEAT LOCKING ENGINE)
-- =========================================================================

-- 7.1 Clean Expired Seat Holds Function
CREATE OR REPLACE FUNCTION redbus_db.clean_expired_seat_holds()
RETURNS void AS $$
BEGIN
    DELETE FROM redbus_db.seat_holds
    WHERE expires_at <= NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7.2 Acquire Atomic Seat Hold (Prevents Double-Booking)
CREATE OR REPLACE FUNCTION redbus_db.acquire_seat_hold(
    p_trip_id UUID,
    p_seat_ids UUID[],
    p_user_id UUID,
    p_hold_duration_seconds INT DEFAULT 300
)
RETURNS TABLE (
    success BOOLEAN,
    hold_token VARCHAR(64),
    expires_at TIMESTAMPTZ,
    conflict_seat_id UUID,
    message TEXT
) AS $$
DECLARE
    v_token VARCHAR(64);
    v_expires_at TIMESTAMPTZ;
    v_seat UUID;
    v_existing_hold_user UUID;
BEGIN
    -- 1. Purge expired holds
    DELETE FROM redbus_db.seat_holds
    WHERE trip_id = p_trip_id AND expires_at <= NOW();

    -- 2. Verify all seats belong to this trip's bus
    IF EXISTS (
        SELECT 1
        FROM unnest(p_seat_ids) AS sid
        WHERE sid NOT IN (
            SELECT s.id 
            FROM redbus_db.seats s
            JOIN redbus_db.trips t ON t.bus_id = s.bus_id
            WHERE t.id = p_trip_id
        )
    ) THEN
        RETURN QUERY SELECT FALSE, NULL::VARCHAR, NULL::TIMESTAMPTZ, NULL::UUID, 'One or more seat IDs do not belong to this trip bus.'::TEXT;
        RETURN;
    END IF;

    -- 3. Check if any seat is already confirmed booked
    SELECT s.id INTO v_seat
    FROM unnest(p_seat_ids) AS sid(id)
    JOIN redbus_db.booking_items bi ON bi.seat_id = sid.id
    JOIN redbus_db.bookings b ON b.id = bi.booking_id
    WHERE b.trip_id = p_trip_id AND b.booking_status = 'confirmed'
    LIMIT 1;

    IF v_seat IS NOT NULL THEN
        RETURN QUERY SELECT FALSE, NULL::VARCHAR, NULL::TIMESTAMPTZ, v_seat, 'Seat is already confirmed booked by another passenger.'::TEXT;
        RETURN;
    END IF;

    -- 4. Check if any seat is actively held by ANOTHER user
    SELECT sh.seat_id, sh.user_id INTO v_seat, v_existing_hold_user
    FROM redbus_db.seat_holds sh
    WHERE sh.trip_id = p_trip_id 
      AND sh.seat_id = ANY(p_seat_ids)
      AND sh.expires_at > NOW()
      AND sh.user_id <> p_user_id
    LIMIT 1;

    IF v_seat IS NOT NULL THEN
        RETURN QUERY SELECT FALSE, NULL::VARCHAR, NULL::TIMESTAMPTZ, v_seat, 'Seat is currently held by another customer. Please choose another seat.'::TEXT;
        RETURN;
    END IF;

    -- 5. Generate secure token and hold duration timestamp
    v_token := encode(gen_random_bytes(32), 'hex');
    v_expires_at := NOW() + (p_hold_duration_seconds || ' seconds')::INTERVAL;

    -- 6. Insert or renew seat holds for requested user
    FOREACH v_seat IN ARRAY p_seat_ids LOOP
        INSERT INTO redbus_db.seat_holds (trip_id, seat_id, user_id, hold_token, expires_at)
        VALUES (p_trip_id, v_seat, p_user_id, v_token, v_expires_at)
        ON CONFLICT (trip_id, seat_id)
        DO UPDATE SET 
            user_id = EXCLUDED.user_id,
            hold_token = EXCLUDED.hold_token,
            expires_at = EXCLUDED.expires_at;
    END LOOP;

    RETURN QUERY SELECT TRUE, v_token, v_expires_at, NULL::UUID, 'Seats successfully held for 5 minutes in redbus_db.'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7.3 Release Seat Hold (User deselects or cancels)
CREATE OR REPLACE FUNCTION redbus_db.release_seat_hold(
    p_trip_id UUID,
    p_seat_ids UUID[],
    p_user_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    DELETE FROM redbus_db.seat_holds
    WHERE trip_id = p_trip_id 
      AND seat_id = ANY(p_seat_ids)
      AND user_id = p_user_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7.4 Finalize Booking Atomic Transaction
CREATE OR REPLACE FUNCTION redbus_db.finalize_booking(
    p_trip_id UUID,
    p_user_id UUID,
    p_seat_ids UUID[],
    p_payment_ref VARCHAR(100),
    p_payment_method VARCHAR(50),
    p_total_amount NUMERIC(10, 2),
    p_tax_amount NUMERIC(10, 2),
    p_boarding JSONB,
    p_dropping JSONB,
    p_passengers JSONB
)
RETURNS TABLE (
    success BOOLEAN,
    booking_id UUID,
    booking_code VARCHAR(20),
    message TEXT
) AS $$
DECLARE
    v_booking_id UUID;
    v_booking_code VARCHAR(20);
    v_seat_numbers TEXT[];
    v_item RECORD;
BEGIN
    -- 1. Check if the seats are still held by this user
    IF NOT EXISTS (
        SELECT 1
        FROM redbus_db.seat_holds sh
        WHERE sh.trip_id = p_trip_id
          AND sh.seat_id = ANY(p_seat_ids)
          AND sh.user_id = p_user_id
          AND sh.expires_at > NOW()
        HAVING COUNT(*) = array_length(p_seat_ids, 1)
    ) THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, NULL::VARCHAR, 'Seat reservation expired. Please select seats and try again.'::TEXT;
        RETURN;
    END IF;

    -- 2. Generate unique booking code e.g. RB-847291
    v_booking_code := 'RB-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 6));

    -- Collect seat numbers
    SELECT array_agg(seat_number) INTO v_seat_numbers
    FROM redbus_db.seats
    WHERE id = ANY(p_seat_ids);

    -- 3. Create the confirmed booking
    INSERT INTO redbus_db.bookings (
        booking_code,
        user_id,
        trip_id,
        total_amount,
        tax_amount,
        booking_status,
        payment_status,
        payment_reference,
        payment_method,
        selected_boarding_point,
        selected_dropping_point,
        passenger_details,
        seat_numbers
    ) VALUES (
        v_booking_code,
        p_user_id,
        p_trip_id,
        p_total_amount,
        p_tax_amount,
        'confirmed',
        'completed',
        p_payment_ref,
        p_payment_method,
        p_boarding,
        p_dropping,
        p_passengers,
        v_seat_numbers
    ) RETURNING id INTO v_booking_id;

    -- 4. Create individual booking items for each passenger
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_passengers) AS x(
        seat_id UUID,
        name VARCHAR(120),
        age INT,
        gender VARCHAR(10),
        fare NUMERIC(10, 2)
    )
    LOOP
        INSERT INTO redbus_db.booking_items (
            booking_id,
            seat_id,
            passenger_name,
            passenger_age,
            passenger_gender,
            fare
        ) VALUES (
            v_booking_id,
            v_item.seat_id,
            v_item.name,
            v_item.age,
            v_item.gender,
            v_item.fare
        );
    END LOOP;

    -- 5. Delete temporary seat holds
    DELETE FROM redbus_db.seat_holds
    WHERE trip_id = p_trip_id AND seat_id = ANY(p_seat_ids);

    RETURN QUERY SELECT TRUE, v_booking_id, v_booking_code, 'Booking confirmed successfully in redbus_db.'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES & PERMISSIONS
-- =========================================================================

-- Enable RLS across redbus_db tables
ALTER TABLE redbus_db.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE redbus_db.buses ENABLE ROW LEVEL SECURITY;
ALTER TABLE redbus_db.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE redbus_db.seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE redbus_db.seat_holds ENABLE ROW LEVEL SECURITY;
ALTER TABLE redbus_db.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE redbus_db.booking_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE redbus_db.user_profiles ENABLE ROW LEVEL SECURITY;

-- 8.1 Read Policies for Catalogs
DROP POLICY IF EXISTS "Allow public read on cities" ON redbus_db.cities;
CREATE POLICY "Allow public read on cities" ON redbus_db.cities FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read on buses" ON redbus_db.buses;
CREATE POLICY "Allow public read on buses" ON redbus_db.buses FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read on trips" ON redbus_db.trips;
CREATE POLICY "Allow public read on trips" ON redbus_db.trips FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read on seats" ON redbus_db.seats;
CREATE POLICY "Allow public read on seats" ON redbus_db.seats FOR SELECT USING (true);

-- 8.2 Seat Holds RLS
DROP POLICY IF EXISTS "Allow reading active seat holds" ON redbus_db.seat_holds;
CREATE POLICY "Allow reading active seat holds" ON redbus_db.seat_holds FOR SELECT USING (expires_at > NOW());

DROP POLICY IF EXISTS "Allow seat hold operations" ON redbus_db.seat_holds;
CREATE POLICY "Allow seat hold operations" ON redbus_db.seat_holds FOR ALL USING (true);

-- 8.3 Bookings RLS
DROP POLICY IF EXISTS "Allow bookings operations" ON redbus_db.bookings;
CREATE POLICY "Allow bookings operations" ON redbus_db.bookings FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow booking items operations" ON redbus_db.booking_items;
CREATE POLICY "Allow booking items operations" ON redbus_db.booking_items FOR ALL USING (true);

-- 8.4 User Profiles RLS
DROP POLICY IF EXISTS "Allow profile operations" ON redbus_db.user_profiles;
CREATE POLICY "Allow profile operations" ON redbus_db.user_profiles FOR ALL USING (true);

-- 8.5 SCHEMA GRANTS (Ensures API and .NET backend can access redbus_db)
GRANT USAGE ON SCHEMA redbus_db TO public;
GRANT ALL ON ALL TABLES IN SCHEMA redbus_db TO public;
GRANT ALL ON ALL ROUTINES IN SCHEMA redbus_db TO public;
GRANT ALL ON ALL SEQUENCES IN SCHEMA redbus_db TO public;
ALTER DEFAULT PRIVILEGES IN SCHEMA redbus_db GRANT ALL ON TABLES TO public;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
        GRANT USAGE ON SCHEMA redbus_db TO anon, authenticated, service_role;
        GRANT ALL ON ALL TABLES IN SCHEMA redbus_db TO anon, authenticated, service_role;
        GRANT ALL ON ALL ROUTINES IN SCHEMA redbus_db TO anon, authenticated, service_role;
    END IF;
END $$;

-- =========================================================================
-- 9. SEED DATA (POPULATING redbus_db SCHEMA)
-- =========================================================================

-- Seed Cities
INSERT INTO redbus_db.cities (id, name, state, code, popular_terminals) VALUES
('c1111111-1111-1111-1111-111111111111', 'Bengaluru', 'Karnataka', 'BLR', '["Majestic (Kempegowda)", "Madiwala", "Electronic City", "Indiranagar", "Silk Board"]'::jsonb),
('c2222222-2222-2222-2222-222222222222', 'Hyderabad', 'Telangana', 'HYD', '["Ameerpet", "Gachibowli", "MGBS", "Kukatpally", "Lakdikapul"]'::jsonb),
('c3333333-3333-3333-3333-333333333333', 'Mumbai', 'Maharashtra', 'BOM', '["Dadar", "Borivali East", "Vashi", "Andheri East", "Chembur"]'::jsonb),
('c4444444-4444-4444-4444-444444444444', 'Pune', 'Maharashtra', 'PNQ', '["Shivajinagar", "Swargate", "Wakad", "Hinjewadi Bridge", "Viman Nagar"]'::jsonb),
('c5555555-5555-5555-5555-555555555555', 'Chennai', 'Tamil Nadu', 'MAA', '["Koyambedu", "Guindy", "Tambaram", "Perungalathur", "Ashok Nagar"]'::jsonb),
('c6666666-6666-6666-6666-666666666666', 'Goa (Panaji)', 'Goa', 'GOI', '["Panjim KTC Bus Stand", "Mapusa", "Margao", "Porvorim"]'::jsonb)
ON CONFLICT (code) DO NOTHING;

-- Seed Buses
INSERT INTO redbus_db.buses (id, operator_name, bus_number, bus_type, total_seats, amenities, rating, total_reviews, has_ac) VALUES
('b1111111-1111-1111-1111-111111111111', 'IntrCity SmartBus', 'KA-01-AK-7788', 'ac_sleeper', 36, ARRAY['Wifi', 'USB Charging', 'Blanket', 'Pillow', 'Live GPS Tracking', 'Emergency SOS'], 4.8, 482, TRUE),
('b2222222-2222-2222-2222-222222222222', 'Zingbus Premium', 'TS-09-UB-4412', 'volvo_multi_axle', 36, ARRAY['Wifi', 'Water Bottle', 'Blanket', 'Reading Light', 'Charging Point'], 4.6, 319, TRUE),
('b3333333-3333-3333-3333-333333333333', 'Orange Tours and Travels', 'KA-05-OR-9911', 'ac_sleeper', 36, ARRAY['Live Tracking', 'Deep Cleaned', 'Blanket', 'Water Bottle'], 4.5, 620, TRUE),
('b4444444-4444-4444-4444-444444444444', 'SRS Travels Express', 'MH-12-SR-1234', 'semi_sleeper', 36, ARRAY['Pushback Seats', 'Charging Point', 'Emergency Hammer'], 4.2, 850, TRUE)
ON CONFLICT (bus_number) DO NOTHING;

-- Seed Trips
INSERT INTO redbus_db.trips (id, bus_id, source_city_id, destination_city_id, departure_time, arrival_time, base_fare, boarding_points, dropping_points) VALUES
(
    'a1111111-1111-1111-1111-111111111111',
    'b1111111-1111-1111-1111-111111111111',
    'c1111111-1111-1111-1111-111111111111', -- Bengaluru
    'c2222222-2222-2222-2222-222222222222', -- Hyderabad
    NOW() + INTERVAL '1 day 14 hours',
    NOW() + INTERVAL '1 day 22 hours 30 minutes',
    899.00,
    '[{"id":"bp1","time":"21:00","location":"Majestic Anand Rao Circle","landmark":"Opp. SRS Travels"},{"id":"bp2","time":"21:45","location":"Madiwala","landmark":"Near Ayyappa Temple"},{"id":"bp3","time":"22:15","location":"Hebbal Flyover","landmark":"Esteem Mall"}]'::jsonb,
    '[{"id":"dp1","time":"05:30","location":"Shamshabad Airport Road","landmark":"Toll Gate"},{"id":"dp2","time":"06:15","location":"Gachibowli","landmark":"ORR Exit 19"},{"id":"dp3","time":"07:00","location":"Ameerpet","landmark":"Metro Pillar 1042"}]'::jsonb
),
(
    'a2222222-2222-2222-2222-222222222222',
    'b2222222-2222-2222-2222-222222222222',
    'c1111111-1111-1111-1111-111111111111', -- Bengaluru
    'c2222222-2222-2222-2222-222222222222', -- Hyderabad
    NOW() + INTERVAL '1 day 16 hours',
    NOW() + INTERVAL '2 days 1 hour',
    1150.00,
    '[{"id":"bp1","time":"22:30","location":"Electronic City Toll","landmark":"Near Toll Plaza"},{"id":"bp2","time":"23:15","location":"Silk Board","landmark":"Central Silk Board Junction"}]'::jsonb,
    '[{"id":"dp1","time":"06:45","location":"Lakdikapul","landmark":"Near Telephone Bhavan"},{"id":"dp2","time":"07:30","location":"Secunderabad","landmark":"Near Railway Station"}]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- Seed Seats for Bus 1 (Lower & Upper Deck Layout)
INSERT INTO redbus_db.seats (id, bus_id, seat_number, deck, row_index, col_index, seat_type, fare_multiplier) VALUES
('e1111111-1111-1111-1111-111111111101', 'b1111111-1111-1111-1111-111111111111', 'L1', 'lower', 0, 0, 'sleeper', 1.00),
('e1111111-1111-1111-1111-111111111102', 'b1111111-1111-1111-1111-111111111111', 'L2', 'lower', 0, 1, 'sleeper', 1.00),
('e1111111-1111-1111-1111-111111111103', 'b1111111-1111-1111-1111-111111111111', 'L3', 'lower', 0, 3, 'sleeper', 1.00),
('e1111111-1111-1111-1111-111111111104', 'b1111111-1111-1111-1111-111111111111', 'L4', 'lower', 0, 4, 'sleeper', 1.00),
('e1111111-1111-1111-1111-111111111105', 'b1111111-1111-1111-1111-111111111111', 'L5', 'lower', 1, 0, 'sleeper', 1.00),
('e1111111-1111-1111-1111-111111111106', 'b1111111-1111-1111-1111-111111111111', 'L6', 'lower', 1, 1, 'sleeper', 1.00),
('e1111111-1111-1111-1111-111111111107', 'b1111111-1111-1111-1111-111111111111', 'L7', 'lower', 1, 3, 'sleeper', 1.00),
('e1111111-1111-1111-1111-111111111108', 'b1111111-1111-1111-1111-111111111111', 'L8', 'lower', 1, 4, 'sleeper', 1.00),
('e1111111-1111-1111-1111-111111111109', 'b1111111-1111-1111-1111-111111111111', 'U1', 'upper', 0, 0, 'sleeper', 1.15),
('e1111111-1111-1111-1111-111111111110', 'b1111111-1111-1111-1111-111111111111', 'U2', 'upper', 0, 1, 'sleeper', 1.15),
('e1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'U3', 'upper', 0, 3, 'sleeper', 1.15),
('e1111111-1111-1111-1111-111111111112', 'b1111111-1111-1111-1111-111111111111', 'U4', 'upper', 0, 4, 'sleeper', 1.15)
ON CONFLICT (bus_id, deck, seat_number) DO NOTHING;
`;
