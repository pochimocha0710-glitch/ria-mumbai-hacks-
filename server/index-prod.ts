import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { type Server } from "node:http";

import express, { type Express } from "express";
import runApp from "./app";

export async function serveStatic(app: Express, _server: Server) {
  // Build outputs to dist/public from project root
  // Use fileURLToPath to get the directory of the current file
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  
  // Resolve from the dist/index.js location (where this file will be after build)
  // dist/index.js -> dist/public
  const distPath = path.resolve(__dirname, "public");

  // Fallback: resolve from process.cwd() (project root) in case path resolution fails
  const distPathAlt = path.resolve(process.cwd(), "dist", "public");

  const finalPath = fs.existsSync(distPath) ? distPath : distPathAlt;

  if (!fs.existsSync(finalPath)) {
    console.error(`Build directory not found. Tried:`);
    console.error(`  - ${distPath}`);
    console.error(`  - ${distPathAlt}`);
    console.error(`Current working directory: ${process.cwd()}`);
    console.error(`__dirname: ${__dirname}`);
    throw new Error(
      `Could not find the build directory. Make sure to run 'npm run build' first.`,
    );
  }

  // Verify index.html exists
  const indexPath = path.resolve(finalPath, "index.html");
  if (!fs.existsSync(indexPath)) {
    console.error(`index.html not found at: ${indexPath}`);
    throw new Error(`index.html not found in build directory: ${finalPath}`);
  }

  console.log(`✓ Serving static files from: ${finalPath}`);
  console.log(`✓ index.html found at: ${indexPath}`);

  // Serve static files from the dist/public directory
  // This middleware serves all static assets (JS, CSS, images, etc.)
  app.use(express.static(finalPath, {
    index: false, // We'll handle index.html manually
    maxAge: '1y', // Cache static assets
    etag: true
  }));

  // Serve index.html for the root and all non-API routes (SPA routing)
  // This must be LAST so it doesn't interfere with API routes or static assets
  app.get("*", (req, res) => {
    // Don't serve HTML for API routes
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'API route not found' });
    }
    
    // Don't serve HTML for static assets (should have been caught by express.static)
    if (req.path.startsWith('/assets/') || 
        req.path.match(/\.(js|css|png|jpg|gif|svg|ico|json|woff|woff2|ttf|eot)$/i)) {
      return res.status(404).send('File not found');
    }
    
    const indexPath = path.resolve(finalPath, "index.html");
    if (!fs.existsSync(indexPath)) {
      console.error(`index.html not found at: ${indexPath}`);
      return res.status(500).send(`
        <h1>Build Error</h1>
        <p>index.html not found at: ${indexPath}</p>
        <p>Make sure to run 'npm run build' first.</p>
      `);
    }
    
    // Set proper Content-Type and send the HTML file
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error('Error sending index.html:', err);
        res.status(500).send('Error loading page');
      }
    });
  });
}

(async () => {
  await runApp(serveStatic);
})();
