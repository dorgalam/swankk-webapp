#!/usr/bin/env node
/**
 * GA4 Setup Script
 * Registers custom dimensions and conversion events via the Google Analytics Admin API.
 *
 * Usage: node scripts/ga4-setup.mjs
 *
 * Reads swankk.json (service account) from the project root.
 */

import { readFileSync } from 'fs';
import { createSign } from 'crypto';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));
const SA = JSON.parse(readFileSync(join(__dir, '..', 'swankk.json'), 'utf8'));
const PROPERTY_ID = '526971159';
const BASE = `https://analyticsadmin.googleapis.com/v1beta/properties/${PROPERTY_ID}`;

// ── Auth ─────────────────────────────────────────────────────────────────────

function b64url(obj) {
  return Buffer.from(JSON.stringify(obj)).toString('base64url');
}

async function getToken() {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url({ alg: 'RS256', typ: 'JWT' });
  const claims = b64url({
    iss: SA.client_email,
    scope: [
      'https://www.googleapis.com/auth/analytics.edit',
      'https://www.googleapis.com/auth/analytics.readonly',
    ].join(' '),
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  });

  const input = `${header}.${claims}`;
  const sign = createSign('RSA-SHA256');
  sign.update(input);
  const sig = sign.sign(SA.private_key, 'base64url');
  const jwt = `${input}.${sig}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error(JSON.stringify(data));
  return data.access_token;
}

// ── API helpers ───────────────────────────────────────────────────────────────

async function ga4post(token, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    if (data.error?.status === 'ALREADY_EXISTS') return { alreadyExists: true };
    throw new Error(JSON.stringify(data.error ?? data));
  }
  return data;
}

async function ga4list(token, path) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

// ── Custom dimensions ─────────────────────────────────────────────────────────

const DIMENSIONS = [
  { displayName: 'Designer Slug',  parameterName: 'designer_slug',  description: 'Slug of the designer page viewed' },
  { displayName: 'Designer Name',  parameterName: 'designer_name',  description: 'Name of the designer page viewed' },
  { displayName: 'Trend Slug',     parameterName: 'trend_slug',     description: 'Slug of the trend page viewed' },
  { displayName: 'Trend Name',     parameterName: 'trend_name',     description: 'Name of the trend page viewed' },
  { displayName: 'Era Name',       parameterName: 'era_name',       description: 'Name of the era viewed' },
  { displayName: 'Tag Slug',       parameterName: 'tag_slug',       description: 'Slug of the style tag viewed' },
  { displayName: 'Tag Name',       parameterName: 'tag_name',       description: 'Name of the style tag viewed' },
  { displayName: 'Nav Label',      parameterName: 'nav_label',      description: 'Navigation item clicked' },
  { displayName: 'Search Term',    parameterName: 'search_term',    description: 'Search query entered' },
  { displayName: 'Result Type',    parameterName: 'result_type',    description: 'Type of search result clicked' },
  { displayName: 'Bookmark Category', parameterName: 'bookmark_category', description: 'Category of bookmarked item' },
  { displayName: 'Context Type',   parameterName: 'context_type',   description: 'Context where product was clicked' },
  { displayName: 'Context Slug',   parameterName: 'context_slug',   description: 'Slug of context entity for product click' },
  { displayName: 'Auth Mode',      parameterName: 'auth_mode',      description: 'login or register' },
  { displayName: 'Houses Count',   parameterName: 'houses_count',   description: 'Number of houses selected in onboarding' },
];

// ── Conversion events ─────────────────────────────────────────────────────────

const CONVERSIONS = [
  'login',
  'bookmark_save',
  'onboarding_complete',
];

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🔑 Getting access token…');
  const token = await getToken();
  console.log('✅ Authenticated\n');

  // List existing custom dimensions to avoid duplicates
  const existing = await ga4list(token, '/customDimensions');
  const existingSlugs = new Set(
    (existing.customDimensions ?? []).map((d) => d.parameterName),
  );

  console.log('📐 Registering custom dimensions…');
  for (const dim of DIMENSIONS) {
    if (existingSlugs.has(dim.parameterName)) {
      console.log(`  ⏭  ${dim.parameterName} (already exists)`);
      continue;
    }
    const result = await ga4post(token, '/customDimensions', {
      parameterName: dim.parameterName,
      displayName: dim.displayName,
      description: dim.description,
      scope: 'EVENT',
    });
    if (result.alreadyExists) {
      console.log(`  ⏭  ${dim.parameterName} (already exists)`);
    } else {
      console.log(`  ✅ Created: ${dim.parameterName}`);
    }
  }

  console.log('\n🎯 Registering conversion events…');
  const existingConv = await ga4list(token, '/conversionEvents');
  const existingConvNames = new Set(
    (existingConv.conversionEvents ?? []).map((c) => c.eventName),
  );

  for (const eventName of CONVERSIONS) {
    if (existingConvNames.has(eventName)) {
      console.log(`  ⏭  ${eventName} (already a conversion)`);
      continue;
    }
    const result = await ga4post(token, '/conversionEvents', { eventName });
    if (result.alreadyExists) {
      console.log(`  ⏭  ${eventName} (already exists)`);
    } else {
      console.log(`  ✅ Conversion: ${eventName}`);
    }
  }

  console.log('\n🎉 GA4 setup complete!');
  console.log('ℹ️  Custom dimensions take ~24h to appear in reports.');
}

main().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
