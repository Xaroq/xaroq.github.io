# Xaroq Website

The Xaroq website is a lightweight, static site that highlights the Xaroq browser and organization mission. It serves a simple landing page, an About page, and a small set of shared assets (styles, scripts, images).

## Highlights

- **Landing page** for the Xaroq Browser, including the macOS download call-to-action.
- **About page** describing the open-source mission and focus on tooling.
- **Theme toggle** support for light/dark mode.
- **Minimal static stack** (HTML, CSS, and JavaScript) for fast loading.

## Project Structure

- `index.html` — main landing page.
- `about/index.html` — About page content.
- `static/` — shared assets.
  - `static/css/style.css` — site styling.
  - `static/js/main.js` — theme toggle and interaction logic.
  - `static/` images (logo, favicon, etc.).

## Getting Started

Because this is a static site, you can open the pages directly in a browser or run a tiny local server for correct asset paths.

### Option 1: Open directly

Open `index.html` in your browser.

### Option 2: Run a local server

Use any static file server. For example, with Python:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Deploying

Deploy the repository with any static hosting provider (GitHub Pages, Netlify, Vercel, Cloudflare Pages, etc.). No build step is required.

## License

See [LICENSE](LICENSE).
