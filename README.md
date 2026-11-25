# steminmusic.com

Static website for Stemin. Every page is a plain `index.html` (home at the root, others in `about/`, `live/`, `music/`, `visuals/`, `booking/`, `press/`, `contact/`, `policy/`). Styling: `style.css`; scripts: `main.js`; page-not-found: `404.html`.

- **Hosting:** Cloudflare Pages, connected to this repository. Every push goes live automatically.
- **Shows:** `.github/workflows/fetch-shows.yml` reads Stemin's upcoming shows from Bandsintown every 6 hours into `data/shows.json`; the site shows them on the homepage and Live page. Run it manually under Actions → "Update shows from Bandsintown".
- **Photos:** `img/` (each photo also has a `-800` phone version), press photos in `press/`, videos in `video/`.
- **Forms:** contact, booking and newsletter forms send to contact@steminmusic.com via Web3Forms.
- `_headers` sets caching and security headers; `_redirects` sends the old `/home` address to `/`.
