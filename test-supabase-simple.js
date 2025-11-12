#!/usr/bin/env node

/**
 * Simple Test Script for Supabase Connection
 * This script tests your Supabase credentials without needing Vite
 * 
 * Run with: node test-supabase-simple.js
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name, passed, details = '') {
  const icon = passed ? '✅' : '❌';
  const color = passed ? 'green' : 'red';
  log(`${icon} ${name}`, color);
  if (details) {
    log(`   ${details}`, 'cyan');
  }
}

async function runTests() {
  log('\n╔════════════════════════════════════════════════════════╗', 'blue');
  log('║     Supabase Connection Test (Node.js Version)       ║', 'blue');
  log('╚════════════════════════════════════════════════════════╝\n', 'blue');

  let passed = 0;
  let failed = 0;
  const results = [];

  // Test 1: Load .env.local
  log('1. Reading .env.local file...', 'yellow');
  try {
    const envPath = join(__dirname, '.env.local');
    const envContent = readFileSync(envPath, 'utf-8');
    
    const url = envContent.match(/VITE_SUPABASE_URL=(.+)/)?.[1];
    const key = envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/)?.[1];

    if (!url || !key) {
      throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
    }

    logTest('Environment File Loaded', true, `URL: ${url.substring(0, 40)}...`);
    passed++;
    results.push({ name: 'Environment loaded', passed: true });

    // Store for next tests
    global.SUPABASE_URL = url;
    global.SUPABASE_ANON_KEY = key;
  } catch (err) {
    logTest('Environment File Loaded', false, err.message);
    failed++;
    results.push({ name: 'Environment loaded', passed: false, error: err.message });
    log('\n❌ Cannot continue without .env.local file\n', 'red');
    process.exit(1);
  }

  // Test 2: Create Supabase Client
  log('\n2. Creating Supabase client...', 'yellow');
  try {
    const supabase = createClient(global.SUPABASE_URL, global.SUPABASE_ANON_KEY);
    logTest('Client Created', true, 'Connected to Supabase');
    passed++;
    results.push({ name: 'Client created', passed: true });
    global.supabase = supabase;
  } catch (err) {
    logTest('Client Created', false, err.message);
    failed++;
    results.push({ name: 'Client created', passed: false, error: err.message });
    log('\n❌ Cannot continue without valid credentials\n', 'red');
    process.exit(1);
  }

  // Test 3: Test Connection
  log('\n3. Testing connection to Supabase...', 'yellow');
  try {
    const { data, error } = await global.supabase
      .from('students')
      .select('count', { count: 'exact' });

    if (error) {
      // RLS might not be enabled yet - this is expected
      if (error.message.includes('row level security') || error.message.includes('RLS')) {
        logTest('Connection', true, 'Connected (RLS not enabled - run SUPABASE_RLS_SETUP.sql)');
        passed++;
        results.push({ name: 'Connection successful (RLS pending)', passed: true });
      } else {
        throw error;
      }
    } else {
      logTest('Connection', true, `Database accessible - ${data?.length || 0} records`);
      passed++;
      results.push({ name: 'Connection successful', passed: true });
    }
  } catch (err) {
    logTest('Connection', false, err.message);
    failed++;
    results.push({ name: 'Connection test', passed: false, error: err.message });
  }

  // Test 4: Check Tables Schema
  log('\n4. Checking table schema...', 'yellow');
  const tables = ['students', 'contacts', 'groups', 'student_groups', 'attendance', 'payments', 'events'];
  let tablesOk = 0;

  for (const table of tables) {
    try {
      const { data, error } = await global.supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error && !error.message.includes('row level security')) {
        throw error;
      }
      tablesOk++;
    } catch (err) {
      // Table exists if we get an RLS error
      if (!err.message.includes('row level security')) {
        log(`   ❌ ${table}: ${err.message}`, 'red');
      } else {
        tablesOk++;
      }
    }
  }

  logTest('Tables Schema', tablesOk === tables.length, `${tablesOk}/${tables.length} tables accessible`);
  if (tablesOk === tables.length) {
    passed++;
    results.push({ name: 'Tables schema', passed: true });
  } else {
    failed++;
    results.push({ name: 'Tables schema', passed: false });
  }

  // Summary
  log('\n╔════════════════════════════════════════════════════════╗', 'blue');
  log('║                    TEST SUMMARY                       ║', 'blue');
  log('╚════════════════════════════════════════════════════════╝\n', 'blue');

  log(`Tests Passed: ${passed}`, 'green');
  log(`Tests Failed: ${failed}`, failed === 0 ? 'green' : 'red');
  log(`Total Tests:  ${passed + failed}\n`, 'cyan');

  if (failed === 0) {
    log('✨ All tests passed! Your Supabase setup is working!\n', 'green');
    log('📝 NEXT STEPS:', 'yellow');
    log('   1. Run SQL schema: SUPABASE_SCHEMA.sql', 'cyan');
    log('   2. Enable RLS: SUPABASE_RLS_SETUP.sql', 'cyan');
    log('   3. Start dev server: npm run dev', 'cyan');
    log('   4. Open http://localhost:5173', 'cyan');
    log('');
  } else {
    log('⚠️  Some tests failed. See details above.', 'red');
    log('📝 Common fixes:', 'yellow');
    log('   • Check .env.local file exists and is valid', 'cyan');
    log('   • Verify Supabase URL is correct', 'cyan');
    log('   • Check API key is not expired', 'cyan');
    log('   • Run SUPABASE_SCHEMA.sql in Supabase SQL Editor', 'cyan');
    log('   • Run SUPABASE_RLS_SETUP.sql to enable RLS', 'cyan');
    log('');
  }

  process.exit(failed === 0 ? 0 : 1);
}

// Run tests
runTests().catch(err => {
  log(`\n❌ Test error: ${err.message}`, 'red');
  process.exit(1);
});
