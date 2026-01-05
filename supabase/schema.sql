-- ============================================
-- SiliconSage Supabase Database Schema
-- Based on docyx/pc-part-dataset structure
-- ============================================
-- 
-- HOW TO USE:
-- 1. Go to your Supabase dashboard
-- 2. Navigate to SQL Editor
-- 3. Paste this entire file and run it
-- 4. Then run: node scripts/seed.js
--
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CPUs Table
-- ============================================
DROP TABLE IF EXISTS cpus CASCADE;
CREATE TABLE cpus (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    price DECIMAL(10, 2),
    core_count INTEGER,
    core_clock DECIMAL(5, 2), -- GHz
    boost_clock DECIMAL(5, 2), -- GHz
    microarchitecture TEXT,
    tdp INTEGER, -- Watts
    graphics TEXT, -- Integrated graphics name or null
    benchmark_score INTEGER GENERATED ALWAYS AS (
        COALESCE(core_count, 0) * 1000 + 
        COALESCE(CAST(core_clock * 1000 AS INTEGER), 0) + 
        COALESCE(CAST(boost_clock * 500 AS INTEGER), 0)
    ) STORED,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cpus_price ON cpus(price);
CREATE INDEX idx_cpus_benchmark ON cpus(benchmark_score);
CREATE INDEX idx_cpus_microarchitecture ON cpus(microarchitecture);

-- ============================================
-- GPUs (Video Cards) Table
-- ============================================
DROP TABLE IF EXISTS gpus CASCADE;
CREATE TABLE gpus (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    price DECIMAL(10, 2),
    chipset TEXT,
    memory DECIMAL(6, 2), -- GB (can be 0.25, 0.5 for older cards)
    core_clock INTEGER, -- MHz
    boost_clock INTEGER, -- MHz
    color TEXT,
    length INTEGER, -- mm
    benchmark_score INTEGER GENERATED ALWAYS AS (
        COALESCE(CAST(memory AS INTEGER), 0) * 2000 + 
        COALESCE(core_clock, 0) + 
        COALESCE(boost_clock, 0)
    ) STORED,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_gpus_price ON gpus(price);
CREATE INDEX idx_gpus_benchmark ON gpus(benchmark_score);
CREATE INDEX idx_gpus_chipset ON gpus(chipset);

-- ============================================
-- Motherboards Table
-- ============================================
DROP TABLE IF EXISTS motherboards CASCADE;
CREATE TABLE motherboards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    price DECIMAL(10, 2),
    socket TEXT,
    form_factor TEXT, -- ATX, Micro ATX, Mini ITX, etc.
    max_memory INTEGER, -- GB
    memory_slots INTEGER,
    color TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_motherboards_price ON motherboards(price);
CREATE INDEX idx_motherboards_socket ON motherboards(socket);
CREATE INDEX idx_motherboards_form_factor ON motherboards(form_factor);

-- ============================================
-- Memory (RAM) Table
-- Note: Original data has speed as [DDR, MHz] and modules as [count, size]
-- We flatten these into separate columns for easier querying
-- ============================================
DROP TABLE IF EXISTS memory CASCADE;
CREATE TABLE memory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    price DECIMAL(10, 2),
    speed_ddr INTEGER, -- DDR version (4, 5, etc.)
    speed_mhz INTEGER, -- MHz
    module_count INTEGER, -- Number of modules
    module_size INTEGER, -- GB per module
    price_per_gb DECIMAL(6, 3),
    color TEXT,
    first_word_latency DECIMAL(6, 2),
    cas_latency INTEGER,
    total_capacity INTEGER GENERATED ALWAYS AS (
        COALESCE(module_count, 0) * COALESCE(module_size, 0)
    ) STORED,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_memory_price ON memory(price);
CREATE INDEX idx_memory_speed ON memory(speed_mhz);
CREATE INDEX idx_memory_capacity ON memory(total_capacity);
CREATE INDEX idx_memory_ddr ON memory(speed_ddr);

-- ============================================
-- Storage (Internal Hard Drives) Table
-- ============================================
DROP TABLE IF EXISTS storage CASCADE;
CREATE TABLE storage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    price DECIMAL(10, 2),
    capacity INTEGER, -- GB
    price_per_gb DECIMAL(6, 4),
    type TEXT, -- "SSD" or RPM number like "7200"
    cache INTEGER, -- MB
    form_factor TEXT, -- M.2-2280, 2.5", 3.5", etc.
    interface TEXT, -- SATA, NVMe, PCIe, etc.
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_storage_price ON storage(price);
CREATE INDEX idx_storage_capacity ON storage(capacity);
CREATE INDEX idx_storage_type ON storage(type);

-- ============================================
-- Power Supplies (PSU) Table
-- ============================================
DROP TABLE IF EXISTS power_supplies CASCADE;
CREATE TABLE power_supplies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    price DECIMAL(10, 2),
    type TEXT, -- ATX, SFX, etc.
    efficiency TEXT, -- plus, bronze, silver, gold, platinum, titanium
    wattage INTEGER,
    modular TEXT, -- "Full", "Semi", or "No"
    color TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_psu_price ON power_supplies(price);
CREATE INDEX idx_psu_wattage ON power_supplies(wattage);
CREATE INDEX idx_psu_efficiency ON power_supplies(efficiency);

-- ============================================
-- Cases Table
-- ============================================
DROP TABLE IF EXISTS cases CASCADE;
CREATE TABLE cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    price DECIMAL(10, 2),
    type TEXT, -- ATX Mid Tower, mATX, etc.
    color TEXT,
    psu INTEGER, -- Included PSU wattage or null
    side_panel TEXT, -- Tempered Glass, Acrylic, etc.
    external_volume DECIMAL(8, 2), -- Liters
    internal_35_bays INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cases_price ON cases(price);
CREATE INDEX idx_cases_type ON cases(type);

-- ============================================
-- CPU Coolers Table
-- Note: rpm and noise_level can be single values or ranges
-- We store both min and max values
-- ============================================
DROP TABLE IF EXISTS cpu_coolers CASCADE;
CREATE TABLE cpu_coolers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    price DECIMAL(10, 2),
    rpm_min INTEGER,
    rpm_max INTEGER,
    noise_level_min DECIMAL(5, 1), -- dB
    noise_level_max DECIMAL(5, 1), -- dB
    color TEXT,
    size INTEGER, -- Radiator size in mm (for AIOs), null for air coolers
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_coolers_price ON cpu_coolers(price);
CREATE INDEX idx_coolers_size ON cpu_coolers(size);

-- ============================================
-- User Builds Table (for saving configurations)
-- ============================================
DROP TABLE IF EXISTS builds CASCADE;
CREATE TABLE builds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID, -- Can link to auth.users if using Supabase Auth
    name TEXT NOT NULL,
    cpu_id UUID REFERENCES cpus(id) ON DELETE SET NULL,
    gpu_id UUID REFERENCES gpus(id) ON DELETE SET NULL,
    motherboard_id UUID REFERENCES motherboards(id) ON DELETE SET NULL,
    memory_id UUID REFERENCES memory(id) ON DELETE SET NULL,
    storage_ids UUID[], -- Array of storage IDs
    psu_id UUID REFERENCES power_supplies(id) ON DELETE SET NULL,
    case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
    cooler_id UUID REFERENCES cpu_coolers(id) ON DELETE SET NULL,
    total_price DECIMAL(10, 2),
    predicted_fps INTEGER,
    bottleneck_component TEXT,
    notes TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_builds_user ON builds(user_id);
CREATE INDEX idx_builds_created ON builds(created_at);
CREATE INDEX idx_builds_public ON builds(is_public) WHERE is_public = true;

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- RLS for parts tables: DISABLED (public read-only data, seeded by admin)
-- This allows the seed script to insert without issues
-- Parts tables don't need RLS since they're not user-specific

-- Only enable RLS on builds table (user-specific data)
ALTER TABLE builds ENABLE ROW LEVEL SECURITY;

-- No RLS policies needed for parts tables (RLS is disabled)
-- They are public read-only data
CREATE POLICY "Public read access" ON power_supplies FOR SELECT USING (true);
CREATE POLICY "Public read access" ON cases FOR SELECT USING (true);
CREATE POLICY "Public read access" ON cpu_coolers FOR SELECT USING (true);

-- Builds: users can view their own + public builds
CREATE POLICY "View own or public builds" ON builds 
    FOR SELECT USING (
        auth.uid() = user_id 
        OR user_id IS NULL 
        OR is_public = true
    );

CREATE POLICY "Insert own builds" ON builds 
    FOR INSERT WITH CHECK (
        auth.uid() = user_id 
        OR user_id IS NULL
    );

CREATE POLICY "Update own builds" ON builds 
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Delete own builds" ON builds 
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- Helpful Views
-- ============================================

-- View: All parts with prices (filtered for display)
CREATE OR REPLACE VIEW cpus_priced AS
SELECT * FROM cpus WHERE price IS NOT NULL AND price > 0 ORDER BY price;

CREATE OR REPLACE VIEW gpus_priced AS
SELECT * FROM gpus WHERE price IS NOT NULL AND price > 0 ORDER BY price;

CREATE OR REPLACE VIEW motherboards_priced AS
SELECT * FROM motherboards WHERE price IS NOT NULL AND price > 0 ORDER BY price;

CREATE OR REPLACE VIEW memory_priced AS
SELECT * FROM memory WHERE price IS NOT NULL AND price > 0 ORDER BY price;

CREATE OR REPLACE VIEW storage_priced AS
SELECT * FROM storage WHERE price IS NOT NULL AND price > 0 ORDER BY price;

CREATE OR REPLACE VIEW psu_priced AS
SELECT * FROM power_supplies WHERE price IS NOT NULL AND price > 0 ORDER BY price;

CREATE OR REPLACE VIEW cases_priced AS
SELECT * FROM cases WHERE price IS NOT NULL AND price > 0 ORDER BY price;

CREATE OR REPLACE VIEW coolers_priced AS
SELECT * FROM cpu_coolers WHERE price IS NOT NULL AND price > 0 ORDER BY price;

-- ============================================
-- Useful Functions
-- ============================================

-- Function to get total capacity for a RAM configuration
CREATE OR REPLACE FUNCTION get_ram_capacity(memory_id UUID)
RETURNS INTEGER AS $$
    SELECT total_capacity FROM memory WHERE id = memory_id;
$$ LANGUAGE SQL STABLE;

-- Function to estimate build price
CREATE OR REPLACE FUNCTION estimate_build_price(
    p_cpu_id UUID,
    p_gpu_id UUID,
    p_mb_id UUID,
    p_mem_id UUID,
    p_storage_ids UUID[],
    p_psu_id UUID,
    p_case_id UUID,
    p_cooler_id UUID
)
RETURNS DECIMAL AS $$
DECLARE
    total DECIMAL := 0;
    storage_id UUID;
BEGIN
    SELECT COALESCE(price, 0) INTO total FROM cpus WHERE id = p_cpu_id;
    SELECT total + COALESCE(price, 0) INTO total FROM gpus WHERE id = p_gpu_id;
    SELECT total + COALESCE(price, 0) INTO total FROM motherboards WHERE id = p_mb_id;
    SELECT total + COALESCE(price, 0) INTO total FROM memory WHERE id = p_mem_id;
    SELECT total + COALESCE(price, 0) INTO total FROM power_supplies WHERE id = p_psu_id;
    SELECT total + COALESCE(price, 0) INTO total FROM cases WHERE id = p_case_id;
    SELECT total + COALESCE(price, 0) INTO total FROM cpu_coolers WHERE id = p_cooler_id;
    
    IF p_storage_ids IS NOT NULL THEN
        FOREACH storage_id IN ARRAY p_storage_ids LOOP
            SELECT total + COALESCE(price, 0) INTO total FROM storage WHERE id = storage_id;
        END LOOP;
    END IF;
    
    RETURN total;
END;
$$ LANGUAGE plpgsql STABLE;

