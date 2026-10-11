// Sitemap generator for Concord Landscaping.
// Run: ts-node --project tsconfig.scripts.json scripts/generate-sitemap.cts
// Outputs: public/sitemap.xml
// Extend the PAGES array as new pages are added to the site.

"use strict";

const path = require("path");
const fs = require("fs");

const siteUrl = "https://concordlandscaping.com";

// Only include URLs that exist at deploy time. Extend as pages are added.
const PAGES = ["/"];

const escapeXml = (str: string): string =>
  str.replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[m as "&" | "<" | ">" | '"' | "'"]);

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${PAGES
  .map(
    (url) => `  <url>
    <loc>${escapeXml(siteUrl + url)}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

const outDir = path.join(__dirname, "..", "public");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "sitemap.xml"), sitemap, "utf-8");
console.log(`[gen] sitemap: written ${PAGES.length} URLs to public/sitemap.xml`);
process.exit(0);
