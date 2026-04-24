# S. Walker — Site

Single-command build. Edit text in `content.json`, run `node build.js`, open `dist/index.html`.

## Setup (once)

```bash
# No npm install needed — pure Node.js, no dependencies
mkdir audio
# Drop unverified.mp3 into the audio/ folder
cp /path/to/unverified.mp3 audio/
```

## Build

```bash
node build.js
# → dist/index.html
```

Open `dist/index.html` in any browser. Or drag it onto Netlify Drop.

---

## What to edit

### Text & copy → `content.json`

Every piece of visible text lives here. Key sections:

| Section | What to change |
|---|---|
| `hero` | Name, tagline, eyebrow label |
| `about.paragraphs` | The 4 bio paragraphs |
| `offers[]` | Title, body, bullet facts for each offering |
| `offers[].body` | **← fix readability here** — bump font weight in CSS if needed |
| `talks[]` | Talk titles and descriptions |
| `testimonials[]` | Quotes and attribution |
| `contact.items` | Email, rep, fee |

### Photos → `content.json` under `"photos"`

Paste any image URL (Unsplash, your own hosted image, etc.):
```json
"photos": {
  "hero":  "https://...",
  "about": "https://...",
  "break": "https://..."
}
```

For depth-of-field PNW shots, search Unsplash for:
- `forest bokeh shallow depth of field`
- `pacific northwest fern macro`
- `old growth forest misty`

### Colors → `content.json` under `"colors"`

```json
"colors": {
  "accent":      "#8faa70",   ← green used for tags, player, links
  "accent_dark": "#3a5228",   ← button backgrounds
  "bg_primary":  "#0c0b09",   ← main background
  "text_primary":"#f2ede4"    ← main text
}
```

### Font sizes / weights → `build.js`

Search for the CSS class and edit the value. Common tweaks:

```
.offer-body   → font-size / font-weight  (work section body text)
.talk-desc    → same for talks
.about-text p → about section paragraphs
.tq           → testimonial quote size
```

---

## Quick fixes

**"Work section text is hard to read"**
In `build.js`, find `.offer-body` and change:
```css
color:rgba(242,237,228,.45)  →  color:rgba(242,237,228,.75)
```
Then `node build.js`.

**"Photo isn't right"**
Change the URL in `content.json` under `photos.hero`, run `node build.js`.

**"Need a new testimonial"**
Add to `testimonials[]` array in `content.json`, run `node build.js`.

---

## Deploy

**Netlify Drop** (30 seconds, no account needed):
1. `node build.js`
2. Go to [drop.netlify.com](https://drop.netlify.com)
3. Drag `dist/index.html` onto the page
4. Share the URL

