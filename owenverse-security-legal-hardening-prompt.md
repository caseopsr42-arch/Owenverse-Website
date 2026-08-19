# The Owenverse — Security & Compliance Hardening Addendum

Paste this into the same Copilot/Claude agent session after the initial build prompt, or include it alongside the original prompt for a first build. This covers the parts of "covering our bases" that are actually buildable in code. A separate manual checklist (not code) follows at the bottom — the agent can't do those for you.

---

## 1. Security Headers

Static hosting still supports response headers depending on the platform:

- **If deploying to Netlify**: create a `_headers` file at the project root setting `Content-Security-Policy`, `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and `Permissions-Policy` (disable camera/mic/geolocation since the site needs none of them)
- **If deploying to Vercel**: set the equivalent headers in `vercel.json`
- **If deploying to GitHub Pages**: note that GitHub Pages does not support custom response headers natively — if headers matter, put Cloudflare (free tier) in front of the Pages site, or switch to Netlify/Vercel. Flag this tradeoff clearly rather than silently skipping headers.
- CSP should allowlist only what's needed: self, `youtube-nocookie.com` / `youtube.com` for embeds, `docs.google.com` / `forms.gle` for the guest form link, and the Tailwind source (see below)

## 2. Dependency & CDN Hardening

- Do not load Tailwind from the CDN in the final production build — use the Tailwind CLI to compile a local `styles.css` at build time instead. This removes a third-party runtime dependency and produces a smaller, purged stylesheet.
- If any CDN-hosted script is kept for any reason, add a Subresource Integrity (`integrity="sha384-..."`) hash and `crossorigin="anonymous"` attribute to the script tag so the browser refuses to run it if the CDN content is tampered with.

## 3. Iframe & Embed Safety

- Use `youtube-nocookie.com` embed URLs instead of standard `youtube.com` embeds — reduces third-party tracking/cookie footprint before the visitor consents to anything
- Add `X-Frame-Options` / CSP `frame-ancestors 'self'` (from step 1) so the Owenverse site itself cannot be embedded in someone else's malicious iframe (clickjacking protection)

## 4. Secrets & Future-Proofing

- Add a `.gitignore` covering `.env`, `.env.local`, and any credentials file, even though nothing is secret yet
- Add a `.env.example` with placeholder variable names, and a clear `README.md` section titled **"Before adding any paid or metered API"** stating: never hardcode an API key into client-side JavaScript; if a future feature needs the YouTube Data API, Google Maps, or any billed service, the key must live server-side (a serverless function or edge function with environment variables), never in a file shipped to the browser, and any such function should have rate limiting and origin checks before going live
- This is the actual fix for the "$2M API bill" scenario — the rule is: no secret key ever ships to the browser, full stop

## 5. Cookie & Privacy Disclosure

- Add a lightweight, dismissible cookie notice (plain JS, stores the dismissal in localStorage) disclosing that embedded video and the guest application form may set third-party cookies
- Scaffold a `/privacy` page with clearly labeled placeholder sections: what data is collected (none directly — only via embedded YouTube/Google Forms), how it's used, and a note that this is a template requiring legal review before publishing — mark it explicitly `<!-- TODO: have an attorney review before this goes live -->`
- Scaffold a `/terms` page the same way (content ownership, no warranty, guest content licensing note)

## 6. Accessibility Tooling

- Add `axe-core` or a Lighthouse CI script as a dev-only tool to catch contrast, alt-text, and keyboard-nav issues automatically before each deploy — this is the most concrete legal-risk mitigation available and should not be skipped
- Leave a placeholder/TODO for captions or transcripts on each embedded episode

## 7. Basic Hygiene Files

- Add `robots.txt` and `sitemap.xml`
- Enforce HTTPS in hosting platform settings (default on Netlify/Vercel; must be manually checked "Enforce HTTPS" on GitHub Pages)

## 8. Deliverable Checklist

- [ ] Security headers configured for the chosen host (or the GitHub Pages limitation explicitly flagged)
- [ ] Tailwind compiled locally, not loaded from CDN in production
- [ ] YouTube embeds use the nocookie domain
- [ ] `.gitignore` + `.env.example` + README warning about client-side secrets in place
- [ ] Cookie notice implemented
- [ ] `/privacy` and `/terms` pages scaffolded with attorney-review TODOs
- [ ] Accessibility testing tool wired into the build
- [ ] HTTPS enforced

---

## Not Code — Handle These Manually

- Enable 2FA on: the hosting account, the domain registrar, YouTube/Google, Instagram, TikTok, and X. This is the single highest-leverage action against actually "getting screwed over" — account takeover, not server exploits, is the realistic threat for a small creator.
- Set up a signed guest release/consent form (e-signature tool like DocuSign or even a simple PDF) before recording — separate from the website, but the most important legal document Owen doesn't have yet
- Turn on Google Forms' built-in spam protection / response limiting for the guest application form
- Have an actual attorney review the privacy policy and terms pages before publishing — the scaffolded versions are structure, not legal advice
- Run a basic trademark search on "The Owenverse" if he plans to build the brand long-term
