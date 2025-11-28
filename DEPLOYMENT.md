# Deployment Guide

## Production Build

Make sure to build before deploying:

```bash
npm run build
```

This creates:
- `dist/public/` - Client-side React app (HTML, JS, CSS)
- `dist/index.js` - Server-side Express app

## Running Production Server

```bash
npm start
```

The server will:
1. Serve static files from `dist/public/`
2. Serve API routes from `/api/*`
3. Serve `index.html` for all other routes (SPA routing)

## Troubleshooting "Showing Code Instead of UI"

If you see JavaScript code instead of the UI:

1. **Check if build completed successfully:**
   ```bash
   ls dist/public/index.html
   ```
   This file should exist.

2. **Verify the server is running:**
   ```bash
   npm start
   ```
   Check console for: `✓ Serving static files from: ...`

3. **Check browser console:**
   - Open DevTools (F12)
   - Check Network tab
   - Verify `index.html` is being served with `Content-Type: text/html`

4. **Clear browser cache:**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

5. **Verify file paths:**
   The server looks for files in:
   - `dist/public/` (relative to dist/index.js)
   - OR `dist/public/` (relative to project root)

## Deployment Platforms

### Vercel
- Uses `vercel.json` configuration
- Build command: `npm run build`
- Output directory: `dist/public`
- Serverless function: `dist/index.js`

### Netlify
- Build command: `npm run build`
- Publish directory: `dist/public`
- Functions: `dist/index.js` (if using Netlify Functions)

### Railway/Render
- Build command: `npm run build`
- Start command: `npm start`
- Port: Set `PORT` environment variable

## Common Issues

**Issue: Seeing JavaScript code instead of UI**
- **Cause**: Wrong file being served or Content-Type header missing
- **Fix**: Ensure `dist/public/index.html` exists and is being served with correct Content-Type

**Issue: 404 errors for assets**
- **Cause**: Static files not being served correctly
- **Fix**: Check that `express.static` middleware is configured correctly

**Issue: API routes not working**
- **Cause**: Routes registered after static middleware
- **Fix**: API routes are registered first in `server/app.ts`, this should be correct

