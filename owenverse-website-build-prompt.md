# The Owenverse — Website Build Prompt

Paste this whole document into the Copilot agent chat in VS Code as your starting instruction.

---

## 1. Show Context

**The Owenverse** is a podcast hosted by Owen Jefferies. Motto: **"Real Stories. Real Turning Points."**

Format: guests with specific, notable stories or experiences come on to talk about interesting and impactful subjects for viewers. The show is about real people at real turning points — not generic interview filler.

## 2. Website Goals

- Showcase the most recent episodes/videos front and center — this is the top priority
- Drive traffic to Owen's social media accounts (primary "contact" pathway)
- Provide a single, low-friction path for potential guests to apply via a Google Form
- Keep contact info minimal — no email/phone listed, just the guest form and social links

## 3. Recommended Tech Stack

- HTML5, CSS3, vanilla JavaScript
- Tailwind CSS via CDN for styling
- Episode data structured in a separate `data/episodes.json` file (title, date, thumbnail, description, video URL) so new episodes can be added without touching layout/HTML — have the agent write a small JS function that reads this file and renders the episode grid
- Fully static, deployable to GitHub Pages, Netlify, or Vercel

## 4. Site Structure

- **Home** — hero with show name + motto, embedded/featured latest episode, "Watch More Episodes" CTA, prominent social icon row, "Apply to Be a Guest" CTA
- **Episodes** — grid of recent episodes (thumbnail, title, short description, link/embed), newest first, pulled from `episodes.json`
- **About** — short bio on Owen Jefferies, the show's premise (real stories, real turning points), what kind of guests/topics the show features
- **Be a Guest** — brief framing on what makes a good guest/story fit, then a clear, prominent button linking out to the Google Form (leave the URL as a placeholder/TODO)
- **Follow** — dedicated section (can live on the homepage and/or its own page) with large, clear links to all of Owen's social platforms (YouTube, Instagram, TikTok, Spotify, Apple Podcasts, X, etc. — use placeholder links marked TODO)

## 5. Design Direction

- Palette: **black/charcoal base, grey for secondary surfaces and text, vibrant orange as the accent** — think dark mode with a bold, energetic accent, fitting a media/podcast brand rather than a corporate one
- Typography: bold, confident display font for headlines (e.g., a strong grotesk/sans), clean readable body font
- Feel: modern media brand — think YouTube-creator-meets-documentary, not corporate consulting. Bold imagery, big episode thumbnails, high contrast
- Motto ("Real Stories. Real Turning Points.") should appear prominently in the hero, styled as a statement piece — not buried in body text
- Icons for social platforms should be large and easy to tap on mobile, not tiny footer afterthoughts

## 6. Key Functional Requirements

- Featured/latest episode embed on the homepage (YouTube iframe embed, placeholder video ID marked TODO)
- Episode grid that renders dynamically from `episodes.json` — include 4-6 placeholder entries so the layout can be previewed
- Guest application button styled as a clear, high-contrast CTA (orange, hard to miss) — appears on Home and has its own dedicated page/section
- Social icon row/band that's visually prominent, not an afterthought — consider a full-width "Follow the Owenverse" section with icon buttons
- No contact form, email, or phone number anywhere on the site — guest inquiries go through the Google Form only

## 7. Responsive & Accessibility Requirements

- Mobile-first responsive design; test breakpoints at ~375px, 768px, 1024px, 1440px
- Semantic HTML (nav, main, section, footer)
- Sufficient color contrast against the dark background (orange accent must meet contrast requirements for text/buttons, not just decorative elements)
- Alt text on all images/thumbnails, keyboard-navigable nav and CTAs
- Video embeds should be responsive (16:9 container that scales) and not break layout on mobile

## 8. Content Guidelines

- Use realistic placeholder episode titles/descriptions that fit the "real stories, real turning points" theme — mark clearly with `<!-- TODO: replace with real episode data -->`
- Do not invent specific guest names, quotes, or claims about real people
- Keep copy short and punchy throughout — this is a media brand, not a consulting firm; avoid corporate-sounding language
- Placeholder Google Form and social links should be obvious TODOs (e.g., `href="#TODO-google-form-url"`)

## 9. Project Structure

```
/
├── index.html
├── episodes.html
├── about.html
├── guest.html
├── css/
│   └── styles.css
├── js/
│   └── main.js
├── data/
│   └── episodes.json
└── assets/
    └── (thumbnails/icons)
```

## 10. Deliverable Checklist

- [ ] Home, Episodes, About, and Guest pages built and linked via shared nav/footer
- [ ] Episode grid renders dynamically from `episodes.json` with placeholder entries
- [ ] Featured latest episode embed on homepage
- [ ] Prominent, high-contrast "Apply to Be a Guest" CTA linking to a placeholder Google Form URL
- [ ] Large, visually prominent social media icon links (no other contact info anywhere)
- [ ] Black/grey/orange dark theme applied consistently, with motto featured in the hero
- [ ] Fully responsive across mobile/tablet/desktop
- [ ] Basic SEO meta tags (title, description, Open Graph image) on each page
