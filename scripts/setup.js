#!/usr/bin/env node
import crypto from 'crypto';
import { execSync } from 'child_process';

const run = (cmd) => {
  console.log(`\n> ${cmd}`);
  try {
    execSync(cmd, { stdio: 'inherit' });
  } catch {
    console.error(`Command failed: ${cmd}`);
    process.exit(1);
  }
};

const siteSecret = crypto.randomBytes(12).toString('base64url');
const jwtSecret = crypto.randomBytes(32).toString('base64url');

console.log('='.repeat(60));
console.log('  SWANKK — First-time setup');
console.log('='.repeat(60));

console.log('\n1. Creating D1 database...');
run('npx wrangler d1 create swankk-db');

console.log('\n2. Applying schema...');
run('npx wrangler d1 execute swankk-db --remote --file=schema.sql');

console.log('\n3. Setting secrets...');
console.log(`   SITE_SECRET = ${siteSecret}`);
console.log(`   SWANKK_JWT_SECRET = ${jwtSecret}`);
run(`echo "${siteSecret}" | npx wrangler pages secret put SITE_SECRET --project-name swankk`);
run(`echo "${jwtSecret}" | npx wrangler pages secret put SWANKK_JWT_SECRET --project-name swankk`);

console.log('\n4. Building & deploying...');
run('npm run deploy');

console.log('\n' + '='.repeat(60));
console.log('  DONE! Your site is live.');
console.log('='.repeat(60));
console.log(`\n  Share this link (keep it private):\n`);
console.log(`  https://swankk.pages.dev/?access=${siteSecret}`);
console.log(`\n  Admin panel:\n`);
console.log(`  https://swankk.pages.dev/Admin`);
console.log(`  (accessible once you've opened the link above)`);
console.log('\n' + '='.repeat(60));
