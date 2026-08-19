# The Owenverse Website

Static website for The Owenverse podcast. The site uses `data/episodes.json` for episode content and currently renders with Tailwind's CDN during local development. A local Tailwind build is prepared in `package.json` and `css/input.css`.

## Local preview

Because the site fetches `data/episodes.json`, serve the folder over HTTP:

```powershell
python -m http.server 5500
```

Open <http://localhost:5500/index.html>.

## Before adding any paid or metered API

Never hardcode an API key into client-side JavaScript, HTML, CSS, JSON, or any other file shipped to the browser. If a future feature needs the YouTube Data API, Google Maps, or another billed service, the key must live server-side in a serverless function, edge function, or protected CI secret. Any such function should have rate limiting, origin checks, quota limits, and monitoring before going live.

The episode updater in `scripts/update_episodes.py` is designed to run in GitHub Actions with `YOUTUBE_API_KEY` stored as a GitHub repository secret. It must never be called from browser JavaScript.

## Deployment

Cloudflare Pages or Netlify can apply the `_headers` file. GitHub Pages does not apply custom response headers; use Cloudflare in front of GitHub Pages or deploy to a host that supports `_headers`. Update `robots.txt` and `sitemap.xml` with the real domain before publishing.

## Local Tailwind build

Node.js/npm must be installed first. Then run:

```powershell
npm install
npm run build
```

After the generated `css/tailwind.css` exists, change each page to load `css/tailwind.css` instead of the temporary CDN configuration, then remove the CDN allowance and `unsafe-eval` from `_headers`.

## Manual launch checklist

- Create and connect the hosting project and custom Namecheap domain.
- Enforce HTTPS in the hosting dashboard.
- Add the `YOUTUBE_API_KEY` GitHub Actions secret.
- Replace the placeholder domain in `robots.txt` and `sitemap.xml`.
- Have an attorney review `privacy.html` and `terms.html` before publishing.
- Obtain a signed guest release before recording or publishing guest content.
- Enable Google Forms spam protection and response limits.
- Enable 2FA on GitHub, hosting, Google/YouTube, Namecheap, and social accounts.
- Run an accessibility check before launch.
