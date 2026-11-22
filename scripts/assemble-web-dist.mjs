#!/usr/bin/env node
/**
 * Assembles the unified production web bundle in `dist/` for Cloudflare Pages (eixoverde.com)
 * and GitHub Pages:
 *   - `dist/index.html` + `dist/site/*`  -> Official EixoVerde website & landing page (/)
 *   - `dist/app/*`                       -> Full EixoVerde Web PWA (/app/) built by Vite
 *   - `dist/privacidade.html`, `dist/exclusao-conta.html`, `dist/app-ads.txt`,
 *     `dist/robots.txt`, `dist/sitemap.xml`, `dist/_headers`, `dist/_redirects`, `dist/icons/*`
 *
 * Usage:
 *   node scripts/assemble-web-dist.mjs --clean   # Remove stale `dist/` before `vite build`
 *   node scripts/assemble-web-dist.mjs           # Assemble root website around `dist/app/`
 */

import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const DIST = join(ROOT, 'dist');
const DIST_APP = join(DIST, 'app');
const SITE = join(ROOT, 'site');
const PUBLIC = join(ROOT, 'public');

if (process.argv.includes('--clean')) {
  rmSync(DIST, { recursive: true, force: true });
  process.exit(0);
}

if (!existsSync(join(DIST_APP, 'index.html'))) {
  console.error('[assemble-web-dist] Missing dist/app/index.html — run `vite build` first.');
  process.exit(1);
}

// 1. Copy official landing page into dist root + dist/site/
cpSync(join(SITE, 'index.html'), join(DIST, 'index.html'));
mkdirSync(join(DIST, 'site'), { recursive: true });
cpSync(join(SITE, 'landing.css'), join(DIST, 'site', 'landing.css'));
cpSync(join(SITE, 'landing.js'), join(DIST, 'site', 'landing.js'));

// 2. Copy shared root icons for landing & legal pages
cpSync(join(PUBLIC, 'icons'), join(DIST, 'icons'), { recursive: true });

// 3. Copy root compliance, SEO & Cloudflare Pages config files to dist root
const ROOT_PUBLIC_FILES = [
  'privacidade.html',
  'exclusao-conta.html',
  'app-ads.txt',
  'robots.txt',
  'sitemap.xml',
  '_headers',
  '_redirects',
];

for (const file of ROOT_PUBLIC_FILES) {
  const src = join(PUBLIC, file);
  if (existsSync(src)) {
    cpSync(src, join(DIST, file));
  }
  // Remove root-only copies inside dist/app/ so the PWA directory stays focused
  const dupInApp = join(DIST_APP, file);
  if (existsSync(dupInApp)) {
    rmSync(dupInApp, { force: true });
  }
}

console.log('[assemble-web-dist] Assembled eixoverde.com root landing + /app/ PWA in dist/');
