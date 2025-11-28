import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { type Server } from "node:http";

import express, { type Express } from "express";
import runApp from "./app";

export async function serveStatic(app: Express, _server: Server) {
  // Build outputs to dist/public from project root
  // Try multiple path resolution strategies to work in all environments
  
  // Strategy 1: Resolve from the bundled file location (dist/index.js)
  let distPath: string = "";
  let __dirname: string = "";
  try {
    const __filename = fileURLToPath(import.meta.url);
    __dirname = path.dirname(__filename);
    distPath = path.resolve(__dirname, "public");
  } catch (e) {
    distPath = "";
  }

  // Strategy 2: Resolve from process.cwd() (project root) - most reliable
  const distPathAlt = path.resolve(process.cwd(), "dist", "public");
  
  // Strategy 3: Resolve relative to current file (for development)
  const distPathAlt2 = __dirname 
    ? path.resolve(__dirname, "..", "dist", "public")
    : path.resolve(process.cwd(), "dist", "public");

  // Try each path in order
  let finalPath: string | null = null;
  for (const testPath of [distPath, distPathAlt, distPathAlt2]) {
    if (testPath && fs.existsSync(testPath)) {
      const indexPath = path.resolve(testPath, "index.html");
      if (fs.existsSync(indexPath)) {
        finalPath = testPath;
        break;
      }
    }
  }

  if (!finalPath) {
    console.error(`Build directory not found. Tried:`);
    console.error(`  - ${distPath}`);
    console.error(`  - ${distPathAlt}`);
    console.error(`  - ${distPathAlt2}`);
    console.error(`Current working directory: ${process.cwd()}`);
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
