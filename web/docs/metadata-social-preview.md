# Matrigluco Metadata & Social Preview Architecture

## 1. Overview
Matrigluco uses Vite build-time variable substitution (`%VITE_SITE_URL%`) in `index.html` to generate absolute canonical URLs and Open Graph metadata for social preview parsers (WhatsApp, Telegram, LinkedIn, Twitter/X, Discord, Slack, etc.).

## 2. Key Assets
- **Canonical SVG Mark**: `web/public/brand/matrigluco-mark.svg`
- **Social Preview Canvas**: `web/public/brand/og-cover.png` (1200 × 630 px)
- **React Component**: `web/src/shared/brand/AppLogo.tsx`

## 3. Logo-Only OG Cover Rule
The social preview image `public/brand/og-cover.png` contains **only the Matrigluco logo mark** in Care Pink (`#F06F9D`) centered on a solid charcoal/neutral-black background (`#0D0B0C`).
It strictly excludes:
- Headlines, slogans, or taglines
- Wordmarks or typography
- Screenshots or UI mockups
- Background grids, dots, or decorative waves

## 4. How to Regenerate `og-cover.png`
When the canonical SVG geometry in `public/brand/matrigluco-mark.svg` is modified:
```bash
python scripts/generate_og_cover.py
```
This guarantees zero vector drift between the SVG brand mark and the rasterized social preview canvas.

## 5. Environment Variables
- `VITE_SITE_URL`: Production HTTPS root URL (e.g. `https://matrigluco.vercel.app`).
- `VITE_API_BASE_URL`: Backend API endpoint (e.g. `https://api.matrigluco.vercel.app/api/v1`).
