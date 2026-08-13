import { existsSync, readFileSync } from 'node:fs';

const redirectsPath = 'public/_redirects';
const headersPath = 'public/_headers';
const notFoundPath = 'public/404.html';

const redirects = readFileSync(redirectsPath, 'utf8')
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith('#'));

const headers = readFileSync(headersPath, 'utf8');

const failures = [];

if (redirects.includes('/* /index.html 200')) {
  failures.push('Do not rewrite every path to index.html; missing assets must not return HTML.');
}

if (redirects.some((line) => /^\/assets\/\*\s+/.test(line))) {
  failures.push('Do not add /assets/* redirects; Cloudflare Pages should serve assets or real 404s.');
}

if (!existsSync(notFoundPath)) {
  failures.push('public/404.html must exist to disable Cloudflare Pages default SPA fallback for missing assets.');
}

const requiredRewrites = [
  '/request /request/ 301',
  '/thanks / 200',
  '/partners / 200',
  '/partners/* / 200',
  '/as / 200',
  '/as/* / 200',
  '/admin/as / 200',
  '/admin/as/* / 200',
  '/admin/utm / 200',
  '/admin/dashboard / 200',
  '/review / 200',
  '/review/* / 200',
  '/admin/reviews / 200',
  '/admin/reviews/* / 200',
];

if (redirects.some((line) => /^\/request\/\*\s+\/index\.html\s+200$/.test(line))) {
  failures.push('Do not rewrite /request/* to the React app; the request funnel is a static sub-app.');
}

if (redirects.includes('/request /request/index.html 200')) {
  failures.push('Redirect /request to /request/ so relative funnel assets resolve below /request/.');
}

const requestAssetUrl = new URL('app.css', 'https://homewindow.kr/request/');
if (requestAssetUrl.pathname !== '/request/app.css') {
  failures.push('The request entry URL must resolve relative assets below /request/.');
}

for (const rewrite of requiredRewrites) {
  if (!redirects.includes(rewrite)) {
    failures.push(`Missing route rewrite: ${rewrite}`);
  }
}

if (/\/assets\/\*\s+Cache-Control:\s*.*(?:immutable|max-age=31536000)/is.test(headers)) {
  failures.push('Do not send immutable one-year Cache-Control from _headers for /assets/*; it can freeze bad fallback responses.');
}

if (failures.length > 0) {
  console.error('Cloudflare Pages routing config is unsafe:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('Cloudflare Pages routing config is safe.');
