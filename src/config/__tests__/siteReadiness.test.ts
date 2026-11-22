import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { BRAND } from '../brand';

const REPO_ROOT = resolve(import.meta.dirname, '../../..');

function readRepoFile(relPath: string): string {
  return readFileSync(resolve(REPO_ROOT, relPath), 'utf-8');
}

describe('Phase 8 — eixoverde.com Domain, Website & Store Readiness', () => {
  it('exposes canonical eixoverde.com URLs and official contact email in BRAND', () => {
    expect(BRAND.websiteUrl).toBe('https://eixoverde.com');
    expect(BRAND.webAppUrl).toBe('https://eixoverde.com/app/');
    expect(BRAND.playStoreUrl).toBe(
      'https://play.google.com/store/apps/details?id=br.com.eixoverde.app'
    );
    expect(BRAND.privacyUrl).toBe('https://eixoverde.com/privacidade.html');
    expect(BRAND.accountDeletionUrl).toBe('https://eixoverde.com/exclusao-conta.html');
    expect(BRAND.contactEmail).toBe('contato@eixoverde.com');
  });

  it('publishes valid Google AdMob app-ads.txt with verified publisher ID', () => {
    const content = readRepoFile('public/app-ads.txt').trim();
    expect(content).toBe('google.com, pub-6690812959868851, DIRECT, f08c47fec0942fa0');
  });

  it('configures Cloudflare Pages _headers, _redirects, robots.txt, and sitemap.xml', () => {
    const headers = readRepoFile('public/_headers');
    expect(headers).toContain('/app-ads.txt');
    expect(headers).toContain('text/plain; charset=utf-8');
    expect(headers).toContain('X-Content-Type-Options: nosniff');

    const redirects = readRepoFile('public/_redirects');
    const redirectRules = redirects
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith('#'));

    expect(redirectRules).toContain('/app/privacidade.html /privacidade 301');
    expect(redirectRules).toContain('/app/exclusao-conta.html /exclusao-conta 301');
    expect(redirectRules).toContain('/politica-de-privacidade /privacidade 301');

    // Guard against Cloudflare Pages Pretty URLs infinite redirect loops (/foo -> /foo.html)
    // and unsupported absolute domain source rules
    for (const rule of redirectRules) {
      const [src, dst] = rule.split(/\s+/);
      expect(src.startsWith('/')).toBe(true);
      expect(dst).not.toBe(`${src}.html`);
      expect(src).not.toMatch(/^https?:\/\//i);
    }

    const robots = readRepoFile('public/robots.txt');
    expect(robots).toContain('Sitemap: https://eixoverde.com/sitemap.xml');

    const sitemap = readRepoFile('public/sitemap.xml');
    expect(sitemap).toContain('<loc>https://eixoverde.com/</loc>');
    expect(sitemap).toContain('<loc>https://eixoverde.com/app/</loc>');
    expect(sitemap).toContain('<loc>https://eixoverde.com/privacidade.html</loc>');
    expect(sitemap).toContain('<loc>https://eixoverde.com/exclusao-conta.html</loc>');
  });

  it('keeps public LGPD legal pages updated with contato@eixoverde.com and /app/ links', () => {
    const privacy = readRepoFile('public/privacidade.html');
    expect(privacy).toContain('mailto:contato@eixoverde.com');
    expect(privacy).toContain('https://eixoverde.com/privacidade.html');
    expect(privacy).toContain('href="./app/"');

    const deletion = readRepoFile('public/exclusao-conta.html');
    expect(deletion).toContain('contato@eixoverde.com');
    expect(deletion).toContain('https://eixoverde.com/exclusao-conta.html');
    expect(deletion).toContain('href="./app/"');
  });

  it('ships complete official landing page with Web/Play CTAs, VIP R$ 9,90, and zero forbidden third-party brand mentions', () => {
    const html = readRepoFile('site/index.html');
    const css = readRepoFile('site/landing.css');
    const js = readRepoFile('site/landing.js');

    expect(html).toContain('id="ev-cta-web"');
    expect(html).toContain('href="./app/"');
    expect(html).toContain('id="ev-cta-play"');
    expect(html).toContain('https://play.google.com/store/apps/details?id=br.com.eixoverde.app');
    expect(html).toContain('R$ 9,90');
    expect(html).toContain('./privacidade.html');
    expect(html).toContain('./exclusao-conta.html');
    expect(html).toContain('./app-ads.txt');
    expect(html).toContain('mailto:contato@eixoverde.com');

    // Enforce hard product guardrail: never mention third-party navigation brands
    const forbidden = /\b(waze|komoot|google\s+maps|strava|uber)\b/i;
    expect(forbidden.test(html)).toBe(false);
    expect(forbidden.test(css)).toBe(false);
    expect(forbidden.test(js)).toBe(false);
  });
});
