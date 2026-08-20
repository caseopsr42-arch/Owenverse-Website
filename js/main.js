/* =========================================================
   The Owenverse — shared site behavior
   Handles: mobile nav, scroll effects, episode data rendering
   ========================================================= */

(function () {
  'use strict';

  /* ---------- Header scroll state + progress bar ---------- */
  const header = document.getElementById('site-header');
  const progressBar = document.getElementById('scroll-progress');

  function onScroll() {
    if (header) {
      header.classList.toggle('is-scrolled', window.scrollY > 12);
    }
    if (progressBar) {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
      progressBar.style.width = pct + '%';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav toggle ---------- */
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      mobileMenu.setAttribute('aria-hidden', String(!isOpen));
      if (isOpen) {
        mobileMenu.removeAttribute('inert');
      } else {
        mobileMenu.setAttribute('inert', '');
      }
    });
    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('is-open');
        menuToggle.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
        mobileMenu.setAttribute('inert', '');
      });
    });
  }

  /* ---------- Active nav link highlight ---------- */
  const currentPage = (location.pathname.split('/').pop() || 'index.html');
  document.querySelectorAll('.nav-link').forEach((link) => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('is-active');
    }
  });

  /* ---------- Scroll reveal ---------- */
  const revealTargets = document.querySelectorAll('[data-reveal]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    revealTargets.forEach((el) => el.classList.add('is-visible'));
  } else if ('IntersectionObserver' in window && revealTargets.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    revealTargets.forEach((el) => io.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Footer year ---------- */
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Third-party disclosure ---------- */
  const consentKey = 'owenverse-third-party-notice-dismissed';
  if (!localStorage.getItem(consentKey)) {
    const notice = document.createElement('aside');
    notice.className = 'privacy-notice';
    notice.innerHTML = `
      <p>This site uses embedded YouTube video and links to Google Forms. Those services may set their own cookies.</p>
      <div class="privacy-notice__actions">
        <a href="privacy.html">Privacy</a>
        <button type="button" aria-label="Dismiss privacy notice">Got it</button>
      </div>`;
    notice.querySelector('button').addEventListener('click', () => {
      localStorage.setItem(consentKey, 'true');
      notice.remove();
    });
    document.body.appendChild(notice);
  }

  /* =========================================================
     Episode data: fetch, parse, render
     ========================================================= */

  const PLAY_ICON = `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="#ff6a00"/>
      <path d="M10 8.5L16 12L10 15.5V8.5Z" fill="#0a0a0a"/>
    </svg>`;

  function getYouTubeId(url) {
    try {
      const parsed = new URL(url);
      if (parsed.hostname.includes('youtu.be')) {
        return parsed.pathname.replace('/', '');
      }
      return parsed.searchParams.get('v') || '';
    } catch (err) {
      return '';
    }
  }

  function episodeCardHTML(ep) {
    const videoId = getYouTubeId(ep.url);
    // Prefer YouTube's 16:9 artwork so older episodes are not cropped from 4:3 thumbnails.
    const thumbSrc = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : ep.thumbnail;
    return `
      <article class="episode-card" data-reveal>
        <a href="${ep.url}" target="_blank" rel="noopener noreferrer" class="episode-card__thumb" title="${escapeHTML(ep.title)}" aria-label="Watch: ${escapeHTML(ep.title)}">
          <img src="${thumbSrc}" onerror="this.onerror=null;this.src='${escapeHTML(ep.thumbnail)}';" alt="Thumbnail for ${escapeHTML(ep.title)}" loading="lazy" width="480" height="270">
          <span class="episode-card__play">${PLAY_ICON}</span>
        </a>
        <div class="p-5">
          <p class="text-xs uppercase tracking-widest text-orange-500 font-semibold mb-2" style="color: var(--orange);">${escapeHTML(ep.date)}</p>
          <h2 class="font-heading text-lg font-semibold text-white leading-snug mb-2">
            <a href="${ep.url}" target="_blank" rel="noopener noreferrer" title="${escapeHTML(ep.title)}" class="hover:underline">${escapeHTML(ep.title)}</a>
          </h2>
          <p class="text-sm" style="color: var(--grey);">${escapeHTML(ep.description)}</p>
        </div>
      </article>`;
  }

  function escapeHTML(str) {
    const div = document.createElement('div');
    const decoded = document.createElement('textarea');
    decoded.innerHTML = str == null ? '' : String(str);
    div.textContent = decoded.value;
    return div.innerHTML;
  }

  function decodeHTML(str) {
    const decoded = document.createElement('textarea');
    decoded.innerHTML = str == null ? '' : String(str);
    return decoded.value;
  }

  function renderEpisodeGrid(container, episodes) {
    if (!container) return;
    container.innerHTML = episodes.map(episodeCardHTML).join('');
    const newReveals = container.querySelectorAll('[data-reveal]');
    if (reduceMotion) {
      newReveals.forEach((el) => el.classList.add('is-visible'));
    } else if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
      );
      newReveals.forEach((el) => io.observe(el));
    } else {
      newReveals.forEach((el) => el.classList.add('is-visible'));
    }
  }

  function renderFeatured(episode) {
    const frame = document.getElementById('featured-video-frame');
    const titleEl = document.getElementById('featured-title');
    const descEl = document.getElementById('featured-description');
    const dateEl = document.getElementById('featured-date');
    const linkEl = document.getElementById('featured-link');
    if (!episode) return;

    const videoId = getYouTubeId(episode.url);
    if (frame && videoId) {
      frame.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${videoId}?cc_load_policy=1" title="${escapeHTML(episode.title)}" aria-describedby="featured-description" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    }
    if (titleEl) titleEl.textContent = episode.title;
    if (descEl) descEl.textContent = episode.description;
    if (dateEl) dateEl.textContent = episode.date;
    if (linkEl) linkEl.href = episode.url;
  }

  async function loadEpisodes() {
    try {
      const res = await fetch('data/episodes.json');
      if (!res.ok) throw new Error('Failed to load episode data');
      const data = await res.json();
      return Array.isArray(data.episodes)
        ? data.episodes.map((episode) => ({
          ...episode,
          title: decodeHTML(episode.title),
          description: decodeHTML(episode.description),
          date: decodeHTML(episode.date)
        }))
        : [];
    } catch (err) {
      console.error('Episode data could not be loaded:', err);
      return [];
    }
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const gridEl = document.getElementById('episode-grid');
    const previewEl = document.getElementById('episode-preview-grid');
    const needsFeatured = document.getElementById('featured-video-frame');

    if (!gridEl && !previewEl && !needsFeatured) return;

    const episodes = await loadEpisodes();
    if (!episodes.length) {
      const emptyState = '<p style="color: var(--grey);">Episodes are loading soon — check back shortly.</p>';
      if (gridEl) gridEl.innerHTML = emptyState;
      if (previewEl) previewEl.innerHTML = emptyState;
      return;
    }

    if (needsFeatured) renderFeatured(episodes[0]);
    if (previewEl) renderEpisodeGrid(previewEl, episodes.slice(1, 4));
    if (gridEl) renderEpisodeGrid(gridEl, episodes);
  });
})();
