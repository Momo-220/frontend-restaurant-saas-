#!/usr/bin/env node

/**
 * Script pour tester les variables d'environnement
 */

console.log('🔍 TEST VARIABLES ENVIRONNEMENT');
console.log('===============================\n');

// Simuler l'environnement Next.js
process.env.NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-de-restaurant-saas-production.up.railway.app';
process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hvebxgqroqsqzpzzlruk.supabase.co';

console.log('📋 Variables détectées:');
console.log(`   NEXT_PUBLIC_API_URL: ${process.env.NEXT_PUBLIC_API_URL}`);
console.log(`   NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);

// Test construction URL
let baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-de-restaurant-saas-production.up.railway.app';
if (!baseURL.includes('/api/v1')) {
  baseURL = baseURL.replace(/\/$/, '') + '/api/v1';
}

console.log(`\n🔧 URL construite: ${baseURL}`);
console.log(`   Login endpoint: ${baseURL}/auth/login`);
console.log(`   Register endpoint: ${baseURL}/auth/register`);
console.log(`   Profile endpoint: ${baseURL}/auth/profile`);

// Test de connectivité
const https = require('https');

function testEndpoint(url) {
  return new Promise((resolve) => {
    const req = https.request(url, { method: 'POST' }, (res) => {
      console.log(`✅ ${url} → Status ${res.statusCode}`);
      resolve(res.statusCode);
    });
    
    req.on('error', (err) => {
      console.log(`❌ ${url} → Error: ${err.message}`);
      resolve(null);
    });
    
    req.setTimeout(5000, () => {
      console.log(`⏰ ${url} → Timeout`);
      req.destroy();
      resolve(null);
    });
    
    req.end();
  });
}

async function testConnectivity() {
  console.log('\n🌐 Test connectivité endpoints:');
  await testEndpoint(`${baseURL}/auth/login`);
  await testEndpoint(`${baseURL}/auth/register`);
}

testConnectivity();


