#!/usr/bin/env node
/**
 * Script to download PC parts data from docyx/pc-part-dataset
 * 
 * Usage: node scripts/download-data.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://raw.githubusercontent.com/docyx/pc-part-dataset/main/data/json';
const DATA_DIR = path.join(__dirname, '../data/raw');

// Parts we need for SiliconSage
const PARTS_TO_DOWNLOAD = [
  'cpu',
  'cpu-cooler', 
  'motherboard',
  'memory',
  'internal-hard-drive',
  'video-card',
  'case',
  'power-supply'
];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Handle redirects
        https.get(response.headers.location, (redirectRes) => {
          redirectRes.pipe(file);
          file.on('finish', () => {
            file.close();
            resolve();
          });
        }).on('error', reject);
      } else if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      } else {
        reject(new Error(`Failed to download: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      fs.unlink(dest, () => {}); // Delete partial file
      reject(err);
    });
  });
}

async function main() {
  console.log('🚀 Starting PC Parts Data Download\n');
  
  ensureDir(DATA_DIR);
  
  for (const part of PARTS_TO_DOWNLOAD) {
    const url = `${BASE_URL}/${part}.json`;
    const dest = path.join(DATA_DIR, `${part}.json`);
    
    console.log(`📥 Downloading ${part}...`);
    
    try {
      await downloadFile(url, dest);
      const stats = fs.statSync(dest);
      const data = JSON.parse(fs.readFileSync(dest, 'utf8'));
      console.log(`   ✅ ${part}.json (${data.length} items, ${(stats.size / 1024).toFixed(1)} KB)`);
    } catch (error) {
      console.error(`   ❌ Failed to download ${part}: ${error.message}`);
    }
  }
  
  console.log('\n✨ Download complete!');
  console.log(`📁 Data saved to: ${DATA_DIR}`);
}

main().catch(console.error);
