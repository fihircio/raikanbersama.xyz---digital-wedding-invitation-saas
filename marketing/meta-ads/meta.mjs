#!/usr/bin/env node
/**
 * meta.mjs - a small Meta Marketing API CLI.
 *
 * Meta does not ship an official "Facebook CLI". Talking to Ads Manager from a
 * terminal just means calling the Graph API with a token, so this wraps the few
 * endpoints you actually need during a launch.
 *
 * Auth: set META_ACCESS_TOKEN, or drop it in marketing/meta-ads/.env.local
 *
 *   node meta.mjs doctor            validate the token and print granted scopes
 *   node meta.mjs assets            business -> ad accounts, pages, IG accounts
 *   node meta.mjs accounts          ad accounts with status and currency
 *   node meta.mjs pages             pages visible to the token
 *   node meta.mjs campaigns <act>   campaigns on an ad account
 *
 * Read-only by design: nothing here spends money or creates ads yet.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const API_VERSION = process.env.META_API_VERSION || 'v23.0';
const GRAPH = `https://graph.facebook.com/${API_VERSION}`;

const REQUIRED_SCOPES = ['ads_read', 'ads_management', 'business_management'];

const loadToken = () => {
  if (process.env.META_ACCESS_TOKEN) return process.env.META_ACCESS_TOKEN.trim();
  const envPath = path.join(HERE, '.env.local');
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
      const m = line.match(/^\s*META_ACCESS_TOKEN\s*=\s*(.+?)\s*$/);
      if (m) return m[1].replace(/^["']|["']$/g, '');
    }
  }
  return '';
};

const TOKEN = loadToken();

const redact = (s) => (TOKEN ? String(s).split(TOKEN).join('<token>') : String(s));

const api = async (p, params = {}) => {
  const url = new URL(`${GRAPH}${p}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  url.searchParams.set('access_token', TOKEN);
  const res = await fetch(url);
  const json = await res.json();
  if (json.error) {
    const e = json.error;
    throw new Error(`${e.type || 'Error'} ${e.code || ''}: ${e.message}${e.error_user_msg ? ` — ${e.error_user_msg}` : ''}`);
  }
  return json;
};

const line = (n = 60) => console.log('─'.repeat(n));

const doctor = async () => {
  line();
  console.log('TOKEN');
  line();
  if (!TOKEN) {
    console.log('✗ No token found.');
    console.log('  Set META_ACCESS_TOKEN or create marketing/meta-ads/.env.local');
    return false;
  }
  console.log(`  length ${TOKEN.length}, prefix ${TOKEN.slice(0, 8)}…`);

  let debug;
  try {
    debug = await api('/debug_token', { input_token: TOKEN });
  } catch (e) {
    console.log(`✗ debug_token failed: ${e.message}`);
    return false;
  }

  const d = debug.data || {};
  const scopes = d.scopes || [];
  console.log(`  valid: ${d.is_valid ? 'yes' : 'no'}`);
  console.log(`  type: ${d.type || 'unknown'}`);
  console.log(`  app: ${d.app_id}`);
  console.log(`  expires: ${d.expires_at === 0 ? 'never' : new Date(d.expires_at * 1000).toISOString()}`);
  console.log(`  scopes (${scopes.length}): ${scopes.join(', ') || 'none'}`);

  line();
  console.log('SCOPES FOR ADS MANAGEMENT');
  line();
  let missing = 0;
  for (const s of REQUIRED_SCOPES) {
    const ok = scopes.includes(s);
    if (!ok) missing += 1;
    console.log(`  ${ok ? '✓' : '✗'} ${s}`);
  }

  try {
    const me = await api('/me', { fields: 'id,name' });
    console.log(`\n  identity: ${me.name || '(no name)'} (${me.id})`);
    if (String(me.id) !== String(d.user_id ?? me.id)) {
      console.log(`  token user_id: ${d.user_id}`);
    }
  } catch (e) {
    console.log(`\n  /me failed: ${e.message}`);
  }

  if (missing) {
    console.log(`\n⚠ ${missing} scope(s) missing — campaigns cannot be managed until these are granted.`);
  } else {
    console.log('\n✓ Token has the scopes needed for campaign management.');
  }
  return missing === 0;
};

const assets = async () => {
  line();
  console.log('BUSINESS PORTFOLIOS');
  line();
  let businesses = [];
  try {
    const me = await api('/me', { fields: 'id' });
    const res = await api(`/${me.id}/businesses`, { fields: 'id,name', limit: '25' });
    businesses = res.data || [];
  } catch (e) {
    console.log(`  (cannot list businesses: ${e.message})`);
  }
  if (!businesses.length) {
    if (process.env.META_BUSINESS_ID) {
      businesses = [{ id: process.env.META_BUSINESS_ID, name: '(from META_BUSINESS_ID)' }];
    } else {
      console.log('  none found. Set META_BUSINESS_ID to query a known portfolio.');
    }
  }
  for (const b of businesses) {
    console.log(`  ${b.name} (${b.id})`);
    for (const [label, edge, fields] of [
      ['ad accounts', 'owned_ad_accounts', 'id,name,account_status,currency,timezone_name'],
      ['pages', 'owned_pages', 'id,name'],
      ['instagram', 'instagram_accounts', 'id,username'],
    ]) {
      try {
        const r = await api(`/${b.id}/${edge}`, { fields, limit: '50' });
        const rows = r.data || [];
        console.log(`\n  ${label}: ${rows.length}`);
        for (const row of rows) {
          if (edge === 'owned_ad_accounts') {
            const status = { 1: 'ACTIVE', 2: 'DISABLED', 3: 'UNSETTLED', 7: 'PENDING_RISK_REVIEW', 9: 'IN_GRACE_PERIOD', 100: 'PENDING_CLOSURE', 101: 'CLOSED' }[row.account_status] || row.account_status;
            console.log(`    act_${String(row.id).replace(/^act_/, '')}  ${row.name}  [${status}] ${row.currency || ''} ${row.timezone_name || ''}`);
          } else {
            console.log(`    ${row.id}  ${row.name || row.username || ''}`);
          }
        }
      } catch (e) {
        console.log(`  ${label}: (${e.message.split('—')[0].trim()})`);
      }
    }
  }
};

const accounts = async () => {
  const res = await api('/me/adaccounts', { fields: 'id,name,account_status,currency,timezone_name,amount_spent', limit: '50' });
  const rows = res.data || [];
  line();
  console.log(`AD ACCOUNTS (${rows.length})`);
  line();
  if (!rows.length) console.log('  none visible to this token');
  for (const r of rows) console.log(`  ${r.id}  ${r.name}  [${r.account_status}] ${r.currency || ''}`);
};

const pages = async () => {
  const res = await api('/me/accounts', { fields: 'id,name,category,tasks', limit: '50' });
  const rows = res.data || [];
  line();
  console.log(`PAGES (${rows.length})`);
  line();
  if (!rows.length) console.log('  none visible to this token');
  for (const r of rows) console.log(`  ${r.id}  ${r.name}  ${r.category || ''}`);
};

const campaigns = async (act) => {
  if (!act) throw new Error('usage: node meta.mjs campaigns act_<id>');
  const id = act.startsWith('act_') ? act : `act_${act}`;
  const res = await api(`/${id}/campaigns`, { fields: 'id,name,status,objective,daily_budget', limit: '50' });
  const rows = res.data || [];
  line();
  console.log(`CAMPAIGNS on ${id} (${rows.length})`);
  line();
  if (!rows.length) console.log('  none yet');
  for (const r of rows) console.log(`  ${r.id}  ${r.name}  [${r.status}] ${r.objective || ''}`);
};

const main = async () => {
  const [cmd, arg] = process.argv.slice(2);
  try {
    switch (cmd) {
      case 'doctor': {
        const ok = await doctor();
        process.exit(ok ? 0 : 1);
      }
      case 'assets': await assets(); break;
      case 'accounts': await accounts(); break;
      case 'pages': await pages(); break;
      case 'campaigns': await campaigns(arg); break;
      default:
        console.log('meta.mjs — Meta Marketing API helper\n');
        console.log('  node meta.mjs doctor            validate token + scopes');
        console.log('  node meta.mjs assets            business, ad accounts, pages, IG');
        console.log('  node meta.mjs accounts          ad accounts');
        console.log('  node meta.mjs pages             pages');
        console.log('  node meta.mjs campaigns act_id  campaigns on an ad account');
    }
  } catch (e) {
    console.error(`\n✗ ${redact(e.message)}`);
    process.exit(1);
  }
};

main();
