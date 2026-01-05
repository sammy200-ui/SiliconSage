#!/usr/bin/env node
/**
 * SiliconSage Database Seed Script
 * 
 * Reads PC parts data from LOCAL JSON files in ./data/ directory
 * and inserts them into Supabase database.
 * 
 * Prerequisites:
 * 1. Ensure JSON files exist in ./data/ directory (downloaded from docyx/pc-part-dataset)
 * 2. Set up .env.local with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY
 * 3. Run the schema.sql in your Supabase dashboard first
 * 
 * Usage: node scripts/seed.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from frontend/.env.local
require('dotenv').config({ path: path.join(__dirname, '../frontend/.env.local') });

// Path to local JSON data files
const DATA_DIR = path.join(__dirname, '../data');

// Initialize Supabase client with service key (required for seeding)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials!');
  console.error('   Please set these in frontend/.env.local:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Configuration
const CONFIG = {
  // Set to Infinity to seed all items, or a number to limit (e.g., 500)
  LIMIT_PER_CATEGORY: 1000,
  // Only seed items with valid prices
  REQUIRE_PRICE: true,
  // Batch size for inserts
  BATCH_SIZE: 100,
};

/**
 * Load and parse a JSON file from the data directory
 */
function loadJsonFile(filename) {
  const filepath = path.join(DATA_DIR, filename);
  
  if (!fs.existsSync(filepath)) {
    console.warn(`⚠️  File not found: ${filename}`);
    return [];
  }
  
  try {
    const rawData = fs.readFileSync(filepath, 'utf8');
    let data = JSON.parse(rawData);
    
    // Filter by price if configured
    if (CONFIG.REQUIRE_PRICE) {
      data = data.filter(item => item.price !== null && item.price > 0);
    }
    
    // Apply limit
    if (CONFIG.LIMIT_PER_CATEGORY !== Infinity) {
      data = data.slice(0, CONFIG.LIMIT_PER_CATEGORY);
    }
    
    console.log(`   📄 Loaded ${data.length} items from ${filename}`);
    return data;
  } catch (error) {
    console.error(`   ❌ Error loading ${filename}: ${error.message}`);
    return [];
  }
}

/**
 * Insert data into a Supabase table in batches
 */
async function seedTable(tableName, data, transformFn) {
  if (data.length === 0) {
    console.log(`⏭️  Skipping ${tableName} (no data)`);
    return { inserted: 0, errors: 0 };
  }
  
  console.log(`\n📦 Seeding ${tableName}...`);
  
  // Transform data using provided function
  const transformedData = data.map(transformFn).filter(Boolean);
  
  let inserted = 0;
  let errors = 0;
  
  // Insert in batches
  for (let i = 0; i < transformedData.length; i += CONFIG.BATCH_SIZE) {
    const batch = transformedData.slice(i, i + CONFIG.BATCH_SIZE);
    const batchNum = Math.floor(i / CONFIG.BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(transformedData.length / CONFIG.BATCH_SIZE);
    
    try {
      const { error, data: result } = await supabase
        .from(tableName)
        .insert(batch)
        .select('id');
      
      if (error) {
        console.error(`   ❌ Batch ${batchNum}/${totalBatches} error: ${error.message}`);
        errors += batch.length;
      } else {
        inserted += result?.length || batch.length;
        process.stdout.write(`   ✓ Batch ${batchNum}/${totalBatches} (${inserted} total)\r`);
      }
    } catch (err) {
      console.error(`   ❌ Batch ${batchNum} exception: ${err.message}`);
      errors += batch.length;
    }
  }
  
  console.log(`   ✅ ${tableName}: ${inserted} inserted, ${errors} errors`);
  return { inserted, errors };
}

/**
 * Clear existing data from tables (optional)
 */
async function clearTables() {
  const tables = ['cpus', 'gpus', 'motherboards', 'memory', 'storage', 'power_supplies', 'cases', 'cpu_coolers'];
  
  console.log('\n🗑️  Clearing existing data...');
  
  for (const table of tables) {
    const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error && !error.message.includes('no rows')) {
      console.warn(`   ⚠️  Could not clear ${table}: ${error.message}`);
    } else {
      console.log(`   ✓ Cleared ${table}`);
    }
  }
}

/**
 * Main seeding function
 */
async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  🖥️  SiliconSage Database Seeder');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`\n📁 Data directory: ${DATA_DIR}`);
  console.log(`🔧 Limit per category: ${CONFIG.LIMIT_PER_CATEGORY}`);
  console.log(`💰 Require price: ${CONFIG.REQUIRE_PRICE}`);
  
  // Verify data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    console.error(`\n❌ Data directory not found: ${DATA_DIR}`);
    console.error('   Please ensure JSON files are in the ./data/ directory');
    process.exit(1);
  }
  
  // List available files
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
  console.log(`\n📄 Found ${files.length} JSON files:`);
  files.forEach(f => console.log(`   - ${f}`));
  
  // Optional: Clear existing data
  // await clearTables();
  
  const stats = { total: 0, errors: 0 };
  
  // ============================================
  // Seed CPUs
  // ============================================
  const cpuData = loadJsonFile('cpu.json');
  const cpuResult = await seedTable('cpus', cpuData, (cpu) => ({
    name: cpu.name,
    price: cpu.price,
    core_count: cpu.core_count,
    core_clock: cpu.core_clock,
    boost_clock: cpu.boost_clock,
    microarchitecture: cpu.microarchitecture,
    tdp: cpu.tdp,
    graphics: cpu.graphics,
  }));
  stats.total += cpuResult.inserted;
  stats.errors += cpuResult.errors;
  
  // ============================================
  // Seed GPUs (video-card.json)
  // ============================================
  const gpuData = loadJsonFile('video-card.json');
  const gpuResult = await seedTable('gpus', gpuData, (gpu) => ({
    name: gpu.name,
    price: gpu.price,
    chipset: gpu.chipset,
    memory: gpu.memory,
    core_clock: gpu.core_clock,
    boost_clock: gpu.boost_clock,
    color: gpu.color,
    length: gpu.length,
  }));
  stats.total += gpuResult.inserted;
  stats.errors += gpuResult.errors;
  
  // ============================================
  // Seed Motherboards
  // ============================================
  const mbData = loadJsonFile('motherboard.json');
  const mbResult = await seedTable('motherboards', mbData, (mb) => ({
    name: mb.name,
    price: mb.price,
    socket: mb.socket,
    form_factor: mb.form_factor,
    max_memory: mb.max_memory,
    memory_slots: mb.memory_slots,
    color: mb.color,
  }));
  stats.total += mbResult.inserted;
  stats.errors += mbResult.errors;
  
  // ============================================
  // Seed Memory (RAM)
  // ============================================
  const memData = loadJsonFile('memory.json');
  const memResult = await seedTable('memory', memData, (mem) => ({
    name: mem.name,
    price: mem.price,
    // speed is an array: [DDR_version, MHz]
    speed_ddr: Array.isArray(mem.speed) ? mem.speed[0] : null,
    speed_mhz: Array.isArray(mem.speed) ? mem.speed[1] : null,
    // modules is an array: [count, size_per_module]
    module_count: Array.isArray(mem.modules) ? mem.modules[0] : null,
    module_size: Array.isArray(mem.modules) ? mem.modules[1] : null,
    price_per_gb: mem.price_per_gb,
    color: mem.color,
    first_word_latency: mem.first_word_latency,
    cas_latency: mem.cas_latency,
  }));
  stats.total += memResult.inserted;
  stats.errors += memResult.errors;
  
  // ============================================
  // Seed Storage (internal-hard-drive.json)
  // ============================================
  const storageData = loadJsonFile('internal-hard-drive.json');
  const storageResult = await seedTable('storage', storageData, (drive) => ({
    name: drive.name,
    price: drive.price,
    capacity: drive.capacity,
    price_per_gb: drive.price_per_gb,
    type: drive.type,
    cache: drive.cache,
    form_factor: drive.form_factor,
    interface: drive.interface,
  }));
  stats.total += storageResult.inserted;
  stats.errors += storageResult.errors;
  
  // ============================================
  // Seed Power Supplies (power-supply.json)
  // ============================================
  const psuData = loadJsonFile('power-supply.json');
  const psuResult = await seedTable('power_supplies', psuData, (psu) => ({
    name: psu.name,
    price: psu.price,
    type: psu.type,
    efficiency: psu.efficiency,
    wattage: psu.wattage,
    modular: typeof psu.modular === 'boolean' ? (psu.modular ? 'Full' : 'No') : psu.modular,
    color: psu.color,
  }));
  stats.total += psuResult.inserted;
  stats.errors += psuResult.errors;
  
  // ============================================
  // Seed Cases (case.json)
  // ============================================
  const caseData = loadJsonFile('case.json');
  const caseResult = await seedTable('cases', caseData, (c) => ({
    name: c.name,
    price: c.price,
    type: c.type,
    color: c.color,
    psu: c.psu,
    side_panel: c.side_panel,
    external_volume: c.external_volume,
    internal_35_bays: c.internal_35_bays,
  }));
  stats.total += caseResult.inserted;
  stats.errors += caseResult.errors;
  
  // ============================================
  // Seed CPU Coolers (cpu-cooler.json)
  // ============================================
  const coolerData = loadJsonFile('cpu-cooler.json');
  const coolerResult = await seedTable('cpu_coolers', coolerData, (cooler) => {
    // rpm can be a single number or [min, max] array
    let rpmMin = null, rpmMax = null;
    if (Array.isArray(cooler.rpm)) {
      rpmMin = cooler.rpm[0];
      rpmMax = cooler.rpm[1];
    } else if (typeof cooler.rpm === 'number') {
      rpmMin = cooler.rpm;
      rpmMax = cooler.rpm;
    }
    
    // noise_level can be a single number or [min, max] array
    let noiseMin = null, noiseMax = null;
    if (Array.isArray(cooler.noise_level)) {
      noiseMin = cooler.noise_level[0];
      noiseMax = cooler.noise_level[1];
    } else if (typeof cooler.noise_level === 'number') {
      noiseMin = cooler.noise_level;
      noiseMax = cooler.noise_level;
    }
    
    return {
      name: cooler.name,
      price: cooler.price,
      rpm_min: rpmMin,
      rpm_max: rpmMax,
      noise_level_min: noiseMin,
      noise_level_max: noiseMax,
      color: cooler.color,
      size: cooler.size,
    };
  });
  stats.total += coolerResult.inserted;
  stats.errors += coolerResult.errors;
  
  // ============================================
  // Summary
  // ============================================
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  📊 Seeding Complete!');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  ✅ Total items inserted: ${stats.total}`);
  console.log(`  ❌ Total errors: ${stats.errors}`);
  console.log('═══════════════════════════════════════════════════════════\n');
}

// Run the seeder
main().catch((err) => {
  console.error('\n❌ Fatal error:', err.message);
  process.exit(1);
});
