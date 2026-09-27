# SEO audit — all domains

Generated 2026-09-27T00:29:36.808Z by `scripts/seo-audit.mjs` (weekly, GitHub Actions). ✅ done · ❌ not done · ⚠️ partly done · 📝 manual work for a person · — not applicable.

| Domain | Score | ✅ | ❌ | ⚠️ | 📝 | Repo |
|---|---|---|---|---|---|---|
| [xaa.es](https://xaa.es) | 65% | 35 | 16 | 11 | 11 | p2nshooter/xaa |

## xaa.es — 65%

**Not done yet (27):** HTTP redirects to HTTPS; One canonical host (www ↔ apex redirect); Canonical URL on the home page; Server response time; No render-blocking scripts in <head>; Lazy-loading below-the-fold images; WebP / AVIF images; Fonts optimised (preload / font-display: swap); Title tag (10–65 chars); Meta description (50–160 chars); og:title; og:description; og:image; og:url; og:type; Twitter / X card; HSTS header; X-Content-Type-Options: nosniff; Clickjacking protection (X-Frame-Options / frame-ancestors); Referrer-Policy; Permissions-Policy; Content-Security-Policy; llms.txt for AI assistants; Unique title on every page; Unique meta description on every page; Canonical on every sampled page; Breadcrumbs on inner pages


**1. Foundation**

| | Check | Detail |
|---|---|---|
| ✅ | HTTPS with a valid SSL certificate | 200 https://xaa.es/ |
| ❌ | HTTP redirects to HTTPS | 200 http://xaa.es/ → http://xaa.es/ |
| ❌ | One canonical host (www ↔ apex redirect) | www.xaa.es → https://www.xaa.es/ |
| ✅ | Google Search Console | Domain property verified |
| 📝 | Bing Webmaster Tools verification | No meta/BingSiteAuth.xml — import the site from Search Console in Bing Webmaster Tools (DNS verification also works) |
| ✅ | robots.txt present | 9 lines |
| ✅ | Clean, readable URLs |  |
| ✅ | Missing pages return a real 404 | HTTP 404 |

**2. Technical SEO**

| | Check | Detail |
|---|---|---|
| ✅ | No redirect chains (≤1 hop to the final URL) | 0 hop(s) from http://xaa.es/ |
| ❌ | Canonical URL on the home page | missing |
| ✅ | Mobile-friendly viewport | width=device-width, initial-scale=1 |
| ✅ | GZIP / Brotli compression | br |
| ✅ | Served through a CDN | Cloudflare |
| ⚠️ | Server response time | 830 ms (from a GitHub runner) |
| ✅ | Browser/edge caching headers | private, no-cache, no-store, max-age=0, must-revalidate |
| ⚠️ | No render-blocking scripts in <head> | 1 blocking script(s) |
| ⚠️ | Fonts optimised (preload / font-display: swap) |  |
| ⚠️ | Canonical on every sampled page | 1 without |
| ✅ | Sitemap URLs load (no broken pages) | 0/8 failing |
| 📝 | Core Web Vitals (PageSpeed, mobile) | PageSpeed API 429 |

**3. On-page SEO**

| | Check | Detail |
|---|---|---|
| ❌ | Title tag (10–65 chars) | missing |
| ❌ | Meta description (50–160 chars) | missing |
| ✅ | Exactly one H1 | 1 H1 |
| ✅ | H2–H6 structure | 7 H2 |
| ❌ | Unique title on every page | 9 pages sampled; 1 duplicate, 2 missing |
| ⚠️ | Unique meta description on every page | 0 duplicate, 2 missing |
| ✅ | One H1 on every sampled page | 0 page(s) with 0 or several H1 |
| ⚠️ | Breadcrumbs on inner pages | 0/8 |

**4. Content SEO**

| | Check | Detail |
|---|---|---|
| 📝 | Original, useful content that answers search intent |  |
| 📝 | Old content updated; thin/duplicate content removed |  |

**5. Structured data**

| | Check | Detail |
|---|---|---|
| ✅ | JSON-LD structured data | Organization, ProfessionalService, WebSite, OfferCatalog, Offer, PriceSpecification |
| ✅ | Organization schema |  |
| ✅ | WebSite schema |  |

**6. Image SEO**

| | Check | Detail |
|---|---|---|
| ⚠️ | Lazy-loading below-the-fold images | 0/2 lazy |
| ⚠️ | WebP / AVIF images | no WebP/AVIF found on the home page |
| ✅ | Images carry width & height (no layout shift) | 3/3 |
| ✅ | Alt text on images | 0/3 missing alt |
| ✅ | Descriptive image file names |  |

**8. Multilingual SEO**

| | Check | Detail |
|---|---|---|
| ✅ | Language declared (<html lang>) | en |
| 📝 | hreflang for language versions | none — needed only if the site serves several languages |

**9. Internal linking**

| | Check | Detail |
|---|---|---|
| ✅ | Internal links from the home page | 36 unique |
| 📝 | Topic clusters: pillar pages + supporting articles |  |

**10. Off-page SEO**

| | Check | Detail |
|---|---|---|
| 📝 | Quality, relevant backlinks; no spam/PBN |  |
| 📝 | Digital PR, brand mentions, official social profiles |  |

**11. Local SEO**

| | Check | Detail |
|---|---|---|
| 📝 | Google Business Profile + consistent NAP (if a physical location) |  |

**13. E-E-A-T**

| | Check | Detail |
|---|---|---|
| ✅ | About page |  |
| ✅ | Contact page |  |
| ✅ | Privacy policy |  |
| ✅ | Terms & conditions |  |
| 📝 | Author profiles, publish/update dates, sources |  |

**14. Security**

| | Check | Detail |
|---|---|---|
| ❌ | HSTS header | missing |
| ❌ | X-Content-Type-Options: nosniff |  |
| ❌ | Clickjacking protection (X-Frame-Options / frame-ancestors) |  |
| ❌ | Referrer-Policy |  |
| ⚠️ | Permissions-Policy |  |
| ⚠️ | Content-Security-Policy | none (optional, but recommended) |
| ✅ | No mixed content |  |

**15. Crawl & indexing**

| | Check | Detail |
|---|---|---|
| ✅ | robots.txt lets crawlers reach the site |  |
| ✅ | Home page is indexable (no noindex) |  |

**16. Sitemap**

| | Check | Detail |
|---|---|---|
| ✅ | robots.txt declares the sitemap | https://xaa.es/sitemap.xml |
| ✅ | XML sitemap | HTTP 200 https://xaa.es/sitemap.xml — 207 URLs |
| ✅ | Sitemap lists only canonical-host URLs |  |

**17. Social / sharing**

| | Check | Detail |
|---|---|---|
| ❌ | og:title | missing |
| ❌ | og:description | missing |
| ❌ | og:image | missing |
| ❌ | og:url | missing |
| ❌ | og:type | missing |
| ❌ | Twitter / X card | missing |

**18. AI / generative search**

| | Check | Detail |
|---|---|---|
| ✅ | AI / generative-search crawlers allowed |  |
| ⚠️ | llms.txt for AI assistants | HTTP 404 |

**19. Analytics & monitoring**

| | Check | Detail |
|---|---|---|
| ✅ | Analytics installed | other analytics |
| 📝 | Monitor clicks, CTR, position, indexed pages in Search Console |  |

**20. Periodic audit**

| | Check | Detail |
|---|---|---|
| ✅ | Periodic automated SEO audit | this weekly audit |
