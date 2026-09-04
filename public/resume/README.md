# Resume PDF

Primary path: set `FIGMA_ACCESS_TOKEN` so `/resume.pdf` exports the Figma frame via the Images API (cached ~24h). On each successful export the server also writes:

- `Christie-Yu-Resume.pdf` — last saved bytes  
- `last-saved.json` — `{ updatedLabel, savedAt }` for the meta label  

When the token expires (~90 days) or Figma fails, `/resume.pdf` serves that last-saved PDF instead.

**Production tip:** commit the last-saved files after a successful local/CI export so Vercel still has a fallback (serverless disks are often read-only at runtime).

You can also drop a PDF here manually as `Christie-Yu-Resume.pdf` for offline/dev without a token.
